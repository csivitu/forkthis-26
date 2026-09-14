import { Router } from "express";
import multer from "multer";
import { requireSession, requireAdmin } from "../../middleware/auth.middleware";

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
router.post("/repos", createRepo);
router.patch("/repos/:id", updateRepo);
router.delete("/repos/:id", deleteRepo);
router.get("/issues",listIssues);
router.post("/points",awardPoints);
router.get("/stats/overview", getOverviewStats);
router.get("/members", listMembers);
router.post("/participants/upload-csv", upload.single("file"), uploadParticipantsCsv);


export default router;