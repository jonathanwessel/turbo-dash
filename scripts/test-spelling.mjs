// 🇺🇸 American spelling everywhere (the rule for every game). British forms kept slipping into the changelog, the
// roadmap and code comments (colour, centre, grey, neighbouring), so this test fails on any of them in a tracked   spelling-ok
// text file. Part of `npm test`.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dirname, "..");
const BRITISH = /\b(colour(s|ful|ed|ing)?|centre[sd]?|grey(er|ish)?|neighbour\w*|behaviour\w*|favourite\w*|honour\w*|flavour\w*|armour\w*|recognis\w+|organis\w+|realis(e|ed|es|ing)|apologis\w+|cancell(ed|ing)|travell(ed|ing|er)|licence|defence|catalogue|programme|tyres?|metres?|theatre|analys(e|ed|ing)|practise[sd]?|aluminium|mould\w*|jewellery)\b/i;   // spelling-ok
const files = execSync("git ls-files", { cwd: root, encoding: "utf8" }).split("\n")
  .filter(f => /\.(md|js|mjs|html|css|json|webmanifest|txt|yml)$/.test(f) && !/^(public\/|package-lock\.json)/.test(f));
const hits = [];
for (const f of files) readFileSync(join(root, f), "utf8").split("\n").forEach((line, i) => {
  const m = line.match(BRITISH); if (m && !line.includes("spelling-ok")) hits.push(`${f}:${i + 1} "${m[0]}"`);
});
if (hits.length) { console.log("✖ British spelling (use the American form, or add spelling-ok on the line for a name):\n  " + hits.join("\n  ")); process.exit(1); }
console.log(`All ${files.length} text files use American spelling`);
