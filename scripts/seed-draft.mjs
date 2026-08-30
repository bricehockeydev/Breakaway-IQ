// Dev helper: drop a test clip into local storage + create a draft Analysis
// for brice@example.com so the trim page can be exercised without a real upload.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import ffmpeg from "ffmpeg-static";

const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { email: "brice@example.com" } });
if (!user) throw new Error("no user");

const key = `videos/${user.id}/wrist-shot/${Date.now()}-seed.mp4`;
const abs = join(process.cwd(), "uploads", key);
mkdirSync(join(abs, ".."), { recursive: true });
execFileSync(ffmpeg, [
  "-f", "lavfi", "-i", "testsrc=duration=14:size=640x480:rate=30",
  "-pix_fmt", "yuv420p", "-y", abs,
]);

const a = await prisma.analysis.create({
  data: {
    userId: user.id,
    skillKey: "wrist-shot",
    videoUrl: `/api/uploads/${key}`,
    status: "draft",
  },
});
console.log(`draft analysis: http://localhost:3000/analysis/${a.id}/trim`);
await prisma.$disconnect();
