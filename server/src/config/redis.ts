import Redis, { type RedisOptions } from "ioredis";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

// Connection options for standard caching and checkpointers
export const redisConfig: RedisOptions = {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// General-purpose Redis client
export const redis = new Redis(env.REDIS_URL, redisConfig);

redis.on("connect", () => {
  logger.info("Connected to Redis successfully");
});

redis.on("error", (err) => {
  logger.error("Redis connection error", { error: err.message });
});

// BullMQ connection options (MUST have maxRetriesPerRequest set to null)
export const bullRedisConnectionOpts = {
  connection: new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  }),
};
