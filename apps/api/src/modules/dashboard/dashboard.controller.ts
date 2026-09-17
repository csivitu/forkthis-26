import type { Response, NextFunction } from "express";
import { db, repositories, issues, pointTransactions } from "@repo/db";
import {
  eq,
  and,
  desc,
  sum,
  count,
  countDistinct,
  isNotNull,
} from "drizzle-orm";
import { ApiError } from "../../utils/api-error";
import { responseOk } from "../../utils/api-response";
import logger from "../../utils/logger.util";
import type {
  PointTransactionsSummary,
  IssuesByRepositoryResponse,
  RepositoryRow,
  GetIssuesByRepoParams,
} from "./dashboard.types";
import type { AuthRequest } from "../../middleware/auth.middleware";

const getIssuesSolvedCount = async (userId: string): Promise<number> => {
  const result = await db
    .select({ count: countDistinct(pointTransactions.issueId) })
    .from(pointTransactions)
    .where(
      and(
        eq(pointTransactions.userId, userId),
        isNotNull(pointTransactions.issueId),
      ),
    );

  return Number(result[0]?.count ?? 0);
};

export const getRepositories = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rows = await db
      .select({
        id: repositories.id,
        owner: repositories.owner,
        name: repositories.name,
        githubRepoId: repositories.githubRepoId,
        techStack: repositories.techStack,
        isActive: repositories.isActive,
        createdAt: repositories.createdAt,
        issueCount: count(issues.id),
      })
      .from(repositories)
      .leftJoin(issues, eq(issues.repositoryId, repositories.id))
      .where(eq(repositories.isActive, true))
      .groupBy(
        repositories.id,
        repositories.owner,
        repositories.name,
        repositories.githubRepoId,
        repositories.techStack,
        repositories.isActive,
        repositories.createdAt,
      )
      .orderBy(desc(repositories.createdAt));

    const typed: RepositoryRow[] = rows.map((r) => ({
      ...r,
      issueCount: Number(r.issueCount),
    }));

    responseOk(res, typed);
  } catch (error) {
    logger.error({ err: error }, "Failed to get repositories");
    next(error);
  }
};

export const getIssuesByRepository = async (
  req: AuthRequest<GetIssuesByRepoParams>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const [repo] = await db
      .select({ id: repositories.id })
      .from(repositories)
      .where(eq(repositories.id, id))
      .limit(1);

    if (!repo) {
      throw new ApiError(
        404,
        "NOT_FOUND",
        `Repository with id '${id}' not found`,
      );
    }

    const [rows, issuesSolved] = await Promise.all([
      db
        .select({
          id: issues.id,
          repositoryId: issues.repositoryId,
          githubIssueNumber: issues.githubIssueNumber,
          title: issues.title,
          difficulty: issues.difficulty,
          points: issues.points,
          status: issues.status,
          createdAt: issues.createdAt,
        })
        .from(issues)
        .where(eq(issues.repositoryId, id))
        .orderBy(desc(issues.createdAt)),

      getIssuesSolvedCount(userId),
    ]);

    const payload: IssuesByRepositoryResponse = {
      issues: rows,
      issuesSolved,
    };

    responseOk(res, payload);
  } catch (error) {
    logger.error(
      { err: error, repositoryId: req.params.id },
      "Failed to get issues by repository",
    );
    next(error);
  }
};

export const getPointTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [
      transactions,
      totalResult,
      issuesSolved,
      maxPointsResult,
      totalIssuesResult,
    ] = await Promise.all([
      db
        .select({
          id: pointTransactions.id,
          userId: pointTransactions.userId,
          issueId: pointTransactions.issueId,
          pullRequestId: pointTransactions.pullRequestId,
          points: pointTransactions.points,
          reason: pointTransactions.reason,
          createdAt: pointTransactions.createdAt,
        })
        .from(pointTransactions)
        .where(eq(pointTransactions.userId, userId))
        .orderBy(desc(pointTransactions.createdAt)),

      // Total points earned by this user across all transactions
      db
        .select({ total: sum(pointTransactions.points) })
        .from(pointTransactions)
        .where(eq(pointTransactions.userId, userId)),

      // Total distinct issues solved by this user
      getIssuesSolvedCount(userId),

      // Max possible points: sum of points on all issues in the DB
      db.select({ total: sum(issues.points) }).from(issues),

      // Total number of issues in the DB
      db.select({ total: count(issues.id) }).from(issues),
    ]);

    const totalPoints = Number(totalResult[0]?.total ?? 0);
    const maxPoints = Number(maxPointsResult[0]?.total ?? 0);
    const totalIssues = Number(totalIssuesResult[0]?.total ?? 0);

    const payload: PointTransactionsSummary = {
      transactions,
      totalPoints,
      issuesSolved,
      maxPoints,
      totalIssues,
    };

    responseOk(res, payload);
  } catch (error) {
    logger.error(
      { err: error, userid: req.user?.id },
      "Failed to get point transactions",
    );
    next(error);
  }
};
