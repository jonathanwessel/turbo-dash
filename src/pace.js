// ⏱️ The game clock. Every screen frame runs physics exactly once, for as long as that frame really lasted, so each
// new picture moves the race by the same amount: no repeated pictures and no double jumps, on a 60 Hz tablet, a
// 90 or 120 Hz phone, a 144 Hz monitor or a slow 45 fps device alike. (v1.6.1 to v1.9 ran fixed 1/60 s steps,
// which was only even on a display at exactly 60.000 Hz; v1.10 sizes the step to the display.)
//
// How: the clock keeps a slow average of the display's frame time (its period). A normal frame uses that period
// instead of its own timestamp gap, which hides the browser's timer rounding and tiny jitter. The difference is kept
// as a "debt" and paid back a little each frame, so race time never drifts from real time. A hitch (a frame far off the
// period) uses its real length. Steps never exceed MAX_STEP: a long frame is split into equal sub-steps.
//
// Calmer races (PACE, v1.6) scale every step to 3/4 of real time after the countdown; the countdown keeps real
// seconds. Pure (no page), so scripts/test-pace.mjs can feed it any display.
import { PACE } from "./data.js";

export const STEP = 1 / 60;          // the step the race was tuned at (tests and simulators still use it)
export const MAX_STEP = 1 / 40;      // the longest single physics step (real seconds)

export const newClock = () => ({ period: 0, debt: 0, off: 0 });
/* the start of a race, an unpause: forget the old timing so a stale frame gap is not paid back */
export function resetClock(clock) { clock.debt = 0; }

/* runs this frame's physics; returns how many steps ran (1 on every normal frame) */
export function advance(clock, dt, race) {
  if (!(dt > 0)) return 0;
  let near = clock.period > 0 && Math.abs(dt - clock.period) < clock.period * 0.3;
  if (near) { clock.period += (dt - clock.period) * 0.05; clock.off = 0; }
  else if (!clock.period || ++clock.off >= 4) { clock.period = dt; clock.off = 0; near = true; }   // first frame, or the display changed rate
  let use = near ? clock.period : dt;                                                // steady frames use the smoothed period
  clock.debt = (clock.debt || 0) + dt - use;                                        // keep long-run time honest:
  const pay = near ? Math.max(-0.1 * clock.period, Math.min(0.1 * clock.period, clock.debt * 0.1)) : 0;   // pay it back a little
  use += pay; clock.debt -= pay;                                                     // each frame (never a visible jump)
  if (!(use > 0)) return 0;
  const n = Math.max(1, Math.ceil(use / MAX_STEP - 1e-9)), k = race.state === "countdown" ? 1 : PACE;
  for (let i = 0; i < n; i++) race.update(use / n * k);
  return n;
}

/* 📊 the step counter (a measuring tool, not part of the game): what one race looked like on this screen. It also
   runs the old fixed-step clock on the side, so it shows whether this display had the uneven-step problem. */
export function stepCounter() {
  const c = { frames: 0, steps: {}, oldSteps: {}, ms: {}, sum: 0, min: 1e9, max: 0, acc: 0 };
  c.frame = (rawMs, n) => {
    c.frames++; c.steps[n] = (c.steps[n] || 0) + 1; c.sum += rawMs; c.min = Math.min(c.min, rawMs); c.max = Math.max(c.max, rawMs);
    const b = rawMs < 5 ? "<5" : rawMs < 40 ? String(Math.round(rawMs)) : "40+"; c.ms[b] = (c.ms[b] || 0) + 1;
    c.acc += Math.min(0.05, rawMs / 1000); let o = 0; while (c.acc >= STEP - 1e-9) { c.acc -= STEP; o++; }
    c.oldSteps[o] = (c.oldSteps[o] || 0) + 1;
  };
  c.report = () => {
    const pct = o => Object.entries(o).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]) || 0).map(([k, v]) => `${k}: ${(100 * v / c.frames).toFixed(1)}%`).join(", ");
    const top = Object.entries(c.ms).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ms ${(100 * v / c.frames).toFixed(0)}%`).join(", ");
    return { frames: c.frames, hz: c.frames ? +(1000 * c.frames / c.sum).toFixed(1) : 0, minMs: +c.min.toFixed(1), maxMs: +c.max.toFixed(1), steps: pct(c.steps), oldSteps: pct(c.oldSteps), frameMs: top };
  };
  return c;
}
