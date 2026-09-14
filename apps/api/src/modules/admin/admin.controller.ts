import type {Response, NextFunction} from "express";
import type {AuthRequest} from "../../middleware/auth.middleware";
import {db, repositories, issues, pointTransactions, users, pullRequests} from "@repo/db";
import {ApiError} from "../../utils/api-error";
import {eq,asc, desc, sql, isNotNull, ilike, count} from "drizzle-orm";
import {responseOk, responseCreated} from "../../utils/api-response";
import logger from "../../utils/logger.util";
import { participantsDb } from "../../../../../packages/db/sqlite/client.ts";
import { participants } from "../../../../../packages/db/sqlite/schema.ts";
import type {
    AdminIssueEntry,
    AdminIssuesQuery,
    AdminRepositoryEntry,
    AwardPointsBody,
    CreateRepoBody,
    UpdateRepoBody,
    UpdateRepoParams,
    DeleteRepoParams,
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

        const [repo] = await db
            .insert(repositories)
            .values({
                owner,
                name,
                githubRepoId,
                ...(techStack !== undefined ? { techStack } : {}),
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

        const [existing] = await db
            .select({ id: repositories.id })
            .from(repositories)
            .where(eq(repositories.id, id))
            .limit(1);

        if (!existing) {
            throw new ApiError(404, "NOT_FOUND", `Repository with id '${id}' not found`);
        }

        const patch: Partial<{ owner: string; name: string; techStack: string | null; isActive: boolean }> = {};
        if (owner !== undefined) patch.owner = owner;
        if (name !== undefined) patch.name = name;
        if (techStack !== undefined) patch.techStack = techStack;
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
    req: AuthRequest<DeleteRepoParams>,
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
                solved: sql<number>`count(*) filter (where ${issues.status} = 'solved')`,
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
            solvedIssues: Number(issueCounts[0]!.solved),
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
    const { limit, page, search } = req.query;
    const offset = (page - 1) * limit;

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

export async function uploadParticipantsCsv(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;
    if (!file) throw new ApiError(400, "NO_FILE", "No CSV file uploaded");

    const text = file.buffer.toString("utf8").replace(/^\uFEFF/, ""); // strip BOM
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    if (lines.length === 0) throw new ApiError(400, "EMPTY_FILE", "CSV is empty");

    // Detect header row — if first cell looks like a header, skip it
    const REGNO_PATTERN = /^\d{2}[A-Z]{3}\d{4}$/;
    const firstCell = (lines[0]?.split(",")[0] ?? "").trim().toUpperCase();
    const dataLines = REGNO_PATTERN.test(firstCell) ? lines : lines.slice(1);

    // Find which column index has reg numbers
    let colIndex = 0;
    if (!REGNO_PATTERN.test(firstCell) && lines[0]) {
      const headers = lines[0].split(",").map(h => h.toLowerCase().trim());
      const REG_HEADERS = ["registration number", "registration no", "registration_number", "reg no", "reg_no", "regno"];
      const found = headers.findIndex(h => REG_HEADERS.includes(h));
      colIndex = found !== -1 ? found : 0;
    }

    const valid: string[] = [];
    const invalid: string[] = [];

    for (const line of dataLines) {
      const cell = (line.split(",")[colIndex] ?? "").trim().toUpperCase();
      if (!cell) continue;
      (REGNO_PATTERN.test(cell) ? valid : invalid).push(cell);
    }

    let added = 0;
    for (const regno of valid) {
      const result = participantsDb
        .insert(participants)
        .values({ regno, createdAt: new Date() })
        .onConflictDoNothing()
        .run() as unknown as { changes: number };
      added += result.changes;
    }

    logger.info({ added, skipped: valid.length - added, invalid: invalid.length }, "Participants CSV uploaded");
    responseCreated(res, { added, alreadyExisted: valid.length - added, invalid });
  } catch (error) {
    next(error);
  }
}
