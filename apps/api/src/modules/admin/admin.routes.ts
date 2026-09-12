import { Router } from "express";
import { requireSession, requireAdmin } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";

import { listRepositories, listIssues, awardPoints, createRepo, updateRepo, deleteRepo, getOverviewStats, listMembers  } from "./admin.controller";
import {
  createRepoSchema,
  updateRepoSchema,
  deleteRepoSchema,
  listIssuesQuerySchema,
  awardPointsSchema,
  listMembersQuerySchema,
} from "./admin.types";


const router = Router();

router.use(requireSession, requireAdmin);

router.get("/repos", listRepositories);
router.post("/repos", validate(createRepoSchema), createRepo);
router.patch("/repos/:id", validate(updateRepoSchema), updateRepo);
router.delete("/repos/:id", validate(deleteRepoSchema), deleteRepo);
router.get("/issues", validate(listIssuesQuerySchema), listIssues);
router.post("/points", validate(awardPointsSchema), awardPoints);
router.get("/stats/overview", getOverviewStats);
router.get("/members", validate(listMembersQuerySchema), listMembers);


export default router;
