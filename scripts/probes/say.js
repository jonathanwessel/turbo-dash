// A probe for the sweep: the 🔊 speaker on the car kinds card (v1.18). It opens the card from the Garage, reads what
// the card would say, taps the speaker, and reports which voice spoke and whether it was local:
//   node scripts/sweep.mjs 1280x800 --out .sweep/say --probe "$(cat scripts/probes/say.js)"
(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const { sayLine, cardLines } = await import("/src/speak.js");
  let used = null;
  const real = speechSynthesis.speak.bind(speechSynthesis);
  speechSynthesis.speak = u => { used = { voice: u.voice && u.voice.name, local: !!(u.voice && u.voice.localService), text: u.text, ev: [] }; for (const k of ["start", "end", "error"]) u.addEventListener(k, e => used.ev.push(k + (e.error ? ":" + e.error : "") + "@" + Math.round(e.elapsedTime || 0))); real(u); };
  const out = {};
  for (const [id, open] of [
    ["s-traits", () => { __td.goHub(); document.querySelector('[data-go="garage"]').dispatchEvent(new MouseEvent("click", { bubbles: true })); document.getElementById("g-trait").click(); }],
    ["s-boss", () => __td.bossIntro("bruno", 1)],
    ["s-preview", () => { __td.show("s-tracks"); __td.openPreview("moon"); }],
  ]) {
    open(); await w(400);
    const card = document.querySelector("#" + id + " .card"), btn = card.querySelector("[data-say-btn]");
    used = null; btn.click(); await w(300);
    out[id] = { says: sayLine(cardLines(card)), shown: !btn.hidden, on: btn.classList.contains("on"), speaking: speechSynthesis.speaking, used };
    btn.click(); await w(100);
    out[id].stopped = !btn.classList.contains("on") && !speechSynthesis.speaking;
  }
  // a tap, then leaving the card, stops the voice
  document.querySelector("#s-preview [data-say-btn]").click(); await w(200); __td.goHub(); await w(100);
  out.leave = { speaking: speechSynthesis.speaking };
  __td.show("s-traits"); await w(300);
  return out;
})()
