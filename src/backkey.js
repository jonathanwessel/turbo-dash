// ◀ The Android back button (v1.20). The phone's back gesture or button does what the screen's own way back does:
// it closes the open card, goes back one screen, or pauses a race. On Main Street it asks "Stop playing?" first, and
// on that card (and on the title screen) a second back leaves the game the phone's own way.
// This file only decides what to do, so scripts/test-back.mjs can check every screen without a browser.

/* the button a back press taps, for screens and cards that have no ◀ of their own (each one's own button, so back
   always does exactly what the child could tap) */
export const BACK_BUTTON = {
  "s-rival": "rw-ok", "s-traits": "tr-ok", "s-bestcar": "bc-ok", "s-newcar": "nc-ok", "s-rankup": "ru-take",
  "s-cupend": "ce-ok", "s-pvend": "pe-back", "s-boss": "bi-back", "s-gift": "gift-take", "s-pause": "btn-resume",
  "s-grownup": "gu-cancel", "s-preview": "pv-back", "s-math": "math-back", "s-word": "word-back", "s-log": "log-back",
  "s-result": "btn-home", "s-parent": "p-close", "s-name": "name-back", "s-reset": ["rs-no", "rs-no2"], "s-leave": "lv-stay",
};
/* pop-ups that sit on top of a screen: the first one open is closed first */
export const BACK_OVERLAYS = [["lab-sheet", "ls-close"], ["levelup", "lu-go"]];
/* screens where back waits: the break timer and the update (they close by themselves) */
export const BACK_WAITS = new Set(["s-rest", "s-update"]);
/* where a back press is never caught, so the phone's own back leaves the game (the title screen keeps nothing to lose) */
export const BACK_FREE = new Set(["s-title", "s-leave"]);

/* What a back press does. ui: { screen, racing, overlay (id of the open pop-up or null), shown(id) (is that button on
   screen) } → { tap: id } | { pause: true } | { leave: true } | { back: true } |
   { wait: true } */
export function backAction(ui) {
  if (ui.racing && !ui.screen) return { pause: true };
  const over = BACK_OVERLAYS.find(([id]) => id === ui.overlay);
  if (over) return { tap: over[1] };
  if (ui.screen === "s-hub") return { leave: true };
  if (BACK_WAITS.has(ui.screen)) return { wait: true };
  const btns = [BACK_BUTTON[ui.screen] || []].flat(), btn = btns.find(id => ui.shown(id));
  if (btn) return { tap: btn };
  if (btns.length) return { wait: true };   // its button is not on screen yet (a gift still to pick): back waits too
  return { back: true };                    // every other screen has a ◀, and back does what it does
}
