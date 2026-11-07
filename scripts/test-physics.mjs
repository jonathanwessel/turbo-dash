// Physics test: the race engines, headless, with a seeded random so every run is the same.
//   npm test   (runs this after the save test)
// Each check sets up a small situation on a real track (or plays whole bot races) and checks what the car does.
let seed = 12345;
Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

const { Race, buildTrack, SEG, BASE_MAX, CAR_W, RAIL_IN } = await import("../src/engine.js");
const { statsFor } = await import("../src/stats.js");
const { CARS, TRACKS } = await import("../src/data.js");
const { runRace, race: botRace } = await import("./racebot.mjs");

let failed = 0, passed = 0;
const check = (name, ok, msg) => { if (ok) passed++; else { failed++; console.log(`  ✖ ${name}: ${msg}`); } };
const zippy = CARS[0], NO_UPS = { engine: 0, turbo: 0, tires: 0, magnet: 0 }, UPS = { engine: 3, turbo: 3, tires: 3, magnet: 0 };
const track = id => TRACKS.find(t => t.id === id);
const STEP = 1 / 60;

/* a race already running, on a quiet stretch: every rival parked far behind except the ones a check moves in */
function scene(trackId, { ups = UPS, from = 0 } = {}) {
  const r = new Race({ getContext: () => null, width: 1, height: 1 }, { sfx: n => r.sounds.push(n), engine() {}, onFinish() {} });
  r.sounds = [];
  r.setup(track(trackId), "race", zippy, statsFor(zippy, ups, {}, {}), { diff: "normal" });
  r.state = "race"; r.count = 0;
  for (const c of r.rivals) { c.dist = -1e7; c.speed = 0; c.base = 0; c.offset = c.lane = 0.8; }
  const p = r.player; p.dist = from; p.offset = 0; p.speed = r.stats.maxSpeed; r.prevIdx = r.segAt(p.dist).index;
  return r;
}
/* a straight stretch of n segments (no rails, ramps, gaps, pads or finish line; hills are fine) */
function quietStretch(trackId, n = 70) {
  const T = buildTrack(track(trackId)), segs = T.segs;
  for (let i = 40; i < segs.length - n; i++) {
    const run = segs.slice(i, i + n);
    if (run.every(s => Math.abs(s.curve) < 0.01 && !s.rail && !s.ramp && !s.gap && s.boost === null && !s.finish))
      return (i + 2) * SEG - (15 * SEG + SEG * 0.5);   // as a race distance (START = 15)
  }
  throw new Error("no quiet stretch on " + trackId);
}
const run = (r, sec, each) => { for (let t = 0; t < sec; t += STEP) { r.update(STEP); each?.(r); } };

/* ---------- 💨 drafting ---------- */
{
  const at = quietStretch("sunny"), top = scene("sunny").stats.maxSpeed;
  const alone = scene("sunny", { from: at }); run(alone, 1.2);
  const behind = scene("sunny", { from: at }), c = behind.rivals[0];
  Object.assign(c, { dist: at + 5 * SEG, offset: 0, lane: 0, speed: top, base: top * 1.08, laneT: 99 });
  run(behind, 1.2);
  check("draft", behind.drafting && behind.player.speed > alone.player.speed * 1.02, `behind a rival ${Math.round(behind.player.speed)} vs alone ${Math.round(alone.player.speed)} (drafting ${behind.drafting})`);
  check("draft popup + sound", behind.sounds.includes("draft") && behind.popups.some(q => /DRAFT/.test(q.text)) || behind.draftShown, "no draft sound/popup");
  const side = scene("sunny", { from: at }), c2 = side.rivals[0];
  Object.assign(c2, { dist: at + 5 * SEG, offset: 0.6, lane: 0.6, speed: top, base: top * 1.08, laneT: 99 });
  run(side, 1.2);
  check("no draft off to the side", !side.drafting && Math.abs(side.player.speed - alone.player.speed) < 1, `drafted from the next lane (${Math.round(side.player.speed)})`);
  const far = scene("sunny", { from: at }), c3 = far.rivals[0];
  Object.assign(c3, { dist: at + 14 * SEG, offset: 0, lane: 0, speed: top * 1.1, base: top * 1.1, laneT: 99 });
  run(far, 1.2);
  check("no draft far behind", !far.drafting, "drafted 14 segments back");
}

/* ---------- 🤝 softer bumps ---------- */
{
  const at = quietStretch("beach");
  for (const steerIn of [false, true]) {
    const r = scene("beach", { from: at }), p = r.player, c = r.rivals[0];
    p.speed = c.speed = BASE_MAX * 0.8; Object.assign(c, { dist: at + 0.2 * SEG, offset: -0.1, lane: -0.1, base: BASE_MAX * 0.8, laneT: 99 }); p.offset = 0.1;
    if (steerIn) r.input.left = true;   // the rival is on the left
    const v0 = p.speed, gap0 = Math.abs(p.offset - c.offset);
    r.update(STEP); r.input.left = false;
    const label = steerIn ? "side bump, steering into it" : "side bump";
    check(label, p.speed >= v0 * (steerIn ? 0.985 : 0.999), `player speed ${Math.round(v0)} -> ${Math.round(p.speed)}`);
    check(label + " pushes the rival", Math.abs(p.offset - c.offset) > gap0 + 0.2 && c.wobT > 0, `gap ${gap0.toFixed(2)} -> ${Math.abs(p.offset - c.offset).toFixed(2)}, wobble ${c.wobT}`);
  }
  // catching a slower car: no wall (speed eases), and never through it
  const r = scene("beach", { from: at }), p = r.player, c = r.rivals[0];
  p.speed = BASE_MAX * 1.0; Object.assign(c, { dist: at + 0.7 * SEG, offset: 0, lane: 0, speed: BASE_MAX * 0.6, base: BASE_MAX * 0.6, laneT: 99 });
  r.update(STEP);
  check("rear bump eases", p.speed > BASE_MAX * 0.9, `speed dropped to ${Math.round(p.speed)} in one frame`);
  let through = false; run(r, 1.5, () => { if (p.dist > c.dist + 0.2 * SEG && Math.abs(p.offset - c.offset) < CAR_W * 0.9) through = true; });
  check("never through a car", !through, "the player passed through the rival");
  // a rival behind never slows the player down
  const r2 = scene("beach", { from: at }), p2 = r2.player, c4 = r2.rivals[0];
  p2.speed = BASE_MAX * 0.6; Object.assign(c4, { dist: at - 0.7 * SEG, offset: 0, lane: 0, speed: BASE_MAX * 1.1, base: BASE_MAX * 1.1, laneT: 99 });
  const v1 = p2.speed; r2.update(STEP);
  check("rival behind brakes", p2.speed >= v1 && c4.dist < p2.dist, `player ${Math.round(v1)} -> ${Math.round(p2.speed)}`);
}

/* ---------- 🚧 rails on sharp curves ---------- */
{
  const T = buildTrack(track("autumn")), i = T.segs.findIndex((s, k) => k > 40 && s.rail && T.segs[k + 30]?.rail);
  const r = scene("autumn", { from: (i + 1) * SEG - (15 * SEG + SEG * 0.5) }), p = r.player;
  p.offset = -Math.sign(T.segs[i].curve) * 0.9; r.prevIdx = r.segAt(p.dist).index; r.input.right = r.input.left = false;
  r.input[T.segs[i].curve > 0 ? "left" : "right"] = true;   // steer to the outside of the curve, into the rail
  const before = r.parts.length; let worst = 1, last = p.speed, out = 0;
  run(r, 0.5, () => { if (r.segAt(p.dist).rail) out = Math.max(out, Math.abs(p.offset)); worst = Math.min(worst, p.speed / last); last = p.speed; });
  check("rail holds", out <= RAIL_IN + 1e-9, `got to ${out.toFixed(3)} (rail at ${RAIL_IN})`);
  check("rail sparks", r.parts.length > before && r.sounds.includes("scrape"), "no sparks or scrape sound");
  check("rail scrape costs at most 4%", worst >= 0.959, `one frame lost ${((1 - worst) * 100).toFixed(1)}%`);
  // went wide on the grass before the rail started: the rail guides the car back onto the road (never stuck outside)
  const w = scene("autumn", { from: (i + 1) * SEG - (15 * SEG + SEG * 0.5) }), wp = w.player;
  wp.offset = Math.sign(T.segs[i].curve) * 2; w.prevIdx = w.segAt(wp.dist).index;
  run(w, 0.5);
  check("rail guides a wide car back", Math.abs(wp.offset) <= RAIL_IN + 1e-9, `still at ${wp.offset.toFixed(2)} after 0.5 s`);
}

/* ---------- 🛬 landing ---------- */
{
  const T = buildTrack(track("sunny")), i = T.segs.findIndex((s, k) => k > 40 && s.rampStart);
  const r = scene("sunny", { from: (i - 3) * SEG - (15 * SEG + SEG * 0.5) }), p = r.player; p.offset = 0; r.prevIdx = r.segAt(p.dist).index;
  let landed = false; run(r, 3, () => { if (p.landT > 0.3) landed = true; });
  check("landing", landed && p.landV > 0, `landT never set (landV ${p.landV})`);
}

/* ---------- 🛞 skid marks ---------- */
{
  const T = buildTrack(track("autumn")), i = T.segs.findIndex((s, k) => k > 40 && Math.abs(s.curve) > 1.5 && Math.abs(T.segs[k + 25]?.curve) > 1.5);
  const r = scene("autumn", { from: (i + 1) * SEG - (15 * SEG + SEG * 0.5) }), p = r.player;
  r.prevIdx = r.segAt(p.dist).index; r.input[T.segs[i].curve > 0 ? "right" : "left"] = true;   // turning hard into the curve
  run(r, 0.5);
  check("skid marks on a hard turn", r.skids.size > 0, "no skid marks");
  check("skid marks are capped", r.skids.size <= 400, `${r.skids.size} marks`);
  check("smoke on a hard turn", r.parts.some(q => q.c === "smoke"), "no tire smoke");
  r.setup(track("autumn"), "race", zippy, statsFor(zippy, UPS, {}, {}), { diff: "normal" });
  check("skid marks cleared for a new race", r.skids.size === 0, "old marks kept");
  const big = scene("autumn"); for (let k = 0; k < 900; k++) { big.skids.set(k, { x: 0, t: 0 }); if (big.skids.size > 400) big.skids.delete(big.skids.keys().next().value); }
  check("skid ring buffer", big.skids.size === 400, `${big.skids.size}`);
}

/* ---------- 🚀 Turbo zoom (view only) ---------- */
{
  const r = scene("sunny", { from: quietStretch("sunny") }), base = r.camDepth;
  r.nitroT = 3; run(r, 1);
  const zoomed = r.camDepth;
  run(r, 2, q => { q.nitroT = 0; q.boostT = 0; });   // (no boost pads either)
  check("turbo zoom", Math.abs(zoomed / base - 0.88) < 0.03 && Math.abs(r.camDepth / base - 1) < 0.02 && Number.isFinite(r.camDepth), `zoom ${(zoomed / base).toFixed(3)}, after ${(r.camDepth / base).toFixed(3)}`);
}

/* ---------- 🚇 tunnels, 🌃 the night track, and tracks built the same every time ---------- */
{
  const { THEMES } = await import("../src/data.js");
  const { clearTrackCache } = await import("../src/engine.js");
  const classic = TRACKS.filter(t => t.world !== "toy");
  for (const t of classic) {
    const segs = buildTrack(t).segs, tun = segs.filter(s => s.tunnel);
    if (THEMES[t.theme].tunnels) check("tunnels on " + t.id, tun.length > 0, "a tunnel theme with no tunnel");
    else check("no tunnels on " + t.id, tun.length === 0, `${tun.length} tunnel pieces`);
    check("tunnels clear on " + t.id, tun.every(s => !s.ramp && !s.gap && !s.finish && s.boost === null && !s.rail && !s.sprites.length), "a tunnel over a ramp, gap, pad, rail, finish or sprite");
  }
  const night = TRACKS.find(t => t.id === "night");
  check("night track", night && TRACKS.some(t => t.id === night.after) && THEMES.night?.night, "Piqua Night Lights missing or not branching off a real track");
  const sum = t => buildTrack(t).segs.map(s => [s.curve.toFixed(4), s.p2.world.y.toFixed(2), s.sprites.map(x => x.type + x.offset.toFixed(3)).join(), s.tunnel ? 1 : 0, s.ramp ? 1 : 0, s.boost, s.rail ? 1 : 0].join("|")).join("\n");
  const before = classic.map(sum); clearTrackCache(); const after = classic.map(sum);
  check("tracks are built the same every time", before.every((b, k) => b === after[k]), "a track changed when built again");
}

/* ---------- whole races: rails always hold, cars rarely overlap, sims sane ---------- */
{
  let frames = 0, overlaps = 0, railBad = 0, finished = 0, races = 0;
  const earth = TRACKS.filter(t => t.world === "earth" && !t.bonus);
  for (const t of earth) for (const bot of ["kid", "good"]) {
    const r = botRace; let res = null, wasRail = false, lastA = 0;
    r.hooks = { sfx() {}, engine() {}, onFinish: x => { res = x; } };
    r.setup(t, "race", zippy, statsFor(zippy, UPS, {}, {}), { diff: "normal" });
    for (let k = 0; !res && k < 400 * 60; k++) {
      const p = r.player, edge = bot === "good" ? 0.25 : 0.7;
      r.input.left = p.offset > edge; r.input.right = p.offset < -edge;
      if (bot === "good" || Math.random() < 0.01) r.useNitro();
      r.update(STEP);
      if (r.state !== "race") continue;
      frames++;
      if (r.rivals.some(c => Math.abs(c.dist - p.dist) < SEG * 0.45 && Math.abs(c.air - p.air) < 250 && Math.abs(c.offset - p.offset) < CAR_W * 0.6)) overlaps++;
      const onRail = r.segAt(p.dist).rail && p.air <= 0, a = Math.abs(p.offset);
      if (onRail && wasRail && a > RAIL_IN + 1e-9 && a >= lastA) railBad++;   // past the rail: only ever moving back in
      wasRail = onRail; lastA = a;
    }
    races++; if (res) finished++;
  }
  check("bot races finish", finished === races, `${races - finished} of ${races} races timed out`);
  check("cars rarely overlap", overlaps / frames < 0.01, `${(100 * overlaps / frames).toFixed(2)}% of frames overlapping`);
  check("rails hold in whole races", railBad === 0, `${railBad} frames past a rail and not coming back in`);
  console.log(`  (overlap ${(100 * overlaps / frames).toFixed(2)}% of ${frames} race frames)`);
  // hands-off still finishes last; the starter car (no upgrades) doesn't win with a kid driving
  const handsOff = [0, 1, 2].map(() => runRace(track("sunny"), zippy, NO_UPS, "normal", "none").place);
  check("hands-off loses", handsOff.every(pl => pl === 6), `hands-off places ${handsOff}`);
}

console.log(failed ? `\n${failed} physics check(s) FAILED (${passed} passed)` : `\nAll ${passed} physics checks passed`);
process.exit(failed ? 1 : 0);
