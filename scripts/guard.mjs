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
const WORLDS = ["earth", "moon", "ocean", "glacier"];   // Toy Track World (3D) and the screens come next (PLAN.md)
const wait = ms => new Promise(r => setTimeout(r, ms));

/* runs in the page: one seeded frame per world, compared with the accepted picture when there is one */
const inPage = async ({ worlds, accepted, W, H, BLOCK, PIX }) => {
  const { Race } = await import("/src/engine.js");
  const { statsFor } = await import("/src/stats.js");
  const { PACE, CARS, TRACKS } = await import("/src/data.js");
  const mk = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c; };
  const loadImg = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const ups = { engine: 0, turbo: 0, tires: 0, magnet: 0 };
  const frameOf = (world, warm) => {
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
  for (const w of worlds) frameOf(w);
  await new Promise(r => setTimeout(r, 1500));
  const res = {};
  for (const w of worlds) {
    const { canvas, frames, pad, track } = frameOf(w);
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
    if (!r.pad) { bad++; console.log(`  ✖ ${w.padEnd(8)} no boost pad came into view (${at})`); continue; }
    if (ACCEPT) { mkdirSync(keep, { recursive: true }); writeFileSync(join(keep, w + ".png"), png(r.png)); console.log(`  ✔ ${w.padEnd(8)} accepted (${at})`); continue; }
    if (!r.diff) { bad++; console.log(`  ✖ ${w.padEnd(8)} has no accepted picture. Look at it, then npm run guard -- --accept`); mkdirSync(out, { recursive: true }); writeFileSync(join(out, w + ".png"), png(r.png)); continue; }
    const big = r.changed > MAX_ALL || r.block > MAX_BLOCK;
    const line = `${(r.changed * 100).toFixed(2)}% changed, worst block ${(r.block * 100).toFixed(0)}% (${at})`;
    console.log(`  ${big ? "✖" : "✔"} ${w.padEnd(8)} ${line}`);
    if (big) { bad++; mkdirSync(out, { recursive: true }); writeFileSync(join(out, w + ".png"), png(r.png)); writeFileSync(join(out, w + "-diff.png"), png(r.diff)); }
  }
  if (ACCEPT) { console.log(`Accepted pictures written to scripts/guard/. Commit them with the change that made them.`); return bad ? 1 : 0; }
  console.log(bad ? `\n✖ ${bad} race pictures changed a lot. Look at .guard/ (new picture, and -diff in pink). If the change is on purpose: npm run guard -- --accept` : "All race pictures match");
  return bad ? 1 : 0;
}

let code = 1;
try { code = await main(); }
catch (e) { console.error("✖ guard failed: " + e.message); }
finally { try { await browser?.close(); } catch {} stopVite(); }
process.exit(code);
