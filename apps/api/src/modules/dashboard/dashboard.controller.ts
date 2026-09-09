import type { Response, NextFunction } from "express";
import { db, repositories, issues, pointTransactions, pullRequests } from "@repo/db";
import { eq, and, desc, sum, isNotNull } from "drizzle-orm";
import { ApiError } from "../../utils/api-error";
import { responseOk } from "../../utils/api-response";
import logger from "../../utils/logger.util";
import type { PointTransactionsSummary, IssuesByRepositoryResponse } from "./dashboard.types";
import type { AuthRequest } from "../../middleware/auth.middleware";


const getGloballySolvedIssuesCount = async (userId: string): Promise<number> => {
  const [solvedPrs, solvedPoints] = await Promise.all([
    db
      .select({ issueId: pullRequests.issueId })
      .from(pullRequests)
      .where(
        and(
          eq(pullRequests.userId, userId),
          eq(pullRequests.status, "merged"),
          isNotNull(pullRequests.issueId)
        )
      ),
    db
      .select({ issueId: pointTransactions.issueId })
      .from(pointTransactions)
      .where(
        and(
          eq(pointTransactions.userId, userId),
          isNotNull(pointTransactions.issueId)
        )
      ),
  ]);

  const solvedSet = new Set<string>();
  for (const r of solvedPrs) {
    if (r.issueId) solvedSet.add(r.issueId);
  }
  for (const r of solvedPoints) {
    if (r.issueId) solvedSet.add(r.issueId);
  }
  return solvedSet.size;
};

export const getRepositories = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rows = await db
      .select({
        id: repositories.id,
        owner: repositories.owner,
        name: repositories.name,
        githubRepoId: repositories.githubRepoId,
        isActive: repositories.isActive,
        createdAt: repositories.createdAt,
      })
      .from(repositories)
      .where(eq(repositories.isActive, true))
      .orderBy(desc(repositories.createdAt));

    responseOk(res, rows);
  } catch (error) {
    logger.error({ err: error }, "Failed to get repositories");
    next(error);
  }
};

export const getIssuesByRepository = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = (req.params as { id: string }).id;
    const userId = req.user!.id;

    if (!id) {
      throw new ApiError(400, "MISSING_PARAM", "Repository ID is required");
    }

    const [repo] = await db
      .select({ id: repositories.id })
      .from(repositories)
      .where(eq(repositories.id, id))
      .limit(1);

    if (!repo) {
      throw new ApiError(404, "NOT_FOUND", `Repository with id '${id}' not found`);
    }

    const [rows, totalGloballySolvedIssues] = await Promise.all([
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

      getGloballySolvedIssuesCount(userId),
    ]);

    const payload: IssuesByRepositoryResponse = {
      issues: rows,
      totalGloballySolvedIssues,
    };

    responseOk(res, payload);
  } catch (error) {
    logger.error({ err: error, repositoryId: (req.params as { id: string }).id }, "Failed to get issues by repository");
    next(error);
  }
};

export const getPointTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [transactions, totalResult, totalSolvedIssues] = await Promise.all([
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

      // Total points across all transactions
      db
        .select({ total: sum(pointTransactions.points) })
        .from(pointTransactions)
        .where(eq(pointTransactions.userId, userId)),

      // Total distinct issues solved globally
      getGloballySolvedIssuesCount(userId),
    ]);

    const totalPoints = Number(totalResult[0]?.total ?? 0);

    const payload: PointTransactionsSummary = {
      transactions,
      totalPoints,
      totalGloballySolvedIssues: totalSolvedIssues,
    };

    responseOk(res, payload);
  } catch (error) {
    logger.error({ err: error, userid: req.user?.id }, "Failed to get point transactions");
    next(error);
  }
};
