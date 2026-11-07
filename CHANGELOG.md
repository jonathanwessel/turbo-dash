# Changelog

## v0.5.0 — Turbo Town, Racer Rank & Difficulty

- **Turbo Town**: the home screen is now a little town. Tap the **Race Track**, **Garage**, **Gifts**,
  **Rank Tower**, **Trophies** hall or the **Turbo Lab** (boarded up until Rank 2). Cars drive down the street,
  flags wave, and a red "!" pops up on any building with something waiting.
- **Racer Rank**: four gauges (🏁 Wins, 🏆 Trophies, 🔧 Garage, 🔬 Research). Fill all four to press
  **RANK UP!** for a new rank, a coin reward and a new unlock. The emptiest gauge glows with a hint. Ranks go
  up to 10 for now.
- **Difficulty**: pick 🐢 Easy, 🚗 Normal or 🔥 Hard (Hard opens at Rank 3) on the track screen. Easy helps steer
  and pays ×0.75, Hard has faster rivals and pays ×1.5. Medals are kept per difficulty.
- **Parent Corner**: choose which difficulties Carter can pick, and a steering helper (Off / A little / Lots).
- **Balance**: cars cost more (Blue Bolt 700 up to Galaxy GT 10,000), upgrades cost a bit more on fancier cars,
  and later tracks pay more. Cars and upgrades already bought are kept.
- `npm run sim` runs the race simulator (difficulty table) and `npm run sim -- journey` plays a whole career.

**Polish**
- Far-away scenery fades in smoothly instead of popping onto the road.
- Screens and cards bounce in when they open.

## v0.4.2 — Upgrades Belong to Each Car

- **Every car has its own upgrades.** Engine, Turbo, Tires and Magnet levels now belong to the car you
  bought them for. A new car starts with no upgrades, and the Garage shows "Upgrades for <car>".
- You can only upgrade cars you own ("Buy Shark Fin to upgrade it!").
- Old saves: every car Carter owned before this update keeps the upgrade levels he already had, so
  nothing he paid for is lost.

## v0.4.1 — Update Before You Race

- If a new version is waiting when Carter starts a race (from the track list, Again or Next), the game
  stops and shows a big **✨ New version!** screen, then updates by itself after a 4-second countdown
  (or right away with **Update now!**). Progress is kept. Races never start on an old version.

## v0.4.0 — Paint Shop & Trophy Room

- **Made for Carter**: the title screen now says "Made for Carter, by Carter's Dad", and the results screen
  cheers him on by name.
- **Paint Shop** (Garage → 🎨 Paint): 12 paints, including Chrome, Gold and Rainbow, plus 5 stickers
  (Flames, Stars, Lightning, Checkers, Number 1). Buy once, use on any car you own.
- **Trophy Room** (new 🏆 tile): a shelf with your best medal on every track, and 16 goals ("Win 5 races",
  "Do 10 big jumps", "BAM 10 cars"…) that pay coins when you claim them. A red "!" shows when one is ready.
- **New version button**: when a new release is out, a big green "✨ New version! Tap to update" button
  appears on the menus (never during a race). Tap it to get the new version; progress is kept.
- **Safer saves**: progress is also saved when the game is closed or hidden, and a backup copy of the
  last good save is kept in case the main one is ever damaged.
- **Parent Corner**: tap the version number on the title screen 5 times to copy a save code (a backup of
  Carter's progress) or paste one in to restore it.

## v0.3.0 — Jumps & Stunts

- **Ramps!** Red-and-yellow striped ramps on every track launch your car into the air.
- **Air coins**: a rainbow arc of coins floats after each ramp. Steer in the air to grab them.
- **Stunt landings** give +3 coins, a speed boost and some Turbo, with "STUNT!", "AIR TIME!" popups.
- Rivals jump the ramps too. Cars in the air fly over cars on the ground.
- Jump and landing sounds.

## v0.2.0 — Garage & Tracks (MVP)

- **Six tracks** to unlock: Sunny Hills, Desert Dash, Snowy Peaks, Candy Land, Lava Mountain, Space Road.
  Finish 3rd or better to open the next one. Each is faster and pays more.
- **Garage**: six cars to buy with coins (Zippy, Blue Bolt, Mega Monster, Shark Fin, Rocket Rex, Galaxy GT),
  each faster than the last.
- **Upgrades**: Engine (speed), Turbo (more and longer turbo), Tires (turning), Magnet (grab coins from
  farther away), five levels each.
- **Prizes**: coins for your place, every coin you drove over, and a **treasure chest** pick after each race.
- **Free daily gift** that grows each day in a row (up to 450 coins).
- Hub screen, coin counter, music and sound toggles, confetti, and a red "!" when you can afford something.
- Full screen on tablets and phones: any tap returns to full screen, plus a ⛶ button on the hub.

## v0.1.0 — Proof of Concept

- Pseudo-3D racing on a looping road with curves and hills (Sunny Hills).
- Auto-drive forward; steer with big ◀ ▶ buttons or by touching either half of the road.
- Five rival cars, a 3-2-1-GO countdown, two laps, live position and a progress bar.
- Coins on the road, boost pads, and a Turbo meter that fires a speed burst. Turbo knocks rivals aside.
- Bonk into trees off the road (you slow down, nothing breaks).
- Synthesized engine sound, effects and music.
- Results screen with trophy and coins (saved).
- Works in landscape (full screen) and portrait (race view on top, controls below).
