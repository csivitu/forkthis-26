import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

/**
 * The administrator's reusable question bank for Fastest Fingers First.
 *
 * `options` is jsonb rather than four columns so the option count lives in one
 * check constraint instead of being spread across the schema, the API and the
 * two frontends.
 */
export const gameQuestions = pgTable(
  "game_questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    prompt: text("prompt").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correctIndex: integer("correct_index").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    position: integer("position").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    updatedBy: uuid("updated_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [
    index("game_questions_position_idx").on(table.position),
    index("game_questions_created_by_idx").on(table.createdBy),
    check(
      "game_questions_prompt_length_check",
      sql`char_length(trim(${table.prompt})) between 1 and 500`,
    ),
    check(
      "game_questions_options_check",
      sql`jsonb_typeof(${table.options}) = 'array' and jsonb_array_length(${table.options}) = 4`,
    ),
    check(
      "game_questions_correct_index_check",
      sql`${table.correctIndex} between 0 and 3`,
    ),
    check(
      "game_questions_duration_check",
      sql`${table.durationSeconds} between 5 and 300`,
    ),
    check("game_questions_position_check", sql`${table.position} >= 0`),
  ],
);

/**
 * One live push of a question.
 *
 * The prompt, options and correct answer are snapshotted here rather than read
 * through `questionId`, following the same reasoning as `resource_publications`:
 * editing or deleting a question afterwards must never rewrite what was
 * actually asked, or silently invalidate the answers already recorded against
 * it. That snapshot is also why `questionId` can be `set null` — the round
 * survives the question's deletion intact.
 */
export const gameRounds = pgTable(
  "game_rounds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    questionId: uuid("question_id").references(() => gameQuestions.id, {
      onDelete: "set null",
    }),
    prompt: text("prompt").notNull(),
    options: jsonb("options").$type<string[]>().notNull(),
    correctIndex: integer("correct_index").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true, mode: "string" }).notNull(),
    pushedBy: uuid("pushed_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
  },
  (table) => [
    index("game_rounds_started_at_idx").on(table.startedAt),
    index("game_rounds_question_id_idx").on(table.questionId),
    check(
      "game_rounds_options_check",
      sql`jsonb_typeof(${table.options}) = 'array' and jsonb_array_length(${table.options}) = 4`,
    ),
    check(
      "game_rounds_correct_index_check",
      sql`${table.correctIndex} between 0 and 3`,
    ),
    check("game_rounds_window_check", sql`${table.endsAt} > ${table.startedAt}`),
  ],
);

/**
 * A participant's single answer to a round.
 *
 * `userId` is `restrict`, not `cascade`: these rows are the game's scoring
 * record, and cascade-deleting a user would silently rewrite everyone else's
 * standings. The unique index on (round_id, user_id) is what makes the answer
 * endpoint safe to write as one `on conflict do nothing` statement — it is the
 * only thing preventing a double-submit from counting twice.
 */
export const gameAnswers = pgTable(
  "game_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roundId: uuid("round_id")
      .notNull()
      .references(() => gameRounds.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    selectedIndex: integer("selected_index").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    responseMs: integer("response_ms").notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("game_answers_round_user_unique").on(
      table.roundId,
      table.userId,
    ),
    index("game_answers_user_idx").on(table.userId),
    check(
      "game_answers_selected_index_check",
      sql`${table.selectedIndex} between 0 and 3`,
    ),
    check("game_answers_response_ms_check", sql`${table.responseMs} >= 0`),
  ],
);

export type GameQuestion = typeof gameQuestions.$inferSelect;
export type NewGameQuestion = typeof gameQuestions.$inferInsert;
export type GameRound = typeof gameRounds.$inferSelect;
export type NewGameRound = typeof gameRounds.$inferInsert;
export type GameAnswer = typeof gameAnswers.$inferSelect;
export type NewGameAnswer = typeof gameAnswers.$inferInsert;
