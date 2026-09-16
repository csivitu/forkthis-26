import { Router } from "express";
import {
  createResourceSectionSchema,
  reorderResourceSectionsSchema,
  resourceSectionIdParamsSchema,
  resourceSectionSlugParamsSchema,
  updateResourceSectionSchema,
} from "@repo/resource-contracts";
import { validate } from "../../middleware/validate.middleware";
import {
  createDraft,
  deleteDraft,
  getDraft,
  getPublishedSection,
  listDrafts,
  listPublishedSections,
  publishDraft,
  reorderDrafts,
  unpublishDraft,
  updateDraft,
} from "./resource.controller";

const publicRouter = Router();
const adminRouter = Router();
const idParams = { params: resourceSectionIdParamsSchema };

publicRouter.get("/sections", listPublishedSections);
publicRouter.get(
  "/sections/:slug",
  validate({ params: resourceSectionSlugParamsSchema }),
  getPublishedSection,
);

adminRouter.get("/", listDrafts);
adminRouter.post(
  "/",
  validate({ body: createResourceSectionSchema }),
  createDraft,
);
adminRouter.patch(
  "/order",
  validate({ body: reorderResourceSectionsSchema }),
  reorderDrafts,
);
adminRouter.get("/:id", validate(idParams), getDraft);
adminRouter.patch(
  "/:id",
  validate({ ...idParams, body: updateResourceSectionSchema }),
  updateDraft,
);
adminRouter.post("/:id/publish", validate(idParams), publishDraft);
adminRouter.post("/:id/unpublish", validate(idParams), unpublishDraft);
adminRouter.delete("/:id", validate(idParams), deleteDraft);

export { adminRouter };
export default publicRouter;
