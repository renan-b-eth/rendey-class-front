import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateSchema = z.object({
  classroomId: z.string().min(5),
  name: z.string().min(2),
  externalId: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classroomId = searchParams.get("classroomId") ?? undefined;

  // Se vier classroomId, lista só daquela turma.
  // Caso não venha, lista todos os alunos das turmas do usuário.
  const items = await prisma.student.findMany({
    where: classroomId
      ? { classroomId, classroom: { userId: session.user.id } }
      : { classroom: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      externalId: true,
      classroomId: true,
      createdAt: true,
      classroom: { select: { name: true } },
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { classroomId, name, externalId } = parsed.data;

  // ✅ segurança: garante que a turma é do usuário logado
  const classroom = await prisma.classroom.findFirst({
    where: { id: classroomId, userId: session.user.id },
    select: { id: true },
  });

  if (!classroom) {
    return NextResponse.json(
      { ok: false, error: "Turma não encontrada ou sem permissão." },
      { status: 404 }
    );
  }

  // ✅ CRIA usando relation connect (NÃO usa classroomId direto)
  const student = await prisma.student.create({
    data: {
      name,
      externalId: externalId ?? null,
      classroom: { connect: { id: classroomId } },
      // opcional: se quiser “dono” no student também:
      // user: { connect: { id: session.user.id } },  // só se existir no seu CreateInput
    },
    select: {
      id: true,
      name: true,
      externalId: true,
      classroomId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(student, { status: 201 });
}
