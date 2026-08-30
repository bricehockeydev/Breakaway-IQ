import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { localPathForVideoUrl } from "@/lib/storage";

export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  webm: "video/webm",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  const abs = localPathForVideoUrl(`/api/uploads/${path.join("/")}`);
  if (!abs) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Users can only fetch their own uploads (key is videos/<userId>/...).
  if (!path.join("/").startsWith(`videos/${session.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let fileStat;
  try {
    fileStat = await stat(abs);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = abs.split(".").pop()?.toLowerCase() ?? "mp4";
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const total = fileStat.size;
  const range = req.headers.get("range");

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? Number(match[1]) : 0;
    const end = match?.[2] ? Number(match[2]) : total - 1;
    if (start >= total || end >= total || start > end) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${total}` },
      });
    }
    const stream = Readable.toWeb(
      createReadStream(abs, { start, end }),
    ) as unknown as WebReadableStream;
    return new NextResponse(stream as unknown as ReadableStream, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Accept-Ranges": "bytes",
      },
    });
  }

  const stream = Readable.toWeb(
    createReadStream(abs),
  ) as unknown as WebReadableStream;
  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(total),
      "Accept-Ranges": "bytes",
    },
  });
}
