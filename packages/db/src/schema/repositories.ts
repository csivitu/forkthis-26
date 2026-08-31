import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const repositories = pgTable("repositories", {
  id: uuid("id").primaryKey().defaultRandom(),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  githubRepoId: text("github_repo_id").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
  // Storing per-resource ETags directly on the repo row was the source of the
  // shared-state bug — keep these two separate so issue polling and PR
  // polling never clobber each other's cursor.
  lastIssuesEtag: text("last_issues_etag"),
  lastPrsEtag: text("last_prs_etag"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;