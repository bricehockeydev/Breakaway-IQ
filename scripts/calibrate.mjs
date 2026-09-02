// Calibration harness. Drop clips in ./calibration/ named  <skill-key>__<label>.mp4
// (e.g. wrist-shot__perfect-side.mp4). This runs each one through the real
// pipeline and writes frames + the breakdown to ./calibration/out/<name>/ so we
// can review whether the feedback matches reality.
//
//   node --env-file=.env.local scripts/calibrate.mjs

import { readdir, mkdir, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import { getSkill } from "../src/lib/hockey/skills.ts";
import { extractFramesFromPath } from "../src/lib/frames.ts";
import { analyzeSkill } from "../src/lib/claude.ts";

const IN = "calibration";
const OUT = join(IN, "out");

const files = (await readdir(IN).catch(() => [])).filter((f) =>
  /\.(mp4|mov|webm|m4v)$/i.test(f),
);

if (files.length === 0) {
  console.log(`No clips in ./${IN}/. Add files named <skill-key>__<label>.mp4`);
  process.exit(0);
}

for (const file of files) {
  const base = parse(file).name;
  const skillKey = base.split("__")[0];
  const skill = getSkill(skillKey);
  if (!skill) {
    console.log(`SKIP ${file} — "${skillKey}" is not a known skill key`);
    continue;
  }

  const dir = join(OUT, base);
  await mkdir(dir, { recursive: true });
  console.log(`\n=== ${file}  (skill: ${skill.name}) ===`);

  const { durationSec, frames } = await extractFramesFromPath(join(IN, file), 10);
  for (const f of frames) {
    await writeFile(
      join(dir, `frame-${String(f.index).padStart(2, "0")}-t${f.timeSec}.jpg`),
      Buffer.from(f.base64, "base64"),
    );
  }

  const { result, usage } = await analyzeSkill(skill, frames);
  await writeFile(join(dir, "result.json"), JSON.stringify(result, null, 2));

  const md = [
    `# ${skill.name} — ${base}`,
    ``,
    `duration ${durationSec}s · ${frames.length} frames · ${usage.input_tokens} in / ${usage.output_tokens} out`,
    ``,
    `## Summary`,
    result.overallSummary,
    ``,
    `## Filming usable: ${result.filmingUsable}`,
    result.filmingNotes || "",
    ``,
    `## Top priorities`,
    ...result.keyFlaws.map((f, i) => `${i + 1}. ${f}`),
    ``,
    `## Phase by phase`,
    ...result.phases.flatMap((p) => {
      const name = skill.phases.find((sp) => sp.key === p.phaseKey)?.name ?? p.phaseKey;
      return [
        `### ${name}`,
        p.whatWentWell ? `- working: ${p.whatWentWell}` : "",
        p.whatToFix ? `- fix: ${p.whatToFix}` : "- (clean)",
        "",
      ];
    }),
    `## Drills`,
    ...result.recommendedDrills.map((d) => `- ${d.drillKey}: ${d.why}`),
    ``,
    `## Coaching notes`,
    result.coachingNotes,
  ].join("\n");
  await writeFile(join(dir, "review.md"), md);

  console.log(`  → calibration/out/${base}/  (frames + result.json + review.md)`);
}

console.log(`\nDone. Review the folders under ./${OUT}/`);
