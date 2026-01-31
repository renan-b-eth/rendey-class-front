"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Classroom = { id: string; name: string; createdAt?: string };
type Student = { id: string; name: string; classroomId: string };
type Agent = { id: string; name: string; description?: string; category?: string };

type UseContext = "none" | "classroom" | "student" | "both";
type Engine = "FOUNDRY" | "NVIDIA";

export default function AgentsPage() {
  const [loading, setLoading] = useState(true);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [engine, setEngine] = useState<Engine>("FOUNDRY");
  const [useContext, setUseContext] = useState<UseContext>("classroom");

  const [classroomId, setClassroomId] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");

  const [agentId, setAgentId] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string>("");

  const selectedAgent = useMemo(
    () => agents.find((a) => a.id === agentId),
    [agents, agentId]
  );

  async function loadAgents() {
    const r = await fetch("/api/agents", { cache: "no-store" });
    const j = await r.json();
    if (!r.ok || !j?.ok) throw new Error(j?.error ?? "Falha ao carregar agentes");
    setAgents(j.agents ?? []);
    if (!agentId && (j.agents?.length ?? 0) > 0) setAgentId(j.agents[0].id);
  }

  async function loadClassrooms() {
    const r = await fetch("/api/classrooms", { cache: "no-store" });
    const j = await r.json();
    // sua API de classrooms hoje parece retornar array direto
    const list = Array.isArray(j) ? j : j?.items ?? [];
    setClassrooms(list);
    if (!classroomId && list?.[0]?.id) setClassroomId(list[0].id);
  }

  async function loadStudents(forClassroomId?: string) {
    const cid = forClassroomId ?? classroomId;
    if (!cid) {
      setStudents([]);
      return;
    }
    const r = await fetch(`/api/students?classroomId=${cid}`, { cache: "no-store" });
    const j = await r.json();
    const list = Array.isArray(j) ? j : j?.items ?? [];
    setStudents(list);
    // reseta aluno quando troca turma
    setStudentId(list?.[0]?.id ?? "");
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([loadAgents(), loadClassrooms()]);
      } catch (e: any) {
        setError(e?.message ?? "Erro ao carregar");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!classroomId) return;
    loadStudents(classroomId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  async function runAgent() {
    setRunning(true);
    setError("");
    setOutput("");

    try {
      const r = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          agent: agentId,
          engine,
          prompt,
          use_context: useContext,
          classroomId: classroomId || undefined,
          studentId: studentId || undefined,
          temperature: 0.7,
        }),
      });

      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) throw new Error(j?.error ?? "Falha ao gerar conteúdo");

      setOutput(j.output ?? "");
    } catch (e: any) {
      setError(e?.message ?? "Erro ao executar agente");
    } finally {
      setRunning(false);
    }
  }

  const contextHint = useMemo(() => {
    if (useContext === "none") return "Sem base de conhecimento.";
    if (useContext === "classroom") return "Usa a base da turma.";
    if (useContext === "student") return "Usa a base do aluno.";
    return "Usa base da turma + base do aluno.";
  }, [useContext]);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Agentes Pedagógicos</h1>
          <p className="text-sm opacity-75">
            Escolha um agente, selecione turma/aluno e gere atividades, quizzes, provas e relatórios.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
            <b className="block mb-1">Erro</b>
            <div className="opacity-90">{error}</div>
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border p-6 opacity-80">Carregando…</div>
        ) : (
          <div className="grid lg:grid-cols-[360px_1fr] gap-6">
            {/* Sidebar */}
            <div className="rounded-2xl border bg-background p-5">
              <div className="text-sm font-semibold mb-2">Configurações</div>

              <label className="text-xs opacity-70">Engine</label>
              <select
                className="w-full mt-1 mb-4 rounded-lg border bg-background px-3 py-2 text-sm"
                value={engine}
                onChange={(e) => setEngine(e.target.value as Engine)}
              >
                <option value="FOUNDRY">FOUNDRY</option>
                <option value="NVIDIA">NVIDIA</option>
              </select>

              <label className="text-xs opacity-70">Base de conhecimento</label>
              <select
                className="w-full mt-1 mb-2 rounded-lg border bg-background px-3 py-2 text-sm"
                value={useContext}
                onChange={(e) => setUseContext(e.target.value as UseContext)}
              >
                <option value="none">Nenhuma</option>
                <option value="classroom">Turma</option>
                <option value="student">Aluno</option>
                <option value="both">Turma + Aluno</option>
              </select>
              <div className="text-xs opacity-70 mb-4">{contextHint}</div>

              <label className="text-xs opacity-70">Turma</label>
              <select
                className="w-full mt-1 mb-4 rounded-lg border bg-background px-3 py-2 text-sm"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
              >
                {classrooms.length === 0 ? (
                  <option value="">Nenhuma turma cadastrada</option>
                ) : (
                  classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>

              <label className="text-xs opacity-70">Aluno</label>
              <select
                className="w-full mt-1 mb-5 rounded-lg border bg-background px-3 py-2 text-sm"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={!students.length}
              >
                {!students.length ? (
                  <option value="">Sem alunos nessa turma</option>
                ) : (
                  students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>

              <label className="text-xs opacity-70">Agente</label>
              <select
                className="w-full mt-1 mb-3 rounded-lg border bg-background px-3 py-2 text-sm"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              <div className="rounded-xl border bg-muted/20 p-3 text-xs">
                <div className="font-semibold">{selectedAgent?.name}</div>
                <div className="opacity-75 mt-1">{selectedAgent?.description}</div>
                {selectedAgent?.category ? (
                  <div className="mt-2 inline-flex rounded-full border px-2 py-1 text-[11px] opacity-80">
                    {selectedAgent.category}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Main */}
            <div className="rounded-2xl border bg-background p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-sm font-semibold">Solicitação</div>
                  <div className="text-xs opacity-70">
                    Escreva exatamente o que você quer gerar (quiz, prova, plano de aula, recuperação, etc.)
                  </div>
                </div>
                <Button
                  onClick={runAgent}
                  disabled={running || !agentId || prompt.trim().length < 5}
                >
                  {running ? "Gerando..." : "Gerar com IA"}
                </Button>
              </div>

              <Input
                placeholder="Ex: Crie um quiz de 10 questões sobre frações para o 6º ano, com gabarito."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="mt-6">
                <div className="text-sm font-semibold mb-2">Resultado</div>
                <div className="rounded-xl border bg-muted/20 p-4 min-h-[260px] whitespace-pre-wrap text-sm leading-relaxed">
                  {output ? output : <span className="opacity-60">O conteúdo gerado aparecerá aqui.</span>}
                </div>

                <div className="mt-3 text-xs opacity-70">
                  * O auto-save em <b>KnowledgeItem</b> acontece via sua rota <b>/api/agents/run</b> quando houver turma/aluno selecionado.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
