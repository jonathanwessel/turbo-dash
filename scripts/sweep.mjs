// 📐 The screen sweep as one command (v1.11.2). It starts the dev server on port 5184, opens headless Edge with a
// throwaway profile (a brand-new test save, never a real one), runs `await __sweepAll()` from src/dev/audit.js at
// every size below, saves a screenshot of the main screens at each size and one race frame per world, then stops
// the browser and the server. Any overlap, spill, off-screen button or "null" fails the run (exit 1).
//   npm run sweep                       -> all 8 sizes, pictures in .sweep/ (git-ignored)
//   npm run sweep -- 1280x800 740x360   -> only these sizes
//   npm run sweep -- --out <folder>     -> pictures somewhere else
//   npm run sweep -- --no-race          -> skip the race frames
// Never point this at the play server (port 5183): it serves the family's real game and save.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const ALL = ["740x360", "915x412", "1000x448", "1024x600", "1280x800", "1920x1080", "800x1280", "360x740"];   // 360x740: an upright phone (v1.15.1)
const sizes = args.filter(a => /^\d+x\d+$/.test(a)).length ? args.filter(a => /^\d+x\d+$/.test(a)) : ALL;
const outArg = args.indexOf("--out"), out = resolve(root, outArg >= 0 ? args[outArg + 1] : ".sweep");
const RACES = !args.includes("--no-race");
const DEV = 5184, CDP = 9334, URL0 = `http://127.0.0.1:${DEV}/`;
const EDGE = process.env.EDGE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const SHOTS = ["s-title", "s-hub", "s-traits", "s-garage", "s-rival", "s-tracks", "s-rank", "s-school", "s-lab", "s-trophies"];
// v1.15: pictures of cards that only open on a tap, from the same Rank 16 save (the picture review never saw them
// before): the boss tab, a boss rematch intro and its result card, and the Lab sheet
const tap = go => `document.querySelector('[data-go="${go}"]').dispatchEvent(new MouseEvent("click", { bubbles: true }))`;
const EXTRA = {
  "s-tracks-boss": `(__td.goHub(), ${tap("race")}, document.querySelector('[data-rtab="boss"]').click(), true)`,
  "s-boss-again": `(__td.bossIntro("bruno", 1), true)`,
  "s-result-boss": `(__td.bossResult("bruno", 1), true)`,
  // v1.17: the Best chip's card and the chips, from the same save driving Zippy (it drives its fastest car otherwise),
  // and the Garage's Best row on its fastest car
  "s-bestcar": `(__td.S.car = "zippy", (() => { const t = JSON.parse(localStorage.getItem('turbodash.tips') || '{}'); delete t.best; localStorage.setItem('turbodash.tips', JSON.stringify(t)); })(), __td.goHub(), ${tap("race")}, true)`,
  "s-tracks-best": `(document.querySelector('[data-rtab="races"]').click(), document.getElementById("bc-ok").click(), true)`,
  "s-garage-best": `(__td.S.car = __mid().car, __td.goHub(), ${tap("garage")}, true)`,
  // v1.18: the world preview card, which gained a 🔊 speaker (the audit already opened it, the pictures never had)
  "s-preview": `(__td.goHub(), __td.show("s-tracks"), __td.openPreview("moon"), true)`,
  // v1.19: the "New car!" card of a special car, the Garage on that car (its power line), and the All cars grid with
  // the Moon open and a ring counter part way (a copy of the Rank 16 save, put back after)
  "s-newcar": `(__td.goHub(), __td.newCar("hopper"), true)`,
  "s-garage-perk": `(document.getElementById("nc-drive").click(), __td.goHub(), ${tap("garage")}, true)`,
  "s-garage-earn": `(Object.assign(__td.S, { rank: 21, car: __mid().car, owned: __mid().owned, research: { ...__mid().research, moonTires: 1 }, stats: { ...__mid().stats, rings: 137 } }), __td.goHub(), ${tap("garage")}, document.getElementById("g-gridbtn").click(), [...document.querySelectorAll(".gg-head")].find(h => h.textContent.startsWith("Moon"))?.scrollIntoView(), true)`,
  // v1.20: the Moon's track list with the Moon Hopper's counter chip (same save as above), and its tap into the Garage
  "s-tracks-earn": `(__td.S.world = "moon", __td.goHub(), ${tap("race")}, true)`,
  "s-garage-earntap": `(document.getElementById("ec-chip").click(), true)`,
  // v1.20: the Stop playing? card a back press on Main Street opens
  "s-leave": `(__td.goHub(), __td.show("s-leave"), true)`,
  // v1.21: the car kinds card the first track list opens (track kinds), and the track list after OK with the badge lit
  "s-traits-kinds": `(Object.assign(__td.S, __mid()), (() => { const t = JSON.parse(localStorage.getItem('turbodash.tips') || '{}'); delete t.kinds; localStorage.setItem('turbodash.tips', JSON.stringify(t)); })(), __td.goHub(), ${tap("race")}, document.getElementById("s-rival").hidden || document.getElementById("rw-ok").click(), !document.getElementById("s-traits").hidden)`,
  "s-tracks-kinds": `(document.getElementById("tr-ok").click(), !document.getElementById("s-tracks").hidden && !!document.querySelector("#s-tracks .tc-kind.spot"))`,
  // v1.22: the Garage on a car with a home track of its own (the longest name and the longest home line)
  "s-garage-home": `(Object.assign(__td.S, __mid()), __td.S.car = "patrol", __td.goHub(), ${tap("garage")}, !document.getElementById("s-garage").hidden && !document.getElementById("g-home").hidden)`,
  // v1.22: Main Street dressed for each holiday, scrolled to the big decoration (a reload puts today's back)
  ...Object.fromEntries(["fall", "winter", "summer"].map(h => ["s-hub-" + h, `(Object.assign(__td.S, __mid()), __td.holiday("${h}"), __td.goHub(), (() => { const w = document.getElementById("town-wrap"), el = document.getElementById("holiday"); if (!el) return false; const r = el.getBoundingClientRect(); w.scrollLeft += r.left + r.width / 2 - innerWidth / 2; return !document.getElementById("s-hub").hidden; })())`])),
  // 2026-11-26: the What's new card, filled with the fullest card a device can get (src/news.js fullest). It never
  // shows on the dev server by itself, so only the update test's one picture ever checked it. It fails when the
  // lines scroll (a child who cannot read would never see the lower pictures) or OK or the 🔊 is off screen.
  // v1.24.1: "scrolls" is measured where the lines sit (every line inside the list's own box), not by scrollHeight,
  // which rounds a list that ends on half a pixel up by one and failed five sizes where every line showed. And "on
  // screen" means inside every box around it that clips (the card itself scrolled at 740x360 and hid OK under its
  // bottom edge while the old check, which only knew the screen's edges, passed).
  "s-news": `(__td.news(), (() => { const l = document.getElementById("news-list"), seen = el => { const r = el.getBoundingClientRect(); if (!(r.width > 0 && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth)) return false; for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p); if (s.overflowX === "visible" && s.overflowY === "visible") continue; const q = p.getBoundingClientRect(); if (r.top < q.top - 1 || r.bottom > q.bottom + 1 || r.left < q.left - 1 || r.right > q.right + 1) return false; } return true; }; return l.children.length > 4 && [...l.children].every(seen) && seen(document.getElementById("news-ok")) && seen(document.querySelector("#news [data-say-btn]")); })())`,
  "s-lab-sheet": `(document.getElementById("news").hidden = true, Object.assign(__td.S, __mid()), __td.goHub(), ${tap("lab")}, document.querySelector('#lab-list .proj .pi')?.dispatchEvent(new MouseEvent("click", { bubbles: true })), true)`,
};
const wait = ms => new Promise(r => setTimeout(r, ms));

const kids = [];
let profile = null;
// Edge hands its work to child processes, so killing the one we started is not enough: close the browser over CDP,
// kill each started process tree and wait for it, then stop anything still using the throwaway profile.
async function cleanup() {
  try { const v = await (await fetch(`http://127.0.0.1:${CDP}/json/version`)).json(); const b = cdp(v.webSocketDebuggerUrl); await b.ready; b.send("Browser.close").catch(() => {}); await wait(1500); } catch {}
  for (const k of kids) { try { process.platform === "win32" ? spawnSync("taskkill", ["/pid", String(k.pid), "/T", "/F"], { stdio: "ignore" }) : k.kill("SIGKILL"); } catch {} }
  if (process.platform === "win32" && profile) spawnSync("powershell", ["-NoProfile", "-Command",
    `Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*${profile.replace(/'/g, "''")}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: "ignore" });
}
process.on("SIGINT", async () => { await cleanup(); process.exit(130); });

async function until(what, fn, ms = 60000) {
  const t = Date.now();
  for (;;) { try { const v = await fn(); if (v) return v; } catch {} if (Date.now() - t > ms) throw new Error("timed out waiting for " + what); await wait(250); }
}

/* a tiny CDP client over Node's built-in WebSocket */
function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl), pending = new Map(); let id = 0;
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.no(new Error(m.error.message)) : p.ok(m.result); } };
  const ready = new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
  const send = (method, params = {}) => new Promise((ok, no) => { const n = ++id; pending.set(n, { ok, no }); ws.send(JSON.stringify({ id: n, method, params })); });
  return { ready, send, close: () => ws.close() };
}

/* Another game's headless browser test (each game in this folder has its own scheduled task) can slow the machine
   so much that one size takes over 10 minutes (v1.14.0: a sweep timed out at 1280x800 while another game's smoke
   test ran, and the same sizes swept clean right after). So a full sweep first waits, up to 20 minutes, until no
   other headless Edge runs, and says so. A probe is short and does not wait. */
function otherHeadless() {
  if (process.platform !== "win32") return 0;
  const r = spawnSync("powershell", ["-NoProfile", "-Command",
    `(Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*--headless*' -and $_.CommandLine -notlike '*--type=*' }).Count`], { encoding: "utf8" });
  return parseInt(r.stdout, 10) || 0;
}
async function waitForQuiet() {
  const t = Date.now();
  for (let n = otherHeadless(), said = false; n > 0; n = otherHeadless()) {
    if (!said) { console.log(`… ${n} other headless browser(s) running (another game's test?). Waiting for them, up to 20 minutes.`); said = true; }
    if (Date.now() - t > 20 * 60000) { console.log("… still running after 20 minutes. Sweeping anyway: a timeout now may be the machine, not the game."); return; }
    await wait(15000);
  }
}

/* v1.24: an earlier sweep that never ended (a run stopped part way, 2026-11-25) kept its dev server on 5184 for nine
   hours, and the next sweep's own server could not start there while the "is it up?" check was answered by the old
   one. So a sweep first stops what only an earlier sweep makes: a dev server on 5184 from this checkout and Edge
   with a turbodash sweep profile (an old sweep left without them fails on its own). Never the play server on 5183,
   and never another game's processes. */
function stopLeftovers() {
  if (process.platform !== "win32") return;
  // whatever node vite is listening on 5184 (however it was started), and Edge with a sweep profile
  const r = spawnSync("powershell", ["-NoProfile", "-Command",
    `$ids = @(Get-NetTCPConnection -LocalPort ${DEV} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ` +
    `Where-Object { $p = Get-CimInstance Win32_Process -Filter "ProcessId=$_"; $p.Name -eq 'node.exe' -and $p.CommandLine -like '*vite*' }) + ` +
    `@(Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*turbodash-sweep-*' } | Select-Object -ExpandProperty ProcessId); ` +
    `$ids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue; $_ }`], { encoding: "utf8" });
  const n = (r.stdout || "").trim().split(/\s+/).filter(Boolean).length;
  if (n) console.log(`stopped ${n} leftover process${n > 1 ? "es" : ""} from an earlier sweep`);
}

async function main() {
  mkdirSync(out, { recursive: true });
  stopLeftovers();
  if (args.indexOf("--probe") < 0) await waitForQuiet();
  // 1. the dev server, on 127.0.0.1 only
  const vite = spawn(process.execPath, [join(root, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", String(DEV), "--strictPort"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  kids.push(vite);
  let viteLog = ""; vite.stdout.on("data", d => viteLog += d); vite.stderr.on("data", d => viteLog += d);
  await until("the dev server", async () => (await fetch(URL0)).ok, 60000).catch(e => { throw new Error(e.message + "\n" + viteLog); });
  // 2. headless Edge with a throwaway profile
  profile = mkdtempSync(join(tmpdir(), "turbodash-sweep-"));
  const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${CDP}`, `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--mute-audio", "about:blank"], { stdio: "ignore" });
  kids.push(edge);
  const page = await until("headless Edge", async () => (await (await fetch(`http://127.0.0.1:${CDP}/json/list`)).json()).find(t => t.type === "page"));
  const c = cdp(page.webSocketDebuggerUrl); await c.ready;
  await c.send("Page.enable"); await c.send("Runtime.enable");
  const js = async (expr, ms = 600000) => {
    const r = await Promise.race([c.send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }), wait(ms).then(() => { throw new Error("timed out: " + expr.slice(0, 60)); })]);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async name => { const r = await c.send("Page.captureScreenshot", { format: "png" }); writeFileSync(join(out, name + ".png"), Buffer.from(r.data, "base64")); };
  const load = async () => { await c.send("Page.navigate", { url: URL0 }); await wait(500); await until("the game", () => js("!!(window.__td && window.__sweepAll && document.readyState === 'complete')", 5000), 60000); await js("document.fonts.ready.then(() => true)", 20000); await wait(800);
    // v1.18: a machine with no local voice still shows the 🔊 speaker in the pictures (this one has local voices)
    await js("(window.__td.canSay() || window.__td.fakeVoice(), true)"); };

  const probe = args.indexOf("--probe");
  if (probe >= 0) {
    const [w, h] = sizes[0].split("x").map(Number);
    await c.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await load(); console.log(JSON.stringify(await js(args[probe + 1]), null, 1)); await shot("probe"); c.close(); return 0;
  }
  const report = {}, t0 = Date.now();
  for (const size of sizes) {
    const [w, h] = size.split("x").map(Number), t = Date.now();
    await c.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await load();
    // v1.15: another game's headless test can also start after the sweep did (twice in the v1.15.0 run, both sizes
    // then swept clean on a quiet machine), so a size that times out waits for a quiet machine and runs once more
    let issues;
    try { issues = await js("__sweepAll()"); }
    catch (e) {
      if (!/timed out/.test(e.message)) throw e;
      console.log(`… ${size} timed out with ${otherHeadless()} other headless browser(s) running. Waiting for a quiet machine, then this size once more.`);
      await waitForQuiet(); await load(); issues = await js("__sweepAll()");
    }
    report[size] = issues;
    // the main screens with a real mid-game save (the career bot's Rank 16), so most of Main Street and the menus
    // are open. Toasts are hidden: a pop-up left over from the sweep (a School lap's bonus) is not part of a screen.
    await js("Object.assign(__td.S, __mid()); __td.refreshCoins(); document.head.insertAdjacentHTML('beforeend', '<style>#toast,#fx{display:none!important}</style>'); true");
    // each screen opened the way the player opens it (its Main Street button), so it is painted from this save. The
    // first tap on Race shows the rival of the week's card (s-rival), the second the track list.
    // v1.16: the first tap on Garage shows the car traits card (s-traits), the second the Garage itself.
    const GO = { "s-traits": "garage", "s-garage": "garage", "s-rival": "race", "s-tracks": "race", "s-rank": "rank", "s-school": "school", "s-lab": "lab", "s-trophies": "trophy" };
    for (const s of SHOTS) {
      if (s === "s-traits") await js("(() => { const t = JSON.parse(localStorage.getItem('turbodash.tips') || '{}'); delete t.traits; localStorage.setItem('turbodash.tips', JSON.stringify(t)); return true; })()");
      await js(s === "s-title" ? "(__td.show('s-title'), true)" : `(__td.goHub(), ${GO[s] ? `document.querySelector('[data-go="${GO[s]}"]').dispatchEvent(new MouseEvent("click", { bubbles: true })), ` : ""}true)`);
      await wait(500); await shot(`${size}-${s}`);
    }
    // v1.21: a step may return false when its screen did not open (the first kinds pictures showed the rival card
    // and the Garage instead, and nothing noticed). That fails the sweep.
    for (const [name, expr] of Object.entries(EXTRA)) {
      if ((await js(expr)) === false) { (report[size] ||= {})["picture " + name] = ["the screen for this picture did not open"]; console.log(`   ✖ picture ${name}: the screen did not open`); }
      await wait(700); await shot(`${size}-${name}`);
    }
    await js("(document.getElementById('ls-close')?.click(), localStorage.clear(), true)");   // the next size starts from a brand-new save again
    const n = Object.keys(issues).length;
    console.log(`${size.padEnd(10)} ${n ? "✖ " + n + " screens with problems" : "✔ every screen fits"}  (${((Date.now() - t) / 1000).toFixed(0)}s)`);
    for (const [k, v] of Object.entries(issues)) console.log(`   ${k}: ${[].concat(v).slice(0, 4).join(" | ")}`);
  }
  // one race frame per world, at tablet size. v1.15: from the Rank 16 save with the horn tip seen, so the pictures
  // show what a playing child sees (the horn, no first-race lesson). One brand-new frame stays, for the lesson, and
  // one Toy Track World frame mid-race on the first sharp curve (scripts/probes/toy-curve.js), which a start-line
  // frame can never show.
  if (RACES) {
    await c.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    const played = "Object.assign(__td.S, __mid()); localStorage.setItem('turbodash.tips', JSON.stringify({ horn: 1 })); __td.S.rank = 40;";
    // v1.24: a frame of each new Moon track where its new thing is in view (a start-line frame would not show it):
    // a star landing ahead, a rocket lifting off, the car in the air over a big crater, the dark side's headlights
    const near = (test, back, fast = false) => `(() => { const r = __td.race, i = r.T.segs.findIndex((s, k) => k > 60 && (${test})); if (i < 0) return false; r.player.dist = (i - ${back}) * 200 - 3100; r.prevIdx = r.segAt(r.player.dist).index; ${fast ? "r.player.speed = r.stats.maxSpeed;" : ""} return true; })()`;
    const FRAMES = [["earth-new", "earth", ""], ...["earth", "moon", "ocean", "glacier", "toy"].map(w => [w, w, played]), ["toy-curve", "toy", played],
      ["moon-stars", "moon", played, "meteor", near("s.star != null", 30)], ["moon-rocket", "moon", played, "launch", near("s.rocket", 18)],
      ["moon-crater", "moon", played, "bigcrater", near("s.rampStart", 10)], ["moon-dark", "moon", played, "darkside"],
      // v1.25: the new Ocean tracks, each where its new thing is in view: a ship ahead, a whirlpool, a turtle over the road, the dark deep
      ["ocean-ship", "ocean", played, "sunken", near("s.tunnelStart", 24)], ["ocean-whirl", "ocean", played, "whirlpool", near("s.whirlTop", 16)],
      ["ocean-turtle", "ocean", played, "turtles", near("s.turtle", 32)], ["ocean-dark", "ocean", played, "midnight"]];
    for (const [name, world, prep, trackId, post, after = 250] of FRAMES) {
      await js("(localStorage.clear(), true)"); await load();
      if (name === "toy-curve") { await js(`(() => { ${prep} return true; })()`); await js(readFileSync(join(root, "scripts", "probes", "toy-curve.js"), "utf8").split(/\r?\n/).filter(l => !l.startsWith("//")).join("\n"), 30000); }
      else {
        const find = trackId ? `x.id === ${JSON.stringify(trackId)}` : `x.world === ${JSON.stringify(world)}`;
        await js(`(() => { ${prep} const t = __td.TRACKS.find(x => ${find}); if (!${JSON.stringify(prep)}) __td.S.rank = 40; __td.show("s-tracks"); __td.startRace(t); return true; })()`);
        await wait(world === "toy" ? 9000 : 6000);   // the countdown, and the 3D engine loading for Toy World
        if (post && !(await js(post))) { console.log(`race ${name.padEnd(10)} ✖ its new thing is not on the track`); report["race " + name] = { start: ["its new thing is not on the track"] }; continue; }
        if (post) await wait(after);
      }
      const on = await js("!!__td.race && document.getElementById('hud') && !document.getElementById('hud').hidden");
      const horn = await js("!document.getElementById('btn-horn').hidden");
      await shot(`race-${name}`);
      const bad = !on ? "the race did not start" : prep && !horn ? "the horn is hidden in a played save's race" : "";
      console.log(`race ${name.padEnd(10)} ${bad ? "✖ " + bad : "✔ picture saved"}`);
      if (bad) report["race " + name] = { start: [bad] };
    }
  }
  c.close();
  writeFileSync(join(out, "report.json"), JSON.stringify(report, null, 1) + "\n");
  const bad = Object.values(report).reduce((a, r) => a + Object.keys(r).length, 0);
  console.log(`\n${bad ? `✖ ${bad} problems` : "✔ Sweep clean"} at ${sizes.length} sizes in ${((Date.now() - t0) / 1000).toFixed(0)}s. Pictures and report.json in ${out}`);
  return bad ? 1 : 0;
}

let code = 1;
try { code = await main(); }
catch (e) { console.error("✖ sweep failed: " + e.message + (/navigated|closed/.test(e.message) ? "\n  (the page reloaded: was a source file saved while the sweep ran? The dev server reloads on every save.)" : "")); }
finally {
  await cleanup(); await wait(1000);
  if (profile && existsSync(profile)) try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }); } catch {}
}
process.exit(code);
