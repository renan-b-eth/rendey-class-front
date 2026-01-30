import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File;
  const classroomId = form.get("classroomId")?.toString() ?? null;
  const studentId = form.get("studentId")?.toString() ?? null;

  if (!file)
    return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });

  await prisma.knowledgeItem.create({
    data: {
      userId: session.user.id,
      title: file.name,
      content: "Arquivo enviado pelo professor.",
      source: "upload",
      classroomId,
      studentId,
    },
  });

  return NextResponse.json({ ok: true });
}
