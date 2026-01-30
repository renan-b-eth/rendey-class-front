"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CREDIT_PACKS } from "@/lib/pricing";

export default function BillingPage() {
  const { data } = useSession();
  const credits = data?.user?.credits ?? 0;
  const [loading, setLoading] = useState<string | null>(null);

  async function buy(packId: string) {
    setLoading(packId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ packId }),
    });
    const j = await res.json().catch(() => null);
    setLoading(null);
    if (j?.url) window.location.href = j.url;
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold tracking-tight">Créditos</div>
            <div className="text-sm text-white/60">
              Você tem <span className="text-white font-semibold">{credits}</span> créditos disponíveis.
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">Voltar</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CREDIT_PACKS.map((p) => (
            <Card key={p.id} className="border-white/10 bg-white/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{p.label}</div>
                  {p.id === "pack_50" ? <Badge>Recomendado</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-4xl font-semibold">${p.usd.toFixed(2)}</div>
                <div className="text-sm text-white/70">{p.tagline}</div>
                <Button className="w-full" disabled={loading === p.id} onClick={() => buy(p.id)}>
                  {loading === p.id ? "Abrindo Stripe..." : "Comprar créditos"}
                </Button>
                <div className="text-xs text-white/50">
                  Pagamento seguro via Stripe (EUA). Créditos caem automaticamente após a confirmação.
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-5 text-sm text-white/70 space-y-2">
            <div className="font-semibold text-white">Como os créditos funcionam</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gerar quiz: 2 créditos</li>
              <li>Criar prova: 4 créditos</li>
              <li>Corrigir prova (planilha): 6 créditos</li>
              <li>Gerar rubrica/feedback: 2 créditos</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
