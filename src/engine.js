// Pseudo-3D racing engine: a looping road of short segments (with curves and hills) projected onto the screen.
import { THEMES, RIVALS, PHYSICS, diffOf } from "./data.js";
import { drawCar, drawSprite, drawCoin, drawBackground, drawBox, SPRITES } from "./draw.js";

export const SEG = 200;            // segment length (world units)
export const BASE_MAX = 10000;     // starter car top speed (world units / s)
const RUMBLE = 3, ROAD_W = 2000, CAM_H = 1000, DRAW_DIST = 170, LANES = 3;
const CAM_DEPTH = 1 / Math.tan((100 / 2) * Math.PI / 180);
const PLAYER_Z = CAM_H * CAM_DEPTH;
const CAR_W = 0.36;                // car width in road half-widths
const COIN_W = 280;
const START = 15;                  // segment of the start/finish line
const GRAVITY = 9000, JUMP_VY = 2700, RAMP_H = 380, RAMP_LEN = 4;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeIn = (a, b, p) => a + (b - a) * p * p;
const easeInOut = (a, b, p) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5);
const mod = (n, m) => ((n % m) + m) % m;
const overlap = (x1, w1, x2, w2) => Math.abs(x1 - x2) < (w1 + w2) / 2;
function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

const trackCache = new Map();
export function buildTrack(track) {
  if (trackCache.has(track.id)) return trackCache.get(track.id);
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
  while (segs.length < target) {
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
    for (const side of [-1, 1]) if (r() < 0.75) segs[i].sprites.push({ type: types[Math.floor(r() * types.length)], offset: side * (1.4 + r() * 2.2) });
  }
  for (const s of [-1, 1]) segs[START + 8].sprites = [{ type: "sign", offset: s * 1.75 }];
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
  for (let i = START + 130; i < segs.length - 60; i += 200 + Math.floor(r() * 120)) {
    let k = i;
    const ok = k => Math.abs(segs[k].curve) < 0.6 && segs.slice(k - 2, k + RAMP_LEN + 2).every(q => q.boost === null && !q.coins.length);
    while (k < segs.length - 60 && !ok(k)) k++;
    if (k >= segs.length - 60) break;
    segs[k].rampStart = true;
    for (let j = 0; j < RAMP_LEN; j++) segs[k + j].ramp = true;
    const lane = [-0.5, 0, 0.5][Math.floor(r() * 3)];
    for (let j = 0; j < 7; j++) segs[k + RAMP_LEN + 2 + j * 3].coins.push({ offset: lane, taken: false, h: RAMP_H * 0.6 + 380 * Math.sin(Math.PI * (j + 0.5) / 7) });
    i = k;
  }
  // power-up boxes: a row of three across the road, a few times per lap
  for (let i = START + 70; i < segs.length - 40; i += 170 + Math.floor(r() * 90)) {
    let k = i;
    while (k < segs.length - 40 && segs.slice(k - 3, k + 3).some(q => q.ramp || q.boost !== null || q.coins.length)) k++;
    if (k >= segs.length - 40) break;
    segs[k].boxes = [-0.6, 0, 0.6].map(o => ({ offset: o, until: 0 }));
    i = k;
  }
  const T = { segs, length: segs.length * SEG, theme: th, track };
  trackCache.set(track.id, T);
  return T;
}

function project(pt, camX, camY, camZ, W, H, F) {
  pt.camera.x = -camX; pt.camera.y = pt.world.y - camY; pt.camera.z = pt.world.z - camZ;
  const sc = pt.screen.scale = CAM_DEPTH / pt.camera.z;
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
    this.assist = Math.max(this.diff.assist, opts.helper || 0);
    this.autoLvl = mode === "race" ? (opts.autoSteer || 0) : 0; this.autoTarget = null;
    for (const s of this.T.segs) { for (const c of s.coins) c.taken = false; if (s.boxes) for (const b of s.boxes) b.until = 0; }
    this.power = null; this.shieldT = 0; this.magnetT = 0; this.parts = [];
    this.hooks.onPower?.(null);
    this.track = track; this.mode = mode; this.stats = stats;
    this.state = mode === "demo" ? "demo" : "countdown";
    this.count = 3.6; this.raceTime = 0;
    this.startZ = START * SEG + SEG * 0.5;
    this.finishDist = track.laps * this.T.length;
    this.nitro = Math.min(1, 0.35 + (stats.startNitro || 0)); this.nitroT = 0; this.boostT = 0; this.bonkCD = 0; this.bumpCD = 0;
    this.coins = 0; this.popups = []; this.order = []; this.runStats = { stunts: 0, turbos: 0, bams: 0, powers: 0, pads: 0 }; this.skyX = 0; this.hillX = 0; this.steerVis = 0;
    const slot = k => ({ dist: -(Math.floor(k / 2) + 1) * 5 * SEG, offset: k % 2 ? 0.45 : -0.45 });
    this.player = { isPlayer: true, def: car, speed: mode === "demo" ? BASE_MAX * 0.7 : 0, finished: false, air: 0, vy: 0, airT: 0, ...slot(5) };
    const d = track.diff;
    this.rivals = RIVALS.map((def, i) => ({
      def, ...slot(i), speed: mode === "demo" ? BASE_MAX * 0.6 : 0, lane: slot(i).offset, laneT: 1 + i, knockT: 0, finished: false, air: 0, vy: 0,
      base: BASE_MAX * (0.62 + d * 0.16 + (4 - i) * 0.04) * (mode === "demo" ? 1 : this.diff.rival) * this.phys.top,
    }));
    if (mode === "demo") this.player.dist = 2 * SEG;
    this.prevIdx = this.segAt(this.player.dist).index;
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
      const straight = [...Array(25)].every((_, k) => Math.abs(segs[(idx + k) % N].curve) < 1.5);
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
    else if (p === "turbo") { this.nitroT = this.stats.nitroTime * 1.6; this.popup("SUPER TURBO!", "#ff7a00"); this.hooks.sfx("nitro"); }
    return true;
  }
  sparks(x, y, n, color) { for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 1.4, life: 0.5 + Math.random() * 0.3, c: color, r: 0.006 + Math.random() * 0.006 }); }

  useNitro() {
    if (this.state !== "race" || this.player.finished || this.nitro < 1) return false;
    this.nitro = 0; this.nitroT = this.stats.nitroTime; this.hooks.sfx("nitro"); this.runStats.turbos++; this.popup("TURBO!", "#ffd400"); return true;
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
      if (this.count <= 0.6) { this.state = "race"; h.sfx("go"); }
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
    else steer = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    // Auto Steer: only when Carter isn't steering. Its strength grows with its level; at 100 it's perfect.
    this.autoTarget = null;
    if (!auto && steer === 0 && this.autoLvl > 0 && this.state === "race") steer = this.autoSteer(seg) * (0.15 + 0.85 * this.autoLvl / 100);
    this.steerVis += (steer - this.steerVis) * Math.min(1, dt * 10);
    const fast = this.nitroT > 0 || this.boostT > 0;
    const ph = this.phys;
    const top = (auto ? BASE_MAX * (p.finished ? 0.5 : 0.75) : S.maxSpeed * (fast ? 1.25 : 1)) * ph.top;
    if (p.speed < top) p.speed = Math.min(top, p.speed + S.accel * ph.accel * (fast ? 3 : 1) * dt);
    else p.speed = Math.max(top, p.speed - BASE_MAX * 0.6 * dt);
    const flying = p.air > 0;
    if (!flying && Math.abs(p.offset) > 1 && p.speed > BASE_MAX * 0.35) p.speed = Math.max(BASE_MAX * 0.35, p.speed - BASE_MAX * 1.2 * dt);
    const sp = Math.min(1.4, p.speed / BASE_MAX), dx = dt * 2.2 * sp;
    p.offset += steer * dx * (auto ? 1 : S.handling) * (flying ? ph.air : 1);
    const help = this.assist;   // 0 none, 1 a little, 2 lots
    if (!flying) p.offset -= dx * sp * seg.curve * 0.15 * (1 - S.grip) * (1 - 0.25 * help) / ph.grip;
    // gentle pull back toward the road (stronger with steering help)
    if (!auto && steer === 0 && Math.abs(p.offset) > 0.8 - 0.15 * help) p.offset -= Math.sign(p.offset) * dt * (0.45 + 0.45 * help);
    p.offset = clamp(p.offset, -2.6, 2.6);
    p.dist += p.speed * dt;
    if (flying) {
      p.vy -= GRAVITY * ph.gravity * dt; p.air += p.vy * dt; p.airT += dt;
      if (p.air <= 0) this.land();
    }
    const moved = p.speed * dt / SEG;
    this.skyX = mod(this.skyX + 0.0012 * seg.curve * moved, 1);
    this.hillX = mod(this.hillX + 0.0025 * seg.curve * moved, 1);

    // everything the car drove over this frame
    const segs = this.T.segs, N = segs.length, cur = this.segAt(p.dist).index;
    let i = this.prevIdx, guard = 0;
    while (i !== cur && guard++ < 30) { i = (i + 1) % N; this.touch(segs[i]); }
    this.touch(segs[cur]);
    this.prevIdx = cur;

    if (racing && !p.finished) this.nitro = Math.min(1, this.nitro + S.nitroFill * dt);
    this.nitroT -= dt; this.boostT -= dt; this.bonkCD -= dt; this.bumpCD -= dt; this.shieldT -= dt; this.magnetT -= dt;
    // little effects in screen units (0..1): dust off the road
    if (Math.abs(p.offset) > 1 && p.air <= 0 && p.speed > BASE_MAX * 0.2 && Math.random() < 0.8) this.parts.push({ x: 0.5 + (Math.random() - 0.5) * 0.22, y: 0.97, vx: (Math.random() - 0.5) * 0.3, vy: -0.25 - Math.random() * 0.2, life: 0.6, c: "dust", r: 0.02 + Math.random() * 0.02 });
    if (this.autoTarget !== null && this.autoLvl >= 100) for (let i = 0; i < 2; i++) this.parts.push({ x: 0.5 + (Math.random() - 0.5) * 0.12, y: 0.95, vx: (Math.random() - 0.5) * 0.2, vy: 0.1 + Math.random() * 0.2, life: 0.5, c: Math.random() < 0.5 ? "#ffd400" : "#fff6a8", r: 0.006 + Math.random() * 0.006 });
    for (const q of this.parts) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 0.8 * dt; }
    this.parts = this.parts.filter(q => q.life > 0);

    // rivals
    const d = this.track.diff;
    for (const c of this.rivals) {
      let target = c.base;
      if (this.state === "demo") target = c.base * 0.95;
      else {
        const gap = c.dist - p.dist;
        const hard = this.diff.id === "hard", easy = this.diff.id === "easy";
        if (gap > 45 * SEG) target *= easy ? 0.8 : hard ? 1 : d <= 1 ? 0.84 : 0.98;
        else if (gap < -45 * SEG) target *= hard ? 1.04 : 1.07;
      }
      c.knockT -= dt;
      if (c.knockT > 0) target *= 0.75;
      c.speed += clamp(target - c.speed, -BASE_MAX * dt / 2, BASE_MAX * dt / 4);
      c.laneT -= dt;
      if (c.laneT <= 0) { c.lane = [-0.6, 0, 0.6][Math.floor(Math.random() * 3)]; c.laneT = 2 + Math.random() * 4; }
      for (const o of [p, ...this.rivals]) {
        if (o === c) continue;
        const g = o.dist - c.dist;
        if (g > 0 && g < 8 * SEG && c.speed > o.speed && Math.abs(o.offset - c.lane) < CAR_W * 1.2) c.lane = clamp(o.offset > 0 ? o.offset - 0.62 : o.offset + 0.62, -0.8, 0.8);
      }
      c.offset += clamp(c.lane - c.offset, -1, 1) * dt * 1.6;
      c.dist += c.speed * dt;
      if (c.air > 0) { c.vy -= GRAVITY * this.phys.gravity * dt; c.air += c.vy * dt; if (c.air <= 0) c.air = c.vy = 0; }
      else if (this.segAt(c.dist).ramp && c.speed > BASE_MAX * 0.3) { c.air = 1; c.vy = JUMP_VY; }
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
        } else if (g > 0 && p.speed > c.speed) {
          p.speed = c.speed * 0.9; p.dist = c.dist - SEG * 0.9;
          if (this.bumpCD <= 0) { h.sfx("bump"); this.bumpCD = 0.4; this.sparks(0.5, 0.78, 8, "#fff6a8"); }
        } else if (g <= 0 && c.speed > p.speed) { c.speed = p.speed * 0.9; c.dist = p.dist - SEG * 0.9; }
      }
    }

    if (racing && p.dist >= this.finishDist) {
      p.finished = true; this.state = "done"; this.order.push(p);
      // everyone's place: finishers in order, then the rest by how far they got. 0 = player, 1-5 = rivals
      const rest = this.rivals.filter(c => !c.finished).sort((a, b) => b.dist - a.dist);
      const standings = [...this.order, ...rest].map(r => r === p ? 0 : this.rivals.indexOf(r) + 1);
      h.onFinish({ place: this.order.length, coins: this.coins, time: this.raceTime, stats: this.runStats, standings });
    }
    h.engine(p.speed / BASE_MAX, fast);
  }

  touch(s) {
    const p = this.player, S = this.stats;
    if (this.state === "demo" || p.finished) return;
    if (s.ramp && p.air <= 0 && p.speed > BASE_MAX * 0.3) {
      p.air = 1; p.vy = JUMP_VY * (this.stats.jump || 1); p.airT = 0; this.hooks.sfx("jump");
    }
    for (const c of s.coins) {
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
        const r = Math.random();
        this.power = r < 0.3 ? "shield" : r < 0.55 ? "coins" : r < 0.8 ? "magnet" : "turbo";
        this.hooks.onPower?.(this.power); this.hooks.sfx("chest"); this.popup("?!", "#ffffff");
      }
    }
    if (s.boost !== null && Math.abs(p.offset - s.boost) < 0.36) {
      if (this.boostT <= 0.3) { this.hooks.sfx("boost"); this.popup("BOOST!", "#3cf2ff"); }
      const key = s.padId + ":" + Math.floor(p.dist / this.T.length);
      if (key !== this.lastPad) { this.lastPad = key; this.runStats.pads++; }
      this.boostT = 1.2;
    }
    if (p.air <= 0 && Math.abs(p.offset) > 1 && this.bonkCD <= 0 && this.shieldT <= 0) {
      for (const spr of s.sprites) {
        const info = SPRITES[spr.type];
        if (info.collide && overlap(p.offset, CAR_W, spr.offset, info.w / ROAD_W * 0.6)) {
          p.speed = Math.min(p.speed, BASE_MAX * (0.15 + 0.1 * this.assist + (this.stats.bumper || 0)));
          p.offset += spr.offset > p.offset ? -0.25 : 0.25;
          this.shake = 0.35; this.bonkCD = 0.6; this.hooks.sfx("bonk"); this.popup("BONK!", "#ffffff");
          break;
        }
      }
    }
  }

  land() {
    const p = this.player;
    p.air = 0; p.vy = 0;
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
      state: this.state, count: Math.ceil(this.count - 0.6), pos, total: all.length,
      lap: clamp(Math.floor(Math.max(0, p.dist) / this.T.length) + 1, 1, this.track.laps), laps: this.track.laps,
      coins: this.coins, nitro: this.nitro, nitroOn: this.nitroT > 0, speed: Math.round(p.speed / 50),
      progress: all.map(r => ({ f: clamp(r.dist / this.finishDist, 0, 1), color: r.def.body, me: r === p })),
    };
  }

  render() {
    const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height, F = H / 2;
    const { segs, length: L, theme: th } = this.T, N = segs.length, p = this.player, t = this.t;
    const carZ = mod(this.startZ + p.dist, L), camZ = mod(carZ - PLAYER_Z, L);
    const base = segs[Math.floor(camZ / SEG) % N], basePct = (camZ % SEG) / SEG;
    const pseg = segs[Math.floor(carZ / SEG) % N], ppct = (carZ % SEG) / SEG;
    const playerY = lerp(pseg.p1.world.y, pseg.p2.world.y, ppct);

    ctx.save();
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * H * 0.03 * this.shake * 3, (Math.random() - 0.5) * H * 0.03 * this.shake * 3);
    drawBackground(ctx, W, H, th, this.skyX, this.hillX, 0, t);

    let maxy = H, x = 0, dx = -(base.curve * basePct);
    const camX = p.offset * ROAD_W, camY = playerY + CAM_H + p.air * 0.55;
    for (let n = 0; n < DRAW_DIST; n++) {
      const s = segs[(base.index + n) % N], cz = camZ - (s.index < base.index ? L : 0);
      s.clip = maxy;
      project(s.p1, camX - x, camY, cz, W, H, F);
      project(s.p2, camX - x - dx, camY, cz, W, H, F);
      x += dx; dx += s.curve;
      if (s.p1.camera.z <= CAM_DEPTH || s.p2.screen.y >= s.p1.screen.y || s.p2.screen.y >= maxy) continue;
      this.drawSegment(ctx, s, th, W);
      maxy = s.p1.screen.y;
    }

    // rivals by segment
    const bySeg = new Map(), behind = [];
    for (const c of this.rivals) {
      const z = mod(this.startZ + c.dist, L), idx = Math.floor(z / SEG) % N;
      const item = { c, pct: (z % SEG) / SEG, s: segs[idx] };
      if (c.dist < p.dist && c.dist > p.dist - PLAYER_Z * 0.95) behind.push(item);
      else { if (!bySeg.has(idx)) bySeg.set(idx, []); bySeg.get(idx).push(item); }
    }

    for (let n = DRAW_DIST - 1; n > 0; n--) {
      const s = segs[(base.index + n) % N];
      if (s.p1.camera.z <= CAM_DEPTH) continue;
      const sc = s.p1.screen.scale, sy = s.p1.screen.y;
      ctx.globalAlpha = n > DRAW_DIST * 0.65 ? Math.max(0, (DRAW_DIST - n) / (DRAW_DIST * 0.35)) : 1;
      if (s.rampStart) this.drawRamp(ctx, s, segs[(s.index + RAMP_LEN - 1) % N], F);
      if (s.index === START) this.drawArch(ctx, s, F);
      for (const spr of s.sprites) {
        const sw = sc * SPRITES[spr.type].w * F, sx = s.p1.screen.x + s.p1.screen.w * spr.offset;
        if (sx + sw < 0 || sx - sw > W || sw < 1) continue;
        this.clipped(ctx, s, sy, () => drawSprite(ctx, spr.type, sx, sy, sw, t));
      }
      for (const c of s.coins) {
        if (c.taken) continue;
        const cw = sc * COIN_W * F, cx = s.p1.screen.x + s.p1.screen.w * c.offset, cy = sy - cw * 0.9 - (c.h ? sc * c.h * F : 0);
        this.clipped(ctx, s, sy, () => drawCoin(ctx, cx, cy, cw, t));
      }
      if (s.boxes) for (const b of s.boxes) {
        if (b.until > t) continue;
        const bw = sc * 420 * F, bx = s.p1.screen.x + s.p1.screen.w * b.offset;
        this.clipped(ctx, s, sy, () => drawBox(ctx, bx, sy - bw * 0.85, bw, t));
      }
      const list = bySeg.get(s.index);
      if (list) for (const it of list) this.drawRival(ctx, it, F);
    }

    ctx.globalAlpha = 1;
    const pw = CAR_W * ROAD_W * F / CAM_H;
    const bounce = Math.abs(p.offset) > 1 && p.speed > 100 ? (Math.random() - 0.5) * H * 0.012 : Math.sin(t * 20) * H * 0.002 * Math.min(1, p.speed / BASE_MAX);
    const lift = p.air * 0.45 / CAM_H * F;
    if (p.air > 0) { ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.ellipse(W / 2, H - H * 0.01, pw * 0.5 * (1 - Math.min(0.5, p.air / 1500)), pw * 0.06, 0, 0, 7); ctx.fill(); }
    const dustCol = th.grass[0];
    for (const q of this.parts) {
      ctx.globalAlpha = Math.min(1, q.life * 2);
      ctx.fillStyle = q.c === "dust" ? dustCol : q.c;
      ctx.beginPath(); ctx.arc(q.x * W, q.y * H, q.r * H * (q.c === "dust" ? 1.5 - q.life : 1), 0, 7); ctx.fill();
      if (q.c === "dust") { ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    drawCar(ctx, W / 2, H - H * 0.02 + bounce - lift, pw, p.def, { t, steer: this.steerVis, nitro: this.nitroT > 0 || this.boostT > 0 });
    if (this.autoTarget !== null) {
      const segs2 = this.T.segs, pidx = pseg.index;
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      for (const k of [4, 8, 12]) {
        const s2 = segs2[(pidx + k) % N]; if (!(s2.p1.camera.z > CAM_DEPTH)) continue;
        const ax = s2.p1.screen.x + s2.p1.screen.w * this.autoTarget, ay = s2.p1.screen.y, aw = s2.p1.screen.w * 0.08;
        quad(ctx, ax - aw, ay, ax, ay - aw * 0.8, ax + aw, ay, ax, ay - aw * 0.35);
      }
      ctx.font = `${Math.round(H * 0.06)}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (Math.sin(t * 6) > -0.6) ctx.fillText("🤖", W / 2 + pw * 0.42, H - H * 0.02 - lift - pw * 0.55);
    }
    if (this.shieldT > 0) {
      const a = this.shieldT < 1.5 ? (Math.sin(t * 30) > 0 ? 0.9 : 0.3) : 0.9;
      ctx.globalAlpha = a; ctx.strokeStyle = "#3cf2ff"; ctx.lineWidth = H * 0.008; ctx.fillStyle = "rgba(60,242,255,0.15)";
      ctx.beginPath(); ctx.ellipse(W / 2, H - H * 0.02 - lift - pw * 0.28, pw * 0.68, pw * 0.42, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1;
    }
    behind.sort((a, b) => b.c.dist - a.c.dist);
    for (const it of behind) this.drawRival(ctx, it, F);

    if (this.nitroT > 0 || this.boostT > 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = Math.max(1, H * 0.004);
      ctx.beginPath();
      for (let k = 0; k < 22; k++) {
        const a = Math.random() * Math.PI * 2, r0 = H * (0.35 + Math.random() * 0.2), r1 = r0 + H * (0.15 + Math.random() * 0.2);
        ctx.moveTo(W / 2 + Math.cos(a) * r0 * 1.6, H * 0.45 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * r1 * 1.6, H * 0.45 + Math.sin(a) * r1);
      }
      ctx.stroke();
    }

    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const q of this.popups) {
      const s = 1 + Math.min(0.3, q.age * 2);
      ctx.globalAlpha = 1 - q.age;
      ctx.font = `900 ${Math.round(H * 0.08 * s)}px system-ui,sans-serif`;
      ctx.lineWidth = H * 0.012; ctx.strokeStyle = "rgba(0,0,0,0.6)";
      const qx = W / 2 + q.x * W, qy = H * 0.5 - q.age * H * 0.15;
      ctx.strokeText(q.text, qx, qy); ctx.fillStyle = q.color; ctx.fillText(q.text, qx, qy);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  clipped(ctx, s, y, fn) {
    if (y <= s.clip) { fn(); return; }
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, this.canvas.width, s.clip); ctx.clip(); fn(); ctx.restore();
  }

  drawRival(ctx, { c, pct, s }, F) {
    if (s.p1.camera.z <= CAM_DEPTH) return;
    const sc = lerp(s.p1.screen.scale, s.p2.screen.scale, pct);
    const x = lerp(s.p1.screen.x, s.p2.screen.x, pct) + sc * c.offset * ROAD_W * F;
    const y = lerp(s.p1.screen.y, s.p2.screen.y, pct) - sc * c.air * F;
    const w = sc * CAR_W * ROAD_W * F;
    if (x + w < 0 || x - w > this.canvas.width) return;
    const steer = c.knockT > 0 ? Math.sin(this.t * 30) * 4 : clamp((c.lane - c.offset) * 3, -1, 1);
    this.clipped(ctx, s, y, () => drawCar(ctx, x, y, w, c.def, { t: this.t, steer }));
  }

  // The ramp is a striped slope from the road surface up to RAMP_H at its far end.
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
    if (s.p1.camera.z <= CAM_DEPTH || e.p2.camera.z <= CAM_DEPTH) return;
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

  drawSegment(ctx, s, th, W) {
    const { x: x1, y: y1, w: w1 } = s.p1.screen, { x: x2, y: y2, w: w2 } = s.p2.screen, a = s.alt;
    ctx.fillStyle = th.grass[a]; ctx.fillRect(0, y2, W, y1 - y2 + 1);
    const r1 = w1 / 6, r2 = w2 / 6;
    ctx.fillStyle = th.rumble[a];
    quad(ctx, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2);
    quad(ctx, x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2);
    ctx.fillStyle = th.road[a];
    quad(ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2);
    if (s.finish) {
      const cols = 10;
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (c + s.index) % 2 ? "#ffffff" : "#111111";
        const a1 = x1 - w1 + (2 * w1 * c) / cols, b1 = x1 - w1 + (2 * w1 * (c + 1)) / cols;
        const a2 = x2 - w2 + (2 * w2 * c) / cols, b2 = x2 - w2 + (2 * w2 * (c + 1)) / cols;
        quad(ctx, a1, y1, b1, y1, b2, y2, a2, y2);
      }
    } else if (a === 0) {
      ctx.fillStyle = th.lane;
      const l1 = w1 / 32, l2 = w2 / 32;
      for (let lane = 1; lane < LANES; lane++) {
        const lx1 = x1 - w1 + (2 * w1 * lane) / LANES, lx2 = x2 - w2 + (2 * w2 * lane) / LANES;
        quad(ctx, lx1 - l1 / 2, y1, lx1 + l1 / 2, y1, lx2 + l2 / 2, y2, lx2 - l2 / 2, y2);
      }
    }
    if (s.boost !== null) {
      const bx1 = x1 + w1 * s.boost, bx2 = x2 + w2 * s.boost, bw1 = w1 * 0.3, bw2 = w2 * 0.3;
      ctx.fillStyle = s.index % 2 ? "#ffd400" : "#ff7a00";
      quad(ctx, bx1 - bw1, y1, bx1 + bw1, y1, bx2 + bw2, y2, bx2 - bw2, y2);
      ctx.fillStyle = s.index % 2 ? "#fff6a8" : "#ffb347";
      quad(ctx, bx1 - bw1 * 0.15, y1, bx1 + bw1 * 0.15, y1, bx2 + bw2 * 0.15, y2, bx2 - bw2 * 0.15, y2);
    }
  }
}
