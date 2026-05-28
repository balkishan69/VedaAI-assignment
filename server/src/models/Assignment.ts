import mongoose, { Schema } from "mongoose";
import type { AssignmentStatus, GeneratedPaper, QuestionSpec } from "../types/assessment.js";

export interface AssignmentDocument extends mongoose.Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  sourceText?: string;
  uploadedFile?: {
    originalName: string;
    mimeType: string;
    path: string;
    size: number;
  };
  questionSpecs: QuestionSpec[];
  instructions?: string;
  status: AssignmentStatus;
  jobId?: string;
  pdfJobId?: string;
  pdfPath?: string;
  error?: string;
  result?: GeneratedPaper;
  createdAt: Date;
  updatedAt: Date;
}

const questionSpecSchema = new Schema<QuestionSpec>(
  {
    type: { type: String, enum: ["mcq", "short", "long", "case-study"], required: true },
    count: { type: Number, min: 1, max: 80, required: true },
    marks: { type: Number, min: 1, max: 100, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true }
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    type: { type: String, required: true },
    difficulty: { type: String, required: true },
    marks: { type: Number, required: true }
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [questionSchema], required: true }
  },
  { _id: false }
);

const assignmentSchema = new Schema<AssignmentDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subject: { type: String, required: true, trim: true, maxlength: 80 },
    grade: { type: String, required: true, trim: true, maxlength: 40 },
    dueDate: { type: Date, required: true, index: true },
    sourceText: { type: String, maxlength: 16000 },
    uploadedFile: {
      originalName: String,
      mimeType: String,
      path: String,
      size: Number
    },
    questionSpecs: { type: [questionSpecSchema], validate: [(v: QuestionSpec[]) => v.length > 0, "At least one question type is required"] },
    instructions: { type: String, maxlength: 3000 },
    status: { type: String, enum: ["queued", "generating", "completed", "failed"], default: "queued", index: true },
    jobId: { type: String, index: true },
    pdfJobId: String,
    pdfPath: String,
    error: String,
    result: {
      title: String,
      totalMarks: Number,
      durationMinutes: Number,
      sections: [sectionSchema]
    }
  },
  { timestamps: true }
);

assignmentSchema.index({ createdAt: -1 });
assignmentSchema.index({ subject: 1, grade: 1 });

export const Assignment = mongoose.model<AssignmentDocument>("Assignment", assignmentSchema);
