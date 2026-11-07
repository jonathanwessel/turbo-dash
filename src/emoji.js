// 🎨 The game's own emoji pictures, so every device shows exactly the same art (phones draw emoji with their own
// fonts: a coin is gold on one tablet and silver on another). The pictures are Twemoji (© Twitter, Inc. and other
// contributors, CC-BY 4.0), stored in public/emoji/ and cached for offline play.
//  - Page text: every emoji is swapped for its picture as the text appears (a watcher on the page), and 🪙 for the
//    game's own gold coin. Text the game reads back keeps its numbers and words, so nothing breaks.
//  - The town picture (SVG): a sign that is just an emoji becomes the picture at the same spot.
//  - Canvas text (race popups, the 🤖 helper, the 🖐️ in Toy Track World, garage locks): drawEmojiText() below.
// New emoji in the code? Run `npm run emoji` (downloads any missing picture; `npm test` fails until then).
import CODES from "./emoji-codes.js";

const HAVE = new Set(CODES);
export const EMOJI_RE = /[#*0-9]️?⃣|\p{Extended_Pictographic}️?(?:‍\p{Extended_Pictographic}️?)*/gu;   // keycaps (1️⃣) too
const ANY = /\p{Extended_Pictographic}|⃣/u;
const ALWAYS = /^[\u{1F5D1}⏱⏸]/u;   // phones draw these as emoji even without the emoji marker
// arrows and ticks the game uses as plain text (◀ ▶ ✔ ✖ ↩) stay text: they come from the normal font everywhere
export function emojiCode(s) {
  if (s === "🪙") return "coin";
  const first = String.fromCodePoint(s.codePointAt(0));
  if (!(/\p{Emoji_Presentation}/u.test(first) || s.includes("️") || s.includes("‍") || s.includes("⃣") || ALWAYS.test(s))) return null;
  const cps = [...s].map(c => c.codePointAt(0)), zwj = cps.includes(0x200D);
  const code = cps.filter(c => zwj || c !== 0xFE0F).map(c => c.toString(16)).join("-");
  return HAVE.has(code) ? code : null;
}
export const emojiSrc = code => "./emoji/" + code + ".svg";

/* text → plain pieces and { code, ch } pictures */
export function splitEmoji(text) {
  const out = []; let last = 0;
  for (const m of text.matchAll(EMOJI_RE)) {
    const code = emojiCode(m[0]); if (!code) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push({ code, ch: m[0] }); last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* ---------- canvas ---------- */
const imgs = new Map();
function picture(code) {
  if (typeof Image === "undefined") return null;
  let i = imgs.get(code);
  if (!i) { i = new Image(); i.src = emojiSrc(code); imgs.set(code, i); }
  return i.complete && i.naturalWidth ? i : null;
}
export function preloadEmoji() { for (const c of CODES) picture(c); }
function coinDot(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = "#c98a00"; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = "#ffd400"; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, 7); ctx.fill();
  ctx.fillStyle = "#fff6b0"; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.22, 0, 7); ctx.fill();
  ctx.restore();
}
/* fillText that draws emoji as the game's pictures. With stroke, text pieces are outlined first (popups);
   fill (optional) is the text color used after the outline. Honors textAlign and textBaseline. */
export function drawEmojiText(ctx, text, x, y, stroke = false, fill = null) {
  text = String(text);
  const parts = ANY.test(text) ? splitEmoji(text) : [text];
  if (parts.every(p => typeof p === "string")) { if (stroke) ctx.strokeText(text, x, y); if (fill) ctx.fillStyle = fill; ctx.fillText(text, x, y); return; }
  const px = parseFloat((ctx.font.match(/(\d+(?:\.\d+)?)px/) || [0, 16])[1]), es = px * 1.12;
  const widths = parts.map(p => typeof p === "string" ? ctx.measureText(p).width : es);
  const total = widths.reduce((a, b) => a + b, 0), align = ctx.textAlign, base = ctx.textBaseline;
  const x0 = align === "center" ? x - total / 2 : align === "right" || align === "end" ? x - total : x;
  const cy = base === "middle" ? y : base === "top" || base === "hanging" ? y + px * 0.5 : base === "bottom" ? y - px * 0.5 : y - px * 0.36;
  ctx.textAlign = "left";
  if (stroke) { let cx = x0; parts.forEach((p, i) => { if (typeof p === "string") ctx.strokeText(p, cx, y); cx += widths[i]; }); }
  if (fill) ctx.fillStyle = fill;
  let cx = x0;
  parts.forEach((p, i) => {
    if (typeof p === "string") ctx.fillText(p, cx, y);
    else if (p.code === "coin") coinDot(ctx, cx + es / 2, cy, px * 0.45);
    else { const im = picture(p.code); if (im) ctx.drawImage(im, cx + (es - px) / 2, cy - px / 2, px, px); }
    cx += widths[i];
  });
  ctx.textAlign = align;
}

/* ---------- the page ---------- */
export function startEmoji() {
  const skip = el => !el || el.closest("textarea, input, script, style, title");
  const make = p => {
    if (p.code === "coin") { const s = document.createElement("span"); s.className = "coin"; s.setAttribute("role", "img"); s.setAttribute("aria-label", "coin"); return s; }
    const im = document.createElement("img"); im.className = "emo"; im.src = emojiSrc(p.code); im.alt = p.ch; im.draggable = false; return im;
  };
  function swapSvg(el) {
    const text = el.closest("text"); if (!text) return;
    const parts = splitEmoji(text.textContent.trim());
    if (parts.length !== 1 || typeof parts[0] === "string" || parts[0].code === "coin") return;   // only a sign that is just one emoji
    const fs = parseFloat(text.getAttribute("font-size")) || 20, x = parseFloat(text.getAttribute("x")) || 0, y = parseFloat(text.getAttribute("y")) || 0;
    const anchor = text.getAttribute("text-anchor") || "start", s = fs * 1.1, NS = "http://www.w3.org/2000/svg", im = document.createElementNS(NS, "image");
    im.setAttribute("x", anchor === "middle" ? x - s / 2 : anchor === "end" ? x - s : x); im.setAttribute("y", y - s * 0.86);
    im.setAttribute("width", s); im.setAttribute("height", s); im.setAttribute("href", emojiSrc(parts[0].code));
    for (const a of ["transform", "opacity", "class", "style"]) if (text.hasAttribute(a)) im.setAttribute(a, text.getAttribute(a));
    text.replaceWith(im);
  }
  function swapText(node) {
    const v = node.nodeValue, par = node.parentElement;
    if (!v || !ANY.test(v) || skip(par) || !node.isConnected) return;
    if (par.closest("svg")) { swapSvg(par); return; }
    const parts = splitEmoji(v); if (parts.every(p => typeof p === "string")) return;
    const frag = document.createDocumentFragment();
    for (const p of parts) frag.append(typeof p === "string" ? p : make(p));
    node.replaceWith(frag);
  }
  function swapAll(root) {
    if (root.nodeType === 3) { swapText(root); return; }
    if (root.nodeType !== 1 || skip(root)) return;
    const list = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) if (ANY.test(n.nodeValue)) list.push(n);
    list.forEach(swapText);
  }
  swapAll(document.body);
  new MutationObserver(muts => { for (const m of muts) { if (m.type === "characterData") swapText(m.target); else m.addedNodes.forEach(swapAll); } })
    .observe(document.body, { childList: true, subtree: true, characterData: true });
  preloadEmoji();
}
