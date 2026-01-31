import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const base = process.env.AGENTS_API_BASE_URL?.replace(/\/$/, "");
    if (!base) {
      return NextResponse.json(
        { ok: false, error: "Missing env: AGENTS_API_BASE_URL" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // normaliza nomes vindos do seu front
    const payload = {
      agent: body.agent ?? "quiz",
      engine: body.engine ?? "FOUNDRY",
      prompt: body.prompt ?? "",
      use_context: body.use_context ?? body.useContext ?? "none",
      classroom_context: body.classroom_context ?? body.classroomContext ?? null,
      student_context: body.student_context ?? body.studentContext ?? null,
      temperature: body.temperature ?? 0.7,
    };

    const r = await fetch(`${base}/api/v1/agents/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
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

    // FastAPI response_model: { ok, engineUsed, output }
    return NextResponse.json(
      { ok: true, engineUsed: data.engineUsed, output: data.output },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
