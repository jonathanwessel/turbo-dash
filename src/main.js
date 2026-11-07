import { CARS, TRACKS, THEMES, prizeFor } from "./data.js";
import { Race, BASE_MAX } from "./engine.js";
import { initAudio, sfx, engine, engineOff, setAudioOpts, setSong } from "./audio.js";
import { S, load, save } from "./save.js";
import { confetti, coinBurst } from "./fx.js";
import { createGarage } from "./garage.js";

const VERSION = import.meta.env.DEV ? "dev" : __APP_VERSION__;
const $ = id => document.getElementById(id);
const canvas = $("game");
const STEP = 1 / 60;

load();
setAudioOpts({ music: S.music, sfx: S.sfx });

const race = new Race(canvas, {
  sfx, engine,
  onFinish: r => setTimeout(() => showResult(r), 1300),
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
  if (!paused) { acc += dt; while (acc >= STEP) { race.update(STEP); acc -= STEP; } }
  race.render();
  if (mode === "race") updateHud(dt);
  if (screen === "s-garage") garage.draw(dt);
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
// Touching the left or right half of the race picture also steers.
const touches = new Map();
const touchSteer = () => { let l = false, r = false; for (const v of touches.values()) v ? (r = true) : (l = true); race.input.left = l; race.input.right = r; };
canvas.addEventListener("pointerdown", e => { if (mode !== "race") return; touches.set(e.pointerId, e.clientX > innerWidth / 2); touchSteer(); });
for (const ev of ["pointerup", "pointercancel", "pointerleave"]) canvas.addEventListener(ev, e => { if (touches.delete(e.pointerId)) touchSteer(); });
const keys = { ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right" };
addEventListener("keydown", e => { if (keys[e.key]) race.input[keys[e.key]] = true; if ((e.key === " " || e.key === "ArrowUp") && mode === "race") race.useNitro(); if (e.key === "Escape" && mode === "race") pause(); });
addEventListener("keyup", e => { if (keys[e.key]) race.input[keys[e.key]] = false; });

/* ---------- screens ---------- */
const SCREENS = ["s-title", "s-hub", "s-tracks", "s-garage", "s-result", "s-pause", "s-gift"];
function show(id) {
  screen = id;
  for (const s of SCREENS) $(s).hidden = s !== id;
  const bars = id && id !== "s-title" && id !== "s-pause";
  $("coinbar").hidden = !bars; $("topright").hidden = id !== "s-hub";
  if (id === "s-hub") refreshHub();
}
function setRaceUi(on) { $("hud").hidden = !on; $("controls").hidden = !on; if (!on) $("countdown").hidden = true; }

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
function earn(n, x, y) { S.coins += n; save(); refreshCoins(); if (x != null) coinBurst(x, y); }
function spend(n) {
  if (S.coins < n) { sfx("nope"); const b = $("coinbar"); b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); return false; }
  S.coins -= n; save(); refreshCoins(); return true;
}

/* ---------- race setup ---------- */
function carStats() {
  const car = CARS.find(c => c.id === S.car) || CARS[0], u = S.up;
  return {
    car,
    stats: {
      maxSpeed: BASE_MAX * (1 + car.speed + 0.06 * u.engine),
      accel: BASE_MAX / 4.5 * (1 + car.accel + 0.04 * u.engine),
      handling: 1.15 + car.grip + 0.07 * u.tires,
      grip: Math.min(0.6, car.grip + 0.06 * u.tires),
      nitroFill: 0.05 + 0.01 * u.turbo,
      nitroTime: 2 + 0.3 * u.turbo,
      magnet: 0.12 * u.magnet,
    },
  };
}

function menuDemo() {
  mode = "menu"; paused = false; setRaceUi(false); engineOff(); setSong("menu"); resize();
  const track = TRACKS.find(t => t.id === S.lastTrack) || TRACKS[0];
  const { car, stats } = carStats();
  race.setup(track, "demo", car, stats);
}

let currentTrack = TRACKS[0];
function startRace(track) {
  currentTrack = track; S.lastTrack = track.id; save();
  const { car, stats } = carStats();
  mode = "race"; paused = false; resize();
  race.setup(track, "race", car, stats);
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
const unlocked = i => i === 0 || (S.best[TRACKS[i - 1].id] || 99) <= 3;
const MEDAL = ["", "🏆", "🥈", "🥉"];
function openTracks() {
  const list = $("track-list");
  list.innerHTML = TRACKS.map((t, i) => {
    const th = THEMES[t.theme], open = unlocked(i), best = S.best[t.id];
    return `<button class="track-card ${open ? "" : "locked"}" data-i="${i}" style="background:linear-gradient(${th.sky[0]},${th.sky[1]} 55%,${th.grass[0]} 56%)">
      <div class="tc-icon">${t.icon}</div><div class="tc-name">${t.name}</div>
      <div class="tc-best">${best ? (MEDAL[best] || "🏁") : ""}</div>
      <div class="tc-prize">🪙 ${prizeFor(t, 1)}</div>
      ${open ? "" : `<div class="tc-lock">🔒<small>Get 🥉 on ${TRACKS[i - 1].name}</small></div>`}</button>`;
  }).join("");
  show("s-tracks");
  const cur = list.querySelector(`[data-i="${Math.max(0, TRACKS.findIndex(t => t.id === S.lastTrack))}"]`);
  cur?.scrollIntoView({ inline: "center", block: "center" });
}
$("track-list").addEventListener("click", e => {
  const c = e.target.closest(".track-card"); if (!c) return;
  const i = +c.dataset.i;
  if (!unlocked(i)) { sfx("nope"); c.animate([{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], { duration: 300 }); return; }
  sfx("click"); startRace(TRACKS[i]);
});

/* ---------- results + treasure chests ---------- */
let chestValues = [], chestDone = false;
function showResult(r) {
  const ti = TRACKS.indexOf(currentTrack), wasOpen = unlocked(ti + 1);
  const prize = prizeFor(currentTrack, r.place);
  S.races++; if (r.place === 1) S.wins++;
  S.best[currentTrack.id] = Math.min(S.best[currentTrack.id] || 99, r.place);
  S.coins += prize + r.coins; save();
  mode = "result"; setRaceUi(false); engineOff();
  $("r-trophy").textContent = MEDAL[r.place] || "🏁";
  $("r-title").textContent = r.place <= 3 ? `${r.place}${suffix(r.place)} PLACE!` : `${r.place}${suffix(r.place)} — Good try!`;
  $("r-prize").textContent = prize; $("r-road").textContent = r.coins;
  const next = TRACKS[ti + 1], nowOpen = next && unlocked(ti + 1);
  $("r-unlock").hidden = !(nowOpen && !wasOpen);
  if (nowOpen && !wasOpen) $("r-unlock").textContent = `🔓 New track: ${next.icon} ${next.name}!`;
  const base = 30 + 25 * currentTrack.diff;
  chestValues = [base, base * 2, base * 4].sort(() => Math.random() - 0.5);
  chestDone = false;
  document.querySelectorAll(".chest").forEach(c => { c.className = "chest"; c.textContent = "🎁"; });
  $("r-chests").hidden = false; $("r-btns").hidden = true; $("r-pick").textContent = "Pick a treasure chest!";
  $("btn-next").hidden = !nowOpen;
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
$("btn-next").onclick = () => { sfx("click"); startRace(TRACKS[TRACKS.indexOf(currentTrack) + 1]); };
$("btn-home").onclick = () => { sfx("click"); menuDemo(); show("s-hub"); };

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
  const r = $("gift-take").getBoundingClientRect();
  earn(g.amount, r.left + r.width / 2, r.top);
  sfx("buy"); confetti(90);
  show("s-hub");
};

/* ---------- hub, garage, settings ---------- */
const garage = createGarage({ $, sfx, spend, celebrate: () => confetti(100) });
let giftShownThisVisit = false;
function refreshHub() {
  $("gift-badge").hidden = !giftReady();
  $("garage-badge").hidden = !garage.affordable();
}
function goHub() {
  show("s-hub");
  if (giftReady() && !giftShownThisVisit) { giftShownThisVisit = true; setTimeout(openGift, 400); }
}
$("hub-race").onclick = () => { sfx("click"); openTracks(); };
$("hub-garage").onclick = () => { sfx("click"); garage.open(); show("s-garage"); };
$("hub-gift").onclick = () => { sfx("click"); openGift(); };
document.querySelectorAll("[data-back]").forEach(b => b.onclick = () => { sfx("click"); show("s-hub"); });

function paintToggles() { $("btn-music").classList.toggle("off", !S.music); $("btn-sfx").classList.toggle("off", !S.sfx); }
$("btn-music").onclick = () => { S.music = !S.music; save(); setAudioOpts({ music: S.music }); paintToggles(); sfx("click"); };
$("btn-sfx").onclick = () => { S.sfx = !S.sfx; save(); setAudioOpts({ sfx: S.sfx }); paintToggles(); sfx("click"); };
paintToggles();

function pause() { if (mode !== "race") return; paused = true; engineOff(); show("s-pause"); }
$("btn-play").onclick = () => { initAudio(); goFullscreen(); sfx("click"); goHub(); };
$("btn-pause").onclick = () => { sfx("click"); pause(); };
$("btn-resume").onclick = () => { sfx("click"); paused = false; show(null); };
$("btn-quit").onclick = () => { sfx("click"); menuDemo(); show("s-hub"); };
document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });

/* ---------- versions & offline ---------- */
$("ver").textContent = VERSION === "dev" ? "dev build" : "v" + VERSION;
if (VERSION !== "dev") {
  const check = async () => {
    try {
      const r = await fetch("version.json?t=" + Date.now(), { cache: "no-store" }); if (!r.ok) return;
      const { version } = await r.json();
      if (version && version !== VERSION && mode !== "race") { $("upd-v").textContent = version; $("update").hidden = false; }
    } catch (e) { /* offline */ }
  };
  setInterval(check, 60000); setTimeout(check, 5000);
  $("upd-go").onclick = () => { save(); location.reload(); };
}
if (import.meta.env.PROD && "serviceWorker" in navigator && window.isSecureContext) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(e => console.warn("Turbo Dash: offline cache unavailable", e)));
}

if (import.meta.env.DEV) window.__td = { race, S, startRace, TRACKS, showResult, show, openTracks, garage, goHub };

refreshCoins(false);
menuDemo();
show("s-title");
requestAnimationFrame(frame);
