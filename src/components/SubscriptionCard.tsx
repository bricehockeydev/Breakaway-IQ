"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SubscriptionState } from "@/lib/subscription";

type BillingMode = "stripe" | "stub";

function normalize(s: SubscriptionState): SubscriptionState {
  return {
    ...s,
    currentPeriodEnd: s.currentPeriodEnd ? new Date(s.currentPeriodEnd) : null,
  };
}

export function SubscriptionCard({
  initial,
  billingMode,
}: {
  initial: SubscriptionState;
  billingMode: BillingMode;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const polledRef = useRef(false);

  // After returning from Stripe Checkout, poll until the webhook flips us active.
  useEffect(() => {
    if (params.get("checkout") !== "success" || polledRef.current) return;
    polledRef.current = true;
    let tries = 0;
    const tick = async () => {
      tries++;
      // Pull straight from Stripe first so activation doesn't wait on the webhook.
      const endpoint = tries === 1 ? "/api/billing/sync" : "/api/subscription";
      const res = await fetch(endpoint, {
        method: tries === 1 ? "POST" : "GET",
        cache: "no-store",
      });
      if (res.ok) {
        const next = normalize((await res.json()) as SubscriptionState);
        setState(next);
        if (next.isActive) {
          startTransition(() => router.refresh());
          return;
        }
      }
      if (tries < 6) setTimeout(tick, 2000);
    };
    tick();
  }, [params, router]);

  async function redirectVia(endpoint: "/api/checkout" | "/api/portal") {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error.");
      setBusy(false);
    }
  }

  async function stub(action: "subscribe" | "cancel") {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Could not update subscription.");
      return;
    }
    setState(normalize((await res.json()) as SubscriptionState));
    startTransition(() => router.refresh());
  }

  const label =
    state.status === "trialing"
      ? "Trial"
      : state.isActive
        ? "Active"
        : state.status === "past_due"
          ? "Payment failed"
          : state.status === "canceled"
            ? "Canceled"
            : "Not active";

  const working = busy || pending;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-muted">Membership</div>
          <div className="mt-1 text-lg font-semibold">{label}</div>
          {state.isActive && state.currentPeriodEnd && (
            <div className="text-sm text-muted">
              {state.cancelAtPeriodEnd ? "Ends" : "Renews"}{" "}
              {new Date(state.currentPeriodEnd).toLocaleDateString()}
            </div>
          )}
          <p className="mt-2 max-w-md text-sm text-muted">
            $19/month · unlimited skill breakdowns.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {billingMode === "stripe" ? (
            state.isActive || state.status === "past_due" ? (
              <button
                onClick={() => redirectVia("/api/portal")}
                disabled={working}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background disabled:opacity-50"
              >
                Manage membership
              </button>
            ) : (
              <button
                onClick={() => redirectVia("/api/checkout")}
                disabled={working}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:opacity-90 disabled:opacity-50"
              >
                {working ? "…" : "Start membership"}
              </button>
            )
          ) : state.isActive ? (
            <button
              onClick={() => stub("cancel")}
              disabled={working}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background disabled:opacity-50"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => stub("subscribe")}
              disabled={working}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:opacity-90 disabled:opacity-50"
            >
              Start membership
            </button>
          )}
        </div>
      </div>

      {params.get("checkout") === "success" && !state.isActive && (
        <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          Payment received — activating your membership…
        </p>
      )}

      {billingMode === "stub" && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Billing isn&apos;t configured — this button activates a membership without
          payment. Add your Stripe keys to switch on real checkout.
        </p>
      )}

      {error && <p className="mt-2 text-sm text-accent">{error}</p>}
    </div>
  );
}
