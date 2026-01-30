// src/lib/store.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lesson = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  durationMin: number;
  topic: string;
  objectives: string;
  contentMd: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
};

export type AgentRun = {
  id: string;
  type: "lesson" | "quiz" | "rubric" | "feedback";
  input: string;
  output: string;
  createdAt: number;
};

type AppState = {
  // lessons
  lessons: Lesson[];
  getLessonById: (id: string) => Lesson | undefined;
  upsertLesson: (data: Omit<Lesson, "createdAt" | "updatedAt"> & Partial<Pick<Lesson, "createdAt" | "updatedAt">>) => Lesson;
  removeLesson: (id: string) => void;

  // agents (placeholder local)
  agentRuns: AgentRun[];
  addAgentRun: (run: Omit<AgentRun, "id" | "createdAt">) => AgentRun;
  clearAgentRuns: () => void;

  // misc
  lastOpenedLessonId?: string;
  setLastOpenedLessonId: (id?: string) => void;
};

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lessons: [],
      agentRuns: [],
      lastOpenedLessonId: undefined,

      getLessonById: (id) => get().lessons.find((l) => l.id === id),

      upsertLesson: (data) => {
        const now = Date.now();
        const id = data.id || uid("lesson");

        const existing = get().lessons.find((l) => l.id === id);
        const createdAt = data.createdAt ?? existing?.createdAt ?? now;

        const lesson: Lesson = {
          id,
          title: (data.title ?? "").trim(),
          subject: (data.subject ?? "General").trim(),
          grade: (data.grade ?? "General").trim(),
          durationMin: Number(data.durationMin ?? 50) || 50,
          topic: (data.topic ?? "").trim(),
          objectives: (data.objectives ?? "").trim(),
          contentMd: (data.contentMd ?? "").trim(),
          tags: Array.isArray(data.tags) ? data.tags : [],
          createdAt,
          updatedAt: data.updatedAt ?? now,
        };

        set((state) => {
          const idx = state.lessons.findIndex((l) => l.id === id);
          if (idx >= 0) {
            const next = [...state.lessons];
            next[idx] = lesson;
            return { lessons: next, lastOpenedLessonId: id };
          }
          return { lessons: [lesson, ...state.lessons], lastOpenedLessonId: id };
        });

        return lesson;
      },

      removeLesson: (id) =>
        set((state) => ({
          lessons: state.lessons.filter((l) => l.id !== id),
          lastOpenedLessonId: state.lastOpenedLessonId === id ? undefined : state.lastOpenedLessonId,
        })),

      addAgentRun: (run) => {
        const item: AgentRun = {
          id: uid("run"),
          type: run.type,
          input: run.input,
          output: run.output,
          createdAt: Date.now(),
        };
        set((state) => ({ agentRuns: [item, ...state.agentRuns] }));
        return item;
      },

      clearAgentRuns: () => set({ agentRuns: [] }),

      setLastOpenedLessonId: (id) => set({ lastOpenedLessonId: id }),
    }),
    {
      name: "rendey-class-front-store",
      version: 1,
      partialize: (state) => ({
        lessons: state.lessons,
        agentRuns: state.agentRuns,
        lastOpenedLessonId: state.lastOpenedLessonId,
      }),
    }
  )
);

// Compat: algumas telas importam useLessonStore
export const useLessonStore = useAppStore;
