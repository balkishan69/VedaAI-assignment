"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useEffect } from "react";
import { Clock, FileText } from "lucide-react";
import { fetchAssignments } from "@/lib/api";
import { readOfflineAssignments } from "@/lib/offlineAssignments";
import { useAssignmentStore } from "@/store/assignmentStore";
import { StatusBadge } from "./StatusBadge";

export function AssignmentHistory() {
  const { history, setHistory } = useAssignmentStore();

  useEffect(() => {
    fetchAssignments()
      .then((data) => setHistory(data.items))
      .catch(() => setHistory(readOfflineAssignments()));
  }, [setHistory]);

  return (
    <aside id="history" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-ink">Recent Papers</h2>
        {history.length > 0 && (
          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-bold text-muted">
            {history.length}
          </span>
        )}
      </div>
      <div className="space-y-2.5">
        {history.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/5">
              <FileText className="h-5 w-5 text-muted" />
            </div>
            <p className="text-sm font-medium text-muted">
              Generated assignments will appear here.
            </p>
          </div>
        ) : (
          history.slice(0, 8).map((assignment, index) => (
            <Link
              key={assignment._id}
              href={`/assignments/${assignment._id}`}
              className="card block p-3.5 transition-all hover:border-brand/30 hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">
                    {assignment.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {assignment.subject} · {assignment.grade}
                  </p>
                </div>
                <StatusBadge value={assignment.status} />
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted/70">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(assignment.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}
