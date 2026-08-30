import { prisma } from "@/lib/db";

export interface SubscriptionState {
  status: "inactive" | "active" | "canceled";
  plan: string;
  currentPeriodEnd: Date | null;
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
    isActive: status === "active" && notExpired,
  };
}

/** Stub "checkout": activate a 30-day monthly subscription. Replace with Stripe. */
export async function activateStubSubscription(userId: string) {
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      status: "active",
      plan: "monthly",
      currentPeriodEnd: periodEnd,
    },
    update: {
      status: "active",
      plan: "monthly",
      currentPeriodEnd: periodEnd,
    },
  });
}

export async function cancelStubSubscription(userId: string) {
  return prisma.subscription.update({
    where: { userId },
    data: { status: "canceled" },
  });
}
