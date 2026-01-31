import { NextResponse } from "next/server";

export const runtime = "nodejs";

const FALLBACK_AGENTS = [
  {
    id: "quiz",
    name: "Gerador de Quiz",
    description: "Cria quizzes prontos (questões + gabarito + explicações).",
    category: "Avaliação",
  },
  {
    id: "plano_aula",
    name: "Planejador de Aulas BNCC",
    description: "Gera plano de aula com objetivos, habilidades BNCC, etapas e avaliação.",
    category: "Planejamento",
  },
  {
    id: "correcao",
    name: "Corretor de Atividades",
    description: "Sugere correção, rubrica e feedback formativo.",
    category: "Correção",
  },
  {
    id: "relatorio",
    name: "Relatório do Aluno",
    description: "Gera relatório pedagógico (descritivo) por aluno/turma.",
    category: "Relatórios",
  },
];

function optionalBaseUrl() {
  const v = (process.env.AGENTS_API_BASE_URL || "").trim();
  return v ? v.replace(/\/$/, "") : undefined;
}

export async function GET() {
  try {
    const base = optionalBaseUrl();
    if (!base) {
      // Não quebra o app se o backend ainda não estiver configurado.
      return NextResponse.json({ ok: true, agents: FALLBACK_AGENTS });
    }

    const url = `${base}/api/v1/agents`;

    const r = await fetch(url, {
      cache: "no-store",
      headers: { "accept": "application/json" },
    });

    const text = await r.text(); // <- evita crash quando vier HTML
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: `Agents API error ${r.status}: ${text.slice(0, 500)}` },
        { status: 502 }
      );
    }

    // tenta JSON; se não der, mostra o começo do body
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { ok: false, error: `Agents API returned non-JSON: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, agents: data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
