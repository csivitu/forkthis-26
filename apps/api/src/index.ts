import app from "./app";
import { env } from "./config/env.config";
import logger from "./utils/logger.util";

const PORT = env.PORT;



app.listen(PORT, () => {
  logger.info({port:PORT},"Server Listeninig")
});

import { runSync } from "./scripts/sync-prs.js";

const POLL_INTERVAL_MS = 30 * 60 * 1000;

app.listen(PORT, () => {
  console.log(`Server running on :${PORT}`);
  runSync().catch(err => console.error("Initial sync failed", err));
  setInterval(() => runSync().catch(err => console.error("Sync failed", err)), POLL_INTERVAL_MS);
});