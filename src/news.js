// ✨ What's new: one entry per release, newest first. Every release adds its entry here in the same commit
// (`npm test` fails when package.json names a version with no entry).
//   pics  -> the in-game card: one picture and a few words a young player can follow. No colons, no semicolons.
//            Leave it empty when nothing changed that the player can see.
//   notes -> for the grown-up: 2 to 5 plain lines. `npm run release` writes them into the tag, and the pushed tag
//            becomes the GitHub release (.github/workflows/release.yml).
// The card shows every entry since the version this device last opened (kept under turbodash.news).
export const NEWS = [
  {
    v: "1.12.0",
    pics: [["📯", "Tap the horn. Rivals honk back!"], ["🔬", "Lab cards say what they do"]],
    notes: [
      "A new horn button sits above the left arrow. Tap it and the closest rivals honk back.",
      "Turbo Lab cards have a short line that says what each one does, full prices, and MAX! when finished.",
      "The steering arrows have a dark rim, so they show on snow and in Toy Track World.",
      "Not checked on a real tablet yet, so please look at the horn button next to the left arrow.",
    ],
  },
  {
    v: "1.11.4",
    pics: [["✨", "This card shows what is new"]],
    notes: [
      "A What's new card on the title screen lists the changes since this tablet last played.",
      "Every release now makes a GitHub release, so you get an email for each one.",
      "New install and update tests run before every release.",
      "The app icon has its own Android version, so the car is no longer cut off.",
    ],
  },
  {
    v: "1.11.3",
    pics: [["📖", "Shorter words on the signs and cards"]],
    notes: [
      "Plainer words on screen, with no colons in game text.",
      "Racer Rank asks for a small next step, and Rank up sits above the gauges.",
      "The screen sweep and a new word test now flag hard wording.",
    ],
  },
  {
    v: "1.11.2",
    pics: [],
    notes: [
      "Nothing changes in the game itself.",
      "One command now runs every check, and a release cannot be built until it passes.",
      "A new command checks every screen at 7 sizes by itself.",
    ],
  },
  {
    v: "1.11.1",
    pics: [["🚀", "Boost pads and puddles are back on the road"], ["🧸", "The play rug is back in Toy Track World"]],
    notes: [
      "Boost pads, puddles, currents, crosswalks, skid marks and ice shine are drawn on the road again.",
      "The Toy Track World play rug is back.",
    ],
  },
  {
    v: "1.11.0",
    pics: [["🏠", "Cars are faster in their own world"], ["⭐", "Stars shine in the night sky"]],
    notes: [
      "Every world's own cars are 5% faster there.",
      "Toy Track World no longer needs the Toy Racer on Normal.",
      "Stars, haze, tunnel exits and snow look better.",
    ],
  },
];

const MAX_VERSIONS = 3;   // a tablet that has been away a long time still gets a card it can take in at a glance
const parts = v => String(v).split(".").map(n => parseInt(n, 10) || 0);
export function cmpVersion(a, b) {
  const x = parts(a), y = parts(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
}

/* The entries to show on a device that last opened version `seen` and now runs `now`.
   No `seen` yet: a player who has raced before gets the newest entry, a brand-new player gets nothing. */
export function unseen(seen, now, hasPlayed, list = NEWS) {
  const shown = list.filter(n => n.pics.length && cmpVersion(n.v, now) <= 0);
  if (!seen) return hasPlayed ? shown.slice(0, 1) : [];
  return shown.filter(n => cmpVersion(n.v, seen) > 0).slice(0, MAX_VERSIONS);
}
