// 😀 Faces and reactions (v1.14): who is happy or grumpy after a race, the start grid's moods, the result card's
// row, when the start grid faces show, that every face draws inside its circle, and that faces never change a race
// on either engine (and never show in the menu demo, a boss race or a Time Trial).
import { raceMoods, gridMoods, faceRow, faceShow, drawFace, drawFaceBubble, MOODS, FACES } from "../src/faces.js";
import { RIVALS, TRACKS, CARS } from "../src/data.js";
import { race, toyRace } from "./racebot.mjs";
import { statsFor } from "../src/stats.js";

let failed = 0;
const check = (name, ok, msg = "") => { if (!ok) { failed++; console.log(`  ✖ ${name} ${msg}`); } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// rivals ahead of the player are happy, rivals behind are grumpy
check("moods", same(raceMoods([2, 0, 1, 3, 4, 5], 5), ["grumpy", "happy", "grumpy", "grumpy", "grumpy"]), JSON.stringify(raceMoods([2, 0, 1, 3, 4, 5], 5)));
check("first place", raceMoods([0, 1, 2, 3, 4, 5], 5).every(m => m === "grumpy"), "");
check("last place", raceMoods([5, 4, 3, 2, 1, 0], 5).every(m => m === "happy"), "");
check("missing", same(raceMoods([0, 1], 3), ["grumpy", "ready", "ready"]) && raceMoods([1, 2], 2).every(m => m === "ready"), "");
// the start grid: ready before any race, then how the last race went; anything odd is "ready"
check("grid first", same(gridMoods(null, 5), Array(5).fill("ready")), "");
check("grid after", same(gridMoods(["happy", "grumpy"], 3), ["happy", "grumpy", "ready"]), "");
check("grid junk", same(gridMoods(["sad", 7, "happy"], 3), ["ready", "ready", "happy"]), "");
// the result card's row keeps the finishing order, with the player in its place
{ const row = faceRow([3, 1, 0, 2, 4, 5], 5);
  check("row", same(row.map(o => o.k), [3, 1, 0, 2, 4, 5]) && same(row.map(o => o.mood), ["happy", "happy", "me", "grumpy", "grumpy", "grumpy"]), JSON.stringify(row)); }
// the start grid faces show for the countdown and past GO! (whose big letters cover the middle faces), then fade, and
// never in the menu demo
check("show countdown", faceShow({ mode: "race", state: "countdown", raceTime: 0 }) === 1, "");
check("show hold", FACES.hold >= 1 && faceShow({ mode: "race", state: "race", raceTime: 1.0 }) === 1, "the faces go before GO! has left the screen (0.9 s)");
check("show fade", Math.abs(faceShow({ mode: "race", state: "race", raceTime: FACES.hold + FACES.fade / 2 }) - 0.5) < 1e-9, "");
check("show gone", faceShow({ mode: "race", state: "race", raceTime: FACES.hold + FACES.fade + 0.01 }) === 0 && faceShow({ mode: "race", state: "done", raceTime: 0.1 }) === 0, "");
check("show demo", faceShow({ mode: "demo", state: "demo", raceTime: 0 }) === 0, "");

// every face, for every rival, draws inside its circle (and the bubble's tail ends at its tip)
function boundsCtx() {
  const b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity, calls: 0, log: [] };
  const pt = (x, y) => { b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x); b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y); };
  const sp = { moveTo: pt, lineTo: pt, arc(x, y, r) { pt(x - r, y - r); pt(x + r, y + r); }, ellipse(x, y, rx, ry) { pt(x - rx, y - ry); pt(x + rx, y + ry); } };
  const props = {};
  const ctx = new Proxy({}, { get: (_, k) => k in props ? props[k] : (...a) => { b.calls++; b.log.push(k + a.map(v => typeof v === "number" ? v.toFixed(2) : "").join(",")); return sp[k]?.(...a); }, set: (_, k, v) => { props[k] = v; return true; } });
  return { ctx, b };
}
for (const def of RIVALS) for (const mood of MOODS) {
  const { ctx, b } = boundsCtx(); drawFace(ctx, 100, 100, 20, mood, def);
  check("face " + def.name + " " + mood, b.calls > 8 && b.x0 >= 80 - 1e-9 && b.x1 <= 120 + 1e-9 && b.y0 >= 80 - 1e-9 && b.y1 <= 120 + 1e-9, JSON.stringify({ ...b, log: undefined }));
  const q = boundsCtx(); drawFaceBubble(q.ctx, 100, 100, 20, mood, def);
  check("bubble " + def.name + " " + mood, Math.abs(q.b.y1 - 100) < 1e-9 && q.b.y0 >= 100 - 20 * 2.45 - 1e-9, JSON.stringify({ ...q.b, log: undefined }));
}
// the three moods look different: each draws its own set of shapes
{ const n = MOODS.map(m => { const { ctx, b } = boundsCtx(); drawFace(ctx, 0, 0, 20, m, RIVALS[0]); return b.log.join(" "); });
  check("moods differ", new Set(n).size === MOODS.length, "two moods draw the same face"); }

// both engines: faces ride on the rivals in a real race only, and never change the race
for (const [name, eng, track] of [["classic", race, TRACKS.find(t => t.id === "sunny")], ["toy", toyRace, TRACKS.find(t => t.world === "toy")]]) {
  const car = CARS[0], st = statsFor(car, { engine: 2, turbo: 2, tires: 2, magnet: 0 }, {});
  const moods = ["happy", "grumpy", "ready", "happy", "grumpy"];
  eng.setup(track, "race", car, st, { moods });
  check(name + " moods", same(eng.rivals.map(c => c.mood), moods), JSON.stringify(eng.rivals.map(c => c.mood)));
  eng.setup(track, "race", car, st, {});
  check(name + " no moods", eng.rivals.every(c => c.mood === null), "a race with no moods has faces");
  eng.setup(track, "demo", car, st, { moods });
  check(name + " demo", eng.rivals.every(c => !c.mood), "the menu's demo drive has faces");
  eng.setup(track, "race", car, st, { moods, trial: true });
  check(name + " trial", eng.rivals.length === 0, "");
  eng.setup(track, "race", car, st, { moods, boss: { def: CARS[1], name: "B", speed: 1.8 } });
  check(name + " boss", eng.rivals.length === 1 && !eng.rivals[0].mood, "the boss wears a rival's face");
  // the same race with and without faces: same places, same time, same distances
  const play = opts => {
    let res = null; eng.hooks = { sfx() {}, engine() {}, onFinish: r => { res = r; } };
    eng.raceSeq = 0; eng.setup(track, "race", car, st, opts);
    for (let t = 0; !res && t < 300; t += 1 / 80) { const p = eng.player; eng.input.left = p.offset > 0.5; eng.input.right = p.offset < -0.5; eng.update(1 / 80); }
    eng.input.left = eng.input.right = false;
    return { place: res?.place, standings: res?.standings, time: res && +res.time.toFixed(4), dist: eng.rivals.map(c => +c.dist.toFixed(3)) };
  };
  const a = play({}), b = play({ moods });
  check(name + " same race", a.place && same(a, b), JSON.stringify({ a, b }));
}

console.log(failed ? `\n${failed} face check(s) FAILED` : "✔ Faces: moods after a race, the start grid, the result row, drawing, and no change to either race");
process.exit(failed ? 1 : 0);
