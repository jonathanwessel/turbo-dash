// 🎯 Rival of the week (v1.13). The five named rivals take turns, one calendar week each (Monday to Sunday). This
// week's rival is in every race (cups too, never in boss races or Time Trials) with a target badge over its car.
// Each time the player finishes ahead of them, they get a little faster, up to a cap, and the first beats of the
// week pay a bonus. A new week brings the next rival back to their normal speed. The boost never takes the rival
// past a share of the player's own top speed (`room`), so a track the player can win stays winnable: v1.13's
// `npm run sim -- rival` found that a plain boost walls tracks off. On Space Road the next car up and the fastest
// rival have nearly the same top speed, so even +1.5% turned 8 wins of 8 into 0 on one seed, and a boost only
// while chasing did the same.
// Plain rules, no page: both engines, the game (src/main.js), the race sim and the career run use these.
import { RIVALS, prizeFor } from "./data.js";

export const WEEK_RIVAL = {
  rank: 3,        // opens at this Racer Rank (after the first lessons and Hard)
  step: 0.01,     // each beat makes the rival this much faster (1%)
  cap: 5,         // at most this many steps a week (+5%)
  room: 0.95,     // but never faster than this share of the player's top speed (a rival already faster stays as is)
  pay: 0.5,       // a beat below the cap pays half of that track's 1st place prize
};

/* the week number of a day (weeks start on Monday; week 0 began Monday 1 January 2024). Uses the local date only,
   so a clock change never moves a week. */
export function weekNo(date = new Date()) {
  const days = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(2024, 0, 1)) / 864e5);
  return Math.floor(days / 7);
}
/* which rival (an index into RIVALS) is the rival of week w */
export const rivalOfWeek = w => ((w % RIVALS.length) + RIVALS.length) % RIVALS.length;

/* brings the save's rival of the week up to date (a new week starts over at level 0) and returns
   { i, def, lvl, max, week }. Changes S only when the week has changed. */
export function weekRival(S, date = new Date()) {
  const w = weekNo(date);
  if (!S.rivalWeek || S.rivalWeek.w !== w) S.rivalWeek = { w, lvl: 0, seen: S.rivalWeek?.seen ?? -1 };
  const i = rivalOfWeek(w);
  return { i, def: RIVALS[i], name: RIVALS[i].name, lvl: S.rivalWeek.lvl, max: S.rivalWeek.lvl >= WEEK_RIVAL.cap, week: w };
}
export const weekRivalOpen = S => (S.rank || 1) >= WEEK_RIVAL.rank;
/* how much faster the rival drives at a level (1 = normal) */
export const rivalBoost = lvl => 1 + WEEK_RIVAL.step * Math.min(Math.max(0, lvl), WEEK_RIVAL.cap);
/* the rival of the week's speed in a race: the boost, held under the player's top speed (never lowered) */
export const weekBase = (base, boost, playerTop) => Math.max(base, Math.min(base * boost, playerTop * WEEK_RIVAL.room));
/* what a race engine needs: { i, boost }, or null when the rival of the week is not in this race */
export function weekRivalRace(S, kind, date = new Date()) {
  if (!weekRivalOpen(S) || (kind !== "race" && kind !== "cup")) return null;
  const r = weekRival(S, date);
  return { i: r.i, boost: rivalBoost(r.lvl) };
}

/* after a race with the rival of the week in it. standings: racer numbers in finishing order (0 = the player,
   k = rival k - 1). Returns { beat, up, lvl, max, bonus, name } and pays the bonus into S.coins. */
export function weekRivalResult(S, track, standings, diff = "normal", date = new Date()) {
  const r = weekRival(S, date), me = standings.indexOf(0), them = standings.indexOf(r.i + 1);
  const beat = me >= 0 && them >= 0 && me < them;
  let up = false, bonus = 0;
  if (beat && S.rivalWeek.lvl < WEEK_RIVAL.cap) {
    S.rivalWeek.lvl++; up = true;
    bonus = Math.round(prizeFor(track, 1, diff) * WEEK_RIVAL.pay / 5) * 5;
    S.coins += bonus;
  }
  return { beat, up, lvl: S.rivalWeek.lvl, max: S.rivalWeek.lvl >= WEEK_RIVAL.cap, bonus, name: r.name, i: r.i };
}
/* the "new rival this week" card shows once a week */
export const weekCardDue = (S, date = new Date()) => weekRivalOpen(S) && weekRival(S, date).week !== S.rivalWeek.seen;
export const weekCardSeen = (S, date = new Date()) => { S.rivalWeek.seen = weekRival(S, date).week; };

/* ---------- drawing (shared by the classic road and the Toy Track World overlay) ---------- */
/* a target badge over the rival of the week: red and white rings with a dark rim and a tail down to the car, so it
   reads on snow and on pale toy tracks. (x, y) is the tip of the tail; r the badge's radius. */
export function drawTargetBadge(ctx, x, y, r) {
  const cy = y - r * 1.5, lw = Math.max(2, r * 0.16);
  ctx.lineWidth = lw; ctx.strokeStyle = "#10142a"; ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.moveTo(x - r * 0.35, cy + r * 0.8); ctx.lineTo(x, y); ctx.lineTo(x + r * 0.35, cy + r * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#e8262b"; ctx.beginPath(); ctx.arc(x, cy, r * 0.72, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(x, cy, r * 0.48, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#e8262b"; ctx.beginPath(); ctx.arc(x, cy, r * 0.24, 0, Math.PI * 2); ctx.fill();
}
