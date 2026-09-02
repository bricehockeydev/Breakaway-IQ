import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { ExtractedFrame } from "@/lib/frames";

const MODEL = "claude-opus-5";

const momentSchema = z.object({
  approxTime: z.string().describe("Rough timestamp from the frame labels, e.g. '~0:12'"),
  what: z.string().describe("What happened on the ice"),
  coaching: z.string().describe("The coaching point — what the player did well or should have done"),
});

export const shiftReviewSchema = z.object({
  clipUsable: z
    .boolean()
    .describe("false if you can't reliably follow one player (too far, too shaky, cuts, can't ID them)"),
  clipNotes: z.string().describe("If not usable, how to film a better shift clip. Otherwise empty."),
  playerFound: z.boolean().describe("true if you could identify and follow the target player"),
  playerNotes: z
    .string()
    .describe("How you identified them (jersey #, colour, position) or why you couldn't"),
  shiftSummary: z
    .string()
    .describe("3–5 sentences on what this player actually did over the shift — role, involvement, where they were"),
  moments: z.array(momentSchema).max(5).describe("The 2–4 moments that mattered, with rough timestamps"),
  strengths: z.array(z.string()).max(4).describe("What the player did well this shift. Empty if nothing stood out."),
  workOns: z
    .array(z.string())
    .max(3)
    .describe("Tactical / positional / decision things to work on — NOT shooting or skating mechanics"),
  compete: z
    .string()
    .describe("Read on effort, feet moving, engagement, support away from the puck"),
});

export type ShiftReview = z.infer<typeof shiftReviewSchema>;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  client ??= new Anthropic();
  return client;
}

const SYSTEM = `You are a hockey coach running a video session with a player, reviewing one of their
shifts. You are given an ordered sequence of still frames sampled from the shift —
treat them as a flipbook and reason about play across frames.

Your job is TACTICAL, not biomechanical: gap control, angles, routes, support,
positioning, reads, decisions with and without the puck, compete level. Do NOT
critique shooting or skating mechanics here.

Identify the target player from the description and follow only them. If you lose
them or can't tell which player they are, say so — do not guess and narrate the
wrong player.

Rules:
- Only describe what you can actually see across the frames. A shift you can't
  follow is clipUsable=false with advice on how to film it (steady, elevated or
  end-zone angle, the player in frame most of the shift).
- Be concrete and time-stamped. "At ~0:14 you stopped your feet at the top of the
  circle and let the winger walk out" — not "improve your defensive zone play".
- Assume competence. A good shift can have zero work-ons. Don't pad.
- No scores, grades, or ratings.
- Talk to the player directly ("you"), the way a coach does in a film session.`;

export async function reviewShift(
  frames: ExtractedFrame[],
  playerDescription: string,
): Promise<{ result: ShiftReview; usage: Anthropic.Usage }> {
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
    text: `Target player: ${playerDescription}\n\nReview this shift for that player. Return the structured film-session breakdown.`,
  });

  const response = await anthropic.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(shiftReviewSchema) },
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The model declined to review this clip.");
  }
  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Could not parse the shift review.");

  return { result: parsed, usage: response.usage };
}
