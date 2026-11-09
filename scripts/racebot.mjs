// The race bot shared by sim.mjs and career.mjs: runs one whole race headless.
import { Race } from "../src/engine.js";
import { statsFor } from "../src/stats.js";
import { ToyRace } from "../src/toy/race.js";
import { PACE } from "../src/data.js";

const canvas = { getContext: () => null, width: 1, height: 1 };
export const race = new Race(canvas, { sfx() {}, engine() {}, onFinish() {} });
const classicRace = race;
export const toyRace = new ToyRace(null, { sfx() {}, engine() {}, onFinish() {} });

/* One race. bot: "kid" steers late and fires Turbo whenever; "good" holds the middle and saves nothing. */
// the step the game really uses (v1.6 calmer races: 3/4 of a 60th); scripts/test-pace.mjs compares both
export let STEP = PACE / 60;
export const setStep = s => { STEP = s; };
export function runRace(track, car, ups, diff = "normal", bot = "kid", lab = {}, autoSteer = 0, boss = null, trial = false, weather = null) {
  let res = null, boosts = 0;
  const race = track.world === "toy" ? toyRace : classicRace;
  race.hooks = { sfx(n) { if (n === "boost") boosts++; }, engine() {}, onFinish: r => { res = r; } };
  race.setup(track, "race", car, statsFor(car, ups, lab), { diff, autoSteer, boss, trial, weather });
  for (let t = 0; !res && t < 400; t += STEP) {
    const p = race.player, edge = bot === "good" ? 0.25 : 0.7;
    if (bot !== "none") { race.input.left = p.offset > edge; race.input.right = p.offset < -edge; }
    if (bot === "good" || Math.random() < 0.6 * STEP) race.useNitro();
    if (race.power && Math.random() < 1.2 * STEP) race.usePower();
    race.update(STEP);
  }
  race.input.left = race.input.right = false;
  if (res) res.boosts = boosts;
  return res || { place: 6, coins: 0, time: 400, boosts, stats: { stunts: 0, turbos: 0, bams: 0 } };
}

