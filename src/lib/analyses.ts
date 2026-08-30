import { prisma } from "@/lib/db";
import type { AnalysisResult } from "@/lib/claude";
import { getSkill } from "@/lib/hockey/skills";

/** One completed analysis, flattened for the progress UI. */
export interface ProgressAnalysis {
  id: string;
  createdAt: string; // ISO
  videoUrl: string;
  phaseFixes: { phaseKey: string; whatToFix: string }[];
  keyFlaws: string[];
}

export interface SkillProgressSummary {
  skillKey: string;
  skillName: string;
  count: number;
  latestAt: string;
  firstFlawCount: number;
  latestFlawCount: number;
}

function parseResult(json: string | null): AnalysisResult | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as AnalysisResult;
  } catch {
    return null;
  }
}

/** Completed analyses for one user + skill, oldest first. */
export async function getSkillProgress(
  userId: string,
  skillKey: string,
): Promise<ProgressAnalysis[]> {
  const rows = await prisma.analysis.findMany({
    where: { userId, skillKey, status: "complete" },
    orderBy: { createdAt: "asc" },
  });

  const out: ProgressAnalysis[] = [];
  for (const r of rows) {
    const result = parseResult(r.resultJson);
    if (!result) continue;
    out.push({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      videoUrl: r.videoUrl,
      phaseFixes: result.phases.map((p) => ({
        phaseKey: p.phaseKey,
        whatToFix: p.whatToFix ?? "",
      })),
      keyFlaws: result.keyFlaws,
    });
  }
  return out;
}

/** One summary row per skill the user has completed at least one analysis for. */
export async function getProgressSummaries(
  userId: string,
): Promise<SkillProgressSummary[]> {
  const rows = await prisma.analysis.findMany({
    where: { userId, status: "complete" },
    orderBy: { createdAt: "asc" },
    select: { skillKey: true, resultJson: true, createdAt: true },
  });

  const bySkill = new Map<string, { flaws: number; at: Date }[]>();
  for (const r of rows) {
    const result = parseResult(r.resultJson);
    if (!result) continue;
    const list = bySkill.get(r.skillKey) ?? [];
    list.push({ flaws: result.keyFlaws.length, at: r.createdAt });
    bySkill.set(r.skillKey, list);
  }

  const summaries: SkillProgressSummary[] = [];
  for (const [skillKey, entries] of bySkill) {
    summaries.push({
      skillKey,
      skillName: getSkill(skillKey)?.name ?? skillKey,
      count: entries.length,
      latestAt: entries[entries.length - 1].at.toISOString(),
      firstFlawCount: entries[0].flaws,
      latestFlawCount: entries[entries.length - 1].flaws,
    });
  }
  summaries.sort((a, b) => +new Date(b.latestAt) - +new Date(a.latestAt));
  return summaries;
}
