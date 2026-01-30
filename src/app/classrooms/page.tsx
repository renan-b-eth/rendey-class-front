"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Classroom = {
  id: string;
  name: string;
  createdAt: string | Date;
};

function formatDateBR(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR");
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => name.trim().length >= 2 && !creating, [name, creating]);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/classrooms", { cache: "no-store" });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        throw new Error(j?.error ?? "Falha ao carregar turmas");
      }
      setClassrooms(Array.isArray(j) ? j : []);
    } catch (e: any) {
      setError(e?.message ?? "Erro inesperado ao carregar turmas");
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;

    setCreating(true);
    setError(null);
    try {
      const r = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const j = await r.json().catch(() => null);
      if (!r.ok) {
        throw new Error(j?.error ?? "Não foi possível criar a turma");
      }

      setName("");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Erro inesperado ao criar turma");
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Minhas Turmas
            </h1>
            <p className="text-sm md:text-base opacity-80 mt-2 max-w-2xl">
              Organize suas turmas e alunos para gerar quizzes, provas, recuperação e relatórios
              com base de conhecimento da turma e de cada estudante.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={load} disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar"}
            </Button>
          </div>
        </div>

        {/* Create card */}
        <div className="border rounded-2xl p-4 md:p-5 mb-8 bg-black/10">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-semibold mb-2">Criar nova turma</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Ex: 6º Ano B — Matemática"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") create();
                  }}
                />
                <Button onClick={create} disabled={!canCreate}>
                  {creating ? "Criando..." : "Criar turma"}
                </Button>
              </div>
              <div className="text-xs opacity-70 mt-2">
                Dica: use um padrão como <span className="font-medium">Série + Turma + Disciplina</span>.
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border rounded-2xl p-4 h-[108px] animate-pulse bg-black/10"
              />
            ))}
          </div>
        ) : classrooms.length === 0 ? (
          <div className="border rounded-2xl p-8 text-center bg-black/10">
            <div className="text-lg font-semibold">Nenhuma turma criada ainda</div>
            <div className="text-sm opacity-80 mt-2">
              Crie sua primeira turma para começar a cadastrar alunos e usar os agentes.
            </div>
            <div className="mt-4">
              <Button onClick={() => (document.querySelector("input") as HTMLInputElement)?.focus()}>
                Criar minha primeira turma
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {classrooms.map((c) => (
              <Link
                key={c.id}
                href={`/classrooms/${c.id}`}
                className="group border rounded-2xl p-4 hover:bg-white/5 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg leading-snug group-hover:opacity-95">
                      {c.name}
                    </h2>
                    <p className="text-sm opacity-70 mt-1">
                      Criada em {formatDateBR(c.createdAt)}
                    </p>
                  </div>

                  <div className="text-xs opacity-70 border rounded-full px-2 py-1">
                    Abrir →
                  </div>
                </div>

                <div className="mt-4 text-xs opacity-70">
                  Base de conhecimento • alunos • relatórios
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
