import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const participants = sqliteTable("participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  regno: text("regno").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});