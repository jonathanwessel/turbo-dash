// 🌟 What a special car's power is worth in whole races (v1.21): the car with and without its power, fully upgraded
// with every Lab project, 4 seeded races with the kid driver on each track of its world. The Best rule's `pace` for
// the power (PERKS in data.js) should be close to the average printed here.
//   node scripts/probes/perk.mjs buggy
import { CARS, TRACKS, RESEARCH, UPGRADE_MAX } from "../../src/data.js";
import { rng } from "../../src/physics-common.js";
import { runRace } from "../racebot.mjs";
const car = CARS.find(c => c.id === (process.argv[2] || "buggy"));
const full = { engine: UPGRADE_MAX, turbo: UPGRADE_MAX, tires: UPGRADE_MAX, magnet: UPGRADE_MAX };
const lab = Object.fromEntries(RESEARCH.map(r => [r.id, r.max]));
const timeOf = (t, c) => { let sum = 0; for (let k = 0; k < 4; k++) { Math.random = rng(700 + k); sum += runRace(t, c, full, "normal", "kid", lab, 0, null, true).time; } return sum / 4; };
let all = 0, n = 0;
for (const t of TRACKS.filter(x => x.world === car.world)) {
  const a = timeOf(t, car), b = timeOf(t, { ...car, perk: undefined }), gain = b / a - 1; all += gain; n++;
  console.log(`${t.id.padEnd(12)} with ${a.toFixed(2)}s  without ${b.toFixed(2)}s  power worth ${(gain * 100).toFixed(1)}%`);
}
console.log(`${car.name}: the power is worth ${(all / n * 100).toFixed(1)}% on average in its world`);
