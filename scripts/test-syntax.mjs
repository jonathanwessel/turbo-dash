// Every script parses. The release script only runs at release time, so a typo in it used to show up after every
// other check had passed (v1.11.4). Part of `npm test`.
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const dir = resolve(import.meta.dirname);
const files = readdirSync(dir).filter(f => f.endsWith(".mjs"));
const bad = files.filter(f => spawnSync(process.execPath, ["--check", join(dir, f)], { stdio: "ignore" }).status !== 0);
if (bad.length) { console.log("✖ scripts that do not parse: " + bad.join(", ")); process.exit(1); }
console.log(`All ${files.length} scripts parse`);
