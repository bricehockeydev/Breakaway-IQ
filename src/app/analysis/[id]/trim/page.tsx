import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getSkill } from "@/lib/hockey/skills";
import { VideoTrimmer } from "@/components/VideoTrimmer";

export default async function TrimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const analysis = await prisma.analysis.findUnique({ where: { id } });
  if (!analysis || analysis.userId !== session.user.id) notFound();

  // Already submitted — go straight to the result.
  if (analysis.status !== "draft") {
    redirect(`/analysis/${id}`);
  }

  const skill = getSkill(analysis.skillKey);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={`/analyze/${analysis.skillKey}`}
        className="text-sm text-muted hover:text-foreground"
      >
        ← Start over
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{skill?.name ?? analysis.skillKey}</h1>

      <div className="mt-4">
        <VideoTrimmer
          analysisId={analysis.id}
          videoUrl={analysis.videoUrl}
          skillName={skill?.name ?? analysis.skillKey}
        />
      </div>
    </div>
  );
}
