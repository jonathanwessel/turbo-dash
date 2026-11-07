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

## Saves and updates

- Progress is saved in the browser on the device (localStorage) after every race and purchase, and when
  the game is closed. A backup of the last good save is kept too.
- The save belongs to the exact address, e.g. `http://192.168.1.162:5183`. If the PC gets a different IP,
  the game opens with an empty save. Reserve the IP in your router (DHCP reservation) to keep it stable.
- **Parent Corner**: tap the version label on the title screen 5 times to copy a save code or paste one back.
- When a new release is published, the game shows a big **New version! Tap to update** button on the menus
  (never during races). Tapping it reloads into the new version; progress is kept.

## Google Save

Google Save keeps a copy of Carter's progress in your Google Drive (a hidden app folder only this game can
read) and loads it on any device you sign in on. Sign in from Parent Corner. It works on the website
(https://jonathanwessel.github.io/turbo-dash/) and on localhost, not on the LAN address (Google requires https).

It needs a free sign-in key from Google, made once:

1. Go to https://console.cloud.google.com/ and create a project (for example "Turbo Dash").
2. **APIs & Services → Library**: enable **Google Drive API**.
3. **APIs & Services → OAuth consent screen**: choose **External**, app name "Turbo Dash", your email as support
   and developer contact. Add the scope `.../auth/drive.appdata`. Under **Test users**, add your own Google
   account (leave the app in Testing; that's fine for family use).
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**: type **Web application**.
   Under **Authorized JavaScript origins** add `https://jonathanwessel.github.io` and `http://localhost:5184`.
5. Copy the **Client ID** (it ends in `.apps.googleusercontent.com`) into `src/cloud-config.js` and release.
   The client ID is not a secret; Google only accepts it from the origins you listed.

## Releasing

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Commit.
3. `npm run release` tags `v<version>` at HEAD and builds that tag into `live/`.

`npm run release -- v0.1.0` rebuilds an older tag, which is also how to roll back.
