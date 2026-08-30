import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { stripe, WEBHOOK_SECRET } from "@/lib/stripe";
import { upsertSubscriptionFromStripe } from "@/lib/subscription";

export const runtime = "nodejs";

async function resolveUserId(
  sub: Stripe.Subscription,
): Promise<string | null> {
  const metaUserId = sub.metadata?.userId;
  if (metaUserId) return metaUserId;

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  return user?.id ?? null;
}

export async function POST(req: Request) {
  const secret = WEBHOOK_SECRET();
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  const s = stripe();

  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("stripe webhook signature failed:", err);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        if (cs.subscription) {
          const subId =
            typeof cs.subscription === "string" ? cs.subscription : cs.subscription.id;
          const sub = await s.subscriptions.retrieve(subId);
          const userId =
            cs.client_reference_id ?? (await resolveUserId(sub));
          if (userId) await upsertSubscriptionFromStripe(userId, sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(sub);
        if (userId) await upsertSubscriptionFromStripe(userId, sub);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`stripe webhook handler error (${event.type}):`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
