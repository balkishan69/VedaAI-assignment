import { cn } from "@/lib/utils";
import type { AssignmentStatus, Difficulty } from "@/lib/types";

/* ─── Difficulty Badge ─── */
const difficultyConfig: Record<Difficulty, { className: string; label: string }> = {
  easy: { className: "badge-easy", label: "Easy" },
  medium: { className: "badge-medium", label: "Moderate" },
  hard: { className: "badge-hard", label: "Hard" },
};

export function DifficultyBadge({ value }: { value: Difficulty }) {
  const config = difficultyConfig[value];
  return (
    <span className={cn("badge", config.className)}>
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          value === "easy" && "bg-emerald-500",
          value === "medium" && "bg-amber-500",
          value === "hard" && "bg-rose-500"
        )}
      />
      {config.label}
    </span>
  );
}

/* ─── Status Badge ─── */
const statusConfig: Record<AssignmentStatus, { className: string; label: string }> = {
  queued: { className: "badge-status-queued", label: "Queued" },
  generating: { className: "badge-status-generating", label: "Generating" },
  completed: { className: "badge-status-completed", label: "Completed" },
  failed: { className: "badge-status-failed", label: "Failed" },
};

export function StatusBadge({ value }: { value: AssignmentStatus }) {
  const config = statusConfig[value];
  return (
    <span className={cn("badge", config.className)}>
      {value === "generating" && (
        <span className="relative mr-0.5 inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ocean opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-ocean" />
        </span>
      )}
      {value === "completed" && (
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {config.label}
    </span>
  );
}
