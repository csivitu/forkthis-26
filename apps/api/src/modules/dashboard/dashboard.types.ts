import type { Repository, Issue, PointTransaction } from "@repo/db";

export type RepositoryRow = Pick<Repository, "id" | "owner" | "name" | "githubRepoId" | "techStack" | "isActive" | "createdAt"> & { issueCount: number };

export type IssueRow = Pick<Issue, "id" | "repositoryId" | "githubIssueNumber" | "title" | "difficulty" | "points" | "status" | "createdAt">;

export type PointTransactionRow = Pick<PointTransaction, "id" | "userId" | "issueId" | "pullRequestId" | "points" | "reason" | "createdAt">;

export interface IssuesByRepositoryResponse {
  issues: IssueRow[];
  issuesSolved: number;
}

export interface PointTransactionsSummary {
  transactions: PointTransactionRow[];
  totalPoints: number;
  issuesSolved: number;
  maxPoints: number;
  totalIssues: number;
}
