import type { User, Repository, Issue, PointTransaction } from "@repo/db";

export interface AdminIssuesQuery{
    repositoryId?: string;
}

export type AdminRepositoryEntry = Pick<Repository, "id" | "owner" | "name" | "isActive" | "githubRepoId" | "techStack" | "createdAt"> & { issueCount: number };

export type AdminIssueEntry = Pick<Issue, "id" | "repositoryId" | "githubIssueNumber" | "title" | "difficulty" | "points" | "status">;

export interface AwardPointsBody {
    userId: string;
    issueId: string;
    points: number;
}

export type AwardPointsEntry = PointTransaction;

export interface CreateRepoBody {
    owner: string;
    name: string;
    githubRepoId: string;
    techStack?: string;
}

export interface UpdateRepoBody {
    owner?: string;
    name?: string;
    techStack?: string | null;
    isActive?: boolean;
}

export interface UpdateRepoParams {
    id: string;
}
export interface AdminOverviewStats {
    totalUsers: number;
    linkedGithubUsers: number;
    totalRepositories: number;
    activeRepositories: number;
    totalIssues: number;
    openIssues: number;
    solvedIssues: number;
    closedIssues: number;
    issuesByDifficulty: { easy: number; medium: number; hard: number };
    totalPullRequests: number;
    mergedPullRequests: number;
    totalPointsAwarded: number;
}

export interface AdminMembersQuery {
    limit?: string;
    page?: string;
    search?: string;
}

export type AdminMemberEntry = Pick<User, "id" | "name" | "email" | "githubUsername" | "avatarUrl"> & {
    totalPoints: number;
};
