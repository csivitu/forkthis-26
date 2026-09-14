import { Database } from "bun:sqlite";
import path from "node:path";

export const participantsDbPath =
  process.env.PARTICIPANTS_DB_PATH ??
  path.join(import.meta.dir, "../../../participants.db");

export const migrateParticipants = (database: Database): void => {
  database.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    regno TEXT NOT NULL UNIQUE,
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
