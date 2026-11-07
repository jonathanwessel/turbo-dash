// Garage: browse and buy cars, buy upgrades, buy paint and stickers. All prices are in coins earned by racing.
import { CARS, CUPS, WORLDS, UPGRADES, UPGRADE_MAX, PAINTS, STICKERS, upgradeCost, worldOpen } from "./data.js";
import { drawCar } from "./draw.js";
import { S, save, upsOf } from "./save.js";

/* A car with its paint and sticker applied. */
export function lookOf(car) {
  const look = S.look[car.id] || {}, paint = PAINTS.find(p => p.id === look.paint);
  const out = { ...car, sticker: look.sticker || "none" };
  if (paint && paint.color) Object.assign(out, { body: paint.color, rainbow: !!paint.rainbow, shiny: !!paint.shiny });
  return out;
}

export function createGarage({ $, sfx, spend, celebrate }) {
  const cvs = $("g-car"), ctx = cvs.getContext("2d");
  let idx = 0, t = 0, zoom = 0, tab = "up";

  function open() { idx = Math.max(0, CARS.findIndex(c => c.id === S.car)); render(); }

  function stats(car) {
    const u = upsOf(car.id);
    return [
      ["Speed", (car.speed + 0.06 * u.engine) / 0.57],
      ["Power", (car.accel + 0.04 * u.engine) / 0.45],
      ["Grip", (car.grip + 0.07 * u.tires) / 0.6],
      ["Turbo", u.turbo / UPGRADE_MAX],
    ];
  }

  function render() {
    const car = CARS[idx], owned = S.owned.includes(car.id), driving = S.car === car.id;
    $("g-name").textContent = car.name;
    $("g-stats").innerHTML = stats(car).map(([k, v]) => `<span>${k}</span><div class="bar"><i style="width:${Math.round(8 + 92 * Math.min(1, v))}%"></i></div>`).join("");
    const btn = $("g-action");
    const cup = car.cup && CUPS.find(c => c.id === car.cup), far = car.world && !worldOpen(S, car.world) && !owned, w = far && WORLDS.find(x => x.id === car.world);
    btn.className = "big-btn " + (driving ? "" : owned ? "go" : !cup && !far && S.coins >= car.price ? "gold" : "");
    btn.textContent = driving ? "✔ Driving" : owned ? "Drive it!" : cup ? `🏆 Win the ${cup.name}` : far ? `${w.icon} Reach the ${w.name}` : car.school ? "🚦 Driver School" : `🪙 ${car.price}`;
    document.querySelectorAll("[data-gtab]").forEach(b => b.classList.toggle("on", b.dataset.gtab === tab));
    $("g-ups").hidden = tab !== "up"; $("g-paint").hidden = tab !== "paint";
    if (tab === "up") renderUps(car, owned); else renderPaint(car, owned);
  }

  function renderUps(car, owned) {
    const ups = upsOf(car.id);
    $("g-ups").innerHTML = `<div class="g-note ${owned ? "mine" : ""}">${owned ? "Upgrades for " + car.name : "Buy " + car.name + " to upgrade it!"}</div>` + UPGRADES.map(u => {
      const lvl = ups[u.id], max = lvl >= UPGRADE_MAX, cost = max ? 0 : upgradeCost(car.id, lvl, S.research.pitCrew || 0);
      return `<div class="up-card" data-up="${u.id}"><div class="up-icon">${u.icon}</div><b>${u.name}</b><small>${u.desc}</small>
        <div class="pips">${Array.from({ length: UPGRADE_MAX }, (_, i) => `<i class="${i < lvl ? "on" : ""}"></i>`).join("")}</div>
        <button class="up-buy ${max ? "max" : owned && S.coins >= cost ? "" : "poor"}" data-buy="${u.id}">${max ? "MAX!" : owned ? "🪙 " + cost : "🔒 " + cost}</button></div>`;
    }).join("");
  }

  function renderPaint(car, owned) {
    const look = S.look[car.id] || {}, cur = look.paint || "stock", curS = look.sticker || "none";
    const swatch = p => p.rainbow ? "conic-gradient(#ff3d3d,#ff9d00,#ffe600,#3ddc5a,#2fa8ff,#8a3cff,#ff3d3d)" : (p.color || car.body);
    const label = (has, price) => has ? "" : `<small class="${S.coins >= price ? "" : "poor"}">🪙${price}</small>`;
    $("g-paint").innerHTML = (owned ? "" : `<div class="g-note">Buy ${car.name} first to paint it!</div>`) +
      `<div class="sw-title">🎨 Paint</div><div class="swatches">` +
      PAINTS.map(p => { const has = S.paints.includes(p.id), lab = p.lab && !S.research[p.lab]; return `<button class="sw ${cur === p.id ? "on" : ""} ${has ? "" : "locked"} ${lab ? "lablock" : ""}" data-paint="${p.id}" title="${p.name}"><i style="background:${swatch(p)}">${lab ? "🔬" : ""}</i>${lab ? "<small>Lab</small>" : label(has, p.price)}</button>`; }).join("") +
      `</div><div class="sw-title">✨ Stickers</div><div class="swatches">` +
      STICKERS.map(k => { const has = S.stickers.includes(k.id); return `<button class="sw st ${curS === k.id ? "on" : ""} ${has ? "" : "locked"}" data-sticker="${k.id}" title="${k.name}"><i>${k.icon}</i>${label(has, k.price)}</button>`; }).join("") +
      `</div>`;
  }

  function setLook(key, id) {
    const car = CARS[idx];
    S.look[car.id] = { ...(S.look[car.id] || {}), [key]: id }; save();
  }

  $("g-prev").onclick = () => { sfx("click"); idx = (idx + CARS.length - 1) % CARS.length; zoom = 1; render(); };
  $("g-next").onclick = () => { sfx("click"); idx = (idx + 1) % CARS.length; zoom = 1; render(); };
  document.querySelectorAll("[data-gtab]").forEach(b => b.onclick = () => { sfx("click"); tab = b.dataset.gtab; render(); });
  $("g-action").onclick = () => {
    const car = CARS[idx];
    if (S.car === car.id) { sfx("click"); return; }
    if (S.owned.includes(car.id)) { S.car = car.id; save(); sfx("click"); zoom = 1; render(); return; }
    if (car.price == null || (car.world && !worldOpen(S, car.world))) { sfx("nope"); return; }
    if (!spend(car.price)) return;
    S.owned.push(car.id); S.car = car.id; save();
    sfx("buy"); celebrate(); zoom = 1; render();
  };
  $("g-ups").addEventListener("click", e => {
    const b = e.target.closest("[data-buy]"); if (!b) return;
    const car = CARS[idx];
    if (!S.owned.includes(car.id)) { sfx("nope"); return; }
    const ups = upsOf(car.id), id = b.dataset.buy, lvl = ups[id];
    if (lvl >= UPGRADE_MAX) { sfx("click"); return; }
    if (!spend(upgradeCost(car.id, lvl, S.research.pitCrew || 0))) return;
    ups[id]++; save(); sfx("buy");
    render();
    $("g-ups").querySelector(`[data-up="${id}"]`)?.classList.add("flash");
    if (ups[id] === UPGRADE_MAX) celebrate();
  });
  $("g-paint").addEventListener("click", e => {
    const b = e.target.closest("[data-paint],[data-sticker]"); if (!b) return;
    const car = CARS[idx];
    if (!S.owned.includes(car.id)) { sfx("nope"); return; }
    const isPaint = !!b.dataset.paint, id = b.dataset.paint || b.dataset.sticker;
    const list = isPaint ? S.paints : S.stickers, item = (isPaint ? PAINTS : STICKERS).find(x => x.id === id);
    if (item.lab && !S.research[item.lab]) { sfx("nope"); return; }
    if (!list.includes(id)) {
      if (!spend(item.price)) return;
      list.push(id); sfx("buy"); celebrate();
    } else sfx("click");
    setLook(isPaint ? "paint" : "sticker", id); zoom = 1; render();
  });

  function draw(dt) {
    t += dt; zoom = Math.max(0, zoom - dt * 3);
    const W = cvs.width, H = cvs.height, car = CARS[idx];
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H * 0.88, 10, W / 2, H * 0.88, W * 0.5);
    g.addColorStop(0, "rgba(255,212,0,0.55)"); g.addColorStop(1, "rgba(255,212,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(W / 2, H * 0.88, W * 0.48, H * 0.14, 0, 0, 7); ctx.fill();
    const w = W * 0.62 * (1 + zoom * 0.08);
    drawCar(ctx, W / 2, H * 0.9 + Math.sin(t * 3) * 3, w, lookOf(car), { t, steer: Math.sin(t * 1.3) * 0.5, nitro: Math.sin(t * 0.8) > 0.6 });
    if (!S.owned.includes(car.id)) { ctx.font = `${Math.round(H * 0.16)}px system-ui`; ctx.textAlign = "right"; ctx.fillText("🔒", W - 8, H * 0.2); }
  }

  const affordable = () => CARS.some(c => c.price != null && !S.owned.includes(c.id) && S.coins >= c.price) || S.owned.some(id => UPGRADES.some(u => upsOf(id)[u.id] < UPGRADE_MAX && S.coins >= upgradeCost(id, upsOf(id)[u.id], S.research.pitCrew || 0)));
  return { open, render, draw, affordable };
}
