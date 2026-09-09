/**
 * apps/api/src/scripts/seed-test-data.ts
 *
 * TEMPORARY testing helper - inserts repositories rows and a user row so
 * you can manually test sync-prs.ts end-to-end without waiting on the real
 * GitHub login flow to be finished.
 *
 * All values now come from CLI args instead of being hardcoded — run from
 * apps/api:
 *
 *   bun --env-file=../../.env run src/scripts/seed-test-data.ts \
 *     --repo aditiakansha/csi_test \
 *     --repo aditiakansha/csi_test2 \
 *     --user-email astral2911006@gmail.com \
 *     --user-github astral2911006
 *
 * Or via the package.json script (note the extra `--` so bun forwards the
 * flags instead of trying to parse them itself):
 *
 *   bun run seed:test -- --repo aditiakansha/csi_test --user-email you@x.com --user-github you
 *
 * A repo's numeric githubRepoId is now looked up automatically via GitHub's
 * REST API — no more manually running `curl https://api.github.com/repos/{owner}/{repo}`
 * and pasting the "id" field in by hand.
 *
 * Safe to re-run: it checks for an existing row first instead of erroring
 * on a duplicate unique constraint.
 */

import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";
import { db, repositories, users } from "@repo/db";

function printUsageAndExit(): never {
  console.log(`
Usage:
  bun --env-file=../../.env run src/scripts/seed-test-data.ts [options]

Options:
  --repo, -r <owner>/<name>   Repository to seed. Repeatable — pass multiple
                              times to seed several repos in one run. The
                              GitHub repo ID is fetched automatically.
  --user-email <email>        Email for the test user
  --user-github <username>    GitHub username for the test user (the account
                               that will actually open the test PR)
  --user-role <role>          Optional, defaults to "student"
  -h, --help                  Show this help

Example:
  bun --env-file=../../.env run src/scripts/seed-test-data.ts \\
    --repo aditiakansha/csi_test \\
    --repo aditiakansha/csi_test2 \\
    --user-email astral2911006@gmail.com \\
    --user-github astral2911006
`);
  process.exit(1);
}

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    repo: { type: "string", short: "r", multiple: true },
    "user-email": { type: "string" },
    "user-github": { type: "string" },
    "user-role": { type: "string" },
    help: { type: "boolean", short: "h" },
  },
  allowPositionals: false,
});

if (values.help || !values.repo?.length || !values["user-email"] || !values["user-github"]) {
  printUsageAndExit();
}

const repoArgs = values.repo.map((r) => {
  const [owner, name] = r.split("/");
  if (!owner || !name) {
    console.error(`Invalid --repo value "${r}", expected "owner/name"`);
    process.exit(1);
  }
  return { owner, name };
});

const testUser: {
  email: string;
  githubUsername: string;
  role: "student" | "admin";
} = {
  email: values["user-email"],
  githubUsername: values["user-github"],
  role: (values["user-role"] ?? "student") as "student" | "admin",
};

// Looks up a repo's numeric GitHub ID via the REST API instead of requiring
// it to be found and pasted in manually. Uses GITHUB_TOKEN if present (same
// var sync-prs.ts already reads) to avoid unauthenticated rate limits, but
// works without it too since this is a public-repo GET request.
async function fetchGithubRepoId(owner: string, name: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
    headers: process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
  });
  if (!res.ok) {
    throw new Error(`GitHub API lookup failed for ${owner}/${name}: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { id: number };
  return String(body.id);
}

async function main() {
  for (const { owner, name } of repoArgs) {
    const githubRepoId = await fetchGithubRepoId(owner, name);

    const [existingRepo] = await db
      .select({ id: repositories.id })
      .from(repositories)
      .where(eq(repositories.githubRepoId, githubRepoId));

    if (existingRepo) {
      console.log(`Repo ${owner}/${name} already seeded (id: ${existingRepo.id})`);
    } else {
      const [inserted] = await db
        .insert(repositories)
        .values({ owner, name, githubRepoId, isActive: true } as const)
        .returning({ id: repositories.id });
      if (!inserted) throw new Error(`Failed to insert repo ${owner}/${name}`);
      console.log(`Inserted repo ${owner}/${name} (id: ${inserted.id})`);
    }
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.githubUsername, testUser.githubUsername));

  if (existingUser) {
    console.log(`User ${testUser.githubUsername} already seeded (id: ${existingUser.id})`);
  } else {
    const [inserted] = await db
      .insert(users)
      .values({
        email: testUser.email,
        githubUsername: testUser.githubUsername,
        role: testUser.role,
      } satisfies typeof users.$inferInsert)
      .returning({ id: users.id });
    if (!inserted) throw new Error(`Failed to insert user ${testUser.githubUsername}`);
    console.log(`Inserted user ${testUser.githubUsername} (id: ${inserted.id})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });