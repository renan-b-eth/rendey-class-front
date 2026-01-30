export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-white">
      <div className="mx-auto max-w-md px-4 py-10">
        {children}
        <div className="mt-8 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Rendey Class • Feito para professores da rede pública
        </div>
      </div>
    </div>
  );
}
