import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
  name: z.string().min(2),
  classroomId: z.string(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  const student = await prisma.student.create({
    data: parsed.data,
  });

  return NextResponse.json(student);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classroomId = searchParams.get("classroomId");

  const students = await prisma.student.findMany({
    where: classroomId ? { classroomId } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}
