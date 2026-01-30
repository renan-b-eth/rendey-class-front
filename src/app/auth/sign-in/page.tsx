"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });
    setLoading(false);

    if (res?.error) setErr("Email ou senha inválidos.");
    else window.location.href = res?.url ?? "/dashboard";
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight">Entrar</div>
        <div className="text-sm text-white/70">
          Acesse sua área e use os agentes pedagógicos.
        </div>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="text-sm font-semibold">Sua conta</div>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@escola.sp.gov.br" type="email" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/70">Senha</label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" required />
            </div>

            {err ? <div className="text-sm text-red-300">{err}</div> : null}

            <Button className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-xs text-white/60">
            Não tem conta?{" "}
            <Link href="/auth/sign-up" className="text-white underline underline-offset-4">
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-white/60">
        <Link href="/" className="underline underline-offset-4">
          Voltar para a landing page
        </Link>
      </div>
    </div>
  );
}
