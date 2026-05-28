"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  FileText,
  Plus,
  Send,
  Trash2,
  Sparkles,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { createAssignment } from "@/lib/api";
import { createOfflineAssignment } from "@/lib/offlineAssignments";
import { AssignmentFormValues, assignmentFormSchema } from "@/lib/validation";
import { useAssignmentStore } from "@/store/assignmentStore";
import { Button } from "./ui/Button";
import { Field, TextArea } from "./ui/Field";

const defaultValues: AssignmentFormValues = {
  title: "",
  subject: "",
  grade: "",
  dueDate: "",
  sourceText: "",
  instructions: "",
  questionSpecs: [
    { type: "mcq", count: 5, marks: 1, difficulty: "easy" },
    { type: "short", count: 3, marks: 3, difficulty: "medium" },
    { type: "long", count: 2, marks: 5, difficulty: "hard" },
  ],
};

const typeOptions = [
  { value: "mcq", label: "MCQ" },
  { value: "short", label: "Short Answer" },
  { value: "long", label: "Long Answer" },
  { value: "case-study", label: "Case Study" },
];

const difficultyOptions = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Moderate" },
  { value: "hard", label: "Hard" },
];

export function AssignmentForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const { setCurrent, upsertHistory, setProgress } = useAssignmentStore();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questionSpecs",
  });

  async function onSubmit(values: AssignmentFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    setProgress(8);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key !== "questionSpecs" && value)
        formData.append(key, String(value));
    });
    formData.append("questionSpecs", JSON.stringify(values.questionSpecs));
    if (file) formData.append("file", file);

    try {
      const assignment = await createAssignment(formData);
      setCurrent(assignment);
      upsertHistory(assignment);
      setProgress(12);
    } catch (error) {
      if (error instanceof Error && error.message === "Network Error") {
        const assignment = createOfflineAssignment(values);
        setCurrent(assignment);
        upsertHistory(assignment);
        setProgress(100);
        setSubmitError(
          "Backend is offline — a local preview was generated. Start MongoDB + Redis + the server for full queued flow."
        );
      } else {
        setProgress(0);
        setSubmitError(
          "Could not queue this assignment. Please review the form and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="create">
      {/* ─── Section 1: Basic Info ─── */}
      <div className="form-section animate-slide-up">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
            <BookOpen className="h-4 w-4 text-brand" />
          </div>
          <div>
            <h3 className="form-section-title">Assignment Details</h3>
            <p className="form-section-desc !mb-0">
              Title, subject, grade, and due date
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            label="Assignment Title"
            placeholder="e.g. Photosynthesis Concept Check"
            error={errors.title?.message}
            {...register("title")}
          />
          <Field
            label="Subject"
            placeholder="e.g. Biology"
            error={errors.subject?.message}
            {...register("subject")}
          />
          <Field
            label="Grade / Class"
            placeholder="e.g. Grade 10"
            error={errors.grade?.message}
            {...register("grade")}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Due Date"
            type="datetime-local"
            error={errors.dueDate?.message}
            {...register("dueDate")}
          />
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Reference File{" "}
              <span className="font-normal text-muted">(optional)</span>
            </span>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex h-11 w-full items-center justify-between rounded-lg border border-dashed border-ink/15 bg-white px-3.5 text-left text-sm transition-all hover:border-brand/40 hover:bg-brand/[0.02]"
            >
              <span className="flex min-w-0 items-center gap-2 text-muted">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {file ? file.name : "Upload PDF or text file"}
                </span>
              </span>
              <span className="shrink-0 rounded-md bg-brand/8 px-2.5 py-1 text-xs font-bold text-brand">
                Browse
              </span>
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(event) =>
                setFile(event.target.files?.[0] ?? null)
              }
            />
          </div>
        </div>
      </div>

      {/* ─── Section 2: Source Material ─── */}
      <div
        className="form-section animate-slide-up"
        style={{ animationDelay: "60ms" }}
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean/10">
            <GraduationCap className="h-4 w-4 text-ocean" />
          </div>
          <div>
            <h3 className="form-section-title">Source Material</h3>
            <p className="form-section-desc !mb-0">
              Paste chapter notes, objectives, or rubric text
            </p>
          </div>
        </div>
        <TextArea
          label="Source Text"
          placeholder="Paste chapter notes, learning objectives, or rubric text here. The AI will use this to generate contextual questions..."
          {...register("sourceText")}
        />
      </div>

      {/* ─── Section 3: Question Blueprint ─── */}
      <div
        className="form-section animate-slide-up"
        style={{ animationDelay: "120ms" }}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron/10">
              <Sparkles className="h-4 w-4 text-saffron" />
            </div>
            <div>
              <h3 className="form-section-title">Question Blueprint</h3>
              <p className="form-section-desc !mb-0">
                Define question types, counts, marks, and difficulty
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              append({
                type: "short",
                count: 2,
                marks: 2,
                difficulty: "medium",
              })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add Row
          </Button>
        </div>

        {/* Column headers */}
        <div className="mb-2 hidden grid-cols-[1.3fr_0.7fr_0.7fr_1fr_40px] gap-2.5 px-3 md:grid">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Type
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Count
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Marks
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            Difficulty
          </span>
          <span />
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="spec-row animate-fade-in"
            >
              <select
                className="h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                {...register(`questionSpecs.${index}.type`)}
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                className="h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                type="number"
                min={1}
                placeholder="Count"
                {...register(`questionSpecs.${index}.count`)}
              />
              <input
                className="h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                type="number"
                min={1}
                placeholder="Marks"
                {...register(`questionSpecs.${index}.marks`)}
              />
              <select
                className="h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                {...register(`questionSpecs.${index}.difficulty`)}
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={fields.length === 1}
                onClick={() => remove(index)}
                aria-label="Remove row"
                className="!min-h-9 !px-2"
              >
                <Trash2 className="h-4 w-4 text-coral/70" />
              </Button>
            </div>
          ))}
        </div>

        {errors.questionSpecs?.root?.message && (
          <p className="mt-2 text-xs font-medium text-coral animate-fade-in">
            {errors.questionSpecs.root.message}
          </p>
        )}
      </div>

      {/* ─── Section 4: Instructions ─── */}
      <div
        className="form-section animate-slide-up"
        style={{ animationDelay: "180ms" }}
      >
        <TextArea
          label="Additional Instructions"
          placeholder="Any special instructions for AI — e.g. 'Include one application-based question', 'Keep language simple', etc."
          error={errors.instructions?.message}
          {...register("instructions")}
        />
      </div>

      {/* ─── Error Alert ─── */}
      {submitError && (
        <div className="flex items-start gap-3 rounded-xl border border-coral/20 bg-coral/5 px-4 py-3 text-sm font-medium text-coral animate-slide-up">
          <span className="mt-0.5 shrink-0">⚠️</span>
          <span>{submitError}</span>
        </div>
      )}

      {/* ─── Submit ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-muted">
          <CalendarClock className="h-4 w-4" />
          Generation runs in the background with live updates.
        </p>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Queueing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Generate Assessment
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
