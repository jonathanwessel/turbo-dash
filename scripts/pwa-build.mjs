// Builds the game into a throwaway folder under .pwa-test/ (git-ignored) for the install and update tests.
// `version` builds the same code as another release (vite.config.js reads TD_VERSION).
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

export const root = resolve(import.meta.dirname, "..");
export const work = join(root, ".pwa-test");

export function buildTo(name, version) {
  const out = join(work, name);
  rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
  const r = spawnSync(process.execPath, [join(root, "node_modules/vite/bin/vite.js"), "build", "--outDir", out, "--emptyOutDir", "--logLevel", "warn"],
    { cwd: root, stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, ...(version ? { TD_VERSION: version } : {}) } });
  if (r.status !== 0) throw new Error("the build failed");
  return out;
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function until(what, fn, ms = 30000) {
  const t = Date.now();
  for (;;) { try { const v = await fn(); if (v) return v; } catch { /* not ready */ } if (Date.now() - t > ms) throw new Error("timed out waiting for " + what); await sleep(200); }
}
