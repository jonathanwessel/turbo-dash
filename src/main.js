import { CARS, TRACKS, THEMES, WORLDS, BOSSES, BUILDINGS, buildingOpen, trackOpen, worldOpen, MASTERY, starsFor, ACTIVITIES, SKILLS, SKILL_MAX, LICENSES, skillCost, ticketsFor, lessonsOf, licenseLevel, GOALS, PLAYER, CUPS, CUP_POINTS, RIVALS, DIFFS, diffOf, FRONTS, RANK_CAP, RANK_UNLOCKS, rankNeeds, rankTitle, prizeFor, RESEARCH, TRIAL_MEDALS, trialTimes, trialMedal, trialPay } from "./data.js";
import { Race, trackLen } from "./engine.js";
import { ToyRace } from "./toy/race.js";
import { statsFor } from "./stats.js";
import { townSVG, SITE_PIPS } from "./town.js";
import { createLab } from "./lab.js";
import { drawCar } from "./draw.js";
import { MISSIONS_RANK, todaysMissions, missionText, countRace, missionsReady } from "./missions.js";
import { initAudio, sfx, engine, engineOff, setAudioOpts, setSong, setWater, setEngineVoice, setRain } from "./audio.js";
import { S, load, save, exportSave, importSave, upsOf, resetSave, whenSaved, hasBefore, restoreBefore, loadGhost, saveGhost } from "./save.js";
import { cloudReady, cloudWhy, cloudLinked, cloudSignIn, cloudSignOut, syncNow, cloudSaved, cloudWake, onCloudStatus, cloudStatus } from "./cloud.js";
import { confetti, coinBurst } from "./fx.js";
import { createGarage, lookOf } from "./garage.js";

const VERSION = import.meta.env.DEV ? "dev" : __APP_VERSION__;
const who = () => S.name || "Racer";   // the player's own name (asked on the first run)
const $ = id => document.getElementById(id);
const canvas = $("game");
const STEP = 1 / 60;
let resultT = 0;

load();
setAudioOpts({ music: S.music, sfx: S.sfx, volume: S.parent.volume });

const POWER_ICON = { shield: "🛡️", coins: "💰", magnet: "🧲", turbo: "🚀" };
const buzz = ms => { if (S.parent.buzz && navigator.userActivation?.hasBeenActive !== false) try { navigator.vibrate?.(ms); } catch (e) { /* not allowed yet */ } };
const hooks = {
  sfx: n => { sfx(n); if (n === "bonk") buzz(60); else if (n === "bam" || n === "land") buzz(25); },
  // engine hum only during a real race (menus have the demo drive behind them, but only music)
  engine: (r, b) => { if (mode === "race") engine(r, b); },
  onPower: p => { $("btn-power").hidden = !p; if (p) $("power-icon").textContent = POWER_ICON[p]; },
  onFinish: r => { clearTimeout(resultT); resultT = setTimeout(() => { if (mode === "race") showResult(r); }, 1300); },
};
/* Two engines: the classic pseudo-3D road, and (from Toy Track World on) the Next Gen 3D engine. The toy engine's
   3D picture (three.js) loads the first time it's needed, so the game still starts fast. */
const classic = new Race(canvas, hooks);
let race = classic, toyRace = null, ToyView = null, toyLoading = null, toyFailed = false, toyWaiting = false;
const glCanvas = $("gl");
function loadToy() {
  return toyLoading ||= import("./toy/view.js").then(m => { ToyView = m.ToyView; }).catch(e => { toyFailed = true; console.warn("Turbo Dash: Toy Track World couldn't load", e); });
}
function engineFor(track) {
  const toy = track.world === "toy" && !!ToyView && !toyFailed;
  if (toy) {
    toyRace ||= new ToyRace(null, hooks);
    if (!toyRace.view) try { toyRace.view = new ToyView(glCanvas, canvas); } catch (e) { toyFailed = true; console.warn("Turbo Dash: no 3D on this device", e); return null; }
  }
  race = toy ? toyRace : classic;
  glCanvas.hidden = !toy; canvas.classList.toggle("over", toy);
  return race;
}

/* ---------- sizing: full screen in landscape, a wide band at the top in portrait ---------- */
function resize() {
  const vw = innerWidth, vh = innerHeight, portrait = vh > vw * 1.05;
  let cw = vw, ch = vh, top = 0;
  if (portrait && mode === "race") { ch = Math.round(Math.min(vh * 0.6, vw * 1.05)); top = Math.round(vh * 0.11); }
  const k = Math.min(window.devicePixelRatio || 1, 2, 720 / ch);
  canvas.width = Math.round(cw * k); canvas.height = Math.round(ch * k);
  Object.assign(canvas.style, { width: cw + "px", height: ch + "px", top: top + "px" });
  Object.assign(glCanvas.style, { width: cw + "px", height: ch + "px", top: top + "px" });
}
addEventListener("resize", () => resize());

/* ---------- game loop ---------- */
let mode = "menu", screen = "s-title", paused = false, last = performance.now(), acc = 0, goT = 0, lastReal = performance.now();
const NOT_PLAYING = ["s-rest", "s-title", "s-pause", "s-parent", "s-progress", "s-guide", "s-grownup", "s-reset", "s-update"];
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!paused && screen !== "s-hub") { acc += dt; while (acc >= STEP) { race.update(STEP); acc -= STEP; } } else acc = 0;
  if (screen !== "s-hub") race.render();
  if (mode === "race") updateHud(dt);
  if (screen === "s-garage") garage.draw(dt);
  if (screen === "s-wash") drawWash(dt);
  if (!document.hidden && !NOT_PLAYING.includes(screen)) { const real = Math.min(1000, now - lastReal); playMs += real; S.stats.playMs += real; }
  lastReal = now;
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
const SCREENS = ["s-wash", "s-museum", "s-progress", "s-guide", "s-name", "s-title", "s-hub", "s-tracks", "s-garage", "s-result", "s-pause", "s-gift", "s-trophies", "s-parent", "s-update", "s-rank", "s-rankup", "s-lab", "s-cupend", "s-missions", "s-rest", "s-settings", "s-grownup", "s-reset", "s-school", "s-log", "s-boss"];
function show(id) {
  screen = id;
  for (const s of SCREENS) $(s).hidden = s !== id;
  const bars = id && !["s-title", "s-pause", "s-parent", "s-progress", "s-guide", "s-name", "s-grownup", "s-reset"].includes(id);
  $("coinbar").hidden = !bars; $("topright").hidden = id !== "s-hub";
  if (id === "s-hub") refreshHub();
  paintUpdate();
}
function setRaceUi(on) {
  if (!on) { classic.input.axis = null; if (toyRace) toyRace.input.axis = null; setRain(false); classic.weather = null; classic.puddles = new Map(); } $("hud").hidden = !on; $("controls").hidden = !on; if (!on) { $("countdown").hidden = true; $("btn-power").hidden = true; setWater(false); } }

function goFullscreen() {
  if (matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches || document.fullscreenElement) return;
  const el = document.documentElement;
  if (!el.requestFullscreen) return;
  el.requestFullscreen({ navigationUI: "hide" }).then(() => window.screen.orientation?.lock?.("landscape")).catch(() => {});
}

// Touch devices: any tap goes back to full screen (kids swipe out of it by accident).
const isTouch = navigator.maxTouchPoints > 0;
for (const ev of ["click", "pointerup"]) document.addEventListener(ev, () => { if (isTouch) goFullscreen(); }, true);
/* 📱 Tilt to steer: the tablet's gravity sensor, sideways in the screen's own direction. It zeroes itself during the
   countdown (however he holds it), has a small dead zone, and reaches full lock at about 20°. Buttons still work.
   Tablets report the sensor differently, so Settings shows a live arrow and a Flip option. */
const tiltSupported = typeof DeviceMotionEvent !== "undefined" && "ontouchstart" in window && window.isSecureContext;
const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let tiltZero = null, tiltNow = 0;
function tiltSide(e) {
  const g = e.accelerationIncludingGravity; if (!g || !Number.isFinite(g.x) || !Number.isFinite(g.y)) return null;
  const a = ((window.screen.orientation?.angle ?? window.orientation ?? 0) + 360) % 360;
  let sx = a === 90 ? -g.y : a === 270 ? g.y : a === 180 ? -g.x : g.x;   // gravity along the screen's left-right
  if (isiOS) sx = -sx;                                                  // iOS reports the opposite sign
  return S.opts.flip ? sx : -sx;                                        // + = tilted right
}
addEventListener("devicemotion", e => {
  if (!S.opts.tilt) return;
  const v = tiltSide(e); if (v == null) return;
  tiltNow = v;
  if (mode !== "race") { if (screen === "s-settings") paintTiltLive(); return; }
  if (race.state === "countdown" || tiltZero == null) tiltZero = v;
  let d = v - tiltZero; d = Math.abs(d) < 0.6 ? 0 : d - Math.sign(d) * 0.6;
  race.input.axis = Math.max(-1, Math.min(1, d / 2.8));
});
function paintTiltLive() {
  const d = tiltNow - (tiltZero ?? 0);
  $("set-tilt-now").textContent = !S.opts.tilt ? "Off" : Math.abs(d) < 0.8 ? "On · tilt me!" : d > 0 ? "On · ➡️ right" : "⬅️ left · On";
}
$("set-tilt").onclick = async () => {
  sfx("click");
  if (!S.opts.tilt && typeof DeviceMotionEvent?.requestPermission === "function") {   // iPhone/iPad ask first
    try { if (await DeviceMotionEvent.requestPermission() !== "granted") { toast("📱 Tilt needs motion access"); return; } } catch (e) { return; }
  }
  S.opts.tilt = !S.opts.tilt; tiltZero = null; save(); paintToggles();
  if (S.opts.tilt) toast("📱 Tilt the tablet like a steering wheel! (Buttons still work.)");
};
$("set-flip").onclick = () => { sfx("click"); S.opts.flip = !S.opts.flip; tiltZero = null; save(); paintToggles(); toast("↔️ Tilt direction flipped"); };
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
function earn(n, x, y) { if (!Number.isFinite(n)) return; S.coins += n; save(); refreshCoins(); if (x != null) coinBurst(x, y); }
function spend(n) {
  if (!Number.isFinite(n) || n < 0 || S.coins < n) { sfx("nope"); const b = $("coinbar"); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); return false; }
  S.coins -= n; save(); refreshCoins(); return true;
}

/* ---------- race setup ---------- */
function carStats() {
  const car = CARS.find(c => c.id === S.car) || CARS[0];
  return { car: lookOf(car), stats: statsFor(car, upsOf(car.id), S.research, S.school.skills) };
}

function menuDemo() {
  mode = "menu"; paused = false; setRaceUi(false); engineOff(); setSong("menu"); resize();
  let track = TRACKS.find(t => t.id === S.lastTrack) || TRACKS[0];
  if (track.world === "toy" && !ToyView) { if (!toyFailed) loadToy().then(() => { if (mode === "menu" && ToyView) menuDemo(); }); track = TRACKS[0]; }
  const { car, stats } = carStats();
  (engineFor(track) || engineFor(track = TRACKS[0])).setup(track, "demo", car, stats);
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
  if (track.world === "toy" && !ToyView) {
    if (toyFailed) { sfx("nope"); toast("🧸 This tablet can't show Toy Track World yet. Try updating its browser!"); return; }
    if (toyWaiting) return;   // a second tap while it loads
    toyWaiting = true; toast("🧸 Shrinking down to toy size…");
    loadToy().then(() => { toyWaiting = false; if (screen === "s-tracks" || screen === "s-boss" || screen === "s-result") startRace(track); }); return;
  }
  if (!engineFor(track)) { sfx("nope"); toast("🧸 This tablet can't show Toy Track World yet. Try updating its browser!"); engineFor(TRACKS[0]); return; }
  clearTimeout(resultT); tiltZero = null;
  if (track.world !== "earth" && !S.seen["w:" + track.world]) { const w = WORLDS.find(x => x.id === track.world); S.seen["w:" + track.world] = true; if (w) museumAdd(w.icon, `First race in ${w.name}`); }
  currentTrack = track; S.lastTrack = track.id; save();
  const { car, stats } = carStats();
  mode = "race"; paused = false; resize();
  if (!allowedDiffs().includes(S.diff)) S.diff = allowedDiffs()[0];
  const autoLv = S.research.autoSteer || 0, autoOk = autoLv > 0 && S.parent.autoSteer;
  const boss = bossRun && { ...bossRun, def: CARS.find(c => c.id === bossRun.car) };
  const trial = trialRun && !boss;
  // 🌧️ about one Earth race in four has weather (never in the very first races, never in Time Trials or boss races)
  const RAINY = ["sunny", "beach", "farm", "river", "autumn", "candy", "pirate"];
  const weather = track.world === "earth" && S.parent.weather && S.rank >= 2 && !trial && !boss && Math.random() < 0.25
    ? (track.theme === "snow" ? "snow" : RAINY.includes(track.theme) ? "rain" : null) : null;
  race.setup(track, "race", car, stats, { weather, diff: S.diff, helper: S.parent.helper, autoSteer: autoOk && S.autoOn && !boss && !trial ? autoLv : 0, boss, trial, ghost: trial ? loadGhost(track.id) : null });
  $("btn-auto").hidden = !autoOk; $("auto-lv").textContent = autoLv; $("btn-auto").classList.toggle("on", autoOk && S.autoOn);
  show(null); setRaceUi(true); setRain(weather === "rain"); setSong("race", track.theme); setEngineVoice(car.type); setWater(!!race.phys.water); $("hud").classList.toggle("trial", trial);
  if (trial || boss) $("btn-auto").hidden = true;
  buildProgress(race.rivals.length + 1); lastCount = null; hudCache = {};
}

/* ---------- HUD ---------- */
const suffix = n => n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
let dots = [], lastCount = null, hudCache = {};
function buildProgress(n = 6) {
  const box = $("h-track"); box.innerHTML = ""; dots = [];
  for (let i = 0; i < n; i++) { const d = document.createElement("i"); box.appendChild(d); dots.push(d); }
}
function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
function updateHud(dt) {
  const h = race.hud();
  if (h.trial) { setText("h-pos", h.time.toFixed(1)); setText("h-suffix", "s"); } else { setText("h-pos", h.pos); setText("h-suffix", suffix(h.pos)); } setText("h-lap", h.lap); setText("h-laps", h.laps); setText("h-coins", h.coins);
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
    return `<button data-diff="${d.id}" class="${S.diff === d.id ? "on" : ""} ${locked ? "locked" : ""}">${locked ? "🔒" : d.icon} ${d.name}<small>${locked ? "Rank " + d.rank : "🪙".repeat(d.id === "easy" ? 1 : d.id === "normal" ? 2 : 3)}</small></button>`;
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
  $("cup-list").innerHTML = CUPS.filter(c => (c.world || "earth") === S.world).map(c => {
    const open = cupOpen(c), best = S.cups[c.id + ":" + S.diff], car = CARS.find(x => x.id === c.car), need = Math.max(5, c.rank || 0);
    return `<button class="cup-card ${open ? "" : "locked"}" data-cup="${c.id}" style="border-color:${c.color}">
      <div class="cc-cup" style="filter:drop-shadow(0 0 10px ${c.color})">🏆</div><div class="cc-name" style="color:${c.color}">${c.name}</div>
      <div class="cc-tracks">${c.tracks.map(id => TRACKS.find(t => t.id === id).icon).join("")}</div>
      <div class="cc-best">${best ? (MEDAL[best] || "🏁") : ""}</div>
      <div class="cc-car">${S.owned.includes(car.id) ? "✔ " : "Win: 🚗 "}${car.name}</div>
      ${open ? "" : `<div class="tc-lock">🔒<small>${S.rank < need ? "Rank " + need : "Open all 3 tracks"}</small></div>`}</button>`;
  }).join("");
}
/* Keep the race screen simple for a 6-year-old: a mode tab only shows once it's open. */
const TAB_RANK = { races: 0, trial: 4, cups: 5, boss: 9 };
function paintRaceTabs() {
  if (S.rank < (TAB_RANK[raceTab] || 0)) raceTab = "races";
  let shown = 0;
  document.querySelectorAll("[data-rtab]").forEach(b => { const ok = S.rank >= (TAB_RANK[b.dataset.rtab] || 0); b.hidden = !ok; shown += ok; b.classList.toggle("on", b.dataset.rtab === raceTab); });
  document.querySelector(".race-tabs").hidden = shown < 2;
  $("track-list").hidden = raceTab !== "races"; $("cup-list").hidden = raceTab !== "cups"; $("boss-list").hidden = raceTab !== "boss"; $("trial-list").hidden = raceTab !== "trial";
  $("diff-bar").style.visibility = raceTab === "trial" || raceTab === "boss" ? "hidden" : "";
  if (raceTab === "trial") paintTrials();
  if (raceTab === "cups") paintCups();
  if (raceTab === "boss") paintBosses();
}
/* ---------- ⏱️ Time Trials: alone against the clock and your own ghost ---------- */
let trialRun = false, lastTrial = false;
const trialLen = t => trackLen(t);
function paintTrials() {
  $("trial-list").innerHTML = TRACKS.map((t, i) => {
    if ((t.world || "earth") !== S.world) return "";
    const th = THEMES[t.theme], open = unlocked(i), best = S.trials[t.id], medal = S.trialMedals[t.id] || 0, times = trialTimes(t, trialLen(t));
    return `<button class="track-card trial-card ${open ? "" : "locked"}" data-trial="${i}" style="background:linear-gradient(${th.sky[0]},${th.sky[1]} 55%,${th.grass[0]} 56%)">
      <div class="tc-icon">${t.icon}</div><div class="tc-name">${t.name}</div>
      <div class="tc-best">${TRIAL_MEDALS[medal]}</div>
      <div class="tc-time">${best ? "⏱ " + best.toFixed(1) + "s" : "⏱ no time yet"}</div>
      <div class="tc-prize">${medal < 3 ? `${TRIAL_MEDALS[medal + 1]} ${times[medal].toFixed(1)}s · 🪙${trialPay(t, medal + 1)}` : "🥇 All medals!"}</div>
      ${open ? "" : `<div class="tc-lock">🔒<small>Open this track first</small></div>`}</button>`;
  }).join("");
}
$("trial-list").addEventListener("click", e => {
  const c = e.target.closest("[data-trial]"); if (!c) return;
  const i = +c.dataset.trial;
  if (!unlocked(i)) { sfx("nope"); c.animate([{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], { duration: 300 }); return; }
  sfx("click"); cupRun = null; bossRun = null; trialRun = true; startRace(TRACKS[i]);
});
function showTrialResult(r) {
  const t = currentTrack, len = trialLen(t), time = Math.round(r.time * 100) / 100, before = S.trials[t.id], oldMedal = S.trialMedals[t.id] || 0;
  const medal = trialMedal(t, len, time), record = !before || time < before, goalsBefore = claimable().length;
  let pay = 0; for (let m = oldMedal + 1; m <= medal; m++) pay += trialPay(t, m);
  if (record) { S.trials[t.id] = time; if (r.rec) saveGhost(t.id, { t: time, ...r.rec }); }
  if (medal > oldMedal) S.trialMedals[t.id] = medal;
  S.coins += pay + r.coins;
  S.stats.roadCoins += r.coins; S.stats.stunts += r.stats.stunts; S.stats.turbos += r.stats.turbos; S.stats.powers = (S.stats.powers || 0) + r.stats.powers;
  S.stats.rings = (S.stats.rings || 0) + (r.stats.rings || 0); S.stats.pearls = (S.stats.pearls || 0) + (r.stats.pearls || 0); S.stats.drifts = (S.stats.drifts || 0) + (r.stats.drifts || 0); S.stats.loops = (S.stats.loops || 0) + (r.stats.loops || 0);
  save();
  mode = "result"; setRaceUi(false); engineOff();
  const [b, s, g] = trialTimes(t, len);
  $("r-trophy").textContent = TRIAL_MEDALS[medal] || "⏱️";
  $("r-title").textContent = record ? `NEW RECORD! ${time.toFixed(1)}s` : `${time.toFixed(1)} seconds`;
  $("r-sub").textContent = !before ? `Your first time on ${t.name}! Next time, race your ghost.` : record ? `You beat your ghost by ${(before - time).toFixed(1)}s, ${who()}!` : `Your record is ${before.toFixed(1)}s. Catch your ghost!`;
  countUp($("r-prize"), pay); countUp($("r-road"), r.coins);
  $("r-goal").hidden = claimable().length <= goalsBefore;
  $("r-unlock").hidden = medal <= oldMedal;
  if (medal > oldMedal) $("r-unlock").textContent = `${TRIAL_MEDALS[medal]} New medal on ${t.name}!`;
  $("r-cup").hidden = false;
  $("r-cup").innerHTML = `<div class="rc-head">⏱️ Time Trial — ${t.icon} ${t.name}</div>
    <div class="standings">${[[b, 1], [s, 2], [g, 3]].map(([x, m]) => `<span class="${medal >= m ? "me" : ""}">${TRIAL_MEDALS[m]} ${x.toFixed(1)}s</span>`).join("")}</div>`;
  $("r-chests").hidden = true; $("r-btns").hidden = false; $("btn-next").hidden = true; $("btn-again").hidden = false;
  lastTrial = true; lastBoss = null; trialRun = false;
  show("s-result"); refreshCoins();
  sfx(medal > oldMedal || record ? "win" : "lose");
  if (medal > oldMedal) confetti(140); else if (record) confetti(60);
}

/* ---------- 👑 bosses ---------- */
let bossRun = null, lastBoss = null;
const bossOpen = b => S.rank >= b.rank && trackOpen(S, TRACKS.find(t => t.id === b.track));
function paintBosses() {
  $("boss-list").innerHTML = BOSSES.filter(b => b.world === S.world).map(b => {
    const open = bossOpen(b), beat = S.bosses[b.id], car = CARS.find(c => c.id === b.car), t = TRACKS.find(x => x.id === b.track);
    return `<button class="cup-card boss ${open ? "" : "locked"}" data-boss="${b.id}" style="border-color:#ffd400">
      <div class="cc-cup">${b.icon}</div><div class="cc-name" style="color:#ffd400">${b.name}</div>
      <div class="cc-tracks">${t.icon}</div><div class="cc-best">${beat ? "👑" : ""}</div>
      <div class="cc-car">${S.owned.includes(car.id) ? "✔ " : "Win: 🚗 "}${car.name}</div>
      ${open ? "" : `<div class="tc-lock">🔒<small>${S.rank < b.rank ? "Rank " + b.rank : "Open " + t.name}</small></div>`}</button>`;
  }).join("") || `<div class="boss-says">No boss here yet!</div>`;
}
$("boss-list").addEventListener("click", e => {
  const c = e.target.closest("[data-boss]"); if (!c) return;
  const b = BOSSES.find(x => x.id === c.dataset.boss);
  if (!bossOpen(b)) { sfx("nope"); c.animate([{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], { duration: 300 }); return; }
  sfx("click"); openBossIntro(b);
});
function openBossIntro(b) {
  const car = CARS.find(c => c.id === b.car), t = TRACKS.find(x => x.id === b.track);
  $("bi-face").textContent = b.icon; $("bi-name").textContent = b.name; $("bi-says").textContent = `"${b.says}"`;
  $("bi-info").textContent = `${t.icon} ${t.name} · one on one · win the ${car.name}!`;
  const cv = $("bi-car"), cx = cv.getContext("2d"); cx.clearRect(0, 0, cv.width, cv.height); drawCar(cx, cv.width / 2, cv.height - 8, 200, car, { t: 0 });
  $("bi-go").onclick = () => { sfx("click"); cupRun = null; trialRun = false; bossRun = b; startRace(t); };
  $("bi-back").onclick = () => { sfx("click"); openTracks(); };
  sfx("chest"); show("s-boss");
}
document.querySelectorAll("[data-rtab]").forEach(b => b.onclick = () => {
  if (b.dataset.rtab === "cups" && S.rank < 5) { sfx("nope"); toast("🔒 Cups open at Rank 5"); return; }
  if (b.dataset.rtab === "boss" && S.rank < Math.min(...BOSSES.map(x => x.rank))) { sfx("nope"); toast(`🔒 Bosses appear at Rank ${Math.min(...BOSSES.map(x => x.rank))}`); return; }
  sfx("click"); raceTab = b.dataset.rtab; paintRaceTabs();
});
$("cup-list").addEventListener("click", e => {
  const c = e.target.closest("[data-cup]"); if (!c) return;
  const cup = CUPS.find(x => x.id === c.dataset.cup);
  if (!cupOpen(cup)) { sfx("nope"); c.animate([{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], { duration: 300 }); return; }
  sfx("click"); startCup(cup);
});
function paintWorlds() {
  if (!worldOpen(S, S.world)) S.world = "earth";
  const open = WORLDS.filter(w => !w.soon && worldOpen(S, w.id)), next = WORLDS.find(w => !w.soon && !worldOpen(S, w.id));
  const list = [...open, ...(next && S.rank >= (next.rank || 0) - 5 ? [next] : [])];
  $("world-bar").hidden = list.length < 2;
  $("world-bar").innerHTML = list.map(w => { const ok = open.includes(w);
    return `<button data-world="${w.id}" class="${S.world === w.id ? "on" : ""} ${ok ? "" : "soon"}">${w.icon} ${w.name}${ok ? "" : ` 🔒 ${S.rank < w.rank ? "Rank " + w.rank : "🔬"}`}</button>`; }).join("");
}
$("world-bar").addEventListener("click", e => {
  const b = e.target.closest("[data-world]"); if (!b) return;
  const w = WORLDS.find(x => x.id === b.dataset.world);
  if (w.soon) { sfx("nope"); toast(`${w.icon} ${w.name} is coming soon!`); return; }
  if (!worldOpen(S, w.id)) { sfx("nope"); toast(S.rank < w.rank ? `${w.icon} ${w.name} opens at Rank ${w.rank}` : `🔬 Research ${RESEARCH.find(r => r.id === w.kit)?.name || "the World Kit"} in the Turbo Lab first!`); return; }
  sfx("click"); S.world = w.id; save(); openTracks();
  if (w.nextGen) { loadToy(); if (!S.seen.toy) { S.seen.toy = true; save(); levelUpCard(); } }
});
/* 🧸 the first visit to Toy Track World: the game levels up! */
function levelUpCard() {
  const el = $("levelup"); el.hidden = false; el.classList.remove("show"); void el.offsetWidth; el.classList.add("show");
  sfx("win"); confetti(160);
  $("lu-go").onclick = () => { sfx("click"); el.hidden = true; };
}
function openTracks() {
  if (!allowedDiffs().includes(S.diff)) S.diff = allowedDiffs()[0];
  paintWorlds(); paintDiffBar(); paintRaceTabs();
  const list = $("track-list");
  list.innerHTML = TRACKS.map((t, i) => {
    if ((t.world || "earth") !== S.world) return "";
    const th = THEMES[t.theme], open = unlocked(i), best = S.bestD[t.id + ":" + S.diff];
    return `<button class="track-card ${open ? "" : "locked"}" data-i="${i}" style="background:linear-gradient(${th.sky[0]},${th.sky[1]} 55%,${th.grass[0]} 56%)">
      <div class="tc-icon">${t.icon}</div><div class="tc-name">${t.name}</div>
      <div class="tc-best">${best ? (MEDAL[best] || "🏁") : ""}</div>
      <div class="tc-stars">${MASTERY.map((n, k) => k < starsFor(S.mastery[t.id + ":" + S.diff] || 0) ? "★" : "☆").join("")}</div>
      <div class="tc-prize">🪙 ${prizeFor(t, 1, S.diff)}</div>
      ${open ? "" : `<div class="tc-lock">🔒<small>${t.after ? `Win ${TRACKS.find(x => x.id === t.after).icon} first!` : "Reach this world first"}</small></div>`}</button>`;
  }).join("");
  show("s-tracks");
  const cur = list.querySelector(`[data-i="${Math.max(0, TRACKS.findIndex(t => t.id === S.lastTrack))}"]`);
  cur?.scrollIntoView({ inline: "center", block: "center" });
}
$("track-list").addEventListener("click", e => {
  const c = e.target.closest(".track-card"); if (!c) return;
  const i = +c.dataset.i;
  if (!unlocked(i)) { sfx("nope"); c.animate([{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], { duration: 300 }); return; }
  sfx("click"); cupRun = null; bossRun = null; trialRun = false; startRace(TRACKS[i]);
});

/* ---------- cups ---------- */
let cupRun = null;   // { cup, i: race index 0-2, pts: [player, rival1..5] }
function startCup(cup) { bossRun = null; trialRun = false; cupRun = { cup, i: 0, pts: [0, 0, 0, 0, 0, 0], diff: S.diff }; startRace(TRACKS.find(t => t.id === cup.tracks[0])); }
const racerName = k => k === 0 ? who() : RIVALS[k - 1].name, racerColor = k => k === 0 ? (CARS.find(c => c.id === S.car) || CARS[0]).body : RIVALS[k - 1].body;
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
  const wonBefore = ["easy", "normal", "hard"].some(df => S.cups[c.cup.id + ":" + df] === 1);
  S.cups[key] = Math.min(S.cups[key] || 99, place); S.coins += coins;
  if (place === 1 && !wonBefore) museumAdd("🏆", `Won the ${c.cup.name}`);
  const prizes = [`🪙 ${coins}`];
  if (place === 1) {
    const car = CARS.find(x => x.id === c.cup.car);
    if (!S.owned.includes(car.id)) { S.owned.push(car.id); upsOf(car.id); prizes.push(`🚗 ${car.name}!`); museumAdd("🚗", `Won the ${car.name}`); }
    if (awardChip("cup:" + key)) prizes.push("🧠 Brain Chip");
  }
  save(); cupRun = null;
  $("ce-title").textContent = c.cup.name + "!";
  $("ce-place").textContent = place <= 3 ? `${place}${suffix(place)} place, ${who()}!` : `${place}${suffix(place)} — try again!`;
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

/* ---------- 🧼 Car Wash: scrub the mud off; a clean car's next race pays a little more (once a day) ---------- */
let washRub = 0, washBubbles = [], washLast = null, washT = 0;
function openWash() { washRub = 0; washBubbles = []; paintWashSay(); show("s-wash"); }
function paintWashSay() {
  const d = S.dirt[S.car] || 0;
  $("wash-say").textContent = d ? `Scrub the mud off! (${d} splat${d > 1 ? "s" : ""} left) 🫧` : S.sparkle ? "✨ Sparkly! Your next race pays a bonus!" : "✨ Already clean! Race to get it muddy.";
}
function scrub(e) {
  const r = $("wash-car").getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  if (washLast) washRub += Math.hypot(x - washLast.x, y - washLast.y);
  washLast = { x, y };
  for (let k = 0; k < 2; k++) washBubbles.push({ x: x + (Math.random() - 0.5) * 0.06, y: y + (Math.random() - 0.5) * 0.06, r: 0.012 + Math.random() * 0.025, life: 1 });
  const d = S.dirt[S.car] || 0;
  if (d && washRub > 0.6) {
    washRub = 0; S.dirt[S.car] = d - 1; sfx("coin"); buzz(15);
    if (d - 1 === 0) {
      delete S.dirt[S.car];
      if (S.daily.wash !== today()) { S.daily.wash = today(); S.sparkle = today(); }
      sfx("win"); confetti(90);
    }
    save(); paintWashSay();
  }
}
$("wash-car").addEventListener("pointerdown", e => { e.preventDefault(); $("wash-car").setPointerCapture?.(e.pointerId); washLast = null; scrub(e); });
$("wash-car").addEventListener("pointermove", e => { if (e.buttons || e.pointerType === "touch") scrub(e); });
$("wash-car").addEventListener("pointerup", () => { washLast = null; });
function drawWash(dt) {
  const cv = $("wash-car"), ctx = cv.getContext("2d"), W = cv.width, H = cv.height; washT += dt;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgba(127,216,255,0.25)"; ctx.fillRect(0, H * 0.86, W, H * 0.14);
  const car = CARS.find(c => c.id === S.car) || CARS[0];
  drawCar(ctx, W / 2, H * 0.9, W * 0.62, lookOf(car), { t: washT });
  if (!(S.dirt[S.car] || 0)) for (let k = 0; k < 4; k++) { const a = washT * 2 + k * 1.6; ctx.fillStyle = "#fff"; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(a * 2); ctx.font = `${Math.round(H * 0.08)}px system-ui`; ctx.fillText("✨", W * (0.25 + 0.5 * ((k * 0.37) % 1)), H * (0.25 + 0.15 * (k % 2))); }
  ctx.globalAlpha = 1;
  for (const b of washBubbles) { b.life -= dt * 0.8; b.y -= dt * 0.08; ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, b.life)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x * W, b.y * H, b.r * W, 0, 7); ctx.stroke(); }
  washBubbles = washBubbles.filter(b => b.life > 0).slice(-120);
}
/* ---------- 🏛️ Museum: a timeline of his firsts ---------- */
function openMuseum() {
  const M = S.museum || [];
  $("mu-sum").textContent = M.length ? `${M.length} moments · ${M.filter(e => e.icon === "🏆").length} cups · ${M.filter(e => e.text.startsWith("First win")).length} first wins · ${M.filter(e => e.text.startsWith("Beat")).length} bosses` : "";
  const nice = d => d ? new Date(d + "T12:00:00").toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Before 1.0";
  const esc = v => String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  $("mu-list").innerHTML = M.length ? M.map(e => `<div class="mu-item"><span class="mu-ico">${esc(e.icon)}</span><b>${esc(e.text)}</b><small>${nice(e.d)}</small></div>`).join("")
    : `<div class="mu-empty">🏛️ The museum is waiting for your first trophy, ${who()}! Win races to fill it.</div>`;
  show("s-museum");
}

/* ---------- 🏛️ Museum log and races per day ---------- */
function museumAdd(icon, text) { S.museum.unshift({ d: dayKey(new Date()), icon, text }); S.museum.length = Math.min(S.museum.length, 200); }
function countDay() {
  const k = dayKey(new Date()); S.days[k] = (S.days[k] || 0) + 1;
  for (const old of Object.keys(S.days).sort().reverse().slice(30)) delete S.days[old];
}

/* ---------- results + treasure chests ---------- */
let chestValues = [], chestDone = false, nextTrack = null;
function showResult(r) {
  if (trialRun) { showTrialResult(r); return; }
  lastTrial = false;
  const goalsBefore = claimable().length;
  const ti = TRACKS.indexOf(currentTrack), openBefore = TRACKS.filter(t => trackOpen(S, t));
  const prize = Math.round(prizeFor(currentTrack, r.place, S.diff) * (1 + 0.05 * (S.research.coinBoost || 0)));
  S.races++; if (r.place === 1) S.wins++;
  const dk = currentTrack.id + ":" + S.diff, bossRace = !!bossRun;
  countDay();
  if (r.place === 1 && !bossRace && S.best[currentTrack.id] !== 1) museumAdd(currentTrack.icon, `First win on ${currentTrack.name}`);
  if (!bossRace) {
    S.best[currentTrack.id] = Math.min(S.best[currentTrack.id] || 99, r.place);
    S.bestD[dk] = Math.min(S.bestD[dk] || 99, r.place);
  }
  if (r.place === 1 && !bossRace) {
    const before = starsFor(S.mastery[dk] || 0);
    S.mastery[dk] = (S.mastery[dk] || 0) + 1;
    if (starsFor(S.mastery[dk]) > before) setTimeout(() => toast(`⭐ Mastery star ${starsFor(S.mastery[dk])} on ${currentTrack.name}!`), 1800);
  }
  S.coins += prize + r.coins;
  let sparkleMsg = "";
  if (S.sparkle && !bossRace) { const bonus = Math.max(5, Math.round(prize * 0.1)); S.coins += bonus; S.sparkle = ""; sparkleMsg = `✨ Sparkly car bonus +🪙${bonus}`; }
  S.dirt[S.car] = Math.min(5, (S.dirt[S.car] || 0) + 1);
  if (S.diff === "hard" && r.place === 1) awardChip("hard:" + currentTrack.id);
  if (cupRun) r.standings.forEach((k, n) => { cupRun.pts[k] += CUP_POINTS[n]; });
  if (!bossRace) countRace(r, currentTrack.id, dayKey(new Date()), unlocked);
  S.history.unshift({ d: dayKey(new Date()), t: currentTrack.id, df: S.diff, p: r.place, c: prize + r.coins }); S.history.length = Math.min(S.history.length, 30);
  S.stats.roadCoins += r.coins; S.stats.stunts += r.stats.stunts; S.stats.turbos += r.stats.turbos; S.stats.bams += r.stats.bams; S.stats.powers = (S.stats.powers || 0) + r.stats.powers; S.stats.rings = (S.stats.rings || 0) + (r.stats.rings || 0);
  S.stats.pearls = (S.stats.pearls || 0) + (r.stats.pearls || 0); S.stats.drifts = (S.stats.drifts || 0) + (r.stats.drifts || 0); S.stats.loops = (S.stats.loops || 0) + (r.stats.loops || 0);
  save();
  mode = "result"; setRaceUi(false); engineOff();
  $("r-trophy").textContent = MEDAL[r.place] || "🏁";
  $("r-title").textContent = r.place <= 3 ? `${r.place}${suffix(r.place)} PLACE!` : `${r.place}${suffix(r.place)} — Good try!`;
  countUp($("r-prize"), prize); countUp($("r-road"), r.coins);
  const cheers = r.place === 1 ? ["Way to go, " + who() + "!", "You're the champ, " + who() + "!", "Super fast, " + who() + "!"]
    : r.place <= 3 ? ["Great driving, " + who() + "!", "So close, " + who() + "!"] : ["Upgrade your car and try again, " + who() + "!", "Keep going, " + who() + "!"];
  $("r-sub").textContent = cheers[Math.floor(Math.random() * cheers.length)];
  $("r-goal").hidden = claimable().length <= goalsBefore;
  const fresh = TRACKS.filter(t => trackOpen(S, t) && !openBefore.includes(t));
  const next = fresh[0] || TRACKS.slice(ti + 1).find(t => trackOpen(S, t)), nowOpen = !!next;
  nextTrack = next;
  $("r-unlock").hidden = !fresh.length;
  if (sparkleMsg) setTimeout(() => { const u = $("r-unlock"); u.textContent = u.hidden ? sparkleMsg : u.textContent + " · " + sparkleMsg; u.hidden = false; }, 0);
  if (fresh.length) $("r-unlock").textContent = `🔓 New track${fresh.length > 1 ? "s" : ""}: ${fresh.map(t => t.icon + " " + t.name).join(", ")}!`;
  const base = Math.round((30 + 25 * currentTrack.diff) * diffOf(S.diff).pay * (1 + 0.15 * (S.research.luckyChests || 0)));
  chestValues = [base, base * 2, base * 4].sort(() => Math.random() - 0.5);
  chestDone = false;
  document.querySelectorAll(".chest").forEach(c => { c.className = "chest"; c.textContent = "🎁"; });
  $("r-chests").hidden = false; $("r-btns").hidden = true; $("r-pick").textContent = "Pick a treasure chest!";
  $("r-cup").hidden = true;
  if (bossRun) {
    const b = bossRun, car = CARS.find(c => c.id === b.car);
    if (r.place === 1) {
      const first = !S.bosses[b.id];
      const bonus = first ? 5000 : 1000;
      S.bosses[b.id] = true; S.coins += bonus; save();
      if (first) museumAdd(b.icon, `Beat ${b.name}`);
      if (!S.owned.includes(car.id)) { S.owned.push(car.id); upsOf(car.id); museumAdd("🚗", `Won the ${car.name}`); save(); }
      awardChip("boss:" + b.id);
      const msg = first ? `👑 You beat ${b.name}! 🚗 ${car.name} is yours! +🪙${bonus}` : `👑 You beat ${b.name} again! +🪙${bonus}`;
      $("r-unlock").textContent = $("r-unlock").hidden ? msg : msg + " " + $("r-unlock").textContent; $("r-unlock").hidden = false;
      $("r-title").textContent = "BOSS BEATEN!";
    } else { $("r-title").textContent = `${b.name} wins this time!`; $("r-sub").textContent = "Upgrade your car and try again, " + who() + "!"; }
    lastBoss = b; bossRun = null;
  } else lastBoss = null;
  if (cupRun) { paintCupResult(); $("btn-next").hidden = false; $("btn-again").hidden = true; $("btn-next").textContent = cupRun.i < 2 ? "Next race ▶" : "🏆 Cup results!"; }
  else { $("btn-next").hidden = !nowOpen; $("btn-again").hidden = false; $("btn-next").textContent = "Next ▶"; }
  show("s-result"); refreshCoins();
  sfx(r.place <= 3 ? "win" : "lose");
  if (r.place <= 3) confetti(r.place === 1 ? 160 : 80);
}
document.querySelectorAll(".chest").forEach(c => c.addEventListener("click", () => {
  if (chestDone) return; chestDone = true;
  const i = +c.dataset.i;
  document.querySelectorAll(".chest").forEach((o, j) => { o.className = "chest " + (j === i ? "open" : "other"); o.innerHTML = `<i>🪙</i><b>${chestValues[j]}</b>`; });
  sfx("chest");
  const rect = c.getBoundingClientRect();
  earn(chestValues[i], rect.left + rect.width / 2, rect.top + rect.height / 2);
  $("r-pick").textContent = `🎁 Treasure: 🪙${chestValues[i]}!`;
  setTimeout(() => { $("r-btns").hidden = false; }, 600);
}));
$("btn-again").onclick = () => { sfx("click"); if (lastBoss) bossRun = lastBoss; trialRun = lastTrial; startRace(currentTrack); };
$("btn-next").onclick = () => {
  sfx("click");
  if (cupRun) { if (cupRun.i < 2) { cupRun.i++; startRace(TRACKS.find(t => t.id === cupRun.cup.tracks[cupRun.i])); } else showCupEnd(); return; }
  if (nextTrack) startRace(nextTrack);
};
$("btn-home").onclick = () => { sfx("click"); if (cupRun && cupRun.i >= 2) { showCupEnd(); return; } cupRun = null; bossRun = null; trialRun = false; menuDemo(); show("s-hub"); };

/* ---------- daily gift ---------- */
const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const giftReady = () => S.lastGift !== dayKey(new Date());
function giftInfo() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  const streak = S.lastGift === dayKey(y) ? S.giftStreak + 1 : 1;
  return { streak, amount: 100 + 50 * Math.min(streak, 7) };
}
function openGift() {
  const ready = giftReady();
  $("s-gift").classList.toggle("later", !ready);
  if (ready) {
    const g = giftInfo();
    $("gift-icon").textContent = "🎁"; $("gift-head").textContent = "Free Gift!";
    $("gift-day").textContent = `Day ${g.streak}` + (g.streak > 1 ? " in a row! 🔥" : "");
    $("gift-amt").textContent = g.amount; $("gift-take").textContent = "Collect!";
    show("s-gift"); sfx("chest"); return;
  }
  // today's gift is already opened: show tomorrow's so he knows to come back
  const next = 100 + 50 * Math.min((S.giftStreak || 0) + 1, 7);
  $("gift-icon").textContent = "💤"; $("gift-head").textContent = "Come back tomorrow!";
  $("gift-day").textContent = `Tomorrow: Day ${(S.giftStreak || 0) + 1} 🔥`;
  $("gift-amt").textContent = next; $("gift-take").textContent = "OK!";
  show("s-gift"); sfx("click");
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
const frontsNow = () => { const need = rankNeeds(S.rank, S); return FRONTS.filter(f => f.id !== "license" || need.license > 0).map(f => ({ ...f, have: f.have(S), need: need[f.id] })); };
const rankReady = () => S.rank < RANK_CAP && frontsNow().every(f => f.have >= f.need);
function openRank() {
  const fr = frontsNow(), ready = rankReady(), maxed = S.rank >= RANK_CAP;
  $("rk-num").textContent = S.rank; $("rk-title").textContent = rankTitle(S.rank);
  const un = RANK_UNLOCKS[S.rank + 1];
  $("rk-next").textContent = maxed ? "Top rank for now! More ranks are coming in new versions." : un ? `Next rank opens: ${un.icon} ${un.text}` : `Next: Rank ${S.rank + 1}`;
  const todo = fr.filter(f => f.need > 0 && f.have < f.need);   // gauges still to fill (a 0 / 0 gauge is already full)
  const lowest = todo.length ? todo.reduce((a, f) => (f.have / f.need < a.have / a.need ? f : a)) : null;
  $("fronts").innerHTML = fr.map(f => {
    const full = f.have >= f.need, pct = f.need ? Math.min(100, Math.round(100 * f.have / f.need)) : 100;
    return `<div class="front ${full ? "full" : f === lowest && !maxed ? "behind" : ""}"><div class="fi">${f.icon}</div><b>${f.name}</b>
      <div class="gauge"><i style="width:${pct}%"></i></div><small>${full ? "✔ " : ""}${Math.min(f.have, f.need)} / ${f.need}</small></div>`;
  }).join("");
  $("rk-up").hidden = !ready;
  $("rk-hint").textContent = ready || maxed || !lowest ? "" : `${lowest.icon} ${lowest.hint}`;
  show("s-rank");
}
$("rk-up").onclick = () => {
  if (!rankReady()) return;
  S.rank++;
  museumAdd("⭐", `Reached Rank ${S.rank} · ${rankTitle(S.rank)}`);
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

/* ---------- 🚦 Driver School ---------- */
const COACH = () => ["Hi " + who() + "! Ready for a lesson?", "Reading makes great drivers!", "Playing outside earns tickets!", "Buckle up, let's learn!", "Great job off the screen, " + who() + "!"];
function openSchool() {
  { const L = COACH(); $("coach-say").textContent = L[Math.floor(Math.random() * L.length)]; }
  paintSchool(); show("s-school");
}
function paintSchool() {
  const sc = S.school, L = licenseLevel(S), lic = LICENSES[L], next = LICENSES[L + 1], n = lessonsOf(S);
  $("sch-tickets").textContent = sc.tickets;
  $("license").style.background = `linear-gradient(135deg, ${lic.color}, #fff)`;
  $("license").innerHTML = `<div class="lc-pic">🚗</div><b>DRIVER LICENSE · ${who().toUpperCase()}</b><small>${lic.name}${next ? ` → ${next.name} at ${next.lessons} lessons` : " · the very best!"}</small>
    <div class="bar"><i style="width:${next ? Math.round(100 * (n - lic.lessons) / (next.lessons - lic.lessons)) : 100}%"></i></div>`;
  $("skills").innerHTML = SKILLS.map(k => {
    const lv = sc.skills[k.id], max = lv >= SKILL_MAX, cost = skillCost(lv);
    return `<div class="skill" data-sk="${k.id}"><div class="si">${k.icon}</div><b>${k.name}</b><small>${k.desc}</small>
      <div class="pips">${Array.from({ length: SKILL_MAX }, (_, i) => `<i class="${i < lv ? "on" : ""}"></i>`).join("")}</div>
      <button class="${max ? "max" : sc.tickets >= cost ? "" : "poor"}" data-learn="${k.id}">${max ? "MAX!" : "🎟️ " + cost}</button></div>`;
  }).join("");
}
$("skills").addEventListener("click", e => {
  const b = e.target.closest("[data-learn]"); if (!b) return;
  const id = b.dataset.learn, sc = S.school, lv = sc.skills[id];
  if (lv >= SKILL_MAX) { sfx("click"); return; }
  if (sc.tickets < skillCost(lv)) { sfx("nope"); toast("🎟️ Read or play outside to earn tickets!"); return; }
  const before = licenseLevel(S);
  sc.tickets -= skillCost(lv); sc.skills[id]++; save(); sfx("buy");
  paintSchool(); $("skills").querySelector(`[data-sk="${id}"]`)?.classList.add("flash");
  const after = licenseLevel(S);
  if (after > before) {
    confetti(160); sfx("win"); toast(`🪪 ${LICENSES[after].name} license!`);
    if (after >= 3 && !S.owned.includes("patrol")) { S.owned.push("patrol"); upsOf("patrol"); save(); setTimeout(() => toast("🚓 You earned the Piqua Patrol car!"), 2700); }
  }
});
// grown-ups log real-world time (behind the grown-up check)
let logAct = "read", logMin = 20;
$("sch-log").onclick = () => { sfx("click"); grownUp("s-school", openLog); };
function todayMinutes() { const d = dayKey(new Date()); return S.school.log.filter(e => e.d === d).reduce((a, e) => a + e.m, 0); }
function openLog() { paintLog(); show("s-log"); }
function paintLog() {
  const sc = S.school;
  $("acts").innerHTML = ACTIVITIES.map(a => `<button data-act="${a.id}" class="${logAct === a.id ? "on" : ""}"><span>${a.icon}</span>${a.name}</button>`).join("");
  $("mins").innerHTML = [10, 20, 30, 45, 60].map(m => `<button data-min="${m}" class="${logMin === m ? "on" : ""}">${m} min</button>`).join("");
  const t = todayMinutes();
  $("log-today").textContent = `Today: ${t} minutes logged${sc.capMin ? ` (most ${sc.capMin})` : ""} · 🎟️ ${sc.tickets} to spend`;
  $("log-dbl").innerHTML = [true, false].map(v => `<button data-dbl="${v}" class="${sc.readingDouble === v ? "on" : ""}">${v ? "Yes" : "No"}</button>`).join("");
  $("log-cap").innerHTML = [0, 30, 60, 120].map(m => `<button data-cap="${m}" class="${sc.capMin === m ? "on" : ""}">${m ? m + " min" : "No limit"}</button>`).join("");
  $("log-lic").innerHTML = [true, false].map(v => `<button data-lic="${v}" class="${S.parent.license === v ? "on" : ""}">${v ? "Yes" : "No"}</button>`).join("");
  const name = id => ACTIVITIES.find(a => a.id === id);
  $("log-hist").innerHTML = sc.log.slice(0, 12).map(e => `<span>${e.d.slice(5)}</span><span>${name(e.a)?.icon || ""} ${name(e.a)?.name || ""}</span><span>${e.m} min</span><span>🎟️ ${e.t}</span>`).join("");
}
$("s-log").addEventListener("click", e => {
  const a = e.target.closest("[data-act]"), m = e.target.closest("[data-min]"), d = e.target.closest("[data-dbl]"), c = e.target.closest("[data-cap]"), l = e.target.closest("[data-lic]");
  if (a) logAct = a.dataset.act; if (m) logMin = +m.dataset.min;
  if (d) { S.school.readingDouble = d.dataset.dbl === "true"; save(); }
  if (c) { S.school.capMin = +c.dataset.cap; save(); }
  if (l) { S.parent.license = l.dataset.lic === "true"; save(); }
  if (a || m || d || c || l) { sfx("click"); paintLog(); }
});
$("log-add").onclick = () => {
  const sc = S.school, room = sc.capMin ? Math.max(0, sc.capMin - todayMinutes()) : Infinity, mins = Math.min(logMin, room);
  if (mins < 10) { sfx("nope"); toast("That's the most for today. Great job!"); return; }
  const t = ticketsFor(logAct, mins, sc.readingDouble);
  sc.log.unshift({ d: dayKey(new Date()), a: logAct, m: mins, t }); sc.log.length = Math.min(sc.log.length, 60);
  sc.tickets += t; sc.earned += t; save();
  sfx("buy"); confetti(70); toast(`+${t} 🎟️ for ${who()}!`); paintLog();
};
$("log-back").onclick = () => { sfx("click"); paintSchool(); show("s-school"); };

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
  if (S.school.skills.smarts) for (const b of document.querySelectorAll("[data-mis]")) if (!b.textContent.startsWith("✔")) b.textContent = "🪙 " + Math.round(+b.textContent.replace(/\D/g, "") * (1 + 0.1 * S.school.skills.smarts));
  show("s-missions");
}
$("mis-list").addEventListener("click", e => {
  const b = e.target.closest("[data-mis]"); if (!b) return;
  const m = S.missions.list[+b.dataset.mis];
  if (m.claimed) { sfx("click"); return; }
  if (m.have < m.goal) { sfx("nope"); return; }
  m.claimed = true;
  const r = b.getBoundingClientRect();
  earn(Math.round(m.reward * (1 + 0.1 * S.school.skills.smarts)), r.left + r.width / 2, r.top); sfx("chest");
  setTimeout(() => { if (screen === "s-missions") openMissions(); }, 350);
});

/* ---------- hub, garage, settings ---------- */
const garage = createGarage({ $, sfx, spend, celebrate: () => confetti(100), onCar: car => museumAdd("🚗", `Got the ${car.name}`) });
let giftShownThisVisit = false;
$("town-wrap").innerHTML = townSVG();
const tb = (id, on) => { $(id).style.display = on ? "" : "none"; };
const today = () => dayKey(new Date());
function refreshHub() {
  for (const b of BUILDINGS) if ($("bld-" + b.id)) {
    const open = buildingOpen(S, b.id); $("bld-" + b.id).style.display = open ? "" : "none"; $("site-" + b.id).style.display = open ? "none" : "";
    if (!open && $("site-" + b.id + "-0")) {
      // the site grows over the last SITE_PIPS ranks before it opens: dirt → foundation + crane → tall walls
      const done = Math.max(0, SITE_PIPS - (b.rank - S.rank)), stage = done >= 4 ? 2 : done >= 2 ? 1 : 0;
      for (let k = 0; k < 3; k++) $("site-" + b.id + "-" + k).style.display = k === stage ? "" : "none";
      document.querySelectorAll(`#site-${b.id} .pip`).forEach(p => p.setAttribute("fill", +p.dataset.pip < done ? "#5be36a" : "#fff"));
    }
  }
  tb("tb-icecream", buildingOpen(S, "icecream") && S.daily.icecream !== today());
  tb("tb-park", buildingOpen(S, "park") && S.daily.park !== today());
  tb("tb-carwash", buildingOpen(S, "carwash") && (S.dirt[S.car] || 0) >= 3);
  tb("tb-fire", buildingOpen(S, "fire") && !S.owned.includes("firetruck"));
  tb("tb-gift", giftReady()); tb("tb-school", SKILLS.some(k => S.school.skills[k.id] < SKILL_MAX && S.school.tickets >= skillCost(S.school.skills[k.id]))); tb("tb-garage", garage.affordable()); tb("tb-trophy", claimable().length > 0); tb("tb-rank", rankReady());
  $("lab-lock").style.display = S.rank >= 2 ? "none" : "";
  $("mis-lock").style.display = S.rank >= MISSIONS_RANK ? "none" : "";
  if (S.rank >= MISSIONS_RANK) todaysMissions(dayKey(new Date()), unlocked);
  tb("tb-missions", S.rank >= MISSIONS_RANK && missionsReady());
  const ls = lab.status();
  tb("tb-lab", S.rank >= 2 && (ls.done || ls.idle)); $("lab-timer").textContent = ls.text;
  $("tw-rank").textContent = S.rank; $("rp-rank").textContent = S.rank; $("rp-title").textContent = rankTitle(S.rank);
  // wide screens: fill and trim the sky; squarer or portrait screens: show the whole street
  paintTownArrows();
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
  else if (go === "school") { sfx("click"); openSchool(); }
  else if (go === "library") { sfx("click"); toast("📚 Read a real book! A grown-up can log it at the Driver School."); setTimeout(() => { if (screen === "s-hub") openSchool(); }, 600); }
  else if (go === "carwash" || go === "museum") {
    if (!buildingOpen(S, go)) { nope(); toast(`🚧 Opens at Rank ${BUILDINGS.find(x => x.id === go).rank}`); return; }
    sfx("click"); if (go === "carwash") openWash(); else openMuseum();
  }
  else if (["icecream", "fire", "park"].includes(go)) {
    if (!buildingOpen(S, go)) { nope(); toast(`🚧 Opens at Rank ${BUILDINGS.find(x => x.id === go).rank}`); return; }
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 3;
    if (go === "icecream") {
      if (S.daily.icecream === today()) { sfx("click"); toast("🍦 Come back tomorrow for more ice cream!"); return; }
      S.daily.icecream = today(); earn(300 + 25 * S.rank, x, y); sfx("chest"); toast(`🍦 Yum! Free ice cream: +🪙${300 + 25 * S.rank}`);
    } else if (go === "park") {
      if (S.daily.park === today()) { sfx("click"); toast("🧺 The picnic is packed up. Come back tomorrow!"); return; }
      S.daily.park = today(); earn(500 + 25 * S.rank, x, y); sfx("chest");
      const nd = new Date(), dn = Math.floor(Date.UTC(nd.getFullYear(), nd.getMonth(), nd.getDate()) / 86400000);
      toast(`🧺 Picnic in the park: +🪙${500 + 25 * S.rank}`);
      if (dn % 3 === 0) awardChip("park:" + today());
    } else if (go === "fire") {
      if (S.owned.includes("firetruck")) { sfx("click"); toast("🚒 Fire Dash is waiting in your garage!"); return; }
      S.owned.push("firetruck"); upsOf("firetruck"); museumAdd("🚒", "Got Fire Dash from the firefighters"); save(); sfx("win"); confetti(150); toast("🚒 The firefighters gave you Fire Dash!");
    }
    refreshHub();
  }
  else if (go === "missions") { if (S.rank < MISSIONS_RANK) { nope(); toast("🔒 Missions open at Rank " + MISSIONS_RANK); } else { sfx("click"); openMissions(); } }
  else if (go === "lab") { if (S.rank < 2) { nope(); setTimeout(() => { if (screen === "s-hub") openRank(); }, 350); } else { sfx("click"); openLab(); } }
});
const lab = createLab({ $, sfx, spend, celebrate: () => confetti(90), onChange: () => { refreshChips(); if (screen === "s-hub") refreshHub(); } });
const PROF = () => ["Hi " + who() + "! What should we invent?", "Beep boop! Science time!", "Research makes EVERY car better!", "Let's make you super fast, " + who() + "!"];
function openLab() { { const L = PROF(); $("prof-say").textContent = L[Math.floor(Math.random() * L.length)]; } lab.open(); show("s-lab"); }
function goHub() {
  show("s-hub");
  if (giftReady() && !giftShownThisVisit) { giftShownThisVisit = true; setTimeout(() => { if (screen === "s-hub") openGift(); }, 400); }
}
document.querySelectorAll("[data-back]").forEach(b => b.onclick = () => { sfx("click"); show("s-hub"); });

function paintToggles() {
  $("set-tilt").hidden = !tiltSupported; $("set-flip").hidden = !tiltSupported || !S.opts.tilt;
  $("set-tilt").classList.toggle("off", !S.opts.tilt); paintTiltLive();
  $("set-name-now").textContent = S.name || "Tap to add";
  $("btn-music").classList.toggle("off", !S.music); $("btn-sfx").classList.toggle("off", !S.sfx);
  $("set-music").textContent = S.music ? "On" : "Off"; $("set-sfx").textContent = S.sfx ? "On" : "Off";
}
$("btn-music").onclick = () => { S.music = !S.music; save(); setAudioOpts({ music: S.music }); paintToggles(); sfx("click"); };
$("btn-sfx").onclick = () => { S.sfx = !S.sfx; save(); setAudioOpts({ sfx: S.sfx }); paintToggles(); sfx("click"); };
paintToggles();

function pause() { if (mode !== "race" || race.state === "done") return; paused = true; engineOff(); show("s-pause"); }
$("btn-play").onclick = () => {
  initAudio(); goFullscreen(); sfx("click");
  if (S.opts.tilt && typeof DeviceMotionEvent?.requestPermission === "function") DeviceMotionEvent.requestPermission().catch(() => {});
  if (!S.name) askName(); else goHub();
  cloudWake().then(r => { if (r === "loaded") location.reload(); });   // quietly reconnect Google Save (needs this tap)
};
let coinsSeen = S.coins, coinsSave = S;
whenSaved(() => {
  if (coinsSave !== S) { coinsSave = S; coinsSeen = S.coins; }          // a different save was loaded
  if (S.coins > coinsSeen) S.stats.coinsEarned += S.coins - coinsSeen;
  coinsSeen = S.coins; cloudSaved();
});
/* 📲 Install as an app: a button on the title screen only, shown only when this device can install the game
   (Chrome/Edge/Android offer it through "beforeinstallprompt"; iPhone/iPad need Share → Add to Home Screen)
   and it isn't already installed (running as an app). Never on the http:// home-network address (not installable). */
let installEvt = null;
const runningAsApp = () => ["standalone", "fullscreen", "minimal-ui"].some(m => matchMedia(`(display-mode: ${m})`).matches) || navigator.standalone === true;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const iosSafari = isIOS && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
function paintInstall() { $("btn-install").hidden = runningAsApp() || !window.isSecureContext || !(installEvt || iosSafari); }
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; paintInstall(); });
addEventListener("appinstalled", () => { installEvt = null; paintInstall(); toast("📲 Installed! Turbo Dash is on the home screen now."); });
$("btn-install").onclick = async () => {
  sfx("click");
  if (installEvt) { const e = installEvt; installEvt = null; e.prompt(); try { await e.userChoice; } catch (err) { /* closed */ } paintInstall(); }
  else if (iosSafari) $("install-help").hidden = false;
};
$("install-ok").onclick = () => { sfx("click"); $("install-help").hidden = true; };
paintInstall();
/* 👋 "What's your name?" — on the first run (and after a reset), and from Settings. */
let nameBack = "s-hub";
function askName(back = "s-hub") {
  nameBack = back; $("name-in").value = S.name || ""; paintNameOk(); $("name-back").hidden = back === "s-hub"; show("s-name");
  setTimeout(() => $("name-in").focus(), 250);
}
const paintNameOk = () => { $("name-ok").disabled = !$("name-in").value.trim(); };
$("name-in").addEventListener("input", paintNameOk);
$("name-in").addEventListener("keydown", e => { if (e.key === "Enter") $("name-ok").click(); });
$("name-ok").onclick = () => {
  const n = $("name-in").value.replace(/[<>&"]/g, "").trim().slice(0, 14); if (!n) { sfx("nope"); return; }
  S.name = n.charAt(0).toUpperCase() + n.slice(1); save(); sfx("buy"); $("name-in").blur();
  toast(`👋 Hi ${S.name}! Let's race!`); confetti(60);
  if (nameBack === "s-hub") goHub(); else { show(nameBack); paintToggles(); }
};
$("name-back").onclick = () => { sfx("click"); show(nameBack); };
$("set-name").onclick = () => { sfx("click"); askName("s-settings"); };
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
$("btn-quit").onclick = () => { sfx("click"); cupRun = null; bossRun = null; trialRun = false; menuDemo(); show("s-hub"); };
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
  $("p-weather").innerHTML = [true, false].map(v => `<button data-pw="${v}" class="${S.parent.weather === v ? "on" : ""}">${v ? "On" : "Off"}</button>`).join("");
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
  const pw = e.target.closest("[data-pw]");
  if (pw) { S.parent.weather = pw.dataset.pw === "true"; save(); paintParent(); }
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
  const same = (() => { try { const a = JSON.parse(decodeURIComponent(escape(atob(code.trim().replace(/^TD1-/, ""))))), b = JSON.parse(JSON.stringify(S)); for (const o of [a, b]) { delete o.savedAt; if (o.stats) { delete o.stats.playMs; delete o.stats.coinsEarned; } } return JSON.stringify(a) === JSON.stringify(b); } catch (e) { return false; } })();
  if (same) { $("p-msg").textContent = "That's the save already on this tablet."; return; }
  if (!confirm("Replace the progress on this tablet with the pasted code?")) return;
  try { importSave(code); location.reload(); }
  catch (e) { $("p-msg").textContent = "That code didn't work. Check that the whole code was pasted."; }
};
$("p-close").onclick = () => show("s-title");
$("p-progress").onclick = () => { sfx("click"); openProgress(); };
$("p-guide").onclick = () => { sfx("click"); show("s-guide"); $("guide-body").scrollTop = 0; };
document.querySelectorAll("[data-backto]").forEach(b => b.addEventListener("click", () => { sfx("click"); show(b.dataset.backto); }));
/* 📊 Progress: everything stays on this tablet */
function openProgress() {
  const st = S.stats, hrs = st.playMs / 3600000, rate = S.races ? Math.round(100 * S.wins / S.races) : 0;
  const time = hrs < 1 ? Math.round(hrs * 60) + " min" : hrs.toFixed(1) + " h";
  const tiles = [["⏱️", time, "played"], ["🏁", S.races, "races"], ["🏆", S.wins, `wins · ${rate}%`], ["🪙", Math.round(st.coinsEarned).toLocaleString(), "coins earned"], ["⭐", "Rank " + S.rank, rankTitle(S.rank)], ["🚗", S.owned.filter(id => CARS.some(c => c.id === id)).length + " / " + CARS.length, "cars"]];
  $("pg-tiles").innerHTML = tiles.map(([i, v, l]) => `<div class="pg-tile"><span>${i}</span><b>${v}</b><small>${l}</small></div>`).join("");
  const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); const k = dayKey(d); return { n: S.days[k] || 0, l: d.toLocaleDateString([], { weekday: "narrow" }), today: i === 13 }; });
  const max = Math.max(1, ...days.map(d => d.n));
  $("pg-days").innerHTML = days.map(d => `<div class="pg-day ${d.today ? "today" : ""}"><i style="height:${Math.round(100 * d.n / max)}%"></i><b>${d.n || ""}</b><small>${d.l}</small></div>`).join("");
  // the next rank: each gauge, and a rough "hours of play" from his own pace so far
  const fr = frontsNow().filter(f => f.need > 0), maxed = S.rank >= RANK_CAP;
  let est = 0;
  for (const f of fr) if (f.have < f.need && f.id !== "license") { const perHour = hrs > 0.2 ? f.have / hrs : 0; est = Math.max(est, perHour > 0 ? (f.need - f.have) / perHour : Infinity); }
  $("pg-next").innerHTML = maxed ? "Top rank for now! 🎉" : `<b>Next: Rank ${S.rank + 1}</b> ${fr.map(f => `<span class="${f.have >= f.need ? "ok" : ""}">${f.icon} ${Math.min(f.have, f.need)}/${f.need}</span>`).join(" ")}
    <small>${rankReady() ? "Ready to rank up now! Tap the Rank tower." : !isFinite(est) || hrs <= 0.2 ? "Play a little more to see an estimate." : `About ${est < 1 ? Math.max(5, Math.round(est * 60)) + " minutes" : est.toFixed(1) + " hours"} of play at his pace${fr.some(f => f.id === "license" && f.have < f.need) ? ", plus a Driver School lesson" : ""}.`}</small>`;
  const best = Object.entries(S.mastery || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => { const [id, df] = k.split(":"), t = TRACKS.find(x => x.id === id); return t ? `<span>${t.icon} ${t.name} <small>${n} wins (${df})</small></span>` : ""; }).join("");
  $("pg-best").innerHTML = best || "<span>No wins yet.</span>";
  const mins = Object.fromEntries(ACTIVITIES.map(a => [a.id, 0])); for (const e of S.school.log || []) if (mins[e.a] != null) mins[e.a] += e.m || 0;
  $("pg-school").innerHTML = ACTIVITIES.map(a => `<span>${a.icon} ${a.name} <b>${mins[a.id]} min</b></span>`).join("") + `<small>Driver School: ${lessonsOf(S)} lessons · ${S.school.tickets} 🎟️ waiting · license ${LICENSES[licenseLevel(S)].name}</small>`;
  show("s-progress");
}
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
  if (b.dataset.ans === "1") { clearTimeout(guRetry); if (!guPass) return; sfx("click"); const f = guPass; guPass = null; f(); }
  else { sfx("nope"); const g = $("ga"); g.classList.remove("shake"); void g.offsetWidth; g.classList.add("shake"); const back = guBack, pass = guPass; clearTimeout(guRetry); guRetry = setTimeout(() => { if (screen === "s-grownup") grownUp(back, pass); }, 450); }
});
let guRetry = 0;
$("gu-cancel").onclick = () => { sfx("click"); clearTimeout(guRetry); guPass = null; show(guBack); };
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
function paintUpdate() { $("update").hidden = !(updateReady && screen && screen !== "s-parent" && screen !== "s-update" && !cupRun); }
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

if (import.meta.env.DEV) import("./dev/audit.js");
if (import.meta.env.DEV) window.__td = { get race() { return race; }, loadToy, levelUpCard, get S() { return S; }, startRace, TRACKS, showResult, show, openTracks, openTrophies, openRank, garage, goHub, startCup, CUPS, importSave, exportSave, fakeUpdate: () => { updateReady = true; paintUpdate(); } };

refreshCoins(false); refreshChips();
menuDemo();
show("s-title");
requestAnimationFrame(frame);

/* Main Street scrolls sideways once it's full: arrows at the edges, with a "!" when something off screen is waiting. */
function paintTownArrows() {
  const w = $("town-wrap"), max = w.scrollWidth - w.clientWidth;
  $("town-l").hidden = w.scrollLeft < 10; $("town-r").hidden = w.scrollLeft > max - 10 || max < 10;
  const edge = innerWidth;
  $("town-r-dot").hidden = ![...document.querySelectorAll("#town .tbadge")].some(b => b.style.display !== "none" && b.getBoundingClientRect().left > edge);
}
$("town-wrap").addEventListener("scroll", paintTownArrows, { passive: true });
$("town-l").onclick = () => { sfx("click"); $("town-wrap").scrollBy({ left: -innerWidth * 0.7, behavior: "smooth" }); };
$("town-r").onclick = () => { sfx("click"); $("town-wrap").scrollBy({ left: innerWidth * 0.7, behavior: "smooth" }); };

/* 🏁 the launch splash: about a second and a half, and a tap skips it */
{
  const sp = $("splash"), done = () => { if (!sp.isConnected) return; sp.classList.add("out"); setTimeout(() => sp.remove(), 450); };
  sp.addEventListener("pointerdown", e => {
    e.preventDefault(); e.stopPropagation(); done();
    const swallow = ev => { ev.stopPropagation(); ev.preventDefault(); };
    document.addEventListener("click", swallow, true); setTimeout(() => document.removeEventListener("click", swallow, true), 500);
  });
  setTimeout(done, 1500);
}
