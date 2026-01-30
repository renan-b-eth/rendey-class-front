"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LessonForm } from "@/components/editor/LessonForm";
import { useAppStore } from "@/lib/store";

export default function NewLessonPage() {
  const router = useRouter();
  const addLesson = useAppStore((s) => s.addLesson);

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">New lesson</div>
          <div className="text-sm text-white/60">Create a lesson plan in minutes.</div>
        </div>

        <LessonForm
          primaryLabel="Create lesson"
          onSave={(data) => {
            const id = addLesson(data);
            router.push(`/lessons/${id}`);
          }}
        />
      </div>
    </AppShell>
  );
}
