import { z } from "zod";
import type { User, Repository, Issue, PointTransaction } from "@repo/db";
import { uuidField, nullableTextField, paginationQuery, uuidParamsSchema } from "../../utils/schema.util";

export const createRepoSchema = {
  body: z.object({
    owner: z.string().trim().min(1, "owner is required"),
    name: z.string().trim().min(1, "name is required"),
    githubRepoId: z.string().trim().min(1, "githubRepoId is required"),
    techStack: nullableTextField.optional(),
  }),
};
export type CreateRepoBody = z.infer<typeof createRepoSchema.body>;

export const updateRepoSchema = {
  params: z.object({ id: uuidField("id") }),
  body: z
    .object({
      owner: z.string().trim().min(1).optional(),
      name: z.string().trim().min(1).optional(),
      techStack: nullableTextField.optional(),
      isActive: z.boolean().optional(),
    })
    .refine(
      (data) =>
        data.owner !== undefined ||
        data.name !== undefined ||
        data.techStack !== undefined ||
        data.isActive !== undefined,
      { message: "Provide at least one of: owner, name, techStack, isActive" },
    ),
};
export type UpdateRepoBody = z.infer<typeof updateRepoSchema.body>;
export type UpdateRepoParams = z.infer<typeof updateRepoSchema.params>;

export const deleteRepoSchema = uuidParamsSchema;
export type DeleteRepoParams = z.infer<typeof deleteRepoSchema.params>;

export const listIssuesQuerySchema = {
  query: z.object({ repositoryId: uuidField("repositoryId") }),
};
export type AdminIssuesQuery = z.infer<typeof listIssuesQuerySchema.query>;

export const awardPointsSchema = {
  body: z.object({
    userId: uuidField("userId"),
    issueId: uuidField("issueId"),
    points: z.number().int().positive("points must be a positive integer"),
  }),
};
export type AwardPointsBody = z.infer<typeof awardPointsSchema.body>;
export type AwardPointsEntry = PointTransaction;

export const listMembersQuerySchema = {
  query: paginationQuery.extend({
    search: z.string().trim().min(1).optional(),
  }),
};
export type AdminMembersQuery = z.infer<typeof listMembersQuerySchema.query>;

export type AdminRepositoryEntry = Pick<Repository, "id" | "owner" | "name" | "isActive" | "githubRepoId" | "techStack" | "createdAt"> & { issueCount: number };
export type AdminIssueEntry = Pick<Issue, "id" | "repositoryId" | "githubIssueNumber" | "title" | "difficulty" | "points" | "status">;

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

export type AdminMemberEntry = Pick<User, "id" | "name" | "email" | "githubUsername" | "avatarUrl"> & {
    totalPoints: number;
};
