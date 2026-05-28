import { z } from "zod";

export const assignmentFormSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  subject: z.string().trim().min(2, "Subject is required"),
  grade: z.string().trim().min(1, "Grade is required"),
  dueDate: z.string().min(1, "Due date is required").refine((value) => new Date(value).getTime() > Date.now(), "Choose a future due date"),
  sourceText: z.string().max(16000).optional(),
  instructions: z.string().max(3000).optional(),
  questionSpecs: z
    .array(
      z.object({
        type: z.enum(["mcq", "short", "long", "case-study"]),
        count: z.coerce.number().int().min(1, "Must be positive").max(80),
        marks: z.coerce.number().int().min(1, "Must be positive").max(100),
        difficulty: z.enum(["easy", "medium", "hard"])
      })
    )
    .min(1)
});

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;
