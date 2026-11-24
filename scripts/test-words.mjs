// Words the player sees (games/CLAUDE.md "Words players see", v1.11.3). The sweep checks every screen it opens for
// colons and semicolons (src/dev/audit.js), but toasts and race pop-ups come and go, so this test reads them from the
// source. It also guards the picture review's other finds: no month names (a young player can't read a calendar),
// no jargon on the upgrade cards, and a Racer Rank hint that names a small next step, not a far total.
//   node scripts/test-words.mjs   (part of npm test)
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { UPGRADES, TRACKS, BONUS_TRACKS, RESEARCH, winsStep } from "../src/data.js";

const root = resolve(import.meta.dirname, "..");
let fails = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { fails++; console.log("  ✖ " + msg); } };

// 1. toasts and race pop-ups: no "Word: thing" and no semicolons
const SRC = ["src/main.js", "src/garage.js", "src/town.js", "src/lab.js", "src/engine.js", "src/toy/race.js"];
for (const f of SRC) {
  let text; try { text = readFileSync(join(root, f), "utf8"); } catch { continue; }
  for (const m of text.matchAll(/\b(toast|popup)\((`[^`]*`|"[^"]*")/g)) {
    const s = m[2].slice(1, -1).replace(/\$\{[^}]*\}/g, "1");
    check(!/[^\d\s][:;](\s|$)/.test(s), `${f}: ${m[1]} text has a colon or semicolon: ${m[2].slice(0, 60)}`);
  }
}
// 2. no month names on track cards (a picture and a season word instead)
const MONTHS = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/;
for (const t of [...TRACKS, ...BONUS_TRACKS]) if (t.season) check(!MONTHS.test(t.season.when), `${t.name} opens "in ${t.season.when}": use a season word`);
// 3. upgrade cards use words a young player knows
for (const u of UPGRADES) check(!/nitro|boost meter|stat/i.test(u.desc), `upgrade ${u.name} says "${u.desc}"`);
// 4. the Racer Rank hint: the wins to the next multiple of 10, never more than 10, never past the gauge
check(winsStep(574, 640) === 6, `574 of 640 wins should ask for 6 more (got ${winsStep(574, 640)})`);
check(winsStep(0, 640) === 10 && winsStep(630, 640) === 10 && winsStep(635, 640) === 5 && winsStep(8, 10) === 2 && winsStep(0, 3) === 3, "winsStep small steps");
for (let need = 1; need < 700; need += 7) for (let have = 0; have < need; have += 3) {
  const s = winsStep(have, need); if (s < 1 || s > 10 || have + s > need) { check(false, `winsStep(${have}, ${need}) = ${s}`); break; }
}
// 5. Turbo Lab (v1.12): every card has a short line of one or two words, no grown-up "tier", no "39k" prices,
//    and finished cards all say MAX! like the Garage
for (const r of RESEARCH) check(typeof r.tag === "string" && r.tag.split(/ +/).length <= 2 && r.tag.length <= 16 && !/[:;]/.test(r.tag), `lab card ${r.name} needs a one- or two-word line (got "${r.tag}")`);
{
  const lab = readFileSync(join(root, "src/lab.js"), "utf8");
  check(!/Lab tier|"k"|✔ Done/.test(lab), "src/lab.js still says Lab tier, writes prices as 39k, or says Done on a finished card");
  check(!lab.includes("<em>${lvl}/${r.max}</em>"), "src/lab.js writes 3/10 beside the level bar (the bar already says it)");
}
// 6. v1.15.1 leftovers: one coin total on the result card (no grown-up "Road coins"), no narrator line in the Lab,
//    and no rank number on Main Street's tower (the Rank pill shows it)
{
  const html = readFileSync(join(root, "index.html"), "utf8"), main = readFileSync(join(root, "src/main.js"), "utf8"), town = readFileSync(join(root, "src/town.js"), "utf8");
  check(!/Road coins|r-road/.test(html + main), "the result card says Road coins again (one coin total does it)");
  check(!/Research makes/.test(main), "the Lab robot says a narrator line again");
  check(!/tw-rank/.test(town + main), "Main Street's tower shows the rank number again (the Rank pill shows it)");
}
// ⚡🛞💪 car traits (v1.16): one word for each kind, and one short line about what it does (no advice, no colons,
// no numbers), and the line never repeats the word on the pill
{
  const { TRAITS, CARS } = await import("../src/data.js");
  for (const t of Object.values(TRAITS)) {
    check(/^[A-Z][a-z]+$/.test(t.name), `trait "${t.name}" is not one word`);
    check(t.line.length <= 44 && !/[:;0-9%]/.test(t.line), `trait ${t.name} line is long or has a colon or a number: ${t.line}`);
    check(!t.line.toLowerCase().includes(t.name.toLowerCase()), `trait ${t.name} line repeats the word: ${t.line}`);
    check(!/(best|use|pick|choose|try)/i.test(t.line), `trait ${t.name} line gives advice: ${t.line}`);
  }
  check(CARS.every(c => TRAITS[c.trait]), "a car has no trait");
}
console.log(fails ? `\n✖ ${fails} of ${checks} word checks failed` : `All ${checks} word checks passed`);
process.exit(fails ? 1 : 0);
