// 🔊 Read aloud: only a voice on the device, the card's words as a child hears them, and a speaker on every
// picture card that explains something new.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pickVoice, sayLine } from "../src/speak.js";
import { TRAITS } from "../src/data.js";

const V = (name, lang, localService) => ({ name, lang, localService });

// a local voice only, never an online one (games/CLAUDE.md: "an on-device voice only")
assert.equal(pickVoice([]), null, "no voices, no button");
assert.equal(pickVoice(undefined), null);
assert.equal(pickVoice([V("Google US English", "en-US", false)]), null, "an online voice never counts");
assert.equal(pickVoice([V("Microsoft Aria Online (Natural) - English (United States)", "en-US", true)]), null, "a voice named Online is online, whatever it says");
assert.equal(pickVoice([V("Some Natural Voice", "en-US", true)]), null);
assert.equal(pickVoice([V("Thomas", "fr-FR", true)]), null, "the game's words are English");
assert.equal(pickVoice([V("Microsoft Hazel", "en-GB", true), V("Microsoft Zira", "en-US", true)]).name, "Microsoft Zira", "US English first");
assert.equal(pickVoice([V("Karen", "en-AU", true), V("Microsoft Hazel", "en-GB", true)]).name, "Microsoft Hazel", "then British English");
assert.equal(pickVoice([V("Karen", "en-AU", true)]).name, "Karen", "then any English");
assert.equal(pickVoice([V("Google US English", "en-US", false), V("English United States", "en_US", true)]).name, "English United States", "Android writes en_US");
assert.equal(pickVoice([null, V("Zira", "en-US", true)]).name, "Zira");

// the card's words as they are said: coins are a word, pictures and quote marks are dropped, lines become sentences
assert.equal(sayLine(["🎯 Rival of the week", "Rosie", "\"I zoom!\"", "Beat Rosie. Win 🪙!"]), "Rival of the week. Rosie. I zoom! Beat Rosie. Win coins!");
assert.equal(sayLine(["Round 2! Win Gold paint and 🪙 1,250!"]), "Round 2! Win Gold paint and 1,250 coins!");
assert.equal(sayLine(["🏁 Sunny Hills. Win the Champion!"]), "Sunny Hills. Win the Champion!");
assert.equal(sayLine(["⚡ Fast", "Zooms on straight roads.", "Slides on turns."]), "Fast. Zooms on straight roads. Slides on turns.");
assert.equal(sayLine(["“Nobody beats Big Bruno!”"]), "Nobody beats Big Bruno!", "curly quotes too");
assert.equal(sayLine(["🦏", "", "  ", "Big Bruno"]), "Big Bruno.", "a line that is only a picture says nothing");
assert.equal(sayLine(["1️⃣ Go"]), "Go.", "keycap pictures are dropped");
assert.equal(sayLine([]), "");
for (const t of Object.values(TRAITS)) assert.ok(!/[🪙"“”]/u.test(sayLine([t.icon + " " + t.name, t.line])), t.id);
// ⚡🛞💪 v1.21: a track kind is said as its word, and the heading's picture is still dropped
assert.equal(sayLine([TRAITS.fast.icon + " " + TRAITS.fast.name, TRAITS.fast.line]), `Fast. ${TRAITS.fast.line.replace("⚡ tracks", "Fast tracks")}`);
assert.equal(sayLine(["Zooms on 🛞 tracks.", "Zooms on 💪 tracks."]), "Zooms on Grippy tracks. Zooms on Tough tracks.");

// every picture card that explains something has one speaker, and its words are marked to be read. The card's
// own words are read, so what the child hears is what the card shows (one source).
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
const section = id => { const m = html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`)); assert.ok(m, id); return m[0]; };
for (const id of ["s-traits", "s-rival", "s-boss", "s-bestcar", "s-preview"]) {
  const s = section(id);
  assert.equal((s.match(/data-say-btn/g) || []).length, 1, `${id} has one speaker`);
  assert.match(s, /<button class="say" data-say-btn hidden aria-label="[^"]+">🔊<\/button>/, `${id}: the speaker starts hidden (no voice, no button)`);
  assert.match(s, /<h1[^>]*data-say/, `${id}: the title is read`);
}
for (const id of ["bi-says", "bi-info", "rw-name", "rw-says", "rw-info", "bc-says", "pv-says", "pv-info"]) assert.match(html, new RegExp(`id="${id}"[^>]*data-say`), id);
assert.ok(/<b data-say>\$\{t\.icon\} \$\{t\.name\}<\/b>/.test(main), "the car kinds card reads each kind's name");
assert.ok(/<small data-say>\$\{x(?:\.replace\(t\.icon, kindDot\(t\.id\)\))?\}<\/small>/.test(main), "and each of its lines (v1.21: with the track sign drawn round)");
// the voice stops when the card goes away or the game is hidden
assert.ok(/function show\(id\) \{\n(?:.*\n){0,3}\s*stopSay\(\);/.test(main), "show() stops the voice");
assert.ok(/visibilitychange[^\n]*stopSay\(\)/.test(main), "hiding the game stops the voice");
// never the browser's default voice: the utterance is always given the local voice picked above
const speak = readFileSync(new URL("../src/speak.js", import.meta.url), "utf8");
assert.match(speak, /u\.voice = voice;/);
assert.ok(!/speak\(new SpeechSynthesisUtterance/.test(speak), "no utterance without a voice set");
console.log("say ok");
