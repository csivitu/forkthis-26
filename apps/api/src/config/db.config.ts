import { env } from "./env.config";

/**
 * Minimal database config shape. Put your ORM/driver setup here.
 * Example: Prisma client uses DATABASE_URL directly from env.
 */

export const dbConfig = {
  url: env.DATABASE_URL,
  pool: {
    max: Number(process.env.DB_POOL_MAX ?? 10),
    min: Number(process.env.DB_POOL_MIN ?? 0),
    idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_MS ?? 30000),
  },
};

export const makeDbConfig = () => ({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
});