// Turbo Lab: Professor Bolt researches permanent boosts for every car. Real-time timers that keep going while
// the tablet is off. Paid with coins only; a running project can be rushed for extra coins.
import { RESEARCH, researchCost, researchTime, researchChips, researchRank, benchesFor } from "./data.js";
import { S, save } from "./save.js";

const fmt = s => { s = Math.max(0, Math.ceil(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return h ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${m}:${String(x).padStart(2, "0")}`; };
export const levelOf = id => S.research[id] || 0;

export function createLab({ $, sfx, spend, celebrate, onChange }) {
  const benches = () => {
    const n = benchesFor(S.rank);
    while (S.lab.benches.length < n) S.lab.benches.push({ p: null, end: 0 });
    return S.lab.benches.slice(0, n);
  };
  const busy = id => benches().some(b => b.p === id);
  const left = b => (b.end - Date.now()) / 1000;
  const doneBenches = () => benches().filter(b => b.p && left(b) <= 0);
  const freeBench = () => benches().find(b => !b.p);
  const rushCost = b => Math.max(10, Math.ceil(left(b) / 60) * 30);

  const needsDone = r => (r.needs || []).every(id => levelOf(id) >= 1);
  function start(r) {
    const lvl = levelOf(r.id), bench = freeBench(), chips = researchChips(r, lvl);
    if (S.rank < researchRank(r, lvl) || !needsDone(r) || lvl >= r.max || busy(r.id)) { sfx("nope"); return; }
    if (!bench) { sfx("nope"); flash("bench"); return; }
    if (S.chips < chips) { sfx("nope"); flash("bench"); return; }
    if (!spend(researchCost(r, lvl))) return;
    S.chips -= chips;
    bench.p = r.id; bench.end = Date.now() + researchTime(r, lvl) * 1000;
    save(); sfx("buy"); render(); onChange();
  }
  function collect(b) {
    const r = RESEARCH.find(x => x.id === b.p);
    S.research[r.id] = levelOf(r.id) + 1;
    b.p = null; b.end = 0; save();
    sfx("chest"); celebrate(); render(); onChange();
  }
  function rush(b) {
    if (!spend(rushCost(b))) return;
    b.end = Date.now(); save(); collect(b);
  }
  function flash(what) { const el = $("lab-benches"); el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

  let lastDone = -1;
  function render() {
    const bs = benches();
    lastDone = doneBenches().length;
    $("lab-benches").innerHTML = bs.map((b, i) => {
      if (!b.p) return `<div class="bench empty"><div class="bi">🧪</div><b>Bench ${i + 1}</b><small>Pick research below!</small></div>`;
      const r = RESEARCH.find(x => x.id === b.p), t = left(b), total = researchTime(r, levelOf(r.id));
      if (t <= 0) return `<button class="bench done" data-collect="${i}"><div class="bi">${r.icon}</div><b>${r.name}</b><span class="collect">✔ Tap to collect!</span></button>`;
      return `<div class="bench run"><div class="bi spin">${r.icon}</div><b>${r.name} ${levelOf(r.id) + 1}</b>
        <div class="bar"><i style="width:${Math.round(100 * (1 - t / total))}%"></i></div><span class="timer" data-timer="${i}">⏱ ${fmt(t)}</span>
        <button class="rush" data-rush="${i}">⚡ Rush 🪙${rushCost(b)}</button></div>`;
    }).join("") + (bs.length < 4 ? `<div class="bench locked"><div class="bi">🔒</div><b>Bench ${bs.length + 1}</b><small>Rank ${[2, 4, 9, 15][bs.length]}</small></div>` : "");

    const tiers = [...new Set(RESEARCH.map(r => r.tier))].sort((a, b) => a - b);   // every tier, so new worlds' kits always show
    $("lab-list").innerHTML = tiers.map(tier => {
      const items = RESEARCH.filter(r => r.tier === tier), needRank = items[0].rank, open = S.rank >= needRank;
      return `<div class="tier-head">${open ? "⚗️" : "🔒"} Lab tier ${tier}${open ? "" : ` — Rank ${needRank}`}</div>` + items.map(r => {
        const lvl = levelOf(r.id), max = lvl >= r.max, running = busy(r.id), cost = max ? 0 : researchCost(r, lvl), chips = max ? 0 : researchChips(r, lvl);
        const rk = researchRank(r, lvl), need = (r.needs || []).find(id => levelOf(id) < 1), needR = need && RESEARCH.find(x => x.id === need);
        const ok = open && S.rank >= rk && !need;
        const can = ok && !max && !running && freeBench() && S.coins >= cost && S.chips >= chips;
        const short = n => n >= 10000 ? Math.round(n / 1000) + "k" : n;
        const label = max ? "MAX!" : running ? "⏱ Working…" : S.rank < rk ? "🔒 Rank " + rk : need ? `🔒 ${needR.icon} first` : `🪙${short(cost)}${chips ? " · 🧠" + chips : ""} · ⏱${fmt(researchTime(r, lvl))}`;
        return `<div class="proj ${ok ? "" : "locked"} ${max ? "maxed" : ""} ${r.big ? "teaser big" : ""}">
          <div class="pi">${r.icon}</div><b>${r.name}</b><small>${r.desc}</small>
          <div class="plv">Lv ${lvl}/${r.max}</div>
          <button class="pbtn ${can ? "" : "poor"}" data-start="${r.id}">${label}</button></div>`;
      }).join("");
    }).join("");
  }

  $("lab-benches").addEventListener("click", e => {
    const c = e.target.closest("[data-collect]"), r = e.target.closest("[data-rush]");
    if (c) collect(benches()[+c.dataset.collect]);
    else if (r) rush(benches()[+r.dataset.rush]);
  });
  $("lab-list").addEventListener("click", e => {
    const b = e.target.closest("[data-start]"); if (!b) return;
    start(RESEARCH.find(r => r.id === b.dataset.start));
  });

  // once a second: update countdowns, re-render when something finishes
  let acc = 0;
  function tick(dt, visible) {
    acc += dt; if (acc < 1) return; acc = 0;
    const d = doneBenches().length;
    if (d !== lastDone) { lastDone = d; if (visible) render(); onChange(); } else if (!visible) onChange();
    if (visible) for (const el of document.querySelectorAll("[data-timer]")) { const b = benches()[+el.dataset.timer]; if (b && b.p) el.textContent = "⏱ " + fmt(left(b)); }
  }
  const status = () => {
    const bs = benches(), running = bs.filter(b => b.p);
    if (!bs.length) return { done: false, text: "" };
    if (doneBenches().length) return { done: true, text: "DONE!" };
    if (running.length) return { done: false, text: fmt(Math.min(...running.map(left))) };
    return { done: false, text: "", idle: true };
  };
  return { open: render, render, tick, status };
}
