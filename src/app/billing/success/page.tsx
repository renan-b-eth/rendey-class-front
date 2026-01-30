"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="border-white/10 bg-white/5">
          <CardContent className="p-6 space-y-2">
            <div className="text-2xl font-semibold">Pagamento confirmado ✅</div>
            <div className="text-sm text-white/70">
              Seus créditos serão liberados em instantes (webhook Stripe). Se não aparecer, atualize a página.
            </div>
            <div className="flex gap-2 pt-2">
              <Link href="/agents"><Button>Ir para os agentes</Button></Link>
              <Link href="/billing"><Button variant="secondary">Ver créditos</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
