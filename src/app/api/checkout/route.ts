import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { appUrl, PRICE_ID, stripe, usingStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!usingStripe()) {
    return NextResponse.json(
      { error: "Billing isn't configured. Use the stub button in dev." },
      { status: 501 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const s = stripe();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await s.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const base = appUrl(req);
  const checkout = await s.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: PRICE_ID(), quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${base}/dashboard?checkout=success`,
    cancel_url: `${base}/dashboard?checkout=cancelled`,
    client_reference_id: user.id,
    subscription_data: { metadata: { userId: user.id } },
  });

  return NextResponse.json({ url: checkout.url });
}
