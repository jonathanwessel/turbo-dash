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
  "v0.22 (name, growing town)": { v: 14, name: "Carter", coins: 1171, owned: ["zippy", "bolt"], car: "bolt", ups: { bolt: { engine: 1, turbo: 0, tires: 0, magnet: 0 } }, rank: 3, best: { sunny: 1, beach: 2 }, bestD: { "sunny:normal": 1, "beach:normal": 2 }, cups: { "green:easy": 1 }, bosses: {}, stats: { roadCoins: 400, stunts: 9, turbos: 12, bams: 1, powers: 3, rings: 0, pearls: 0, drifts: 0, loops: 0 } },
  "v1.0 (progress, car wash, museum)": { v: 15, name: "Carter", coins: 2500, owned: ["zippy"], rank: 4, best: { sunny: 1 }, bestD: { "sunny:normal": 1 }, stats: { roadCoins: 500, stunts: 10, turbos: 10, bams: 0, powers: 2, rings: 0, pearls: 0, drifts: 0, loops: 0, playMs: 3600000, coinsEarned: 9000 }, days: { "2026-11-07": 12, "2026-11-06": 8 }, dirt: { zippy: 3 }, sparkle: "2026-11-07", museum: [{ d: "2026-11-07", icon: "🏆", text: "First win on Sunny Hills" }], opts: { tilt: true }, parent: { diffs: ["easy", "normal"], weather: false } },
  "damaged missions (null entry, unknown kind, no reward)": { v: 14, coins: 777, owned: ["zippy"], rank: 8, missions: { day: "2026-11-07", list: [null, { kind: "fly", goal: 3, have: 0, reward: 100 }, { kind: "wins", goal: 2, have: 1 }] } },
  "v1.1 (math school)": { v: 16, name: "Carter", coins: 800, owned: ["zippy"], rank: 3, school: { tickets: 4, earned: 9, skills: { focus: 2, reflex: 0, courage: 0, smarts: 0 }, log: [{ d: "2026-11-08", a: "math", m: 15, t: 4 }, { d: "2026-11-01", a: "read", m: 20, t: 4 }], readingDouble: true, capMin: 0, math: { right: 40, wrong: 6, laps: 9, lv: 3, p: 1 }, mathMax: "20", capT: 10 } },
  "v1.2 (effects setting)": { v: 17, name: "Carter", coins: 500, owned: ["zippy"], rank: 3, opts: { tilt: false, flip: false, fx: "simple" } },
  "v1.6 (bank)": { v: 19, name: "Carter", coins: 640, owned: ["zippy"], rank: 6, bank: { bal: 1284, low: 1200, t: 1794100000000, paid: 84, news: 84 } },
  "v1.5 (word laps)": { v: 18, name: "Carter", coins: 700, owned: ["zippy"], rank: 4, school: { tickets: 3, earned: 12, skills: { focus: 2, reflex: 1, courage: 0, smarts: 0 }, log: [{ d: "2026-11-08", a: "word", m: 10, t: 3 }, { d: "2026-11-08", a: "math", m: 5, t: 2 }], readingDouble: true, capMin: 0, math: { right: 30, wrong: 4, laps: 7, lv: 3, p: 0 }, mathMax: "10", capT: 6, word: { right: 18, wrong: 3, laps: 4, lv: 2, p: 1 }, wordMax: "4" } },
  "v1.8 (good student bonus)": { v: 20, name: "Carter", coins: 900, owned: ["zippy", "patrol"], rank: 6, school: { tickets: 0, earned: 14, skills: { focus: 0, reflex: 0, courage: 0, smarts: 0 }, log: [{ d: "2026-11-09", a: "math", m: 10, t: 3 }], readingDouble: true, capMin: 0, math: { right: 40, wrong: 3, laps: 12, lv: 3, p: 0 }, mathMax: "10", capT: 6, word: { right: 30, wrong: 2, laps: 9, lv: 2, p: 1 }, wordMax: "5", boosts: [{ p: 20, until: 1794200000000 }, { p: 10, until: 1794200500000 }] } },
  "v1.9 (more earth, bonus from a wrong clock)": { v: 21, name: "Carter", coins: 1200, owned: ["zippy", "bolt"], rank: 7, best: { fair: 1, haunted: 2 }, bestD: { "fair:normal": 1, "haunted:normal": 2 }, school: { earned: 20, log: [{ d: "2026-11-10", a: "word", m: 10, t: 2 }], math: { right: 50, wrong: 4, laps: 14, lv: 3, p: 0 }, mathMax: "10", capT: 6, word: { right: 40, wrong: 2, laps: 11, lv: 2, p: 1 }, wordMax: "5", boosts: [{ p: 20, until: 9e15 }] } },
  "v1.9.1 (tracks stay open, seasonal Haunted Hill, bank server time)": { v: 22, name: "Carter", coins: 1500, owned: ["zippy", "bolt"], rank: 7, best: { fair: 1 }, bestD: { "fair:normal": 1 }, opened: { beach: 1, haunted: 1, nope: 1 }, bank: { bal: 500, low: 500, t: 1794100000000, paid: 0, news: 0, srv: 1794150000000 }, history: [{ d: "2026-11-09", t: "fair", df: "normal", p: 1, c: 400 }, { d: "<b>x</b>", t: "sunny", df: "normal", p: 1, c: 5 }, { d: "2026-11-09", t: "sunny", df: "normal", p: "1", c: 5 }] },
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
  if (raw.bank) check(name, Object.entries(raw.bank).every(([k, v]) => S.bank[k] === v) && Number.isFinite(S.bank.srv), "bank lost");
  if (raw.school) { // v20 (1.8) reset lessons and tickets; v21 (1.9) drops those fields from every save
    check(name, !("tickets" in S.school) && !("skills" in S.school) && !("readingDouble" in S.school) && !("capMin" in S.school), "old lesson fields should be gone");
    check(name, S.school.earned === raw.school.earned, "earned count lost"); check(name, S.school.log.length === raw.school.log.length, "activity log lost"); if (raw.school.math) check(name, JSON.stringify(S.school.math) === JSON.stringify(raw.school.math) && S.school.mathMax === raw.school.mathMax && S.school.capT === raw.school.capT, "math school progress lost"); if (raw.school.word) check(name, JSON.stringify(S.school.word) === JSON.stringify(raw.school.word) && S.school.wordMax === raw.school.wordMax, "word lap progress lost"); }
  check(name, !("license" in S.parent), "the old License gauge switch should be gone");
  if (raw.bosses) check(name, Object.keys(raw.bosses).every(k => S.bosses[k]), "boss wins lost");
  if (raw.daily) check(name, Object.entries(raw.daily).every(([k, v]) => S.daily[k] === v), "daily treats lost");
  if (raw.world) check(name, S.world === raw.world, "world choice lost");
  if (raw.trials) check(name, Object.entries(raw.trials).every(([k, v]) => S.trials[k] === v), "trial times lost");
  if (raw.trialMedals) check(name, Object.entries(raw.trialMedals).every(([k, v]) => S.trialMedals[k] === v), "trial medals lost");
  if (raw.stats?.pearls) check(name, S.stats.pearls === raw.stats.pearls, "pearl count lost");
  if (name.startsWith("damaged missions")) check(name, S.missions === null && S.coins === 777, "broken missions were kept (they crash the result screen)");
  if (raw.name) check(name, S.name === raw.name, "player name lost");
  if (raw.stats?.playMs) check(name, S.stats.playMs === raw.stats.playMs && S.stats.coinsEarned === raw.stats.coinsEarned, "play time / coins earned lost");
  if (raw.days) check(name, Object.entries(raw.days).every(([k, v]) => S.days[k] === v), "races per day lost");
  if (raw.dirt) check(name, Object.entries(raw.dirt).every(([k, v]) => S.dirt[k] === v), "car dirt lost");
  if (raw.museum) check(name, S.museum.length === raw.museum.length && S.museum[0].text === raw.museum[0].text, "museum lost");
  if (raw.opts) check(name, S.opts.tilt === raw.opts.tilt, "tilt setting lost");
  if (raw.parent?.weather === false) check(name, S.parent.weather === false, "weather setting lost");
  if (name.startsWith("v0.22")) check(name, S.museum.some(e => /Sunny Hills/.test(e.text)) && S.museum.some(e => /Green Cup/.test(e.text)) && !S.museum.some(e => /Beach/.test(e.text)), "older save didn't seed the Museum from its wins");
  if (raw.stats?.loops) check(name, S.stats.loops === raw.stats.loops, "loop count lost");
  if (raw.seen) check(name, Object.keys(raw.seen).every(k => S.seen[k] === true), "seen moments lost");
  if (raw.stats?.drifts) check(name, S.stats.drifts === raw.stats.drifts, "drift count lost");
  if (raw.stats?.rings) check(name, S.stats.rings === raw.stats.rings, "ring count lost");
  check(name, S.school && Number.isInteger(S.school.earned) && S.school.math.lv >= 1 && S.school.math.lv <= 4 && ["add10", "10", "20"].includes(S.school.mathMax) && S.school.word.lv >= 1 && S.school.word.lv <= 4 && ["3", "4", "5"].includes(S.school.wordMax), "school data broken");
  if (raw.school?.boosts) check(name, S.school.boosts.length === raw.school.boosts.length && S.school.boosts.every((b, k) => b.p === raw.school.boosts[k].p && b.until === Math.min(raw.school.boosts[k].until, b.until)), "Good Student bonuses lost");
  check(name, S.school.boosts.every(b => b.until <= Date.now() + 30 * 60000 + 1000), "a bonus lasts longer than 30 minutes (wrong device clock)");
  check(name, Array.isArray(S.school.boosts), "no Good Student bonus list");
  check(name, S.bank && Number.isInteger(S.bank.bal) && S.bank.bal >= 0 && S.bank.low <= S.bank.bal, "bank data broken");
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
  check(name, ["auto", "full", "simple"].includes(S.opts.fx) && (raw.opts?.fx ? S.opts.fx === raw.opts.fx : S.opts.fx === "auto"), "effects setting lost or bad");
  console.log(`  ${failed ? "…" : "✔"} ${name}`);
}

// Math Laps: every question has a whole, non-negative answer within its level, and the four choices include it
{
  const { mathQuestion, mathChoices } = await import("../src/data.js");
  const top = [0, 5, 10, 10, 20];
  for (let lv = 1; lv <= 4; lv++) for (let i = 0; i < 3000; i++) {
    const q = mathQuestion(lv), c = mathChoices(q.ans);
    const ok = Number.isInteger(q.a) && Number.isInteger(q.b) && q.a >= 0 && q.b >= 1 && q.ans >= 0 && q.ans === (q.op === "+" ? q.a + q.b : q.a - q.b)
      && (q.op === "+" ? q.ans <= top[lv] : q.a <= top[lv]) && (lv >= 3 || q.op === "+");
    if (!ok) { check("math level " + lv, false, JSON.stringify(q)); break; }
    if (c.length !== 4 || new Set(c).size !== 4 || !c.includes(q.ans) || c.some(n => n < 0)) { check("math choices", false, JSON.stringify([q, c])); break; }
  }
}
// a grown-up who allows only Easy must still be able to open tracks (Easy wins count then)
{
  const { trackOpen, TRACKS } = await import("../src/data.js");
  const beach = TRACKS.find(t => t.id === "beach");
  const st = { rank: 1, best: {}, bestD: { "sunny:easy": 1 }, research: {}, parent: { diffs: ["easy"] } };
  check("easy-only unlocks", trackOpen(st, beach), "an Easy win doesn't open the next track when only Easy is allowed");
  check("normal still needed", !trackOpen({ ...st, parent: { diffs: ["easy", "normal"] } }, beach), "an Easy win opened a track while Normal is allowed");
}

// Easy + Hard allowed while Hard is still rank-locked: Easy is all he can pick, so Easy wins open tracks (v1.9.1)
{
  const { trackOpen, TRACKS } = await import("../src/data.js");
  const beach = TRACKS.find(t => t.id === "beach"), st = { rank: 2, best: {}, bestD: { "sunny:easy": 1 }, research: {}, parent: { diffs: ["easy", "hard"] } };
  check("easy + locked hard", trackOpen(st, beach), "an Easy win doesn't open the next track when Hard is still locked");
  check("easy + open hard", !trackOpen({ ...st, rank: 3 }, beach), "an Easy win opened a track once Hard could be picked");
  const { keepOpens } = await import("../src/rules.js"), kept = { ...st, opened: {} }; keepOpens(kept); kept.rank = 3;
  check("opened stays open", trackOpen(kept, beach), "a track opened by an Easy win closed again when Hard unlocked");
}
// 🍂 Haunted Hill became seasonal: a save from before keeps it if it was open then; a newer save needs the season
{
  const { trackOpen, TRACKS } = await import("../src/data.js"), haunted = TRACKS.find(t => t.id === "haunted");
  const try1 = raw => { store.clear(); store.set("turbodash.save", JSON.stringify(raw)); load(); return trackOpen(saveMod.S, haunted); };
  check("haunted: old save, pirate won", try1({ v: 21, coins: 5, best: { pirate: 1 }, bestD: { "pirate:normal": 1 } }), "lost Haunted Hill after a Pirate Port win");
  check("haunted: old save, raced on it", try1({ v: 21, coins: 5, best: { haunted: 3 }, bestD: { "haunted:easy": 3 } }), "lost Haunted Hill after racing on it");
  check("haunted: old save, not open", !try1({ v: 21, coins: 5, best: { desert: 1 }, bestD: { "desert:normal": 1 } }), "Haunted Hill opened for a save that never had it");
  check("haunted: new save, pirate won", !try1({ v: 22, coins: 5, best: { pirate: 1 }, bestD: { "pirate:normal": 1 } }), "Haunted Hill opened outside its season");
  check("haunted: new save, opened", try1({ v: 22, coins: 5, opened: { haunted: 1 } }), "an opened seasonal track closed");
  check("opened: unknown ids dropped", !("nope" in port({ coins: 1, opened: { nope: 1, sunny: 1 } }).opened), "an unknown track id was kept in opened");
}
// history rows are checked field by field (Parent Corner shows them)
{
  const h = port({ coins: 1, history: [{ d: "2026-11-09", t: "fair", df: "normal", p: 1, c: 400 }, { d: "<img src=x>", t: "sunny", df: "normal", p: 1, c: 5 }, { d: "2026-11-09", t: 5, df: "normal", p: 1, c: 5 }, { d: "2026-11-09", t: "sunny", df: "normal", p: 9, c: 5 }] }).history;
  check("history checked", h.length === 1 && h[0].t === "fair", `bad history rows were kept (${h.length})`);
}
// a backup copy that can't be written must not make the game load the older backup and then save over the good one
{
  store.clear(); store.set("turbodash.save", JSON.stringify({ ...base01, coins: 9999 })); store.set("turbodash.save.backup", JSON.stringify({ ...base01, coins: 100 }));
  const set = localStorage.setItem; localStorage.setItem = (k, v) => { if (k === "turbodash.save.backup") throw new Error("QuotaExceededError"); set(k, v); };
  try { load(); } catch (e) { check("backup write fails", false, "load threw " + e.message); }
  check("backup write fails", saveMod.S.coins === 9999, `loaded ${saveMod.S.coins} coins, the main save has 9999`);
  saveMod.save(); check("backup write fails", JSON.parse(store.get("turbodash.save")).coins === 9999, "the next save overwrote the good save");
  // storage full: the backup copy is dropped to make room, and the save is tried again
  let full = true; localStorage.setItem = (k, v) => { if (full && store.has("turbodash.save.backup")) throw new Error("QuotaExceededError"); set(k, v); };
  store.set("turbodash.save.backup", "x"); saveMod.S.coins = 4321; saveMod.save();
  check("storage full", JSON.parse(store.get("turbodash.save")).coins === 4321 && !store.has("turbodash.save.backup"), "a full storage didn't make room for the save");
  let told = 0; saveMod.whenSaveFails(() => told++); localStorage.setItem = () => { throw new Error("blocked"); }; saveMod.save();
  check("storage blocked", told === 1, "a failed save wasn't reported");
  localStorage.setItem = set; saveMod.whenSaveFails(null);
}

// Google Save: the three-way sync decision (what changed where since the last sync)
{
  const { decide, fingerprint } = await import("../src/cloud.js");
  const base = { races: 100, rank: 5, research: { coinBoost: 2 }, school: { math: { laps: 3 }, earned: 10 }, owned: ["zippy"], ups: {}, claimed: [] };
  const bk = { mt: "t1", print: fingerprint(base) };
  const tablet = { ...base, races: 104 };                                     // raced 4 more on this device
  const phone = { ...base, school: { math: { laps: 9 }, earned: 30 } };      // Math Laps done on the phone
  check("cloud: nothing new", decide(base, { mt: "t1", save: null }, bk) === "nothing", "synced copies should do nothing");
  check("cloud: only here changed", decide(tablet, { mt: "t1", save: null }, bk) === "upload", "local progress wasn't uploaded");
  check("cloud: only Google changed", decide(base, { mt: "t2", save: phone }, bk) === "load", "the other device's progress wasn't loaded");
  check("cloud: no file yet", decide(base, null, {}) === "upload", "first sign-in didn't upload");
  check("cloud: both changed, keep the further one", decide({ ...tablet, races: 140 }, { mt: "t2", save: phone }, bk) === "upload" && decide(tablet, { mt: "t2", save: { ...phone, rank: 7 } }, bk) === "load", "conflict didn't keep the save that is further along");
}

// a broken main save must fall back to the backup, never to an empty game
store.clear(); store.set("turbodash.save", "{oops"); store.set("turbodash.save.backup", JSON.stringify(base01));
load(); check("broken main save", saveMod.S.coins === base01.coins, "did not fall back to the backup copy");

console.log(failed ? `\n${failed} save check(s) FAILED` : `\nAll ${Object.keys(FIXTURES).length + 1} save checks passed`);
process.exit(failed ? 1 : 0);
