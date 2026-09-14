import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";
import { pullRequests } from "./pull-request.js";
import { issues } from "./issues.js";
import { pointTransactionReasonEnum } from "./enums.js";

export const pointTransactions = pgTable(
  "point_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    pullRequestId: uuid("pull_request_id").references(
      () => pullRequests.id,
      { onDelete: "set null" },
    ),
    issueId: uuid("issue_id").references(() => issues.id, {
      onDelete: "set null",
    }),
    points: integer("points").notNull(),
    reason: pointTransactionReasonEnum("reason").notNull(),
    // Nullable: only set when reason = 'admin_manual'.
    awardedBy: uuid("awarded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "point_transactions_manual_note_check",
      sql`${table.reason} <> 'admin_manual' or (${table.note} is not null and length(trim(${table.note})) > 0)`,
    ),
    // Enforces "at most one auto_merge payout per PR" without blocking
    // admin_manual rows (or nulls) from repeating on the same PR.
    uniqueIndex("point_transactions_auto_merge_pr_unique")
      .on(table.pullRequestId)
      .where(sql`${table.reason} = 'auto_merge'`),
  ],
);

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type NewPointTransaction = typeof pointTransactions.$inferInsert;
