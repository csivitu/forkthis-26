import type { NextFunction, Response } from "express";
import {
  ANSWER_GRACE_MS,
  type CreateGameQuestionRequest,
  type GameAnswerReceiptDto,
  type GameLeaderboardEntryDto,
  type GameQuestionDto,
  type GameRoundEndedDto,
  type GameRoundStandingDto,
  type GameRoundSummaryDto,
  type LiveGameRoundDto,
  type ReorderGameQuestionsRequest,
  type SubmitGameAnswerRequest,
  type UpdateGameQuestionRequest,
} from "@repo/game-contracts";
import { db, gameAnswers, gameQuestions, gameRounds, users } from "@repo/db";
import { and, asc, count, desc, eq, inArray, max, sql } from "drizzle-orm";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { ApiError } from "../../utils/api-error";
import { responseCreated, responseOk } from "../../utils/api-response";
import logger from "../../utils/logger.util";
import {
  addClient,
  connectedClientCount,
  endRoundNow,
  getAnswerableRound,
  getLiveRound,
  onRoundReveal,
  startRound,
  type LiveRound,
} from "./game.broadcaster";

const asIso = (value: Date): string => value.toISOString();
const asNullableIso = (value: Date | null): string | null =>
  value ? value.toISOString() : null;

const HOW_MANY_FASTEST = 5;

const administratorId = (req: { user?: { id: string } }): string => {
  if (!req.user) {
    throw new ApiError(
      401,
      "UNAUTHENTICATED",
      "A valid administrator session is required",
    );
  }
  return req.user.id;
};

const participantId = (req: { user?: { id: string } }): string => {
  if (!req.user) {
    throw new ApiError(401, "UNAUTHENTICATED", "A valid session is required");
  }
  return req.user.id;
};

const questionNotFound = (id: string): ApiError =>
  new ApiError(404, "GAME_QUESTION_NOT_FOUND", `No game question with id '${id}'`);

/** Shared projection so the admin list and single-question reads cannot drift. */
const questionSelection = {
  id: gameQuestions.id,
  prompt: gameQuestions.prompt,
  options: gameQuestions.options,
  correctIndex: gameQuestions.correctIndex,
  durationSeconds: gameQuestions.durationSeconds,
  position: gameQuestions.position,
  createdAt: gameQuestions.createdAt,
  updatedAt: gameQuestions.updatedAt,
};

async function toQuestionDtos(
  rows: {
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
    durationSeconds: number;
    position: number;
    createdAt: Date;
    updatedAt: Date;
  }[],
): Promise<GameQuestionDto[]> {
  if (rows.length === 0) return [];
  // One grouped read for push history rather than a query per question.
  const history = await db
    .select({
      questionId: gameRounds.questionId,
      lastPushedAt: max(gameRounds.startedAt),
      timesPushed: count(gameRounds.id),
    })
    .from(gameRounds)
    .where(
      inArray(
        gameRounds.questionId,
        rows.map((row) => row.id),
      ),
    )
    .groupBy(gameRounds.questionId);

  const byQuestion = new Map(
    history.map((row) => [row.questionId, row] as const),
  );

  return rows.map((row) => {
    const pushed = byQuestion.get(row.id);
    return {
      ...row,
      createdAt: asIso(row.createdAt),
      updatedAt: asIso(row.updatedAt),
      lastPushedAt: pushed?.lastPushedAt
        ? asIso(new Date(pushed.lastPushedAt))
        : null,
      timesPushed: Number(pushed?.timesPushed ?? 0),
    };
  });
}

async function fastestCorrect(
  roundId: string,
  limit = HOW_MANY_FASTEST,
): Promise<GameRoundStandingDto[]> {
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      githubUsername: users.githubUsername,
      avatarUrl: users.avatarUrl,
      responseMs: gameAnswers.responseMs,
    })
    .from(gameAnswers)
    .innerJoin(users, eq(users.id, gameAnswers.userId))
    .where(and(eq(gameAnswers.roundId, roundId), eq(gameAnswers.isCorrect, true)))
    .orderBy(asc(gameAnswers.responseMs))
    .limit(limit);

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

async function tallyRound(round: LiveRound): Promise<GameRoundEndedDto> {
  const [totals] = await db
    .select({
      totalAnswers: count(gameAnswers.id),
      correctAnswers: sql<number>`count(*) filter (where ${gameAnswers.isCorrect})`,
    })
    .from(gameAnswers)
    .where(eq(gameAnswers.roundId, round.roundId));

  return {
    roundId: round.roundId,
    correctIndex: round.correctIndex,
    totalAnswers: Number(totals?.totalAnswers ?? 0),
    correctAnswers: Number(totals?.correctAnswers ?? 0),
    fastest: await fastestCorrect(round.roundId),
  };
}

// The broadcaster owns the reveal timer but must not know about the database.
onRoundReveal(tallyRound);

/* ------------------------------ participant ------------------------------ */

export function streamGame(req: AuthRequest, res: Response): void {
  const userId = participantId(req);
  // An SSE response is open-ended; the socket must never be killed by a
  // server-side inactivity timeout.
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  const removeClient = addClient(userId, res);
  req.on("close", removeClient);
}

export function getCurrentRound(_req: AuthRequest, res: Response): void {
  const round = getLiveRound();
  if (!round) {
    responseOk(res, null);
    return;
  }
  const payload: LiveGameRoundDto = {
    roundId: round.roundId,
    questionId: round.questionId,
    prompt: round.prompt,
    options: round.options,
    durationSeconds: round.durationSeconds,
    startedAt: asIso(round.startedAt),
    endsAt: asIso(round.endsAt),
    serverNow: new Date().toISOString(),
  };
  responseOk(res, payload);
}

/**
 * Records one answer.
 *
 * Written as a single `insert ... on conflict do nothing returning` against
 * the (round_id, user_id) unique index. 150 participants answering within a
 * couple of seconds is the only real load this feature puts on the database,
 * and the serverless pool in packages/db has no configured size — so the hot
 * path does no prior SELECT, opens no transaction, and never reads the round
 * from Postgres. Correctness and elapsed time are both derived from the round
 * the broadcaster is already holding in memory.
 */
export async function submitAnswer(
  req: AuthRequest<object, object, SubmitGameAnswerRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = participantId(req);
    const round = getAnswerableRound();

    if (!round || round.roundId !== req.body.roundId) {
      throw new ApiError(
        409,
        "GAME_ROUND_CLOSED",
        "That question is no longer accepting answers",
      );
    }

    const responseMs = Math.max(Date.now() - round.startedAt.getTime(), 0);
    const [inserted] = await db
      .insert(gameAnswers)
      .values({
        roundId: round.roundId,
        userId,
        selectedIndex: req.body.selectedIndex,
        isCorrect: req.body.selectedIndex === round.correctIndex,
        responseMs,
      })
      .onConflictDoNothing({
        target: [gameAnswers.roundId, gameAnswers.userId],
      })
      .returning({ id: gameAnswers.id });

    // No row back means the unique index rejected it: this participant has
    // already answered this round. Answers are final.
    if (!inserted) {
      throw new ApiError(
        409,
        "GAME_ANSWER_ALREADY_SUBMITTED",
        "You have already answered this question",
      );
    }

    // Deliberately says nothing about correctness — see GameAnswerReceiptDto.
    const receipt: GameAnswerReceiptDto = {
      roundId: round.roundId,
      selectedIndex: req.body.selectedIndex,
      responseMs,
    };
    responseCreated(res, receipt);
  } catch (error) {
    next(error);
  }
}

export async function getGameLeaderboard(
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const correctAnswers = sql<number>`count(*) filter (where ${gameAnswers.isCorrect})`;
    const totalResponseMs = sql<number>`coalesce(sum(${gameAnswers.responseMs}) filter (where ${gameAnswers.isCorrect}), 0)`;

    const rows = await db
      .select({
        userId: users.id,
        name: users.name,
        githubUsername: users.githubUsername,
        avatarUrl: users.avatarUrl,
        correctAnswers,
        totalResponseMs,
        roundsAnswered: count(gameAnswers.id),
      })
      .from(gameAnswers)
      .innerJoin(users, eq(users.id, gameAnswers.userId))
      .groupBy(users.id)
      // Most correct wins; speed breaks the tie. That is what makes it
      // "fastest fingers" rather than just a quiz.
      .orderBy(desc(correctAnswers), asc(totalResponseMs));

    const data: GameLeaderboardEntryDto[] = rows.map((row, index) => {
      const correct = Number(row.correctAnswers);
      const total = Number(row.totalResponseMs);
      return {
        rank: index + 1,
        userId: row.userId,
        name: row.name,
        githubUsername: row.githubUsername,
        avatarUrl: row.avatarUrl,
        correctAnswers: correct,
        roundsAnswered: Number(row.roundsAnswered),
        totalResponseMs: total,
        averageResponseMs: correct > 0 ? Math.round(total / correct) : 0,
      };
    });

    responseOk(res, data, 200, {
      page: 1,
      limit: data.length || 25,
      total: data.length,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to build the game leaderboard");
    next(error);
  }
}

/* -------------------------------- admin --------------------------------- */

export async function listQuestions(
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rows = await db
      .select(questionSelection)
      .from(gameQuestions)
      .orderBy(asc(gameQuestions.position), asc(gameQuestions.createdAt));
    responseOk(res, await toQuestionDtos(rows));
  } catch (error) {
    logger.error({ err: error }, "Failed to list game questions");
    next(error);
  }
}

export async function getQuestion(
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [row] = await db
      .select(questionSelection)
      .from(gameQuestions)
      .where(eq(gameQuestions.id, req.params.id));
    if (!row) throw questionNotFound(req.params.id);
    const [dto] = await toQuestionDtos([row]);
    responseOk(res, dto);
  } catch (error) {
    next(error);
  }
}

export async function createQuestion(
  req: AuthRequest<object, object, CreateGameQuestionRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = administratorId(req);
    const [tail] = await db
      .select({ highest: max(gameQuestions.position) })
      .from(gameQuestions);
    const position = (tail?.highest ?? -1) + 1;

    const [created] = await db
      .insert(gameQuestions)
      .values({
        ...req.body,
        position,
        createdBy: adminId,
        updatedBy: adminId,
      })
      .returning(questionSelection);
    if (!created)
      throw new ApiError(500, "INSERT_FAILED", "Failed to create the question");

    logger.info({ questionId: created.id }, "Admin created a game question");
    const [dto] = await toQuestionDtos([created]);
    responseCreated(res, dto);
  } catch (error) {
    logger.error({ err: error }, "Failed to create a game question");
    next(error);
  }
}

export async function updateQuestion(
  req: AuthRequest<{ id: string }, object, UpdateGameQuestionRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [updated] = await db
      .update(gameQuestions)
      .set({ ...req.body, updatedBy: administratorId(req) })
      .where(eq(gameQuestions.id, req.params.id))
      .returning(questionSelection);
    if (!updated) throw questionNotFound(req.params.id);

    logger.info({ questionId: updated.id }, "Admin updated a game question");
    const [dto] = await toQuestionDtos([updated]);
    responseOk(res, dto);
  } catch (error) {
    next(error);
  }
}

export async function deleteQuestion(
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Rounds keep their own snapshot and their question_id is `set null`, so
    // deleting a question never destroys the history of what was asked.
    const [deleted] = await db
      .delete(gameQuestions)
      .where(eq(gameQuestions.id, req.params.id))
      .returning({ id: gameQuestions.id });
    if (!deleted) throw questionNotFound(req.params.id);

    logger.info({ questionId: deleted.id }, "Admin deleted a game question");
    responseOk(res, { id: deleted.id });
  } catch (error) {
    next(error);
  }
}

export async function reorderQuestions(
  req: AuthRequest<object, object, ReorderGameQuestionsRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { questionIds } = req.body;
    if (new Set(questionIds).size !== questionIds.length) {
      throw new ApiError(
        400,
        "GAME_ORDER_DUPLICATE",
        "The order contains duplicate question ids",
      );
    }

    const existing = await db
      .select({ id: gameQuestions.id })
      .from(gameQuestions);
    if (existing.length !== questionIds.length) {
      throw new ApiError(
        400,
        "GAME_ORDER_INCOMPLETE",
        "Provide every question id exactly once",
      );
    }
    const known = new Set(existing.map((row) => row.id));
    for (const id of questionIds) {
      if (!known.has(id)) throw questionNotFound(id);
    }

    // Resolved before the transaction opens: throwing mid-loop would abandon
    // the reorder with some rows already renumbered.
    const adminId = administratorId(req);
    await db.transaction(async (transaction) => {
      for (const [position, id] of questionIds.entries()) {
        await transaction
          .update(gameQuestions)
          .set({ position, updatedBy: adminId })
          .where(eq(gameQuestions.id, id));
      }
    });

    const rows = await db
      .select(questionSelection)
      .from(gameQuestions)
      .orderBy(asc(gameQuestions.position), asc(gameQuestions.createdAt));
    responseOk(res, await toQuestionDtos(rows));
  } catch (error) {
    next(error);
  }
}

/**
 * Pushes a question live.
 *
 * The round row is written before anything is broadcast, so a participant's
 * answer can never reference a round that does not exist yet.
 */
export async function pushQuestion(
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const adminId = administratorId(req);

    const live = getLiveRound();
    if (live) {
      throw new ApiError(
        409,
        "GAME_ROUND_IN_PROGRESS",
        "A question is already live. End it before pushing another.",
      );
    }

    const [question] = await db
      .select(questionSelection)
      .from(gameQuestions)
      .where(eq(gameQuestions.id, req.params.id));
    if (!question) throw questionNotFound(req.params.id);

    const startedAt = new Date();
    const endsAt = new Date(
      startedAt.getTime() + question.durationSeconds * 1_000,
    );

    const [round] = await db
      .insert(gameRounds)
      .values({
        questionId: question.id,
        prompt: question.prompt,
        options: question.options,
        correctIndex: question.correctIndex,
        durationSeconds: question.durationSeconds,
        startedAt,
        endsAt,
        pushedBy: adminId,
      })
      .returning({ id: gameRounds.id });
    if (!round)
      throw new ApiError(500, "INSERT_FAILED", "Failed to open the round");

    startRound({
      roundId: round.id,
      questionId: question.id,
      prompt: question.prompt,
      options: question.options,
      correctIndex: question.correctIndex,
      durationSeconds: question.durationSeconds,
      startedAt,
      endsAt,
    });

    responseCreated(res, {
      roundId: round.id,
      startedAt: asIso(startedAt),
      endsAt: asIso(endsAt),
      durationSeconds: question.durationSeconds,
      notifiedClients: connectedClientCount(),
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to push a game question");
    next(error);
  }
}

export async function endRound(
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const round = endRoundNow();
    if (!round) {
      throw new ApiError(
        409,
        "GAME_NO_LIVE_ROUND",
        "There is no question currently live",
      );
    }
    await db
      .update(gameRounds)
      .set({ endsAt: round.endsAt })
      .where(eq(gameRounds.id, round.roundId));
    responseOk(res, { roundId: round.roundId, endsAt: asIso(round.endsAt) });
  } catch (error) {
    next(error);
  }
}

export async function listRounds(
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rows = await db
      .select({
        roundId: gameRounds.id,
        questionId: gameRounds.questionId,
        prompt: gameRounds.prompt,
        options: gameRounds.options,
        correctIndex: gameRounds.correctIndex,
        durationSeconds: gameRounds.durationSeconds,
        startedAt: gameRounds.startedAt,
        endsAt: gameRounds.endsAt,
        totalAnswers: count(gameAnswers.id),
        correctAnswers: sql<number>`count(*) filter (where ${gameAnswers.isCorrect})`,
      })
      .from(gameRounds)
      .leftJoin(gameAnswers, eq(gameAnswers.roundId, gameRounds.id))
      .groupBy(gameRounds.id)
      .orderBy(desc(gameRounds.startedAt))
      .limit(50);

    const data: GameRoundSummaryDto[] = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        startedAt: asIso(row.startedAt),
        endsAt: asIso(row.endsAt),
        totalAnswers: Number(row.totalAnswers),
        correctAnswers: Number(row.correctAnswers),
        fastest: await fastestCorrect(row.roundId, 3),
      })),
    );

    responseOk(res, data);
  } catch (error) {
    logger.error({ err: error }, "Failed to list game rounds");
    next(error);
  }
}

export async function getRoundResults(
  req: AuthRequest<{ roundId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [round] = await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.id, req.params.roundId));
    if (!round)
      throw new ApiError(
        404,
        "GAME_ROUND_NOT_FOUND",
        `No round with id '${req.params.roundId}'`,
      );

    const [totals] = await db
      .select({
        totalAnswers: count(gameAnswers.id),
        correctAnswers: sql<number>`count(*) filter (where ${gameAnswers.isCorrect})`,
      })
      .from(gameAnswers)
      .where(eq(gameAnswers.roundId, round.id));

    const summary: GameRoundSummaryDto = {
      roundId: round.id,
      questionId: round.questionId,
      prompt: round.prompt,
      options: round.options,
      correctIndex: round.correctIndex,
      durationSeconds: round.durationSeconds,
      startedAt: asIso(round.startedAt),
      endsAt: asIso(round.endsAt),
      totalAnswers: Number(totals?.totalAnswers ?? 0),
      correctAnswers: Number(totals?.correctAnswers ?? 0),
      fastest: await fastestCorrect(round.id, 25),
    };
    responseOk(res, summary);
  } catch (error) {
    next(error);
  }
}

export function getGameStatus(_req: AuthRequest, res: Response): void {
  const round = getLiveRound();
  responseOk(res, {
    connectedClients: connectedClientCount(),
    liveRound: round
      ? {
          roundId: round.roundId,
          prompt: round.prompt,
          endsAt: asIso(round.endsAt),
          // The admin console shows how long answers stay open past the timer.
          graceMs: ANSWER_GRACE_MS,
        }
      : null,
    lastPushedAt: asNullableIso(round ? round.startedAt : null),
  });
}
