// 📐 Layout check (dev builds only, never in the real game): finds text and buttons that overlap, spill out of
// their boxes or fall off the screen. In the dev server console: await __sweep() checks every screen at the current
// window size; __audit("#s-result") checks one. Run it at a few sizes (e.g. 1000x448, 1024x600, 1280x800) before a release.
window.__audit = (rootSel) => {
  const W = innerWidth, H = innerHeight, root = document.querySelector(rootSel);
  if (!root) return { err: "no " + rootSel };
  const vis = el => { for (let e = el; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === "none" || s.visibility === "hidden" || +s.opacity < 0.05 || e.hidden) return false; } const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const textRect = el => { const rs = []; for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) if (r.width > 0) rs.push(r); } if (!rs.length) return null; const x0 = Math.min(...rs.map(r => r.left)), y0 = Math.min(...rs.map(r => r.top)), x1 = Math.max(...rs.map(r => r.right)), y1 = Math.max(...rs.map(r => r.bottom)); return { left: x0, top: y0, right: x1, bottom: y1 }; };
  const name = e => (e.id ? "#" + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/).join(".") : "")) + ` "${(e.textContent || "").trim().slice(0, 24)}"`;
  const items = [];
  for (const e of root.querySelectorAll("*")) {
    if (!vis(e)) continue;
    if (e.closest("svg")) continue;
    const inBtn = e.closest("button") && e.tagName !== "BUTTON";
    if (inBtn) continue;
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
        if (r.bottom < ar.top + 2 || r.top > ar.bottom - 2 || r.right < ar.left + 2 || r.left > ar.right - 2) hiddenByScroll = true;   // scrolled out of view
        break;
      }
      if (/hidden|clip/.test(s.overflowX + s.overflowY)) { const ar = a.getBoundingClientRect(); if (r.left < ar.left - 2 || r.right > ar.right + 2 || r.top < ar.top - 2 || r.bottom > ar.bottom + 2) clipped = name(a); }
    }
    if (!hiddenByScroll) items.push({ e, r, scrolled, clipped });
  }
  const issues = [];
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
window.__sweep = async (only) => {
  const td = window.__td, wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
  const go = async (k, fn, sel) => {
    if (only && !only.includes(k)) return;
    try { await fn(); await wait(500); const iss = window.__audit(sel || ("#" + k.split(":")[0])); if (iss.length) out[k] = iss; } catch (e) { out[k] = ["ERR " + e.message]; }
  };
  const hub = g => async () => { td.goHub(); await wait(60); document.querySelector(`[data-go="${g}"]`).dispatchEvent(new MouseEvent("click", { bubbles: true })); };
  await go("s-title", () => td.show("s-title"));
  await go("s-hub", () => td.goHub());
  await go("s-garage", hub("garage"));
  await go("s-garage:paint", () => document.querySelector('[data-gtab="paint"]').click(), "#s-garage");
  await go("s-tracks", hub("race"));
  for (const t of ["cups", "boss", "trial"]) await go("s-tracks:" + t, () => { const b = document.querySelector(`[data-rtab="${t}"]`); if (!b.hidden) b.click(); }, "#s-tracks");
  document.querySelector('[data-rtab="races"]').click();
  await go("s-trophies", hub("trophy"));
  await go("s-rank", hub("rank"));
  await go("s-school", hub("school"));
  await go("s-missions", hub("missions"));
  await go("s-lab", hub("lab"));
  await go("s-gift", hub("gift"));
  await go("s-settings", () => { td.show("s-title"); document.getElementById("btn-settings").click(); });
  await go("s-parent", () => { td.show("s-title"); for (let i = 0; i < 5; i++) document.getElementById("ver").click(); });
  for (const s of ["s-rankup", "s-cupend", "s-log", "s-grownup", "s-reset", "s-rest", "s-update", "s-pause", "s-boss"]) await go(s, () => td.show(s));
  await go("s-result:pick", async () => { td.showResult({ place: 3, coins: 108, time: 40, stats: { stunts: 1, turbos: 1, bams: 0, powers: 0, pads: 0, rings: 0, pearls: 0, drifts: 0, loops: 0 }, standings: [2, 1, 0, 3, 4, 5] }); }, "#s-result");
  await go("s-result:done", async () => { document.querySelector('.chest[data-i="1"]').click(); await wait(900); }, "#s-result");
  td.show("s-title");
  return out;
};
