import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CREDIT_PACKS } from "@/lib/pricing";

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <div className="text-sm font-semibold">{title}</div>
      </CardHeader>
      <CardContent className="text-sm text-white/70">{desc}</CardContent>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <header className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10" />
          <div>
            <div className="text-sm font-semibold tracking-tight">Rendey Class</div>
            <div className="text-xs text-white/60">Agentes pedagógicos com créditos</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/auth/sign-in"><Button variant="secondary">Entrar</Button></Link>
          <Link href="/auth/sign-up"><Button>Criar conta</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="pt-10 md:pt-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <Badge>Rede pública</Badge>
              <span>feito para planejar, criar e corrigir mais rápido</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Agentes de IA para professores: quizzes, provas, rubricas e correção.
            </h1>

            <p className="text-white/70 leading-relaxed max-w-xl">
              Pare de perder horas no Word e no Excel. Com o Rendey Class você cria avaliações e atividades em minutos,
              com linguagem pedagógica e padrão de rede pública.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Link href="/auth/sign-up"><Button size="lg">Começar grátis (10 créditos)</Button></Link>
              <Link href="/auth/sign-in"><Button size="lg" variant="secondary">Já tenho conta</Button></Link>
            </div>

            <div className="text-xs text-white/50">
              Pagamento em dólar via Stripe (EUA) • Sem assinatura obrigatória • Pague conforme usar
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">Exemplo • Quiz (2 créditos)</div>
                <div className="mt-2 text-sm leading-relaxed">
                  <div className="font-semibold">Tema:</div> Frações (6º ano)
                  <div className="mt-2 font-semibold">Saída:</div> 10 questões (objetivas + discursivas) com gabarito e
                  habilidades.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">Exemplo • Prova (4 créditos)</div>
                <div className="mt-2 text-sm leading-relaxed">
                  Modelo pronto para imprimir com cabeçalho, critérios e espaço de resposta.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-white/60">Exemplo • Correção (6 créditos)</div>
                <div className="mt-2 text-sm leading-relaxed">
                  Envie sua planilha (.xlsx) com respostas e receba a nota + relatório por aluno.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-10 md:pt-14">
          <div className="text-sm font-semibold mb-3">O que você ganha</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Feature title="Pronto para sala de aula" desc="Textos curtos, objetivos e com formato de avaliação real — sem enrolação." />
            <Feature title="Créditos previsíveis" desc="Você controla o gasto: cada agente consome um número de créditos antes de rodar." />
            <Feature title="Exportação rápida" desc="Gere PDF para imprimir, compartilhe no WhatsApp ou publique no Classroom." />
          </div>
        </section>

        <section className="pt-10 md:pt-14">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Planos por créditos</div>
              <div className="text-sm text-white/60">Compre quando precisar. Sem fidelidade.</div>
            </div>
            <Link href="/auth/sign-up"><Button variant="secondary">Criar conta</Button></Link>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Link href="/auth/sign-up">
                    <Button className="w-full">Começar</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 text-xs text-white/50">
            Observação: os valores em dólar foram definidos para manter o preço acessível no Brasil e estável para pagamentos internacionais.
          </div>
        </section>

        <section className="pt-12">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xl font-semibold">Pronto para economizar tempo?</div>
              <div className="text-sm text-white/70">Crie sua conta e ganhe 10 créditos de boas-vindas.</div>
            </div>
            <div className="flex gap-2">
              <Link href="/auth/sign-up"><Button size="lg">Criar conta</Button></Link>
              <Link href="/auth/sign-in"><Button size="lg" variant="secondary">Entrar</Button></Link>
            </div>
          </div>
        </section>

        <footer className="pt-12 text-xs text-white/50">
          © {new Date().getFullYear()} Rendey Class • Rendey LLC • Suporte: contato@rendey.store
        </footer>
      </main>
    </div>
  );
}
