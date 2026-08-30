import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Skill } from "@/lib/hockey/skills";
import { DRILLS, getDrill } from "@/lib/hockey/drills";
import type { ExtractedFrame } from "@/lib/frames";

const MODEL = "claude-opus-5";

const phaseAssessmentSchema = z.object({
  phaseKey: z.string().describe("The phase key being assessed"),
  score: z.number().min(1).max(10).describe("1 = major flaw, 10 = textbook"),
  whatWentWell: z.string(),
  whatToFix: z.string(),
});

const recommendedDrillSchema = z.object({
  drillKey: z.string().describe("Must be one of the provided drill keys"),
  why: z.string().describe("Which flaw this drill fixes, in plain language for the player"),
});

export const analysisResultSchema = z.object({
  filmingUsable: z
    .boolean()
    .describe("false if the clip is too dark/blurry/short/wrong-angle to assess"),
  filmingNotes: z
    .string()
    .describe("If filmingUsable is false, tell the player how to re-film. Otherwise empty."),
  overallSummary: z.string().describe("2–4 sentences, encouraging but direct"),
  overallScore: z.number().min(1).max(10),
  phases: z.array(phaseAssessmentSchema),
  keyFlaws: z
    .array(z.string())
    .describe("The 1–3 highest-priority things to fix, most important first"),
  recommendedDrills: z.array(recommendedDrillSchema).min(1).max(4),
  coachingNotes: z
    .string()
    .describe("A short paragraph of extra coaching cues the player can think about"),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export interface AnalyzeOutcome {
  result: AnalysisResult;
  usage: Anthropic.Usage;
}

export class AnalysisRefusalError extends Error {}

function drillCatalogFor(skillKey: string): string {
  return DRILLS.filter((d) => d.skillKeys.includes(skillKey))
    .map(
      (d) =>
        `- ${d.key}: "${d.name}" — targets: ${d.targetsFlaws.join("; ")}. ${d.description}`,
    )
    .join("\n");
}

function buildSystemPrompt(skill: Skill): string {
  const phaseText = skill.phases
    .map(
      (p) =>
        `### ${p.name} (key: ${p.key})\nGood technique:\n${p.checkpoints
          .map((c) => `  - ${c}`)
          .join("\n")}`,
    )
    .join("\n\n");

  return `You are an elite hockey skills coach analyzing a player's "${skill.name}".

You are given an ordered sequence of still frames sampled from a short video clip of
one or two repetitions. Treat them as a flipbook: reason about the motion across
frames, not each frame in isolation.

Skill overview: ${skill.blurb}

Assess these phases. For each, score 1–10 against the "good technique" checkpoints:

${phaseText}

DRILL CATALOG — you may ONLY recommend drills from this list, by key. Never invent a
drill. Pick 1–4 that directly address the flaws you identified, most important first:

${drillCatalogFor(skill.key)}

Rules:
- If the clip is unusable (too dark, blurry, wrong angle, player/puck out of frame,
  clip too short to show the motion), set filmingUsable=false, explain how to re-film
  in filmingNotes, and still fill the other fields with your best partial read.
- Be specific and concrete. "Rotate your hips more" not "work on power".
- Base scores on what you can actually see. Don't hallucinate detail that isn't in
  the frames.
- Tone: direct and useful, the way a good coach talks to a committed player.`;
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  client ??= new Anthropic();
  return client;
}

export async function analyzeSkill(
  skill: Skill,
  frames: ExtractedFrame[],
): Promise<AnalyzeOutcome> {
  const anthropic = getClient();

  const content: Anthropic.ContentBlockParam[] = [];
  for (const f of frames) {
    content.push({ type: "text", text: `Frame ${f.index + 1} (t=${f.timeSec}s):` });
    content.push({
      type: "image",
      source: { type: "base64", media_type: f.mediaType, data: f.base64 },
    });
  }
  content.push({
    type: "text",
    text: `Analyze this ${skill.name}. Return the structured assessment: per-phase scores, the top flaws to fix, and drills from the catalog that address them.`,
  });

  const response = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: buildSystemPrompt(skill),
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(analysisResultSchema) },
  });

  if (response.stop_reason === "refusal") {
    throw new AnalysisRefusalError(
      "The analysis model declined to process this clip. Try a different video.",
    );
  }

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error("Model response could not be parsed into the expected format.");
  }

  // Drop any drill keys the model invented despite instructions.
  const validDrills = parsed.recommendedDrills.filter((d) => getDrill(d.drillKey));
  const result: AnalysisResult = {
    ...parsed,
    recommendedDrills:
      validDrills.length > 0 ? validDrills : parsed.recommendedDrills.slice(0, 1),
  };

  return { result, usage: response.usage };
}
