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

type LessonUpsertInput =
  Omit<Lesson, "createdAt" | "updatedAt"> &
  Partial<Pick<Lesson, "createdAt" | "updatedAt">>;

type AppState = {
  // lessons
  lessons: Lesson[];

  // getters
  getLessons: () => Lesson[];
  getLesson: (id: string) => Lesson | undefined;
  getLessonById: (id: string) => Lesson | undefined;

  // writers
  upsertLesson: (data: LessonUpsertInput) => Lesson;
  addLesson: (data: LessonUpsertInput) => Lesson;          // compat (agents/page.tsx)
  updateLesson: (id: string, patch: Partial<Lesson>) => Lesson | undefined; // compat
  setLessons: (lessons: Lesson[]) => void;                 // compat
  removeLesson: (id: string) => void;
  clearLessons: () => void;

  // agents
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

function normalizeLesson(input: LessonUpsertInput, existing?: Lesson): Lesson {
  const now = Date.now();
  const id = input.id || existing?.id || uid("lesson");
  const createdAt = input.createdAt ?? existing?.createdAt ?? now;

  return {
    id,
    title: (input.title ?? existing?.title ?? "").trim(),
    subject: (input.subject ?? existing?.subject ?? "General").trim(),
    grade: (input.grade ?? existing?.grade ?? "General").trim(),
    durationMin: Number(input.durationMin ?? existing?.durationMin ?? 50) || 50,
    topic: (input.topic ?? existing?.topic ?? "").trim(),
    objectives: (input.objectives ?? existing?.objectives ?? "").trim(),
    contentMd: (input.contentMd ?? existing?.contentMd ?? "").trim(),
    tags: Array.isArray(input.tags) ? input.tags : (existing?.tags ?? []),
    createdAt,
    updatedAt: input.updatedAt ?? now,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lessons: [],
      agentRuns: [],
      lastOpenedLessonId: undefined,

      // ---------------- GETTERS ----------------
      getLessons: () => get().lessons,
      getLesson: (id) => get().lessons.find((l) => l.id === id),
      getLessonById: (id) => get().lessons.find((l) => l.id === id),

      // ---------------- WRITERS ----------------
      upsertLesson: (data) => {
        const existing = get().lessons.find((l) => l.id === data.id);
        const lesson = normalizeLesson(data, existing);

        set((state) => {
          const idx = state.lessons.findIndex((l) => l.id === lesson.id);
          if (idx >= 0) {
            const next = [...state.lessons];
            next[idx] = lesson;
            return { lessons: next, lastOpenedLessonId: lesson.id };
          }
          return { lessons: [lesson, ...state.lessons], lastOpenedLessonId: lesson.id };
        });

        return lesson;
      },

      // compat: alguns lugares chamam addLesson
      addLesson: (data) => {
        return get().upsertLesson(data);
      },

      // compat: alguns lugares chamam updateLesson(id, patch)
      updateLesson: (id, patch) => {
        const existing = get().lessons.find((l) => l.id === id);
        if (!existing) return undefined;

        const merged: LessonUpsertInput = {
          ...existing,
          ...patch,
          id,
          updatedAt: Date.now(),
        };

        return get().upsertLesson(merged);
      },

      // compat: alguns lugares podem usar setLessons
      setLessons: (lessons) => {
        const now = Date.now();
        const normalized = (lessons ?? []).map((l) => ({
          ...l,
          createdAt: l.createdAt ?? now,
          updatedAt: l.updatedAt ?? now,
          tags: Array.isArray(l.tags) ? l.tags : [],
        }));
        set({ lessons: normalized });
      },

      removeLesson: (id) =>
        set((state) => ({
          lessons: state.lessons.filter((l) => l.id !== id),
          lastOpenedLessonId: state.lastOpenedLessonId === id ? undefined : state.lastOpenedLessonId,
        })),

      clearLessons: () => set({ lessons: [], lastOpenedLessonId: undefined }),

      // ---------------- AGENTS ----------------
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

      // ---------------- MISC ----------------
      setLastOpenedLessonId: (id) => set({ lastOpenedLessonId: id }),
    }),
    {
      name: "rendey-class-front-store",
      version: 2,
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
