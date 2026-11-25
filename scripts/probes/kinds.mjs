// 🛣️ Track kinds probe (v1.21): which trait does each track favor on its own? One car (Galaxy GT's numbers, fully
// upgraded), raced as Fast, Grippy and Tough with the traits' top-speed change switched off, so only what each trait
// does on the road counts (Fast slides more on curves, Grippy less, Tough loses half as much on bumps and starts
// slower). 4 seeded races each with the kid driver, alone on the track (as `npm run sim -- best` races).
//   node scripts/probes/kinds.mjs
import { CARS, TRACKS, TRAITS, UPGRADE_MAX } from "../../src/data.js";
import { rng } from "../../src/physics-common.js";
import { runRace } from "../racebot.mjs";

const N = +(process.env.N || 4);
for (const t of Object.values(TRAITS)) { delete t.top; }
const full = { engine: UPGRADE_MAX, turbo: UPGRADE_MAX, tires: UPGRADE_MAX, magnet: 0 };
const base = CARS.find(c => c.id === (process.env.CAR || "galaxy"));
const timeOf = (t, trait) => { const car = { ...base, trait, world: undefined, cup: undefined }; let sum = 0; for (let k = 0; k < N; k++) { Math.random = rng(500 + k); sum += runRace(t, car, full, "normal", "kid", {}, 0, null, true).time; } return sum / N; };
const out = {};
for (const t of TRACKS) {
  const r = Object.fromEntries(Object.keys(TRAITS).map(k => [k, timeOf(t, k)]));
  const best = Object.keys(r).sort((a, b) => r[a] - r[b])[0], mean = (r.fast + r.grippy + r.tough) / 3;
  out[t.id] = best;
  console.log(`${t.world.padEnd(8)}${t.id.padEnd(12)} ${Object.entries(r).map(([k, v]) => `${k} ${((v / mean - 1) * 100).toFixed(2).padStart(6)}%`).join("  ")}   best ${best}`);
}
const c = {}; for (const k of Object.values(out)) c[k] = (c[k] || 0) + 1;
console.log(c);
