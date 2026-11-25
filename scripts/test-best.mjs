// 🏆 v1.17 "Best" badges (src/best.js): the rule, and the track card chip and the Garage list always agreeing.
// Whether the pick is really fastest is raced by `npm run sim -- best` (in npm run check).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CARS, TRACKS } from "../src/data.js";
import { bestCar, chipFor, bestTracks, paceOn, BEST_MARGIN } from "../src/best.js";

let n = 0;
const ok = (c, msg) => { assert.ok(c, msg); n++; };
const car = id => CARS.find(c => c.id === id), track = id => TRACKS.find(t => t.id === id);
const U = n => ({ engine: n, turbo: n, tires: n, magnet: 0 });
const save = (owned, current, lv = 0, more = {}) => ({ owned, car: current, ups: Object.fromEntries(owned.map(id => [id, U(lv)])), research: {}, ...more });

// a faster car wins, a home-world car wins at home
ok(bestCar(track("sunny"), [car("zippy"), car("galaxy")], () => U(0)) === car("galaxy"), "Galaxy GT beats Zippy on Earth");
const moon = TRACKS.find(t => t.world === "moon"), rover = car("rover");
ok(paceOn(rover, U(5), moon) > paceOn(rover, U(5), track("sunny")), "the Moon car is faster on the Moon (home bonus)");
// upgrades count: Zippy fully upgraded against a bare Blue Bolt
ok(bestCar(track("sunny"), [car("zippy"), car("bolt")], id => id === "zippy" ? U(5) : U(0)) === car("zippy"), "upgrades count");
// the car being driven keeps the title unless another is at least 1% faster
{ const a = car("zippy"), b = car("monster"), t = TRACKS.find(x => x.world === "earth" && x.kind === "tough");   // a Tough track (v1.21 kinds): Zippy is Fast
  const pa = paceOn(a, U(5), t), pb = paceOn(b, U(5), t);
  ok(pb >= pa * BEST_MARGIN, "Mega Monster +5 is clearly faster than Zippy +5 (setup)");
  ok(bestCar(t, [a, b], () => U(5), {}, "zippy") === b, "a clearly faster car takes the title from the car being driven");
  // a made-up near tie: two of the same car under different names
  const twin = { ...a, id: "twin" };
  ok(bestCar(t, [twin, a], () => U(5), {}, "zippy") === a, "a tie keeps the car being driven");
}
// ⚡🛞 v1.21 track kinds: Rocket Rex (Fast) is the best on a Fast track, Galaxy GT (Grippy) on a Grippy one
{ const fastT = TRACKS.find(t => t.world === "earth" && t.kind === "fast"), gripT = TRACKS.find(t => t.world === "earth" && t.kind === "grippy");
  ok(bestCar(fastT, [car("rocket"), car("galaxy")], () => U(5)) === car("rocket"), "a Fast car wins a Fast track");
  ok(bestCar(gripT, [car("rocket"), car("galaxy")], () => U(5)) === car("galaxy"), "a Grippy car wins a Grippy track"); }
// chips: none with one car, none for the car being driven, the faster car otherwise
ok(chipFor(save(["zippy"], "zippy"), track("sunny")) === null, "one car, no chip");
ok(chipFor(save(["zippy", "galaxy"], "galaxy"), track("sunny")) === null, "driving the best car, no chip");
ok(chipFor(save(["zippy", "galaxy"], "zippy"), track("sunny")) === car("galaxy"), "driving a slower car, a chip for the faster one");
ok(bestTracks(save(["zippy"], "zippy"), car("zippy"), TRACKS).length === 0, "the Garage shows nothing with one car");
ok(bestTracks(save(["zippy", "galaxy"], "zippy"), car("rover"), TRACKS).length === 0, "nothing for a car that is not owned");

// one state, one source: on every track, a chip names car X exactly when the Garage lists that track for X, and the
// car being driven is listed exactly where no chip shows. Checked on the career bot's Rank 16 save and random saves.
const mid = JSON.parse(readFileSync(new URL("../src/dev/mid-save.json", import.meta.url), "utf8"));
let s = 5; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
const saves = [mid];
for (let k = 0; k < 30; k++) {
  const owned = CARS.filter(() => R() < 0.4).map(c => c.id); if (owned.length < 2) continue;
  saves.push({ owned, car: owned[Math.floor(R() * owned.length)], ups: Object.fromEntries(owned.map(id => [id, { engine: Math.floor(R() * 6), turbo: Math.floor(R() * 6), tires: Math.floor(R() * 6), magnet: 0 }])), research: {} });
}
let chips = 0;
for (const S of saves) {
  const lists = new Map(CARS.map(c => [c.id, new Set(bestTracks(S, c, TRACKS).map(t => t.id))]));
  for (const t of TRACKS) {
    const chip = chipFor(S, t), holders = CARS.filter(c => lists.get(c.id).has(t.id));
    ok(holders.length === 1, `${t.id}: exactly one car is listed as best`);
    ok(chip ? holders[0] === chip : holders[0].id === S.car, `${t.id}: the chip and the Garage agree`);
    if (chip) chips++;
  }
}
ok(chips > 50, "the random saves do show chips (the agreement check is not empty)");
// the Rank 16 save drives Champion X (Fast). v1.21 track kinds: it keeps the title on Fast tracks, and Thunder King
// (Tough) and Galaxy GT (Grippy) take their own kinds, so a mid-game garage has three cars with a place. Driving
// Zippy, every open track shows a chip (the sweep and the audit open the chip and its card this way)
const chipKind = { fast: undefined, tough: "thunder", grippy: "galaxy" };
ok(TRACKS.every(t => chipFor(mid, t)?.id === chipKind[t.kind]), "the Rank 16 save: no chip on Fast tracks, Thunder King on Tough, Galaxy GT on Grippy");
ok(TRACKS.filter(t => t.world === "earth").every(t => chipFor({ ...mid, car: "zippy" }, t)), "the Rank 16 save driving Zippy shows a chip on every Earth track");

// the screens use these two helpers (and only these) to paint the chip and the Garage row
const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8"), garage = readFileSync(new URL("../src/garage.js", import.meta.url), "utf8");
ok(/chipFor\(S, t\)/.test(main) && !/bestCar\(/.test(main), "the track cards use chipFor");
ok(/bestTracks\(S, car,/.test(garage) && !/bestCar\(/.test(garage), "the Garage uses bestTracks");
console.log(`✔ Best badges: the rule, the chip and the Garage agree (${n} checks)`);
