// Pseudo-3D racing engine: a looping road of short segments (with curves and hills) projected onto the screen.
import { THEMES, RIVALS, PHYSICS, diffOf, MPH } from "./data.js";
import { drawEmojiText } from "./emoji.js";
import { buildToyTrack } from "./toy/track.js";
import { drawCar, drawSprite, drawCoin, drawPearl, drawBackground, drawBox, drawRing, SPRITES, shade, drawSpritePic, drawCarPic, COIN_TOP, RING_TOP, PEARL_TOP, BOX_TOP, CAR_TOP } from "./draw.js";

export const SEG = 200;            // segment length (world units)
import { BASE_MAX, rivalBase, rubberBand, rng as seededRng, strSeed, perStep, homeBonus } from "./physics-common.js";
export { BASE_MAX };   // starter car top speed (world units / s)
const RUMBLE = 3, ROAD_W = 2000, CAM_H = 1000, LANES = 3;   // the draw distance is per quality level (past 60% of it: no lane dashes)
/* picture quality (v1.10, set by the game from how fast this device draws; Settings > Effects can pin it):
   3 full, 2 a little lighter (shorter view, no ice reflections), 1 Simple (shorter view still, every second far
   thing, flat cars, no clouds or far mountains, fewer bits flying). The canvas size per level is set in main.js. */
export const QUALITY = { 3: { dist: 250 }, 2: { dist: 200 }, 1: { dist: 160 } };
export const RAIL_IN = 1.04;   // on a railed curve the car stays inside this (a car that went wide before the rail is guided back in)
const CAM_DEPTH = 1 / Math.tan((100 / 2) * Math.PI / 180);
const PLAYER_Z = CAM_H * CAM_DEPTH;
export const CAR_W = 0.36;         // car width in road half-widths
const COIN_W = 280;
const START = 15;                  // segment of the start/finish line
const GRAVITY = 9000, JUMP_VY = 2700, RAMP_H = 380, RAMP_LEN = 4;
export const BLOCK_CURVE = 16;      // 🏙️ Downtown's squared-off corners (normal tracks curve up to about 4)
export const BARRIER = 1.0;         // the corner barriers hold the car at the road's edge

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const HILL = BASE_MAX * 0.12;                                       // how much hills speed you up / slow you down
const slopeOf = s => (s.p2.world.y - s.p1.world.y) / SEG;            // rise per distance along the road
const jumpFor = speed => 0.8 + 0.2 * Math.min(1.5, speed / BASE_MAX);   // jump strength: 1.0 at a starter's top speed
const lerp = (a, b, t) => a + (b - a) * t;
const easeIn = (a, b, p) => a + (b - a) * p * p;
const easeInOut = (a, b, p) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5);
const mod = (n, m) => ((n % m) + m) % m;
const overlap = (x1, w1, x2, w2) => Math.abs(x1 - x2) < (w1 + w2) / 2;
function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

const trackCache = new Map();
export const clearTrackCache = () => trackCache.clear();   // tests: build a track again from scratch
export function buildTrack(track) {
  if (trackCache.has(track.id)) { const T = trackCache.get(track.id); trackCache.delete(track.id); trackCache.set(track.id, T); return T; }   // most recent last
  const r = rng(track.seed * 7919), th = THEMES[track.theme], segs = [];
  const lastY = () => segs.length ? segs[segs.length - 1].p2.world.y : 0;
  const add = (curve, y) => {
    const n = segs.length;
    segs.push({ index: n, curve, alt: Math.floor(n / RUMBLE) % 2, sprites: [], coins: [], boost: null, boxes: null, finish: false, clip: 0,
      p1: { world: { y: lastY(), z: n * SEG }, camera: {}, screen: {} }, p2: { world: { y, z: (n + 1) * SEG }, camera: {}, screen: {} } });
  };
  const road = (enter, hold, leave, curve, hill) => {
    const y0 = lastY(), y1 = y0 + hill * SEG, total = enter + hold + leave;
    for (let n = 0; n < enter; n++) add(easeIn(0, curve, n / enter), easeInOut(y0, y1, n / total));
    for (let n = 0; n < hold; n++) add(curve, easeInOut(y0, y1, (enter + n) / total));
    for (let n = 0; n < leave; n++) add(easeInOut(curve, 0, n / leave), easeInOut(y0, y1, (enter + hold + n) / total));
  };
  let padN = 0;
  const d = track.diff, cMax = 2.2 + d * 0.45, hMax = 18 + d * 7;
  road(30, 30, 10, 0, 0);
  const target = 1250 + d * 60;
  if (track.layout === "blocks") {
    const corner = dir => road(2, 10, 2, dir * BLOCK_CURVE, 0);
    let turn = 0;
    while (segs.length < target) {
      const k = r(), dir = r() < 0.5 ? -1 : 1;
      road(10, 26 + Math.floor(r() * 26), 6, 0, 0);
      if (k < 0.55) corner(dir);
      else if (k < 0.8) { corner(dir); road(4, 14, 4, 0, 0); corner(-dir); }   // a jog around a block
      else { corner(dir); road(4, 8, 4, 0, 0); corner(dir); }                  // a hairpin around a block
      turn++;
    }
  } else while (segs.length < target) {
    const k = r(), len = 15 + Math.floor(r() * 30), dir = r() < 0.5 ? -1 : 1;
    const c = dir * cMax * (0.5 + r() * 0.5);
    const yNow = lastY() / SEG, hDir = yNow > 50 ? -1 : yNow < -30 ? 1 : (r() < 0.5 ? -1 : 1);
    const h = hDir * hMax * (0.4 + r() * 0.6);
    if (k < 0.15) road(len, len, len, 0, 0);
    else if (k < 0.4) road(len, Math.floor(len * 1.5), len, c, 0);
    else if (k < 0.55) road(len, len, len, 0, h);
    else if (k < 0.8) road(len, len, len, c, h);
    else { road(len, len, len, c, 0); road(len, len, len, -c, h * 0.5); }
  }
  road(50, 50, 50, 0, -lastY() / SEG);
  road(15, 15, 15, 0, 0);

  const types = th.sprites;
  for (let i = 6; i < segs.length; i += 3 + Math.floor(r() * 4)) {
    for (const side of [-1, 1]) if (r() < 0.75) { const type = types[Math.floor(r() * types.length)], away = 1.6 + r() * 2.2; segs[i].sprites.push({ type, offset: side * Math.max(away, 1.32 + 0.56 * SPRITES[type].w / ROAD_W) }); }
  }
  for (const s of [-1, 1]) segs[START + 8].sprites = [{ type: "sign", offset: s * 1.75 }];
  for (const s of segs) if (Math.abs(s.curve) > 1.5) s.rail = true;
  // chevron signs on the outside before every sharp curve, pointing the way it turns (they never block the road)
  if (track.layout !== "blocks") for (let i = 13; i < segs.length; i++) {
    if (Math.abs(segs[i].curve) <= 1.5 || Math.abs(segs[i - 1].curve) > 1.5) continue;
    const out = -Math.sign(segs[i].curve), type = segs[i].curve > 0 ? "chevronR" : "chevronL";
    for (const k of [12, 9, 6, 3]) segs[i - k].sprites.push({ type, offset: out * 1.3 });
  }
  if (track.layout === "blocks") {
    // 🚧 the outside of every corner is closed off: dump trucks and ROAD CLOSED barriers where the road would go straight on
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i]; if (Math.abs(s.curve) < BLOCK_CURVE * 0.5) continue;
      s.rail = false; s.barrier = -Math.sign(s.curve);
      s.sprites = s.sprites.filter(q => Math.sign(q.offset) !== s.barrier);
      if (i % 2 === 0) s.sprites.push({ type: (i >> 1) % 3 === 0 ? "dumptruck" : "roadclosed", offset: s.barrier * 1.6 });
      if (Math.abs(segs[i - 1]?.curve || 0) < BLOCK_CURVE * 0.5) for (let j = 1; j <= 4; j++) if (segs[i - j]) segs[i - j].crosswalk = true;
    }
  }
  for (let i = START + 20; i < segs.length; i += 24) if (!segs[i].rail && !segs[i].barrier) segs[i].sprites.push({ type: "lamp", offset: (i / 24) % 2 ? 1.25 : -1.25 });
  segs[START].finish = segs[START + 1].finish = true;

  for (let i = START + 40; i < segs.length - 25; i += 50 + Math.floor(r() * 45)) {
    const drift = r() < 0.4 ? (r() < 0.5 ? -0.13 : 0.13) : 0;
    let off = [-0.6, 0, 0.6][Math.floor(r() * 3)];
    for (let j = 0; j < 6; j++) { segs[i + j * 3].coins.push({ offset: clamp(off, -0.8, 0.8), taken: false }); off += drift; }
  }
  for (let i = START + 90; i < segs.length - 30; i += 150 + Math.floor(r() * 110)) {
    const lane = [-0.55, 0, 0.55][Math.floor(r() * 3)];
    padN = (padN || 0) + 1;
    for (let j = 0; j < 6; j++) { segs[i + j].boost = lane; segs[i + j].padId = padN; }
  }
  const ph = PHYSICS[track.world] || PHYSICS.earth, GAP = 14;
  for (let i = START + 130; i < segs.length - 60; i += (ph.gaps ? 150 : 200) + Math.floor(r() * (ph.gaps ? 90 : 120))) {
    let k = i;
    const span = RAMP_LEN + 2 + (ph.gaps ? GAP + 4 : 0);
    const ok = k => Math.abs(segs[k].curve) < 0.6 && segs.slice(k - 2, k + span).every(q => q.boost === null && !q.coins.length);
    while (k < segs.length - 60 && !ok(k)) k++;
    if (k >= segs.length - 60) break;
    segs[k].rampStart = true;
    for (let j = 0; j < RAMP_LEN; j++) segs[k + j].ramp = true;
    const lane = [-0.5, 0, 0.5][Math.floor(r() * 3)];
    if (ph.gaps) {
      // low gravity: a gap to jump, a tall arc of coins over it, and two boost rings near the top
      for (let j = 0; j < GAP; j++) segs[k + RAMP_LEN + 1 + j].gap = true;
      for (let j = 0; j < 9; j++) segs[k + RAMP_LEN + 2 + j * 5].coins.push({ offset: lane, taken: false, h: RAMP_H + 1100 * Math.sin(Math.PI * (j + 0.5) / 9) });
      for (const j of [3, 5]) segs[k + RAMP_LEN + 4 + j * 5].coins.push({ offset: -lane || 0.45, taken: false, ring: true, h: RAMP_H + 1000 });
    } else for (let j = 0; j < 7; j++) segs[k + RAMP_LEN + 2 + j * 3].coins.push({ offset: lane, taken: false, h: RAMP_H * 0.6 + 380 * Math.sin(Math.PI * (j + 0.5) / 7) });
    i = k;
  }
  // power-up boxes: a row of three across the road, a few times per lap
  for (let i = START + 70; i < segs.length - 40; i += 170 + Math.floor(r() * 90)) {
    let k = i;
    while (k < segs.length - 40 && segs.slice(k - 3, k + 3).some(q => q.ramp || q.gap || q.boost !== null || q.coins.length)) k++;
    if (k >= segs.length - 40) break;
    segs[k].boxes = [-0.6, 0, 0.6].map(o => ({ offset: o, until: 0 }));
    i = k;
  }
  // 🌊 underwater: long stretches where a current pushes you sideways, and bubble vents that float you up past pearls
  if (ph.currents) for (let i = START + 60; i < segs.length - 80; i += 110 + Math.floor(r() * 90)) {
    const dir = r() < 0.5 ? -1 : 1, len = 40 + Math.floor(r() * 20);
    for (let j = 0; j < len; j++) if (!segs[i + j].ramp && !segs[i + j].gap) segs[i + j].current = dir;
    i += len;
  }
  if (ph.vents) for (let i = START + 110; i < segs.length - 80; i += 140 + Math.floor(r() * 80)) {
    let k = i;
    while (k < segs.length - 80 && segs.slice(k - 3, k + 62).some(q => q.ramp || q.boxes || q.boost !== null || q.coins.length || q.vent != null)) k++;
    if (k >= segs.length - 80) break;
    const lane = [-0.55, 0, 0.55][Math.floor(r() * 3)];
    segs[k].vent = segs[k + 1].vent = lane; segs[k].ventTop = true;
    for (let j = 0; j < 5; j++) { const f = (j + 0.5) / 5; segs[k + 6 + j * 12].coins.push({ offset: lane, taken: false, pearl: true, h: 2340 * f * (1 - f) }); }
    i = k + 62;
  }
  // ❄️ ice: soft snowbanks in one lane. Steer around them, or POOF through them (slowly).
  if (ph.snowbanks) for (let i = START + 80; i < segs.length - 60; i += 70 + Math.floor(r() * 60)) {
    let k = i;
    while (k < segs.length - 60 && segs.slice(k - 4, k + 6).some(q => q.ramp || q.gap || q.boxes || q.boost !== null || q.coins.length || q.snow != null)) k++;
    if (k >= segs.length - 60) break;
    segs[k].snow = [-0.55, 0, 0.55][Math.floor(r() * 3)];
    i = k;
  }
  if (th.tunnels) for (let i = START + 120; i < segs.length - 80; i += 260 + Math.floor(r() * 160)) {
    const len = 20 + Math.floor(r() * 21);
    let k = i;
    const ok = k => segs.slice(k - 6, k + len + 6).every(q => Math.abs(q.curve) < 0.9 && !q.ramp && !q.gap && q.boost === null && !q.finish && !q.rail);
    while (k < segs.length - 80 && !ok(k)) k++;
    if (k >= segs.length - 80) break;
    for (let j = 0; j < len; j++) { const q = segs[k + j]; q.tunnel = true; q.sprites = []; }
    segs[k].tunnelStart = true; segs[k + len - 1].tunnelEnd = true;
    i = k + len;
  }
  const T = { segs, length: segs.length * SEG, theme: th, track };
  trackCache.set(track.id, T);
  while (trackCache.size > 3) trackCache.delete(trackCache.keys().next().value);   // keep the last 3 tracks (v1.11: all of them took ~38 MB)
  return T;
}

/* a lap's length in its own engine's units (Time Trial medal times use it) */
export const trackLen = t => t.world === "toy" ? buildToyTrack(t).L : buildTrack(t).length;

function project(pt, camX, camY, camZ, W, H, F, depth = CAM_DEPTH) {
  pt.camera.x = -camX; pt.camera.y = pt.world.y - camY; pt.camera.z = pt.world.z - camZ;
  const sc = pt.screen.scale = depth / pt.camera.z;
  pt.screen.x = Math.round(W / 2 + sc * pt.camera.x * F);
  pt.screen.y = Math.round(H / 2 - sc * pt.camera.y * F);
  pt.screen.w = Math.round(sc * ROAD_W * F);
}
function quad(ctx, x1, y1, x2, y2, x3, y3, x4, y4) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.closePath(); ctx.fill(); }

/* One race (or the looping demo drive behind the menus).
 * hooks: sfx(name), onFinish({place, coins, time}), engine(speedRatio, boosting) */
export class Race {
  constructor(canvas, hooks) {
    this.canvas = canvas; this.ctx = canvas.getContext("2d"); this.hooks = hooks;
    this.input = { left: false, right: false }; this.t = 0; this.popups = []; this.shake = 0;
  }

  /* opts: { diff: "easy" | "normal" | "hard", helper: 0-2 steering help from Parent Corner } */
  setup(track, mode, car, stats, opts = {}) {
    this.T = buildTrack(track);
    this.diff = diffOf(opts.diff);
    this.phys = PHYSICS[track.world] || PHYSICS.earth;
    this.assist = Math.max(this.diff.assist, opts.helper || 0);   // softer curves (Easy, or the parent helper)
    this.pull = opts.helper || 0;                                   // steering FOR the kid: only if a grown-up turns it on
    this.autoLvl = mode === "race" ? (opts.autoSteer || 0) : 0; this.autoTarget = null;
    for (const s of this.T.segs) { for (const c of s.coins) c.taken = false; if (s.boxes) for (const b of s.boxes) b.until = 0; }
    this.power = null; this.shieldT = 0; this.magnetT = 0; this.parts = [];
    this.hooks.onPower?.(null);
    this.track = track; this.mode = mode; this.stats = stats; this.home = homeBonus(car, track);   // 🏠 v1.11
    this.state = mode === "demo" ? "demo" : "countdown";
    this.count = 3.6; this.raceTime = 0;
    this.startZ = START * SEG + SEG * 0.5;
    this.finishDist = track.laps * this.T.length;
    this.nitro = Math.min(1, 0.35 + (stats.startNitro || 0)); this.nitroT = 0; this.boostT = 0; this.bonkCD = 0; this.bumpCD = 0;
    this.coins = 0; this.popups = []; this.order = []; this.runStats = { stunts: 0, turbos: 0, bams: 0, powers: 0, pads: 0, rings: 0, pearls: 0, drifts: 0 }; this.skyX = 0; this.hillX = 0; this.steerVis = 0;
    const slot = k => ({ dist: -(Math.floor(k / 2) + 1) * 5 * SEG, offset: k % 2 ? 0.45 : -0.45 });
    this.player = { isPlayer: true, def: car, speed: mode === "demo" ? BASE_MAX * 0.7 : 0, finished: false, air: 0, vy: 0, airT: 0, slideV: 0, draftT: 0, landT: 0, landV: 0, ...slot(5) };
    this.drafting = false; this.draftShown = false; this.scrapeCD = 0; this.cornerTip = false;
    this.skids = new Map(); this.camDepth = CAM_DEPTH; this.fastT = 0; this.inTunnel = false; this.lite = this.lite || false; this.quality = this.quality || 3;
    this.driftT = 0; this.steerIn = 0; this.lastSpeed = 0; this.braking = false; this.camOff = null; this.lastBonkT = -9;   // the camera starts centred on the car
    this.raceSeq = (this.raceSeq || 0) + 1; this.rand = seededRng(strSeed(track.id) * 97 + this.raceSeq);   // rival lanes and puddles: seeded
    this.luck = seededRng(strSeed(track.id) * 131 + this.raceSeq + 7);   // power-up picks, boss Turbo timing, puddle shoves (v1.11)
    const d = track.diff;
    this.rivals = RIVALS.map((def, i) => ({
      def, ...slot(i), speed: mode === "demo" ? BASE_MAX * 0.6 : 0, lane: slot(i).offset, laneT: 1 + i, knockT: 0, wobT: 0, finished: false, air: 0, vy: 0,
      base: BASE_MAX * rivalBase(d, i) * (mode === "demo" ? 1 : this.diff.rival) * this.phys.top * (this.phys.rival || 1),   // rival: per world (v1.11)
    }));
    // 👑 boss race: just you and the boss (who fires Turbo every few seconds)
    if (opts.boss) this.rivals = [{ def: opts.boss.def, name: opts.boss.name, ...slot(4), speed: 0, lane: slot(4).offset, laneT: 2, knockT: 0, wobT: 0, finished: false, air: 0, vy: 0,
      base: BASE_MAX * opts.boss.speed * this.diff.rival * this.phys.top, boss: true, btT: 5, bt: 0 }];
    // ⏱️ Time Trial: alone on the road (plus your best run as a see-through ghost); the run is recorded for the next ghost
    this.trial = !!opts.trial; this.ghost = opts.ghost || null; this.rec = { d: [], o: [], a: [] }; this.recT = 0;
    this.ghostDef = { ...car, body: "#cfefff", accent: "#ffffff", rainbow: false, shiny: false, sticker: "none", dirt: 0 };
    if (this.trial) this.rivals = [];
    if (mode === "demo") this.player.dist = 2 * SEG;
    this.prevIdx = this.segAt(this.player.dist).index;
    this.lastPad = null; this.beamT = 0; this.snowHit = null; this.driftT = 0;
    // 🌧️ weather (Earth only, picked by the game): rain brings puddles that splash and nudge you sideways
    this.weather = opts.weather || null; this.puddles = new Map(); this.puddleHit = null;
    if (this.weather === "rain") {
      const segs = this.T.segs;
      for (let i = START + 40; i < segs.length - 20; i += 80 + Math.floor(this.rand() * 60)) {
        const s = segs[i]; if (s.ramp || s.boost !== null || s.boxes || s.gap) continue;
        this.puddles.set(i, [-0.55, 0, 0.55][Math.floor(this.rand() * 3)] + (this.rand() - 0.5) * 0.2);
      }
    }
    if (this.weather && mode !== "demo") this.popup(this.weather === "rain" ? "🌧️ RAINY RACE!" : "🌨️ SNOWY RACE!", "#bfe9ff");
  }

  /* where the ghost was at this moment of its run (samples every 0.1 s), or null once it has finished */
  ghostAt(time) {
    const g = this.ghost; if (!g || !g.d?.length) return null;
    const f = Math.max(0, time / 0.1 - 1), i = Math.floor(f), k = f - i;
    if (i >= g.d.length - 1) return null;
    return { dist: lerp(g.d[i], g.d[i + 1], k), offset: lerp(g.o[i], g.o[i + 1], k), air: lerp(g.a?.[i] || 0, g.a?.[i + 1] || 0, k) };
  }
  segAt(dist) { const s = this.T.segs; return s[Math.floor(mod(this.startZ + dist, this.T.length) / SEG) % s.length]; }
  popup(text, color = "#fff") { this.popups.push({ text, color, age: 0, x: (Math.random() - 0.5) * 0.2 }); }
  /* The Auto Steer brain. Each level band adds a skill (see ROADMAP.md); returns a steer value -1..1. */
  autoSteer(seg) {
    const L = this.autoLvl, p = this.player, segs = this.T.segs, N = segs.length, idx = seg.index;
    let target = clamp(p.offset, -0.65, 0.65);             // 1+: stay on the road
    const look = 8 + Math.floor(L * 0.5);
    // priorities, nearest first within each: boost pads (66+), then ? boxes (46+), then coins (26+)
    const scan = fn => { for (let k = 1; k <= look; k++) { const v = fn(segs[(idx + k) % N]); if (v !== undefined) return v; } };
    let goal = L >= 66 ? scan(s => s.boost !== null ? s.boost : undefined) : undefined;
    const toPad = goal !== undefined;
    if (goal === undefined && L >= 46 && !this.power) goal = scan(s => s.boxes?.find(b => !(b.until > this.t))?.offset);
    if (goal === undefined && L >= 26) goal = scan(s => s.coins.find(c => !c.taken && (!c.h || L >= 46))?.offset);
    if (goal !== undefined) target = goal;
    if (L >= 66 && !(toPad && L >= 100)) for (const c of this.rivals) {                                     // 66+: steer around slower rivals
      const g = c.dist - p.dist;
      if (g > 0 && g < 6 * SEG && c.speed < p.speed && Math.abs(c.offset - target) < CAR_W * 1.1 && this.nitroT <= 0 && this.shieldT <= 0) target = c.offset > 0 ? c.offset - 0.65 : c.offset + 0.65;
    }
    if (L >= 86) {                                                                                          // 86+: smart Turbo and power-ups
      let straight = true; for (let k = 0; k < 25 && straight; k++) straight = Math.abs(segs[(idx + k) % N].curve) < 1.5;
      if (this.nitro >= 1 && straight) this.useNitro();
      if (this.power) this.usePower();
    }
    target = clamp(target, -0.85, 0.85);
    this.autoTarget = target;
    const sp = Math.min(1.4, p.speed / BASE_MAX);
    return clamp((target - p.offset) * (2 + L / 25) + seg.curve * 0.12 * sp * (L / 100), -1, 1);
  }

  /* Power-ups (no weapons): shield, coin shower, mega magnet, super turbo. */
  usePower() {
    if (this.state !== "race" || this.player.finished || !this.power) return false;
    const p = this.power; this.power = null; this.hooks.onPower?.(null); this.runStats.powers++;
    if (p === "shield") { this.shieldT = 5; this.popup("SHIELD!", "#3cf2ff"); this.hooks.sfx("boost"); }
    else if (p === "coins") { this.coins += 8; this.popup("+8 COINS!", "#ffd400"); for (let i = 0; i < 6; i++) setTimeout(() => this.hooks.sfx("coin"), i * 70); }
    else if (p === "magnet") { this.magnetT = 8; this.popup("MEGA MAGNET!", "#ff3fa4"); this.hooks.sfx("boost"); }
    else if (p === "turbo") { this.nitroT = this.stats.nitroTime * 1.6; this.nitroFull = 0;   // a free boost: the tank stays as it is
      this.popup("SUPER TURBO!", "#ff7a00"); this.hooks.sfx("nitro"); }
    return true;
  }
  sparks(x, y, n, color) { for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 1.4, life: 0.5 + Math.random() * 0.3, c: color, r: 0.006 + Math.random() * 0.006 }); }

  /* rubbing a guardrail: held at the rail, a little slower (4% every 0.3 s), sparks fly */
  scrape(side, at, steer, real) {
    const p = this.player;
    p.offset = side * at;
    if (this.scrapeCD > 0) return;
    this.scrapeCD = 0.3;
    if (real) { p.speed *= 0.96; this.hooks.sfx("scrape"); this.shake = Math.max(this.shake, 0.06); }
    for (let k = 0; k < 10; k++) this.parts.push({ x: 0.5 + side * (0.1 + Math.random() * 0.05), y: 0.9 + Math.random() * 0.05, vx: -side * (0.2 + Math.random() * 0.5), vy: -0.3 - Math.random() * 0.5, life: 0.35 + Math.random() * 0.2, c: Math.random() < 0.5 ? "#ffb020" : "#fff3a0", r: 0.004 + Math.random() * 0.004 });
  }

  useNitro() {
    if (this.state !== "race" || this.player.finished || this.nitro < 1) return false;
    this.nitro = 0; this.nitroT = this.nitroFull = this.stats.nitroTime; this.hooks.sfx("nitro"); this.runStats.turbos++; this.popup("TURBO!", "#ffd400"); return true;
  }

  update(dt) {
    this.t += dt;
    const p = this.player, S = this.stats, h = this.hooks;
    for (const q of this.popups) q.age += dt;
    this.popups = this.popups.filter(q => q.age < 1);
    this.shake = Math.max(0, this.shake - dt);

    if (this.state === "countdown") {
      const before = Math.ceil(this.count - 0.6);
      this.count -= dt;
      const now = Math.ceil(this.count - 0.6);
      if (now !== before && now > 0) h.sfx("beep");
      if (this.count <= 0.6) { this.state = "race"; h.sfx("go"); if (this.home > 1 && this.mode === "race") this.popup("🏠 HOME BONUS!", "#ffd400"); }
      h.engine(0.05, false);
      return;
    }
    const racing = this.state === "race";
    if (racing) this.raceTime += dt;

    // player
    const auto = this.state === "demo" || p.finished;
    const seg = this.segAt(p.dist);
    let steer;
    if (auto) steer = clamp((-seg.curve * 0.06 - p.offset) * 2, -1, 1);
    else steer = !this.input.left && !this.input.right && Number.isFinite(this.input.axis) ? this.input.axis : (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    // Auto Steer: only when Carter isn't steering. Its strength grows with its level; at 100 it's perfect.
    this.autoTarget = null;
    if (!auto && steer === 0 && this.autoLvl > 0 && this.state === "race") steer = this.autoSteer(seg) * (0.15 + 0.85 * this.autoLvl / 100);
    this.steerVis += (steer - this.steerVis) * Math.min(1, dt * 10);
    const fast = this.nitroT > 0 || this.boostT > 0;
    const ph = this.phys;
    // ❄️ cars that aren't made for ice (no ❄️ in the garage) spin their wheels a little on the Glacier Rink
    const draft = this.drafting && !auto && !fast;
    // Downtown: like the rivals, the car eases off for a city-block corner (there's no brake pedal)
    const corner = this.track.layout === "blocks" && !auto && (Math.abs(seg.curve) > BLOCK_CURVE * 0.5 || Math.abs(this.segAt(p.dist + 5 * SEG).curve) > BLOCK_CURVE * 0.5);
    const top = (auto ? BASE_MAX * (p.finished ? 0.5 : 0.75) : S.maxSpeed * (fast ? 1.25 : 1) * (corner ? 0.86 : 1) * this.home * (draft ? 1.06 : 1)) * ph.top;
    if (p.speed < top) p.speed = Math.min(top, p.speed + S.accel * this.home * ph.accel * (ph.water ? S.propel || 1 : 1) * (ph.ice ? S.warm || 1 : 1) * (fast ? 3 : draft ? 1.3 : 1) * dt);
    else p.speed = Math.max(top, p.speed - BASE_MAX * 0.6 * dt);
    const flying = p.air > 0;
    // hills: rolling downhill speeds you up a little, climbing slows you a little (rivals feel it too)
    if (!flying && !auto) { const hill = slopeOf(seg) * HILL * dt; if (hill) p.speed = Math.max(Math.min(p.speed, BASE_MAX * 0.2), p.speed - hill); }
    // off the road: grass slows you (scraping along a rail is the rail's own cost, not grass)
    if (!flying && Math.abs(p.offset) > (seg.rail ? RAIL_IN + 0.01 : 1) && p.speed > BASE_MAX * 0.35) p.speed = Math.max(BASE_MAX * 0.35, p.speed - BASE_MAX * 1.2 * dt);
    const sp = Math.min(1.4, p.speed / BASE_MAX), dx = dt * 2.2 * sp;
    // steering still bites when slow (after a bump); the input eases in over 0.1 s so taps aren't twitchy
    this.steerIn += (steer - this.steerIn) * (auto ? 1 : Math.min(1, dt / 0.1));
    const steerDx = dt * 2.2 * Math.max(sp, 0.35 + 0.65 * sp);   // a floor when slow; unchanged at speed (curves need it)
    const lat = this.steerIn * steerDx * (auto ? 1 : S.handling) * (flying ? ph.air * (S.airCtl || 1) : 1);
    const help = this.assist;   // 0 none, 1 a little, 2 lots
    if (ph.ice && !auto && !flying && dt > 0) {
      // ❄️ on ice the car keeps sliding: steering changes where you're GOING, not where you are.
      // Snow Chains (and the steering helper) make the tires bite sooner.
      const bite = Math.min(1, dt * (3 + 9 * Math.min(1, (S.studs || 0) + 0.15 * help)));
      p.slideV += (lat / dt - p.slideV) * bite; p.offset += p.slideV * dt;
    } else { p.offset += lat; p.slideV = dt > 0 ? lat / dt : 0; }
    // ❄️ drift: steer INTO an ice curve for a moment, then let go (or reach the end of the curve) for a DRIFT BOOST
    if (ph.drift && !auto && racing) {
      const into = !flying && Math.abs(seg.curve) > 1 && steer !== 0 && Math.sign(steer) === Math.sign(seg.curve);
      if (into) {
        this.driftT += dt;
        const ready = this.driftT >= 0.8;
        for (let k = perStep(0.8, dt); k > 0; k--) this.parts.push({ x: 0.5 - Math.sign(steer) * (0.06 + Math.random() * 0.08), y: 0.96, vx: -Math.sign(steer) * (0.1 + Math.random() * 0.25), vy: -0.2 - Math.random() * 0.25, life: 0.55, c: ready ? (Math.random() < 0.5 ? "#3cf2ff" : "#ff8ad8") : "#ffffff", r: 0.005 + Math.random() * 0.007 });
      } else if (this.driftT > 0) {
        if (this.driftT >= 0.8) {
          this.boostT = Math.max(this.boostT, (0.45 + 0.45 * Math.min(1, (this.driftT - 0.8) / 1.5)) * (S.driftPow || 1));
          this.popup("DRIFT BOOST!", "#9fe8ff"); h.sfx("boost"); this.runStats.drifts++;
        }
        this.driftT = 0;
      }
    }
    // the curve pushes the car outward. Downtown's squared-off corners look far sharper than any normal curve but
    // push only a little harder than a sharp one, so steering into them can always hold the line (other tracks unchanged)
    const ac = Math.abs(seg.curve), pushCurve = this.track.layout === "blocks" && ac > 4 ? Math.sign(seg.curve) * (4 + (ac - 4) * 0.25) : seg.curve;   // Downtown only
    if (!flying) p.offset -= dx * sp * pushCurve * 0.15 * (1 - S.grip) * (1 - 0.25 * help) / ph.grip * (this.weather ? 1.08 : 1);
    // skid marks and tire smoke: turning hard into a sharp curve at speed, sliding on ice, or drifting
    const skid = !flying && !auto && racing && p.speed > BASE_MAX * 0.5 && ((Math.abs(steer) > 0.6 && Math.abs(seg.curve) > 1.2 && Math.sign(steer) === Math.sign(seg.curve)) || Math.abs(p.slideV) > 1.7 || this.driftT > 0.2);
    if (skid) {
      if (!this.skids.has(seg.index)) { this.skids.set(seg.index, { x: p.offset, t: this.t }); if (this.skids.size > (this.lite ? 150 : 400)) this.skids.delete(this.skids.keys().next().value); }
      if (!this.lite) for (let k = perStep(0.5, dt); k > 0; k--) for (const side of [-1, 1]) this.parts.push({ x: 0.5 + side * 0.09, y: 0.97, vx: side * 0.05 + (Math.random() - 0.5) * 0.1, vy: -0.12 - Math.random() * 0.1, life: 0.7, c: "smoke", r: 0.012 + Math.random() * 0.01 });
    }
    // 🚀 Turbo zoom: the camera pulls in and widens a little while boosting (view only)
    this.fastT = fast ? this.fastT + dt : 0;
    this.camDepth += ((fast ? CAM_DEPTH * 0.88 : CAM_DEPTH * (1 - 0.05 * clamp(sp - 0.5, 0, 0.9) / 0.9)) - this.camDepth) * Math.min(1, dt * 3);
    this.camOff = this.camOff == null ? p.offset : this.camOff + (p.offset - this.camOff) * Math.min(1, dt / 0.1);   // the camera trails a little: you see the car slide
    this.braking = p.speed < this.lastSpeed - BASE_MAX * 0.25 * dt; this.lastSpeed = p.speed;
    // gentle pull back toward the road (stronger with steering help)
    if (!auto && steer === 0 && this.pull > 0 && Math.abs(p.offset) > 0.8 - 0.15 * this.pull) p.offset -= Math.sign(p.offset) * dt * (0.3 + 0.4 * this.pull);
    if (!flying && seg.current && !p.finished) p.offset += seg.current * dt * 1.0 * (1 - (S.fins || 0));
    p.offset = clamp(p.offset, -2.6, 2.6);
    this.scrapeCD -= dt; p.landT -= dt;
    if (seg.barrier && !flying && p.offset * seg.barrier > BARRIER) {
      const a = Math.abs(p.offset);
      p.offset = seg.barrier * (a - BARRIER < 0.1 ? BARRIER : Math.max(BARRIER, a - dt * 4));
      if (this.bonkCD <= 0 && !auto) {
        this.bonkCD = 0.6; p.speed *= 0.88; this.shake = Math.max(this.shake, 0.25); h.sfx("bonk"); this.popup("BONK!", "#ffffff");
        this.sparks(0.5 + seg.barrier * 0.1, 0.88, 10, "#ffb020");
        if (!this.cornerTip) { this.cornerTip = true; setTimeout(() => this.popup("Steer early into the corners!", "#ffd400"), 500); }
      }
    }
    if (seg.rail && !flying) {
      const a = Math.abs(p.offset), side = Math.sign(p.offset) || 1;
      // right at the rail: held there. Wide out on the grass when the rail starts: slid back onto the road quickly.
      if (a > RAIL_IN) this.scrape(side, a - RAIL_IN < 0.08 ? RAIL_IN - 0.02 : Math.max(RAIL_IN - 0.02, a - dt * 4), steer, !auto);
    }
    p.dist += p.speed * dt;
    if (this.trial && racing && !p.finished) {
      this.recT += dt;
      while (this.recT >= 0.1) { this.recT -= 0.1; this.rec.d.push(Math.round(p.dist)); this.rec.o.push(Math.round(p.offset * 100) / 100); this.rec.a.push(Math.round(p.air)); }
    }
    if (flying) {
      // exact for constant gravity, so a jump peaks at the same height whatever the step size (v1.11)
      const g = GRAVITY * ph.gravity; p.air += p.vy * dt - 0.5 * g * dt * dt; p.vy -= g * dt; p.airT += dt;
      if (p.air <= 0) this.land();
    }
    // missed the jump over a gap? A friendly tractor beam floats you across (slowly). No crashes.
    if (p.air <= 0 && this.segAt(p.dist).gap) {
      p.air = 1; p.vy = JUMP_VY * 0.55; p.airT = -9; p.speed = Math.min(p.speed, BASE_MAX * 0.5);
      if (this.state === "race" || this.state === "done") { this.popup("TRACTOR BEAM!", "#9fe8ff"); h.sfx("boost"); }
      this.beamT = 1.6;
    }
    this.beamT = (this.beamT || 0) - dt;
    const moved = p.speed * dt / SEG;
    this.skyX = mod(this.skyX + 0.0012 * seg.curve * moved, 1);
    this.hillX = mod(this.hillX + 0.0025 * seg.curve * moved, 1);

    // everything the car drove over this frame
    const segs = this.T.segs, N = segs.length, cur = this.segAt(p.dist).index;
    let i = this.prevIdx, guard = 0;
    const ahead = mod(cur - i, N);
    if (ahead > N / 2) i = cur;   // moved backwards (a bump): nothing new was driven over
    while (i !== cur && guard++ < 30) { i = (i + 1) % N; this.touch(segs[i]); }
    this.touch(segs[cur]);
    this.prevIdx = cur;

    if (racing && !p.finished) this.nitro = Math.min(1, this.nitro + S.nitroFill * dt);
    this.nitroT -= dt; this.boostT -= dt; this.bonkCD -= dt; this.bumpCD -= dt; this.shieldT -= dt; this.magnetT -= dt;
    // little effects in screen units (0..1): dust off the road
    if (Math.abs(p.offset) > 1 && p.air <= 0 && p.speed > BASE_MAX * 0.2) for (let k = perStep(0.8, dt); k > 0; k--) this.parts.push({ x: 0.5 + (Math.random() - 0.5) * 0.22, y: 0.97, vx: (Math.random() - 0.5) * 0.3, vy: -0.25 - Math.random() * 0.2, life: 0.6, c: "dust", r: 0.02 + Math.random() * 0.02 });
    if (this.autoTarget !== null && this.autoLvl >= 100) for (let i = perStep(2, dt); i > 0; i--) this.parts.push({ x: 0.5 + (Math.random() - 0.5) * 0.12, y: 0.95, vx: (Math.random() - 0.5) * 0.2, vy: 0.1 + Math.random() * 0.2, life: 0.5, c: Math.random() < 0.5 ? "#ffd400" : "#fff6a8", r: 0.006 + Math.random() * 0.006 });
    if (ph.water && p.speed > BASE_MAX * 0.2) for (let k = perStep(0.45, dt); k > 0; k--) this.parts.push({ x: 0.5 + (Math.random() - 0.5) * 0.14, y: 0.93, vx: (Math.random() - 0.5) * 0.08, vy: -0.15 - Math.random() * 0.2, life: 0.9, c: "bubble", r: 0.005 + Math.random() * 0.009 });
    for (const q of this.parts) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += (q.c === "bubble" || q.c === "smoke" ? (q.c === "smoke" ? -0.1 : -0.4) : 0.8) * dt; }
    this.parts = this.parts.filter(q => q.life > 0);
    if (this.lite && this.parts.length > 40) this.parts.splice(0, this.parts.length - 40);   // ✨ Simple effects: fewer bits flying

    // rivals
    const d = this.track.diff;
    let behindOne = false;
    for (const c of this.rivals) {
      const g0 = c.dist - p.dist;
      if (this.state === "race" && !p.finished && g0 > SEG && g0 < 8 * SEG && Math.abs(c.offset - p.offset) < CAR_W && p.air <= 0 && c.air <= 0) behindOne = true;
    }
    p.draftT = behindOne ? p.draftT + dt : 0;
    const wasDrafting = this.drafting;
    this.drafting = p.draftT >= 0.4;
    if (this.drafting && !wasDrafting) { h.sfx("draft"); if (!this.draftShown) { this.draftShown = true; this.popup("💨 DRAFT!", "#dff6ff"); } }
    for (const c of this.rivals) {
      let target = c.base;
      if (this.state !== "demo" && this.rivals.some(o => o !== c && o.dist - c.dist > SEG && o.dist - c.dist < 8 * SEG && Math.abs(o.offset - c.offset) < CAR_W && !o.air && !c.air)) target *= 1.03;
      if (c.boss) { c.btT -= dt; c.bt -= dt; if (c.btT <= 0) { c.bt = 2; c.btT = 8 + this.luck() * 3; } if (c.bt > 0) target *= 1.2; }
      else if (this.state === "demo") target = c.base * 0.95;
      else {
        target *= rubberBand((c.dist - p.dist) / SEG, this.diff.id, d);
      }
      c.knockT -= dt; c.wobT -= dt;
      if (this.track.layout === "blocks" && this.state !== "demo") { const cs = this.segAt(c.dist + 6 * SEG); if (Math.abs(cs.curve) > BLOCK_CURVE * 0.5 || Math.abs(this.segAt(c.dist).curve) > BLOCK_CURVE * 0.5) target *= 0.92; }
      if (c.knockT > 0) target *= 0.75;
      c.speed += clamp(target - c.speed, -BASE_MAX * dt / 2, BASE_MAX * dt / 4);
      if (c.air <= 0 && this.state !== "demo") { const hill = slopeOf(this.segAt(c.dist)) * HILL * dt; if (hill) c.speed = Math.max(Math.min(c.speed, BASE_MAX * 0.2), c.speed - hill); }
      c.laneT -= dt;
      if (c.laneT <= 0) { c.lane = [-0.6, 0, 0.6][Math.floor(this.rand() * 3)]; c.laneT = 2 + this.rand() * 4; }
      for (const o of [p, ...this.rivals]) {
        if (o === c) continue;
        const g = o.dist - c.dist;
        if (g > 0 && g < 8 * SEG && c.speed > o.speed && Math.abs(o.offset - c.lane) < CAR_W * 1.2) c.lane = clamp(o.offset > 0 ? o.offset - 0.62 : o.offset + 0.62, -0.8, 0.8);
      }
      c.offset += clamp(c.lane - c.offset, -1, 1) * dt * 1.6;
      for (const o of this.rivals) {
        if (o === c || Math.abs(o.dist - c.dist) > SEG * 0.9 || Math.abs((o.air || 0) - (c.air || 0)) > 250) continue;
        const dx = c.offset - o.offset, need = CAR_W * 0.95 - Math.abs(dx);
        if (need > 0) {
          const dir = dx > 0 || (dx === 0 && c.dist > o.dist) ? 1 : -1, k = Math.min(need, dt * 2.5) / 2;
          c.offset = clamp(c.offset + dir * k, -0.9, 0.9); o.offset = clamp(o.offset - dir * k, -0.9, 0.9);
          if (Math.abs(c.lane - o.lane) < CAR_W) c.lane = clamp(c.lane + dir * 0.6, -0.8, 0.8);
        }
      }
      c.dist += c.speed * dt;
      if (c.air > 0) { const g = GRAVITY * this.phys.gravity; c.air += c.vy * dt - 0.5 * g * dt * dt; c.vy -= g * dt; if (c.air <= 0) c.air = c.vy = 0; }
      else if (this.segAt(c.dist).ramp && c.speed > BASE_MAX * 0.3) { c.air = 1; c.vy = JUMP_VY * jumpFor(c.speed); }
      else if (this.segAt(c.dist).gap) { c.air = 1; c.vy = JUMP_VY * 0.55; c.speed *= 0.7; }
      else if (this.segAt(c.dist).vent != null && Math.abs(c.offset - this.segAt(c.dist).vent) < 0.4) { c.air = 1; c.vy = JUMP_VY * 0.85; }
      else { const rs = this.segAt(c.dist); if (rs.snow != null && c.snowAt !== rs.index && Math.abs(c.offset - rs.snow) < 0.4) { c.snowAt = rs.index; c.speed *= 0.88; } }
      if (this.state !== "demo" && !c.finished && c.dist >= this.finishDist) { c.finished = true; this.order.push(c); }

      // bumping into each other
      const g = c.dist - p.dist;
      if (this.state !== "demo" && Math.abs(p.air - c.air) < 250 && Math.abs(g) < SEG * 0.9 && overlap(p.offset, CAR_W, c.offset, CAR_W * 0.9)) {
        if (fast || this.shieldT > 0) {
          if (c.knockT <= 0) {
            this.sparks(0.5, 0.78, 14, "#ffd400");
            c.offset += (c.offset >= p.offset ? 1 : -1) * 0.7; c.lane = clamp(c.offset, -0.8, 0.8); c.knockT = 1;
            this.popup("BAM!", "#ff6b3d"); h.sfx("bam"); this.shake = 0.2; this.runStats.bams++;
          }
        } else if (Math.abs(g) < SEG * 0.45) {
          // side by side: the rival gets nudged aside and wobbles. Only steering INTO it costs a little speed (1%).
          const dir = p.offset >= c.offset ? 1 : -1, into = steer !== 0 && Math.sign(steer) === -dir;
          p.offset += dir * 0.06 * dt * 60; c.offset -= dir * 0.21 * dt * 60; c.lane = clamp(c.offset - dir * 0.2, -0.8, 0.8); c.wobT = 0.5;
          if (this.bumpCD <= 0) { h.sfx("bump"); this.bumpCD = 0.4; if (into) { p.speed *= 0.99; c.speed *= 0.99; } this.sparks(0.5 - dir * 0.08, 0.86, 8, "#fff6a8"); }
        } else if (g > 0 && p.speed > c.speed) {
          // catching a slower car from behind: ease off (no wall), stay behind it, and slide a little to get around
          p.speed = Math.max(c.speed * 0.97, p.speed - BASE_MAX * 3 * dt); p.dist = c.dist - SEG * 0.9;
          p.offset += (p.offset >= c.offset ? 1 : -1) * dt * 0.8;
          if (this.bumpCD <= 0) { h.sfx("bump"); this.bumpCD = 0.4; this.sparks(0.5, 0.78, 8, "#fff6a8"); }
        } else if (g <= 0 && c.speed > p.speed) { c.speed = Math.min(c.speed, p.speed * 0.97); c.dist = p.dist - SEG * 0.9; }
      }
    }

    if (racing && p.dist >= this.finishDist) {
      p.finished = true; this.state = "done"; this.order.push(p);
      // everyone's place: finishers in order, then the rest by how far they got. 0 = player, 1-5 = rivals
      const rest = this.rivals.filter(c => !c.finished).sort((a, b) => b.dist - a.dist);
      const standings = [...this.order, ...rest].map(r => r === p ? 0 : this.rivals.indexOf(r) + 1);
      h.onFinish({ place: this.order.length, coins: this.coins, time: this.raceTime, stats: this.runStats, standings, rec: this.trial ? this.rec : null });
    }
    this.inTunnel = !!this.segAt(p.dist).tunnel;
    h.engine(p.speed / BASE_MAX, fast, this.inTunnel);
  }

  touch(s) {
    const p = this.player, S = this.stats;
    if (this.state === "demo" || p.finished) return;
    const pud = this.puddles.get(s.index);
    if (pud !== undefined && p.air <= 0 && this.puddleHit !== s.index && Math.abs(p.offset - pud) < 0.36) {
      // SPLASH: a little slide sideways and a spray of water (a small slowdown, never a crash)
      this.puddleHit = s.index; p.offset += (this.luck() < 0.5 ? -1 : 1) * 0.14; p.speed *= 0.97;
      for (let k = 0; k < 14; k++) this.parts.push({ x: 0.5 + (Math.random() - 0.5) * 0.25, y: 0.95, vx: (Math.random() - 0.5) * 0.7, vy: -0.4 - Math.random() * 0.3, life: 0.6, c: "#cdeeff", r: 0.006 + Math.random() * 0.008 });
      this.hooks.sfx("bump"); this.popup("SPLASH!", "#9fe8ff");
    }
    if (s.ramp && p.air <= 0 && p.speed > BASE_MAX * 0.3) {
      p.air = 1; p.vy = JUMP_VY * (this.stats.jump || 1) * jumpFor(p.speed); p.airT = 0; this.hooks.sfx("jump");
    }
    if (s.vent != null && p.air <= 0 && Math.abs(p.offset - s.vent) < 0.4) {
      p.air = 1; p.vy = JUMP_VY * 0.85; p.airT = 0; this.hooks.sfx("jump"); this.popup("BUBBLES!", "#bff6ff");
    }
    if (s.snow != null && p.air < 150 && this.snowHit !== s.index + ":" + Math.floor(p.dist / this.T.length) && Math.abs(p.offset - s.snow) < 0.22 + CAR_W * 0.5) {
      this.snowHit = s.index + ":" + Math.floor(p.dist / this.T.length);
      if (this.shieldT <= 0 && this.nitroT <= 0) p.speed *= Math.min(0.9, 0.62 + (S.plow || 0));
      for (let k = 0; k < 18; k++) this.parts.push({ x: 0.5 + (Math.random() - 0.5) * 0.3, y: 0.9, vx: (Math.random() - 0.5) * 0.6, vy: -0.4 - Math.random() * 0.4, life: 0.7, c: "#ffffff", r: 0.008 + Math.random() * 0.012 });
      this.shake = Math.max(this.shake, 0.15); this.hooks.sfx("bonk"); this.popup("POOF!", "#ffffff");
    }
    for (const c of s.coins) {
      if (c.pearl) {
        if (!c.taken && p.air > 120 && Math.abs(c.offset - p.offset) < CAR_W * 0.5 + 0.15 + S.magnet + (S.pearlReach || 0) + (this.magnetT > 0 ? 1.4 : 0)) {
          c.taken = true; this.coins += 5; this.runStats.pearls = (this.runStats.pearls || 0) + 1; this.hooks.sfx("coin"); this.popup("PEARL! +5", "#ffc8f0");
        }
        continue;
      }
      if (c.ring) {
        if (!c.taken && p.air > 300 && Math.abs(c.offset - p.offset) < 0.5 + (S.ringReach || 0)) {
          c.taken = true; this.boostT = Math.max(this.boostT, 1.4); this.runStats.rings = (this.runStats.rings || 0) + 1;
          this.popup("RING BOOST!", "#3cf2ff"); this.hooks.sfx("boost");
        }
        continue;
      }
      const reach = c.h ? p.air > 120 : p.air < 200;
      if (!c.taken && reach && Math.abs(c.offset - p.offset) < CAR_W * 0.5 + 0.1 + S.magnet + (this.magnetT > 0 ? 1.4 : 0)) {
        c.taken = true; this.coins++; this.nitro = Math.min(1, this.nitro + 0.012); this.hooks.sfx("coin");
        if (this.coins % 5 === 0) this.popup("+" + this.coins, "#ffd400");
      }
    }
    if (s.boxes && p.air < 200) for (const b of s.boxes) {
      if (b.until > this.t || Math.abs(b.offset - p.offset) > CAR_W * 0.5 + 0.12) continue;
      b.until = this.t + 6;
      if (!this.power) {
        const r = this.luck();
        this.power = r < 0.3 ? "shield" : r < 0.55 ? "coins" : r < 0.8 ? "magnet" : "turbo";
        this.hooks.onPower?.(this.power); this.hooks.sfx("chest"); this.popup("?!", "#ffffff");
      }
    }
    if (s.boost !== null && p.air < 150 && Math.abs(p.offset - s.boost) < 0.36) {
      if (this.boostT <= 0.3) { this.hooks.sfx("boost"); this.popup("BOOST!", "#3cf2ff"); }
      const key = s.padId + ":" + Math.floor(p.dist / this.T.length);
      if (key !== this.lastPad) { this.lastPad = key; this.runStats.pads++; }
      this.boostT = 1.2;
    }
    if (p.air <= 0 && Math.abs(p.offset) > 1 && this.bonkCD <= 0 && this.shieldT <= 0) {
      for (const spr of s.sprites) {
        const info = SPRITES[spr.type];
        if (info.collide && overlap(p.offset, CAR_W, spr.offset, info.w / ROAD_W * 0.6)) {
          // a slip while steering back to the road is a bump, not a wall; nobody steering (or bumping again within
          // 2 s, driving through the trees) is the old hard stop
          const again = this.t - (this.lastBonkT ?? -9) < 2; this.lastBonkT = this.t;
          const trying = Math.abs(this.steerIn) > 0.2 && Math.sign(this.steerIn) === -Math.sign(p.offset), soft = trying && !again;
          const floor = (soft ? 0.35 : 0.15) + 0.1 * this.assist + (this.stats.bumper || 0);
          p.speed = Math.min(p.speed, soft ? Math.max(BASE_MAX * floor, p.speed * 0.6) : BASE_MAX * floor);
          p.offset += spr.offset > p.offset ? -0.25 : 0.25;
          this.shake = 0.35; this.bonkCD = 0.6; this.hooks.sfx("bonk"); this.popup("BONK!", "#ffffff");
          break;
        }
      }
    }
  }

  land() {
    const p = this.player;
    p.landV = Math.max(0, -p.vy); p.landT = 0.35;
    p.air = 0; p.vy = 0;
    if (p.landV > JUMP_VY * 0.8) for (let k = 0; k < 12; k++) this.parts.push({ x: 0.5 + (Math.random() - 0.5) * 0.3, y: 0.97, vx: (Math.random() - 0.5) * 0.8, vy: -0.2 - Math.random() * 0.25, life: 0.6, c: "dust", r: 0.02 + Math.random() * 0.02 });
    if (this.state === "demo" || p.finished) return;
    this.hooks.sfx("land"); this.shake = Math.max(this.shake, 0.15);
    if (p.airT > 0.35 && !p.finished) {
      this.coins += 3; this.runStats.stunts++; this.boostT = Math.max(this.boostT, 0.9); this.nitro = Math.min(1, this.nitro + 0.1);
      this.popup(["STUNT!", "AIR TIME!", "WHOOSH!", "AWESOME!"][Math.floor(Math.random() * 4)], "#5be36a");
    }
  }

  hud() {
    const p = this.player, all = [p, ...this.rivals];
    const pos = p.finished ? this.order.indexOf(p) + 1 : 1 + this.rivals.filter(c => c.dist > p.dist).length;
    return {
      state: this.state, count: Math.ceil(this.count - 0.6), pos, total: all.length, trial: this.trial, time: this.raceTime,
      lap: clamp(Math.floor(Math.max(0, p.dist) / this.T.length) + 1, 1, this.track.laps), laps: this.track.laps,
      coins: this.coins, nitro: this.nitro, nitroOn: this.nitroT > 0, tankBurn: this.nitroT > 0 && this.nitroFull ? Math.min(1, this.nitroT / this.nitroFull) : null, speed: Math.round(p.speed / 50), mph: Math.max(0, Math.round(p.speed / BASE_MAX * MPH)),
      progress: all.map(r => ({ f: clamp(r.dist / this.finishDist, 0, 1), color: r.def.body, me: r === p })),
    };
  }

  render() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height, F = H / 2;
    const { segs, length: L, theme: th } = this.T, N = segs.length, p = this.player, t = this.t;
    const depth = this.camDepth || CAM_DEPTH, playerZ = CAM_H * depth, q = this.quality || 3;
    const DRAW_DIST = (QUALITY[q] || QUALITY[3]).dist, FAR = DRAW_DIST * 0.6;
    const carZ = mod(this.startZ + p.dist, L), camZ = mod(carZ - playerZ, L);
    const base = segs[Math.floor(camZ / SEG) % N], basePct = (camZ % SEG) / SEG;
    const pseg = segs[Math.floor(carZ / SEG) % N], ppct = (carZ % SEG) / SEG;
    const playerY = lerp(pseg.p1.world.y, pseg.p2.world.y, ppct);

    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * H * 0.03 * this.shake * 3, (Math.random() - 0.5) * H * 0.03 * this.shake * 3);
    // the far scenery sinks a little as you climb and rises as you drop, so hills feel like hills
    const yMid = this.T.yMid ?? (this.T.yMid = (Math.min(...segs.map(s => s.p1.world.y)) + Math.max(...segs.map(s => s.p1.world.y))) / 2);
    const bgLift = clamp((playerY - yMid) * H * 0.000008, -H * 0.08, H * 0.08);

    // project the road first (v1.10): every road piece paints grass across the whole width, so below the far end
    // of the road nothing of the sky or the hills would ever be seen. The background is only painted above it.
    let maxy = H, x = 0, dx = -(base.curve * basePct), low = 0;
    const camOff = this.camOff ?? p.offset, camX = camOff * ROAD_W, camY = playerY + CAM_H + p.air * 0.55;
    const carShift = (p.offset - camOff) * H;   // how far the car sits from the screen centre (road half-width at the car is H px)
    const shown = this.shown || (this.shown = []); shown.length = 0;
    const drawn = this.drawn || (this.drawn = { sprites: 0, pics: 0, skipped: 0 }); drawn.sprites = drawn.pics = drawn.skipped = 0;   // for scripts/perf.mjs
    for (let n = 0; n < DRAW_DIST; n++) {
      const s = segs[(base.index + n) % N], cz = camZ - (s.index < base.index ? L : 0);
      s.clip = maxy;
      project(s.p1, camX - x, camY, cz, W, H, F, depth);
      project(s.p2, camX - x - dx, camY, cz, W, H, F, depth);
      x += dx; dx += s.curve;
      if (s.p1.camera.z <= depth || s.p2.screen.y >= s.p1.screen.y || s.p2.screen.y >= maxy) continue;
      if (!shown.length) low = s.p1.screen.y;
      shown.push(n); maxy = s.p2.screen.y;   // the far edge: nothing behind a hill crest draws over the road in front
    }
    const bgBottom = shown.length && low >= H - 1 ? Math.min(H, Math.ceil(maxy) + 2) : H;
    this.bgBottom = bgBottom;
    if (bgBottom < H) { ctx.save(); ctx.beginPath(); ctx.rect(-W, -H, W * 3, bgBottom + H); ctx.clip(); }
    drawBackground(ctx, W, H, th, this.skyX, this.hillX, bgLift, t, this.lite);
    if (bgBottom < H) ctx.restore();
    this.drawRoad(ctx, shown, segs, base.index, th, W, DRAW_DIST, FAR);

    // rivals by segment (on ice only the two nearest get a reflection)
    this.nearTwo = this.T.theme.ice && q >= 3 ? [...this.rivals].sort((a, b) => Math.abs(a.dist - p.dist) - Math.abs(b.dist - p.dist)).slice(0, 2) : [];
    const bySeg = this.bySeg || (this.bySeg = new Map()), behind = []; bySeg.clear();
    for (const c of this.rivals) {
      const z = mod(this.startZ + c.dist, L), idx = Math.floor(z / SEG) % N;
      const item = { c, pct: (z % SEG) / SEG, s: segs[idx] };
      if (c.dist < p.dist && c.dist > p.dist - playerZ * 0.95) behind.push(item);
      else { if (!bySeg.has(idx)) bySeg.set(idx, []); bySeg.get(idx).push(item); }
    }

    const gp = this.trial && this.state !== "countdown" ? this.ghostAt(this.raceTime) : null;
    if (gp) {
      const z = mod(this.startZ + gp.dist, L), idx = Math.floor(z / SEG) % N;
      const item = { c: { def: this.ghostDef, offset: gp.offset, lane: gp.offset, air: gp.air, dist: gp.dist, knockT: 0 }, pct: (z % SEG) / SEG, s: segs[idx], ghost: true };
      if (gp.dist < p.dist && gp.dist > p.dist - playerZ * 0.95) behind.push(item);
      else if (gp.dist >= p.dist) { if (!bySeg.has(idx)) bySeg.set(idx, []); bySeg.get(idx).push(item); }
    }
    for (let n = DRAW_DIST - 1; n > 0; n--) {
      const s = segs[(base.index + n) % N];
      if (s.p1.camera.z <= this.camDepth) continue;
      const sc = s.p1.screen.scale, sy = s.p1.screen.y;
      ctx.globalAlpha = n > DRAW_DIST * 0.65 ? Math.max(0, (DRAW_DIST - n) / (DRAW_DIST * 0.35)) : 1;
      if (s.rampStart) this.drawRamp(ctx, s, segs[(s.index + RAMP_LEN - 1) % N], F);
      if (s.index === START) this.drawArch(ctx, s, F);
      if (s.rail) this.drawRails(ctx, s, F);
      if (s.tunnel) { const a = ctx.globalAlpha; ctx.globalAlpha = Math.min(1, a * 2.5); this.drawTunnel(ctx, s, F, th); ctx.globalAlpha = a; }   // tunnels turn solid quickly (v1.11: no see-through rock in the distance)
      if (s.ventTop) this.drawVent(ctx, s, F);
      if (s.snow != null) this.drawSnowbank(ctx, s, F);
      // things on this segment. Past a hill crest only the part above the crest shows (one clip for the whole
      // segment), and a thing whose top is still below the crest is skipped: it would paint nothing (v1.10)
      const clip = s.clip, cut = sy > clip;
      let clipped = false;
      const clipOn = () => { if (cut && !clipped) { clipped = true; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, clip); ctx.clip(); } };
      for (let i = 0; i < s.sprites.length; i++) {
        const spr = s.sprites[i], kind = SPRITES[spr.type], sw = sc * kind.w * F, sx = s.p1.screen.x + s.p1.screen.w * spr.offset;
        if (sx + sw < 0 || sx - sw > W || sw < 1 || (q === 1 && n > 80 && i % 2)) continue;
        if (sy - sw * kind.top >= clip) { drawn.skipped++; continue; }
        clipOn(); drawn.sprites++;
        if (drawSpritePic(ctx, spr.type, sx, sy, sw, s.index * 7 + i, kind.collide)) { drawn.pics++; continue; }
        if (kind.collide && sw > 6) { ctx.fillStyle = "rgba(0,0,0,0.16)"; ctx.beginPath(); ctx.ellipse(sx, sy, sw * 0.42, sw * 0.07, 0, 0, 7); ctx.fill(); }
        drawSprite(ctx, spr.type, sx, sy, sw, t, s.index * 7 + i);
      }
      for (const c of s.coins) {
        if (c.taken) continue;
        const cw = sc * COIN_W * F, cx = s.p1.screen.x + s.p1.screen.w * c.offset, cy = sy - cw * 0.9 - (c.h ? sc * c.h * F : 0);
        if (cx + cw * 3 < 0 || cx - cw * 3 > W) continue;
        if (c.ring) { if (cy - cw * 3 * RING_TOP < clip) { clipOn(); drawRing(ctx, cx, cy, cw * 3, t); } continue; }
        if (c.pearl) { if (cy - cw * 1.1 * PEARL_TOP < clip) { clipOn(); drawPearl(ctx, cx, cy, cw * 1.1, t, s.index * 0.7 + c.offset * 3); } continue; }
        if (cy - cw * COIN_TOP < clip) { clipOn(); drawCoin(ctx, cx, cy, cw, t, s.index * 0.37 + c.offset * 2); }
      }
      if (s.boxes) for (const b of s.boxes) {
        if (b.until > t) continue;
        const bw = sc * 420 * F, bx = s.p1.screen.x + s.p1.screen.w * b.offset, by = sy - bw * 0.85;
        if (by - bw * BOX_TOP < clip) { clipOn(); drawBox(ctx, bx, by, bw, t, s.index * 0.5 + b.offset * 2); }
      }
      if (clipped) ctx.restore();
      const list = bySeg.get(s.index);
      if (list) for (const it of list) this.drawRival(ctx, it, F);
    }

    ctx.globalAlpha = 1;
    const pw = CAR_W * ROAD_W * F / CAM_H;
    const bounce = Math.abs(p.offset) > 1 && p.speed > 100 ? (Math.random() - 0.5) * H * 0.012 : Math.sin(t * 20) * H * 0.002 * Math.min(1, p.speed / BASE_MAX);
    const lift = Math.min(p.air, 900) * 0.45 / CAM_H * F;
    if (p.air > 0) { ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(W / 2, H - H * 0.01, pw * 0.5 * (1 - Math.min(0.5, p.air / 1500)), pw * 0.06, 0, 0, 7); ctx.fill(); }
    const dustCol = th.grass[0];
    ctx.save(); ctx.translate(carShift, 0);   // screen-space dust and smoke follow the car
    for (const q of this.parts) {
      ctx.globalAlpha = Math.min(1, q.life * 2);
      if (q.c === "bubble") {
        ctx.strokeStyle = "rgba(230,255,255,0.8)"; ctx.lineWidth = Math.max(1, H * 0.0025);
        ctx.beginPath(); ctx.arc(q.x * W, q.y * H, q.r * H, 0, 7); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.arc(q.x * W - q.r * H * 0.35, q.y * H - q.r * H * 0.35, q.r * H * 0.25, 0, 7); ctx.fill();
        continue;
      }
      if (q.c === "smoke") { ctx.globalAlpha = Math.min(0.55, q.life); ctx.fillStyle = th.snow || th.ice ? "#ffffff" : "#d8d8d8"; ctx.beginPath(); ctx.arc(q.x * W, q.y * H, q.r * H * (2.2 - q.life * 1.5), 0, 7); ctx.fill(); continue; }
      ctx.fillStyle = q.c === "dust" ? dustCol : q.c;
      ctx.beginPath(); ctx.arc(q.x * W, q.y * H, q.r * H * (q.c === "dust" ? 1.5 - q.life : 1), 0, 7); ctx.fill();
      if (q.c === "dust") { ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fill(); }
    }
    ctx.restore(); ctx.globalAlpha = 1;
    const dark = th.night || th.cave || th.lights || this.inTunnel;   // lights: a dark sky that needs headlights (Haunted Hill)
    if (dark) this.drawHeadlights(ctx, W / 2 + carShift, H - H * 0.02 - lift - pw * 0.25, pw, H);
    // lean into the steering, plus a little body roll from the curve pushing the car outward
    const roll = p.air > 0 ? 0 : clamp(-pseg.curve * Math.min(1, p.speed / BASE_MAX) * 0.08, -0.35, 0.35);
    const lean = this.steerVis * Math.min(1, p.speed / BASE_MAX) * (p.air > 0 ? 0.3 : 1) + roll;
    const squash = p.landT > 0 ? Math.sin((p.landT / 0.35) * Math.PI) * Math.min(1, p.landV / JUMP_VY) : 0;
    drawCar(ctx, W / 2 + carShift, H - H * 0.02 + bounce - lift, pw, p.def, { t, steer: this.steerVis, nitro: this.nitroT > 0 || this.boostT > 0, spin: p.dist / 900, lean, squash, brake: this.braking && this.state === "race", flat: this.lite });
    if (this.autoTarget !== null) {
      const segs2 = this.T.segs, pidx = pseg.index;
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      for (const k of [4, 8, 12]) {
        const s2 = segs2[(pidx + k) % N]; if (!(s2.p1.camera.z > this.camDepth)) continue;
        const ax = s2.p1.screen.x + s2.p1.screen.w * this.autoTarget, ay = s2.p1.screen.y, aw = s2.p1.screen.w * 0.08;
        quad(ctx, ax - aw, ay, ax, ay - aw * 0.8, ax + aw, ay, ax, ay - aw * 0.35);
      }
      ctx.font = `${Math.round(H * 0.06)}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (Math.sin(t * 6) > -0.6) drawEmojiText(ctx, "🤖", W / 2 + pw * 0.42, H - H * 0.02 - lift - pw * 0.55);
    }
    if (this.beamT > 0) {
      ctx.globalAlpha = Math.min(1, this.beamT) * 0.45; ctx.fillStyle = "#9fe8ff";
      quad(ctx, W / 2 - pw * 0.15, 0, W / 2 + pw * 0.15, 0, W / 2 + pw * 0.75, H, W / 2 - pw * 0.75, H); ctx.globalAlpha = 1;
    }
    if (this.shieldT > 0) {
      const a = this.shieldT < 1.5 ? (Math.sin(t * 30) > 0 ? 0.9 : 0.3) : 0.9;
      ctx.globalAlpha = a; ctx.strokeStyle = "#3cf2ff"; ctx.lineWidth = H * 0.008; ctx.fillStyle = "rgba(60,242,255,0.15)";
      ctx.beginPath(); ctx.ellipse(W / 2, H - H * 0.02 - lift - pw * 0.28, pw * 0.68, pw * 0.42, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
    }
    behind.sort((a, b) => b.c.dist - a.c.dist);
    for (const it of behind) this.drawRival(ctx, it, F);

    if (this.nitroT > 0 || this.boostT > 0) {
      const k0 = Math.min(1, this.fastT / 1.5);
      ctx.strokeStyle = `rgba(255,255,255,${(0.35 + 0.35 * k0).toFixed(2)})`; ctx.lineWidth = Math.max(1, H * (0.003 + 0.003 * k0));
      ctx.beginPath();
      for (let k = 0; k < (this.lite ? 14 : 22 + Math.round(18 * k0)); k++) {
        const a = Math.random() * Math.PI * 2, r0 = H * (0.35 + Math.random() * 0.2), r1 = r0 + H * (0.15 + Math.random() * 0.2);
        ctx.moveTo(W / 2 + Math.cos(a) * r0 * 1.6, H * 0.45 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * r1 * 1.6, H * 0.45 + Math.sin(a) * r1);
      }
      ctx.stroke();
    }

    // full-screen tints (tunnel shade, rain grey, sea blue) are a see-through layer over the canvas, which the
    // browser blends for free, instead of one more canvas-full of pixels every frame (v1.10). main.js shows it.
    this.tint = (this.inTunnel ? "linear-gradient(rgba(10,8,20,0.28),rgba(10,8,20,0.28))," : "") + (this.weather === "rain" ? "linear-gradient(rgba(40,60,90,0.18),rgba(40,60,90,0.18))," : "")
      + (th.water ? "linear-gradient(rgba(20,120,170,0.04),rgba(10,70,120,0.16))," : "");
    if (this.drafting) {
      ctx.strokeStyle = "rgba(220,245,255,0.5)"; ctx.lineWidth = Math.max(1, H * 0.003); ctx.beginPath();
      for (let k = 0; k < 8; k++) { const sx = W / 2 + (k % 2 ? 1 : -1) * pw * (0.45 + (k >> 1) * 0.1), sy = ((t * 2.5 + k * 0.23) % 1) * H * 0.45 + H * 0.45; ctx.moveTo(sx, sy); ctx.lineTo(sx, sy + H * 0.06); }
      ctx.stroke();
    }
    if (this.weather === "rain") {
      // rain: streaks falling at a slant that follows the curves (the grey tint is the layer above)
      ctx.strokeStyle = "rgba(220,235,255,0.55)"; ctx.lineWidth = Math.max(1, H * 0.003); ctx.beginPath();
      const slant = 0.25;
      for (let i = 0; i < 90; i++) {
        const fx = (((i * 0.6180339 + this.skyX * 2) % 1) + 1) % 1 * W, fy = (((i * 0.37 + t * (1.6 + (i % 3) * 0.3)) % 1) + 1) % 1 * H, len = H * (0.04 + (i % 3) * 0.02);
        ctx.moveTo(fx, fy); ctx.lineTo(fx - len * slant, fy + len);
      }
      ctx.stroke();
    }
    if (th.snow || this.weather === "snow") {
      // falling snow in two layers: near flakes are bigger and faster, and everything drifts with the curves
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 80; i++) {
        const near = i % 3 === 0, sp = near ? 0.22 : 0.08, sz = H * (near ? 0.006 : 0.003);
        const fx = (((i * 0.6180339 + this.skyX * (near ? 3 : 1.4) + Math.sin(t * 0.9 + i) * 0.012) % 1) + 1) % 1 * W;
        const fy = (((i * 0.37 + t * sp * (1 + (i % 5) * 0.12)) % 1) + 1) % 1 * H;
        ctx.globalAlpha = near ? 0.9 : 0.55; ctx.beginPath(); ctx.arc(fx, fy, sz, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const q of this.popups) {
      const s = 1 + Math.min(0.3, q.age * 2);
      ctx.globalAlpha = 1 - q.age;
      ctx.font = `900 ${Math.round(H * 0.08 * s)}px system-ui,sans-serif`;
      ctx.lineWidth = H * 0.012; ctx.strokeStyle = "rgba(0,0,0,0.6)";
      const qx = W / 2 + q.x * W, qy = H * 0.5 - q.age * H * 0.15;
      drawEmojiText(ctx, q.text, qx, qy, true, q.color);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  clipped(ctx, s, y, fn) {
    if (y <= s.clip) { fn(); return; }
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, this.canvas.width, s.clip); ctx.clip(); fn(); ctx.restore();
  }

  drawRival(ctx, { c, pct, s, ghost }, F) {
    if (s.p1.camera.z <= this.camDepth) return;
    if (ghost) { const a = ctx.globalAlpha; ctx.globalAlpha = a * 0.45; this.drawRival(ctx, { c, pct, s }, F); ctx.globalAlpha = a; return; }
    const sc = lerp(s.p1.screen.scale, s.p2.screen.scale, pct);
    const x = lerp(s.p1.screen.x, s.p2.screen.x, pct) + sc * c.offset * ROAD_W * F;
    const y = lerp(s.p1.screen.y, s.p2.screen.y, pct) - sc * c.air * F;
    const w = sc * CAR_W * ROAD_W * F;
    if (x + w < 0 || x - w > this.canvas.width || y - w * CAR_TOP >= s.clip) return;   // off screen, or hidden behind a crest
    const steer = c.knockT > 0 ? Math.sin(this.t * 30) * 4 : c.wobT > 0 ? Math.sin(this.t * 40) * 2.5 * c.wobT : clamp((c.lane - c.offset) * 3, -1, 1);
    this.clipped(ctx, s, y, () => {
      if (this.T.theme.ice && c.air < 60 && w > 6 && this.nearTwo.includes(c)) {
        // shiny ice: a faint upside-down reflection under the car
        ctx.save(); const a = ctx.globalAlpha; ctx.globalAlpha = a * 0.22; ctx.translate(x, lerp(s.p1.screen.y, s.p2.screen.y, pct)); ctx.scale(1, -0.45);
        drawCar(ctx, 0, 0, w, c.def, { t: this.t, steer, spin: c.dist / 900, flat: this.lite }); ctx.restore();
      }
      if (c.air > 30) { const gy = lerp(s.p1.screen.y, s.p2.screen.y, pct), k = Math.max(0.4, 1 - c.air / 2000); ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.beginPath(); ctx.ellipse(x, gy, w * 0.55 * k, w * 0.07 * k, 0, 0, 7); ctx.fill(); }
      if ((this.T.theme.night || this.T.theme.cave || this.T.theme.lights || s.tunnel) && w > 4) {
        ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = "rgba(255,240,180,0.22)";
        ctx.beginPath(); ctx.ellipse(x, y - w * 0.05 - w * 0.6, w * 0.7, w * 0.25, 0, 0, 7); ctx.fill(); ctx.restore();
      }
      if (c.air > 30 || ghost || !drawCarPic(ctx, x, y, w, c.def, steer, this.lite))
        drawCar(ctx, x, y, w, c.def, { t: this.t, steer, spin: c.dist / 900, noShadow: c.air > 30, lean: clamp(steer, -1, 1) * 0.5, flat: this.lite });
    });
  }

  /* headlights: a soft cone of light on the road ahead of the car (night and tunnels) */
  drawHeadlights(ctx, x, y, pw, H) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const g = ctx.createLinearGradient(0, y, 0, H * 0.5);
    g.addColorStop(0, "rgba(255,244,200,0.35)"); g.addColorStop(1, "rgba(255,244,200,0)");
    ctx.fillStyle = g;
    quad(ctx, x - pw * 0.45, y, x + pw * 0.45, y, x + pw * 1.6, H * 0.5, x - pw * 1.6, H * 0.5);
    ctx.fillStyle = "rgba(255,250,220,0.5)"; ctx.beginPath(); ctx.ellipse(x - pw * 0.3, y, pw * 0.1, pw * 0.05, 0, 0, 7); ctx.ellipse(x + pw * 0.3, y, pw * 0.1, pw * 0.05, 0, 0, 7); ctx.fill();
    ctx.restore();
  }

  /* 🚇 a tunnel piece: two walls and a ceiling over the road (the entrance gets a big portal face) */
  drawTunnel(ctx, s, F, th) {
    if (s.p1.camera.z <= this.camDepth || s.p2.camera.z <= this.camDepth) return;
    const a = s.p1.screen, b = s.p2.screen, ha = a.scale * 2600 * F, hb = b.scale * 2600 * F;
    if (a.w < 1) return;
    const col = { rock: ["#8a5232", "#6e3f25"], ice: ["#cfe6f7", "#a9cbe6"], cave: ["#2a1410", "#1d0d0a"], crystal: ["#3a2a6a", "#2a1d50"], brick: ["#6a3a32", "#4f2a24"] }[th.tunnels] || ["#555", "#444"];
    this.clipped(ctx, s, a.y, () => {
      ctx.fillStyle = col[s.alt];
      quad(ctx, a.x - a.w * 1.3, a.y, b.x - b.w * 1.3, b.y, b.x - b.w * 1.3, b.y - hb, a.x - a.w * 1.3, a.y - ha);
      quad(ctx, a.x + a.w * 1.3, a.y, b.x + b.w * 1.3, b.y, b.x + b.w * 1.3, b.y - hb, a.x + a.w * 1.3, a.y - ha);
      ctx.fillStyle = col[1];
      quad(ctx, a.x - a.w * 1.3, a.y - ha, a.x + a.w * 1.3, a.y - ha, b.x + b.w * 1.3, b.y - hb, b.x - b.w * 1.3, b.y - hb);
      if (s.index % 4 === 0) { ctx.fillStyle = "#ffb347"; ctx.beginPath(); ctx.ellipse(a.x, a.y - ha * 0.97, a.w * 0.12, Math.max(1, ha * 0.02), 0, 0, 7); ctx.fill(); }
      if (s.tunnelEnd) {
        // the way out: a rim of rock around the opening, so the exit reads as a hole in the hill (v1.11)
        const rim = Math.max(1, a.w * 0.12);
        ctx.fillStyle = col[0];
        ctx.fillRect(b.x - b.w * 1.3 - rim, b.y - hb - rim, b.w * 2.6 + rim * 2, rim);
        ctx.fillRect(b.x - b.w * 1.3 - rim, b.y - hb, rim, hb); ctx.fillRect(b.x + b.w * 1.3, b.y - hb, rim, hb);
      }
      if (s.tunnelStart) {
        // the portal: a big face around the opening
        ctx.fillStyle = col[0];
        ctx.beginPath(); ctx.rect(a.x - a.w * 4, a.y - ha * 1.7, a.w * 8, ha * 1.7);
        ctx.moveTo(a.x - a.w * 1.3, a.y); ctx.lineTo(a.x - a.w * 1.3, a.y - ha); ctx.lineTo(a.x + a.w * 1.3, a.y - ha); ctx.lineTo(a.x + a.w * 1.3, a.y); ctx.closePath();
        ctx.fill("evenodd");
        ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(a.x - a.w * 1.45, a.y - ha * 1.12, a.w * 2.9, ha * 0.12);
      }
    });
  }

  // A soft snowbank across one lane: a lumpy white mound with a blue shadow and a few sparkles.
  drawSnowbank(ctx, s, F) {
    if (s.p1.camera.z <= this.camDepth) return;
    const x = s.p1.screen.x + s.p1.screen.w * s.snow, y = s.p1.screen.y, rw = s.p1.screen.w * 0.3, t = this.t;
    if (rw < 1.5) return;
    this.clipped(ctx, s, y, () => {
      ctx.fillStyle = "rgba(40,90,150,0.25)"; ctx.beginPath(); ctx.ellipse(x, y, rw * 1.15, rw * 0.16, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#cfe6f7"; ctx.beginPath(); ctx.ellipse(x, y, rw * 1.05, rw * 0.52, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.ellipse(x - rw * 0.3, y - rw * 0.08, rw * 0.6, rw * 0.46, 0, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + rw * 0.38, y - rw * 0.04, rw * 0.5, rw * 0.36, 0, Math.PI, 0); ctx.fill();
      if (rw > 8) {
        ctx.fillStyle = "#bfefff";
        for (let k = 0; k < 4; k++) if (Math.sin(t * 4 + k * 1.9 + s.index) > 0.3) { const sx = x + rw * (k * 0.45 - 0.7), sy = y - rw * (0.3 + (k % 2) * 0.15), g = rw * 0.06; ctx.beginPath(); ctx.moveTo(sx, sy - g * 2); ctx.lineTo(sx + g, sy); ctx.lineTo(sx, sy + g * 2); ctx.lineTo(sx - g, sy); ctx.fill(); }
      }
    });
  }

  // A bubble vent: a round grate on the road with bubbles streaming up out of it.
  drawVent(ctx, s, F) {
    if (s.p1.camera.z <= this.camDepth) return;
    const sc = s.p1.screen.scale, x = s.p1.screen.x + s.p1.screen.w * s.vent, y = s.p1.screen.y, rw = s.p1.screen.w * 0.3, t = this.t;
    if (rw < 1.5) return;
    this.clipped(ctx, s, y, () => {
      ctx.fillStyle = "#1c2a33"; ctx.beginPath(); ctx.ellipse(x, y, rw, rw * 0.22, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = "#7fd8ff"; ctx.lineWidth = Math.max(1, rw * 0.06); ctx.stroke();
      ctx.fillStyle = "rgba(191,246,255,0.25)"; ctx.beginPath(); ctx.ellipse(x, y - rw * 0.5, rw * 0.8, rw * 0.9, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(240,255,255,0.85)";
      for (let k = 0; k < 9; k++) {
        const ph = (t * 0.9 + k / 9) % 1, by = y - ph * sc * 1600 * F, bx = x + Math.sin(t * 3 + k * 2.1) * rw * 0.35, br = Math.max(1, sc * (40 + (k % 3) * 25) * F);
        ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.stroke();
      }
    });
  }

  // The ramp is a striped slope from the road surface up to RAMP_H at its far end.
  // Guardrails on curvy stretches: a silver band on short posts just outside both rumble strips.
  drawRails(ctx, s, F) {
    if (s.p1.camera.z <= this.camDepth || s.p2.camera.z <= this.camDepth) return;
    const a = s.p1.screen, b = s.p2.screen, ha = a.scale * 260 * F, hb = b.scale * 260 * F;
    if (ha < 0.6) return;
    this.clipped(ctx, s, a.y, () => {
      for (const side of [-1, 1]) {
        const xa = a.x + side * a.w * 1.22, xb = b.x + side * b.w * 1.22;
        if (s.index % 2 === 0) { ctx.fillStyle = "#6d7480"; ctx.fillRect(xa - ha * 0.12, a.y - ha, ha * 0.24, ha); }
        ctx.fillStyle = s.alt ? "#e6ebf1" : "#c9d1db";
        quad(ctx, xa, a.y - ha, xb, b.y - hb, xb, b.y - hb * 0.55, xa, a.y - ha * 0.55);
      }
    });
  }

  // Start/finish arch: two poles and a checkered banner over the road.
  drawArch(ctx, s, F) {
    const sc = s.p1.screen.scale, x = s.p1.screen.x, w = s.p1.screen.w, y = s.p1.screen.y;
    const pw = Math.max(2, sc * 110 * F), ph = sc * 1500 * F, bh = sc * 320 * F, L = x - w * 1.12, R = x + w * 1.12;
    if (R < 0 || L > this.canvas.width || pw < 1) return;
    this.clipped(ctx, s, y, () => {
      ctx.fillStyle = "#e8262b"; ctx.fillRect(L - pw / 2, y - ph, pw, ph); ctx.fillRect(R - pw / 2, y - ph, pw, ph);
      ctx.fillStyle = "#ffd400"; ctx.fillRect(L - pw / 2, y - ph - bh * 0.1, R - L + pw, bh * 1.2);
      const cols = 16, cw = (R - L) / cols;
      for (let i = 0; i < cols; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? "#111" : "#fff"; ctx.fillRect(L + i * cw, y - ph + j * bh / 2, cw + 0.5, bh / 2 + 0.5); }
    });
  }

  drawRamp(ctx, s, e, F) {
    if (s.p1.camera.z <= this.camDepth || e.p2.camera.z <= this.camDepth) return;
    const x1 = s.p1.screen.x, y1 = s.p1.screen.y, w1 = s.p1.screen.w;
    const x2 = e.p2.screen.x, w2 = e.p2.screen.w, y2 = e.p2.screen.y - e.p2.screen.scale * RAMP_H * F;
    this.clipped(ctx, s, y1, () => {
      ctx.fillStyle = "#7a3d00";
      quad(ctx, x1 - w1, y1, x2 - w2, e.p2.screen.y, x2 - w2, y2, x2 - w2, y2);
      quad(ctx, x1 + w1, y1, x2 + w2, e.p2.screen.y, x2 + w2, y2, x2 + w2, y2);
      const bands = 6;
      for (let b = 0; b < bands; b++) {
        const a = b / bands, c = (b + 1) / bands;
        const ya = lerp(y1, y2, a), yc = lerp(y1, y2, c), xa = lerp(x1, x2, a), xc = lerp(x1, x2, c), wa = lerp(w1, w2, a), wc = lerp(w1, w2, c);
        ctx.fillStyle = b % 2 ? "#ffd400" : "#ff3d3d";
        quad(ctx, xa - wa, ya, xa + wa, ya, xc + wc, yc, xc - wc, yc);
      }
      ctx.fillStyle = "#ffffff";
      const xm = lerp(x1, x2, 0.5), ym = lerp(y1, y2, 0.5), wm = lerp(w1, w2, 0.5);
      for (const k of [-0.5, 0, 0.5]) { const cx = xm + wm * k, aw = wm * 0.14; ctx.beginPath(); ctx.moveTo(cx - aw, ym + aw * 0.5); ctx.lineTo(cx, ym - aw * 0.5); ctx.lineTo(cx + aw, ym + aw * 0.5); ctx.lineTo(cx + aw * 0.6, ym + aw * 0.7); ctx.lineTo(cx, ym); ctx.lineTo(cx - aw * 0.6, ym + aw * 0.7); ctx.closePath(); ctx.fill(); }
    });
  }

  /* The road, layer by layer for every visible piece at once (v1.11): all the grass in one path and one fill, then
     the curbs, the road, the edge lines and the lane dashes, instead of one path per piece (about 45 canvas calls a
     piece before). Pieces don't overlap (each starts at the far edge of the one before), so the layers can go in any
     order between pieces. Past 60% of the view (far) there are no curbs, edge lines or dashes: the haze covers them.
     Special pieces (a jump gap, the finish line, underwater ripples) are drawn on top afterwards. The haze is drawn
     last, one rectangle per band of equal strength. */
  drawRoad(ctx, shown, segs, b0, th, W, DRAW_DIST, FAR) {
    const N = segs.length, list = shown.map(n => segs[(b0 + n) % N]);
    const layer = (style, fn) => { ctx.fillStyle = style; ctx.beginPath(); let any = false; for (let k = 0; k < list.length; k++) if (fn(list[k], shown[k] > FAR)) any = true; if (any) ctx.fill(); };
    const q = (x1, y1, x2, y2, x3, y3, x4, y4) => { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.closePath(); };
    layer(th.grass[0], s => { const a = s.p1.screen, b = s.p2.screen; ctx.rect(0, b.y, W, a.y + 1 - b.y); return true; });
    for (const alt of [0, 1]) layer(th.rumble[alt], (s, far) => {
      if (s.alt !== alt || (far && !s.gap)) return false;
      const { x: x1, y: y1, w: w1 } = s.p1.screen, { x: x2, y: y2, w: w2 } = s.p2.screen, yb = y1 + 1, r1 = w1 / 6, r2 = w2 / 6;
      q(x1 - w1 - r1, yb, x1 - w1 + 1, yb, x2 - w2 + 1, y2, x2 - w2 - r2, y2); q(x1 + w1 + r1, yb, x1 + w1 - 1, yb, x2 + w2 - 1, y2, x2 + w2 + r2, y2); return true;
    });
    layer(th.road[0], s => { if (s.gap) return false; const { x: x1, y: y1, w: w1 } = s.p1.screen, { x: x2, y: y2, w: w2 } = s.p2.screen; q(x1 - w1, y1 + 1, x1 + w1, y1 + 1, x2 + w2, y2, x2 - w2, y2); return true; });
    layer("rgba(255,255,255,0.9)", (s, far) => {
      if (s.gap || s.finish || far) return false;
      const { x: x1, y: y1, w: w1 } = s.p1.screen, { x: x2, y: y2, w: w2 } = s.p2.screen, e1 = w1 * 0.035, e2 = w2 * 0.035;
      q(x1 - w1 + e1, y1, x1 - w1 + 2 * e1, y1, x2 - w2 + 2 * e2, y2, x2 - w2 + e2, y2); q(x1 + w1 - 2 * e1, y1, x1 + w1 - e1, y1, x2 + w2 - e2, y2, x2 + w2 - 2 * e2, y2); return true;
    });
    layer(th.lane, (s, far) => {   // lane dashes: 4 segments on, 8 off (about real spacing)
      if (s.gap || s.finish || far || s.index % 12 >= 4) return false;
      const { x: x1, y: y1, w: w1 } = s.p1.screen, { x: x2, y: y2, w: w2 } = s.p2.screen, l1 = w1 / 32, l2 = w2 / 32;
      for (let lane = 1; lane < LANES; lane++) { const lx1 = x1 - w1 + (2 * w1 * lane) / LANES, lx2 = x2 - w2 + (2 * w2 * lane) / LANES; q(lx1 - l1 / 2, y1, lx1 + l1 / 2, y1, lx2 + l2 / 2, y2, lx2 - l2 / 2, y2); }
      return true;
    });
    for (const s of list) {
      const { x: x1, y: y1, w: w1 } = s.p1.screen, { x: x2, y: y2, w: w2 } = s.p2.screen, yb = y1 + 1, r1 = w1 / 6, r2 = w2 / 6;
      if (s.gap) {
        ctx.fillStyle = "#07080f"; quad(ctx, x1 - w1 - r1, yb, x1 + w1 + r1, yb, x2 + w2 + r2, y2, x2 - w2 - r2, y2);
        ctx.fillStyle = "rgba(60,242,255,0.35)"; quad(ctx, x1 - w1 - r1, yb, x1 - w1 - r1 * 0.5, yb, x2 - w2 - r2 * 0.5, y2, x2 - w2 - r2, y2);
        quad(ctx, x1 + w1 + r1 * 0.5, yb, x1 + w1 + r1, yb, x2 + w2 + r2, y2, x2 + w2 + r2 * 0.5, y2);
        continue;
      }
      if (s.finish) for (let c = 0; c < 10; c++) {
        ctx.fillStyle = (c + s.index) % 2 ? "#ffffff" : "#111111";
        const a1 = x1 - w1 + (2 * w1 * c) / 10, b1 = x1 - w1 + (2 * w1 * (c + 1)) / 10, a2 = x2 - w2 + (2 * w2 * c) / 10, b2 = x2 - w2 + (2 * w2 * (c + 1)) / 10;
        quad(ctx, a1, y1, b1, y1, b2, y2, a2, y2);
      }
      if (th.water && s.index % 2 === 0 && w1 > 6) {
        // light ripples from the surface dancing on the road
        const k = 0.5 + 0.5 * Math.sin(this.t * 2.2 + s.index * 0.9), ym = (y1 + y2) / 2, hh = Math.max(1, (y1 - y2) * 0.6);
        ctx.fillStyle = `rgba(210,250,255,${(0.05 + 0.08 * k).toFixed(3)})`;
        for (const j of [0, 1]) { const u = Math.sin(this.t * 0.7 + s.index * 1.7 + j * 2.5) * 0.7; ctx.beginPath(); ctx.ellipse(x1 + w1 * u, ym, w1 * (0.12 + 0.06 * k), hh, 0, 0, 7); ctx.fill(); }
      }
      // on the road surface, piece by piece and in the same order as before v1.11: ice shine, currents, crosswalks,
      // skid marks, puddles and boost pads (scripts/test-draw.mjs checks each one is still painted)
      if (th.ice && !s.finish) {
        // glossy ice: long soft shines down the road (the same on every segment, so no stripes) and twinkling glints
        ctx.fillStyle = "rgba(255,255,255,0.24)";
        quad(ctx, x1 - w1 * 0.6, yb, x1 - w1 * 0.36, yb, x2 - w2 * 0.36, y2, x2 - w2 * 0.6, y2);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        quad(ctx, x1 + w1 * 0.22, yb, x1 + w1 * 0.34, yb, x2 + w2 * 0.34, y2, x2 + w2 * 0.22, y2);
        if (s.index % 3 === 0 && w1 > 14) {
          const g = Math.sin(this.t * 3 + s.index * 2.3);
          if (g > 0.55) { const gx = x1 + w1 * (((s.index * 0.618) % 1.6) - 0.8), gy = (y1 + y2) / 2, gs = Math.min(10, w1 * 0.02) * (g - 0.4) * 2; ctx.fillStyle = "#ffffff"; quad(ctx, gx - gs, gy, gx, gy - gs * 2.4, gx + gs, gy, gx, gy + gs * 2.4); }
        }
      }
      if (s.current) {
        // a current: a blue sheen with arrows sliding the way it pushes
        ctx.fillStyle = "rgba(60,242,255,0.12)"; quad(ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2);
        if (s.index % 4 === 0) {
          const d = s.current, ph = (this.t * 0.9) % 0.5;
          ctx.fillStyle = "rgba(220,255,255,0.75)";
          for (const base of [-0.75, -0.25, 0.25]) {
            const u = base + d * ph, ax = x1 + w1 * u, bx = x2 + w2 * u, cw = w1 * 0.09, ym = (y1 + y2) / 2;
            if (Math.abs(u) > 0.9) continue;
            ctx.beginPath(); ctx.moveTo(ax - d * cw, y1); ctx.lineTo((ax + bx) / 2 + d * cw, ym); ctx.lineTo(bx - d * cw * (w2 / w1), y2); ctx.lineTo((ax + bx) / 2 + d * cw * 0.2, ym); ctx.closePath(); ctx.fill();
          }
        }
      }
      if (s.crosswalk && w1 > 3) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        for (let k = -4; k < 4; k++) { const u1 = (k + 0.15) / 4, u2 = (k + 0.65) / 4; quad(ctx, x1 + w1 * u1, y1, x1 + w1 * u2, y1, x2 + w2 * u2, y2, x2 + w2 * u1, y2); }
      }
      const sk = this.skids?.get(s.index);
      if (sk && w1 > 3) {
        const age = this.t - sk.t; ctx.fillStyle = `rgba(20,20,24,${Math.max(0, 0.45 - age * 0.02).toFixed(3)})`;
        for (const side of [-1, 1]) { const u = sk.x + side * CAR_W * 0.38, m1 = w1 * 0.035, m2 = w2 * 0.035; quad(ctx, x1 + w1 * u - m1, y1, x1 + w1 * u + m1, y1, x2 + w2 * u + m2, y2, x2 + w2 * u - m2, y2); }
      }
      const pud = this.puddles?.get(s.index);
      if (pud !== undefined && w1 > 4) {
        // a puddle: a shiny blue patch on the road
        const px1 = x1 + w1 * pud, px2 = x2 + w2 * pud, pw1 = w1 * 0.22, pw2 = w2 * 0.22;
        ctx.fillStyle = "rgba(90,150,210,0.75)"; quad(ctx, px1 - pw1, y1, px1 + pw1, y1, px2 + pw2, y2, px2 - pw2, y2);
        ctx.fillStyle = "rgba(255,255,255,0.35)"; quad(ctx, px1 - pw1 * 0.5, y1, px1 - pw1 * 0.1, y1, px2 - pw2 * 0.1, y2, px2 - pw2 * 0.5, y2);
      }
      if (s.boost !== null) {
        const bx1 = x1 + w1 * s.boost, bx2 = x2 + w2 * s.boost, bw1 = w1 * 0.3, bw2 = w2 * 0.3;
        ctx.fillStyle = s.index % 2 ? "#ffd400" : "#ff7a00";
        quad(ctx, bx1 - bw1, y1, bx1 + bw1, y1, bx2 + bw2, y2, bx2 - bw2, y2);
        ctx.fillStyle = s.index % 2 ? "#fff6a8" : "#ffb347";
        quad(ctx, bx1 - bw1 * 0.15, y1, bx1 + bw1 * 0.15, y1, bx2 + bw2 * 0.15, y2, bx2 - bw2 * 0.15, y2);
      }
    }
    // haze: up to half by 70% of the view, then nearly solid over the last 15%, so the far end of the road fades into
    // the distance instead of ending in a hard stub (v1.11). Pieces of nearly equal haze share one rectangle.
    ctx.fillStyle = th.haze || (th.haze = shade(th.sky[1], 0.18));
    let band = -1, top = 0, bot = 0;
    const flush = () => { if (band > 0 && bot > top) { ctx.globalAlpha = band / 50; ctx.fillRect(0, top, W, bot - top); } };
    for (let k = 0; k < list.length; k++) {
      const u = shown[k] / DRAW_DIST; if (u <= 0.3) continue;
      const al = u < 0.85 ? Math.min(0.5, (u - 0.3) * 0.75) : 0.5 + (u - 0.85) / 0.15 * 0.45, b = Math.round(al * 50);
      const y1 = list[k].p1.screen.y, y2 = list[k].p2.screen.y;
      if (b !== band || Math.abs(y1 - top) > 1) { flush(); band = b; bot = y1; }   // a new band, or a piece that doesn't join on
      top = y2;
    }
    flush(); ctx.globalAlpha = 1;
  }
}
