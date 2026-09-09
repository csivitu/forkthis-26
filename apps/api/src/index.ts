import app from "./app";
import { env } from "./config/env.config";
import logger from "./utils/logger.util";
import { runSync } from "./scripts/sync-prs.js";

const PORT = env.PORT;
const POLL_INTERVAL_MS = 30 * 60 * 1000;

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server Listening");
  runSync().catch(err => logger.error({ err }, "Initial sync failed"));
  setInterval(() => runSync().catch(err => logger.error({ err }, "Sync failed")), POLL_INTERVAL_MS);
});