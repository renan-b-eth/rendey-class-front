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

type LessonInput = Omit<Lesson, "id" | "createdAt" | "updatedAt">;

type LessonState = {
  lessons: Lesson[];
  addLesson: (input: LessonInput) => Lesson;
  updateLesson: (id: string, patch: Partial<Lesson>) => Lesson | null;
  removeLesson: (id: string) => void;
  getLesson: (id: string) => Lesson | null;
};

function uid() {
  // browser-safe unique id
  return (
    (globalThis.crypto?.randomUUID?.() as string | undefined) ??
    `lsn_${Math.random().toString(16).slice(2)}_${Date.now()}`
  );
}

export const useLessonStore = create<LessonState>()(
  persist(
    (set, get) => ({
      lessons: [],

      addLesson: (input) => {
        const now = Date.now();
        const lesson: Lesson = {
          id: uid(),
          createdAt: now,
          updatedAt: now,
          title: input.title,
          subject: input.subject,
          grade: input.grade,
          durationMin: input.durationMin ?? 50,
          topic: input.topic ?? "",
          objectives: input.objectives ?? "",
          contentMd: input.contentMd ?? "",
          tags: Array.isArray(input.tags) ? input.tags : [],
        };

        set((s) => ({ lessons: [lesson, ...s.lessons] }));
        return lesson;
      },

      updateLesson: (id, patch) => {
        const current = get().lessons.find((l) => l.id === id);
        if (!current) return null;

        const updated: Lesson = {
          ...current,
          ...patch,
          updatedAt: Date.now(),
        };

        set((s) => ({
          lessons: s.lessons.map((l) => (l.id === id ? updated : l)),
        }));

        return updated;
      },

      removeLesson: (id) => {
        set((s) => ({ lessons: s.lessons.filter((l) => l.id !== id) }));
      },

      getLesson: (id) => {
        return get().lessons.find((l) => l.id === id) ?? null;
      },
    }),
    {
      name: "rendey-class-lessons",
      version: 1,
    }
  )
);

// ✅ compat: se algum lugar do projeto usa outro nome
export const useStore = useLessonStore;
