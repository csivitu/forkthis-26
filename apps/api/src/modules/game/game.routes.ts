import { Router } from "express";
import {
  createGameQuestionSchema,
  gameQuestionIdParamsSchema,
  gameRoundIdParamsSchema,
  reorderGameQuestionsSchema,
  submitGameAnswerSchema,
  updateGameQuestionSchema,
} from "@repo/game-contracts";
import { requireSession } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createQuestion,
  deleteQuestion,
  endRound,
  getCurrentRound,
  getGameLeaderboard,
  getGameStatus,
  getQuestion,
  getRoundResults,
  listQuestions,
  listRounds,
  pushQuestion,
  reorderQuestions,
  streamGame,
  submitAnswer,
  updateQuestion,
} from "./game.controller";

const publicRouter = Router();
const adminRouter = Router();
const idParams = { params: gameQuestionIdParamsSchema };

// Participants must be signed in: the stream carries live questions and every
// answer is attributed to a user.
publicRouter.use(requireSession);
publicRouter.get("/stream", streamGame);
publicRouter.get("/current", getCurrentRound);
publicRouter.post(
  "/answers",
  validate({ body: submitGameAnswerSchema }),
  submitAnswer,
);
publicRouter.get("/leaderboard", getGameLeaderboard);

// Mounted under /api/admin/game, which already applies requireSession and
// requireAdmin in admin.routes.ts.
adminRouter.get("/status", getGameStatus);
adminRouter.get("/questions", listQuestions);
adminRouter.post(
  "/questions",
  validate({ body: createGameQuestionSchema }),
  createQuestion,
);
adminRouter.patch(
  "/questions/order",
  validate({ body: reorderGameQuestionsSchema }),
  reorderQuestions,
);
adminRouter.get("/questions/:id", validate(idParams), getQuestion);
adminRouter.patch(
  "/questions/:id",
  validate({ ...idParams, body: updateGameQuestionSchema }),
  updateQuestion,
);
adminRouter.delete("/questions/:id", validate(idParams), deleteQuestion);
adminRouter.post("/questions/:id/push", validate(idParams), pushQuestion);
adminRouter.post("/rounds/end", endRound);
adminRouter.get("/rounds", listRounds);
adminRouter.get(
  "/rounds/:roundId",
  validate({ params: gameRoundIdParamsSchema }),
  getRoundResults,
);

export { adminRouter };
export default publicRouter;
