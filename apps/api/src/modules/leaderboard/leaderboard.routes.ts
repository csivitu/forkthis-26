import { Router } from "express";
import { getLeaderboard } from "./leaderboard.controller";
import { validate } from "../../middleware/validate.middleware";
import { requireSession } from "../../middleware/auth.middleware";
import { leaderboardQuerySchema } from "./leaderboard.types";

const router = Router();

router.use(requireSession);
router.get("/", validate(leaderboardQuerySchema), getLeaderboard);


export default router;
