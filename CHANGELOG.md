# Changelog

## v0.14.1 — Scan to Share

- **Scan to share!** The title screen has a QR code card: friends point a phone camera at it to open Turbo Dash
  (https://jonathanwessel.github.io/turbo-dash/). It's drawn into the game, so it works offline too.
- **Title screen spread out**: the logo sits at the top, "Made for Carter" in the middle, and PLAY at the bottom.

## v0.14.0 — Driver School

- **🚦 The Driver School opens** on Main Street. It turns time away from the screen into driver training:
  - **Grown-ups log real-world time** (Driver School → "Grown-ups: log time", behind the grown-up check):
    📚 Reading, 🌳 Playing outside, 🧹 Helping out, 🎨 Making something, 🚲 Exercise, in 10–60 minute steps.
    Every 10 minutes = 1 🎟️ Training Ticket (reading can count double). Optional daily limit and a history list.
  - **Coach Cone** teaches lessons: spend tickets on four **Driver Skills** that help every car:
    🎯 Focus (curves pull less), ⚡ Reflexes (Turbo fills faster), 🦁 Courage (bigger jump boosts and stunt coins),
    🧠 Smarts (more mission coins). Ten levels each.
  - **🪪 Driver License**: lessons raise it from Learner → Bronze → Silver → Gold → Platinum → Piqua Pro.
    **Gold** wins the **🚓 Piqua Patrol** car, with flashing lights.
  - **From Rank 10 the License is a 5th rank gauge**, so ranking up also takes some real-world time. A grown-up
    can switch that gauge off on the log page.
- The break screen now suggests reading or playing outside to earn tickets.
- New goals: take a lesson, earn a Gold license.
- Old saves get an empty Driver School; nothing else changes. The save test now covers v0.13 and v0.14 saves.
- Career simulator: with ~20 minutes a day of logged reading/outside time, today's content runs about 6 months.

**Polish**
- The Driver School classroom: a chalkboard sign with a working traffic light, Coach Cone (a blinking, bobbing
  traffic cone with a whistle), a big ticket counter, a license card in its level's color, skill cards with pips.
- The schoolhouse in town lost its "Coming soon" sash and gets a red "!" when there's a lesson to buy.

## v0.13.2 — Smooth Roads

- **No more horizontal lines on the road.** The road and grass used two alternating shades that raced toward
  you as stripes, and thin seams could show between road pieces. They now use one shade each and every piece
  overlaps the next, so the road looks smooth. The red-and-white curbs and lane dashes still show your speed.
- **The big RACE! button is on the Race Track building** itself now, right over the grandstand.

## v0.13.1 — Earn Your Wins

- **No more steering for you.** The car used to drift back onto the road on its own when no button was held,
  so letting go could still win. Now the car only steers itself if a grown-up turns on the **steering helper**
  in Parent Corner. 🐢 Easy makes curves pull a little less, but it doesn't steer either.
- **You have to build up to 1st place.** Rivals are faster from the very first race: the starter car finishes
  around 3rd–5th until Carter saves up for upgrades (first upgrades now 300, 600, 1,100… coins; Blue Bolt
  1,500). Hands off the controls finishes last.
- **One new track at a time.** A track now opens only after **winning** (1st place) the track before it on
  🚗 Normal or 🔥 Hard (Easy is for practice, coins and stars). Tracks already opened stay open.
- Checked with the career simulator: the first win comes after a few races and upgrades, each later track
  takes longer than the last, and today's whole game still runs about 4½ months with no stuck gates.

## v0.13.0 — Piqua Main Street

- **Main Street in Piqua, Ohio.** The town is redrawn: eight separate buildings, each on its own lot with a tree
  or lamp post between neighbors, a big picture on every roof and one clear word on every sign (Garage, Gifts,
  Missions, Race Track, Rank, Turbo Lab, Trophies, School). A "Welcome to PIQUA, Ohio" sign stands on the hill
  by the river.
- **A big green RACE! button** sits over the Race Track.
- **🚦 Driver School** (coming soon): its schoolhouse is on Main Street now. It will turn real-world reading and
  outdoor time, logged by a grown-up, into driver training in the game.
- **⚙️ Settings** (the gear in town): Music, Sounds, Full screen, Parent Corner and **Reset progress**.
  - Parent Corner and Reset both start with a grown-ups-only question (a sum with four big answers).
  - Reset then needs a **3-second hold** and a final "Last chance!" before anything is erased. A copy is kept
    for Undo, and Google Save is signed out so the old cloud copy can't bring the progress back.
- **New title screen**: a giant logo with speed streaks, bigger "Made for Carter" credits and a huge PLAY button.

**Polish (a big graphics pass, same flat style)**
- Cars: softer two-layer shadows, tire treads that roll with speed, exhaust pipes, a shine line on the body,
  glowing tail lights.
- Roadside: silver guardrails on every bend, lamp posts along the road, solid white edge lines.
- Sky: a glow ring around the sun and birds flapping across (not in space).
- Town: buildings never overlap, decorations never block taps, and squarer screens show the whole street.

## v0.12.0 — The Long Game

- **A much longer game.** A new career simulator (`npm run career`) plays the whole game day by day like a kid
  would and reports when every stage gate falls. Tuned with it, today's content takes about **4 months** at
  ~15 minutes a day: Rank 2 (lab) on day 2, Rank 5 (cups) ~day 12, Rank 10 (Auto Steer) ~day 37, Rank 20 ~day
  114. Ranks keep getting steeper as new worlds raise the cap toward 60 (years of play).
  - Ranks need more wins and trophies; cars cost more (Mega Monster 3,000 → Galaxy GT 40,000); upgrades on fancy
    cars cost more; research takes longer; Auto Steer costs 60,000+ coins and 4+ Brain Chips per level.
  - Cars and upgrades already bought are kept.
- **⭐ Track Mastery**: win a track again and again to earn up to 5 stars per track and difficulty (at 3, 10, 25,
  50 and 100 wins). Stars show on the track cards and count as trophy points.
- **☁️ Google Save** (Parent Corner): sign in with your Google account to keep a copy of the save in your Google
  Drive and load it on any device. Needs a one-time sign-in key; see README → "Google Save". Works on the
  website, not the LAN address.
- **Saves from every version load into this one.** Every field is checked and converted, and `npm test` loads a
  save from each past release (plus a deliberately broken one) before every release is allowed to ship.
- **Undo** in Parent Corner brings back the save from before the last reset or load.

**Fixed** (found by a full code review)
- The Trophies gauge could never fill if Parent Corner allowed only one or two difficulties.
- The results screen could pop up over the town (and lose a cup) after pausing right at the finish line.
- After crossing the finish line the car kept collecting coins, jumping and buzzing behind the results screen.
- The backup kept by Reset or Load was overwritten on the next reload.
- Allowing only Hard below Rank 3 left no difficulty to race on.
- The Brain Chip counter didn't update after spending chips in the lab.
- "Goal done!" didn't show for goals finished by a win.
- Head Start at its top level didn't quite fill the Turbo meter.
- An update or break screen could end a cup halfway through.
- A save from a newer version could break the lab; "Collect 3 Brain Chips" went backwards when chips were spent;
  races after midnight counted toward yesterday's missions.

**Polish**
- Gold ★ mastery stars on every track card, with a "Mastery star!" message when you earn one.
- Parent Corner: a Google Save panel and an Undo button; vibration only starts after the first tap.

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
