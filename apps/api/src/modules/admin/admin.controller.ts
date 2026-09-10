import type {Response, NextFunction} from "express";
import type {AuthRequest} from "../../middleware/auth.middleware";
import {db,repositories, issues, pointTransactions} from "@repo/db";
import {ApiError} from "../../utils/api-error";
import {eq,asc,count} from "drizzle-orm";
import {responseOk, responseCreated} from "../../utils/api-response";
import logger from "../../utils/logger.util";
import type {
    AdminIssueEntry,
    AdminIssuesQuery,
    AdminRepositoryEntry,
    AwardPointsBody,
    CreateRepoBody,
    UpdateRepoBody,
    UpdateRepoParams,
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
            githubRepoId:repositories.githubRepoId,
            techStack:repositories.techStack,
            isActive:repositories.isActive,
            createdAt:repositories.createdAt,
            issueCount: count(issues.id),
        })
        .from(repositories)
        .leftJoin(issues, eq(issues.repositoryId, repositories.id))
        .groupBy(
            repositories.id,
            repositories.owner,
            repositories.name,
            repositories.githubRepoId,
            repositories.techStack,
            repositories.isActive,
            repositories.createdAt,
        )
        .orderBy(asc(repositories.owner),asc(repositories.name));

        const typed: AdminRepositoryEntry[] = repos.map((r) => ({
            ...r,
            issueCount: Number(r.issueCount),
        }));

        responseOk(res, typed);
    } catch(error){
        logger.error({ err: error}, "Failed to list repositories");
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

export async function createRepo(
    req: AuthRequest<unknown, unknown, CreateRepoBody>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { owner, name, githubRepoId, techStack } = req.body;

        if (!owner?.trim() || !name?.trim() || !githubRepoId?.trim()) {
            throw new ApiError(400, "INVALID_REPO_INPUT", "owner, name, and githubRepoId are required");
        }

        const [repo] = await db
            .insert(repositories)
            .values({
                owner: owner.trim(),
                name: name.trim(),
                githubRepoId: githubRepoId.trim(),
                ...(techStack !== undefined ? { techStack: techStack?.trim() || null } : {}),
            })
            .returning();

        if (!repo) throw new ApiError(500, "INSERT_FAILED", "Failed to insert repository");

        logger.info({ repoId: repo.id, owner, name }, "Admin created repository");
        responseCreated(res, repo);
    } catch (error) {
        logger.error({ err: error, body: req.body }, "Failed to create repository");
        next(error);
    }
}

export async function updateRepo(
    req: AuthRequest<UpdateRepoParams, unknown, UpdateRepoBody>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;
        const { owner, name, techStack, isActive } = req.body;

        if (!owner && !name && techStack === undefined && isActive === undefined) {
            throw new ApiError(400, "NO_FIELDS_TO_UPDATE", "Provide at least one of: owner, name, techStack, isActive");
        }

        const [existing] = await db
            .select({ id: repositories.id })
            .from(repositories)
            .where(eq(repositories.id, id))
            .limit(1);

        if (!existing) {
            throw new ApiError(404, "NOT_FOUND", `Repository with id '${id}' not found`);
        }

        const patch: Partial<{ owner: string; name: string; techStack: string | null; isActive: boolean }> = {};
        if (owner !== undefined) patch.owner = owner.trim();
        if (name !== undefined) patch.name = name.trim();
        if (techStack !== undefined) patch.techStack = techStack?.trim() || null;
        if (isActive !== undefined) patch.isActive = isActive;

        const [updated] = await db
            .update(repositories)
            .set(patch)
            .where(eq(repositories.id, id))
            .returning();

        logger.info({ repoId: id, patch }, "Admin updated repository");
        responseOk(res, updated);
    } catch (error) {
        logger.error({ err: error, repoId: req.params.id }, "Failed to update repository");
        next(error);
    }
}

export async function deleteRepo(
    req: AuthRequest<UpdateRepoParams>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;

        const [existing] = await db
            .select({ id: repositories.id, name: repositories.name })
            .from(repositories)
            .where(eq(repositories.id, id))
            .limit(1);

        if (!existing) {
            throw new ApiError(404, "NOT_FOUND", `Repository with id '${id}' not found`);
        }

        await db.delete(repositories).where(eq(repositories.id, id));

        logger.info({ repoId: id, name: existing.name }, "Admin deleted repository");
        responseOk(res, { message: `Repository '${existing.name}' deleted successfully` });
    } catch (error) {
        logger.error({ err: error, repoId: req.params.id }, "Failed to delete repository");
        next(error);
    }
}