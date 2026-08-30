import { prisma } from "@/lib/db";
import { getSkill } from "@/lib/hockey/skills";
import { extractFrames } from "@/lib/frames";
import { analyzeSkill } from "@/lib/claude";

const FRAME_COUNT = 10;

/**
 * Runs the full pipeline for one Analysis row: download clip -> extract frames
 * -> Claude vision assessment -> persist result. Updates status as it goes.
 * Never throws — failures are written to the row.
 */
export async function processAnalysis(analysisId: string): Promise<void> {
  const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
  if (!analysis) return;

  const skill = getSkill(analysis.skillKey);
  if (!skill) {
    await fail(analysisId, `Unknown skill "${analysis.skillKey}"`);
    return;
  }

  try {
    const { durationSec, frames } = await extractFrames(analysis.videoUrl, FRAME_COUNT);
    const { result, usage } = await analyzeSkill(skill, frames);

    console.log(
      `[analysis ${analysisId}] skill=${skill.key} frames=${frames.length} ` +
        `input_tokens=${usage.input_tokens} output_tokens=${usage.output_tokens}`,
    );

    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: "complete",
        videoDurationSec: durationSec,
        resultJson: JSON.stringify(result),
        errorMessage: null,
      },
    });
  } catch (err) {
    console.error(`[analysis ${analysisId}] failed:`, err);
    await fail(
      analysisId,
      err instanceof Error ? err.message : "Analysis failed unexpectedly",
    );
  }
}

async function fail(analysisId: string, message: string) {
  await prisma.analysis
    .update({
      where: { id: analysisId },
      data: { status: "failed", errorMessage: message },
    })
    .catch(() => {});
}
