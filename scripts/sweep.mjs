// 📐 The screen sweep as one command (v1.11.2). It starts the dev server on port 5184, opens headless Edge with a
// throwaway profile (a brand-new test save, never a real one), runs `await __sweepAll()` from src/dev/audit.js at
// every size below, saves a screenshot of the main screens at each size and one race frame per world, then stops
// the browser and the server. Any overlap, spill, off-screen button or "null" fails the run (exit 1).
//   npm run sweep                       -> all 7 sizes, pictures in .sweep/ (git-ignored)
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
const ALL = ["740x360", "915x412", "1000x448", "1024x600", "1280x800", "1920x1080", "800x1280"];
const sizes = args.filter(a => /^\d+x\d+$/.test(a)).length ? args.filter(a => /^\d+x\d+$/.test(a)) : ALL;
const outArg = args.indexOf("--out"), out = resolve(root, outArg >= 0 ? args[outArg + 1] : ".sweep");
const RACES = !args.includes("--no-race");
const DEV = 5184, CDP = 9334, URL0 = `http://127.0.0.1:${DEV}/`;
const EDGE = process.env.EDGE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const SHOTS = ["s-title", "s-hub", "s-garage", "s-rival", "s-tracks", "s-rank", "s-school", "s-lab", "s-trophies"];
// v1.15: pictures of cards that only open on a tap, from the same Rank 16 save (the picture review never saw them
// before): the boss tab, a boss rematch intro and its result card, and the Lab sheet
const tap = go => `document.querySelector('[data-go="${go}"]').dispatchEvent(new MouseEvent("click", { bubbles: true }))`;
const EXTRA = {
  "s-tracks-boss": `(__td.goHub(), ${tap("race")}, document.querySelector('[data-rtab="boss"]').click(), true)`,
  "s-boss-again": `(__td.bossIntro("bruno", 1), true)`,
  "s-result-boss": `(__td.bossResult("bruno", 1), true)`,
  "s-lab-sheet": `(__td.goHub(), ${tap("lab")}, document.querySelector('#lab-list .proj .pi')?.dispatchEvent(new MouseEvent("click", { bubbles: true })), true)`,
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

async function main() {
  mkdirSync(out, { recursive: true });
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
  const load = async () => { await c.send("Page.navigate", { url: URL0 }); await wait(500); await until("the game", () => js("!!(window.__td && window.__sweepAll && document.readyState === 'complete')", 5000), 60000); await js("document.fonts.ready.then(() => true)", 20000); await wait(800); };

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
    await js("Object.assign(__td.S, __mid()); __td.refreshCoins(); document.head.insertAdjacentHTML('beforeend', '<style>#toast{display:none!important}</style>'); true");
    // each screen opened the way the player opens it (its Main Street button), so it is painted from this save. The
    // first tap on Race shows the rival of the week's card (s-rival), the second the track list.
    const GO = { "s-garage": "garage", "s-rival": "race", "s-tracks": "race", "s-rank": "rank", "s-school": "school", "s-lab": "lab", "s-trophies": "trophy" };
    for (const s of SHOTS) {
      await js(s === "s-title" ? "(__td.show('s-title'), true)" : `(__td.goHub(), ${GO[s] ? `document.querySelector('[data-go="${GO[s]}"]').dispatchEvent(new MouseEvent("click", { bubbles: true })), ` : ""}true)`);
      await wait(500); await shot(`${size}-${s}`);
    }
    for (const [name, expr] of Object.entries(EXTRA)) { await js(expr); await wait(700); await shot(`${size}-${name}`); }
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
    const FRAMES = [["earth-new", "earth", ""], ...["earth", "moon", "ocean", "glacier", "toy"].map(w => [w, w, played]), ["toy-curve", "toy", played]];
    for (const [name, world, prep] of FRAMES) {
      await js("(localStorage.clear(), true)"); await load();
      if (name === "toy-curve") { await js(`(() => { ${prep} return true; })()`); await js(readFileSync(join(root, "scripts", "probes", "toy-curve.js"), "utf8").split(/\r?\n/).filter(l => !l.startsWith("//")).join("\n"), 30000); }
      else {
        await js(`(() => { ${prep} const t = __td.TRACKS.find(x => x.world === ${JSON.stringify(world)}); if (!${JSON.stringify(prep)}) __td.S.rank = 40; __td.show("s-tracks"); __td.startRace(t); return true; })()`);
        await wait(world === "toy" ? 9000 : 6000);   // the countdown, and the 3D engine loading for Toy World
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
