import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getSkill } from "@/lib/hockey/skills";
import type { AnalysisResult } from "@/lib/claude";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const analysis = await prisma.analysis.findUnique({ where: { id } });

  if (!analysis || analysis.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const skill = getSkill(analysis.skillKey);
  let result: AnalysisResult | null = null;
  if (analysis.resultJson) {
    try {
      result = JSON.parse(analysis.resultJson) as AnalysisResult;
    } catch {
      result = null;
    }
  }

  return NextResponse.json({
    id: analysis.id,
    skillKey: analysis.skillKey,
    skillName: skill?.name ?? analysis.skillKey,
    status: analysis.status,
    videoUrl: analysis.videoUrl,
    videoDurationSec: analysis.videoDurationSec,
    trimStartSec: analysis.trimStartSec,
    trimEndSec: analysis.trimEndSec,
    errorMessage: analysis.errorMessage,
    createdAt: analysis.createdAt,
    result,
  });
}
