import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema/index.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString,
  // PostgreSQL still stores timestamptz values as UTC; this only controls
  // the offset used for timestamp strings returned to the API.
  options: "-c timezone=UTC"
});

export const db = drizzle(pool, { schema, casing: "snake_case" });
