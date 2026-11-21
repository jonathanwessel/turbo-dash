// node scripts/make-icons.mjs: draws the maskable app icons (192 and 512) from public/icon.svg.
// Android cuts a maskable icon to a circle or a rounded square and only promises to keep the middle (a circle 80%
// of the width). So the whole picture is drawn at 72% in the middle, and the sky, the grass and the road carry on
// to the edges behind it. The normal icons (icon-192.png, icon-512.png) are left alone.
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "./cdp.mjs";

const pub = resolve(import.meta.dirname, "..", "public");
const inner = readFileSync(join(pub, "icon.svg"), "utf8").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const M = 100;   // margin in the icon's own units: 512 / (512 + 2 * 100) = 72%
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-M} ${-M} ${512 + 2 * M} ${512 + 2 * M}">
  <defs><linearGradient id="skyOut" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="512"><stop offset="0" stop-color="#2a1460"/><stop offset="1" stop-color="#ff6fb5"/></linearGradient></defs>
  <rect x="${-M}" y="${-M}" width="${512 + 2 * M}" height="${512 + 2 * M}" fill="url(#skyOut)"/>
  <path d="M512 270 L${512 + M} 262 V300 H512Z" fill="#7a2cff"/>
  <rect x="${-M}" y="300" width="${512 + 2 * M}" height="${212 + M}" fill="#4dbd57"/>
  <path d="M236 300 H276 L561.5 ${512 + M} H-49.5Z" fill="#5d6170"/>
  <path d="M252 300 H260 L277.7 ${512 + M} H234.3Z" fill="#fff" opacity=".85"/>
  <svg x="0" y="0" width="512" height="512" viewBox="0 0 512 512">${inner}</svg>
</svg>`;

const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: 512, height: 512 } });
  const out = await p.evaluate(async src => {
    const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src); await img.decode();
    // first at 2 pixels per unit, so the inner picture's edges land on whole pixels and leave no seam, then scaled down
    const big = document.createElement("canvas"); big.width = big.height = 1424; big.getContext("2d").drawImage(img, 0, 0, 1424, 1424);
    const make = n => { const c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(big, 0, 0, n, n); return c.toDataURL("image/png"); };
    return { "icon-maskable-192.png": make(192), "icon-maskable-512.png": make(512) };
  }, svg);
  for (const [name, url] of Object.entries(out)) writeFileSync(join(pub, name), Buffer.from(url.split(",")[1], "base64"));
  console.log("wrote", Object.keys(out).join(", "));
} finally { await b.close(); }
process.exit(0);
