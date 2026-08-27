import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import analyzeRoutes from "../modules/analyze/analyze.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.send("API working 67");
});

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/analyze", analyzeRoutes);

export default router;