// Physics both race engines share (the classic road in src/engine.js and Toy Track World in src/toy/race.js),
// so a change to how rivals drive happens in one place. Plain math: the race simulators use it too.
import { PACE, CUPS, WORLDS } from "./data.js";

export const BASE_MAX = 10000;   // the classic engine's speed unit: a starter car's top speed (world units / s)

/* how fast rival i (0 = fastest) drives on a track of difficulty d, in units of a starter car's top speed */
export const rivalBase = (d, i) => 1.06 + d * 0.12 + (4 - i) * 0.035;

/* rubber band: rivals far ahead ease off, rivals far behind catch up. It fades in smoothly between 20 and 70
   (segments on the classic road, track units in Toy Track World), so no rival visibly surges at a fixed gap. */
export function rubberBand(gap, diffId, trackDiff = 99) {
  const t = Math.min(1, Math.max(0, (Math.abs(gap) - 20) / 50)), ease = t * t * (3 - 2 * t);
  const hard = diffId === "hard", easy = diffId === "easy";
  const full = gap > 0 ? (easy ? 0.8 : hard ? 1 : trackDiff <= 1 ? 0.93 : 0.98) : (hard ? 1.04 : 1.07);
  return 1 + (full - 1) * ease;
}

/* 🏠 home-world bonus (v1.11): a car built for a world (its shop, cup and boss cars) is a little faster there. It
   replaces the old 4% penalty for other cars on ice and in Toy Track World. Earth cars have no home bonus. */
export const HOME_BONUS = 0.05;
export const worldOf = car => car.world || CUPS.find(c => c.id === car.cup)?.world || "earth";
/* what the game says about it: "🌙 Faster on Moon Base" (null for Earth cars) */
export const homeNote = car => { const w = WORLDS.find(x => x.id === worldOf(car)); return w && w.id !== "earth" ? { icon: w.icon, text: `${w.icon} Faster in ${w.name}` } : null; };
export const homeBonus = (car, track) => track && track.world && track.world !== "earth" && worldOf(car) === track.world ? 1 + HOME_BONUS : 1;

/* a small seeded random generator (same seed, same numbers), and a seed from a track id */
export function rng(seed) { let s = Math.abs(Math.floor(seed)) % 2147483646 + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
export const strSeed = str => [...String(str)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 1000003, 7);

/* how many of something to spawn this step, for effects tuned as "a chance per 1/60 s step". The chance becomes an
   expected count scaled by the step's length, so a short step (a 120 Hz screen) spawns less and a long one more, and
   the amount per second stays the same on every screen. At the normal step it is exactly the old chance. */
export function perStep(chance, dt, rnd = Math.random) { const x = chance * dt * 60 / PACE; return Math.floor(x) + (rnd() < x % 1 ? 1 : 0); }
/* a nudge tuned per 1/60 s step, scaled to this step's length (1 at the normal step) */
export const stepK = dt => dt * 60 / PACE;
