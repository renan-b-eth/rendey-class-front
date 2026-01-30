"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const nav = [
  { href: "/dashboard", label: "Painel" },
  { href: "/agents", label: "Agentes" },
  { href: "/lessons", label: "Aulas" },
  { href: "/export", label: "Exportar PDF" },
  { href: "/billing", label: "Créditos" },
];

function formatToday() {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());
  } catch {
    return new Date().toLocaleDateString();
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();
  const userName = data?.user?.name ?? data?.user?.email ?? "Minha conta";
  const credits = data?.user?.credits ?? 0;

  const title = useMemo(() => nav.find((n) => pathname?.startsWith(n.href))?.label ?? "Rendey Class", [pathname]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex gap-4">
          <aside className="hidden md:block w-72 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 space-y-1">
                <div className="text-sm font-semibold tracking-tight">Rendey Class</div>
                <div className="text-xs text-white/60">Agentes pedagógicos • Rede pública</div>
              </div>

              <div className="mb-4 rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs text-white/60">Créditos disponíveis</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-2xl font-semibold">{credits}</div>
                  <Link href="/billing">
                    <Button size="sm" variant="secondary">Comprar</Button>
                  </Link>
                </div>
                <div className="mt-2 text-[11px] text-white/50">
                  Use créditos para gerar quizzes, provas, rubricas e correções.
                </div>
              </div>

              <nav className="space-y-1">
                {nav.map((item) => {
                  const active = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-xl px-3 py-2 text-sm transition",
                        active ? "bg-white text-slate-950" : "text-white/80 hover:bg-white/10"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs text-white/60">Conta</div>
                <div className="mt-1 text-sm font-semibold truncate">{userName}</div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3 w-full"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sair
                </Button>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <header className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="md:hidden text-sm font-semibold">
                  Rendey Class
                </Link>
                <div className="hidden md:block">
                  <div className="text-xs text-white/50 capitalize">{formatToday()}</div>
                  <div className="text-lg font-semibold">{title}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="hidden sm:inline-flex">Créditos: {credits}</Badge>
                <Link href="/billing">
                  <Button size="sm">Comprar créditos</Button>
                </Link>
              </div>
            </header>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
