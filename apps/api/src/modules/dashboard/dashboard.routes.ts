import { Router } from "express";
import { requireSession } from "../../middleware/auth.middleware";
import { getRepositories, getIssuesByRepository, getPointTransactions } from "./dashboard.controller";

const router = Router();

router.get("/repositories", requireSession, getRepositories);
router.get("/repositories/:id/issues", requireSession, getIssuesByRepository);
router.get("/point-transactions", requireSession, getPointTransactions);

export default router;
