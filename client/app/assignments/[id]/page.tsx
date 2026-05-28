"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PaperView } from "@/components/PaperView";
import { fetchAssignment } from "@/lib/api";
import { getOfflineAssignment } from "@/lib/offlineAssignments";
import type { Assignment } from "@/lib/types";
import { getSocket } from "@/lib/socket";
import { useAssignmentStore } from "@/store/assignmentStore";

export default function AssignmentPage() {
  const params = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setCurrent, upsertHistory, setProgress } = useAssignmentStore();

  useEffect(() => {
    const id = params.id;
    fetchAssignment(id)
      .then((data) => {
        setAssignment(data);
        setCurrent(data);
      })
      .catch(() => {
        const offline = getOfflineAssignment(id) ?? null;
        setAssignment(offline);
        if (offline) setCurrent(offline);
      })
      .finally(() => setIsLoading(false));
  }, [params.id, setCurrent]);

  /* Listen for real-time updates if paper is still generating */
  useEffect(() => {
    if (!assignment?._id || assignment._id.startsWith("offline-")) return;
    if (assignment.status === "completed") return;

    const socket = getSocket();
    socket.emit("assignment:join", assignment._id);

    socket.on("assignment:completed", (payload: { assignment: Assignment }) => {
      setAssignment(payload.assignment);
      setCurrent(payload.assignment);
      upsertHistory(payload.assignment);
      setProgress(100);
    });

    socket.on("assignment:progress", (payload: { progress: number }) => {
      setProgress(Number(payload.progress ?? 0));
    });

    socket.on("assignment:failed", () => {
      setProgress(0);
    });

    return () => {
      socket.off("assignment:completed");
      socket.off("assignment:progress");
      socket.off("assignment:failed");
    };
  }, [assignment?._id, assignment?.status, setCurrent, upsertHistory, setProgress]);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="no-print mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Creator
        </Link>

        {isLoading ? (
          <div className="card flex flex-col items-center gap-4 p-16 text-center animate-fade-in">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-sm font-medium text-muted">
              Loading question paper...
            </p>
          </div>
        ) : assignment ? (
          <PaperView assignment={assignment} />
        ) : (
          <div className="card flex flex-col items-center gap-4 p-16 text-center animate-fade-in">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-coral/10">
              <span className="text-2xl">📄</span>
            </div>
            <h2 className="text-lg font-extrabold text-ink">
              Assignment not found
            </h2>
            <p className="text-sm text-muted">
              This paper may have been removed or the link is invalid.
            </p>
            <Link
              href="/"
              className="mt-2 text-sm font-bold text-brand hover:underline"
            >
              Return to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
