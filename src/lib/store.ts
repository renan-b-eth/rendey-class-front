"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { safeId } from "@/lib/utils";

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

type State = {
  lessons: Lesson[];
  addLesson: (input: Omit<Lesson, "id" | "createdAt" | "updatedAt">) => string;
  updateLesson: (id: string, patch: Partial<Omit<Lesson, "id" | "createdAt">>) => void;
  deleteLesson: (id: string) => void;
  getLesson: (id: string) => Lesson | undefined;
  seedIfEmpty: () => void;
};

const seed: Lesson[] = [
  {
    id: "seed-1",
    title: "Introduction to Fractions",
    subject: "Mathematics",
    grade: "6th grade",
    durationMin: 50,
    topic: "Fractions basics",
    objectives: "- Understand numerator/denominator\n- Compare simple fractions\n- Solve 5 practice problems",
    contentMd:
`## Warm-up (5 min)
Quick recap: parts of a whole.

## Teaching (15 min)
- Numerator vs denominator
- Visual models (pizza, bar model)
- Equivalent fractions (simple)

## Practice (20 min)
1. Shade 1/2, 1/3, 3/4
2. Compare 2/3 and 3/5

## Exit ticket (10 min)
3 questions, 1 open response.`,
    tags: ["fractions", "grade6"],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2
  }
];

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      lessons: [],
      addLesson: (input) => {
        const id = safeId();
        const now = Date.now();
        const lesson: Lesson = { id, createdAt: now, updatedAt: now, ...input };
        set({ lessons: [lesson, ...get().lessons] });
        return id;
      },
      updateLesson: (id, patch) => {
        const now = Date.now();
        set({
          lessons: get().lessons.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: now } : l)),
        });
      },
      deleteLesson: (id) => set({ lessons: get().lessons.filter((l) => l.id !== id) }),
      getLesson: (id) => get().lessons.find((l) => l.id === id),
      seedIfEmpty: () => {
        if (get().lessons.length === 0) set({ lessons: seed });
      },
    }),
    { name: "rendey_class_day1" }
  )
);
