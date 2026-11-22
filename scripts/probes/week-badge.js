// A probe for the sweep: the rival of the week's target badge at the start of a race, with the career bot's
// Rank 16 save (v1.13.0). Set TRACK to a toy track id for Toy Track World:
//   node scripts/sweep.mjs 1280x800 --out .sweep/week-badge --probe "$(cat scripts/probes/week-badge.js)"
(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms)), TRACK = "sunny";
  Object.assign(__td.S, __mid()); __td.S.rank = 40;
  const t = __td.TRACKS.find(x => x.id === TRACK) || __td.TRACKS.find(x => x.world === TRACK);
  __td.show("s-tracks"); __td.startRace(t);
  await w(TRACK === "toy" ? 4500 : 2500);
  const R = __td.race, wk = R.rivals.find(c => c.week);
  return { track: t.id, week: wk ? wk.def.name : null, rivals: R.rivals.length };
})()
