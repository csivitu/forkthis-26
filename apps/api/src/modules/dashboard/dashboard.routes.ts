import { Router } from "express";
import { requireSession } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { getRepositories, getIssuesByRepository, getPointTransactions } from "./dashboard.controller";
import { getIssuesByRepoSchema } from "./dashboard.types";

const router = Router();

router.get("/repositories", requireSession, getRepositories);
router.get("/repositories/:id/issues", requireSession, validate(getIssuesByRepoSchema), getIssuesByRepository);
router.get("/point-transactions", requireSession, getPointTransactions);

export default router;
