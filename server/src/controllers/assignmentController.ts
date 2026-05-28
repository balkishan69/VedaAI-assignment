import type { Request, Response, NextFunction } from "express";
import fs from "node:fs";
import { Assignment } from "../models/Assignment.js";
import { assignmentQuerySchema } from "../schemas/assignmentSchemas.js";
import { createAssignment, enqueuePdf, enqueueRegeneration } from "../services/assignmentService.js";
import { emitAssignment } from "../services/socketService.js";
import { ok, fail } from "../utils/http.js";

function paramId(req: Request) {
  const id = req.params.id;
  if (!id) throw Object.assign(new Error("Missing assignment id"), { status: 400 });
  const normalized = Array.isArray(id) ? id[0] : id;
  if (!normalized) throw Object.assign(new Error("Missing assignment id"), { status: 400 });
  return normalized;
}

/** Wraps an async route handler so rejected promises are forwarded to Express error middleware. */
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export const createAssignmentHandler = asyncHandler(async (req, res) => {
  const assignment = await createAssignment(req.body, req.file);
  emitAssignment(assignment.id, "assignment:queued", { assignment });
  ok(res, assignment, "Assignment queued for generation", 201);
});

export const listAssignmentsHandler = asyncHandler(async (req, res) => {
  const query = assignmentQuerySchema.parse(req.query);
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.search) filter.$or = [{ title: new RegExp(query.search, "i") }, { subject: new RegExp(query.search, "i") }];

  const [items, total] = await Promise.all([
    Assignment.find(filter).sort({ createdAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
    Assignment.countDocuments(filter)
  ]);

  ok(res, { items, total, page: query.page, pages: Math.ceil(total / query.limit) }, "Assignments fetched");
});

export const getAssignmentHandler = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(paramId(req)).lean();
  if (!assignment) { fail(res, "Assignment not found", 404); return; }
  ok(res, assignment, "Assignment fetched");
});

export const regenerateAssignmentHandler = asyncHandler(async (req, res) => {
  const assignment = await enqueueRegeneration(paramId(req));
  if (!assignment) { fail(res, "Assignment not found", 404); return; }
  emitAssignment(assignment.id, "assignment:queued", { assignment });
  ok(res, assignment, "Regeneration queued");
});

export const createPdfHandler = asyncHandler(async (req, res) => {
  const assignment = await enqueuePdf(paramId(req));
  if (!assignment) { fail(res, "Completed assignment not found", 404); return; }
  ok(res, assignment, "PDF generation queued");
});

export const downloadPdfHandler = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(paramId(req));
  if (!assignment?.pdfPath || !fs.existsSync(assignment.pdfPath)) { fail(res, "PDF is not ready", 404); return; }
  res.download(assignment.pdfPath, `${assignment.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-paper.pdf`);
});
