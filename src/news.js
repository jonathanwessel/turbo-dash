// ✨ What's new: one entry per release, newest first. Every release adds its entry here in the same commit
// (`npm test` fails when package.json names a version with no entry).
//   pics  -> the in-game card: one picture and a few words a young player can follow. No colons, no semicolons.
//            Leave it empty when nothing changed that the player can see.
//   notes -> for the grown-up: 2 to 5 plain lines. `npm run release` writes them into the tag, and the pushed tag
//            becomes the GitHub release (.github/workflows/release.yml).
// The card shows every entry since the version this device last opened (kept under turbodash.news).
export const NEWS = [
  {
    v: "1.18.0",
    pics: [["🔊", "Tap the speaker to hear a card"]],
    notes: [
      "A round yellow speaker button on the picture cards reads the card aloud. A second tap stops it.",
      "It only uses a voice that lives on the tablet, never an online one, and hides when there is none.",
      "A new picture check also guards a Toy Track World race frame before each release.",
      "Not checked on a real tablet yet, so please tap the speaker on the car kinds card in the Garage.",
    ],
  },
  {
    v: "1.17.0",
    pics: [["🏆", "See your best car for each track"], ["🚗", "The Garage shows where a car is best"]],
    notes: [
      "A yellow Best pill on a track card shows which of the player's cars is faster on that track.",
      "The Garage shows the tracks where each car is the best pick. A Moon car on Moon tracks is the usual find.",
      "The race sim checked every Best pick, so it never asks for a swap to a slower car.",
      "A new picture check guards the race pictures of all four classic worlds before each release.",
      "Not checked on a real tablet yet, so please look at the Best pill on the track cards.",
    ],
  },
  {
    v: "1.16.0",
    pics: [["⚡", "Fast cars zoom on straight roads"], ["🛞", "Grippy cars turn well"], ["💪", "Bumps don't slow Tough cars much"]],
    notes: [
      "Every car is now Fast, Grippy or Tough, and each kind has a good side and a cost.",
      "Fast is quicker on top but slides on curves. Grippy holds curves but is a bit slower.",
      "Tough loses less speed on bumps but starts slower. A pill in the Garage shows each car's kind.",
      "Re-checked with the race sims and the career run. Every track and boss round can still be won.",
      "Not checked on a real tablet yet, so please feel how a Fast car slides and look at the Garage pill.",
    ],
  },
  {
    v: "1.15.1",
    pics: [["🪙", "One coin total after a race"], ["😠", "See who you beat"], ["🧸", "An arrow shows your toy car"]],
    notes: [
      "The result card shows one coin total, and the rival of the week's line shows that rival's face.",
      "In Toy Track World an arrow points at the player's car at the start, and the power-up boxes stay upright.",
      "Tidier Lab, Garage, Main Street and track cards, and upright phones fit better.",
      "Not checked on a real tablet or phone yet, so please look at the Toy Track World start and the result card.",
    ],
  },
  {
    v: "1.15.0",
    pics: [["👑", "Beaten bosses come back faster"], ["🎨", "Win Round 2 for a new paint"], ["🪙", "More coins each round"]],
    notes: [
      "Beaten bosses come back for Round 2, 3 and 4, a little faster each time and for more coins.",
      "Winning Round 2 against a boss gives that boss's own shiny paint for the garage.",
      "Every boss already beaten in an old save is ready for Round 2.",
      "On short screens the buttons after picking a gift no longer hide under the card.",
      "Not checked on a real tablet yet, so please look at the boss card and the boss rematch on the tablet.",
    ],
  },
  {
    v: "1.14.0",
    pics: [["😄", "Rivals smile when they beat you"], ["😠", "They frown when you beat them"], ["📯", "Tap a face. It honks!"]],
    notes: [
      "The rivals have faces. Each one pops up over their car before a race starts.",
      "After a race a row of faces shows who finished where. Rivals ahead smile and rivals behind frown.",
      "Tap a face on that row and that rival honks back.",
      "Not checked on a real tablet yet, so please look at the faces over the cars at the start.",
    ],
  },
  {
    v: "1.13.0",
    pics: [["🎯", "Beat the rival of the week"], ["🪙", "Beat them for more coins"]],
    notes: [
      "A rival of the week. One of the five named rivals races in every race and cup, with a target over the car.",
      "Finishing ahead of them pays extra coins and makes them a little faster, up to five times a week.",
      "A new week brings the next rival. The rival never outgrows a car that can win the track.",
      "Not checked on a real tablet yet, so please look at the target over the rival and the new rival card.",
    ],
  },
  {
    v: "1.12.1",
    pics: [["🧸", "Cars in the way turn see-through"], ["🏙️", "A bigger town on a tall screen"]],
    notes: [
      "In Toy Track World the camera stays closer behind your car, and a rival in the way turns see-through.",
      "Main Street fills the screen when the tablet is held upright, and Lab benches take less room.",
      "Small word fixes in the Garage and on the track cards.",
      "Rivals no longer slow down to wait for a car that drives on the grass.",
      "Not checked on a real tablet yet, so please look at the Toy Track World camera on loops and jumps.",
    ],
  },
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
