// 🧸 Toy Track World: the Next Gen look (graphics ladder, the big leap). Real 3D with three.js: a giant sunny
// playroom, glossy plastic track pieces with walls on little stilts, loop-the-loops, booster stations with
// spinning wheels, shiny toy cars, soft shadows and reflections. Loaded only when a toy race starts.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { toyPoint, DS, HW, WALL_H, startArch, startLine } from "./track.js";
import { drawEmojiText } from "../emoji.js";

const V = (a = 0, b = 0, c = 0) => new THREE.Vector3(a, b, c);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function canvasTex(w, h, paint, repeat) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; paint(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
  return t;
}
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.45, ...o });
const plastic = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08, ...o });

/* fewer draw calls (v1.10): parts that never move on their own are merged into one mesh per material (and per
   area of the room, so things far off screen still get skipped). Returns old material -> the material now used. */
const matKey = m => [m.type, m.color?.getHexString(), m.roughness, m.metalness, m.clearcoat, m.map?.uuid, m.transparent, m.opacity, m.emissive?.getHexString(), m.emissiveIntensity, m.side, m.vertexColors, m.depthWrite].join("|");
export function mergeStatic(root, skip = new Set(), cell = Infinity) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), groups = new Map(), used = new Map(), wp = V();
  const walk = o => {
    for (const c of [...o.children]) {
      if (skip.has(c)) continue;
      if (c.isMesh && !c.isInstancedMesh && !Array.isArray(c.material) && c.visible && !c.children.length) {
        c.getWorldPosition(wp);
        const k = matKey(c.material) + (c.castShadow ? "|c" : "") + (c.receiveShadow ? "|r" : "") + (cell < Infinity ? "|" + Math.floor(wp.x / cell) + "," + Math.floor(wp.z / cell) : "");
        if (!groups.has(k)) groups.set(k, []); groups.get(k).push(c);
      } else walk(c);
    }
  };
  walk(root);
  for (const list of groups.values()) {
    const rep = list[0].material;
    for (const m of list) used.set(m.material, rep);
    if (list.length < 2) continue;
    const indexed = list.every(m => m.geometry.index);
    const geos = list.map(m => {
      let g = m.geometry.clone(); if (!indexed && g.index) g = g.toNonIndexed();
      for (const a of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(a)) g.deleteAttribute(a);
      g.morphAttributes = {}; g.clearGroups();
      return g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
    });
    if (!geos.every(g => !!g.attributes.uv === !!geos[0].attributes.uv)) continue;
    const geo = mergeGeometries(geos, false); if (!geo) continue;
    const mesh = new THREE.Mesh(geo, rep); mesh.castShadow = list[0].castShadow; mesh.receiveShadow = list[0].receiveShadow;
    for (const m of list) m.removeFromParent();
    root.add(mesh);
  }
  return used;
}

const ROOM_CELL = 250;   // the room is merged in squares this big (world units), so far-off toys can still be skipped
let blobT = null;
const blobTex = () => blobT ||= canvasTex(64, 64, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, "rgba(0,0,0,0.6)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, w, w); });
/* the graphics chip's name (to spot PowerVR, and to show in Settings), from a tiny throwaway context. Asked once per
   session (v1.11): a rebuilt view after a lost context doesn't make another throwaway context. */
let gpuSeen = null;
function gpuName() { return gpuSeen ??= askGpu(); }
function askGpu() {
  try {
    const c = document.createElement("canvas"), gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info"), name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch (e) { return ""; }
}
/* ---------- a toy car, front facing -z ---------- */
function carMesh(def) {
  const g = new THREE.Group(), body = new THREE.Group(), type = def.type, monster = type === "monster" || type === "rover";
  g.add(body);
  const paint = plastic(def.body, { metalness: def.shiny ? 0.55 : 0.05 }), accent = std(def.accent, { roughness: 0.35 });
  const dark = std("#17171d", { roughness: 0.7 }), glass = plastic("#1d3866", { roughness: 0.05, metalness: 0.3 }), silver = std("#d8dde6", { metalness: 0.8, roughness: 0.25 });
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; body.add(m); return m; };
  const wr = monster ? 0.56 : 0.37, ride = monster ? 0.62 : 0.3;
  add(new RoundedBoxGeometry(1.62, 0.56, 3.0, 3, 0.2), paint, 0, ride + 0.32, 0);
  add(new RoundedBoxGeometry(1.24, 0.46, 1.45, 3, 0.16), glass, 0, ride + 0.78, 0.18);
  if (["racer", "sport", "galaxy", "skis", "patrol"].includes(type)) add(new THREE.BoxGeometry(0.32, 0.02, 3.02), accent, 0, ride + 0.61, 0);
  if (["racer", "sport", "galaxy"].includes(type)) {
    add(new THREE.BoxGeometry(0.08, 0.32, 0.12), dark, -0.55, ride + 0.75, 1.35); add(new THREE.BoxGeometry(0.08, 0.32, 0.12), dark, 0.55, ride + 0.75, 1.35);
    add(new RoundedBoxGeometry(1.7, 0.08, 0.42, 2, 0.03), accent, 0, ride + 0.93, 1.38);
  }
  // the four wheels: one instanced tire mesh and one instanced hub mesh (2 draw calls, not 12), spun every frame
  const turn = new THREE.Matrix4().makeRotationZ(Math.PI / 2);
  const tire = new THREE.CylinderGeometry(wr, wr, monster ? 0.5 : 0.34, 18).applyMatrix4(turn);
  const hub = mergeGeometries([new THREE.CylinderGeometry(wr * 0.5, wr * 0.5, monster ? 0.52 : 0.36, 12).applyMatrix4(turn), new THREE.BoxGeometry(0.38, wr * 1.1, 0.12)], false);
  const wheelAt = [[-0.86, -1.0], [0.86, -1.0], [-0.86, 1.0], [0.86, 1.0]].map(([x, z]) => V(x * (monster ? 1.08 : 1), wr, z));
  const tires = new THREE.InstancedMesh(tire, dark, 4), hubs = new THREE.InstancedMesh(hub, silver, 4);
  tires.castShadow = true; g.add(tires, hubs);
  const wheels = { tires, hubs, at: wheelAt, ang: 0 };
  spinWheels(wheels, 0);
  for (const x of [-0.55, 0.55]) add(new THREE.BoxGeometry(0.36, 0.14, 0.05), std("#ff2a2a", { emissive: "#ff1010", emissiveIntensity: 0.8 }), x, ride + 0.42, 1.51);
  const extra = {};
  if (type === "rocket") for (const x of [-0.95, 0.95]) { add(new THREE.CylinderGeometry(0.2, 0.2, 1.8, 12), silver, x, ride + 0.4, 0.3, Math.PI / 2); add(new THREE.ConeGeometry(0.2, 0.4, 12), std("#e8262b"), x, ride + 0.4, -0.8, -Math.PI / 2); }
  if (type === "shark") add(new THREE.ConeGeometry(0.35, 0.8, 4), paint, 0, ride + 1.15, 0.8, 0, Math.PI / 4).scale.set(0.3, 1, 1);
  if (type === "sub") { for (const x of [-0.95, 0.95]) add(new THREE.BoxGeometry(0.4, 0.06, 0.8), accent, x, ride + 0.4, 0.6); extra.prop = add(new THREE.BoxGeometry(0.9, 0.12, 0.05), silver, 0, ride + 0.32, 1.6); }
  if (type === "skis") { add(new THREE.BoxGeometry(1.0, 0.05, 0.08), dark, 0, ride + 1.03, 0.2); for (const [x, c] of [[-0.25, def.accent], [0.25, "#ff3fa4"]]) add(new RoundedBoxGeometry(0.14, 0.04, 2.0, 2, 0.02), std(c), x, ride + 1.07, 0.2); }
  if (type === "fire") { for (const x of [-0.4, 0.4]) add(new THREE.BoxGeometry(0.06, 0.06, 2.4), silver, x, ride + 1.05, 0.1); for (let k = 0; k < 6; k++) add(new THREE.BoxGeometry(0.8, 0.05, 0.05), silver, 0, ride + 1.05, -1 + k * 0.4); }
  if (type === "patrol") { extra.red = add(new THREE.BoxGeometry(0.4, 0.14, 0.3), std("#ff2a2a", { emissive: "#ff0000", emissiveIntensity: 1 }), -0.22, ride + 1.07, 0.18); extra.blue = add(new THREE.BoxGeometry(0.4, 0.14, 0.3), std("#2a6cff", { emissive: "#0040ff", emissiveIntensity: 1 }), 0.22, ride + 1.07, 0.18); }
  if (type === "rover") { add(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), silver, 0.5, ride + 1.2, 0.5); add(new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), silver, 0.5, ride + 1.45, 0.5, Math.PI, 0, 0); }
  if (type === "galaxy") for (const [x, z] of [[-0.5, -0.8], [0.4, 0.9], [-0.3, 1.1], [0.55, -0.4]]) add(new THREE.SphereGeometry(0.06, 8, 6), std(def.accent, { emissive: def.accent, emissiveIntensity: 1 }), x, ride + 0.61, z);
  extra.flames = [-0.42, 0.42].map(x => { const m = add(new THREE.ConeGeometry(0.17, 0.9, 10), new THREE.MeshBasicMaterial({ color: "#ffb02e", transparent: true, opacity: 0.9 }), x, ride + 0.3, 1.95, Math.PI / 2); m.castShadow = false; m.visible = false; return m; });
  // a soft round shadow right under the toy (grounds it on the plastic track)
  const blob = new THREE.Mesh(new THREE.CircleGeometry(1.7, 24), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.55 }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.03; blob.scale.set(1, 1.6, 1); g.add(blob);
  // every part that doesn't move on its own: one mesh per material
  const used = mergeStatic(body, new Set([...extra.flames, extra.prop, extra.red, extra.blue].filter(Boolean)));
  g.userData = { wheels, wr, extra, paint: used.get(paint) || paint, rainbow: !!def.rainbow, body, spring: { y: 0, v: 0, pitch: 0, pv: 0 }, blob };
  return g;
}
const wm = new THREE.Matrix4(), wr4 = new THREE.Matrix4();
function spinWheels(w, ang) {
  w.ang = ang; wr4.makeRotationX(ang);
  w.at.forEach((p, k) => { wm.makeTranslation(p.x, p.y, p.z).multiply(wr4); w.tires.setMatrixAt(k, wm); w.hubs.setMatrixAt(k, wm); });
  w.tires.instanceMatrix.needsUpdate = w.hubs.instanceMatrix.needsUpdate = true;
}

/* ---------- the playroom: a wooden floor, a play rug, walls, a big window and giant toys ---------- */
function playroom(scene, T) {
  const room = new THREE.Group();
  const floorTex = canvasTex(512, 512, (c, w, h) => {
    for (let i = 0; i < 8; i++) { c.fillStyle = ["#d9a066", "#cf9459", "#e0aa70", "#c98d52"][i % 4]; c.fillRect(0, i * h / 8, w, h / 8); c.fillStyle = "rgba(90,50,20,.25)"; c.fillRect(0, i * h / 8, w, 3); c.fillRect(((i * 197) % w), i * h / 8, 3, h / 8); }
  }, 24);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), std("#ffffff", { map: floorTex, roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; room.add(floor);
  // a round play rug under the track, with rings of color
  const rug = new THREE.Mesh(new THREE.CircleGeometry(300, 64), std("#ffffff", { map: canvasTex(512, 512, (c, w) => {
    const cols = ["#4fb6ff", "#ffd400", "#ff6b9d", "#5be36a", "#b46cff", "#ff8a00"];
    for (let i = 0; i < 12; i++) { c.fillStyle = cols[i % cols.length]; c.beginPath(); c.arc(w / 2, w / 2, w / 2 * (1 - i / 12), 0, 7); c.fill(); }
  }), roughness: 0.95 }));
  rug.rotation.x = -Math.PI / 2; rug.position.y = 0.15;   // a little higher, so it never flickers into the floor far away rug.receiveShadow = true; room.add(rug);
  // walls with star wallpaper, a baseboard and a big bright window
  const paper = canvasTex(256, 256, (c, w, h) => { c.fillStyle = "#bfe4ff"; c.fillRect(0, 0, w, h); c.fillStyle = "#e9f6ff"; for (let i = 0; i < 9; i++) { const x = (i * 83) % w, y = (i * 137) % h; c.font = "40px sans-serif"; c.fillText("★", x, y); } }, 1);
  paper.repeat.set(10, 3);
  const wallMat = std("#ffffff", { map: paper, roughness: 0.9 });
  for (const [x, z, ry] of [[0, -700, 0], [0, 700, Math.PI], [-700, 0, Math.PI / 2], [700, 0, -Math.PI / 2]]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(1400, 420), wallMat); wall.position.set(x, 210, z); wall.rotation.y = ry; wall.receiveShadow = true; room.add(wall);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1400, 18, 4), std("#ffffff")); base.position.set(x, 9, z); base.rotation.y = ry; room.add(base);
  }
  const win = new THREE.Mesh(new THREE.PlaneGeometry(320, 200), new THREE.MeshBasicMaterial({ color: "#fffbe6" })); win.position.set(-150, 220, -698); room.add(win);
  for (const [w, h, x, y] of [[340, 14, -150, 320], [340, 14, -150, 120], [14, 214, -320, 220], [14, 214, 20, 220], [10, 200, -150, 220], [340, 8, -150, 220]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 6), std("#ffffff")); f.position.set(x, y, -696); room.add(f); }
  // giant toys, scattered where the track isn't
  const r = rng(T.track.seed * 31), near = (x, z, pad) => { for (let i = 0; i < T.N; i += 20) if (Math.hypot(T.px[i] - x, T.pz[i] - z) < pad) return true; return false; };
  const spot = pad => { for (let k = 0; k < 60; k++) { const x = (r() - 0.5) * 900, z = (r() - 0.5) * 700; if (!near(x, z, pad)) return [x, z]; } return null; };
  const letters = "ABCTURBO123";
  for (let k = 0; k < 14; k++) {
    const s = 10 + r() * 12, p = spot(s + 14); if (!p) continue;
    const col = ["#ff4f4f", "#4fb6ff", "#ffd400", "#5be36a", "#ff8ad8", "#b46cff"][k % 6], ch = letters[k % letters.length];
    const tex = canvasTex(128, 128, (c, w) => { c.fillStyle = col; c.fillRect(0, 0, w, w); c.strokeStyle = "#fff"; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, w - 16); c.fillStyle = "#fff"; c.font = "900 84px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(ch, w / 2, w / 2 + 6); });
    const b = new THREE.Mesh(new RoundedBoxGeometry(s, s, s, 2, s * 0.06), std("#ffffff", { map: tex, roughness: 0.5 }));
    b.position.set(p[0], s / 2, p[1]); b.rotation.y = r() * Math.PI; b.castShadow = b.receiveShadow = true; room.add(b);
    if (k % 3 === 0) { const b2 = b.clone(); b2.position.y = s * 1.5; b2.rotation.y += 0.5; room.add(b2); }
  }
  for (let k = 0; k < 8; k++) {   // crayons lying on the floor
    const p = spot(30); if (!p) continue;
    const col = ["#e8262b", "#1f6fff", "#2fbf3a", "#ffd400", "#ff8a00", "#8a3cff"][k % 6], cr = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 34, 16), std(col, { roughness: 0.6 })); cr.add(body);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(2.2, 6, 16), std(col)); tip.position.y = 20; cr.add(tip);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 8, 16), std("#222")); band.position.y = -8; cr.add(band);
    cr.rotation.z = Math.PI / 2; cr.rotation.y = r() * Math.PI; cr.position.set(p[0], 2.2, p[1]); cr.traverse(m => { m.castShadow = true; }); room.add(cr);
  }
  for (let k = 0; k < 3; k++) {   // bouncy balls with stripes
    const p = spot(40); if (!p) continue;
    const tex = canvasTex(256, 128, (c, w, h) => { const cols = ["#ff4f4f", "#ffd400", "#4fb6ff", "#5be36a"]; for (let i = 0; i < 8; i++) { c.fillStyle = cols[(i + k) % 4]; c.fillRect(i * w / 8, 0, w / 8 + 1, h); } });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(16, 32, 20), plastic("#ffffff", { map: tex })); ball.position.set(p[0], 16, p[1]); ball.castShadow = true; room.add(ball);
  }
  { // a teddy bear sitting by the wall
    const p = spot(60) || [300, 250], bear = new THREE.Group(), fur = std("#b8793f", { roughness: 0.95 }), light = std("#e8c08a", { roughness: 0.95 });
    const s = (rad, x, y, z, m = fur) => { const o = new THREE.Mesh(new THREE.SphereGeometry(rad, 24, 16), m); o.position.set(x, y, z); o.castShadow = true; bear.add(o); return o; };
    s(26, 0, 26, 0); s(10, 0, 22, -20, light); s(19, 0, 62, 0); s(8, -15, 78, 0); s(8, 15, 78, 0); s(7, 0, 58, -16, light);
    s(3, -7, 66, -17, std("#222")); s(3, 7, 66, -17, std("#222")); s(3.2, 0, 59, -22, std("#222"));
    s(11, -22, 40, -8); s(11, 22, 40, -8); s(13, -16, 10, -18); s(13, 16, 10, -18);
    const bow = new THREE.Mesh(new THREE.TorusGeometry(5, 2.5, 8, 16), std("#e8262b")); bow.position.set(0, 46, -16); bear.add(bow);
    bear.position.set(p[0], 0, p[1]); bear.lookAt(0, 0, 0); room.add(bear);
  }
  for (let k = 0; k < 5; k++) {   // towers of building bricks with studs on top
    const p = spot(30); if (!p) continue;
    const col = ["#e8262b", "#ffd400", "#1f6fff", "#2fbf3a", "#ff8a00"][k];
    const n = 2 + Math.floor(r() * 4);
    for (let j = 0; j < n; j++) {
      const brick = new THREE.Mesh(new THREE.BoxGeometry(16, 9.6, 8), plastic(["#e8262b", "#ffd400", "#1f6fff", "#2fbf3a", "#ff8a00"][(k + j) % 5]));
      brick.position.set(p[0] + (j % 2) * 4, 4.8 + j * 9.6, p[1]); brick.castShadow = brick.receiveShadow = true; room.add(brick);
      if (j === n - 1) for (let a = 0; a < 4; a++) for (let b = 0; b < 2; b++) { const stud = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 1.6, 12), brick.material); stud.position.set(brick.position.x - 6 + a * 4, brick.position.y + 5.6, p[1] - 2 + b * 4); room.add(stud); }
    }
    void col;
  }
  mergeStatic(room, new Set(), ROOM_CELL);
  scene.add(room);
  return room;
}

/* ---------- the track: plastic pieces with walls, stilts, a start arch, booster stations ---------- */
function trackMeshes(T, pal) {
  const grp = new THREE.Group(), N = T.N;
  // cross-section (right, up) of a track piece, going around: outer wall, inner wall, road, inner wall, outer wall, bottom
  const O = HW + 0.35;
  const prof = [[-O, -0.35], [-O, WALL_H], [-HW, WALL_H], [-HW, 0], [HW, 0], [HW, WALL_H], [O, WALL_H], [O, -0.35], [-O, -0.35]];
  const pos = [], col = [], c1 = new THREE.Color(pal[0]), c2 = new THREE.Color(pal[1]), joint = new THREE.Color(pal[0]).multiplyScalar(0.72), edge = new THREE.Color("#ffffff");
  const P = (i, x, h) => toyPoint(T, i * DS, x, h);
  const PIECE = 24;
  for (let e = 0; e < prof.length - 1; e++) {
    const [ax, ah] = prof[e], [bx, bh] = prof[e + 1];
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      if ((T.flag[i] & 2) || (T.flag[j] & 2)) continue;   // no track over a jump's gap
      const a0 = P(i, ax, ah), b0 = P(i, bx, bh), a1 = P(i + 1, ax, ah), b1 = P(i + 1, bx, bh);
      pos.push(...a0, ...b0, ...a1, ...b0, ...b1, ...a1);
      const piece = Math.floor(i * DS / PIECE), isJoint = (i * DS) % PIECE < DS * 1.2;
      const c = e === 1 || e === 5 ? edge : isJoint ? joint : piece % 2 ? c2 : c1;
      for (let k = 0; k < 6; k++) col.push(c.r, c.g, c.b);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  // the road only receives shadows: casting them redrew its 30,000+ triangles in the shadow pass every frame (v1.10).
  // Shared corners are merged (an indexed mesh) and the plastic is a plain shiny material, not a clear-coated one.
  // smooth shading along each piece (v1.11): shared corners of the same colour are merged, then normals are averaged
  geo.deleteAttribute("normal"); const roadGeo = mergeVertices(geo); roadGeo.computeVertexNormals();
  const road = new THREE.Mesh(roadGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.05, side: THREE.DoubleSide }));
  road.castShadow = false; road.receiveShadow = true; grp.add(road);
  // stilts down to the floor (not under loops or gaps)
  const stilt = new THREE.CylinderGeometry(0.45, 0.6, 1, 10), stMat = plastic(pal[1]), list = [];
  for (let i = 0; i < N; i += Math.round(10 / DS)) {
    if (T.flag[i] & 3) continue;
    for (const x of [-HW + 0.6, HW - 0.6]) { const p = P(i, x, -0.35); if (p[1] > 0.2) list.push(p); }
  }
  const st = new THREE.InstancedMesh(stilt, stMat, list.length), m4 = new THREE.Matrix4();
  list.forEach((p, k) => { m4.compose(V(p[0], p[1] / 2, p[2]), new THREE.Quaternion(), V(1, p[1], 1)); st.setMatrixAt(k, m4); });
  st.castShadow = false; grp.add(st);
  // loop stands: two posts beside each loop, up to its middle
  for (const lp of T.loops) {
    const mid = (lp.s0 + lp.s1) / 2, c = toyPoint(T, lp.s0, 0, 0), top = toyPoint(T, mid, 0, 0);
    for (const s of [lp.s0 + 2, lp.s1 - 2]) {
      const b = toyPoint(T, s, s < mid ? -HW - 1.4 : HW + 1.4, 0), post = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, top[1] - 3, 10), stMat);
      post.position.set(b[0], (top[1] - 3) / 2, b[2]); post.castShadow = true; grp.add(post);
    }
    void c;
  }
  // start / finish arch with a checkered banner
  const chk = canvasTex(256, 64, (c, w, h) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? "#111" : "#fff"; c.fillRect(i * w / 16, j * h / 4, w / 16, h / 4); } });
  const fwd = V(T.fx[0], T.fy[0], T.fz[0]), arch = new THREE.Group();
  // the poles stand on the road's two edges and reach the same height, so the banner hangs level on a banked start
  const A = startArch(T);
  for (const p of [A.L, A.R]) { const h = A.top - p[1], pole = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, h, 12), plastic("#e8262b")); pole.position.set(p[0], p[1] + h / 2, p[2]); pole.castShadow = true; arch.add(pole); }
  const c0 = A.mid, banner = new THREE.Mesh(new THREE.BoxGeometry(A.width, 1.6, 0.3), [std("#ffd400"), std("#ffd400"), std("#ffd400"), std("#ffd400"), std("#fff", { map: chk }), std("#fff", { map: chk })]);
  banner.position.set(...c0); banner.lookAt(c0[0] + fwd.x, c0[1], c0[2] + fwd.z); arch.add(banner); grp.add(arch);
  // the start line lies on the road surface itself (a flat plane floated half in, half out of a banked road)
  const SL = startLine(T), lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(SL.flat(), 3)); lineGeo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2));
  lineGeo.setIndex([0, 2, 1, 1, 2, 3]); lineGeo.computeVertexNormals();
  const line = new THREE.Mesh(lineGeo, std("#fff", { map: canvasTex(128, 16, (c, w, h) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? "#111" : "#fff"; c.fillRect(i * w / 16, j * h / 2, w / 16, h / 2); } }) }));
  line.material.side = THREE.DoubleSide; grp.add(line);
  // booster stations: a yellow gateway with two big spinning tires that fling cars forward, and glowing arrows
  const wheels = [], arrows = [];
  for (const b of T.boosts) {
    const s = (b.s0 + b.s1) / 2, i = Math.floor(s / DS) % N, f = V(T.fx[i], T.fy[i], T.fz[i]), u = V(T.ux[i], T.uy[i], T.uz[i]), rt = V(T.rx[i], T.ry[i], T.rz[i]);
    const basis = new THREE.Matrix4().makeBasis(rt, u, f.clone().negate()), q = new THREE.Quaternion().setFromRotationMatrix(basis);
    const station = new THREE.Group(); station.position.set(...toyPoint(T, s, 0, 0)); station.quaternion.copy(q);
    const yellow = plastic("#ffd400"), red = plastic("#e8262b");
    for (const x of [-HW - 1.6, HW + 1.6]) {
      const tower = new THREE.Mesh(new RoundedBoxGeometry(2.4, 4.2, 5, 2, 0.3), yellow); tower.position.set(x, 1.6, 0); tower.castShadow = true; station.add(tower);
      const wheel = new THREE.Group(); wheel.position.set(x * 0.86, 1.1, 0);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.9, 20), std("#1b1b22", { roughness: 0.8 })); wheel.add(tire);
      const hubm = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.95, 12), red); wheel.add(hubm);
      for (let k = 0; k < 3; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.97, 0.25), std("#c9ced8", { metalness: 0.7, roughness: 0.3 })); sp.rotation.y = k * Math.PI / 3; wheel.add(sp); }
      mergeStatic(wheel); station.add(wheel); wheels.push(wheel);
    }
    const roof = new THREE.Mesh(new RoundedBoxGeometry(2 * HW + 5.6, 1.2, 5, 2, 0.3), red); roof.position.set(0, 4.1, 0); roof.castShadow = true; station.add(roof);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.1), new THREE.MeshBasicMaterial({ map: canvasTex(256, 56, (c, w, h) => { c.fillStyle = "#ffd400"; c.fillRect(0, 0, w, h); c.fillStyle = "#e8262b"; c.font = "900 40px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; drawEmojiText(c, "⚡ BOOST ⚡", w / 2, h / 2 + 2); }) }));
    sign.position.set(0, 4.1, 2.52); sign.rotation.y = Math.PI; station.add(sign);
    const sign2 = sign.clone(); sign2.position.z = -2.52; sign2.rotation.y = 0; station.add(sign2);
    grp.add(station);
    for (let k = 0; k < 3; k++) {
      const ar = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.2, 3), new THREE.MeshBasicMaterial({ color: "#3cf2ff", transparent: true, opacity: 0.85 }));
      const p = toyPoint(T, b.s0 - 8 + k * 3.4, 0, 0.05), ai = Math.floor((b.s0 - 8 + k * 3.4) / DS) % N;
      ar.position.set(...p); ar.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(T.rx[ai], T.ry[ai], T.rz[ai]), V(T.fx[ai], T.fy[ai], T.fz[ai]), V(T.ux[ai], T.uy[ai], T.uz[ai]).negate()));
      ar.scale.set(1, 1, 0.05); grp.add(ar); arrows.push(ar);
    }
  }
  mergeStatic(grp, new Set([road, st, ...wheels, ...arrows]), ROOM_CELL);
  return { grp, wheels, arrows };
}

export class ToyView {
  /* opts.light: the tablet look. No edge smoothing, simple shadows, plain (not clear-coated) plastic, no reflection
     map and 75% resolution: far less work and memory for a tablet's graphics chip, so its 3D doesn't give up. */
  /* opts.tier: "full" (shiny), "light" (tablets: no edge smoothing, simple shadows, plain plastic, no reflections,
     75% resolution) or "min" (no shadows at all, flat-lit plastic, 65% resolution). PowerVR graphics chips (Pixel 10)
     always get "min": their drivers give up on big shadow and plastic shaders. */
  constructor(glCanvas, overlay, opts = {}) {
    this.gl = glCanvas; this.ov = overlay; this.ctx = overlay.getContext("2d");
    this.gpu = gpuName();
    let tier = opts.tier || (opts.light ? "light" : "full");
    if (/PowerVR|Imagination/i.test(this.gpu)) tier = "min";
    this.tier = tier; this.light = tier !== "full"; this.min = tier === "min";
    const R = this.renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: !this.light, powerPreference: this.min ? "default" : "high-performance" });
    R.shadowMap.enabled = !this.min; R.shadowMap.type = this.light ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap; R.toneMapping = this.min ? THREE.NoToneMapping : THREE.NeutralToneMapping; R.toneMappingExposure = 1.0;
    this.scene = new THREE.Scene(); this.scene.background = new THREE.Color("#bfe4ff"); this.scene.fog = new THREE.Fog("#bfe4ff", 260, 900);   // the same colour as the sky behind it (v1.11)
    // Shiny reflections need a room "environment map", which needs half-float render targets. Many tablets can't
    // render to those, and a broken map blows the whole picture out to white. No support: no map (safe look).
    this.diag = { why: "" };
    R.debug.onShaderError = (gl, program, vs, fs) => { this.diag.why = this.diag.why || "shader"; this.badShader = true; };
    const gl = R.getContext(), halfOk = R.capabilities.isWebGL2 ? !!(gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float")) : !!gl.getExtension("EXT_color_buffer_half_float");
    if (halfOk && !this.light) { const pm = new THREE.PMREMGenerator(R); this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); }
    else this.diag.why = "no half-float targets";
    this.scene.environmentIntensity = 0.8;
    this.checkT = 0; this.safe = this.light; this.quietSafe = this.light;   // the light look starts plain (no "Simple 3D" note)
    glCanvas.addEventListener("webglcontextlost", e => { e.preventDefault(); this.diag.why = "context lost"; this.lost = true; this.lostHidden = document.hidden; });
    glCanvas.addEventListener("webglcontextrestored", () => { this.lost = false; });
    this.camera = new THREE.PerspectiveCamera(62, 16 / 9, 0.3, 2000);
    this.scene.add(new THREE.HemisphereLight("#fff6e0", "#c08a55", this.light ? 1.6 : 1.1));   // brighter without reflections
    const sun = this.sun = new THREE.DirectionalLight("#fff1d0", 2.4);
    sun.castShadow = !this.min; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 400 }); sun.shadow.bias = -0.0005;
    this.scene.add(sun, sun.target);
    const rim = new THREE.DirectionalLight("#d6ecff", 0.9); rim.position.set(80, 60, 140); this.scene.add(rim);   // a cool rim light from behind
    this.coinGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.18, 20); this.coinMat = std("#ffc21a", { metalness: 0.85, roughness: 0.25, emissive: "#7a5200", emissiveIntensity: 0.35 });
    this.boxTex = canvasTex(128, 128, (c, w) => { c.fillStyle = "#fff"; c.fillRect(0, 0, w, w); c.fillStyle = "#222"; c.font = "900 96px sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("?", w / 2, w / 2 + 8); });
    this.trackId = null; this.cars = new Map(); this.camPos = V(); this.camUp = V(0, 1, 0); this.lastT = 0; this.sparks = [];
  }

  /* build (or reuse) everything for this race */
  reset(race) {
    const T = race.T;
    if (this.trackId !== T.track.id) {
      if (this.world) { this.scene.remove(this.world); this.world.traverse(m => { if (m.isInstancedMesh) m.dispose(); m.geometry?.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => { x?.map?.dispose(); x?.dispose?.(); }); }); }
      this.world = new THREE.Group(); this.scene.add(this.world);
      const pal = T.track.pal || ["#ff7a1a", "#ff9b45"];
      this.room = playroom(this.world, T);
      this.tm = trackMeshes(T, pal); this.world.add(this.tm.grp);
      this.coins = new THREE.InstancedMesh(this.coinGeo, this.coinMat, T.coins.length); this.coins.castShadow = true; this.world.add(this.coins);
      const nb = T.boxes.length * 3;
      this.boxes = new THREE.InstancedMesh(new RoundedBoxGeometry(1.6, 1.6, 1.6, 2, 0.25), plastic("#ffffff", { map: this.boxTex, transparent: true, opacity: 0.95 }), Math.max(1, nb));
      this.boxes.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, nb) * 3), 3); this.world.add(this.boxes);
      this.trackId = T.track.id;
    }
    // free the old cars (and the old shield) so GPU memory doesn't grow race after race
    const free = o => o.traverse(m => { if (m.isInstancedMesh) m.dispose(); m.geometry?.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => x?.dispose?.()); });
    for (const g of this.cars.values()) { this.scene.remove(g); free(g); }
    if (this.shield) { this.scene.remove(this.shield); free(this.shield); }
    this.cars = new Map();
    const make = (key, def, ghost) => { const g = carMesh(def); this.carShadows(g); if (ghost) g.traverse(m => { if (m.material) { m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0.4; m.castShadow = false; } }); this.scene.add(g); this.cars.set(key, g); return g; };
    make("p", race.player.def); race.rivals.forEach((c, k) => make("r" + k, c.def));
    if (race.trial && race.ghost) make("g", race.ghostDef, true);
    this.shield = new THREE.Mesh(new THREE.SphereGeometry(2.4, 24, 16), new THREE.MeshBasicMaterial({ color: "#3cf2ff", transparent: true, opacity: 0.18 })); this.scene.add(this.shield);
    this.snapCam = true;
    if (this.safe) { this.safe = false; this.goSafe(); }   // everything just built gets the safe look too
  }

  /* Right after the first frames, look at a few pixels: if the picture is blown out to plain white (or a shader
     failed to build on this tablet's graphics chip), switch to the safe look: no reflections, plainer materials. */
  watchdog(W, H) {
    if (this.safe || this.checkT > 40) return;
    this.checkT++;
    if (this.badShader) { this.goSafe(); return; }
    if (this.checkT !== 8 && this.checkT !== 40) return;
    const gl = this.renderer.getContext(), px = new Uint8Array(4);
    let white = 0, n = 0;
    for (const [u, v] of [[0.2, 0.3], [0.5, 0.3], [0.8, 0.3], [0.2, 0.6], [0.5, 0.6], [0.8, 0.6], [0.3, 0.85], [0.5, 0.85], [0.7, 0.85]]) {
      gl.readPixels(Math.floor(W * u), Math.floor(H * v), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); n++;
      if (px[0] > 180 && px[1] > 215 && px[2] > 235) white++;   // white, or just the pale sky / fog: nothing drawn there
    }
    this.diag.white = white + "/" + n;
    if (white >= 8) { this.diag.why = this.diag.why || "white picture"; this.goSafe(); }
  }
  goSafe() {
    if (this.safe) return;
    this.safe = true;
    this.scene.environment?.dispose(); this.scene.environment = null;   // free the reflection map's memory too (v1.11)
    // one new material per old one, so meshes that shared a material still share one (v1.10: the safe look used to
    // make a new material for every mesh, 193 became 335)
    const made = new Map(), swap = m => { if (!m) return m; if (!made.has(m)) made.set(m, make(m)); return made.get(m); };
    const make = m => {
      if (this.min && m && (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial)) {
        const l = new THREE.MeshLambertMaterial({ color: m.color, map: m.map, vertexColors: m.vertexColors, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, transparent: m.transparent, opacity: m.opacity, side: m.side });
        m.dispose(); return l;
      }
      if (!m || !m.isMeshPhysicalMaterial) return m;
      const s = new THREE.MeshStandardMaterial({ color: m.color, map: m.map, vertexColors: m.vertexColors, roughness: Math.max(0.5, m.roughness), metalness: Math.min(0.2, m.metalness), emissive: m.emissive, emissiveIntensity: m.emissiveIntensity, transparent: m.transparent, opacity: m.opacity, side: m.side });
      m.dispose(); return s;
    };
    this.scene.traverse(o => { if (o.material) o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material); });
    // the things that animate a material keep pointing at the one now in use (v1.11: rainbow paint and the coin
    // twinkle used to stop after the swap)
    for (const g of this.cars.values()) { const d = g.userData; if (made.has(d.paint)) d.paint = made.get(d.paint); }
    if (made.has(this.coinMat)) this.coinMat = made.get(this.coinMat);
    this.safeMats = true; this.safeMsg = !this.quietSafe;
    console.warn("Turbo Dash: Toy Track World switched to the safe 3D look (" + this.diag.why + ")");
  }

  /* Simple effects (or the tablet look): a smaller shadow map, a slightly lower resolution (v1.10), and the cars
     only keep their soft round blob shadows instead of real ones (v1.10) */
  /* everything this view holds on the graphics chip (v1.11: called when a lost context is replaced) */
  dispose() {
    for (const o of [this.world, ...this.cars.values(), this.shield].filter(Boolean)) o.traverse(m => { if (m.isInstancedMesh) m.dispose(); m.geometry?.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach(x => { x?.map?.dispose(); x?.dispose?.(); }); });
    this.scene.environment?.dispose(); this.sun.shadow.map?.dispose();
    this.renderer.dispose();
  }

  setLite(lite) {
    lite = lite || this.light;
    if (this.lite === lite) return;
    this.lite = lite; this.cam = null;
    for (const g of this.cars.values()) this.carShadows(g);
    if (this.min) return;   // no shadows to resize
    const n = lite ? 512 : 1024; this.sun.shadow.mapSize.set(n, n); this.sun.shadow.map?.dispose(); this.sun.shadow.map = null;
  }
  carShadows(g) { const on = !this.lite; g.traverse(m => { if (m.isMesh && m !== g.userData.blob && !m.material?.transparent) m.castShadow = on; }); }

  /* place a car on the track (s along, x sideways, h above) facing forward, tilted with the track */
  place(g, T, s, x, h, yaw = 0) {
    const L = T.L, ss = ((s % L) + L) % L, f = ss / DS, i = Math.floor(f) % T.N, j = (i + 1) % T.N, u = f - Math.floor(f);
    const mix = (A, B, C) => V(A[i] + (A[j] - A[i]) * u, B[i] + (B[j] - B[i]) * u, C[i] + (C[j] - C[i]) * u);
    const fw = mix(T.fx, T.fy, T.fz).normalize(), up = mix(T.ux, T.uy, T.uz).normalize(), rt = V().crossVectors(fw, up).normalize();
    up.crossVectors(rt, fw).normalize();
    g.position.set(...toyPoint(T, s, x, h));
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(rt, up, fw.clone().negate()));
    if (yaw) g.rotateY(yaw);
    return { fw, up, rt };
  }

  /* the toy's body on its springs: a kick on landing, a little rattle at speed, a lean into turns */
  bounce(g, dt, kick, speed, lean) {
    const d = g.userData, s = d.spring; if (!d.body || dt <= 0) return;
    if (kick) { s.v -= Math.min(6, kick * 0.18); s.pv += Math.min(1.2, kick * 0.03); }
    s.v += (-160 * s.y - 11 * s.v) * dt; s.y += s.v * dt;
    s.pv += (-120 * s.pitch - 9 * s.pv) * dt; s.pitch += s.pv * dt;
    const rattle = this.lite ? 0 : (Math.random() - 0.5) * 0.03 * Math.min(1, speed / 40);
    d.body.position.y = Math.max(-0.18, s.y) + rattle;
    d.body.rotation.x = s.pitch * 0.25; d.body.rotation.z = -lean * 0.07;
  }

  spinCar(g, speed, dt, fast, t) {
    const d = g.userData;
    if (speed * dt) spinWheels(d.wheels, (d.wheels.ang - speed * dt / d.wr) % (Math.PI * 2));
    for (const fl of d.extra.flames) { fl.visible = fast; if (fast) fl.scale.set(1, 0.8 + Math.random() * 0.6, 1); }
    if (d.extra.prop) d.extra.prop.rotation.z += dt * 20;
    if (d.extra.red) { const on = Math.sin(t * 12) > 0; d.extra.red.material.emissiveIntensity = on ? 1.5 : 0.1; d.extra.blue.material.emissiveIntensity = on ? 0.1 : 1.5; }
    if (d.rainbow) d.paint.color.setHSL((t * 0.2) % 1, 0.9, 0.55);
  }

  draw(race) {
    const T = race.T, R = this.renderer, W = this.ov.width, H = this.ov.height;
    if (!this.world || this.trackId !== T.track.id) this.reset(race);
    const key = W + "x" + H;
    if (this.cam !== key) { const k = (this.min ? 0.65 : this.light ? 0.75 : 1) * (this.lite ? 0.85 : 1); R.setPixelRatio(1); R.setSize(Math.round(W * k), Math.round(H * k), false); this.camera.aspect = W / H; this.camera.updateProjectionMatrix(); this.cam = key; }
    const t = race.t, dt = Math.min(0.05, Math.max(0, t - this.lastT)); this.lastT = t;
    const p = race.player, fast = race.nitroT > 0 || race.boostT > 0;
    // cars
    const pg = this.cars.get("p");
    const fr = this.place(pg, T, p.dist, p.x, Math.max(-12, p.air), -(race.steerVis || 0) * 0.18);
    this.spinCar(pg, p.speed, dt, fast, t);
    const kick = (p.landN || 0) !== this.landSeen ? p.landV : 0; this.landSeen = p.landN || 0;
    this.bounce(pg, dt, kick, p.speed, race.steerVis || 0);
    race.rivals.forEach((c, k) => {
      const g = this.cars.get("r" + k); if (!g) return; this.place(g, T, c.dist, c.x, c.air || 0, c.knockT > 0 ? Math.sin(t * 30) * 0.4 : 0); this.spinCar(g, c.speed, dt, false, t);
      const up = g.userData.wasAir > 0.3 && !(c.air > 0.3); g.userData.wasAir = c.air || 0;
      this.bounce(g, dt, up ? 8 : 0, c.speed, 0);
    });
    this.coinMat.emissiveIntensity = 0.35 + 0.3 * Math.max(0, Math.sin(t * 6));   // coins twinkle
    const gg = this.cars.get("g");
    if (gg) { const gp = race.state !== "countdown" && race.ghostAt(race.raceTime); gg.visible = !!gp; if (gp) this.place(gg, T, gp.dist, gp.x, gp.air); }
    this.shield.visible = race.shieldT > 0 && (race.shieldT > 1.5 || Math.sin(t * 30) > 0);
    if (this.shield.visible) this.shield.position.copy(pg.position).addScaledVector(fr.up, 0.9);
    // coins and boxes
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), zero = V(0, 0, 0), one = V(1, 1, 1), e = new THREE.Euler();
    // coins spin, but only the ones near the player are re-sent to the graphics chip (v1.10; a picked-up coin once)
    const taken = T.coins.reduce((n, c) => n + (c.taken ? 1 : 0), 0), all = taken !== this.coinsTaken || this.coinsFor !== T;
    this.coinsTaken = taken; this.coinsFor = T;
    const near = c => { const d = ((c.s - p.dist) % T.L + T.L) % T.L; return d < 220 || d > T.L - 30; };
    let lo = Infinity, hi = -1;
    T.coins.forEach((c, k) => {
      if (!all && !near(c)) return;
      lo = Math.min(lo, k); hi = Math.max(hi, k);
      if (c.taken) { m4.compose(zero, q, zero); this.coins.setMatrixAt(k, m4); return; }
      const ci = c.i, up = V(T.ux[ci], T.uy[ci], T.uz[ci]);
      const pos = V(...toyPoint(T, c.s, c.x, c.h + 1)); e.set(Math.PI / 2, 0, t * 3 + k); q.setFromEuler(e);
      if (Math.abs(up.y) < 0.9) q.premultiply(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), up));
      m4.compose(pos, q, one); this.coins.setMatrixAt(k, m4);
    });
    const im = this.coins.instanceMatrix;
    if (hi >= 0) { im.clearUpdateRanges(); if (!all) im.addUpdateRange(lo * 16, (hi - lo + 1) * 16); im.needsUpdate = true; }
    const col = new THREE.Color();
    T.boxes.forEach((b, k) => b.xs.forEach((bx, n) => {
      const id = k * 3 + n, gone = b.until[n] > t;
      e.set(t * 1.2, t * 1.7 + id, 0); q.setFromEuler(e);
      m4.compose(V(...toyPoint(T, b.s, bx, 1.4 + Math.sin(t * 3 + id) * 0.2)), q, gone ? zero : one); this.boxes.setMatrixAt(id, m4);
      col.setHSL(((t * 0.4 + id * 0.13) % 1), 0.9, 0.6); this.boxes.setColorAt(id, col);
    }));
    this.boxes.instanceMatrix.needsUpdate = true; if (this.boxes.instanceColor) this.boxes.instanceColor.needsUpdate = true;
    for (const w of this.tm.wheels) w.rotation.y += dt * 14;
    this.tm.arrows.forEach((a, k) => { a.material.opacity = 0.35 + 0.6 * Math.max(0, Math.sin(t * 8 - k * 1.2)); });
    // sun follows the player so the shadows are crisp nearby
    this.sun.position.copy(pg.position).add(V(-60, 120, -90)); this.sun.target.position.copy(pg.position);
    // chase camera: behind and above, turning with the track (upside down in loops!)
    const falling = p.fallT > 0;
    if (!falling) {
      // the camera rides the track itself a few steps behind the car, so it stays on the inside of loops and curves
      const back = this.place(this.camProbe ||= new THREE.Object3D(), T, p.dist - 8.5, p.x * 0.6, 0);
      const want = this.camProbe.position.clone().addScaledVector(back.up, 3.4 + Math.max(0, p.air) * 0.6);
      const k = this.snapCam ? 1 : 1 - Math.exp(-dt * 7);
      this.camPos.lerp(want, k); this.camUp.lerp(fr.up, this.snapCam ? 1 : 1 - Math.exp(-dt * 5)).normalize(); this.snapCam = false;
      this.look = pg.position.clone().addScaledVector(fr.fw, 5).addScaledVector(fr.up, 1.4);
    }
    const shake = race.shake > 0 ? race.shake * 0.4 : 0;
    this.camera.position.copy(this.camPos).add(V((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0));
    this.camera.up.copy(this.camUp); this.camera.lookAt(this.look);
    this.camera.fov = 62 + (fast ? 8 : 0) * 1; this.camera.updateProjectionMatrix();
    if (this.safeMsg) { this.safeMsg = false; race.popup("🧸 Simple 3D", "#ffffff"); }
    if (this.lost) { this.overlay(race, W, H, t, fast, falling); return; }
    R.render(this.scene, this.camera);
    this.watchdog(this.gl.width, this.gl.height);
    this.overlay(race, W, H, t, fast, falling);
  }

  /* 2D things on top: speed lines, the toy hand, Auto Steer robot, popups */
  overlay(race, W, H, t, fast, falling) {
    const ctx = this.ctx, need = fast || falling || race.autoTarget !== null || race.popups.length > 0;
    if (!need && !this.ovHad) return;   // nothing on it now or last frame: leave the clear canvas alone (v1.10)
    this.ovHad = need; ctx.clearRect(0, 0, W, H);
    if (fast) {
      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = Math.max(1, H * 0.004); ctx.beginPath();
      for (let k = 0; k < 20; k++) { const a = Math.random() * Math.PI * 2, r0 = H * (0.38 + Math.random() * 0.2), r1 = r0 + H * (0.15 + Math.random() * 0.2); ctx.moveTo(W / 2 + Math.cos(a) * r0 * 1.6, H * 0.5 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * r1 * 1.6, H * 0.5 + Math.sin(a) * r1); }
      ctx.stroke();
    }
    if (falling) {
      const p = race.player, k = Math.max(0, Math.min(1, 1.4 - p.fallT)), y = -H * 0.3 + k * H * 0.55;
      ctx.font = `${Math.round(H * 0.4)}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; drawEmojiText(ctx, "🖐️", W / 2, y);
    }
    if (race.autoTarget !== null && Math.sin(t * 6) > -0.6) { ctx.font = `${Math.round(H * 0.06)}px system-ui`; ctx.textAlign = "center"; drawEmojiText(ctx, "🤖", W * 0.58, H * 0.72); }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const q of race.popups) {
      const s = 1 + Math.min(0.3, q.age * 2); ctx.globalAlpha = 1 - q.age;
      ctx.font = `900 ${Math.round(H * 0.08 * s)}px system-ui,sans-serif`; ctx.lineWidth = H * 0.012; ctx.strokeStyle = "rgba(0,0,0,0.6)";
      const qx = W / 2 + q.x * W, qy = H * 0.42 - q.age * H * 0.15;
      drawEmojiText(ctx, q.text, qx, qy, true, q.color);
    }
    ctx.globalAlpha = 1;
  }
}
