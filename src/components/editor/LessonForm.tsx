"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Lesson } from "@/lib/store";

type Props = {
  initial?: Partial<Lesson>;
  onSave: (data: {
    title: string;
    subject: string;
    grade: string;
    durationMin: number;
    topic: string;
    objectives: string;
    contentMd: string;
    tags: string[];
  }) => void;
  primaryLabel?: string;
};

export function LessonForm({ initial, onSave, primaryLabel="Save lesson" }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "General");
  const [grade, setGrade] = useState(initial?.grade ?? "Middle School");
  const [durationMin, setDurationMin] = useState<number>(initial?.durationMin ?? 50);
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [objectives, setObjectives] = useState(initial?.objectives ?? "");
  const [contentMd, setContentMd] = useState(initial?.contentMd ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const canSave = useMemo(() => title.trim().length >= 3 && contentMd.trim().length >= 10, [title, contentMd]);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">Lesson details</div>
          <div className="text-xs text-white/60">Fill the essentials. You can export PDF later.</div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-xs text-white/70">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Fractions — Introduction" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="grid gap-2">
              <label className="text-xs text-white/70">Subject</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Math" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-white/70">Grade</label>
              <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="6th grade" />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-white/70">Duration (min)</label>
              <Input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value || 0))}
                min={10}
                max={240}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs text-white/70">Topic</label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Fractions basics" />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-white/70">Objectives</label>
            <Textarea value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder="- Objective 1
- Objective 2
- Objective 3" />
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-white/70">Lesson content (Markdown)</label>
            <Textarea
              value={contentMd}
              onChange={(e) => setContentMd(e.target.value)}
              placeholder={"## Warm-up (5 min)
...

## Teaching (15 min)
...

## Practice (20 min)
...

## Exit ticket (10 min)
..."}
            />
            <div className="text-xs text-white/50">Tip: keep sections short and actionable.</div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-white/70">Tags</label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="fractions" />
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

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              disabled={!canSave}
              onClick={() =>
                onSave({
                  title: title.trim(),
                  subject: subject.trim() || "General",
                  grade: grade.trim() || "General",
                  durationMin: durationMin || 50,
                  topic: topic.trim(),
                  objectives: objectives.trim(),
                  contentMd: contentMd.trim(),
                  tags,
                })
              }
            >
              {primaryLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
