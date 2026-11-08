// Math and Word Lap questions: thousands of seeded questions per level, checked for fairness.
//   node scripts/test-school.mjs   (part of npm test)
import { WORDS, wordQuestion, mathQuestion, mathChoices } from "../src/data.js";

let fails = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { fails++; if (fails < 20) console.log("  ✖ " + msg); } };
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// the word list itself
const words = WORDS.map(x => x.w), pics = WORDS.map(x => x.pic);
check(new Set(words).size === words.length, "a word is listed twice");
check(new Set(pics).size === pics.length, "two words share a picture");
check(words.every(w => /^[a-z]{3,6}$/.test(w)), "words must be 3 to 6 small letters");

const LEN = { 1: [3, 3], 2: [3, 3], 3: [4, 4], 4: [5, 6] };
for (const lv of [1, 2, 3, 4]) {
  let firstSame = 0, modes = { pic: 0, word: 0 };
  for (let i = 0; i < 3000; i++) {
    const seen = new Set(), lap = [];
    for (let k = 0; k < 5; k++) {
      const q = wordQuestion(lv, rnd, seen); seen.add(q.w); lap.push(q.w); modes[q.mode]++;
      const tag = `level ${lv} ${q.mode} ${q.w}: ${q.choices.map(c => c.w).join(",")}`;
      check(q.w.length >= LEN[lv][0] && q.w.length <= LEN[lv][1], "wrong word length " + tag);
      check(q.choices.length === 3 && new Set(q.choices.map(c => c.w)).size === 3, "needs 3 different choices " + tag);
      check(q.choices.filter(c => c.w === q.w).length === 1, "the answer must be a choice once " + tag);
      check(WORDS.find(x => x.w === q.w)?.pic === q.pic, "picture does not match the word " + tag);
      // a wrong choice is never the picture's word, and a picture choice always has a picture
      if (q.mode === "word") check(q.choices.every(c => c.pic) && new Set(q.choices.map(c => c.pic)).size === 3, "picture choices broken " + tag);
      if (lv === 1) firstSame += q.choices.filter(c => c.w !== q.w && c.w[0] === q.w[0]).length;
    }
    check(new Set(lap).size === 5, `level ${lv}: a word repeats in one lap (${lap})`);
  }
  check(firstSame === 0, `level ${lv}: ${firstSame} easy choices start with the same letter as the answer`);
  check(modes.pic > 5000 && modes.word > 5000, `level ${lv}: both kinds of question should come up (${modes.pic}/${modes.word})`);
}
// look-alikes really look alike from level 2
{
  let sharing = 0, n = 0;
  for (let i = 0; i < 2000; i++) { const q = wordQuestion(2, rnd); if (q.mode !== "pic") continue; n++; if (q.choices.some(c => c.w !== q.w && [...c.w].filter((ch, j) => q.w[j] === ch).length >= 2)) sharing++; }
  check(sharing / n > 0.8, `level 2: look-alike choices only ${Math.round(100 * sharing / n)}% of the time`);
}
// math: answers never negative, always among the choices
for (const lv of [1, 2, 3, 4]) for (let i = 0; i < 3000; i++) {
  const q = mathQuestion(lv, rnd), c = mathChoices(q.ans, rnd);
  check(q.ans >= 0 && c.includes(q.ans) && c.length === 4 && new Set(c).size === 4, `math level ${lv}: ${q.a}${q.op}${q.b}`);
}
console.log(fails ? `\n✖ ${fails} of ${checks} school checks failed` : `All ${checks} school checks passed`);
process.exit(fails ? 1 : 0);
