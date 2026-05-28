export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "mcq" | "short" | "long" | "case-study";
export type AssignmentStatus = "queued" | "generating" | "completed" | "failed";

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

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  sourceText?: string;
  questionSpecs: QuestionSpec[];
  instructions?: string;
  status: AssignmentStatus;
  jobId?: string;
  pdfJobId?: string;
  pdfPath?: string;
  error?: string;
  result?: GeneratedPaper;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
