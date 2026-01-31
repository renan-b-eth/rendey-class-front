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

export type SubscriptionPlan = {
  id: "sub_basic" | "sub_pro";
  monthlyCredits: number;
  usdMonthly: number;
  label: string;
  tagline: string;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: "sub_basic", monthlyCredits: 300, usdMonthly: 9.99, label: "Assinatura Basic", tagline: "Créditos mensais para uso constante" },
  { id: "sub_pro", monthlyCredits: 1000, usdMonthly: 24.99, label: "Assinatura Pro", tagline: "Para quem gera provas, rubricas e relatórios" },
];

export function getSubscriptionPlan(id: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id) ?? null;
}

export function getPack(id: string): CreditPack | null {
  return CREDIT_PACKS.find((p) => p.id === id) ?? null;
}
