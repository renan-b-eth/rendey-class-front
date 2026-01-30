import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mustGetEnv } from "@/lib/env";

const Schema = z.object({
  agent: z.string().min(2),
  engine: z.enum(["FOUNDRY", "NVIDIA"]).default("FOUNDRY"),
  prompt: z.string().min(5),
  use_context: z.enum(["none", "classroom", "student", "both"]).default("none"),
  classroomId: z.string().optional(),
  studentId: z.string().optional(),
  temperature: z.number().min(0).max(1).optional(),
});

async function buildContext({
  use_context,
  classroomId,
  studentId,
}: {
  use_context: "none" | "classroom" | "student" | "both";
  classroomId?: string;
  studentId?: string;
}) {
  const take = 12;

  let classroom_context = "";
  let student_context = "";

  if ((use_context === "classroom" || use_context === "both") && classroomId) {
    const items = await prisma.knowledgeItem.findMany({
      where: { classroomId },
      orderBy: { createdAt: "desc" },
      take,
      select: { title: true, content: true, createdAt: true },
    });

    classroom_context = items
      .reverse()
      .map(
        (i) =>
          `### ${i.title} (${new Date(i.createdAt).toLocaleDateString("pt-BR")})\n${i.content}`
      )
      .join("\n\n");
  }

  if ((use_context === "student" || use_context === "both") && studentId) {
    const items = await prisma.knowledgeItem.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take,
      select: { title: true, content: true, createdAt: true },
    });

    student_context = items
      .reverse()
      .map(
        (i) =>
          `### ${i.title} (${new Date(i.createdAt).toLocaleDateString("pt-BR")})\n${i.content}`
      )
      .join("\n\n");
  }

  return { classroom_context, student_context };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { agent, engine, prompt, use_context, classroomId, studentId, temperature } =
    parsed.data;

  const { classroom_context, student_context } = await buildContext({
    use_context,
    classroomId,
    studentId,
  });

  const BACKEND_API_BASE_URL = mustGetEnv("BACKEND_API_BASE_URL");

  const r = await fetch(`${BACKEND_API_BASE_URL}/api/v1/agents/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agent,
      engine,
      prompt,
      use_context,
      classroom_context: classroom_context || undefined,
      student_context: student_context || undefined,
      temperature: temperature ?? 0.7,
    }),
  });

  const json = await r.json().catch(() => null);
  if (!r.ok || !json?.ok) {
    return NextResponse.json(
      { ok: false, error: json?.error ?? "Backend error", raw: json },
      { status: 500 }
    );
  }

  const output = json.output ?? "";

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

  if (classroomId || studentId) {
    await prisma.knowledgeItem.create({
      data: {
        userId: session.user.id,
        title: `${agent.toUpperCase()} - conteúdo gerado`,
        content: output,
        source: "agent",
        classroomId: classroomId ?? null,
        studentId: studentId ?? null,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    engineUsed: json.engineUsed ?? engine,
    output,
  });
}
