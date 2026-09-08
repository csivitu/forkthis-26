import { eq, and } from "drizzle-orm";
import { parse } from "graphql";
import { db, repositories, issues, pullRequests, users, pointTransactions, syncLogs } from "@repo/db";

// Points awarded per issue difficulty, applied once when an issue is first
// inserted. Admins can edit `points` on the issue row afterward — this sync
// script never touches it again once the row exists.
const POINTS = { easy: 10, medium: 25, hard: 50 } as const;
type Difficulty = keyof typeof POINTS;
const DIFFICULTIES = Object.keys(POINTS) as Difficulty[];

// Tag function: builds the GraphQL query string and validates its SYNTAX
// (not GitHub's schema) at the moment each query constant is defined below.
// Catches typos/malformed queries at script startup instead of at runtime.
function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  const query = strings.reduce((acc, str, i) => `${acc}${str}${values[i] ?? ""}`, "");
  parse(query); // throws immediately if the query is not valid GraphQL syntax
  return query;
}

// Thin wrapper around GitHub's GraphQL endpoint. `label` is just for
// distinguishing which query failed in error logs (e.g. "syncIssues" vs
// "syncPRs") since both use the same generic request() function.
const gh = {
  async request(query: string, variables: Record<string, unknown>, label = "") {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });
    const body = await res.json() as { data?: any; errors?: { message?: string }[] };
    if (!res.ok || body.errors?.length)
      throw new Error(`${label} failed: ${body.errors?.map(e => e.message).join(", ") || res.statusText}`);
    return body.data;
  },
};

// Fetches only the fields we actually store: issue number, title, state,
// and labels (used to derive difficulty). `state` was added so open/closed
// status can be tracked in the DB instead of issues staying "open" forever
// once inserted. `search` type ISSUE covers both issues and PRs on GitHub's
// side — the inline fragment `... on Issue` filters to just issues here.
const ISSUES_QUERY = gql`
  query($searchQuery: String!, $after: String) {
    search(query: $searchQuery, type: ISSUE, first: 50, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { ... on Issue { number title state labels(first: 10) { nodes { name } } } }
    }
  }
`;

// Same pattern, but `... on PullRequest`. closingIssuesReferences is what
// lets us auto-link a PR to the issue it resolves (via "closes #N" syntax
// in the PR description).
const PRS_QUERY = gql`
  query($searchQuery: String!, $after: String) {
    search(query: $searchQuery, type: ISSUE, first: 50, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        ... on PullRequest {
          number state merged mergeable headRefOid createdAt updatedAt mergedAt
          author { login }
          closingIssuesReferences(first: 5) { nodes { number } }
        }
      }
    }
  }
`;

// Generic paginator: GitHub's search API returns max 50 results per page,
// so this walks the `endCursor` until hasNextPage is false, accumulating
// every result into one flat array.
async function searchAll(query: string, searchQuery: string, label: string) {
  const results: any[] = [];
  let after: string | undefined;
  do {
    const data = await gh.request(query, { searchQuery, after }, label);
    results.push(...data.search.nodes);
    after = data.search.pageInfo.hasNextPage ? data.search.pageInfo.endCursor : undefined;
  } while (after);
  return results;
}

// On a repo's first-ever sync, `since` is null → no filter, fetch everything.
// On every sync after that, only fetch issues/PRs updated on/after the last
// poll date, so we're not re-fetching the entire repo's history every 30 min.
function sinceFilter(since: Date | null) {
  return since ? `updated:>=${since.toISOString()}` : "";
}

// Difficulty comes from a GitHub label matching "easy"/"medium"/"hard"
// (case-insensitive). Returns null if no matching label is present.
function getDifficulty(labels: { name: string }[]): Difficulty | null {
  return (labels.map(l => l.name.toLowerCase()).find(n => DIFFICULTIES.includes(n as Difficulty)) ?? null) as Difficulty | null;
}

// --- ISSUE SYNC ---
// Inserts new issues (only if labeled with a difficulty — points/difficulty
// are NOT NULL columns, so unlabeled issues are skipped until an admin
// labels them on GitHub). Existing issues get title/difficulty/status
// refreshed, but `points` is never overwritten once set.
//
// `syncedAt` is passed in from the caller (== the run's `startedAt`) rather
// than each row calling `new Date()` independently, so every row touched by
// one sync run gets the exact same timestamp instead of drifting by however
// long the run takes.
async function syncIssues(
  repo: { id: string; owner: string; name: string; lastPolledAt: Date | null },
  syncedAt: Date,
) {
  const nodes = await searchAll(ISSUES_QUERY, `repo:${repo.owner}/${repo.name} is:issue ${sinceFilter(repo.lastPolledAt)}`, "syncIssues");
  let skipped = 0;

  for (const node of nodes) {
    const difficulty = getDifficulty(node.labels.nodes);
    const githubStatus = node.state === "CLOSED" ? "closed" : "open";
    const [existing] = await db.select({ id: issues.id, status: issues.status }).from(issues)
      .where(and(eq(issues.repositoryId, repo.id), eq(issues.githubIssueNumber, node.number)));

    if (existing) {
      // "solved" is sticky: it means points were already auto-awarded via a
      // merged PR (see tryAutoAward below). GitHub's open/closed state never
      // overrides that once set — reopening an issue on GitHub does NOT
      // revert its DB status or claw back points. Never touch `points`
      // here either — admins may have manually adjusted it after insert.
      await db.update(issues).set({
        title: node.title,
        ...(difficulty ? { difficulty } : {}),
        ...(existing.status !== "solved" ? { status: githubStatus } : {}),
        lastSyncedAt: syncedAt,
      }).where(eq(issues.id, existing.id));
    } else if (!difficulty) {
      // Can't insert yet — difficulty/points are required (NOT NULL).
      // Will be picked up on a future sync once labeled.
      skipped++;
    } else {
      await db.insert(issues).values({
        repositoryId: repo.id, githubIssueNumber: node.number,
        title: node.title, difficulty, points: POINTS[difficulty], status: githubStatus, lastSyncedAt: syncedAt,
      });
    }
  }
  return { fetched: nodes.length, skipped };
}

// --- PR SYNC ---
async function syncPRs(repo: { id: string; owner: string; name: string; lastPolledAt: Date | null }) {
  const nodes = await searchAll(PRS_QUERY, `repo:${repo.owner}/${repo.name} is:pr ${sinceFilter(repo.lastPolledAt)}`, "syncPRs");
  for (const node of nodes) await processPR(repo, node);
  return nodes.length;
}

// Upserts a single PR row, resolving its linked issue + platform user where
// possible, then triggers an auto-award check if this PR just became merged.
//
// Note: PR rows use GitHub's own timestamps (node.updatedAt / node.mergedAt)
// rather than a local `syncedAt`, since those reflect actual GitHub state
// and there's no local-clock-driven field on pull_requests analogous to
// issues.lastSyncedAt today.
async function processPR(repo: { id: string; owner: string; name: string }, node: any) {
  const linkedIssueNum = node.closingIssuesReferences.nodes[0]?.number;

  // Only resolves to a real issueId if that issue was ALREADY synced (i.e.
  // already had a difficulty label at some prior run). If not, the PR is
  // stored without a link and can be re-linked on a future sync.
  const issueId = linkedIssueNum
    ? (await db.select({ id: issues.id }).from(issues)
        .where(and(eq(issues.repositoryId, repo.id), eq(issues.githubIssueNumber, linkedIssueNum))))[0]?.id ?? null
    : null;

  // A PR author might not have a platform account yet — userId stays null
  // in that case, and githubAuthorUsername is kept as a raw fallback below.
  const userId = node.author?.login
    ? (await db.select({ id: users.id }).from(users).where(eq(users.githubUsername, node.author.login)))[0]?.id ?? null
    : null;

  const status: typeof pullRequests.$inferInsert["status"] = node.merged
    ? "merged"
    : node.state === "CLOSED"
      ? "closed_unmerged"
      : "open";
  // GitHub computes mergeability async — null means "not computed yet",
  // not "unmergeable". Only MERGEABLE/CONFLICTING map to true/false.
  const isMergeable = node.mergeable === "MERGEABLE" ? true : node.mergeable === "CONFLICTING" ? false : null;

  const [existing] = await db.select({ id: pullRequests.id, status: pullRequests.status }).from(pullRequests)
    .where(and(eq(pullRequests.repositoryId, repo.id), eq(pullRequests.githubPrNumber, node.number)));

  const prData: Omit<typeof pullRequests.$inferInsert, "repositoryId" | "githubPrNumber" | "openedAt"> = {
    issueId, userId, githubAuthorUsername: node.author?.login ?? "unknown",
    headSha: node.headRefOid, status, isMergeable,
    updatedAt: new Date(node.updatedAt), mergedAt: node.mergedAt ? new Date(node.mergedAt) : null,
  };

  let prId: string;
  if (existing) {
    prId = existing.id;
    await db.update(pullRequests).set(prData).where(eq(pullRequests.id, prId));
  } else {
    const [inserted] = await db.insert(pullRequests).values({
      ...prData,
      repositoryId: repo.id,
      githubPrNumber: node.number,
      openedAt: new Date(node.createdAt),
    }).returning({ id: pullRequests.id });
    if (!inserted) throw new Error(`Failed to insert PR #${node.number} for ${repo.owner}/${repo.name}`);
    prId = inserted.id;
  }

  // Only trigger an award check on the TRANSITION into "merged" (wasn't
  // merged before, is merged now) — not on every sync of an already-merged
  // PR. Requires both a linked issue and a linked user to proceed.
  if (status === "merged" && existing?.status !== "merged" && issueId && userId)
    await tryAutoAward(issueId, prId, userId);
}

// --- AUTO-AWARD ---
// Strict rule: at most ONE auto_merge point award per issue, ever — no
// matter which PR resolves it or how many times sync runs. A second merged
// PR against an already-awarded issue gets nothing automatically.
// Reassigning points afterward is a separate, manual admin action
// (an admin_manual point_transactions row) — this function never does that.
async function tryAutoAward(issueId: string, prId: string, userId: string) {
  const [prior] = await db.select({ id: pointTransactions.id }).from(pointTransactions)
    .where(and(eq(pointTransactions.issueId, issueId), eq(pointTransactions.reason, "auto_merge")));
  if (prior) return; // already awarded — permanently skip

  const [issueRow] = await db.select({ points: issues.points }).from(issues).where(eq(issues.id, issueId));

  try {
    // Transaction ensures the award and the "solved" status update either
    // both happen or neither does — no partial state on failure.
    await db.transaction(async tx => {
      await tx.insert(pointTransactions).values({ userId, pullRequestId: prId, issueId, points: issueRow?.points ?? 0, reason: "auto_merge", awardedBy: null });
      await tx.update(issues).set({ status: "solved" }).where(eq(issues.id, issueId));
    });
  } catch (err: any) {
    // 23505 = Postgres unique_violation. Belt-and-suspenders: DB has a
    // partial unique index on pull_request_id (guards re-running sync on
    // the same PR). Not the primary "one award per issue" enforcement —
    // that's the `prior` check above — this just catches rare races.
    if (err.code !== "23505") throw err;
  }
}

// --- ENTRY POINT ---
// Exported (not just a bare `main()`) so apps/api/src/index.ts can import
// and call this directly on a setInterval loop alongside the Express
// server, instead of running as a separate script/process. `import.meta.main`
// below still lets this run standalone via `bun run sync:prs` for manual
// or debug runs — it just no longer calls process.exit() itself, since that
// would kill the API server if imported and awaited from there.
export async function runSync() {
  const repos = await db.select({ id: repositories.id, owner: repositories.owner, name: repositories.name, lastPolledAt: repositories.lastPolledAt })
    .from(repositories).where(eq(repositories.isActive, true));

  for (const repo of repos) {
    const startedAt = new Date();
    try {
      const { fetched: issuesFetched } = await syncIssues(repo, startedAt);
      const prsFetched = await syncPRs(repo);
      // lastPolledAt is bumped to startedAt (not `new Date()` taken here) —
      // using the run's start time, not its end time, means an issue/PR
      // updated on GitHub after this run's query executed but before the
      // run finished will still be >= lastPolledAt on the NEXT sync, so it
      // isn't silently skipped by falling between two polling windows.
      // A failed run doesn't bump this at all, so the next attempt
      // re-checks the same window rather than silently skipping whatever
      // failed to sync.
      await db.update(repositories).set({ lastPolledAt: startedAt }).where(eq(repositories.id, repo.id));
      await db.insert(syncLogs).values({ repositoryId: repo.id, status: "success", issuesFetched, prsFetched, startedAt, completedAt: new Date() });
      console.log(`[${new Date().toISOString()}] ${repo.owner}/${repo.name}: issues fetched=${issuesFetched}, PRs fetched=${prsFetched}`);
    } catch (err: any) {
      console.error(`Sync failed for ${repo.owner}/${repo.name}`, err);
      await db.insert(syncLogs).values({ repositoryId: repo.id, status: "failed", issuesFetched: 0, prsFetched: 0, errorMessage: String(err?.message ?? err), startedAt, completedAt: new Date() });
    }
  }
}

if (import.meta.main) {
  runSync().catch(err => { console.error(err); process.exit(1); });
}