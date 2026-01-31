import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { mustGetEnv } from "@/lib/env";

export const runtime = "nodejs"; // needed for Stripe signature verification

export async function POST(req: Request) {
  const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), { apiVersion: "2023-10-16" });
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, mustGetEnv("STRIPE_WEBHOOK_SECRET"));
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err?.message ?? "invalid"}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const creditsStr = session.metadata?.credits;
    const subMonthlyCreditsStr = session.metadata?.monthlyCredits;
    const mode = session.mode;

    // One-time credit purchase
    const credits = Number(creditsStr ?? "0");
    if (userId && mode === "payment" && Number.isFinite(credits) && credits > 0) {
      // idempotent: store event id in tx table
      const exists = await prisma.creditTransaction.findFirst({ where: { stripeEventId: event.id } });
      if (!exists) {
        await prisma.$transaction(async (tx) => {
          await tx.creditTransaction.create({
            data: {
              userId,
              delta: credits,
              reason: `Compra Stripe • +${credits} créditos`,
              stripeEventId: event.id,
            },
          });
          await tx.user.update({
            where: { id: userId },
            data: { credits: { increment: credits } },
          });
        });
      }
    }
  }

  // Monthly subscription credit top-up
  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
    if (subId) {
      const exists = await prisma.creditTransaction.findFirst({ where: { stripeEventId: event.id } });
      if (!exists) {
        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = (sub.metadata?.userId || "").trim();
        const monthlyCredits = Number(sub.metadata?.monthlyCredits || "0");
        if (userId && Number.isFinite(monthlyCredits) && monthlyCredits > 0) {
          await prisma.$transaction(async (tx) => {
            await tx.creditTransaction.create({
              data: {
                userId,
                delta: monthlyCredits,
                reason: `Assinatura mensal • +${monthlyCredits} créditos`,
                stripeEventId: event.id,
              },
            });
            await tx.user.update({
              where: { id: userId },
              data: { credits: { increment: monthlyCredits } },
            });
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
