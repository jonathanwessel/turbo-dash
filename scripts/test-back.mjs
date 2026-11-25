// ◀ The Android back button (v1.20): every screen and card in index.html gets a back press that does what the child
// could tap there, and Main Street asks before leaving.
//   node scripts/test-back.mjs   (part of npm test)
import { readFileSync } from "node:fs";
import { backAction, BACK_BUTTON, BACK_OVERLAYS, BACK_WAITS, BACK_FREE } from "../src/backkey.js";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
let fails = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { fails++; console.log("  ✖ " + msg); } };

// every screen's own markup, so a screen's buttons are looked up inside that screen only
const sections = new Map();
for (const m of html.matchAll(/<section id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)) sections.set(m[1], m[2]);
check(sections.size > 30, `found only ${sections.size} screens in index.html`);
const hasId = (body, id) => new RegExp(`id="${id}"`).test(body);
const all = id => html.includes(`id="${id}"`);

for (const [id, body] of sections) {
  const a = backAction({ screen: id, racing: false, overlay: null, shown: () => true });
  if (a.tap) check(hasId(body, a.tap), `${id}: back taps #${a.tap}, which is not on that screen`);
  // a screen that just goes back must have a ◀ of its own, so back does what a tap there does
  if (a.back && !BACK_FREE.has(id)) check(/data-back\b|data-backto|id="[\w-]*back"/.test(body), `${id}: back goes back a screen, but the screen has no ◀ (give it a button in BACK_BUTTON)`);
  check(a.tap || a.back || a.leave || a.wait || BACK_FREE.has(id), `${id}: a back press does nothing and is not a free screen`);
}
for (const id of Object.keys(BACK_BUTTON)) check(sections.has(id), `BACK_BUTTON names ${id}, which is not a screen`);
for (const [box, btn] of BACK_OVERLAYS) check(all(box) && all(btn), `overlay ${box} or its button ${btn} is missing`);
for (const id of BACK_WAITS) check(sections.has(id), `BACK_WAITS names ${id}, which is not a screen`);

// the rules themselves
check(backAction({ screen: "s-hub", racing: false, shown: () => true }).leave, "Main Street does not ask before leaving");
check(backAction({ screen: null, racing: true, shown: () => true }).pause, "back in a race does not pause it");
check(backAction({ screen: "s-result", racing: false, shown: () => false }).wait, "back on a result card with a gift still to pick does not wait");
check(backAction({ screen: "s-result", racing: false, shown: id => id === "btn-home" }).tap === "btn-home", "back on a result card does not go home");
check(backAction({ screen: "s-lab", racing: false, overlay: "lab-sheet", shown: () => true }).tap === "ls-close", "back with a Lab sheet open does not close the sheet first");
check(backAction({ screen: "s-reset", racing: false, shown: id => id === "rs-no2" }).tap === "rs-no2", "back on the second reset step does not keep the progress");
check(backAction({ screen: "s-name", racing: false, shown: () => false }).wait, "back skips the first-run name card");
check(BACK_FREE.has("s-title") && BACK_FREE.has("s-leave"), "the title screen and the leave card must leave back free");
check(BACK_BUTTON["s-leave"] === "lv-stay" && hasId(sections.get("s-leave") || "", "lv-go"), "the leave card needs Play (lv-stay) and Stop (lv-go)");
// the card's words: short, no colon or semicolon
const words = (sections.get("s-leave") || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
check(!/[:;]/.test(words) && words.split(" ").length <= 8, `leave card words "${words}"`);
// the game wires it: show() keeps the history step, and popstate runs backAction
check(/paintUpdate\(\); armBack\(\);/.test(main), "show() does not call armBack()");
check(/addEventListener\("popstate"[\s\S]{0,400}backAction\(/.test(main), "no popstate handler runs backAction");

console.log(fails ? `\n${fails} of ${checks} back button checks FAILED` : `All ${checks} back button checks passed`);
process.exit(fails ? 1 : 0);
