// 🖼️ The picture guard (v1.16.1, M0). Tests can stay green while a drawing goes missing (v1.11.0 shipped with six
// road features gone), so this draws one fixed race frame per classic world on the game's real canvas code and
// compares it with the picture kept from the last accepted build. A large difference fails until the new picture
// is accepted on purpose.
//   npm run guard               -> compare, exit 1 on a large difference (new and diff pictures land in .guard/)
//   npm run guard -- --accept   -> keep the current pictures as the accepted ones (scripts/guard/*.png, committed)
// How the frame is made: the dev server on 127.0.0.1:5184 (never the play server on 5183), headless Edge with a
// throwaway profile (scripts/cdp.mjs). In the page, a separate Race (src/engine.js, the same module the game uses)
// draws into its own 640x400 canvas with Math.random seeded and fixed 1/60 steps, the kid bot steering as in
// scripts/perf.mjs, until a boost pad sits a few road pieces ahead. All of it runs in one go, so the game's own
// frame loop can never step in between. Then render() once and read the pixels.
// A pixel counts as changed when one color channel moved by more than 40. The frame fails when more than 0.5% of
// it changed, or when one 8x8 block changed by more than 30% (a small thing gone, such as one boost pad).
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "./cdp.mjs";

const root = resolve(import.meta.dirname, "..");
const ACCEPT = process.argv.includes("--accept");
const keep = join(root, "scripts", "guard"), out = join(root, ".guard");
const DEV = 5184, URL0 = `http://127.0.0.1:${DEV}/`;
const W = 640, H = 400, BLOCK = 8, PIX = 40, MAX_ALL = 0.005, MAX_BLOCK = 0.3;
const WORLDS = ["earth", "moon", "ocean", "glacier", "toy"];   // v1.18: Toy Track World (3D) too
const wait = ms => new Promise(r => setTimeout(r, ms));

/* 📺 v1.20.1: three screens from the career bot's Rank 16 save, at 1280x800 (a tablet), in a second page that holds
   everything that moves or changes by itself: the clock stops at one moment (Date, so the rival of the week, the Lab
   timers and the bank read the same every run, in UTC), Math.random is seeded, the one-time tips are marked seen,
   every CSS animation and transition is off (the town's cars, flags and pulsing buttons sit at their rest place), the
   race behind the menus is hidden (the race frames above guard it), toasts are hidden, and the frame loop is held
   before each picture with the Garage car in one fixed pose (no bounce). Each screen opens the way the player opens
   it, from its Main Street button. */
const SW = 1280, SH = 800, FIXED_NOW = Date.UTC(2026, 0, 7, 17, 0, 0);
const tap = go => `document.querySelector('[data-go="${go}"]').dispatchEvent(new MouseEvent("click", { bubbles: true }))`;
const SCREENS = {
  garage: `(__td.goHub(), ${tap("garage")}, !document.getElementById("s-garage").hidden)`,
  tracks: `(__td.goHub(), ${tap("race")}, document.getElementById("s-rival").hidden || document.getElementById("rw-ok").click(), !document.getElementById("s-tracks").hidden)`,
  street: `(__td.goHub(), !document.getElementById("s-hub").hidden)`,
};
const stillInit = `(() => {
  const FIX = ${FIXED_NOW}, RD = Date;
  function FD(...a) { if (!new.target) return new RD(FIX).toString(); return a.length ? new RD(...a) : new RD(FIX); }
  FD.prototype = RD.prototype; FD.now = () => FIX; FD.UTC = RD.UTC; FD.parse = RD.parse; window.Date = FD;
  let s = 777; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const raf = window.requestAnimationFrame.bind(window); window.__hold = false;
  window.requestAnimationFrame = cb => raf(t => window.__hold ? window.requestAnimationFrame(cb) : cb(t));
  try { localStorage.setItem("turbodash.tips", JSON.stringify({ horn: 1, best: 1, traits: 1, kinds: 1 })); } catch (e) {}
})()`;
const STILL_CSS = "#toast,#fx,#game,#gl{visibility:hidden!important}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}";
/* runs in the page: the same changed-pixel count as the race frames, for two pictures of any (equal) size */
const diffIn = async ({ a, b, BLOCK, PIX }) => {
  const load = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const [ia, ib] = [await load(a), await load(b)];
  const W = ib.width, H = ib.height;
  if (ia.width !== W || ia.height !== H) return { changed: 1, block: 1, diff: b };
  const ctx = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c.getContext("2d"); };
  const ca = ctx(), cb = ctx(), cd = ctx(); ca.drawImage(ia, 0, 0); cb.drawImage(ib, 0, 0);
  const A = ca.getImageData(0, 0, W, H).data, B = cb.getImageData(0, 0, W, H).data, D = cd.createImageData(W, H);
  const bx = Math.ceil(W / BLOCK), blocks = new Array(bx * Math.ceil(H / BLOCK)).fill(0);
  let n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, ch = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
    if (ch > PIX) { n++; blocks[Math.floor(y / BLOCK) * bx + Math.floor(x / BLOCK)]++; D.data[i] = 255; D.data[i + 1] = 0; D.data[i + 2] = 200; D.data[i + 3] = 255; }
    else { const g = (B[i] + B[i + 1] + B[i + 2]) / 3 * 0.35; D.data[i] = D.data[i + 1] = D.data[i + 2] = g; D.data[i + 3] = 255; }
  }
  cd.putImageData(D, 0, 0);
  return { changed: n / (W * H), block: Math.max(...blocks) / (BLOCK * BLOCK), diff: cd.canvas.toDataURL("image/png") };
};

/* runs in the page: one seeded frame per world, compared with the accepted picture when there is one */
const inPage = async ({ worlds, accepted, W, H, BLOCK, PIX }) => {
  const { Race } = await import("/src/engine.js");
  const { statsFor } = await import("/src/stats.js");
  const { PACE, CARS, TRACKS } = await import("/src/data.js");
  const mk = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c; };
  const loadImg = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const ups = { engine: 0, turbo: 0, tires: 0, magnet: 0 };
  /* 🧸 v1.18: Toy Track World draws with three.js (WebGL; in headless Edge that is SwiftShader, so the accepted
     picture is this machine's). A ToyRace (src/toy/race.js) with its own ToyView on a 640x400 picture, the "light"
     look a tablet gets, Math.random seeded (the car's rattle and the shake use it), fixed 1/60 steps and the kid bot.
     The frame kept is the first one, at least 3 seconds into the race, with the car on the track and a row of coins
     just ahead of it in the picture. The 3D view is drawn once, with the camera snapped to its place (no smoothing
     left over from earlier frames), and read in the same go (a WebGL picture is gone after the browser shows it). */
  let toyView = null;
  const toyFrame = async () => {
    const { ToyRace } = await import("/src/toy/race.js");
    const { ToyView } = await import("/src/toy/view.js");
    const { toyPoint } = await import("/src/toy/track.js");
    const real = Math.random; let s = 12345;
    Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
    try {
      const track = TRACKS.find(t => t.world === "toy"), car = CARS.find(c => c.id === "toyRacer");
      if (!toyView) { const gl = mk(), ov = mk(); toyView = new ToyView(gl, ov, { tier: "light" }); toyView.glc = gl; toyView.ovc = ov; }
      const race = new ToyRace(null, { sfx() {}, engine() {}, onFinish() {}, onPower() {} });
      race.view = toyView;
      race.setup(track, "race", car, statsFor(car, ups, {}), { diff: "normal" });
      while (race.state === "countdown") race.update(1 / 60);
      const T = race.T, p = race.player;
      const coinsAhead = () => T.coins.some(c => !c.taken && !c.air && !c.loop && c.s - p.dist > 8 && c.s - p.dist < 26 && Math.abs(c.x - p.x) < 2.5);
      // coins drawn in the open middle of the picture (not at its edges, where the car or a pop-up could hide them)
      const coinsOnScreen = () => T.coins.filter(c => {
        if (c.taken || c.s - p.dist < 6 || c.s - p.dist > 24) return false;
        const v = new toyView.camera.position.constructor(...toyPoint(T, c.s, c.x, c.h + 1)).project(toyView.camera);
        return v.z < 1 && Math.abs(v.x) < 0.8 && v.y > -0.3 && v.y < 0.6;
      }).length;
      let f = 0, seen = false, shown = 0;
      for (; f < 4000 && race.state === "race" && !seen; f++) {
        race.input.left = p.offset > 0.7; race.input.right = p.offset < -0.7;
        race.update(1 / 60);
        // a quiet moment (no pop-ups stacked over the road) with a row of coins just ahead, then checked on screen
        if (race.raceTime >= 3 && p.air <= 0 && p.fallT <= 0 && !race.popups.length && race.shake <= 0 && coinsAhead()) {
          toyView.snapCam = true; toyView.draw(race); shown = coinsOnScreen(); seen = shown >= 3;
        }
      }
      toyView.snapCam = true; toyView.draw(race);
      const canvas = mk(), c = canvas.getContext("2d");
      c.drawImage(toyView.glc, 0, 0, W, H); c.drawImage(toyView.ovc, 0, 0);
      return { canvas, frames: f, pad: seen, track: track.id + ", " + shown + " coins on screen" };
    } finally { Math.random = real; }
  };
  const frameOf = (world, warm) => {
    if (world === "toy") return toyFrame();
    const real = Math.random; let s = 12345;
    Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647;
    try {
      const track = TRACKS.find(t => t.world === world), car = CARS[0], canvas = mk();
      const race = new Race(canvas, { sfx() {}, engine() {}, onFinish() {} });
      race.lite = false; race.quality = 3;
      race.setup(track, "race", car, statsFor(car, ups, {}), { diff: "normal" });
      while (race.state === "countdown") race.update(1 / 60);
      const STEP = PACE / 60, N = race.T.segs.length, SEG = race.T.length / N;
      // a boost pad drawn in the open band just in front of the cars (not under them, not tiny in the distance),
      // read from the road pieces' screen places that render() has just worked out
      // (at least 3 of its 6 pieces, each a few pixels deep), with no rival car on the road between the player and the pad's far end
      const piece = d => Math.floor((race.startZ + d) / SEG);
      const padSeen = () => { const i = piece(race.player.dist); let n = 0, far = 0;
        for (let k = 1; k <= 40; k++) { const s = race.T.segs[(i + k) % N];
          if (s.boost !== null && s.p1.screen.y <= H * 0.74 && s.p2.screen.y >= H * 0.54 && s.p1.screen.y > s.p2.screen.y + 2) { n++; far = k; } }
        return n >= 3 && !race.rivals.some(r => { const k = piece(r.dist) - i; return k >= 0 && k <= far + 2; }); };
      let f = 0, pad = false;
      for (; f < 4000 && race.state === "race" && !pad; f++) {
        const p = race.player; race.input.left = p.offset > 0.7; race.input.right = p.offset < -0.7;
        if (Math.random() < 0.6 * STEP) race.useNitro(); if (race.power && Math.random() < 1.2 * STEP) race.usePower();
        race.update(STEP);
        if (f >= 90 && p.air <= 0) { race.render(); pad = padSeen(); }   // the frame kept is the one just drawn
      }
      return { canvas, frames: f, pad, track: track.id };
    } finally { Math.random = real; }
  };
  // a first frame per world loads the pictures the road draws (emoji sprites); the real frames come after
  for (const w of worlds) await frameOf(w);
  await new Promise(r => setTimeout(r, 1500));
  const res = {};
  for (const w of worlds) {
    const { canvas, frames, pad, track } = await frameOf(w);
    const png = canvas.toDataURL("image/png"), r = { frames, pad, track, png };
    if (accepted[w]) {
      // compare the PNG round trip of both, so the two sides are read the same way
      const a = mk().getContext("2d"), b = mk().getContext("2d");
      a.drawImage(await loadImg(accepted[w]), 0, 0); b.drawImage(await loadImg(png), 0, 0);
      const A = a.getImageData(0, 0, W, H).data, B = b.getImageData(0, 0, W, H).data;
      const diff = mk(), d = diff.getContext("2d"), D = d.createImageData(W, H);
      const bx = Math.ceil(W / BLOCK), blocks = new Array(bx * Math.ceil(H / BLOCK)).fill(0);
      let n = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, ch = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
        if (ch > PIX) { n++; blocks[Math.floor(y / BLOCK) * bx + Math.floor(x / BLOCK)]++; D.data[i] = 255; D.data[i + 1] = 0; D.data[i + 2] = 200; D.data[i + 3] = 255; }
        else { const g = (B[i] + B[i + 1] + B[i + 2]) / 3 * 0.35; D.data[i] = D.data[i + 1] = D.data[i + 2] = g; D.data[i + 3] = 255; }
      }
      d.putImageData(D, 0, 0);
      r.changed = n / (W * H); r.block = Math.max(...blocks) / (BLOCK * BLOCK); r.diff = diff.toDataURL("image/png");
    }
    res[w] = r;
  }
  return res;
};

let vite = null, browser = null;
function stopVite() { if (vite) { try { process.platform === "win32" ? spawnSync("taskkill", ["/pid", String(vite.pid), "/T", "/F"], { stdio: "ignore" }) : vite.kill("SIGKILL"); } catch {} vite = null; } }

async function main() {
  vite = spawn(process.execPath, [join(root, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", String(DEV), "--strictPort"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  let log = ""; vite.stdout.on("data", d => log += d); vite.stderr.on("data", d => log += d);
  for (let t = Date.now(); ; await wait(250)) {
    try { if ((await fetch(URL0)).ok) break; } catch {}
    if (Date.now() - t > 60000) throw new Error("the dev server did not start\n" + log);
  }
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.goto(URL0);
  for (let t = Date.now(); !(await page.evaluate("!!(window.__td && document.readyState === 'complete')").catch(() => false)); await wait(250))
    if (Date.now() - t > 60000) throw new Error("the game did not load");
  await page.evaluate("document.fonts.ready.then(() => true)");
  const accepted = {};
  if (!ACCEPT) for (const w of WORLDS) { const f = join(keep, w + ".png"); if (existsSync(f)) accepted[w] = "data:image/png;base64," + readFileSync(f).toString("base64"); }
  const res = await page.evaluate(inPage, { worlds: WORLDS, accepted, W, H, BLOCK, PIX });
  if (errors.length) throw new Error("the page threw: " + errors[0]);
  const png = u => Buffer.from(u.split(",")[1], "base64");
  let bad = 0;
  rmSync(out, { recursive: true, force: true });
  for (const w of WORLDS) {
    const r = res[w], at = `${r.track}, ${r.frames} steps`;
    if (!r.pad) { bad++; console.log(`  ✖ ${w.padEnd(8)} ${w === "toy" ? "no coins came into view" : "no boost pad came into view"} (${at})`); continue; }
    if (ACCEPT) { mkdirSync(keep, { recursive: true }); writeFileSync(join(keep, w + ".png"), png(r.png)); console.log(`  ✔ ${w.padEnd(8)} accepted (${at})`); continue; }
    if (!r.diff) { bad++; console.log(`  ✖ ${w.padEnd(8)} has no accepted picture. Look at it, then npm run guard -- --accept`); mkdirSync(out, { recursive: true }); writeFileSync(join(out, w + ".png"), png(r.png)); continue; }
    const big = r.changed > MAX_ALL || r.block > MAX_BLOCK;
    const line = `${(r.changed * 100).toFixed(2)}% changed, worst block ${(r.block * 100).toFixed(0)}% (${at})`;
    console.log(`  ${big ? "✖" : "✔"} ${w.padEnd(8)} ${line}`);
    if (big) { bad++; mkdirSync(out, { recursive: true }); writeFileSync(join(out, w + ".png"), png(r.png)); writeFileSync(join(out, w + "-diff.png"), png(r.diff)); }
  }
  await page.close();
  // 📺 the screens (see SCREENS above)
  const sp = await browser.newPage();
  await sp.addInitScript(stillInit);
  await sp.cdp("Emulation.setTimezoneOverride", { timezoneId: "UTC" });
  await sp.setViewportSize({ width: SW, height: SH });
  sp.on("pageerror", e => errors.push(e.message));
  await sp.goto(URL0);
  for (let t = Date.now(); !(await sp.evaluate("!!(window.__td && window.__mid && document.readyState === 'complete')").catch(() => false)); await wait(250))
    if (Date.now() - t > 60000) throw new Error("the game did not load for the screens");
  await sp.evaluate("document.fonts.ready.then(() => true)");
  await sp.evaluate(`(Object.assign(__td.S, __mid()), __td.refreshCoins(), document.head.insertAdjacentHTML('beforeend', '<style>${STILL_CSS}</style>'), true)`);
  await wait(1500);   // the emoji pictures the screens draw load once
  for (const [name, open] of Object.entries(SCREENS)) {
    const key = "screen-" + name;
    await sp.evaluate("(window.__hold = false, true)");
    const opened = await sp.evaluate(open);
    await wait(900);   // the coin counter and any card settle
    await sp.evaluate("(window.__hold = true, true)"); await wait(150);
    await sp.evaluate("(!document.getElementById('s-garage').hidden && __td.garage.pose(0), true)");
    const shot = await sp.screenshot(), url = "data:image/png;base64," + shot.toString("base64");
    if (errors.length) throw new Error("the page threw: " + errors[0]);
    if (!opened) { bad++; console.log(`  ✖ ${key.padEnd(14)} did not open`); continue; }
    if (ACCEPT) { mkdirSync(keep, { recursive: true }); writeFileSync(join(keep, key + ".png"), shot); console.log(`  ✔ ${key.padEnd(14)} accepted`); continue; }
    const f = join(keep, key + ".png");
    if (!existsSync(f)) { bad++; console.log(`  ✖ ${key.padEnd(14)} has no accepted picture. Look at it, then npm run guard -- --accept`); mkdirSync(out, { recursive: true }); writeFileSync(join(out, key + ".png"), shot); continue; }
    const r = await sp.evaluate(diffIn, { a: "data:image/png;base64," + readFileSync(f).toString("base64"), b: url, BLOCK, PIX });
    const big = r.changed > MAX_ALL || r.block > MAX_BLOCK;
    console.log(`  ${big ? "✖" : "✔"} ${key.padEnd(14)} ${(r.changed * 100).toFixed(2)}% changed, worst block ${(r.block * 100).toFixed(0)}% (${SW}x${SH}, Rank 16 save)`);
    if (big) { bad++; mkdirSync(out, { recursive: true }); writeFileSync(join(out, key + ".png"), shot); writeFileSync(join(out, key + "-diff.png"), png(r.diff)); }
  }
  if (ACCEPT) { console.log(`Accepted pictures written to scripts/guard/. Commit them with the change that made them.`); return bad ? 1 : 0; }
  console.log(bad ? `\n✖ ${bad} pictures changed a lot. Look at .guard/ (new picture, and -diff in pink). If the change is on purpose: npm run guard -- --accept` : "All race and screen pictures match");
  return bad ? 1 : 0;
}

let code = 1;
try { code = await main(); }
catch (e) { console.error("✖ guard failed: " + e.message); }
finally { try { await browser?.close(); } catch {} stopVite(); }
process.exit(code);
