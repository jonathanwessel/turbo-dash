// Game content: cars, upgrades and tracks. Everything is bought with coins earned by racing. No real money anywhere.

export const CARS = [
  { id: "zippy",   name: "Zippy",        price: 0,    body: "#e8262b", accent: "#ffd400", type: "racer",   speed: 0.00, accel: 0.00, grip: 0.00 },
  { id: "bolt",    name: "Blue Bolt",    price: 300,  body: "#1f6fff", accent: "#ffffff", type: "sport",   speed: 0.05, accel: 0.05, grip: 0.05 },
  { id: "monster", name: "Mega Monster", price: 800,  body: "#2fbf3a", accent: "#ffe600", type: "monster", speed: 0.09, accel: 0.15, grip: 0.10 },
  { id: "shark",   name: "Shark Fin",    price: 1500, body: "#7d93ab", accent: "#ff4f6d", type: "shark",   speed: 0.14, accel: 0.10, grip: 0.15 },
  { id: "rocket",  name: "Rocket Rex",   price: 2500, body: "#ff8a00", accent: "#ffe14d", type: "rocket",  speed: 0.20, accel: 0.20, grip: 0.15 },
  { id: "galaxy",  name: "Galaxy GT",    price: 4000, body: "#7a2cff", accent: "#3cf2ff", type: "galaxy",  speed: 0.27, accel: 0.25, grip: 0.25 },
];

// Opponent looks (they race with their own speeds, set by the track).
export const RIVALS = [
  { body: "#ff3fa4", accent: "#ffffff", type: "sport" },
  { body: "#14c8c8", accent: "#003b5c", type: "racer" },
  { body: "#ffcc00", accent: "#222222", type: "racer" },
  { body: "#8a5a2b", accent: "#ffd27f", type: "monster" },
  { body: "#ffffff", accent: "#e8262b", type: "sport" },
];

export const UPGRADES = [
  { id: "engine", name: "Engine", icon: "🔥", desc: "Go faster" },
  { id: "turbo",  name: "Turbo",  icon: "🚀", desc: "More nitro" },
  { id: "tires",  name: "Tires",  icon: "🛞", desc: "Turn better" },
  { id: "magnet", name: "Magnet", icon: "🧲", desc: "Grab coins" },
];
export const UPGRADE_COST = [100, 200, 400, 700, 1100];
export const UPGRADE_MAX = UPGRADE_COST.length;

// diff drives opponent speed. prize[i] = coins for finishing place i+1.
export const TRACKS = [
  { id: "sunny",  name: "Sunny Hills",   icon: "🌳", diff: 0, laps: 2, seed: 11, theme: "sunny" },
  { id: "desert", name: "Desert Dash",   icon: "🌵", diff: 1, laps: 2, seed: 23, theme: "desert" },
  { id: "snow",   name: "Snowy Peaks",   icon: "⛄", diff: 2, laps: 2, seed: 37, theme: "snow" },
  { id: "candy",  name: "Candy Land",    icon: "🍭", diff: 3, laps: 2, seed: 41, theme: "candy" },
  { id: "lava",   name: "Lava Mountain", icon: "🌋", diff: 4, laps: 2, seed: 59, theme: "lava" },
  { id: "space",  name: "Space Road",    icon: "🪐", diff: 5, laps: 2, seed: 67, theme: "space" },
];
export const prizeFor = (track, place) => {
  const top = 150 + track.diff * 100;
  return Math.round(top * [1, 0.6, 0.4, 0.25, 0.15, 0.15][place - 1]);
};

export const THEMES = {
  sunny:  { sky: ["#4fb6ff", "#bfe9ff"], hills: ["#5cc46a", "#3fa553"], grass: ["#5fd068", "#4dbd57"], rumble: ["#ffffff", "#e8262b"], road: ["#6b6f78", "#656972"], lane: "#ffffff", sun: "#fff59a", sprites: ["tree", "tree", "bush", "flower"], clouds: true },
  desert: { sky: ["#ffb14d", "#ffe7a8"], hills: ["#e09a52", "#c97f3b"], grass: ["#f2cf86", "#e8c274"], rumble: ["#ffffff", "#ff7a00"], road: ["#8a7561", "#826d59"], lane: "#fff4d6", sun: "#fff3c4", sprites: ["cactus", "cactus", "rock", "palm"], clouds: false },
  snow:   { sky: ["#7fb2e6", "#e6f3ff"], hills: ["#ffffff", "#d6e6f5"], grass: ["#f4f9ff", "#e3eef9"], rumble: ["#1f6fff", "#ffffff"], road: ["#5d6a7a", "#576474"], lane: "#ffffff", sun: "#ffffff", sprites: ["pine", "pine", "snowman"], clouds: true },
  candy:  { sky: ["#ff8ad8", "#ffd6f3"], hills: ["#b46cff", "#9a4cf2"], grass: ["#7ef2c8", "#6ee3b8"], rumble: ["#ffffff", "#ff3fa4"], road: ["#c18bd6", "#b882cc"], lane: "#ffffff", sun: "#fffbe0", sprites: ["lollipop", "lollipop", "candycane", "cupcake"], clouds: true },
  lava:   { sky: ["#3a0b0b", "#ff6a2a"], hills: ["#5a1d12", "#3e130c"], grass: ["#4a2a22", "#402219"], rumble: ["#ffd400", "#222222"], road: ["#2c2c30", "#28282c"], lane: "#ffb000", sun: "#ffcf4d", sprites: ["volcanorock", "lavaflame", "volcanorock"], clouds: false },
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
];
export const STICKERS = [
  { id: "none", name: "None", icon: "✖", price: 0 },
  { id: "flames", name: "Flames", icon: "🔥", price: 150 },
  { id: "stars", name: "Stars", icon: "⭐", price: 150 },
  { id: "bolt", name: "Lightning", icon: "⚡", price: 200 },
  { id: "checker", name: "Checkers", icon: "🏁", price: 200 },
  { id: "one", name: "Number 1", icon: "1️⃣", price: 300 },
];

const tracksOpen = S => TRACKS.filter((t, i) => i === 0 || (S.best[TRACKS[i - 1].id] || 99) <= 3).length;
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
];
