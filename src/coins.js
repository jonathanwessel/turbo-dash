// 🪙 The coin emoji is drawn by each device's own emoji font: gold on some tablets, a silver coin with a bird on
// others. So every 🪙 that appears on screen is swapped for the game's own gold coin (a small drawn circle), the
// same everywhere. It works for all text, including text set later (toasts, prices, buttons): a watcher swaps each
// one as it appears, before the screen is drawn. Text read back by the game keeps its numbers, so nothing breaks.
const COIN = "🪙";
const skip = el => !el || el.closest("svg, textarea, input, script, style, title");
function coinEl() { const s = document.createElement("span"); s.className = "coin"; s.setAttribute("role", "img"); s.setAttribute("aria-label", "coin"); return s; }
function swapText(node) {
  const v = node.nodeValue; if (!v || !v.includes(COIN) || skip(node.parentElement)) return;
  const frag = document.createDocumentFragment();
  v.split(COIN).forEach((part, i) => { if (i) frag.append(coinEl()); if (part) frag.append(part); });
  node.replaceWith(frag);
}
function swapAll(root) {
  if (root.nodeType === 3) { swapText(root); return; }
  if (root.nodeType !== 1 || skip(root)) return;
  const list = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) if (n.nodeValue.includes(COIN)) list.push(n);
  list.forEach(swapText);
}
swapAll(document.body);
new MutationObserver(muts => { for (const m of muts) { if (m.type === "characterData") swapText(m.target); else m.addedNodes.forEach(swapAll); } })
  .observe(document.body, { childList: true, subtree: true, characterData: true });
