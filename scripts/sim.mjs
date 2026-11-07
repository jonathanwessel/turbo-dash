// Race simulator: runs whole races headless with a bot driver, so balance changes can be checked before a release.
//   npm run sim             -> finishing places per car tier, track and difficulty
//   npm run sim -- journey  -> plays a whole career (race, earn, buy) and reports how long each milestone takes
import { CARS, TRACKS, DIFFS, UPGRADES, UPGRADE_MAX, prizeFor, upgradeCost, trackOpen } from "../src/data.js";
import { race, runRace } from "./racebot.mjs";

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
      const next = CARS.find(c => c.price != null && !st.owned.includes(c.id));
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
else table();
