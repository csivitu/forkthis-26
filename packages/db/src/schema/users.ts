import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums.js";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  emailVerified:boolean("email_verified").notNull().default(false),
  githubUsername: text("github_username").unique(),
  githubId: text("github_id").unique(),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {withTimezone:true}).notNull().defaultNow().$onUpdate(()=> new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;