import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getSubscriptionState } from "@/lib/subscription";
import { usingStripe } from "@/lib/stripe";
import { getSkill } from "@/lib/hockey/skills";
import { getProgressSummaries } from "@/lib/analyses";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { StatusBadge } from "@/components/StatusBadge";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [sub, summaries, recent] = await Promise.all([
    getSubscriptionState(session.user.id),
    getProgressSummaries(session.user.id),
    prisma.analysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {sub.isActive && (
          <Link
            href="/skills"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:opacity-90"
          >
            New analysis
          </Link>
        )}
      </div>

      <div className="mt-6">
        <Suspense fallback={null}>
          <SubscriptionCard initial={sub} billingMode={usingStripe() ? "stripe" : "stub"} />
        </Suspense>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Your progress</h2>
      {summaries.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
          No completed analyses yet.{" "}
          {sub.isActive ? (
            <Link href="/skills" className="font-medium text-primary underline">
              Pick a skill to get started.
            </Link>
          ) : (
            "Start your membership above, then pick a skill."
          )}
        </p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {summaries.map((s) => {
            const improved = s.count >= 2 && s.latestFlawCount < s.firstFlawCount;
            const worse = s.count >= 2 && s.latestFlawCount > s.firstFlawCount;
            return (
              <Link
                key={s.skillKey}
                href={`/progress/${s.skillKey}`}
                className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
              >
                <div className="font-semibold">{s.skillName}</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                  <span>
                    {s.count} {s.count === 1 ? "breakdown" : "breakdowns"} · last{" "}
                    {new Date(s.latestAt).toLocaleDateString()}
                  </span>
                  {s.count >= 2 && (
                    <span
                      className={
                        improved
                          ? "text-emerald-600"
                          : worse
                            ? "text-rose-600"
                            : ""
                      }
                    >
                      priorities: {s.firstFlawCount} → {s.latestFlawCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {recent.length > 0 && (
        <>
          <h2 className="mt-10 text-lg font-semibold">Recent activity</h2>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {recent.map((a) => {
              const skill = getSkill(a.skillKey);
              return (
                <li key={a.id}>
                  <Link
                    href={`/analysis/${a.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-background"
                  >
                    <div>
                      <div className="font-medium">{skill?.name ?? a.skillKey}</div>
                      <div className="text-xs text-muted">
                        {new Date(a.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
