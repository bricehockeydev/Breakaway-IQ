import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { usingStripe } from "@/lib/stripe";
import {
  activateStubSubscription,
  cancelStubSubscription,
  getSubscriptionState,
} from "@/lib/subscription";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getSubscriptionState(session.user.id));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Real billing goes through /api/checkout and /api/portal.
  if (usingStripe()) {
    return NextResponse.json(
      { error: "Use checkout for billing changes." },
      { status: 400 },
    );
  }

  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  if (action === "cancel") {
    await cancelStubSubscription(session.user.id);
  } else {
    await activateStubSubscription(session.user.id);
  }

  return NextResponse.json(await getSubscriptionState(session.user.id));
}
