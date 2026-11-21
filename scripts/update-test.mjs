// 🔄 npm run update-test: proves an installed copy picks up a new release, and that the What's new card shows.
// It builds the game twice into a throwaway folder (this version, then the same code as v99.0.0), serves the first
// with the 10-minute cache that GitHub Pages sends, and drives headless Edge or Chrome with a throwaway profile:
//   1. the game loads and its service worker takes control, like an installed app;
//   2. the newer build is published into the served folder;
//   3. the open game notices, shows its Update button, and one tap lands on the new version;
//   4. the What's new card is up on the title screen and one tap closes it for good;
//   5. only the new version's cache is left, and with the server stopped the game still starts (offline).
// Prints "ok" or what went wrong, and exits 1 on failure. A picture of the card is saved as .pwa-test/news.png.
import { cpSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "./cdp.mjs";
import { serve } from "./static.mjs";
import { buildTo, sleep, until, work } from "./pwa-build.mjs";

const NEW = "99.0.0";
const site = buildTo("site"), next = buildTo("next", NEW);
const srv = await serve(site, { "Cache-Control": "max-age=600" });
const b = await chromium.launch();
const bad = [], report = {};
const need = (cond, msg) => { if (!cond) bad.push(msg); return cond; };
try {
  const p = await b.newPage({ viewport: { width: 915, height: 412 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  const ver = () => p.evaluate(() => document.getElementById("ver")?.textContent || "");
  const state = () => p.evaluate(async () => ({
    v: document.getElementById("ver")?.textContent || "", controlled: !!navigator.serviceWorker.controller,
    title: !document.getElementById("s-title")?.hidden, news: !document.getElementById("news")?.hidden,
    seen: localStorage.getItem("turbodash.news"), caches: (await caches.keys()).filter(k => k.startsWith("td-")),
  }));

  // 1. an installed copy: loaded once, then running under its service worker
  await p.goto(srv.url);
  await until("the service worker", () => p.evaluate(() => !!navigator.serviceWorker.controller), 30000).catch(() => {});
  await p.reload(); await until("the title screen", async () => (await ver()).startsWith("v"));
  const before = report.before = await state();
  need(before.controlled, "the service worker never took control");
  need(!before.news && before.seen === before.v.slice(1), "a brand-new player should see no card, and this version should be marked as seen");

  // 2. publish the newer build; this device last played an old version
  await p.evaluate(() => localStorage.setItem("turbodash.news", "1.10.0"));
  cpSync(next, site, { recursive: true });

  // 3. the open game notices and updates on one tap
  await p.evaluate(() => window.__tdCheckUpdate());
  need(await until("the Update button", () => p.evaluate(() => !document.getElementById("update").hidden), 10000).catch(() => false), "the Update button never showed");
  await p.evaluate(() => document.getElementById("update").click());
  need(await until("the new version", async () => (await ver()) === "v" + NEW, 20000).catch(() => false), "one tap on Update did not land on the new version");

  // 4. What's new
  const card = report.card = await p.evaluate(() => ({ shown: !document.getElementById("news").hidden, rows: [...document.querySelectorAll("#news-list .news-row")].map(r => r.textContent.trim()) }));
  need(card.shown && card.rows.length > 0, "the What's new card did not show after the update");
  await until("the launch splash to leave", () => p.evaluate(() => !document.getElementById("splash")), 10000).catch(() => {});
  await sleep(400); await p.screenshot({ path: join(work, "news.png") });
  await p.evaluate(() => document.getElementById("news-ok").click());

  // 5. one cache, and it runs with the server gone
  await until("the old cache to go", async () => { const s = await state(); return s.controlled && s.caches.length === 1 && s.caches[0] === "td-" + NEW; }, 20000).catch(() => {});
  const after = report.after = await state();
  need(!after.news && after.seen === NEW, "one tap should close the card and remember the version");
  need(after.caches.join() === "td-" + NEW, "old caches were left behind: " + after.caches.join(", "));
  await srv.close(); await sleep(300);
  await p.reload(); await sleep(2500);
  const offline = report.offline = await state().catch(e => ({ error: e.message }));
  need(offline.v === "v" + NEW && offline.title, "the new version did not start offline");
  need(!offline.news, "the card came back after it was closed");
  need(!errs.length, "page errors: " + errs.join(" | "));
} catch (e) { bad.push(e.message); } finally {
  await b.close(); await srv.close().catch(() => {});
  rmSync(site, { recursive: true, force: true }); rmSync(next, { recursive: true, force: true });
}
console.log(JSON.stringify(report));
console.log(bad.length ? bad.map(x => "FAIL " + x).join("\n") : "ok");
process.exit(bad.length ? 1 : 0);
