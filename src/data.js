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
  // earned at the Driver School (Gold license): real-world reading and outdoor time pays for this one
  // 🌙 Moon Base cars
  { id: "rover", name: "Lunar Rover", price: 60000, world: "moon", body: "#e9edf3", accent: "#ff8a00", type: "rover", speed: 0.36, accel: 0.32, grip: 0.32 },
  { id: "comet", name: "Comet", price: null, cup: "moon", body: "#9fe8ff", accent: "#ffffff", type: "rocket", speed: 0.42, accel: 0.36, grip: 0.35 },
  // boss prize cars and the Fire Station's truck
  { id: "thunder", name: "Thunder King", price: null, boss: "bruno", body: "#2a2a33", accent: "#ffd400", type: "monster", speed: 0.30, accel: 0.32, grip: 0.28 },
  { id: "starfire", name: "Starfire", price: null, boss: "luna", world: "moon", body: "#ff3fe5", accent: "#3cf2ff", type: "galaxy", speed: 0.48, accel: 0.4, grip: 0.4 },
  { id: "firetruck", name: "Fire Dash", price: null, building: "fire", body: "#e8262b", accent: "#ffd400", type: "fire", speed: 0.24, accel: 0.24, grip: 0.24 },
  { id: "patrol", name: "Piqua Patrol", price: null, school: true, body: "#ffffff", accent: "#1d6fb8", type: "patrol", speed: 0.18, accel: 0.22, grip: 0.3 },
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
];
export const CUP_POINTS = [10, 8, 6, 4, 2, 1];

/* 👑 Bosses: a one-on-one race against a named rival on that world's hardest track. Beat them to win their car. */
export const BOSSES = [
  { id: "bruno", world: "earth", name: "Big Bruno", icon: "🦏", track: "space", rank: 9, car: "thunder", speed: 1.8, says: "Nobody beats Big Bruno on Space Road!" },
  { id: "luna", world: "moon", name: "Captain Luna", icon: "👩‍🚀", track: "earthrise", rank: 23, car: "starfire", speed: 2.22, says: "The Moon is MY racetrack, kid!" },
];
/* 🏙️ Main Street grows: new buildings open as you rank up. */
export const BUILDINGS = [
  { id: "library", name: "Library", rank: 1 },
  { id: "icecream", name: "Ice Cream", rank: 12 },
  { id: "fire", name: "Fire Station", rank: 15 },
  { id: "park", name: "Park", rank: 20 },
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
// after: the track you need 3rd place or better on to open this one (unlocks never depend on list order).
export const TRACKS = [
  { id: "sunny",  name: "Sunny Hills",    icon: "🌳", diff: 0,   laps: 2, seed: 11, theme: "sunny",  world: "earth" },
  { id: "beach",  name: "Beach Boardwalk", icon: "🏖️", diff: 0.6, laps: 2, seed: 83, theme: "beach",  world: "earth", after: "sunny" },
  { id: "desert", name: "Desert Dash",    icon: "🌵", diff: 1,   laps: 2, seed: 23, theme: "desert", world: "earth", after: "beach" },
  { id: "snow",   name: "Snowy Peaks",    icon: "⛄", diff: 2,   laps: 2, seed: 37, theme: "snow",   world: "earth", after: "desert" },
  { id: "autumn", name: "Autumn Forest",  icon: "🍂", diff: 2.5, laps: 2, seed: 97, theme: "autumn", world: "earth", after: "snow" },
  { id: "candy",  name: "Candy Land",     icon: "🍭", diff: 3,   laps: 2, seed: 41, theme: "candy",  world: "earth", after: "snow" },
  { id: "lava",   name: "Lava Mountain",  icon: "🌋", diff: 4,   laps: 2, seed: 59, theme: "lava",   world: "earth", after: "candy" },
  { id: "space",  name: "Space Road",     icon: "🪐", diff: 5,   laps: 2, seed: 67, theme: "space",  world: "earth", after: "lava" },
  { id: "crater",   name: "Crater Hop",     icon: "🌑", diff: 7.4, laps: 2, seed: 101, theme: "moon", world: "moon" },
  { id: "moonbase", name: "Moonbase Loop",  icon: "🛰️", diff: 7.7, laps: 2, seed: 113, theme: "moon", world: "moon", after: "crater" },
  { id: "asteroid", name: "Asteroid Alley", icon: "☄️", diff: 8.0, laps: 2, seed: 127, theme: "moon", world: "moon", after: "moonbase" },
  { id: "earthrise", name: "Earthrise Run", icon: "🌍", diff: 8.3, laps: 2, seed: 131, theme: "moon", world: "moon", after: "asteroid" },
];
// A track opens when the one before it is WON (1st place) on Normal or Hard. Easy is for practice and coins.
// A track already raced on stays open, so older saves never lose a track.
export const trackOpen = (S, t) => (t.world === "earth" || worldOpen(S, t.world)) && (!t.after || S.bestD[t.after + ":normal"] === 1 || S.bestD[t.after + ":hard"] === 1 || !!S.best[t.id]);
/* A world opens at its rank once its World Kit research is done (Earth is always open). */
export const worldOpen = (S, id) => { const w = WORLDS.find(x => x.id === id); return !!w && (!w.rank || (S.rank >= w.rank && (!w.kit || (S.research?.[w.kit] || 0) >= 1))); };

/* Worlds and their physics. Earth is today's game; other worlds change how cars move. */
export const WORLDS = [
  { id: "earth", name: "Earth", icon: "🌍" },
  { id: "moon", name: "Moon Base", icon: "🌙", rank: 20, kit: "moonTires" },
  { id: "ocean", name: "Deep Blue", icon: "🌊", soon: true },
];
// gravity: jump arc, top/accel: speed through the medium, grip: how well cars hold curves, air: steering in the air
export const PHYSICS = {
  earth: { gravity: 1, top: 1, accel: 1, grip: 1, air: 0.6 },
  moon: { gravity: 0.32, top: 1, accel: 1, grip: 0.85, air: 1.1, gaps: true, rings: true },
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
  const i = Math.max(0, CARS.findIndex(c => c.id === carId));
  return Math.round(UPGRADE_COST[lvl] * (1 + 0.4 * i) * (1 - 0.03 * pitCrew) / 10) * 10;
};

export const THEMES = {
  sunny:  { sky: ["#4fb6ff", "#bfe9ff"], hills: ["#5cc46a", "#3fa553"], grass: ["#5fd068", "#4dbd57"], rumble: ["#ffffff", "#e8262b"], road: ["#6b6f78", "#656972"], lane: "#ffffff", sun: "#fff59a", sprites: ["tree", "tree", "bush", "flower"], clouds: true },
  desert: { sky: ["#ffb14d", "#ffe7a8"], hills: ["#e09a52", "#c97f3b"], grass: ["#f2cf86", "#e8c274"], rumble: ["#ffffff", "#ff7a00"], road: ["#8a7561", "#826d59"], lane: "#fff4d6", sun: "#fff3c4", sprites: ["cactus", "cactus", "rock", "palm"], clouds: false },
  snow:   { sky: ["#7fb2e6", "#e6f3ff"], hills: ["#ffffff", "#d6e6f5"], grass: ["#f4f9ff", "#e3eef9"], rumble: ["#1f6fff", "#ffffff"], road: ["#5d6a7a", "#576474"], lane: "#ffffff", sun: "#ffffff", sprites: ["pine", "pine", "snowman"], clouds: true },
  candy:  { sky: ["#ff8ad8", "#ffd6f3"], hills: ["#b46cff", "#9a4cf2"], grass: ["#7ef2c8", "#6ee3b8"], rumble: ["#ffffff", "#ff3fa4"], road: ["#c18bd6", "#b882cc"], lane: "#ffffff", sun: "#fffbe0", sprites: ["lollipop", "lollipop", "candycane", "cupcake"], clouds: true },
  lava:   { sky: ["#3a0b0b", "#ff6a2a"], hills: ["#5a1d12", "#3e130c"], grass: ["#4a2a22", "#402219"], rumble: ["#ffd400", "#222222"], road: ["#2c2c30", "#28282c"], lane: "#ffb000", sun: "#ffcf4d", sprites: ["volcanorock", "lavaflame", "volcanorock"], clouds: false },
  beach:  { sky: ["#38b6ff", "#c9f1ff"], hills: ["#2fa8ff", "#1f8ad6"], grass: ["#f7e08a", "#efd57a"], rumble: ["#ffffff", "#2fa8ff"], road: ["#a87a4f", "#9c7046"], lane: "#fff4d6", sun: "#fff7b0", sprites: ["palm", "umbrella", "sandcastle", "surfboard"], clouds: true },
  autumn: { sky: ["#ff9e5e", "#ffe0b8"], hills: ["#c9572b", "#a8431f"], grass: ["#d98c3a", "#cf8233"], rumble: ["#ffffff", "#b3261e"], road: ["#6b5a50", "#655448"], lane: "#ffe9c0", sun: "#fff0c8", sprites: ["autumnTree", "autumnTree", "pumpkin", "hay", "mushroom"], clouds: true },
  moon:   { sky: ["#02030f", "#1a2550"], hills: ["#6a7080", "#4f5565"], grass: ["#8f95a3", "#868c9a"], rumble: ["#3cf2ff", "#2a2f3a"], road: ["#3d4250", "#3a3f4c"], lane: "#3cf2ff", sun: "#fff8e0", sprites: ["moonrock", "crater", "dish", "moonrock", "dome", "crater"], clouds: false, stars: true, earth: true, detail: 2 },
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
  { id: "cupall", icon: "🏆", name: "Win all three cups", goal: 3, reward: 2000, have: S => new Set(Object.entries(S.cups).filter(([, p]) => p === 1).map(([k]) => k.split(":")[0])).size },
  { id: "chips3", icon: "🧠", name: "Collect 3 Brain Chips", goal: 3, reward: 400, have: S => Object.keys(S.chipLog || {}).length },
  { id: "auto1", icon: "🧠", name: "Auto Steer level 1", goal: 1, reward: 2000, have: S => S.research.autoSteer || 0 },
  { id: "auto10", icon: "🧠", name: "Auto Steer level 10", goal: 10, reward: 8000, have: S => S.research.autoSteer || 0 },
  { id: "rank10", icon: "⭐", name: "Reach Rank 10", goal: 10, reward: 2000, have: S => S.rank },
  { id: "moon1", icon: "🌙", name: "Win a race on the Moon", goal: 1, reward: 5000, have: S => ["crater", "moonbase", "asteroid", "earthrise"].filter(id => S.best[id] === 1).length },
  { id: "rings25", icon: "⭕", name: "Fly through 25 boost rings", goal: 25, reward: 3000, have: S => S.stats.rings || 0 },
  { id: "boss1", icon: "👑", name: "Beat a boss", goal: 1, reward: 4000, have: S => Object.keys(S.bosses || {}).length },
  { id: "school1", icon: "🚦", name: "Take a Driver School lesson", goal: 1, reward: 300, have: S => lessonsOf(S) },
  { id: "license3", icon: "🪪", name: "Earn a Gold license", goal: 3, reward: 2000, have: S => licenseLevel(S) },
  { id: "power10", icon: "❓", name: "Use 10 power-ups", goal: 10, reward: 200, have: S => S.stats.powers || 0 },
  { id: "power100", icon: "❓", name: "Use 100 power-ups", goal: 100, reward: 800, have: S => S.stats.powers || 0 },
];

/* ---------- Racer Rank: four fronts that must all be full to rank up ---------- */
export const RANK_CAP = 25;   // raised by later releases (each new world adds 5)
/* License gauge (from Rank 10): Bronze for Rank 10→11, then one license level per two ranks, up to Piqua Pro.
   Pass the save so a parent can switch the gauge off in Parent Corner. */
export const licenseNeed = (r, S) => (S?.parent?.license === false || r < 10 ? 0 : Math.min(LICENSES.length - 1, Math.floor((r - 8) / 2)));
export const rankNeeds = (r, S) => ({
  license: licenseNeed(r, S),
  wins: Math.round(12 * Math.pow(r, 1.6)),
  trophies: Math.round(4.5 * Math.pow(r, 1.35)),
  garage: Math.round(6 * Math.pow(r, 1.2)),
  research: r < 2 ? 0 : Math.round(2 * Math.pow(r - 1, 1.25)),
});
export const rankTitle = r => r >= 60 ? "Turbo God" : r >= 50 ? "Mega Legend" : r >= 40 ? "Legend" : r >= 30 ? "Superstar" : r >= 20 ? "Champion" : r >= 10 ? "Pro" : r >= 5 ? "Racer" : "Rookie";
export const RANK_UNLOCKS = {
  2: { icon: "🔬", text: "Turbo Lab" },
  3: { icon: "🔥", text: "Hard races" },
  4: { icon: "🧪", text: "2nd lab bench" },
  5: { icon: "🏆", text: "Cups" },
  6: { icon: "⚗️", text: "Lab tier 2" },
  7: { icon: "📋", text: "Daily missions" },
  8: { icon: "🤖", text: "Robot Brain research" },
  9: { icon: "🧪", text: "3rd lab bench" },
  10: { icon: "🧠", text: "Auto Steer research" },
  12: { icon: "🍦", text: "Ice Cream Shop" },
  15: { icon: "🚒", text: "Fire Station (and a fire truck!)" },
  20: { icon: "🌙", text: "Moon Base (research Moon Tires) + Park" },
  21: { icon: "🏆", text: "Moon Cup" },
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
      const allowed = S.parent?.diffs?.length ? S.parent.diffs : ["easy", "normal", "hard"], ok = k => allowed.includes(k.split(":")[1]);
      const sum = (m, f) => Object.entries(m || {}).filter(([k]) => ok(k)).reduce((a, [, v]) => a + f(v), 0);
      const per = sum(S.bestD, p => MEDAL_PTS[p] || 0) + sum(S.cups, p => CUP_PTS[p] || 0) + sum(S.mastery, starsFor);
      return Math.round(per * 3 / allowed.length) + S.claimed.length + 10 * Object.keys(S.bosses || {}).length;
    } },
  { id: "garage", icon: "🔧", name: "Garage", hint: "Buy cars and upgrades!",
    have: S => S.owned.reduce((a, id) => a + 5 + Object.values(S.ups[id] || {}).reduce((x, y) => x + y, 0), 0) },
  { id: "research", icon: "🔬", name: "Research", hint: "Finish research in the Turbo Lab!",
    have: S => Object.values(S.research || {}).reduce((a, b) => a + b, 0) },
  { id: "license", icon: "🪪", name: "License", hint: "Read or play outside, then train at the Driver School!", have: S => licenseLevel(S) },
];

/* ---------- 🚦 Driver School: real-world time (logged by a grown-up) becomes driver training ---------- */
export const ACTIVITIES = [
  { id: "read", icon: "📚", name: "Reading" },
  { id: "outside", icon: "🌳", name: "Playing outside" },
  { id: "help", icon: "🧹", name: "Helping out" },
  { id: "make", icon: "🎨", name: "Making something" },
  { id: "move", icon: "🚲", name: "Exercise" },
];
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
];
export const researchCost = (r, lvl) => r.cost ? r.cost(lvl) : Math.round(r.c0 * Math.pow(1.45, lvl) / 10) * 10;   // lvl = current level (0-based next)
export const researchTime = (r, lvl) => r.time ? r.time(lvl) : Math.round(r.t0 * Math.pow(1.4, lvl));              // seconds
export const researchChips = (r, lvl) => r.chips ? r.chips(lvl) : 0;
export const researchRank = (r, lvl) => r.rankAt ? r.rankAt(lvl) : r.rank;
export const benchesFor = rank => rank >= 15 ? 4 : rank >= 9 ? 3 : rank >= 4 ? 2 : rank >= 2 ? 1 : 0;
