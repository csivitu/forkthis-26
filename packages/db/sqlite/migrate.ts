import { Database } from "bun:sqlite";

const db = new Database("participants.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL
  );
`);
console.log("Table created");