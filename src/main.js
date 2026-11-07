import { CARS, TRACKS, prizeFor } from "./data.js";
import { Race, BASE_MAX } from "./engine.js";
import { initAudio, sfx, engine, engineOff, setAudioOpts, setSong } from "./audio.js";
import { S, load, save } from "./save.js";

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
  if (portrait) { ch = Math.round(Math.min(vh * 0.6, vw * 1.05)); top = Math.round(vh * 0.11); }
  const k = Math.min(window.devicePixelRatio || 1, 2, 720 / ch);
  canvas.width = Math.round(cw * k); canvas.height = Math.round(ch * k);
  Object.assign(canvas.style, { width: cw + "px", height: ch + "px", top: top + "px" });
}
addEventListener("resize", resize);
resize();

/* ---------- game loop ---------- */
let mode = "menu", paused = false, last = performance.now(), acc = 0, goT = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!paused) { acc += dt; while (acc >= STEP) { race.update(STEP); acc -= STEP; } }
  race.render();
  if (mode === "race") updateHud(dt);
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
const screens = ["s-title", "s-result", "s-pause"];
function show(id) { for (const s of screens) $(s).hidden = s !== id; }
function setRaceUi(on) { $("hud").hidden = !on; $("controls").hidden = !on; if (!on) $("countdown").hidden = true; }

function goFullscreen() {
  if (matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches || document.fullscreenElement) return;
  const el = document.documentElement;
  if (!el.requestFullscreen || !matchMedia("(pointer: coarse)").matches) return;
  el.requestFullscreen({ navigationUI: "hide" }).then(() => screen.orientation?.lock?.("landscape")).catch(() => {});
}

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
  mode = "menu"; paused = false; setRaceUi(false); engineOff(); setSong("menu");
  const track = TRACKS.find(t => t.id === S.lastTrack) || TRACKS[0];
  const { car, stats } = carStats();
  race.setup(track, "demo", car, stats);
}

let currentTrack = TRACKS[0];
function startRace(track) {
  currentTrack = track; S.lastTrack = track.id; save();
  const { car, stats } = carStats();
  race.setup(track, "race", car, stats);
  mode = "race"; paused = false; show(null); setRaceUi(true); setSong("race");
  buildProgress(); lastCount = null;
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

/* ---------- results ---------- */
function showResult(r) {
  const prize = prizeFor(currentTrack, r.place), total = prize + r.coins;
  S.coins += total; S.races++; if (r.place === 1) S.wins++;
  S.best[currentTrack.id] = Math.min(S.best[currentTrack.id] || 99, r.place);
  save();
  mode = "result"; setRaceUi(false); engineOff();
  $("r-trophy").textContent = ["🏆", "🥈", "🥉"][r.place - 1] || "🏁";
  $("r-title").textContent = r.place <= 3 ? `${r.place}${suffix(r.place)} PLACE!` : "Good try!";
  $("r-coins").textContent = "+" + total;
  sfx(r.place <= 3 ? "win" : "lose");
  show("s-result");
}

function pause() { if (mode !== "race") return; paused = true; engineOff(); show("s-pause"); }

$("btn-play").onclick = () => { initAudio(); goFullscreen(); sfx("click"); startRace(TRACKS[0]); };
$("btn-again").onclick = () => { sfx("click"); startRace(currentTrack); };
$("btn-pause").onclick = () => { sfx("click"); pause(); };
$("btn-resume").onclick = () => { sfx("click"); paused = false; show(null); };
$("btn-quit").onclick = () => { sfx("click"); menuDemo(); show("s-title"); };
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

if (import.meta.env.DEV) window.__td = { race, S, startRace, TRACKS };

menuDemo();
show("s-title");
requestAnimationFrame(frame);
