import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";
import { repositories } from "./repositories.js";
import { syncLogStatusEnum } from "./enums.js";

export const syncLogs = pgTable("sync_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  repositoryId: uuid("repository_id")
    .notNull()
    .references(() => repositories.id, { onDelete: "cascade" }),
  status: syncLogStatusEnum("status").notNull(),
  issuesFetched: integer("issues_fetched").notNull().default(0),
  prsFetched: integer("prs_fetched").notNull().default(0),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  completedAt: timestamp("completed_at", {
    withTimezone: true,
    mode: "string",
  }),
});

export type SyncLog = typeof syncLogs.$inferSelect;
export type NewSyncLog = typeof syncLogs.$inferInsert;
