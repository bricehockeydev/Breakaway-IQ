// Quick sanity check for frame extraction, independent of Next.js / Claude.
//   node scripts/test-frames.ts path/to/clip.mp4 [frameCount]
// Writes the extracted JPEGs to ./tmp/ so you can eyeball them.

import { mkdir, writeFile } from "node:fs/promises";
import { extractFramesFromPath } from "../src/lib/frames.ts";

const [, , input, countArg] = process.argv;

if (!input) {
  console.error("Usage: node scripts/test-frames.ts <video-file> [frameCount]");
  process.exit(1);
}

const count = countArg ? Number(countArg) : 10;

const { durationSec, frames } = await extractFramesFromPath(input, count);
console.log(`duration: ${durationSec}s, extracted ${frames.length} frames`);

await mkdir("tmp", { recursive: true });
for (const f of frames) {
  const out = `tmp/frame-${String(f.index).padStart(2, "0")}-t${f.timeSec}.jpg`;
  await writeFile(out, Buffer.from(f.base64, "base64"));
  console.log(`wrote ${out}`);
}
