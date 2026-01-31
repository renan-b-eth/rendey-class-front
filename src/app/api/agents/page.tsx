import { NextResponse } from "next/server";
import { mustGetEnv } from "@/lib/env";

export async function GET() {
  const BACKEND_API_BASE_URL = mustGetEnv("BACKEND_API_BASE_URL");

  const r = await fetch(`${BACKEND_API_BASE_URL}/api/v1/agents`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    // evita cache chato em deploy
    cache: "no-store",
  });

  const json = await r.json().catch(() => null);

  if (!r.ok || !json?.ok) {
    return NextResponse.json(
      { ok: false, error: json?.error ?? "Backend error", raw: json },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, agents: json.agents ?? [] });
}
