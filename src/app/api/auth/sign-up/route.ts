import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const Schema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 });

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { name: name ?? null, email, passwordHash, credits: 10 }, // bônus inicial p/ testar
    select: { id: true, email: true, name: true, credits: true },
  });

  return NextResponse.json({ user });
}
