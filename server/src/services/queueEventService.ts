import { QueueEvents } from "bullmq";
import { generationQueueName, pdfQueueName } from "../config/queues.js";
import { createRedisConnection } from "../config/redis.js";
import { Assignment } from "../models/Assignment.js";
import { emitAssignment } from "./socketService.js";
import { logger } from "../config/logger.js";

export function startQueueEventBridge() {
  const generationEvents = new QueueEvents(generationQueueName, { connection: createRedisConnection() });
  const pdfEvents = new QueueEvents(pdfQueueName, { connection: createRedisConnection() });

  generationEvents.on("progress", async ({ jobId, data }) => {
    const assignment = await Assignment.findOne({ jobId }).lean();
    if (assignment) emitAssignment(String(assignment._id), "assignment:progress", { assignmentId: String(assignment._id), progress: data });
  });

  generationEvents.on("completed", async ({ jobId }) => {
    const assignment = await Assignment.findOne({ jobId }).lean();
    if (assignment) emitAssignment(String(assignment._id), "assignment:completed", { assignment });
  });

  generationEvents.on("failed", async ({ jobId, failedReason }) => {
    const assignment = await Assignment.findOne({ jobId }).lean();
    if (assignment) emitAssignment(String(assignment._id), "assignment:failed", { assignmentId: String(assignment._id), error: failedReason });
  });

  pdfEvents.on("completed", async ({ jobId }) => {
    const assignment = await Assignment.findOne({ pdfJobId: jobId }).lean();
    if (assignment) emitAssignment(String(assignment._id), "pdf:completed", { assignment });
  });

  generationEvents.on("error", (error) => logger.error(error, "Generation QueueEvents error"));
  pdfEvents.on("error", (error) => logger.error(error, "PDF QueueEvents error"));
}
