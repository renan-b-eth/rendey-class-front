export type CreditPack = {
  id: "pack_20" | "pack_50" | "pack_100";
  credits: number;
  usd: number; // USD price
  label: string;
  tagline: string;
};

export const CREDIT_PACKS: CreditPack[] = [
  { id: "pack_20", credits: 20, usd: 3.99, label: "20 créditos", tagline: "Para testar e criar atividades rápidas" },
  { id: "pack_50", credits: 50, usd: 8.99, label: "50 créditos", tagline: "Melhor custo/benefício para a semana" },
  { id: "pack_100", credits: 100, usd: 14.99, label: "100 créditos", tagline: "Para quem usa todos os dias" },
];

export function getPack(id: string) {
  return CREDIT_PACKS.find((p) => p.id === id) ?? null;
}
