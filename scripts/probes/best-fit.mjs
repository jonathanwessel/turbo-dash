// 🏆 Best badge probe (2026-11-26): races the same garages as `npm run sim -- best` for several seeds and writes
// every car's average race time per track to a JSON cache, so a new Best rule can be scored against many garages in
// a second instead of re-racing. Usage: node scripts/probes/best-fit.mjs <out.json> [seeds, default 1,2,3]
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { CARS, TRACKS } from "../../src/data.js";
import { rng } from "../../src/physics-common.js";
import { race, runRace } from "../racebot.mjs";

const out = process.argv[2], seeds = (process.argv[3] || "1,2,3").split(",").map(Number);
const mid = JSON.parse(readFileSync(new URL("../../src/dev/mid-save.json", import.meta.url), "utf8"));
const cache = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : { times: {}, garages: {} };
const key = (t, c, u, lab) => `${t.id}|${c.id}|${u.engine}${u.turbo}${u.tires}${u.magnet}|${JSON.stringify(lab)}`;
const timeOf = (t, c, u, lab) => {
  const k = key(t, c, u, lab); if (k in cache.times) return cache.times[k];
  let sum = 0; for (let i = 0; i < 3; i++) { race.raceSeq = i; Math.random = rng(1000 + i); sum += runRace(t, c, u, "normal", "kid", lab, 0, null, true).time; }
  return (cache.times[k] = sum / 3);
};
for (const sd of seeds) {
  const R = rng(sd), garages = [{ name: "Rank 16 save", owned: mid.owned, ups: mid.ups, lab: mid.research, car: mid.car }];
  for (let g = 0; g < 24; g++) {
    const owned = CARS.filter(() => R() < 0.4); if (owned.length < 2) continue;
    const ups = Object.fromEntries(owned.map(c => [c.id, { engine: Math.floor(R() * 6), turbo: Math.floor(R() * 6), tires: Math.floor(R() * 6), magnet: 0 }]));
    garages.push({ name: "garage " + (g + 1), owned: owned.map(c => c.id), ups, lab: {}, car: owned[Math.floor(R() * owned.length)].id });
  }
  cache.garages[sd] = garages;
  for (const G of garages) for (const t of TRACKS) for (const id of G.owned) timeOf(t, CARS.find(c => c.id === id), G.ups[id], G.lab);
  writeFileSync(out, JSON.stringify(cache));
  console.log(`seed ${sd}: ${garages.length} garages, ${Object.keys(cache.times).length} cached times`);
}
