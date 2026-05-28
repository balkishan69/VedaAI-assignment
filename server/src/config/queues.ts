import { Queue } from "bullmq";
import { createRedisConnection } from "./redis.js";

export const generationQueueName = "assessment-generation";
export const pdfQueueName = "assessment-pdf";

export const generationQueue = new Queue(generationQueueName, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 2500 },
    removeOnComplete: { age: 60 * 60 * 24, count: 500 },
    removeOnFail: { age: 60 * 60 * 24 * 7 }
  }
});

export const pdfQueue = new Queue(pdfQueueName, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 1500 },
    removeOnComplete: { age: 60 * 60 * 24, count: 500 },
    removeOnFail: { age: 60 * 60 * 24 * 7 }
  }
});
