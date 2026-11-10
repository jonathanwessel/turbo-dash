// 🧸 Toy Track World geometry checks (part of npm test), v1.11:
// 1. no part of any toy track dips through the playroom floor (banked corners used to, on 7 to 25% of a track)
// 2. the start line lies on the road surface across its whole width, banked or not
// 3. the start arch stands on the road's two edges with level tops, and its banner spans the poles
//   node scripts/test-toy.mjs
import { TRACKS } from "../src/data.js";
import { buildToyTrack, toyPoint, startArch, startLine, HW, DS, FLOOR_GAP } from "../src/toy/track.js";
import fs from "node:fs";

let fails = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { fails++; console.log("  ✖ " + msg); } };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
for (const t of TRACKS.filter(t => t.world === "toy")) {
  const T = buildToyTrack(t);
  let low = Infinity; for (let i = 0; i < T.N; i++) for (const x of [-(HW + 0.35), HW + 0.35]) low = Math.min(low, toyPoint(T, i * DS, x, -0.35)[1]);
  check(low >= FLOOR_GAP - 1e-4, `${t.id}: the track's underside reaches ${low.toFixed(2)}, below the floor gap ${FLOOR_GAP}`);
  const L = startLine(T), want = [toyPoint(T, -0.6, -HW, 0), toyPoint(T, -0.6, HW, 0), toyPoint(T, 0.6, -HW, 0), toyPoint(T, 0.6, HW, 0)];
  check(L.every((p, k) => dist(p, want[k]) < 0.2), `${t.id}: the start line's corners are off the road surface (${L.map((p, k) => dist(p, want[k]).toFixed(2)).join(", ")})`);
  const A = startArch(T), eL = toyPoint(T, 0, -HW - 1, 0), eR = toyPoint(T, 0, HW + 1, 0);
  check(dist(A.L, eL) < 0.2 && dist(A.R, eR) < 0.2, `${t.id}: the arch poles don't stand on the road edges`);
  check(A.top - A.L[1] >= 8.9 && A.top - A.R[1] >= 8.9 && Math.abs(A.mid[1] - (A.top - 0.6)) < 1e-6, `${t.id}: the arch tops are not level above both poles`);
  check(Math.abs(A.width - Math.hypot(eR[0] - eL[0], eR[2] - eL[2]) - 0.6) < 0.05, `${t.id}: the banner doesn't span the poles`);
}
// 4. the playroom's rug is really added to the room (v1.11.1: a comment pasted mid-line once swallowed "room.add(rug)")
{ const src = fs.readFileSync(new URL("../src/toy/view.js", import.meta.url), "utf8");
  const line = src.split(String.fromCharCode(10)).find(l => l.includes("room.add(rug)")) || "", cut = line.indexOf("//");
  check(line && (cut < 0 || line.indexOf("room.add(rug)") < cut), "the play rug is never added to the playroom (room.add(rug) is missing or inside a comment)"); }

console.log(fails ? `\n✖ ${fails} of ${checks} toy checks failed` : `All ${checks} toy checks passed`);
process.exit(fails ? 1 : 0);
