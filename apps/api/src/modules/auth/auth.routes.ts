import { Router } from "express";
import { loginController, meController } from "./auth.controller.js";

const router = Router();

router.post("/login", loginController);
router.get("/me", meController);

export default router;