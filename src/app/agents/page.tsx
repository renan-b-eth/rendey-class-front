"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";

const newId = () =>
  (globalThis.crypto?.randomUUID?.() as string | undefined) ??
  `l_${Math.random().toString(16).slice(2)}_${Date.now()}`;


function mockAgent(prompt: string) {
  return `## Generated Lesson (Mock)
**Prompt:** ${prompt}

### Warm-up (5 min)
Quick question + recall.

### Teaching (15 min)
Explain the concept with 2 examples.

### Practice (20 min)
- Exercise 1
- Exercise 2
- Exercise 3

### Exit Ticket (10 min)
3 questions + 1 reflection.
`;
}

export default function AgentsPage() {
  const addLesson = useAppStore((s) => s.addLesson);

  const [title, setTitle] = useState("AI-generated Lesson");
  const [subject, setSubject] = useState("General");
  const [grade, setGrade] = useState("Middle School");
  const [prompt, setPrompt] = useState("Create a lesson about fractions with examples and exercises.");
  const [result, setResult] = useState<string>("");

  const canGenerate = useMemo(() => prompt.trim().length > 5, [prompt]);

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight">AI Agents</div>
          <div className="text-sm text-white/60">
            Day 1 uses mock output. Later connect your Hugging Face backend (ENV) to generate real lessons.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <div className="text-sm font-semibold">Generate</div>
              <div className="text-xs text-white/60">Describe what you want and generate a lesson plan.</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                <label className="text-xs text-white/70">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <label className="text-xs text-white/70">Subject</label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs text-white/70">Grade</label>
                  <Input value={grade} onChange={(e) => setGrade(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-white/70">Prompt</label>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
              </div>

              <div className="flex gap-2">
                <Button
                  disabled={!canGenerate}
                  onClick={() => setResult(mockAgent(prompt))}
                >
                  Generate (mock)
                </Button>
                <Button
                  variant="secondary"
                  disabled={!result}
                  onClick={() => {
                    if (!result) return;
                    addLesson({
                      id: newId(),
                      title: title.trim() || "AI Lesson",
                      subject: subject.trim() || "General",
                      grade: grade.trim() || "General",
                      durationMin: 50,
                      topic: prompt.slice(0, 60),
                      objectives: "- Objective 1\n- Objective 2\n- Objective 3",
                      contentMd: result,
                      tags: ["ai", "draft"],
                    });
                    alert("Saved to Lessons (local).");
                  }}
                >
                  Save to Lessons
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-sm font-semibold">Output</div>
              <div className="text-xs text-white/60">Markdown preview (raw).</div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={result} onChange={(e) => setResult(e.target.value)} placeholder="Generated content will appear here..." />
              <div className="text-xs text-white/50">
                Later: replace mockAgent() with a fetch call to your HF endpoint.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
