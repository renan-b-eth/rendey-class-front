"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import * as XLSX from "xlsx";

type Agent = "quiz" | "prova" | "rubrica" | "feedback";

const COST: Record<Agent, number> = {
  quiz: 2,
  prova: 4,
  rubrica: 2,
  feedback: 2,
};

function downloadCsv(filename: string, rows: Array<Record<string, any>>) {
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const esc = (v: any) => {
    const s = String(v ?? "");
    const needs = /[",\n]/.test(s);
    const out = s.replaceAll('"', '""');
    return needs ? `"${out}"` : out;
  };
  const lines = [
    cols.map(esc).join(","),
    ...rows.map((r) => cols.map((c) => esc(r[c])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AgentsPage() {
  const addLesson = useAppStore((s) => s.addLesson);

  const [agent, setAgent] = useState<Agent>("quiz");
  const [engine, setEngine] = useState<"foundry" | "nvidia">("foundry");
  const [prompt, setPrompt] = useState(
    "Crie um quiz com 10 questões (7 objetivas e 3 discursivas) sobre frações para o 6º ano. Inclua gabarito e habilidades."
  );
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // grading tool
  const [answerKey, setAnswerKey] = useState("A,B,C,D,A,B,C,D,A,B");
  const [studentRows, setStudentRows] = useState<Array<Record<string, any>>>([]);
  const [gradeReport, setGradeReport] = useState<Array<Record<string, any>>>([]);
  const [gradeErr, setGradeErr] = useState<string | null>(null);

  const canRun = useMemo(() => prompt.trim().length > 10, [prompt]);

  async function runAgent() {
    setErr(null);
    setLoading(true);
    setResult("");

    const res = await fetch("/api/agents/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agent, prompt, engine }),
    });

    const j = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setErr(j?.error ?? "Erro ao executar o agente.");
      return;
    }

    setResult(String(j?.output ?? "").trim());
  }

  function saveAsLesson() {
    const id =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ??
      `l_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    const now = Date.now();
    addLesson({
      id,
      title: result.split("\n")[0]?.replace(/^#+\s*/, "").slice(0, 80) || "Conteúdo gerado",
      subject: "Conteúdo IA",
      grade: "—",
      durationMin: 50,
      topic: agent,
      objectives: "Gerado por agente",
      contentMd: result,
      tags: ["ia", agent],
      createdAt: now,
      updatedAt: now,
    });
    window.location.href = `/lessons/${id}`;
  }

  async function onXlsx(file: File) {
    setGradeErr(null);
    setStudentRows([]);
    setGradeReport([]);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      setStudentRows(json);
    } catch (e: any) {
      setGradeErr("Não consegui ler sua planilha. Envie .xlsx com cabeçalho na primeira linha.");
    }
  }

  function grade() {
    setGradeErr(null);
    setGradeReport([]);

    const key = answerKey
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (key.length < 1) {
      setGradeErr("Informe o gabarito. Ex: A,B,C,D...");
      return;
    }
    if (studentRows.length < 1) {
      setGradeErr("Envie a planilha (.xlsx) com respostas.");
      return;
    }

    // assume columns Q1..Qn OR 1..n OR 'Questão 1' etc.
    const pickAnswer = (row: Record<string, any>, i: number) => {
      const candidates = [`Q${i + 1}`, `${i + 1}`, `Questão ${i + 1}`, `Questao ${i + 1}`, `P${i + 1}`];
      for (const c of candidates) {
        if (c in row) return String(row[c]).trim().toUpperCase();
      }
      return "";
    };

    const nameCol = ["Nome", "Aluno", "Name"].find((c) => c in studentRows[0]) ?? null;
    const emailCol = ["Email", "E-mail", "email"].find((c) => c in studentRows[0]) ?? null;

    const out = studentRows.map((r) => {
      let correct = 0;
      const total = key.length;
      for (let i = 0; i < total; i++) {
        const got = pickAnswer(r, i);
        const exp = String(key[i]).trim().toUpperCase();
        if (got && exp && got === exp) correct += 1;
      }
      const score = Math.round((correct / total) * 1000) / 10; // %
      return {
        aluno: nameCol ? r[nameCol] : r["aluno"] ?? r["Aluno"] ?? "",
        email: emailCol ? r[emailCol] : "",
        acertos: correct,
        total,
        porcentagem: score,
      };
    });

    setGradeReport(out);
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Agentes</div>
            <div className="text-sm text-white/60">
              Crie materiais pedagógicos prontos para imprimir e compartilhar.
            </div>
          </div>
          <a className="text-xs text-white/60 underline underline-offset-4" href="/billing">
            Ver créditos
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Executar agente</div>
                <Badge>Custo: {COST[agent]} créditos</Badge>
              </div>
              <div className="text-xs text-white/60">
                Dica: escreva como você pediria para um colega (ano/série, objetivo, quantidade, formato).
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/70">Agente</label>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
                    value={agent}
                    onChange={(e) => setAgent(e.target.value as Agent)}
                  >
                    <option value="quiz">Quiz (2)</option>
                    <option value="prova">Prova (4)</option>
                    <option value="rubrica">Rubrica (2)</option>
                    <option value="feedback">Feedback (2)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/70">Motor</label>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value as any)}
                  >
                    <option value="foundry">Foundry IA</option>
                    <option value="nvidia">NVIDIA (HV100)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/70">Pedido</label>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={10} />
              </div>

              {err ? <div className="text-sm text-red-300">{err}</div> : null}

              <Button disabled={!canRun || loading} onClick={runAgent} className="w-full">
                {loading ? "Gerando..." : "Rodar agente"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <div className="text-sm font-semibold">Resultado</div>
              <div className="text-xs text-white/60">
                Você pode salvar como aula e editar depois.
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={result} onChange={(e) => setResult(e.target.value)} rows={16} placeholder="O resultado aparecerá aqui..." />
              <div className="flex gap-2">
                <Button variant="secondary" disabled={!result.trim()} onClick={() => navigator.clipboard.writeText(result)}>
                  Copiar
                </Button>
                <Button disabled={!result.trim()} onClick={saveAsLesson}>
                  Salvar como aula
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <div className="text-sm font-semibold">Correção rápida por planilha</div>
            <div className="text-xs text-white/60">
              Envie um .xlsx com colunas Q1, Q2, Q3... (ou 1, 2, 3...) e informe o gabarito (A,B,C...).
              Você recebe um CSV com acertos e porcentagem por aluno.
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-white/70">Gabarito</label>
                <Input value={answerKey} onChange={(e) => setAnswerKey(e.target.value)} placeholder="A,B,C,D,A,B..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/70">Planilha (.xlsx)</label>
                <Input type="file" accept=".xlsx" onChange={(e) => e.target.files?.[0] && onXlsx(e.target.files[0])} />
              </div>
            </div>

            {gradeErr ? <div className="text-sm text-red-300">{gradeErr}</div> : null}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="secondary" disabled={studentRows.length < 1} onClick={grade}>
                Calcular notas
              </Button>
              <Button
                disabled={gradeReport.length < 1}
                onClick={() => downloadCsv("relatorio_notas.csv", gradeReport)}
              >
                Baixar CSV
              </Button>
            </div>

            {gradeReport.length ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
                <div className="font-semibold mb-2">Prévia (primeiros 5)</div>
                <div className="space-y-1 text-white/70">
                  {gradeReport.slice(0, 5).map((r, idx) => (
                    <div key={idx}>
                      <span className="text-white">{r.aluno || `Aluno ${idx + 1}`}</span> — {r.acertos}/{r.total} ({r.porcentagem}%)
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="text-xs text-white/50">
              Observação: esta correção é local (no navegador) e não consome créditos. O agente de correção com PDF e critérios
              pode ser ligado na próxima etapa usando os mesmos endpoints.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
