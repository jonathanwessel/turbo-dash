// 📯 The horn (v1.12). The player honks, and the two rivals closest by honk back a moment later, each in its own
// voice, with a little horn over their car. It is only for fun: it never changes speed, places or prizes.
// Both engines (the classic road and Toy Track World) use these same rules, and scripts/test-horn.mjs checks them.
export const HORN = {
  replies: 2,      // at most this many rivals answer one honk
  quiet: 1.2,      // seconds after a round of answers before rivals answer again (the player's own horn always sounds)
  bubble: 0.9,     // seconds the little horn shows over a rival that honked
  voices: 6,       // rival voices horn1 .. horn6 in audio.js
};

/* which rivals answer, and when: the closest ones within `range` (about one second of driving), nearest first */
export function hornReplies(player, rivals, range, rnd = Math.random) {
  return rivals.map((c, i) => ({ i, gap: Math.abs(c.dist - player.dist) }))
    .filter(o => o.gap < range)
    .sort((a, b) => a.gap - b.gap || a.i - b.i)
    .slice(0, HORN.replies)
    .map((o, k) => ({ i: o.i, delay: 0.35 + k * 0.3 + rnd() * 0.15 }));
}

/* the horn button. `race` is either engine; `range` is in that engine's own distance units */
export function honk(race, range, rnd = Math.random) {
  if (race.mode === "demo" || !race.player) return false;
  race.hooks.sfx("horn");
  race.honks = race.honks || [];
  if (race.t - (race.hornAt ?? -1e9) < HORN.quiet) return true;
  const answers = hornReplies(race.player, race.rivals, range, rnd);
  if (answers.length) race.hornAt = race.t;
  for (const a of answers) race.honks.push({ c: race.rivals[a.i], voice: a.i % HORN.voices + 1, at: race.t + a.delay });
  return true;
}

/* the little horn over a rival: a white round bubble with a dark rim and a tail down to the car, so it reads on
   snow and on pale toy tracks. (x, y) is the tip of the tail; r the bubble's radius. Shared by both engines. */
export function drawHornBubble(ctx, x, y, r, drawEmoji) {
  const cy = y - r * 1.5;
  ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#10142a"; ctx.lineWidth = Math.max(2, r * 0.14);
  ctx.beginPath(); ctx.moveTo(x - r * 0.35, cy + r * 0.8); ctx.lineTo(x, y); ctx.lineTo(x + r * 0.35, cy + r * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - r * 0.35, cy + r * 0.8); ctx.lineTo(x + r * 0.35, cy + r * 0.8); ctx.strokeStyle = "#ffffff"; ctx.stroke();
  ctx.font = Math.round(r * 1.25) + "px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  drawEmoji(ctx, "📯", x, cy);
}

/* every frame: play the answers that are due, and let the little horns fade */
export function tickHonks(race, dt) {
  for (const c of race.rivals) if (c.honkT > 0) c.honkT = Math.max(0, c.honkT - dt);
  if (!race.honks?.length) return;
  race.honks = race.honks.filter(h => {
    if (race.t < h.at) return true;
    h.c.honkT = HORN.bubble; race.hooks.sfx("horn" + h.voice);
    return false;
  });
}
