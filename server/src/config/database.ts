import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../generated/prisma/client/client.js";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

const connectionString = env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({
  adapter,
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
});

prisma.$on("query", (e: Prisma.QueryEvent) => {
  if (e.query.trim() === "SELECT 1") return;

  const isSlow = e.duration >= env.SLOW_QUERY_THRESHOLD;
  const logLevel = isSlow ? "warn" : "info";
  const message = isSlow ? "SLOW QUERY DETECTED" : "Query";

  logger[logLevel](message, {
    query: e.query.toString(),
    params: e.params,
    duration: `${e.duration}ms`,
    threshold: `${env.SLOW_QUERY_THRESHOLD}ms`,
  });
});

export async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    logger.info("Database connection successful");
    return true;
  } catch (error) {
    logger.error("Database connection failed", { error });
    return false;
  }
}

// Graceful shutdown hooks
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export { prisma as db };
