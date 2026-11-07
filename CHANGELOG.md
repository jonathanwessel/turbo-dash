# Changelog

## v0.11.1 — Quiet Town (hotfix)

- Fixed: the engine hum kept playing on the town screen and other menus. Menus now have only music; the engine
  sound plays only during races.
- The demo drive behind the menus pauses while the town is showing, which saves battery.

## v0.11.0 — Auto Steer

- **Lab tier 3** (Rank 8): the **Robot Brain** chain. Robot Eyes → Robot Ears → Map Memory → Reflexes → Brain
  Chip Socket, each one after the other. The Socket costs a 🧠 Brain Chip.
- **🧠 AUTO STEER** (Rank 10, after the Socket): 100 levels, the biggest research in the game. Every level costs
  coins, Brain Chips and real time (Level 1: 25,000 coins, 2 chips, 1 hour; Level 100: 288,000 coins,
  12 chips, 24 hours). Each level also needs a higher rank, so Level 100 needs Rank 59.
- **How Auto Steer drives** (when Carter isn't steering; tapping ◀ ▶ always wins):
  - Levels 1+ keep the car on the road, 26+ go for coins, 46+ grab ? boxes and air coins, 66+ head for boost
    pads and steer around slow rivals, 86+ fire Turbo on straights and use power-ups.
  - Its strength grows with its level. **Level 100 is God mode**: the perfect line, every boost pad, with a gold
    sparkle trail.
- **The 🤖 switch** on the race screen turns Auto Steer on or off and shows its level. Parent Corner can turn it
  off completely.
- **Ranks go up to 20** now (new titles: Pro, Champion). A 4th lab bench opens at Rank 15.
- New goals: Auto Steer level 1 and level 10, reach Rank 10.
- `npm run sim -- auto` shows how each Auto Steer level drives with hands off the controls.
- Fixed: in the lab, a second project finishing right after you collected another didn't show "Tap to collect".

**Polish**
- A little blinking robot rides next to the car and dotted arrows on the road show where Auto Steer is heading.
- Auto Steer has a big glowing card in the lab, and the 🤖 switch glows pink when it's on.

## v0.10.0 — More Earth & Physics Engine

- **Two new Earth tracks**:
  - 🏖️ **Beach Boardwalk**: a wooden boardwalk past sandcastles, beach umbrellas and surfboards. Opens after
    a 🥉 on Sunny Hills.
  - 🍂 **Autumn Forest**: orange trees, pumpkins, hay bales and mushrooms. Opens after a 🥉 on Snowy Peaks.
- Each track now opens from one specific track, so new tracks can be added anywhere without re-locking old
  ones. Winning a race can open more than one track at once, and the results screen lists them all.
- **World picker** on the track screen: 🌍 Earth now, with 🌙 Moon Base and 🌊 Deep Blue shown as coming soon.
- Physics engine: every world gets its own gravity, speed, grip and air steering. Earth keeps today's feel;
  this is the groundwork for the Moon (low gravity) and Deep Blue (heavy water drag).

**Polish**
- A third, faraway layer of hills behind every track.
- Trees and palm leaves sway a little in the wind.
- The track screen's world, race/cup and difficulty buttons share rows, so the track cards are bigger.

## v0.9.0 — Parent Corner+ & Daily Missions

- **Daily Missions** (the 📋 board in town, Rank 7): three picture missions a day, like "BAM 3 cars", "Do 8
  big jumps" or "Win on 🌵 Desert Dash". Each pays coins; finishing all three pays a **🧠 Brain Chip** and a
  coin bonus. New missions every day.
- **Parent Corner+** (tap the version number on the title screen 5 times):
  - **Break reminder**: Off, 20, 30, 45 or 60 minutes. When time is up, the next race start shows a 10-minute
    "Break time!" screen instead. "End rest now" lifts it early. (Tap the moon 5 times on the break screen to
    reach Parent Corner.)
  - **Volume** slider and **buzz on taps** (vibration) on/off.
  - **Recent races**: the last 20 races with date, track, difficulty, place and coins.
  - **Reset all**: erase progress (asks twice; the old save is kept as a backup copy).
  - Difficulty limits, steering helper and save codes, now in one organized screen.

**Polish**
- A short buzz on taps, and a bigger rumble when bonking a tree (on tablets that can vibrate).
- The Missions board in town, and "RANK" labels on locked buildings are easier to read.

## v0.8.0 — Power-Up Boxes

- **? boxes** sit in rows of three across the road a few times every lap. Drive through one to get a power-up,
  then tap the big pink button (bottom left) to use it:
  - 🛡️ **Shield**: 5 seconds of no bonks or slow-downs, and rivals bounce off you.
  - 💰 **Coin Shower**: +8 coins right away.
  - 🧲 **Mega Magnet**: grabs coins from all over the road for 8 seconds.
  - 🚀 **Super Turbo**: a longer-than-normal Turbo.
  - Boxes come back after a few seconds. No weapons, nothing mean.
- New goals: use 10 and 100 power-ups.
- Fixed: the daily gift could pop up over a race if one was started right away.

**Polish**
- Spinning, color-changing boxes with a soft glow.
- Dust puffs when driving off the road, and sparks when bumping or BAM-ing a rival.
- The power-up button wiggles so it's easy to spot.

## v0.7.0 — Cups & Brain Chips

- **Cups open at Rank 5** (Race Track → 🏆 Cups). Three races in a row with points for every place
  (10, 8, 6, 4, 2, 1). Most points wins the cup.
  - **Green Cup** (Sunny Hills, Desert Dash, Snowy Peaks) → wins the **Green Machine**.
  - **Gold Cup** (Candy Land, Lava Mountain, Space Road) → wins **Gold Rush**.
  - **Champion Cup** (Desert Dash, Lava Mountain, Space Road, Rank 7) → wins **Champion X**, the fastest car yet.
  - Cup cars can't be bought, only won. Cup trophies are worth extra trophy points for ranking up.
- **🧠 Brain Chips**: rare chips for big moments. You get one for winning a cup (once per difficulty), your first
  🔥 Hard win on each track, every rank-up from Rank 5, and every 7-day gift streak. They'll power Auto Steer
  research later. The chip count shows next to your coins.
- The rivals have names now: Rosie, Splash, Sunny, Rocky and Snowball.
- New goals: win a cup, win all three cups, collect 3 Brain Chips.

**Polish**
- A start/finish arch with a checkered banner over the road.
- A podium with the top three cars at the end of every cup, and a cup progress map between races.
- Prize and road-coin numbers count up on the results screen.

## v0.6.0 — Turbo Lab

- **The Turbo Lab opens at Rank 2.** Professor Bolt researches boosts that help **every** car. Research costs
  coins and takes real time (2 minutes at first, longer for higher levels), and keeps going while the tablet is
  off. Tap **Rush** to finish now for a few coins.
- **Lab tier 1 (Rank 2):** Coin Boost (+5% prizes per level), Lucky Chests, Head Start (start with Turbo),
  Pit Crew (cheaper upgrades).
- **Lab tier 2 (Rank 6):** Turbo Tanks, Bigger Ramps, Bumper Shield, Magnet Field, and Super Paint (unlocks
  three Neon paints in the Paint Shop).
- **Lab benches:** one at Rank 2, a second at Rank 4, a third at Rank 9.
- Every finished research level fills the 🔬 Research gauge for ranking up.
- New goals: finish 1, 10 and 30 research levels; reach Rank 5.
- Robot Brain and the 100-level **AUTO STEER** are on display in the lab as locked machines to work toward.

**Polish**
- Bubbling tubes in the lab and on the town's lab building; Professor Bolt bobs and talks to Carter.
- The lab building in town shows a countdown, then a red "!" when research is done or a bench is free.

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
