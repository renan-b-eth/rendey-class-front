"use client";

import { useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLessonStore } from "@/lib/store";
import { LessonPdfDocument } from "@/lib/pdf/LessonPdfDocument";

export default function ExportPage() {
  const lessons = useLessonStore((s) => s.lessons);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(lessons[0]?.id ?? "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lessons;
    return lessons.filter((l) => {
      return (
        l.title.toLowerCase().includes(q) ||
        l.subject.toLowerCase().includes(q) ||
        l.grade.toLowerCase().includes(q)
      );
    });
  }, [lessons, query]);

  const selected = useMemo(
    () => lessons.find((l) => l.id === selectedId) ?? null,
    [lessons, selectedId]
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6">
        <div className="text-2xl font-semibold">Export PDF</div>
        <div className="text-sm text-white/60">
          Choose a lesson and download a PDF.
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Select lesson</div>
          <div className="text-xs text-white/60">
            This is local for Day 1. Later we connect Supabase.
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons..."
          />

          <div className="grid gap-2">
            <label className="text-xs text-white/70">Lesson</label>
            <select
              className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none focus:border-white/20"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {filtered.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} • {l.subject} • {l.grade}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            {!selected ? (
              <Button disabled type="button">
                Select a lesson
              </Button>
            ) : (
              // ✅ Fix: PDFDownloadLink children MUST be a ReactNode (not a function)
              <PDFDownloadLink
                document={<LessonPdfDocument lesson={selected} />}
                fileName={`${selected.title.replace(/[^\w\-]+/g, "_")}.pdf`}
              >
                <Button type="button">Download PDF</Button>
              </PDFDownloadLink>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
