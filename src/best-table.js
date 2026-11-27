// 🏆 Measured numbers the Best rule (src/best.js) reads per track. Written by `node scripts/probes/best-table.mjs`
// (16 seeded kid races for each number). Do not edit by hand: run the probe again after a track, a power or a car
// kind changes.
// What each special car's power is worth on each track of its world, as [early garage, full garage]: 1.03 is 3%
// faster than the same car without its power. An early garage is +3 with no Lab, a full one +5 with every Lab project.
export const PERK_PACE = {
  hop: { crater: [1.042, 1.041], meteor: [1.061, 1.018], moonbase: [1.06, 1.026], launch: [1.032, 1.034], asteroid: [1.022, 1.021], bigcrater: [1.012, 1.011], earthrise: [1.047, 1.023], darkside: [1.084, 1.03] },
  steady: { kelp: [1.03, 1.033], sunken: [1.025, 1.031], reef: [1.035, 1.03], whirlpool: [1.048, 1.028], wreck: [1.025, 1.035], turtles: [1.029, 1.036], trench: [1.039, 1.029], midnight: [1.042, 1.032] },
  studs: { icecave: [1.033, 1.034], frozenlake: [1.032, 1.024], aurora: [1.036, 1.035], summit: [1.047, 1.028] },
  boost: { bedroom: [1.008, 1.033], blocks: [1.009, 1.034], kitchen: [1.007, 1.032], grandprix: [1.005, 1.032] },
};
// How much faster a Tough car is on each Glacier track than the rest of the rule says: it feels half of each snowbank.
export const TOUGH_ICE = {
  icecave: 1.023, frozenlake: 1.007, aurora: 1.033, summit: 1.017,
};
