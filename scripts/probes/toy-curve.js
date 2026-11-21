// A probe for the sweep: Toy Track World's first sharp curve with rivals placed close around the player's car,
// one just behind it (between the camera and the player). Used for the v1.12.1 camera fix:
//   node scripts/sweep.mjs 1280x800 --out .sweep/toy-curve --probe "$(cat scripts/probes/toy-curve.js)"
(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const t = __td.TRACKS.find(x => x.world === "toy"); __td.S.rank = 40; __td.show("s-tracks"); __td.startRace(t);
  await w(9500);
  const R = __td.race, T = R.T, p = R.player, ds = T.L / T.N;
  let i = Math.round(Math.max(0, p.dist) / ds) + 10; while (Math.abs(T.k[i % T.N]) < 0.03 && i < T.N * 2) i++;
  i += 6; const s = i * ds, side = Math.sign(T.k[i % T.N]) || 1;
  p.dist = s; p.x = 0; p.speed = 10;
  R.rivals.forEach((c, n) => { c.dist = s + [-3.2, 4, 7, -6][n % 4]; c.x = [1.4 * side, -1.6, 1.8, -1.2 * side][n % 4]; c.lane = c.x; c.speed = 10; });
  __td.toyView.snapCam = true;
  await w(500);
  return { i, k: T.k[i % T.N], s: +s.toFixed(1), rivals: R.rivals.length };
})()
