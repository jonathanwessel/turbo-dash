// The hub: Turbo Town, drawn as SVG in the game's flat style. Eight separate buildings in a row, each on its
// own lot with a gap (and a tree or lamp post) before the next one, a big icon on the roof and one clear word on
// its sign, so a 6-year-old can tell them apart. Each building is one big tap target.
const BASE = 760;   // sidewalk line where buildings stand

const label = (cx, y, w, text, fs = 30, fill = "#ffd400") => `
  <rect x="${cx - w / 2}" y="${y}" width="${w}" height="${fs + 22}" rx="14" fill="${fill}" stroke="#4a2600" stroke-width="5"/>
  <text x="${cx}" y="${y + fs + 6}" class="lbl" font-size="${fs}">${text}</text>`;
const roofIcon = (cx, y, icon, size = 64) => `<text x="${cx}" y="${y}" font-size="${size}" text-anchor="middle" class="ico">${icon}</text>`;
const badge = (id, x, y) => `<g class="tbadge" id="${id}" style="display:none"><circle cx="${x}" cy="${y}" r="30" fill="#ff2d2d" stroke="#fff" stroke-width="6"/><text x="${x}" y="${y + 14}" class="bt">!</text></g>`;
const win = (x, y, w = 30, h = 36) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#bfe9ff" stroke="#fff" stroke-width="4"/>`;
const hit = (x, w, top) => `<rect x="${x - 10}" y="${top}" width="${w + 20}" height="${BASE + 30 - top}" fill="transparent"/>`;
const lot = (x, w) => `<rect x="${x - 8}" y="${BASE - 6}" width="${w + 16}" height="22" rx="8" fill="#e9e9ef"/>`;
const lock = (id, x, w, top, h, text) => `<g id="${id}">
  <rect x="${x}" y="${top}" width="${w}" height="${h}" rx="10" fill="rgba(20,10,40,.55)"/>
  <text x="${x + w / 2}" y="${top + h / 2 + 10}" font-size="58" text-anchor="middle">🔒</text>
  <rect x="${x + w / 2 - 62}" y="${top + h / 2 + 24}" width="124" height="40" rx="12" fill="#222"/>
  <text x="${x + w / 2}" y="${top + h / 2 + 53}" class="lbl" font-size="24" style="fill:#ffd400">${text}</text></g>`;

const B = {
  garage: { x: 95, w: 150 }, gifts: { x: 270, w: 120 }, missions: { x: 415, w: 150 }, race: { x: 590, w: 230 },
  rank: { x: 845, w: 100 }, lab: { x: 970, w: 160 }, trophy: { x: 1155, w: 150 }, school: { x: 1330, w: 150 },
};
const cx = k => B[k].x + B[k].w / 2;

const garage = () => { const { x, w } = B.garage, top = BASE - 230; return `
<g class="bld" data-go="garage">${hit(x, w, top - 90)}${lot(x, w)}
  <rect x="${x}" y="${top}" width="${w}" height="230" rx="10" fill="#ff8a00"/>
  <rect x="${x - 10}" y="${top - 18}" width="${w + 20}" height="30" rx="10" fill="#b3261e"/>
  <rect x="${x + 18}" y="${BASE - 135}" width="${w - 36}" height="135" rx="6" fill="#e9e9ef"/>
  ${[0, 1, 2, 3, 4].map(i => `<rect x="${x + 18}" y="${BASE - 128 + i * 26}" width="${w - 36}" height="6" fill="#c9c9d6"/>`).join("")}
  <rect x="${x + 35}" y="${BASE - 44}" width="${w - 70}" height="34" rx="10" fill="#e8262b"/><circle cx="${x + 52}" cy="${BASE - 8}" r="11" fill="#222"/><circle cx="${x + w - 52}" cy="${BASE - 8}" r="11" fill="#222"/>
  ${roofIcon(cx("garage"), top - 28, "🔧")}
  ${label(cx("garage"), top + 22, w - 14, "GARAGE")}
  ${badge("tb-garage", x + w, top - 20)}
</g>`; };

const gifts = () => { const { x, w } = B.gifts, top = BASE - 170; return `
<g class="bld" data-go="gift">${hit(x, w, top - 110)}${lot(x, w)}
  <rect x="${x}" y="${top}" width="${w}" height="170" rx="10" fill="#ff8ad8"/>
  <path d="M${x - 10} ${top} h${w + 20} l-12 -38 h${-(w - 4)}z" fill="#fff"/>
  ${[0, 1, 2, 3].map(i => `<path d="M${x - 4 + i * (w + 8) / 4} ${top} h${(w + 8) / 8} l-5 -38 h${-(w + 8) / 8 + 6}z" fill="#e8262b"/>`).join("")}
  <rect x="${x + 16}" y="${BASE - 100}" width="${w - 32}" height="100" rx="6" fill="#7a2cff"/>
  <text x="${cx("gifts")}" y="${BASE - 40}" font-size="38" text-anchor="middle">🎁</text>
  ${roofIcon(cx("gifts"), top - 48, "🎁", 60)}
  ${label(cx("gifts"), top + 14, w - 10, "GIFTS", 28, "#fff")}
  ${badge("tb-gift", x + w, top - 50)}
</g>`; };

const missions = () => { const { x, w } = B.missions, top = BASE - 250; return `
<g class="bld" data-go="missions">${hit(x, w, top - 70)}${lot(x, w)}
  <rect x="${x + 22}" y="${top + 120}" width="14" height="${BASE - top - 120}" fill="#6b4423"/><rect x="${x + w - 36}" y="${top + 120}" width="14" height="${BASE - top - 120}" fill="#6b4423"/>
  <rect x="${x}" y="${top}" width="${w}" height="140" rx="14" fill="#8a5a2b" stroke="#5a3416" stroke-width="6"/>
  ${[[14, 14], [80, 18], [26, 72], [88, 76]].map(([dx, dy], i) => `<rect x="${x + dx}" y="${top + dy}" width="50" height="46" rx="4" fill="#fff" transform="rotate(${[-6, 5, 4, -5][i]} ${x + dx + 25} ${top + dy + 23})"/><text x="${x + dx + 25}" y="${top + dy + 34}" font-size="26" text-anchor="middle">${["✔", "⭐", "🏁", "🪙"][i]}</text>`).join("")}
  ${roofIcon(cx("missions"), top - 14, "📋", 58)}
  ${label(cx("missions"), top + 150, w, "MISSIONS", 26)}
  ${lock("mis-lock", x, w, top, 140, "RANK 7")}
  ${badge("tb-missions", x + w, top - 10)}
</g>`; };

const race = () => { const { x, w } = B.race, top = BASE - 230; return `
<g class="bld race" data-go="race">${hit(x, w, top - 130)}${lot(x, w)}
  <path d="M${x} ${BASE} L${x + 22} ${top} L${x + w - 22} ${top} L${x + w} ${BASE}Z" fill="#7a2cff"/>
  ${[0, 1, 2, 3].map(r => Array.from({ length: 8 }, (_, i) => `<circle cx="${x + 40 + i * 21 + (r % 2) * 10}" cy="${top + 24 + r * 28}" r="8" fill="${["#ffd400", "#ff3fa4", "#3cf2ff", "#5be36a", "#fff"][(i + r) % 5]}"/>`).join("")).join("")}
  <path d="M${x + 6} ${top} L${x + w - 6} ${top} L${x + w + 14} ${top - 36} L${x - 14} ${top - 36}Z" fill="#e8262b"/>
  ${[0, 1, 2, 3].map(i => { const fx = x + 10 + i * (w - 20) / 3; return `<line x1="${fx}" y1="${top - 36}" x2="${fx}" y2="${top - 100}" stroke="#555" stroke-width="5"/><path class="flag f${i}" d="M${fx} ${top - 100} l40 12 l-40 12z" fill="${["#ffd400", "#3cf2ff", "#5be36a", "#ff3fa4"][i]}"/>`; }).join("")}
  <rect x="${x + 55}" y="${BASE - 80}" width="${w - 110}" height="80" fill="#333"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="${x + 55 + (i % 6) * (w - 110) / 6}" y="${BASE - 80 + Math.floor(i / 6) * 20}" width="${(w - 110) / 6}" height="20" fill="${(i + Math.floor(i / 6)) % 2 ? "#fff" : "#111"}"/>`).join("")}
  ${label(cx("race"), top + 118, w - 20, "RACE TRACK", 30)}
  <g class="go-pop"><rect x="${cx("race") - 120}" y="${top - 236}" width="240" height="96" rx="48" fill="#23a33a" stroke="#fff" stroke-width="8"/><rect x="${cx("race") - 108}" y="${top - 228}" width="216" height="38" rx="19" fill="#5be36a"/><text x="${cx("race")}" y="${top - 166}" class="bt" font-size="58">RACE!</text></g>
</g>`; };

const rank = () => { const { x, w } = B.rank, top = BASE - 380; return `
<g class="bld" data-go="rank">${hit(x, w, top - 130)}${lot(x, w)}
  <rect x="${x + 10}" y="${top}" width="${w - 20}" height="380" rx="10" fill="#ffd400"/>
  <rect x="${x}" y="${top - 14}" width="${w}" height="26" rx="8" fill="#ff8a00"/>
  ${[0, 1, 2, 3, 4].map(i => win(x + w / 2 - 15, top + 30 + i * 62)).join("")}
  <path d="M${cx("rank")} ${top - 128} l18 38 l42 6 l-30 29 l7 42 l-37 -20 l-37 20 l7 -42 l-30 -29 l42 -6z" fill="#ffd400" stroke="#ff8a00" stroke-width="6"/>
  <text x="${cx("rank")}" y="${top - 55}" class="lbl" font-size="38" id="tw-rank">1</text>
  ${label(cx("rank"), BASE - 64, w + 6, "RANK", 28, "#fff")}
  ${badge("tb-rank", x + w, top - 120)}
</g>`; };

const lab = () => { const { x, w } = B.lab, top = BASE - 200; return `
<g class="bld" data-go="lab">${hit(x, w, top - 150)}${lot(x, w)}
  <rect x="${x}" y="${top}" width="${w}" height="200" rx="12" fill="#3cc8d8"/>
  <path d="M${x + 15} ${top} a${w / 2 - 15} ${w / 2 - 15} 0 0 1 ${w - 30} 0z" fill="#c7fbff" stroke="#fff" stroke-width="6"/>
  <line x1="${cx("lab")}" y1="${top - w / 2 + 15}" x2="${cx("lab")}" y2="${top - w / 2 - 30}" stroke="#555" stroke-width="6"/><circle class="blink" cx="${cx("lab")}" cy="${top - w / 2 - 32}" r="11" fill="#ff3d3d"/>
  <text x="${cx("lab")}" y="${top - 18}" class="lbl" font-size="26" id="lab-timer"></text>
  <rect x="${cx("lab") - 30}" y="${BASE - 96}" width="60" height="96" rx="8" fill="#1b6f7a"/>
  <g class="tubes bubbling">${[0, 1].map(i => `<rect x="${x + 16 + i * 30}" y="${BASE - 84}" width="20" height="62" rx="10" fill="#fff" opacity=".8"/><rect x="${x + 19 + i * 30}" y="${BASE - 52}" width="14" height="28" rx="7" fill="${["#5be36a", "#ff3fa4"][i]}"/>`).join("")}${[0, 1].map(i => `<rect x="${x + w - 36 - i * 30}" y="${BASE - 84}" width="20" height="62" rx="10" fill="#fff" opacity=".8"/><rect x="${x + w - 33 - i * 30}" y="${BASE - 52}" width="14" height="28" rx="7" fill="${["#ffd400", "#3cf2ff"][i]}"/>`).join("")}</g>
  ${label(cx("lab"), top + 16, w - 10, "TURBO LAB", 26)}
  ${lock("lab-lock", x, w, top, 200, "RANK 2")}
  ${badge("tb-lab", x + w, top - 20)}
</g>`; };

const trophy = () => { const { x, w } = B.trophy, top = BASE - 190; return `
<g class="bld" data-go="trophy">${hit(x, w, top - 150)}${lot(x, w)}
  <rect x="${x}" y="${top}" width="${w}" height="190" fill="#f4e7c8"/>
  <path d="M${x - 14} ${top} L${cx("trophy")} ${top - 62} L${x + w + 14} ${top}Z" fill="#e0c88f" stroke="#fff" stroke-width="5"/>
  ${[0, 1, 2, 3].map(i => `<rect x="${x + 14 + i * (w - 48) / 3}" y="${top + 76}" width="20" height="${BASE - top - 76}" fill="#fff"/>`).join("")}
  ${roofIcon(cx("trophy"), top - 58, "🏆", 84)}
  ${label(cx("trophy"), top + 14, w - 6, "TROPHIES", 26)}
  ${badge("tb-trophy", x + w, top - 70)}
</g>`; };

const school = () => { const { x, w } = B.school, top = BASE - 200; return `
<g class="bld" data-go="school">${hit(x, w, top - 140)}${lot(x, w)}
  <rect x="${x}" y="${top}" width="${w}" height="200" rx="6" fill="#c0392b"/>
  ${[0, 1, 2, 3, 4, 5].map(r => `<line x1="${x}" y1="${top + 30 + r * 28}" x2="${x + w}" y2="${top + 30 + r * 28}" stroke="#a5301f" stroke-width="3"/>`).join("")}
  <path d="M${x - 12} ${top} L${cx("school")} ${top - 54} L${x + w + 12} ${top}Z" fill="#7a2a1e"/>
  <rect x="${cx("school") - 22}" y="${top - 100}" width="44" height="54" fill="#f4e7c8"/><path d="M${cx("school") - 30} ${top - 100} L${cx("school")} ${top - 128} L${cx("school") + 30} ${top - 100}Z" fill="#7a2a1e"/>
  <text x="${cx("school")}" y="${top - 60}" font-size="30" text-anchor="middle">🔔</text>
  ${win(x + 16, top + 82, 34, 40)}${win(x + w - 50, top + 82, 34, 40)}
  <rect x="${cx("school") - 24}" y="${BASE - 70}" width="48" height="70" rx="6" fill="#5a1f16"/>
  <rect x="${x + w + 6}" y="${BASE - 110}" width="10" height="110" fill="#555"/><rect x="${x + w - 2}" y="${BASE - 168}" width="26" height="62" rx="8" fill="#222"/>
  <circle cx="${x + w + 11}" cy="${BASE - 154}" r="7" fill="#ff3d3d"/><circle cx="${x + w + 11}" cy="${BASE - 137}" r="7" fill="#ffd400"/><circle cx="${x + w + 11}" cy="${BASE - 120}" r="7" fill="#5be36a"/>
  ${label(cx("school"), top + 14, w - 6, "SCHOOL", 26)}
  <g transform="rotate(-10 ${cx("school")} ${top + 120})"><rect x="${x - 16}" y="${top + 100}" width="${w + 32}" height="40" fill="#ffd400" stroke="#4a2600" stroke-width="4"/><text x="${cx("school")}" y="${top + 129}" class="lbl" font-size="24">COMING SOON</text></g>
</g>`; };

// little things in the gaps between buildings (they never take taps)
const tree = x => `<g class="deco"><rect x="${x - 5}" y="${BASE - 60}" width="10" height="62" fill="#7a4a22"/><circle cx="${x}" cy="${BASE - 78}" r="26" fill="#2f9a3d"/><circle cx="${x - 9}" cy="${BASE - 90}" r="15" fill="#3fb84e"/></g>`;
const lamp = x => `<g class="deco"><rect x="${x - 3}" y="${BASE - 120}" width="6" height="122" fill="#555"/><rect x="${x - 14}" y="${BASE - 128}" width="28" height="12" rx="6" fill="#555"/><circle cx="${x}" cy="${BASE - 114}" r="7" fill="#fff59a"/></g>`;
const gaps = () => {
  const order = ["garage", "gifts", "missions", "race", "rank", "lab", "trophy", "school"];
  return order.slice(0, -1).map((k, i) => { const gx = B[k].x + B[k].w + (B[order[i + 1]].x - B[k].x - B[k].w) / 2; return i % 2 ? lamp(gx) : tree(gx); }).join("");
};

/* "Welcome to PIQUA, Ohio": a cartoon hometown sign (red words, big blue letters). */
const welcome = () => {
  // styled after the city sign: small red words top-left, big bold blue PIQUA

  return `<g class="deco welcome">
  <rect x="152" y="340" width="16" height="122" fill="#6b4423"/><rect x="412" y="340" width="16" height="122" fill="#6b4423"/>
  <rect x="110" y="232" width="360" height="146" rx="20" fill="#fff" stroke="#1d6fb8" stroke-width="8"/>
  <text x="168" y="276" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="32" fill="#e8402a">Welcome to</text>
  <text x="166" y="344" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="78" fill="#1d6fb8" textLength="250" lengthAdjust="spacingAndGlyphs">PIQUA</text>
  <text x="170" y="370" font-family="Arial, sans-serif" font-weight="900" font-size="15" fill="#1d6fb8" letter-spacing="5">OHIO</text>
</g>`;
};

const car = (cls, color) => `<g class="tcar ${cls}"><rect x="0" y="-36" width="90" height="28" rx="10" fill="${color}"/><path d="M18 -36 l12 -20 h34 l12 20z" fill="${color}"/><path d="M28 -38 l8 -14 h22 l8 14z" fill="#2b4c80"/><circle cx="22" cy="-8" r="11" fill="#222"/><circle cx="70" cy="-8" r="11" fill="#222"/><circle cx="22" cy="-8" r="4" fill="#bbb"/><circle cx="70" cy="-8" r="4" fill="#bbb"/></g>`;

export function townSVG() {
  return `<svg id="town" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fb6ff"/><stop offset="1" stop-color="#c9efff"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#tsky)"/>
  <circle cx="1480" cy="110" r="95" fill="#fff59a" opacity=".35"/><circle cx="1480" cy="110" r="62" fill="#fff59a"/>
  <g class="clouds">${[[220, 110, 1], [720, 70, 0.8], [1150, 150, 1.1]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="90" ry="30" fill="#fff"/><ellipse cx="-40" cy="8" rx="55" ry="26" fill="#fff"/><ellipse cx="35" cy="-12" rx="50" ry="30" fill="#fff"/></g>`).join("")}</g>
  <g class="birds" fill="none" stroke="#2a3a5a" stroke-width="4" stroke-linecap="round">${[[400, 200], [440, 225], [470, 195]].map(([x, y]) => `<path d="M${x - 12} ${y} q6 -8 12 0 q6 -8 12 0"/>`).join("")}</g>
  <path d="M0 470 Q220 360 460 450 T900 420 T1320 400 T1600 450 V900 H0Z" fill="#3fa553"/>
  <path d="M0 520 Q260 470 520 505 T1060 490 T1600 510" fill="none" stroke="#4fb6ff" stroke-width="26" stroke-linecap="round" opacity=".9"/>
  <path d="M0 520 Q260 470 520 505 T1060 490 T1600 510" fill="none" stroke="#bfe9ff" stroke-width="6" stroke-dasharray="40 60" opacity=".8"/>
  <path d="M0 560 Q300 480 620 550 T1200 530 T1600 550 V900 H0Z" fill="#5cc46a"/>
  ${welcome()}
  <rect y="600" width="1600" height="300" fill="#5fd068"/>
  ${gaps()}
  ${garage()}${gifts()}${missions()}${race()}${rank()}${lab()}${trophy()}${school()}
  <rect y="${BASE + 10}" width="1600" height="16" fill="#e9e9ef"/>
  <rect y="${BASE + 26}" width="1600" height="100" fill="#6b6f78"/>
  <line x1="0" y1="${BASE + 76}" x2="1600" y2="${BASE + 76}" stroke="#fff" stroke-width="8" stroke-dasharray="50 40"/>
  <g transform="translate(0 ${BASE + 72})">${car("c1", "#1f6fff")}</g>
  <g transform="translate(0 ${BASE + 120})">${car("c2", "#ff3fa4")}</g>
  <g transform="translate(0 ${BASE + 120})">${car("c3", "#ffcc00")}</g>
</svg>`;
}
