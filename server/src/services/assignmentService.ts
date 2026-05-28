import fs from "node:fs/promises";
import type { Express } from "express";
import { generationQueue, pdfQueue } from "../config/queues.js";
import { Assignment } from "../models/Assignment.js";
import type { QuestionSpec } from "../types/assessment.js";

export interface CreateAssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  sourceText?: string;
  instructions?: string;
  questionSpecs: QuestionSpec[];
}

async function readUploadText(file?: Express.Multer.File) {
  if (!file) return undefined;
  if (file.mimetype === "text/plain") {
    return fs.readFile(file.path, "utf8");
  }
  return `Uploaded PDF: ${file.originalname}. Use the teacher's instructions and assignment metadata to create the assessment.`;
}

export async function createAssignment(input: CreateAssignmentInput, file?: Express.Multer.File) {
  const uploadText = await readUploadText(file);
  const assignment = await Assignment.create({
    ...input,
    sourceText: [input.sourceText, uploadText].filter(Boolean).join("\n\n").trim(),
    uploadedFile: file
      ? {
          originalName: file.originalname,
          mimeType: file.mimetype,
          path: file.path,
          size: file.size
        }
      : undefined,
    status: "queued"
  });

  const job = await generationQueue.add("generate", { assignmentId: assignment.id });
  assignment.jobId = job.id;
  await assignment.save();
  return assignment;
}

export async function enqueueRegeneration(assignmentId: string) {
  const assignment = await Assignment.findByIdAndUpdate(
    assignmentId,
    { status: "queued", error: undefined, result: undefined, pdfPath: undefined },
    { new: true }
  );
  if (!assignment) return null;
  const job = await generationQueue.add("regenerate", { assignmentId: assignment.id });
  assignment.jobId = job.id;
  await assignment.save();
  return assignment;
}

export async function enqueuePdf(assignmentId: string) {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment || assignment.status !== "completed") return null;
  const job = await pdfQueue.add("pdf", { assignmentId: assignment.id });
  assignment.pdfJobId = job.id;
  await assignment.save();
  return assignment;
}
