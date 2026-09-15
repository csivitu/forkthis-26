import { Router } from "express";
import multer from "multer";
import { requireAdmin, requireSession } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  addAdmin,
  awardPoints,
  createParticipant,
  createRepo,
  deleteRepo,
  getOverviewStats,
  listIssues,
  listMembers,
  listParticipants,
  listPointTransactions,
  listPullRequests,
  listRepositories,
  listSyncLogs,
  updateIssue,
  updateRepo,
  uploadParticipantsCsv,
} from "./admin.controller";
import {
  addAdminRouteSchema,
  awardPointsRouteSchema,
  createParticipantRouteSchema,
  createRepoSchema,
  deleteRepoSchema,
  listIssuesSchema,
  listMembersSchema,
  listParticipantsSchema,
  listPullRequestsSchema,
  listSyncLogsSchema,
  listTransactionsSchema,
  updateIssueRouteSchema,
  updateRepoSchema,
} from "./admin.types";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_, file, callback) =>
    callback(null, file.originalname.toLowerCase().endsWith(".csv")),
});

router.use(requireSession, requireAdmin);
router.get("/repos", listRepositories);
router.post("/repos", validate(createRepoSchema), createRepo);
router.patch("/repos/:id", validate(updateRepoSchema), updateRepo);
router.delete("/repos/:id", validate(deleteRepoSchema), deleteRepo);
router.get("/issues", validate(listIssuesSchema), listIssues);
router.patch("/issues/:id", validate(updateIssueRouteSchema), updateIssue);
router.get(
  "/pull-requests",
  validate(listPullRequestsSchema),
  listPullRequests,
);
router.get("/sync-logs", validate(listSyncLogsSchema), listSyncLogs);
router.get("/members", validate(listMembersSchema), listMembers);
router.post("/admins", validate(addAdminRouteSchema), addAdmin);
router.get(
  "/point-transactions",
  validate(listTransactionsSchema),
  listPointTransactions,
);
router.post("/points", validate(awardPointsRouteSchema), awardPoints);
router.get("/participants", validate(listParticipantsSchema), listParticipants);
router.post(
  "/participants",
  validate(createParticipantRouteSchema),
  createParticipant,
);
router.post(
  "/participants/upload-csv",
  upload.single("file"),
  uploadParticipantsCsv,
);
router.get("/stats/overview", getOverviewStats);

export default router;
