import { Router } from "express";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";

const router = Router();

router.use("/dashboard", dashboardRoutes);

export default router;