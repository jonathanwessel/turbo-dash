# Turbo Dash

A racing game for kids. Win races, collect coins, buy upgrades and new cars.
**Free to play: there are no purchases, ads or real money anywhere.** Coins are only earned by racing.

Runs in the browser on Android (Chrome) and desktop, and installs as an app (PWA).

## Run it

```bash
npm install
npm run play      # the stable release, at http://localhost:5183
npm run dev       # live development build, at http://localhost:5184
npm run stage     # build current code and serve it at http://localhost:5185
```

Play (5183), dev (5184) and stage (5185) are different origins, so each keeps its own save.

## Controls

- **◀ ▶ buttons** (or touch the left/right half of the road) to steer. The car drives itself forward.
- **🚀 button** fires Turbo when the meter is full. Drive over yellow/orange **boost pads** for a free boost.
- Keyboard: arrows or A/D to steer, Space or ↑ for Turbo, Esc to pause.

## Saves and updates

- Progress is saved in the browser on the device (localStorage) after every race and purchase, and when
  the game is closed. A backup of the last good save is kept too.
- A save belongs to the exact web address the game was opened from, so the same device keeps separate saves
  for different addresses.
- **Parent Corner**: tap the version label on the title screen 5 times to copy a save code or paste one back.
- When a new release is published, the game shows a big **New version! Tap to update** button on the menus
  (never during races). Tapping it reloads into the new version; progress is kept.

## Tests

`npm test` checks that every older save still loads, the Math and Word Lap questions, the bank's interest, every
reward rule, the race physics and that the calmer pace stays smooth. `npm run release` runs it first and stops if anything fails.

## Releasing

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. Commit.
3. `npm run release` tags `v<version>` at HEAD and builds that tag into `live/`.

`npm run release -- v0.1.0` rebuilds an older tag, which is also how to roll back.

## Credits
Fonts: [Racing Sans One](https://fonts.google.com/specimen/Racing+Sans+One) and [Nunito](https://fonts.google.com/specimen/Nunito), SIL Open Font License (in `public/fonts/`).
Emoji pictures: [Twemoji](https://github.com/jdecked/twemoji) by Twitter, Inc. and other contributors, licensed CC-BY 4.0 (in `public/emoji/`).
