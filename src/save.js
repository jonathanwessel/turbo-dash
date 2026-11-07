// Progress lives in this browser's localStorage. Every version must load every older save.
const KEY = "turbodash.save";
const DEFAULTS = () => ({
  v: 1, coins: 0, owned: ["zippy"], car: "zippy",
  up: { engine: 0, turbo: 0, tires: 0, magnet: 0 },
  best: {},            // trackId -> best place (1 is best)
  races: 0, wins: 0, lastGift: "", giftStreak: 0, lastTrack: "sunny",
  music: true, sfx: true,
});

export let S = DEFAULTS();

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw), def = DEFAULTS();
      S = { ...def, ...d, up: { ...def.up, ...(d.up || {}) }, best: { ...(d.best || {}) } };
      if (!Array.isArray(S.owned) || !S.owned.length) S.owned = ["zippy"];
    }
  } catch (e) { console.warn("Turbo Dash: could not read save", e); }
  return S;
}
export function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } }
export function resetSave() { S = DEFAULTS(); save(); }
