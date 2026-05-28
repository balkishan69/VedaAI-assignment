import { Redis } from "ioredis";
import { env } from "./env.js";

export function createRedisConnection() {
  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,

    tls:
      process.env.REDIS_TLS === "true"
        ? {}
        : undefined,

    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}