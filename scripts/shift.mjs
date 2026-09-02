// Experiment: run a game-shift clip through Claude for a tactical film-session review.
//   npm run shift -- shifts/myshift.mp4 "white #9, left wing"
//
// Not wired into the app — this is to see whether shift review is worth building.

import { mkdir, writeFile } from "node:fs/promises";
import { basename, join, parse } from "node:path";
import { extractFramesFromPath } from "../src/lib/frames.ts";
import { reviewShift } from "../src/lib/shift.ts";

const [, , file, ...descParts] = process.argv;
const description = descParts.join(" ").trim();

if (!file || !description) {
  console.error('usage: npm run shift -- <video> "<player description>"');
  console.error('  e.g. npm run shift -- shifts/game1.mp4 "dark jersey #22, defense"');
  process.exit(1);
}

// A shift is long — sample more frames than a skill clip.
const FRAMES = 24;

console.log(`Reviewing ${basename(file)} for: ${description}`);
const { durationSec, frames } = await extractFramesFromPath(file, FRAMES);
console.log(`  ${durationSec}s, ${frames.length} frames`);

const outDir = join("shifts", "out", parse(file).name);
await mkdir(outDir, { recursive: true });
for (const f of frames) {
  await writeFile(
    join(outDir, `frame-${String(f.index).padStart(2, "0")}-t${f.timeSec}.jpg`),
    Buffer.from(f.base64, "base64"),
  );
}

const { result, usage } = await reviewShift(frames, description);
await writeFile(join(outDir, "review.json"), JSON.stringify(result, null, 2));

const md = [
  `# Shift review — ${basename(file)}`,
  `player: ${description} · ${durationSec}s · ${usage.input_tokens} in / ${usage.output_tokens} out`,
  ``,
  `clip usable: ${result.clipUsable}${result.clipNotes ? ` — ${result.clipNotes}` : ""}`,
  `player found: ${result.playerFound} — ${result.playerNotes}`,
  ``,
  `## Shift summary`,
  result.shiftSummary,
  ``,
  `## Moments`,
  ...result.moments.map((m) => `- **${m.approxTime}** ${m.what}\n  → ${m.coaching}`),
  ``,
  `## Strengths`,
  ...result.strengths.map((s) => `- ${s}`),
  ``,
  `## Work-ons`,
  ...result.workOns.map((s) => `- ${s}`),
  ``,
  `## Compete`,
  result.compete,
].join("\n");
await writeFile(join(outDir, "review.md"), md);

console.log(`\n${md}\n`);
console.log(`saved: ${outDir}/`);
