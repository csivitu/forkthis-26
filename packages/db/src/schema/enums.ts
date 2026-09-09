import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);

export const userRole = {
  Student: "student",
  Admin: "admin",
} as const;

export const issueDifficultyEnum = pgEnum("issue_difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const issueStatusEnum = pgEnum("issue_status", ["open", "solved","closed"]);

export const pullRequestStatusEnum = pgEnum("pull_request_status", [
  "open",
  "merged",
  "closed_unmerged",
  "rejected",
]);

export const pointTransactionReasonEnum = pgEnum("point_transaction_reason", [
  "auto_merge",
  "admin_manual",
]);

export const syncLogStatusEnum = pgEnum("sync_log_status", [
  "success",
  "failed",
]);