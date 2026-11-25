// 📐 Layout check (dev builds only, never in the real game): finds text and buttons that overlap, spill out of
// their boxes or fall off the screen. In the dev server console: await __sweep() checks every screen at the current
// window size; await __sweepAll() also tries a brand-new, a mid-game and the current save (and every garage car).
// __audit("#s-result") checks one. Besides layout it flags broken words (null, undefined, NaN) anywhere on screen. Run it at a few sizes (e.g. 1000x448, 1024x600, 1280x800) before a release.
import { RESEARCH } from "../data.js";
import { port } from "../save.js";
// a save the career bot really reached (Rank 16, day 62: npm run career with CAREER_SNAP=16:src/dev/mid-save.json),
// so the sweep's pictures show numbers a real player could have, not a made-up rank with 0 wins
import MID from "./mid-save.json";
window.__mid = () => port(JSON.parse(JSON.stringify(MID)));
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
  // v1.11.3: the Racer Rank hint and its Rank up button too (the hint sat below the gauges, off a 360 px screen)
  // v1.15: also inside a card that scrolls (the boss card's Race button sat under its bottom edge on a 360 px screen,
  // still inside the screen, so the old check missed it). Lists meant to scroll sideways or long pages are not cards.
  // v1.18: the 🔊 speaker on a picture card too (it sits at the end of the card's buttons)
  for (const e of root.querySelectorAll(".big-btn.go:not(.small), .rank-up-btn, .rk-hint, .say")) if (vis(e)) {
    const r = e.getBoundingClientRect(), card = e.closest(".card"), cr = card && /(auto|scroll)/.test(getComputedStyle(card).overflowY) ? card.getBoundingClientRect() : null;
    if (r.bottom > H + 2 || r.right > W + 2 || (cr && r.bottom > cr.bottom + 2)) issues.push("NEEDS SCROLLING " + name(e));
  }
  // Turbo Lab: every open card of a research with more than one level shows its level (v1.9.1: v1.7 had hidden it)
  for (const c of root.querySelectorAll("#lab-list .proj[data-info]")) {
    const r = RESEARCH.find(x => x.id === c.dataset.info); if (!r || r.max <= 1 || !vis(c) || !window.__td || window.__td.S.rank < r.rank) continue;
    const want = `${window.__td.S.research[r.id] || 0}/${r.max}`, row = c.querySelector(".plv");
    if (!row || row.dataset.lvl !== want || !vis(row)) issues.push(`LAB CARD HIDES LEVEL ${r.id} (want ${want})`);
  }
  // v1.18: with a voice on the device, every picture card that explains something shows its speaker
  if (window.__td?.canSay?.()) for (const b of root.querySelectorAll("[data-say-btn]")) if (vis(b.closest(".card")) && !vis(b)) issues.push("NO SPEAKER on " + name(b.closest(".card")));
  // v1.20: a panel that scrolls up and down must not also scroll sideways (three world chips in the Garage were 4 px
  // wider than a 360 px phone, and a sideways bar showed). Lists that scroll sideways on purpose have overflow-y hidden.
  for (const a of [root, ...root.querySelectorAll("*")]) {
    const s = getComputedStyle(a);
    if (/(auto|scroll)/.test(s.overflowY) && !/(hidden|clip)/.test(s.overflowX) && a.scrollWidth > a.clientWidth + 1 && vis(a)) issues.push(`SCROLLS SIDEWAYS ${name(a)} (${a.scrollWidth} in ${a.clientWidth})`);
  }
  const BAD =/\b(null|undefined|NaN|Infinity)\b|\[object/;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) if (/\p{Emoji_Presentation}|\uFE0F|\u20E3/u.test(n.textContent) && n.parentElement && vis(n.parentElement)) issues.push("DEVICE EMOJI (not the game's own picture) in " + name(n.parentElement) + " → " + n.textContent.trim().slice(0, 30));
  const walker2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker2.nextNode());) if (BAD.test(n.textContent) && n.parentElement && vis(n.parentElement)) issues.push("BAD TEXT " + name(n.parentElement) + " → " + n.textContent.trim().slice(0, 40));
  for (const el of root.querySelectorAll("[title],[aria-label]")) for (const a of ["title", "aria-label"]) if (BAD.test(el.getAttribute(a) || "")) issues.push("BAD TEXT in " + a + " of " + name(el));
  // v1.11.3: game text has no colons or semicolons (games/CLAUDE.md "Words players see"). The grown-up pages behind
  // the grown-up check are written for a parent and may use them. Clock times (1:05) are fine.
  const GROWN = "#s-parent, #s-progress, #s-guide, #s-log, #s-grownup, #s-reset";
  const walker3 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker3.nextNode());) if (/[^\d\s][:;](\s|$)/.test(n.textContent) && n.parentElement && vis(n.parentElement) && !n.parentElement.closest(GROWN)) issues.push("COLON IN GAME TEXT " + name(n.parentElement) + " → " + n.textContent.trim().slice(0, 40));
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
    const spills = () => e.scrollWidth > e.clientWidth + 3 || e.scrollHeight > e.clientHeight + 3;
    if ((e.tagName === "BUTTON" || e.classList.contains("rk-hint")) && spills()) {   // v1.11.3: the Rank hint was squashed
      // v1.11.2: a small corner badge placed outside the button on purpose (the red "!" on Main Street's arrows)
      // is not spilled text: measure again without absolutely placed badges of at most 32 px
      const badges = [...e.querySelectorAll("*")].filter(c => getComputedStyle(c).position === "absolute" && c.offsetWidth <= 32 && c.offsetHeight <= 32);
      const was = badges.map(c => c.style.display); badges.forEach(c => c.style.display = "none"); const still = spills(); badges.forEach((c, i) => c.style.display = was[i]);
      if (still) issues.push("TEXT SPILLS " + name(e));
    }
  }
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const A = items[i], B = items[j];
    if (A.e.contains(B.e) || B.e.contains(A.e)) continue;
    if (A.e.parentElement === B.e.parentElement && A.e.parentElement?.classList.contains("logo")) continue;   // the TURBO / DASH lockup is drawn tight on purpose
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
  await as("mid", window.__mid());
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
  // ⚡🛞💪 v1.16: the first Garage visit shows the car traits card, and the trait pill opens it again
  const forgetTip = id => { try { const t = JSON.parse(localStorage.getItem("turbodash.tips") || "{}"); delete t[id]; localStorage.setItem("turbodash.tips", JSON.stringify(t)); } catch (e) {} };
  await go("s-traits", async () => { forgetTip("traits"); await hub("garage")(); }, "#s-traits");
  await go("s-garage", hub("garage"));
  await go("s-traits:pill", async () => { document.getElementById("g-trait").click(); }, "#s-traits");
  document.getElementById("tr-ok").click();
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
  // 🎯 v1.13: from Rank 3 the first visit of the week to the track list shows the rival of the week's card
  await go("s-rival", async () => { if (td.S.rivalWeek) td.S.rivalWeek.seen = -1; await hub("race")(); }, "#s-rival");
  await go("s-rival:max", async () => { if (td.S.rivalWeek) Object.assign(td.S.rivalWeek, { seen: -1, lvl: 5 }); await hub("race")(); }, "#s-rival");
  await go("s-tracks", hub("race"));
  // ⚡🛞💪 v1.21: with more than one car, the first track list opens the car kinds card once, and OK goes back to the
  // track list with the kind badge in view
  if (td.S.owned.length > 1) {
    await go("s-traits:kinds", async () => { forgetTip("kinds"); await hub("race")(); await wait(60); if (!document.getElementById("s-rival").hidden) document.getElementById("rw-ok").click(); if (document.getElementById("s-traits").hidden) throw new Error("the car kinds card did not open from the track list"); }, "#s-traits");
    await go("s-tracks:kinds", async () => { document.getElementById("tr-ok").click(); if (document.getElementById("s-tracks").hidden) throw new Error("OK did not go back to the track list"); }, "#s-tracks");
  }
  // 🏆 v1.17: a save with more than one car, driving Zippy, shows Best chips; the first one opens the picture card once
  if (td.S.owned.length > 1) {
    const was = td.S.car; td.S.car = "zippy";
    await go("s-bestcar", async () => { forgetTip("best"); await hub("race")(); }, "#s-bestcar");
    await go("s-tracks:best", () => document.getElementById("bc-ok").click(), "#s-tracks");
    await go("s-garage:best", async () => { td.S.car = was; await hub("garage")(); }, "#s-garage");
    td.S.car = was;
  }
  // 🌟 v1.19: the "New car!" card of every special car, filled in, and the Garage on one (its power line)
  {
    const was = { car: td.S.car, owned: [...td.S.owned] };
    for (const id of ["hopper", "diver", "snowcat", "buggy"]) await go("s-newcar:" + id, async () => { td.newCar(id); }, "#s-newcar");
    await go("s-garage:perk", async () => { td.S.car = "snowcat"; await hub("garage")(); }, "#s-garage");
    td.S.car = was.car; td.S.owned = was.owned;
  }
  // 🌟 v1.20: the Moon's track list with the Moon Hopper's counter chip, filled in, and its tap into the Garage
  {
    const keep = JSON.stringify({ rank: td.S.rank, world: td.S.world, research: td.S.research, stats: td.S.stats });
    await go("s-tracks:earn", async () => {
      Object.assign(td.S, { rank: Math.max(td.S.rank, 21), world: "moon" }); td.S.research = { ...td.S.research, moonTires: 1 }; td.S.stats = { ...td.S.stats, rings: 137 };
      td.openTracks(); await wait(60);
    }, "#s-tracks");
    await go("s-garage:earn", async () => { document.getElementById("ec-chip").click(); }, "#s-garage");
    Object.assign(td.S, JSON.parse(keep)); td.openTracks(); await wait(60);
  }
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
  for (const s of ["s-pvend", "s-name", "s-rankup", "s-cupend", "s-log", "s-grownup", "s-reset", "s-rest", "s-update", "s-pause", "s-leave", "s-boss"]) await go(s, () => td.show(s));
  await go("s-result:pick", async () => { td.showResult({ place: 3, coins: 108, time: 40, stats: { stunts: 1, turbos: 1, bams: 0, powers: 0, pads: 0, rings: 0, pearls: 0, drifts: 0, loops: 0 }, standings: [2, 1, 0, 3, 4, 5] }); }, "#s-result");
  await go("s-result:done", async () => { document.querySelector('.chest[data-i="1"]').click(); await wait(900); }, "#s-result");
  await go("s-result:rival", async () => { td.showResult({ place: 1, coins: 108, time: 40, stats: { stunts: 1, turbos: 1, bams: 0, powers: 0, pads: 0, rings: 0, pearls: 0, drifts: 0, loops: 0 }, standings: [0, 1, 2, 3, 4, 5] }); td.rivalRow({ up: true, name: "Snowball", i: 4, bonus: 1250 }); await wait(900); }, "#s-result");
  // 👑 v1.15 (last, so the boss's track never leaks into the result cards above): the boss intro the first time, in Round 2 (with the paint to win) and after the last round, the boss tab
  // with crowns, and a boss result card (each filled in, not the empty placeholder td.show gives)
  const bossKeep = JSON.stringify(td.S.bosses), ownKeep = JSON.stringify(td.S.owned), paintKeep = JSON.stringify(td.S.paints);
  await go("s-boss:first", () => td.bossIntro("bruno", 0), "#s-boss");
  await go("s-boss:again", () => td.bossIntro("bruno", 1), "#s-boss");
  await go("s-boss:last", () => td.bossIntro("windup", 4), "#s-boss");
  await go("s-tracks:boss-rounds", async () => { td.S.bosses.bruno = 2; td.S.rank = Math.max(td.S.rank, 9); td.openTracks(); await wait(60); document.querySelector('[data-rtab="boss"]').click(); }, "#s-tracks");
  document.querySelector('[data-rtab="races"]').click();
  await go("s-result:boss", async () => { td.S.bosses.bruno = 1; td.bossResult("bruno", 1); await wait(300); }, "#s-result");
  await go("s-result:boss-lost", async () => { td.bossResult("bruno", 2); await wait(300); }, "#s-result");
  Object.assign(td.S, { bosses: JSON.parse(bossKeep), owned: JSON.parse(ownKeep), paints: JSON.parse(paintKeep) });
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
