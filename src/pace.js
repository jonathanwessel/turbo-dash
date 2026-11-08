// ⏱️ The game clock. Physics runs one step per real 1/60 s, so a 60 Hz screen draws a new picture every frame.
// Calmer races (PACE, v1.6) slow the step itself instead of skipping steps: each step moves the race 3/4 of a
// 60th of a second. (Skipping steps made one frame in four repeat the last picture: a visible stutter.)
// The countdown keeps real seconds. Pure (no page), so scripts/test-pace.mjs can check it.
import { PACE } from "./data.js";

export const STEP = 1 / 60;
/* adds this frame's real time and runs the steps it covers; returns how many ran */
export function advance(clock, dt, race) {
  clock.acc += dt; let n = 0;
  while (clock.acc >= STEP - 1e-9) { race.update(STEP * (race.state === "countdown" ? 1 : PACE)); clock.acc -= STEP; n++; }
  return n;
}
