import { Router } from "express";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import moduleRoutes from "../modules/leaderboard/leaderboard.routes";
import adminRoutes from "../modules/admin/admin.routes"
import resourceRoutes from "../modules/resources/resource.routes";
import gameRoutes from "../modules/game/game.routes";
const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});


router.use("/dashboard", dashboardRoutes);
router.use("/leaderboard", moduleRoutes);
router.use("/admin",adminRoutes);
router.use("/resources", resourceRoutes);
router.use("/game", gameRoutes);


export default router;
