"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ClassroomStudentsPage() {
  const { id } = useParams();
  const [students, setStudents] = useState<any[]>([]);
  const [name, setName] = useState("");

  function load() {
    fetch(`/api/students?classroomId=${id}`)
      .then(r => r.json())
      .then(setStudents);
  }

  useEffect(load, []);

  async function add() {
    await fetch("/api/students", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, classroomId: id }),
    });
    setName("");
    load();
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-4">Alunos</h1>

      <div className="flex gap-2 mb-4 max-w-md">
        <Input
          placeholder="Nome do aluno"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Button onClick={add}>Adicionar</Button>
      </div>

      <ul className="space-y-2">
        {students.map(s => (
          <li key={s.id} className="border p-3 rounded">
            {s.name}
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
