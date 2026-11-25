// 🎃🎄🎆 Holiday decorations on Main Street (v1.22): the calendar picks the holiday, and the town drawing shows it.
import { HOLIDAYS, holidayOn } from "../src/holiday.js";
import { townSVG } from "../src/town.js";

let passed = 0, failed = 0;
const check = (name, ok, msg = "") => { if (ok) passed++; else { failed++; console.log(`  ✖ ${name}: ${msg}`); } };
const on = (m, d, y = 2026) => holidayOn(new Date(y, m - 1, d, 12));

check("fall from 1 October to 30 November", on(10, 1) === "fall" && on(11, 25) === "fall" && on(11, 30) === "fall" && on(9, 30) === null, [on(10, 1), on(11, 30), on(9, 30)].join(" "));
check("winter from 1 December to 6 January, past New Year", on(12, 1) === "winter" && on(12, 31) === "winter" && on(1, 1, 2027) === "winter" && on(1, 6, 2027) === "winter" && on(1, 7, 2027) === null, [on(12, 1), on(1, 6, 2027), on(1, 7, 2027)].join(" "));
check("summer from 28 June to 7 July", on(6, 28) === "summer" && on(7, 7) === "summer" && on(6, 27) === null && on(7, 8) === null, "");
check("most of the year has none", on(3, 15) === null && on(5, 1) === null && on(8, 20) === null, "");
// every day of a year has at most one holiday, and the windows do not overlap
let both = 0; for (let d = new Date(2026, 0, 1); d.getFullYear() === 2026; d.setDate(d.getDate() + 1)) {
  const n = HOLIDAYS.filter(h => holidayOn(d) === h.id).length; if (n > 1) both++;
}
check("one holiday a day at most", both === 0, `${both} days`);
// the picture guard (scripts/guard.mjs) holds the clock on 7 January: no holiday there, so its Main Street never changes
check("the picture guard's day has no holiday", on(1, 7) === null, String(on(1, 7)));

const plain = townSVG(null);
check("no holiday: no decoration and no extra tap target", !plain.includes('data-go="holiday"') && !plain.includes("snowman"), "");
for (const h of HOLIDAYS) {
  const s = townSVG(h.id);
  check(`${h.id}: one big decoration to tap`, (s.match(/data-go="holiday"/g) || []).length === 1, "");
  check(`${h.id}: drawn without holes`, !/NaN|undefined/.test(s), "");
  check(`${h.id}: every building is still there to tap`, ["garage", "gift", "missions", "race", "rank", "lab", "trophy", "school", "bank", "carwash", "museum", "icecream", "fire", "park"].every(g => s.includes(`data-go="${g}"`)), "");
  // the big decoration is drawn before the buildings, so a building's tap always wins where the two meet
  check(`${h.id}: the decoration sits behind the buildings`, s.indexOf('data-go="holiday"') < s.indexOf('data-go="garage"'), "");
}
const w = townSVG("winter"), f = townSVG("fall"), su = townSVG("summer");
check("winter has snow, lights and a star", w.includes("#f6fbff") && (w.match(/class="bulb/g) || []).length > 40, "");
check("fall has pumpkins and orange trees", (f.match(/#ff8a1e/g) || []).length >= 10 && f.includes("#e8742a"), "");
check("summer has fireworks and flags", (su.match(/class="fw"/g) || []).length >= 4 && su.includes('class="flag" d="M'), "");

console.log(failed ? `${failed} holiday checks failed` : `All ${passed} holiday checks passed`);
if (failed) process.exit(1);
