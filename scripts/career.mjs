// Career simulator: a bot plays the WHOLE game day by day and reports when each stage gate falls.
//   npm run career                 -> 12 races a day, up to 1000 days
//   npm run career -- 20 600       -> 20 races a day, up to 600 days
// It pays exactly what the game pays (src/rules.js: races, chests, bosses, cups, trials, rank-ups, gifts, treats,
// missions, the Math/Word Lap Good Student bonus) and races with the real engine. Bank interest is modelled too.
// The bot plays like a kid: steers late, fires Turbo at random, uses power-ups, and buys as soon as it can.
import { runRace } from "./racebot.mjs";
import { trackLen } from "../src/engine.js";
import { GOOD_STUDENT, lapsDone, REWARDS, bankMax, bankSettle, bankDeposit, bankWithdraw, BANK_DAY } from "../src/data.js";
import { dayKey, raceReward, chestValues, bossReward, trialReward, cupEndReward, rankUp, claimGift, treat, claimMission, missionsBonus, lapBonus, grantCar, keepOpens, seasonUnlock } from "../src/rules.js";
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
const NO_UPS = () => ({ engine: 0, turbo: 0, tires: 0, magnet: 0 });

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
const gates = [];
const gate = (key, text) => { if (gates.some(g => g.key === key)) return; gates.push({ key, text, day, race: raceNo }); };
const lv = id => S.research[id] || 0;

function rankUps() {
  while (S.rank < RANK_CAP && FRONTS.every(f => f.have(S) >= rankNeeds(S.rank, S)[f.id])) {
    rankUp(S, today(), rankTitle(S.rank + 1));
    gate("rank" + S.rank, `Rank ${S.rank}`); lastRankDay = day;
  }
}
function claimGoals() { for (const g of GOALS) if (!S.claimed.includes(g.id) && g.have(S) >= g.goal) { S.claimed.push(g.id); S.coins += g.reward; } }

function reward(track, r, diff, opts = {}) {
  raceNo++; clock += 75 + 35;
  if (r.place === 1 && !opts.boss) gate("gold:" + track.id + ":" + diff, `First ${diffOf(diff).icon} win on ${track.name}`);
  raceReward(S, track, r, { diff, day: today(), now: clock * 1000, ...opts });   // clock: race seconds, so the 30-minute Good Student bonus covers the first races of the day
  const chests = chestValues(S, track, diff); S.coins += chests[Math.floor(Math.random() * 3)];   // he picks one of three
  for (const t of TRACKS) if (trackOpen(S, t)) gate("open:" + t.id, `Opened ${t.name}`);
}

const carOf = () => CARS.find(c => c.id === S.car);
// weather like the game: about a quarter of Earth races (from Rank 2) have rain or snow
const weatherFor = t => t.world === "earth" && S.rank >= 2 && Math.random() < 0.25 ? (t.theme === "snow" ? "snow" : ["sunny", "beach", "farm", "river", "autumn", "candy", "pirate", "fair"].includes(t.theme) ? "rain" : null) : null;
const race = (track, diff) => runRace(track, carOf(), S.ups[S.car], diff, "kid", S.research, lv("autoSteer"), null, false, weatherFor(track));

function playBoss(b) {
  const car = carOf(), t = TRACKS.find(x => x.id === b.track);
  const r = runRace(t, car, S.ups[S.car], "normal", "kid", S.research, 0, { ...b, def: CARS.find(c => c.id === b.car) });
  reward(t, r, "normal", { boss: true });
  if (r.place === 1) { bossReward(S, b, today()); gate("boss:" + b.id, `Beat ${b.name}`); }
}

/* one Time Trial a day: the newest open track still missing gold */
function playTrial() {
  const t = [...TRACKS].reverse().find(x => trackOpen(S, x) && (S.trialMedals[x.id] || 0) < 3); if (!t) return false;
  const r = runRace(t, carOf(), S.ups[S.car], "normal", "kid", S.research, 0, null, true);
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
function spend() {
  // lab first when it's cheap compared with savings, then the next car, then the cheapest upgrade
  for (const b of benches()) {
    if (b.p) continue;
    for (const id of LAB_ORDER) {
      const r = RESEARCH.find(x => x.id === id), l = lv(id);
      if (l >= r.max || S.rank < researchRank(r, l) || (r.needs || []).some(n => lv(n) < 1) || benches().some(x => x.p === id)) continue;
      const cost = researchCost(r, l), chips = researchChips(r, l);
      if (S.coins >= cost && S.chips >= chips && (id === "autoSteer" || id.startsWith("rb") || cost <= S.coins * 0.5)) {
        S.coins -= cost; S.chips -= chips; b.p = id; b.end = clock + researchTime(r, l); break;
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
    const opts = [];
    for (const id of S.owned) for (const u of UPGRADES) if (S.ups[id][u.id] < UPGRADE_MAX) opts.push({ id, u: u.id, cost: upgradeCost(id, S.ups[id][u.id], lv("pitCrew")) * (id === S.car ? 1 : 1.6) });
    opts.sort((a, b) => a.cost - b.cost);
    const o = opts[0];
    if (o && S.coins >= o.cost && (!next || S.coins - o.cost >= next.price * 0.3 || o.id === S.car)) { S.coins -= Math.round(o.cost / (o.id === S.car ? 1 : 1.6)); S.ups[o.id][o.u]++; bought = true; }
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
const need = rankNeeds(S.rank, S); console.log("Fronts for next rank: " + FRONTS.map(f => `${f.name} ${f.have(S)}/${need[f.id]}`).join(", "));
