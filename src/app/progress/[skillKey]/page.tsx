import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSkill } from "@/lib/hockey/skills";
import { getSkillProgress } from "@/lib/analyses";
import { SkillProgress } from "@/components/SkillProgress";

export default async function SkillProgressPage({
  params,
}: {
  params: Promise<{ skillKey: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { skillKey } = await params;
  const skill = getSkill(skillKey);
  if (!skill) notFound();

  const analyses = await getSkillProgress(session.user.id, skillKey);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
        ← Dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{skill.name} — progress</h1>

      {analyses.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
          No completed {skill.name} analyses yet.{" "}
          <Link href={`/analyze/${skill.key}`} className="font-medium text-primary underline">
            Run one
          </Link>
          .
        </p>
      ) : (
        <SkillProgress
          skillName={skill.name}
          phaseNames={skill.phases.map((p) => ({ key: p.key, name: p.name }))}
          analyses={analyses}
        />
      )}
    </div>
  );
}
