"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionState } from "@/lib/subscription";

export function SubscriptionCard({ initial }: { initial: SubscriptionState }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function mutate(action: "subscribe" | "cancel") {
    setError(null);
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: action === "cancel" ? "cancel" : "subscribe" }),
    });
    if (!res.ok) {
      setError("Could not update subscription.");
      return;
    }
    const next = (await res.json()) as SubscriptionState;
    // API returns ISO strings; normalize the one date we display.
    next.currentPeriodEnd = next.currentPeriodEnd
      ? new Date(next.currentPeriodEnd)
      : null;
    setState(next);
    startTransition(() => router.refresh());
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-muted">Membership</div>
          <div className="mt-1 text-lg font-semibold">
            {state.isActive ? "Active" : state.status === "canceled" ? "Canceled" : "Not active"}
          </div>
          {state.isActive && state.currentPeriodEnd && (
            <div className="text-sm text-muted">
              Renews {new Date(state.currentPeriodEnd).toLocaleDateString()}
            </div>
          )}
          <p className="mt-2 max-w-md text-sm text-muted">
            $19/month · unlimited skill breakdowns.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {state.isActive ? (
            <button
              onClick={() => mutate("cancel")}
              disabled={pending}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background disabled:opacity-50"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => mutate("subscribe")}
              disabled={pending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:opacity-90 disabled:opacity-50"
            >
              Start membership
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
        Checkout is stubbed for now — this button activates a membership without
        payment. Stripe comes next.
      </p>
      {error && <p className="mt-2 text-sm text-accent">{error}</p>}
    </div>
  );
}
