import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

console.log(`env path is ${path.resolve(process.cwd(), ".env")}`);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  PORT: z
    .preprocess((v) => {
      if (typeof v === "string" && v.trim().length > 0) return Number(v);
      if (typeof v === "number") return v;
      return undefined;
    }, z.number().int().min(1).max(65535))
    .default(3000),

  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 chars"),
  JWT_EXPIRES_IN: z.string().default("1h"),

  CORS_ORIGIN: z.string().optional(),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  AI_SERVICE_URL: z.string().url().default("http://localhost:8000/analyze"),
});

const env = envSchema.parse(process.env);

export default {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  corsOrigin: env.CORS_ORIGIN ?? "*",
  logLevel: env.LOG_LEVEL,
  aiServiceUrl: env.AI_SERVICE_URL,
};