// Garage: browse and buy cars, buy upgrades. All prices are in coins earned by racing.
import { CARS, UPGRADES, UPGRADE_COST, UPGRADE_MAX } from "./data.js";
import { drawCar } from "./draw.js";
import { S, save } from "./save.js";

export function createGarage({ $, sfx, spend, celebrate }) {
  const cvs = $("g-car"), ctx = cvs.getContext("2d");
  let idx = 0, t = 0, zoom = 0;

  function open() { idx = Math.max(0, CARS.findIndex(c => c.id === S.car)); render(); }

  function stats(car) {
    const u = S.up;
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
    btn.className = "big-btn " + (driving ? "" : owned ? "go" : S.coins >= car.price ? "gold" : "");
    btn.textContent = driving ? "✔ Driving" : owned ? "Drive it!" : `🪙 ${car.price}`;
    $("g-ups").innerHTML = UPGRADES.map(u => {
      const lvl = S.up[u.id], max = lvl >= UPGRADE_MAX, cost = UPGRADE_COST[lvl];
      return `<div class="up-card" data-up="${u.id}"><div class="up-icon">${u.icon}</div><b>${u.name}</b><small>${u.desc}</small>
        <div class="pips">${Array.from({ length: UPGRADE_MAX }, (_, i) => `<i class="${i < lvl ? "on" : ""}"></i>`).join("")}</div>
        <button class="up-buy ${max ? "max" : S.coins >= cost ? "" : "poor"}" data-buy="${u.id}">${max ? "MAX!" : "🪙 " + cost}</button></div>`;
    }).join("");
  }

  $("g-prev").onclick = () => { sfx("click"); idx = (idx + CARS.length - 1) % CARS.length; zoom = 1; render(); };
  $("g-next").onclick = () => { sfx("click"); idx = (idx + 1) % CARS.length; zoom = 1; render(); };
  $("g-action").onclick = () => {
    const car = CARS[idx];
    if (S.car === car.id) { sfx("click"); return; }
    if (S.owned.includes(car.id)) { S.car = car.id; save(); sfx("click"); zoom = 1; render(); return; }
    if (!spend(car.price)) return;
    S.owned.push(car.id); S.car = car.id; save();
    sfx("buy"); celebrate(); zoom = 1; render();
  };
  $("g-ups").addEventListener("click", e => {
    const b = e.target.closest("[data-buy]"); if (!b) return;
    const id = b.dataset.buy, lvl = S.up[id];
    if (lvl >= UPGRADE_MAX) { sfx("click"); return; }
    if (!spend(UPGRADE_COST[lvl])) return;
    S.up[id]++; save(); sfx("buy");
    render();
    const card = $("g-ups").querySelector(`[data-up="${id}"]`); card?.classList.add("flash");
    if (S.up[id] === UPGRADE_MAX) celebrate();
  });

  function draw(dt) {
    t += dt; zoom = Math.max(0, zoom - dt * 3);
    const W = cvs.width, H = cvs.height, car = CARS[idx];
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H * 0.88, 10, W / 2, H * 0.88, W * 0.5);
    g.addColorStop(0, "rgba(255,212,0,0.55)"); g.addColorStop(1, "rgba(255,212,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(W / 2, H * 0.88, W * 0.48, H * 0.14, 0, 0, 7); ctx.fill();
    const w = W * 0.62 * (1 + zoom * 0.08);
    drawCar(ctx, W / 2, H * 0.9 + Math.sin(t * 3) * 3, w, car, { t, steer: Math.sin(t * 1.3) * 0.5, nitro: Math.sin(t * 0.8) > 0.6 });
    if (!S.owned.includes(car.id)) { ctx.font = `${Math.round(H * 0.16)}px system-ui`; ctx.textAlign = "right"; ctx.fillText("🔒", W - 8, H * 0.2); }
  }

  const affordable = () => CARS.some(c => !S.owned.includes(c.id) && S.coins >= c.price) || UPGRADES.some(u => S.up[u.id] < UPGRADE_MAX && S.coins >= UPGRADE_COST[S.up[u.id]]);
  return { open, render, draw, affordable };
}
