// Re-run the breakdown for an existing analysis (after a prompt/rubric change).
//   node --env-file=.env.local scripts/rerun.mjs <analysisId>
import { prisma } from "../src/lib/db.ts";
import { processAnalysis } from "../src/lib/process-analysis.ts";

const id = process.argv[2];
if (!id) {
  console.error("usage: node --env-file=.env.local scripts/rerun.mjs <analysisId>");
  process.exit(1);
}

await prisma.analysis.update({ where: { id }, data: { status: "processing" } });
await processAnalysis(id);

const a = await prisma.analysis.findUnique({ where: { id } });
console.log("status:", a.status);
if (a.resultJson) console.log(JSON.stringify(JSON.parse(a.resultJson), null, 2));
if (a.errorMessage) console.log("error:", a.errorMessage);
await prisma.$disconnect();
