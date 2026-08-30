import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe, usingStripe } from "@/lib/stripe";
import {
  getSubscriptionState,
  upsertSubscriptionFromStripe,
} from "@/lib/subscription";

export const runtime = "nodejs";

/**
 * Pull the user's current subscription straight from Stripe and write it to the
 * DB. Called right after Checkout returns, so activation doesn't depend on the
 * webhook having landed yet. The webhook remains the source of truth over time.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!usingStripe()) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 501 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) {
    return NextResponse.json(await getSubscriptionState(session.user.id));
  }

  const subs = await stripe().subscriptions.list({
    customer: user.stripeCustomerId,
    status: "all",
    limit: 3,
  });

  const relevant =
    subs.data.find((s) => s.status === "active" || s.status === "trialing") ??
    subs.data[0];

  if (relevant) {
    await upsertSubscriptionFromStripe(user.id, relevant);
  }

  return NextResponse.json(await getSubscriptionState(session.user.id));
}
