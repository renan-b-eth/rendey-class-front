import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const base = process.env.AGENTS_API_BASE_URL?.replace(/\/$/, "");
    if (!base) {
      return NextResponse.json(
        { ok: false, error: "Missing env: AGENTS_API_BASE_URL" },
        { status: 500 }
      );
    }

    const r = await fetch(`${base}/api/v1/agents`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      cache: "no-store",
    });

    const text = await r.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // backend devolveu HTML ou texto
      return NextResponse.json(
        { ok: false, error: `Agents API error ${r.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: data?.detail ?? data?.error ?? `Agents API error ${r.status}` },
        { status: 502 }
      );
    }

    // seu FastAPI retorna array direto
    return NextResponse.json({ ok: true, agents: data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
