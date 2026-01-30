"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function LessonsPage() {
  const seedIfEmpty = useAppStore((s) => s.seedIfEmpty);
  const lessons = useAppStore((s) => s.lessons);
  const del = useAppStore((s) => s.deleteLesson);

  useEffect(() => { seedIfEmpty(); }, [seedIfEmpty]);

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return lessons;
    return lessons.filter((l) =>
      [l.title, l.subject, l.grade, l.topic, l.tags.join(" ")].join(" ").toLowerCase().includes(query)
    );
  }, [lessons, q]);

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Lessons</div>
            <div className="text-sm text-white/60">Create and manage lesson plans.</div>
          </div>
          <Link href="/lessons/new"><Button>New lesson</Button></Link>
        </div>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Search</div>
          </CardHeader>
          <CardContent>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, subject, grade, topic, tags..." />
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <Card><CardContent className="p-5 text-sm text-white/60">No lessons found.</CardContent></Card>
          ) : (
            filtered.map((l) => (
              <div key={l.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/lessons/${l.id}`} className="block font-semibold truncate hover:underline">
                      {l.title}
                    </Link>
                    <div className="mt-1 text-xs text-white/60">
                      {l.subject} • {l.grade} • {l.durationMin} min • Updated {formatDate(new Date(l.updatedAt))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge>{l.subject}</Badge>
                      {l.tags.slice(0,4).map((t) => <Badge key={t}>{t}</Badge>)}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`/lessons/${l.id}`}><Button variant="secondary">Edit</Button></Link>
                    <Button variant="danger" onClick={() => del(l.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
