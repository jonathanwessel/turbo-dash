// A probe for the sweep: the rivals' faces (v1.14), with the career bot's Rank 16 save. MODE "grid" shows the
// start grid faces in the countdown on TRACK (a track id, or "toy" for the first Toy Track World track); "result"
// shows the result card's row after a made-up 3rd place; "again" shows the next start grid after that race, with
// the happy and grumpy faces it left.
//   node scripts/sweep.mjs 1280x800 --out .sweep/faces --probe "$(cat scripts/probes/faces.js)"
(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)), TRACK = "sunny", MODE = "result";
  Object.assign(__td.S, __mid()); __td.S.rank = 40;
  const t = __td.TRACKS.find(x => x.id === TRACK) || __td.TRACKS.find(x => x.world === TRACK);
  const wait = () => w(t.world === "toy" ? 2600 : 1500);
  __td.show("s-tracks"); __td.startRace(t); await wait();
  let R = __td.race;
  if (MODE !== "grid") { R.mode = "demo"; __td.showResult({ place: 3, coins: 40, time: 50, stats: R.runStats, standings: [2, 4, 0, 1, 3, 5] }); await w(1500); }
  if (MODE === "again") { __td.startRace(t); await wait(); R = __td.race; }
  return { track: t.id, state: R.state, moods: R.rivals.map(c => c.mood) };
})()
