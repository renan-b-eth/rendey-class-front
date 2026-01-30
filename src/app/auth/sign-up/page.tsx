"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Não foi possível criar sua conta.");
      return;
    }

    // auto login
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight">Criar conta</div>
        <div className="text-sm text-white/70">
          Ganhe 10 créditos para testar os agentes.
        </div>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="text-sm font-semibold">Seus dados</div>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/70">Nome</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/70">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@escola.sp.gov.br" type="email" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/70">Senha</label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 8 caracteres" type="password" required />
            </div>

            {err ? <div className="text-sm text-red-300">{err}</div> : null}

            <Button className="w-full" disabled={loading}>
              {loading ? "Criando..." : "Criar conta"}
            </Button>
          </form>

          <div className="text-xs text-white/60">
            Já tem conta?{" "}
            <Link href="/auth/sign-in" className="text-white underline underline-offset-4">
              Entrar
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
