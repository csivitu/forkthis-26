import { Router } from "express";
import { moduleController } from "./module.controller";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Module route is working",
  });
});

router.post("/", moduleController);

export default router;