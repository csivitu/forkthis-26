import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema.js";
import { migrateParticipants, participantsDbPath } from "./migrate.js";

const sqlite = new Database(participantsDbPath);
migrateParticipants(sqlite);
export const participantsDb = drizzle(sqlite, { schema });
