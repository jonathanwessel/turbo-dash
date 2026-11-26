// 🏆 Writes src/best-table.js (2026-11-26): the measured numbers the Best rule (src/best.js) reads per track.
//   PERK_PACE: what each special car's power is worth on each track of its world, on an early garage (+3, no Lab)
//              and a full one, 16 seeded races each (scripts/probes/perk.mjs, eight runs at once).
//   TOUGH_ICE: how much faster a Tough car is on each Glacier track than the rest of the rule says (it feels half of
//              each snowbank). Snow Cat and Frost Runner each raced as Tough and as Grippy (+3, no Lab, 16 seeded
//              races), and the number is the average of the two cars.
// scripts/test-best.mjs fails when a track of a special car's world or a Glacier track has no number, so a new track
// is measured before it ships.   node scripts/probes/best-table.mjs   (about three minutes)
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CARS, TRACKS, PERKS } from "../../src/data.js";

const perkProbe = fileURLToPath(new URL("perk.mjs", import.meta.url)), me = fileURLToPath(import.meta.url);
const child = (args, env = {}) => new Promise((done, fail) => {
  const p = spawn(process.execPath, args, { env: { ...process.env, ...env } });
  let out = ""; p.stdout.on("data", d => out += d); p.stderr.on("data", d => out += d);
  p.on("close", code => { const j = out.match(/^json (.*)$/m); code || !j ? fail(new Error(out)) : done(JSON.parse(j[1])); });
});

if (process.argv[2] === "ice") {
  // one Glacier track: each ice car as Tough and as Grippy, time x base pace (the rule without TOUGH_ICE). The ratio
  // of the two is what being Tough is worth there beyond the rule.
  const { rng } = await import("../../src/physics-common.js"), { race, runRace } = await import("../racebot.mjs"), { basePace } = await import("../../src/best.js");
  const t = TRACKS.find(x => x.id === process.argv[3]), u = { engine: 3, turbo: 3, tires: 3, magnet: 0 };
  const px = c => { let s = 0; for (let k = 0; k < 16; k++) { race.raceSeq = k; Math.random = rng(1000 + k); s += runRace(t, c, u, "normal", "kid", {}, 0, null, true).time; } return s / 16 * basePace(c, u, t); };
  const gains = ["snowcat", "frost"].map(id => { const c = CARS.find(x => x.id === id); return px({ ...c, trait: "grippy" }) / px({ ...c, trait: "tough" }); });
  console.log("json " + JSON.stringify({ track: t.id, gain: +(gains.reduce((a, b) => a + b) / gains.length).toFixed(3) }));
  process.exit(0);
}

const specials = CARS.filter(c => PERKS[c.perk]), glacier = TRACKS.filter(t => t.world === "glacier");
const [perks, ice] = await Promise.all([
  Promise.all(specials.flatMap(c => [true, false].map(early => child([perkProbe, c.id, early ? "early" : "full"], { RACES: "16" })))),
  Promise.all(glacier.map(t => child([me, "ice", t.id]))),
]);
const table = {};
for (const r of perks) for (const [t, v] of Object.entries(r.per)) ((table[r.perk] ||= {})[t] ||= [0, 0])[r.early ? 0 : 1] = v;
const perkLines = Object.entries(table).map(([perk, tr]) => `  ${perk}: { ${Object.entries(tr).map(([t, [e, f]]) => `${t}: [${e}, ${f}]`).join(", ")} },`);
const iceLine = `  ${ice.map(r => `${r.track}: ${r.gain}`).join(", ")},`;
writeFileSync(new URL("../../src/best-table.js", import.meta.url), `// 🏆 Measured numbers the Best rule (src/best.js) reads per track. Written by \`node scripts/probes/best-table.mjs\`
// (16 seeded kid races for each number). Do not edit by hand: run the probe again after a track, a power or a car
// kind changes.
// What each special car's power is worth on each track of its world, as [early garage, full garage]: 1.03 is 3%
// faster than the same car without its power. An early garage is +3 with no Lab, a full one +5 with every Lab project.
export const PERK_PACE = {
${perkLines.join("\n")}
};
// How much faster a Tough car is on each Glacier track than the rest of the rule says: it feels half of each snowbank.
export const TOUGH_ICE = {
${iceLine}
};
`);
console.log(perkLines.join("\n") + "\n" + iceLine);
