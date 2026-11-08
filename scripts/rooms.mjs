// 🏠 The inside of each building, drawn in the game's flat style: public/rooms/<room>.svg.
//   node scripts/rooms.mjs   (run after changing a room; the SVGs are committed like any other picture)
// Each room is 1600×900 and fills the screen behind that building's menus (cropped at the sides on tall screens),
// so the things that say "this is the garage" sit near the edges, the top and the floor, where the menus don't cover.
// Colors stay a little muted: the menus' white-edged stickers sit on top and must stand out.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "rooms");
mkdirSync(out, { recursive: true });
const W = 1600, H = 900, FLOOR = 640;
let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = a => a[Math.floor(rnd() * a.length)];
const R = (x, y, w, h, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const svg = (body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">${R(0, 0, W, H, bg)}${body}</svg>`;
const wallFloor = (wall, floor, base = "#00000033") => R(0, 0, W, FLOOR, wall) + R(0, FLOOR, W, H - FLOOR, floor) + R(0, FLOOR - 14, W, 14, base);
const lines = (y0, y1, step, color, w = 3) => { let s = ""; for (let y = y0; y <= y1; y += step) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${color}" stroke-width="${w}"/>`; return s; };
const vlines = (x0, x1, step, y0, y1, color, w = 3) => { let s = ""; for (let x = x0; x <= x1; x += step) s += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${color}" stroke-width="${w}"/>`; return s; };
const lamp = (x, glow = "#ffe9a8") => `<line x1="${x}" y1="0" x2="${x}" y2="70" stroke="#222" stroke-width="4"/><path d="M${x - 46} 112 L${x - 20} 70 h40 L${x + 46} 112Z" fill="#2b2f38"/><ellipse cx="${x}" cy="112" rx="46" ry="9" fill="${glow}"/><path d="M${x - 46} 116 L${x - 150} ${FLOOR} H${x + 150} L${x + 46} 116Z" fill="${glow}" opacity=".07"/>`;
const tire = (x, y, r = 62) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.36}" fill="#1b1d22"/><ellipse cx="${x}" cy="${y - 4}" rx="${r * 0.55}" ry="${r * 0.18}" fill="#3a3d45"/>`;
const cone = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-40" y="-10" width="80" height="12" rx="4" fill="#d9661a"/><path d="M-26 -10 L-8 -110 h16 L26 -10Z" fill="#f07a22"/><path d="M-20 -40 h40 l-3 -18 h-34Z M-14 -76 h28 l-3 -14 h-22Z" fill="#f4f1ea"/></g>`;
const win = (x, y, w, h, frame = "#e9e2d0") => `${R(x, y, w, h, "#8fc6e8")}${R(x, y + h * 0.62, w, h * 0.38, "#7fbf72")}<circle cx="${x + w * 0.72}" cy="${y + h * 0.3}" r="${Math.min(w, h) * 0.12}" fill="#fff3b0"/>${R(x - 10, y - 10, w + 20, h + 20, "none", `stroke="${frame}" stroke-width="20"`)}<line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="${frame}" stroke-width="12"/><line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="${frame}" stroke-width="12"/>`;
const bunting = (y, colors) => { let s = `<path d="M0 ${y} Q${W / 4} ${y + 40} ${W / 2} ${y} T${W} ${y}" fill="none" stroke="#2b2f38" stroke-width="4"/>`; for (let x = 30; x < W; x += 80) { const yy = y + 20 * Math.sin((x / W) * Math.PI * 2) + 6; s += `<path d="M${x - 24} ${yy} h48 l-24 46Z" fill="${colors[(x / 80 | 0) % colors.length]}"/>`; } return s; };

const rooms = {};

/* 🔧 Garage: pegboard of tools, a stack of tires, a red tool chest, a roll-up door, oil on the concrete */
rooms.garage = () => {
  let s = wallFloor("#5b6271", "#3d424d") + lines(40, FLOOR - 20, 46, "#535a69");
  // roll-up door
  s += R(1120, 110, 420, FLOOR - 110, "#7f8796") + lines(0, 0, 1, "none");
  for (let y = 120; y < FLOOR - 10; y += 34) s += R(1120, y, 420, 18, "#8f97a6");
  s += R(1100, 90, 460, 26, "#2b2f38") + R(1100, 110, 20, FLOOR - 110, "#2b2f38") + R(1540, 110, 20, FLOOR - 110, "#2b2f38");
  for (let x = 1120; x < 1540; x += 40) s += `<path d="M${x} ${FLOOR - 26} h20 l-12 26 h-20Z" fill="#e8b82a"/>`;
  s += R(1120, FLOOR - 26, 420, 26, "#1d2028", `opacity=".35"`);
  // pegboard and tools
  s += R(70, 150, 380, 300, "#a87b4f", `rx="8"`);
  for (let y = 170; y < 440; y += 26) for (let x = 90; x < 440; x += 26) s += `<circle cx="${x}" cy="${y}" r="3.5" fill="#7d5a37"/>`;
  s += `<g fill="#c9ced8"><rect x="110" y="190" width="18" height="150" rx="9"/><circle cx="119" cy="190" r="26"/><circle cx="119" cy="186" r="12" fill="#a87b4f"/></g>`;   // wrench
  s += `<rect x="190" y="200" width="16" height="150" rx="6" fill="#8a5a2b"/><rect x="160" y="186" width="76" height="34" rx="6" fill="#c9ced8"/>`;   // hammer
  s += `<rect x="280" y="190" width="24" height="80" rx="10" fill="#e4312b"/><rect x="288" y="270" width="8" height="90" fill="#c9ced8"/>`;   // screwdriver
  s += `<path d="M350 190 l40 0 l-6 70 l-8 100 h-12 l-8 -100Z" fill="#c9ced8"/><rect x="345" y="182" width="50" height="16" rx="6" fill="#2db34a"/>`;   // pliers-ish
  s += R(90, 380, 340, 40, "#2b2f38", `rx="6"`) + [0, 1, 2, 3, 4, 5].map(i => R(102 + i * 54, 388, 40, 24, pick(["#e4312b", "#ffc928", "#1f6fff", "#2db34a"]), `rx="4"`)).join("");
  // tires and tool chest
  s += tire(160, 860) + tire(160, 820) + tire(160, 780) + tire(160, 740);
  s += R(470, 470, 190, 230, "#c8312b", `rx="10"`) + [0, 1, 2, 3].map(i => R(484, 486 + i * 52, 162, 40, "#e4423a", `rx="6"`) + R(530, 500 + i * 52, 70, 8, "#c9ced8", `rx="4"`)).join("") + `<circle cx="495" cy="712" r="12" fill="#1b1d22"/><circle cx="635" cy="712" r="12" fill="#1b1d22"/>`;
  // floor: oil stain and a parking line
  s += `<ellipse cx="900" cy="800" rx="140" ry="28" fill="#2c3038"/><ellipse cx="960" cy="812" rx="60" ry="12" fill="#30343d"/><path d="M700 900 L760 ${FLOOR} h26 L726 900Z" fill="#e8b82a" opacity=".8"/>`;
  s += lamp(560) + lamp(800) + lamp(1040);
  return svg(s, "#3d424d");
};

/* 🔬 Turbo Lab: tiles, pipes along the ceiling, shelves of bubbling flasks, a whiteboard with a car plan, a machine */
rooms.lab = () => {
  let s = wallFloor("#3f5868", "#2c3a46");
  s += lines(60, FLOOR - 20, 60, "#36505f", 4) + vlines(0, W, 60, 0, FLOOR - 14, "#36505f", 4);
  for (let x = 0; x < W; x += 120) for (let y = FLOOR; y < H; y += 60) s += R(x + ((y - FLOOR) / 60 % 2) * 60, y, 60, 60, "#33424f");
  s += R(0, 36, W, 22, "#8a97a6") + R(0, 70, W, 14, "#a8794c") + [200, 640, 1300].map(x => `<circle cx="${x}" cy="47" r="20" fill="#e4312b"/><rect x="${x - 4}" y="20" width="8" height="54" fill="#6f7a8b"/>`).join("");
  // shelves with flasks (left)
  const flask = (x, y, c, k) => k ? `<path d="M${x - 10} ${y - 70} h20 v24 l26 46 h-72 l26 -46Z" fill="#dfe8ef" opacity=".85"/><path d="M${x - 30} ${y - 18} l10 -18 h40 l10 18Z" fill="${c}"/>` : `<rect x="${x - 8}" y="${y - 76}" width="16" height="22" fill="#dfe8ef" opacity=".85"/><circle cx="${x}" cy="${y - 28}" r="28" fill="#dfe8ef" opacity=".85"/><path d="M${x - 27} ${y - 22} a28 28 0 0 0 54 0Z" fill="${c}"/>`;
  for (const [y, n] of [[260, 4], [420, 4]]) { s += R(60, y, 400, 16, "#6b4a2e"); for (let i = 0; i < n; i++) s += flask(110 + i * 95, y, pick(["#5be36a", "#ff3fa4", "#3cf2ff", "#ffc928"]), i % 2); }
  // whiteboard with a car plan (right)
  s += R(1080, 130, 440, 280, "#eef2f5", `rx="8" stroke="#9aa4b1" stroke-width="10"`);
  s += `<g fill="none" stroke="#1f6fff" stroke-width="7" stroke-linecap="round"><path d="M1150 330 h260 l-30 -60 h-130 l-40 60"/><circle cx="1190" cy="340" r="26"/><circle cx="1370" cy="340" r="26"/></g>`;
  s += `<g stroke="#e4312b" stroke-width="6" fill="none" stroke-linecap="round"><path d="M1420 200 q40 -30 70 10"/><path d="M1480 205 l12 6 l-2 -14"/></g><text x="1140" y="210" font-family="Arial" font-weight="900" font-size="46" fill="#2db34a">+ ZOOM</text>`;
  // the big machine at the right edge
  s += R(1500, 430, 110, FLOOR - 430, "#5f6b7c", `rx="10"`) + [0, 1, 2].map(i => `<circle cx="${1530 + i * 26}" cy="470" r="9" fill="${["#ff3d3d", "#ffc928", "#5be36a"][i]}"/>`).join("") + R(1515, 500, 80, 90, "#203040", `rx="6"`) + `<path d="M1522 560 l14 -20 l12 14 l14 -30 l12 22 l14 -10" fill="none" stroke="#5be36a" stroke-width="5"/>`;
  // a counter along the bottom with beakers
  s += R(0, 700, W, 30, "#9aa4b1") + R(0, 730, W, H - 730, "#56606e");
  for (let x = 60; x < W; x += 180) s += `<rect x="${x}" y="650" width="44" height="50" rx="6" fill="#dfe8ef" opacity=".8"/><rect x="${x}" y="672" width="44" height="28" rx="6" fill="${pick(["#5be36a", "#ff3fa4", "#3cf2ff"])}"/>`;
  return svg(s, "#2c3a46");
};

/* 🚦 Driver School classroom: a green chalkboard, road-sign posters, a clock, a window, wood floor, cones */
rooms.school = () => {
  let s = R(0, 0, W, FLOOR, "#8d7a5f") + R(0, 380, W, FLOOR - 380, "#6e5b43") + R(0, 372, W, 12, "#4f3f2c") + R(0, FLOOR, W, H - FLOOR, "#6a4a2f") + R(0, FLOOR - 14, W, 14, "#3d2c1c");
  for (let y = FLOOR + 30; y < H; y += 44) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#5a3d25" stroke-width="4"/>`;
  // chalkboard across the top middle
  s += R(380, 80, 840, 270, "#2f5d3a", `stroke="#8a5a2b" stroke-width="18"`) + R(380, 350, 840, 16, "#8a5a2b");
  s += `<g fill="none" stroke="#f4f1ea" stroke-width="6" stroke-linecap="round" opacity=".85"><path d="M440 300 q120 -90 260 -40 t240 -30"/><path d="M450 318 q120 -90 260 -40 t240 -30" stroke-dasharray="20 24"/>
    <path d="M980 250 h120 l-18 -36 h-70 l-22 36" /><circle cx="1004" cy="258" r="13"/><circle cx="1080" cy="258" r="13"/></g>`;
  s += `<g font-family="Arial" font-weight="900" fill="#f4f1ea" opacity=".85"><text x="450" y="170" font-size="56">2 + 3 = 5</text><text x="800" y="160" font-size="52">cat  car</text></g>`;
  s += `<g transform="translate(1150 150)"><rect x="-22" y="-60" width="44" height="120" rx="12" fill="#222"/><circle cy="-34" r="14" fill="#ff3d3d"/><circle r="14" fill="#ffc928"/><circle cy="34" r="14" fill="#5be36a"/></g>`;
  // posters: a stop sign and a yield sign (left), a clock and a window (right)
  s += `<polygon points="150,120 210,120 250,160 250,220 210,260 150,260 110,220 110,160" fill="#e4312b" stroke="#f4f1ea" stroke-width="8"/><text x="180" y="208" font-family="Arial" font-weight="900" font-size="38" text-anchor="middle" fill="#f4f1ea">STOP</text>`;
  s += `<path d="M110 300 h140 l-70 120Z" fill="#f4f1ea" stroke="#e4312b" stroke-width="14" stroke-linejoin="round"/>`;
  s += `<circle cx="1420" cy="140" r="58" fill="#f4f1ea" stroke="#3d2c1c" stroke-width="10"/><path d="M1420 140 v-36 M1420 140 h26" stroke="#222" stroke-width="7" stroke-linecap="round"/>`;
  s += win(1320, 250, 220, 190, "#e9e2d0");
  // cones and a little road on the floor
  s += cone(140, 860, 1.1) + cone(1470, 860, 1.1) + cone(300, 800, 0.8) + cone(1310, 800, 0.8);
  return svg(s, "#6a4a2f");
};

/* 📚 Library: tall shelves of books on both sides, a big arched window, a rug, a reading lamp */
rooms.library = () => {
  let s = wallFloor("#6e5a48", "#5b3d2a", "#3d2a1c");
  const shelf = (x0, x1) => {
    let t = R(x0, 40, x1 - x0, FLOOR - 40, "#4b3020");
    for (let y = 60; y < FLOOR - 40; y += 118) {
      t += R(x0, y + 100, x1 - x0, 14, "#5e3d28");
      for (let x = x0 + 14; x < x1 - 20;) { const w = 18 + rnd() * 20, h = 64 + rnd() * 30, tilt = rnd() < 0.08; t += `<rect x="${x.toFixed(0)}" y="${(y + 100 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="3" fill="${pick(["#b8443a", "#2f6fb0", "#d8a23a", "#3f8f52", "#7a4fa0", "#d06a2a", "#e9e2d0", "#2b6f6a"])}" ${tilt ? `transform="rotate(-8 ${x} ${y + 100})"` : ""}/>`; x += w + 3; }
    }
    return t + R(x0 - 10, 30, x1 - x0 + 20, 20, "#5e3d28");
  };
  s += shelf(0, 470) + shelf(1130, W);
  // arched window in the middle, high up
  s += `<path d="M640 360 V170 a160 160 0 0 1 320 0 V360Z" fill="#8fc6e8"/><path d="M640 360 V290 Q800 250 960 290 V360Z" fill="#7fbf72"/><circle cx="880" cy="150" r="30" fill="#fff3b0"/>`;
  s += `<path d="M640 360 V170 a160 160 0 0 1 320 0 V360Z" fill="none" stroke="#e9e2d0" stroke-width="20"/><line x1="800" y1="10" x2="800" y2="360" stroke="#e9e2d0" stroke-width="12"/><line x1="640" y1="230" x2="960" y2="230" stroke="#e9e2d0" stroke-width="12"/>`;
  // rug, reading lamp, a stack of books on the floor
  s += `<ellipse cx="800" cy="790" rx="420" ry="80" fill="#9c3a32"/><ellipse cx="800" cy="790" rx="360" ry="60" fill="none" stroke="#d8a23a" stroke-width="8"/>`;
  s += `<rect x="520" y="420" width="10" height="${FLOOR - 420 + 120}" fill="#2b2f38"/><path d="M480 430 h90 l-20 -50 h-50Z" fill="#2f6f5a"/><ellipse cx="525" cy="432" rx="45" ry="8" fill="#ffe9a8"/>`;
  s += [0, 1, 2].map(i => R(1060 + i * 6, 820 - i * 30, 140, 30, ["#2f6fb0", "#d8a23a", "#b8443a"][i], `rx="4"`)).join("");
  return svg(s, "#5b3d2a");
};

/* 🏦 Bank: marble walls and columns, teller windows with bars, a wall of little safe boxes, a checker floor */
rooms.bank = () => {
  let s = wallFloor("#a9b4c2", "#6c7686", "#56606f");
  for (let i = 0; i < 14; i++) { const x = rnd() * W, y = rnd() * (FLOOR - 60); s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q${30 + rnd() * 40} ${20 + rnd() * 30} ${60 + rnd() * 80} ${rnd() * 40}" fill="none" stroke="#c7d0db" stroke-width="3"/>`; }
  for (let x = 0; x < W; x += 100) for (let y = FLOOR; y < H; y += 50) s += R(x + (((y - FLOOR) / 50) % 2) * 50, y, 50, 50, "#5b6474");
  const col = x => R(x, 60, 90, FLOOR - 74, "#dfe5ec") + vlines(x + 18, x + 72, 18, 70, FLOOR - 24, "#c3ccd8", 5) + R(x - 14, 40, 118, 26, "#c3ccd8") + R(x - 14, FLOOR - 40, 118, 26, "#c3ccd8");
  s += col(430) + col(1080);
  // teller windows (left)
  for (const x of [40, 230]) s += R(x, 200, 160, 220, "#2f3b4d", `rx="10"`) + vlines(x + 20, x + 140, 24, 205, 415, "#c9a43a", 6) + R(x - 10, 420, 180, 24, "#7a5a3a");
  s += R(20, 444, 400, FLOOR - 444, "#8a6644");
  // safe boxes (right)
  for (let y = 120; y < 560; y += 74) for (let x = 1230; x < 1590; x += 90) s += R(x, y, 80, 64, "#c9a43a", `rx="6"`) + `<circle cx="${x + 40}" cy="${y + 32}" r="8" fill="#6b5320"/>`;
  s += R(0, 0, W, 34, "#1f3b63") + `<text x="800" y="27" font-family="Arial" font-weight="900" font-size="26" text-anchor="middle" fill="#ffc928" letter-spacing="10">PIQUA NATIONAL BANK</text>`;
  s += `<g fill="#ffc928" stroke="#b07a10" stroke-width="3">${[0, 1, 2, 3].map(i => `<ellipse cx="300" cy="${590 - i * 14}" rx="40" ry="12"/>`).join("")}${[0, 1].map(i => `<ellipse cx="380" cy="${590 - i * 14}" rx="40" ry="12"/>`).join("")}</g>`;
  return svg(s, "#6c7686");
};

/* 🏆 Trophy hall: wood panels, shelves of gold cups, checkered banners, a red carpet */
rooms.trophy = () => {
  let s = wallFloor("#5b3b25", "#4a2f1d", "#2e1d12") + vlines(0, W, 160, 40, FLOOR - 14, "#4d3120", 6);
  s += `<path d="M560 ${H} L700 ${FLOOR} H900 L1040 ${H}Z" fill="#a8322c"/><path d="M590 ${H} L712 ${FLOOR} M1010 ${H} L888 ${FLOOR}" stroke="#d8a23a" stroke-width="6"/>`;
  const cup = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})" fill="#d9a72b"><path d="M-30 -90 h60 v20 a30 30 0 0 1 -60 0Z"/><path d="M-30 -84 h-14 a14 14 0 0 0 14 22 M30 -84 h14 a14 14 0 0 1 -14 22" fill="none" stroke="#d9a72b" stroke-width="6"/><rect x="-6" y="-42" width="12" height="20"/><rect x="-24" y="-24" width="48" height="12" rx="3"/><rect x="-30" y="-12" width="60" height="12" rx="3" fill="#6b4a2e"/></g>`;
  for (const [x0, x1] of [[40, 520], [1080, 1560]]) for (const y of [300, 470]) { s += R(x0, y, x1 - x0, 16, "#7a5233"); for (let x = x0 + 50; x < x1 - 20; x += 95) s += cup(x, y, 0.8 + rnd() * 0.45); }
  const flag = x => { let f = `<rect x="${x - 4}" y="40" width="8" height="200" fill="#2b2f38"/>`; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) f += R(x + 4 + c * 24, 50 + r * 24, 24, 24, (r + c) % 2 ? "#f4f1ea" : "#1d2230"); return f; };
  s += flag(80) + flag(1400);
  s += lamp(640, "#fff1c2") + lamp(960, "#fff1c2");
  return svg(s, "#4a2f1d");
};

/* ⭐ Rank tower: a steel timing tower with a scoreboard of bulbs and truss beams */
rooms.rank = () => {
  let s = wallFloor("#30384a", "#252b38", "#1a1f29");
  for (let x = 40; x < W; x += 120) for (let y = 40; y < FLOOR; y += 120) s += `<circle cx="${x}" cy="${y}" r="5" fill="#465068"/>`;
  const truss = x => `<g stroke="#5b6681" stroke-width="12" fill="none"><path d="M${x} 0 V${FLOOR} M${x + 120} 0 V${FLOOR}"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${x} ${i * 110} L${x + 120} ${i * 110 + 110}"/>`).join("")}</g>`;
  s += truss(20) + truss(1460);
  s += R(300, 40, 1000, 150, "#151a24", `rx="10" stroke="#5b6681" stroke-width="8"`);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 30; c++) s += `<circle cx="${335 + c * 32}" cy="${72 + r * 30}" r="10" fill="${rnd() < 0.42 ? "#ffc928" : "#2b3040"}"/>`;
  s += R(0, 700, W, 18, "#e4312b") + R(0, 718, W, 18, "#f4f1ea") + R(0, 736, W, 18, "#e4312b");
  return svg(s, "#252b38");
};

/* 🗺️ Missions office: a cork board of notes, a map with pins, a desk with a phone */
rooms.missions = () => {
  let s = wallFloor("#4d6656", "#3a3f36", "#2b3027");
  s += R(50, 110, 430, 330, "#b5864f", `rx="8" stroke="#7a5233" stroke-width="12"`);
  for (let i = 0; i < 9; i++) { const x = 80 + (i % 3) * 132 + rnd() * 20, y = 140 + Math.floor(i / 3) * 96 + rnd() * 10; s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="100" height="74" fill="${pick(["#fff4a8", "#ffd0e0", "#c8f0ff", "#d8ffc8"])}" transform="rotate(${(rnd() * 10 - 5).toFixed(1)} ${x + 50} ${y})"/><circle cx="${x + 50}" cy="${y + 8}" r="7" fill="${pick(["#e4312b", "#1f6fff", "#2db34a"])}"/>`; }
  s += R(1100, 100, 460, 340, "#e2d6b2", `rx="6" stroke="#7a5233" stroke-width="12"`) + `<g fill="none" stroke="#6a8a5a" stroke-width="10" stroke-linecap="round"><path d="M1130 380 q120 -160 220 -60 t180 -170"/></g><g fill="none" stroke="#5b8fd0" stroke-width="12" stroke-linecap="round"><path d="M1120 200 q160 40 220 120 t200 40"/></g>`;
  s += [[1180, 330], [1340, 300], [1480, 180], [1400, 380]].map(([x, y]) => `<path d="M${x} ${y} l-14 -30 a16 16 0 1 1 28 0Z" fill="#e4312b"/>`).join("");
  s += R(560, 520, 480, 30, "#7a5233") + R(580, 550, 30, FLOOR + 160 - 550, "#5e3d28") + R(990, 550, 30, FLOOR + 160 - 550, "#5e3d28") + R(820, 470, 120, 50, "#2b2f38", `rx="10"`) + R(640, 490, 120, 30, "#f4f1ea", `rx="3"`);
  s += lamp(800);
  return svg(s, "#3a3f36");
};

/* 🎁 Gift shop: shelves of wrapped presents, bunting, a counter */
rooms.gifts = () => {
  let s = wallFloor("#6f4a66", "#4e3448", "#3a2535") + bunting(30, ["#ffc928", "#2db34a", "#1f6fff", "#e4312b", "#f4f1ea"]);
  const box = (x, y, w, h) => { const c = pick(["#e4312b", "#1f6fff", "#2db34a", "#ffc928", "#ff7ac0"]), rib = pick(["#f4f1ea", "#ffc928"]); return `${R(x, y - h, w, h, c, `rx="4"`)}${R(x + w / 2 - 6, y - h, 12, h, rib)}${R(x, y - h * 0.6, w, 10, rib)}<path d="M${x + w / 2} ${y - h} q-24 -26 -30 -4 q14 8 30 4 q24 -26 30 -4 q-14 8 -30 4" fill="${rib}"/>`; };
  for (const [x0, x1] of [[30, 500], [1100, 1570]]) for (const y of [300, 460, 620]) { s += R(x0, y, x1 - x0, 16, "#8a5a3a"); for (let x = x0 + 16; x < x1 - 90;) { const w = 60 + rnd() * 40; s += box(x, y, w, 50 + rnd() * 50); x += w + 18; } }
  s += R(520, 560, 560, H - 560, "#8a5a3a", `rx="10"`) + R(500, 540, 600, 30, "#a8714a", `rx="8"`);
  return svg(s, "#4e3448");
};

/* 🧼 Car wash: blue tiles, giant spinning brushes, bubbles, a drain in the floor */
rooms.carwash = () => {
  let s = wallFloor("#2f6f9a", "#284a5e", "#1d3a4a") + lines(50, FLOOR - 20, 50, "#2a6690", 4) + vlines(0, W, 50, 0, FLOOR - 14, "#2a6690", 4);
  const brush = (x, c) => { let b = R(x - 10, 0, 20, 80, "#9aa4b1") + R(x - 90, 80, 180, FLOOR - 40, c, `rx="40"`); for (let y = 100; y < FLOOR + 20; y += 28) b += `<line x1="${x - 90}" y1="${y}" x2="${x + 90}" y2="${y + 14}" stroke="#ffffff" stroke-opacity=".25" stroke-width="6"/>`; return b; };
  s += brush(150, "#ff3fa4") + brush(1450, "#ffc928");
  for (let i = 0; i < 22; i++) { const x = 300 + rnd() * 1000, y = 80 + rnd() * 560, r = 10 + rnd() * 30; s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="#ffffff" fill-opacity=".18" stroke="#ffffff" stroke-opacity=".5" stroke-width="3"/>`; }
  s += R(700, 790, 200, 40, "#1b2a33", `rx="8"`) + vlines(715, 885, 20, 795, 825, "#3a4f5c", 6);
  s += `<path d="M0 ${FLOOR + 40} Q400 ${FLOOR + 10} 800 ${FLOOR + 50} T${W} ${FLOOR + 30}" fill="none" stroke="#8fd0f0" stroke-opacity=".35" stroke-width="10"/>`;
  return svg(s, "#284a5e");
};

/* 🏛️ Museum: a warm gallery wall, framed car paintings under spotlights, rope barriers, parquet */
rooms.museum = () => {
  let s = wallFloor("#6b5848", "#5a3e2a", "#3d2a1c");
  for (let x = 0; x < W; x += 80) for (let y = FLOOR; y < H; y += 40) s += `<path d="M${x + (((y - FLOOR) / 40) % 2) * 40} ${y} l40 40" stroke="#4d3423" stroke-width="5"/>`;
  const frame = (x, y, w, h) => { const c = pick(["#e4312b", "#1f6fff", "#2db34a", "#ffc928"]); return `<path d="M${x + w / 2 - 90} 0 L${x + w / 2 - 30} 40 h60 L${x + w / 2 + 90} 0Z" fill="#fff1c2" opacity=".0"/>${R(x - 18, y - 18, w + 36, h + 36, "#c9a43a", `rx="6"`)}${R(x, y, w, h, "#9ec7e0")}${R(x, y + h * 0.65, w, h * 0.35, "#6aa65e")}<rect x="${x + w * 0.25}" y="${y + h * 0.48}" width="${w * 0.5}" height="${h * 0.16}" rx="10" fill="${c}"/><circle cx="${x + w * 0.35}" cy="${y + h * 0.66}" r="${h * 0.07}" fill="#1b1d22"/><circle cx="${x + w * 0.65}" cy="${y + h * 0.66}" r="${h * 0.07}" fill="#1b1d22"/>`; };
  s += frame(70, 170, 260, 190) + frame(1270, 170, 260, 190) + frame(620, 110, 360, 150);
  for (const x of [200, 800, 1400]) s += `<path d="M${x - 40} 0 h80 l-10 30 h-60Z" fill="#2b2f38"/><path d="M${x - 30} 30 L${x - 180} ${FLOOR - 30} H${x + 180} L${x + 30} 30Z" fill="#fff1c2" opacity=".07"/>`;
  const post = x => R(x - 8, 560, 16, 160, "#c9a43a") + `<circle cx="${x}" cy="556" r="14" fill="#c9a43a"/>` + R(x - 30, 716, 60, 14, "#a8842a", `rx="6"`);
  s += post(80) + post(420) + post(1180) + post(1520) + `<path d="M80 570 Q250 640 420 570 M1180 570 Q1350 640 1520 570" fill="none" stroke="#a8322c" stroke-width="12"/>`;
  return svg(s, "#5a3e2a");
};

for (const [name, draw] of Object.entries(rooms)) { seed = 7 + name.length * 131; writeFileSync(join(out, name + ".svg"), draw()); }
console.log(`${Object.keys(rooms).length} rooms drawn in public/rooms/`);
