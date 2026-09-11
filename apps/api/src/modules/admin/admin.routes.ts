import { Router } from "express";
import { requireSession, requireAdmin } from "../../middleware/auth.middleware";

import { listRepositories, listIssues, awardPoints, createRepo, updateRepo, deleteRepo, getOverviewStats, listMembers  } from "./admin.controller";


const router = Router();

router.use(requireSession, requireAdmin);

router.get("/repos", listRepositories);
router.post("/repos", createRepo);
router.patch("/repos/:id", updateRepo);
router.delete("/repos/:id", deleteRepo);
router.get("/issues",listIssues);
router.post("/points",awardPoints);
router.get("/stats/overview", getOverviewStats);
router.get("/members", listMembers);


export default router;