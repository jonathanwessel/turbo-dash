// Confetti and coin bursts on a transparent canvas above everything (it never takes taps).
const cvs = document.getElementById("fx"), ctx = cvs.getContext("2d");
let parts = [], running = false, last = 0;
const COLORS = ["#ffd400", "#ff3fa4", "#3cf2ff", "#5be36a", "#ff7a00", "#ffffff", "#7a2cff"];

function size() { const k = Math.min(devicePixelRatio || 1, 2); cvs.width = innerWidth * k; cvs.height = innerHeight * k; }
addEventListener("resize", size); size();

export function confetti(n = 120) {
  const W = cvs.width, H = cvs.height;
  for (let i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: -Math.random() * H * 0.3, vx: (Math.random() - 0.5) * W * 0.3, vy: H * (0.2 + Math.random() * 0.4),
    r: H * (0.008 + Math.random() * 0.01), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12, c: COLORS[i % COLORS.length], life: 3 + Math.random(), coin: false });
  go();
}
export function coinBurst(x, y, n = 18) {
  const k = cvs.width / innerWidth, H = cvs.height;
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = H * (0.3 + Math.random() * 0.5);
    parts.push({ x: x * k, y: y * k, vx: Math.cos(a) * s, vy: Math.sin(a) * s - H * 0.4, r: H * 0.018, rot: 0, vr: 8, c: "#ffd400", life: 1.2, coin: true }); }
  go();
}
function go() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); } }
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const H = cvs.height;
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  for (const p of parts) {
    p.life -= dt; p.vy += H * (p.coin ? 1.6 : 0.25) * dt; p.vx *= 0.99; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, p.life * 2);
    if (p.coin) { ctx.fillStyle = "#c98a00"; ctx.beginPath(); ctx.ellipse(0, 0, p.r * Math.abs(Math.cos(p.rot)) + 1, p.r, 0, 0, 7); ctx.fill(); ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(0, 0, p.r * 0.8 * Math.abs(Math.cos(p.rot)) + 0.5, p.r * 0.8, 0, 0, 7); ctx.fill(); }
    else { ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r); }
    ctx.restore();
  }
  parts = parts.filter(p => p.life > 0 && p.y < H * 1.1);
  if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, cvs.width, cvs.height); }
}
