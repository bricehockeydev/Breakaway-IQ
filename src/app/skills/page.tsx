import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSubscriptionState } from "@/lib/subscription";
import {
  SKILLS,
  SKILL_CATEGORY_LABELS,
  type SkillCategory,
} from "@/lib/hockey/skills";

export default async function SkillsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sub = await getSubscriptionState(session.user.id);

  const byCategory = SKILLS.reduce<Record<string, typeof SKILLS>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Choose a skill to analyze</h1>
      <p className="mt-1 text-muted">
        Pick what you want feedback on. You&apos;ll get filming instructions on the next
        screen.
      </p>

      {!sub.isActive && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your membership isn&apos;t active.{" "}
          <Link href="/dashboard" className="font-medium underline">
            Start it on your dashboard
          </Link>{" "}
          to run an analysis.
        </div>
      )}

      {(Object.keys(byCategory) as SkillCategory[]).map((cat) => (
        <section key={cat} className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {SKILL_CATEGORY_LABELS[cat]}
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {byCategory[cat].map((skill) => (
              <Link
                key={skill.key}
                href={`/analyze/${skill.key}`}
                className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
              >
                <div className="font-semibold">{skill.name}</div>
                <p className="mt-1 text-sm text-muted">{skill.blurb}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
