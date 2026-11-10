// 📈 Drawing cost of the classic road, measured headless (v1.10). The game draws into a counting stand-in for the
// canvas, so this counts canvas calls, gradients and painted pixels per frame. It can't time a real tablet, but it
// catches a change that makes every frame do more work.
//   npm run perf                 -> the table, and a check against scripts/perf-budget.json (fails 10% over)
//   npm run perf -- --write      -> record the current numbers as the new budget
//   node scripts/perf.mjs [root] -> measure another checkout (for before/after numbers)
// Columns: ops = canvas method calls + property sets, grad = gradients made, area = pixels painted divided by the
// canvas size (1.00 = one whole screen), bg = of that, the sky and hills, img = pictures drawn (cached sprites and
// cars), spr = roadside things drawn, skip = things skipped because they sat wholly behind a hill crest.
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), WRITE = args.includes("--write"), root = args.find(a => !a.startsWith("--")) || path.join(here, "..");
const imp = f => import(pathToFileURL(path.join(root, f)).href);
globalThis.Image = class { constructor() { this.complete = true; this.naturalWidth = 72; this.naturalHeight = 72; this.width = 72; this.height = 72; } };

const { Race } = await imp("src/engine.js");
const { statsFor } = await imp("src/stats.js");
const { PACE, CARS, TRACKS } = await imp("src/data.js");
const draw = await imp("src/draw.js");
const W = 1152, H = 720, FRAMES = 300;

/* a 2D context that counts, and works out how many pixels each fill paints (clipped to the canvas and to clip rects) */
function makeCtx(H0) {
  const st = { ops: 0, grads: 0, area: 0, bg: 0, img: 0, inBg: true };
  const props = { font: "10px sans-serif", globalAlpha: 1, fillStyle: "#000", strokeStyle: "#000", lineWidth: 1, globalCompositeOperation: "source-over", textAlign: "start", textBaseline: "alphabetic", lineCap: "butt", lineJoin: "miter", lineDashOffset: 0 };
  let m = [1, 0, 0, 1, 0, 0], clipB = H0, subs = [], cur = null, ell = [], lastRect = null; const stack = [];
  const tp = (x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  const mul = (a, b, c, d, e, f) => { m = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * d, m[1] * c + m[3] * d, m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]]; };
  const clipPoly = pts => {
    const edges = [[p => p[0] >= 0, (a, b) => [0, a[1] + (b[1] - a[1]) * (0 - a[0]) / (b[0] - a[0])]], [p => p[0] <= W, (a, b) => [W, a[1] + (b[1] - a[1]) * (W - a[0]) / (b[0] - a[0])]],
      [p => p[1] >= 0, (a, b) => [a[0] + (b[0] - a[0]) * (0 - a[1]) / (b[1] - a[1]), 0]], [p => p[1] <= clipB, (a, b) => [a[0] + (b[0] - a[0]) * (clipB - a[1]) / (b[1] - a[1]), clipB]]];
    for (const [inside, cut] of edges) { const out = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], ia = inside(a), ib = inside(b); if (ia) out.push(a); if (ia !== ib) out.push(cut(a, b)); } pts = out; if (!pts.length) break; }
    return pts;
  };
  const shoelace = p => { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return Math.abs(a) / 2; };
  const add = a => { if (a > 0 && Number.isFinite(a)) { st.area += a; if (st.inBg) st.bg += a; } };
  const det = () => Math.abs(m[0] * m[3] - m[1] * m[2]);
  const sp = {
    save() { stack.push([m, clipB, { ...props }]); }, restore() { const s = stack.pop(); if (s) { m = s[0]; clipB = s[1]; Object.assign(props, s[2]); } },
    translate(x, y) { mul(1, 0, 0, 1, x, y); }, scale(x, y) { mul(x, 0, 0, y, 0, 0); }, rotate(a) { const c = Math.cos(a), s = Math.sin(a); mul(c, s, -s, c, 0, 0); },
    transform(...a) { mul(...a); }, setTransform(...a) { m = a; },
    beginPath() { subs = []; cur = null; ell = []; lastRect = null; }, moveTo(x, y) { cur = [tp(x, y)]; subs.push(cur); }, lineTo(x, y) { if (!cur) { cur = []; subs.push(cur); } cur.push(tp(x, y)); },
    quadraticCurveTo(a, b, x, y) { sp.lineTo(a, b); sp.lineTo(x, y); }, bezierCurveTo(a, b, c, d, x, y) { sp.lineTo(a, b); sp.lineTo(c, d); sp.lineTo(x, y); }, arcTo(a, b, c, d) { sp.lineTo(a, b); sp.lineTo(c, d); },
    rect(x, y, w, h) { subs.push([tp(x, y), tp(x + w, y), tp(x + w, y + h), tp(x, y + h)]); cur = null; lastRect = tp(x, y + h)[1]; }, roundRect(x, y, w, h) { sp.rect(x, y, w, h); },
    arc(x, y, r, a0, a1) { sp.ellipse(x, y, r, r, 0, a0, a1); },
    ellipse(x, y, rx, ry, rot, a0, a1) { const fr = Math.min(1, Math.abs(a1 - a0) / (2 * Math.PI)), d = Math.sqrt(det()), c = tp(x, y), X = Math.abs(rx) * d, Y = Math.abs(ry) * d;
      const x0 = Math.max(0, c[0] - X), x1 = Math.min(W, c[0] + X), y0 = Math.max(0, c[1] - Y), y1 = Math.min(clipB, c[1] + Y);
      ell.push(X > 0 && Y > 0 && x1 > x0 && y1 > y0 ? Math.PI * X * Y * fr * ((x1 - x0) * (y1 - y0)) / (4 * X * Y) : 0); },
    fill() { for (const s of subs) if (s.length >= 3) add(shoelace(clipPoly(s))); for (const e of ell) add(e); },
    clip() { if (lastRect != null && m[1] === 0 && m[2] === 0) clipB = Math.min(clipB, lastRect); },
    fillRect(x, y, w, h) { add(shoelace(clipPoly([tp(x, y), tp(x + w, y), tp(x + w, y + h), tp(x, y + h)]))); },
    drawImage(im, x, y, w, h) { st.img++; add(shoelace(clipPoly([tp(x, y), tp(x + w, y), tp(x + w, y + h), tp(x, y + h)]))); },
    createLinearGradient() { st.grads++; return { addColorStop() { st.ops++; } }; }, createRadialGradient() { st.grads++; return { addColorStop() { st.ops++; } }; },
    measureText(s) { return { width: String(s).length * 6 }; },
  };
  const fns = {};
  const ctx = new Proxy({}, {
    get(_, k) { if (k in props) return props[k]; if (k === "canvas") return { width: W, height: H0 }; return fns[k] || (fns[k] = (...a) => { st.ops++; return sp[k] ? sp[k](...a) : undefined; }); },
    set(_, k, v) { props[k] = v; st.ops++; return true; },
  });
  st.reset = () => { m = [1, 0, 0, 1, 0, 0]; clipB = H0; stack.length = 0; st.inBg = true; props.globalAlpha = 1; };
  return { ctx, st };
}
/* cached pictures (src/draw.js) need somewhere to draw: a canvas that paints nothing and costs nothing per frame */
const quiet = new Proxy({}, { get: (_, k) => k === "createLinearGradient" || k === "createRadialGradient" ? () => ({ addColorStop() {} }) : k === "measureText" ? () => ({ width: 6 }) : () => {}, set: () => true });
draw.setPicMaker?.((w, h) => ({ width: w, height: h, getContext: () => quiet }));

const seed = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
const STEP = PACE / 60;
function run(id, weather, quality) {
  Math.random = seed(12345);
  const track = TRACKS.find(t => t.id === id), car = CARS[0], H0 = H;
  const { ctx, st } = makeCtx(H0), canvas = { width: W, height: H0, getContext: () => null };
  const race = new Race(canvas, { sfx() {}, engine() {}, onFinish() {} });
  race.ctx = ctx; race.lite = quality === 1; race.quality = quality;
  race.setup(track, "race", car, statsFor(car, { engine: 0, turbo: 0, tires: 0, magnet: 0 }, {}), { diff: "normal", weather });
  race.lite = quality === 1; race.quality = quality;
  while (race.state === "countdown") race.update(1 / 60);
  const road = Race.prototype.drawRoad; race.drawRoad = function (...a) { st.inBg = false; return road.apply(this, a); };
  const sum = { ops: 0, grads: 0, area: 0, bg: 0, img: 0, spr: 0, skip: 0, max: 0, n: 0 };
  for (let f = 0; f < FRAMES && race.state === "race"; f++) {
    const p = race.player; race.input.left = p.offset > 0.7; race.input.right = p.offset < -0.7;
    if (Math.random() < 0.6 * STEP) race.useNitro(); if (race.power && Math.random() < 1.2 * STEP) race.usePower();
    race.update(STEP);
    st.reset(); const o0 = st.ops, g0 = st.grads, a0 = st.area, b0 = st.bg, i0 = st.img;
    race.render();
    const ops = st.ops - o0; sum.ops += ops; sum.max = Math.max(sum.max, ops); sum.grads += st.grads - g0; sum.area += st.area - a0; sum.bg += st.bg - b0; sum.img += st.img - i0;
    sum.spr += race.drawn?.sprites ?? NaN; sum.skip += race.drawn?.skipped ?? NaN; sum.n++;
  }
  const k = 1 / sum.n, px = W * H0;
  return { ops: Math.round(sum.ops * k), max: sum.max, grads: +(sum.grads * k).toFixed(1), area: +(sum.area * k / px).toFixed(2), bg: +(sum.bg * k / px).toFixed(2), img: +(sum.img * k).toFixed(1), spr: +(sum.spr * k).toFixed(1), skip: +(sum.skip * k).toFixed(1) };
}

const CONFIGS = [["sunny"], ["sunny", "rain"], ["fair"], ["haunted"], ["night"], ["lava"], ["caves"], ["crater"], ["kelp"], ["icecave"]];
const out = {};
console.log(`canvas ${W}x${H}, ${FRAMES} race frames each, starter car, kid bot, seeded`);
console.log("track        level    ops    max  grad  area    bg   img   spr  skip");
for (const [id, weather] of CONFIGS) for (const q of [3, 1]) {
  const r = run(id, weather || null, q), name = id + (weather ? "+" + weather : "");
  out[name + ":" + q] = r;
  console.log(name.padEnd(12), String(q).padStart(5), String(r.ops).padStart(6), String(r.max).padStart(6), String(r.grads).padStart(5), r.area.toFixed(2).padStart(5), r.bg.toFixed(2).padStart(5), String(r.img).padStart(5), String(r.spr).padStart(5), String(r.skip).padStart(5));
}
const budgetFile = path.join(here, "perf-budget.json");
if (WRITE) { fs.writeFileSync(budgetFile, JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { ops: v.ops, area: v.area, grads: v.grads }])), null, 1) + "\n"); console.log("budget written"); process.exit(0); }
if (root !== path.join(here, "..") || !fs.existsSync(budgetFile)) process.exit(0);
const budget = JSON.parse(fs.readFileSync(budgetFile, "utf8")); let bad = 0;
for (const [k, b] of Object.entries(budget)) { const r = out[k]; if (!r) continue;
  for (const f of ["ops", "area", "grads"]) if (r[f] > b[f] * 1.1 + (f === "grads" ? 1 : 0)) { bad++; console.log(`  ✖ ${k}: ${f} ${r[f]} is over the budget ${b[f]} (+10%)`); } }
console.log(bad ? `\n✖ ${bad} drawing budgets exceeded` : "All drawing budgets met");
process.exit(bad ? 1 : 0);
