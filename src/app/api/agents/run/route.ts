import { NextResponse } from "next/server";

const BASE =
  process.env.NEXT_PUBLIC_AGENTS_API_BASE?.replace(/\/$/, "") ||
  process.env.AGENTS_API_BASE?.replace(/\/$/, "");

function err(message: string, status = 500) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(req: Request) {
  try {
    if (!BASE) return err("Missing env: NEXT_PUBLIC_AGENTS_API_BASE (ou AGENTS_API_BASE)", 500);

    const body = await req.json().catch(() => null);
    if (!body?.prompt || !body?.agent) return err("Campos obrigatórios: agent, prompt", 400);

    // seu FastAPI aceita: agent, engine, prompt, use_context, classroom_context, student_context...
    // por enquanto, manda sem contexto (depois a gente liga com KnowledgeItem)
    const payload = {
      agent: body.agent,
      engine: body.engine ?? "FOUNDRY",
      prompt: body.prompt,
      use_context: body.use_context ?? "none",
      classroom_context: null,
      student_context: null,
      temperature: body.temperature ?? 0.7,
    };

    const url = `${BASE}/agents/run`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await r.text(); // evita json quebrado
    if (!r.ok) {
      return err(`Run API error ${r.status}: ${text?.slice(0, 200) || "no body"}`, 502);
    }

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    // FastAPI retorna { ok: true, engineUsed, output }
    const output = data?.output ?? "";
    return NextResponse.json({ ok: true, output });
  } catch (e: any) {
    return err(e?.message ?? "Erro ao executar agente", 500);
  }
}
