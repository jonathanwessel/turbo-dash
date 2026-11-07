// Game content: cars, upgrades and tracks. Everything is bought with coins earned by racing. No real money anywhere.

export const CARS = [
  { id: "zippy",   name: "Zippy",        price: 0,    body: "#e8262b", accent: "#ffd400", type: "racer",   speed: 0.00, accel: 0.00, grip: 0.00 },
  { id: "bolt",    name: "Blue Bolt",    price: 1500, body: "#1f6fff", accent: "#ffffff", type: "sport",   speed: 0.05, accel: 0.05, grip: 0.05 },
  { id: "monster", name: "Mega Monster", price: 3000, body: "#2fbf3a", accent: "#ffe600", type: "monster", speed: 0.09, accel: 0.15, grip: 0.10 },
  { id: "shark",   name: "Shark Fin",    price: 9000, body: "#7d93ab", accent: "#ff4f6d", type: "shark",   speed: 0.14, accel: 0.10, grip: 0.15 },
  { id: "rocket",  name: "Rocket Rex",   price: 20000, body: "#ff8a00", accent: "#ffe14d", type: "rocket",  speed: 0.20, accel: 0.20, grip: 0.15 },
  { id: "galaxy",  name: "Galaxy GT",    price: 40000, body: "#7a2cff", accent: "#3cf2ff", type: "galaxy",  speed: 0.27, accel: 0.25, grip: 0.25 },
  // cup prize cars: can't be bought, only won
  { id: "greenMachine", name: "Green Machine", price: null, cup: "green", body: "#39d353", accent: "#ffffff", type: "sport", speed: 0.12, accel: 0.15, grip: 0.15 },
  { id: "goldRush", name: "Gold Rush", price: null, cup: "gold", body: "#f5b301", accent: "#ffffff", type: "racer", speed: 0.24, accel: 0.22, grip: 0.2 },
  { id: "champX", name: "Champion X", price: null, cup: "champ", body: "#1c1c24", accent: "#ffd400", type: "galaxy", speed: 0.32, accel: 0.3, grip: 0.3 },
  // earned at the Driver School (Gold license): Math Laps pay for this one
  // 🌙 Moon Base cars
  { id: "rover", name: "Lunar Rover", price: 60000, world: "moon", body: "#e9edf3", accent: "#ff8a00", type: "rover", speed: 0.36, accel: 0.32, grip: 0.32 },
  { id: "comet", name: "Comet", price: null, cup: "moon", body: "#9fe8ff", accent: "#ffffff", type: "rocket", speed: 0.42, accel: 0.36, grip: 0.35 },
  // boss prize cars and the Fire Station's truck
  { id: "thunder", name: "Thunder King", price: null, boss: "bruno", body: "#2a2a33", accent: "#ffd400", type: "monster", speed: 0.30, accel: 0.32, grip: 0.28 },
  { id: "starfire", name: "Starfire", price: null, boss: "luna", world: "moon", body: "#ff3fe5", accent: "#3cf2ff", type: "galaxy", speed: 0.48, accel: 0.4, grip: 0.4 },
  { id: "firetruck", name: "Fire Dash", price: null, building: "fire", body: "#e8262b", accent: "#ffd400", type: "fire", speed: 0.24, accel: 0.24, grip: 0.24 },
  { id: "patrol", name: "Piqua Patrol", price: null, school: true, body: "#ffffff", accent: "#1d6fb8", type: "patrol", speed: 0.18, accel: 0.22, grip: 0.3 },
  // 🌊 Deep Blue cars (added at the end so older cars keep their upgrade prices)
  { id: "sub", name: "Turbo Sub", price: 120000, world: "ocean", body: "#ffd400", accent: "#1f6fff", type: "sub", speed: 0.54, accel: 0.46, grip: 0.45 },
  { id: "manta", name: "Manta Ray", price: null, cup: "ocean", body: "#1a3a7a", accent: "#3cf2ff", type: "shark", speed: 0.6, accel: 0.5, grip: 0.5 },
  { id: "kraken", name: "Kraken Cruiser", price: null, boss: "kraken", world: "ocean", body: "#7a2cff", accent: "#ff3fa4", type: "sub", speed: 0.66, accel: 0.55, grip: 0.55 },
  // ❄️ Glacier Rink cars
  { id: "frost", name: "Frost Runner", price: 220000, world: "glacier", body: "#bfefff", accent: "#1f6fff", ice: true, type: "skis", speed: 0.72, accel: 0.6, grip: 0.6 },
  { id: "polar", name: "Polar Bear", price: null, cup: "glacier", ice: true, body: "#ffffff", accent: "#3cb6ff", type: "monster", speed: 0.78, accel: 0.66, grip: 0.64 },
  // 🧸 Toy Track World cars (made for plastic track: other cars are 4% slower there)
  { id: "toyRacer", name: "Toy Racer", price: 400000, world: "toy", toy: true, body: "#ff3d3d", accent: "#ffd400", type: "racer", speed: 0.9, accel: 0.78, grip: 0.7 },
  { id: "loopLegend", name: "Loop Legend", price: null, cup: "toy", toy: true, body: "#14e1ff", accent: "#ff2bd6", type: "galaxy", speed: 0.96, accel: 0.84, grip: 0.7 },
  { id: "windup", name: "Wind-Up Rocket", price: null, boss: "windup", world: "toy", toy: true, body: "#ffd400", accent: "#e8262b", type: "rocket", speed: 1.02, accel: 0.9, grip: 0.7 },
  { id: "blizzard", name: "Blizzard Wolf", price: null, boss: "fang", world: "glacier", ice: true, body: "#5a6b8a", accent: "#bff6ff", type: "skis", speed: 0.84, accel: 0.72, grip: 0.7 },
  // 🌾 Country Cup prize (v1.0; at the end so every older car keeps its upgrade prices)
  { id: "barnstormer", name: "Barnstormer", price: null, cup: "country", tier: 4, body: "#2fbf3a", accent: "#ffd400", type: "monster", speed: 0.18, accel: 0.22, grip: 0.18 },
];

// Opponent looks (they race with their own speeds, set by the track).
export const RIVALS = [
  { name: "Rosie", body: "#ff3fa4", accent: "#ffffff", type: "sport" },
  { name: "Splash", body: "#14c8c8", accent: "#003b5c", type: "racer" },
  { name: "Sunny", body: "#ffcc00", accent: "#222222", type: "racer" },
  { name: "Rocky", body: "#8a5a2b", accent: "#ffd27f", type: "monster" },
  { name: "Snowball", body: "#ffffff", accent: "#e8262b", type: "sport" },
];

/* ---------- Cups: three races, points for every place, a prize car for the winner ---------- */
export const CUPS = [
  { id: "green", name: "Green Cup", color: "#5be36a", tracks: ["sunny", "desert", "snow"], car: "greenMachine", bonus: 500 },
  { id: "gold", name: "Gold Cup", color: "#ffd400", tracks: ["candy", "lava", "space"], car: "goldRush", bonus: 1500 },
  { id: "champ", name: "Champion Cup", color: "#ff3fe5", tracks: ["desert", "lava", "space"], car: "champX", bonus: 3000, rank: 7 },
  { id: "moon", name: "Moon Cup", color: "#9fe8ff", tracks: ["crater", "moonbase", "asteroid"], car: "comet", bonus: 6000, rank: 21, world: "moon" },
  { id: "ocean", name: "Ocean Cup", color: "#14c8c8", tracks: ["kelp", "reef", "wreck"], car: "manta", bonus: 10000, rank: 26, world: "ocean" },
  { id: "toy", name: "Toy Cup", color: "#ff8a00", tracks: ["bedroom", "blocks", "kitchen"], car: "loopLegend", bonus: 25000, rank: 36, world: "toy" },
  { id: "country", name: "Country Cup", color: "#8fd35f", tracks: ["farm", "pirate", "river"], car: "barnstormer", bonus: 1000 },
  { id: "glacier", name: "Glacier Cup", color: "#bfefff", tracks: ["icecave", "frozenlake", "aurora"], car: "polar", bonus: 16000, rank: 31, world: "glacier" },
];
export const CUP_POINTS = [10, 8, 6, 4, 2, 1];

/* 👑 Bosses: a one-on-one race against a named rival on that world's hardest track. Beat them to win their car. */
export const BOSSES = [
  { id: "bruno", world: "earth", name: "Big Bruno", icon: "🦏", track: "space", rank: 9, car: "thunder", speed: 1.8, says: "Nobody beats Big Bruno on Space Road!" },
  { id: "kraken", world: "ocean", name: "Captain Kraken", icon: "🐙", track: "trench", rank: 28, car: "kraken", speed: 2.4, says: "Eight arms on the wheel. You can't win!" },
  { id: "windup", world: "toy", name: "Major Wind-Up", icon: "🤖", track: "grandprix", rank: 38, car: "windup", speed: 3.55, says: "Tick-tock! I'm wound up and ready to WIN!" },
  { id: "fang", world: "glacier", name: "Fang the Ice Wolf", icon: "🐺", track: "summit", rank: 33, car: "blizzard", speed: 2.9, says: "Ice is slippery... for YOU! Awooo!" },
  { id: "luna", world: "moon", name: "Captain Luna", icon: "👩‍🚀", track: "earthrise", rank: 23, car: "starfire", speed: 2.22, says: "The Moon is MY racetrack, kid!" },
];
/* 🏙️ Main Street grows: new buildings open as you rank up. */
export const BUILDINGS = [
  { id: "library", name: "Library", rank: 1 },
  { id: "icecream", name: "Ice Cream", rank: 12 },
  { id: "fire", name: "Fire Station", rank: 15 },
  { id: "park", name: "Park", rank: 20 },
  { id: "carwash", name: "Car Wash", rank: 4 },
  { id: "museum", name: "Museum", rank: 8 },
];
export const buildingOpen = (S, id) => S.rank >= (BUILDINGS.find(b => b.id === id)?.rank || 99);

export const UPGRADES = [
  { id: "engine", name: "Engine", icon: "🔥", desc: "Go faster" },
  { id: "turbo",  name: "Turbo",  icon: "🚀", desc: "More nitro" },
  { id: "tires",  name: "Tires",  icon: "🛞", desc: "Turn better" },
  { id: "magnet", name: "Magnet", icon: "🧲", desc: "Grab coins" },
];
export const UPGRADE_COST = [300, 600, 1100, 1800, 2800];
export const UPGRADE_MAX = UPGRADE_COST.length;

// diff drives opponent speed. prize[i] = coins for finishing place i+1.
// after: the track you need to WIN to open this one (unlocks never depend on list order).
/* 🏙️ Bonus courses: always open, pay like any race, but live outside the progression (not in TRACKS, so no
   goal, cup, mission, Time Trial, trophy point or unlock ever depends on them). */
export const BONUS_TRACKS = [
  { id: "downtown", name: "Downtown", icon: "🏙️", diff: 2, laps: 2, seed: 515, theme: "downtown", world: "earth", bonus: true, layout: "blocks" },
];
export const BONUS_IDS = new Set(BONUS_TRACKS.map(t => t.id));
export const TRACKS = [
  { id: "sunny",  name: "Sunny Hills",    icon: "🌳", diff: 0,   laps: 2, seed: 11, theme: "sunny",  world: "earth" },
  { id: "beach",  name: "Beach Boardwalk", icon: "🏖️", diff: 0.6, laps: 2, seed: 83, theme: "beach",  world: "earth", after: "sunny" },
  { id: "farm",   name: "Farm Fields",    icon: "🚜", diff: 0.8, laps: 2, seed: 241, theme: "farm",   world: "earth", after: "beach" },
  { id: "desert", name: "Desert Dash",    icon: "🌵", diff: 1,   laps: 2, seed: 23, theme: "desert", world: "earth", after: "beach" },
  { id: "pirate", name: "Pirate Port",    icon: "🏴‍☠️", diff: 1.5, laps: 2, seed: 251, theme: "pirate", world: "earth", after: "desert" },
  { id: "snow",   name: "Snowy Peaks",    icon: "⛄", diff: 2,   laps: 2, seed: 37, theme: "snow",   world: "earth", after: "desert" },
  { id: "autumn", name: "Autumn Forest",  icon: "🍂", diff: 2.5, laps: 2, seed: 97, theme: "autumn", world: "earth", after: "snow" },
  { id: "river",  name: "Piqua River Run", icon: "🛶", diff: 2.8, laps: 2, seed: 263, theme: "river",  world: "earth", after: "autumn" },
  { id: "candy",  name: "Candy Land",     icon: "🍭", diff: 3,   laps: 2, seed: 41, theme: "candy",  world: "earth", after: "snow" },
  { id: "night",  name: "Piqua Night Lights", icon: "🌃", diff: 3.4, laps: 2, seed: 313, theme: "night", world: "earth", after: "candy" },
  { id: "lava",   name: "Lava Mountain",  icon: "🌋", diff: 4,   laps: 2, seed: 59, theme: "lava",   world: "earth", after: "candy" },
  { id: "space",  name: "Space Road",     icon: "🪐", diff: 5,   laps: 2, seed: 67, theme: "space",  world: "earth", after: "lava" },
  { id: "crater",   name: "Crater Hop",     icon: "🌑", diff: 7.4, laps: 2, seed: 101, theme: "moon", world: "moon" },
  { id: "moonbase", name: "Moonbase Loop",  icon: "🛰️", diff: 7.7, laps: 2, seed: 113, theme: "moon", world: "moon", after: "crater" },
  { id: "asteroid", name: "Asteroid Alley", icon: "☄️", diff: 8.0, laps: 2, seed: 127, theme: "moon", world: "moon", after: "moonbase" },
  { id: "earthrise", name: "Earthrise Run", icon: "🌍", diff: 8.3, laps: 2, seed: 131, theme: "moon", world: "moon", after: "asteroid" },
  { id: "kelp",   name: "Kelp Forest",    icon: "🌿", diff: 8.6, laps: 2, seed: 149, theme: "ocean", world: "ocean" },
  { id: "reef",   name: "Coral Reef",     icon: "🐠", diff: 8.9, laps: 2, seed: 157, theme: "ocean", world: "ocean", after: "kelp" },
  { id: "wreck",  name: "Shipwreck Bay",  icon: "⚓", diff: 9.2, laps: 2, seed: 163, theme: "ocean", world: "ocean", after: "reef" },
  { id: "trench", name: "Deep Trench",    icon: "🐋", diff: 9.5, laps: 2, seed: 173, theme: "ocean", world: "ocean", after: "wreck" },
  { id: "icecave",    name: "Ice Cave",       icon: "🧊", diff: 10.9, laps: 2, seed: 181, theme: "glacier", world: "glacier" },
  { id: "frozenlake", name: "Frozen Lake",    icon: "⛸️", diff: 11.2, laps: 2, seed: 191, theme: "glacier", world: "glacier", after: "icecave" },
  { id: "aurora",     name: "Aurora Pass",    icon: "🌌", diff: 11.5, laps: 2, seed: 193, theme: "glacier", world: "glacier", after: "frozenlake" },
  { id: "bedroom",   name: "Bedroom Loop",        icon: "🛏️", diff: 12.2, laps: 2, seed: 211, theme: "toy", world: "toy", pal: ["#ff7a1a", "#ff9b45"] },
  { id: "blocks",    name: "Block Tower Run",     icon: "🧱", diff: 12.5, laps: 2, seed: 223, theme: "toy", world: "toy", after: "bedroom", pal: ["#1f8cff", "#52aeff"] },
  { id: "kitchen",   name: "Cookie Jar Dash",     icon: "🍪", diff: 12.8, laps: 2, seed: 227, theme: "toy", world: "toy", after: "blocks", pal: ["#2fbf3a", "#5bd865"] },
  { id: "grandprix", name: "Playroom Grand Prix", icon: "🏁", diff: 13.1, laps: 2, seed: 229, theme: "toy", world: "toy", after: "kitchen", pal: ["#a63cff", "#c070ff"] },
  { id: "summit",     name: "Glacier Summit", icon: "🏔️", diff: 11.8, laps: 2, seed: 197, theme: "glacier", world: "glacier", after: "aurora" },
];
// A track opens when the one before it is WON (1st place) on Normal or Hard. Easy is for practice and coins,
// unless a grown-up allows only Easy (Parent Corner): then Easy wins count too, or nothing could ever open.
// A track already raced on stays open, so older saves never lose a track.
const easyOnly = S => { const d = S.parent?.diffs; return Array.isArray(d) && d.length > 0 && !d.includes("normal") && !d.includes("hard"); };
export const trackOpen = (S, t) => (t.world === "earth" || worldOpen(S, t.world)) && (!t.after || S.bestD[t.after + ":normal"] === 1 || S.bestD[t.after + ":hard"] === 1 || (easyOnly(S) && S.bestD[t.after + ":easy"] === 1) || !!S.best[t.id]);
/* A world opens at its rank once its World Kit research is done (Earth is always open). */
export const worldOpen = (S, id) => { const w = WORLDS.find(x => x.id === id); return !!w && (!w.rank || (S.rank >= w.rank && (!w.kit || (S.research?.[w.kit] || 0) >= 1))); };

/* Worlds and their physics. Earth is today's game; other worlds change how cars move. */
export const WORLDS = [
  { id: "earth", name: "Earth", icon: "🌍" },
  { id: "moon", name: "Moon Base", icon: "🌙", rank: 20, kit: "moonTires" },
  { id: "ocean", name: "Deep Blue", icon: "🌊", rank: 25, kit: "snorkel" },
  { id: "glacier", name: "Glacier Rink", icon: "🧊", rank: 30, kit: "iceStuds" },
  { id: "toy", name: "Toy Track World", icon: "🧸", rank: 35, kit: "shrinkRay", nextGen: true },
  { id: "cloud", name: "Cloud Kingdom", icon: "☁️", soon: true },
];
// gravity: jump arc, top/accel: speed through the medium, grip: how well cars hold curves, air: steering in the air
export const PHYSICS = {
  earth: { gravity: 1, top: 1, accel: 1, grip: 1, air: 0.6 },
  moon: { gravity: 0.32, top: 1, accel: 1, grip: 0.85, air: 1.1, gaps: true, rings: true },
  // underwater: heavy water slows everything and makes speeding up hard; currents push you sideways; bubble vents float you up
  ocean: { gravity: 0.5, top: 0.9, accel: 0.5, grip: 0.95, air: 0.9, water: true, currents: true, vents: true },
  // on ice: cars slide (steering changes where you're going, not where you are), curves push harder,
  // drift into a curve for a DRIFT BOOST, and soft snowbanks sit in one lane
  // 🧸 Next Gen: a real 3D engine (src/toy). rival scales the rivals' speed on plastic track.
  toy: { gravity: 1, top: 1, accel: 1, grip: 1, air: 0.6, toy: true, rival: 1.04 },
  glacier: { gravity: 0.9, top: 1, accel: 0.8, grip: 0.7, air: 0.7, ice: true, drift: true, snowbanks: true },
};
// Difficulty: Carter picks per race. Harder pays more and earns more trophy points.
export const DIFFS = [
  { id: "easy", name: "Easy", icon: "🐢", pay: 0.75, rival: 0.9, assist: 1 },
  { id: "normal", name: "Normal", icon: "🚗", pay: 1, rival: 1, assist: 0 },
  { id: "hard", name: "Hard", icon: "🔥", pay: 1.5, rival: 1.07, assist: 0, rank: 3 },
];
export const diffOf = id => DIFFS.find(d => d.id === id) || DIFFS[1];
export const prizeFor = (track, place, diff = "normal") => {
  const top = 150 + track.diff * 120;
  return Math.round(top * diffOf(diff).pay * [1, 0.6, 0.4, 0.25, 0.15, 0.15][place - 1] / 5) * 5;
};
// Upgrades on fancier cars cost a little more.
export const upgradeCost = (carId, lvl, pitCrew = 0) => {
  const car = CARS.find(c => c.id === carId), i = car?.tier ?? Math.max(0, CARS.indexOf(car));
  return Math.round(UPGRADE_COST[lvl] * (1 + 0.4 * i) * (1 - 0.03 * pitCrew) / 10) * 10;
};

export const THEMES = {
  sunny:  { sky: ["#4fb6ff", "#bfe9ff"], hills: ["#5cc46a", "#3fa553"], grass: ["#5fd068", "#4dbd57"], rumble: ["#ffffff", "#e8262b"], road: ["#6b6f78", "#656972"], lane: "#ffffff", sun: "#fff59a", sprites: ["tree", "tree", "bush", "flower"], clouds: true, city: "#a9cbe8" },
  desert: { sky: ["#ffb14d", "#ffe7a8"], hills: ["#e09a52", "#c97f3b"], grass: ["#f2cf86", "#e8c274"], rumble: ["#ffffff", "#ff7a00"], road: ["#8a7561", "#826d59"], lane: "#fff4d6", sun: "#fff3c4", sprites: ["cactus", "cactus", "rock", "palm"], clouds: false, mesas: "#d98a4a", tunnels: "rock" },
  snow:   { sky: ["#7fb2e6", "#e6f3ff"], hills: ["#ffffff", "#d6e6f5"], grass: ["#f4f9ff", "#e3eef9"], rumble: ["#1f6fff", "#ffffff"], road: ["#5d6a7a", "#576474"], lane: "#ffffff", sun: "#ffffff", sprites: ["pine", "pine", "snowman"], clouds: true, mountains: "#9db8d6", tunnels: "ice" },
  candy:  { sky: ["#ff8ad8", "#ffd6f3"], hills: ["#b46cff", "#9a4cf2"], grass: ["#7ef2c8", "#6ee3b8"], rumble: ["#ffffff", "#ff3fa4"], road: ["#c18bd6", "#b882cc"], lane: "#ffffff", sun: "#fffbe0", sprites: ["lollipop", "lollipop", "candycane", "cupcake"], clouds: true },
  lava:   { sky: ["#3a0b0b", "#ff6a2a"], hills: ["#5a1d12", "#3e130c"], grass: ["#4a2a22", "#402219"], rumble: ["#ffd400", "#222222"], road: ["#2c2c30", "#28282c"], lane: "#ffb000", sun: "#ffcf4d", sprites: ["volcanorock", "lavaflame", "volcanorock"], clouds: false, mountains: "#2a0f0b", tunnels: "cave" },
  beach:  { sky: ["#38b6ff", "#c9f1ff"], hills: ["#2fa8ff", "#1f8ad6"], grass: ["#f7e08a", "#efd57a"], rumble: ["#ffffff", "#2fa8ff"], road: ["#a87a4f", "#9c7046"], lane: "#fff4d6", sun: "#fff7b0", sprites: ["palm", "umbrella", "sandcastle", "surfboard"], clouds: true },
  autumn: { sky: ["#ff6a5f", "#ffc27b"], sunY: 0.62, mountains: "#8a4a6a", hills: ["#c9572b", "#a8431f"], grass: ["#d98c3a", "#cf8233"], rumble: ["#ffffff", "#b3261e"], road: ["#6b5a50", "#655448"], lane: "#ffe9c0", sun: "#fff0c8", sprites: ["autumnTree", "autumnTree", "pumpkin", "hay", "mushroom"], clouds: true },
  moon:   { sky: ["#02030f", "#1a2550"], hills: ["#6a7080", "#4f5565"], grass: ["#8f95a3", "#868c9a"], rumble: ["#3cf2ff", "#2a2f3a"], road: ["#3d4250", "#3a3f4c"], lane: "#3cf2ff", sun: "#fff8e0", sprites: ["moonrock", "crater", "dish", "moonrock", "dome", "crater"], clouds: false, stars: true, earth: true, detail: 2 },
  ocean:  { sky: ["#062a4f", "#1b8fb8"], hills: ["#0f5d6e", "#0b4656"], grass: ["#d8c08a", "#cdb47c"], rumble: ["#ffffff", "#ff7a59"], road: ["#3a5566", "#36505f"], lane: "#bff6ff", sun: "#d9fbff", sprites: ["kelp", "coral", "kelp", "shellrock", "coral", "jelly", "treasure", "anemone"], clouds: false, water: true, detail: 3 },
  glacier: { sky: ["#0a1a4a", "#6aa8e8"], hills: ["#eef8ff", "#a9cdec"], grass: ["#f4faff", "#eaf4fc"], rumble: ["#2fa8ff", "#ffffff"], road: ["#a6d8f2", "#a0d2ec"], lane: "#3b7fc4", sun: "#e8fbff", sprites: ["icepine", "icecrystal", "igloo", "icepine", "penguin", "snowfort", "icecrystal", "icepine"], clouds: false, aurora: true, ice: true, snow: true, detail: 4 },
  toy:    { sky: ["#bfe4ff", "#e8f6ff"], hills: ["#ffffff", "#ffffff"], grass: ["#d9a066", "#cf9459"], rumble: ["#ff7a1a", "#ffffff"], road: ["#ff7a1a", "#ff7a1a"], lane: "#ffffff", sun: "#fffbe6", sprites: ["bush"], clouds: false },
  farm:   { sky: ["#5ec2ff", "#d6f0ff"], hills: ["#7bc95a", "#5aa846"], grass: ["#8fd35f", "#80c552"], rumble: ["#ffffff", "#c0392b"], road: ["#727680", "#6b6f78"], lane: "#ffffff", sun: "#fff59a", sprites: ["barn", "hay", "cow", "windmill", "corn", "corn", "cow", "tree"], clouds: true },
  pirate: { sky: ["#ff9a5a", "#ffe0a8"], hills: ["#2f9fd8", "#1f7fb8"], grass: ["#f2d98a", "#e8cd7a"], rumble: ["#ffffff", "#2b2b33"], road: ["#9c7a55", "#92704b"], lane: "#fff4d6", sun: "#fff1b0", sprites: ["palm", "pirateship", "barrel", "parrot", "cannon", "treasure", "palm", "barrel"], clouds: true },
  river:  { sky: ["#6fc0ff", "#d8f2ff"], hills: ["#4fae5a", "#3d9a4a"], grass: ["#6cc970", "#60bd64"], rumble: ["#ffffff", "#1d6fb8"], road: ["#6b6f78", "#656972"], lane: "#ffffff", sun: "#fff59a", sprites: ["tree", "cattail", "duck", "canoe", "coveredbridge", "bush", "cattail", "tree"], clouds: true, river: true },
  downtown: { sky: ["#7fb6e6", "#d8ecff"], hills: ["#9aa6b8", "#8794a8"], grass: ["#b9bcc4", "#adb1ba"], rumble: ["#ffffff", "#8f96a3"], road: ["#4a4e57", "#464a53"], lane: "#ffffff", sun: "#fff7c0", sprites: ["building", "shop", "shop", "building", "house", "trafficlight"], clouds: true, city: "#8592ab" },
  night:  { sky: ["#05081f", "#25306a"], hills: ["#1b2344", "#141a36"], grass: ["#1d3328", "#182b22"], rumble: ["#ffd400", "#2c2f3a"], road: ["#3a3e4c", "#363a47"], lane: "#ffe680", sun: "#f3f0d2", sprites: ["shop", "lamp", "tree", "shop", "house"], clouds: false, stars: true, city: "#121733", night: true, tunnels: "brick" },
  space:  { sky: ["#05021a", "#2a1460"], hills: ["#3b1f8a", "#2a1566"], grass: ["#10062e", "#180a40"], rumble: ["#3cf2ff", "#ff3fe5"], road: ["#1b1440", "#17113a"], lane: "#3cf2ff", sun: "#ffe8ff", sprites: ["planet", "crystal", "ufo"], clouds: false, stars: true },
};

export const PLAYER = "Carter";

// Paint is bought once and can go on any car. color null = the car's own color.
export const PAINTS = [
  { id: "stock", name: "Original", color: null, price: 0 },
  { id: "red", name: "Red", color: "#e8262b", price: 100 },
  { id: "blue", name: "Blue", color: "#1f6fff", price: 100 },
  { id: "green", name: "Green", color: "#2fbf3a", price: 100 },
  { id: "yellow", name: "Yellow", color: "#ffd400", price: 150 },
  { id: "pink", name: "Pink", color: "#ff5fc8", price: 150 },
  { id: "purple", name: "Purple", color: "#8a3cff", price: 150 },
  { id: "orange", name: "Orange", color: "#ff8a00", price: 150 },
  { id: "black", name: "Black", color: "#2a2a33", price: 250 },
  { id: "white", name: "White", color: "#f4f4f4", price: 250 },
  { id: "chrome", name: "Chrome", color: "#c9d6e3", price: 500, shiny: true },
  { id: "gold", name: "Gold", color: "#f5b301", price: 800, shiny: true },
  { id: "rainbow", name: "Rainbow", color: "#ff3fa4", price: 1200, rainbow: true },
  { id: "neonGreen", name: "Neon Green", color: "#39ff14", price: 900, shiny: true, lab: "superPaint" },
  { id: "neonPink", name: "Neon Pink", color: "#ff2bd6", price: 900, shiny: true, lab: "superPaint" },
  { id: "neonBlue", name: "Neon Blue", color: "#14e1ff", price: 900, shiny: true, lab: "superPaint" },
];
export const STICKERS = [
  { id: "none", name: "None", icon: "✖", price: 0 },
  { id: "flames", name: "Flames", icon: "🔥", price: 150 },
  { id: "stars", name: "Stars", icon: "⭐", price: 150 },
  { id: "bolt", name: "Lightning", icon: "⚡", price: 200 },
  { id: "checker", name: "Checkers", icon: "🏁", price: 200 },
  { id: "one", name: "Number 1", icon: "1️⃣", price: 300 },
];

const tracksOpen = S => TRACKS.filter(t => trackOpen(S, t)).length;
export const GOALS = [
  { id: "win1", icon: "🏆", name: "Win a race", goal: 1, reward: 100, have: S => S.wins },
  { id: "win5", icon: "🏆", name: "Win 5 races", goal: 5, reward: 250, have: S => S.wins },
  { id: "win25", icon: "🏆", name: "Win 25 races", goal: 25, reward: 800, have: S => S.wins },
  { id: "coin300", icon: "🪙", name: "Grab 300 road coins", goal: 300, reward: 150, have: S => S.stats.roadCoins },
  { id: "coin2000", icon: "🪙", name: "Grab 2000 road coins", goal: 2000, reward: 600, have: S => S.stats.roadCoins },
  { id: "jump10", icon: "🦘", name: "Do 10 big jumps", goal: 10, reward: 150, have: S => S.stats.stunts },
  { id: "jump100", icon: "🦘", name: "Do 100 big jumps", goal: 100, reward: 700, have: S => S.stats.stunts },
  { id: "turbo25", icon: "🚀", name: "Use Turbo 25 times", goal: 25, reward: 200, have: S => S.stats.turbos },
  { id: "bam10", icon: "💥", name: "BAM 10 cars with Turbo", goal: 10, reward: 250, have: S => S.stats.bams },
  { id: "car2", icon: "🚗", name: "Buy a new car", goal: 1, reward: 150, have: S => S.owned.length - 1 },
  { id: "carall", icon: "🚗", name: "Own every car", goal: CARS.length, reward: 1500, have: S => S.owned.length },
  { id: "paint1", icon: "🎨", name: "Paint your car", goal: 1, reward: 100, have: S => S.paints.length - 1 },
  { id: "maxup", icon: "⭐", name: "Max out an upgrade", goal: UPGRADE_MAX, reward: 300, have: S => Math.max(0, ...Object.values(S.ups).flatMap(u => Object.values(u))) },
  { id: "tracks", icon: "🗺️", name: "Open every track", goal: TRACKS.length, reward: 500, have: tracksOpen },
  { id: "golds", icon: "🥇", name: "Win on every track", goal: TRACKS.length, reward: 1500, have: S => TRACKS.filter(t => S.best[t.id] === 1).length },
  { id: "gift3", icon: "🎁", name: "Open gifts 3 days in a row", goal: 3, reward: 300, have: S => S.giftStreak },
  { id: "lab1", icon: "🔬", name: "Finish a research", goal: 1, reward: 150, have: S => Object.values(S.research).reduce((a, b) => a + b, 0) },
  { id: "lab10", icon: "🔬", name: "Finish 10 research levels", goal: 10, reward: 500, have: S => Object.values(S.research).reduce((a, b) => a + b, 0) },
  { id: "lab30", icon: "🔬", name: "Finish 30 research levels", goal: 30, reward: 1500, have: S => Object.values(S.research).reduce((a, b) => a + b, 0) },
  { id: "rank5", icon: "⭐", name: "Reach Rank 5", goal: 5, reward: 600, have: S => S.rank },
  { id: "cup1", icon: "🏆", name: "Win a cup", goal: 1, reward: 500, have: S => Object.values(S.cups).filter(p => p === 1).length },
  { id: "cupall", icon: "🏆", name: "Win 3 different cups", goal: 3, reward: 2000, have: S => new Set(Object.entries(S.cups).filter(([, p]) => p === 1).map(([k]) => k.split(":")[0])).size },
  { id: "chips3", icon: "🧠", name: "Collect 3 Brain Chips", goal: 3, reward: 400, have: S => Object.keys(S.chipLog || {}).length },
  { id: "auto1", icon: "🧠", name: "Auto Steer level 1", goal: 1, reward: 2000, have: S => S.research.autoSteer || 0 },
  { id: "auto10", icon: "🧠", name: "Auto Steer level 10", goal: 10, reward: 8000, have: S => S.research.autoSteer || 0 },
  { id: "rank10", icon: "⭐", name: "Reach Rank 10", goal: 10, reward: 2000, have: S => S.rank },
  { id: "moon1", icon: "🌙", name: "Win a race on the Moon", goal: 1, reward: 5000, have: S => ["crater", "moonbase", "asteroid", "earthrise"].filter(id => S.best[id] === 1).length },
  { id: "rings25", icon: "⭕", name: "Fly through 25 boost rings", goal: 25, reward: 3000, have: S => S.stats.rings || 0 },
  { id: "ocean1", icon: "🌊", name: "Win a race under the sea", goal: 1, reward: 8000, have: S => ["kelp", "reef", "wreck", "trench"].filter(id => S.best[id] === 1).length },
  { id: "glacier1", icon: "🧊", name: "Win a race on the ice", goal: 1, reward: 12000, have: S => ["icecave", "frozenlake", "aurora", "summit"].filter(id => S.best[id] === 1).length },
  { id: "drift50", icon: "❄️", name: "Do 50 drift boosts", goal: 50, reward: 6000, have: S => S.stats.drifts || 0 },
  { id: "toy1", icon: "🧸", name: "Win a race in Toy Track World", goal: 1, reward: 25000, have: S => ["bedroom", "blocks", "kitchen", "grandprix"].filter(id => S.best[id] === 1).length },
  { id: "loops25", icon: "🎢", name: "Drive through 25 loop-the-loops", goal: 25, reward: 10000, have: S => S.stats.loops || 0 },
  { id: "pearls50", icon: "🦪", name: "Collect 50 pearls", goal: 50, reward: 5000, have: S => S.stats.pearls || 0 },
  { id: "trial1", icon: "⏱️", name: "Earn a Time Trial medal", goal: 1, reward: 300, have: S => Object.values(S.trialMedals || {}).filter(m => m > 0).length },
  { id: "trialGold5", icon: "⏱️", name: "Gold Time Trial medal on 5 tracks", goal: 5, reward: 2500, have: S => Object.values(S.trialMedals || {}).filter(m => m >= 3).length },
  { id: "boss1", icon: "👑", name: "Beat a boss", goal: 1, reward: 4000, have: S => Object.keys(S.bosses || {}).length },
  { id: "school1", icon: "🚦", name: "Take a Driver School lesson", goal: 1, reward: 300, have: S => lessonsOf(S) },
  { id: "license3", icon: "🪪", name: "Earn a Gold license", goal: 3, reward: 2000, have: S => licenseLevel(S) },
  { id: "power10", icon: "❓", name: "Use 10 power-ups", goal: 10, reward: 200, have: S => S.stats.powers || 0 },
  { id: "power100", icon: "❓", name: "Use 100 power-ups", goal: 100, reward: 800, have: S => S.stats.powers || 0 },
];

/* ---------- Racer Rank: four fronts that must all be full to rank up ---------- */
export const RANK_CAP = 40;   // raised by later releases (each new world adds 5)
/* License gauge (from Rank 10): Bronze for Rank 10→11, then one license level per two ranks, up to Piqua Pro.
   Pass the save so a parent can switch the gauge off in Parent Corner. */
export const licenseNeed = (r, S) => (S?.parent?.license === false || r < 10 ? 0 : Math.min(LICENSES.length - 1, Math.floor((r - 8) / 2)));
export const rankNeeds = (r, S) => ({
  license: licenseNeed(r, S),
  wins: Math.round(Math.min(2.5 * r * r, 12 * Math.pow(r, 1.6))),   // gentle early ranks (Rank 3 at 10 wins), the same long climb later
  trophies: Math.round(4.5 * Math.pow(r, 1.35)),
  garage: Math.round(6 * Math.pow(r, 1.2)),
  research: r < 2 ? 0 : Math.round(2 * Math.pow(r - 1, 1.25)),
});
export const rankTitle = r => r >= 60 ? "Turbo God" : r >= 50 ? "Mega Legend" : r >= 40 ? "Legend" : r >= 30 ? "Superstar" : r >= 20 ? "Champion" : r >= 10 ? "Pro" : r >= 5 ? "Racer" : "Rookie";
export const RANK_UNLOCKS = {
  2: { icon: "🔬", text: "Turbo Lab" },
  3: { icon: "🔥", text: "Hard races" },
  4: { icon: "⏱️", text: "Time Trials + a 2nd lab bench" },
  5: { icon: "🏆", text: "Cups" },
  6: { icon: "⚗️", text: "Lab tier 2" },
  7: { icon: "📋", text: "Daily missions + the Champion Cup" },
  8: { icon: "🤖", text: "Robot Brain research" },
  9: { icon: "🦏", text: "Boss: Big Bruno + a 3rd lab bench" },
  10: { icon: "🧠", text: "Auto Steer research" },
  12: { icon: "🍦", text: "Ice Cream Shop" },
  15: { icon: "🚒", text: "Fire Station (and a fire truck!) + a 4th lab bench" },
  20: { icon: "🌙", text: "Moon Base (research Moon Tires) + Park" },
  21: { icon: "🏆", text: "Moon Cup" },
  23: { icon: "👩‍🚀", text: "Boss: Captain Luna" },
  25: { icon: "🌊", text: "Deep Blue (research Snorkel Seals)" },
  26: { icon: "🏆", text: "Ocean Cup" },
  28: { icon: "🐙", text: "Boss: Captain Kraken" },
  30: { icon: "🧊", text: "Glacier Rink (research Ice Studs)" },
  31: { icon: "🏆", text: "Glacier Cup" },
  33: { icon: "🐺", text: "Boss: Fang the Ice Wolf" },
  35: { icon: "🧸", text: "TOY TRACK WORLD (research the Shrink Ray)" },
  36: { icon: "🏆", text: "Toy Cup" },
  38: { icon: "🤖", text: "Boss: Major Wind-Up" },
};
const MEDAL_PTS = [0, 3, 2, 1], CUP_PTS = [0, 8, 5, 3];
/* Track Mastery: keep winning a track on a difficulty to earn up to 5 stars (each one is a trophy point). */
export const MASTERY = [3, 10, 25, 50, 100];
export const starsFor = wins => MASTERY.filter(n => wins >= n).length;
export const FRONTS = [
  { id: "wins", icon: "🏁", name: "Wins", hint: "Win races!", have: S => S.wins },
  { id: "trophies", icon: "🏆", name: "Trophies", hint: "Get medals on every track and claim goals!",
    have: S => {
      // only difficulties the parent allows count, scaled so a 1- or 2-difficulty game can still fill the gauge
      const allowed = S.parent?.diffs?.length ? S.parent.diffs : ["easy", "normal", "hard"], ok = k => allowed.includes(k.split(":")[1]) && !BONUS_IDS.has(k.split(":")[0]);
      const sum = (m, f) => Object.entries(m || {}).filter(([k]) => ok(k)).reduce((a, [, v]) => a + f(v), 0);
      const per = sum(S.bestD, p => MEDAL_PTS[p] || 0) + sum(S.cups, p => CUP_PTS[p] || 0) + sum(S.mastery, starsFor);
      return Math.round(per * 3 / allowed.length) + S.claimed.length + 10 * Object.keys(S.bosses || {}).length;
    } },
  { id: "garage", icon: "🔧", name: "Garage", hint: "Buy cars and upgrades!",
    have: S => S.owned.reduce((a, id) => a + 5 + Object.values(S.ups[id] || {}).reduce((x, y) => x + y, 0), 0) },
  { id: "research", icon: "🔬", name: "Research", hint: "Finish research in the Turbo Lab!",
    have: S => Object.values(S.research || {}).reduce((a, b) => a + b, 0) },
  { id: "license", icon: "🪪", name: "License", hint: "Do Math Laps at the Driver School, then take a lesson!", have: S => licenseLevel(S) },
];

/* ---------- 🚦 Driver School: real-world time (logged by a grown-up) becomes driver training ---------- */
export const ACTIVITIES = [
  { id: "read", icon: "📚", name: "Reading" },
  { id: "outside", icon: "🌳", name: "Playing outside" },
  { id: "help", icon: "🧹", name: "Helping out" },
  { id: "make", icon: "🎨", name: "Making something" },
  { id: "move", icon: "🚲", name: "Exercise" },
];
/* ---------- 🧮 Math School: Math Laps earn the Driver School tickets ----------
   Levels: 1 adding to 5 · 2 adding to 10 · 3 adding and taking away to 10 · 4 adding and taking away to 20.
   A grown-up picks the top level: "add10" (adding to 10), "10" (to 10), "20" (to 20). Never a negative answer. */
export const MATH_LAP = 5;                // questions in a lap
export const MATH_LEVELS = { add10: 2, "10": 3, "20": 4 };
export const MATH_CAPS = [3, 6, 10, 0];   // tickets a day (0 = no limit)
export function mathQuestion(lv, rnd = Math.random) {
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const top = lv >= 4 ? 20 : lv >= 2 ? 10 : 5, minus = lv >= 3 && rnd() < 0.5;
  if (minus) { const a = int(lv >= 4 ? 6 : 2, top), b = int(1, Math.min(a, lv >= 4 ? 10 : a)); return { a, b, op: "-", ans: a - b }; }
  const sum = int(2, top), a = int(1, sum - 1); return { a, b: sum - a, op: "+", ans: sum };
}
export function mathChoices(ans, rnd = Math.random) {
  const c = new Set([ans]);
  for (const d of [1, -1, 2, -2, 3, -3, 10, 4]) { if (c.size >= 4) break; if (ans + d >= 0 && rnd() < 0.8) c.add(ans + d); }
  for (let d = 1; c.size < 4; d++) c.add(ans + d);
  return [...c].sort((x, y) => x - y);
}
export const ticketsFor = (activity, minutes, readingDouble) => Math.floor(minutes / 10) * (activity === "read" && readingDouble ? 2 : 1);
export const SKILLS = [
  { id: "focus", icon: "🎯", name: "Focus", desc: "Curves pull you less" },
  { id: "reflex", icon: "⚡", name: "Reflexes", desc: "Turbo fills faster" },
  { id: "courage", icon: "🦁", name: "Courage", desc: "Bigger jump boosts" },
  { id: "smarts", icon: "🧠", name: "Smarts", desc: "More mission coins" },
];
export const SKILL_MAX = 10;
export const skillCost = lvl => lvl + 1;   // tickets for the next lesson (1, 2, … 10)
export const LICENSES = [
  { name: "Learner", lessons: 0, color: "#9aa4b1" },
  { name: "Bronze", lessons: 5, color: "#cd7f32" },
  { name: "Silver", lessons: 12, color: "#c0c8d6" },
  { name: "Gold", lessons: 20, color: "#ffd400" },
  { name: "Platinum", lessons: 30, color: "#b8f3ff" },
  { name: "Piqua Pro", lessons: 40, color: "#ff3fe5" },
];
export const lessonsOf = S => Object.values(S.school?.skills || {}).reduce((a, b) => a + b, 0);
export const licenseLevel = S => { const n = lessonsOf(S); let L = 0; LICENSES.forEach((x, i) => { if (n >= x.lessons) L = i; }); return L; };

/* ---------- Turbo Lab research. Real-time timers; levels count toward the Research rank gauge. ---------- */
// tier: lab tier (needs that rank). cost/time grow 45% / 35% per level. Effects are read through S.research[id].
export const RESEARCH = [
  { id: "coinBoost", tier: 1, rank: 2, max: 10, icon: "🪙", name: "Coin Boost", desc: "+5% race prizes", c0: 600, t0: 300 },
  { id: "luckyChests", tier: 1, rank: 2, max: 5, icon: "🎁", name: "Lucky Chests", desc: "Bigger treasure chests", c0: 750, t0: 400 },
  { id: "headStart", tier: 1, rank: 2, max: 5, icon: "🚦", name: "Head Start", desc: "Start races with Turbo", c0: 900, t0: 450 },
  { id: "pitCrew", tier: 1, rank: 2, max: 10, icon: "🔧", name: "Pit Crew", desc: "Upgrades 3% cheaper", c0: 750, t0: 400 },
  { id: "turboTanks", tier: 2, rank: 6, max: 10, icon: "🚀", name: "Turbo Tanks", desc: "Turbo lasts longer", c0: 2000, t0: 1200 },
  { id: "bigRamps", tier: 2, rank: 6, max: 5, icon: "🦘", name: "Bigger Ramps", desc: "Jump higher", c0: 2200, t0: 1200 },
  { id: "bumper", tier: 2, rank: 6, max: 5, icon: "🛡️", name: "Bumper Shield", desc: "Bonks slow you less", c0: 2000, t0: 1200 },
  { id: "magnetField", tier: 2, rank: 6, max: 10, icon: "🧲", name: "Magnet Field", desc: "Every car grabs more", c0: 2100, t0: 1200 },
  { id: "superPaint", tier: 2, rank: 6, max: 1, icon: "✨", name: "Super Paint", desc: "Neon paints", c0: 5000, t0: 3600 },
  // tier 3: the Robot Brain chain (one level each, in order), then Auto Steer
  { id: "rbEyes", tier: 3, rank: 8, max: 1, icon: "👀", name: "Robot Eyes", desc: "See the road ahead", c0: 8000, t0: 7200 },
  { id: "rbEars", tier: 3, rank: 8, max: 1, icon: "👂", name: "Robot Ears", desc: "Hear the rivals", c0: 12000, t0: 10800, needs: ["rbEyes"] },
  { id: "rbMap", tier: 3, rank: 8, max: 1, icon: "🗺️", name: "Map Memory", desc: "Remember every curve", c0: 18000, t0: 14400, needs: ["rbEars"] },
  { id: "rbReflex", tier: 3, rank: 9, max: 1, icon: "⚡", name: "Reflexes", desc: "Super-quick steering", c0: 25000, t0: 21600, needs: ["rbMap"] },
  { id: "rbSocket", tier: 3, rank: 9, max: 1, icon: "🔌", name: "Brain Chip Socket", desc: "Ready for Auto Steer", c0: 35000, t0: 28800, needs: ["rbReflex"], chips: () => 1 },
  // THE big one: 100 levels. Costs coins, Brain Chips and hours; each level needs a higher rank.
  { id: "autoSteer", tier: 3, rank: 10, max: 100, icon: "🧠", name: "AUTO STEER", desc: "The car drives itself", big: true, needs: ["rbSocket"],
    cost: lvl => Math.round(60000 * Math.pow(1.035, lvl) / 1000) * 1000,
    time: lvl => Math.round(Math.min(24, Math.pow(1.035, lvl)) * 3600),
    chips: lvl => 4 + Math.floor((lvl + 1) / 10),
    rankAt: lvl => 9 + Math.ceil((lvl + 1) / 2) },
  // tier 4: World Kits and moon tech (Rank 20)
  { id: "moonTires", tier: 4, rank: 20, max: 1, icon: "🛞", name: "Moon Tires", desc: "Drive on the Moon!", c0: 50000, t0: 21600 },
  { id: "thrusters", tier: 4, rank: 20, max: 5, icon: "🚀", name: "Thrusters", desc: "Steer better in the air", c0: 30000, t0: 7200, needs: ["moonTires"] },
  { id: "ringMagnet", tier: 4, rank: 21, max: 5, icon: "⭕", name: "Ring Magnet", desc: "Catch boost rings easier", c0: 32000, t0: 7200, needs: ["moonTires"] },
  // tier 5: the Deep Blue kit and underwater tech (Rank 25)
  { id: "snorkel", tier: 5, rank: 25, max: 1, icon: "🤿", name: "Snorkel Seals", desc: "Drive under the sea!", c0: 90000, t0: 28800 },
  { id: "propellers", tier: 5, rank: 25, max: 5, icon: "🌀", name: "Propellers", desc: "Speed up faster underwater", c0: 50000, t0: 10800, needs: ["snorkel"] },
  { id: "fins", tier: 5, rank: 26, max: 5, icon: "🐟", name: "Fins", desc: "Currents push you less", c0: 52000, t0: 10800, needs: ["snorkel"] },
  { id: "pearlDiver", tier: 5, rank: 27, max: 5, icon: "🦪", name: "Pearl Diver", desc: "Grab pearls from farther away", c0: 54000, t0: 10800, needs: ["snorkel"] },
  // tier 6: the Glacier Rink kit and ice tech (Rank 30)
  { id: "iceStuds", tier: 6, rank: 30, max: 1, icon: "🧊", name: "Ice Studs", desc: "Drive on the ice!", c0: 150000, t0: 36000 },
  { id: "snowChains", tier: 6, rank: 30, max: 5, icon: "⛓️", name: "Snow Chains", desc: "Slide less on ice", c0: 80000, t0: 14400, needs: ["iceStuds"] },
  { id: "driftMaster", tier: 6, rank: 31, max: 5, icon: "❄️", name: "Drift Master", desc: "Bigger drift boosts", c0: 84000, t0: 14400, needs: ["iceStuds"] },
  { id: "snowplow", tier: 6, rank: 32, max: 5, icon: "🚜", name: "Snowplow", desc: "Snowbanks slow you less", c0: 88000, t0: 14400, needs: ["iceStuds"] },
  // tier 7: the Shrink Ray opens Toy Track World (Rank 35), then plastic-track tech
  { id: "shrinkRay", tier: 7, rank: 35, max: 1, icon: "🪄", name: "Shrink Ray", desc: "Shrink down to toy size!", c0: 250000, t0: 43200 },
  { id: "loopGrip", tier: 7, rank: 35, max: 5, icon: "🎢", name: "Loop Grip", desc: "Stay on loops when slower", c0: 120000, t0: 18000, needs: ["shrinkRay"] },
  { id: "boosterTune", tier: 7, rank: 36, max: 5, icon: "⚡", name: "Booster Tune", desc: "Boosters fling you farther", c0: 125000, t0: 18000, needs: ["shrinkRay"] },
  { id: "wallBumpers", tier: 7, rank: 37, max: 5, icon: "🧽", name: "Wall Bumpers", desc: "Walls slow you less", c0: 130000, t0: 18000, needs: ["shrinkRay"] },
  { id: "windUp", tier: 7, rank: 38, max: 5, icon: "🔑", name: "Wind-Up Motor", desc: "Speed up faster on toy tracks", c0: 135000, t0: 18000, needs: ["shrinkRay"] },
  { id: "warmEngine", tier: 6, rank: 33, max: 5, icon: "♨️", name: "Warm Engine", desc: "Speed up faster on ice", c0: 92000, t0: 14400, needs: ["iceStuds"] },
];
export const researchCost = (r, lvl) => r.cost ? r.cost(lvl) : Math.round(r.c0 * Math.pow(1.45, lvl) / 10) * 10;   // lvl = current level (0-based next)
export const researchTime = (r, lvl) => r.time ? r.time(lvl) : Math.round(r.t0 * Math.pow(1.4, lvl));              // seconds
export const researchChips = (r, lvl) => r.chips ? r.chips(lvl) : 0;
export const researchRank = (r, lvl) => r.rankAt ? r.rankAt(lvl) : r.rank;
export const benchesFor = rank => rank >= 15 ? 4 : rank >= 9 ? 3 : rank >= 4 ? 2 : rank >= 2 ? 1 : 0;

/* ⏱️ Time Trials: race alone against the clock (and your own ghost). Medal times come from the track's length:
   gold needs a fast, well-upgraded car driven well; bronze is reachable mid-game. Each medal pays once. */
export const TRIAL_MEDALS = ["", "🥉", "🥈", "🥇"];
const TOY_TRIAL = 1.3;   // toy tracks are measured in their own units (boosters make them quick)
export const trialTimes = (track, length) => {
  const ph = PHYSICS[track.world] || PHYSICS.earth, k = (ph.toy ? 26 * TOY_TRIAL : 10000) * ph.top * (1.6 + 0.045 * track.diff);
  const gold = length * track.laps / k;
  return [gold * 1.32, gold * 1.15, gold].map(x => Math.round(x * 10) / 10);   // [bronze, silver, gold] seconds
};
export const trialMedal = (track, length, time) => { const [b, s, g] = trialTimes(track, length); return time <= g ? 3 : time <= s ? 2 : time <= b ? 1 : 0; };
export const trialPay = (track, medal) => Math.round([0, 200, 400, 800][medal] * (1 + 0.3 * track.diff) / 10) * 10;
