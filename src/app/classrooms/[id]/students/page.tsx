"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Classroom = {
  id: string;
  name: string;
  discipline: string;
  schoolName: string;
};

export default function ClassroomsPage() {
  const [data, setData] = useState<Classroom[]>([]);

  useEffect(() => {
    fetch("/api/classrooms")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Turmas</h1>
        <Link href="/classrooms/new">
          <Button>Criar turma</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((c) => (
          <Card key={c.id}>
            <CardHeader className="font-semibold">{c.name}</CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {c.discipline} • {c.schoolName}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
