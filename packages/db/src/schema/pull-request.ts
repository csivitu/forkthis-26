import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { repositories } from "./repositories.js";
import { issues } from "./issues.js";
import { users } from "./users.js";
import { pullRequestStatusEnum } from "./enums.js";

export const pullRequests = pgTable(
  "pull_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    githubPrNumber: integer("github_pr_number").notNull(),
    issueId: uuid("issue_id").references(() => issues.id, {
      onDelete: "set null",
    }),
    // Nullable: a PR can come from a GitHub user who hasn't registered on
    // the platform yet. githubAuthorUsername below is the raw fallback
    // for that case.
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    githubAuthorUsername: text("github_author_username").notNull(),
    headSha: text("head_sha").notNull(),
    status: pullRequestStatusEnum("status").notNull().default("open"),
    // Nullable because GitHub computes mergeability asynchronously — null
    // means "unknown yet", not false.
    isMergeable: boolean("is_mergeable"),
    reviewedBy: text("reviewed_by"),
    openedAt: timestamp("opened_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    mergedAt: timestamp("merged_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    unique("pull_requests_repository_pr_number_unique").on(
      table.repositoryId,
      table.githubPrNumber,
    ),
  ],
);

export type PullRequest = typeof pullRequests.$inferSelect;
export type NewPullRequest = typeof pullRequests.$inferInsert;
