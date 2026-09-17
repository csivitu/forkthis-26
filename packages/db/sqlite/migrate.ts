import { Database } from "bun:sqlite";
import path from "node:path";

export const participantsDbPath =
  process.env.PARTICIPANTS_DB_PATH ??
  path.join(import.meta.dir, "../../../participants.db");

export const migrateParticipants = (database: Database): void => {
  const columns = database
    .query("PRAGMA table_info(participants)")
    .all() as Array<{ name: string }>;
  if (columns.some((column) => column.name === "regno")) {
    throw new Error(
      `Legacy participants database found at '${participantsDbPath}'. Remove it before starting the email-based whitelist.`,
    );
  }

  database.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    created_at INTEGER NOT NULL
  );
`);
};

if (import.meta.main) {
  const database = new Database(participantsDbPath);
  migrateParticipants(database);
  database.close();
  console.log(`Participants database migrated at '${participantsDbPath}'`);
}
