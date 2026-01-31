import { NextResponse } from "next/server";

const BASE =
  process.env.NEXT_PUBLIC_AGENTS_API_BASE?.replace(/\/$/, "") ||
  process.env.AGENTS_API_BASE?.replace(/\/$/, "");

function err(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  try {
    if (!BASE) return err("Missing env: NEXT_PUBLIC_AGENTS_API_BASE (ou AGENTS_API_BASE)", 500);

    // seu FastAPI tem /agents (alias) e /api/v1/agents
    const url = `${BASE}/agents`;

    const r = await fetch(url, { cache: "no-store" });
    const text = await r.text(); // evita “Unexpected end of JSON input”

    if (!r.ok) {
      return err(`Agents API error ${r.status}: ${text?.slice(0, 200) || "no body"}`, 502);
    }

    // /agents retorna lista direto
    let data: any = [];
    try {
      data = text ? JSON.parse(text) : [];
    } catch {
      data = [];
    }

    const agents = Array.isArray(data) ? data : (data?.agents ?? []);
    return NextResponse.json({ ok: true, agents });
  } catch (e: any) {
    return err(e?.message ?? "Erro ao carregar agentes", 500);
  }
}
