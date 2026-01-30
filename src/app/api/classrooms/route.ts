import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateSchema = z.object({
  classroomId: z.string().min(1),
  name: z.string().min(2),
  externalId: z.string().optional(),
});

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
    return NextResponse.json({ ok: false, error: "Turma inválida" }, { status: 404 });
  }

  const student = await prisma.student.create({
    data: {
      name,
      externalId: externalId ?? null,

      // ✅ em vez de classroomId direto:
      classroom: { connect: { id: classroomId } },

      // ✅ se o seu schema tiver userId opcional no Student (tem no que você colou)
      user: { connect: { id: session.user.id } },
    },
    select: { id: true, name: true, classroomId: true, createdAt: true },
  });

  return NextResponse.json(student, { status: 201 });
}
