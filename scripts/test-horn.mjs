// 📯 The horn: who honks back, when, and that it never touches the race itself.
import assert from "node:assert/strict";
import { HORN, hornReplies, honk, tickHonks } from "../src/horn.js";

const fixed = () => 0.5;
const fake = (dists, mode = "race") => {
  const heard = [];
  return { heard, race: { mode, t: 0, player: { dist: 0, speed: 100 }, rivals: dists.map(d => ({ dist: d, speed: 100 })), hooks: { sfx: n => heard.push(n) } } };
};

// the two closest rivals in range answer, nearest first; rivals far away stay quiet
{
  const r = hornReplies({ dist: 0 }, [{ dist: 900 }, { dist: -200 }, { dist: 5000 }, { dist: 400 }], 1000, fixed);
  assert.deepEqual(r.map(x => x.i), [1, 3]);
  assert.ok(r[0].delay < r[1].delay, "the nearest answers first");
  assert.ok(r.every(x => x.delay > 0.3 && x.delay < 1.2), "answers come a moment later");
}
assert.equal(hornReplies({ dist: 0 }, [{ dist: 5000 }], 1000, fixed).length, 0, "nobody close, nobody answers");
assert.equal(hornReplies({ dist: 0 }, [], 1000, fixed).length, 0, "time trial: no rivals");

// the player's horn always sounds; answers play when due and show the little horn for a moment
{
  const { race, heard } = fake([300, -500, 4000]);
  assert.equal(honk(race, 1000, fixed), true);
  assert.deepEqual(heard, ["horn"]);
  for (let i = 0; i < 60; i++) { race.t += 1 / 60; tickHonks(race, 1 / 60); }
  assert.deepEqual(heard.slice(1).sort(), ["horn1", "horn2"]);
  assert.ok(race.rivals[0].honkT > 0 && race.rivals[1].honkT > 0 && !race.rivals[2].honkT);
  for (let i = 0; i < 120; i++) { race.t += 1 / 60; tickHonks(race, 1 / 60); }
  assert.equal(race.rivals[0].honkT, 0, "the little horn fades");
}

// honking again right away still honks, but rivals wait a moment before answering again (no wall of noise)
{
  const { race, heard } = fake([300]);
  honk(race, 1000, fixed); race.t += 0.2; honk(race, 1000, fixed);
  assert.equal(heard.filter(n => n === "horn").length, 2, "the button always works");
  assert.equal(race.honks.length, 1, "one answer, not two");
  race.t += HORN.quiet; honk(race, 1000, fixed);
  assert.equal(race.honks.length, 2, "after a moment they answer again");
}

// it never changes the race: speeds and distances stay as they were
{
  const { race } = fake([300, -200]);
  const before = JSON.stringify([race.player, race.rivals.map(c => ({ dist: c.dist, speed: c.speed }))]);
  honk(race, 1000, fixed); for (let i = 0; i < 90; i++) { race.t += 1 / 60; tickHonks(race, 1 / 60); }
  assert.equal(JSON.stringify([race.player, race.rivals.map(c => ({ dist: c.dist, speed: c.speed }))]), before);
}

// the menu demo drive never honks
{ const { race, heard } = fake([300], "demo"); assert.equal(honk(race, 1000, fixed), false); assert.equal(heard.length, 0); }

console.log("Horn: closest two answer, button always honks, no change to the race");
