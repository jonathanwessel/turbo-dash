// 📲 npm run install-test [-- <url>]: proves the game can be installed as an app, the way Chrome on Android decides.
// With no URL it builds the game into a throwaway folder and serves it on 127.0.0.1. With a URL (the live site
// after a release) it checks that instead. Headless Edge or Chrome with a throwaway profile, never a real save.
//   - the service worker takes control of the page;
//   - the manifest parses with no errors and has the fields below;
//   - every manifest icon and the apple-touch-icon is a PNG of its stated size, and the maskable icons are their
//     own files (Android crops a maskable icon, so the normal picture cannot be reused);
//   - the browser itself reports no reason the app cannot be installed.
// Prints "ok" or each problem, and exits 1 on any problem.
import { rmSync } from "node:fs";
import { chromium } from "./cdp.mjs";
import { serve } from "./static.mjs";
import { buildTo, sleep, work } from "./pwa-build.mjs";

const REQUIRED = { name: "Turbo Dash", short_name: "Turbo Dash", id: "./", start_url: "./", scope: "./", display: "fullscreen" };
const pngSize = buf => { const b = Buffer.from(buf); return b.length >= 24 && b.toString("ascii", 1, 4) === "PNG" ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };

const url = process.argv.slice(2).find(a => /^https?:/.test(a));
if (url && /:5183\b/.test(url)) { console.error("Never point a test at the play server."); process.exit(1); }
const srv = url ? null : await serve(buildTo("install"));
const base = url || srv.url;
const b = await chromium.launch();
const bad = [], report = { url: base };
try {
  const p = await b.newPage({ viewport: { width: 915, height: 412 } });
  await p.goto(base);
  for (let i = 0; i < 100 && !(await p.evaluate(() => !!navigator.serviceWorker.controller).catch(() => false)); i++) {
    if (i === 30) await p.reload();
    await sleep(200);
  }
  report.controlled = await p.evaluate(() => !!navigator.serviceWorker.controller);
  if (!report.controlled) bad.push("the service worker did not take control of the page");

  const man = await p.cdp("Page.getAppManifest");
  if (!man.url) bad.push("no manifest linked");
  if (man.errors?.length) bad.push("manifest errors: " + man.errors.map(e => e.message).join(", "));
  let data = {};
  try { data = JSON.parse(man.data || "{}"); } catch { bad.push("the manifest is not JSON"); }
  for (const [k, v] of Object.entries(REQUIRED)) if (data[k] !== v) bad.push(`manifest ${k} is ${JSON.stringify(data[k])}, want ${JSON.stringify(v)}`);
  for (const k of ["theme_color", "background_color", "description"]) if (!data[k]) bad.push("manifest has no " + k);
  const icons = (data.icons || []).filter(i => i.type === "image/png");
  for (const w of ["192x192 any", "512x512 any", "192x192 maskable", "512x512 maskable"])
    if (!icons.some(i => i.sizes + " " + (i.purpose || "any") === w)) bad.push("manifest lacks a " + w + " icon");
  const anySrc = new Set(icons.filter(i => (i.purpose || "any") === "any").map(i => i.src));
  for (const i of icons) if (i.purpose === "maskable" && anySrc.has(i.src)) bad.push(`${i.src} is used as both a normal and a maskable icon`);
  const touch = await p.evaluate(() => document.querySelector('link[rel="apple-touch-icon"]')?.href || null);
  if (!touch) bad.push("no apple-touch-icon link");
  report.icons = [];
  for (const [href, sizes] of [...icons.map(i => [new URL(i.src, man.url).href, i.sizes]), [touch, "180x180"]]) {
    if (!href) continue;
    const r = await fetch(href).catch(() => null);
    const dims = r?.ok ? pngSize(await r.arrayBuffer()) : null, got = dims ? dims.join("x") : "missing";
    report.icons.push(href.split("/").pop() + " " + got);
    if (got !== sizes) bad.push(`icon ${href} is ${got}, want ${sizes}`);
  }

  let errs = [];
  for (let i = 0; i < 25; i++) {   // the browser needs a moment after the worker activates
    errs = (await p.cdp("Page.getInstallabilityErrors")).installabilityErrors || [];
    if (!errs.length) break;
    await sleep(400);
  }
  report.installabilityErrors = errs.map(e => e.errorId);
  if (errs.length) bad.push("the browser says not installable: " + report.installabilityErrors.join(", "));
  report.version = await p.evaluate(() => document.getElementById("ver")?.textContent || null);
} finally {
  await b.close(); if (srv) await srv.close();
  if (!url) rmSync(work + "/install", { recursive: true, force: true });
}
console.log(JSON.stringify(report));
console.log(bad.length ? bad.map(x => "FAIL " + x).join("\n") : "ok");
process.exit(bad.length ? 1 : 0);
