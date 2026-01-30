import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import { getPack } from "@/lib/pricing";
import { mustGetEnv } from "@/lib/env";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const packId = body?.packId as string | undefined;
  const pack = packId ? getPack(packId) : null;
  if (!pack) return NextResponse.json({ error: "Pack inválido" }, { status: 400 });

  const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), { apiVersion: "2023-10-16" });

  const appUrl = mustGetEnv("NEXT_PUBLIC_APP_URL");

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/billing/success`,
    cancel_url: `${appUrl}/billing`,
    customer_email: session.user.email ?? undefined,
    metadata: {
      userId: session.user.id,
      packId: pack.id,
      credits: String(pack.credits),
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Rendey Class • ${pack.credits} créditos`,
            description: pack.tagline,
          },
          unit_amount: Math.round(pack.usd * 100),
        },
        quantity: 1,
      },
    ],
  });

  return NextResponse.json({ url: checkout.url });
}
