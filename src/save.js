// Progress lives in this browser's localStorage. EVERY version must load EVERY older save: port() below checks
// each field, converts old shapes, and repairs anything broken, and scripts/test-saves.mjs proves it for a save
// from every past release (it runs before every `npm run release`).
// A second copy (the last save that loaded fine) protects against a bad write; a save code lets a parent copy
// progress to another device; Google Save (cloud.js) keeps a copy in the parent's Google Drive.
import { CARS, TRACKS, UPGRADES, UPGRADE_MAX, DIFFS, PAINTS, STICKERS, RESEARCH, WORLDS, CUPS, BOSSES, BONUS_TRACKS } from "./data.js";

export const SAVE_VERSION = 22;
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
  stats: { roadCoins: 0, stunts: 0, turbos: 0, bams: 0, powers: 0, rings: 0, pearls: 0, drifts: 0, loops: 0, playMs: 0, coinsEarned: 0 }, claimed: [], world: "earth", bosses: {}, daily: {}, bank: { bal: 0, low: 0, t: 0, paid: 0, news: 0, srv: 0 },
  opened: {},          // trackId -> 1: every track that has opened stays open (seasonal ones too)
  trials: {},          // trackId -> best Time Trial time (seconds)
  seen: {},            // one-time moments already shown (seen.toy: the "game levels up" card)
  days: {},            // "YYYY-MM-DD" -> races that day (last 30 days, for the Progress page)
  dirt: {},            // carId -> 0-5 mud splats (washed off at the Car Wash)
  sparkle: "",         // the day the Car Wash last gave a "sparkly" bonus ("" = none waiting)
  museum: [],          // [{ d: "YYYY-MM-DD" or "", icon, text }] firsts for the Museum, newest first
  opts: { tilt: false, flip: false, fx: "auto" }, // tilt to steer (flip = the tablet reports tilt the other way round); fx: effects
  trialMedals: {},     // trackId -> best medal (1 bronze, 2 silver, 3 gold)
  rank: 1, diff: "normal",
  bestD: {},           // "trackId:difficulty" -> best place
  mastery: {},         // "trackId:difficulty" -> wins there (Track Mastery stars)
  research: {},        // projectId -> level (Turbo Lab)
  lab: { benches: [] }, // [{ p: projectId | null, end: ms timestamp }]
  cups: {},            // "cupId:difficulty" -> best place
  chips: 0, chipLog: {}, // Brain Chips (earned only) and which one-time chip rewards were already given
  parent: { diffs: ["easy", "normal", "hard"], helper: 0, breakMin: 0, volume: 0.8, buzz: true, autoSteer: true, weather: true },  // helper: 0 off, 1 a little, 2 lots
  autoOn: false,
  missions: null, history: [], restUntil: 0,
  cloud: { linked: false },   // Google Save
  // School: Math and Word Laps; each adds a Good Student bonus (earned counts all the +10% steps ever given)
  school: { earned: 0, log: [],
    math: { right: 0, wrong: 0, laps: 0, lv: 1, p: 0 }, mathMax: "10", capT: 6,
    word: { right: 0, wrong: 0, laps: 0, lv: 1, p: 0 }, wordMax: "5", boosts: [] },
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
  s.lastTrack = TRACKS.some(t => t.id === d.lastTrack) || BONUS_TRACKS.some(t => t.id === d.lastTrack) ? d.lastTrack : "sunny";
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
  // v19 (1.6): Piqua National Bank
  s.bank = (b => { const bal = Math.round(num(b.bal, 0, 0)); return { bal, low: Math.round(num(b.low, 0, 0, bal)), t: num(b.t, 0, 0), paid: Math.round(num(b.paid, 0, 0)), news: Math.round(num(b.news, 0, 0)), srv: num(b.srv, 0, 0) }; })(obj(d.bank));
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
    buzz: p.buzz !== false, autoSteer: p.autoSteer !== false, weather: p.weather !== false,
  };
  // v22 (1.9.1): tracks stay open once opened. Haunted Hill became a seasonal track (it opened after Pirate Port
  // before), so a save from before keeps it if it was open under the old rule or has a result on it.
  s.opened = Object.fromEntries(Object.keys(obj(d.opened)).filter(id => TRACKS.some(t => t.id === id)).map(id => [id, 1]));
  if (num(d.v, 0) < 22) {
    const won = df => s.bestD["pirate:" + df] === 1, easyOnly = !s.parent.diffs.includes("normal") && !s.parent.diffs.includes("hard");
    if (won("normal") || won("hard") || (easyOnly && won("easy")) || s.best.haunted) s.opened.haunted = 1;
  }
  // v15 (1.0): Progress page, Car Wash, Museum, tilt steering
  const isDay = k => /^\d{4}-\d{2}-\d{2}$/.test(k);
  s.days = Object.fromEntries(Object.entries(obj(d.days)).filter(([k, v]) => isDay(k) && typeof v === "number" && v >= 0).sort(([a], [b]) => a < b ? 1 : -1).slice(0, 30).map(([k, v]) => [k, Math.round(v)]));
  s.dirt = Object.fromEntries(Object.entries(obj(d.dirt)).filter(([k]) => carIds.has(k)).map(([k, v]) => [k, Math.round(num(v, 0, 0, 5))]).filter(([, v]) => v > 0));
  s.sparkle = typeof d.sparkle === "string" && isDay(d.sparkle) ? d.sparkle : "";
  s.opts = { tilt: obj(d.opts).tilt === true, flip: obj(d.opts).flip === true, fx: ["auto", "full", "simple"].includes(obj(d.opts).fx) ? d.opts.fx : "auto" };
  const mus = arr(d.museum).filter(e => e && typeof e === "object" && typeof e.text === "string" && typeof e.icon === "string").slice(0, 200)
    .map(e => ({ d: typeof e.d === "string" && isDay(e.d) ? e.d : "", icon: e.icon.slice(0, 8), text: e.text.slice(0, 80) }));
  if (!Array.isArray(d.museum)) {
    // an older save: start the Museum from what was already won (no dates for those)
    for (const t of TRACKS) if (s.best?.[t.id] === 1) mus.push({ d: "", icon: t.icon, text: `First win on ${t.name}` });
    for (const c of CUPS) if (["easy", "normal", "hard"].some(df => s.cups?.[c.id + ":" + df] === 1)) mus.push({ d: "", icon: "🏆", text: `Won the ${c.name}` });
    for (const b of BOSSES) if (s.bosses?.[b.id]) mus.push({ d: "", icon: b.icon, text: `Beat ${b.name}` });
  }
  s.museum = mus;
  if (!Array.isArray(d.museum)) {
    for (const t of TRACKS) if (t.world !== "earth" && s.best?.[t.id]) s.seen["w:" + t.world] = true;
    const ds = obj(d.stats);
    if (typeof ds.playMs !== "number") s.stats.playMs = Math.round((s.races || 0) * 75000);   // about 75 s a race
    if (typeof ds.coinsEarned !== "number") s.stats.coinsEarned = Math.max(s.coins || 0, s.stats.roadCoins || 0);
  }
  const M = obj(d.missions);
  const KINDS = ["races", "wins", "podium", "coins", "jumps", "powers", "bams", "track"], fin = v => typeof v === "number" && Number.isFinite(v);
  const okM = m => m && typeof m === "object" && KINDS.includes(m.kind) && fin(m.goal) && m.goal > 0 && fin(m.have) && fin(m.reward) && m.reward >= 0 && (m.kind !== "track" || TRACKS.some(t => t.id === m.track));
  s.missions = typeof M.day === "string" && Array.isArray(M.list) && M.list.length && M.list.every(okM) ? { ...M, list: M.list.map(m => ({ ...m, claimed: m.claimed === true })) } : null;
  // each race history row is checked field by field (Parent Corner shows them)
  s.history = arr(d.history).filter(h => h && typeof h === "object" && typeof h.d === "string" && isDay(h.d) && typeof h.t === "string" && typeof h.df === "string"
    && Number.isInteger(h.p) && h.p >= 1 && h.p <= 6 && typeof h.c === "number" && Number.isFinite(h.c)).map(h => ({ d: h.d, t: h.t, df: h.df, p: h.p, c: Math.round(h.c) })).slice(0, 30);
  s.cloud = { linked: obj(d.cloud).linked === true };
  // v20 (1.8) dropped lessons and tickets, v21 (1.9) the last of their fields: tickets, skills, readingDouble, capMin
  const sc = obj(d.school), soon = Date.now() + 30 * 60000;
  s.school = {
    earned: Math.round(num(sc.earned, 0, 0)),
    // v20 (1.8): Good Student bonuses still running ({ p: percent, until: ms }); never more than 30 minutes out
    boosts: arr(sc.boosts).filter(b => b && Number.isFinite(b.p) && b.p > 0 && b.p <= 100 && Number.isFinite(b.until) && b.until > 0).map(b => ({ p: Math.round(b.p), until: Math.min(b.until, soon) })).slice(-20),
    log: arr(sc.log).filter(e => e && typeof e === "object" && typeof e.a === "string").slice(0, 60),
    // v16 (1.1): Math School
    math: (m => ({ right: Math.round(num(m.right, 0, 0)), wrong: Math.round(num(m.wrong, 0, 0)), laps: Math.round(num(m.laps, 0, 0)), lv: Math.round(num(m.lv, 1, 1, 4)), p: Math.round(num(m.p, 0, 0, 9)) }))(obj(sc.math)),
    mathMax: ["add10", "10", "20"].includes(sc.mathMax) ? sc.mathMax : "10",
    capT: [3, 6, 10, 0].includes(sc.capT) ? sc.capT : 6,
    // v18 (1.5): Word Laps at the Library
    word: (m => ({ right: Math.round(num(m.right, 0, 0)), wrong: Math.round(num(m.wrong, 0, 0)), laps: Math.round(num(m.laps, 0, 0)), lv: Math.round(num(m.lv, 1, 1, 4)), p: Math.round(num(m.p, 0, 0, 9)) }))(obj(sc.word)),
    wordMax: ["3", "4", "5"].includes(sc.wordMax) ? sc.wordMax : "5",
  };
  s.v = SAVE_VERSION;
  return s;
}

/* This car's upgrade levels (created at 0 the first time). */
export function upsOf(carId) { return S.ups[carId] || (S.ups[carId] = { ...NO_UPS }); }

/* Reads the save; the backup is used only when the main save is missing or can't be read. Writing the backup copy
   is a separate step, so a full or blocked storage can never make the game load the older backup (and then save
   over the good one). */
export function load() {
  const read = key => { try { const raw = localStorage.getItem(key); return raw ? { raw, s: port(JSON.parse(raw)) } : null; } catch (e) { console.warn(`Turbo Dash: could not read ${key}`, e); return null; } };
  const main = read(KEY), got = main || read(BACKUP);
  if (!got) return S;
  S = got.s;
  if (main) { try { localStorage.setItem(BACKUP, main.raw); } catch (e) { /* no room for a backup copy: the main save is still fine */ } }
  else save();   // the main save was broken: put the backup back in its place
  return S;
}
let onSaved = null, onSaveFail = null;
export const whenSaved = fn => { onSaved = fn; };
export const whenSaveFails = fn => { onSaveFail = fn; };
/* Writes the save. If storage is full, the backup copy is dropped to make room and the write is tried once more. */
export function save() {
  S.savedAt = Date.now();
  const body = JSON.stringify(S);
  try { localStorage.setItem(KEY, body); }
  catch (e) {
    try { localStorage.removeItem(BACKUP); localStorage.setItem(KEY, body); }
    catch (e2) { onSaveFail?.(e2); }
  }
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
