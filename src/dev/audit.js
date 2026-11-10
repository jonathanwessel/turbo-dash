// 📐 Layout check (dev builds only, never in the real game): finds text and buttons that overlap, spill out of
// their boxes or fall off the screen. In the dev server console: await __sweep() checks every screen at the current
// window size; await __sweepAll() also tries a brand-new, a mid-game and the current save (and every garage car).
// __audit("#s-result") checks one. Besides layout it flags broken words (null, undefined, NaN) anywhere on screen. Run it at a few sizes (e.g. 1000x448, 1024x600, 1280x800) before a release.
import { RESEARCH } from "../data.js";
window.__audit = (rootSel) => {
  const W = innerWidth, H = innerHeight, root = document.querySelector(rootSel);
  if (!root) return { err: "no " + rootSel };
  const vis = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === "none" || s.visibility === "hidden" || +s.opacity < 0.05 || e.hidden) return false; } const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const textRect = el => { const rs = []; for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) if (r.width > 0) rs.push(r); } if (!rs.length) return null; const x0 = Math.min(...rs.map(r => r.left)), y0 = Math.min(...rs.map(r => r.top)), x1 = Math.max(...rs.map(r => r.right)), y1 = Math.max(...rs.map(r => r.bottom)); return { left: x0, top: y0, right: x1, bottom: y1 }; };
  const name = e => (e.id ? "#" + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/).join(".") : "")) + ` "${(e.textContent || "").trim().slice(0, 24)}"`;
  const items = [], unreachable = [];
  for (const e of root.querySelectorAll("*")) {
    if (!vis(e)) continue;
    if (e.closest("svg")) continue;
    let r = null;
    if (["BUTTON", "CANVAS", "IMG", "INPUT", "SELECT", "TEXTAREA"].includes(e.tagName)) r = e.getBoundingClientRect();
    else r = textRect(e);
    if (!r) continue;
    // clip by scrolling ancestors (things scrolled out of view are fine)
    let scrolled = false, clipped = null, hiddenByScroll = false;
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (/(auto|scroll)/.test(s.overflowX + s.overflowY)) {
        scrolled = true; const ar = a.getBoundingClientRect();
        // the hidden part must really be reachable by scrolling (content spilling out of a fixed-height box isn't)
        const below = r.bottom - ar.bottom, right = r.right - ar.right;
        if ((below > 3 && a.scrollTop + a.clientHeight + below > a.scrollHeight + 3 && /(auto|scroll)/.test(s.overflowY)) || (right > 3 && a.scrollLeft + a.clientWidth + right > a.scrollWidth + 3 && /(auto|scroll)/.test(s.overflowX)) || (below > 3 && !/(auto|scroll)/.test(s.overflowY)))
          unreachable.push(name(e) + " in " + name(a));
        if (r.bottom < ar.top + 2 || r.top > ar.bottom - 2 || r.right < ar.left + 2 || r.left > ar.right - 2) hiddenByScroll = true;   // scrolled out of view
        else r = { left: Math.max(r.left, ar.left), top: Math.max(r.top, ar.top), right: Math.min(r.right, ar.right), bottom: Math.min(r.bottom, ar.bottom) };   // only the part you can see
        break;
      }
      if (/hidden|clip/.test(s.overflowX + s.overflowY)) { const ar = a.getBoundingClientRect(); if (r.left < ar.left - 2 || r.right > ar.right + 2 || r.top < ar.top - 2 || r.bottom > ar.bottom + 2) clipped = name(a); }
    }
    if (!hiddenByScroll) items.push({ e, r, scrolled, clipped });
  }
  const issues = unreachable.map(u => "CAN'T SCROLL TO " + u);
  // a screen's big green buttons must be on screen without scrolling (v1.9: Word Lap hid below the School). Small
  // Back and Done buttons at the end of the long grown-up pages (Progress, Guide, Parent Corner) are meant to be scrolled to.
  for (const e of root.querySelectorAll(".big-btn.go:not(.small)")) if (vis(e)) { const r = e.getBoundingClientRect(); if (r.bottom > H + 2 || r.right > W + 2) issues.push("NEEDS SCROLLING " + name(e)); }
  // Turbo Lab: every open card of a research with more than one level shows its level (v1.9.1: v1.7 had hidden it)
  for (const c of root.querySelectorAll("#lab-list .proj[data-info]")) {
    const r = RESEARCH.find(x => x.id === c.dataset.info); if (!r || r.max <= 1 || !vis(c) || !window.__td || window.__td.S.rank < r.rank) continue;
    const want = `${window.__td.S.research[r.id] || 0}/${r.max}`, row = c.querySelector(".plv");
    if (!row || row.dataset.lvl !== want || !vis(row)) issues.push(`LAB CARD HIDES LEVEL ${r.id} (want ${want})`);
  }
  const BAD =/\b(null|undefined|NaN|Infinity)\b|\[object/;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) if (/\p{Emoji_Presentation}|\uFE0F|\u20E3/u.test(n.textContent) && n.parentElement && vis(n.parentElement)) issues.push("DEVICE EMOJI (not the game's own picture) in " + name(n.parentElement) + " → " + n.textContent.trim().slice(0, 30));
  const walker2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker2.nextNode());) if (BAD.test(n.textContent) && n.parentElement && vis(n.parentElement)) issues.push("BAD TEXT " + name(n.parentElement) + " → " + n.textContent.trim().slice(0, 40));
  for (const el of root.querySelectorAll("[title],[aria-label]")) for (const a of ["title", "aria-label"]) if (BAD.test(el.getAttribute(a) || "")) issues.push("BAD TEXT in " + a + " of " + name(el));
  // 🖼️ pictures drawn as SVG (Main Street): every label must fit on its sign board, and no button may sit on a label
  const svgVis = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { const st = getComputedStyle(e); if (st.display === "none" || st.visibility === "hidden" || e.getAttribute?.("style")?.includes("display:none")) return false; } return true; };
  const svgTexts = [...root.querySelectorAll("svg text")].filter(t => t.textContent.trim() && svgVis(t));
  for (const t of svgTexts) {
    const r = t.getBoundingClientRect(); if (r.width < 2) continue;
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    const board = [...t.parentElement.children].filter(c => c.tagName === "rect" && svgVis(c)).map(c => c.getBoundingClientRect())
      .filter(b => cx > b.left && cx < b.right && cy > b.top && cy < b.bottom).sort((a, b) => a.width * a.height - b.width * b.height)[0];
    if (board && board.width >= 24 && (r.left < board.left - 1 || r.right > board.right + 1)) issues.push(`SVG LABEL SPILLS "${t.textContent.trim().slice(0, 24)}" (${Math.round(r.width)}px on a ${Math.round(board.width)}px sign)`);
    if (r.right > 0 && r.left < W) for (const it of items) if (it.e.tagName === "BUTTON" && getComputedStyle(it.e).position !== "static") {
      const b = it.r, ix = Math.min(b.right, r.right) - Math.max(b.left, r.left), iy = Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top);
      if (ix > 4 && iy > 4) issues.push(`BUTTON COVERS LABEL ${name(it.e)} over "${t.textContent.trim().slice(0, 20)}"`);
    }
  }
  for (const it of items) {
    if (!it.scrolled && (it.r.left < -2 || it.r.top < -2 || it.r.right > W + 2 || it.r.bottom > H + 2)) issues.push("OFF-SCREEN " + name(it.e) + ` [${Math.round(it.r.left)},${Math.round(it.r.top)},${Math.round(it.r.right)},${Math.round(it.r.bottom)}]`);
    if (it.clipped) issues.push("CUT OFF " + name(it.e) + " by " + it.clipped);
    const e = it.e;
    if (e.tagName === "BUTTON" && (e.scrollWidth > e.clientWidth + 3 || e.scrollHeight > e.clientHeight + 3)) issues.push("TEXT SPILLS " + name(e));
  }
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const A = items[i], B = items[j];
    if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
    const ix = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left), iy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
    if (ix > 3 && iy > 3) {
      const small = Math.min((A.r.right - A.r.left) * (A.r.bottom - A.r.top), (B.r.right - B.r.left) * (B.r.bottom - B.r.top));
      if (ix * iy > 0.12 * small) issues.push("OVERLAP " + name(A.e) + "  ×  " + name(B.e));
    }
  }
  return [...new Set(issues)];
};
/* __sweepAll(): the sweep with a brand-new save, a mid-game save and the real current one (restored afterwards) */
window.__sweepAll = async () => {
  const keep = JSON.stringify(window.__td.S), out = {};
  const as = async (label, patch) => { Object.assign(window.__td.S, JSON.parse(keep), patch); const r = await window.__sweep(); for (const [k, v] of Object.entries(r)) out[label + " " + k] = v; };
  await as("new", { rank: 1, wins: 0, owned: ["zippy"], car: "zippy", world: "earth", best: {}, bestD: {}, research: {}, cups: {}, bosses: {} });
  await as("mid", { rank: 16, world: "earth" });
  await as("now", {});
  Object.assign(window.__td.S, JSON.parse(keep)); window.__td.goHub();
  return out;
};
window.__sweep = async (only) => {
  const td = window.__td, wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
  const go = async (k, fn, sel) => {
    if (only && !only.includes(k)) return;
    try { await fn(); await wait(500); const root = sel || ("#" + k.split(":")[0]); const iss = window.__audit(root); if (iss.length) out[k] = iss; window.__collect?.(k, root); } catch (e) { out[k] = ["ERR " + e.message]; }
  };
  const hub = g => async () => { td.goHub(); await wait(60); document.querySelector(`[data-go="${g}"]`).dispatchEvent(new MouseEvent("click", { bubbles: true })); };
  await go("s-title", () => td.show("s-title"));
  await go("s-hub", () => td.goHub());
  for (const [k, f] of [["mid", 0.5], ["end", 1]]) await go("s-hub:" + k, async () => { const w = document.getElementById("town-wrap"); w.scrollLeft = (w.scrollWidth - w.clientWidth) * f; await wait(150); }, "#s-hub");
  document.getElementById("town-wrap").scrollLeft = 0;
  await go("s-garage", hub("garage"));
  await go("s-garage:paint", () => document.querySelector('[data-gtab="paint"]').click(), "#s-garage");
  document.querySelector('[data-gtab="up"]').click();
  for (let k = 0; k < 40; k++) {   // step through every car (stops when it's back at the first one)
    const before = document.getElementById("g-name").textContent;
    await go("s-garage:" + before, async () => {}, "#s-garage");
    document.getElementById("g-next").click(); await wait(30);
    if (k > 0 && document.getElementById("g-name").textContent === window.__firstCar) break;
    if (k === 0) window.__firstCar = before;
  }
  await go("s-garage:grid", () => document.getElementById("g-gridbtn").click(), "#s-garage");
  await go("s-garage:grid-end", async () => { const g = document.getElementById("g-grid"); g.scrollTop = g.scrollHeight; await wait(100); }, "#s-garage");
  document.getElementById("g-gridbtn").click();
  await go("s-tracks", hub("race"));
  await go("s-tracks:bonus", async () => { const l = document.getElementById("track-list"); l.scrollLeft = l.scrollWidth; l.scrollTop = l.scrollHeight; await wait(150); }, "#s-tracks");
  document.getElementById("track-list").scrollLeft = document.getElementById("track-list").scrollTop = 0;
  for (const t of ["cups", "boss", "trial"]) await go("s-tracks:" + t, () => { const b = document.querySelector(`[data-rtab="${t}"]`); if (!b.hidden) b.click(); }, "#s-tracks");
  document.querySelector('[data-rtab="races"]').click();
  await go("s-trophies", hub("trophy"));
  await go("s-rank", hub("rank"));
  await go("s-school", hub("school"));
  await go("s-math", async () => { await hub("school")(); await wait(60); document.getElementById("sch-math").click(); });
  await go("s-math:20pics", () => td.mathShow({ a: 10, b: 10, op: "+", ans: 20 }), "#s-math");
  await go("s-math:minus", () => td.mathShow({ a: 10, b: 7, op: "-", ans: 3 }), "#s-math");
  await go("s-math:big", () => td.mathShow({ a: 18, b: 9, op: "-", ans: 9 }), "#s-math");
  await go("s-math:done", () => td.mathDone(), "#s-math");
  await go("s-word", async () => { td.openWord(); await wait(60); });
  await go("s-word:pic-long", () => td.wordShow({ w: "carrot", pic: "🥕", mode: "pic", choices: [{ w: "carrot", pic: "🥕" }, { w: "parrot" }, { w: "carpet" }] }), "#s-word");
  await go("s-word:word-long", () => td.wordShow({ w: "rabbit", pic: "🐰", mode: "word", choices: [{ w: "rabbit", pic: "🐰" }, { w: "monkey", pic: "🐵" }, { w: "turtle", pic: "🐢" }] }), "#s-word");
  await go("s-word:done", () => td.wordDone(), "#s-word");
  await go("s-bank", () => td.openBank());
  await go("s-bank:rich", () => { Object.assign(td.S.bank, { bal: 123456, low: 120000, news: 98765, paid: 1234567, t: Date.now() - 3600e3 }); td.openBank(); }, "#s-bank");
  await go("s-log:painted", () => td.openLog(), "#s-log");
  await go("s-missions", hub("missions"));
  await go("s-lab", hub("lab"));
  await go("s-lab:levels", async () => {
    Object.assign(td.S.research, { coinBoost: 3, luckyChests: 5, headStart: 1, pitCrew: 10, superPaint: 1, autoSteer: 37 }); td.S.rank = Math.max(td.S.rank, 12);
    td.S.lab.benches = [{ p: "coinBoost", end: Date.now() + 600e3 }, { p: null, end: 0 }, { p: null, end: 0 }]; await hub("lab")();
  }, "#s-lab");
  await go("s-lab:sheet", async () => { document.querySelector('#lab-list .proj[data-info="coinBoost"] .pi')?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, "#lab-sheet");
  await go("s-lab:sheet-done", async () => { document.getElementById("ls-close").click(); document.querySelector('#lab-list .proj[data-info="superPaint"] .pi')?.dispatchEvent(new MouseEvent("click", { bubbles: true })); }, "#lab-sheet");
  document.getElementById("ls-close").click();
  await go("s-gift", hub("gift"));
  await go("s-wash", hub("carwash"));
  await go("s-museum", hub("museum"));
  await go("s-progress", () => { td.show("s-title"); for (let i = 0; i < 5; i++) document.getElementById("ver").click(); document.getElementById("p-progress").click(); });
  await go("s-guide", () => { td.show("s-parent"); document.getElementById("p-guide").click(); });
  await go("s-settings", () => { td.show("s-title"); document.getElementById("btn-settings").click(); });
  await go("s-parent", () => { td.show("s-title"); for (let i = 0; i < 5; i++) document.getElementById("ver").click(); });
  await go("s-preview", () => { td.show("s-tracks"); td.openPreview("moon"); });
  await go("s-preview:toy", () => td.openPreview("toy"), "#s-preview");
  for (const s of ["s-pvend", "s-name", "s-rankup", "s-cupend", "s-log", "s-grownup", "s-reset", "s-rest", "s-update", "s-pause", "s-boss"]) await go(s, () => td.show(s));
  await go("s-result:pick", async () => { td.showResult({ place: 3, coins: 108, time: 40, stats: { stunts: 1, turbos: 1, bams: 0, powers: 0, pads: 0, rings: 0, pearls: 0, drifts: 0, loops: 0 }, standings: [2, 1, 0, 3, 4, 5] }); }, "#s-result");
  await go("s-result:done", async () => { document.querySelector('.chest[data-i="1"]').click(); await wait(900); }, "#s-result");
  td.show("s-title");
  return out;
};

/* Layout snapshot for refactoring the stylesheet: every visible element's box and key styles on every screen the
   sweep visits. await __snap() returns it; __snapDiff(a, b) lists what moved or changed. */
const SNAP_STYLES = ["fontSize", "fontFamily", "fontWeight", "color", "backgroundColor", "backgroundImage", "borderTopWidth", "borderTopColor", "borderRadius", "boxShadow", "opacity", "textAlign", "lineHeight", "letterSpacing", "textTransform", "transform"];
window.__snap = async (only) => {
  const snap = {};
  window.__collect = (k, rootSel) => {
    const root = document.querySelector(rootSel), seen = new Map(), out = {};
    if (!root) return;
    for (const e of root.querySelectorAll("*")) {
      if (e.closest("svg") && e.tagName !== "svg") continue;
      const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
      const cs = getComputedStyle(e); if (cs.visibility === "hidden" || cs.display === "none") continue;
      const base = (e.id ? "#" + e.id : e.tagName.toLowerCase() + (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/).join(".") : "")) + "|" + (e.textContent || "").trim().slice(0, 12);
      const n = (seen.get(base) || 0) + 1; seen.set(base, n);
      out[base + "#" + n] = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), s: SNAP_STYLES.map(p => String(cs[p]).slice(0, 80)).join(";") };
    }
    snap[k] = out;
  };
  try { await window.__sweep(only); } finally { window.__collect = null; }
  return snap;
};
window.__snapDiff = (a, b, px = 2) => {
  const res = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const A = a[k] || {}, B = b[k] || {}, d = [];
    for (const id of new Set([...Object.keys(A), ...Object.keys(B)])) {
      const x = A[id], y = B[id];
      if (!x || !y) { d.push((x ? "gone " : "new ") + id); continue; }
      if (Math.abs(x.x - y.x) > px || Math.abs(x.y - y.y) > px || Math.abs(x.w - y.w) > px || Math.abs(x.h - y.h) > px) d.push(`moved ${id} [${x.x},${x.y},${x.w}x${x.h}] -> [${y.x},${y.y},${y.w}x${y.h}]`);
      if (x.s !== y.s) { const xs = x.s.split(";"), ys = y.s.split(";"); d.push("style " + id + " " + SNAP_STYLES.filter((p, i) => xs[i] !== ys[i]).map(p => p + ":" + xs[SNAP_STYLES.indexOf(p)] + "->" + ys[SNAP_STYLES.indexOf(p)]).join(", ")); }
    }
    if (d.length) res[k] = d;
  }
  return res;
};
