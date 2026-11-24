// 🔊 The read-aloud test (v1.18, a step of npm run check). A browser only speaks after a real tap, so this taps the
// speaker on the car kinds card the way a finger does (a trusted DevTools mouse event, not a script click) and checks:
//  - with a local voice on this machine: the voice starts, it is a local one, the button pulses while it talks,
//    a second tap stops it, and leaving the card stops it too;
//  - with no local voice: the speaker stays hidden on every picture card.
// Like the guard: the dev server on 127.0.0.1:5184 (never the play server on 5183), headless Edge with a throwaway
// profile (scripts/cdp.mjs).
import { spawn, spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { chromium } from "./cdp.mjs";

const root = resolve(import.meta.dirname, "..");
const DEV = 5184, URL0 = `http://127.0.0.1:${DEV}/`;
const wait = ms => new Promise(r => setTimeout(r, ms));
/* v1.19: a machine with no sound output at all (Windows lists no audio endpoint, for example with the speakers or
   headset unplugged) can't play any voice, and the browser reports "synthesis-failed". That says nothing about the
   game, so only then the two checks that need sound are reported as not checked, loudly, instead of failing. With
   any sound output present they count as always. */
const soundOut = () => process.platform !== "win32" || /^[1-9]/.test(spawnSync("powershell", ["-NoProfile", "-Command",
  "@(Get-CimInstance Win32_PnPEntity -Filter \"PNPClass='AudioEndpoint'\").Count"], { encoding: "utf8" }).stdout.trim());
let unheard = false;
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
  await wait(1500);   // browsers fill their voice list late
  // record every utterance the game makes, and its events
  await page.evaluate(`(() => { window.__said = []; const real = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = u => { const r = { voice: u.voice && u.voice.name, local: !!(u.voice && u.voice.localService), text: u.text, ev: [] }; window.__said.push(r);
      for (const k of ["start", "end", "error"]) u.addEventListener(k, e => r.ev.push(k + (e.error ? ":" + e.error : ""))); real(u); }; return true; })()`);
  const hasLocal = await page.evaluate("speechSynthesis.getVoices().some(v => v.localService && /^en/i.test(v.lang))");
  await page.evaluate(`(__td.goHub(), document.querySelector('[data-go="garage"]').dispatchEvent(new MouseEvent("click", { bubbles: true })), document.getElementById("g-trait").click(), true)`);
  await wait(500);
  const btn = () => page.evaluate(`(() => { const b = document.querySelector("#s-traits [data-say-btn]"), r = b.getBoundingClientRect(); return { hidden: b.hidden || r.width < 1, on: b.classList.contains("on"), x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; })()`);
  const tap = async ({ x, y }) => { for (const type of ["mousePressed", "mouseReleased"]) await page.cdp("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 }); };
  const fails = [];
  const ok = (c, msg) => { console.log(`  ${c ? "✔" : "✖"} ${msg}`); if (!c) fails.push(msg); };
  if (!hasLocal) {
    const hidden = await page.evaluate(`[...document.querySelectorAll("[data-say-btn]")].every(b => b.hidden)`);
    ok(hidden, "no local voice on this machine: every speaker is hidden");
    return fails.length ? 1 : 0;
  }
  const b0 = await btn();
  ok(!b0.hidden && b0.w >= 30, `the speaker shows on the car kinds card (${Math.round(b0.w)} px)`);
  await tap(b0); await wait(700);
  const said = await page.evaluate("window.__said"), b1 = await btn(), sp = await page.evaluate("speechSynthesis.speaking");
  ok(said.length === 1, `one tap, one utterance (${said.length})`);
  ok(said[0]?.local, `a local voice speaks (${said[0]?.voice})`);
  ok(/^Every car is different! Fast\. /.test(said[0]?.text || ""), `it reads the card ("${(said[0]?.text || "").slice(0, 40)}…")`);
  const started = said[0]?.ev.includes("start") && !said[0]?.ev.some(e => e.startsWith("error"));
  if (!started && said[0]?.ev.includes("error:synthesis-failed") && !soundOut()) {
    unheard = true;
    console.log("  ⚠ NOT CHECKED: this machine has no sound output right now (no audio endpoint), so no voice can play.");
    console.log("    The voice start and the pulse were not checked. Plug in a speaker or headset and run it again.");
  } else {
    ok(started, `the voice starts after a real tap (${said[0]?.ev.join(", ")})`);
    ok(sp && b1.on, "the speaker pulses while it talks");
  }
  await tap(b1); await wait(400);
  ok(!(await page.evaluate("speechSynthesis.speaking")) && !(await btn()).on, "a second tap stops it");
  await tap(await btn()); await wait(600);
  await page.evaluate(`(document.getElementById("tr-ok").click(), true)`); await wait(400);
  ok(!(await page.evaluate("speechSynthesis.speaking")), "leaving the card stops it");
  if (errors.length) ok(false, "the page threw: " + errors[0]);
  return fails.length ? 1 : 0;
}

let code = 1;
try { code = await main(); console.log(code ? "✖ read aloud is broken" : unheard ? "Read aloud works, but the voice itself was NOT heard (no sound output on this machine)" : "Read aloud works"); }
catch (e) { console.error("✖ say test failed: " + e.message); }
finally { try { await browser?.close(); } catch {} stopVite(); }
process.exit(code);
