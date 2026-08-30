import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ffmpegPath from "ffmpeg-static";

export interface ExtractedFrame {
  index: number;
  timeSec: number;
  /** base64-encoded JPEG (no data: prefix) */
  base64: string;
  mediaType: "image/jpeg";
}

export interface FrameExtractionResult {
  durationSec: number;
  frames: ExtractedFrame[];
}

const FFMPEG = ffmpegPath as unknown as string | null;

function runFfmpeg(args: string[]): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    if (!FFMPEG) {
      reject(
        new Error(
          "ffmpeg binary not found. Run `npm run setup:ffmpeg` (see README).",
        ),
      );
      return;
    }
    const proc = spawn(FFMPEG, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", reject);
    proc.on("close", (code) => resolve({ code: code ?? -1, stderr }));
  });
}

function parseDuration(stderr: string): number | null {
  const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) return null;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download video (${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

/**
 * Download the clip and pull `count` evenly-spaced JPEG frames from it,
 * skipping the first/last 8% (usually setup + walk-away).
 */
export async function extractFrames(
  videoUrl: string,
  count = 10,
): Promise<FrameExtractionResult> {
  const workDir = await mkdtemp(join(tmpdir(), "skillsapp-"));
  const videoFile = join(workDir, "clip.mp4");
  try {
    await download(videoUrl, videoFile);
    return await framesFromFile(videoFile, workDir, count);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Same as extractFrames but from a local file — used by scripts/test-frames.ts. */
export async function extractFramesFromPath(
  videoFile: string,
  count = 10,
): Promise<FrameExtractionResult> {
  const workDir = await mkdtemp(join(tmpdir(), "skillsapp-"));
  try {
    return await framesFromFile(videoFile, workDir, count);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function framesFromFile(
  videoFile: string,
  workDir: string,
  count: number,
): Promise<FrameExtractionResult> {
  const probe = await runFfmpeg(["-i", videoFile]);
  const duration = parseDuration(probe.stderr);
  if (!duration || !Number.isFinite(duration) || duration <= 0) {
    throw new Error("Could not read video duration — is the file a valid video?");
  }

  const start = duration * 0.08;
  const end = duration * 0.92;
  const span = Math.max(end - start, 0.1);
  const step = count > 1 ? span / (count - 1) : 0;

  const frames: ExtractedFrame[] = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? start + step * i : duration / 2;
    const outFile = join(workDir, `frame-${i}.jpg`);
    const { code, stderr } = await runFfmpeg([
      "-ss",
      t.toFixed(3),
      "-i",
      videoFile,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      "-vf",
      "scale=640:-2",
      "-y",
      outFile,
    ]);
    if (code !== 0) {
      throw new Error(`ffmpeg frame extraction failed: ${stderr.slice(-300)}`);
    }
    const base64 = (await readFile(outFile)).toString("base64");
    frames.push({
      index: i,
      timeSec: Number(t.toFixed(2)),
      base64,
      mediaType: "image/jpeg",
    });
  }

  return { durationSec: Number(duration.toFixed(2)), frames };
}
