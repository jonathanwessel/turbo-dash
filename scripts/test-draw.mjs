// 🎨 Checks for the v1.10 drawing shortcuts on the classic road (part of npm test):
// 1. Every roadside thing's height table (SPRITES[...].top, used to skip things hidden behind a hill crest) is at
//    least as tall as what its drawer really paints, so nothing visible is ever skipped. Same for coins, rings,
//    pearls, boxes and cars.
// 2. Small things come from cached pictures only when a canvas exists; without one they draw the normal way.
// 3. The sky and hills stop where the road starts, and full-screen tints are a layer (engine.tint), not canvas fills.
//   node scripts/test-draw.mjs
globalThis.Image = class { constructor() { this.complete = true; this.naturalWidth = 72; this.naturalHeight = 72; } };
const { SPRITES, drawSprite, drawCoin, drawRing, drawPearl, drawBox, drawCar, drawSpritePic, drawCarPic, setPicMaker, COIN_TOP, RING_TOP, PEARL_TOP, BOX_TOP, CAR_TOP } = await import("../src/draw.js");
const { Race } = await import("../src/engine.js");
const { CARS, TRACKS, PACE } = await import("../src/data.js");
const { statsFor } = await import("../src/stats.js");

let fails = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { fails++; console.log("  ✖ " + msg); } };

/* a context that only records how high anything it paints reaches */
function boxCtx() {
  let m = [1, 0, 0, 1, 0, 0], minY = Infinity, calls = 0, images = 0; const st = [];
  const tp = (x, y) => m[1] * x + m[3] * y + m[5];
  const pt = (x, y) => { minY = Math.min(minY, tp(x, y)); };
  const mul = (a, b, c, d, e, f) => { m = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * d, m[1] * c + m[3] * d, m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]]; };
  const sp = {
    save() { st.push(m); }, restore() { m = st.pop() || m; }, translate(x, y) { mul(1, 0, 0, 1, x, y); }, scale(x, y) { mul(x, 0, 0, y, 0, 0); },
    rotate(a) { const c = Math.cos(a), s = Math.sin(a); mul(c, s, -s, c, 0, 0); }, transform: (...a) => mul(...a), setTransform(...a) { m = a; },
    moveTo: pt, lineTo: pt, quadraticCurveTo(a, b, x, y) { pt(a, b); pt(x, y); }, bezierCurveTo(a, b, c, d, x, y) { pt(a, b); pt(c, d); pt(x, y); }, arcTo(a, b, c, d) { pt(a, b); pt(c, d); },
    rect(x, y, w, h) { pt(x, y); pt(x + w, y + h); }, roundRect(x, y, w, h) { pt(x, y); pt(x + w, y + h); }, fillRect(x, y, w, h) { pt(x, y); pt(x + w, y + h); }, strokeRect(x, y, w, h) { pt(x, y); pt(x + w, y + h); },
    arc(x, y, r) { pt(x, y - r); pt(x, y + r); }, ellipse(x, y, rx, ry) { const R = Math.max(Math.abs(rx), Math.abs(ry)); pt(x, y - R); pt(x, y + R); },
    drawImage(im, x, y, w, h) { images++; pt(x, y); pt(x + (w || 0), y + (h || 0)); }, fillText(s, x, y) { pt(x, y - 20); },
    measureText: () => ({ width: 5 }), createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
  };
  const props = { font: "10px sans-serif" };
  const ctx = new Proxy({}, { get: (_, k) => k in props ? props[k] : (...a) => { calls++; return sp[k]?.(...a); }, set: (_, k, v) => { props[k] = v; return true; } });
  return { ctx, top: () => -minY, calls: () => calls, images: () => images };
}
const tallest = paint => { let top = 0; for (const t of [0, 0.3, 0.7, 1.1, 2.3, 3.7, 5.1, 7.9]) for (const seed of [0, 1, 2, 3, 5, 8, 13]) { const b = boxCtx(); paint(b.ctx, t, seed); top = Math.max(top, b.top() / 100); } return top; };

// 1. heights
for (const type of Object.keys(SPRITES)) {
  const top = tallest((c, t, s) => drawSprite(c, type, 0, 0, 100, t, s));
  check(typeof SPRITES[type].top === "number" && top <= SPRITES[type].top + 1e-9, `${type} paints up to ${top.toFixed(2)} of its width, but its height table says ${SPRITES[type].top}`);
}
for (const [name, want, paint] of [["coin", COIN_TOP, (c, t) => drawCoin(c, 0, 0, 100, t)], ["ring", RING_TOP, (c, t) => drawRing(c, 0, 0, 100, t)], ["pearl", PEARL_TOP, (c, t) => drawPearl(c, 0, 0, 100, t)], ["box", BOX_TOP, (c, t) => drawBox(c, 0, 0, 100, t)]]) {
  const top = tallest(paint); check(top <= want, `${name} paints up to ${top.toFixed(2)}, more than ${want}`);
}
{ let top = 0; for (const car of CARS) for (const steer of [-1, 0, 1]) { const b = boxCtx(); drawCar(b.ctx, 0, 0, 100, car, { t: 1, steer, spin: 0.3, lean: steer * 0.5 }); top = Math.max(top, b.top() / 100); }
  check(top <= CAR_TOP, `a car paints up to ${top.toFixed(2)} of its width, more than CAR_TOP ${CAR_TOP}`); }

// 2. pictures: none without a canvas, one drawImage with one
{
  setPicMaker(null);
  const b = boxCtx(); check(drawSpritePic(b.ctx, "tree", 0, 0, 12, 0, true) === false && b.images() === 0, "without a canvas, sprites must draw the normal way");
  let made = 0; const quiet = boxCtx().ctx;
  setPicMaker((w, h) => { made++; return { width: w, height: h, getContext: () => quiet }; });
  const c = boxCtx();
  check(drawSpritePic(c.ctx, "tree", 10, 50, 12, 3, true) === true && c.images() === 1 && c.calls() === 1, "a small tree should be one drawImage");
  drawSpritePic(c.ctx, "tree", 30, 50, 11, 3, true);
  check(made === 1, `the same picture should be made once (made ${made})`);
  check(drawSpritePic(c.ctx, "lavaflame", 0, 0, 40, 0) === false, "a flame 40 px wide moves too much for a still picture");
  check(drawSpritePic(c.ctx, "tree", 0, 0, 200, 0) === false, "a big tree draws live");
  check(drawCarPic(c.ctx, 0, 0, 20, CARS[1], 0, false) === true, "a small rival car comes from a picture");
  check(drawCarPic(c.ctx, 0, 0, 20, { ...CARS[1], rainbow: true }, 0, false) === false, "rainbow paint always draws live");
  setPicMaker(null);
}

// 3. the background stops at the road, and tints are a layer
{
  const W = 1152, H = 720, fills = [];
  const ctx = new Proxy({}, { get: (_, k) => k === "font" ? "10px sans-serif" : k === "createLinearGradient" || k === "createRadialGradient" ? () => ({ addColorStop() {} }) : k === "measureText" ? () => ({ width: 5 }) : k === "fillRect" ? (x, y, w, h) => fills.push([x, y, w, h]) : () => {}, set: () => true });
  const race = new Race({ width: W, height: H, getContext: () => null }, { sfx() {}, engine() {}, onFinish() {} });
  race.ctx = ctx;
  const car = CARS[0], st = statsFor(car, { engine: 0, turbo: 0, tires: 0, magnet: 0 }, {});
  race.setup(TRACKS.find(t => t.id === "sunny"), "race", car, st, { diff: "normal", weather: "rain" });
  for (let i = 0; i < 300; i++) race.update(PACE / 60);
  race.render();
  check(race.bgBottom > H * 0.3 && race.bgBottom < H * 0.75, `the sky should stop near the far end of the road (stopped at ${race.bgBottom} of ${H})`);
  check(/rgba\(40,60,90/.test(race.tint || ""), `rain should set the grey tint layer (tint "${race.tint}")`);
  const full = fills.filter(([x, y, w, h]) => x <= 0 && y <= 0 && w >= W && h >= H).length;
  check(full === 1, `only the sky (clipped at the road) may fill the whole canvas; tints are a layer now (${full} full fills)`);
  const sea = TRACKS.find(t => race.T && t.world === "ocean");
  if (sea) { race.setup(sea, "race", car, st, { diff: "normal" }); for (let i = 0; i < 200; i++) race.update(PACE / 60); race.render(); check(/rgba\(10,70,120/.test(race.tint || ""), "under the sea sets the blue tint layer"); }
  for (const q of [1, 2, 3]) { race.quality = q; race.lite = q === 1; race.render(); }
  check(race.drawn && race.drawn.sprites >= 0, "the renderer counts what it drew");
}

console.log(fails ? `\n✖ ${fails} of ${checks} drawing checks failed` : `All ${checks} drawing checks passed`);
process.exit(fails ? 1 : 0);
