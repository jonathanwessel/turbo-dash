// ⏱️ Calmer races (v1.6 PACE): smooth on every screen, and the same races as before.
//   node scripts/test-pace.mjs   (part of npm test)
// 1. The game clock (src/pace.js) runs exactly one physics step per 60 Hz frame (no repeated pictures), and races
//    move at 3/4 of real time after the countdown.
// 2. Races run with the calmer step come out like races at the full step: same places on average, nobody stuck.
import { advance, STEP } from "../src/pace.js";
import { PACE, TRACKS, CARS } from "../src/data.js";
import { runRace, setStep } from "./racebot.mjs";

let fails = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { fails++; console.log("  ✖ " + msg); } };

// 1. the clock
for (const [hz, want] of [[60, [1]], [120, [0, 1]], [30, [2]], [144, [0, 1]]]) {
  const clock = { acc: 0 }, fake = { state: "race", t: 0, update(dt) { this.t += dt; } }, counts = new Set();
  let jitterFree = true, prev = -1;
  for (let f = 0; f < hz * 5; f++) { const n = advance(clock, 1 / hz, fake); if (f > 2) counts.add(n); if (hz === 60 && f > 2 && n !== 1) jitterFree = false; prev = n; }
  check([...counts].every(n => want.includes(n)), `${hz} Hz: steps per frame ${[...counts]} (expected ${want})`);
  if (hz === 60) check(jitterFree, "60 Hz: a frame repeated the last picture or skipped ahead");
  check(Math.abs(fake.t / 5 - PACE) < 0.01, `${hz} Hz: races should move at ${PACE} of real time (got ${(fake.t / 5).toFixed(3)})`);
}
{ // the countdown keeps real seconds
  const clock = { acc: 0 }, fake = { state: "countdown", t: 0, update(dt) { this.t += dt; } };
  for (let f = 0; f < 180; f++) advance(clock, 1 / 60, fake);
  check(Math.abs(fake.t - 3) < 0.02, `the countdown should take real seconds (3 s gave ${fake.t.toFixed(2)})`);
}

// 2. the same races at both steps (seeded, so both runs see the same luck)
const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const zippy = CARS.find(c => c.id === "zippy"), ups = { engine: 2, turbo: 2, tires: 2, magnet: 1 };
const tracks = TRACKS.filter(t => t.world === "earth").slice(0, 6);
const real = Math.random, avg = { full: [], calm: [] }, times = { full: [], calm: [] };
for (const [k, step] of [["full", STEP], ["calm", STEP * PACE]]) {
  setStep(step);
  for (const t of tracks) for (const bot of ["kid", "good"]) for (let i = 0; i < 8; i++) {
    Math.random = seeded(1000 + i * 31 + t.id.length); const r = runRace(t, zippy, ups, "normal", bot);
    avg[k].push(r.place); times[k].push(r.time);
  }
}
Math.random = real; setStep(STEP * PACE);
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
check(Math.abs(mean(avg.full) - mean(avg.calm)) < 0.35, `average place changed: ${mean(avg.full).toFixed(2)} at the full step, ${mean(avg.calm).toFixed(2)} calm`);
check(Math.abs(mean(times.full) / mean(times.calm) - 1) < 0.03, `race times (race seconds) changed: ${mean(times.full).toFixed(1)} vs ${mean(times.calm).toFixed(1)}`);
check(!times.calm.some(t => t >= 400), "a calm race never finished");
console.log(`  (places ${mean(avg.full).toFixed(2)} → ${mean(avg.calm).toFixed(2)}, race seconds ${mean(times.full).toFixed(1)} → ${mean(times.calm).toFixed(1)}, real seconds ≈ ${(mean(times.calm) / PACE).toFixed(1)})`);
console.log(fails ? `\n✖ ${fails} of ${checks} pace checks failed` : `All ${checks} pace checks passed`);
process.exit(fails ? 1 : 0);
