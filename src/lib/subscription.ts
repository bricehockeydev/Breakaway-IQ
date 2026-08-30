import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { mapStripeStatus } from "@/lib/stripe";

export interface SubscriptionState {
  status: "inactive" | "active" | "trialing" | "past_due" | "canceled";
  plan: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
}

export async function getSubscriptionState(
  userId: string,
): Promise<SubscriptionState> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });

  const status = (sub?.status ?? "inactive") as SubscriptionState["status"];
  const currentPeriodEnd = sub?.currentPeriodEnd ?? null;
  const notExpired =
    !currentPeriodEnd || currentPeriodEnd.getTime() > Date.now();

  return {
    status,
    plan: sub?.plan ?? "monthly",
    currentPeriodEnd,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    isActive: (status === "active" || status === "trialing") && notExpired,
  };
}

/** Write a Stripe subscription object into our DB. Used by the webhook. */
export async function upsertSubscriptionFromStripe(
  userId: string,
  sub: Stripe.Subscription,
) {
  const item = sub.items.data[0];
  // `current_period_end` lives on the item in recent API versions, on the
  // subscription in older ones.
  const periodEndUnix =
    item?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    null;

  const data = {
    status: mapStripeStatus(sub.status),
    plan: "monthly",
    stripeSubscriptionId: sub.id,
    stripePriceId: item?.price.id ?? null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
  };

  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

// --- Stub checkout (used only when Stripe isn't configured) ---

export async function activateStubSubscription(userId: string) {
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, status: "active", plan: "monthly", currentPeriodEnd: periodEnd },
    update: { status: "active", plan: "monthly", currentPeriodEnd: periodEnd },
  });
}

export async function cancelStubSubscription(userId: string) {
  return prisma.subscription.update({
    where: { userId },
    data: { status: "canceled" },
  });
}
