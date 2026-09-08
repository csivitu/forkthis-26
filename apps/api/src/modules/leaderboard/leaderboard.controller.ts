import type { Request, Response, NextFunction } from "express";
import {db , users, pointTransactions} from "@repo/db";
import {eq , desc , sql} from "drizzle-orm";
import type { leaderboardQuery, leaderboardEntry } from "./leaderboard.types.ts";
import { responseOk } from "../../utils/api-response.ts";
import logger from "../../utils/logger.util.ts";

const LEADERBOARD_DEFAULT_LIMIT = 50;
const LEADERBOARD_MAX_LIMIT = 100;
export async function getLeaderboard(
  req: Request<unknown,unknown,unknown,leaderboardQuery>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const limit = Math.min(Number(req.query.limit) || LEADERBOARD_DEFAULT_LIMIT, LEADERBOARD_MAX_LIMIT);
  const page = Math.max(Number(req.query.page) || 1 , 1);
  const offset = (page - 1 ) * limit;
  try {
    const totalPoints = sql<number>`coalesce(sum(${pointTransactions.points}), 0)`;
    const rows = await db.select({
      userId: users.id,
      name:users.name,
      githubUsername: users.githubUsername,
      avatarUrl:users.avatarUrl,
      totalPoints:totalPoints.as("totalPoints"),
    })
    .from(users)
    .leftJoin(pointTransactions, eq(pointTransactions.userId , users.id))
    .groupBy(users.id)
    .orderBy(desc(totalPoints))
    .limit(limit)
    .offset(offset)
    const leaderboard: leaderboardEntry[] = rows.map((row, index) => ({
      rank: offset + index + 1,
      userId: row.userId,
      name: row.name,
      githubUsername: row.githubUsername,
      avatarUrl: row.avatarUrl,
      totalPoints: Number(row.totalPoints),
    }));

    logger.debug({page, limit, count: leaderboard.length}, "Leaderboard fetched");
    responseOk(res, leaderboard, 200, {page , limit});
  } catch (error) {
    logger.error({ err: error , page ,limit}, "Failed to fetch leaderboard");
    next(error);
  }
};