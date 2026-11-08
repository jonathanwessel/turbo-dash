// 🧸 Toy Track World race: the Next Gen engine. It talks to the rest of the game exactly like the classic Race
// (setup / update / render / hud / useNitro / usePower / input / player / rivals), so the menus, HUD, cups,
// bosses, Time Trials and the race simulators all work unchanged. Physics only: no 3D library in here.
// The 3D picture comes from ./view.js, which the game loads the first time a toy race starts (this.view).
//
// How it drives: cars follow the plastic track by distance (dist) with a sideways position (x). Walls keep you
// on the track (bumping them slows you), curves push you outward (banking helps), hills and loops speed you up
// going down and slow you going up. A loop needs speed: too slow at the top and you fall off, and a friendly toy
// hand puts you back. Jumps fly over gaps; too slow and you drop in (the hand again). Booster stations fling you.
import { RIVALS, PHYSICS, diffOf, MPH } from "../data.js";
import { BASE_MAX, rivalBase, rubberBand, rng, strSeed } from "../physics-common.js";
import { buildToyTrack, sampleAt, DS, LIMIT } from "./track.js";

export const V0 = 26;            // toy-world speed of a starter car (track units per second)
const G = 30;                    // gravity
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

export class ToyRace {
  constructor(canvas, hooks) {
    this.canvas = canvas; this.hooks = hooks; this.view = null;
    this.input = { left: false, right: false }; this.t = 0; this.popups = []; this.fx = []; this.shake = 0;
  }

  setup(track, mode, car, stats, opts = {}) {
    const T = this.T = buildToyTrack(track);
    this.track = track; this.mode = mode; this.stats = stats;
    this.phys = PHYSICS[track.world] || PHYSICS.toy;
    this.diff = diffOf(opts.diff);
    this.assist = Math.max(this.diff.assist, opts.helper || 0); this.pull = opts.helper || 0;
    this.autoLvl = mode === "race" ? (opts.autoSteer || 0) : 0; this.autoTarget = null;
    for (const c of T.coins) c.taken = false;
    for (const b of T.boxes) b.until = [0, 0, 0];
    this.power = null; this.shieldT = 0; this.magnetT = 0; this.hooks.onPower?.(null);
    this.state = mode === "demo" ? "demo" : "countdown"; this.count = 3.6; this.raceTime = 0;
    this.finishDist = track.laps * T.L;
    this.nitro = Math.min(1, 0.35 + (stats.startNitro || 0)); this.nitroT = 0; this.boostT = 0; this.wallCD = 0; this.bumpCD = 0;
    this.coins = 0; this.popups = []; this.fx = []; this.order = [];
    this.runStats = { stunts: 0, turbos: 0, bams: 0, powers: 0, pads: 0, rings: 0, pearls: 0, drifts: 0, loops: 0 };
    const slot = k => ({ dist: -(Math.floor(k / 2) + 1) * 5, x: k % 2 ? 1.7 : -1.7 });
    this.player = { isPlayer: true, def: car, speed: mode === "demo" ? V0 * 1.2 : 0, finished: false, air: 0, vy: 0, airT: 0, fly: false, fallT: 0, landV: 0, landN: 0, ...slot(5),
      get offset() { return this.x / LIMIT; } };   // the classic engine's -1..1 across the road, for the race bot
    this.raceSeq = (this.raceSeq || 0) + 1; this.rand = rng(strSeed(track.id) * 97 + this.raceSeq);
    const d = track.diff;
    this.rivals = RIVALS.map((def, i) => ({ def, ...slot(i), speed: mode === "demo" ? V0 : 0, lane: slot(i).x, laneT: 1 + i, knockT: 0, finished: false, air: 0,
      base: V0 * rivalBase(d, i) * this.phys.rival * (mode === "demo" ? 0.8 : this.diff.rival) }));
    if (opts.boss) this.rivals = [{ def: opts.boss.def, name: opts.boss.name, ...slot(4), speed: 0, lane: slot(4).x, laneT: 2, knockT: 0, finished: false, air: 0,
      base: V0 * opts.boss.speed * this.diff.rival * this.phys.rival, boss: true, btT: 5, bt: 0 }];
    this.trial = !!opts.trial; this.ghost = opts.ghost || null; this.rec = { d: [], o: [], a: [] }; this.recT = 0;
    this.ghostDef = { ...car, body: "#cfefff", accent: "#ffffff", rainbow: false, shiny: false, sticker: "none", dirt: 0 };
    if (this.trial) this.rivals = [];
    if (mode === "demo") this.player.dist = 2;
    this.prevIdx = sampleAt(T, this.player.dist);
    this.lastPad = null;
    this.view?.reset?.(this);
  }

  ghostAt(time) {
    const g = this.ghost; if (!g || !g.d?.length) return null;
    const f = Math.max(0, time / 0.1 - 1), i = Math.floor(f), k = f - i;
    if (i >= g.d.length - 1) return null;
    return { dist: lerp(g.d[i], g.d[i + 1], k), x: lerp(g.o[i], g.o[i + 1], k), air: lerp(g.a?.[i] || 0, g.a?.[i + 1] || 0, k) };
  }
  popup(text, color = "#fff") { this.popups.push({ text, color, age: 0, x: (Math.random() - 0.5) * 0.2 }); }

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
  useNitro() {
    if (this.state !== "race" || this.player.finished || this.nitro < 1) return false;
    this.nitro = 0; this.nitroT = this.nitroFull = this.stats.nitroTime; this.hooks.sfx("nitro"); this.runStats.turbos++; this.popup("TURBO!", "#ffd400"); return true;
  }
  topSpeed() { const S = this.stats; return S.maxSpeed / BASE_MAX * V0 * (this.player.def.toy ? 1 : 0.96); }

  /* Auto Steer (the same research as everywhere): stay in the middle, later grab coins and boxes, later use Turbo */
  autoSteer(i) {
    const L = this.autoLvl, T = this.T, p = this.player;
    let target = 0;
    if (L >= 26) for (let k = 4; k < 60; k++) { const cs = T.coinsAt.get((i + k) % T.N); const c = cs && cs.find(c => !c.taken && !c.air); if (c) { target = c.x; break; } }
    if (L >= 46 && !this.power) for (let k = 4; k < 60; k++) { const b = T.boxAt.get((i + k) % T.N); if (b) { target = b.xs[1]; break; } }
    if (L >= 86) { if (this.nitro >= 1) this.useNitro(); if (this.power) this.usePower(); }
    this.autoTarget = target / LIMIT;
    return clamp((target - p.x) * (0.6 + L / 60) + T.k[i] * p.speed * 0.6 * (L / 100), -1, 1);
  }

  update(dt) {
    this.t += dt;
    const p = this.player, S = this.stats, h = this.hooks, T = this.T, N = T.N;
    for (const q of this.popups) q.age += dt;
    this.popups = this.popups.filter(q => q.age < 1);
    this.shake = Math.max(0, this.shake - dt);
    if (this.state === "countdown") {
      const before = Math.ceil(this.count - 0.6); this.count -= dt; const now = Math.ceil(this.count - 0.6);
      if (now !== before && now > 0) h.sfx("beep");
      if (this.count <= 0.6) { this.state = "race"; h.sfx("go"); }
      h.engine(0.05, false); return;
    }
    const racing = this.state === "race";
    if (racing) this.raceTime += dt;
    const auto = this.state === "demo" || p.finished;
    let i = sampleAt(T, p.dist);
    const fast = this.nitroT > 0 || this.boostT > 0;

    // 🖐️ fell off a loop or into a gap: the toy hand lifts the car back onto the track
    if (p.fallT > 0) {
      p.fallT -= dt; p.air -= 14 * dt;
      if (p.fallT <= 0) { p.dist = p.backTo; p.x = 0; p.air = 0; p.vy = 0; p.fly = false; p.speed = V0 * 0.7; this.prevIdx = sampleAt(T, p.dist); this.popup("BACK ON TRACK!", "#ffffff"); this.fx.push({ type: "hand", t: this.t }); }
      this.tickRivals(dt); this.timers(dt, racing, p); return;
    }

    // steering
    let steer = auto ? clamp(-p.x * 0.6 + T.k[i] * p.speed * 0.25, -1, 1) : !this.input.left && !this.input.right && Number.isFinite(this.input.axis) ? this.input.axis : (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    this.autoTarget = null;
    if (!auto && steer === 0 && this.autoLvl > 0 && racing) steer = this.autoSteer(i) * (0.15 + 0.85 * this.autoLvl / 100);
    this.steerVis = lerp(this.steerVis || 0, steer, Math.min(1, dt * 10));

    // speed: engine up to top speed, gravity along the track (downhill and loop-down speed you up)
    const top = auto ? V0 * (p.finished ? 0.8 : 1.2) : this.topSpeed() * (fast ? 1.25 : 1);
    const acc = S.accel / BASE_MAX * V0 * (S.windUp || 1);
    if (p.speed < top) p.speed = Math.min(top, p.speed + acc * (fast ? 3 : 1) * dt);
    else p.speed = Math.max(top, p.speed - V0 * 0.5 * dt);
    if (!p.fly) p.speed = Math.max(V0 * 0.15, p.speed - G * T.fy[i] * dt);

    const inLoop = T.flag[i] & 1;
    if (inLoop && !p.fly && !auto) {
      // a loop: at the top you need enough speed to stay on (Loop Grip research helps)
      const need = -G * T.uy[i] * (1 - (S.loopGrip || 0));
      if (p.speed * p.speed / T.R < need) {
        const lp = T.loops.find(l => p.dist % T.L >= l.s0 - 1 && p.dist % T.L <= l.s1 + 1);
        this.fall(lp ? p.dist - (p.dist % T.L) + lp.s1 + 4 : p.dist + 20, "OOPS! TOO SLOW!");
        this.timers(dt, racing, p); return;
      }
    }

    // sideways: steer, get pushed outward on curves (banking pushes back), bump the walls
    const sp = clamp(p.speed / V0, 0, 2.4);
    const help = this.assist;
    p.x += steer * dt * 3.2 * (auto ? 1.2 : S.handling) * (p.fly ? 0.55 * (S.airCtl || 1) : 1) * Math.min(1, 0.4 + sp * 0.5);
    if (!p.fly && !auto) p.x -= (p.speed * p.speed * T.k[i] - G * Math.sin(T.bank[i])) * 0.055 * (1 - S.grip) * (1 - 0.25 * help) * dt;
    if (!auto && steer === 0 && this.pull > 0 && Math.abs(p.x) > LIMIT * (0.8 - 0.15 * this.pull)) p.x -= Math.sign(p.x) * dt * (1.2 + 1.6 * this.pull);
    if (Math.abs(p.x) > LIMIT) {
      p.x = Math.sign(p.x) * LIMIT;
      if (!auto && this.wallCD <= 0) {
        if (this.shieldT <= 0) p.speed *= 1 - 0.1 * (1 - (S.wallBumper || 0));
        this.wallCD = 0.35; h.sfx("bump"); this.fx.push({ type: "spark", dist: p.dist, x: p.x, t: this.t });
      }
    }
    p.dist += p.speed * dt;

    // jumps: launch at the start of a gap, fly, land after it (or drop in and get the hand)
    const j = sampleAt(T, p.dist);
    if (!p.fly && (T.flag[j] & 2) && !(T.flag[i] & 2)) { p.fly = true; p.air = 0.01; p.vy = p.speed * Math.max(0.12, T.fy[i]) * 1.4 + 2; p.airT = 0; p.y0 = T.py[i]; h.sfx("jump"); }
    if (p.fly) {
      p.vy -= G * dt; p.airT += dt;
      p.air = p.air + p.vy * dt + (T.py[i] - T.py[j]);        // height above the track below us
      if (p.air <= 0 && !(T.flag[j] & 2)) this.land();
      else if (p.air < -5 && (T.flag[j] & 2)) {
        const g = T.gaps.find(g => p.dist % T.L >= g.s0 - 2 && p.dist % T.L <= g.s1 + 2);
        this.fall(g ? p.dist - (p.dist % T.L) + g.s1 + 6 : p.dist + 20, "OOPS! INTO THE GAP!"); this.timers(dt, racing, p); return;
      }
    }

    // everything we drove over this frame
    let k = this.prevIdx, guard = 0;
    if ((((j - k) % N) + N) % N > N / 2) k = j;   // moved backwards (a bump): nothing new was driven over
    while (k !== j && guard++ < 60) { k = (k + 1) % N; this.touch(k); }
    this.prevIdx = j;

    this.tickRivals(dt);
    this.timers(dt, racing, p);

    if (racing && !p.finished && p.dist >= this.finishDist) {
      p.finished = true; this.state = "done"; this.order.push(p);
      const rest = this.rivals.filter(c => !c.finished).sort((a, b) => b.dist - a.dist);
      const standings = [...this.order, ...rest].map(r => r === p ? 0 : this.rivals.indexOf(r) + 1);
      h.onFinish({ place: this.order.length, coins: this.coins, time: this.raceTime, stats: this.runStats, standings, rec: this.trial ? this.rec : null });
    }
    h.engine(p.speed / V0, fast);
  }

  timers(dt, racing, p) {
    if (this.trial && racing && !p.finished) {
      this.recT += dt;
      while (this.recT >= 0.1) { this.recT -= 0.1; this.rec.d.push(Math.round(p.dist * 10) / 10); this.rec.o.push(Math.round(p.x * 100) / 100); this.rec.a.push(Math.round(Math.max(0, p.air) * 10) / 10); }
    }
    if (this.fx.length > 30) this.fx.splice(0, this.fx.length - 30);
    if (racing && !p.finished) this.nitro = Math.min(1, this.nitro + this.stats.nitroFill * dt);
    this.nitroT -= dt; this.boostT -= dt; this.wallCD -= dt; this.bumpCD -= dt; this.shieldT -= dt; this.magnetT -= dt;
  }

  fall(backTo, text) {
    const p = this.player;
    p.fallT = 1.4; p.backTo = backTo; p.fly = false; this.hooks.sfx("bonk"); this.popup(text, "#ffffff"); this.shake = 0.3; this.fx.push({ type: "fall", t: this.t });
  }

  land() {
    const p = this.player; p.landV = Math.max(0, -p.vy); p.landN = (p.landN || 0) + 1; p.fly = false; p.air = 0; p.vy = 0;
    if (this.state === "demo" || p.finished) return;
    this.hooks.sfx("land"); this.shake = Math.max(this.shake, 0.15);
    if (p.airT > 0.35) {
      this.coins += 3 + Math.floor((this.stats.courage || 0) / 3); this.runStats.stunts++;
      this.boostT = Math.max(this.boostT, 0.9 + 0.08 * (this.stats.courage || 0)); this.nitro = Math.min(1, this.nitro + 0.1);
      this.popup(["BIG JUMP!", "AIR TIME!", "WHOOSH!", "AWESOME!"][Math.floor(Math.random() * 4)], "#5be36a");
    }
  }

  touch(k) {
    const p = this.player, S = this.stats, T = this.T, h = this.hooks;
    if (this.state === "demo" || p.finished) return;
    if (T.flag[k] & 4) {
      const pad = T.boosts.find(b => k * DS >= b.s0 - 1 && k * DS <= b.s1 + 1), key = (pad ? pad.id : -1) + ":" + Math.floor(p.dist / T.L);
      p.speed = Math.max(p.speed, this.topSpeed() * 1.3 * (S.boosterTune || 1));
      this.boostT = Math.max(this.boostT, 1.4 * (S.boosterTune || 1));
      if (key !== this.lastPad) { this.lastPad = key; this.runStats.pads++; h.sfx("boost"); this.popup("BOOSTER!", "#3cf2ff"); this.fx.push({ type: "boost", t: this.t }); }
    }
    const lp = T.loopEnd.get(k);
    if (lp) { this.runStats.loops++; this.coins += 3; this.popup("LOOP-THE-LOOP!", "#ff8ad8"); h.sfx("chest"); }
    const cs = T.coinsAt.get(k);
    if (cs) for (const c of cs) {
      if (c.taken) continue;
      const reachH = c.air ? Math.abs(p.air - c.h) < 2.6 + (this.magnetT > 0 ? 3 : 0) : p.air < 1.6;
      if (reachH && Math.abs(c.x - p.x) < 1.25 + S.magnet * 4 + (this.magnetT > 0 ? 5 : 0)) {
        c.taken = true; this.coins++; this.nitro = Math.min(1, this.nitro + 0.012); h.sfx("coin");
        if (this.coins % 5 === 0) this.popup("+" + this.coins, "#ffd400");
      }
    }
    const b = T.boxAt.get(k);
    if (b && p.air < 1.6) b.xs.forEach((bx, n) => {
      if (b.until[n] > this.t || Math.abs(bx - p.x) > 1.5) return;
      b.until[n] = this.t + 6;
      if (!this.power) {
        const r = Math.random();
        this.power = r < 0.3 ? "shield" : r < 0.55 ? "coins" : r < 0.8 ? "magnet" : "turbo";
        h.onPower?.(this.power); h.sfx("chest"); this.popup("?!", "#ffffff");
      }
    });
  }

  tickRivals(dt) {
    const p = this.player, T = this.T, d = this.track.diff, fast = this.nitroT > 0 || this.boostT > 0;
    for (const c of this.rivals) {
      let target = c.base;
      if (c.boss) { c.btT -= dt; c.bt -= dt; if (c.btT <= 0) { c.bt = 2; c.btT = 8 + Math.random() * 3; } if (c.bt > 0) target *= 1.2; }
      else if (this.state === "demo") target = c.base * 0.95;
      else {
        target *= rubberBand(c.dist - p.dist, this.diff.id);
      }
      const ci = sampleAt(T, c.dist);
      if (T.flag[ci] & 4) target *= 1.15;                  // rivals ride the boosters too
      c.knockT -= dt; if (c.knockT > 0) target *= 0.75;
      c.speed += clamp(target - c.speed, -V0 * dt / 2, V0 * dt / 4);
      c.laneT -= dt;
      if (c.laneT <= 0) { c.lane = [-2.2, 0, 2.2][Math.floor(this.rand() * 3)]; c.laneT = 2 + this.rand() * 4; }
      for (const o of [p, ...this.rivals]) {
        if (o === c) continue;
        const g = o.dist - c.dist;
        if (g > 0 && g < 9 && c.speed > o.speed && Math.abs(o.x - c.lane) < 1.8) c.lane = clamp(o.x > 0 ? o.x - 2.3 : o.x + 2.3, -LIMIT, LIMIT);
      }
      c.x += clamp(c.lane - c.x, -1, 1) * dt * 3;
      for (const o of this.rivals) {
        if (o === c || Math.abs(o.dist - c.dist) > 3) continue;
        const dx = c.x - o.x, need = 1.75 - Math.abs(dx);
        if (need > 0) { const dir = dx > 0 || (dx === 0 && c.dist > o.dist) ? 1 : -1, k = Math.min(need, dt * 6) / 2; c.x = clamp(c.x + dir * k, -LIMIT, LIMIT); o.x = clamp(o.x - dir * k, -LIMIT, LIMIT); }
      }
      c.dist += c.speed * dt;
      // over a gap rivals fly in a neat arc (they never miss)
      const g = (T.flag[ci] & 2) && T.gaps.find(g => c.dist % T.L >= g.s0 && c.dist % T.L <= g.s1);
      c.air = g ? 4.5 * Math.sin(Math.PI * ((c.dist % T.L) - g.s0) / (g.s1 - g.s0)) : 0;
      if (this.state !== "demo" && !c.finished && c.dist >= this.finishDist) { c.finished = true; this.order.push(c); }
      const gap = c.dist - p.dist;
      if (this.state !== "demo" && p.fallT <= 0 && Math.abs(p.air - c.air) < 1.5 && Math.abs(gap) < 2.6 && Math.abs(p.x - c.x) < 1.6) {
        if (fast || this.shieldT > 0) {
          if (c.knockT <= 0) { c.x = clamp(c.x + (c.x >= p.x ? 1 : -1) * 2.4, -LIMIT, LIMIT); c.lane = c.x; c.knockT = 1; this.popup("BAM!", "#ff6b3d"); this.hooks.sfx("bam"); this.shake = 0.2; this.runStats.bams++; this.fx.push({ type: "spark", dist: c.dist, x: c.x, t: this.t }); }
        } else if (Math.abs(gap) < 1.2) {
          const dir = p.x >= c.x ? 1 : -1; p.x = clamp(p.x + dir * 0.3, -LIMIT, LIMIT); c.x = clamp(c.x - dir * 0.4, -LIMIT, LIMIT); c.lane = c.x;
          if (this.bumpCD <= 0) { this.hooks.sfx("bump"); this.bumpCD = 0.4; p.speed *= 0.97; c.speed *= 0.97; }
        } else if (gap > 0 && p.speed > c.speed) { p.speed = c.speed * 0.9; p.dist = c.dist - 2.6; if (this.bumpCD <= 0) { this.hooks.sfx("bump"); this.bumpCD = 0.4; } }
        else if (gap <= 0 && c.speed > p.speed) { c.speed = p.speed * 0.9; c.dist = p.dist - 2.6; }
      }
    }
  }

  hud() {
    const p = this.player, all = [p, ...this.rivals];
    const pos = p.finished ? this.order.indexOf(p) + 1 : 1 + this.rivals.filter(c => c.dist > p.dist).length;
    return {
      state: this.state, count: Math.ceil(this.count - 0.6), pos, total: all.length, trial: this.trial, time: this.raceTime,
      lap: clamp(Math.floor(Math.max(0, p.dist) / this.T.L) + 1, 1, this.track.laps), laps: this.track.laps,
      coins: this.coins, nitro: this.nitro, nitroOn: this.nitroT > 0, tankBurn: this.nitroT > 0 && this.nitroFull ? Math.min(1, this.nitroT / this.nitroFull) : null, speed: Math.round(p.speed * 10), mph: Math.max(0, Math.round(p.speed / V0 * MPH)),
      progress: all.map(r => ({ f: clamp(r.dist / this.finishDist, 0, 1), color: r.def.body, me: r === p })),
    };
  }

  render() { this.view?.draw(this); }
}
