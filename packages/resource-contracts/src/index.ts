import { z } from "zod";

export const resourcePublicationStatuses = [
  "draft",
  "published",
  "modified",
] as const;

export type ResourcePublicationStatus =
  (typeof resourcePublicationStatuses)[number];

const MAX_MARKDOWN_BYTES = 65_536;
const MAX_SEARCH_QUERY_LENGTH = 120;
const textEncoder = new TextEncoder();

const uuidSchema = z.string().uuid();

const resourceTitleSchema = z.string().trim().min(1).max(120);

const resourceSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase kebab-case")
  .refine((slug) => slug !== "additional", {
    message: "The slug 'additional' is reserved",
  });

const resourceMarkdownSchema = z
  .string()
  .refine((markdown) => markdown.trim().length > 0, {
    message: "Markdown is required",
  })
  .refine(
    (markdown) => textEncoder.encode(markdown).byteLength <= MAX_MARKDOWN_BYTES,
    `Markdown must not exceed ${MAX_MARKDOWN_BYTES} bytes`,
  );

export const createResourceSectionSchema = z.object({
  title: resourceTitleSchema,
  slug: resourceSlugSchema,
  markdown: resourceMarkdownSchema,
});

export const updateResourceSectionSchema = z
  .object({
    title: resourceTitleSchema.optional(),
    slug: resourceSlugSchema.optional(),
    markdown: resourceMarkdownSchema.optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "Provide at least one resource section field",
  });

export const reorderResourceSectionsSchema = z.object({
  orderedIds: z
    .array(uuidSchema)
    .min(1)
    .superRefine((orderedIds, context) => {
      if (new Set(orderedIds).size !== orderedIds.length) {
        context.addIssue({
          code: "custom",
          message: "Section order must contain unique IDs",
        });
      }
    }),
});

export const resourceSectionIdParamsSchema = z.object({
  id: uuidSchema,
});

export const resourceSectionSlugParamsSchema = z.object({
  slug: resourceSlugSchema,
});

export const resourceSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(MAX_SEARCH_QUERY_LENGTH),
});

export type CreateResourceSectionRequest = z.infer<
  typeof createResourceSectionSchema
>;
export type UpdateResourceSectionRequest = z.infer<
  typeof updateResourceSectionSchema
>;
export type ReorderResourceSectionsRequest = z.infer<
  typeof reorderResourceSectionsSchema
>;
export type ResourceSectionIdParams = z.infer<
  typeof resourceSectionIdParamsSchema
>;
export type ResourceSectionSlugParams = z.infer<
  typeof resourceSectionSlugParamsSchema
>;
export type ResourceSearchQuery = z.infer<typeof resourceSearchQuerySchema>;

export interface ResourceSectionSummaryDto {
  id: string;
  title: string;
  slug: string;
  position: number;
  publicationStatus: ResourcePublicationStatus;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ResourceSectionAdminDto extends ResourceSectionSummaryDto {
  markdown: string;
  publishedTitle: string | null;
  publishedSlug: string | null;
  publishedMarkdown: string | null;
  createdBy: string;
  updatedBy: string;
  publishedBy: string | null;
  createdAt: string;
}

export interface PublishedResourceSectionSummaryDto {
  id: string;
  title: string;
  slug: string;
  position: number;
  publishedAt: string;
}

export interface PublishedResourceSectionDto extends PublishedResourceSectionSummaryDto {
  markdown: string;
}

export interface ResourceSearchResultDto {
  sectionId: string;
  sectionTitle: string;
  sectionSlug: string;
  heading: string | null;
  anchor: string | null;
  excerpt: string;
}
