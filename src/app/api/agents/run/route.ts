import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function optionalEnv(name: string) {
  const v = (process.env[name] || "").trim();
  return v ? v.replace(/\/$/, "") : "";
}

const BodySchema = z.object({
  agent: z.string().min(1),
  engine: z.enum(["FOUNDRY", "NVIDIA"]).default("FOUNDRY"),
  prompt: z.string().min(1),
  use_context: z.enum(["none", "classroom", "student", "both"]).default("none"),

  classroomId: z.string().optional(),
  studentId: z.string().optional(),
  temperature: z.number().min(0).max(1.5).default(0.7),
});

async function buildContexts(userId: string, classroomId?: string, studentId?: string) {
  let classroom_context: string | null = null;
  let student_context: string | null = null;

  if (classroomId) {
    // garante que a turma é do user
    const classroom = await prisma.classroom.findFirst({
      where: { id: classroomId, userId },
      select: { id: true, name: true, schoolName: true, subject: true, grade: true },
    });

    if (classroom) {
      const items = await prisma.knowledgeItem.findMany({
        where: { classroomId: classroom.id, userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { title: true, content: true, source: true },
      });

      classroom_context =
        `TURMA: ${classroom.name}\n` +
        (classroom.schoolName ? `ESCOLA: ${classroom.schoolName}\n` : "") +
        (classroom.subject ? `DISCIPLINA: ${classroom.subject}\n` : "") +
        (classroom.grade ? `SÉRIE: ${classroom.grade}\n` : "") +
        "\nBASE:\n" +
        items
          .map((k, i) => `#${i + 1} ${k.title} (${k.source})\n${k.content}`)
          .join("\n\n");
    }
  }

  if (studentId) {
    // garante que o aluno é do user via turma
    const student = await prisma.student.findFirst({
      where: { id: studentId, classroom: { userId } },
      select: { id: true, name: true, externalId: true, classroomId: true },
    });

    if (student) {
      const items = await prisma.knowledgeItem.findMany({
        where: { studentId: student.id, userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { title: true, content: true, source: true },
      });

      student_context =
        `ALUNO: ${student.name}\n` +
        (student.externalId ? `ID EXTERNO: ${student.externalId}\n` : "") +
        "\nBASE:\n" +
        items
          .map((k, i) => `#${i + 1} ${k.title} (${k.source})\n${k.content}`)
          .join("\n\n");
    }
  }

  return { classroom_context, student_context };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { agent, engine, prompt, use_context, classroomId, studentId, temperature } = parsed.data;

    const base = optionalEnv("AGENTS_API_BASE_URL");
    if (!base) {
      return NextResponse.json({ ok: false, error: "AGENTS_API_BASE_URL not configured" }, { status: 500 });
    }
    const url = `${base}/api/v1/agents/run`;

    const { classroom_context, student_context } = await buildContexts(
      session.user.id,
      classroomId,
      studentId
    );

    const payload = {
      agent,
      engine,
      prompt,
      use_context,
      classroom_context,
      student_context,
      temperature,
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "accept": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) {
      return NextResponse.json(
        { ok: false, error: `Agents API error ${r.status}: ${text.slice(0, 500)}` },
        { status: 502 }
      );
    }

    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { ok: false, error: `Agents API returned non-JSON: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    // salva histórico do run
    const output = data?.output ?? "";
    await prisma.agentRun.create({
      data: {
        userId: session.user.id,
        agent,
        input: prompt,
        output,
        creditsUsed: 0,
        classroomId: classroomId ?? null,
        studentId: studentId ?? null,
      },
    });

    // auto-save em KnowledgeItem (quando tiver turma/aluno)
    if ((classroomId || studentId) && output.trim()) {
      await prisma.knowledgeItem.create({
        data: {
          userId: session.user.id,
          classroomId: classroomId ?? null,
          studentId: studentId ?? null,
          title: `Agente: ${agent}`,
          content: output,
          source: "agent_run",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      engineUsed: data?.engineUsed ?? engine,
      output,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
