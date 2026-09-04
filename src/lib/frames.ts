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

/**
 * Write the clip bytes to a temp file and pull `count` evenly-spaced JPEG frames,
 * skipping the first/last 8% (usually setup + walk-away).
 */
/** Optional window (seconds) to sample frames from. Defaults to the whole clip. */
export interface TrimWindow {
  startSec?: number | null;
  endSec?: number | null;
}

export async function extractFramesFromBuffer(
  bytes: Buffer,
  count = 10,
  trim: TrimWindow = {},
): Promise<FrameExtractionResult> {
  const workDir = await mkdtemp(join(tmpdir(), "skillsapp-"));
  const videoFile = join(workDir, "clip.mp4");
  try {
    await writeFile(videoFile, bytes);
    return await framesFromFile(videoFile, workDir, count, trim);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Same as above but from a local file path — used by scripts/test-frames.ts. */
export async function extractFramesFromPath(
  videoFile: string,
  count = 10,
  trim: TrimWindow = {},
): Promise<FrameExtractionResult> {
  const workDir = await mkdtemp(join(tmpdir(), "skillsapp-"));
  try {
    return await framesFromFile(videoFile, workDir, count, trim);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function framesFromFile(
  videoFile: string,
  workDir: string,
  count: number,
  trim: TrimWindow,
): Promise<FrameExtractionResult> {
  const probe = await runFfmpeg(["-i", videoFile]);
  const duration = parseDuration(probe.stderr);
  if (!duration || !Number.isFinite(duration) || duration <= 0) {
    throw new Error("Could not read video duration — is the file a valid video?");
  }

  // Clamp the trim window to the real duration; fall back to a centered 84% window.
  const hasTrim =
    trim.startSec != null &&
    trim.endSec != null &&
    trim.endSec - trim.startSec >= 0.5;

  // Keep a safety margin off the hard end of the file — seeking to (or past) the
  // exact last frame can make ffmpeg exit 0 while writing nothing (seen on some
  // .mov files), which otherwise fails the whole analysis over one frame.
  const safeDuration = Math.max(duration - 0.2, 0.3);

  const winStart = hasTrim
    ? Math.max(0, Math.min(trim.startSec!, safeDuration - 0.3))
    : duration * 0.08;
  const winEnd = hasTrim
    ? Math.max(winStart + 0.3, Math.min(trim.endSec!, safeDuration))
    : Math.min(duration * 0.92, safeDuration);

  const start = winStart;
  const end = winEnd;
  const span = Math.max(end - start, 0.1);
  const step = count > 1 ? span / (count - 1) : 0;

  const frames: ExtractedFrame[] = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? start + step * i : duration / 2;
    const base64 = await extractOneFrame(videoFile, workDir, i, t, safeDuration);
    if (base64) {
      frames.push({ index: i, timeSec: Number(t.toFixed(2)), base64, mediaType: "image/jpeg" });
    }
  }

  if (frames.length === 0) {
    throw new Error("Could not extract any frames from this clip.");
  }

  return { durationSec: Number(duration.toFixed(2)), frames };
}

/** Grabs one frame at `t`, nudging backward and retrying if ffmpeg writes nothing. */
async function extractOneFrame(
  videoFile: string,
  workDir: string,
  index: number,
  t: number,
  safeDuration: number,
): Promise<string | null> {
  const nudges = [0, 0.15, 0.4];
  for (const nudge of nudges) {
    const tryT = Math.max(0, Math.min(t - nudge, safeDuration));
    const outFile = join(workDir, `frame-${index}-${nudge}.jpg`);
    const { code } = await runFfmpeg([
      "-ss",
      tryT.toFixed(3),
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
    if (code !== 0) continue;
    try {
      const buf = await readFile(outFile);
      if (buf.length > 0) return buf.toString("base64");
    } catch {
      // ffmpeg exited 0 but wrote nothing — try the next nudge.
    }
  }
  return null;
}
