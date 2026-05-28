import { AssignmentForm } from "@/components/AssignmentForm";
import { AssignmentHistory } from "@/components/AssignmentHistory";
import { LiveStatus } from "@/components/LiveStatus";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* ─── Hero Header ─── */}
        <header className="mb-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="animate-slide-up">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand/8 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-brand">
                AI-Powered Assessment Creator
              </span>
            </div>
            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              Create classroom-ready{" "}
              <span className="text-gradient">AI question papers</span>{" "}
              in minutes.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              Build a blueprint, upload optional reference material, and let
              the AI generation worker produce a structured exam paper — with
              live progress updates.
            </p>
          </div>
          <div className="animate-slide-in-right" style={{ animationDelay: "100ms" }}>
            <LiveStatus />
          </div>
        </header>

        {/* ─── Main Content ─── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section>
            <div className="mb-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
              <h2 className="text-xl font-extrabold text-ink">
                Assignment Setup
              </h2>
              <p className="mt-1 text-sm text-muted">
                Every field is validated before a generation job enters the
                queue.
              </p>
            </div>
            <AssignmentForm />
          </section>
          <div className="animate-slide-in-right" style={{ animationDelay: "200ms" }}>
            <AssignmentHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
