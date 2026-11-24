// 🌟 Special cars (v1.19): one per world, earned by doing that world's own thing (rings, pearls, drifts, loops).
//   node scripts/test-earn.mjs   (part of npm test)
// The rule (earnCars in src/rules.js) runs after every race and when a save loads, so an old save that already
// collected enough gets the car too ("New choices reach old saves" in games/CLAUDE.md).
const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
globalThis.addEventListener = () => {};
globalThis.document = { addEventListener() {}, hidden: false };

const { CARS, PERKS, EARN_ICON, earnHave, GOALS } = await import("../src/data.js");
const { earnCars, raceReward } = await import("../src/rules.js");
const saveMod = await import("../src/save.js");

let fails = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { fails++; console.log("  ✖ " + msg); } };
const specials = CARS.filter(c => c.earn);
const fresh = stats => ({ owned: ["zippy"], car: "zippy", ups: { zippy: { engine: 0, turbo: 0, tires: 0, magnet: 0 } }, stats, museum: [] });

check(specials.length === 4, `four special cars, found ${specials.length}`);
for (const c of specials) {
  check(EARN_ICON[c.earn.stat], `${c.id}: no picture for ${c.earn.stat}`);
  check(c.price == null && !c.cup && !c.boss, `${c.id}: a special car is never bought or won another way`);
  check(PERKS[c.perk], `${c.id}: no power`);
  // one short of the goal: not yet. At the goal: the car, fresh upgrades and a Museum line, once.
  const S = fresh({ [c.earn.stat]: c.earn.goal - 1 });
  check(!earnCars(S, "2027-01-01").length && !S.owned.includes(c.id), `${c.id}: earned one short of the goal`);
  check(earnHave(S, c) === c.earn.goal - 1, `${c.id}: the counter shows ${earnHave(S, c)}`);
  S.stats[c.earn.stat]++;
  const got = earnCars(S, "2027-01-01");
  check(got.length === 1 && got[0] === c && S.owned.includes(c.id) && S.ups[c.id]?.engine === 0, `${c.id}: not earned at the goal`);
  check(S.museum[0]?.text === `Earned the ${c.name}`, `${c.id}: no Museum line`);
  check(S.car === "zippy", `${c.id}: earning a car changed the car being driven`);
  check(!earnCars(S, "2027-01-01").length && S.owned.filter(id => id === c.id).length === 1, `${c.id}: earned twice`);
  S.stats[c.earn.stat] += 5000; check(earnHave(S, c) === c.earn.goal, `${c.id}: the counter goes past the goal`);
}
// the counter grows from races: a race's pearls count toward the Deep Diver
{
  const diver = CARS.find(c => c.id === "diver"), S = { ...fresh({ pearls: diver.earn.goal - 3 }), coins: 0, best: {}, bestD: {}, mastery: {}, research: {}, races: 0, wins: 0, history: [], dirt: {}, sparkle: "", school: { boosts: [] } };
  raceReward(S, { id: "kelp", diff: 8.6, name: "Kelp Forest", icon: "🌿" }, { place: 2, coins: 10, stats: { pearls: 4 } }, { diff: "normal", day: "2027-01-02" });
  check(earnCars(S, "2027-01-02").map(c => c.id).join() === "diver", "a race's pearls did not earn the Deep Diver");
}
// an old save (shaped like v1.15, before special cars) that already has enough of everything gets all four on load
{
  store.clear();
  store.set("turbodash.save", JSON.stringify({ v: 24, coins: 500000, owned: ["zippy", "rover", "sub", "frost", "toyRacer"], car: "toyRacer", rank: 38,
    stats: { roadCoins: 90000, stunts: 900, turbos: 900, bams: 90, powers: 300, rings: 6000, pearls: 9000, drifts: 230, loops: 500 }, research: { moonTires: 1, snorkel: 1, iceStuds: 1, shrinkRay: 1 } }));
  saveMod.load(); const S = saveMod.S;
  const got = earnCars(S, "");
  check(got.length === 4 && specials.every(c => S.owned.includes(c.id)), `an old save got ${got.map(c => c.id).join()} on load`);
  check(S.car === "toyRacer" && S.coins === 500000, "loading changed the car or the coins");
  // and a v0.18 save, below the goals, gets nothing yet
  store.set("turbodash.save", JSON.stringify({ v: 14, coins: 240000, owned: ["zippy", "sub", "frost"], car: "frost", rank: 31, stats: { rings: 30, pearls: 55, drifts: 12 } }));
  saveMod.load(); check(!earnCars(saveMod.S, "").length, "a save below every goal got a car");
}
// words: one short line each, no colon or semicolon, no number
for (const p of Object.values(PERKS)) check(!/[:;]|\d/.test(p.line) && p.line.split(" ").length <= 6, `power line "${p.line}"`);
// "Own every car" counts the new cars too
check(GOALS.find(g => g.id === "carall").goal === CARS.length, "Own every car does not count every car");

console.log(fails ? `\n${fails} of ${checks} special car checks FAILED` : `All ${checks} special car checks passed`);
process.exit(fails ? 1 : 0);
