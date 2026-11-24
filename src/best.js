// 🏆 "Best" badges (v1.17): which of the player's own cars is fastest on a track. One rule for the track cards and
// the Garage, so the two always agree, and `npm run sim -- best` races every pick to check it.
// A car's pace on a track is its real top speed there (its upgrades, its trait, and the home-world bonus), with a
// small share for a longer Turbo and for quick starts. Measured against whole races with the kid driver over many
// random garages (v1.17): the pick is the fastest car in about 96 races of 100, and never more than about 3%
// slower than the fastest one.
import { statsFor } from "./stats.js";
import { homeBonus } from "./physics-common.js";
import { CARS, PERKS } from "./data.js";
import { worldOf } from "./physics-common.js";

export const BEST_MARGIN = 1.01;   // another car must be at least 1% faster to be named best over the one being driven

export function paceOn(car, ups, track, lab = {}) {
  const s = statsFor(car, ups, lab);
  const perk = track && worldOf(car) === track.world ? PERKS[car.perk]?.pace || 1 : 1;   // 🌟 a special car's power at home (v1.19)
  return s.maxSpeed * homeBonus(car, track) * perk * (1 + 0.015 * s.nitroTime) * Math.pow(s.accel / s.maxSpeed, 0.1);
}

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
