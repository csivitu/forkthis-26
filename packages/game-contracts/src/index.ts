import { z } from "zod";

/** Every Fastest Fingers question has exactly one correct answer and three wrong ones. */
export const GAME_OPTION_COUNT = 4;
export const MIN_QUESTION_SECONDS = 5;
export const MAX_QUESTION_SECONDS = 300;

/**
 * Extra time the server keeps accepting answers after the advertised deadline.
 * Participants on workshop wifi routinely see their countdown hit zero a beat
 * before their POST lands; without this they are punished for latency they
 * cannot control. The server is the only judge of lateness — a client whose
 * own timer expired early must still be able to submit.
 */
export const ANSWER_GRACE_MS = 1_500;

const MAX_PROMPT_LENGTH = 500;
const MAX_OPTION_LENGTH = 200;

const uuidSchema = z.string().uuid();

const gamePromptSchema = z.string().trim().min(1).max(MAX_PROMPT_LENGTH);

const gameOptionSchema = z.string().trim().min(1).max(MAX_OPTION_LENGTH);

export const gameOptionsSchema = z
  .array(gameOptionSchema)
  .length(GAME_OPTION_COUNT, `Provide exactly ${GAME_OPTION_COUNT} options`)
  .refine(
    (options) =>
      new Set(options.map((option) => option.toLowerCase())).size ===
      options.length,
    { message: "Options must be distinct" },
  );

const correctIndexSchema = z
  .number()
  .int()
  .min(0)
  .max(GAME_OPTION_COUNT - 1, "Select which option is correct");

const durationSecondsSchema = z
  .number()
  .int()
  .min(
    MIN_QUESTION_SECONDS,
    `A question must run for at least ${MIN_QUESTION_SECONDS} seconds`,
  )
  .max(
    MAX_QUESTION_SECONDS,
    `A question may run for at most ${MAX_QUESTION_SECONDS} seconds`,
  );

export const createGameQuestionSchema = z.object({
  prompt: gamePromptSchema,
  options: gameOptionsSchema,
  correctIndex: correctIndexSchema,
  durationSeconds: durationSecondsSchema,
});

export const updateGameQuestionSchema = z
  .object({
    prompt: gamePromptSchema.optional(),
    options: gameOptionsSchema.optional(),
    correctIndex: correctIndexSchema.optional(),
    durationSeconds: durationSecondsSchema.optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "Provide at least one question field",
  });

export const reorderGameQuestionsSchema = z.object({
  questionIds: z.array(uuidSchema).min(1, "Provide the full ordered list"),
});

export const gameQuestionIdParamsSchema = z.object({ id: uuidSchema });

export const gameRoundIdParamsSchema = z.object({ roundId: uuidSchema });

export const submitGameAnswerSchema = z.object({
  roundId: uuidSchema,
  selectedIndex: z
    .number()
    .int()
    .min(0)
    .max(GAME_OPTION_COUNT - 1),
});

export type CreateGameQuestionRequest = z.infer<
  typeof createGameQuestionSchema
>;
export type UpdateGameQuestionRequest = z.infer<
  typeof updateGameQuestionSchema
>;
export type ReorderGameQuestionsRequest = z.infer<
  typeof reorderGameQuestionsSchema
>;
export type SubmitGameAnswerRequest = z.infer<typeof submitGameAnswerSchema>;

/** Full question as only an administrator may see it — it carries `correctIndex`. */
export interface GameQuestionDto {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  durationSeconds: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  lastPushedAt: string | null;
  timesPushed: number;
}

/**
 * The live payload broadcast to participants.
 *
 * It deliberately omits `correctIndex`: anything sent here is readable in the
 * browser devtools of all 150 participants the instant it is pushed. The answer
 * is revealed to everyone together in `GameRoundEndedDto` once time is up.
 *
 * `serverNow` is included so a client can derive the true remaining time
 * without trusting its own wall clock, which in a workshop hall is routinely
 * minutes out of sync.
 */
export interface LiveGameRoundDto {
  roundId: string;
  questionId: string;
  prompt: string;
  options: string[];
  durationSeconds: number;
  startedAt: string;
  endsAt: string;
  serverNow: string;
}

export interface GameRoundStandingDto {
  rank: number;
  userId: string;
  name: string | null;
  githubUsername: string | null;
  avatarUrl: string | null;
  responseMs: number;
}

/** Broadcast when a round's timer expires. This is where the answer is revealed. */
export interface GameRoundEndedDto {
  roundId: string;
  correctIndex: number;
  totalAnswers: number;
  correctAnswers: number;
  fastest: GameRoundStandingDto[];
}

/**
 * Handed back on a successful submission. It says nothing about correctness —
 * telling an early answerer they were right would let the answer spread by
 * word of mouth while everyone else is still deciding.
 */
export interface GameAnswerReceiptDto {
  roundId: string;
  selectedIndex: number;
  responseMs: number;
}

export interface GameLeaderboardEntryDto {
  rank: number;
  userId: string;
  name: string | null;
  githubUsername: string | null;
  avatarUrl: string | null;
  correctAnswers: number;
  roundsAnswered: number;
  totalResponseMs: number;
  averageResponseMs: number;
}

export interface GameRoundSummaryDto {
  roundId: string;
  questionId: string | null;
  prompt: string;
  options: string[];
  correctIndex: number;
  durationSeconds: number;
  startedAt: string;
  endsAt: string;
  totalAnswers: number;
  correctAnswers: number;
  fastest: GameRoundStandingDto[];
}

/** Server-Sent Events emitted on `GET /api/game/stream`. */
export const GAME_STREAM_EVENTS = {
  roundStart: "round:start",
  roundEnd: "round:end",
} as const;
