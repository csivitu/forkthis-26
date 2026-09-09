import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/auth.middleware";
import { db, repositories, issues, pointTransactions, users, pullRequests } from "@repo/db";
import { ApiError } from "../../utils/api-error";
import { eq, asc, desc, sql, isNotNull, ilike } from "drizzle-orm";
import { responseOk, responseCreated } from "../../utils/api-response";
import logger from "../../utils/logger.util";
import type {
    AdminIssueEntry,
    AdminIssuesQuery,
    AdminRepositoryEntry,
    AwardPointsBody,
    AdminOverviewStats,
    AdminMemberEntry,
    AdminMembersQuery
} from "./admin.types";

export async function listRepositories(
    req:AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void>{
    try{
        const repos: AdminRepositoryEntry[] = await db
        .select({
            id:repositories.id,
            owner:repositories.owner,
            name:repositories.name,
            isActive:repositories.isActive,
        })
        .from(repositories)
        .orderBy(asc(repositories.owner),asc(repositories.name));
        responseOk(res, repos);
    } catch(error){
        logger.error({ err: error}, "Failed to list issues");
        next(error);
    }
}

export async function listIssues(
    req:AuthRequest<unknown,unknown,unknown,AdminIssuesQuery>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try{
        const { repositoryId }= req.query;

        if(!repositoryId ){
            throw new ApiError(400, "REPOSITORY_ID_REQUIRED", "repositoryId query param is required");
        }

        const issueRows: AdminIssueEntry[] = await db 
        .select({
            id:issues.id,
            repositoryId: issues.repositoryId,
            githubIssueNumber: issues.githubIssueNumber,
            title: issues.title,
            difficulty:issues.difficulty,
            points:issues.points,
            status:issues.status,
        })
        .from(issues)
        .where(eq(issues.repositoryId,repositoryId))
        .orderBy(asc(issues.githubIssueNumber));

        responseOk(res, issueRows);
    }catch(error){
        logger.error({err: error, repositoryId: req.query.repositoryId}, "Failed to list issues");
        next(error);
    }
}

export async function awardPoints(
    req:AuthRequest<unknown,unknown,AwardPointsBody>,
    res:Response,
    next:NextFunction
): Promise<void> {
    try{
        const {userId, issueId, points} = req.body;

        if(!userId || !issueId || !Number.isInteger(points) || points <=0){
            throw new ApiError(
                400,"INVALID_AWARD_POINTS_INPUT","userId, issueId, and a  positive integer points are required"
            );
        }
        const awardedBy = req.user!.id;

        const [transaction] = await db
        .insert(pointTransactions)
        .values({userId, issueId, points , reason: "admin_manual", awardedBy})
        .returning();

        logger.info({userId, issueId, points, awardedBy}, "Admin Awarded Points");

        responseCreated(res,transaction);
    }catch(error){
        logger.error({err:error, body:req.body}, "Failed to award points");
        next(error);
    }
}



const MEMBERS_DEFAULT_LIMIT = 50;
const MEMBERS_MAX_LIMIT = 100;

export async function getOverviewStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const [
            userCounts,
            repoCounts,
            issueCounts,
            difficultyCounts,
            prCounts,
            pointsTotal
        ] = await Promise.all([
            db.select({
                total: sql<number>`count(*)`,
                linkedGithub: sql<number>`count(*) filter (where ${users.githubUsername} is not null)`,
            }).from(users),

            db.select({
                total: sql<number>`count(*)`,
                active: sql<number>`count(*) filter (where ${repositories.isActive} = true)`,
            }).from(repositories),

            db.select({
                total: sql<number>`count(*)`,
                open: sql<number>`count(*) filter (where ${issues.status} = 'open')`,
                closed: sql<number>`count(*) filter (where ${issues.status} = 'closed')`,
            }).from(issues),

            db.select({
                difficulty: issues.difficulty,
                count: sql<number>`count(*)`,
            }).from(issues).groupBy(issues.difficulty),

            db.select({
                total: sql<number>`count(*)`,
                merged: sql<number>`count(*) filter (where ${pullRequests.status} = 'merged')`,
            }).from(pullRequests),

            db.select({
                total: sql<number>`coalesce(sum(${pointTransactions.points}), 0)`,
            }).from(pointTransactions),
        ]);

        const byDifficulty = { easy: 0, medium: 0, hard: 0 };
        for (const row of difficultyCounts) {
            if (row.difficulty in byDifficulty) {
                byDifficulty[row.difficulty as keyof typeof byDifficulty] = Number(row.count);
            }
        }

        const stats: AdminOverviewStats = {
            totalUsers: Number(userCounts[0]!.total),
            linkedGithubUsers: Number(userCounts[0]!.linkedGithub),
            totalRepositories: Number(repoCounts[0]!.total),
            activeRepositories: Number(repoCounts[0]!.active),
            totalIssues: Number(issueCounts[0]!.total),
            openIssues: Number(issueCounts[0]!.open),
            closedIssues: Number(issueCounts[0]!.closed),
            issuesByDifficulty: byDifficulty,
            totalPullRequests: Number(prCounts[0]!.total),
            mergedPullRequests: Number(prCounts[0]!.merged),
            totalPointsAwarded: Number(pointsTotal[0]!.total),
};

        responseOk(res, stats);
    } catch (error) {
        logger.error({ err: error }, "Failed to fetch admin overview stats");
        next(error);
    }
}

export async function listMembers(
    req: AuthRequest<unknown, unknown, unknown, AdminMembersQuery>,
    res: Response,
    next: NextFunction
): Promise<void> {
    const limit = Math.min(Math.max(Number(req.query.limit) || MEMBERS_DEFAULT_LIMIT, 1), MEMBERS_MAX_LIMIT);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const offset = (page - 1) * limit;
    const { search } = req.query;

    try {
        const totalPoints = sql<number>`coalesce(sum(${pointTransactions.points}), 0)`;

        const query = db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            githubUsername: users.githubUsername,
            avatarUrl: users.avatarUrl,
            totalPoints: totalPoints.as("totalPoints"),
        })
        .from(users)
        .leftJoin(pointTransactions, eq(pointTransactions.userId, users.id))
        .groupBy(users.id)
        .orderBy(desc(totalPoints))
        .limit(limit)
        .offset(offset);

        const rows = search
            ? await query.where(ilike(users.name, `%${search}%`))
            : await query;

        const members: AdminMemberEntry[] = rows.map((row) => ({
            ...row,
            totalPoints: Number(row.totalPoints),
        }));

        responseOk(res, members, 200, { page, limit });
    } catch (error) {
        logger.error({ err: error, page, limit, search }, "Failed to list members");
        next(error);
    }
}