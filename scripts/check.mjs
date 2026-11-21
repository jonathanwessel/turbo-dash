// ✅ One command for the release checks (v1.11.2): npm test, npm run perf, npm run sim -- start, npm run career.
// Each step must pass before the next one runs; the first failure stops the check with a non-zero exit.
// A full pass on a clean, committed tree writes .check-pass (git-ignored) with the commit it passed on, and
// `npm run release` refuses to build a new release unless that file names the commit being released.
//   npm run check            -> all four steps
import { spawnSync, execSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const marker = join(root, ".check-pass");
const sh = cmd => execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
rmSync(marker, { force: true });   // an old pass never survives a new check

const head = sh("git rev-parse HEAD"), clean = !sh("git status --porcelain");
const STEPS = [
  ["tests", "npm test"],
  ["drawing budget", "node scripts/perf.mjs"],
  ["hands-off start", "node scripts/sim.mjs start"],
  ["career", "node scripts/career.mjs"],
];
const t0 = Date.now(), times = [];
for (const [name, cmd] of STEPS) {
  console.log(`\n=== ${name}: ${cmd}`);
  const t = Date.now();
  const r = spawnSync(cmd, { cwd: root, stdio: "inherit", shell: true });
  times.push(`${name} ${((Date.now() - t) / 1000).toFixed(0)}s`);
  if (r.status !== 0) {
    console.error(`\n✖ CHECK FAILED at "${name}" (exit ${r.status ?? r.signal}). Nothing after it ran.`);
    process.exit(1);
  }
}
console.log(`\n✔ All checks passed (${times.join(", ")}; ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
if (clean) {
  writeFileSync(marker, JSON.stringify({ head, at: new Date().toISOString() }) + "\n");
  console.log(`  Passed on ${head.slice(0, 7)}: npm run release may build it.`);
} else console.log("  The tree has uncommitted changes, so this pass does not count for a release. Commit and check again.");
