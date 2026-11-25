// Career simulator: a bot plays the WHOLE game day by day and reports when each stage gate falls.
//   npm run career                 -> 12 races a day, up to 1000 days
//   npm run career -- 20 600       -> 20 races a day, up to 600 days
// It pays exactly what the game pays (src/rules.js: races, chests, bosses, cups, trials, rank-ups, gifts, treats,
// missions, the Math/Word Lap Good Student bonus) and races with the real engine. Bank interest is modelled too.
// The bot plays like a kid: steers late, fires Turbo at random, uses power-ups, and buys as soon as it can.
import { runRace } from "./racebot.mjs";
import { rng } from "../src/physics-common.js";
import { bestCar, paceOn } from "../src/best.js";
import { writeFileSync } from "node:fs";
import { trackLen } from "../src/engine.js";
import { GOOD_STUDENT, lapsDone, REWARDS, bankMax, bankSettle, bankDeposit, bankWithdraw, BANK_DAY } from "../src/data.js";
import { weekRivalRace, weekRivalResult } from "../src/rival-week.js";
import { dayKey, raceReward, chestValues, bossReward, bossLevel, bossSpeed, trialReward, cupEndReward, rankUp, claimGift, treat, claimMission, missionsBonus, lapBonus, grantCar, earnCars, keepOpens, seasonUnlock } from "../src/rules.js";
const LAPS_PER_DAY = +(process.argv[4] || 2), PERFECT = 0.6;   // Math/Word Laps a day, and how often one is perfect
const BANK = process.argv[5] !== "nobank";   // npm run career -- 12 1000 2 nobank: leave the bank out
// 🍂 seasonal tracks open on their calendar dates (the career starts on 1 January); "season" opens them on day 1,
// "noseason" never: npm run career -- 12 1000 2 bank season
const SEASON = process.argv[6] || "calendar";
import {
  CARS, TRACKS, CUPS, DIFFS, UPGRADES, UPGRADE_MAX, GOALS, FRONTS, RESEARCH, RANK_CAP,
  upgradeCost, trackOpen, worldOpen, BOSSES, rankNeeds, diffOf, researchCost, researchTime, researchChips, researchRank, benchesFor, rankTitle,
} from "../src/data.js";

const RACES_PER_DAY = +(process.argv[2] || 12), MAX_DAYS = +(process.argv[3] || 1000);
const SNAP = process.env.CAREER_SNAP ? { rank: +process.env.CAREER_SNAP.split(":")[0], file: process.env.CAREER_SNAP.split(":").slice(1).join(":") } : null;
const NO_UPS = () => ({ engine: 0, turbo: 0, tires: 0, magnet: 0 });

/* 🤖 Strategy bots (v1.20). CAREER_BOT picks how the bot spends and which car it drives; CAREER_SEED seeds every
   random number (races, chests, picks), so a run can be played again exactly. `npm run bots` runs each strategy over
   several seeds and compares them (scripts/bots.mjs). "kid" (the default) is the bot the release gate has always used.
   - speed: Engine and Turbo first, speed research first, and it drives the fastest car it owns on each track.
   - grip:  Tires first, and it drives its best Grippy car unless another car is more than 5% faster there.
   - coins: Magnet first, coin research first (Coin Boost, Lucky Gifts, Magnet Field, Pit Crew).
   - auto:  the Robot Brain and Auto Steer before anything else in the Lab; from Auto Steer level 20 it lets the car
            steer itself and only taps Turbo and power-ups (the idle player). */
const BOT = process.env.CAREER_BOT || "kid";
const BOTS = {
  kid:   { ups: {}, lab: [] },
  speed: { ups: { engine: 1, turbo: 1.2, tires: 1.6, magnet: 3 }, lab: ["headStart", "turboTanks", "pitCrew"], drive: "fast" },
  grip:  { ups: { tires: 1, engine: 1.3, turbo: 1.5, magnet: 3 }, lab: ["bumper", "pitCrew", "headStart"], drive: "grippy" },
  coins: { ups: { magnet: 1, engine: 1.4, turbo: 1.6, tires: 1.6 }, lab: ["coinBoost", "luckyChests", "magnetField", "pitCrew"], drive: "fast" },
  auto:  { ups: { engine: 1, tires: 1.1, turbo: 1.3, magnet: 3 }, lab: ["rbEyes", "rbEars", "rbMap", "rbReflex", "rbSocket", "autoSteer"], drive: "fast", hands: 20 },
};
const STRAT = BOTS[BOT];
if (!STRAT) { console.error(`Unknown CAREER_BOT "${BOT}". Pick one of: ${Object.keys(BOTS).join(", ")}`); process.exit(2); }
if (process.env.CAREER_SEED) Math.random = rng(+process.env.CAREER_SEED * 7919 + 1);
// what the bot bought and what did the work, for the variety report
const used = {}, boughtUps = { engine: 0, turbo: 0, tires: 0, magnet: 0 }, labSpent = {};

// a save-shaped state, so the game's own FRONTS/GOALS functions work on it
const S = {
  coins: 0, owned: ["zippy"], car: "zippy", ups: { zippy: NO_UPS() }, best: {}, bestD: {}, research: {}, lab: { benches: [] },
  cups: {}, chips: 0, chipLog: {}, claimed: [], stats: { roadCoins: 0, stunts: 0, turbos: 0, bams: 0, powers: 0, rings: 0, pearls: 0, drifts: 0, loops: 0 }, trials: {}, trialMedals: {},
  bosses: {}, wins: 0, races: 0, rank: 1, giftStreak: 0, diff: "normal", paints: ["stock"], stickers: ["none"], mastery: {},
  school: { earned: 0, log: [], capT: 6, boosts: [], math: { laps: 0 }, word: { laps: 0 } }, parent: {},
  museum: [], days: {}, history: [], dirt: {}, sparkle: "", daily: {}, lastGift: "", bank: { bal: 0, low: 0, t: 0, paid: 0, news: 0 },
};
const today = () => dayKey(new Date(2027, 0, 1 + day)), yesterday = () => dayKey(new Date(2027, 0, day));
let day = 0, clock = 0, raceNo = 0, lastRankDay = 0;
const gates = [], bestDay = {};
const gate = (key, text) => { if (gates.some(g => g.key === key)) return; gates.push({ key, text, day, race: raceNo }); };
const lv = id => S.research[id] || 0;

function rankUps() {
  while (S.rank < RANK_CAP && FRONTS.every(f => f.have(S) >= rankNeeds(S.rank, S)[f.id])) {
    rankUp(S, today(), rankTitle(S.rank + 1));
    gate("rank" + S.rank, `Rank ${S.rank}`); lastRankDay = day;
  }
}
function claimGoals() {
  for (const c of earnCars(S, today())) gate("car:" + c.id, `Earned the ${c.name} (${c.earn.goal} ${c.earn.stat})`);   // 🌟 v1.19
  for (const g of GOALS) if (!S.claimed.includes(g.id) && g.have(S) >= g.goal) { S.claimed.push(g.id); S.coins += g.reward; } }

function reward(track, r, diff, opts = {}) {
  raceNo++; clock += 75 + 35;
  if (r.place === 1 && !opts.boss) gate("gold:" + track.id + ":" + diff, `First ${diffOf(diff).icon} win on ${track.name}`);
  raceReward(S, track, r, { diff, day: today(), now: clock * 1000, ...opts });   // clock: race seconds, so the 30-minute Good Student bonus covers the first races of the day
  const chests = chestValues(S, track, diff); S.coins += chests[Math.floor(Math.random() * 3)];   // he picks one of three
  for (const t of TRACKS) if (trackOpen(S, t)) gate("open:" + t.id, `Opened ${t.name}`);
}

const carOf = () => CARS.find(c => c.id === S.car);
const mine = () => CARS.filter(c => S.owned.includes(c.id));
const upsOf = id => S.ups[id] || NO_UPS();
/* the car a strategy bot drives on this track: the fastest it owns (the game's own Best rule), or for "grip" its
   best Grippy car unless another is more than 5% faster there. The kid bot keeps the car spend() picked. */
function driveOn(track) {
  if (!STRAT.drive) return S.car;
  const fast = bestCar(track, mine(), upsOf, S.research, S.car);
  if (STRAT.drive === "grippy") {
    const g = bestCar(track, mine().filter(c => c.trait === "grippy"), upsOf, S.research);
    if (g && paceOn(g, upsOf(g.id), track, S.research) * 1.05 >= paceOn(fast, upsOf(fast.id), track, S.research)) return g.id;
  }
  return fast.id;
}
const driver = () => STRAT.hands && lv("autoSteer") >= STRAT.hands ? "none" : "kid";
function drive(track, run) {
  const keep = S.car; S.car = driveOn(track);
  used[S.car] = (used[S.car] || 0) + 1;
  try { return run(carOf()); } finally { S.car = keep; }
}
// weather like the game: about a quarter of Earth races (from Rank 2) have rain or snow
const weatherFor = t => t.world === "earth" && S.rank >= 2 && Math.random() < 0.25 ? (t.theme === "snow" ? "snow" : ["sunny", "beach", "farm", "river", "autumn", "candy", "pirate", "fair"].includes(t.theme) ? "rain" : null) : null;
// 🎯 the rival of the week (v1.13) is in every race and cup race, on the career's own calendar
const date = () => new Date(2027, 0, 1 + day, 12);
let weekBonus = 0, weekBeats = 0, rematchWins = 0;
// the world the bot is racing in today: the world of its newest open track
const carWorld = () => [...TRACKS].reverse().find(t => trackOpen(S, t))?.world;
const race = (track, diff) => {
  const week = weekRivalRace(S, "race", date());
  const r = drive(track, car => runRace(track, car, S.ups[car.id], diff, driver(), S.research, lv("autoSteer"), null, false, weatherFor(track), week));
  if (week && r.standings) { const w = weekRivalResult(S, track, r.standings, diff, date()); weekBonus += w.bonus; weekBeats += w.up; }
  return r;
};

function playBoss(b) {
  const t = TRACKS.find(x => x.id === b.track);
  const r = drive(t, car => runRace(t, car, S.ups[car.id], "normal", "kid", S.research, 0, { ...b, def: CARS.find(c => c.id === b.car), speed: bossSpeed(b, bossLevel(S, b)) }));
  reward(t, r, "normal", { boss: true });
  if (r.place === 1) { const w = bossReward(S, b, today()); gate("boss:" + b.id + (w.round > 1 ? ":" + w.round : ""), w.round > 1 ? `Won Round ${w.round} against ${b.name}` : `Beat ${b.name}`); if (w.round > 1 && w.round <= 4) rematchWins++; }
}

/* one Time Trial a day: the newest open track still missing gold */
function playTrial() {
  const t = [...TRACKS].reverse().find(x => trackOpen(S, x) && (S.trialMedals[x.id] || 0) < 3); if (!t) return false;
  const r = drive(t, car => runRace(t, car, S.ups[car.id], "normal", "kid", S.research, 0, null, true));
  raceNo++; clock += 75 + 35;
  const { medal } = trialReward(S, t, r, trackLen(t));
  if (medal === 3) gate("trialgold:" + t.id, `Gold Time Trial on ${t.name}`);
  return true;
}
function playCup(cup, diff) {
  const run = { pts: [0, 0, 0, 0, 0, 0] };
  for (const id of cup.tracks) { const t = TRACKS.find(x => x.id === id); reward(t, race(t, diff), diff, { cup: run }); }
  const res = cupEndReward(S, cup, diff, run.pts, today());
  if (res.car) gate("car:" + cup.car, `Won the ${CARS.find(c => c.id === cup.car).name}`);
  if (res.place === 1) gate("cup:" + cup.id + ":" + diff, `Won the ${cup.name} on ${diffOf(diff).name}`);
}

/* What a kid would race next: the hardest open track without a win yet; after 3 losses in a row there, farm the best-paying win. */
let fails = {};
function pickRace() {
  const main = S.rank >= 3 && TRACKS.every(t => S.bestD[t.id + ":normal"] === 1 || (t.season && !trackOpen(S, t))) ? "hard" : "normal";
  const diffs = ["easy", "normal"].concat(S.rank >= 3 ? ["hard"] : []);
  const diff = Math.random() < 0.6 ? main : diffs[Math.floor(Math.random() * diffs.length)];
  const cup = S.rank >= 5 && CUPS.find(c => S.rank >= (c.rank || 5) && c.tracks.every(id => trackOpen(S, TRACKS.find(t => t.id === id))) && S.cups[c.id + ":" + diff] !== 1 && (fails["cup:" + c.id] || 0) < 2);
  if (cup && Math.random() < 0.35) return { cup, diff };
  const open = TRACKS.filter(t => trackOpen(S, t));
  const target = [...open].reverse().find(t => S.bestD[t.id + ":" + diff] !== 1);
  if (target && (fails[target.id] || 0) < 3) return { track: target, diff };
  if (target) fails[target.id] = (fails[target.id] || 0) - 1;   // try it again later
  const won = open.filter(t => S.bestD[t.id + ":" + diff] === 1);
  if (won.length && Math.random() < 0.5) return { track: won[Math.floor(Math.random() * won.length)], diff };
  return { track: won.length ? won[won.length - 1] : open[0], diff };
}

function benches() { const n = benchesFor(S.rank); while (S.lab.benches.length < n) S.lab.benches.push({ p: null, end: 0 }); return S.lab.benches.slice(0, n); }
function collectLab() {
  for (const b of benches()) if (b.p && b.end <= clock) {
    S.research[b.p] = lv(b.p) + 1;
    if (b.p === "autoSteer" && [1, 2, 5, 10, 15, 20, 22, 25, 50, 100].includes(lv(b.p))) gate("as" + lv(b.p), `Auto Steer level ${lv(b.p)}`);
    if (b.p === "rbSocket") gate("socket", "Robot Brain finished");
    b.p = null;
  }
}
const LAB_ORDER = ["shrinkRay", "loopGrip", "boosterTune", "wallBumpers", "windUp", "iceStuds", "snowChains", "driftMaster", "snowplow", "warmEngine", "snorkel", "propellers", "fins", "pearlDiver", "moonTires", "thrusters", "ringMagnet", "autoSteer", "rbSocket", "rbReflex", "rbMap", "rbEars", "rbEyes", "coinBoost", "headStart", "turboTanks", "pitCrew", "luckyChests", "magnetField", "bumper", "bigRamps", "superPaint"];
// a strategy's own projects come first; world kits stay at the front so no strategy walls a world off
const KITS = ["shrinkRay", "iceStuds", "snorkel", "moonTires"];
const labOrder = [...LAB_ORDER.filter(id => KITS.includes(id)), ...STRAT.lab, ...LAB_ORDER.filter(id => !KITS.includes(id) && !STRAT.lab.includes(id))];
function spend() {
  // lab first when it's cheap compared with savings, then the next car, then the cheapest upgrade
  for (const b of benches()) {
    if (b.p) continue;
    for (const id of labOrder) {
      const r = RESEARCH.find(x => x.id === id), l = lv(id);
      if (l >= r.max || S.rank < researchRank(r, l) || (r.needs || []).some(n => lv(n) < 1) || benches().some(x => x.p === id)) continue;
      const cost = researchCost(r, l), chips = researchChips(r, l);
      if (S.coins >= cost && S.chips >= chips && (id === "autoSteer" || id.startsWith("rb") || STRAT.lab.includes(id) || cost <= S.coins * 0.5)) {
        S.coins -= cost; S.chips -= chips; b.p = id; b.end = clock + researchTime(r, l); labSpent[id] = (labSpent[id] || 0) + cost; break;
      }
    }
  }
  for (let bought = true; bought;) {
    bought = false;
    const next = CARS.find(c => c.price != null && (!c.world || worldOpen(S, c.world)) && !S.owned.includes(c.id));
    if (next && S.coins >= next.price) { S.coins -= next.price; S.owned.push(next.id); S.car = next.id; S.ups[next.id] = NO_UPS(); gate("car:" + next.id, `Bought ${next.name}`); bought = true; continue; }
    // drive the fastest car owned (its speed plus its engine upgrades)
    const pace = id => { const c = CARS.find(x => x.id === id); return c.speed + 0.06 * (S.ups[id]?.engine || 0); };
    S.car = [...S.owned].sort((a, b) => pace(b) - pace(a))[0];
    // strategy bots: the main car (the one that gets upgrades first) is the car they drive on their newest track
    if (STRAT.drive) { const t = [...TRACKS].reverse().find(x => trackOpen(S, x)); if (t) S.car = driveOn(t); }
    const opts = [];
    for (const id of S.owned) for (const u of UPGRADES) if (S.ups[id][u.id] < UPGRADE_MAX) opts.push({ id, u: u.id, real: upgradeCost(id, S.ups[id][u.id], lv("pitCrew")), cost: upgradeCost(id, S.ups[id][u.id], lv("pitCrew")) * (id === S.car ? 1 : 1.6) * (STRAT.ups[u.id] || 1) });
    opts.sort((a, b) => a.cost - b.cost);
    const o = opts[0];
    if (o && S.coins >= o.real * (o.id === S.car ? 1 : 1.6) && (!next || S.coins - o.real * (o.id === S.car ? 1 : 1.6) >= next.price * 0.3 || o.id === S.car)) { S.coins -= o.real; S.ups[o.id][o.u]++; boughtUps[o.u]++; bought = true; }
  }
}

for (day = 1; day <= MAX_DAYS; day++) {
  clock = day * 86400;
  if (SEASON !== "noseason") for (const t of seasonUnlock(S, SEASON === "season" ? new Date(2027, 9, 1) : new Date(2027, 0, 1 + day))) gate("open:" + t.id, `Opened ${t.name} (seasonal)`);
  keepOpens(S);
  // the bank pays overnight; he takes it all out to go shopping (put back in at the end of the day)
  if (BANK) { bankSettle(S.bank, S.rank, day * BANK_DAY); S.coins += bankWithdraw(S.bank, S.bank.bal); }
  // Main Street treats (the kid taps them every day once open)
  if (S.rank >= 12) treat(S, "icecream", today());
  if (S.rank >= 20) treat(S, "park", today(), day);
  if (S.rank >= 15 && treat(S, "fire", today())) gate("car:firetruck", "Got Fire Dash from the Fire Station");
  if (day % 7 === 0) for (const k of Object.keys(fails)) if (k.startsWith("cup:")) fails[k] = 0;   // try cups again each week
  collectLab();
  claimGift(S, today(), yesterday());
  if (S.rank >= 7) {   // assume he finishes the 3 daily missions
    const M = { day: today(), bonus: false, list: [0, 1, 2].map(() => ({ reward: REWARDS.mission(S.rank), goal: 1, have: 1, claimed: false })) };
    for (const m of M.list) claimMission(S, m);
    missionsBonus(S, M);
  }
  // Math and Word Laps before racing: each adds a Good Student coin bonus for 30 minutes (and 20 laps earn the car)
  for (let k = 0; k < LAPS_PER_DAY; k++) { const kind = k % 2 ? "word" : "math"; S.school[kind].laps++; lapBonus(S, kind, Math.random() < PERFECT, 5, today(), clock * 1000); }
  if (lapsDone(S) >= GOOD_STUDENT.patrolLaps && grantCar(S, "patrol")) gate("car:patrol", "Earned the School Resource Officer car");
  let trialToday = false;
  for (let n = 0; n < RACES_PER_DAY; n++) {
    if (!trialToday && n === 3) { trialToday = true; if (playTrial()) { collectLab(); claimGoals(); rankUps(); spend(); continue; } }
    const boss = BOSSES.find(b => !S.bosses[b.id] && S.rank >= b.rank && trackOpen(S, TRACKS.find(t => t.id === b.track)));
    if (boss && Math.random() < 0.15) { playBoss(boss); collectLab(); claimGoals(); rankUps(); spend(); continue; }
    // 👑 v1.15: now and then a rematch against a beaten boss (Rounds 2 to 4), on that boss's world
    const again = !boss && BOSSES.find(b => S.bosses[b.id] >= 1 && S.bosses[b.id] <= 3 && b.world === carWorld());
    if (again && Math.random() < 0.04) { playBoss(again); collectLab(); claimGoals(); rankUps(); spend(); continue; }
    const pick = pickRace();
    if (pick.cup) {
      const before = S.cups[pick.cup.id + ":" + pick.diff];
      playCup(pick.cup, pick.diff); n += 2;
      if (S.cups[pick.cup.id + ":" + pick.diff] !== 1) fails["cup:" + pick.cup.id] = (fails["cup:" + pick.cup.id] || 0) + 1;
      else fails["cup:" + pick.cup.id] = 0;
      void before;
    } else {
      const r = race(pick.track, pick.diff);
      reward(pick.track, r, pick.diff);
      if (r.place === 1) fails[pick.track.id] = 0; else fails[pick.track.id] = (fails[pick.track.id] || 0) + 1;
    }
    collectLab(); claimGoals(); rankUps(); spend();
  }
  // whatever wasn't spent goes in the bank, up to its limit
  if (BANK) { const n = Math.min(S.coins, Math.max(0, bankMax(S.rank) - S.bank.bal)); bankDeposit(S.bank, n, day * BANK_DAY); S.coins -= n; }
  if (S.rank >= RANK_CAP && !gates.some(g => g.key === "cap")) gate("cap", `Reached the rank cap (${RANK_CAP})`);
  // 🏆 v1.21 "Every car has a place": the first day each car is the Best pick (src/best.js) of the bot's own garage on
  // an open track
  for (const t of TRACKS) if (trackOpen(S, t)) { const b = bestCar(t, mine(), upsOf, S.research); if (!(b.id in bestDay)) bestDay[b.id] = day; }
  // CAREER_SNAP=16:src/dev/mid-save.json writes the bot's save the evening it first reaches Rank 16 (the sweep's
  // pictures use it, so they show a save a real player could have, not made-up numbers)
  if (SNAP && S.rank >= SNAP.rank && !SNAP.done) { SNAP.done = true; writeFileSync(SNAP.file, JSON.stringify({ ...S, v: 24, name: "Racer", rivalWeek: { w: -1, lvl: 0, seen: -1 }, world: "earth", lab: { benches: [] }, savedAt: 0 }, null, 1) + "\n"); console.log(`(saved the Rank ${S.rank} save of day ${day} to ${SNAP.file})`); }
  if (day - lastRankDay > 60 && S.rank < RANK_CAP && !gates.some(g => g.key === "stuck" + S.rank)) {
    const need = rankNeeds(S.rank, S);
    gate("stuck" + S.rank, `⚠ STUCK at Rank ${S.rank} for 60 days: ` + FRONTS.map(f => `${f.name} ${f.have(S)}/${need[f.id]}`).join(", "));
  }
  if (lv("autoSteer") >= 2 * (RANK_CAP - 9) && S.rank >= RANK_CAP) { gate("done", "Everything currently reachable is done"); break; }
}

const months = d => d < 60 ? `day ${d}` : `day ${d} (~${(d / 30).toFixed(1)} months)`;
console.log(`\nCareer: ${RACES_PER_DAY} races a day (${Math.round(RACES_PER_DAY * 75 / 60)} min), rank cap ${RANK_CAP}\n`);
for (const g of gates) console.log(`  ${months(g.day).padEnd(24)} race ${String(g.race).padStart(5)}  ${g.text}`);
console.log(`\nAfter ${Math.min(day, MAX_DAYS)} days: rank ${S.rank}, Auto Steer ${lv("autoSteer")}, coins ${S.coins}, chips ${S.chips}, research levels ${Object.values(S.research).reduce((a, b) => a + b, 0)}, cars ${S.owned.length}/${CARS.length}`);
console.log(`Rival of the week: beaten ${weekBeats} times below the cap, bonus coins ${weekBonus}`);
console.log(`Boss rematches: ${rematchWins} round wins, rounds won per boss ${BOSSES.map(b => b.id + " " + Math.max(0, (S.bosses[b.id] || 0) - 1)).join(", ")}`);
const need = rankNeeds(S.rank, S); console.log("Fronts for next rank: " + FRONTS.map(f => `${f.name} ${f.have(S)}/${need[f.id]}`).join(", "));
// 🤖 what did the work (v1.20): races per car, upgrades bought by kind, Lab coins by project
const share = Object.entries(used).sort((a, b) => b[1] - a[1]), races = share.reduce((a, [, n]) => a + n, 0);
console.log(`Bot ${BOT}${process.env.CAREER_SEED ? " seed " + process.env.CAREER_SEED : ""}. Races per car: ` + share.slice(0, 8).map(([id, n]) => `${id} ${Math.round(100 * n / races)}%`).join(", "));
console.log("Upgrades bought: " + Object.entries(boughtUps).map(([k, n]) => `${k} ${n}`).join(", ") + ". Lab coins: " + Object.entries(labSpent).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => `${k} ${Math.round(n / 1000)}k`).join(", "));

const at = key => gates.find(g => g.key === key)?.day;
// 🏆 v1.21 the M2 target, read by the game's own Best rule: every car is the best pick of the bot's garage on an open
// track at some point, and at the end (every car the bot owns, as upgraded as it got them) no car is the best pick
// on more than a third of the tracks
const never = CARS.filter(c => !(c.id in bestDay)), endBest = {};
for (const t of TRACKS) { const b = bestCar(t, mine(), upsOf, S.research); endBest[b.name] = (endBest[b.name] || 0) + 1; }
const endTop = Math.max(...Object.values(endBest)), place = [];
console.log(`Best pick at some point: ${CARS.length - never.length} of ${CARS.length} cars${never.length ? " (never: " + never.map(c => c.name).join(", ") + ")" : ""}. At the end: ` + Object.entries(endBest).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(", ") + ` of ${TRACKS.length} tracks`);
// the first half is not met yet (PLAN.md, M2 "Side cars have a place"). Its count changes from run to run (20 to 24
// of 29 over six seeds), so `npm run bots` holds a floor on its seeded kid runs, where it repeats exactly
if (endTop * 3 > TRACKS.length) place.push(`at the end one car is the best pick on ${endTop} of ${TRACKS.length} tracks (a third at most)`);
const worlds = [...new Set(TRACKS.map(t => t.world))].filter(w => w !== "earth");
const opened = w => Math.min(...gates.filter(g => g.key.startsWith("open:") && TRACKS.find(t => "open:" + t.id === g.key)?.world === w).map(g => g.day));
// CAREER_JSON=<file> writes the run's numbers for scripts/bots.mjs
const report = ok => { if (process.env.CAREER_JSON) writeFileSync(process.env.CAREER_JSON, JSON.stringify({ bot: BOT, seed: process.env.CAREER_SEED || null, ok, rank: S.rank, cap: at("cap") || null, worlds: Object.fromEntries(worlds.map(w => [w, opened(w)])), used, boughtUps, labSpent, everBest: CARS.length - never.length, never: never.map(c => c.id), endTop, gates: gates.map(g => [g.key, g.day, g.race]) }) + "\n"); };

// v1.11.2: a gate that never opens fails the run (exit 1), so `npm run check` stops: a STUCK rank, or the rank
// cap not reached within the days played. A short run (npm run career -- 12 100) fails on purpose: the cap is
// out of reach in 100 days.
const stuck = gates.filter(g => g.key.startsWith("stuck"));
if (stuck.length || S.rank < RANK_CAP || place.length) {
  report(false);
  console.log("\n✖ " + [...stuck.map(g => g.text), ...(S.rank < RANK_CAP ? [`Rank cap ${RANK_CAP} not reached in ${MAX_DAYS} days (rank ${S.rank})`] : []), ...place].join("\n✖ "));
  process.exit(1);
}
report(true);
console.log(`\n✔ No stuck gate. Rank ${RANK_CAP} on day ${at("cap")}. Worlds open on day: ` + worlds.map(w => `${w} ${opened(w)}`).join(", "));
