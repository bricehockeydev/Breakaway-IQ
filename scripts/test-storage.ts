// Verifies local-disk storage + frame extraction without HTTP or Claude.
//   node scripts/test-storage.ts path/to/clip.mp4

import { readFile } from "node:fs/promises";
import { uploadVideo, readVideoBytes, usingBlob } from "../src/lib/storage.ts";
import { extractFramesFromBuffer } from "../src/lib/frames.ts";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/test-storage.ts <video-file>");
  process.exit(1);
}

console.log("storage mode:", usingBlob() ? "vercel-blob" : "local-disk");

const bytes = await readFile(input);
const file = new File([bytes], "clip.mp4", { type: "video/mp4" });

const url = await uploadVideo("testuser", "wrist-shot", file);
console.log("stored at:", url);

const roundTrip = await readVideoBytes(url);
console.log("read back:", roundTrip.length, "bytes (match:", roundTrip.length === bytes.length, ")");

const { durationSec, frames } = await extractFramesFromBuffer(roundTrip, 6);
console.log(`extracted ${frames.length} frames from a ${durationSec}s clip`);
