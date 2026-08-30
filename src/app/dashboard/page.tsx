import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getSubscriptionState } from "@/lib/subscription";
import { getSkill } from "@/lib/hockey/skills";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { StatusBadge } from "@/components/StatusBadge";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [sub, analyses] = await Promise.all([
    getSubscriptionState(session.user.id),
    prisma.analysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
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
        <SubscriptionCard initial={sub} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Your analyses</h2>
      {analyses.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
          No analyses yet.{" "}
          {sub.isActive ? (
            <Link href="/skills" className="font-medium text-primary underline">
              Pick a skill to get started.
            </Link>
          ) : (
            "Start your membership above, then pick a skill."
          )}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {analyses.map((a) => {
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
      )}
    </div>
  );
}
