"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const r = await fetch("/api/classrooms");
    const j = await r.json();
    setClassrooms(j);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!name) return;

    await fetch("/api/classrooms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setName("");
    load();
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Minhas Turmas</h1>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Nome da turma"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={create}>Criar turma</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {classrooms.map((c) => (
            <Link
              key={c.id}
              href={`/classrooms/${c.id}`}
              className="border rounded-lg p-4 hover:bg-muted transition"
            >
              <h2 className="font-semibold text-lg">{c.name}</h2>
              <p className="text-sm opacity-70">
                Criada em {new Date(c.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
