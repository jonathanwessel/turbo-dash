// Car stats for a race: the car itself + its own upgrades + Turbo Lab research (shared by every car).
// Used by the game and by the race simulator (scripts/sim.mjs), so both always agree.
import { BASE_MAX } from "./engine.js";

export function statsFor(car, u, lab = {}) {
  const L = k => lab[k] || 0;
  return {
    maxSpeed: BASE_MAX * (1 + car.speed + 0.06 * u.engine),
    accel: BASE_MAX / 4.5 * (1 + car.accel + 0.04 * u.engine),
    handling: 1.15 + car.grip + 0.07 * u.tires,
    grip: Math.min(0.6, car.grip + 0.06 * u.tires),
    nitroFill: 0.05 + 0.01 * u.turbo,
    nitroTime: 2 + 0.3 * u.turbo + 0.15 * L("turboTanks"),
    magnet: 0.12 * u.magnet + 0.03 * L("magnetField"),
    startNitro: 0.13 * L("headStart"),
    bumper: 0.04 * L("bumper"),
    jump: 1 + 0.08 * L("bigRamps"),
  };
}
