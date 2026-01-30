"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { useEffect } from "react";

export default function DashboardPage() {
  const lessons = useAppStore((s) => s.lessons);
  const seedIfEmpty = useAppStore((s) => s.seedIfEmpty);

  useEffect(() => { seedIfEmpty(); }, [seedIfEmpty]);

  const recent = lessons.slice(0, 5);

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Dashboard</div>
            <div className="text-sm text-white/60">Everything you need to plan lessons fast.</div>
          </div>
          <Link href="/lessons/new"><Button>New lesson</Button></Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><div className="text-sm font-semibold">Lessons</div></CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{lessons.length}</div>
              <div className="text-xs text-white/60 mt-1">Saved locally (Day 1).</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><div className="text-sm font-semibold">Exports</div></CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">PDF</div>
              <div className="text-xs text-white/60 mt-1">Export via /export.</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><div className="text-sm font-semibold">AI Agents</div></CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">Mock</div>
              <div className="text-xs text-white/60 mt-1">UI ready to connect Hugging Face.</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Recent lessons</div>
              <div className="text-xs text-white/60">Quick access to your latest items.</div>
            </div>
            <Link href="/lessons" className="text-xs text-white/70 hover:text-white">View all</Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 ? (
              <div className="text-sm text-white/60">No lessons yet.</div>
            ) : (
              recent.map((l) => (
                <Link key={l.id} href={`/lessons/${l.id}`} className="block rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/5 transition">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{l.title}</div>
                      <div className="text-xs text-white/60">{l.subject} • {l.grade} • {l.durationMin} min • {formatDate(new Date(l.updatedAt))}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge>{l.subject}</Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Link href="/agents"><Button variant="secondary">Open AI Agents</Button></Link>
          <Link href="/export"><Button variant="secondary">Export PDF</Button></Link>
        </div>
      </div>
    </AppShell>
  );
}
