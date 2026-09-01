// Prints every drill's key + name, so you can name demo video files.
// Drop <key>.mp4 into public/drills/ and it shows on the breakdown.
//   node scripts/list-drills.mjs
import { DRILLS } from "../src/lib/hockey/drills.ts";

const width = Math.max(...DRILLS.map((d) => d.key.length));
for (const d of DRILLS) {
  console.log(`${d.key.padEnd(width)}  →  ${d.name}   [${d.skillKeys.join(", ")}]`);
}
console.log(`\n${DRILLS.length} drills. File name: public/drills/<key>.mp4`);
