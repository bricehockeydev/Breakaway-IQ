import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Skill } from "@/lib/hockey/skills";
import { DRILLS, getDrill } from "@/lib/hockey/drills";
import type { ExtractedFrame } from "@/lib/frames";

const MODEL = "claude-opus-5";

const phaseAssessmentSchema = z.object({
  phaseKey: z.string().describe("The phase key being assessed"),
  visible: z
    .boolean()
    .describe("true only if you can clearly see this phase well enough to judge it in the frames"),
  whatWentWell: z
    .string()
    .describe("What the player does well in this phase, specific. Empty string if nothing stands out or not visible."),
  whatToFix: z
    .string()
    .describe(
      "The specific flaw to fix in this phase — ONLY if you can clearly see it in the frames. Empty string if the phase looks correct, or if you can't judge it. Never write a fix that is hedged with 'appears to' / 'looks like' / 'can't confirm'.",
    ),
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
  overallSummary: z
    .string()
    .describe("2–4 sentences: what's working and the main thing to work on. Direct. No scores, grades, or ratings."),
  phases: z.array(phaseAssessmentSchema),
  keyFlaws: z
    .array(z.string())
    .max(3)
    .describe(
      "The genuine, clearly-visible issues to fix, worst first. 0 if the rep is clean or unassessable. Never pad this to reach a number.",
    ),
  recommendedDrills: z
    .array(recommendedDrillSchema)
    .max(4)
    .describe("Drills for the flaws in keyFlaws. Empty if there are no real flaws."),
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

Assess these phases against the "good technique" checkpoints:

${phaseText}

DRILL CATALOG — you may ONLY recommend drills from this list, by key. Never invent a
drill. Recommend only drills that address a flaw you actually listed in keyFlaws.

${drillCatalogFor(skill.key)}

HOW TO ASSESS — read this carefully:

1. Only report a flaw you can CLEARLY SEE in the frames. If a phase looks correct,
   set whatToFix to "". If you cannot see a phase well enough to judge it (subject
   too small, wrong angle, motion blur, phase happens between sampled frames), set
   visible=false and whatToFix="". A phase you can't assess is NOT a phase with a
   problem — do not guess one.

2. Never write a fix that you then hedge. If your instinct is "appears to release
   early" or "looks like the chest drops" or "can't confirm full extension" — you
   do not actually see it. Leave it empty.

3. Assume competence. Many players filmed for this are skilled. A clean rep should
   come back with few or zero flaws. Do not manufacture 3 fixes because there are 3
   slots. keyFlaws can and should be empty for a good rep.

4. If filmingUsable=false: fill filmingNotes with how to re-film, keep every phase
   visible=false with empty whatToFix unless something is genuinely unmistakable,
   and keyFlaws should contain ONLY the filming problem (one entry). Do not produce
   a full technique critique off an unusable clip.

5. When you do flag something, be specific and concrete: "front knee straightens
   before the puck leaves" not "work on your legs".

6. No scores, grades, ratings, or numbers out of 10 anywhere. This is a technique
   breakdown, not a report card.

Tone: direct and useful, the way a good coach talks to a committed player — but a
good coach doesn't invent problems that aren't there.`;
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
    text: `Analyze this ${skill.name}. Return the structured breakdown: per-phase what's working and what to fix, the top priorities to fix, and drills from the catalog that address them.`,
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
