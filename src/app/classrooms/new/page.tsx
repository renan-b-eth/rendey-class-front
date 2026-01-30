"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function NewClassroomPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    discipline: "",
    schoolName: "",
    teacherName: "",
  });

  async function submit() {
    await fetch("/api/classrooms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/classrooms");
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-4">Nova Turma</h1>

      <div className="grid gap-3 max-w-md">
        <Input placeholder="Nome da turma" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Disciplina" onChange={(e) => setForm({ ...form, discipline: e.target.value })} />
        <Input placeholder="Escola" onChange={(e) => setForm({ ...form, schoolName: e.target.value })} />
        <Input placeholder="Professor(a)" onChange={(e) => setForm({ ...form, teacherName: e.target.value })} />

        <Button onClick={submit}>Criar turma</Button>
      </div>
    </AppShell>
  );
}
