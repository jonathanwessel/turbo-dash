// ✨ What's new (src/news.js): the release named in package.json has its entry, the words follow the rules for
// text players see, and the card picks the right entries. Part of `npm test`.
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { NEWS, cmpVersion, unseen } from "../src/news.js";

const root = resolve(import.meta.dirname, "..");
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const bad = [];
const ok = (cond, msg) => { if (!cond) bad.push(msg); };

ok(NEWS[0]?.v === version, `the newest What's new entry is ${NEWS[0]?.v}, but package.json says ${version}. Add the entry to src/news.js.`);
NEWS.forEach((n, i) => {
  ok(/^\d+\.\d+\.\d+$/.test(n.v), `${n.v}: not a version like 1.2.3`);
  if (i) ok(cmpVersion(NEWS[i - 1].v, n.v) > 0, `${n.v}: entries must be newest first`);
  ok(Array.isArray(n.notes) && n.notes.length >= 2 && n.notes.length <= 5, `${n.v}: needs 2 to 5 notes for the release page`);
  for (const line of n.notes || []) ok(line.length <= 110 && !/["`\n]/.test(line), `${n.v}: note too long or has a quote mark: ${line}`);
  ok(Array.isArray(n.pics) && n.pics.length <= 4, `${n.v}: at most 4 pictures on the card`);
  for (const [pic, words] of n.pics || []) {
    ok(pic && [...pic].length <= 3, `${n.v}: "${pic}" should be one picture`);
    ok(words && words.length <= 44, `${n.v}: too many words for the card (${words.length} letters): ${words}`);
    ok(!/[:;]/.test(words), `${n.v}: no colons or semicolons in game text: ${words}`);
    ok(words.trim().split(/\s+/).length <= 9, `${n.v}: keep it to 9 words: ${words}`);
  }
});

// which entries the card shows
const L = [{ v: "1.3.0", pics: [["a", "x"]] }, { v: "1.2.10", pics: [] }, { v: "1.2.9", pics: [["b", "y"]] }, { v: "1.2.0", pics: [["c", "z"]] }, { v: "1.1.0", pics: [["d", "w"]] }, { v: "1.0.0", pics: [["e", "v"]] }];
const vs = (...a) => unseen(...a, L).map(n => n.v).join(",");
ok(cmpVersion("1.2.10", "1.2.9") > 0 && cmpVersion("1.10.0", "1.9.9") > 0 && cmpVersion("2.0.0", "2.0.0") === 0, "versions compare as numbers");
ok(vs(null, "1.3.0", false) === "", "a brand-new player sees no card");
ok(vs(null, "1.3.0", true) === "1.3.0", "a player from before the card sees the newest entry only");
ok(vs("1.2.0", "1.3.0", true) === "1.3.0,1.2.9", "every entry with a picture since the version last seen");
ok(vs("1.3.0", "1.3.0", true) === "", "nothing new, no card");
ok(vs("1.2.0", "1.2.10", true) === "1.2.9", "never an entry newer than the running version");
ok(vs("0.9.0", "1.3.0", true) === "1.3.0,1.2.9,1.2.0", "a long gap shows the newest three");
ok(vs("1.2.9", "1.2.10", true) === "", "a release with no pictures shows no card");

if (bad.length) { console.log("✖ What's new:\n  " + bad.join("\n  ")); process.exit(1); }
console.log(`What's new: ${NEWS.length} entries, newest v${NEWS[0].v}, card rules hold`);
