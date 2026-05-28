import { z } from "zod";

export const questionSpecSchema = z.object({
  type: z.enum(["mcq", "short", "long", "case-study"]),
  count: z.coerce.number().int().min(1).max(80),
  marks: z.coerce.number().int().min(1).max(100),
  difficulty: z.enum(["easy", "medium", "hard"])
});

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(3).max(120),
  subject: z.string().trim().min(2).max(80),
  grade: z.string().trim().min(1).max(40),
  dueDate: z.coerce.date().refine((date) => date.getTime() > Date.now(), "Due date must be in the future"),
  sourceText: z.string().trim().max(16000).optional().or(z.literal("")),
  instructions: z.string().trim().max(3000).optional().or(z.literal("")),
  questionSpecs: z
    .preprocess((value) => {
      if (typeof value === "string") return JSON.parse(value);
      return value;
    }, z.array(questionSpecSchema).min(1).max(8))
    .refine((specs) => specs.reduce((sum, spec) => sum + spec.count, 0) <= 100, "Maximum 100 questions per paper")
});

export const assignmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(30).default(10),
  search: z.string().trim().max(80).optional(),
  status: z.enum(["queued", "generating", "completed", "failed"]).optional()
});
