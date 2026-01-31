import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateSchema = z.object({
  name: z.string().min(2),
  schoolName: z.string().optional(),
  subject: z.string().optional(),
  grade: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.classroom.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      schoolName: true,
      subject: true,
      grade: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { students: true } },
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

  const { name, schoolName, subject, grade } = parsed.data;

  // ✅ cria turma conectando o usuário via relation (evita userId: never)
  const classroom = await prisma.classroom.create({
    data: {
      name,
      schoolName: schoolName?.trim() ? schoolName.trim() : null,
      subject: subject?.trim() ? subject.trim() : null,
      grade: grade?.trim() ? grade.trim() : null,
      user: { connect: { id: session.user.id } },
    },
    select: {
      id: true,
      name: true,
      schoolName: true,
      subject: true,
      grade: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(classroom, { status: 201 });
}
