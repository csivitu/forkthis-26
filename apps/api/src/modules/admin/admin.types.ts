import type { Repository, Issue, PointTransaction } from "@repo/db";

export interface AdminIssuesQuery{
    repositoryId?: string;
}

export type AdminRepositoryEntry = Pick<Repository, "id" | "owner" | "name" | "isActive">;

export type AdminIssueEntry = Pick<Issue, "id" | "repositoryId" | "githubIssueNumber" | "title" | "difficulty" | "points" | "status">;

export interface AwardPointsBody {
    userId: string;
    issueId: string;
    points: number;
}

export type AwardPointsEntry = PointTransaction;