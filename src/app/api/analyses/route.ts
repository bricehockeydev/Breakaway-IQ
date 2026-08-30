import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getSkill } from "@/lib/hockey/skills";
import { getSubscriptionState } from "@/lib/subscription";
import { uploadVideo, validateVideo } from "@/lib/storage";

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
    console.error("video upload failed:", err);
    return NextResponse.json(
      { error: "Video upload failed. Try again." },
      { status: 500 },
    );
  }

  // Draft — the player trims the clip on the next screen, then we process.
  const analysis = await prisma.analysis.create({
    data: {
      userId: session.user.id,
      skillKey,
      videoUrl,
      status: "draft",
    },
    select: { id: true },
  });

  return NextResponse.json({ id: analysis.id }, { status: 201 });
}
