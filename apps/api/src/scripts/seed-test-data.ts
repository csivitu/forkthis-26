/**
 * apps/api/src/scripts/seed-test-data.ts
 *
 * TEMPORARY testing helper - inserts one repositories row and one users row
 * so you can manually test sync-prs.ts end-to-end without waiting on the
 * real GitHub login flow to be finished.
 *
 * Edit the values below, then run from apps/api:
 *   bun run src/scripts/seed-test-data.ts
 *
 * Safe to re-run: it checks for an existing row first instead of erroring
 * on a duplicate unique constraint.
 */

import { eq } from "drizzle-orm";
import { db, repositories, users } from "@repo/db";

// ---- EDIT THESE ----
const TEST_REPOS = [
  {
    owner: "aditiakansha",
    name: "csi_test",
    githubRepoId: "1347447683", // from `curl https://api.github.com/repos/{owner}/{repo}`, the "id" field
  },
  {
    owner: "aditiakansha",
    name: "csi_test2",
    githubRepoId: "1360444259", // from `curl https://api.github.com/repos/{owner}/{repo}`, the "id" field
  },
  // Add more repositories here using the same shape.
];

const TEST_USER = {
  email: "astral2911006@gmail.com",
  githubUsername: "astral2911006", // the account that will actually open the test PR
};
// ---------------------

async function main() {
  for (const testRepo of TEST_REPOS) {
    const [existingRepo] = await db
      .select({ id: repositories.id })
      .from(repositories)
      .where(eq(repositories.githubRepoId, testRepo.githubRepoId));

    if (existingRepo) {
      console.log(`Repo ${testRepo.owner}/${testRepo.name} already seeded (id: ${existingRepo.id})`);
    } else {
      const [inserted] = await db
        .insert(repositories)
        .values({
          owner: testRepo.owner,
          name: testRepo.name,
          githubRepoId: testRepo.githubRepoId,
          isActive: true,
        })
        .returning({ id: repositories.id });
      console.log(`Inserted repo ${testRepo.owner}/${testRepo.name} (id: ${inserted.id})`);
    }
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.githubUsername, TEST_USER.githubUsername));

  if (existingUser) {
    console.log(`User ${TEST_USER.githubUsername} already seeded (id: ${existingUser.id})`);
  } else {
    const [inserted] = await db
      .insert(users)
      .values({
        email: TEST_USER.email,
        githubUsername: TEST_USER.githubUsername,
        role: "student",
      })
      .returning({ id: users.id });
    console.log(`Inserted user ${TEST_USER.githubUsername} (id: ${inserted.id})`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});