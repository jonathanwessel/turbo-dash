// 🎯 Rival of the week (v1.13): the week number, who takes the turn, the level going up to the cap, the bonus,
// the reset on a new week, and that both race engines make exactly that rival faster (and only in a real race).
import { weekNo, rivalOfWeek, weekRival, weekRivalRace, weekRivalResult, rivalBoost, weekBase, weekCardDue, weekCardSeen, WEEK_RIVAL } from "../src/rival-week.js";
import { RIVALS, TRACKS, CARS, prizeFor } from "../src/data.js";
import { race, toyRace } from "./racebot.mjs";
import { statsFor } from "../src/stats.js";

let failed = 0;
const check = (name, ok, msg = "") => { if (!ok) { failed++; console.log(`  ✖ ${name} ${msg}`); } };

// weeks start on Monday and never move with the hour of the day
check("week 0", weekNo(new Date(2024, 0, 1, 0, 5)) === 0 && weekNo(new Date(2024, 0, 7, 23, 55)) === 0, "1 to 7 January 2024 is week 0");
check("week 1", weekNo(new Date(2024, 0, 8, 0, 1)) === 1, "Monday 8 January 2024 starts week 1");
check("a day is one week", weekNo(new Date(2026, 10, 21, 1)) === weekNo(new Date(2026, 10, 21, 23)), "");
check("Sunday then Monday", weekNo(new Date(2026, 10, 23)) === weekNo(new Date(2026, 10, 22)) + 1, "a new week starts on Monday");
// the five rivals take turns
{ const w = weekNo(new Date(2026, 10, 21)), seen = new Set(Array.from({ length: RIVALS.length }, (_, k) => rivalOfWeek(w + k)));
  check("turns", seen.size === RIVALS.length, `five weeks in a row gave ${seen.size} different rivals`);
  check("turns wrap", rivalOfWeek(w) === rivalOfWeek(w + RIVALS.length) && rivalOfWeek(-1) >= 0, ""); }
for (const r of RIVALS) check("says", typeof r.says === "string" && r.says.length > 4 && r.says.length < 34 && !/[:;]/.test(r.says), `${r.name} needs a short line with no colon`);

// the level goes up on a beat, pays half the 1st place prize, stops at the cap, and a new week starts over
{
  const S = { rank: 5, coins: 0 }, mon = new Date(2026, 10, 23, 10), t = TRACKS.find(x => x.id === "desert");
  const w = weekRival(S, mon), me = [0, 1, 2, 3, 4, 5].filter(k => k !== w.i + 1), ahead = [0, w.i + 1, ...me.slice(1)], behind = [w.i + 1, ...me];
  check("start", w.lvl === 0 && S.rivalWeek.w === weekNo(mon), JSON.stringify(S.rivalWeek));
  const lose = weekRivalResult(S, t, behind, "normal", mon);
  check("a loss", !lose.beat && !lose.up && lose.bonus === 0 && S.coins === 0 && S.rivalWeek.lvl === 0, JSON.stringify(lose));
  const won = weekRivalResult(S, t, ahead, "normal", mon), pay = Math.round(prizeFor(t, 1, "normal") * WEEK_RIVAL.pay / 5) * 5;
  check("a beat", won.beat && won.up && won.lvl === 1 && won.bonus === pay && S.coins === pay, JSON.stringify(won));
  // 2nd place but still ahead of the rival counts as a beat
  const second = weekRivalResult(S, t, [me[1], 0, w.i + 1, ...me.slice(2)], "normal", mon);
  check("ahead in 2nd", second.beat && second.lvl === 2, JSON.stringify(second));
  for (let k = 0; k < 10; k++) weekRivalResult(S, t, ahead, "normal", mon);
  check("cap", S.rivalWeek.lvl === WEEK_RIVAL.cap && S.coins === pay * WEEK_RIVAL.cap, `lvl ${S.rivalWeek.lvl}, coins ${S.coins}`);
  const atCap = weekRivalResult(S, t, ahead, "normal", mon);
  check("at the cap", atCap.beat && !atCap.up && atCap.bonus === 0 && atCap.max, JSON.stringify(atCap));
  check("boost", Math.abs(rivalBoost(S.rivalWeek.lvl) - (1 + WEEK_RIVAL.step * WEEK_RIVAL.cap)) < 1e-9 && rivalBoost(99) === rivalBoost(WEEK_RIVAL.cap) && rivalBoost(0) === 1, "");
  // the week's card shows once a week
  check("card due", weekCardDue(S, mon), ""); weekCardSeen(S, mon); check("card seen", !weekCardDue(S, mon), "");
  const next = new Date(2026, 10, 30, 10), nw = weekRival(S, next);
  check("new week", nw.lvl === 0 && nw.i !== w.i && S.rivalWeek.w === weekNo(next), JSON.stringify(S.rivalWeek));
  check("new week's card", weekCardDue(S, next), "the next week's rival never said hi");
}
// only from Rank 3, and only in races and cups
{
  const d = new Date(2026, 10, 23);
  check("rank gate", weekRivalRace({ rank: 2 }, "race", d) === null && weekRivalRace({ rank: 3 }, "race", d) !== null, "");
  check("kinds", ["boss", "trial", "preview"].every(k => weekRivalRace({ rank: 9 }, k, d) === null) && weekRivalRace({ rank: 9 }, "cup", d)?.boost === 1, "");
}

// never past the room under the player's top speed, and never slower than normal
check("room", weekBase(100, 1.05, 200) === 105 && weekBase(100, 1.05, 107) === 107 * WEEK_RIVAL.room && weekBase(100, 1.05, 100) === 100 && weekBase(100, 1, 300) === 100, "");
// both engines: exactly that rival is faster, and only in a real race (never the demo, a boss race or a Time Trial).
// A fast car leaves room for the whole boost; with the starter car the rival is already faster, so nothing changes.
for (const [name, eng, track, fast] of [["classic", race, TRACKS.find(t => t.id === "sunny"), "galaxy"], ["toy", toyRace, TRACKS.find(t => t.world === "toy"), "windup"]]) {
  const car = CARS[0], st = statsFor(car, { engine: 0, turbo: 0, tires: 0, magnet: 0 }, {});
  // (Toy Track World's rivals drive faster than any car's top speed, so there the test car gets extra speed to make room)
  const fc = CARS.find(c => c.id === fast), fst0 = statsFor(fc, { engine: 5, turbo: 5, tires: 5, magnet: 0 }, {}), fst = name === "toy" ? { ...fst0, maxSpeed: fst0.maxSpeed * 1.5 } : fst0;
  eng.setup(track, "race", fc, fst, {}); const plain = eng.rivals.map(c => c.base);
  eng.setup(track, "race", fc, fst, { weekRival: { i: 2, boost: 1.05 } }); const wk = eng.rivals.map(c => c.base);
  check(name + " boost", Math.abs(wk[2] / plain[2] - 1.05) < 1e-9 && wk.every((b, k) => k === 2 || b === plain[k]), JSON.stringify({ plain, wk }));
  eng.setup(track, "race", car, st, {}); const slow = eng.rivals[2].base;
  eng.setup(track, "race", car, st, { weekRival: { i: 2, boost: 1.05 } });
  check(name + " no room", eng.rivals[2].base === slow, "a rival already faster than the starter car got faster still");
  check(name + " badge", eng.rivals.filter(c => c.week).length === 1 && eng.rivals[2].week && eng.hud().progress.filter(p => p.wk).length === 1, "");
  eng.setup(track, "demo", car, st, { weekRival: { i: 2, boost: 1.05 } });
  check(name + " demo", !eng.rivals.some(c => c.week), "the menu's demo drive has a rival of the week");
  eng.setup(track, "race", car, st, { weekRival: { i: 0, boost: 1.05 }, trial: true });
  check(name + " trial", eng.rivals.length === 0, "");
  eng.setup(track, "race", car, st, { weekRival: { i: 0, boost: 1.05 }, boss: { def: CARS[1], name: "B", speed: 1.8 } });
  check(name + " boss", eng.rivals.length === 1 && !eng.rivals[0].week, "the boss became the rival of the week");
}

console.log(failed ? `\n${failed} rival of the week check(s) FAILED` : "✔ Rival of the week: weeks, turns, levels, the cap, the bonus and both engines");
process.exit(failed ? 1 : 0);
