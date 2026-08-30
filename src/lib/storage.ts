import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
];

/** True when a real Vercel Blob token is configured; otherwise we use local disk. */
export function usingBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export function localUploadsDir(): string {
  return join(process.cwd(), "uploads");
}

export function validateVideo(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Unsupported file type: ${file.type || "unknown"}. Upload an MP4, MOV or WebM.`;
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return `Video is too large (${(file.size / 1024 / 1024).toFixed(0)} MB). Max is 100 MB — trim the clip.`;
  }
  return null;
}

/**
 * Store the upload and return a URL string.
 * - Blob mode: an absolute https:// URL.
 * - Local mode: a "/api/uploads/<key>" path served by the uploads route.
 */
export async function uploadVideo(
  userId: string,
  skillKey: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const key = `videos/${userId}/${skillKey}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  if (usingBlob()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, file, {
      access: "public",
      contentType: file.type || "video/mp4",
    });
    return blob.url;
  }

  const dest = join(localUploadsDir(), key);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${key}`;
}

/** Resolve a stored videoUrl to a local absolute path, or null if it's remote. */
export function localPathForVideoUrl(videoUrl: string): string | null {
  const prefix = "/api/uploads/";
  if (!videoUrl.startsWith(prefix)) return null;
  const key = decodeURIComponent(videoUrl.slice(prefix.length));
  const abs = normalize(join(localUploadsDir(), key));
  // Guard against path traversal.
  if (!abs.startsWith(normalize(localUploadsDir()))) return null;
  return abs;
}

/** Read a stored video's bytes, whether it's a Blob URL or a local upload. */
export async function readVideoBytes(videoUrl: string): Promise<Buffer> {
  const local = localPathForVideoUrl(videoUrl);
  if (local) return readFile(local);

  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error(`Failed to fetch video (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}
