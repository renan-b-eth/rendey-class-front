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
    select: { id: true, name: true, createdAt: true },
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

  const classroom = await prisma.classroom.create({
    data: {
      // ✅ campos corretos do seu Prisma
      name: parsed.data.name,
      schoolName: parsed.data.schoolName ?? null,
      subject: parsed.data.subject ?? null,
      grade: parsed.data.grade ?? null,

      // ✅ vínculo com usuário (no seu schema, userId existe e é obrigatório)
      userId: session.user.id,
    },
    select: { id: true, name: true, createdAt: true },
  });

  return NextResponse.json(classroom, { status: 201 });
}
