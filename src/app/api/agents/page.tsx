import { AppShell } from "@/components/layout/AppShell";

export default function AgentsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Copiloto Pedagógico</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Gere quizzes, provas, relatórios e planos de aula em segundos,
          utilizando o contexto real da sua turma e de cada aluno.
        </p>
      </div>

      <div className="rounded-2xl border p-6 bg-white/5">
        {/* aqui entra o painel que você já tem */}
        <p className="text-sm text-muted-foreground">
          Selecione o agente, a turma e o aluno para começar.
        </p>
      </div>
    </AppShell>
  );
}
