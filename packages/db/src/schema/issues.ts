import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { repositories } from "./repositories.js";
import { issueDifficultyEnum, issueStatusEnum } from "./enums.js";

export const issues = pgTable(
  "issues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    githubIssueNumber: integer("github_issue_number").notNull(),
    title: text("title").notNull(),
    difficulty: issueDifficultyEnum("difficulty").notNull(),
    points: integer("points").notNull(),
    status: issueStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    // Bumped every time the poller re-fetches this issue from GitHub, so you
    // can tell a stale row from one that's simply never changed.
    lastSyncedAt: timestamp("last_synced_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("issues_repository_issue_number_unique").on(
      table.repositoryId,
      table.githubIssueNumber,
    ),
  ],
);

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
