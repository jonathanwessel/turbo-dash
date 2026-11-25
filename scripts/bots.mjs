// 🤖 Strategy bots (v1.20): the whole career run (scripts/career.mjs) once per strategy and seed, all at the same
// time, then one table: the average day each strategy reaches Rank 10, 20, 30 and the cap, the world openings, the
// cars that did the racing and what each bot bought.
//   npm run bots                 -> speed, grip, coins and auto, 3 seeds each, plus the kid bot for comparison
//   npm run bots -- 5            -> 5 seeds each
//   npm run bots -- 3 speed grip -> only those strategies
// It fails (exit 1) when any run gets stuck, or when a strategy's average day for a pacing milestone is more than
// 25% later than the best strategy's (games/CLAUDE.md: "Strategies must stay close").
import { spawn } from "node:child_process";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { CARS } from "../src/data.js";

const root = resolve(import.meta.dirname, "..");
const SEEDS = +(process.argv[2] || 3);
const STRATS = process.argv.slice(3).length ? process.argv.slice(3) : ["speed", "grip", "coins", "auto"];
const ALL = [...STRATS, "kid"];
const RUNS = ALL.flatMap(bot => Array.from({ length: SEEDS }, (_, i) => ({ bot, seed: i + 1 })));
const CLOSE = 1.25;   // a strategy may take at most 25% longer than the best one
// the pacing milestones the strategies are compared on, as the career run's gate keys
const MILESTONES = [["rank10", "Rank 10"], ["rank20", "Rank 20"], ["rank30", "Rank 30"], ["cap", "Rank 40"]];

const dir = mkdtempSync(join(tmpdir(), "td-bots-"));
const t0 = Date.now();
const runOne = r => new Promise(done => {
  r.file = join(dir, `${r.bot}-${r.seed}.json`);
  const env = { ...process.env, CAREER_BOT: r.bot, CAREER_SEED: String(r.seed), CAREER_JSON: r.file };
  const p = spawn(process.execPath, [join(root, "scripts/career.mjs")], { cwd: root, env, stdio: ["ignore", "ignore", "pipe"] });
  let err = ""; p.stderr.on("data", d => { err += d; });
  p.on("close", code => {
    try { Object.assign(r, JSON.parse(readFileSync(r.file, "utf8"))); } catch { r.ok = false; r.err = err.trim().split("\n").pop(); }
    r.code = code; done();
  });
});
console.log(`Playing ${RUNS.length} whole careers (${STRATS.join(", ")} and kid, ${SEEDS} seeds each)...`);
await Promise.all(RUNS.map(runOne));
rmSync(dir, { recursive: true, force: true });

const name = id => CARS.find(c => c.id === id)?.name || id;
const by = bot => RUNS.filter(r => r.bot === bot);
const dayOf = (r, key) => r.gates?.find(g => g[0] === key)?.[1] ?? Infinity;
const mean = (rs, key) => rs.reduce((a, r) => a + dayOf(r, key), 0) / rs.length;
const avgWorld = (rs, w) => Math.round(rs.reduce((a, r) => a + r.worlds[w], 0) / rs.length);

console.log("\nAverage day each bot reaches a rank, the cap per seed, and the average day each world opens:");
console.log("  " + "bot".padEnd(7) + MILESTONES.map(([, n]) => n.padStart(9)).join("") + "   per seed".padEnd(20) + "worlds");
for (const bot of ALL) {
  const rs = by(bot);
  console.log("  " + bot.padEnd(7) + MILESTONES.map(([k]) => mean(rs, k).toFixed(0).padStart(9)).join("") + "   " +
    rs.map(r => r.ok ? String(r.cap) : "STUCK").join(" ").padEnd(17) +
    (rs.every(r => r.ok) ? Object.keys(rs[0].worlds).map(w => `${w} ${avgWorld(rs, w)}`).join(", ") : ""));
}
console.log("\nWhat did the work (all seeds together):");
for (const bot of ALL) {
  const rs = by(bot).filter(r => r.used), used = {}, ups = {}, lab = {};
  for (const r of rs) {
    for (const [k, n] of Object.entries(r.used)) used[k] = (used[k] || 0) + n;
    for (const [k, n] of Object.entries(r.boughtUps)) ups[k] = (ups[k] || 0) + n;
    for (const [k, n] of Object.entries(r.labSpent)) lab[k] = (lab[k] || 0) + n;
  }
  const races = Object.values(used).reduce((a, b) => a + b, 0) || 1;
  console.log(`  ${bot}: races in ${Object.entries(used).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => `${name(k)} ${Math.round(100 * n / races)}%`).join(", ")}`);
  console.log(`  ${" ".repeat(bot.length)}  upgrades ${Object.entries(ups).map(([k, n]) => `${k} ${Math.round(n / (rs.length || 1))}`).join(", ")}`);
}

const fails = [], spread = [];
for (const r of RUNS) if (!r.ok) fails.push(`${r.bot} seed ${r.seed} did not reach the cap or has a car on more than a third of the tracks at the end${r.err ? " (" + r.err + ")" : ""}`);
// 🏆 the M2 target's first line, on the seeded kid runs (they repeat exactly): every car is the best pick of the bot's
// garage on an open track at some point. v1.21 held a floor of 22 while it climbed (15 of 29 before the track kinds,
// 22 to 24 with them); v1.22's home tracks for Earth's prize cars reach 29 of 29 on six seeds, so the floor is all cars
const PLACE_FLOOR = CARS.length;
for (const r of by("kid")) if (r.ok && r.everBest < PLACE_FLOOR) fails.push(`kid seed ${r.seed}: only ${r.everBest} of ${CARS.length} cars are ever the best pick (at least ${PLACE_FLOOR}; never: ${r.never.map(name).join(", ")})`);
console.log(`\nCars that are ever the best pick, kid seeds: ${by("kid").map(r => r.everBest).join(", ")} of ${CARS.length}. Never on any seed: ${CARS.filter(c => by("kid").every(r => r.never?.includes(c.id))).map(c => c.name).join(", ") || "none"}`);
for (const [key, label] of MILESTONES) {
  const days = STRATS.map(b => mean(by(b), key)), best = Math.min(...days), slow = Math.max(...days);
  spread.push(`${label} +${Math.round(100 * (slow / best - 1))}%`);
  STRATS.forEach((bot, i) => { if (days[i] > best * CLOSE) fails.push(`${bot} reaches ${label} ${Number.isFinite(days[i]) ? `on day ${days[i].toFixed(0)} on average` : "never on some seed"}, more than 25% after the best strategy (day ${best.toFixed(0)})`); });
}
console.log(`\n(${((Date.now() - t0) / 1000).toFixed(0)} s)`);
if (fails.length) { console.log("✖ " + fails.join("\n✖ ")); process.exit(1); }
console.log(`✔ Every strategy reaches each rank within 25% of the best one. The slowest strategy is behind the best by: ${spread.join(", ")}.`);
