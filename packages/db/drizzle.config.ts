
import { defineConfig } from "drizzle-kit";


if (!process.env.DIRECT_URL) {
  throw new Error("DATABASE_URL is not set");
}
 
export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DIRECT_URL,
  },
  strict: true,
  verbose: true,
});
 