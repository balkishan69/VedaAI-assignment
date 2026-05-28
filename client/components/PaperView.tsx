"use client";

import { Download, RefreshCw, Printer, ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
  fetchAssignment,
  pdfUrl,
  regenerateAssignment,
  requestPdf,
} from "@/lib/api";
import { createOfflineAssignment } from "@/lib/offlineAssignments";
import type { Assignment } from "@/lib/types";
import { formatQuestionType } from "@/lib/utils";
import { DifficultyBadge, StatusBadge } from "./StatusBadge";
import { Button } from "./ui/Button";

export function PaperView({
  assignment: initialAssignment,
}: {
  assignment: Assignment;
}) {
  const [assignment, setAssignment] = useState(initialAssignment);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      if (assignment._id.startsWith("offline-")) {
        setAssignment(
          createOfflineAssignment({
            title: assignment.title,
            subject: assignment.subject,
            grade: assignment.grade,
            dueDate: assignment.dueDate,
            sourceText: assignment.sourceText,
            instructions: assignment.instructions,
            questionSpecs: assignment.questionSpecs,
          })
        );
        return;
      }
      const updated = await regenerateAssignment(assignment._id);
      setAssignment(updated);
    } finally {
      setRegenerating(false);
    }
  }

  async function handlePdf() {
    if (assignment._id.startsWith("offline-")) return;
    setPdfLoading(true);
    try {
      const updated = await requestPdf(assignment._id);
      setAssignment(updated);
      for (let attempt = 0; attempt < 10; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 900));
        const latest = await fetchAssignment(assignment._id);
        setAssignment(latest);
        if (latest.pdfPath) {
          window.location.href = pdfUrl(assignment._id);
          return;
        }
      }
    } finally {
      setPdfLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  /* ─── Loading / Error State ─── */
  if (!assignment.result) {
    return (
      <div className="card flex flex-col items-center gap-4 p-12 text-center animate-fade-in">
        <StatusBadge value={assignment.status} />
        <h1 className="text-2xl font-extrabold text-ink">
          {assignment.title}
        </h1>
        <p className="max-w-md text-sm text-muted">
          {assignment.error ||
            "The AI worker is still preparing this question paper. You'll be notified when it's ready."}
        </p>
        {assignment.status === "generating" && (
          <div className="mt-2 flex items-center gap-2 text-sm text-ocean">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ocean/30 border-t-ocean" />
            Processing...
          </div>
        )}
      </div>
    );
  }

  const totalQuestions = assignment.result.sections.reduce(
    (acc, s) => acc + s.questions.length,
    0
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─── Action Bar ─── */}
      <div className="no-print sticky top-3 z-10 flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white/90 p-4 shadow-soft backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Generated Question Paper
          </p>
          <h1 className="mt-1 text-xl font-extrabold text-ink">
            {assignment.result.title}
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            {totalQuestions} questions · {assignment.result.totalMarks} marks ·{" "}
            {assignment.result.durationMinutes} min
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`}
            />
            {regenerating ? "Regenerating..." : "Regenerate"}
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={handlePdf}
            disabled={
              pdfLoading || assignment._id.startsWith("offline-")
            }
            title={
              assignment._id.startsWith("offline-")
                ? "Start the backend for PDF generation"
                : undefined
            }
          >
            <Download className="h-3.5 w-3.5" />
            {pdfLoading ? "Preparing..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* ─── Exam Paper ─── */}
      <article className="exam-paper p-6 sm:p-10">
        {/* Paper Header */}
        <header className="border-b-2 border-ink/20 pb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            {assignment.grade}
          </p>
          <h2 className="mt-2 font-serif text-2xl font-black tracking-tight text-ink sm:text-3xl">
            {assignment.result.title}
          </h2>
          <div className="mx-auto mt-4 flex max-w-lg flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-ink/70">
            <span>
              <strong className="font-semibold text-ink">Subject:</strong>{" "}
              {assignment.subject}
            </span>
            <span>
              <strong className="font-semibold text-ink">Total Marks:</strong>{" "}
              {assignment.result.totalMarks}
            </span>
            <span>
              <strong className="font-semibold text-ink">Duration:</strong>{" "}
              {assignment.result.durationMinutes} minutes
            </span>
          </div>
        </header>

        {/* Student Info */}
        <section className="grid gap-x-8 gap-y-4 border-b border-ink/10 py-6 sm:grid-cols-3">
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-ink">Name:</span>
            <span className="flex-1 border-b border-ink/30" />
          </div>
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-ink">Roll Number:</span>
            <span className="flex-1 border-b border-ink/30" />
          </div>
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-semibold text-ink">Section:</span>
            <span className="flex-1 border-b border-ink/30" />
          </div>
        </section>

        {/* General Instructions */}
        <div className="border-b border-ink/10 py-5">
          <h3 className="text-sm font-bold text-ink">General Instructions:</h3>
          <ul className="mt-2 space-y-1 pl-5 text-xs text-ink/70">
            <li className="list-disc">All questions are compulsory unless stated otherwise.</li>
            <li className="list-disc">Read each question carefully before attempting.</li>
            <li className="list-disc">
              Marks for each question are indicated on the right.
            </li>
            <li className="list-disc">
              Total time allowed: {assignment.result.durationMinutes} minutes.
            </li>
          </ul>
        </div>

        {/* ─── Sections ─── */}
        <div className="space-y-10 pt-6">
          {assignment.result.sections.map((section, sectionIdx) => (
            <section
              key={section.id}
              className="animate-slide-up"
              style={{ animationDelay: `${sectionIdx * 100}ms` }}
            >
              {/* Section Header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-xs font-extrabold text-white shadow-sm">
                  {String.fromCharCode(65 + sectionIdx)}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-ink">
                    {section.title}
                  </h3>
                  <p className="text-sm italic text-muted">
                    {section.instruction}
                  </p>
                </div>
              </div>

              {/* Questions */}
              <ol className="space-y-3">
                {section.questions.map((question, qIdx) => (
                  <li key={question.id} className="question-item">
                    <div className="question-number">{qIdx + 1}</div>
                    <div className="min-w-0 py-1">
                      <p className="text-sm leading-relaxed text-ink/90">
                        {question.text}
                      </p>
                      <p className="mt-2 text-xs font-medium text-muted">
                        {formatQuestionType(question.type)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 pt-1">
                      <DifficultyBadge value={question.difficulty} />
                      <span className="rounded-lg bg-ink/5 px-3 py-1 text-xs font-bold text-ink/70">
                        {question.marks}{" "}
                        {question.marks === 1 ? "mark" : "marks"}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-ink/10 pt-6 text-center">
          <p className="text-xs font-semibold text-muted">
            ── End of Question Paper ──
          </p>
          <p className="mt-1 text-[10px] text-muted/60">
            Generated by VedaAI Assessment Creator
          </p>
        </div>
      </article>
    </div>
  );
}
