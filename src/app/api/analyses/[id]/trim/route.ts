import { NextResponse, after } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getSubscriptionState } from "@/lib/subscription";
import { processAnalysis } from "@/lib/process-analysis";

export const runtime = "nodejs";
export const maxDuration = 300;

const MIN_WINDOW = 1;
const MAX_WINDOW = 12;

const schema = z.object({
  startSec: z.number().min(0),
  endSec: z.number().min(0),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await getSubscriptionState(session.user.id);
  if (!sub.isActive) {
    return NextResponse.json(
      { error: "An active membership is required to run an analysis." },
      { status: 402 },
    );
  }

  const { id } = await params;
  const analysis = await prisma.analysis.findUnique({ where: { id } });
  if (!analysis || analysis.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (analysis.status !== "draft") {
    return NextResponse.json(
      { error: "This clip has already been submitted." },
      { status: 409 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid trim range" }, { status: 400 });
  }

  const { startSec } = parsed.data;
  let { endSec } = parsed.data;
  if (endSec <= startSec) {
    return NextResponse.json({ error: "End must be after start" }, { status: 400 });
  }
  const window = endSec - startSec;
  if (window < MIN_WINDOW) {
    return NextResponse.json(
      { error: `Select at least ${MIN_WINDOW} second.` },
      { status: 400 },
    );
  }
  if (window > MAX_WINDOW) {
    // Keep the first MAX_WINDOW seconds of their selection.
    endSec = startSec + MAX_WINDOW;
  }

  await prisma.analysis.update({
    where: { id },
    data: {
      trimStartSec: Number(startSec.toFixed(2)),
      trimEndSec: Number(endSec.toFixed(2)),
      status: "processing",
    },
  });

  after(() => processAnalysis(id));

  return NextResponse.json({ id, status: "processing" });
}
