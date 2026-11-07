// Procedural art: cars, roadside things, coins and the sky. No image files, so it loads instantly and works offline.

const shadeCache = new Map();
export function shade(hex, amt) {
  const k = hex + amt;
  let v = shadeCache.get(k);
  if (v) return v;
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  v = `rgb(${r | 0},${g | 0},${b | 0})`;
  shadeCache.set(k, v);
  return v;
}

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}
function ell(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); ctx.fill(); }
function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); }

/* A car seen from behind. (x, yb) = middle of the ground under it, w = width in pixels. */
export function drawCar(ctx, x, yb, w, def, o = {}) {
  if (w < 4) { ctx.fillStyle = def.body; ctx.fillRect(x - w / 2, yb - w * 0.5, w, w * 0.5); return; }
  const t = o.t || 0, steer = o.steer || 0, type = def.type;
  const monster = type === "monster" || type === "rover";
  ctx.save();
  ctx.translate(x, yb);
  ctx.rotate(steer * 0.035);

  if (!o.noShadow) {
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ell(ctx, 0, -w * 0.005, w * 0.68, w * 0.09);
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ell(ctx, 0, -w * 0.01, w * 0.56, w * 0.06);
  }

  const wh = monster ? w * 0.42 : w * 0.21, ww = monster ? w * 0.27 : w * 0.18;
  ctx.fillStyle = "#151515";
  rr(ctx, -w * 0.52, -wh, ww, wh, ww * 0.3);
  rr(ctx, w * 0.52 - ww, -wh, ww, wh, ww * 0.3);
  if (!monster && w > 24) {
    const roll = (o.spin || 0) % 1;
    for (const wx of [-w * 0.52, w * 0.52 - ww]) {
      ctx.fillStyle = "#2b2b2b"; rr(ctx, wx + ww * 0.18, -wh + 2, ww * 0.64, wh - 4, ww * 0.2);
      ctx.fillStyle = "#3d3d3d";
      for (let i = 0; i < 3; i++) { const yy = -wh + ((i / 3 + roll) % 1) * wh; if (yy > -wh + 3 && yy < -4) ctx.fillRect(wx + ww * 0.22, yy, ww * 0.56, Math.max(1, wh * 0.08)); }
    }
  }
  if (monster && w > 30) {
    ctx.fillStyle = "#3a3a3a";
    const off = (t * 40) % (wh / 4);
    for (let i = 0; i < 5; i++) {
      const yy = -wh + off + i * wh / 4;
      if (yy > -wh + 2 && yy < -4) { ctx.fillRect(-w * 0.52 + 3, yy, ww - 6, wh * 0.05); ctx.fillRect(w * 0.52 - ww + 3, yy, ww - 6, wh * 0.05); }
    }
  }

  const by = monster ? -wh * 0.72 : -wh * 0.42;
  const bh = w * 0.3, top = by - bh, cx = steer * w * 0.035;

  if (type === "rocket") {
    for (const s of [-1, 1]) {
      ctx.fillStyle = "#9aa4b1"; rr(ctx, s * w * 0.56 - w * 0.07, top + bh * 0.1, w * 0.14, bh * 0.75, w * 0.05);
      ctx.fillStyle = "#e8262b"; rr(ctx, s * w * 0.56 - w * 0.07, top + bh * 0.1, w * 0.14, bh * 0.18, w * 0.05);
      flame(ctx, s * w * 0.56, top + bh * 0.85, w * 0.06, t, o.nitro ? 2.2 : 0.8);
    }
  }

  let g;
  if (def.rainbow) {
    g = ctx.createLinearGradient(-w * 0.5, 0, w * 0.5, 0);
    ["#ff3d3d", "#ff9d00", "#ffe600", "#3ddc5a", "#2fa8ff", "#8a3cff"].forEach((c, i) => g.addColorStop(i / 5, c));
  } else {
    g = ctx.createLinearGradient(0, top, 0, by);
    g.addColorStop(0, shade(def.body, 0.3)); g.addColorStop(0.5, def.body); g.addColorStop(1, shade(def.body, -0.35));
  }
  ctx.fillStyle = g;
  rr(ctx, -w * 0.5, top, w, bh, w * 0.09);
  if (def.shiny && w > 20) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    const sx = ((t * 0.4) % 1.6 - 0.8) * w;
    poly(ctx, [sx - w * 0.06, top + 2, sx + w * 0.02, top + 2, sx - w * 0.06, by - 2, sx - w * 0.14, by - 2]);
  }
  if (def.sticker && def.sticker !== "none" && w > 16) sticker(ctx, def.sticker, w, top, bh);

  // cabin
  const ch = w * 0.22;
  ctx.fillStyle = shade(def.body, -0.12);
  poly(ctx, [-w * 0.4 + cx, top + 2, -w * 0.29 + cx, top - ch, w * 0.29 + cx, top - ch, w * 0.4 + cx, top + 2]);
  if (type === "racer" || type === "sport") {
    ctx.fillStyle = def.accent;
    ctx.fillRect(-w * 0.07 + cx * 0.5, top - ch + 1, w * 0.14, ch + bh - 2);
    if (type === "sport") { ctx.fillRect(-w * 0.17 + cx * 0.5, top, w * 0.04, bh - 2); ctx.fillRect(w * 0.13 + cx * 0.5, top, w * 0.04, bh - 2); }
  }
  const wg = ctx.createLinearGradient(0, top - ch, 0, top);
  wg.addColorStop(0, "#2b4c80"); wg.addColorStop(1, "#0f1b33");
  ctx.fillStyle = wg;
  poly(ctx, [-w * 0.33 + cx, top - 1, -w * 0.25 + cx, top - ch * 0.82, w * 0.25 + cx, top - ch * 0.82, w * 0.33 + cx, top - 1]);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  poly(ctx, [-w * 0.18 + cx, top - ch * 0.82, -w * 0.08 + cx, top - ch * 0.82, -w * 0.2 + cx, top - 1, -w * 0.3 + cx, top - 1]);

  if (type === "galaxy" && w > 20) {
    ctx.fillStyle = def.accent;
    for (const [sx, sy] of [[-0.35, 0.3], [0.3, 0.25], [-0.15, 0.6], [0.38, 0.65], [0.05, 0.4]]) ell(ctx, sx * w, top + sy * bh, w * 0.015, w * 0.015);
  }
  if (type === "monster") {
    ctx.fillStyle = def.accent;
    poly(ctx, [-w * 0.5, top + bh * 0.55, -w * 0.3, top + bh * 0.25, -w * 0.25, top + bh * 0.55]);
    poly(ctx, [w * 0.5, top + bh * 0.55, w * 0.3, top + bh * 0.25, w * 0.25, top + bh * 0.55]);
  }

  // lights, plate, bumper
  ctx.fillStyle = o.brake ? "#ff6060" : "#d81818";
  rr(ctx, -w * 0.45, top + bh * 0.22, w * 0.18, w * 0.075, w * 0.02);
  rr(ctx, w * 0.27, top + bh * 0.22, w * 0.18, w * 0.075, w * 0.02);
  ctx.fillStyle = "#ffb3b3";
  rr(ctx, -w * 0.43, top + bh * 0.27, w * 0.06, w * 0.03, w * 0.01);
  rr(ctx, w * 0.37, top + bh * 0.27, w * 0.06, w * 0.03, w * 0.01);
  ctx.fillStyle = "#ffe98a";
  rr(ctx, -w * 0.09, top + bh * 0.5, w * 0.18, w * 0.075, w * 0.015);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  rr(ctx, -w * 0.49, by - w * 0.055, w * 0.98, w * 0.055, w * 0.02);
  if (w > 24) {
    ctx.fillStyle = "#8d96a3"; ell(ctx, -w * 0.2, by - w * 0.025, w * 0.045, w * 0.028); ell(ctx, w * 0.2, by - w * 0.025, w * 0.045, w * 0.028);
    ctx.fillStyle = "#333"; ell(ctx, -w * 0.2, by - w * 0.025, w * 0.028, w * 0.016); ell(ctx, w * 0.2, by - w * 0.025, w * 0.028, w * 0.016);
    ctx.fillStyle = "rgba(255,255,255,0.35)"; rr(ctx, -w * 0.42, top + bh * 0.08, w * 0.84, Math.max(1, bh * 0.07), bh * 0.04);
    ctx.fillStyle = "rgba(255,60,60,0.28)"; ell(ctx, -w * 0.36, top + bh * 0.34, w * 0.13, w * 0.06); ell(ctx, w * 0.36, top + bh * 0.34, w * 0.13, w * 0.06);
  }

  if (type === "racer" || type === "galaxy" || type === "sport") {
    ctx.fillStyle = "#222";
    ctx.fillRect(-w * 0.33, top - w * 0.1, w * 0.04, w * 0.1);
    ctx.fillRect(w * 0.29, top - w * 0.1, w * 0.04, w * 0.1);
    ctx.fillStyle = type === "sport" ? "#222" : def.accent;
    rr(ctx, -w * 0.53, top - w * 0.15, w * 1.06, w * 0.065, w * 0.02);
  }
  if (type === "fire" && w > 20) {
    ctx.fillStyle = "#c9ced8"; ctx.fillRect(-w * 0.36 + cx, top - ch - w * 0.06, w * 0.72, w * 0.035); ctx.fillRect(-w * 0.36 + cx, top - ch - w * 0.13, w * 0.72, w * 0.035);
    for (let i = 0; i < 6; i++) ctx.fillRect(-w * 0.34 + cx + i * w * 0.13, top - ch - w * 0.13, w * 0.025, w * 0.105);
    const on = Math.sin(t * 10) > 0;
    ctx.fillStyle = on ? "#ff3d3d" : "#ffd400"; ell(ctx, -w * 0.42, top + bh * 0.1, w * 0.05, w * 0.04);
    ctx.fillStyle = on ? "#ffd400" : "#ff3d3d"; ell(ctx, w * 0.42, top + bh * 0.1, w * 0.05, w * 0.04);
    ctx.fillStyle = def.accent; ctx.fillRect(-w * 0.5, top + bh * 0.62, w, bh * 0.1);
  }
  if (type === "sub" && w > 20) {
    // a racing submarine: a stripe, portholes, side fins, a periscope and a spinning propeller at the back
    ctx.fillStyle = def.accent; ctx.fillRect(-w * 0.5, top + bh * 0.66, w, bh * 0.1);
    ctx.fillStyle = shade(def.body, -0.25);
    poly(ctx, [-w * 0.5, top + bh * 0.3, -w * 0.66, top + bh * 0.55, -w * 0.5, top + bh * 0.7]);
    poly(ctx, [w * 0.5, top + bh * 0.3, w * 0.66, top + bh * 0.55, w * 0.5, top + bh * 0.7]);
    ctx.fillStyle = "#59606b"; ctx.fillRect(-w * 0.22 + cx, top - ch - w * 0.2, w * 0.035, w * 0.21); ctx.fillRect(-w * 0.22 + cx, top - ch - w * 0.2, w * 0.11, w * 0.04);
    ctx.fillStyle = "#bff6ff"; ell(ctx, -w * 0.115 + cx, top - ch - w * 0.18, w * 0.018, w * 0.016);
    ctx.save(); ctx.translate(0, top + bh * 0.42); ctx.rotate(t * 14);
    ctx.fillStyle = "#e3e8ef";
    for (let k = 0; k < 3; k++) { ctx.rotate(Math.PI * 2 / 3); ctx.beginPath(); ctx.ellipse(0, -w * 0.055, w * 0.028, w * 0.055, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = "#59606b"; ell(ctx, 0, top + bh * 0.42, w * 0.024, w * 0.024);
  }
  if (type === "rover" && w > 20) {
    ctx.fillStyle = def.accent; ctx.fillRect(-w * 0.5, top + bh * 0.3, w, bh * 0.14);
    ctx.fillStyle = "#59606b"; ctx.fillRect(w * 0.3 + cx, top - ch - w * 0.22, w * 0.025, w * 0.22);
    ctx.fillStyle = "#e9edf3"; ctx.beginPath(); ctx.ellipse(w * 0.31 + cx, top - ch - w * 0.22, w * 0.08, w * 0.035, -0.4, 0, Math.PI); ctx.fill();
    ctx.fillStyle = (t * 3 | 0) % 2 ? "#ff3d3d" : "#ffd400"; ell(ctx, w * 0.31 + cx, top - ch - w * 0.25, w * 0.02, w * 0.02);
  }
  if (type === "patrol" && w > 20) {
    ctx.fillStyle = def.accent; ctx.fillRect(-w * 0.5, top + bh * 0.42, w, bh * 0.22);
    const on = Math.sin(t * 12) > 0;
    ctx.fillStyle = "#222"; rr(ctx, -w * 0.2 + cx, top - ch - w * 0.07, w * 0.4, w * 0.08, w * 0.03);
    ctx.fillStyle = on ? "#ff3d3d" : "#7a1515"; rr(ctx, -w * 0.19 + cx, top - ch - w * 0.065, w * 0.18, w * 0.06, w * 0.02);
    ctx.fillStyle = on ? "#1a3a7a" : "#3cb6ff"; rr(ctx, w * 0.01 + cx, top - ch - w * 0.065, w * 0.18, w * 0.06, w * 0.02);
  }
  if (type === "skis" && w > 20) {
    ctx.fillStyle = def.accent; ctx.fillRect(-w * 0.5, top + bh * 0.55, w, bh * 0.12);
    ctx.fillStyle = "#444"; ctx.fillRect(-w * 0.3 + cx, top - ch - w * 0.03, w * 0.6, w * 0.03);
    for (const [sx, col] of [[-0.2, def.accent], [0.12, "#ff3fa4"]]) {
      ctx.fillStyle = col; rr(ctx, sx * w + cx, top - ch - w * 0.32, w * 0.07, w * 0.32, w * 0.03);
      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fillRect(sx * w + cx + w * 0.015, top - ch - w * 0.28, w * 0.015, w * 0.22);
    }
    ctx.fillStyle = "#e6f2ff";
    for (const wx of [-w * 0.52 + ww * 0.5, w * 0.52 - ww * 0.5]) for (let k = 0; k < 3; k++) ell(ctx, wx + (k - 1) * ww * 0.28, -wh * 0.5, w * 0.012, w * 0.012);
  }
  if (type === "shark") {
    ctx.fillStyle = shade(def.body, -0.2);
    poly(ctx, [cx - w * 0.06, top - ch, cx + w * 0.02, top - ch - w * 0.25, cx + w * 0.07, top - ch]);
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 4; i++) poly(ctx, [-w * 0.22 + i * w * 0.12, top + bh * 0.7, -w * 0.16 + i * w * 0.12, top + bh * 0.95, -w * 0.1 + i * w * 0.12, top + bh * 0.7]);
  }

  if (o.nitro) for (const s of [-1, 1]) flame(ctx, s * w * 0.2, by - w * 0.02, w * 0.075, t, 2.5);
  ctx.restore();
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  ctx.closePath(); ctx.fill();
}
function sticker(ctx, id, w, top, bh) {
  const y0 = top + bh * 0.62;
  switch (id) {
    case "flames":
      for (const s of [-1, 1]) {
        ctx.fillStyle = "#ff7a00"; poly(ctx, [s * w * 0.48, top + bh * 0.95, s * w * 0.48, top + bh * 0.45, s * w * 0.4, top + bh * 0.6, s * w * 0.36, top + bh * 0.35, s * w * 0.3, top + bh * 0.62, s * w * 0.24, top + bh * 0.5, s * w * 0.18, top + bh * 0.95]);
        ctx.fillStyle = "#ffe14d"; poly(ctx, [s * w * 0.46, top + bh * 0.95, s * w * 0.44, top + bh * 0.65, s * w * 0.38, top + bh * 0.75, s * w * 0.34, top + bh * 0.58, s * w * 0.28, top + bh * 0.78, s * w * 0.22, top + bh * 0.95]);
      }
      break;
    case "stars":
      ctx.fillStyle = "#fff6a8";
      for (const [x, y, r] of [[-0.33, 0.68, 0.06], [-0.22, 0.82, 0.04], [0.33, 0.68, 0.06], [0.22, 0.82, 0.04]]) star(ctx, x * w, top + y * bh, r * w);
      break;
    case "bolt":
      ctx.fillStyle = "#ffe600";
      for (const s of [-1, 1]) poly(ctx, [s * w * 0.42, top + bh * 0.5, s * w * 0.3, top + bh * 0.72, s * w * 0.36, top + bh * 0.72, s * w * 0.24, top + bh * 0.96, s * w * 0.4, top + bh * 0.66, s * w * 0.34, top + bh * 0.66]);
      break;
    case "checker": {
      const n = 12, cw = w * 0.9 / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? "#111" : "#fff"; ctx.fillRect(-w * 0.45 + i * cw, top + bh * 0.04 + j * cw * 0.6, cw, cw * 0.6); }
      break;
    }
    case "one":
      for (const s of [-1, 1]) {
        ctx.fillStyle = "#ffffff"; ell(ctx, s * w * 0.32, y0 + bh * 0.08, w * 0.075, w * 0.075);
        ctx.fillStyle = "#e8262b"; ctx.font = `900 ${Math.round(w * 0.11)}px system-ui,sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("1", s * w * 0.32, y0 + bh * 0.09);
      }
      break;
  }
}

function flame(ctx, x, y, r, t, power) {
  const f = 0.75 + 0.25 * Math.sin(t * 60 + x);
  ctx.fillStyle = "rgba(255,120,0,0.85)"; ell(ctx, x, y + r * 0.6 * power, r * 1.1 * f, r * 1.3 * power * f);
  ctx.fillStyle = "rgba(255,230,80,0.95)"; ell(ctx, x, y + r * 0.4 * power, r * 0.7 * f, r * 0.85 * power * f);
  ctx.fillStyle = "rgba(160,220,255,0.9)"; ell(ctx, x, y + r * 0.15, r * 0.4, r * 0.4);
}

/* Roadside sprites. w = world width (road half-width is 2000). collide = car bonks into it. */
export const SPRITES = {
  tree: { w: 1400, collide: true }, bush: { w: 900, collide: false }, flower: { w: 450, collide: false },
  cactus: { w: 900, collide: true }, rock: { w: 950, collide: true }, palm: { w: 1500, collide: true },
  pine: { w: 1300, collide: true }, snowman: { w: 900, collide: true },
  lollipop: { w: 950, collide: true }, candycane: { w: 800, collide: true }, cupcake: { w: 1000, collide: true },
  volcanorock: { w: 1100, collide: true }, lavaflame: { w: 700, collide: false },
  planet: { w: 1700, collide: false }, crystal: { w: 950, collide: true }, ufo: { w: 1300, collide: false },
  sign: { w: 2200, collide: true }, lamp: { w: 500, collide: true },
  moonrock: { w: 1100, collide: true }, crater: { w: 1800, collide: false }, dish: { w: 1300, collide: true }, dome: { w: 1700, collide: true },
  autumnTree: { w: 1400, collide: true }, umbrella: { w: 1000, collide: true }, sandcastle: { w: 1000, collide: true }, surfboard: { w: 600, collide: true },
  pumpkin: { w: 800, collide: true }, hay: { w: 1000, collide: true }, mushroom: { w: 700, collide: false },
  kelp: { w: 800, collide: true }, coral: { w: 1100, collide: true }, shellrock: { w: 1000, collide: true }, jelly: { w: 700, collide: false },
  treasure: { w: 900, collide: true }, anemone: { w: 800, collide: false },
  icepine: { w: 1300, collide: true }, icecrystal: { w: 1000, collide: true }, igloo: { w: 1600, collide: true }, penguin: { w: 600, collide: true }, snowfort: { w: 1500, collide: true },
};

export function drawSprite(ctx, type, x, yb, w, t) {
  if (w < 2) return;
  const h = w;
  switch (type) {
    case "tree":
    case "autumnTree": {
      const sway = Math.sin(t * 1.6 + x * 0.013) * w * 0.035, fall = type === "autumnTree";
      ctx.fillStyle = "#7a4a22"; ctx.fillRect(x - w * 0.08, yb - h * 0.55, w * 0.16, h * 0.55);
      ctx.fillStyle = fall ? "#d9481f" : "#2f9a3d"; ell(ctx, x + sway, yb - h * 0.85, w * 0.45, h * 0.38);
      ctx.fillStyle = fall ? "#ff9d1c" : "#3fb84e"; ell(ctx, x - w * 0.12 + sway * 1.3, yb - h * 0.95, w * 0.28, h * 0.24);
      ctx.fillStyle = fall ? "#ffd23f" : "#ff4d4d"; ell(ctx, x + w * 0.18 + sway, yb - h * 0.8, w * 0.05, w * 0.05); ell(ctx, x - w * 0.2 + sway, yb - h * 0.7, w * 0.05, w * 0.05);
      break;
    }
    case "umbrella": {
      ctx.fillStyle = "#eee"; ctx.fillRect(x - w * 0.03, yb - h * 0.9, w * 0.06, h * 0.9);
      const cols = ["#ff3d3d", "#ffffff"];
      for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[i % 2]; ctx.beginPath(); ctx.moveTo(x, yb - h * 1.1); ctx.arc(x, yb - h * 0.85, w * 0.55, Math.PI + i * Math.PI / 6, Math.PI + (i + 1) * Math.PI / 6); ctx.closePath(); ctx.fill(); }
      break;
    }
    case "sandcastle":
      ctx.fillStyle = "#e8c66a"; ctx.fillRect(x - w * 0.45, yb - h * 0.35, w * 0.9, h * 0.35);
      for (const dx of [-0.38, 0, 0.38]) { ctx.fillRect(x + dx * w - w * 0.11, yb - h * (dx ? 0.6 : 0.75), w * 0.22, h * (dx ? 0.6 : 0.75)); }
      ctx.fillStyle = "#c9a54d"; ctx.fillRect(x - w * 0.08, yb - h * 0.2, w * 0.16, h * 0.2);
      ctx.fillStyle = "#ff3fa4"; poly(ctx, [x, yb - h * 0.75, x, yb - h * 0.95, x + w * 0.18, yb - h * 0.87]);
      break;
    case "surfboard":
      ctx.fillStyle = "#2fa8ff"; rr(ctx, x - w * 0.16, yb - h * 1.3, w * 0.32, h * 1.3, w * 0.16);
      ctx.fillStyle = "#ffd400"; ctx.fillRect(x - w * 0.16, yb - h * 0.8, w * 0.32, h * 0.08);
      break;
    case "pumpkin":
      ctx.fillStyle = "#ff7a00"; ell(ctx, x - w * 0.18, yb - h * 0.32, w * 0.24, h * 0.3); ell(ctx, x + w * 0.18, yb - h * 0.32, w * 0.24, h * 0.3);
      ctx.fillStyle = "#ff9a1f"; ell(ctx, x, yb - h * 0.33, w * 0.26, h * 0.32);
      ctx.fillStyle = "#3a7a2a"; ctx.fillRect(x - w * 0.04, yb - h * 0.75, w * 0.08, h * 0.14);
      break;
    case "hay":
      ctx.fillStyle = "#e8c34a"; rr(ctx, x - w * 0.5, yb - h * 0.55, w, h * 0.55, w * 0.12);
      ctx.strokeStyle = "#c79d2a"; ctx.lineWidth = Math.max(1, w * 0.03);
      for (const k of [0.2, 0.4]) { ctx.beginPath(); ctx.moveTo(x - w * 0.45, yb - h * k); ctx.lineTo(x + w * 0.45, yb - h * k); ctx.stroke(); }
      break;
    case "mushroom":
      ctx.fillStyle = "#fff4e0"; rr(ctx, x - w * 0.12, yb - h * 0.5, w * 0.24, h * 0.5, w * 0.06);
      ctx.fillStyle = "#e8262b"; ctx.beginPath(); ctx.ellipse(x, yb - h * 0.5, w * 0.45, h * 0.32, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#fff"; ell(ctx, x - w * 0.18, yb - h * 0.62, w * 0.07, w * 0.06); ell(ctx, x + w * 0.12, yb - h * 0.7, w * 0.08, w * 0.07); ell(ctx, x + w * 0.28, yb - h * 0.56, w * 0.05, w * 0.05);
      break;
    case "bush":
      ctx.fillStyle = "#2f9a3d"; ell(ctx, x, yb - h * 0.2, w * 0.5, h * 0.22);
      ctx.fillStyle = "#43c053"; ell(ctx, x - w * 0.15, yb - h * 0.28, w * 0.25, h * 0.16);
      break;
    case "flower":
      ctx.fillStyle = "#2e8b3a"; ctx.fillRect(x - w * 0.04, yb - h * 0.7, w * 0.08, h * 0.7);
      ctx.fillStyle = "#ff6fb5"; for (let i = 0; i < 5; i++) { const a = i * 1.256 + t; ell(ctx, x + Math.cos(a) * w * 0.2, yb - h * 0.8 + Math.sin(a) * w * 0.2, w * 0.15, w * 0.15); }
      ctx.fillStyle = "#ffd400"; ell(ctx, x, yb - h * 0.8, w * 0.13, w * 0.13);
      break;
    case "cactus":
      ctx.fillStyle = "#2c9e4b";
      rr(ctx, x - w * 0.12, yb - h * 1.2, w * 0.24, h * 1.2, w * 0.12);
      rr(ctx, x - w * 0.45, yb - h * 0.85, w * 0.16, h * 0.45, w * 0.08); ctx.fillRect(x - w * 0.45, yb - h * 0.5, w * 0.35, w * 0.14);
      rr(ctx, x + w * 0.29, yb - h * 1.0, w * 0.16, h * 0.5, w * 0.08); ctx.fillRect(x + w * 0.1, yb - h * 0.62, w * 0.35, w * 0.14);
      ctx.fillStyle = "#ff6fb5"; ell(ctx, x, yb - h * 1.2, w * 0.08, w * 0.06);
      break;
    case "rock":
      ctx.fillStyle = "#8d8178"; poly(ctx, [x - w * 0.5, yb, x - w * 0.35, yb - h * 0.45, x, yb - h * 0.6, x + w * 0.4, yb - h * 0.4, x + w * 0.5, yb]);
      ctx.fillStyle = "#a99c92"; poly(ctx, [x - w * 0.35, yb - h * 0.45, x, yb - h * 0.6, x + w * 0.05, yb - h * 0.3]);
      break;
    case "palm":
      ctx.strokeStyle = "#9b6a3a"; ctx.lineWidth = w * 0.08; ctx.beginPath(); ctx.moveTo(x, yb); ctx.quadraticCurveTo(x + w * 0.15, yb - h * 0.6, x + w * 0.05, yb - h * 1.1); ctx.stroke();
      ctx.fillStyle = "#2fa84a"; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.7 + Math.sin(t * 1.4 + x * 0.01) * 0.08; ctx.save(); ctx.translate(x + w * 0.05, yb - h * 1.1); ctx.rotate(a); ell(ctx, w * 0.3, 0, w * 0.32, w * 0.08); ctx.restore(); }
      break;
    case "pine":
      ctx.fillStyle = "#6b4423"; ctx.fillRect(x - w * 0.07, yb - h * 0.3, w * 0.14, h * 0.3);
      for (let i = 0; i < 3; i++) {
        const yy = yb - h * 0.25 - i * h * 0.35, ww = w * (0.5 - i * 0.12);
        ctx.fillStyle = "#1f7a45"; poly(ctx, [x - ww, yy, x, yy - h * 0.5, x + ww, yy]);
        ctx.fillStyle = "#ffffff"; poly(ctx, [x - ww * 0.35, yy - h * 0.33, x, yy - h * 0.5, x + ww * 0.35, yy - h * 0.33]);
      }
      break;
    case "snowman":
      ctx.fillStyle = "#ffffff"; ell(ctx, x, yb - h * 0.3, w * 0.35, w * 0.3); ell(ctx, x, yb - h * 0.75, w * 0.25, w * 0.22); ell(ctx, x, yb - h * 1.08, w * 0.18, w * 0.17);
      ctx.fillStyle = "#222"; ell(ctx, x - w * 0.06, yb - h * 1.12, w * 0.025, w * 0.025); ell(ctx, x + w * 0.06, yb - h * 1.12, w * 0.025, w * 0.025);
      ctx.fillRect(x - w * 0.16, yb - h * 1.25, w * 0.32, w * 0.04); ctx.fillRect(x - w * 0.1, yb - h * 1.45, w * 0.2, w * 0.2);
      ctx.fillStyle = "#ff7a00"; poly(ctx, [x, yb - h * 1.08, x + w * 0.18, yb - h * 1.05, x, yb - h * 1.03]);
      ctx.fillStyle = "#e8262b"; ctx.fillRect(x - w * 0.18, yb - h * 0.95, w * 0.36, w * 0.06);
      break;
    case "lollipop": {
      ctx.fillStyle = "#f4f4f4"; ctx.fillRect(x - w * 0.04, yb - h * 0.9, w * 0.08, h * 0.9);
      const cols = ["#ff3fa4", "#ffd400", "#3cf2ff", "#7a2cff"];
      for (let i = 4; i > 0; i--) { ctx.fillStyle = cols[i % 4]; ell(ctx, x, yb - h * 1.15, w * 0.1 * i, w * 0.1 * i); }
      break;
    }
    case "candycane":
      ctx.lineCap = "round"; ctx.lineWidth = w * 0.16;
      for (const [col, dash] of [["#ffffff", []], ["#e8262b", [w * 0.12, w * 0.12]]]) {
        ctx.strokeStyle = col; ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x + w * 0.2, yb); ctx.lineTo(x + w * 0.2, yb - h * 0.9); ctx.arc(x, yb - h * 0.9, w * 0.2, 0, Math.PI, true); ctx.stroke();
      }
      ctx.setLineDash([]); ctx.lineCap = "butt";
      break;
    case "cupcake":
      ctx.fillStyle = "#ff8ad8"; poly(ctx, [x - w * 0.35, yb - h * 0.45, x + w * 0.35, yb - h * 0.45, x + w * 0.25, yb, x - w * 0.25, yb]);
      ctx.fillStyle = "#fff4fb"; ell(ctx, x, yb - h * 0.55, w * 0.42, h * 0.2); ell(ctx, x, yb - h * 0.72, w * 0.3, h * 0.16);
      ctx.fillStyle = "#e8262b"; ell(ctx, x, yb - h * 0.9, w * 0.09, w * 0.09);
      break;
    case "volcanorock":
      ctx.fillStyle = "#2a1a17"; poly(ctx, [x - w * 0.5, yb, x - w * 0.3, yb - h * 0.6, x + w * 0.1, yb - h * 0.75, x + w * 0.5, yb - h * 0.3, x + w * 0.45, yb]);
      ctx.strokeStyle = `rgba(255,${120 + 60 * Math.sin(t * 4) | 0},0,0.9)`; ctx.lineWidth = Math.max(1, w * 0.03);
      ctx.beginPath(); ctx.moveTo(x - w * 0.2, yb); ctx.lineTo(x - w * 0.1, yb - h * 0.35); ctx.lineTo(x + w * 0.1, yb - h * 0.5); ctx.moveTo(x - w * 0.1, yb - h * 0.35); ctx.lineTo(x + w * 0.25, yb - h * 0.2); ctx.stroke();
      break;
    case "lavaflame": {
      const f = 1 + 0.15 * Math.sin(t * 9 + x);
      ctx.fillStyle = "#ff3d00"; poly(ctx, [x - w * 0.4, yb, x, yb - h * 1.2 * f, x + w * 0.4, yb]);
      ctx.fillStyle = "#ffb000"; poly(ctx, [x - w * 0.25, yb, x, yb - h * 0.8 * f, x + w * 0.25, yb]);
      ctx.fillStyle = "#fff176"; poly(ctx, [x - w * 0.12, yb, x, yb - h * 0.4 * f, x + w * 0.12, yb]);
      break;
    }
    case "planet": {
      const yy = yb - h * 1.0 + Math.sin(t * 1.5 + x * 0.01) * h * 0.08;
      ctx.fillStyle = "#ff8a3c"; ell(ctx, x, yy, w * 0.32, w * 0.32);
      ctx.fillStyle = "#ffb27a"; ell(ctx, x - w * 0.08, yy - w * 0.1, w * 0.1, w * 0.06);
      ctx.strokeStyle = "#ffe8a8"; ctx.lineWidth = Math.max(1, w * 0.04); ctx.beginPath(); ctx.ellipse(x, yy, w * 0.5, w * 0.12, -0.3, 0, Math.PI * 2); ctx.stroke();
      break;
    }
    case "crystal":
      ctx.fillStyle = "#3cf2ff"; poly(ctx, [x - w * 0.15, yb, x - w * 0.2, yb - h * 0.7, x, yb - h * 1.1, x + w * 0.15, yb - h * 0.7, x + w * 0.12, yb]);
      ctx.fillStyle = "#c7fbff"; poly(ctx, [x - w * 0.05, yb, x - w * 0.08, yb - h * 0.7, x, yb - h * 1.1, x + w * 0.02, yb - h * 0.6]);
      ctx.fillStyle = "#ff3fe5"; poly(ctx, [x + w * 0.15, yb, x + w * 0.25, yb - h * 0.5, x + w * 0.4, yb - h * 0.6, x + w * 0.38, yb]);
      break;
    case "ufo": {
      const yy = yb - h * 1.1 + Math.sin(t * 2 + x * 0.02) * h * 0.1;
      ctx.fillStyle = "rgba(120,255,140,0.25)"; poly(ctx, [x - w * 0.2, yy, x + w * 0.2, yy, x + w * 0.45, yb, x - w * 0.45, yb]);
      ctx.fillStyle = "#9fd8ff"; ell(ctx, x, yy - w * 0.08, w * 0.2, w * 0.15);
      ctx.fillStyle = "#b5bcc8"; ell(ctx, x, yy, w * 0.5, w * 0.12);
      ctx.fillStyle = (t * 4 | 0) % 2 ? "#ffd400" : "#ff3fa4"; for (let i = -2; i <= 2; i++) ell(ctx, x + i * w * 0.17, yy + w * 0.02, w * 0.035, w * 0.035);
      break;
    }
    case "moonrock": {
      const g = ctx.createRadialGradient(x - w * 0.15, yb - h * 0.45, w * 0.05, x, yb - h * 0.3, w * 0.6);
      g.addColorStop(0, "#c9ced8"); g.addColorStop(1, "#5d6372");
      ctx.fillStyle = g; poly(ctx, [x - w * 0.5, yb, x - w * 0.38, yb - h * 0.42, x - w * 0.05, yb - h * 0.62, x + w * 0.35, yb - h * 0.45, x + w * 0.5, yb]);
      ctx.fillStyle = "rgba(0,0,0,0.18)"; ell(ctx, x + w * 0.12, yb - h * 0.3, w * 0.08, w * 0.05); ell(ctx, x - w * 0.18, yb - h * 0.18, w * 0.06, w * 0.04);
      break;
    }
    case "crater":
      ctx.fillStyle = "#6f7584"; ell(ctx, x, yb - h * 0.04, w * 0.5, h * 0.12);
      ctx.fillStyle = "#5a606e"; ell(ctx, x, yb - h * 0.03, w * 0.4, h * 0.08);
      ctx.fillStyle = "rgba(255,255,255,0.25)"; ell(ctx, x - w * 0.12, yb - h * 0.1, w * 0.25, h * 0.03);
      break;
    case "dish": {
      ctx.fillStyle = "#59606b"; ctx.fillRect(x - w * 0.04, yb - h * 0.75, w * 0.08, h * 0.75);
      const g = ctx.createLinearGradient(x - w * 0.4, 0, x + w * 0.4, 0); g.addColorStop(0, "#f4f6fa"); g.addColorStop(1, "#9aa4b1");
      ctx.save(); ctx.translate(x, yb - h * 0.85); ctx.rotate(-0.5 + Math.sin(t * 0.6 + x * 0.01) * 0.15);
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.42, w * 0.18, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = "#59606b"; ctx.fillRect(-w * 0.015, -w * 0.25, w * 0.03, w * 0.25);
      ctx.fillStyle = (t * 2 | 0) % 2 ? "#ff3d3d" : "#ff9d9d"; ell(ctx, 0, -w * 0.27, w * 0.035, w * 0.035);
      ctx.restore();
      break;
    }
    case "dome": {
      ctx.fillStyle = "#4a5060"; ctx.fillRect(x - w * 0.5, yb - h * 0.12, w, h * 0.12);
      const g = ctx.createRadialGradient(x - w * 0.15, yb - h * 0.45, w * 0.05, x, yb - h * 0.2, w * 0.55);
      g.addColorStop(0, "rgba(220,250,255,0.95)"); g.addColorStop(1, "rgba(80,170,210,0.75)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, yb - h * 0.12, w * 0.46, h * 0.42, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "rgba(255,240,150,0.9)"; for (const k of [-0.25, 0, 0.25]) rr(ctx, x + k * w - w * 0.05, yb - h * 0.3, w * 0.1, h * 0.12, w * 0.02);
      ctx.fillStyle = "rgba(255,240,150,0.25)"; ell(ctx, x, yb - h * 0.22, w * 0.42, h * 0.16);
      break;
    }
    case "kelp": {
      // three tall strands that sway in the water, each with little leaves
      for (let k = -1; k <= 1; k++) {
        const bx = x + k * w * 0.18, tall = h * (1.5 + 0.3 * ((k + 2) % 2));
        ctx.strokeStyle = k ? "#2f9a5a" : "#3fb86a"; ctx.lineWidth = Math.max(1, w * 0.07); ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(bx, yb);
        for (let j = 1; j <= 6; j++) ctx.lineTo(bx + Math.sin(t * 1.3 + j * 0.8 + k + x * 0.01) * w * 0.07 * j / 3, yb - tall * j / 6);
        ctx.stroke();
        ctx.fillStyle = "#4fd07a";
        for (let j = 1; j < 6; j += 2) { const lx = bx + Math.sin(t * 1.3 + j * 0.8 + k + x * 0.01) * w * 0.07 * j / 3, ly = yb - tall * j / 6; ctx.beginPath(); ctx.ellipse(lx + w * 0.06 * (j % 4 ? 1 : -1), ly, w * 0.07, w * 0.03, (j % 4 ? -0.5 : 0.5), 0, 7); ctx.fill(); }
      }
      ctx.lineCap = "butt";
      break;
    }
    case "coral": {
      // branching coral: a fan of rounded arms
      const col = ["#ff7a59", "#ff5fa2", "#ffb347"][Math.abs(Math.round(x)) % 3];
      ctx.strokeStyle = col; ctx.lineCap = "round"; ctx.lineWidth = Math.max(1, w * 0.09);
      const arm = (ax, ay, a, len, d) => {
        const ex = ax + Math.sin(a) * len, ey = ay - Math.cos(a) * len;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
        if (d > 0) { arm(ex, ey, a - 0.45, len * 0.72, d - 1); arm(ex, ey, a + 0.45, len * 0.72, d - 1); }
        else { ctx.fillStyle = shade(col, 0.3); ell(ctx, ex, ey, w * 0.05, w * 0.05); }
      };
      arm(x, yb, 0, h * 0.35, 2);
      ctx.lineCap = "butt";
      break;
    }
    case "shellrock": {
      const g = ctx.createRadialGradient(x - w * 0.15, yb - h * 0.4, w * 0.05, x, yb - h * 0.25, w * 0.6);
      g.addColorStop(0, "#9fb4bf"); g.addColorStop(1, "#4b6270");
      ctx.fillStyle = g; poly(ctx, [x - w * 0.5, yb, x - w * 0.36, yb - h * 0.38, x - w * 0.02, yb - h * 0.5, x + w * 0.38, yb - h * 0.36, x + w * 0.5, yb]);
      ctx.fillStyle = "#ffd6c4"; ctx.beginPath(); ctx.moveTo(x + w * 0.1, yb - h * 0.3); ctx.arc(x + w * 0.1, yb - h * 0.3, w * 0.12, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = "#e8a58a"; ctx.lineWidth = Math.max(1, w * 0.012);
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(x + w * 0.1, yb - h * 0.3); ctx.lineTo(x + w * 0.1 + Math.sin(k * 0.55) * w * 0.12, yb - h * 0.3 - Math.cos(k * 0.55) * w * 0.12); ctx.stroke(); }
      ctx.fillStyle = "#ffb347"; star(ctx, x - w * 0.2, yb - h * 0.12, w * 0.09);
      break;
    }
    case "jelly": {
      // a jellyfish bobbing above the sand, glowing a little
      const by = yb - h * (1.3 + 0.15 * Math.sin(t * 1.5 + x * 0.02));
      ctx.fillStyle = "rgba(255,150,230,0.25)"; ell(ctx, x, by, w * 0.42, w * 0.32);
      ctx.fillStyle = "rgba(255,170,235,0.85)"; ctx.beginPath(); ctx.ellipse(x, by, w * 0.3, w * 0.22, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = "rgba(255,190,240,0.8)"; ctx.lineWidth = Math.max(1, w * 0.03);
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(x + k * w * 0.11, by); for (let j = 1; j <= 4; j++) ctx.lineTo(x + k * w * 0.11 + Math.sin(t * 3 + j + k) * w * 0.04, by + j * w * 0.1); ctx.stroke(); }
      ctx.fillStyle = "#fff"; ell(ctx, x - w * 0.1, by - w * 0.1, w * 0.05, w * 0.03);
      break;
    }
    case "treasure": {
      ctx.fillStyle = "rgba(255,212,0,0.25)"; ell(ctx, x, yb - h * 0.3, w * 0.6, h * 0.35);
      ctx.fillStyle = "#8a5a2b"; rr(ctx, x - w * 0.4, yb - h * 0.42, w * 0.8, h * 0.42, w * 0.04);
      ctx.fillStyle = "#a8743c"; ctx.beginPath(); ctx.ellipse(x, yb - h * 0.42, w * 0.4, h * 0.2, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#ffd400"; ctx.fillRect(x - w * 0.4, yb - h * 0.45, w * 0.8, h * 0.06); ctx.fillRect(x - w * 0.06, yb - h * 0.5, w * 0.12, h * 0.2);
      for (let k = -1; k <= 1; k++) ell(ctx, x + k * w * 0.18, yb - h * 0.6 - Math.abs(k) * h * 0.04, w * 0.08, w * 0.08);
      if (Math.sin(t * 4 + x * 0.01) > 0.7) { ctx.fillStyle = "#fff"; star(ctx, x + w * 0.2, yb - h * 0.7, w * 0.07); }
      break;
    }
    case "anemone": {
      ctx.fillStyle = "#9b4dff"; ell(ctx, x, yb - h * 0.08, w * 0.3, h * 0.1);
      ctx.strokeStyle = "#ff8ad8"; ctx.lineCap = "round"; ctx.lineWidth = Math.max(1, w * 0.05);
      for (let k = -4; k <= 4; k++) { const a = k * 0.28 + Math.sin(t * 2 + k) * 0.12; ctx.beginPath(); ctx.moveTo(x + k * w * 0.05, yb - h * 0.12); ctx.lineTo(x + k * w * 0.05 + Math.sin(a) * h * 0.4, yb - h * 0.12 - Math.cos(a) * h * 0.4); ctx.stroke(); }
      ctx.lineCap = "butt";
      break;
    }
    case "icepine": {
      // a frosty pine: blue-green layers heavy with snow, and icicles hanging off each layer
      ctx.fillStyle = "#6b4423"; ctx.fillRect(x - w * 0.07, yb - h * 0.3, w * 0.14, h * 0.3);
      for (let i = 0; i < 3; i++) {
        const yy = yb - h * 0.25 - i * h * 0.35, ww = w * (0.52 - i * 0.12);
        ctx.fillStyle = "#2d6f7a"; poly(ctx, [x - ww, yy, x, yy - h * 0.5, x + ww, yy]);
        ctx.fillStyle = "#ffffff"; poly(ctx, [x - ww * 0.55, yy - h * 0.22, x, yy - h * 0.5, x + ww * 0.55, yy - h * 0.22]);
        ctx.fillStyle = "#f4faff"; ctx.fillRect(x - ww, yy - h * 0.03, ww * 2, h * 0.035);
        ctx.fillStyle = "#bfefff"; for (let k = 0; k < 4; k++) { const ix = x - ww * 0.8 + k * ww * 0.53; poly(ctx, [ix - w * 0.02, yy, ix + w * 0.02, yy, ix, yy + h * 0.07]); }
      }
      break;
    }
    case "icecrystal": {
      // a cluster of see-through ice crystals that twinkle
      const sp = [[-0.25, 0.75, -0.18], [0.22, 0.6, 0.2], [0, 1.05, 0]];
      for (const [dx, hh, lean] of sp) {
        const bx = x + dx * w, bw = w * 0.14, top = yb - h * hh;
        ctx.fillStyle = "rgba(150,220,255,0.75)"; poly(ctx, [bx - bw, yb, bx - bw * 0.8 + lean * w * 0.3, top + h * 0.12, bx + lean * w * 0.3, top, bx + bw * 0.8 + lean * w * 0.3, top + h * 0.12, bx + bw, yb]);
        ctx.fillStyle = "rgba(255,255,255,0.65)"; poly(ctx, [bx - bw * 0.5, yb, bx - bw * 0.4 + lean * w * 0.3, top + h * 0.14, bx + lean * w * 0.3, top + h * 0.02, bx - bw * 0.1, yb]);
      }
      if (w > 10 && Math.sin(t * 3 + x * 0.02) > 0.4) { ctx.fillStyle = "#ffffff"; star(ctx, x + w * 0.05, yb - h * 0.95, w * 0.09); }
      break;
    }
    case "igloo": {
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(x, yb, w * 0.5, h * 0.5, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = "#bcd7ea"; ctx.lineWidth = Math.max(1, w * 0.012);
      for (let r = 1; r < 4; r++) { const yy = yb - h * 0.13 * r, half = w * 0.5 * Math.sqrt(1 - Math.pow(0.26 * r, 2)); ctx.beginPath(); ctx.moveTo(x - half, yy); ctx.lineTo(x + half, yy); ctx.stroke(); }
      for (let r = 0; r < 4; r++) for (let k = -2; k <= 2; k++) { const yy = yb - h * 0.13 * r, bx = x + (k + (r % 2) * 0.5) * w * 0.18; if (Math.abs(bx - x) < w * 0.45 * Math.sqrt(1 - Math.pow(0.26 * r, 2))) { ctx.beginPath(); ctx.moveTo(bx, yy); ctx.lineTo(bx, yy - h * 0.13); ctx.stroke(); } }
      ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(x + w * 0.18, yb, w * 0.17, h * 0.2, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = "#2a3550"; ctx.beginPath(); ctx.ellipse(x + w * 0.18, yb, w * 0.1, h * 0.14, 0, Math.PI, 0); ctx.fill();
      break;
    }
    case "penguin": {
      // a waddling penguin
      const wob = Math.sin(t * 6 + x * 0.05) * 0.12;
      ctx.save(); ctx.translate(x, yb); ctx.rotate(wob);
      ctx.fillStyle = "#ff9d00"; ell(ctx, -w * 0.14, -h * 0.02, w * 0.12, h * 0.04); ell(ctx, w * 0.14, -h * 0.02, w * 0.12, h * 0.04);
      ctx.fillStyle = "#1c2233"; ell(ctx, 0, -h * 0.45, w * 0.32, h * 0.44);
      ctx.fillStyle = "#ffffff"; ell(ctx, 0, -h * 0.38, w * 0.22, h * 0.33);
      ctx.fillStyle = "#1c2233"; ell(ctx, -w * 0.3, -h * 0.45, w * 0.08, h * 0.22); ell(ctx, w * 0.3, -h * 0.45, w * 0.08, h * 0.22);
      ctx.fillStyle = "#ffffff"; ell(ctx, -w * 0.1, -h * 0.75, w * 0.06, h * 0.06); ell(ctx, w * 0.1, -h * 0.75, w * 0.06, h * 0.06);
      ctx.fillStyle = "#111"; ell(ctx, -w * 0.09, -h * 0.75, w * 0.03, h * 0.035); ell(ctx, w * 0.09, -h * 0.75, w * 0.03, h * 0.035);
      ctx.fillStyle = "#ff9d00"; poly(ctx, [-w * 0.07, -h * 0.66, w * 0.07, -h * 0.66, 0, -h * 0.56]);
      ctx.restore();
      break;
    }
    case "snowfort": {
      // a snow fort wall with blocky tops and a little flag
      ctx.fillStyle = "#e6f2fc"; ctx.fillRect(x - w * 0.5, yb - h * 0.4, w, h * 0.4);
      for (let k = 0; k < 5; k++) ctx.fillRect(x - w * 0.5 + k * w * 0.22, yb - h * 0.52, w * 0.12, h * 0.13);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(x - w * 0.5, yb - h * 0.4, w, h * 0.05);
      ctx.fillStyle = "#bcd7ea"; for (let k = 0; k < 3; k++) ctx.fillRect(x - w * 0.42 + k * w * 0.33, yb - h * 0.25, w * 0.18, h * 0.015);
      ctx.fillStyle = "#555"; ctx.fillRect(x + w * 0.3, yb - h * 0.95, w * 0.02, h * 0.45);
      ctx.fillStyle = "#e8262b"; poly(ctx, [x + w * 0.32, yb - h * 0.95, x + w * 0.32 + w * 0.16 * (1 + 0.1 * Math.sin(t * 5)), yb - h * 0.88, x + w * 0.32, yb - h * 0.81]);
      ctx.fillStyle = "#ffffff"; ell(ctx, x - w * 0.15, yb - h * 0.05, w * 0.12, h * 0.1); ell(ctx, x - w * 0.02, yb - h * 0.04, w * 0.09, h * 0.08);
      break;
    }
    case "lamp":
      ctx.fillStyle = "#59606b"; ctx.fillRect(x - w * 0.06, yb - h * 2.4, w * 0.12, h * 2.4);
      ctx.fillRect(x - w * 0.06, yb - h * 2.4, w * 0.6, w * 0.1);
      ctx.fillStyle = "#fff59a"; ell(ctx, x + w * 0.5, yb - h * 2.28, w * 0.16, w * 0.12);
      ctx.fillStyle = "rgba(255,245,154,0.25)"; ell(ctx, x + w * 0.5, yb - h * 2.28, w * 0.34, w * 0.28);
      break;
    case "sign":
      ctx.fillStyle = "#555"; ctx.fillRect(x - w * 0.4, yb - h * 0.45, w * 0.05, h * 0.45); ctx.fillRect(x + w * 0.35, yb - h * 0.45, w * 0.05, h * 0.45);
      ctx.fillStyle = "#ffd400"; rr(ctx, x - w * 0.5, yb - h * 0.75, w, h * 0.32, w * 0.04);
      ctx.fillStyle = "#e8262b"; rr(ctx, x - w * 0.47, yb - h * 0.72, w * 0.94, h * 0.26, w * 0.03);
      if (w > 40) { ctx.fillStyle = "#fff"; ctx.font = `900 ${Math.round(w * 0.13)}px system-ui,sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("TURBO DASH", x, yb - h * 0.59); }
      break;
  }
}

export function drawCoin(ctx, x, y, w, t) {
  if (w < 1.5) return;
  const sx = Math.abs(Math.cos(t * 4 + x * 0.002));
  ctx.fillStyle = "#c98a00"; ell(ctx, x, y, w * 0.5 * Math.max(0.15, sx), w * 0.5);
  ctx.fillStyle = "#ffd400"; ell(ctx, x, y, w * 0.42 * Math.max(0.1, sx), w * 0.42);
  if (w > 10 && sx > 0.4) { ctx.fillStyle = "#fff3a0"; ell(ctx, x - w * 0.1 * sx, y - w * 0.12, w * 0.1 * sx, w * 0.12); }
}

/* A pearl floating above a bubble vent: worth 5 coins. */
export function drawPearl(ctx, x, y, w, t) {
  if (w < 1.5) return;
  ctx.fillStyle = "rgba(255,200,240,0.35)"; ell(ctx, x, y, w * 0.75, w * 0.75);
  const g = ctx.createRadialGradient(x - w * 0.15, y - w * 0.18, w * 0.05, x, y, w * 0.5);
  g.addColorStop(0, "#ffffff"); g.addColorStop(0.6, "#f4e9ff"); g.addColorStop(1, "#d9a8e8");
  ctx.fillStyle = g; ell(ctx, x, y, w * 0.5, w * 0.5);
  if (w > 8 && Math.sin(t * 5 + x * 0.01) > 0.5) { ctx.fillStyle = "#fff"; star(ctx, x + w * 0.22, y - w * 0.26, w * 0.12); }
}

/* Sky, sun, clouds/stars and two layers of hills. skyX/hillX scroll with the road's curves. */
export function drawBackground(ctx, W, H, th, skyX, hillX, lift, t) {
  const hz = H * 0.5 + lift;
  const g = ctx.createLinearGradient(0, 0, 0, hz);
  g.addColorStop(0, th.sky[0]); g.addColorStop(1, th.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  if (th.stars) {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 70; i++) {
      const sx = ((i * 137.5 + skyX * W * 0.3) % W + W) % W, sy = (i * 61.7) % (hz * 0.9);
      const s = 1 + (i % 3) * (H / 600) * (0.6 + 0.4 * Math.sin(t * 3 + i));
      ctx.fillRect(sx, sy, s, s);
    }
  }
  if (th.detail >= 2 && th.stars) {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 120; i++) {
      const sx = ((i * 97.3 + skyX * W * 0.12) % W + W) % W, sy = (i * 41.9) % (hz * 0.95);
      ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 2 + i * 1.7); ctx.fillRect(sx, sy, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;
    const neb = ctx.createRadialGradient(W * 0.3, hz * 0.3, 0, W * 0.3, hz * 0.3, H * 0.5);
    neb.addColorStop(0, "rgba(120,80,220,0.22)"); neb.addColorStop(1, "rgba(120,80,220,0)");
    ctx.fillStyle = neb; ctx.fillRect(0, 0, W, hz);
  }
  if (th.earth) {
    const ex = W * 0.22 - skyX * W * 0.05, ey = hz * 0.32, er = H * 0.12;
    const glow = ctx.createRadialGradient(ex, ey, er * 0.9, ex, ey, er * 1.6);
    glow.addColorStop(0, "rgba(120,190,255,0.45)"); glow.addColorStop(1, "rgba(120,190,255,0)");
    ctx.fillStyle = glow; ell(ctx, ex, ey, er * 1.6, er * 1.6);
    const sea = ctx.createRadialGradient(ex - er * 0.35, ey - er * 0.35, er * 0.1, ex, ey, er);
    sea.addColorStop(0, "#6fc3ff"); sea.addColorStop(1, "#1d4fa8");
    ctx.fillStyle = sea; ell(ctx, ex, ey, er, er);
    ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = "#4cae5a"; ell(ctx, ex - er * 0.3 + Math.sin(t * 0.05) * er * 0.1, ey - er * 0.2, er * 0.35, er * 0.22); ell(ctx, ex + er * 0.35, ey + er * 0.25, er * 0.28, er * 0.32);
    ctx.fillStyle = "rgba(255,255,255,0.75)"; ell(ctx, ex + er * 0.1, ey - er * 0.55, er * 0.5, er * 0.1); ell(ctx, ex - er * 0.2, ey + er * 0.5, er * 0.45, er * 0.08);
    ctx.fillStyle = "rgba(0,0,30,0.45)"; ell(ctx, ex + er * 0.55, ey + er * 0.1, er * 0.75, er * 1.1);
    ctx.restore();
  }
  if (th.aurora) aurora(ctx, W, H, hz, skyX, t);
  if (th.water) underwater(ctx, W, H, hz, skyX, t);
  else {
    ctx.fillStyle = th.sun;
    ctx.globalAlpha = 0.35; ell(ctx, W * 0.78, hz * 0.32, H * 0.13, H * 0.13);
    ctx.globalAlpha = 0.18; ell(ctx, W * 0.78, hz * 0.32, H * 0.2, H * 0.2);
    ctx.globalAlpha = 1; ell(ctx, W * 0.78, hz * 0.32, H * 0.08, H * 0.08);
  }
  if (!th.stars && !th.water && !th.aurora) {
    ctx.strokeStyle = "rgba(40,50,80,0.7)"; ctx.lineWidth = Math.max(1.5, H * 0.004); ctx.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const bx = (((t * 0.025 * (1 + i * 0.3) + i * 0.27 + skyX * 0.4) % 1.2) - 0.1) * W, by = hz * (0.2 + 0.09 * i) + Math.sin(t * 1.3 + i) * H * 0.01;
      const flap = Math.sin(t * 8 + i * 2) * H * 0.008, s = H * (0.012 + 0.003 * (i % 2));
      ctx.beginPath(); ctx.moveTo(bx - s, by - flap); ctx.quadraticCurveTo(bx - s / 2, by - s * 0.6, bx, by); ctx.quadraticCurveTo(bx + s / 2, by - s * 0.6, bx + s, by - flap); ctx.stroke();
    }
    ctx.lineCap = "butt";
  }

  if (th.clouds) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < 5; i++) {
      const cw = H * (0.18 + (i % 3) * 0.05);
      const cx = (((i * 0.27 + skyX * 0.5 + t * 0.004 * (1 + i % 2)) % 1.3 + 1.3) % 1.3) * W - cw;
      const cy = hz * (0.15 + (i % 3) * 0.12);
      ell(ctx, cx, cy, cw * 0.5, cw * 0.16); ell(ctx, cx - cw * 0.2, cy + cw * 0.03, cw * 0.28, cw * 0.13); ell(ctx, cx + cw * 0.15, cy - cw * 0.06, cw * 0.25, cw * 0.15);
    }
  }
  ctx.globalAlpha = 0.55; hills(ctx, W, H, hz, th.hills[1], hillX * 0.3, H * 0.23, 0.45, 11); ctx.globalAlpha = 1;
  hills(ctx, W, H, hz, th.hills[1], hillX * 0.6, H * 0.16, 0.7, 3);
  hills(ctx, W, H, hz, th.hills[0], hillX, H * 0.09, 1.3, 7);
}

/* Glacier Rink (graphics ladder step 4): a starry evening sky with the northern lights waving across it. */
function aurora(ctx, W, H, hz, skyX, t) {
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 60; i++) {
    const sx = ((i * 137.5 + skyX * W * 0.3) % W + W) % W, sy = (i * 61.7) % (hz * 0.6);
    ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2 + i); ctx.fillRect(sx, sy, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  const step = W / 30;
  for (const [col, yy, ph] of [["80,255,170", 0.1, 0], ["120,200,255", 0.2, 1.7], ["255,120,220", 0.05, 3.1]]) {
    for (let x = -step; x <= W + step; x += step) {
      const u = x / W + skyX * 0.25, wave = Math.sin(u * 7 + ph + t * 0.3) * hz * 0.06 + Math.sin(u * 13 + t * 0.5 + ph) * hz * 0.025;
      const top = hz * yy + wave, len = hz * (0.22 + 0.1 * Math.sin(u * 5 + t * 0.7 + ph)), a = 0.14 + 0.1 * Math.sin(u * 9 + t * 0.9 + ph);
      const g = ctx.createLinearGradient(0, top, 0, top + len);
      g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.3, `rgba(${col},${a.toFixed(3)})`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g; ctx.fillRect(x, top, step + 1, len);
    }
  }
  ctx.restore();
}

/* Under the sea (graphics ladder step 3): the bright surface far above, light rays, schools of fish, rising bubbles. */
function underwater(ctx, W, H, hz, skyX, t) {
  const sg = ctx.createLinearGradient(0, 0, 0, hz * 0.3);
  sg.addColorStop(0, "rgba(210,255,255,0.6)"); sg.addColorStop(1, "rgba(210,255,255,0)");
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, hz * 0.3);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  for (let i = 0; i < 10; i++) { const wx = (((i / 10 + skyX * 0.3 + t * 0.01) % 1) + 1) % 1 * W; ell(ctx, wx, hz * 0.035 + Math.sin(t * 1.5 + i) * H * 0.006, W * 0.045, H * 0.006); }
  ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 6; i++) {
    const rx = ((((i * 0.19 + skyX * 0.2) % 1.2) + 1.2) % 1.2 - 0.1) * W, sway = Math.sin(t * 0.5 + i * 1.3) * W * 0.03, a = 0.05 + 0.035 * Math.sin(t * 0.9 + i * 2);
    ctx.fillStyle = `rgba(200,250,255,${a.toFixed(3)})`;
    poly(ctx, [rx - W * 0.02, 0, rx + W * 0.03, 0, rx + sway + W * 0.13, H, rx + sway - W * 0.01, H]);
  }
  ctx.restore();
  for (let s = 0; s < 3; s++) {
    const fy = hz * (0.38 + s * 0.16), dir = s % 2 ? -1 : 1, u = (((t * 0.03 * (1 + s * 0.4) + s * 0.31 + skyX * 0.5) % 1.3) + 1.3) % 1.3 - 0.15;
    const fx0 = (dir > 0 ? u : 1 - u) * W, fs = H * 0.012;
    ctx.fillStyle = ["#ffb347", "#ff6b9d", "#ffe14d"][s];
    for (let k = 0; k < 6; k++) {
      const fx = fx0 - dir * k * H * 0.032, fyk = fy + Math.sin(t * 2 + k) * H * 0.008 + (k % 3 - 1) * H * 0.014;
      ell(ctx, fx, fyk, fs * 1.4, fs * 0.8);
      poly(ctx, [fx - dir * fs * 1.1, fyk, fx - dir * fs * 2.1, fyk - fs * 0.8, fx - dir * fs * 2.1, fyk + fs * 0.8]);
    }
  }
  ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = Math.max(1, H * 0.002);
  for (let i = 0; i < 24; i++) {
    const bx = (((i * 0.137 + skyX * 0.4) % 1) + 1) % 1 * W + Math.sin(t * 2 + i) * H * 0.01, by = hz - ((t * 0.05 * (1 + i % 3) + i * 0.071) % 1) * hz, br = H * (0.004 + (i % 4) * 0.002);
    ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.stroke();
  }
}

function hills(ctx, W, H, hz, col, off, amp, freq, seed) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, H);
  const step = W / 48;
  for (let x = 0; x <= W + step; x += step) {
    const u = (x / W + off) * Math.PI * 2 * freq;
    const y = hz - amp * (0.55 + 0.3 * Math.sin(u + seed) + 0.15 * Math.sin(u * 2.3 + seed * 2));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
}

/* Power-up box: a spinning, color-changing block with a question mark and a soft glow. */
export function drawBox(ctx, x, y, w, t) {
  if (w < 2) return;
  ctx.fillStyle = "rgba(255,255,255,0.28)"; ell(ctx, x, y, w * 0.72, w * 0.72);
  const sx = 0.6 + 0.4 * Math.abs(Math.cos(t * 2.2 + x * 0.01)), s = w * 0.5;
  ctx.fillStyle = `hsl(${(t * 140 + x * 0.3) % 360}, 90%, 58%)`;
  rr(ctx, x - s * sx, y - s, s * 2 * sx, s * 2, s * 0.35);
  ctx.strokeStyle = "#fff"; ctx.lineWidth = Math.max(1, w * 0.06); ctx.stroke();
  if (w > 14) { ctx.fillStyle = "#fff"; ctx.font = `900 ${Math.round(w * 0.7)}px system-ui,sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("?", x, y + w * 0.04); }
}

/* A boost ring floating in the sky (low-gravity worlds): fly through it for a speed boost. */
export function drawRing(ctx, x, y, w, t) {
  if (w < 3) return;
  const pulse = 1 + 0.06 * Math.sin(t * 6);
  ctx.lineWidth = Math.max(2, w * 0.09);
  ctx.strokeStyle = "rgba(60,242,255,0.35)"; ctx.beginPath(); ctx.ellipse(x, y, w * 0.55 * pulse, w * 0.62 * pulse, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = Math.max(1.5, w * 0.05);
  ctx.strokeStyle = "#3cf2ff"; ctx.beginPath(); ctx.ellipse(x, y, w * 0.45, w * 0.52, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(x, y, w * 0.45, w * 0.52, 0, -2.4, -1.6); ctx.stroke();
}
