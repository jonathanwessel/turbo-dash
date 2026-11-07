# Turbo Dash

A racing game for kids. Win races, collect coins, buy upgrades and new cars.
**Free to play: there are no purchases, ads or real money anywhere.** Coins are only earned by racing.

Runs in the browser on Android (Chrome) and desktop, and installs as an app (PWA).

## Run it

```bash
npm install
npm run play      # the stable release, at http://localhost:5183  (play here)
npm run dev       # live development build, at http://localhost:5184
npm run stage     # build current code and serve it at http://localhost:5185
```

All three servers listen on your LAN too, so a phone on the same Wi-Fi can open
`http://<this-PC's-IP>:5183` (Vite prints the address). If the phone can't connect, allow Node.js
through Windows Defender Firewall for private networks.

Over plain `http://` on a LAN IP the game plays fine, but Chrome won't offer **Install app** or offline
mode (those need `https://` or `localhost`). To install it on the phone, host a release somewhere with
HTTPS (GitHub Pages, Netlify, Cloudflare Pages).

Play (5183), dev (5184) and stage (5185) are different origins, so each keeps its own save.

## Controls

- **◀ ▶ buttons** (or touch the left/right half of the road) to steer. The car drives itself forward.
- **🚀 button** fires Turbo when the meter is full. Drive over yellow/orange **boost pads** for a free boost.
- Keyboard: arrows or A/D to steer, Space or ↑ for Turbo, Esc to pause.

## Releasing

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Commit.
3. `npm run release` tags `v<version>` at HEAD and builds that tag into `live/`.

`npm run release -- v0.1.0` rebuilds an older tag, which is also how to roll back.
