import { Router } from "express";
import { getProfileController } from "./user.controller.js";

const router = Router();

router.get("/profile", getProfileController);

export default router;