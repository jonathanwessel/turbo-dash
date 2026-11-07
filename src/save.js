// Progress lives in this browser's localStorage. Every version must load every older save.
// A second copy (the last save that loaded fine) protects against a bad write; a save code lets a parent
// copy progress to another device or back it up.
const KEY = "turbodash.save", BACKUP = "turbodash.save.backup";
const DEFAULTS = () => ({
  v: 1, coins: 0, owned: ["zippy"], car: "zippy",
  up: { engine: 0, turbo: 0, tires: 0, magnet: 0 },
  best: {},            // trackId -> best place (1 is best)
  races: 0, wins: 0, lastGift: "", giftStreak: 0, lastTrack: "sunny",
  music: true, sfx: true,
  paints: ["stock"], stickers: ["none"], look: {},   // look: carId -> { paint, sticker }
  stats: { roadCoins: 0, stunts: 0, turbos: 0, bams: 0 }, claimed: [],
});

export let S = DEFAULTS();

function merge(d) {
  if (!d || typeof d !== "object" || typeof d.coins !== "number") throw new Error("not a Turbo Dash save");
  const def = DEFAULTS();
  const s = { ...def, ...d, up: { ...def.up, ...(d.up || {}) }, best: { ...(d.best || {}) },
    stats: { ...def.stats, ...(d.stats || {}) }, look: { ...(d.look || {}) } };
  for (const k of ["owned", "paints", "stickers", "claimed"]) if (!Array.isArray(s[k]) || (k !== "claimed" && !s[k].length)) s[k] = def[k];
  return s;
}

export function load() {
  for (const key of [KEY, BACKUP]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      S = merge(JSON.parse(raw));
      localStorage.setItem(BACKUP, raw);
      if (key === BACKUP) save();
      return S;
    } catch (e) { console.warn(`Turbo Dash: could not read ${key}`, e); }
  }
  return S;
}
export function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } }
addEventListener("pagehide", save);
document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });

export function exportSave() { return "TD1-" + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
export function importSave(code) {
  const body = code.trim().replace(/^TD1-/, "");
  const s = merge(JSON.parse(decodeURIComponent(escape(atob(body)))));
  try { localStorage.setItem(BACKUP, JSON.stringify(S)); } catch (e) { /* ignore */ }
  S = s; save();
}
export function resetSave() { try { localStorage.setItem(BACKUP, JSON.stringify(S)); } catch (e) { /* ignore */ } S = DEFAULTS(); save(); }
