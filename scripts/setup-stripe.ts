// One-time: creates the "Breakaway IQ Membership" product + $19/mo price in your
// Stripe account (whichever mode your STRIPE_SECRET_KEY is in), then prints the
// price id to put in .env.local as STRIPE_PRICE_ID.
//
//   node --env-file=.env.local scripts/setup-stripe.ts

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY not set. Add it to .env.local first.");
  process.exit(1);
}

const stripe = new Stripe(key);
const mode = key.startsWith("sk_live") ? "LIVE" : "TEST";
const PRICE_LOOKUP_KEY = "breakaway_iq_monthly";
const AMOUNT_CENTS = 1900;

const existing = await stripe.prices.list({
  lookup_keys: [PRICE_LOOKUP_KEY],
  active: true,
  limit: 1,
});

if (existing.data[0]) {
  console.log(`(${mode}) Price already exists.`);
  console.log(`STRIPE_PRICE_ID="${existing.data[0].id}"`);
  process.exit(0);
}

const product = await stripe.products.create({
  name: "Breakaway IQ Membership",
  description: "Unlimited AI hockey skill breakdowns.",
});

const price = await stripe.prices.create({
  product: product.id,
  unit_amount: AMOUNT_CENTS,
  currency: "usd",
  recurring: { interval: "month" },
  lookup_key: PRICE_LOOKUP_KEY,
});

console.log(`(${mode}) Created product ${product.id} and price ${price.id}.`);
console.log("\nAdd this line to .env.local:\n");
console.log(`STRIPE_PRICE_ID="${price.id}"`);
