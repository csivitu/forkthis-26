/**
 * apps/api/src/scripts/dev-app.ts
 *
 * LOCAL DEV ONLY — single entry point that starts EVERYTHING:
 *   1. The Express API server (src/index.ts, hot-reloading via --watch)
 *   2. A repeating sync loop that re-runs sync-prs.ts every few seconds,
 *      so PR/issue data updates from GitHub almost immediately instead of
 *      waiting on GitHub Actions' 15-min production cron.
 *
 * Run with:  bun run dev
 * (from apps/api — see package.json)
 *
 * Both the server and every sync run print straight to this terminal.
 * Ctrl+C stops both.
 */

const ENV_FILE = "../../.env"; // repo-root .env, relative to apps/api
const SYNC_INTERVAL_MS = 7000; // how often to re-run the GitHub sync

console.log("[dev] starting server + sync loop...");

// ---- 1. Start the API server ----
const server = Bun.spawn(["bun", `--env-file=${ENV_FILE}`, "--watch", "src/index.ts"], {
  stdout: "inherit",
  stderr: "inherit",
  env: process.env,
});
console.log(`[dev] server started (pid ${server.pid})`);

// ---- 2. Repeating sync loop (runs in-process, no extra spawned file needed) ----
let runCount = 0;
let syncing = false;

async function runSyncOnce() {
  if (syncing) {
    console.log("[dev:sync] previous sync still running, skipping this tick");
    return;
  }
  syncing = true;
  runCount++;
  console.log(`\n[dev:sync] ── run #${runCount} @ ${new Date().toLocaleTimeString()} ──`);

  const proc = Bun.spawn(["bun", `--env-file=${ENV_FILE}`, "src/scripts/sync-prs.ts"], {
    stdout: "inherit",
    stderr: "inherit",
    env: process.env,
  });
  await proc.exited;
  syncing = false;
}

console.log(`[dev] sync loop starting, running every ${SYNC_INTERVAL_MS / 1000}s`);
runSyncOnce(); // fire immediately, don't wait for first interval
const syncTimer = setInterval(runSyncOnce, SYNC_INTERVAL_MS);

console.log("[dev] server + sync loop running — Ctrl+C to stop.\n");

// ---- Shutdown handling ----
function shutdown(reason: string) {
  console.log(`\n[dev] shutting down (${reason})...`);
  clearInterval(syncTimer);
  server.kill();
  console.log("[dev] stopped.");
  process.exit(0);
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// If the server dies unexpectedly, stop everything rather than silently
// continuing with just the sync loop.
server.exited.then((code) => {
  console.log(`[dev] server exited unexpectedly (code ${code})`);
  shutdown("server exited");
});