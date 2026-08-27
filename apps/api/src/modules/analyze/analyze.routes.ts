import { Router } from "express";
import { analyzeProfile } from "./analyze.controller.js";

const router = Router();

router.post("/", analyzeProfile);

export default router;