import type {
  CreateResourceSectionRequest,
  PublishedResourceSectionDto,
  PublishedResourceSectionListDto,
  PublishedResourceSectionSummaryDto,
  ReorderResourceSectionsRequest,
  ResourceSectionAdminDto,
  ResourceSectionIdParams,
  ResourceSectionSlugParams,
  ResourceSectionSummaryDto,
  UpdateResourceSectionRequest,
} from "@repo/resource-contracts";
import { createResourceSectionSchema } from "@repo/resource-contracts";
import type { Request, Response } from "express";
import { createHash } from "node:crypto";
import {
  db,
  resourcePublications,
  resourceSections,
  type NewResourceSection,
} from "@repo/db";
import { and, asc, eq, max, ne } from "drizzle-orm";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { ApiError } from "../../utils/api-error";
import { responseCreated, responseOk } from "../../utils/api-response";
import logger from "../../utils/logger.util";

interface ResourceSectionRow {
  id: string;
  title: string;
  slug: string;
  markdown: string;
  position: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedTitle: string | null;
  publishedSlug: string | null;
  publishedMarkdown: string | null;
  publishedBy: string | null;
  publishedAt: Date | null;
}

const resourceSectionSelection = {
  id: resourceSections.id,
  title: resourceSections.title,
  slug: resourceSections.slug,
  markdown: resourceSections.markdown,
  position: resourceSections.position,
  createdBy: resourceSections.createdBy,
  updatedBy: resourceSections.updatedBy,
  createdAt: resourceSections.createdAt,
  updatedAt: resourceSections.updatedAt,
  publishedTitle: resourcePublications.title,
  publishedSlug: resourcePublications.slug,
  publishedMarkdown: resourcePublications.markdown,
  publishedBy: resourcePublications.publishedBy,
  publishedAt: resourcePublications.publishedAt,
};

const asIso = (value: Date): string => value.toISOString();
const asNullableIso = (value: Date | null): string | null =>
  value ? asIso(value) : null;

const publicationStatus = (
  row: ResourceSectionRow,
): ResourceSectionSummaryDto["publicationStatus"] => {
  if (!row.publishedAt) return "draft";
  if (
    row.title === row.publishedTitle &&
    row.slug === row.publishedSlug &&
    row.markdown === row.publishedMarkdown
  ) {
    return "published";
  }
  return "modified";
};

const toSummaryDto = (row: ResourceSectionRow): ResourceSectionSummaryDto => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  position: row.position,
  publicationStatus: publicationStatus(row),
  updatedAt: asIso(row.updatedAt),
  publishedAt: asNullableIso(row.publishedAt),
});

const toAdminDto = (row: ResourceSectionRow): ResourceSectionAdminDto => ({
  ...toSummaryDto(row),
  markdown: row.markdown,
  publishedTitle: row.publishedTitle,
  publishedSlug: row.publishedSlug,
  publishedMarkdown: row.publishedMarkdown,
  createdBy: row.createdBy,
  updatedBy: row.updatedBy,
  publishedBy: row.publishedBy,
  createdAt: asIso(row.createdAt),
});

const resourceSectionNotFound = (id: string): ApiError =>
  new ApiError(
    404,
    "RESOURCE_SECTION_NOT_FOUND",
    `Resource section '${id}' was not found`,
  );

const assertSlugIsNotReserved = (slug: string): void => {
  if (slug === "additional") {
    throw new ApiError(
      409,
      "RESOURCE_SECTION_SLUG_RESERVED",
      "Resource section slug 'additional' is reserved",
    );
  }
};

const isPostgresError = (error: unknown): error is { code: string } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof error.code === "string";

const mapSlugConflict = (error: unknown, slug: string): never => {
  if (isPostgresError(error) && error.code === "23505") {
    throw new ApiError(
      409,
      "RESOURCE_SECTION_SLUG_EXISTS",
      `Resource section slug '${slug}' is already in use`,
    );
  }
  throw error;
};

async function listResourceSections(): Promise<ResourceSectionSummaryDto[]> {
  const rows: ResourceSectionRow[] = await db
    .select(resourceSectionSelection)
    .from(resourceSections)
    .leftJoin(
      resourcePublications,
      eq(resourcePublications.sectionId, resourceSections.id),
    )
    .orderBy(
      asc(resourceSections.position),
      asc(resourceSections.createdAt),
      asc(resourceSections.id),
    );
  return rows.map(toSummaryDto);
}

async function getResourceSection(
  id: string,
): Promise<ResourceSectionAdminDto> {
  const [row]: ResourceSectionRow[] = await db
    .select(resourceSectionSelection)
    .from(resourceSections)
    .leftJoin(
      resourcePublications,
      eq(resourcePublications.sectionId, resourceSections.id),
    )
    .where(eq(resourceSections.id, id));
  if (!row) throw resourceSectionNotFound(id);
  return toAdminDto(row);
}

async function createResourceSection(
  input: CreateResourceSectionRequest,
  administratorId: string,
): Promise<ResourceSectionAdminDto> {
  assertSlugIsNotReserved(input.slug);
  const [lastPosition] = await db
    .select({ value: max(resourceSections.position) })
    .from(resourceSections);
  try {
    const [created] = await db
      .insert(resourceSections)
      .values({
        ...input,
        position: Number(lastPosition?.value ?? -1) + 1,
        createdBy: administratorId,
        updatedBy: administratorId,
      })
      .returning({ id: resourceSections.id });
    if (!created) {
      throw new ApiError(
        500,
        "RESOURCE_SECTION_CREATE_FAILED",
        "Resource section could not be created",
      );
    }
    return getResourceSection(created.id);
  } catch (error) {
    return mapSlugConflict(error, input.slug);
  }
}

async function updateResourceSection(
  id: string,
  input: UpdateResourceSectionRequest,
  administratorId: string,
): Promise<ResourceSectionAdminDto> {
  if (input.slug) assertSlugIsNotReserved(input.slug);
  const patch: Partial<NewResourceSection> = {
    ...input,
    updatedBy: administratorId,
    updatedAt: new Date(),
  };
  try {
    const [updated] = await db
      .update(resourceSections)
      .set(patch)
      .where(eq(resourceSections.id, id))
      .returning({ id: resourceSections.id });
    if (!updated) throw resourceSectionNotFound(id);
    return getResourceSection(updated.id);
  } catch (error) {
    return mapSlugConflict(error, input.slug ?? id);
  }
}

async function reorderResourceSections(
  input: ReorderResourceSectionsRequest,
  administratorId: string,
): Promise<ResourceSectionSummaryDto[]> {
  await db.transaction(async (transaction) => {
    const rows = await transaction
      .select({ id: resourceSections.id })
      .from(resourceSections)
      .orderBy(asc(resourceSections.id))
      .for("update");
    const storedIds = rows.map((row) => row.id).sort();
    const requestedIds = [...input.orderedIds].sort();
    if (
      storedIds.length !== requestedIds.length ||
      storedIds.some((id, index) => id !== requestedIds[index])
    ) {
      throw new ApiError(
        409,
        "RESOURCE_SECTION_ORDER_INVALID",
        "Section order must contain every stored resource section exactly once",
      );
    }
    for (const [position, id] of input.orderedIds.entries()) {
      await transaction
        .update(resourceSections)
        .set({ position, updatedBy: administratorId, updatedAt: new Date() })
        .where(eq(resourceSections.id, id));
    }
  });
  return listResourceSections();
}

async function publishResourceSection(
  id: string,
  administratorId: string,
): Promise<PublishedResourceSectionDto> {
  try {
    const publication = await db.transaction(async (transaction) => {
      const [draft] = await transaction
        .select({
          id: resourceSections.id,
          title: resourceSections.title,
          slug: resourceSections.slug,
          markdown: resourceSections.markdown,
          position: resourceSections.position,
        })
        .from(resourceSections)
        .where(eq(resourceSections.id, id))
        .for("update");
      if (!draft) throw resourceSectionNotFound(id);
      const publishable = createResourceSectionSchema.parse(draft);
      const [slugOwner] = await transaction
        .select({ sectionId: resourcePublications.sectionId })
        .from(resourcePublications)
        .where(
          and(
            eq(resourcePublications.slug, publishable.slug),
            ne(resourcePublications.sectionId, id),
          ),
        );
      if (slugOwner) {
        throw new ApiError(
          409,
          "RESOURCE_SECTION_SLUG_EXISTS",
          `Published resource slug '${publishable.slug}' is already in use`,
        );
      }
      const publishedAt = new Date();
      const [saved] = await transaction
        .insert(resourcePublications)
        .values({
          sectionId: id,
          title: publishable.title,
          slug: publishable.slug,
          markdown: publishable.markdown,
          publishedBy: administratorId,
          publishedAt,
        })
        .onConflictDoUpdate({
          target: resourcePublications.sectionId,
          set: {
            title: publishable.title,
            slug: publishable.slug,
            markdown: publishable.markdown,
            publishedBy: administratorId,
            publishedAt,
          },
        })
        .returning();
      if (!saved) {
        throw new ApiError(
          500,
          "RESOURCE_SECTION_PUBLISH_FAILED",
          `Resource section '${id}' could not be published`,
        );
      }
      return { ...saved, position: draft.position };
    });
    return {
      id: publication.sectionId,
      title: publication.title,
      slug: publication.slug,
      markdown: publication.markdown,
      position: publication.position,
      publishedAt: asIso(publication.publishedAt),
    };
  } catch (error) {
    return mapSlugConflict(error, id);
  }
}

async function unpublishResourceSection(id: string): Promise<void> {
  const [deleted] = await db
    .delete(resourcePublications)
    .where(eq(resourcePublications.sectionId, id))
    .returning({ sectionId: resourcePublications.sectionId });
  if (deleted) return;
  const [section] = await db
    .select({ id: resourceSections.id })
    .from(resourceSections)
    .where(eq(resourceSections.id, id));
  if (!section) throw resourceSectionNotFound(id);
  throw new ApiError(
    409,
    "RESOURCE_SECTION_NOT_PUBLISHED",
    `Resource section '${id}' is not published`,
  );
}

async function deleteResourceSection(id: string): Promise<void> {
  const [deleted] = await db
    .delete(resourceSections)
    .where(eq(resourceSections.id, id))
    .returning({ id: resourceSections.id });
  if (!deleted) throw resourceSectionNotFound(id);
}

const administratorId = (req: { user?: { id: string } }): string => {
  if (!req.user) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "A valid administrator session is required",
    );
  }
  return req.user.id;
};

export async function listDrafts(
  _req: AuthRequest,
  res: Response,
): Promise<void> {
  responseOk(res, await listResourceSections());
}

export async function getDraft(
  req: AuthRequest<ResourceSectionIdParams>,
  res: Response,
): Promise<void> {
  responseOk(res, await getResourceSection(req.params.id));
}

export async function createDraft(
  req: AuthRequest<object, object, CreateResourceSectionRequest>,
  res: Response,
): Promise<void> {
  const section = await createResourceSection(req.body, administratorId(req));
  logger.info(
    { sectionId: section.id, slug: section.slug },
    "Admin created resource section draft",
  );
  responseCreated(res, section);
}

export async function updateDraft(
  req: AuthRequest<
    ResourceSectionIdParams,
    object,
    UpdateResourceSectionRequest
  >,
  res: Response,
): Promise<void> {
  const section = await updateResourceSection(
    req.params.id,
    req.body,
    administratorId(req),
  );
  logger.info(
    { sectionId: section.id, fields: Object.keys(req.body) },
    "Admin updated resource section draft",
  );
  responseOk(res, section);
}

export async function reorderDrafts(
  req: AuthRequest<object, object, ReorderResourceSectionsRequest>,
  res: Response,
): Promise<void> {
  const sections = await reorderResourceSections(
    req.body,
    administratorId(req),
  );
  logger.info(
    { sectionIds: req.body.orderedIds },
    "Admin reordered resource sections",
  );
  responseOk(res, sections);
}

export async function publishDraft(
  req: AuthRequest<ResourceSectionIdParams>,
  res: Response,
): Promise<void> {
  const publication = await publishResourceSection(
    req.params.id,
    administratorId(req),
  );
  logger.info(
    { sectionId: publication.id, slug: publication.slug },
    "Admin published resource section",
  );
  responseOk(res, publication);
}

export async function unpublishDraft(
  req: AuthRequest<ResourceSectionIdParams>,
  res: Response,
): Promise<void> {
  await unpublishResourceSection(req.params.id);
  logger.info(
    { sectionId: req.params.id },
    "Admin unpublished resource section",
  );
  responseOk(res, { message: "Resource section unpublished" });
}

export async function deleteDraft(
  req: AuthRequest<ResourceSectionIdParams>,
  res: Response,
): Promise<void> {
  await deleteResourceSection(req.params.id);
  logger.info({ sectionId: req.params.id }, "Admin deleted resource section");
  responseOk(res, { message: "Resource section deleted" });
}

export async function listPublishedSections(
  _req: Request,
  res: Response,
): Promise<void> {
  const rows = await db
    .select({
      id: resourcePublications.sectionId,
      title: resourcePublications.title,
      slug: resourcePublications.slug,
      position: resourceSections.position,
      publishedAt: resourcePublications.publishedAt,
    })
    .from(resourcePublications)
    .innerJoin(
      resourceSections,
      eq(resourceSections.id, resourcePublications.sectionId),
    )
    .orderBy(
      asc(resourceSections.position),
      asc(resourceSections.createdAt),
      asc(resourceSections.id),
    );
  const sections: PublishedResourceSectionSummaryDto[] = rows.map((row) => ({
    ...row,
    publishedAt: asIso(row.publishedAt),
  }));
  const revision = createHash("sha256")
    .update(
      sections
        .map((section) => `${section.id}:${section.publishedAt}`)
        .join("|"),
    )
    .digest("hex");
  const data: PublishedResourceSectionListDto = { sections, revision };
  res.set("Cache-Control", "no-store");
  responseOk(res, data);
}

export async function getPublishedSection(
  req: Request<ResourceSectionSlugParams>,
  res: Response,
): Promise<void> {
  res.set("Cache-Control", "no-store");
  const [row] = await db
    .select({
      id: resourcePublications.sectionId,
      title: resourcePublications.title,
      slug: resourcePublications.slug,
      markdown: resourcePublications.markdown,
      position: resourceSections.position,
      publishedAt: resourcePublications.publishedAt,
    })
    .from(resourcePublications)
    .innerJoin(
      resourceSections,
      eq(resourceSections.id, resourcePublications.sectionId),
    )
    .where(eq(resourcePublications.slug, req.params.slug));
  if (!row) {
    throw new ApiError(
      404,
      "RESOURCE_SECTION_NOT_FOUND",
      `Published resource section '${req.params.slug}' was not found`,
    );
  }
  const data: PublishedResourceSectionDto = {
    ...row,
    publishedAt: asIso(row.publishedAt),
  };
  responseOk(res, data);
}
