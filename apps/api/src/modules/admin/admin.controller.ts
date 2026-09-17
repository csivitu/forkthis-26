import type { NextFunction, Response } from "express";
import type {
  AddAdminRequest,
  AdjustPointsRequest,
  CreateParticipantRequest,
  CreateRepositoryRequest,
  IssueDto,
  IssuesQuery,
  MemberDto,
  MembersQuery,
  OverviewStatsDto,
  ParticipantDto,
  ParticipantsQuery,
  PointTransactionDto,
  PullRequestDto,
  PullRequestsQuery,
  RepositoryDto,
  SyncLogDto,
  SyncLogsQuery,
  TransactionsQuery,
  UpdateIssueRequest,
  UpdateRepositoryRequest,
} from "@repo/admin-contracts";
import {
  db,
  issues,
  pointTransactions,
  pullRequests,
  repositories,
  syncLogs,
  users,
  userRole,
} from "@repo/db";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  like,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { ApiError } from "../../utils/api-error";
import { responseCreated, responseOk } from "../../utils/api-response";
import logger from "../../utils/logger.util";
import { participantsDb } from "../../../../../packages/db/sqlite/client.ts";
import { participants } from "../../../../../packages/db/sqlite/schema.ts";
import { CsvParseError, parseParticipantsCsv } from "./csv-parser";
import { validateGithubRepository } from "./github-repository";
import type { IdParams } from "./admin.types";

const asIso = (value: Date): string => value.toISOString();
const asNullableIso = (value: Date | null): string | null =>
  value ? asIso(value) : null;
const repositoryLabel = (owner: string, name: string): string =>
  `${owner}/${name}`;
const endDate = (value: string): Date =>
  new Date(value.includes("T") ? value : `${value}T23:59:59.999Z`);

export async function listRepositories(
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const rows = await db
      .select({
        id: repositories.id,
        owner: repositories.owner,
        name: repositories.name,
        githubRepoId: repositories.githubRepoId,
        techStack: repositories.techStack,
        isActive: repositories.isActive,
        lastPolledAt: repositories.lastPolledAt,
        createdAt: repositories.createdAt,
        issueCount: count(issues.id),
      })
      .from(repositories)
      .leftJoin(issues, eq(issues.repositoryId, repositories.id))
      .groupBy(repositories.id)
      .orderBy(asc(repositories.owner), asc(repositories.name));
    const data: RepositoryDto[] = rows.map((row) => ({
      ...row,
      lastPolledAt: asNullableIso(row.lastPolledAt),
      createdAt: asIso(row.createdAt),
      issueCount: Number(row.issueCount),
    }));
    responseOk(res, data, 200, {
      page: 1,
      limit: data.length || 25,
      total: data.length,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to list repositories");
    next(error);
  }
}

export async function createRepo(
  req: AuthRequest<object, object, CreateRepositoryRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const githubRepository = await validateGithubRepository(
      req.body.repositoryUrl,
    );
    const [existing] = await db
      .select({ id: repositories.id })
      .from(repositories)
      .where(eq(repositories.githubRepoId, githubRepository.githubRepoId));
    if (existing)
      throw new ApiError(
        409,
        "REPOSITORY_EXISTS",
        `Repository '${githubRepository.owner}/${githubRepository.name}' is already registered`,
      );
    const [repo] = await db
      .insert(repositories)
      .values({ ...githubRepository, techStack: req.body.techStack })
      .returning();
    if (!repo)
      throw new ApiError(500, "INSERT_FAILED", "Failed to create repository");
    logger.info({ repoId: repo.id }, "Admin created repository");
    responseCreated(res, repo);
  } catch (error) {
    logger.error({ err: error, body: req.body }, "Failed to create repository");
    next(error);
  }
}

export async function updateRepo(
  req: AuthRequest<IdParams, object, UpdateRepositoryRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { repositoryUrl, ...fields } = req.body;
    const githubRepository = repositoryUrl
      ? await validateGithubRepository(repositoryUrl)
      : null;
    if (githubRepository) {
      const [existing] = await db
        .select({ id: repositories.id })
        .from(repositories)
        .where(eq(repositories.githubRepoId, githubRepository.githubRepoId));
      if (existing && existing.id !== req.params.id)
        throw new ApiError(
          409,
          "REPOSITORY_EXISTS",
          `Repository '${githubRepository.owner}/${githubRepository.name}' is already registered`,
        );
    }
    const [updated] = await db
      .update(repositories)
      .set({ ...fields, ...(githubRepository ?? {}) })
      .where(eq(repositories.id, req.params.id))
      .returning();
    if (!updated)
      throw new ApiError(
        404,
        "REPOSITORY_NOT_FOUND",
        `Repository '${req.params.id}' was not found`,
      );
    logger.info(
      { repoId: req.params.id, patch: req.body },
      "Admin updated repository",
    );
    responseOk(res, updated);
  } catch (error) {
    logger.error(
      { err: error, repoId: req.params.id },
      "Failed to update repository",
    );
    next(error);
  }
}

export async function deleteRepo(
  req: AuthRequest<IdParams>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [deleted] = await db
      .delete(repositories)
      .where(eq(repositories.id, req.params.id))
      .returning({ name: repositories.name });
    if (!deleted)
      throw new ApiError(
        404,
        "REPOSITORY_NOT_FOUND",
        `Repository '${req.params.id}' was not found`,
      );
    logger.info({ repoId: req.params.id }, "Admin deleted repository");
    responseOk(res, { message: `Repository '${deleted.name}' deleted` });
  } catch (error) {
    logger.error(
      { err: error, repoId: req.params.id },
      "Failed to delete repository",
    );
    next(error);
  }
}

export async function listIssues(
  req: AuthRequest<object, object, object, IssuesQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { page, limit, repositoryId, search, difficulty, status } = req.query;
  const conditions: SQL[] = [];
  if (repositoryId) conditions.push(eq(issues.repositoryId, repositoryId));
  if (search) conditions.push(ilike(issues.title, `%${search}%`));
  if (difficulty) conditions.push(eq(issues.difficulty, difficulty));
  if (status) conditions.push(eq(issues.status, status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  try {
    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: issues.id,
          repositoryId: issues.repositoryId,
          owner: repositories.owner,
          repoName: repositories.name,
          githubIssueNumber: issues.githubIssueNumber,
          title: issues.title,
          difficulty: issues.difficulty,
          points: issues.points,
          status: issues.status,
          lastSyncedAt: issues.lastSyncedAt,
        })
        .from(issues)
        .innerJoin(repositories, eq(repositories.id, issues.repositoryId))
        .where(where)
        .orderBy(desc(issues.lastSyncedAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(issues).where(where),
    ]);
    const data: IssueDto[] = rows.map(({ owner, repoName, ...row }) => ({
      ...row,
      repository: repositoryLabel(owner, repoName),
      lastSyncedAt: asIso(row.lastSyncedAt),
    }));
    responseOk(res, data, 200, {
      page,
      limit,
      total: Number(totalRows[0]?.total ?? 0),
    });
  } catch (error) {
    logger.error({ err: error, query: req.query }, "Failed to list issues");
    next(error);
  }
}

export async function updateIssue(
  req: AuthRequest<IdParams, object, UpdateIssueRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [updated] = await db
      .update(issues)
      .set({ points: req.body.points })
      .where(eq(issues.id, req.params.id))
      .returning();
    if (!updated)
      throw new ApiError(
        404,
        "ISSUE_NOT_FOUND",
        `Issue '${req.params.id}' was not found`,
      );
    logger.info(
      { issueId: req.params.id, points: req.body.points },
      "Admin updated issue base points",
    );
    responseOk(res, updated);
  } catch (error) {
    logger.error(
      { err: error, issueId: req.params.id },
      "Failed to update issue points",
    );
    next(error);
  }
}

export async function listPullRequests(
  req: AuthRequest<object, object, object, PullRequestsQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { page, limit, repositoryId, status } = req.query;
  const conditions: SQL[] = [];
  if (repositoryId)
    conditions.push(eq(pullRequests.repositoryId, repositoryId));
  if (status) conditions.push(eq(pullRequests.status, status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  try {
    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: pullRequests.id,
          repositoryId: pullRequests.repositoryId,
          owner: repositories.owner,
          repoName: repositories.name,
          githubPrNumber: pullRequests.githubPrNumber,
          issueId: pullRequests.issueId,
          issueNumber: issues.githubIssueNumber,
          userId: pullRequests.userId,
          participantName: users.name,
          githubAuthorUsername: pullRequests.githubAuthorUsername,
          status: pullRequests.status,
          isMergeable: pullRequests.isMergeable,
          openedAt: pullRequests.openedAt,
          updatedAt: pullRequests.updatedAt,
          mergedAt: pullRequests.mergedAt,
        })
        .from(pullRequests)
        .innerJoin(repositories, eq(repositories.id, pullRequests.repositoryId))
        .leftJoin(issues, eq(issues.id, pullRequests.issueId))
        .leftJoin(users, eq(users.id, pullRequests.userId))
        .where(where)
        .orderBy(desc(pullRequests.updatedAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(pullRequests).where(where),
    ]);
    const data: PullRequestDto[] = rows.map(({ owner, repoName, ...row }) => ({
      ...row,
      repository: repositoryLabel(owner, repoName),
      openedAt: asIso(row.openedAt),
      updatedAt: asIso(row.updatedAt),
      mergedAt: asNullableIso(row.mergedAt),
    }));
    responseOk(res, data, 200, {
      page,
      limit,
      total: Number(totalRows[0]?.total ?? 0),
    });
  } catch (error) {
    logger.error(
      { err: error, query: req.query },
      "Failed to list pull requests",
    );
    next(error);
  }
}

export async function listSyncLogs(
  req: AuthRequest<object, object, object, SyncLogsQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { page, limit, repositoryId, status } = req.query;
  const conditions: SQL[] = [];
  if (repositoryId) conditions.push(eq(syncLogs.repositoryId, repositoryId));
  if (status) conditions.push(eq(syncLogs.status, status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  try {
    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: syncLogs.id,
          repositoryId: syncLogs.repositoryId,
          owner: repositories.owner,
          repoName: repositories.name,
          status: syncLogs.status,
          issuesFetched: syncLogs.issuesFetched,
          prsFetched: syncLogs.prsFetched,
          errorMessage: syncLogs.errorMessage,
          startedAt: syncLogs.startedAt,
          completedAt: syncLogs.completedAt,
        })
        .from(syncLogs)
        .innerJoin(repositories, eq(repositories.id, syncLogs.repositoryId))
        .where(where)
        .orderBy(desc(syncLogs.startedAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(syncLogs).where(where),
    ]);
    const data: SyncLogDto[] = rows.map(({ owner, repoName, ...row }) => ({
      ...row,
      repository: repositoryLabel(owner, repoName),
      startedAt: asIso(row.startedAt),
      completedAt: asNullableIso(row.completedAt),
      durationMs: row.completedAt
        ? row.completedAt.getTime() - row.startedAt.getTime()
        : null,
    }));
    responseOk(res, data, 200, {
      page,
      limit,
      total: Number(totalRows[0]?.total ?? 0),
    });
  } catch (error) {
    logger.error({ err: error, query: req.query }, "Failed to list sync logs");
    next(error);
  }
}

export async function listMembers(
  req: AuthRequest<object, object, object, MembersQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { page, limit, search, role } = req.query;
  const conditions: SQL[] = [];
  if (search) {
    const searchCondition = or(
      ilike(users.name, `%${search}%`),
      ilike(users.email, `%${search}%`),
      ilike(users.githubUsername, `%${search}%`),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  if (role) conditions.push(eq(users.role, role));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  try {
    const totalPoints = sql<number>`coalesce(sum(${pointTransactions.points}), 0)`;
    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          githubUsername: users.githubUsername,
          avatarUrl: users.avatarUrl,
          role: users.role,
          totalPoints: totalPoints.as("total_points"),
        })
        .from(users)
        .leftJoin(pointTransactions, eq(pointTransactions.userId, users.id))
        .where(where)
        .groupBy(users.id)
        .orderBy(desc(totalPoints))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(users).where(where),
    ]);
    const data: MemberDto[] = rows.map((row) => ({
      ...row,
      totalPoints: Number(row.totalPoints),
    }));
    responseOk(res, data, 200, {
      page,
      limit,
      total: Number(totalRows[0]?.total ?? 0),
    });
  } catch (error) {
    logger.error({ err: error, query: req.query }, "Failed to list members");
    next(error);
  }
}

export async function addAdmin(
  req: AuthRequest<object, object, AddAdminRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [member] = await db
      .select({ id: users.id, email: users.email, role: users.role })
      .from(users)
      .where(sql`lower(${users.email}) = ${req.body.email}`);
    if (!member)
      throw new ApiError(
        404,
        "MEMBER_NOT_FOUND",
        `No member exists with email '${req.body.email}'`,
      );
    if (member.role === userRole.Admin)
      throw new ApiError(
        409,
        "MEMBER_ALREADY_ADMIN",
        `Member '${member.email}' is already an administrator`,
      );
    const [promoted] = await db
      .update(users)
      .set({ role: userRole.Admin })
      .where(eq(users.id, member.id))
      .returning({ id: users.id, email: users.email, role: users.role });
    if (!promoted)
      throw new ApiError(
        500,
        "PROMOTION_FAILED",
        `Failed to promote member '${member.email}'`,
      );
    logger.info(
      { memberId: member.id, promotedBy: req.user?.id },
      "Admin promoted member",
    );
    responseOk(res, promoted);
  } catch (error) {
    logger.error(
      { err: error, email: req.body.email, promotedBy: req.user?.id },
      "Failed to promote member",
    );
    next(error);
  }
}

export async function listPointTransactions(
  req: AuthRequest<object, object, object, TransactionsQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { page, limit, memberId, memberSearch, issueId, repositoryId, reason, sort } =
    req.query;
  const conditions: SQL[] = [];
  if (memberId) conditions.push(eq(pointTransactions.userId, memberId));
  if (memberSearch) {
    const searchCondition = or(
      ilike(users.name, `%${memberSearch}%`),
      ilike(users.githubUsername, `%${memberSearch}%`),
      ilike(users.email, `%${memberSearch}%`),
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  if (issueId) conditions.push(eq(pointTransactions.issueId, issueId));
  if (repositoryId) conditions.push(eq(issues.repositoryId, repositoryId));
  if (reason) conditions.push(eq(pointTransactions.reason, reason));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const orderDir = sort === "oldest" ? asc(pointTransactions.createdAt) : desc(pointTransactions.createdAt);
  const awarders = alias(users, "awarders");
  try {
    const base = db
      .select({
        id: pointTransactions.id,
        userId: pointTransactions.userId,
        memberName: users.name,
        issueId: pointTransactions.issueId,
        issueNumber: issues.githubIssueNumber,
        repositoryId: repositories.id,
        owner: repositories.owner,
        repoName: repositories.name,
        points: pointTransactions.points,
        reason: pointTransactions.reason,
        note: pointTransactions.note,
        awardedByName: awarders.name,
        createdAt: pointTransactions.createdAt,
      })
      .from(pointTransactions)
      .leftJoin(users, eq(users.id, pointTransactions.userId))
      .leftJoin(awarders, eq(awarders.id, pointTransactions.awardedBy))
      .leftJoin(issues, eq(issues.id, pointTransactions.issueId))
      .leftJoin(repositories, eq(repositories.id, issues.repositoryId));
    const [rows, totalRows] = await Promise.all([
      base
        .where(where)
        .orderBy(orderDir)
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ total: count() })
        .from(pointTransactions)
        .leftJoin(users, eq(users.id, pointTransactions.userId))
        .leftJoin(issues, eq(issues.id, pointTransactions.issueId))
        .where(where),
    ]);
    const data: PointTransactionDto[] = rows.map(
      ({ owner, repoName, ...row }) => ({
        ...row,
        repository: owner && repoName ? repositoryLabel(owner, repoName) : null,
        createdAt: asIso(row.createdAt),
      }),
    );
    responseOk(res, data, 200, {
      page,
      limit,
      total: Number(totalRows[0]?.total ?? 0),
    });
  } catch (error) {
    logger.error(
      { err: error, query: req.query },
      "Failed to list point transactions",
    );
    next(error);
  }
}

export async function awardPoints(
  req: AuthRequest<object, object, AdjustPointsRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [memberRows, issueRows] = await Promise.all([
      db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, req.body.userId))
        .limit(1),
      db
        .select({ id: issues.id })
        .from(issues)
        .where(eq(issues.id, req.body.issueId))
        .limit(1),
    ]);
    if (!memberRows[0])
      throw new ApiError(
        404,
        "MEMBER_NOT_FOUND",
        `Member '${req.body.userId}' was not found`,
      );
    if (!issueRows[0])
      throw new ApiError(
        404,
        "ISSUE_NOT_FOUND",
        `Issue '${req.body.issueId}' was not found`,
      );
    const [transaction] = await db
      .insert(pointTransactions)
      .values({ ...req.body, reason: "admin_manual", awardedBy: req.user!.id })
      .returning();
    if (!transaction)
      throw new ApiError(
        500,
        "INSERT_FAILED",
        "Failed to create point adjustment",
      );
    logger.info(
      {
        transactionId: transaction.id,
        userId: req.body.userId,
        issueId: req.body.issueId,
        points: req.body.points,
        awardedBy: req.user!.id,
      },
      "Admin adjusted points",
    );
    responseCreated(res, transaction);
  } catch (error) {
    logger.error({ err: error, body: req.body }, "Failed to adjust points");
    next(error);
  }
}

export async function listParticipants(
  req: AuthRequest<object, object, object, ParticipantsQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { page, limit, search } = req.query;
  const where = search
    ? like(participants.email, `%${search.toLowerCase()}%`)
    : undefined;
  try {
    const rows = await participantsDb
      .select()
      .from(participants)
      .where(where)
      .orderBy(asc(participants.email))
      .limit(limit)
      .offset((page - 1) * limit);
    const totals = await participantsDb
      .select({ total: count() })
      .from(participants)
      .where(where);
    const data: ParticipantDto[] = rows.map((row) => ({
      ...row,
      createdAt: asIso(row.createdAt),
    }));
    responseOk(res, data, 200, {
      page,
      limit,
      total: Number(totals[0]?.total ?? 0),
    });
  } catch (error) {
    logger.error(
      { err: error, query: req.query },
      "Failed to list participants",
    );
    next(error);
  }
}

export async function createParticipant(
  req: AuthRequest<object, object, CreateParticipantRequest>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const existing = await participantsDb
      .select({ id: participants.id })
      .from(participants)
      .where(eq(participants.email, req.body.email))
      .get();
    if (existing)
      throw new ApiError(
        409,
        "PARTICIPANT_EXISTS",
        `Participant '${req.body.email}' already exists`,
      );
    const [created] = await participantsDb
      .insert(participants)
      .values({ email: req.body.email, createdAt: new Date() })
      .returning();
    if (!created)
      throw new ApiError(500, "INSERT_FAILED", "Failed to add participant");
    responseCreated(res, { ...created, createdAt: asIso(created.createdAt) });
  } catch (error) {
    logger.error(
      { err: error, email: req.body.email },
      "Failed to add participant",
    );
    next(error);
  }
}

export async function uploadParticipantsCsv(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file)
      throw new ApiError(400, "CSV_REQUIRED", "A CSV file is required");
    let parsed;
    try {
      parsed = parseParticipantsCsv(req.file.buffer.toString("utf8"));
    } catch (error) {
      if (error instanceof CsvParseError)
        throw new ApiError(400, "INVALID_CSV", error.message);
      throw error;
    }
    let added = 0;
    for (const entry of parsed.entries) {
      const created = participantsDb
        .insert(participants)
        .values({ email: entry.email, createdAt: new Date() })
        .onConflictDoNothing()
        .returning({ id: participants.id })
        .get();
      if (created) added += 1;
    }
    const alreadyExisted = parsed.entries.length - added;
    logger.info(
      { added, alreadyExisted, invalid: parsed.invalid.length },
      "Participants CSV uploaded",
    );
    responseCreated(res, { added, alreadyExisted, invalid: parsed.invalid });
  } catch (error) {
    next(error);
  }
}

export async function getOverviewStats(
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [
      userCounts,
      repoCounts,
      issueCounts,
      difficultyCounts,
      prCounts,
      pointsTotal,
    ] = await Promise.all([
      db
        .select({
          total: count(),
          linkedGithub: sql<number>`count(*) filter (where ${users.githubUsername} is not null)`,
        })
        .from(users),
      db
        .select({
          total: count(),
          active: sql<number>`count(*) filter (where ${repositories.isActive} = true)`,
        })
        .from(repositories),
      db
        .select({
          total: count(),
          open: sql<number>`count(*) filter (where ${issues.status} = 'open')`,
          solved: sql<number>`count(*) filter (where ${issues.status} = 'solved')`,
          closed: sql<number>`count(*) filter (where ${issues.status} = 'closed')`,
        })
        .from(issues),
      db
        .select({ difficulty: issues.difficulty, total: count() })
        .from(issues)
        .groupBy(issues.difficulty),
      db
        .select({
          total: count(),
          merged: sql<number>`count(*) filter (where ${pullRequests.status} = 'merged')`,
        })
        .from(pullRequests),
      db
        .select({
          total: sql<number>`coalesce(sum(${pointTransactions.points}), 0)`,
        })
        .from(pointTransactions),
    ]);
    const issuesByDifficulty = { easy: 0, medium: 0, hard: 0 };
    for (const row of difficultyCounts)
      issuesByDifficulty[row.difficulty] = Number(row.total);
    const stats: OverviewStatsDto = {
      totalUsers: Number(userCounts[0]?.total ?? 0),
      linkedGithubUsers: Number(userCounts[0]?.linkedGithub ?? 0),
      totalRepositories: Number(repoCounts[0]?.total ?? 0),
      activeRepositories: Number(repoCounts[0]?.active ?? 0),
      totalIssues: Number(issueCounts[0]?.total ?? 0),
      openIssues: Number(issueCounts[0]?.open ?? 0),
      solvedIssues: Number(issueCounts[0]?.solved ?? 0),
      closedIssues: Number(issueCounts[0]?.closed ?? 0),
      issuesByDifficulty,
      totalPullRequests: Number(prCounts[0]?.total ?? 0),
      mergedPullRequests: Number(prCounts[0]?.merged ?? 0),
      totalPointsAwarded: Number(pointsTotal[0]?.total ?? 0),
    };
    responseOk(res, stats);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch overview stats");
    next(error);
  }
}
