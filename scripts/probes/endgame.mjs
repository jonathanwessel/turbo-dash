// 🏁 End-game garage probe (v1.21, "Every car has a place"): every car fully upgraded with every Lab project. For each
// track it prints the Best rule's pick (src/best.js) and the fastest car in real races (the kid driver, 3 seeded
// races, alone on the track as `npm run sim -- best` races them), and counts how many tracks each car is best on.
//   node scripts/probes/endgame.mjs            -> the Best rule and real races
//   node scripts/probes/endgame.mjs --rule     -> the Best rule only (fast)
import { CARS, TRACKS, RESEARCH, UPGRADE_MAX } from "../../src/data.js";
import { bestCar, paceOn } from "../../src/best.js";
import { rng } from "../../src/physics-common.js";
import { runRace } from "../racebot.mjs";

const RULE_ONLY = process.argv.includes("--rule");
const full = { engine: UPGRADE_MAX, turbo: UPGRADE_MAX, tires: UPGRADE_MAX, magnet: UPGRADE_MAX };
const lab = Object.fromEntries(RESEARCH.map(r => [r.id, r.max]));
const upsOf = () => full;
const timeOf = (t, c) => { let sum = 0; for (let k = 0; k < 3; k++) { Math.random = rng(1000 + k); sum += runRace(t, c, full, "normal", "kid", lab, 0, null, true).time; } return sum / 3; };
const ruleCount = {}, raceCount = {};
for (const t of TRACKS) {
  const pick = bestCar(t, CARS, upsOf, lab);
  ruleCount[pick.name] = (ruleCount[pick.name] || 0) + 1;
  const top = [...CARS].sort((a, b) => paceOn(b, full, t, lab) - paceOn(a, full, t, lab)).slice(0, 4);
  let line = `${t.world.padEnd(8)}${t.id.padEnd(12)} rule: ${top.map(c => `${c.name} ${(paceOn(c, full, t, lab) / paceOn(top[0], full, t, lab) * 100).toFixed(1)}`).join(", ")}`;
  if (!RULE_ONLY) {
    const cand = [...CARS].sort((a, b) => paceOn(b, full, t, lab) - paceOn(a, full, t, lab)).slice(0, 8);
    const times = cand.map(c => [c, timeOf(t, c)]).sort((a, b) => a[1] - b[1]);
    raceCount[times[0][0].name] = (raceCount[times[0][0].name] || 0) + 1;
    line += `\n${"".padEnd(20)} race: ${times.slice(0, 4).map(([c, s]) => `${c.name} ${s.toFixed(2)}s`).join(", ")}`;
  }
  console.log(line);
}
console.log("\nBest rule picks:", ruleCount);
if (!RULE_ONLY) console.log("Fastest in races:", raceCount);
