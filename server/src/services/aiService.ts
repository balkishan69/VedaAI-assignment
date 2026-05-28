import { GoogleGenerativeAI } from "@google/generative-ai";
import { nanoid } from "nanoid";
import { env } from "../config/env.js";
import type { GeneratedPaper, GeneratedSection, QuestionSpec } from "../types/assessment.js";
import type { AssignmentDocument } from "../models/Assignment.js";
import { buildGenerationPrompt } from "./promptService.js";

function sectionName(index: number) {
  return `Section ${String.fromCharCode(65 + index)}`;
}

function normalizeJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function validatePaper(value: unknown): GeneratedPaper {
  const paper = value as GeneratedPaper;
  if (!paper || !Array.isArray(paper.sections) || paper.sections.length === 0) {
    throw new Error("AI response did not include sections");
  }
  paper.totalMarks = paper.sections.reduce(
    (total, section) => total + section.questions.reduce((sum, question) => sum + Number(question.marks || 0), 0),
    0
  );
  paper.durationMinutes = Number(paper.durationMinutes || Math.max(45, paper.totalMarks * 2));
  return paper;
}

function questionStem(type: QuestionSpec["type"], subject: string, grade: string, sourceHint: string) {
  const topic = sourceHint || subject;
  if (type === "mcq") return `Choose the most accurate option for this ${subject} concept: ${topic}.`;
  if (type === "short") return `Explain the key idea of ${topic} for a Grade ${grade} learner.`;
  if (type === "case-study") return `Read a classroom scenario about ${topic} and analyze the best response.`;
  return `Evaluate ${topic} in detail using relevant examples from ${subject}.`;
}

function fallbackPaper(assignment: AssignmentDocument): GeneratedPaper {
  const sourceHint = assignment.sourceText?.split(/[.\n]/).find((line) => line.trim().length > 20)?.trim() ?? "";
  const sections: GeneratedSection[] = assignment.questionSpecs.map((spec, sectionIndex) => ({
    id: nanoid(),
    title: sectionName(sectionIndex),
    instruction: spec.type === "mcq" ? "Attempt all questions. Select the most appropriate answer." : "Attempt all questions with clear reasoning.",
    questions: Array.from({ length: spec.count }, (_, index) => ({
      id: nanoid(),
      text: `${questionStem(spec.type, assignment.subject, assignment.grade, sourceHint)} (${index + 1})`,
      type: spec.type,
      difficulty: spec.difficulty,
      marks: spec.marks
    }))
  }));

  const totalMarks = sections.reduce((total, section) => total + section.questions.reduce((sum, question) => sum + question.marks, 0), 0);
  return {
    title: `${assignment.subject} Assessment - ${assignment.grade}`,
    totalMarks,
    durationMinutes: Math.max(45, totalMarks * 2),
    sections
  };
}

export async function generateAssessment(assignment: AssignmentDocument): Promise<GeneratedPaper> {
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.includes("your_")) {
    return fallbackPaper(assignment);
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(buildGenerationPrompt(assignment));
  const text = result.response.text();
  return validatePaper(JSON.parse(normalizeJson(text)));
}
