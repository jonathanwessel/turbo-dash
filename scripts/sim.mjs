// Race simulator: runs whole races headless with a bot driver, so balance changes can be checked before a release.
//   npm run sim             -> finishing places per car tier, track and difficulty
//   npm run sim -- journey  -> plays a whole career (race, earn, buy) and reports how long each milestone takes
//   npm run sim -- ladder   -> wins per car on every Earth track, easiest first (finds difficulty gaps)
//   npm run sim -- boss     -> the slowest car that beats each boss in each round (in npm run check)
//   npm run sim -- best     -> races each "Best" badge pick against every car in many garages (in npm run check)
import { CARS, TRACKS, DIFFS, UPGRADES, UPGRADE_MAX, RIVALS, BOSSES, BOSS_ROUNDS, RESEARCH, prizeFor, upgradeCost, trackOpen } from "../src/data.js";
import { bossSpeed } from "../src/rules.js";
import { rivalBoost, WEEK_RIVAL } from "../src/rival-week.js";
import { rng, homeBonus } from "../src/physics-common.js";
import { race, runRace } from "./racebot.mjs";
import { statsFor } from "../src/stats.js";

// a car's real top speed on a track, fully upgraded: its speed with its trait (v1.16 ⚡ Fast cars are a little faster
// on top, 🛞 Grippy a little slower) and its home-world bonus there, so the car ladders below are sorted by what the
// car really does on that track
const topOf = (c, t) => statsFor(c, lvl(UPGRADE_MAX)).maxSpeed * homeBonus(c, t);
const ladderFor = t => [...CARS].sort((a, b) => topOf(a, t) - topOf(b, t));

const lvl = n => ({ engine: n, turbo: n, tires: n, magnet: 0 });

function table() {
  const tiers = [["zippy", 0], ["zippy", 3], ["bolt", 2], ["monster", 3], ["shark", 4], ["rocket", 5], ["galaxy", 5]];
  for (const diff of DIFFS) {
    console.log(`\n${diff.icon} ${diff.name}   (places on: ${TRACKS.map(t => t.id).join(" ")})`);
    for (const [id, n] of tiers) {
      const car = CARS.find(c => c.id === id);
      const places = TRACKS.map(t => { const a = runRace(t, car, lvl(n), diff.id).place, b = runRace(t, car, lvl(n), diff.id).place; return `${a}/${b}`; });
      console.log(`  ${(car.name + " +" + n).padEnd(16)} ${places.join("   ")}`);
    }
  }
}

function journey(diff = "normal", maxRaces = 500) {
  const st = { coins: 0, owned: ["zippy"], car: "zippy", ups: { zippy: lvl(0) }, best: {} };
  const unlocked = i => trackOpen(st, TRACKS[i]);
  const log = [];
  const note = (n, msg) => { log.push(`  race ${String(n).padStart(3)}: ${msg}`); };
  for (let n = 1; n <= maxRaces; n++) {
    const ti = Math.max(...TRACKS.map((t, i) => unlocked(i) ? i : 0)), track = TRACKS[ti];
    const car = CARS.find(c => c.id === st.car);
    const r = runRace(track, car, st.ups[st.car], diff);
    const chest = Math.round((30 + 25 * track.diff) * 7 / 3);
    st.coins += prizeFor(track, r.place, diff) + r.coins + chest;
    const before = st.best[track.id] || 99;
    st.best[track.id] = Math.min(before, r.place);
    if (r.place <= 3 && before > 3) for (const t of TRACKS.filter(x => x.after === track.id)) note(n, `opened ${t.name}`);
    if (r.place === 1 && before !== 1) note(n, `first win on ${track.name}`);
    // spend: next car first, otherwise the cheapest upgrade on the current car
    for (let bought = true; bought;) {
      bought = false;
      const next = CARS.find(c => c.price != null && !c.world && !st.owned.includes(c.id));
      if (next && st.coins >= next.price) {
        st.coins -= next.price; st.owned.push(next.id); st.car = next.id; st.ups[next.id] = lvl(0); bought = true;
        note(n, `bought ${next.name}`);
        continue;
      }
      const u = st.ups[st.car];
      const opts = UPGRADES.filter(x => x.id !== "magnet" && u[x.id] < UPGRADE_MAX).map(x => ({ id: x.id, cost: upgradeCost(st.car, u[x.id]) })).sort((a, b) => a.cost - b.cost);
      if (opts.length && st.coins >= opts[0].cost && (!next || st.coins - opts[0].cost >= 0)) { st.coins -= opts[0].cost; u[opts[0].id]++; bought = true; }
    }
    if (TRACKS.every(t => st.best[t.id] === 1)) { note(n, "gold on every track"); break; }
  }
  console.log(`\nJourney on ${diff}:\n` + log.join("\n"));
}

function auto() {
  const car = CARS.find(c => c.id === "shark"), track = TRACKS.find(t => t.id === "lava"), totalBoosts = 2 * race.T?.segs?.length;
  console.log("\nAuto Steer, hands off (Shark Fin +3 on Lava Mountain): level -> place, coins, boost pads hit");
  for (const L of [0, 1, 10, 25, 50, 75, 99, 100]) {
    const r = runRace(track, car, lvl(3), "normal", "none", {}, L);
    console.log(`  ${String(L).padStart(3)}: ${r.place}  coins ${String(r.coins).padStart(3)}  boost pads ${r.stats.pads}/14`);
  }
}

const mode = process.argv[2] || "table";
if (mode === "journey") journey(process.argv[3] || "normal");
else if (mode === "auto") auto();
else if (mode === "start") {
  // first races of a brand-new save: hands off must never place; a kid with the starter car should not win yet
  // v1.11.2: exits 1 (so `npm run check` stops) if hands-off ever reaches the podium (a podium opens the next
  // track), is not last at +0 or +1, or the kid driver wins with the starter car at +0. At +2 and +3 hands-off
  // sometimes passes one or two rivals that ease off to wait (soft catch-up); that is printed as a warning and has
  // its own box in PLAN.md (M1). The "good" driver at +0 is only printed: it is a skilled player.
  // v1.13: rivals ahead no longer wait for a car that keeps leaving the road, and "hands" (touching nothing at all,
  // the real hands-off) must be last at every level, 12 races each. "none" never steers but presses Turbo at random:
  // a Turbo bump can knock a rival aside, so at +2 and +3 it may pass one; that stays a printed warning.
  const z = CARS[0], t = TRACKS[0], last = RIVALS.length + 1, bad = [], warn = [];
  for (const bot of ["hands", "none", "kid", "good"]) for (const up of [0, 1, 2, 3]) {
    const places = Array.from({ length: bot === "hands" ? 12 : 6 }, () => runRace(t, z, lvl(up), "normal", bot).place), best = Math.min(...places);
    console.log(`  ${bot.padEnd(5)} Zippy +${up} on Sunny Hills: ${places.join(" ")}`);
    if (bot === "hands" && best < last) bad.push(`hands-off (no buttons) Zippy +${up} placed ${best}, not last (${last})`);
    if (bot === "none" && best <= 3) bad.push(`hands-off Zippy +${up} reached place ${best}`);
    else if (bot === "none" && best < last) (up <= 1 ? bad : warn).push(`hands-off Zippy +${up} placed ${best}, not last (${last})`);
    if (bot === "kid" && up === 0 && places.includes(1)) bad.push("the kid driver won the first race with the starter car at +0");
  }
  if (warn.length) console.log("\n! " + warn.join("\n! "));
  if (bad.length) { console.log("\n✖ " + bad.join("\n✖ ")); process.exit(1); }
  console.log("\n✔ Hands-off is last at every level, Turbo without steering never reaches the podium, and the starter car does not win the first race");
}
else if (mode === "rival") {
  // 🎯 v1.13 target (PLAN.md M1): the rival of the week at its cap never walls a track off. Every car, fully
  // upgraded, sorted by its top speed on that track (trait and home bonus, v1.16) is a ladder. For each track, "today's car" is the slowest one the kid driver wins
  // with (half of 8 races on Normal). The next faster car must still win 3 of 8 with the fastest rival (Rosie) as
  // the rival of the week at the cap. Exits 1 if any track fails. RIVAL_BOOST=1.03 tries another cap, RIVAL_SEED=n
  // another seed: the bot's random numbers are seeded, so the gate gives the same answer every run.
  { const r = rng(+(process.env.RIVAL_SEED || 1)); Math.random = r; }
  const ups = lvl(UPGRADE_MAX), N = 8, PASS = 3;
  const cap = { i: 0, boost: process.env.RIVAL_BOOST ? +process.env.RIVAL_BOOST : rivalBoost(WEEK_RIVAL.cap) };
  const wins = (t, car, week, n = N) => { let w = 0; for (let k = 0; k < n; k++) w += runRace(t, car, ups, "normal", "kid", {}, 0, null, false, null, week).place === 1; return w; };
  const bad = [];
  for (const t of TRACKS) {
    const ladder = ladderFor(t), k = ladder.findIndex(c => wins(t, c, null, 2) >= 1 && wins(t, c, null) >= N / 2);
    if (k < 0) { console.log(`  ${t.id.padEnd(12)} no car wins it today (not a rival of the week problem)`); continue; }
    const up = ladder.find(c => topOf(c, t) > topOf(ladder[k], t)) || ladder[k], w = wins(t, up, cap), base = wins(t, up, null);
    console.log(`  ${t.id.padEnd(12)} today ${ladder[k].name.padEnd(24)} one up ${up.name.padEnd(16)} wins ${base}/${N}, with Rosie at the cap ${w}/${N}`);
    if (w < PASS) bad.push(`${t.name}: ${up.name} wins ${w} of ${N} with the rival of the week at the cap`);
  }
  if (bad.length) { console.log("\n✖ " + bad.join("\n✖ ")); process.exit(1); }
  console.log(`
✔ Every track can still be won with the next faster car, with the rival of the week up to ${Math.round((cap.boost - 1) * 1000) / 10}% faster (held under ${Math.round(WEEK_RIVAL.room * 100)}% of the player's top speed)`);
}
else if (mode === "boss") {
  // 👑 v1.15 boss rematches: every round of every boss can be won. Every car, fully upgraded, with the Turbo Lab's
  // world kits done (no Auto Steer: it is off in boss races), sorted by speed is a ladder. For each boss and each
  // round (1 is the first race, 2 to 4 are 4% faster each), the slowest car the kid driver wins with (3 of 6) is
  // printed. Exits 1 if a round has no such car. BOSS_SEED=n tries another seed.
  { const r = rng(+(process.env.BOSS_SEED || 1)); Math.random = r; }
  const ups = lvl(UPGRADE_MAX), N = 6, PASS = 3;
  const lab = Object.fromEntries(RESEARCH.filter(r => r.id !== "autoSteer").map(r => [r.id, r.max]));
  const bad = [];
  for (const b of BOSSES) {
    const t = TRACKS.find(x => x.id === b.track), row = [], ladder = ladderFor(t);
    for (let level = 0; level <= BOSS_ROUNDS.max; level++) {
      const boss = { ...b, speed: bossSpeed(b, level), def: CARS.find(c => c.id === b.car) };
      let hit = null;
      for (const c of ladder) {
        let w = 0; for (let k = 0; k < N && w < PASS && w + N - k >= PASS; k++) w += runRace(t, c, ups, "normal", "kid", lab, 0, boss).place === 1;
        if (w >= PASS) { hit = c; break; }
      }
      row.push(`Round ${level + 1} ${(hit ? hit.name : "nobody").padEnd(16)}`);
      if (!hit) bad.push(`${b.name} Round ${level + 1}: no car wins ${PASS} of ${N}`);
    }
    console.log(`  ${b.name.padEnd(18)} ${row.join(" ")}`);
  }
  if (bad.length) { console.log("\n✖ " + bad.join("\n✖ ")); process.exit(1); }
  console.log(`\n✔ Every boss can be beaten in every round (up to ${Math.round(BOSS_ROUNDS.speed * BOSS_ROUNDS.max * 100)}% faster)`);
}
else if (mode === "best") {
  // 🏆 v1.17 "Best" badges (src/best.js): the badge's pick is raced against every car in the garage. Random garages
  // (cars, upgrade levels and the car being driven, seeded) plus the career bot's Rank 16 save, on every track, each
  // car racing alone with the kid driver (3 seeded races). Exits 1 when a pick is more than 4% slower than the
  // fastest car there, when a badge would ask for a swap to a car that is not faster than the one being driven, or
  // when fewer than 93 picks in 100 are the fastest car. BEST_SEED=n tries other garages.
  const { bestCar } = await import("../src/best.js");
  const mid = JSON.parse((await import("node:fs")).readFileSync(new URL("../src/dev/mid-save.json", import.meta.url), "utf8"));
  const R = rng(+(process.env.BEST_SEED || 1)), seed = s => rng(s);
  const timeOf = (t, c, u, lab) => { let sum = 0; for (let k = 0; k < 3; k++) { Math.random = seed(1000 + k); sum += runRace(t, c, u, "normal", "kid", lab, 0, null, true).time; } return sum / 3; };
  const garages = [{ name: "Rank 16 save", owned: CARS.filter(c => mid.owned.includes(c.id)), ups: mid.ups, lab: mid.research, car: mid.car }];
  for (let g = 0; g < 24; g++) {
    const owned = CARS.filter(() => R() < 0.4); if (owned.length < 2) continue;
    const ups = Object.fromEntries(owned.map(c => [c.id, { engine: Math.floor(R() * 6), turbo: Math.floor(R() * 6), tires: Math.floor(R() * 6), magnet: 0 }]));
    garages.push({ name: "garage " + (g + 1), owned, ups, lab: {}, car: owned[Math.floor(R() * owned.length)].id });
  }
  let n = 0, exact = 0, swaps = 0, worst = 0; const bad = [];
  for (const G of garages) for (const t of TRACKS) {
    const upsOf = id => G.ups[id], pick = bestCar(t, G.owned, upsOf, G.lab, G.car);
    const times = new Map(G.owned.map(c => [c.id, timeOf(t, c, upsOf(c.id), G.lab)]));
    const fastest = Math.min(...times.values()), mine = times.get(pick.id), loss = mine / fastest - 1;
    n++; if (mine === fastest) exact++; worst = Math.max(worst, loss);
    if (loss > 0.04) bad.push(`${G.name}, ${t.name}: ${pick.name} is ${(loss * 100).toFixed(1)}% slower than the fastest car`);
    if (pick.id !== G.car) { swaps++; if (mine >= times.get(G.car)) bad.push(`${G.name}, ${t.name}: the badge names ${pick.name}, which is not faster than ${CARS.find(c => c.id === G.car).name}`); }
  }
  console.log(`  ${garages.length} garages x ${TRACKS.length} tracks: the pick is the fastest car ${exact} of ${n} times (${(100 * exact / n).toFixed(1)}%), at worst ${(worst * 100).toFixed(1)}% slower. ${swaps} badges name another car than the one being driven.`);
  if (exact / n < 0.93) bad.push(`the pick is the fastest car only ${(100 * exact / n).toFixed(1)}% of the time (93% needed)`);
  if (bad.length) { console.log("\n✖ " + bad.slice(0, 12).join("\n✖ ")); process.exit(1); }
  console.log("\n✔ Every Best badge names a car within 4% of the fastest, and never asks for a swap to a slower car");
}
else if (mode === "ladder") {
  // v1.9: wins out of 4 (and the average place) for each car on every Earth track, easiest first, on Normal.
  // A car wins every time up to some track and then never; tracks spaced closely keep that edge soft.
  const earth = TRACKS.filter(t => t.world === "earth").sort((a, b) => a.diff - b.diff);
  const tiers = [["zippy", 2], ["zippy", 4], ["bolt", 2], ["bolt", 4], ["monster", 3], ["monster", 4], ["shark", 3], ["shark", 4], ["shark", 5], ["rocket", 5]];
  console.log("".padEnd(14) + earth.map(t => (t.id + " " + t.diff).padEnd(13)).join(""));
  for (const [id, n] of tiers) {
    const car = CARS.find(c => c.id === id);
    console.log((car.name + " +" + n).padEnd(14) + earth.map(t => { let w = 0, p = 0; for (let k = 0; k < 4; k++) { const r = runRace(t, car, lvl(n), "normal"); w += r.place === 1; p += r.place; } return (w + "w " + (p / 4).toFixed(1)).padEnd(13); }).join(""));
  }
}
else table();
