import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getSubscriptionState } from "@/lib/subscription";
import { usingStripe } from "@/lib/stripe";
import { getSkill, type SkillCategory } from "@/lib/hockey/skills";
import { getProgressSummaries } from "@/lib/analyses";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  IconShooting,
  IconSkating,
  IconStick,
  RinkCorner,
} from "@/components/marketing/graphics";

const CAT: Record<
  SkillCategory,
  { icon: typeof IconShooting; text: string; bg: string; ring: string }
> = {
  shooting: {
    icon: IconShooting,
    text: "text-accent",
    bg: "bg-rose-50",
    ring: "hover:border-accent",
  },
  skating: {
    icon: IconSkating,
    text: "text-primary",
    bg: "bg-sky-50",
    ring: "hover:border-primary",
  },
  stickhandling: {
    icon: IconStick,
    text: "text-amber-600",
    bg: "bg-amber-50",
    ring: "hover:border-amber-500",
  },
};

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

  const firstName = session.user.name?.split(" ")[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header band */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-dark px-6 py-7 text-white">
        <RinkCorner className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 text-white/15" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
              Breakaway IQ
            </div>
            <h1 className="mt-1 text-2xl font-bold">
              {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
            </h1>
          </div>
          {sub.isActive && (
            <Link
              href="/skills"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-dark transition-transform hover:-translate-y-0.5"
            >
              + New analysis
            </Link>
          )}
        </div>
      </div>

      <div className="mt-5">
        <Suspense fallback={null}>
          <SubscriptionCard initial={sub} billingMode={usingStripe() ? "stripe" : "stub"} />
        </Suspense>
      </div>

      {/* Progress */}
      <h2 className="mt-9 text-lg font-semibold">Your progress</h2>
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
            const cat = CAT[getSkill(s.skillKey)?.category ?? "shooting"];
            const Icon = cat.icon;
            const improved = s.count >= 2 && s.latestFlawCount < s.firstFlawCount;
            const worse = s.count >= 2 && s.latestFlawCount > s.firstFlawCount;
            return (
              <Link
                key={s.skillKey}
                href={`/progress/${s.skillKey}`}
                className={`rounded-xl border border-border bg-surface p-4 transition-colors ${cat.ring}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cat.bg} ${cat.text}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="font-semibold">{s.skillName}</div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted">
                    {s.count} {s.count === 1 ? "breakdown" : "breakdowns"} · last{" "}
                    {new Date(s.latestAt).toLocaleDateString()}
                  </span>
                  {s.count >= 2 && (
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        improved
                          ? "bg-emerald-100 text-emerald-800"
                          : worse
                            ? "bg-rose-100 text-rose-800"
                            : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      priorities {s.firstFlawCount} → {s.latestFlawCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Recent */}
      {recent.length > 0 && (
        <>
          <h2 className="mt-9 text-lg font-semibold">Recent activity</h2>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {recent.map((a) => {
              const skill = getSkill(a.skillKey);
              const cat = CAT[skill?.category ?? "shooting"];
              const Icon = cat.icon;
              return (
                <li key={a.id}>
                  <Link
                    href={`/analysis/${a.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cat.bg} ${cat.text}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-medium">{skill?.name ?? a.skillKey}</div>
                        <div className="text-xs text-muted">
                          {new Date(a.createdAt).toLocaleString()}
                        </div>
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
