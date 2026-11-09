// The game's reward rules in one place: what a race, chest, boss, cup, Time Trial, rank-up, gift, treat or lap pays.
// No page and no storage here: every function takes the save (S), changes it, and returns what happened so the
// screen can show it. The game (src/main.js) and the career simulator (scripts/career.mjs) both use these, so the
// simulator checks the same rules the game plays by. Numbers live in REWARDS (src/data.js).
import { REWARDS, UPGRADES, CUP_POINTS, prizeFor, diffOf, starsFor, trialMedal, trialPay, GOOD_STUDENT } from "./data.js";

export const dayKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const coinBoost = S => 1 + REWARDS.coinBoost * (S.research.coinBoost || 0);

/* one-time Brain Chips (each key pays once) */
export function chip(S, key) { if (S.chipLog[key]) return false; S.chipLog[key] = 1; S.chips++; return true; }
export function museumAdd(S, icon, text, day) { if (!S.museum) return; S.museum.unshift({ d: day, icon, text }); S.museum.length = Math.min(S.museum.length, 200); }
/* a car joins the garage with fresh upgrades; false if it was already there */
export function grantCar(S, id) {
  if (S.owned.includes(id)) return false;
  S.owned.push(id); S.ups[id] ||= Object.fromEntries(UPGRADES.map(u => [u.id, 0])); return true;
}
export function addRaceStats(S, r) {
  const st = S.stats, rs = r.stats || {};
  for (const k of ["stunts", "turbos", "bams", "powers", "rings", "pearls", "drifts", "loops"]) st[k] = (st[k] || 0) + (rs[k] || 0);
  st.roadCoins = (st.roadCoins || 0) + (r.coins || 0);
}

/* a normal race (also each cup race and a boss race). opts: { diff, boss, cup, day, now (ms, for the Good Student bonus) }
   returns { prize, sparkle, starUp, firstWin, student } */
export function raceReward(S, track, r, { diff = S.diff, boss = false, cup = null, day, now = 0 } = {}) {
  const prize = Math.round(prizeFor(track, r.place, diff) * coinBoost(S)), dk = track.id + ":" + diff;
  S.races++; if (r.place === 1) S.wins++;
  if (S.days && day) { S.days[day] = (S.days[day] || 0) + 1; for (const old of Object.keys(S.days).sort().reverse().slice(30)) delete S.days[old]; }
  const firstWin = r.place === 1 && !boss && S.best[track.id] !== 1;
  if (firstWin) museumAdd(S, track.icon, `First win on ${track.name}`, day);
  let starUp = 0;
  if (!boss) {
    S.best[track.id] = Math.min(S.best[track.id] || 99, r.place);
    S.bestD[dk] = Math.min(S.bestD[dk] || 99, r.place);
    if (r.place === 1) { const before = starsFor(S.mastery[dk] || 0); S.mastery[dk] = (S.mastery[dk] || 0) + 1; if (starsFor(S.mastery[dk]) > before) starUp = starsFor(S.mastery[dk]); }
  }
  S.coins += prize + r.coins;
  const gs = now ? goodStudentPct(S, now) : 0, student = Math.round((prize + r.coins) * gs / 100);   // 📚 the lap bonus
  S.coins += student;
  let sparkle = 0;
  if (S.sparkle && !boss) { sparkle = Math.max(5, Math.round(prize * REWARDS.sparkle)); S.coins += sparkle; S.sparkle = ""; }
  if (S.history) { S.history.unshift({ d: day, t: track.id, df: diff, p: r.place, c: prize + r.coins + student + sparkle }); S.history.length = Math.min(S.history.length, 30); }
  if (S.dirt) S.dirt[S.car] = Math.min(5, (S.dirt[S.car] || 0) + 1);
  if (diff === "hard" && r.place === 1) chip(S, "hard:" + track.id);
  if (cup && r.standings) r.standings.forEach((k, n) => { cup.pts[k] += CUP_POINTS[n]; });
  addRaceStats(S, r);
  return { prize, sparkle, starUp, firstWin, student };
}
/* the three treasure chests after a race (one is picked) */
export function chestValues(S, track, diff = S.diff, rnd = Math.random) {
  const base = Math.round(REWARDS.chestBase(track.diff) * diffOf(diff).pay * (1 + REWARDS.luckyChests * (S.research.luckyChests || 0)));
  return [base, base * 2, base * 4].sort(() => rnd() - 0.5);
}
/* a boss race won: 5000 the first time, 1000 after; the boss's car and a chip */
export function bossReward(S, b, day) {
  const first = !S.bosses[b.id], bonus = first ? REWARDS.bossFirst : REWARDS.bossAgain;
  S.bosses[b.id] = true; S.coins += bonus;
  if (first) museumAdd(S, b.icon, `Beat ${b.name}`, day);
  const car = grantCar(S, b.car);
  const gotChip = chip(S, "boss:" + b.id);
  return { first, bonus, car, chip: gotChip };
}
/* a Time Trial finished (len = track length); the ghost is saved by the game, not here */
export function trialReward(S, track, r, len) {
  const time = Math.round(r.time * 100) / 100, before = S.trials[track.id], oldMedal = S.trialMedals[track.id] || 0;
  const medal = trialMedal(track, len, time), record = !before || time < before;
  let pay = 0; for (let m = oldMedal + 1; m <= medal; m++) pay += trialPay(track, m);
  if (record) S.trials[track.id] = time;
  if (medal > oldMedal) S.trialMedals[track.id] = medal;
  S.coins += pay + r.coins;
  addRaceStats(S, { ...r, stats: { ...r.stats, bams: 0 } });
  return { time, before, oldMedal, medal, record, pay };
}
/* cup standings: most points first; on a tie the player goes ahead */
export const cupOrder = pts => [0, 1, 2, 3, 4, 5].sort((a, b) => pts[b] - pts[a] || (a === 0 ? -1 : b === 0 ? 1 : 0));
export function cupEndReward(S, cup, diff, pts, day) {
  const order = cupOrder(pts), place = order.indexOf(0) + 1, key = cup.id + ":" + diff;
  const coins = Math.round(cup.bonus * diffOf(diff).pay * REWARDS.cupShare[place - 1] * coinBoost(S));
  const wonBefore = ["easy", "normal", "hard"].some(df => S.cups[cup.id + ":" + df] === 1);
  S.cups[key] = Math.min(S.cups[key] || 99, place); S.coins += coins;
  let car = false, gotChip = false;
  if (place === 1) {
    if (!wonBefore) museumAdd(S, "🏆", `Won the ${cup.name}`, day);
    car = grantCar(S, cup.car); gotChip = chip(S, "cup:" + key);
  }
  return { order, place, coins, car, chip: gotChip };
}
/* one rank up (the caller checks the gauges are full) */
export function rankUp(S, day, title = "") {
  S.rank++;
  museumAdd(S, "⭐", `Reached Rank ${S.rank}${title ? ", " + title : ""}`, day);
  const coins = REWARDS.rankUp(S.rank); S.coins += coins;
  const gotChip = S.rank >= REWARDS.rankChipFrom && chip(S, "rank:" + S.rank);
  return { coins, chip: gotChip };
}
/* the daily gift: grows for 7 days in a row */
export function giftInfo(S, today, yesterday) { const streak = S.lastGift === yesterday ? S.giftStreak + 1 : 1; return { streak, amount: REWARDS.gift(streak) }; }
export function claimGift(S, today, yesterday) {
  if (S.lastGift === today) return null;
  const g = giftInfo(S, today, yesterday);
  S.lastGift = today; S.giftStreak = g.streak; S.coins += g.amount;
  return { ...g, chip: g.streak % 7 === 0 && chip(S, "gift7:" + today) };
}
/* Main Street treats, once a day each (fire station: once ever). dayNumber picks the park's chip days. */
export function treat(S, id, today, dayNumber) {
  if (id === "icecream") { if (S.daily.icecream === today) return null; S.daily.icecream = today; const coins = REWARDS.icecream(S.rank); S.coins += coins; return { coins }; }
  if (id === "park") { if (S.daily.park === today) return null; S.daily.park = today; const coins = REWARDS.park(S.rank); S.coins += coins; return { coins, chip: dayNumber % 3 === 0 && chip(S, "park:" + today) }; }
  if (id === "fire") { if (!grantCar(S, "firetruck")) return null; museumAdd(S, "🚒", "Got Fire Dash from the firefighters", today); return { car: "firetruck" }; }
  return null;
}
/* daily missions: one claimed, and the bonus for all three */
export const missionPay = (S, m) => m.reward;
export function claimMission(S, m) { if (m.claimed || m.have < m.goal) return 0; m.claimed = true; const c = missionPay(S, m); S.coins += c; return c; }
export function missionsBonus(S, M) {
  if (M.bonus || !M.list.every(m => m.claimed)) return null;
  M.bonus = true; const coins = REWARDS.missionsAll(S.rank); S.coins += coins;
  return { coins, chip: chip(S, "missions:" + M.day) };
}
/* Math and Word Laps: each lap adds a Good Student bonus (one step = +10% race coins, two for a perfect lap) that
   lasts 30 real minutes; bonuses stack. The grown-up's daily limit counts steps for both laps together. */
export const LAPS = ["math", "word"];
export const lapToday = (S, a, today) => S.school.log.find(e => e.a === a && e.d === today) || null;
export const bonusLeft = (S, today) => S.school.capT ? Math.max(0, S.school.capT - LAPS.map(a => lapToday(S, a, today)).filter(Boolean).reduce((n, e) => n + (e.t || 0), 0)) : Infinity;
export const activeBoosts = (S, now) => (S.school.boosts || []).filter(b => b.until > now).map(b => ({ p: b.p, until: Math.min(b.until, now + GOOD_STUDENT.mins * 60000) }));
export const goodStudentPct = (S, now) => activeBoosts(S, now).reduce((n, b) => n + b.p, 0);
export function lapBonus(S, kind, perfect, questions, today, now) {
  const sc = S.school, steps = Math.min(perfect ? 2 : 1, bonusLeft(S, today));
  let e = lapToday(S, kind, today);
  if (!e) { e = { d: today, a: kind, m: 0, t: 0 }; sc.log.unshift(e); sc.log.length = Math.min(sc.log.length, 60); }
  e.m += questions; e.t += steps; sc.earned += steps;
  sc.boosts = activeBoosts(S, now);
  if (steps) sc.boosts.push({ p: steps * GOOD_STUDENT.pct, until: now + GOOD_STUDENT.mins * 60000 });
  return { steps, pct: steps * GOOD_STUDENT.pct };
}
