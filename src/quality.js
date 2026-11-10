// Picture quality ladder (v1.10). Replaces the old one-way "Simple" latch, which switched on after one slow
// moment and then stayed on for every track until the game was reloaded.
//   3 full  ·  2 a little lighter  ·  1 Simple        (what each level draws: QUALITY in src/engine.js, canvas
//                                                       size per level: QUALITY_CAP below)
// Down one step when races run slowly for 2 seconds. Up one step only between races, after two whole races that
// ran smoothly, so it never flips back and forth inside a race. A level that was too slow twice is not tried
// again on this device. "Slow" is judged against this screen's own frame time (measured on menus, where little
// is drawn), so a 50 Hz or 120 Hz screen is not mistaken for a slow device. The level is remembered per device.
// Pure (no page): scripts/test-pace.mjs drives it with made-up frame times.

export const QUALITY_CAP = { 3: 720, 2: 600, 1: 480 };   // canvas height limit (device pixels) per level
const FINE_MS = 17.5;                                     // ~57 fps or better is always fine

export function qualityLadder(saved = {}, persist = () => {}) {
  const q = {
    level: [1, 2, 3].includes(saved.level) ? saved.level : 3,
    fails: { 2: +saved.fails?.[2] || 0, 3: +saved.fails?.[3] || 0 },
    good: 0, vsync: Infinity, allMs: 0, allN: 0, ms: 0, slowT: 0, sum: 0, n: 0, dropped: false,
  };
  const keep = () => persist({ level: q.level, fails: q.fails });
  const slowAt = () => Math.max(FINE_MS, (Number.isFinite(q.vsync) ? q.vsync : 16.7) * 1.25 + 1);
  /* every visible frame (menus too); racing = a race is running. Returns true when the level just changed. */
  q.frame = (rawMs, racing) => {
    if (!(rawMs > 0) || rawMs > 120) return false;
    q.allMs = q.allN++ ? q.allMs + (rawMs - q.allMs) * 0.05 : rawMs;
    if (q.allN > 30) q.vsync = Math.max(6, Math.min(q.vsync, q.allMs));
    if (!racing) return false;
    q.ms = q.ms ? q.ms + (rawMs - q.ms) * 0.05 : rawMs; q.sum += rawMs; q.n++;
    q.slowT = q.ms > slowAt() ? q.slowT + rawMs / 1000 : 0;
    if (q.slowT > 2 && q.level > 1) {
      q.fails[q.level] = (q.fails[q.level] || 0) + 1; q.level--; q.slowT = 0; q.ms = 0; q.dropped = true; q.good = 0; keep();
      return true;
    }
    return false;
  };
  q.raceStart = () => { q.ms = 0; q.slowT = 0; q.sum = 0; q.n = 0; q.dropped = false; };
  /* after a race: returns true when the level just went up */
  q.raceEnd = () => {
    const smooth = !q.dropped && q.n > 300 && q.sum / q.n < Math.max(FINE_MS, (Number.isFinite(q.vsync) ? q.vsync : 16.7) * 1.1);
    q.good = smooth ? q.good + 1 : 0; q.n = 0; q.sum = 0;
    if (q.good >= 2 && q.level < 3 && (q.fails[q.level + 1] || 0) < 2) { q.level++; q.good = 0; keep(); return true; }
    return false;
  };
  return q;
}
