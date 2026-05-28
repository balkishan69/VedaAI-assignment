export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "mcq" | "short" | "long" | "case-study";

export interface QuestionSpec {
  type: QuestionType;
  count: number;
  marks: number;
  difficulty: Difficulty;
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
}

export interface GeneratedSection {
  id: string;
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  title: string;
  totalMarks: number;
  durationMinutes: number;
  sections: GeneratedSection[];
}

export type AssignmentStatus = "queued" | "generating" | "completed" | "failed";
