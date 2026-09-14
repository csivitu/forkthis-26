import { Router } from "express";
import { getLeaderboard } from "./leaderboard.controller";
import { validate } from "../../middleware/validate.middleware";
import { leaderboardQuerySchema } from "./leaderboard.types";

const router = Router();

router.get("/", validate(leaderboardQuerySchema), getLeaderboard);


export default router;
