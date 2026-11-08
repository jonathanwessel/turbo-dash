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

/* ---------- ✨ Simple effects: fewer particles and skid marks, same physics ---------- */
{
  const T = buildTrack(track("autumn")), i = T.segs.findIndex((s, k) => k > 40 && Math.abs(s.curve) > 1.5 && Math.abs(T.segs[k + 25]?.curve) > 1.5);
  const runIt = lite => {
    seed = 999;   // the same random numbers for both runs
    const r = scene("autumn", { from: (i + 1) * SEG - (15 * SEG + SEG * 0.5) }); r.lite = lite;
    r.prevIdx = r.segAt(r.player.dist).index; r.input[T.segs[i].curve > 0 ? "right" : "left"] = true;
    let most = 0; run(r, 1, q => { most = Math.max(most, q.parts.length); for (let k = 0; k < 30; k++) q.parts.push({ x: 0.5, y: 0.5, vx: 0, vy: 0, life: 1, c: "#fff", r: 0.01 }); });
    return { most, skids: r.skids.size, dist: r.player.dist, off: r.player.offset };
  };
  const full = runIt(false), simple = runIt(true);
  check("simple effects cap particles", simple.most <= 90 && full.most > 90, `simple ${simple.most}, full ${full.most}`);
  check("simple effects keep physics", Math.abs(full.dist - simple.dist) < 1e-6 && Math.abs(full.off - simple.off) < 1e-9, "the car drove differently with Simple effects");
}

/* ---------- 🚀 Turbo zoom (view only) ---------- */
{
  const r = scene("sunny", { from: quietStretch("sunny") }), base = r.camDepth;
  r.nitroT = 3; run(r, 1);
  const zoomed = r.camDepth;
  run(r, 2, q => { q.nitroT = 0; q.boostT = 0; });   // (no boost pads either)
  check("turbo zoom", Math.abs(zoomed / base - 0.88) < 0.03 && r.camDepth / base > 0.94 && r.camDepth / base <= 1.001 && r.camDepth > zoomed && Number.isFinite(r.camDepth),   // after Turbo: back to the mild speed zoom (v1.7)
    `zoom ${(zoomed / base).toFixed(3)}, after ${(r.camDepth / base).toFixed(3)}`);
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

/* ---------- 🧸 Toy Track World: a whole race finishes headless, and landings are recorded for the bounce ---------- */
{
  const { toyRace } = await import("./racebot.mjs");
  const toyCar = CARS.find(c => c.id === "toyRacer"), toys = TRACKS.filter(t => t.world === "toy");
  let landings = 0, maxV = 0, done = 0;
  for (const t of toys) {
    const orig = toyRace.land.bind(toyRace);
    toyRace.land = () => { orig(); landings++; maxV = Math.max(maxV, toyRace.player.landV); };
    const res = runRace(t, toyCar, UPS, "normal", "good");
    toyRace.land = orig;
    if (res.time < 400) done++;
  }
  check("toy races finish", done === toys.length, `${toys.length - done} toy races timed out`);
  check("toy landings recorded", landings > 0 && maxV > 0, `landings ${landings}, hardest ${maxV}`);
}

/* ---------- 🏙️ Downtown: squared corners, closed off on the outside, hard but always finishable ---------- */
{
  const { BONUS_TRACKS, BONUS_IDS, FRONTS, GOALS } = await import("../src/data.js");
  const { BLOCK_CURVE, BARRIER, clearTrackCache } = await import("../src/engine.js");
  const dt = BONUS_TRACKS.find(t => t.id === "downtown"), segs = buildTrack(dt).segs;
  const corners = segs.filter((s, i) => Math.abs(s.curve) >= BLOCK_CURVE * 0.5 && Math.abs(segs[i - 1]?.curve || 0) < BLOCK_CURVE * 0.5);
  check("downtown has city-block corners", corners.length >= 10 && segs.some(s => Math.abs(s.curve) >= BLOCK_CURVE * 0.99), `${corners.length} corners`);
  const sharp = segs.filter(s => Math.abs(s.curve) >= BLOCK_CURVE * 0.5);
  check("every corner is closed off outside", sharp.every(s => s.barrier === -Math.sign(s.curve) && !s.rail), "a corner without a barrier on its outside");
  check("trucks and ROAD CLOSED signs", sharp.some(s => s.sprites.some(q => q.type === "dumptruck")) && sharp.some(s => s.sprites.some(q => q.type === "roadclosed")) && sharp.every(s => s.sprites.every(q => Math.sign(q.offset) === s.barrier ? ["dumptruck", "roadclosed"].includes(q.type) : true)), "missing barrier sprites");
  const a = JSON.stringify(segs.map(s => [s.curve, s.barrier, s.sprites.length])); clearTrackCache();
  check("downtown builds the same every time", a === JSON.stringify(buildTrack(dt).segs.map(s => [s.curve, s.barrier, s.sprites.length])), "different on a second build");
  // outside the progression: not in TRACKS, never trophy points
  check("downtown is outside the progression", !TRACKS.some(t => BONUS_IDS.has(t.id)), "a bonus track is in TRACKS");
  const st = { wins: 0, bestD: { "downtown:normal": 1 }, cups: {}, mastery: { "downtown:normal": 50 }, claimed: [], bosses: {}, parent: {}, owned: ["zippy"], ups: {}, research: {}, school: { skills: {} } };
  check("no trophy points from downtown", FRONTS.find(f => f.id === "trophies").have(st) === 0, "downtown medals counted as trophies");
  // races: the barrier always holds; kids finish; a good driver is faster; hands-off is last
  let held = true, times = { kid: [], good: [] }, places = [];
  for (let n = 0; n < 10; n++) for (const bot of ["kid", "good"]) {
    const r = botRace; let res = null;
    r.hooks = { sfx() {}, engine() {}, onFinish: x => { res = x; } };
    r.setup(dt, "race", zippy, statsFor(zippy, UPS, {}, {}), { diff: "normal" });
    for (let k = 0; !res && k < 400 * 60; k++) {
      const p = r.player, edge = bot === "good" ? 0.25 : 0.7;
      r.input.left = p.offset > edge; r.input.right = p.offset < -edge;
      if (bot === "good" || Math.random() < 0.01) r.useNitro();
      r.update(STEP);
      const s = r.segAt(p.dist);
      if (r.state === "race" && s.barrier && p.air <= 0 && p.offset * s.barrier > BARRIER + 0.35) held = false;
    }
    times[bot].push(res ? res.time : 999); if (res) places.push(res.place);
  }
  const avg = l => l.reduce((x, y) => x + y, 0) / l.length;
  check("downtown barriers hold", held, "a car got past a corner barrier");
  check("downtown races finish", [...times.kid, ...times.good].every(t => t < 400), `times ${times.kid.map(Math.round)} / ${times.good.map(Math.round)}`);
  check("downtown rewards good driving", avg(times.good) < avg(times.kid), `good ${avg(times.good).toFixed(1)} s vs kid ${avg(times.kid).toFixed(1)} s`);
  const hands = [0, 1].map(() => runRace(dt, zippy, NO_UPS, "normal", "none"));
  check("downtown hands-off loses", hands.every(h => h.place === 6), `hands-off places ${hands.map(h => h.place)}`);
  console.log(`  (downtown: kid ${avg(times.kid).toFixed(1)} s, good ${avg(times.good).toFixed(1)} s, places ${places.join(" ")})`);
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

/* ---------- 🛣️ v1.7 Feel the Road ---------- */
{
  const { SPRITES } = await import("../src/draw.js");
  const { rubberBand } = await import("../src/physics-common.js");
  // softer bonks: a roadside bump leaves at least 35% of top speed (it used to drop to 15%)
  {
    const r = scene("sunny", { from: quietStretch("sunny") }), p = r.player, here = r.segAt(p.dist).index;
    for (let k = 0; k < 8; k++) r.T.segs[(here + k) % r.T.segs.length].sprites.push({ type: "tree", offset: 1.6 });   // a row of trees just off the road
    p.offset = 1.6; p.speed = BASE_MAX; r.input.left = true; r.steerIn = -1;   // steering back toward the road
    let bonked = false, low = Infinity; run(r, 0.3, q => { if (q.bonkCD > 0) bonked = true; low = Math.min(low, q.player.speed); });
    check("soft bonk when steering back", bonked && low >= BASE_MAX * 0.35 - 1, `bonked ${bonked}, lowest speed ${Math.round(low)} (floor ${BASE_MAX * 0.35})`);
    // nobody steering: the old hard stop, so a hands-off car can't ride the trees to a podium
    const r2 = scene("sunny", { from: quietStretch("sunny") }), p2 = r2.player, here2 = r2.segAt(p2.dist).index;
    for (let k = 0; k < 8; k++) r2.T.segs[(here2 + k) % r2.T.segs.length].sprites.push({ type: "tree", offset: 1.6 });
    p2.offset = 1.6; p2.speed = BASE_MAX; let low2 = Infinity; run(r2, 0.3, q => { low2 = Math.min(low2, q.player.speed); });
    check("hard bonk when nobody steers", low2 <= BASE_MAX * 0.16, `lowest speed ${Math.round(low2)}`);
  }
  // chevrons: before every sharp curve, on the outside, never collidable
  {
    let curves = 0, missing = 0, solid = 0;
    for (const t of TRACKS.filter(x => x.world === "earth")) {
      const segs = buildTrack(t).segs;
      for (let i = 13; i < segs.length; i++) {
        if (Math.abs(segs[i].curve) <= 1.5 || Math.abs(segs[i - 1].curve) > 1.5) continue;
        curves++;
        const out = -Math.sign(segs[i].curve), signs = [3, 6, 9, 12].map(k => segs[i - k].sprites.find(q => q.type.startsWith("chevron")));
        if (!signs.every(q => q && Math.sign(q.offset) === out)) missing++;
        if (signs.some(q => q && SPRITES[q.type].collide)) solid++;
      }
    }
    check("chevrons before sharp curves", curves > 10 && missing === 0 && solid === 0, `${curves} curves, ${missing} without chevrons on the outside, ${solid} solid`);
  }
  // the rubber band fades in: no jump bigger than 0.5% between neighbouring gaps
  {
    let worst = 0;
    for (const df of ["easy", "normal", "hard"]) for (let g = -120; g < 120; g += 0.25) worst = Math.max(worst, Math.abs(rubberBand(g + 0.25, df, 2) - rubberBand(g, df, 2)));
    check("smooth rubber band", worst < 0.005 && rubberBand(0, "normal") === 1 && rubberBand(200, "easy") === 0.8 && rubberBand(-200, "normal") === 1.07, `largest step ${worst.toFixed(4)}`);
  }
  // same race twice (same seed, same inputs) gives the same rival lanes
  {
    const lanes = () => { const r = scene("beach"); for (const c of r.rivals) { c.dist = 0; c.base = BASE_MAX; c.laneT = 0.01; } const out = []; run(r, 6, q => out.push(q.rivals.map(c => c.lane).join())); return out.join("|"); };
    const a = lanes(), b = lanes();
    // scene() builds a new Race each time, so both start at the same race number
    check("seeded rival lanes", a === b && a.length > 0, "rival lanes differ between two identical races");
  }
  // steering: a driver who steers back to the middle (up to full lock) stays on the road through the sharpest normal curve of each world
  {
    const off = [];
    for (const t of TRACKS.filter(x => !x.bonus && x.world !== "toy")) {
      const segs = buildTrack(t).segs; let i = 0, best = 0;
      segs.forEach((s, k) => { if (Math.abs(s.curve) > best && k > 30 && !segs.slice(k - 20, k + 20).some(q => q.ramp || q.gap)) { best = Math.abs(s.curve); i = k; } });
      if (!best) continue;
      const r = scene(t.id, { from: (i - 30) * SEG }), p = r.player; let worst = 0;
      run(r, 2.2, q => { const s = q.segAt(q.player.dist); q.input.axis = clamp01(-q.player.offset * 4); worst = Math.max(worst, Math.abs(q.player.offset)); });
      if (worst > 1.2) off.push(`${t.id} ${worst.toFixed(2)}`);
    }
    check("steer beats the sharpest curve", off.length === 0, `went off the road: ${off.join(", ")}`);
  }
}
function clamp01(v) { return Math.max(-1, Math.min(1, v)); }

/* ---------- 🎥 the camera starts every race on the car (v1.7.1: it used to keep the last race's position) ---------- */
{
  const r = scene("sunny", { from: quietStretch("sunny") });
  r.player.offset = -0.8; run(r, 1);   // the camera follows the car to the left side
  r.setup(track("beach"), "race", zippy, statsFor(zippy, UPS, {}, {}), { diff: "normal" });
  check("camera starts on the car", r.camOff == null || Math.abs(r.camOff - r.player.offset) < 1e-9, `camera at ${r.camOff}, car at ${r.player.offset}`);
}

console.log(failed ? `\n${failed} physics check(s) FAILED (${passed} passed)` : `\nAll ${passed} physics checks passed`);
process.exit(failed ? 1 : 0);
