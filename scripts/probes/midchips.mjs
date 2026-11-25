// which Best chips the sweep's Rank 16 save shows on every track (v1.21 kinds)
import { readFileSync } from "node:fs";
import { TRACKS, CARS } from "../../src/data.js";
import { chipFor } from "../../src/best.js";
const mid = JSON.parse(readFileSync(new URL("../../src/dev/mid-save.json", import.meta.url), "utf8"));
console.log("owned:", mid.owned.join(" "), "| driving", mid.car, "| rank", mid.rank);
for (const t of TRACKS) console.log(t.world.padEnd(8), t.id.padEnd(12), t.kind.padEnd(7), chipFor(mid, t)?.name || "-");
