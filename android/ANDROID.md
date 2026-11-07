# Putting Turbo Dash on Google Play

Turbo Dash is already an installable web app (PWA). The Play Store version is a thin Android wrapper (a "Trusted Web
Activity") that opens the same game full screen. Updates to the website reach the Play Store app automatically; you
only re-upload the Android package if its settings change.

Everything in this folder is ready: `listing.md` (store text), `twa-manifest.json` (Android settings),
`feature-graphic.html` (the 1024 × 500 banner), and the privacy page at
https://jonathanwessel.github.io/turbo-dash/privacy.html.

## 1. Make the Android package (about 5 minutes)
Easiest: **PWABuilder** (free, by Microsoft).
1. Open https://www.pwabuilder.com and enter `https://jonathanwessel.github.io/turbo-dash/`.
2. **Package for stores → Android → Generate package.** Use:
   - Package ID: `io.github.jonathanwessel.turbodash`
   - App name: `Turbo Dash`, display: Fullscreen, orientation: Landscape, colors `#1a0b3d`
   - Signing key: **Create new** (PWABuilder makes it). Version 1.0.0 / code 1.
3. Download the zip. Inside are the `.aab` (upload this to Play), the signing key (`.keystore`), its passwords in
   `signing-key-info.txt`, and `assetlinks.json`.
4. **Keep the keystore and the passwords safe** (a password manager or a USB stick, not this repo). Every future
   update must be signed with the same key.

(Alternative for later: `npx @bubblewrap/cli init --manifest https://jonathanwessel.github.io/turbo-dash/manifest.webmanifest`
using the values in `twa-manifest.json`; it installs Java and the Android SDK itself.)

## 2. Let Android trust the website (removes the browser bar at the top)
Android checks `https://jonathanwessel.github.io/.well-known/assetlinks.json`. That address is the root of your
GitHub account's own site, not the `turbo-dash` project, so it needs one small extra repository:
1. Create a public repo named exactly **`jonathanwessel.github.io`**, enable Pages (main branch).
2. Add the `assetlinks.json` from step 1 at `.well-known/assetlinks.json`, plus an empty `.nojekyll` file (so GitHub
   serves the dot-folder).
3. After Play signs the app, Play Console → **App integrity → App signing** shows a second SHA-256 fingerprint; add
   it to the same `assetlinks.json` (a list with both fingerprints).
Until this is done the app still works; it just shows a thin address bar.

## 3. Play Console
1. https://play.google.com/console — the one-time $25 developer registration (personal account).
2. **Create app**: name "Turbo Dash: Kids Racing", Game, Free. Declare no ads.
3. **Set up your app**: privacy policy URL, app access (no login needed), ads (no), content rating questionnaire,
   target audience (5 and under, 6–8, 9–12 → this puts it under the Families policy; the game qualifies: no ads,
   no purchases, no data collected), data safety (no data collected or shared).
4. **Store listing**: paste from `listing.md`; icon = `public/icon-512.png`; feature graphic from
   `feature-graphic.html`; screenshots — take them on the tablet (Power + Volume down) in a few places: Main Street,
   a race, the garage, Toy Track World. Need at least 2 phone and, for tablets, 7" and 10" screenshots.
5. **Testing → Closed testing**: personal accounts must run a closed test with **at least 12 testers for 14 days**
   before production. Upload the `.aab`, add testers' Gmail addresses (family and friends), share the opt-in link.
6. After 14 days: **Apply for production**, then roll out.

## Updating later
Game changes go live on the website as usual and appear in the Play Store app automatically. Only bump
`appVersionCode` and rebuild the `.aab` when the Android settings (name, icon, colors) change.
