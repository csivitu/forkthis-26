import type { Repository, Issue, PointTransaction } from "@repo/db";

export type RepositoryRow = Pick<Repository, "id" | "owner" | "name" | "githubRepoId" | "isActive" | "createdAt">;

export type IssueRow = Pick<Issue, "id" | "repositoryId" | "githubIssueNumber" | "title" | "difficulty" | "points" | "status" | "createdAt">;

export type PointTransactionRow = Pick<PointTransaction, "id" | "userId" | "issueId" | "pullRequestId" | "points" | "reason" | "createdAt">;

export interface IssuesByRepositoryResponse {
  issues: IssueRow[];
  totalGloballySolvedIssues: number;
}

export interface PointTransactionsSummary {
  transactions: PointTransactionRow[];
  totalPoints: number;
  totalGloballySolvedIssues: number;
}
