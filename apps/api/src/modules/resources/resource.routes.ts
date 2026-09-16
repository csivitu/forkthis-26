import { Router } from "express";
import {
  createResourceSectionSchema,
  reorderResourceSectionsSchema,
  resourceSectionIdParamsSchema,
  updateResourceSectionSchema,
} from "@repo/resource-contracts";
import { validate } from "../../middleware/validate.middleware";
import {
  createDraft,
  deleteDraft,
  getDraft,
  listDrafts,
  publishDraft,
  reorderDrafts,
  unpublishDraft,
  updateDraft,
} from "./resource.controller";

const router = Router();
const idParams = { params: resourceSectionIdParamsSchema };

router.get("/", listDrafts);
router.post("/", validate({ body: createResourceSectionSchema }), createDraft);
router.patch(
  "/order",
  validate({ body: reorderResourceSectionsSchema }),
  reorderDrafts,
);
router.get("/:id", validate(idParams), getDraft);
router.patch(
  "/:id",
  validate({ ...idParams, body: updateResourceSectionSchema }),
  updateDraft,
);
router.post("/:id/publish", validate(idParams), publishDraft);
router.post("/:id/unpublish", validate(idParams), unpublishDraft);
router.delete("/:id", validate(idParams), deleteDraft);

export default router;
