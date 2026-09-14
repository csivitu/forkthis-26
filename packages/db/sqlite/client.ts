import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema.js";
import path from "node:path";

const participantsDbPath =
  process.env.PARTICIPANTS_DB_PATH ??
  path.join(import.meta.dir, "../../../participants.db");
const sqlite = new Database(participantsDbPath);
export const participantsDb = drizzle(sqlite, { schema });
