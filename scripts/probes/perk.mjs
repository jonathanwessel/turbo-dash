// 🌟 What a special car's power is worth in whole races (v1.21): the car with and without its power, fully upgraded
// with every Lab project, 8 seeded races with the kid driver on each track of its world. The Best rule's `pace` for
// the power (PERKS in data.js) should be close to the average printed here. The race counter and Math.random are pinned
// per race, so the same car twice measures 0.0% (v1.23). "early" measures a +3 car with no Lab instead, the kind of
// garage `npm run sim -- best` races (the first Snow Cat power was 3.2% full but 5.6% early).
// 2026-11-26: RACES=n races each track n times, and the last line is the per-track worth as JSON (for
// scripts/probes/perk-table.mjs, which writes src/perk-pace.js).
//   node scripts/probes/perk.mjs buggy
//   node scripts/probes/perk.mjs snowcat early
import { CARS, TRACKS, RESEARCH, UPGRADE_MAX } from "../../src/data.js";
import { rng } from "../../src/physics-common.js";
import { runRace, race } from "../racebot.mjs";
const car = CARS.find(c => c.id === (process.argv[2] || "buggy"));
const early = process.argv[3] === "early", N = +(process.env.RACES || 8);
const full = early ? { engine: 3, turbo: 3, tires: 3, magnet: 0 } : { engine: UPGRADE_MAX, turbo: UPGRADE_MAX, tires: UPGRADE_MAX, magnet: UPGRADE_MAX };
const lab = early ? {} : Object.fromEntries(RESEARCH.map(r => [r.id, r.max]));
const timeOf = (t, c) => { let sum = 0; for (let k = 0; k < N; k++) { race.raceSeq = k; Math.random = rng(700 + k); sum += runRace(t, c, full, "normal", "kid", lab, 0, null, true).time; } return sum / N; };
let all = 0, n = 0; const per = {};
for (const t of TRACKS.filter(x => x.world === car.world)) {
  const a = timeOf(t, car), b = timeOf(t, { ...car, perk: undefined }), gain = b / a - 1; all += gain; n++; per[t.id] = +(1 + gain).toFixed(3);
  console.log(`${t.id.padEnd(12)} with ${a.toFixed(2)}s  without ${b.toFixed(2)}s  power worth ${(gain * 100).toFixed(1)}%`);
}
console.log(`${car.name}${early ? " (early garage)" : ""}: the power is worth ${(all / n * 100).toFixed(1)}% on average in its world`);
console.log("json " + JSON.stringify({ car: car.id, perk: car.perk, early, races: N, per }));
