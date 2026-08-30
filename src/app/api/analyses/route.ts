import { NextResponse, after } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getSkill } from "@/lib/hockey/skills";
import { getSubscriptionState } from "@/lib/subscription";
import { uploadVideo, validateVideo } from "@/lib/blob";
import { processAnalysis } from "@/lib/process-analysis";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const analyses = await prisma.analysis.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      skillKey: true,
      status: true,
      createdAt: true,
      errorMessage: true,
    },
  });

  return NextResponse.json({ analyses });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await getSubscriptionState(session.user.id);
  if (!sub.isActive) {
    return NextResponse.json(
      { error: "An active subscription is required to run an analysis." },
      { status: 402 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const skillKey = String(form.get("skillKey") ?? "");
  const file = form.get("video");

  if (!getSkill(skillKey)) {
    return NextResponse.json({ error: "Unknown skill" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No video file provided" }, { status: 400 });
  }

  const validationError = validateVideo(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  let videoUrl: string;
  try {
    videoUrl = await uploadVideo(session.user.id, skillKey, file);
  } catch (err) {
    console.error("blob upload failed:", err);
    return NextResponse.json(
      { error: "Video upload failed. Check BLOB_READ_WRITE_TOKEN." },
      { status: 500 },
    );
  }

  const analysis = await prisma.analysis.create({
    data: {
      userId: session.user.id,
      skillKey,
      videoUrl,
      status: "processing",
    },
    select: { id: true },
  });

  after(() => processAnalysis(analysis.id));

  return NextResponse.json({ id: analysis.id }, { status: 201 });
}
