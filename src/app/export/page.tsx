"use client";

import { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { LessonPdf } from "@/lib/pdf/LessonPdf";

export default function ExportPage() {
  const seedIfEmpty = useAppStore((s) => s.seedIfEmpty);
  const lessons = useAppStore((s) => s.lessons);

  useEffect(() => { seedIfEmpty(); }, [seedIfEmpty]);

  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lessons;
    return lessons.filter((l) => (l.title + " " + l.subject + " " + l.grade).toLowerCase().includes(q));
  }, [lessons, query]);

  const selected = filtered[0];

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Export PDF</div>
          <div className="text-sm text-white/60">Download lesson PDFs (works on Vercel).</div>
        </div>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold">Choose a lesson</div>
            <div className="text-xs text-white/60">Search and export.</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search lessons..." />
            {selected ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="font-semibold">{selected.title}</div>
                <div className="text-xs text-white/60">{selected.subject} • {selected.grade} • {selected.durationMin} min</div>

                <div className="mt-3">
                  <PDFDownloadLink
                    document={<LessonPdf lesson={selected} />}
                    fileName={`${selected.title.replace(/\s+/g, "_").slice(0, 60)}.pdf`}
                  >
                    {({ loading }) => (
                      <Button disabled={loading}>
                        {loading ? "Preparing PDF..." : "Download PDF"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>

                <div className="mt-2 text-xs text-white/50">
                  Tip: for advanced formatting later, we can map markdown sections into structured PDF blocks.
                </div>
              </div>
            ) : (
              <div className="text-sm text-white/60">No lessons available.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 text-xs text-white/60">
            This export is client-side (react-pdf) so it works reliably on Vercel without Chromium/Puppeteer.
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
