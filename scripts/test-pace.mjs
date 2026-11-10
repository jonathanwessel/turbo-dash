// ⏱️ The game clock (src/pace.js) and calmer races (v1.6 PACE): smooth on every screen, and the same races as before.
//   node scripts/test-pace.mjs   (part of npm test)
// 1. Every screen frame runs physics once, sized to the display (v1.10): no repeated pictures (0 steps) and no double
//    jumps, at 30 to 144 Hz, with timer rounding and jitter. Race time stays equal to real time x PACE.
// 2. Races run with the calmer step come out like races at the full step: same places on average, nobody stuck.
import { advance, newClock, resetClock, stepCounter, STEP, MAX_STEP } from "../src/pace.js";
import { PACE, TRACKS, CARS } from "../src/data.js";
import { qualityLadder } from "../src/quality.js";
import { runRace, setStep } from "./racebot.mjs";

let fails = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { fails++; console.log("  ✖ " + msg); } };

// 1. the clock, fed timestamps the way browsers give them: true vsync times, rounded (q ms), with a little jitter (j ms)
let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
function display(hz, q, j, seconds, { hitchAt = -1, hitchMs = 0, state = "race" } = {}) {
  const clock = newClock(), P = 1000 / hz, frames = Math.round(seconds * hz);
  let moved = 0, last = 0, real = 0, zero = 0, uneven = 0, prev = 0, maxN = 0;
  const race = { state, update(d) { moved += d; } };
  for (let f = 1; f <= frames; f++) {
    let t = f * P + (rnd() - 0.5) * 2 * j + (f >= hitchAt && hitchAt > 0 ? hitchMs : 0);
    t = q ? Math.floor(t / q) * q : t;
    const raw = t - last; last = t; const before = moved;
    const n = advance(clock, Math.min(0.05, raw / 1000), race);
    const step = moved - before;
    if (f > 2) { real += Math.min(0.05, raw / 1000); if (n === 0) zero++; if (prev && Math.abs(step / prev - 1) > 0.3 && f !== hitchAt && f !== hitchAt + 1) uneven++; }
    else if (f === 2) moved = 0;
    prev = step; maxN = Math.max(maxN, n);
  }
  return { zero, uneven, ratio: moved / (real * (state === "countdown" ? 1 : PACE)), maxN };
}
const SCREENS = [[60, 0.1, 0], [60, 1, 0], [59.94, 1, 0], [59.999, 0.1, 0], [60.001, 0.1, 0.2], [60, 0.1, 1.5], [75, 0.1, 0.2], [90, 0.1, 0.2],
  [120, 0.1, 0.2], [144, 0.1, 0.2], [144, 1, 0], [50, 0.1, 0.2], [45, 0.1, 0.5], [30, 0.1, 0.5]];
for (const [hz, q, j] of SCREENS) {
  const r = display(hz, q, j, 60), name = `${hz} Hz (timer ${q} ms, jitter ${j} ms)`;
  check(r.zero === 0, `${name}: ${r.zero} frames repeated the last picture`);
  check(r.uneven === 0, `${name}: ${r.uneven} frames moved more than 30% differently from the frame before`);
  check(Math.abs(r.ratio - 1) < 0.005, `${name}: race time should be ${PACE} of real time (got ${(r.ratio * PACE).toFixed(4)})`);
}
{ // a long hitch (a 200 ms stall, clamped to 50 ms) is split into steps no longer than MAX_STEP, then the clock is steady again
  const r = display(60, 0.1, 0.2, 20, { hitchAt: 300, hitchMs: 200 });
  check(r.maxN <= Math.ceil(0.05 / MAX_STEP), `a hitch ran ${r.maxN} steps in one frame`);
  check(r.zero === 0 && r.uneven === 0, `after a hitch the clock should settle (repeats ${r.zero}, uneven ${r.uneven})`);
}
{ // a first frame that is a hitch must not stick the clock at the wrong rate, and a display that changes rate is followed
  const clock = newClock(), race = { state: "race", n: 0, update() { this.n++; } };
  advance(clock, 0.05, race); for (let f = 0; f < 30; f++) advance(clock, 1 / 60, race);
  check(Math.abs(clock.period - 1 / 60) < 0.001, `the clock stuck at a ${(clock.period * 1000).toFixed(1)} ms period after a slow first frame`);
  for (let f = 0; f < 60; f++) advance(clock, 1 / 30, race);
  check(Math.abs(clock.period - 1 / 30) < 0.002, `the clock did not follow a drop to 30 Hz (period ${(clock.period * 1000).toFixed(1)} ms)`);
  resetClock(clock); check(clock.debt === 0, "resetClock clears the debt");
  check(advance(clock, 0, race) === 0 && advance(clock, NaN, race) === 0, "a zero or broken frame time runs nothing");
}
{ // the countdown keeps real seconds
  const r = display(60, 0.1, 0.2, 3, { state: "countdown" });
  check(Math.abs(r.ratio - 1) < 0.01, `the countdown should take real seconds (ratio ${r.ratio.toFixed(3)})`);
}
{ // the step counter: a 90 Hz screen shows 1 step on every frame with the new clock, and the old clock's 0,1,1 pattern
  const c = stepCounter(), clock = newClock(), race = { state: "race", update() {} };
  for (let f = 1; f <= 900; f++) { const raw = 1000 / 90; c.frame(raw, advance(clock, raw / 1000, race)); }
  const r = c.report();
  check(r.steps === "1: 100.0%", `step counter, new clock at 90 Hz: ${r.steps}`);
  check(/^0: 3\d\.\d%, 1: 6\d\.\d%$/.test(r.oldSteps), `step counter, old clock at 90 Hz should be about one third 0 steps: ${r.oldSteps}`);
  check(Math.abs(r.hz - 90) < 0.5, `step counter rate ${r.hz}`);
}

// 1b. the picture quality ladder (src/quality.js)
{
  const drive = (q, ms, n, racing = true) => { let ch = 0; for (let i = 0; i < n; i++) if (q.frame(ms, racing)) ch++; return ch; };
  let saved = null; const q = qualityLadder({}, v => { saved = v; });
  drive(q, 16.7, 120, false); q.raceStart();
  check(drive(q, 16.9, 600) === 0 && q.level === 3, "a smooth 60 Hz race should stay on full quality");
  drive(q, 33.4, 90);   // 3 s at 30 fps (the average needs a moment to catch up, then 2 s slow)
  check(q.level === 2 && saved?.level === 2, `30 fps for 3 s should step down once (level ${q.level})`);
  check(q.raceEnd() === false, "no step back up right after a slow race");
  q.raceStart(); drive(q, 16.7, 900); q.raceEnd(); q.raceStart(); drive(q, 16.7, 900);
  check(q.raceEnd() === true && q.level === 3, "two smooth races should step back up");
  q.raceStart(); drive(q, 33.4, 90); q.raceEnd();   // fails at 3 again: twice now
  for (let r = 0; r < 4; r++) { q.raceStart(); drive(q, 16.7, 900); q.raceEnd(); }
  check(q.level === 2, `a level that was too slow twice is not tried again (level ${q.level})`);
  const fifty = qualityLadder(); drive(fifty, 20, 120, false); fifty.raceStart();
  check(drive(fifty, 20.2, 900) === 0 && fifty.level === 3, "a 50 Hz screen is not a slow device");
  const fast = qualityLadder(); drive(fast, 8.33, 120, false); fast.raceStart();
  check(drive(fast, 12, 900) === 0, "a 120 Hz screen drawing at 80 fps is fine");
  const back = qualityLadder({ level: 1, fails: { 2: 2 } });
  check(back.level === 1 && back.recentFails(2) === 0, "a saved level is kept; an old-style failure count starts fresh");
  // failures are forgotten after 14 days: two slow races, then two weeks later the level can be tried again
  let clockNow = 0; const later = qualityLadder({}, () => {}, () => clockNow);
  drive(later, 16.7, 120, false);
  for (let k = 0; k < 2; k++) { later.raceStart(); drive(later, 16.7, 300); drive(later, 33.4, 90); later.raceEnd(); later.level = 3; }
  later.level = 2;
  for (let r = 0; r < 2; r++) { later.raceStart(); drive(later, 16.7, 900); later.raceEnd(); }
  check(later.level === 2, `right after two slow races level 3 stays off (level ${later.level})`);
  clockNow += 15 * 864e5;
  for (let r = 0; r < 2; r++) { later.raceStart(); drive(later, 16.7, 900); later.raceEnd(); }
  check(later.level === 3, `15 days later level 3 is tried again (level ${later.level})`);
  const bad = qualityLadder({ level: 7 }); check(bad.level === 3, "a broken saved level falls back to full");
  check(fifty.frame(500, true) === false && fifty.frame(NaN, true) === false, "a stall or broken frame time changes nothing");
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

// 3. v1.10 runs one step per screen frame, so the step is whatever the display gives: the same seeded races at 40, 60,
//    90 and 144 Hz steps must finish alike on both engines (classic road and Toy Track World)
const toyT = TRACKS.filter(t => t.world === "toy").slice(0, 2), toyCar = CARS.find(c => c.id === "toyRacer") || zippy;
const byHz = {};
for (const hz of [40, 60, 90, 144]) {
  setStep(PACE / hz); byHz[hz] = { classic: [], toy: [], cp: [], tp: [] };
  for (const t of [...tracks.slice(0, 4), ...toyT]) for (const bot of ["kid", "good"]) for (let i = 0; i < 4; i++) {
    Math.random = seeded(500 + i * 17 + t.id.length); const car = t.world === "toy" ? toyCar : zippy, r = runRace(t, car, ups, "normal", bot);
    const k = t.world === "toy" ? "toy" : "classic"; byHz[hz][k].push(r.time); byHz[hz][k === "toy" ? "tp" : "cp"].push(r.place);
  }
}
Math.random = real; setStep(STEP * PACE);
for (const hz of [40, 90, 144]) for (const k of ["classic", "toy"]) {
  const d = mean(byHz[hz][k]) / mean(byHz[60][k]) - 1;
  check(Math.abs(d) < 0.03, `${k} races at a ${hz} Hz step took ${(d * 100).toFixed(1)}% longer than at 60 Hz`);
  const pd = mean(byHz[hz][k === "toy" ? "tp" : "cp"]) - mean(byHz[60][k === "toy" ? "tp" : "cp"]);
  check(Math.abs(pd) < 0.5, `${k} races at a ${hz} Hz step: average place moved by ${pd.toFixed(2)}`);
}
console.log("  (race seconds by step rate: " + [40, 60, 90, 144].map(hz => `${hz} Hz classic ${mean(byHz[hz].classic).toFixed(1)} toy ${mean(byHz[hz].toy).toFixed(1)}`).join(", ") + ")");
console.log(`  (places ${mean(avg.full).toFixed(2)} → ${mean(avg.calm).toFixed(2)}, race seconds ${mean(times.full).toFixed(1)} → ${mean(times.calm).toFixed(1)}, real seconds ≈ ${(mean(times.calm) / PACE).toFixed(1)})`);
console.log(fails ? `\n✖ ${fails} of ${checks} pace checks failed` : `All ${checks} pace checks passed`);
process.exit(fails ? 1 : 0);
