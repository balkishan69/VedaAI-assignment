import { Worker } from "bullmq";
import { connectDatabase } from "../config/database.js";
import { generationQueueName, pdfQueueName } from "../config/queues.js";
import { createRedisConnection } from "../config/redis.js";
import { logger } from "../config/logger.js";
import { Assignment } from "../models/Assignment.js";
import { generateAssessment } from "../services/aiService.js";
import { generateAssignmentPdf } from "../services/pdfService.js";

async function bootstrapWorkers() {
  await connectDatabase();

  const generationWorker = new Worker(
    generationQueueName,
    async (job) => {
      const assignment = await Assignment.findById(job.data.assignmentId);
      if (!assignment) throw new Error("Assignment not found");
      assignment.status = "generating";
      await assignment.save();
      await job.updateProgress(20);

      const result = await generateAssessment(assignment);
      await job.updateProgress(80);

      assignment.result = result;
      assignment.status = "completed";
      assignment.error = undefined;
      await assignment.save();
      await job.updateProgress(100);
      return { assignmentId: assignment.id };
    },
    { connection: createRedisConnection(), concurrency: 3 }
  );

  const pdfWorker = new Worker(
    pdfQueueName,
    async (job) => {
      const assignment = await Assignment.findById(job.data.assignmentId);
      if (!assignment) throw new Error("Assignment not found");
      const pdfPath = await generateAssignmentPdf(assignment);
      assignment.pdfPath = pdfPath;
      await assignment.save();
      return { assignmentId: assignment.id, pdfPath };
    },
    { connection: createRedisConnection(), concurrency: 2 }
  );

  generationWorker.on("completed", (job) => logger.info({ jobId: job.id }, "Generation completed"));
  generationWorker.on("failed", async (job, error) => {
    logger.error({ jobId: job?.id, error }, "Generation failed");
    if (job?.data.assignmentId) {
      await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: "failed", error: error.message });
    }
  });
  pdfWorker.on("completed", (job) => logger.info({ jobId: job.id }, "PDF completed"));

  logger.info("Workers started");
}

bootstrapWorkers().catch((error) => {
  logger.error(error);
  process.exit(1);
});
