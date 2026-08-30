import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSubscriptionState } from "@/lib/subscription";
import { getSkill } from "@/lib/hockey/skills";
import { UploadForm } from "@/components/UploadForm";

export default async function AnalyzePage({
  params,
}: {
  params: Promise<{ skillKey: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { skillKey } = await params;
  const skill = getSkill(skillKey);
  if (!skill) notFound();

  const sub = await getSubscriptionState(session.user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/skills" className="text-sm text-muted hover:text-foreground">
        ← All skills
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{skill.name}</h1>
      <p className="mt-1 text-muted">{skill.blurb}</p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="font-semibold">How to film it</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {skill.recordingInstructions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        {sub.isActive ? (
          <UploadForm skillKey={skill.key} skillName={skill.name} />
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            You need an active membership to run an analysis.{" "}
            <Link href="/dashboard" className="font-medium underline">
              Go to your dashboard
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
