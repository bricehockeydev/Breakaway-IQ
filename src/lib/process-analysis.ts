import { prisma } from "@/lib/db";
import { getSkill } from "@/lib/hockey/skills";
import { extractFramesFromBuffer } from "@/lib/frames";
import { readVideoBytes } from "@/lib/storage";
import { analyzeSkill } from "@/lib/claude";

// Skating reads (stride tempo, contact time, foot turnover) need denser sampling
// than a single shot rep does.
const FRAME_COUNT: Record<string, number> = {
  shooting: 10,
  stickhandling: 12,
  skating: 16,
};

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
    const bytes = await readVideoBytes(analysis.videoUrl);
    const frameCount = FRAME_COUNT[skill.category] ?? 10;
    const { durationSec, frames } = await extractFramesFromBuffer(bytes, frameCount, {
      startSec: analysis.trimStartSec,
      endSec: analysis.trimEndSec,
    });
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
