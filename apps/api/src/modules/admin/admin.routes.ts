import { Router } from "express";
import { requireSession, requireAdmin } from "../../middleware/auth.middleware";
import { listRepositories, listIssues, awardPoints } from "./admin.controller";

const router = Router();

router.use(requireSession,requireAdmin);

router.get("/repos",listRepositories);
router.get("/issues",listIssues);
router.post("/points",awardPoints);

export default router;