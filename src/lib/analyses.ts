import { prisma } from "@/lib/db";
import type { AnalysisResult } from "@/lib/claude";
import { getSkill } from "@/lib/hockey/skills";

/** One completed analysis, flattened for the progress UI. */
export interface ProgressAnalysis {
  id: string;
  createdAt: string; // ISO
  videoUrl: string;
  overallScore: number;
  phaseScores: { phaseKey: string; score: number }[];
  keyFlaws: string[];
}

export interface SkillProgressSummary {
  skillKey: string;
  skillName: string;
  count: number;
  firstScore: number;
  latestScore: number;
  latestAt: string;
  delta: number;
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
      overallScore: result.overallScore,
      phaseScores: result.phases.map((p) => ({
        phaseKey: p.phaseKey,
        score: p.score,
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

  const bySkill = new Map<string, { score: number; at: Date }[]>();
  for (const r of rows) {
    const result = parseResult(r.resultJson);
    if (!result) continue;
    const list = bySkill.get(r.skillKey) ?? [];
    list.push({ score: result.overallScore, at: r.createdAt });
    bySkill.set(r.skillKey, list);
  }

  const summaries: SkillProgressSummary[] = [];
  for (const [skillKey, entries] of bySkill) {
    const first = entries[0];
    const latest = entries[entries.length - 1];
    summaries.push({
      skillKey,
      skillName: getSkill(skillKey)?.name ?? skillKey,
      count: entries.length,
      firstScore: first.score,
      latestScore: latest.score,
      latestAt: latest.at.toISOString(),
      delta: Number((latest.score - first.score).toFixed(1)),
    });
  }
  summaries.sort((a, b) => +new Date(b.latestAt) - +new Date(a.latestAt));
  return summaries;
}
