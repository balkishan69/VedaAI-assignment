import type { Request, Response } from "express";
import { generationQueue, pdfQueue } from "../config/queues.js";
import { fail, ok } from "../utils/http.js";

export async function getJobHandler(req: Request, res: Response) {
  const jobId = req.params.jobId;
  if (!jobId) return fail(res, "Missing job id", 400);
  const id = Array.isArray(jobId) ? jobId[0] : jobId;
  if (!id) return fail(res, "Missing job id", 400);
  const job = (await generationQueue.getJob(id)) ?? (await pdfQueue.getJob(id));
  if (!job) return fail(res, "Job not found", 404);
  ok(res, {
    id: job.id,
    name: job.name,
    state: await job.getState(),
    progress: job.progress,
    failedReason: job.failedReason
  });
}
