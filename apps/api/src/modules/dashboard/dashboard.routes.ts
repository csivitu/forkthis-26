import { Router } from "express";
import { requireGithubLinked, requireSession } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { getRepositories, getIssuesByRepository, getPointTransactions } from "./dashboard.controller";
import { getIssuesByRepoSchema } from "./dashboard.types";

const router = Router();

router.use(requireSession, requireGithubLinked);
router.get("/repositories", getRepositories);
router.get("/repositories/:id/issues", validate(getIssuesByRepoSchema), getIssuesByRepository);
router.get("/point-transactions", getPointTransactions);

export default router;
