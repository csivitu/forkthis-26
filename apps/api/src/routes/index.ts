import { Router } from "express";
import moduleRoutes from "../modules/module/module.routes";

const router = Router();

router.use("/module", moduleRoutes);

export default router;