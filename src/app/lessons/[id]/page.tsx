"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function LessonDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");

  const lessons = useAppStore((s) => s.lessons);
  const getLesson = useAppStore((s) => s.getLesson);
  const updateLesson = useAppStore((s) => s.updateLesson);
  const deleteLesson = useAppStore((s) => s.deleteLesson);
  const addLesson = useAppStore((s) => s.addLesson);

  // Seed local (Day 1) caso esteja tudo vazio
  useEffect(() => {
    if (!Array.isArray(lessons) || lessons.length > 0) return;

    const newId =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ??
      `l_${Math.random().toString(16).slice(2)}_${Date.now()}`;

    const now = Date.now();

    addLesson({
      id: newId,
      title: "Aula exemplo — Frações (Day 1)",
      subject: "Matemática",
      grade: "6º ano",
      durationMin: 50,
      topic: "Introdução a frações",
      objectives:
        "- Entender o conceito de fração\n- Identificar numerador e denominador\n- Representar frações simples",
      contentMd:
        "## Aquecimento (5 min)\n- Perguntas rápidas no quadro\n\n## Explicação (15 min)\n- Conceito de fração (parte/todo)\n- Exemplos do cotidiano\n\n## Prática (20 min)\n- Exercícios guiados\n- Correção em dupla\n\n## Fechamento (10 min)\n- Mini exit ticket\n",
      tags: ["frações", "matemática", "day1"],
      createdAt: now,
      updatedAt: now,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons?.length, addLesson]);

  const lesson = useMemo(() => {
    try {
      return getLesson(id);
    } catch {
      return undefined;
    }
  }, [getLesson, id]);

  // fallback: se o id não existe, mostra a primeira aula (se houver)
  const fallbackLesson = useMemo(() => {
    if (lesson) return lesson;
    if (Array.isArray(lessons) && lessons.length > 0) return lessons[0];
    return undefined;
  }, [lesson, lessons]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [durationMin, setDurationMin] = useState<number>(50);
  const [topic, setTopic] = useState("");
  const [objectives, setObjectives] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!fallbackLesson) return;
    setTitle(fallbackLesson.title ?? "");
    setSubject(fallbackLesson.subject ?? "General");
    setGrade(fallbackLesson.grade ?? "General");
    setDurationMin(Number(fallbackLesson.durationMin ?? 50));
    setTopic(fallbackLesson.topic ?? "");
    setObjectives(fallbackLesson.objectives ?? "");
    setContentMd(fallbackLesson.contentMd ?? "");
    setTags(Array.isArray(fallbackLesson.tags) ? fallbackLesson.tags : []);
  }, [fallbackLesson?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!fallbackLesson) {
    return (
      <AppShell>
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Lesson not found</div>
            <div className="text-xs text-white/60">
              Create a new lesson to start.
            </div>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/lessons/new">
              <Button>New lesson</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">Back to dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const currentId = fallbackLesson.id;

  const canSave = title.trim().length >= 3 && contentMd.trim().length >= 10;

  const handleSave = () => {
    const now = Date.now();
    updateLesson(currentId, {
      title: title.trim(),
      subject: subject.trim() || "General",
      grade: grade.trim() || "General",
      durationMin: Number(durationMin || 50),
      topic: topic.trim(),
      objectives: objectives.trim(),
      contentMd: contentMd.trim(),
      tags,
      updatedAt: now,
    });
  };

  const handleDelete = () => {
    deleteLesson(currentId);
    router.push("/lessons");
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-2xl font-semibold tracking-tight truncate">
              {fallbackLesson.title}
            </div>
            <div className="text-sm text-white/60">
              Last update: {formatDate(new Date(fallbackLesson.updatedAt ?? Date.now()))}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/lessons">
              <Button variant="secondary">Back</Button>
            </Link>
            <Link href="/export">
              <Button variant="secondary">Export PDF</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Edit lesson</div>
            <div className="text-xs text-white/60">
              Update and save. Export anytime.
            </div>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs text-white/70">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-white/70">Subject</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-white/70">Grade</label>
                <Input value={grade} onChange={(e) => setGrade(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-white/70">Duration (min)</label>
                <Input
                  type="number"
                  value={durationMin}
                  min={10}
                  max={240}
                  onChange={(e) => setDurationMin(Number(e.target.value || 0))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-white/70">Topic</label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-white/70">Objectives</label>
              <Textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-white/70">Lesson content (Markdown)</label>
              <Textarea value={contentMd} onChange={(e) => setContentMd(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-white/70">Tags</label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="tag" />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const t = tagInput.trim();
                    if (!t) return;
                    if (tags.includes(t)) return;
                    setTags([...tags, t]);
                    setTagInput("");
                  }}
                >
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="group"
                      title="Remove"
                    >
                      <Badge className="group-hover:bg-white/10">{t}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-white/60">
                ID: <span className="text-white/80">{currentId}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" type="button" onClick={handleDelete}>
                  Delete
                </Button>
                <Button type="button" disabled={!canSave} onClick={handleSave}>
                  Save changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
