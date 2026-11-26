// 🏆 "Best" badges (v1.17): which of the player's own cars is fastest on a track. One rule for the track cards and
// the Garage, so the two always agree, and `npm run sim -- best` races every pick to check it.
// A car's pace on a track is its real top speed there (its upgrades, its trait, and the home-world bonus), its power
// there and a Tough car's snowbanks on Glacier (both measured per track, 2026-11-26, src/best-table.js), with a small
// share for a longer Turbo and for quick starts. Measured
// against whole races with the kid driver over many random garages (v1.17): the pick is the fastest car in about 96
// races of 100, and never more than about 3% slower than the fastest one.
import { statsFor } from "./stats.js";
import { trackBonus, worldOf } from "./physics-common.js";
import { CARS, PERKS, RESEARCH } from "./data.js";
import { PERK_PACE, TOUGH_ICE } from "./best-table.js";

export const BEST_MARGIN = 1.01;   // another car must be at least 1% faster to be named best over the one being driven

/* 🌟 what a special car's power is worth at home (v1.19). 2026-11-26: it is worth another amount on each track (the
   Moon Hopper's jump adds 1% on Big Crater Jump, whose ramps already throw cars high, and 8% on Dark Side Dash) and on
   an early garage than on a full one, so the rule reads the measured table in src/best-table.js ([early, full]) and
   moves from one number to the other as the Lab fills. PERKS early and pace are the world averages, for a track the
   table does not have yet (scripts/test-best.mjs fails until it does). */
const LAB_LEVELS = RESEARCH.reduce((n, r) => n + r.max, 0);
export function labShare(lab = {}) { return Math.min(1, RESEARCH.reduce((n, r) => n + Math.min(r.max, lab[r.id] || 0), 0) / LAB_LEVELS); }
export function perkPace(car, track, lab = {}) {
  const P = PERKS[car.perk];
  if (!P || !track || worldOf(car) !== track.world) return 1;
  const [early, full] = PERK_PACE[car.perk]?.[track.id] || [P.early, P.pace];
  return early + (full - early) * labShare(lab);
}

/* 💪 a Tough car on a Glacier track (2026-11-26): it feels half of each snowbank, which the kind bonus never counted.
   Snow Cat and Frost Runner each raced as Tough and as Grippy were 1% to 3% faster as Tough than the rest of the rule
   says, by track (TOUGH_ICE in src/best-table.js). Without it Snow Cat lost its badge on Aurora Pass to cars 4% slower. */
export const toughIce = (car, track) => car.trait === "tough" && track ? TOUGH_ICE[track.id] || 1 : 1;

/* the rule without the Glacier Tough number (scripts/probes/best-table.mjs measures that number against this) */
export function basePace(car, ups, track, lab = {}) {
  const s = statsFor(car, ups, lab);
  return s.maxSpeed * trackBonus(car, track) * perkPace(car, track, lab) * (1 + 0.015 * s.nitroTime) * Math.pow(s.accel / s.maxSpeed, 0.1);
}
export const paceOn = (car, ups, track, lab = {}) => basePace(car, ups, track, lab) * toughIce(car, track);

/* the best of the given cars on this track: the one being driven (`current`) keeps the title unless another car is
   clearly faster (BEST_MARGIN), so the badge never asks for a swap that would not show */
export function bestCar(track, cars, upsOf, lab = {}, current = null) {
  let best = null, top = 0;
  for (const c of cars) { const p = paceOn(c, upsOf(c.id), track, lab); if (p > top) { best = c; top = p; } }
  const cur = current && cars.find(c => c.id === current);
  if (cur && best !== cur && top < paceOn(cur, upsOf(cur.id), track, lab) * BEST_MARGIN) return cur;
  return best;
}

/* the two places that show it, from a save: the chip on a track card (the best car when it is not the one being
   driven, else null), and the Garage's list of tracks where a car is the best (tests check the two always agree) */
const NO_UPS = { engine: 0, turbo: 0, tires: 0, magnet: 0 };
const mine = S => CARS.filter(c => S.owned.includes(c.id));
const bestIn = (S, track) => bestCar(track, mine(S), id => S.ups?.[id] || NO_UPS, S.research || {}, S.car);
export function chipFor(S, track) { const b = bestIn(S, track); return b && b.id !== S.car ? b : null; }
export function bestTracks(S, car, tracks) { return S.owned.includes(car.id) && mine(S).length > 1 ? tracks.filter(t => bestIn(S, t) === car) : []; }
