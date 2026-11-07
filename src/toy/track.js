// 🧸 Toy Track World: the Next Gen track builder. A toy track is a closed loop of plastic track with side
// walls, laid out on the floor of a giant playroom: banked curves, hills on stilts, loop-the-loops, jumps over
// gaps and booster stations. Everything here is plain math (no 3D library), so the race simulators can use it.
//
// The track is a list of evenly spaced samples (every DS units). Each sample has a position, a forward
// direction, an "up" direction (tilted on banked curves, pointing to the middle inside a loop) and a "right"
// direction. A car is placed by distance along the track (s) and sideways offset (x, 0 = middle).

export const DS = 0.5;          // spacing between samples
export const HW = 4;            // half the track width (walls at ±HW)
export const WALL_H = 1.2;      // wall height
export const BASE_Y = 1.6;      // the track floats a little above the floor on short stilts
export const CAR_HW = 0.8;      // half a car's width
export const LIMIT = HW - CAR_HW - 0.1;   // the farthest sideways a car can go before it touches a wall

function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const smooth = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* A closed Catmull-Rom curve through the points, sampled every DS: returns x, z, heading arrays. */
function planCurve(pts) {
  const n = pts.length, dense = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    for (let k = 0; k < 80; k++) {
      const t = k / 80, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  // resample evenly by arc length
  const cum = [0];
  for (let i = 1; i <= dense.length; i++) { const a = dense[i - 1], b = dense[i % dense.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const L = cum[cum.length - 1], N = Math.floor(L / DS), X = new Float64Array(N), Z = new Float64Array(N);
  let j = 0;
  for (let i = 0; i < N; i++) {
    const s = i * L / N;
    while (cum[j + 1] < s) j++;
    const a = dense[j], b = dense[(j + 1) % dense.length], u = (s - cum[j]) / (cum[j + 1] - cum[j] || 1);
    X[i] = a[0] + (b[0] - a[0]) * u; Z[i] = a[1] + (b[1] - a[1]) * u;
  }
  const H = new Float64Array(N);
  for (let i = 0; i < N; i++) { const a = (i - 1 + N) % N, b = (i + 1) % N; H[i] = Math.atan2(Z[b] - Z[a], X[b] - X[a]); }
  return { X, Z, H, N, step: L / N };
}

const cache = new Map();
export function buildToyTrack(track) {
  if (cache.has(track.id)) return cache.get(track.id);
  const r = rng(track.seed * 7919), d = track.diff || 12;

  // 1) the plan seen from above: a wobbly closed loop around the playroom floor
  // (try a few layouts and keep the first one with no curve tighter than the track can bend around)
  let P, NP, step, K, KS;
  for (let tries = 0; tries < 40; tries++) {
    const n = 9 + Math.floor(r() * 4), RX = 160 + r() * 50, RZ = 110 + r() * 35;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.3, rad = 0.72 + r() * 0.42;
      pts.push([Math.cos(a) * RX * rad, Math.sin(a) * RZ * rad]);
    }
    P = planCurve(pts); NP = P.N; step = P.step;
    // curvature (smoothed so banking doesn't jitter): positive = turning right
    K = new Float64Array(NP);
    for (let i = 0; i < NP; i++) { let dh = P.H[(i + 1) % NP] - P.H[(i - 1 + NP) % NP]; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); K[i] = dh / (2 * step); }
    KS = new Float64Array(NP); const W = 14;
    for (let i = 0; i < NP; i++) { let a = 0; for (let k = -W; k <= W; k++) a += K[(i + k + NP) % NP]; KS[i] = a / (2 * W + 1); }
    if (Math.max(...K.map(Math.abs)) < 0.055) break;
  }

  // 2) features, placed on straight-ish stretches of the plan, never too close to each other or to the start line
  const used = [];
  const free = (a, b) => a > 40 / step && b < NP - 40 / step && used.every(([u, v]) => b < u - 30 / step || a > v + 30 / step);
  const straight = (a, b) => { for (let i = a; i <= b; i++) if (Math.abs(KS[(i + NP) % NP]) > 0.009) return false; return true; };
  const find = (before, after, tries = 400) => {
    for (let t = 0; t < tries; t++) {
      const c = Math.floor(r() * NP), a = c - Math.ceil(before / step), b = c + Math.ceil(after / step);
      if (free(a, b) && straight(a, b)) { used.push([a, b]); return c; }
    }
    return -1;
  };
  const R = 7, loops = [], jumps = [], hills = [], boosts = [];
  const nLoops = d >= 12.6 ? 2 : 1;
  for (let k = 0; k < nLoops; k++) { const c = find(45, 30); if (c >= 0) loops.push(c); }
  for (let k = 0; k < 2; k++) { const c = find(20, 40); if (c >= 0) jumps.push(c); }
  for (const c of loops) boosts.push(c - Math.round(32 / step));               // a booster right before every loop
  for (let k = 0; k < 2; k++) { const c = find(6, 10, 300); if (c >= 0) boosts.push(c); }
  for (let k = 0; k < 4; k++) {
    const len = 50 + Math.floor(r() * 30), c = find(len / 2, len / 2, 200);
    if (c >= 0) hills.push({ c, half: len / 2 / step, h: 4 + r() * 5 });
  }

  // elevation of the plan (above BASE_Y), and the jump gaps
  const E = new Float64Array(NP), GAP = new Uint8Array(NP);
  for (const hl of hills) for (let i = -Math.ceil(hl.half); i <= hl.half; i++) { const u = (i + hl.half) / (2 * hl.half); E[(hl.c + i + NP) % NP] += hl.h * (1 - Math.cos(2 * Math.PI * u)) / 2; }
  const RAMP = 12, GAPL = 16, LAND = 14, RAMP_H = 2.6, LAND_H = 1.4;
  for (const c of jumps) {
    const a = Math.round(RAMP / step), g = Math.round(GAPL / step), l = Math.round(LAND / step);
    for (let i = 0; i < a; i++) E[(c - a + i + NP) % NP] += RAMP_H * smooth(i / a);
    for (let i = 0; i < g; i++) { E[(c + i) % NP] += RAMP_H + (LAND_H - RAMP_H) * i / g; GAP[(c + i) % NP] = 1; }
    for (let i = 0; i < l; i++) E[(c + g + i) % NP] += LAND_H * (1 - smooth(i / l));
  }

  // 3) the final path: walk the plan, and at each loop spot insert a full vertical circle
  const loopAt = new Map(loops.map(c => [c, true]));
  const lat = new Float64Array(NP);   // sideways shift so the loop's way out passes beside its way in
  const SH = 8.4, BL = Math.round(25 / step);
  for (const c of loops) for (let i = 0; i < BL; i++) {
    lat[(c - BL + i + NP) % NP] += -SH / 2 * smooth(i / BL);
    lat[(c + i) % NP] += SH / 2 * (1 - smooth(i / BL));
  }
  const out = { px: [], py: [], pz: [], fx: [], fy: [], fz: [], ux: [], uy: [], uz: [], rx: [], ry: [], rz: [], k: [], bank: [], flag: [] };
  // flag bits: 1 loop, 2 gap, 4 booster
  const push = (p, f, u, rt, k, bank, flag) => {
    out.px.push(p[0]); out.py.push(p[1]); out.pz.push(p[2]); out.fx.push(f[0]); out.fy.push(f[1]); out.fz.push(f[2]);
    out.ux.push(u[0]); out.uy.push(u[1]); out.uz.push(u[2]); out.rx.push(rt[0]); out.ry.push(rt[1]); out.rz.push(rt[2]);
    out.k.push(k); out.bank.push(bank); out.flag.push(flag);
  };
  const planS = [];        // final index -> plan index (for mapping features)
  const finalOf = new Int32Array(NP);
  const loopsOut = [], gapsOut = [];
  for (let i = 0; i < NP; i++) {
    const h = P.H[i], fwd = [Math.cos(h), 0, Math.sin(h)], right = [-Math.sin(h), 0, Math.cos(h)];
    if (loopAt.has(i)) {
      // the way in ends on the left (-SH/2) and the way out starts on the right (+SH/2), so the loop drifts sideways
      const g0 = [P.X[i], BASE_Y + E[i], P.Z[i]], start = out.px.length, M = Math.round(2 * Math.PI * R / DS);
      for (let m = 0; m < M; m++) {
        const ph = (m / M) * 2 * Math.PI, side = SH * (m / M - 0.5);
        const pos = [g0[0] + fwd[0] * R * Math.sin(ph) + right[0] * side, g0[1] + R * (1 - Math.cos(ph)), g0[2] + fwd[2] * R * Math.sin(ph) + right[2] * side];
        const f = [fwd[0] * Math.cos(ph), Math.sin(ph), fwd[2] * Math.cos(ph)], u = [-fwd[0] * Math.sin(ph), Math.cos(ph), -fwd[2] * Math.sin(ph)];
        push(pos, f, u, right, 0, 0, 1); planS.push(i);
      }
      loopsOut.push({ s0: start * DS, s1: out.px.length * DS, R });
    }
    finalOf[i] = out.px.length;
    const slope = (E[(i + 1) % NP] - E[(i - 1 + NP) % NP]) / (2 * step);
    const bank = clamp(KS[i] * 22, -0.45, 0.45);
    let f = [fwd[0], slope, fwd[2]]; const fl = Math.hypot(...f); f = f.map(v => v / fl);
    // up: world up tilted toward the inside of the curve, then made square to the forward direction
    let u = [right[0] * Math.sin(bank), Math.cos(bank), right[2] * Math.sin(bank)];
    const dot = u[0] * f[0] + u[1] * f[1] + u[2] * f[2]; u = [u[0] - dot * f[0], u[1] - dot * f[1], u[2] - dot * f[2]]; const ul = Math.hypot(...u); u = u.map(v => v / ul);
    const rt = [f[1] * u[2] - f[2] * u[1], f[2] * u[0] - f[0] * u[2], f[0] * u[1] - f[1] * u[0]];
    const pos = [P.X[i] + right[0] * lat[i], BASE_Y + E[i], P.Z[i] + right[2] * lat[i]];
    push(pos, f, u, rt, KS[i], bank, GAP[i] ? 2 : 0); planS.push(i);
  }
  const N = out.px.length, L = N * DS;
  const T = { track, N, L, R };
  for (const k of Object.keys(out)) T[k] = Float32Array.from(out[k]);
  const fi = c => finalOf[(c + NP) % NP];
  for (const c of jumps) { const a = fi(c), b = fi(c + Math.round(GAPL / step)); gapsOut.push({ s0: a * DS, s1: b * DS, i0: a, i1: b }); }
  T.loops = loopsOut; T.gaps = gapsOut;
  // booster stations: 6 units long, the whole width of the track
  T.boosts = boosts.map((c, id) => { const a = fi(c); for (let j = 0; j < Math.round(6 / DS); j++) T.flag[(a + j) % N] |= 4; return { s0: a * DS, s1: (a + Math.round(6 / DS)) * DS, id }; });

  // coins: rows down the straights, a ring of coins around each loop, and an arc of coins over each gap
  const coins = [];
  for (let i = Math.round(50 / step); i < NP - 30 / step; i += Math.round((40 + r() * 35) / step)) {
    if (GAP[i] || used.some(([u, v]) => i >= u && i <= v)) continue;
    let x = [-2.3, 0, 2.3][Math.floor(r() * 3)]; const drift = r() < 0.4 ? (r() < 0.5 ? -0.5 : 0.5) : 0;
    for (let j = 0; j < 6; j++) { coins.push({ s: fi(i + Math.round(j * 3 / step)) * DS, x: clamp(x, -2.6, 2.6), h: 0 }); x += drift; }
  }
  for (const lp of loopsOut) for (let j = 1; j < 8; j++) coins.push({ s: lp.s0 + (lp.s1 - lp.s0) * j / 8, x: 0, h: 0, loop: true });
  for (const g of gapsOut) for (let j = 0; j < 7; j++) { const u = (j + 0.5) / 7; coins.push({ s: g.s0 + (g.s1 - g.s0) * u, x: 0, h: 2.2 + 5 * Math.sin(Math.PI * u), air: true }); }
  T.coins = coins.sort((a, b) => a.s - b.s).map(c => ({ ...c, i: Math.floor(c.s / DS) % N, taken: false }));
  // power-up boxes: three across the track, a few times a lap
  const boxes = [];
  for (let i = Math.round(120 / step); i < NP - 60 / step; i += Math.round((160 + r() * 80) / step)) {
    let k = i; while (k < NP - 60 / step && (GAP[k] || Math.abs(KS[k]) > 0.02 || used.some(([u, v]) => k >= u - 4 && k <= v + 4))) k++;
    if (k >= NP - 60 / step) break;
    boxes.push({ s: fi(k) * DS, i: fi(k), xs: [-2.4, 0, 2.4], until: [0, 0, 0] });
    i = k;
  }
  T.boxes = boxes;
  // per-sample lookups so the race can check "what did I drive over" quickly
  T.coinsAt = new Map(); for (const c of T.coins) { if (!T.coinsAt.has(c.i)) T.coinsAt.set(c.i, []); T.coinsAt.get(c.i).push(c); }
  T.boxAt = new Map(boxes.map(b => [b.i, b]));
  T.loopEnd = new Map(loopsOut.map(lp => [Math.round(lp.s1 / DS) % N, lp]));
  cache.set(track.id, T);
  return T;
}

/* Where a point on the track is in the 3D world: s along the track, x sideways, h above the surface. */
export function toyPoint(T, s, x = 0, h = 0, out = [0, 0, 0]) {
  const L = T.L, ss = ((s % L) + L) % L, f = ss / DS, i = Math.floor(f) % T.N, j = (i + 1) % T.N, u = f - Math.floor(f);
  for (let a = 0; a < 3; a++) {
    const P = [T.px, T.py, T.pz][a], R = [T.rx, T.ry, T.rz][a], U = [T.ux, T.uy, T.uz][a];
    out[a] = P[i] + (P[j] - P[i]) * u + (R[i] + (R[j] - R[i]) * u) * x + (U[i] + (U[j] - U[i]) * u) * h;
  }
  return out;
}
export const sampleAt = (T, s) => Math.floor((((s % T.L) + T.L) % T.L) / DS) % T.N;
