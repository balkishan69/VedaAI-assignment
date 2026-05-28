import type { Assignment, AssignmentStatus, GeneratedPaper, GeneratedSection, QuestionSpec } from "./types";

const storageKey = "vedaai.offlineAssignments";

function makeId() {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sectionTitle(index: number) {
  return `Section ${String.fromCharCode(65 + index)}`;
}

function buildQuestion(spec: QuestionSpec, subject: string, grade: string, index: number, sourceText?: string) {
  const topic = sourceText?.split(/[.\n]/).find((line) => line.trim().length > 24)?.trim() || subject;
  if (spec.type === "mcq") return `Choose the most accurate option related to ${topic}.`;
  if (spec.type === "short") return `Explain ${topic} in a way that is appropriate for ${grade}.`;
  if (spec.type === "case-study") return `Analyze a classroom case where ${topic} affects a learner's decision.`;
  return `Evaluate ${topic} in detail with relevant examples from ${subject}. (${index + 1})`;
}

function buildPaper(input: {
  title: string;
  subject: string;
  grade: string;
  sourceText?: string;
  questionSpecs: QuestionSpec[];
}): GeneratedPaper {
  const sections: GeneratedSection[] = input.questionSpecs.map((spec, sectionIndex) => ({
    id: makeId(),
    title: sectionTitle(sectionIndex),
    instruction: spec.type === "mcq" ? "Attempt all questions. Select the most appropriate answer." : "Attempt all questions with clear reasoning.",
    questions: Array.from({ length: spec.count }, (_, questionIndex) => ({
      id: makeId(),
      text: buildQuestion(spec, input.subject, input.grade, questionIndex, input.sourceText),
      type: spec.type,
      difficulty: spec.difficulty,
      marks: spec.marks
    }))
  }));

  const totalMarks = sections.reduce((total, section) => total + section.questions.reduce((sum, question) => sum + question.marks, 0), 0);
  return {
    title: `${input.subject} Assessment - ${input.grade}`,
    totalMarks,
    durationMinutes: Math.max(45, totalMarks * 2),
    sections
  };
}

export function readOfflineAssignments() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Assignment[];
  } catch {
    return [];
  }
}

export function saveOfflineAssignment(assignment: Assignment) {
  const assignments = readOfflineAssignments().filter((item) => item._id !== assignment._id);
  window.localStorage.setItem(storageKey, JSON.stringify([assignment, ...assignments].slice(0, 20)));
}

export function getOfflineAssignment(id: string) {
  return readOfflineAssignments().find((assignment) => assignment._id === id);
}

export function createOfflineAssignment(input: {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  sourceText?: string;
  instructions?: string;
  questionSpecs: QuestionSpec[];
  status?: AssignmentStatus;
}) {
  const now = new Date().toISOString();
  const assignment: Assignment = {
    _id: makeId(),
    title: input.title,
    subject: input.subject,
    grade: input.grade,
    dueDate: input.dueDate,
    sourceText: input.sourceText,
    questionSpecs: input.questionSpecs,
    instructions: input.instructions,
    status: input.status ?? "completed",
    result: buildPaper(input),
    createdAt: now,
    updatedAt: now
  };
  saveOfflineAssignment(assignment);
  return assignment;
}
