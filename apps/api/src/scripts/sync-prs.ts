/**
 * apps/api/src/scripts/sync-prs.ts
 *
 * Run on a schedule (e.g. GitHub Actions cron every 15 min):
 *   npx tsx src/scripts/sync-prs.ts
 *
 * For each active repo:
 *   1. Sync issues - only inserts a row once a difficulty label
 *      (easy/medium/hard) is present on GitHub, since difficulty/points
 *      are NOT NULL. Unlabeled issues are skipped until an admin labels them.
 *   2. Sync PRs - link to issue + user, determine merge status.
 *   3. For a PR that just became merged, with a resolved issue + author:
 *        - if this issue has NEVER been auto-awarded before -> award points,
 *          mark issue solved.
 *        - if it has -> skip, permanently. This is intentionally strict:
 *          a second merged PR against an already-awarded issue never gets
 *          auto points. Reassigning points to a different PR afterward is a
 *          separate, manual admin action (an admin_manual point_transactions
 *          row) - it is not something this script ever does.
 *   4. Log every run to sync_logs (success/failure, counts).
 *
 * NOTE: adjust the import below if @repo/db exports the schema tables from a
 * different path (e.g. "@repo/db/schema") than the client itself.
 *
 * Requires: `graphql` (the reference parser only, used purely to validate
 * query syntax at startup - not `graphql-request`, and no server/runtime).
 */

import { eq, and } from "drizzle-orm";
import { parse } from "graphql";
import {
  db,
  repositories,
  issues,
  pullRequests,
  users,
  pointTransactions,
  syncLogs,
} from "@repo/db";

/**
 * Tag function that both builds the query string AND validates its syntax
 * immediately, at the point each query constant is defined (i.e. at script
 * startup, before any network or DB calls happen). A malformed query - typo'd
 * field, unclosed brace, bad fragment syntax - throws right here with the
 * offending query text attached, instead of silently reaching GitHub and
 * failing later inside a try/catch with a vaguer error.
 *
 * IMPORTANT LIMITATION: `parse()` only checks GraphQL *syntax* (is this
 * grammatically valid GraphQL at all). It does NOT know GitHub's actual
 * schema, so it can't catch things like "PullRequest has no field named
 * `mergeableFoo`" - that kind of error is only caught once GitHub itself
 * rejects the query at request time (handled below in `request()`, which
 * labels which query failed so you can tell them apart in the logs). Full
 * schema validation would require fetching/caching GitHub's GraphQL schema
 * via introspection and running `validate()` against it - more setup than
 * this project needs right now, but an option later if these queries grow.
 */
function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  const query = strings.reduce((acc, str, i) => `${acc}${str}${values[i] ?? ""}`, "");

  try {
    parse(query);
  } catch (err: any) {
    throw new Error(`Invalid GraphQL syntax in query:\n${query}\n\n${err.message}`);
  }

  return query;
}

const githubClient = {
  async request(query: string, variables: Record<string, unknown>, label = "GraphQL request") {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    const body = (await response.json()) as {
      data?: any;
      errors?: Array<{ message?: string }>;
    };

    if (!response.ok || body.errors?.length) {
      const detail = body.errors?.map((error) => error.message).join(", ") || response.statusText;
      throw new Error(`${label} failed: ${detail}`);
    }

    return body.data;
  },
};

// Applied only when an issue is first inserted (i.e. the first time it has a
// recognized difficulty label). Admins can freely edit `points` afterward -
// the sync script never touches it again once the row exists.
const DEFAULT_POINTS_BY_DIFFICULTY: Record<string, number> = {
  easy: 10,
  medium: 25,
  hard: 50,
};

const DIFFICULTIES = ["easy", "medium", "hard"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

// ---- GraphQL queries (validated for syntax the moment these are defined) ----

const ISSUES_QUERY = gql`
  query SyncIssues($searchQuery: String!, $after: String) {
    search(query: $searchQuery, type: ISSUE, first: 50, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on Issue {
          number
          title
          labels(first: 10) {
            nodes {
              name
            }
          }
        }
      }
    }
  }
`;

const PRS_QUERY = gql`
  query SyncPRs($searchQuery: String!, $after: String) {
    search(query: $searchQuery, type: ISSUE, first: 50, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on PullRequest {
          number
          state
          merged
          mergeable
          headRefOid
          createdAt
          updatedAt
          mergedAt
          author {
            login
          }
          closingIssuesReferences(first: 5) {
            nodes {
              number
            }
          }
        }
      }
    }
  }
`;

interface RepoRow {
  id: string;
  owner: string;
  name: string;
  lastPolledAt: Date | null;
}

async function searchAll(query: string, searchQuery: string, label: string): Promise<any[]> {
  const results: any[] = [];
  let after: string | undefined = undefined;
  while (true) {
    const data: any = await githubClient.request(query, { searchQuery, after }, label);
    results.push(...data.search.nodes);
    if (!data.search.pageInfo.hasNextPage) break;
    after = data.search.pageInfo.endCursor;
  }
  return results;
}

function sinceFilter(since: Date | null): string {
  return since ? `updated:>=${since.toISOString().split("T")[0]}` : "";
}

function extractDifficulty(labelNodes: { name: string }[]): Difficulty | null {
  const match = labelNodes.map((l) => l.name.toLowerCase()).find((n) => DIFFICULTIES.includes(n as Difficulty));
  return (match as Difficulty) ?? null;
}

// ---- Issue sync ----

async function syncIssues(repo: RepoRow): Promise<{ fetched: number; skippedUnlabeled: number }> {
  const nodes = await searchAll(
    ISSUES_QUERY,
    `repo:${repo.owner}/${repo.name} is:issue ${sinceFilter(repo.lastPolledAt)}`,
    `syncIssues(${repo.owner}/${repo.name})`
  );

  let skippedUnlabeled = 0;

  for (const node of nodes) {
    const difficulty = extractDifficulty(node.labels.nodes);

    const [existing] = await db
      .select({ id: issues.id })
      .from(issues)
      .where(and(eq(issues.repositoryId, repo.id), eq(issues.githubIssueNumber, node.number)));

    if (existing) {
      // Row already exists (so difficulty/points are already set and valid).
      // Update title/label/freshness only - never touch points here.
      await db
        .update(issues)
        .set({
          title: node.title,
          ...(difficulty ? { difficulty } : {}), // only overwrite if a valid label is present
          lastSyncedAt: new Date(),
        })
        .where(eq(issues.id, existing.id));
      continue;
    }

    if (!difficulty) {
      // Can't insert: difficulty/points are NOT NULL and we don't have a
      // difficulty yet. Wait for an admin to label it on GitHub.
      skippedUnlabeled++;
      continue;
    }

    await db.insert(issues).values({
      repositoryId: repo.id,
      githubIssueNumber: node.number,
      title: node.title,
      difficulty,
      points: DEFAULT_POINTS_BY_DIFFICULTY[difficulty],
      status: "open",
      lastSyncedAt: new Date(),
    });
  }

  return { fetched: nodes.length, skippedUnlabeled };
}

// ---- PR sync + strict single auto-award ----

async function syncPRs(repo: RepoRow): Promise<number> {
  const nodes = await searchAll(
    PRS_QUERY,
    `repo:${repo.owner}/${repo.name} is:pr ${sinceFilter(repo.lastPolledAt)}`,
    `syncPRs(${repo.owner}/${repo.name})`
  );

  for (const node of nodes) {
    await processPR(repo, node);
  }

  return nodes.length;
}

async function processPR(repo: RepoRow, node: any) {
  const linkedIssueNumber: number | undefined = node.closingIssuesReferences.nodes[0]?.number;

  // Only resolves to a real issueId if that issue has ALREADY been synced
  // (i.e. it already had a difficulty label at some prior sync run). If the
  // issue isn't labeled yet, this PR is stored without a link - it can be
  // re-linked on a later sync once the issue exists, as long as the PR shows
  // up again in the `updated:>=` search window.
  let issueId: string | null = null;
  if (linkedIssueNumber) {
    const [issueRow] = await db
      .select({ id: issues.id })
      .from(issues)
      .where(
        and(eq(issues.repositoryId, repo.id), eq(issues.githubIssueNumber, linkedIssueNumber))
      );
    issueId = issueRow?.id ?? null;
  }

  let userId: string | null = null;
  if (node.author?.login) {
    const [userRow] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.githubUsername, node.author.login));
    userId = userRow?.id ?? null;
  }

  const status = node.merged ? "merged" : node.state === "CLOSED" ? "closed_unmerged" : "open";
  const isMergeable =
    node.mergeable === "MERGEABLE" ? true : node.mergeable === "CONFLICTING" ? false : null;

  const [existingPR] = await db
    .select({ id: pullRequests.id, status: pullRequests.status })
    .from(pullRequests)
    .where(
      and(eq(pullRequests.repositoryId, repo.id), eq(pullRequests.githubPrNumber, node.number))
    );

  let prId: string;

  if (existingPR) {
    prId = existingPR.id;
    await db
      .update(pullRequests)
      .set({
        issueId,
        userId,
        githubAuthorUsername: node.author?.login ?? "unknown",
        headSha: node.headRefOid,
        status,
        isMergeable,
        updatedAt: new Date(node.updatedAt),
        mergedAt: node.mergedAt ? new Date(node.mergedAt) : null,
      })
      .where(eq(pullRequests.id, prId));
  } else {
    const [inserted] = await db
      .insert(pullRequests)
      .values({
        repositoryId: repo.id,
        githubPrNumber: node.number,
        issueId,
        userId,
        githubAuthorUsername: node.author?.login ?? "unknown",
        headSha: node.headRefOid,
        status,
        isMergeable,
        openedAt: new Date(node.createdAt),
        updatedAt: new Date(node.updatedAt),
        mergedAt: node.mergedAt ? new Date(node.mergedAt) : null,
      })
      .returning({ id: pullRequests.id });
    prId = inserted.id;
  }

  const justMerged = status === "merged" && existingPR?.status !== "merged";
  if (justMerged && issueId && userId) {
    await tryAutoAwardPoints(repo, issueId, prId, userId);
  }
}

async function tryAutoAwardPoints(repo: RepoRow, issueId: string, prId: string, userId: string) {
  // Strict rule: has ANY auto_merge transaction ever been recorded for this
  // issue, regardless of which PR it came from? If so, this PR gets nothing
  // - permanently. Reassigning points is an admin's manual call, not this
  // script's.
  const [priorAward] = await db
    .select({ id: pointTransactions.id })
    .from(pointTransactions)
    .where(
      and(eq(pointTransactions.issueId, issueId), eq(pointTransactions.reason, "auto_merge"))
    );

  if (priorAward) {
    console.log(
      `Issue ${issueId} already auto-awarded - not awarding ${repo.owner}/${repo.name} PR ${prId}`
    );
    return;
  }

  const [issueRow] = await db.select({ points: issues.points }).from(issues).where(eq(issues.id, issueId));
  const points = issueRow?.points ?? 0;

  try {
    await db.transaction(async (tx) => {
      await tx.insert(pointTransactions).values({
        userId,
        pullRequestId: prId,
        issueId,
        points,
        reason: "auto_merge",
        awardedBy: null,
      });
      await tx.update(issues).set({ status: "solved" }).where(eq(issues.id, issueId));
    });
  } catch (err: any) {
    // Belt-and-suspenders: the DB's partial unique index is on
    // pull_request_id (guards re-running the sync on the same PR), not on
    // issue_id, so this catch mainly protects against a rare race rather
    // than being the primary enforcement mechanism for "one award per issue."
    if (err.code === "23505") {
      console.log(`Unique violation awarding PR ${prId} - likely already processed, skipping.`);
    } else {
      throw err;
    }
  }
}

// ---- Entry point ----

async function main() {
  const repoRows = await db
    .select({
      id: repositories.id,
      owner: repositories.owner,
      name: repositories.name,
      lastPolledAt: repositories.lastPolledAt,
    })
    .from(repositories)
    .where(eq(repositories.isActive, true));

  for (const repo of repoRows) {
    const startedAt = new Date();
    console.log(`Syncing ${repo.owner}/${repo.name}...`);

    try {
      const { fetched: issuesFetched, skippedUnlabeled } = await syncIssues(repo);
      if (skippedUnlabeled > 0) {
        console.log(
          `${repo.owner}/${repo.name}: skipped ${skippedUnlabeled} issue(s) with no difficulty label yet`
        );
      }
      const prsFetched = await syncPRs(repo);

      await db
        .update(repositories)
        .set({ lastPolledAt: new Date() })
        .where(eq(repositories.id, repo.id));

      await db.insert(syncLogs).values({
        repositoryId: repo.id,
        status: "success",
        issuesFetched,
        prsFetched,
        startedAt,
        completedAt: new Date(),
      });
    } catch (err: any) {
      console.error(`Sync failed for ${repo.owner}/${repo.name}`, err);
      await db.insert(syncLogs).values({
        repositoryId: repo.id,
        status: "failed",
        issuesFetched: 0,
        prsFetched: 0,
        errorMessage: String(err?.message ?? err),
        startedAt,
        completedAt: new Date(),
      });
    }
  }
}

main()
  .catch((err) => {
    console.error("Sync run crashed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));