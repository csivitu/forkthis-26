import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { repositories } from "./repositories.js";
import { issues } from "./issues.js";
import { pullRequests } from "./pull-request.js";
import { pointTransactions } from "./point-transactions.js";
import { syncLogs } from "./sync-logs.js";
import { sessions, accounts} from "./auth.js";

export const usersRelations = relations(users, ({ many }) => ({
  pullRequests: many(pullRequests),
  // Two distinct relations to point_transactions off the same table —
  // must be named explicitly or Drizzle can't disambiguate the two FKs.
  pointTransactionsReceived: many(pointTransactions, {
    relationName: "recipient",
  }),
  pointTransactionsAwarded: many(pointTransactions, {
    relationName: "awarder",
  }),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const repositoriesRelations = relations(repositories, ({ many }) => ({
  issues: many(issues),
  pullRequests: many(pullRequests),
  syncLogs: many(syncLogs),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  repository: one(repositories, {
    fields: [issues.repositoryId],
    references: [repositories.id],
  }),
  pullRequests: many(pullRequests),
  pointTransactions: many(pointTransactions),
}));

export const pullRequestsRelations = relations(
  pullRequests,
  ({ one, many }) => ({
    repository: one(repositories, {
      fields: [pullRequests.repositoryId],
      references: [repositories.id],
    }),
    issue: one(issues, {
      fields: [pullRequests.issueId],
      references: [issues.id],
    }),
    user: one(users, {
      fields: [pullRequests.userId],
      references: [users.id],
    }),
    pointTransactions: many(pointTransactions),
  }),
);

export const pointTransactionsRelations = relations(
  pointTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [pointTransactions.userId],
      references: [users.id],
      relationName: "recipient",
    }),
    awardedByUser: one(users, {
      fields: [pointTransactions.awardedBy],
      references: [users.id],
      relationName: "awarder",
    }),
    pullRequest: one(pullRequests, {
      fields: [pointTransactions.pullRequestId],
      references: [pullRequests.id],
    }),
    issue: one(issues, {
      fields: [pointTransactions.issueId],
      references: [issues.id],
    }),
  }),
);

export const syncLogsRelations = relations(syncLogs, ({ one }) => ({
  repository: one(repositories, {
    fields: [syncLogs.repositoryId],
    references: [repositories.id],
  }),
}));