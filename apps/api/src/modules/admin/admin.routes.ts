import { Router } from "express";
import multer from "multer";
import { requireSession, requireAdmin } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  listRepositories,
  listIssues,
  awardPoints,
  createRepo,
  updateRepo,
  deleteRepo,
  getOverviewStats,
  listMembers,
  uploadParticipantsCsv,
} from "./admin.controller";
import {
  createRepoSchema,
  updateRepoSchema,
  deleteRepoSchema,
  listIssuesQuerySchema,
  awardPointsSchema,
  listMembersQuerySchema,
} from "./admin.types";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_, file, callback) => {
    callback(null, file.originalname.toLowerCase().endsWith(".csv"));
  },
});

router.use(requireSession, requireAdmin);

router.get("/repos", listRepositories);
router.post("/repos", validate(createRepoSchema), createRepo);
router.patch("/repos/:id", validate(updateRepoSchema), updateRepo);
router.delete("/repos/:id", validate(deleteRepoSchema), deleteRepo);
router.get("/issues", validate(listIssuesQuerySchema), listIssues);
router.post("/points", validate(awardPointsSchema), awardPoints);
router.get("/stats/overview", getOverviewStats);
router.get("/members", validate(listMembersQuerySchema), listMembers);
router.post("/participants/upload-csv", upload.single("file"), uploadParticipantsCsv);


export default router;
