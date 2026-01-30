import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              Rendey Class • Day 1 frontend (no ENV required)
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              A teacher-first workspace for lessons, activities and exports.
            </h1>
            <p className="max-w-2xl text-white/70 leading-relaxed">
              This frontend is built to deploy cleanly on Vercel. Connect Supabase + your Hugging Face agents later,
              without changing the UI.
            </p>
            <div className="flex gap-2 pt-2">
              <Link href="/dashboard"><Button size="lg">Open dashboard</Button></Link>
              <Link href="/lessons"><Button size="lg" variant="secondary">Go to lessons</Button></Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="text-sm font-semibold">Lessons library</div>
                <div className="mt-1 text-sm text-white/70">Create, edit and organize lessons in minutes.</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-sm font-semibold">AI agent-ready</div>
                <div className="mt-1 text-sm text-white/70">UI already prepared for agent outputs (mock today).</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="text-sm font-semibold">Export PDF</div>
                <div className="mt-1 text-sm text-white/70">Download lesson PDFs using react-pdf (Vercel-safe).</div>
              </CardContent>
            </Card>
          </div>

          <div className="text-xs text-white/50">
            Tip: deploy this repo to Vercel as-is. Then add ENV keys and swap mock storage to Supabase.
          </div>
        </div>
      </div>
    </div>
  );
}
