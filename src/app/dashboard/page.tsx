"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const { data } = useSession();
  const credits = data?.user?.credits ?? 0;

  const lessons = useAppStore((s) => s.lessons);
  const addLesson = useAppStore((s) => s.addLesson);

  // seed
  useEffect(() => {
    if (!Array.isArray(lessons) || lessons.length > 0) return;

    const id =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ??
      `l_${Math.random().toString(16).slice(2)}_${Date.now()}`;

    const now = Date.now();

    addLesson({
      id,
      title: "Aula exemplo — Frações (6º ano)",
      subject: "Matemática",
      grade: "6º ano",
      durationMin: 50,
      topic: "Introdução a frações",
      objectives:
        "- Entender o conceito de fração\n- Identificar numerador e denominador\n- Representar frações simples",
      contentMd:
        "## Aquecimento (5 min)\n- Perguntas rápidas no quadro\n\n## Explicação (15 min)\n- Conceito de fração (parte/todo)\n- Exemplos do cotidiano\n\n## Prática (20 min)\n- Exercícios guiados\n- Correção em dupla\n\n## Fechamento (10 min)\n- Mini exit ticket\n",
      tags: ["frações", "matemática", "exemplo"],
      createdAt: now,
      updatedAt: now,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons?.length, addLesson]);

  const recent = useMemo(() => (Array.isArray(lessons) ? lessons.slice(0, 4) : []), [lessons]);

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Painel</div>
            <div className="text-sm text-white/60">
              {credits > 0 ? (
                <span>
                  Você tem <span className="text-white font-semibold">{credits}</span> créditos para usar hoje.
                </span>
              ) : (
                <span>Você está sem créditos — compre um pacote para continuar usando os agentes.</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/agents"><Button>Usar agentes</Button></Link>
            <Link href="/billing"><Button variant="secondary">Créditos</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <div className="text-sm font-semibold">Atalhos</div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/agents" className="block">
                <Button className="w-full">Criar quiz / prova</Button>
              </Link>
              <Link href="/lessons" className="block">
                <Button className="w-full" variant="secondary">Minhas aulas</Button>
              </Link>
              <Link href="/export" className="block">
                <Button className="w-full" variant="secondary">Exportar PDF</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Aulas recentes</div>
                <Badge>{lessons?.length ?? 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recent.map((l) => (
                <Link
                  key={l.id}
                  href={`/lessons/${l.id}`}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4 hover:bg-black/40 transition"
                >
                  <div className="text-sm font-semibold">{l.title}</div>
                  <div className="text-xs text-white/60">{l.subject} • {l.grade}</div>
                  <div className="mt-2 text-xs text-white/70 line-clamp-2">{l.topic}</div>
                </Link>
              ))}
              {recent.length === 0 ? (
                <div className="text-sm text-white/60">Crie sua primeira aula ou use um agente para gerar conteúdo.</div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-5 text-sm text-white/70">
            <div className="font-semibold text-white">Para professores da rede pública</div>
            <div className="mt-1">
              Interface simples, letras grandes, botões claros e rotinas prontas para impressão e compartilhamento.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
