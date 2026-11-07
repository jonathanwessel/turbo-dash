// The race bot shared by sim.mjs and career.mjs: runs one whole race headless.
import { Race } from "../src/engine.js";
import { statsFor } from "../src/stats.js";

const canvas = { getContext: () => null, width: 1, height: 1 };
export const race = new Race(canvas, { sfx() {}, engine() {}, onFinish() {} });

/* One race. bot: "kid" steers late and fires Turbo whenever; "good" holds the middle and saves nothing. */
export function runRace(track, car, ups, diff = "normal", bot = "kid", lab = {}, autoSteer = 0, skills = {}, boss = null, trial = false) {
  let res = null, boosts = 0;
  race.hooks = { sfx(n) { if (n === "boost") boosts++; }, engine() {}, onFinish: r => { res = r; } };
  race.setup(track, "race", car, statsFor(car, ups, lab, skills), { diff, autoSteer, boss, trial });
  for (let t = 0; !res && t < 400; t += 1 / 60) {
    const p = race.player, edge = bot === "good" ? 0.25 : 0.7;
    if (bot !== "none") { race.input.left = p.offset > edge; race.input.right = p.offset < -edge; }
    if (bot === "good" || Math.random() < 0.01) race.useNitro();
    if (race.power && Math.random() < 0.02) race.usePower();
    race.update(1 / 60);
  }
  race.input.left = race.input.right = false;
  if (res) res.boosts = boosts;
  return res || { place: 6, coins: 0, time: 400, boosts, stats: { stunts: 0, turbos: 0, bams: 0 } };
}

