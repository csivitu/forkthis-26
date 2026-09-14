import { z } from "zod";

export const issueDifficulties = ["easy", "medium", "hard"] as const;
export const issueStatuses = ["open", "solved", "closed"] as const;
export const pullRequestStatuses = [
  "open",
  "merged",
  "closed_unmerged",
  "rejected",
] as const;
export const pointReasons = ["auto_merge", "admin_manual"] as const;
export const syncLogStatuses = ["success", "failed"] as const;
export const memberRoles = ["student", "admin"] as const;

export type IssueDifficulty = (typeof issueDifficulties)[number];
export type IssueStatus = (typeof issueStatuses)[number];
export type PullRequestStatus = (typeof pullRequestStatuses)[number];
export type PointReason = (typeof pointReasons)[number];
export type SyncLogStatus = (typeof syncLogStatuses)[number];
export type MemberRole = (typeof memberRoles)[number];

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  success: false;
  error: { code: string; message: string; details?: object };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

const uuid = z.string().uuid();
const optionalSearch = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).optional(),
);

const isGithubRepositoryUrl = (value: string): boolean => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  const parts = url.pathname.split("/").filter(Boolean);
  return (
    ["github.com", "www.github.com"].includes(url.hostname) &&
    parts.length === 2
  );
};

export const githubRepositoryUrlSchema = z
  .string()
  .trim()
  .url()
  .refine(isGithubRepositoryUrl, "Enter a valid GitHub repository URL");

export const createRepositorySchema = z.object({
  repositoryUrl: githubRepositoryUrlSchema,
  techStack: z.string().trim().nullable().optional(),
});

export const updateRepositorySchema = z
  .object({
    repositoryUrl: githubRepositoryUrlSchema.optional(),
    techStack: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), {
    message: "Provide at least one repository field",
  });

export const issuesQuerySchema = paginationQuerySchema.extend({
  repositoryId: uuid.optional(),
  search: optionalSearch,
  difficulty: z.enum(issueDifficulties).optional(),
  status: z.enum(issueStatuses).optional(),
});

export const updateIssueSchema = z.object({
  points: z.number().int().min(0),
});

export const pullRequestsQuerySchema = paginationQuerySchema.extend({
  repositoryId: uuid.optional(),
  status: z.enum(pullRequestStatuses).optional(),
});

export const syncLogsQuerySchema = paginationQuerySchema.extend({
  repositoryId: uuid.optional(),
  status: z.enum(syncLogStatuses).optional(),
});

export const membersQuerySchema = paginationQuerySchema.extend({
  search: optionalSearch,
  role: z.enum(memberRoles).optional(),
});

export const addAdminSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const transactionsQuerySchema = paginationQuerySchema.extend({
  memberId: uuid.optional(),
  issueId: uuid.optional(),
  repositoryId: uuid.optional(),
  reason: z.enum(pointReasons).optional(),
  from: z.union([z.iso.date(), z.iso.datetime()]).optional(),
  to: z.union([z.iso.date(), z.iso.datetime()]).optional(),
});

export const adjustPointsSchema = z.object({
  userId: uuid,
  issueId: uuid,
  points: z
    .number()
    .int()
    .refine((points) => points !== 0, "points must be non-zero"),
  note: z.string().trim().min(3).max(500),
});

export const participantsQuerySchema = paginationQuerySchema.extend({
  search: optionalSearch,
});
export const createParticipantSchema = z.object({
  regno: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^\d{2}[A-Z]{3}\d{4}$/, "Invalid registration number"),
});

export type CreateRepositoryRequest = z.infer<typeof createRepositorySchema>;
export type UpdateRepositoryRequest = z.infer<typeof updateRepositorySchema>;
export type IssuesQuery = z.infer<typeof issuesQuerySchema>;
export type UpdateIssueRequest = z.infer<typeof updateIssueSchema>;
export type PullRequestsQuery = z.infer<typeof pullRequestsQuerySchema>;
export type SyncLogsQuery = z.infer<typeof syncLogsQuerySchema>;
export type MembersQuery = z.infer<typeof membersQuerySchema>;
export type AddAdminRequest = z.infer<typeof addAdminSchema>;
export type TransactionsQuery = z.infer<typeof transactionsQuerySchema>;
export type AdjustPointsRequest = z.infer<typeof adjustPointsSchema>;
export type ParticipantsQuery = z.infer<typeof participantsQuerySchema>;
export type CreateParticipantRequest = z.infer<typeof createParticipantSchema>;

export interface RepositoryDto {
  id: string;
  owner: string;
  name: string;
  githubRepoId: string;
  techStack: string | null;
  isActive: boolean;
  lastPolledAt: string | null;
  createdAt: string;
  issueCount: number;
}

export interface IssueDto {
  id: string;
  repositoryId: string;
  repository: string;
  githubIssueNumber: number;
  title: string;
  difficulty: IssueDifficulty;
  points: number;
  status: IssueStatus;
  lastSyncedAt: string;
}

export interface PullRequestDto {
  id: string;
  repositoryId: string;
  repository: string;
  githubPrNumber: number;
  issueId: string | null;
  issueNumber: number | null;
  userId: string | null;
  participantName: string | null;
  githubAuthorUsername: string;
  status: PullRequestStatus;
  isMergeable: boolean | null;
  openedAt: string;
  updatedAt: string;
  mergedAt: string | null;
}

export interface SyncLogDto {
  id: string;
  repositoryId: string;
  repository: string;
  status: SyncLogStatus;
  issuesFetched: number;
  prsFetched: number;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
}

export interface MemberDto {
  id: string;
  name: string | null;
  email: string;
  githubUsername: string | null;
  avatarUrl: string | null;
  role: MemberRole;
  totalPoints: number;
}

export interface PointTransactionDto {
  id: string;
  userId: string | null;
  memberName: string | null;
  issueId: string | null;
  issueNumber: number | null;
  repositoryId: string | null;
  repository: string | null;
  points: number;
  reason: PointReason;
  note: string | null;
  awardedByName: string | null;
  createdAt: string;
}

export interface ParticipantDto {
  id: number;
  regno: string;
  createdAt: string;
}

export interface CsvInvalidRow {
  line: number;
  value: string;
  reason: string;
}

export interface CsvImportResult {
  added: number;
  alreadyExisted: number;
  invalid: CsvInvalidRow[];
}

export interface OverviewStatsDto {
  totalUsers: number;
  linkedGithubUsers: number;
  totalRepositories: number;
  activeRepositories: number;
  totalIssues: number;
  openIssues: number;
  solvedIssues: number;
  closedIssues: number;
  issuesByDifficulty: Record<IssueDifficulty, number>;
  totalPullRequests: number;
  mergedPullRequests: number;
  totalPointsAwarded: number;
}
