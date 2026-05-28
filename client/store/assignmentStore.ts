import { create } from "zustand";
import type { Assignment } from "@/lib/types";

interface AssignmentState {
  current?: Assignment;
  history: Assignment[];
  progress: number;
  setCurrent: (assignment?: Assignment) => void;
  upsertHistory: (assignment: Assignment) => void;
  setHistory: (assignments: Assignment[]) => void;
  setProgress: (progress: number) => void;
  reset: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  history: [],
  progress: 0,
  setCurrent: (assignment) => set({ current: assignment }),
  setHistory: (assignments) => set({ history: assignments }),
  setProgress: (progress) => set({ progress: Math.min(100, Math.max(0, progress)) }),
  upsertHistory: (assignment) =>
    set((state) => ({
      history: [
        assignment,
        ...state.history.filter((item) => item._id !== assignment._id),
      ].slice(0, 50),
    })),
  reset: () => set({ current: undefined, history: [], progress: 0 }),
}));
