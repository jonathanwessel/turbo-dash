// Faces and reactions (v1.14). Each named rival has a little face: a helmet in their car's colors over a round
// face. On the start grid a face pops up over every rival's car for the countdown, showing how the last race went
// for them (happy if they beat the player, grumpy if the player beat them, ready when there was no race yet). The
// result card shows a row of faces in finishing order: the rivals ahead of the player are happy, the ones behind
// are grumpy. Pictures only, no words. It never changes the race: speeds, places and prizes stay the same
// (scripts/test-faces.mjs).
// Plain rules and drawing, no page: both engines and the game (src/main.js) use these.

export const FACES = {
  hold: 1.4,   // seconds after GO! that the start grid faces stay (the big 3, 2, 1 and GO! cover the middle cars' faces)
  fade: 0.6,   // seconds they then take to fade away
};
export const MOODS = ["ready", "happy", "grumpy"];

/* each rival's mood after a race. standings: racer numbers in finishing order (0 = the player, k = rival k - 1).
   n: how many rivals. A rival not in the standings stays "ready". */
export function raceMoods(standings, n) {
  const me = standings.indexOf(0);
  return Array.from({ length: n }, (_, i) => {
    const at = standings.indexOf(i + 1);
    return me < 0 || at < 0 ? "ready" : at < me ? "happy" : "grumpy";
  });
}
/* the start grid's moods: how the last race went (kept for this play time only), or "ready" for everyone */
export const gridMoods = (last, n) => Array.from({ length: n }, (_, i) => MOODS.includes(last?.[i]) ? last[i] : "ready");
/* the result card's row: every racer in finishing order, with the rivals' moods ({ k, mood }, k = 0 is the player) */
export function faceRow(standings, n) {
  const m = raceMoods(standings, n);
  return standings.map(k => ({ k, mood: k === 0 ? "me" : m[k - 1] }));
}
/* how much of the start grid faces shows: all of it in the countdown and a moment past GO!, then fading, then none */
export function faceShow(race) {
  if (race.mode === "demo") return 0;
  if (race.state === "countdown") return 1;
  return race.state === "race" ? Math.max(0, Math.min(1, 1 - (race.raceTime - FACES.hold) / FACES.fade)) : 0;
}

/* ---------- drawing (shared by the classic road, the Toy Track World overlay and the result card) ---------- */
const INK = "#10142a", SKIN = "#ffd9b3";
/* a circular piece of a circle above a line h below its center (h may be negative: above the center) */
function cap(ctx, x, y, R, h) {
  const a = Math.asin(Math.max(-1, Math.min(1, h / R)));
  ctx.beginPath(); ctx.arc(x, y, R, Math.PI - a, a); ctx.closePath(); ctx.fill();
}
/* one face centered on (x, y) with radius r. def: the rival's look ({ body, accent }). mood: ready, happy, grumpy */
export function drawFace(ctx, x, y, r, mood, def) {
  const lw = Math.max(1.5, r * 0.11);
  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  const R = r * 0.86;
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
  // the helmet in the car's colors: a stripe of its accent color under the body color
  ctx.fillStyle = def.accent || "#ffffff"; cap(ctx, x, y, R, -r * 0.2);
  ctx.fillStyle = def.body || "#e8262b"; cap(ctx, x, y, R, -r * 0.34);
  ctx.strokeStyle = INK; ctx.lineWidth = lw * 0.6;
  { const a = Math.asin(0.2 * r / R); ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * R, y - r * 0.2); ctx.lineTo(x + Math.cos(a) * R, y - r * 0.2); ctx.stroke(); }
  ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = lw;
  const ex = r * 0.32, ey = y + r * 0.08;
  if (mood === "happy") {
    // closed happy eyes, rosy cheeks and a big open smile
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * ex, ey + r * 0.06, r * 0.12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    ctx.fillStyle = "rgba(255,90,120,0.45)";
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + s * r * 0.55, y + r * 0.36, r * 0.13, r * 0.08, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#8a1830"; ctx.beginPath(); ctx.arc(x, y + r * 0.3, r * 0.28, 0.05, Math.PI - 0.05); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (mood === "grumpy") {
    // dot eyes under brows that slope down to the middle, and a frown
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * ex, ey + r * 0.02, r * 0.1, 0, Math.PI * 2); ctx.fill(); }
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + s * r * 0.52, ey - r * 0.2); ctx.lineTo(x + s * r * 0.14, ey - r * 0.08); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(x, y + r * 0.66, r * 0.24, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
  } else {
    // ready: bright eyes with a shine and a sure little smile
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * ex, ey, r * 0.11, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#ffffff";
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + s * ex + r * 0.04, ey - r * 0.04, r * 0.04, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.arc(x, y + r * 0.26, r * 0.24, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
  }
  ctx.restore();
}
/* a face over a car with a short tail down to it, like the horn bubble. (x, y) is the tip of the tail */
export function drawFaceBubble(ctx, x, y, r, mood, def) {
  const cy = y - r * 1.45;
  ctx.save();
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2, r * 0.14); ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(x - r * 0.32, cy + r * 0.7); ctx.lineTo(x, y); ctx.lineTo(x + r * 0.32, cy + r * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  drawFace(ctx, x, cy, r, mood, def);
}
