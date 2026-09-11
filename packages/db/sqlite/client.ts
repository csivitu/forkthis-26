import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema.js";
import path from "node:path"

const sqlite = new Database(path.join(import.meta.dir,"../../../participants.db"));
export const participantsDb = drizzle(sqlite, { schema });