import { Router } from "express";
import { requireSession, requireAdmin } from "../../middleware/auth.middleware";
import { listRepositories, listIssues, awardPoints, getOverviewStats, listMembers } from "./admin.controller";

const router = Router();

router.use(requireSession, requireAdmin);

router.get("/repos", listRepositories);
router.get("/issues", listIssues);
router.post("/points", awardPoints);
router.get("/stats/overview", getOverviewStats);
router.get("/members", listMembers);

export default router;