// The hub: a little town drawn as SVG in the game's flat style. Every building is a big tap target.
const BASE = 780; // where buildings stand

const sign = (x, y, w, text, fill = "#ffd400", fs = 38) => `
  <rect x="${x - w / 2}" y="${y}" width="${w}" height="56" rx="14" fill="${fill}" stroke="#5a2a00" stroke-width="5"/>
  <text x="${x}" y="${y + 41}" class="lbl" font-size="${fs}">${text}</text>`;
const badge = (id, x, y) => `<g class="tbadge" id="${id}" style="display:none"><circle cx="${x}" cy="${y}" r="30" fill="#ff2d2d" stroke="#fff" stroke-width="6"/><text x="${x}" y="${y + 14}" class="bt">!</text></g>`;
const win = (x, y, w = 34, h = 40) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#bfe9ff" stroke="#fff" stroke-width="4"/>`;

const garage = () => `
<g class="bld" data-go="garage">
  <rect x="70" y="${BASE - 250}" width="280" height="250" rx="12" fill="#ff8a00"/>
  <rect x="58" y="${BASE - 272}" width="304" height="36" rx="10" fill="#b3261e"/>
  <rect x="105" y="${BASE - 165}" width="210" height="165" rx="8" fill="#e9e9ef"/>
  ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="105" y="${BASE - 160 + i * 27}" width="210" height="6" fill="#c9c9d6"/>`).join("")}
  <rect x="140" y="${BASE - 52}" width="140" height="44" rx="12" fill="#e8262b"/><circle cx="165" cy="${BASE - 8}" r="14" fill="#222"/><circle cx="255" cy="${BASE - 8}" r="14" fill="#222"/>
  <text x="210" y="${BASE - 285}" font-size="70" text-anchor="middle">🔧</text>
  ${sign(210, BASE - 234, 230, "GARAGE")}
  ${badge("tb-garage", 345, BASE - 270)}
</g>`;

const gifts = () => `
<g class="bld" data-go="gift">
  <rect x="372" y="${BASE - 150}" width="130" height="150" rx="10" fill="#ff8ad8"/>
  <path d="M362 ${BASE - 150} h150 l-10 -34 h-130z" fill="#fff"/>
  ${[0, 1, 2, 3, 4].map(i => `<path d="M${367 + i * 30} ${BASE - 150} h20 l-6 -34 h-14z" fill="#e8262b"/>`).join("")}
  <rect x="392" y="${BASE - 110}" width="90" height="110" rx="6" fill="#7a2cff"/>
  <text x="437" y="${BASE - 196}" font-size="60" text-anchor="middle">🎁</text>
  ${sign(437, BASE - 90, 120, "GIFTS", "#fff", 30)}
  ${badge("tb-gift", 500, BASE - 200)}
</g>`;

const track = () => `
<g class="bld race" data-go="race">
  <path d="M520 ${BASE} L548 ${BASE - 230} L872 ${BASE - 230} L900 ${BASE}Z" fill="#7a2cff"/>
  ${[0, 1, 2, 3].map(r => Array.from({ length: 11 }, (_, i) => `<circle cx="${575 + i * 27 + (r % 2) * 13}" cy="${BASE - 205 + r * 30}" r="9" fill="${["#ffd400", "#ff3fa4", "#3cf2ff", "#5be36a", "#fff"][(i + r) % 5]}"/>`).join("")).join("")}
  <path d="M528 ${BASE - 230} L892 ${BASE - 230} L918 ${BASE - 270} L502 ${BASE - 270}Z" fill="#e8262b"/>
  ${[540, 640, 780, 880].map((x, i) => `<line x1="${x}" y1="${BASE - 270}" x2="${x}" y2="${BASE - 345}" stroke="#555" stroke-width="5"/><path class="flag f${i}" d="M${x} ${BASE - 345} l46 13 l-46 13z" fill="${["#ffd400", "#3cf2ff", "#5be36a", "#ff3fa4"][i]}"/>`).join("")}
  <rect x="610" y="${BASE - 86}" width="200" height="86" fill="#333"/>
  ${Array.from({ length: 20 }, (_, i) => `<rect x="${610 + (i % 10) * 20}" y="${BASE - 86 + Math.floor(i / 10) * 20}" width="20" height="20" fill="${(i + Math.floor(i / 10)) % 2 ? "#fff" : "#111"}"/>`).join("")}
  <text x="710" y="${BASE - 22}" font-size="46" text-anchor="middle">🏁</text>
  ${sign(710, BASE - 340, 300, "RACE TRACK", "#ffd400", 40)}
  <g class="go-pop"><circle cx="905" cy="${BASE - 320}" r="40" fill="#5be36a" stroke="#fff" stroke-width="6"/><text x="905" y="${BASE - 306}" class="bt" font-size="34">GO</text></g>
</g>`;

const tower = () => `
<g class="bld" data-go="rank">
  <rect x="952" y="${BASE - 400}" width="96" height="400" rx="10" fill="#ffd400"/>
  <rect x="940" y="${BASE - 412}" width="120" height="26" rx="8" fill="#ff8a00"/>
  ${[0, 1, 2, 3, 4].map(i => win(983, BASE - 360 + i * 66)).join("")}
  <path d="M1000 ${BASE - 520} l18 38 l42 6 l-30 29 l7 42 l-37 -20 l-37 20 l7 -42 l-30 -29 l42 -6z" fill="#ffd400" stroke="#ff8a00" stroke-width="6"/>
  <text x="1000" y="${BASE - 447}" class="lbl" font-size="40" id="tw-rank">1</text>
  ${sign(1000, BASE - 70, 150, "RANK", "#fff", 36)}
  ${badge("tb-rank", 1060, BASE - 500)}
</g>`;

const lab = () => `
<g class="bld" data-go="lab">
  <rect x="1080" y="${BASE - 220}" width="250" height="220" rx="12" fill="#3cc8d8"/>
  <path d="M1110 ${BASE - 220} a95 95 0 0 1 190 0z" fill="#c7fbff" stroke="#fff" stroke-width="6"/>
  <line x1="1205" y1="${BASE - 315}" x2="1205" y2="${BASE - 370}" stroke="#555" stroke-width="6"/><circle class="blink" cx="1205" cy="${BASE - 372}" r="12" fill="#ff3d3d"/>
  ${win(1105, BASE - 175, 44, 50)}${win(1260, BASE - 175, 44, 50)}
  <rect x="1170" y="${BASE - 110}" width="70" height="110" rx="8" fill="#1b6f7a"/>
  <g class="tubes">${[0, 1, 2].map(i => `<rect x="${1110 + i * 34}" y="${BASE - 95}" width="22" height="70" rx="11" fill="#fff" opacity=".8"/><rect x="${1113 + i * 34}" y="${BASE - 60}" width="16" height="32" rx="8" fill="${["#5be36a", "#ff3fa4", "#ffd400"][i]}"/>`).join("")}</g>
  ${sign(1205, BASE - 270, 230, "TURBO LAB", "#ffd400", 34)}
  <g id="lab-lock">
    <rect x="1080" y="${BASE - 220}" width="250" height="220" fill="rgba(0,0,0,.35)"/>
    <rect x="1070" y="${BASE - 160}" width="270" height="26" fill="#8a5a2b" transform="rotate(-8 1205 ${BASE - 147})"/>
    <rect x="1070" y="${BASE - 100}" width="270" height="26" fill="#8a5a2b" transform="rotate(6 1205 ${BASE - 87})"/>
    <text x="1205" y="${BASE - 120}" font-size="70" text-anchor="middle">🔒</text>
    <rect x="1135" y="${BASE - 60}" width="140" height="46" rx="12" fill="#222"/><text x="1205" y="${BASE - 26}" class="lbl" font-size="30" fill="#ffd400" id="lab-need">RANK 2</text>
  </g>
  ${badge("tb-lab", 1325, BASE - 270)}
</g>`;

const hall = () => `
<g class="bld" data-go="trophy">
  <rect x="1360" y="${BASE - 200}" width="210" height="200" fill="#f4e7c8"/>
  <path d="M1345 ${BASE - 200} L1465 ${BASE - 270} L1585 ${BASE - 200}Z" fill="#e0c88f" stroke="#fff" stroke-width="5"/>
  ${[0, 1, 2, 3].map(i => `<rect x="${1378 + i * 50}" y="${BASE - 190}" width="22" height="190" fill="#fff"/>`).join("")}
  <text x="1465" y="${BASE - 268}" font-size="96" text-anchor="middle">🏆</text>
  ${sign(1465, BASE - 120, 200, "TROPHIES", "#ffd400", 32)}
  ${badge("tb-trophy", 1570, BASE - 300)}
</g>`;

const car = (cls, color) => `<g class="tcar ${cls}"><rect x="0" y="-36" width="90" height="28" rx="10" fill="${color}"/><path d="M18 -36 l12 -20 h34 l12 20z" fill="${color}"/><path d="M28 -38 l8 -14 h22 l8 14z" fill="#2b4c80"/><circle cx="22" cy="-8" r="11" fill="#222"/><circle cx="70" cy="-8" r="11" fill="#222"/></g>`;

export function townSVG() {
  return `<svg id="town" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb6ff"/><stop offset="1" stop-color="#bfe9ff"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#tsky)"/>
  <circle cx="1450" cy="110" r="95" fill="#fff59a" opacity=".35"/><circle cx="1450" cy="110" r="62" fill="#fff59a"/>
  <g class="clouds">${[[200, 120, 1], [700, 80, 0.8], [1100, 170, 1.2]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="90" ry="30" fill="#fff"/><ellipse cx="-40" cy="8" rx="55" ry="26" fill="#fff"/><ellipse cx="35" cy="-12" rx="50" ry="30" fill="#fff"/></g>`).join("")}</g>
  <path d="M0 520 Q220 400 460 500 T900 470 T1320 450 T1600 500 V900 H0Z" fill="#3fa553"/>
  <path d="M0 600 Q300 520 620 590 T1200 570 T1600 590 V900 H0Z" fill="#5cc46a"/>
  <rect y="640" width="1600" height="260" fill="#5fd068"/>
  <g transform="translate(80 78) scale(0.9)">${garage()}${gifts()}${track()}${tower()}${lab()}${hall()}</g>
  <rect y="${BASE}" width="1600" height="14" fill="#e9e9ef"/>
  <rect y="${BASE + 14}" width="1600" height="96" fill="#6b6f78"/>
  <line x1="0" y1="${BASE + 62}" x2="1600" y2="${BASE + 62}" stroke="#fff" stroke-width="8" stroke-dasharray="50 40"/>
  <g transform="translate(0 ${BASE + 58})">${car("c1", "#1f6fff")}</g>
  <g transform="translate(0 ${BASE + 106})">${car("c2", "#ff3fa4")}</g>
  <g transform="translate(0 ${BASE + 106})">${car("c3", "#ffcc00")}</g>
</svg>`;
}
