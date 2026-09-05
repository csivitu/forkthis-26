import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const sqlite = new Database(new URL("../../../participants.db", import.meta.url).pathname);
export const participantsDb = drizzle(sqlite, { schema });