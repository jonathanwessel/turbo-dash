// 🔊 Read aloud (v1.18): a speaker button on each picture card reads the card's words with a voice that lives on
// the device. games/CLAUDE.md: "an on-device voice only, never an online one". So the game only ever speaks with
// a voice the browser marks as local (localService), never the browser's default voice (which can be an online
// one), and hides the button when the device has no local voice.
// The pure parts (picking a voice, turning a card's words into a spoken line) are tested in scripts/test-say.mjs.

/* the best local voice for the game's words: English, US first. Online voices never count, even if a browser
   forgets to mark them (their names say Online or Natural on some browsers). */
export function pickVoice(voices) {
  const ok = (voices || []).filter(v => v && v.localService && /^en\b|^en[-_]/i.test(v.lang || "") && !/online|natural|cloud/i.test(v.name || ""));
  return ok.find(v => /^en[-_]US/i.test(v.lang)) || ok.find(v => /^en[-_]GB/i.test(v.lang)) || ok[0] || null;
}

/* a card's lines → one thing to say. Coins are words (🪙 300 → 300 coins), a track kind is a word (⚡ tracks → Fast
   tracks, v1.21), other pictures and quote marks are dropped, and every line ends like a sentence so the voice
   pauses between them. */
const KIND_WORD = { "⚡": "Fast", "🛞": "Grippy", "💪": "Tough" };
const PIC = /[#*0-9]️?⃣|\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*|️/gu;
export function sayLine(lines) {
  return lines.map(l => String(l)
    .replace(/🪙\s*(\d[\d,]*)/gu, "$1 coins").replace(/🪙/gu, "coins")
    .replace(/(⚡|🛞|💪)️?\s*tracks/gu, (m, k) => KIND_WORD[k] + " tracks")
    .replace(PIC, " ").replace(/["“”]/g, "").replace(/\s+/g, " ").trim())
    .filter(l => /[a-z0-9]/i.test(l))
    .map(l => /[.!?]$/.test(l) ? l : l + ".")
    .join(" ");
}

/* the words of one element as the player sees them: the page swaps emoji for pictures (src/emoji.js), so a picture
   gives back its emoji and the coin span gives back 🪙 */
function words(el) {
  let s = "";
  for (const n of el.childNodes) {
    if (n.nodeType === 3) s += n.nodeValue;
    else if (n.nodeType === 1) s += n.matches("img.emo") ? n.alt : n.matches(".coin") ? "🪙" : words(n);
  }
  return s;
}
/* the lines a card says: its [data-say] parts in page order, only the ones on screen */
export function cardLines(card) {
  const shown = el => { for (let e = el; e && e !== card.parentElement; e = e.parentElement) if (e.hidden || getComputedStyle(e).display === "none") return false; return true; };
  return [...card.querySelectorAll("[data-say]")].filter(shown).map(words);
}

/* ---------- the button ---------- */
let voice = null, fake = false, talking = null;
const synth = () => (typeof speechSynthesis !== "undefined" ? speechSynthesis : null);
export const canSay = () => fake || !!voice;
function paint() {
  for (const b of document.querySelectorAll("[data-say-btn]")) { b.hidden = !canSay(); b.classList.toggle("on", talking === b); }
}
export function stopSay() {
  if (!talking) return;
  talking = null; try { synth()?.cancel(); } catch (e) { /* nothing to stop */ }
  paint();
}
function say(btn) {
  if (talking === btn) { stopSay(); return; }   // a second tap stops it
  stopSay();
  const text = sayLine(cardLines(btn.closest(".card")));
  if (!text) return;
  talking = btn; paint();
  if (fake || !synth()) { setTimeout(() => { if (talking === btn) { talking = null; paint(); } }, 1200); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice; u.lang = voice.lang; u.rate = 0.9; u.pitch = 1.05;
  u.onend = u.onerror = () => { if (talking === btn) { talking = null; paint(); } };
  synth().speak(u);
}
/* call once: wires every [data-say-btn] and keeps the button hidden until a local voice shows up (browsers load
   their voice list late, so it listens for voiceschanged) */
export function startSay(click = () => {}) {
  const find = () => { try { voice = pickVoice(synth()?.getVoices()); } catch (e) { voice = null; } paint(); };
  for (const b of document.querySelectorAll("[data-say-btn]")) b.onclick = e => { e.stopPropagation(); click(); say(b); };
  find();
  try { synth()?.addEventListener?.("voiceschanged", find); } catch (e) { /* no voices on this device */ }
}
/* dev builds only: show the button on a machine with no voice (the headless sweep), so the pictures show it */
export function fakeVoice(on = true) { fake = on; paint(); }
