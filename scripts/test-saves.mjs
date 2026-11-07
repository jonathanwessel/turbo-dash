// Save test: a save from EVERY past release must load into the current version with nothing lost.
//   npm test        (also runs automatically before `npm run release`)
// Add a new fixture here whenever a release changes what the save looks like.

// the save module touches a few browser globals; give it a tiny stand-in
const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
globalThis.addEventListener = () => {};
globalThis.document = { addEventListener() {}, hidden: false };

const { load, port, exportSave, importSave, SAVE_VERSION } = await import("../src/save.js");
const saveMod = await import("../src/save.js");
const { CARS, FRONTS, GOALS, UPGRADES, UPGRADE_MAX } = await import("../src/data.js");

// One save per release that changed the save, shaped exactly like that release wrote it, with real progress in it.
const base01 = { v: 1, coins: 420, owned: ["zippy", "bolt"], car: "bolt", up: { engine: 2, turbo: 1, tires: 0, magnet: 1 }, best: { sunny: 1, desert: 2 }, races: 12, wins: 7, lastGift: "2026-11-06", giftStreak: 1, lastTrack: "desert", music: true, sfx: false };
const FIXTURES = {
  "v0.1.0 / v0.3.0 (one set of upgrades, best per track)": base01,
  "v0.4.0 (paint, goals, stats)": { ...base01, paints: ["stock", "rainbow"], stickers: ["none", "flames"], look: { bolt: { paint: "rainbow", sticker: "flames" } }, stats: { roadCoins: 300, stunts: 12, turbos: 9, bams: 2 }, claimed: ["win1"] },
  "v0.4.2 (upgrades per car)": { ...base01, up: undefined, ups: { zippy: { engine: 3, turbo: 2, tires: 1, magnet: 0 }, bolt: { engine: 1, turbo: 0, tires: 0, magnet: 0 } }, paints: ["stock"], stickers: ["none"], look: {}, stats: { roadCoins: 300, stunts: 12, turbos: 9, bams: 2 }, claimed: [] },
  "v0.5.0 (rank, difficulty, parent)": { v: 1, coins: 3000, owned: ["zippy", "bolt", "monster"], car: "monster", ups: { monster: { engine: 2, turbo: 2, tires: 2, magnet: 0 } }, best: { sunny: 1, desert: 1, snow: 3 }, races: 40, wins: 22, rank: 3, diff: "hard", bestD: { "sunny:normal": 1, "desert:normal": 1, "snow:normal": 3, "sunny:hard": 2 }, research: {}, parent: { diffs: ["normal", "hard"], helper: 1 }, paints: ["stock"], stickers: ["none"], look: {}, stats: { roadCoins: 900, stunts: 40, turbos: 30, bams: 8 }, claimed: ["win1", "car2"], lastGift: "2026-11-07", giftStreak: 2, lastTrack: "snow", music: true, sfx: true },
  "v0.6.0 (Turbo Lab)": { v: 1, coins: 5200, owned: ["zippy", "bolt"], car: "bolt", ups: { bolt: { engine: 4, turbo: 3, tires: 2, magnet: 1 } }, best: { sunny: 1 }, bestD: { "sunny:normal": 1 }, rank: 4, research: { coinBoost: 3, headStart: 1 }, lab: { benches: [{ p: "pitCrew", end: Date.now() + 60000 }, { p: null, end: 0 }] }, races: 60, wins: 30, stats: { roadCoins: 1200 }, claimed: [] },
  "v0.7.0 (cups, Brain Chips)": { v: 1, coins: 9000, owned: ["zippy", "bolt", "monster", "greenMachine"], car: "greenMachine", ups: {}, best: { sunny: 1, desert: 1, snow: 1 }, bestD: { "sunny:easy": 1, "desert:normal": 1 }, rank: 5, cups: { "green:easy": 1 }, chips: 2, chipLog: { "cup:green:easy": 1, "rank:5": 1 }, research: {}, lab: { benches: [] }, races: 90, wins: 50 },
  "v0.9.0 (missions, history, parent+)": { v: 1, coins: 12000, owned: ["zippy", "shark"], car: "shark", ups: { shark: { engine: 1, turbo: 1, tires: 1, magnet: 1 } }, rank: 7, best: { sunny: 1 }, bestD: { "sunny:normal": 1 }, missions: { day: "2026-11-07", list: [{ kind: "races", goal: 3, have: 1, claimed: false, reward: 275 }], bonus: false }, history: [{ d: "2026-11-07", t: "sunny", df: "normal", p: 1, c: 300 }], restUntil: 0, parent: { diffs: ["easy", "normal", "hard"], helper: 0, breakMin: 30, volume: 0.5, buzz: false }, stats: { roadCoins: 3000, stunts: 100, turbos: 80, bams: 20, powers: 15 } },
  "v0.11.0 (Auto Steer)": { v: 1, coins: 70000, owned: ["zippy", "galaxy"], car: "galaxy", ups: { galaxy: { engine: 5, turbo: 5, tires: 5, magnet: 5 } }, rank: 10, research: { rbEyes: 1, rbEars: 1, rbMap: 1, rbReflex: 1, rbSocket: 1, autoSteer: 1 }, autoOn: true, parent: { diffs: ["normal"], helper: 0, breakMin: 0, volume: 0.8, buzz: true, autoSteer: false }, chips: 4, best: {}, bestD: {} },
  "v0.13 (settings, mastery, cloud)": { v: 12, savedAt: 1794000000000, coins: 4200, owned: ["zippy", "bolt"], car: "bolt", ups: { zippy: { engine: 1, turbo: 0, tires: 0, magnet: 0 }, bolt: { engine: 2, turbo: 1, tires: 1, magnet: 0 } }, best: { sunny: 1, beach: 2 }, bestD: { "sunny:normal": 1, "beach:normal": 2, "sunny:easy": 1 }, mastery: { "sunny:normal": 4, "sunny:easy": 1 }, rank: 3, cloud: { linked: true }, research: { coinBoost: 2 }, lab: { benches: [{ p: null, end: 0 }] }, stats: { roadCoins: 400, stunts: 30, turbos: 12, bams: 2, powers: 5 } },
  "v0.14 (Driver School)": { v: 12, coins: 900, owned: ["zippy", "patrol"], car: "patrol", ups: {}, school: { tickets: 7, earned: 31, skills: { focus: 3, reflex: 2, courage: 1, smarts: 0 }, log: [{ d: "2026-11-08", a: "read", m: 20, t: 4 }], readingDouble: false, capMin: 60 }, parent: { diffs: ["normal"], license: false } },
  "v0.15 (moon, rings)": { v: 12, coins: 80000, owned: ["zippy", "galaxy", "rover"], car: "rover", ups: { rover: { engine: 2, turbo: 1, tires: 1, magnet: 0 } }, rank: 21, world: "moon", research: { moonTires: 1, thrusters: 2 }, best: { crater: 1 }, bestD: { "crater:normal": 1 }, stats: { roadCoins: 9000, stunts: 400, turbos: 300, bams: 50, powers: 80, rings: 12 } },
  "v0.16 (bosses, daily treats)": { v: 12, coins: 5000, owned: ["zippy", "thunder", "firetruck"], car: "thunder", ups: {}, rank: 16, bosses: { bruno: true }, daily: { icecream: "2026-11-07" } },
  "v0.17 (deep blue, time trials)": { v: 13, coins: 150000, owned: ["zippy", "rover", "sub"], car: "sub", ups: { sub: { engine: 1, turbo: 0, tires: 0, magnet: 0 } }, rank: 26, world: "ocean", research: { moonTires: 1, snorkel: 1, propellers: 2 }, best: { kelp: 1 }, bestD: { "kelp:normal": 1 }, stats: { roadCoins: 20000, stunts: 900, turbos: 500, bams: 90, powers: 120, rings: 40, pearls: 77 }, trials: { sunny: 61.42, kelp: 80.1 }, trialMedals: { sunny: 3, kelp: 1 } },
  "v0.18 (glacier rink, drifts)": { v: 14, coins: 240000, owned: ["zippy", "sub", "frost"], car: "frost", ups: { frost: { engine: 2, turbo: 1, tires: 1, magnet: 0 } }, rank: 31, world: "glacier", research: { moonTires: 1, snorkel: 1, iceStuds: 1, snowChains: 2 }, best: { icecave: 1 }, bestD: { "icecave:normal": 1 }, stats: { roadCoins: 900, stunts: 40, turbos: 60, bams: 3, powers: 20, rings: 30, pearls: 55, drifts: 12 }, trials: { icecave: 61.5 }, trialMedals: { icecave: 2 } },
  "v0.19 (toy track world)": { v: 14, coins: 410000, owned: ["zippy", "frost", "toyRacer"], car: "toyRacer", ups: { toyRacer: { engine: 1, turbo: 1, tires: 0, magnet: 0 } }, rank: 36, world: "toy", research: { iceStuds: 1, shrinkRay: 1, loopGrip: 1 }, best: { bedroom: 1 }, bestD: { "bedroom:normal": 1 }, stats: { roadCoins: 1200, stunts: 60, turbos: 80, bams: 5, powers: 30, rings: 30, pearls: 55, drifts: 70, loops: 14 }, seen: { toy: true }, trials: { bedroom: 28.4 }, trialMedals: { bedroom: 2 } },
  "damaged save (wrong types, unknown ids)": { coins: "1500", owned: "zippy", car: "flyingCar", ups: { zippy: { engine: 99, turbo: -3, tires: "x" } }, best: { sunny: 0, desert: 7, snow: 2 }, rank: -2, diff: "insane", research: { coinBoost: 3.7, nope: 5 }, lab: { benches: [{ p: "gone", end: "soon" }, null] }, parent: null, missions: { day: 5 }, history: "lots", look: { zippy: { paint: "unpaid", sticker: null } } },
};

let failed = 0;
const check = (name, ok, msg) => { if (!ok) { failed++; console.log(`  ✖ ${name}: ${msg}`); } };

for (const [name, raw] of Object.entries(FIXTURES)) {
  store.clear();
  store.set("turbodash.save", JSON.stringify(raw));
  let S;
  try { load(); S = saveMod.S; } catch (e) { check(name, false, "load threw " + e.message); continue; }
  const n = s => Number(s);
  check(name, S.v === SAVE_VERSION, "version not updated");
  check(name, S.coins === Math.max(0, Math.round(n(raw.coins) || 0)), `coins ${S.coins} vs ${raw.coins}`);
  check(name, S.owned.includes("zippy"), "lost Zippy");
  for (const id of Array.isArray(raw.owned) ? raw.owned : []) check(name, S.owned.includes(id), `lost car ${id}`);
  check(name, S.owned.includes(S.car) && CARS.some(c => c.id === S.car), `driving a car that isn't owned/known: ${S.car}`);
  for (const id of S.owned) {
    const u = S.ups[id];
    check(name, u && UPGRADES.every(x => Number.isInteger(u[x.id]) && u[x.id] >= 0 && u[x.id] <= UPGRADE_MAX), `bad upgrades on ${id}: ${JSON.stringify(u)}`);
  }
  if (raw.up && !raw.ups) for (const id of raw.owned) for (const x of UPGRADES) check(name, S.ups[id][x.id] === (raw.up[x.id] || 0), `old upgrade ${x.id} not carried to ${id}`);
  if (raw.ups) for (const [id, u] of Object.entries(raw.ups)) for (const x of UPGRADES) if (typeof u[x.id] === "number" && u[x.id] >= 0 && u[x.id] <= UPGRADE_MAX) check(name, S.ups[id][x.id] === u[x.id], `upgrade ${id}.${x.id} changed`);
  for (const [id, p] of Object.entries(raw.best || {})) if (p >= 1 && p <= 6) { check(name, S.best[id] <= p, `best on ${id} lost`); if (!raw.bestD) check(name, S.bestD[id + ":normal"] === p, `best on ${id} not ported to Normal`); }
  for (const [k, p] of Object.entries(raw.bestD || {})) check(name, S.bestD[k] === p, `medal ${k} lost`);
  for (const [k, p] of Object.entries(raw.cups || {})) check(name, S.cups[k] === p, `cup ${k} lost`);
  for (const [k, v] of Object.entries(raw.research || {})) if (Number.isFinite(v)) check(name, S.research[k] === Math.round(Math.min(100, v)), `research ${k} lost`);
  for (const id of raw.claimed || []) check(name, S.claimed.includes(id), `claimed goal ${id} lost`);
  if (typeof raw.chips === "number") check(name, S.chips === raw.chips, "Brain Chips lost");
  if (Number.isFinite(raw.rank)) check(name, S.rank === Math.max(1, raw.rank), "rank lost");
  for (const k of ["stunts", "turbos", "bams", "roadCoins"]) if (raw.stats && typeof raw.stats[k] === "number") check(name, S.stats[k] === raw.stats[k], `stat ${k} lost`);
  if (raw.mastery) for (const [k, v] of Object.entries(raw.mastery)) check(name, S.mastery[k] === v, `mastery ${k} lost`);
  if (raw.school) { check(name, S.school.tickets === raw.school.tickets && S.school.earned === raw.school.earned, "tickets lost"); for (const [k, v] of Object.entries(raw.school.skills)) check(name, S.school.skills[k] === v, `skill ${k} lost`); check(name, S.school.log.length === raw.school.log.length, "activity log lost"); check(name, S.school.readingDouble === raw.school.readingDouble, "reading setting lost"); }
  if (raw.parent && raw.parent.license === false) check(name, S.parent.license === false, "license gauge setting lost");
  if (raw.bosses) check(name, Object.keys(raw.bosses).every(k => S.bosses[k]), "boss wins lost");
  if (raw.daily) check(name, Object.entries(raw.daily).every(([k, v]) => S.daily[k] === v), "daily treats lost");
  if (raw.world) check(name, S.world === raw.world, "world choice lost");
  if (raw.trials) check(name, Object.entries(raw.trials).every(([k, v]) => S.trials[k] === v), "trial times lost");
  if (raw.trialMedals) check(name, Object.entries(raw.trialMedals).every(([k, v]) => S.trialMedals[k] === v), "trial medals lost");
  if (raw.stats?.pearls) check(name, S.stats.pearls === raw.stats.pearls, "pearl count lost");
  if (raw.stats?.loops) check(name, S.stats.loops === raw.stats.loops, "loop count lost");
  if (raw.seen) check(name, Object.keys(raw.seen).every(k => S.seen[k] === true), "seen moments lost");
  if (raw.stats?.drifts) check(name, S.stats.drifts === raw.stats.drifts, "drift count lost");
  if (raw.stats?.rings) check(name, S.stats.rings === raw.stats.rings, "ring count lost");
  check(name, S.school && Number.isInteger(S.school.tickets) && typeof S.school.skills === "object", "school data broken");
  check(name, Array.isArray(S.lab.benches) && S.lab.benches.every(b => b.p === null || typeof b.p === "string"), "bad lab benches");
  check(name, Array.isArray(S.parent.diffs) && S.parent.diffs.length > 0, "no allowed difficulty");
  check(name, Array.isArray(S.history) && Array.isArray(S.claimed) && Array.isArray(S.paints), "lists broken");
  for (const f of FRONTS) { let v; try { v = f.have(S); } catch (e) { v = NaN; } check(name, Number.isFinite(v), `rank gauge ${f.id} broken`); }
  for (const g of GOALS) { let v; try { v = g.have(S); } catch (e) { v = NaN; } check(name, Number.isFinite(v), `goal ${g.id} broken`); }
  // a save code made from it must load back identically
  const before = JSON.stringify({ ...S, savedAt: 0 }), code = exportSave();
  try { importSave(code); } catch (e) { check(name, false, "save code didn't load: " + e.message); }
  check(name, JSON.stringify({ ...saveMod.S, savedAt: 0 }) === before, "save code round trip changed the save");
  // porting twice changes nothing
  check(name, JSON.stringify({ ...port(saveMod.S), savedAt: 0 }) === JSON.stringify({ ...saveMod.S, savedAt: 0 }), "porting a current save changed it");
  console.log(`  ${failed ? "…" : "✔"} ${name}`);
}

// a broken main save must fall back to the backup, never to an empty game
store.clear(); store.set("turbodash.save", "{oops"); store.set("turbodash.save.backup", JSON.stringify(base01));
load(); check("broken main save", saveMod.S.coins === base01.coins, "did not fall back to the backup copy");

console.log(failed ? `\n${failed} save check(s) FAILED` : `\nAll ${Object.keys(FIXTURES).length + 1} save checks passed`);
process.exit(failed ? 1 : 0);
