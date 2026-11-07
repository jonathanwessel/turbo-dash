// Career simulator: a bot plays the WHOLE game day by day and reports when each stage gate falls.
//   npm run career                 -> 12 races a day, up to 1000 days
//   npm run career -- 20 600       -> 20 races a day, up to 600 days
// It uses the game's own rules from src/data.js (prizes, ranks, research, goals) and races with the real engine.
// The bot plays like a kid: steers late, fires Turbo at random, uses power-ups, and buys as soon as it can.
import { runRace } from "./racebot.mjs";
import { SKILLS, SKILL_MAX, skillCost, licenseLevel } from "../src/data.js";
const REAL_MIN = +(process.argv[4] || 20);   // minutes of real-world time logged per day (reading/outside)
import {
  CARS, TRACKS, CUPS, CUP_POINTS, DIFFS, UPGRADES, UPGRADE_MAX, GOALS, FRONTS, RESEARCH, RANK_CAP,
  prizeFor, upgradeCost, trackOpen, rankNeeds, diffOf, researchCost, researchTime, researchChips, researchRank, benchesFor,
} from "../src/data.js";

const RACES_PER_DAY = +(process.argv[2] || 12), MAX_DAYS = +(process.argv[3] || 1000);
const NO_UPS = () => ({ engine: 0, turbo: 0, tires: 0, magnet: 0 });

// a save-shaped state, so the game's own FRONTS/GOALS functions work on it
const S = {
  coins: 0, owned: ["zippy"], car: "zippy", ups: { zippy: NO_UPS() }, best: {}, bestD: {}, research: {}, lab: { benches: [] },
  cups: {}, chips: 0, chipLog: {}, claimed: [], stats: { roadCoins: 0, stunts: 0, turbos: 0, bams: 0, powers: 0 },
  wins: 0, races: 0, rank: 1, giftStreak: 0, diff: "normal", paints: ["stock"], stickers: ["none"], mastery: {},
  school: { tickets: 0, earned: 0, skills: { focus: 0, reflex: 0, courage: 0, smarts: 0 } }, parent: { license: true },
};
let day = 0, clock = 0, raceNo = 0, lastRankDay = 0;
const gates = [];
const gate = (key, text) => { if (gates.some(g => g.key === key)) return; gates.push({ key, text, day, race: raceNo }); };
const chip = key => { if (S.chipLog[key]) return; S.chipLog[key] = 1; S.chips++; };
const lv = id => S.research[id] || 0;

function rankUps() {
  while (S.rank < RANK_CAP && FRONTS.every(f => f.have(S) >= rankNeeds(S.rank, S)[f.id])) {
    S.rank++; S.coins += 200 * S.rank; if (S.rank >= 5) chip("rank:" + S.rank);
    gate("rank" + S.rank, `Rank ${S.rank}`); lastRankDay = day;
  }
}
function claimGoals() { for (const g of GOALS) if (!S.claimed.includes(g.id) && g.have(S) >= g.goal) { S.claimed.push(g.id); S.coins += g.reward; } }

function reward(track, r, diff) {
  S.races++; raceNo++; clock += 75;
  if (r.place === 1) S.wins++;
  const dk = track.id + ":" + diff;
  S.best[track.id] = Math.min(S.best[track.id] || 99, r.place);
  S.bestD[dk] = Math.min(S.bestD[dk] || 99, r.place);
  if (r.place === 1) { gate("gold:" + dk, `First ${diffOf(diff).icon} win on ${track.name}`); S.mastery[dk] = (S.mastery[dk] || 0) + 1; }
  if (diff === "hard" && r.place === 1) chip("hard:" + track.id);
  const chestBase = (30 + 25 * track.diff) * diffOf(diff).pay * (1 + 0.15 * lv("luckyChests"));
  S.coins += Math.round(prizeFor(track, r.place, diff) * (1 + 0.05 * lv("coinBoost"))) + r.coins + Math.round(chestBase * 7 / 3);
  S.stats.roadCoins += r.coins; S.stats.stunts += r.stats.stunts; S.stats.turbos += r.stats.turbos; S.stats.bams += r.stats.bams; S.stats.powers += r.stats.powers || 0;
  for (const t of TRACKS) if (trackOpen(S, t)) gate("open:" + t.id, `Opened ${t.name}`);
}

const carOf = () => CARS.find(c => c.id === S.car);
const race = (track, diff) => runRace(track, carOf(), S.ups[S.car], diff, "kid", S.research, lv("autoSteer"), S.school.skills);

function playCup(cup, diff) {
  const pts = [0, 0, 0, 0, 0, 0];
  for (const id of cup.tracks) {
    const t = TRACKS.find(x => x.id === id), r = race(t, diff);
    reward(t, r, diff); r.standings.forEach((k, n) => { pts[k] += CUP_POINTS[n]; });
  }
  const order = [0, 1, 2, 3, 4, 5].sort((a, b) => pts[b] - pts[a] || (a === 0 ? -1 : 1)), place = order.indexOf(0) + 1, key = cup.id + ":" + diff;
  S.cups[key] = Math.min(S.cups[key] || 99, place);
  S.coins += Math.round(cup.bonus * diffOf(diff).pay * [1, 0.6, 0.4, 0.25, 0.15, 0.15][place - 1] * (1 + 0.05 * lv("coinBoost")));
  if (place === 1) {
    if (!S.owned.includes(cup.car)) { S.owned.push(cup.car); S.ups[cup.car] = NO_UPS(); gate("car:" + cup.car, `Won the ${CARS.find(c => c.id === cup.car).name}`); }
    chip("cup:" + key); gate("cup:" + key, `Won the ${cup.name} on ${diffOf(diff).name}`);
  }
}

/* What a kid would race next: the hardest open track without a win yet; after 3 losses in a row there, farm the best-paying win. */
let fails = {};
function pickRace() {
  const main = S.rank >= 3 && TRACKS.every(t => S.bestD[t.id + ":normal"] === 1) ? "hard" : "normal";
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
const LAB_ORDER = ["autoSteer", "rbSocket", "rbReflex", "rbMap", "rbEars", "rbEyes", "coinBoost", "headStart", "turboTanks", "pitCrew", "luckyChests", "magnetField", "bumper", "bigRamps", "superPaint"];
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
    const next = CARS.find(c => c.price != null && !S.owned.includes(c.id));
    if (next && S.coins >= next.price) { S.coins -= next.price; S.owned.push(next.id); S.car = next.id; S.ups[next.id] = NO_UPS(); gate("car:" + next.id, `Bought ${next.name}`); bought = true; continue; }
    const best = [...S.owned].sort((a, b) => CARS.findIndex(c => c.id === b) - CARS.findIndex(c => c.id === a))[0];
    if (best !== S.car && CARS.findIndex(c => c.id === best) > CARS.findIndex(c => c.id === S.car)) S.car = best;
    const opts = [];
    for (const id of S.owned) for (const u of UPGRADES) if (S.ups[id][u.id] < UPGRADE_MAX) opts.push({ id, u: u.id, cost: upgradeCost(id, S.ups[id][u.id], lv("pitCrew")) * (id === S.car ? 1 : 1.6) });
    opts.sort((a, b) => a.cost - b.cost);
    const o = opts[0];
    if (o && S.coins >= o.cost && (!next || S.coins - o.cost >= next.price * 0.3 || o.id === S.car)) { S.coins -= Math.round(o.cost / (o.id === S.car ? 1 : 1.6)); S.ups[o.id][o.u]++; bought = true; }
  }
}

for (day = 1; day <= MAX_DAYS; day++) {
  clock = day * 86400;
  if (day % 7 === 0) for (const k of Object.keys(fails)) if (k.startsWith("cup:")) fails[k] = 0;   // try cups again each week
  collectLab();
  S.giftStreak++; S.coins += 100 + 50 * Math.min(S.giftStreak, 7); if (S.giftStreak % 7 === 0) chip("gift7:" + day);
  if (S.rank >= 7) { S.coins += 3 * (100 + 25 * S.rank) + 200 + 50 * S.rank; chip("missions:" + day); }   // assume he finishes the 3 daily missions
  // the grown-up logs real-world time; the kid spends tickets on the cheapest lesson
  S.school.tickets += Math.floor(REAL_MIN / 10);
  for (let bought = true; bought;) {
    bought = false; const before = licenseLevel(S);
    const k = SKILLS.filter(x => S.school.skills[x.id] < SKILL_MAX).sort((a, b) => S.school.skills[a.id] - S.school.skills[b.id])[0];
    if (k && S.school.tickets >= skillCost(S.school.skills[k.id])) { S.school.tickets -= skillCost(S.school.skills[k.id]); S.school.skills[k.id]++; bought = true; }
    const after = licenseLevel(S); if (after > before) gate("lic" + after, `License level ${after}`);
    if (after >= 3 && !S.owned.includes("patrol")) { S.owned.push("patrol"); S.ups.patrol = NO_UPS(); gate("car:patrol", "Earned the Piqua Patrol"); }
  }
  for (let n = 0; n < RACES_PER_DAY; n++) {
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
