import { put } from "@vercel/blob";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
const ALLOWED_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
];

export function validateVideo(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Unsupported file type: ${file.type || "unknown"}. Upload an MP4, MOV or WebM.`;
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return `Video is too large (${(file.size / 1024 / 1024).toFixed(0)} MB). Max is 100 MB — trim the clip.`;
  }
  return null;
}

export async function uploadVideo(
  userId: string,
  skillKey: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const key = `videos/${userId}/${skillKey}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const blob = await put(key, file, {
    access: "public",
    contentType: file.type || "video/mp4",
  });

  return blob.url;
}
