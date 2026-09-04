import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
const repoRootEnv = path.resolve(currentFileDir, "../../../../.env");
const cwdEnv = path.resolve(process.cwd(), ".env");

dotenv.config({ path: repoRootEnv });
dotenv.config({ path: cwdEnv });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  JWT_EXPIRES_IN: z.string().default("1h"),

  CORS_ORIGIN: z.string().optional(),
  BETTER_AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.string().min(16),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  WEB_URL: z.string().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);