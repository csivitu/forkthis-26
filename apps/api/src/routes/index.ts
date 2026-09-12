import { Router } from "express";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import moduleRoutes from "../modules/leaderboard/leaderboard.routes";
import adminRoutes from "../modules/admin/admin.routes"
const router = Router();

router.use("/dashboard", dashboardRoutes);
router.use("/leaderboard", moduleRoutes);
router.use("/admin",adminRoutes);


export default router;