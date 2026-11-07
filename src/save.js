// Progress lives in this browser's localStorage. EVERY version must load EVERY older save: port() below checks
// each field, converts old shapes, and repairs anything broken, and scripts/test-saves.mjs proves it for a save
// from every past release (it runs before every `npm run release`).
// A second copy (the last save that loaded fine) protects against a bad write; a save code lets a parent copy
// progress to another device; Google Save (cloud.js) keeps a copy in the parent's Google Drive.
import { CARS, TRACKS, UPGRADES, UPGRADE_MAX, DIFFS, PAINTS, STICKERS, RESEARCH, WORLDS } from "./data.js";

export const SAVE_VERSION = 14;
const KEY = "turbodash.save", BACKUP = "turbodash.save.backup", BEFORE = "turbodash.save.before";
const NO_UPS = { engine: 0, turbo: 0, tires: 0, magnet: 0 };
const DEFAULTS = () => ({
  v: SAVE_VERSION, savedAt: 0, coins: 0, owned: ["zippy"], car: "zippy",
  ups: { zippy: { ...NO_UPS } },   // carId -> { engine, turbo, tires, magnet }: every car has its own upgrades
  best: {},            // trackId -> best place (1 is best), any difficulty
  name: "",            // the player's name (asked on the first run; used in the game's messages)
  races: 0, wins: 0, lastGift: "", giftStreak: 0, lastTrack: "sunny",
  music: true, sfx: true,
  paints: ["stock"], stickers: ["none"], look: {},   // look: carId -> { paint, sticker }
  stats: { roadCoins: 0, stunts: 0, turbos: 0, bams: 0, powers: 0, rings: 0, pearls: 0, drifts: 0, loops: 0 }, claimed: [], world: "earth", bosses: {}, daily: {},
  trials: {},          // trackId -> best Time Trial time (seconds)
  seen: {},            // one-time moments already shown (seen.toy: the "game levels up" card)
  trialMedals: {},     // trackId -> best medal (1 bronze, 2 silver, 3 gold)
  rank: 1, diff: "normal",
  bestD: {},           // "trackId:difficulty" -> best place
  mastery: {},         // "trackId:difficulty" -> wins there (Track Mastery stars)
  research: {},        // projectId -> level (Turbo Lab)
  lab: { benches: [] }, // [{ p: projectId | null, end: ms timestamp }]
  cups: {},            // "cupId:difficulty" -> best place
  chips: 0, chipLog: {}, // Brain Chips (earned only) and which one-time chip rewards were already given
  parent: { diffs: ["easy", "normal", "hard"], helper: 0, breakMin: 0, volume: 0.8, buzz: true, autoSteer: true, license: true },  // helper: 0 off, 1 a little, 2 lots
  autoOn: false,
  missions: null, history: [], restUntil: 0,
  cloud: { linked: false },   // Google Save
  // Driver School: tickets come from real-world time a grown-up logs; skills are bought with tickets
  school: { tickets: 0, earned: 0, skills: { focus: 0, reflex: 0, courage: 0, smarts: 0 }, log: [], readingDouble: true, capMin: 0 },
});

export let S = DEFAULTS();

const num = (v, def = 0, min = -Infinity, max = Infinity) => (typeof v === "number" && isFinite(v) ? Math.min(max, Math.max(min, v)) : def);
const obj = v => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
const arr = v => (Array.isArray(v) ? v : []);
const placeMap = m => Object.fromEntries(Object.entries(obj(m)).filter(([, p]) => typeof p === "number" && p >= 1 && p <= 6));
const carIds = new Set(CARS.map(c => c.id));

/* Turn any older (or damaged) save into the current shape without losing anything Carter earned. */
export function port(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) throw new Error("not a Turbo Dash save");
  if (typeof d.coins !== "number" && typeof d.coins !== "string") throw new Error("not a Turbo Dash save");
  const def = DEFAULTS(), s = { ...def };

  s.coins = Math.round(num(+d.coins, 0, 0));
  s.races = num(d.races, 0, 0); s.wins = num(d.wins, 0, 0);
  s.rank = Math.round(num(d.rank, 1, 1, 60));
  s.savedAt = num(d.savedAt, 0, 0);
  s.music = d.music !== false; s.sfx = d.sfx !== false;
  s.lastGift = typeof d.lastGift === "string" ? d.lastGift : "";
  s.giftStreak = num(d.giftStreak, 0, 0);
  s.lastTrack = TRACKS.some(t => t.id === d.lastTrack) ? d.lastTrack : "sunny";
  s.name = typeof d.name === "string" ? d.name.replace(/[<>&"]/g, "").trim().slice(0, 14) : "";
  s.diff = DIFFS.some(x => x.id === d.diff) ? d.diff : "normal";
  s.chips = Math.round(num(d.chips, 0, 0));
  s.restUntil = num(d.restUntil, 0, 0);
  s.autoOn = d.autoOn === true;
  s.world = WORLDS.some(w => w.id === d.world && !w.soon) ? d.world : "earth";
  s.trials = Object.fromEntries(Object.entries(obj(d.trials)).filter(([, v]) => typeof v === "number" && v > 0 && v < 3600).map(([k, v]) => [k, Math.round(v * 100) / 100]));
  s.trialMedals = Object.fromEntries(Object.entries(obj(d.trialMedals)).map(([k, v]) => [k, Math.round(num(v, 0, 0, 3))]).filter(([, v]) => v > 0));
  s.bosses = Object.fromEntries(Object.entries(obj(d.bosses)).filter(([, v]) => v));
  s.seen = Object.fromEntries(Object.entries(obj(d.seen)).filter(([, v]) => v === true));
  s.daily = Object.fromEntries(Object.entries(obj(d.daily)).filter(([, v]) => typeof v === "string"));

  // cars: always own Zippy; keep unknown ids (they may belong to a newer version) but never drive one
  s.owned = [...new Set(["zippy", ...arr(d.owned).filter(x => typeof x === "string")])];
  s.car = typeof d.car === "string" && s.owned.includes(d.car) && carIds.has(d.car) ? d.car : "zippy";

  // upgrades: v0.4.1 and older had one set for all cars -> every car owned back then keeps those levels
  const lvl = u => Object.fromEntries(UPGRADES.map(x => [x.id, Math.round(num(obj(u)[x.id], 0, 0, UPGRADE_MAX))]));
  s.ups = {};
  if (d.ups) for (const [id, u] of Object.entries(obj(d.ups))) s.ups[id] = lvl(u);
  else if (d.up) for (const id of s.owned) s.ups[id] = lvl(d.up);
  for (const id of s.owned) if (!s.ups[id]) s.ups[id] = { ...NO_UPS };

  // results: v0.4 and older kept one best place per track, and those were all Normal races
  s.best = placeMap(d.best);
  s.bestD = placeMap(d.bestD);
  if (!d.bestD) for (const [id, p] of Object.entries(s.best)) s.bestD[id + ":normal"] = p;
  for (const [k, p] of Object.entries(s.bestD)) { const id = k.split(":")[0]; s.best[id] = Math.min(s.best[id] || 99, p); }
  s.mastery = Object.fromEntries(Object.entries(obj(d.mastery)).map(([k, v]) => [k, Math.round(num(v, 0, 0))]));
  s.cups = placeMap(d.cups);

  s.paints = [...new Set(["stock", ...arr(d.paints).filter(x => typeof x === "string")])];
  s.stickers = [...new Set(["none", ...arr(d.stickers).filter(x => typeof x === "string")])];
  s.look = Object.fromEntries(Object.entries(obj(d.look)).map(([id, l]) => [id, {
    paint: PAINTS.some(p => p.id === obj(l).paint) && s.paints.includes(obj(l).paint) ? obj(l).paint : "stock",
    sticker: STICKERS.some(p => p.id === obj(l).sticker) && s.stickers.includes(obj(l).sticker) ? obj(l).sticker : "none",
  }]));
  s.stats = Object.fromEntries(Object.keys(def.stats).map(k => [k, Math.round(num(obj(d.stats)[k], 0, 0))]));
  s.claimed = [...new Set(arr(d.claimed).filter(x => typeof x === "string"))];
  s.chipLog = Object.fromEntries(Object.entries(obj(d.chipLog)).filter(([, v]) => v));

  s.research = Object.fromEntries(Object.entries(obj(d.research)).map(([k, v]) => [k, Math.round(num(v, 0, 0, 100))]));
  s.lab = { benches: arr(obj(d.lab).benches).map(b => ({ p: RESEARCH.some(r => r.id === obj(b).p) ? b.p : null, end: num(obj(b).end, 0, 0) })) };

  const p = obj(d.parent), pd = arr(p.diffs).filter(x => DIFFS.some(y => y.id === x));
  s.parent = {
    diffs: pd.length ? pd : def.parent.diffs,
    helper: Math.round(num(p.helper, 0, 0, 2)), breakMin: num(p.breakMin, 0, 0, 240), volume: num(p.volume, 0.8, 0, 1),
    buzz: p.buzz !== false, autoSteer: p.autoSteer !== false, license: p.license !== false,
  };
  const M = obj(d.missions);
  const KINDS = ["races", "wins", "podium", "coins", "jumps", "powers", "bams", "track"], fin = v => typeof v === "number" && Number.isFinite(v);
  const okM = m => m && typeof m === "object" && KINDS.includes(m.kind) && fin(m.goal) && m.goal > 0 && fin(m.have) && fin(m.reward) && m.reward >= 0 && (m.kind !== "track" || TRACKS.some(t => t.id === m.track));
  s.missions = typeof M.day === "string" && Array.isArray(M.list) && M.list.length && M.list.every(okM) ? { ...M, list: M.list.map(m => ({ ...m, claimed: m.claimed === true })) } : null;
  s.history = arr(d.history).filter(h => h && typeof h === "object").slice(0, 30);
  s.cloud = { linked: obj(d.cloud).linked === true };
  const sc = obj(d.school), sk = obj(sc.skills);
  s.school = {
    tickets: Math.round(num(sc.tickets, 0, 0)), earned: Math.round(num(sc.earned, 0, 0)),
    skills: Object.fromEntries(["focus", "reflex", "courage", "smarts"].map(k => [k, Math.round(num(sk[k], 0, 0, 10))])),
    log: arr(sc.log).filter(e => e && typeof e === "object" && typeof e.a === "string").slice(0, 60),
    readingDouble: sc.readingDouble !== false, capMin: num(sc.capMin, 0, 0, 600),
  };
  s.v = SAVE_VERSION;
  return s;
}

/* This car's upgrade levels (created at 0 the first time). */
export function upsOf(carId) { return S.ups[carId] || (S.ups[carId] = { ...NO_UPS }); }

export function load() {
  for (const key of [KEY, BACKUP]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      S = port(JSON.parse(raw));
      localStorage.setItem(BACKUP, raw);
      if (key === BACKUP) save();
      return S;
    } catch (e) { console.warn(`Turbo Dash: could not read ${key}`, e); }
  }
  return S;
}
let onSaved = null;
export const whenSaved = fn => { onSaved = fn; };
export function save() {
  S.savedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ }
  onSaved?.();
}
if (typeof addEventListener === "function") addEventListener("pagehide", () => save());
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });

export function exportSave() { return "TD1-" + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
export function importSave(code) {
  const body = code.trim().replace(/^TD1-/, "");
  replaceSave(JSON.parse(decodeURIComponent(escape(atob(body)))));
}
/* Swap in a whole save (from a code or the cloud). The old one is kept as the backup copy. */
export function replaceSave(data) {
  const s = port(data);
  keepBefore();
  S = s; save();
}
export function resetSave() { keepBefore(); S = DEFAULTS(); try { localStorage.removeItem(GHOSTS); } catch (e) { /* storage blocked */ } save(); }

/* Time Trial ghosts live in their own key (they are big, and only replays): trackId -> { t, d: [dist], o: [offset], a: [air] } */
const GHOSTS = "turbodash.ghosts";
export function loadGhost(id) { try { return JSON.parse(localStorage.getItem(GHOSTS) || "{}")[id] || null; } catch (e) { return null; } }
export function saveGhost(id, g) {
  try { const all = JSON.parse(localStorage.getItem(GHOSTS) || "{}"); all[id] = g; localStorage.setItem(GHOSTS, JSON.stringify(all)); } catch (e) { /* full or blocked: ghosts are optional */ }
}
/* The save from just before the last reset/import/cloud load, for "Undo" in Parent Corner. */
function keepBefore() { try { localStorage.setItem(BEFORE, JSON.stringify(S)); } catch (e) { /* ignore */ } }
export const hasBefore = () => { try { return !!localStorage.getItem(BEFORE); } catch (e) { return false; } };
export function restoreBefore() {
  const raw = localStorage.getItem(BEFORE); if (!raw) return false;
  const s = port(JSON.parse(raw)); localStorage.setItem(BEFORE, JSON.stringify(S)); S = s; save(); return true;
}
