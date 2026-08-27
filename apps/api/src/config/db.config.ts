import config from "./env.config.js";

/**
 * Minimal database config shape. Put your ORM/driver setup here.
 * Example: Prisma client uses DATABASE_URL directly from env.
 */

export const dbConfig = {
  url: config.databaseUrl,
  pool: {
    max: Number(process.env.DB_POOL_MAX ?? 10),
    min: Number(process.env.DB_POOL_MIN ?? 0),
    idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_MS ?? 30000),
  },
};

export const makeDbConfig = () => ({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === "production" ? { rejectUnauthorized: true } : false,
});