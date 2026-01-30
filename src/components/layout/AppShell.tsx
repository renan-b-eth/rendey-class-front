"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lessons", label: "Lessons" },
  { href: "/agents", label: "AI Agents" },
  { href: "/export", label: "Export PDF" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex gap-4">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4">
                <div className="text-sm font-semibold">Rendey Class</div>
                <div className="text-xs text-white/60">Day 1 Frontend</div>
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
                        active ? "bg-white text-black" : "text-white/80 hover:bg-white/10"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/70">
                This build runs without ENV keys. Later you can connect Supabase + Hugging Face.
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <header className="mb-4 flex items-center justify-between">
              <div className="md:hidden">
                <Link href="/dashboard" className="text-sm font-semibold">Rendey Class</Link>
              </div>
              <div className="hidden md:block text-xs text-white/50">
                {new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "2-digit", year: "numeric" })}
              </div>
              <div className="text-xs text-white/60">
                Teacher UI • Vercel-safe
              </div>
            </header>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
