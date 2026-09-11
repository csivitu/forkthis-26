import { Router } from "express";
import moduleRoutes from "../modules/leaderboard/leaderboard.routes";
import adminRoutes from "../modules/admin/admin.routes"

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
router.use("/leaderboard", moduleRoutes);
router.use("/admin",adminRoutes);

export default router;