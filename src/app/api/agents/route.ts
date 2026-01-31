import { NextResponse } from "next/server";

export const runtime = "nodejs";

function requiredEnv(name: string) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`Missing env: ${name}`);
  return v.replace(/\/$/, "");
}

export async function GET() {
  try {
    const base = requiredEnv("AGENTS_API_BASE_URL");
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
