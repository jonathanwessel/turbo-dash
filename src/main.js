import { CARS, TRACKS, THEMES, WORLDS, trackOpen, MASTERY, starsFor, GOALS, PLAYER, CUPS, CUP_POINTS, RIVALS, DIFFS, diffOf, FRONTS, RANK_CAP, RANK_UNLOCKS, rankNeeds, rankTitle, prizeFor } from "./data.js";
import { Race } from "./engine.js";
import { statsFor } from "./stats.js";
import { townSVG } from "./town.js";
import { createLab } from "./lab.js";
import { drawCar } from "./draw.js";
import { MISSIONS_RANK, todaysMissions, missionText, countRace, missionsReady } from "./missions.js";
import { initAudio, sfx, engine, engineOff, setAudioOpts, setSong } from "./audio.js";
import { S, load, save, exportSave, importSave, upsOf, resetSave, whenSaved, hasBefore, restoreBefore } from "./save.js";
import { cloudReady, cloudWhy, cloudLinked, cloudSignIn, cloudSignOut, syncNow, cloudSaved, cloudWake, onCloudStatus, cloudStatus } from "./cloud.js";
import { confetti, coinBurst } from "./fx.js";
import { createGarage, lookOf } from "./garage.js";

const VERSION = import.meta.env.DEV ? "dev" : __APP_VERSION__;
const $ = id => document.getElementById(id);
const canvas = $("game");
const STEP = 1 / 60;
let resultT = 0;

load();
setAudioOpts({ music: S.music, sfx: S.sfx, volume: S.parent.volume });

const POWER_ICON = { shield: "🛡️", coins: "💰", magnet: "🧲", turbo: "🚀" };
const buzz = ms => { if (S.parent.buzz && navigator.userActivation?.hasBeenActive !== false) try { navigator.vibrate?.(ms); } catch (e) { /* not allowed yet */ } };
const race = new Race(canvas, {
  sfx: n => { sfx(n); if (n === "bonk") buzz(60); else if (n === "bam" || n === "land") buzz(25); },
  // engine hum only during a real race (menus have the demo drive behind them, but only music)
  engine: (r, b) => { if (mode === "race") engine(r, b); },
  onPower: p => { $("btn-power").hidden = !p; if (p) $("power-icon").textContent = POWER_ICON[p]; },
  onFinish: r => { clearTimeout(resultT); resultT = setTimeout(() => { if (mode === "race") showResult(r); }, 1300); },
});

/* ---------- sizing: full screen in landscape, a wide band at the top in portrait ---------- */
function resize() {
  const vw = innerWidth, vh = innerHeight, portrait = vh > vw * 1.05;
  let cw = vw, ch = vh, top = 0;
  if (portrait && mode === "race") { ch = Math.round(Math.min(vh * 0.6, vw * 1.05)); top = Math.round(vh * 0.11); }
  const k = Math.min(window.devicePixelRatio || 1, 2, 720 / ch);
  canvas.width = Math.round(cw * k); canvas.height = Math.round(ch * k);
  Object.assign(canvas.style, { width: cw + "px", height: ch + "px", top: top + "px" });
}
addEventListener("resize", () => resize());

/* ---------- game loop ---------- */
let mode = "menu", screen = "s-title", paused = false, last = performance.now(), acc = 0, goT = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!paused && screen !== "s-hub") { acc += dt; while (acc >= STEP) { race.update(STEP); acc -= STEP; } } else acc = 0;
  if (screen !== "s-hub") race.render();
  if (mode === "race") updateHud(dt);
  if (screen === "s-garage") garage.draw(dt);
  if (!document.hidden && screen !== "s-rest") playMs += dt * 1000;
  if (screen === "s-rest") paintRest();
  lab.tick(dt, screen === "s-lab");
  requestAnimationFrame(frame);
}

/* ---------- input ---------- */
function holdButton(el, on, off) {
  const down = e => { e.preventDefault(); el.setPointerCapture?.(e.pointerId); el.classList.add("on"); on(); };
  const up = () => { el.classList.remove("on"); off(); };
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); el.addEventListener("lostpointercapture", up);
}
holdButton($("btn-left"), () => race.input.left = true, () => race.input.left = false);
holdButton($("btn-right"), () => race.input.right = true, () => race.input.right = false);
$("btn-nitro").addEventListener("pointerdown", e => { e.preventDefault(); race.useNitro(); });
$("btn-power").addEventListener("pointerdown", e => { e.preventDefault(); race.usePower(); });
// Touching the left or right half of the race picture also steers.
const touches = new Map();
const touchSteer = () => { let l = false, r = false; for (const v of touches.values()) v ? (r = true) : (l = true); race.input.left = l; race.input.right = r; };
canvas.addEventListener("pointerdown", e => { if (mode !== "race") return; touches.set(e.pointerId, e.clientX > innerWidth / 2); touchSteer(); });
for (const ev of ["pointerup", "pointercancel", "pointerleave"]) canvas.addEventListener(ev, e => { if (touches.delete(e.pointerId)) touchSteer(); });
const keys = { ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right" };
addEventListener("keydown", e => { if (keys[e.key]) race.input[keys[e.key]] = true; if ((e.key === " " || e.key === "ArrowUp") && mode === "race") race.useNitro(); if ((e.key === "Enter" || e.key === "ArrowDown") && mode === "race") race.usePower(); if (e.key === "Escape" && mode === "race") pause(); });
addEventListener("keyup", e => { if (keys[e.key]) race.input[keys[e.key]] = false; });

/* ---------- screens ---------- */
const SCREENS = ["s-title", "s-hub", "s-tracks", "s-garage", "s-result", "s-pause", "s-gift", "s-trophies", "s-parent", "s-update", "s-rank", "s-rankup", "s-lab", "s-cupend", "s-missions", "s-rest", "s-settings", "s-grownup", "s-reset"];
function show(id) {
  screen = id;
  for (const s of SCREENS) $(s).hidden = s !== id;
  const bars = id && id !== "s-title" && id !== "s-pause";
  $("coinbar").hidden = !bars; $("topright").hidden = id !== "s-hub";
  if (id === "s-hub") refreshHub();
  paintUpdate();
}
function setRaceUi(on) { $("hud").hidden = !on; $("controls").hidden = !on; if (!on) { $("countdown").hidden = true; $("btn-power").hidden = true; } }

function goFullscreen() {
  if (matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches || document.fullscreenElement) return;
  const el = document.documentElement;
  if (!el.requestFullscreen) return;
  el.requestFullscreen({ navigationUI: "hide" }).then(() => window.screen.orientation?.lock?.("landscape")).catch(() => {});
}

// Touch devices: any tap goes back to full screen (kids swipe out of it by accident).
const isTouch = navigator.maxTouchPoints > 0;
for (const ev of ["click", "pointerup"]) document.addEventListener(ev, () => { if (isTouch) goFullscreen(); }, true);
$("btn-full").onclick = () => { if (document.fullscreenElement) document.exitFullscreen?.(); else goFullscreen(); };

/* ---------- coins ---------- */
let shownCoins = S.coins, coinAnim = 0;
function refreshCoins(animate = true) {
  cancelAnimationFrame(coinAnim);
  const from = shownCoins, to = S.coins, t0 = performance.now(), el = $("coin-n");
  if (!animate || from === to) { shownCoins = to; el.textContent = to; return; }
  $("coinbar").classList.remove("bump"); void $("coinbar").offsetWidth; $("coinbar").classList.add("bump");
  const tick = now => {
    const p = Math.min(1, (now - t0) / 700);
    shownCoins = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))); el.textContent = shownCoins;
    if (p < 1) coinAnim = requestAnimationFrame(tick);
  };
  coinAnim = requestAnimationFrame(tick);
}
function refreshChips() { $("chip-wrap").hidden = !S.chips; $("chip-n").textContent = S.chips; }
let toastT = 0;
function toast(text) { const t = $("toast"); t.textContent = text; t.hidden = false; t.style.animation = "none"; void t.offsetWidth; t.style.animation = ""; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2600); }
/* One-time Brain Chip rewards (each key pays once). */
function awardChip(key) { if (S.chipLog[key]) return false; S.chipLog[key] = 1; S.chips++; save(); refreshChips(); setTimeout(() => { toast("+1 🧠 Brain Chip!"); sfx("chest"); }, 900); return true; }
function countUp(el, to, ms = 800) { const t0 = performance.now(); const step = now => { const p = Math.min(1, (now - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
function earn(n, x, y) { S.coins += n; save(); refreshCoins(); if (x != null) coinBurst(x, y); }
function spend(n) {
  if (S.coins < n) { sfx("nope"); const b = $("coinbar"); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); return false; }
  S.coins -= n; save(); refreshCoins(); return true;
}

/* ---------- race setup ---------- */
function carStats() {
  const car = CARS.find(c => c.id === S.car) || CARS[0];
  return { car: lookOf(car), stats: statsFor(car, upsOf(car.id), S.research) };
}

function menuDemo() {
  mode = "menu"; paused = false; setRaceUi(false); engineOff(); setSong("menu"); resize();
  const track = TRACKS.find(t => t.id === S.lastTrack) || TRACKS[0];
  const { car, stats } = carStats();
  race.setup(track, "demo", car, stats);
}

let currentTrack = TRACKS[0];
/* Break reminder: after the parent's set play time, the next race start shows a 10-minute rest screen. */
let playMs = 0;
function restDue() {
  if (S.restUntil > Date.now()) return true;
  if (S.parent.breakMin && playMs >= S.parent.breakMin * 60000) { S.restUntil = Date.now() + 10 * 60000; playMs = 0; save(); return true; }
  return false;
}
function paintRest() {
  const left = Math.max(0, S.restUntil - Date.now());
  $("rest-left").textContent = `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, "0")}`;
  if (left <= 0) { S.restUntil = 0; save(); show("s-title"); }
}
function startRace(track) {
  const midCup = cupRun && cupRun.i > 0;   // never break a cup in the middle
  if (updateReady && !midCup) { updateGate(); return; }   // never start a race on an old version
  if (!midCup && restDue()) { cupRun = null; menuDemo(); show("s-rest"); return; }
  currentTrack = track; S.lastTrack = track.id; save();
  const { car, stats } = carStats();
  mode = "race"; paused = false; resize();
  if (!allowedDiffs().includes(S.diff)) S.diff = allowedDiffs()[0];
  const autoLv = S.research.autoSteer || 0, autoOk = autoLv > 0 && S.parent.autoSteer;
  race.setup(track, "race", car, stats, { diff: S.diff, helper: S.parent.helper, autoSteer: autoOk && S.autoOn ? autoLv : 0 });
  $("btn-auto").hidden = !autoOk; $("auto-lv").textContent = autoLv; $("btn-auto").classList.toggle("on", autoOk && S.autoOn);
  show(null); setRaceUi(true); setSong("race");
  buildProgress(); lastCount = null; hudCache = {};
}

/* ---------- HUD ---------- */
const suffix = n => n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
let dots = [], lastCount = null, hudCache = {};
function buildProgress() {
  const box = $("h-track"); box.innerHTML = ""; dots = [];
  for (let i = 0; i < 6; i++) { const d = document.createElement("i"); box.appendChild(d); dots.push(d); }
}
function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
function updateHud(dt) {
  const h = race.hud();
  setText("h-pos", h.pos); setText("h-suffix", suffix(h.pos)); setText("h-lap", h.lap); setText("h-laps", h.laps); setText("h-coins", h.coins);
  h.progress.forEach((p, i) => { const d = dots[i]; d.style.left = (p.f * 100).toFixed(1) + "%"; d.style.background = p.color; d.classList.toggle("me", p.me); });
  $("nitro-fill").style.height = (h.nitroOn ? 100 : h.nitro * 100).toFixed(0) + "%";
  $("btn-nitro").classList.toggle("ready", h.nitro >= 1 && h.state === "race");
  const cd = $("countdown");
  if (h.state === "countdown") {
    if (h.count !== lastCount) { lastCount = h.count; cd.hidden = false; cd.textContent = h.count > 0 ? h.count : "GO!"; cd.classList.remove("pop"); void cd.offsetWidth; cd.classList.add("pop"); }
  } else if (lastCount !== "go") {
    lastCount = "go"; cd.hidden = false; cd.textContent = "GO!"; cd.classList.remove("pop"); void cd.offsetWidth; cd.classList.add("pop"); goT = 0.9;
  } else if (goT > 0) { goT -= dt; if (goT <= 0) cd.hidden = true; }
}

/* ---------- tracks ---------- */
const unlocked = i => !!TRACKS[i] && trackOpen(S, TRACKS[i]);
const MEDAL = ["", "🏆", "🥈", "🥉"];
const allowedDiffs = () => { const L = DIFFS.filter(d => S.parent.diffs.includes(d.id) && (!d.rank || S.rank >= d.rank)).map(d => d.id); return L.length ? L : ["normal"]; };
function paintDiffBar() {
  $("diff-bar").innerHTML = DIFFS.filter(d => S.parent.diffs.includes(d.id)).map(d => {
    const locked = d.rank && S.rank < d.rank;
    return `<button data-diff="${d.id}" class="${S.diff === d.id ? "on" : ""} ${locked ? "locked" : ""}">${locked ? "🔒" : d.icon} ${d.name}<small>${locked ? "Rank " + d.rank : "🪙 ×" + d.pay}</small></button>`;
  }).join("");
}
$("diff-bar").addEventListener("click", e => {
  const b = e.target.closest("[data-diff]"); if (!b) return;
  const d = diffOf(b.dataset.diff);
  if (d.rank && S.rank < d.rank) { sfx("nope"); b.animate([{ transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "none" }], { duration: 300 }); return; }
  sfx("click"); S.diff = d.id; save(); openTracks();
});
let raceTab = "races";
const cupOpen = cup => S.rank >= Math.max(5, cup.rank || 0) && cup.tracks.every(id => unlocked(TRACKS.findIndex(t => t.id === id)));
function paintCups() {
  $("cup-list").innerHTML = CUPS.map(c => {
    const open = cupOpen(c), best = S.cups[c.id + ":" + S.diff], car = CARS.find(x => x.id === c.car), need = Math.max(5, c.rank || 0);
    return `<button class="cup-card ${open ? "" : "locked"}" data-cup="${c.id}" style="border-color:${c.color}">
      <div class="cc-cup" style="filter:drop-shadow(0 0 10px ${c.color})">🏆</div><div class="cc-name" style="color:${c.color}">${c.name}</div>
      <div class="cc-tracks">${c.tracks.map(id => TRACKS.find(t => t.id === id).icon).join("")}</div>
      <div class="cc-best">${best ? (MEDAL[best] || "🏁") : ""}</div>
      <div class="cc-car">${S.owned.includes(car.id) ? "✔ " : "Win: 🚗 "}${car.name}</div>
      ${open ? "" : `<div class="tc-lock">🔒<small>${S.rank < need ? "Rank " + need : "Open all 3 tracks"}</small></div>`}</button>`;
  }).join("");
}
function paintRaceTabs() {
  document.querySelectorAll("[data-rtab]").forEach(b => { b.classList.toggle("on", b.dataset.rtab === raceTab); if (b.dataset.rtab === "cups") b.classList.toggle("locked", S.rank < 5); });
  $("track-list").hidden = raceTab !== "races"; $("cup-list").hidden = raceTab !== "cups";
  if (raceTab === "cups") paintCups();
}
document.querySelectorAll("[data-rtab]").forEach(b => b.onclick = () => {
  if (b.dataset.rtab === "cups" && S.rank < 5) { sfx("nope"); toast("🔒 Cups open at Rank 5"); return; }
  sfx("click"); raceTab = b.dataset.rtab; paintRaceTabs();
});
$("cup-list").addEventListener("click", e => {
  const c = e.target.closest("[data-cup]"); if (!c) return;
  const cup = CUPS.find(x => x.id === c.dataset.cup);
  if (!cupOpen(cup)) { sfx("nope"); c.animate([{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], { duration: 300 }); return; }
  sfx("click"); startCup(cup);
});
function paintWorlds() {
  $("world-bar").innerHTML = WORLDS.map(w => `<button data-world="${w.id}" class="${w.soon ? "soon" : "on"}">${w.icon} ${w.name}${w.soon ? " 🔒" : ""}</button>`).join("");
}
$("world-bar").addEventListener("click", e => { const b = e.target.closest("[data-world]"); if (!b) return; const w = WORLDS.find(x => x.id === b.dataset.world); if (w.soon) { sfx("nope"); toast(`${w.icon} ${w.name} is coming soon!`); } else sfx("click"); });
function openTracks() {
  if (!allowedDiffs().includes(S.diff)) S.diff = allowedDiffs()[0];
  paintWorlds(); paintDiffBar(); paintRaceTabs();
  const list = $("track-list");
  list.innerHTML = TRACKS.map((t, i) => {
    const th = THEMES[t.theme], open = unlocked(i), best = S.bestD[t.id + ":" + S.diff];
    return `<button class="track-card ${open ? "" : "locked"}" data-i="${i}" style="background:linear-gradient(${th.sky[0]},${th.sky[1]} 55%,${th.grass[0]} 56%)">
      <div class="tc-icon">${t.icon}</div><div class="tc-name">${t.name}</div>
      <div class="tc-best">${best ? (MEDAL[best] || "🏁") : ""}</div>
      <div class="tc-stars">${MASTERY.map((n, k) => k < starsFor(S.mastery[t.id + ":" + S.diff] || 0) ? "★" : "☆").join("")}</div>
      <div class="tc-prize">🪙 ${prizeFor(t, 1, S.diff)}</div>
      ${open ? "" : `<div class="tc-lock">🔒<small>Win 🏆 on ${TRACKS.find(x => x.id === t.after).name} (🚗 or 🔥)</small></div>`}</button>`;
  }).join("");
  show("s-tracks");
  const cur = list.querySelector(`[data-i="${Math.max(0, TRACKS.findIndex(t => t.id === S.lastTrack))}"]`);
  cur?.scrollIntoView({ inline: "center", block: "center" });
}
$("track-list").addEventListener("click", e => {
  const c = e.target.closest(".track-card"); if (!c) return;
  const i = +c.dataset.i;
  if (!unlocked(i)) { sfx("nope"); c.animate([{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], { duration: 300 }); return; }
  sfx("click"); cupRun = null; startRace(TRACKS[i]);
});

/* ---------- cups ---------- */
let cupRun = null;   // { cup, i: race index 0-2, pts: [player, rival1..5] }
function startCup(cup) { cupRun = { cup, i: 0, pts: [0, 0, 0, 0, 0, 0], diff: S.diff }; startRace(TRACKS.find(t => t.id === cup.tracks[0])); }
const racerName = k => k === 0 ? PLAYER : RIVALS[k - 1].name, racerColor = k => k === 0 ? (CARS.find(c => c.id === S.car) || CARS[0]).body : RIVALS[k - 1].body;
const cupOrder = () => [0, 1, 2, 3, 4, 5].sort((a, b) => cupRun.pts[b] - cupRun.pts[a] || (a === 0 ? -1 : b === 0 ? 1 : 0));
function paintCupResult() {
  const c = cupRun, order = cupOrder();
  $("r-cup").hidden = false;
  $("r-cup").innerHTML = `<div class="rc-head">🏆 ${c.cup.name} — race ${c.i + 1} of 3</div>
    <div class="rc-map">${c.cup.tracks.map((id, j) => `<span class="${j < c.i ? "done" : j === c.i ? "done now" : ""}">${TRACKS.find(t => t.id === id).icon}</span>`).join("")}</div>
    <div class="standings">${order.map((k, n) => `<span class="${k === 0 ? "me" : ""}" style="border-color:${racerColor(k)}">${n + 1}. ${racerName(k)} ${c.pts[k]}</span>`).join("")}</div>`;
}
function showCupEnd() {
  const c = cupRun, order = cupOrder(), place = order.indexOf(0) + 1, key = c.cup.id + ":" + c.diff;
  const coins = Math.round(c.cup.bonus * diffOf(c.diff).pay * [1, 0.6, 0.4, 0.25, 0.15, 0.15][place - 1] * (1 + 0.05 * (S.research.coinBoost || 0)));
  S.cups[key] = Math.min(S.cups[key] || 99, place); S.coins += coins;
  const prizes = [`🪙 ${coins}`];
  if (place === 1) {
    const car = CARS.find(x => x.id === c.cup.car);
    if (!S.owned.includes(car.id)) { S.owned.push(car.id); upsOf(car.id); prizes.push(`🚗 ${car.name}!`); }
    if (awardChip("cup:" + key)) prizes.push("🧠 Brain Chip");
  }
  save(); cupRun = null;
  $("ce-title").textContent = c.cup.name + "!";
  $("ce-place").textContent = place <= 3 ? `${place}${suffix(place)} place, ${PLAYER}!` : `${place}${suffix(place)} — try again!`;
  $("ce-prizes").innerHTML = prizes.map(p => `<span>${p}</span>`).join("");
  drawPodium(order);
  show("s-cupend"); refreshCoins(); sfx(place <= 3 ? "win" : "lose"); if (place <= 3) confetti(place === 1 ? 220 : 100);
}
function drawPodium(order) {
  const cv = $("podium"), ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  const steps = [{ k: order[1], x: W * 0.22, h: 70, n: 2, c: "#c0c8d6" }, { k: order[0], x: W * 0.5, h: 105, n: 1, c: "#ffd400" }, { k: order[2], x: W * 0.78, h: 45, n: 3, c: "#e09a52" }];
  for (const s of steps) {
    ctx.fillStyle = s.c; ctx.fillRect(s.x - 80, H - s.h, 160, s.h);
    ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.fillRect(s.x - 80, H - s.h, 160, 8);
    ctx.fillStyle = "#4a2600"; ctx.font = "900 38px system-ui"; ctx.textAlign = "center"; ctx.fillText(s.n, s.x, H - s.h / 2 + 14);
    const def = s.k === 0 ? lookOf(CARS.find(c => c.id === S.car) || CARS[0]) : RIVALS[s.k - 1];
    drawCar(ctx, s.x, H - s.h - 4, 120, def, { t: 0 });
    ctx.fillStyle = "#fff"; ctx.font = "900 20px system-ui"; ctx.fillText(racerName(s.k), s.x, H - s.h - 100);
  }
}
$("ce-ok").onclick = () => { sfx("click"); menuDemo(); openTracks(); };

/* ---------- results + treasure chests ---------- */
let chestValues = [], chestDone = false, nextTrack = null;
function showResult(r) {
  const goalsBefore = claimable().length;
  const ti = TRACKS.indexOf(currentTrack), openBefore = TRACKS.filter(t => trackOpen(S, t));
  const prize = Math.round(prizeFor(currentTrack, r.place, S.diff) * (1 + 0.05 * (S.research.coinBoost || 0)));
  S.races++; if (r.place === 1) S.wins++;
  S.best[currentTrack.id] = Math.min(S.best[currentTrack.id] || 99, r.place);
  const dk = currentTrack.id + ":" + S.diff;
  S.bestD[dk] = Math.min(S.bestD[dk] || 99, r.place);
  if (r.place === 1) {
    const before = starsFor(S.mastery[dk] || 0);
    S.mastery[dk] = (S.mastery[dk] || 0) + 1;
    if (starsFor(S.mastery[dk]) > before) setTimeout(() => toast(`⭐ Mastery star ${starsFor(S.mastery[dk])} on ${currentTrack.name}!`), 1800);
  }
  S.coins += prize + r.coins;
  if (S.diff === "hard" && r.place === 1) awardChip("hard:" + currentTrack.id);
  if (cupRun) r.standings.forEach((k, n) => { cupRun.pts[k] += CUP_POINTS[n]; });
  countRace(r, currentTrack.id, dayKey(new Date()), unlocked);
  S.history.unshift({ d: dayKey(new Date()), t: currentTrack.id, df: S.diff, p: r.place, c: prize + r.coins }); S.history.length = Math.min(S.history.length, 30);
  S.stats.roadCoins += r.coins; S.stats.stunts += r.stats.stunts; S.stats.turbos += r.stats.turbos; S.stats.bams += r.stats.bams; S.stats.powers = (S.stats.powers || 0) + r.stats.powers;
  save();
  mode = "result"; setRaceUi(false); engineOff();
  $("r-trophy").textContent = MEDAL[r.place] || "🏁";
  $("r-title").textContent = r.place <= 3 ? `${r.place}${suffix(r.place)} PLACE!` : `${r.place}${suffix(r.place)} — Good try!`;
  countUp($("r-prize"), prize); countUp($("r-road"), r.coins);
  const cheers = r.place === 1 ? ["Way to go, " + PLAYER + "!", "You're the champ, " + PLAYER + "!", "Super fast, " + PLAYER + "!"]
    : r.place <= 3 ? ["Great driving, " + PLAYER + "!", "So close, " + PLAYER + "!"] : ["Upgrade your car and try again, " + PLAYER + "!", "Keep going, " + PLAYER + "!"];
  $("r-sub").textContent = cheers[Math.floor(Math.random() * cheers.length)];
  $("r-goal").hidden = claimable().length <= goalsBefore;
  const fresh = TRACKS.filter(t => trackOpen(S, t) && !openBefore.includes(t));
  const next = fresh[0] || TRACKS.slice(ti + 1).find(t => trackOpen(S, t)), nowOpen = !!next;
  nextTrack = next;
  $("r-unlock").hidden = !fresh.length;
  if (fresh.length) $("r-unlock").textContent = `🔓 New track${fresh.length > 1 ? "s" : ""}: ${fresh.map(t => t.icon + " " + t.name).join(", ")}!`;
  const base = Math.round((30 + 25 * currentTrack.diff) * diffOf(S.diff).pay * (1 + 0.15 * (S.research.luckyChests || 0)));
  chestValues = [base, base * 2, base * 4].sort(() => Math.random() - 0.5);
  chestDone = false;
  document.querySelectorAll(".chest").forEach(c => { c.className = "chest"; c.textContent = "🎁"; });
  $("r-chests").hidden = false; $("r-btns").hidden = true; $("r-pick").textContent = "Pick a treasure chest!";
  $("r-cup").hidden = true;
  if (cupRun) { paintCupResult(); $("btn-next").hidden = false; $("btn-again").hidden = true; $("btn-next").textContent = cupRun.i < 2 ? "Next race ▶" : "🏆 Cup results!"; }
  else { $("btn-next").hidden = !nowOpen; $("btn-again").hidden = false; $("btn-next").textContent = "Next ▶"; }
  show("s-result"); refreshCoins();
  sfx(r.place <= 3 ? "win" : "lose");
  if (r.place <= 3) confetti(r.place === 1 ? 160 : 80);
}
document.querySelectorAll(".chest").forEach(c => c.addEventListener("click", () => {
  if (chestDone) return; chestDone = true;
  const i = +c.dataset.i;
  document.querySelectorAll(".chest").forEach((o, j) => { o.className = "chest " + (j === i ? "open" : "other"); o.textContent = "🪙" + chestValues[j]; });
  sfx("chest");
  const rect = c.getBoundingClientRect();
  earn(chestValues[i], rect.left + rect.width / 2, rect.top + rect.height / 2);
  $("r-pick").textContent = `You got 🪙${chestValues[i]}!`;
  setTimeout(() => { $("r-btns").hidden = false; }, 600);
}));
$("btn-again").onclick = () => { sfx("click"); startRace(currentTrack); };
$("btn-next").onclick = () => {
  sfx("click");
  if (cupRun) { if (cupRun.i < 2) { cupRun.i++; startRace(TRACKS.find(t => t.id === cupRun.cup.tracks[cupRun.i])); } else showCupEnd(); return; }
  if (nextTrack) startRace(nextTrack);
};
$("btn-home").onclick = () => { sfx("click"); cupRun = null; menuDemo(); show("s-hub"); };

/* ---------- daily gift ---------- */
const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const giftReady = () => S.lastGift !== dayKey(new Date());
function giftInfo() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  const streak = S.lastGift === dayKey(y) ? S.giftStreak + 1 : 1;
  return { streak, amount: 100 + 50 * Math.min(streak, 7) };
}
function openGift() {
  if (!giftReady()) { sfx("nope"); return; }
  const g = giftInfo();
  $("gift-day").textContent = `Day ${g.streak}` + (g.streak > 1 ? " in a row! 🔥" : "");
  $("gift-amt").textContent = g.amount;
  show("s-gift"); sfx("chest");
}
$("gift-take").onclick = () => {
  if (!giftReady()) { show("s-hub"); return; }
  const g = giftInfo();
  S.lastGift = dayKey(new Date()); S.giftStreak = g.streak;
  if (g.streak % 7 === 0) awardChip("gift7:" + S.lastGift);
  const r = $("gift-take").getBoundingClientRect();
  earn(g.amount, r.left + r.width / 2, r.top);
  sfx("buy"); confetti(90);
  show("s-hub");
};

/* ---------- trophy room + goals ---------- */
const claimable = () => GOALS.filter(g => !S.claimed.includes(g.id) && g.have(S) >= g.goal);
function openTrophies() {
  $("shelf").innerHTML = TRACKS.map(t => { const b = Math.min(...DIFFS.map(d => S.bestD[t.id + ":" + d.id] || 99)) < 99 ? Math.min(...DIFFS.map(d => S.bestD[t.id + ":" + d.id] || 99)) : 0; return `<div class="${b ? "" : "none"}"><b>${b ? (MEDAL[b] || "🏁") : "🏆"}</b>${t.icon} ${t.name}</div>`; }).join("");
  const rank = g => S.claimed.includes(g.id) ? 2 : g.have(S) >= g.goal ? 0 : 1;
  const list = [...GOALS].sort((a, b) => rank(a) - rank(b));
  $("goals").innerHTML = list.map(g => {
    const have = Math.min(g.goal, g.have(S)), done = S.claimed.includes(g.id), ready = !done && have >= g.goal;
    return `<div class="goal ${ready ? "ready" : done ? "done" : ""}"><span class="gi">${g.icon}</span>
      <div class="gm"><b>${g.name}</b><div class="bar"><i style="width:${Math.round(100 * have / g.goal)}%"></i></div><small>${have} / ${g.goal}</small></div>
      <button data-goal="${g.id}">${done ? "✔ Got it" : "🪙 " + g.reward}</button></div>`;
  }).join("");
  show("s-trophies");
}
$("goals").addEventListener("click", e => {
  const b = e.target.closest("[data-goal]"); if (!b) return;
  const g = GOALS.find(x => x.id === b.dataset.goal);
  if (S.claimed.includes(g.id)) { sfx("click"); return; }
  if (g.have(S) < g.goal) { sfx("nope"); return; }
  S.claimed.push(g.id);
  const r = b.getBoundingClientRect();
  earn(g.reward, r.left + r.width / 2, r.top + r.height / 2);
  sfx("chest"); confetti(70);
  const top = $("goals").scrollTop; openTrophies(); $("goals").scrollTop = top;
});

/* ---------- racer rank: all four fronts must be full ---------- */
const frontsNow = () => { const need = rankNeeds(S.rank); return FRONTS.map(f => ({ ...f, have: f.have(S), need: need[f.id] })); };
const rankReady = () => S.rank < RANK_CAP && frontsNow().every(f => f.have >= f.need);
function openRank() {
  const fr = frontsNow(), ready = rankReady(), maxed = S.rank >= RANK_CAP;
  $("rk-num").textContent = S.rank; $("rk-title").textContent = rankTitle(S.rank);
  const un = RANK_UNLOCKS[S.rank + 1];
  $("rk-next").textContent = maxed ? "Top rank for now! More ranks are coming in new versions." : un ? `Next rank opens: ${un.icon} ${un.text}` : `Next: Rank ${S.rank + 1}`;
  const lowest = fr.reduce((a, f) => (f.have / Math.max(1, f.need) < a.have / Math.max(1, a.need) ? f : a), fr[0]);
  $("fronts").innerHTML = fr.map(f => {
    const full = f.have >= f.need, pct = f.need ? Math.min(100, Math.round(100 * f.have / f.need)) : 100;
    return `<div class="front ${full ? "full" : f === lowest && !maxed ? "behind" : ""}"><div class="fi">${f.icon}</div><b>${f.name}</b>
      <div class="gauge"><i style="width:${pct}%"></i></div><small>${full ? "✔ " : ""}${Math.min(f.have, f.need)} / ${f.need}</small></div>`;
  }).join("");
  $("rk-up").hidden = !ready;
  $("rk-hint").textContent = ready || maxed ? "" : `${lowest.icon} ${lowest.hint}`;
  show("s-rank");
}
$("rk-up").onclick = () => {
  if (!rankReady()) return;
  S.rank++;
  const reward = 200 * S.rank; S.coins += reward; save();
  if (S.rank >= 5) awardChip("rank:" + S.rank);
  $("ru-num").textContent = S.rank; $("ru-title").textContent = `Rank ${S.rank} · ${rankTitle(S.rank)}`;
  const un = RANK_UNLOCKS[S.rank];
  $("ru-unlock").textContent = un ? `${un.icon} ${un.text} unlocked!` : "";
  $("ru-coins").textContent = reward;
  show("s-rankup"); sfx("win"); confetti(180);
};
$("ru-take").onclick = () => { sfx("buy"); refreshCoins(); openRank(); };
$("rank-pill").onclick = () => { sfx("click"); openRank(); };

/* ---------- daily missions ---------- */
function openMissions() {
  const M = todaysMissions(dayKey(new Date()), unlocked);
  $("mis-list").innerHTML = M.list.map((m, i) => {
    const { icon, text } = missionText(m), ready = !m.claimed && m.have >= m.goal;
    return `<div class="mis ${ready ? "ready" : m.claimed ? "done" : ""}"><div class="mi">${icon}</div><b>${text}</b>
      <div class="bar"><i style="width:${Math.round(100 * m.have / m.goal)}%"></i></div><small>${m.have} / ${m.goal}</small>
      <button data-mis="${i}">${m.claimed ? "✔ Done" : "🪙 " + m.reward}</button></div>`;
  }).join("");
  const all = M.list.every(m => m.claimed);
  if (all && !M.bonus) {
    M.bonus = true; S.coins += 200 + 50 * S.rank; save();
    awardChip("missions:" + M.day); refreshCoins(); confetti(140); sfx("win");
  }
  $("mis-bonus").className = "mis-bonus " + (M.bonus ? "got" : "");
  $("mis-bonus").textContent = M.bonus ? "✔ All done today! New missions tomorrow." : `Finish all 3 → 🧠 Brain Chip + 🪙 ${200 + 50 * S.rank}`;
  show("s-missions");
}
$("mis-list").addEventListener("click", e => {
  const b = e.target.closest("[data-mis]"); if (!b) return;
  const m = S.missions.list[+b.dataset.mis];
  if (m.claimed) { sfx("click"); return; }
  if (m.have < m.goal) { sfx("nope"); return; }
  m.claimed = true;
  const r = b.getBoundingClientRect();
  earn(m.reward, r.left + r.width / 2, r.top); sfx("chest");
  setTimeout(openMissions, 350);
});

/* ---------- hub, garage, settings ---------- */
const garage = createGarage({ $, sfx, spend, celebrate: () => confetti(100) });
let giftShownThisVisit = false;
$("town-wrap").innerHTML = townSVG();
const tb = (id, on) => { $(id).style.display = on ? "" : "none"; };
function refreshHub() {
  tb("tb-gift", giftReady()); tb("tb-garage", garage.affordable()); tb("tb-trophy", claimable().length > 0); tb("tb-rank", rankReady());
  $("lab-lock").style.display = S.rank >= 2 ? "none" : "";
  $("mis-lock").style.display = S.rank >= MISSIONS_RANK ? "none" : "";
  if (S.rank >= MISSIONS_RANK) todaysMissions(dayKey(new Date()), unlocked);
  tb("tb-missions", S.rank >= MISSIONS_RANK && missionsReady());
  const ls = lab.status();
  tb("tb-lab", S.rank >= 2 && (ls.done || ls.idle)); $("lab-timer").textContent = ls.text;
  $("tw-rank").textContent = S.rank; $("rp-rank").textContent = S.rank; $("rp-title").textContent = rankTitle(S.rank);
  // wide screens: fill and trim the sky; squarer or portrait screens: show the whole street
  $("town").setAttribute("preserveAspectRatio", innerWidth / innerHeight < 1.55 ? "xMidYMid meet" : "xMidYMax slice");
}
addEventListener("resize", () => { if (screen === "s-hub") refreshHub(); });
$("town-wrap").addEventListener("click", e => {
  const b = e.target.closest("[data-go]"); if (!b) return;
  const go = b.dataset.go;
  const nope = () => { sfx("nope"); b.classList.remove("shake"); void b.getBBox(); b.classList.add("shake"); };
  if (go === "race") { sfx("click"); openTracks(); }
  else if (go === "garage") { sfx("click"); garage.open(); show("s-garage"); }
  else if (go === "gift") { sfx("click"); openGift(); }
  else if (go === "trophy") { sfx("click"); openTrophies(); }
  else if (go === "rank") { sfx("click"); openRank(); }
  else if (go === "school") { sfx("nope"); b.classList.remove("shake"); void b.getBBox(); b.classList.add("shake"); toast("🚦 Driver School is coming soon!"); }
  else if (go === "missions") { if (S.rank < MISSIONS_RANK) { nope(); toast("🔒 Missions open at Rank " + MISSIONS_RANK); } else { sfx("click"); openMissions(); } }
  else if (go === "lab") { if (S.rank < 2) { nope(); setTimeout(openRank, 350); } else { sfx("click"); openLab(); } }
});
const lab = createLab({ $, sfx, spend, celebrate: () => confetti(90), onChange: () => { refreshChips(); if (screen === "s-hub") refreshHub(); } });
const PROF = ["Hi " + PLAYER + "! What should we invent?", "Beep boop! Science time!", "Research makes EVERY car better!", "Let's make you super fast, " + PLAYER + "!"];
function openLab() { $("prof-say").textContent = PROF[Math.floor(Math.random() * PROF.length)]; lab.open(); show("s-lab"); }
function goHub() {
  show("s-hub");
  if (giftReady() && !giftShownThisVisit) { giftShownThisVisit = true; setTimeout(() => { if (screen === "s-hub") openGift(); }, 400); }
}
document.querySelectorAll("[data-back]").forEach(b => b.onclick = () => { sfx("click"); show("s-hub"); });

function paintToggles() {
  $("btn-music").classList.toggle("off", !S.music); $("btn-sfx").classList.toggle("off", !S.sfx);
  $("set-music").textContent = S.music ? "On" : "Off"; $("set-sfx").textContent = S.sfx ? "On" : "Off";
}
$("btn-music").onclick = () => { S.music = !S.music; save(); setAudioOpts({ music: S.music }); paintToggles(); sfx("click"); };
$("btn-sfx").onclick = () => { S.sfx = !S.sfx; save(); setAudioOpts({ sfx: S.sfx }); paintToggles(); sfx("click"); };
paintToggles();

function pause() { if (mode !== "race") return; paused = true; engineOff(); show("s-pause"); }
$("btn-play").onclick = () => {
  initAudio(); goFullscreen(); sfx("click"); goHub();
  cloudWake().then(r => { if (r === "loaded") location.reload(); });   // quietly reconnect Google Save (needs this tap)
};
whenSaved(cloudSaved);
function paintCloud() {
  const ok = cloudReady(), linked = cloudLinked();
  $("g-in").hidden = linked || !ok; $("g-now").hidden = !linked || !ok; $("g-out").hidden = !linked;
  $("g-msg").textContent = !ok ? cloudWhy() : cloudStatus() || (linked ? "Signed in. Progress is saved to Google after races." : "");
}
onCloudStatus(() => { if (screen === "s-parent") paintCloud(); });
$("g-in").onclick = async () => { await cloudSignIn(); paintCloud(); if (cloudStatus().startsWith("Loaded")) setTimeout(() => location.reload(), 1200); };
$("g-now").onclick = async () => { const r = await syncNow(true); paintCloud(); if (r === "loaded") setTimeout(() => location.reload(), 1200); };
$("g-out").onclick = () => { if (confirm("Stop saving to Google? Progress stays on this tablet.")) { cloudSignOut(); paintCloud(); } };
$("p-undo").onclick = () => { if (confirm("Go back to the save from before the last reset or load?")) { restoreBefore(); location.reload(); } };
$("btn-pause").onclick = () => { sfx("click"); pause(); };
$("btn-auto").onclick = () => {
  S.autoOn = !S.autoOn; save(); sfx("click");
  race.autoLvl = S.autoOn ? (S.research.autoSteer || 0) : 0;
  $("btn-auto").classList.toggle("on", S.autoOn);
};
$("btn-resume").onclick = () => { sfx("click"); paused = false; show(null); };
$("btn-quit").onclick = () => { sfx("click"); cupRun = null; menuDemo(); show("s-hub"); };
document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });

/* ---------- parent corner: tap the version label 5 times ---------- */
let verTaps = [];
$("ver").onclick = () => {
  const now = Date.now(); verTaps = verTaps.filter(t => now - t < 3000); verTaps.push(now);
  if (verTaps.length >= 5) { verTaps = []; $("p-code").value = exportSave(); $("p-msg").textContent = ""; paintParent(); show("s-parent"); }
};
function paintParent() {
  paintCloud(); $("p-undo").hidden = !hasBefore();
  $("p-break").innerHTML = [0, 20, 30, 45, 60].map(m => `<button data-pb="${m}" class="${S.parent.breakMin === m ? "on" : ""}">${m ? m + " min" : "Off"}</button>`).join("");
  $("p-auto").innerHTML = [true, false].map(v => `<button data-pa="${v}" class="${S.parent.autoSteer === v ? "on" : ""}">${v ? "Yes" : "No"}</button>`).join("");
  $("p-buzz").innerHTML = [true, false].map(v => `<button data-pz="${v}" class="${S.parent.buzz === v ? "on" : ""}">${v ? "On" : "Off"}</button>`).join("");
  $("p-vol").value = Math.round(S.parent.volume * 100);
  $("p-rest-row").hidden = !(S.restUntil > Date.now());
  const nm = id => TRACKS.find(t => t.id === id)?.icon || "", df = id => diffOf(id).icon;
  $("p-hist").innerHTML = S.history.length ? S.history.slice(0, 20).map(h => `<span>${h.d.slice(5)}</span><span>${nm(h.t)}</span><span>${df(h.df)}</span><span>${h.p}${suffix(h.p)}</span><span>🪙${h.c}</span>`).join("") : "<span>No races yet.</span>";
  $("p-diffs").innerHTML = DIFFS.map(d => `<button data-pd="${d.id}" class="${S.parent.diffs.includes(d.id) ? "on" : ""}">${d.icon} ${d.name}</button>`).join("");
  $("p-helper").innerHTML = ["Off", "A little", "Lots"].map((n, i) => `<button data-ph="${i}" class="${S.parent.helper === i ? "on" : ""}">${n}</button>`).join("");
}
$("s-parent").addEventListener("click", e => {
  const d = e.target.closest("[data-pd]"), h = e.target.closest("[data-ph]");
  if (d) { const id = d.dataset.pd, L = S.parent.diffs; if (L.includes(id)) { if (L.length > 1) L.splice(L.indexOf(id), 1); } else L.push(id); save(); paintParent(); }
  if (h) { S.parent.helper = +h.dataset.ph; save(); paintParent(); }
  const pb = e.target.closest("[data-pb]"), pz = e.target.closest("[data-pz]");
  if (pb) { S.parent.breakMin = +pb.dataset.pb; playMs = 0; save(); paintParent(); }
  if (pz) { S.parent.buzz = pz.dataset.pz === "true"; save(); paintParent(); }
  const pa = e.target.closest("[data-pa]");
  if (pa) { S.parent.autoSteer = pa.dataset.pa === "true"; save(); paintParent(); }
});
$("p-copy").onclick = async () => {
  const code = exportSave(); $("p-code").value = code;
  try { await navigator.clipboard.writeText(code); $("p-msg").textContent = "Copied! Paste it somewhere safe (a note or a text to yourself)."; }
  catch (e) { $("p-code").select(); $("p-msg").textContent = "Select the code above and copy it."; }
};
$("p-load").onclick = () => {
  const code = $("p-code").value;
  if (code.trim() === exportSave()) { $("p-msg").textContent = "That's the save already on this tablet."; return; }
  if (!confirm("Replace the progress on this tablet with the pasted code?")) return;
  try { importSave(code); location.reload(); }
  catch (e) { $("p-msg").textContent = "That code didn't work. Check that the whole code was pasted."; }
};
$("p-close").onclick = () => show("s-title");
$("p-vol").oninput = () => { S.parent.volume = $("p-vol").value / 100; setAudioOpts({ volume: S.parent.volume }); save(); };
$("p-endrest").onclick = () => { S.restUntil = 0; playMs = 0; save(); paintParent(); };
/* ---------- settings ---------- */
$("btn-settings").onclick = () => { sfx("click"); $("set-ver").textContent = VERSION === "dev" ? "dev build" : "v" + VERSION; paintToggles(); show("s-settings"); };
/* Grown-up check: a sum a 6-year-old can't do yet, with four big answers to tap. */
let guPass = null, guBack = "s-settings";
function grownUp(back, onPass) {
  guPass = onPass; guBack = back;
  const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4), ans = a + b;
  const opts = [...new Set([ans, ans + 1, ans - 1, ans + 2, ans - 2])].slice(0, 5).sort(() => Math.random() - 0.5).slice(0, 4);
  if (!opts.includes(ans)) opts[0] = ans;
  $("gq").textContent = `What is ${a} + ${b}?`;
  $("ga").innerHTML = opts.sort((x, y) => x - y).map(n => `<button data-ans="${n === ans ? 1 : 0}">${n}</button>`).join("");
  show("s-grownup");
}
$("ga").addEventListener("click", e => {
  const b = e.target.closest("[data-ans]"); if (!b) return;
  if (b.dataset.ans === "1") { sfx("click"); const f = guPass; guPass = null; f(); }
  else { sfx("nope"); const g = $("ga"); g.classList.remove("shake"); void g.offsetWidth; g.classList.add("shake"); setTimeout(() => grownUp(guBack, guPass), 450); }
});
$("gu-cancel").onclick = () => { sfx("click"); show(guBack); };
$("set-parent").onclick = () => { sfx("click"); grownUp("s-settings", () => { $("p-code").value = exportSave(); $("p-msg").textContent = ""; paintParent(); show("s-parent"); }); };
$("set-reset").onclick = () => { sfx("click"); grownUp("s-settings", openReset); };
/* Reset: grown-up check, then hold for 3 seconds, then a last "are you sure". */
let holdT = 0, holdStart = 0, resetBack = "s-settings";
function openReset(back = "s-settings") { resetBack = back; $("rs-step1").hidden = false; $("rs-step2").hidden = true; $("rs-fill").style.width = "0"; show("s-reset"); }
const holdDone = () => { cancelAnimationFrame(holdT); holdT = 0; sfx("nope"); $("rs-step1").hidden = true; $("rs-step2").hidden = false; };
const holdTick = () => { const p = Math.min(1, (performance.now() - holdStart) / 3000); $("rs-fill").style.width = (p * 100) + "%"; if (p >= 1) holdDone(); else holdT = requestAnimationFrame(holdTick); };
$("rs-hold").addEventListener("pointerdown", e => { e.preventDefault(); try { $("rs-hold").setPointerCapture(e.pointerId); } catch (err) { /* fine without capture */ } holdStart = performance.now(); cancelAnimationFrame(holdT); holdT = requestAnimationFrame(holdTick); });
for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) $("rs-hold").addEventListener(ev, () => { if (holdT) { cancelAnimationFrame(holdT); holdT = 0; $("rs-fill").style.width = "0"; } });
$("rs-no").onclick = $("rs-no2").onclick = () => { sfx("click"); show(resetBack); };
$("rs-yes").onclick = () => { if (cloudLinked()) cloudSignOut(); resetSave(); location.reload(); };
$("p-reset").onclick = () => { sfx("click"); openReset("s-parent"); };
// tap the moon 5 times on the break screen to reach Parent Corner
let moonTaps = [];
$("rest-moon").onclick = () => { const n = Date.now(); moonTaps = moonTaps.filter(t => n - t < 3000); moonTaps.push(n); if (moonTaps.length >= 5) { moonTaps = []; $("p-code").value = exportSave(); paintParent(); show("s-parent"); } };
// a short buzz on taps (Parent Corner can turn it off)
document.addEventListener("pointerdown", e => { if (e.target.closest("button, .bld")) buzz(10); }, true);

/* ---------- versions & offline ---------- */
let updateReady = false;
function paintUpdate() { $("update").hidden = !(updateReady && screen && screen !== "s-parent" && screen !== "s-update"); }
function doUpdate() { save(); location.reload(); }
// A new version is waiting and Carter tried to race: stop, show a big notice, and update by itself in a few seconds.
let gateTimer = 0;
function updateGate() {
  clearInterval(gateTimer);
  menuDemo(); show("s-update"); sfx("chest");
  let left = 4;
  const tick = () => { $("upd-count").textContent = left; if (left-- <= 0) { clearInterval(gateTimer); doUpdate(); } };
  tick(); gateTimer = setInterval(tick, 1000);
}
$("upd-now").onclick = () => { clearInterval(gateTimer); doUpdate(); };
$("ver").textContent = VERSION === "dev" ? "dev build" : "v" + VERSION;
if (VERSION !== "dev") {
  const check = async () => {
    try {
      const r = await fetch("version.json?t=" + Date.now(), { cache: "no-store" }); if (!r.ok) return;
      const { version } = await r.json();
      if (version && version !== VERSION) { $("upd-v").textContent = "v" + version; updateReady = true; paintUpdate(); }
    } catch (e) { /* offline */ }
  };
  setInterval(check, 60000); setTimeout(check, 5000);
  $("update").onclick = doUpdate;
}
if (import.meta.env.PROD && "serviceWorker" in navigator && window.isSecureContext) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(e => console.warn("Turbo Dash: offline cache unavailable", e)));
}

if (import.meta.env.DEV) window.__td = { race, get S() { return S; }, startRace, TRACKS, showResult, show, openTracks, openTrophies, openRank, garage, goHub, startCup, CUPS, importSave, exportSave, fakeUpdate: () => { updateReady = true; paintUpdate(); } };

refreshCoins(false); refreshChips();
menuDemo();
show("s-title");
requestAnimationFrame(frame);
