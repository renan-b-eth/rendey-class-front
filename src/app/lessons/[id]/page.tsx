"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LessonForm } from "@/components/editor/LessonForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();

  const seedIfEmpty = useAppStore((s) => s.seedIfEmpty);
  const lesson = useAppStore((s) => s.getLesson(id));
  const update = useAppStore((s) => s.updateLesson);
  const del = useAppStore((s) => s.deleteLesson);

  useEffect(() => { seedIfEmpty(); }, [seedIfEmpty]);

  const initial = useMemo(() => lesson, [lesson]);

  if (!lesson) {
    return (
      <AppShell>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm font-semibold">Lesson not found</div>
            <div className="mt-1 text-sm text-white/60">It may have been deleted. Return to the library.</div>
            <div className="mt-4 flex gap-2">
              <Link href="/lessons"><Button variant="secondary">Back to lessons</Button></Link>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">{lesson.title}</div>
            <div className="text-sm text-white/60">{lesson.subject} • {lesson.grade} • {lesson.durationMin} min</div>
          </div>

          <div className="flex gap-2">
            <Link href="/export"><Button variant="secondary">Export PDF</Button></Link>
            <Button
              variant="danger"
              onClick={() => {
                del(lesson.id);
                router.push("/lessons");
              }}
            >
              Delete
            </Button>
          </div>
        </div>

        <LessonForm
          initial={initial}
          primaryLabel="Save changes"
          onSave={(data) => update(lesson.id, data)}
        />
      </div>
    </AppShell>
  );
}
