// Reward rules (src/rules.js): fixed inputs, fixed answers. The game and the career simulator both use these.
//   node scripts/test-rules.mjs   (part of npm test)
import { TRACKS, CUPS, BOSSES, REWARDS, GOALS, prizeFor, diffOf, trialTimes, trackOpen, inSeason } from "../src/data.js";
import { raceReward, chestValues, bossReward, trialReward, cupOrder, cupEndReward, rankUp, claimGift, giftInfo, treat, claimMission, missionsBonus, lapBonus, bonusLeft, goodStudentPct, activeBoosts, grantCar, chip, keepOpens, seasonUnlock } from "../src/rules.js";

let fails = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { fails++; console.log("  ✖ " + msg); } };
const fresh = (over = {}) => ({
  coins: 0, owned: ["zippy"], car: "zippy", ups: { zippy: { engine: 0, turbo: 0, tires: 0, magnet: 0 } }, best: {}, bestD: {}, mastery: {}, research: {}, cups: {}, bosses: {},
  trials: {}, trialMedals: {}, chips: 0, chipLog: {}, races: 0, wins: 0, rank: 5, stats: {}, museum: [], days: {}, history: [], dirt: {}, sparkle: "", daily: {},
  lastGift: "", giftStreak: 0, school: { earned: 0, log: [], capT: 6, boosts: [] }, ...over,
});
const sunny = TRACKS[0], race = (place, extra = {}) => ({ place, coins: 12, time: 60, standings: [0, 1, 2, 3, 4, 5], stats: { stunts: 2, turbos: 1, bams: 1, powers: 1 }, ...extra });

{ // a race: prize + road coins, wins, best, mastery, history, stats; a boss race leaves best/mastery alone
  const S = fresh(), res = raceReward(S, sunny, race(1), { diff: "normal", day: "2027-01-01" });
  check(res.prize === prizeFor(sunny, 1, "normal") && S.coins === res.prize + 12, `race prize ${res.prize}, coins ${S.coins}`);
  check(S.races === 1 && S.wins === 1 && S.best[sunny.id] === 1 && S.mastery[sunny.id + ":normal"] === 1 && res.firstWin, "a win should count everywhere");
  check(S.history.length === 1 && S.stats.roadCoins === 12 && S.stats.stunts === 2 && S.days["2027-01-01"] === 1, "history, stats and days");
  const B = fresh(); raceReward(B, sunny, race(1), { boss: true });
  check(!B.best[sunny.id] && !B.mastery[sunny.id + ":normal"], "a boss race should not change best or mastery");
  const K = fresh({ research: { coinBoost: 4 }, sparkle: "x" }), k = raceReward(K, sunny, race(2), { diff: "hard" });
  check(k.prize === Math.round(prizeFor(sunny, 2, "hard") * 1.2) && k.sparkle === Math.max(5, Math.round(k.prize * 0.1)) && !K.sparkle, "coin boost and sparkle bonus");
  const H = fresh(); raceReward(H, sunny, race(1), { diff: "hard" }); check(H.chips === 1, "a hard win pays a chip");
}
{ // chests: base, x2, x4
  const v = chestValues(fresh(), sunny, "normal", () => 0.3).sort((a, b) => a - b), b = Math.round(REWARDS.chestBase(sunny.diff) * diffOf("normal").pay);
  check(v[0] === b && v[1] === 2 * b && v[2] === 4 * b, `chests ${v}`);
}
{ // bosses: 5000 the first time, 1000 after; the car once
  const S = fresh(), b = BOSSES[0], first = bossReward(S, b), again = bossReward(S, b);
  check(first.first && first.bonus === 5000 && first.car && S.owned.includes(b.car), "first boss win");
  check(!again.first && again.bonus === 1000 && !again.car && S.coins === 6000, "a repeat boss win pays 1000");
}
{ // a boss race that isn't won pays half its place's prize; a win pays in full, and a Hard boss win still earns the track's Hard chip
  const L = fresh(), lost = raceReward(L, sunny, race(2), { diff: "normal", boss: true });
  check(lost.prize === Math.round(prizeFor(sunny, 2, "normal") * 0.5) && L.coins === lost.prize + 12, `a lost boss race paid ${lost.prize}, half of 2nd is ${Math.round(prizeFor(sunny, 2, "normal") * 0.5)}`);
  const W = fresh(), won = raceReward(W, sunny, race(1), { diff: "hard", boss: true });
  check(won.prize === prizeFor(sunny, 1, "hard") && W.chips === 1 && W.chipLog["hard:" + sunny.id], "a Hard boss win should pay in full and earn the Hard chip");
  const N = fresh(), not = raceReward(N, sunny, race(2), { diff: "normal" }); check(not.prize === prizeFor(sunny, 2, "normal"), "a normal 2nd place should pay in full");
}
{ // 🍂 seasonal tracks: open in their window (any year), then for good; never part of a goal
  const haunted = TRACKS.find(t => t.id === "haunted"), d = (m, day, y = 2027) => new Date(y, m - 1, day);
  check(inSeason(haunted.season, d(10, 1)) && inSeason(haunted.season, d(11, 15)) && inSeason(haunted.season, d(10, 31, 2031)), "Haunted Hill should open from 1 October to 15 November");
  check(!inSeason(haunted.season, d(9, 30)) && !inSeason(haunted.season, d(11, 16)) && !inSeason(haunted.season, d(3, 1)), "Haunted Hill opened outside its season");
  check(inSeason({ from: [12, 20], to: [1, 5] }, d(1, 2)) && inSeason({ from: [12, 20], to: [1, 5] }, d(12, 25)) && !inSeason({ from: [12, 20], to: [1, 5] }, d(1, 6)), "a season across New Year");
  const S = fresh({ bestD: { "pirate:normal": 1 }, best: { pirate: 1 } });
  check(!trackOpen(S, haunted) && seasonUnlock(S, d(3, 1)).length === 0 && !trackOpen(S, haunted), "Haunted Hill opened in March");
  check(seasonUnlock(S, d(10, 20)).map(t => t.id).join() === "haunted" && trackOpen(S, haunted) && seasonUnlock(S, d(10, 21)).length === 0, "Haunted Hill should open once in October");
  check(trackOpen(S, haunted), "Haunted Hill closed after its season");
  const goal = GOALS.find(g => g.id === "tracks"); check(goal.goal === TRACKS.filter(t => !t.season).length, "a seasonal track counts toward Open every track");
  check(!TRACKS.some(t => t.after === "haunted") && !CUPS.some(c => c.tracks.includes("haunted")), "something depends on a seasonal track");
  const K = fresh({ bestD: { "sunny:normal": 1 } }); check(keepOpens(K).map(t => t.id).join() === "sunny,beach" && K.opened.beach === 1 && keepOpens(K).length === 0, "keepOpens should record a newly open track once");
}
{ // cups: ties go to the player; first place gets the car and a chip once
  check(cupOrder([10, 10, 3, 3, 1, 0])[0] === 0 && cupOrder([3, 10, 10, 3, 1, 0]).indexOf(0) === 2, "cup ties go to the player");
  const S = fresh(), cup = CUPS[0], res = cupEndReward(S, cup, "normal", [30, 20, 10, 5, 1, 0]);
  check(res.place === 1 && res.car && res.chip && S.coins === Math.round(cup.bonus * diffOf("normal").pay), `cup win pays ${S.coins}`);
  const again = cupEndReward(S, cup, "normal", [30, 20, 10, 5, 1, 0]); check(!again.car && !again.chip, "cup car and chip only once");
}
{ // Time Trial: medals pay once each, records keep the best time
  const S = fresh(), t = TRACKS[0], L = 400000, gold = trialTimes(t, L)[2];
  const a = trialReward(S, t, { time: gold - 1, coins: 5, stats: {} }, L), b = trialReward(S, t, { time: gold, coins: 0, stats: {} }, L);
  check(a.record && a.medal === 3 && a.pay > 0 && !b.record && b.pay === 0 && S.trials[t.id] === Math.round((gold - 1) * 100) / 100, "trial medals and records");
  // the Good Student bonus is paid on a Time Trial too (the race screen shows the badge)
  const G = fresh(), T0 = 1e12; G.school.boosts = [{ p: 20, until: T0 + 10 * 60000 }];
  const g = trialReward(G, t, { time: gold - 1, coins: 5, stats: {} }, L, T0);
  check(g.student === Math.round((g.pay + 5) * 0.2) && G.coins === g.pay + 5 + g.student, `a +20% bonus on a Time Trial paid ${g.student}`);
}
{ // rank up, gift streak, treats, missions
  const S = fresh(); const r = rankUp(S, "d"); check(S.rank === 6 && r.coins === 1200 && r.chip, "rank 6 pays 1200 and a chip");
  const G = fresh(); claimGift(G, "d1", "d0"); claimGift(G, "d2", "d1"); check(G.giftStreak === 2 && G.coins === 150 + 200 && claimGift(G, "d2", "d1") === null, "gift streak");
  check(giftInfo(G, "d9", "d8").streak === 1, "a missed day restarts the streak");
  const T = fresh({ rank: 20 }); check(treat(T, "icecream", "d").coins === 800 && treat(T, "icecream", "d") === null && treat(T, "park", "d", 3).chip === true, "treats once a day");
  check(treat(T, "fire", "d").car && treat(T, "fire", "d") === null, "the fire truck only once");
  const M = fresh({ rank: 10 }), list = [0, 1, 2].map(() => ({ reward: REWARDS.mission(10), goal: 1, have: 1, claimed: false }));
  const day = { day: "d", bonus: false, list };
  check(claimMission(M, list[0]) === 350 && missionsBonus(M, day) === null, "a mission pays its reward; no bonus until all 3");
  claimMission(M, list[1]); claimMission(M, list[2]); const bonus = missionsBonus(M, day); check(bonus.coins === 700 && bonus.chip && missionsBonus(M, day) === null, "missions bonus once");
}
{ // laps: 2 bonus steps for a perfect lap, 1 otherwise, one daily limit for math and word together
  const S = fresh(); let got = 0;
  const T0 = 1e12, MIN = 60000;
  for (const [kind, perfect] of [["math", true], ["word", true], ["math", false], ["word", true]]) got += lapBonus(S, kind, perfect, 5, "d", T0).steps;
  check(got === 6 && bonusLeft(S, "d") === 0 && lapBonus(S, "math", true, 5, "d", T0).steps === 0, `daily cap (got ${got} steps)`);
  check(goodStudentPct(S, T0) === 60, `bonuses should stack to +60% (got ${goodStudentPct(S, T0)})`);
  check(goodStudentPct(S, T0 + 29 * MIN) === 60 && goodStudentPct(S, T0 + 31 * MIN) === 0, "a bonus should last 30 minutes, then stop");
  check(bonusLeft(S, "e") === 6, "a new day resets the limit");
  // a race pays the bonus on its prize and road coins
  const R1 = fresh(); lapBonus(R1, "math", true, 5, "d", T0); const res = raceReward(R1, sunny, race(1), { diff: "normal", now: T0 + 5 * MIN });
  check(res.student === Math.round((res.prize + 12) * 0.2) && R1.coins === res.prize + 12 + res.student, `a +20% bonus paid ${res.student}`);
  const R2 = fresh(); lapBonus(R2, "math", true, 5, "d", T0); check(raceReward(R2, sunny, race(1), { diff: "normal", now: T0 + 40 * MIN }).student === 0, "an expired bonus still paid");
  // the race history shows every coin paid, the bonus included
  check(R1.history[0].c === res.prize + 12 + res.student, `history shows ${R1.history[0].c} coins, the race paid ${res.prize + 12 + res.student}`);
  // a bonus from a wrong device clock (years in the future) still ends 30 minutes after now
  const W = fresh(); W.school.boosts = [{ p: 20, until: 9e15 }];
  check(goodStudentPct(W, T0) === 20 && activeBoosts(W, T0)[0].until === T0 + 30 * MIN, "a far-future bonus should be cut to 30 minutes");
  lapBonus(W, "math", false, 5, "d", T0); check(W.school.boosts.every(b => b.until <= T0 + 30 * MIN), "a lap should store the cut-down bonus");
}
{ // cars and chips never twice
  const S = fresh(); check(grantCar(S, "bolt") && !grantCar(S, "bolt") && S.owned.filter(c => c === "bolt").length === 1 && S.ups.bolt.engine === 0, "grantCar once");
  check(chip(S, "k") && !chip(S, "k") && S.chips === 1, "a chip key pays once");
}
console.log(fails ? `\n✖ ${fails} of ${checks} rule checks failed` : `All ${checks} rule checks passed`);
process.exit(fails ? 1 : 0);
