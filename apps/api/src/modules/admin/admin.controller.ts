import type {Response, NextFunction} from "express";
import type {AuthRequest} from "../../middleware/auth.middleware";
import {db,repositories, issues, pointTransactions} from "@repo/db";
import {ApiError} from "../../utils/api-error";
import {eq,asc} from "drizzle-orm";
import {responseOk, responseCreated} from "../../utils/api-response";
import logger from "../../utils/logger.util";
import type {
    AdminIssueEntry,
    AdminIssuesQuery,
    AdminRepositoryEntry,
    AwardPointsBody
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