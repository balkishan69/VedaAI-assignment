import type { AssignmentDocument } from "../models/Assignment.js";

export function buildGenerationPrompt(assignment: AssignmentDocument) {
  const specs = assignment.questionSpecs
    .map((spec) => `- ${spec.count} ${spec.difficulty} ${spec.type} question(s), ${spec.marks} mark(s) each`)
    .join("\n");

  return `
You are an expert teacher creating a fair, well-structured exam paper.

Return only valid JSON matching this TypeScript shape:
{
  "title": string,
  "totalMarks": number,
  "durationMinutes": number,
  "sections": [
    {
      "id": string,
      "title": string,
      "instruction": string,
      "questions": [
        {
          "id": string,
          "text": string,
          "type": "mcq" | "short" | "long" | "case-study",
          "difficulty": "easy" | "medium" | "hard",
          "marks": number
        }
      ]
    }
  ]
}

Assignment:
Title: ${assignment.title}
Subject: ${assignment.subject}
Grade: ${assignment.grade}
Due date: ${assignment.dueDate.toISOString()}

Question requirements:
${specs}

Source material:
${assignment.sourceText || "No source material provided. Generate curriculum-appropriate questions."}

Teacher instructions:
${assignment.instructions || "Create balanced, clear, non-repetitive questions."}

Rules:
- Group questions into Section A, Section B, etc.
- Do not include answers.
- Every question must have a difficulty and marks.
- Total marks must equal the sum of all question marks.
- Keep question text specific, readable, and classroom-ready.
`.trim();
}
