// A tiny static file server for the install and update tests: serves one folder on 127.0.0.1 on a free port.
// Extra headers (for example the 10-minute cache that GitHub Pages sends) go on every answer.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png",
  ".woff2": "font/woff2", ".jpg": "image/jpeg", ".webp": "image/webp", ".txt": "text/plain; charset=utf-8" };

export function serve(dir, headers = {}) {
  const root = resolve(dir);
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = normalize(join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream", Date: new Date().toUTCString(), ...headers });
      res.end(body);
    } catch { res.writeHead(404).end("not found"); }
  });
  return new Promise(ok => server.listen(0, "127.0.0.1", () => ok({
    url: `http://127.0.0.1:${server.address().port}/`,
    close: () => new Promise(r => { server.closeAllConnections?.(); server.close(r); }),
  })));
}
