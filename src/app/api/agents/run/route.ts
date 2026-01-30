import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mustGetEnv } from "@/lib/env";

const Schema = z.object({
  agent: z.enum(["quiz", "prova", "rubrica", "feedback"]),
  prompt: z.string().min(5),
  engine: z.enum(["foundry", "nvidia"]).default("foundry"),
});

const COST: Record<string, number> = {
  quiz: 2,
  prova: 4,
  rubrica: 2,
  feedback: 2,
};

async function callFoundry(prompt: string) {
  const base = mustGetEnv("FOUNDRY_API_BASE_URL");
  const key = mustGetEnv("FOUNDRY_API_KEY");
  const model = process.env.FOUNDRY_MODEL ?? "gpt-4o-mini";

  const res = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "Você é um assistente pedagógico para professores da rede pública brasileira. Responda em pt-BR, com formato pronto para sala de aula." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Foundry API error: ${res.status} ${t}`);
  }

  const j: any = await res.json();
  const out = j?.choices?.[0]?.message?.content ?? "";
  return String(out).trim();
}

async function callNvidia(prompt: string) {
  const base = mustGetEnv("NVIDIA_API_BASE_URL");
  const key = mustGetEnv("NVIDIA_API_KEY");
  const model = process.env.NVIDIA_MODEL ?? "meta/llama-3.1-70b-instruct";

  const res = await fetch(`${base}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "Você é um assistente pedagógico para professores da rede pública brasileira. Responda em pt-BR, com formato pronto para sala de aula." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`NVIDIA API error: ${res.status} ${t}`);
  }

  const j: any = await res.json();
  const out = j?.choices?.[0]?.message?.content ?? "";
  return String(out).trim();
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { agent, prompt, engine } = parsed.data;
  const cost = COST[agent] ?? 2;

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { credits: true } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  if (user.credits < cost) {
    return NextResponse.json({ error: "Créditos insuficientes. Compre mais créditos para continuar." }, { status: 402 });
  }

  let output = "";
  try {
    output = engine === "nvidia" ? await callNvidia(prompt) : await callFoundry(prompt);
  } catch (e: any) {
    // don't charge if model call fails
    return NextResponse.json({ error: e?.message ?? "Falha ao executar agente." }, { status: 502 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: cost } },
    });
    await tx.creditTransaction.create({
      data: {
        userId: session.user.id,
        delta: -cost,
        reason: `Uso de agente • ${agent}`,
      },
    });
    await tx.agentRun.create({
      data: {
        userId: session.user.id,
        agent,
        input: prompt,
        output,
        creditsUsed: cost,
      },
    });
  });

  return NextResponse.json({ output, creditsUsed: cost });
}
