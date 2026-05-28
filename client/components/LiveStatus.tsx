"use client";

import { motion } from "framer-motion";
import { Loader2, Wand2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useAssignmentStore } from "@/store/assignmentStore";
import { Button } from "./ui/Button";

export function LiveStatus() {
  const { current, progress, setCurrent, setProgress, upsertHistory } =
    useAssignmentStore();

  useEffect(() => {
    if (!current?._id) return;
    const socket = getSocket();
    socket.emit("assignment:join", current._id);

    socket.on("assignment:progress", (payload: { progress: number }) =>
      setProgress(Number(payload.progress ?? 0))
    );
    socket.on(
      "assignment:completed",
      (payload: { assignment: typeof current }) => {
        setCurrent(payload.assignment);
        upsertHistory(payload.assignment);
        setProgress(100);
      }
    );
    socket.on("assignment:failed", () => setProgress(0));

    return () => {
      socket.off("assignment:progress");
      socket.off("assignment:completed");
      socket.off("assignment:failed");
    };
  }, [current?._id, setCurrent, setProgress, upsertHistory]);

  const isComplete = current?.status === "completed";
  const isFailed = current?.status === "failed";
  const displayProgress = isComplete ? 100 : progress;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sidebar via-[#1e1e3a] to-[#252547] p-6 text-white shadow-xl">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-saffron/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-brand/20 blur-2xl" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            Generation Status
          </p>
          <h2 className="mt-2 truncate text-lg font-extrabold leading-tight">
            {current ? current.title : "No assessment queued"}
          </h2>
          {current && (
            <p className="mt-1 text-sm text-white/50">
              {current.subject} · {current.grade}
            </p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            isComplete
              ? "bg-emerald-500/20"
              : isFailed
                ? "bg-coral/20"
                : "bg-white/10"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          ) : isFailed ? (
            <AlertCircle className="h-6 w-6 text-coral" />
          ) : current ? (
            <Loader2 className="h-6 w-6 animate-spin text-saffron" />
          ) : (
            <Wand2 className="h-6 w-6 text-saffron" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      {current && (
        <div className="relative mt-5">
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-white/40">
            <span>
              {isComplete
                ? "Generation complete"
                : isFailed
                  ? current.error || "Generation failed"
                  : `${displayProgress}% complete`}
            </span>
            <span className="font-bold text-white/50 capitalize">
              {current.status}
            </span>
          </div>
        </div>
      )}

      {/* Action */}
      {isComplete && (
        <div className="mt-4 animate-fade-in">
          <Link href={`/assignments/${current._id}`}>
            <Button
              variant="secondary"
              size="sm"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Wand2 className="h-3.5 w-3.5" />
              View Question Paper
            </Button>
          </Link>
        </div>
      )}

      {!current && (
        <p className="mt-4 text-sm text-white/30">
          Create an assignment below to start the AI generation queue.
        </p>
      )}
    </section>
  );
}
