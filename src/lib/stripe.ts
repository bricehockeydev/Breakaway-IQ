import Stripe from "stripe";

/** True when Stripe is configured; otherwise the app falls back to the stub checkout. */
export function usingStripe(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_ID;
}

let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  cached ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    // Pin nothing — use the SDK's default API version.
    typescript: true,
    appInfo: { name: "Breakaway IQ" },
  });
  return cached;
}

export const PRICE_ID = () => process.env.STRIPE_PRICE_ID ?? "";
export const WEBHOOK_SECRET = () => process.env.STRIPE_WEBHOOK_SECRET ?? "";

/** Absolute base URL for building Stripe redirect URLs. */
export function appUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

/** Map a Stripe subscription status to our internal status. */
export function mapStripeStatus(s: Stripe.Subscription.Status): string {
  switch (s) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "inactive";
  }
}
