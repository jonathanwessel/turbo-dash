# Changelog

## v1.22.0 — Home tracks & holidays 🏠🎄

- **🏠 Every Earth prize car has a home track.** Green Machine (Desert Dash), Barnstormer (Autumn Forest), Gold Rush
  (Pirate Port), Fire Dash (Robot Factory), School Resource Officer (the night track) and Rocket Rex (County Fair) are
  each 10% faster on one Earth track of their own, the same home bonus a world's cars get in their world. The Garage
  says "🤖 Faster on Robot Factory", the car's name carries the track's picture, the Best badge counts it, and GO
  shouts "🏠 HOME BONUS!" there. These cars arrive with no upgrades after the player's main car has many, so before this they
  were never the best car anywhere. Polar Bear is now Grippy and Toy Racer Fast, so each has a track kind its
  neighbors do not cover.
- **🎃🎄🎆 Holiday decorations on Main Street**, by the calendar. Fall has pumpkins, orange trees and a scarecrow
  (October and November), winter has snow, string lights, snowmen and a big tree with a star (1 December to 6
  January), summer has flags and fireworks (28 June to 7 July). Tap the big decoration and it jumps and plays a tune.
- Polish: the holiday decorations are the new thing to see, and the home tracks are the new thing to use.
- From the sweep: on a 1024x600 tablet the home line pushed the Garage's Drive it! button under the screen's edge.
  That size now gets the smaller car picture and tighter rows that shorter screens already had.
- From the picture review: fall did not read as fall (green hills and one scarecrow), so in fall the hills and grass
  turn gold. The summer fireworks sat behind the coin counter on a wide phone, so they are lower in the sky. Both
  have a node test that was seen failing first.
- Numbers: every one of the 29 cars is the best pick of the garage at some point of the career (it was 20 to 24).
  `npm run career` reaches Rank 40 on day 547 to 551 (551 on the release check: Moon 106, Ocean 189, Glacier 284, Toy 414). At the end no car is the
  best on more than 10 of 32 tracks. `npm run bots`: every way of playing is within 13% at Rank 10 (it was 17%), 5% at
  Rank 20, 1% at Rank 30 and 1% at Rank 40. The starter car still does not win the first race.
- **For the grown-ups:** `npm run bots` now fails unless all 29 cars are the best pick at some point on each seeded
  kid career (it held 22). The career run's "never" line says how close each such car came, on which track and day.
  The picture guard's Toy frame, track list and Garage were accepted again on purpose (Toy Racer's new kind and the
  new home tracks). The sweep shoots the Garage on a home-track car and Main Street for each holiday, and the audit
  taps each holiday decoration at every size.

## v1.21.0 — Track kinds ⚡🛞💪

- **⚡🛞💪 Every track has a kind.** Each track is a Fast, a Grippy or a Tough track, shown as a round badge in the
  top left corner of its card, in the same color as the trait pill on a car. A car whose trait matches is 6% faster
  there. This replaces the old trait speeds (Fast cars were 3% faster and Grippy cars 2.5% slower everywhere), so the
  top cars are now sidegrades: at the end of the game Wind-Up Rocket is the best car on 9 tracks, Loop Legend on 10,
  Boost Buggy on 10, Snow Cat on 2 and Blizzard Wolf on 1. Before, Wind-Up Rocket was the best on all 32. In the middle
  of the game it works the same way: at Rank 16, Champion X is the best on Fast tracks, Thunder King on Tough ones and
  Galaxy GT on Grippy ones. The car kinds card now says what each kind zooms on, and it opens once from the track
  list for a player with more than one car, then the badge glows. At GO the race shouts the bonus with its pictures
  (🏠 HOME BONUS!, ⚡ BONUS!, or 🏠 ⚡ BONUS!), and read aloud says Fast tracks for the ⚡ picture.
- **🏠 A bigger home bonus.** A world's own cars are 10% faster in their world (it was 5%), so Glacier Rink's own top
  cars still win at home at the end.
- **🚀 A smaller booster power.** The Boost Buggy's boosters fling it 5% farther (it was 12%). Measured in whole races,
  the old power was worth 8.4% of a race at full upgrades and won every Toy track. Now it is worth 3%.
- Polish: the track badges are the new thing to see, and picking the car for a track's sign is the new thing to use.
- From the picture review: the sign is a white disc with a thick ring in its kind's color (an orange arm on an orange
  disc could not be made out), and the same round sign now shows in the car kinds card's lines and beside the
  track's picture on the Best card. On upright screens the sign sits in the card's row, not on the track's picture.
  On a short landscape phone (740x360 and 915x412) the Garage's car picture is smaller and its rows tighter, because
  more cars now have a Best row and Drive it! fell under the screen's edge.
- **Fix in the checks:** the sweep's first pictures of the new card showed the rival of the week's card and a Garage
  instead (the rival card opens first on a new week), and nothing noticed. Those steps now pass the rival card, and a
  sweep picture whose screen did not open fails the sweep.
- Numbers: `npm run career` reaches Rank 40 on day 549 to 555 over several runs (551 on the release check, it was 554),
  and the worlds open on days 107, 188, 281 and 411.
  `npm run bots`: every way of playing is within 17% at Rank 10 (it was 21%), 6% at Rank 20, 2% at Rank 30, 1% at
  Rank 40. The race sims still pass: the starter car does not win the first race (Sunny Hills is a Tough track for
  that reason), every boss can be beaten, every Best badge is within 4% of the fastest car.
- **For the grown-ups:** the career run now reports which cars are ever the best pick of the garage (20 to 24 of 29,
  it was 15) and fails when one car is the best on more than a third of the tracks at the end. `npm run bots` holds
  the count at 22 or more on its seeded runs. The side prize cars (Green Machine, Fire Dash, School Resource Officer
  and a few more) are still never the best, which is the next box in the plan.
- **For the grown-ups:** the picture guard now also guards three screens, the Garage, the track list and Main Street,
  with the clock stopped and every animation held still. It was seen failing with a car drawing, a chip and the town's
  badges removed on purpose. The race pictures and the track list picture were accepted again on purpose (the cars'
  speeds and the new badges).

## v1.20.0 — Back button and car counters ◀

- **◀ The Android back button works.** The phone's back gesture or button now does what the screen's own way back
  does: it closes the open card, goes back one screen, closes the Lab sheet, or pauses a race. On Main Street it
  asks first, on a new 👋 **Stop playing?** card with **🏁 Play** and **👋 Stop**. A second back there (or on the
  title screen) leaves the game the phone's way. Before this, back left the game from any screen.
- **🌟 The special car's counter on the track list.** In the Moon, Deep Blue, Glacier Rink and Toy Track World track
  lists, a chip shows the world's special car still to win (its mystery shape) and how many are collected, such as
  "⭕ 137 / 500". A tap opens the Garage on that car. It uses the Garage's own counter words.
- Polish: the Stop playing? card and the counter chip are the new things to see, the back button is the new thing
  to use.
- **🤖 Strategy bots (for the grown-ups).** `npm run bots` plays the whole career four more ways, 3 seeds each: speed
  first, grip first, coins first and Auto Steer first (that one lets the car steer itself from Auto Steer level 20).
  It is now a step of `npm run check` and fails when a way of playing reaches Rank 10, 20, 30 or 40 more than 25%
  later than the best one. On this release they are 21%, 4%, 1% and 1% apart, so every way of playing works. It
  also prints which cars did the racing and what was bought. A trap bot that only drives Zippy turned it red.
- **Fix:** on a short landscape phone (740x360) the boss tab's card squeezed the boss's name into the big face, and
  the round into the prize, once the rival of the week's chip took a second row. The short-screen size for the big
  picture now covers the boss face too (the boss card's own size rule had outranked it). Older than this release,
  found when the sweep's new Moon step left the rival card seen, so the boss tab was measured with the chip showing.
- **Fix:** on an upright 360 px phone, the Word Lap's three answer words ("carrot parrot carpet") were cut off at
  both sides. They wrap onto two rows now. And the Garage scrolled sideways by a few pixels when three or more world
  chips showed. The chips wrap now too. Both were older than this release. A new sweep check (a panel that scrolls up
  and down must not scroll sideways) found them, after the picture review spotted a sideways bar in the Garage. It
  was seen failing on purpose first.
- Found by the same work: fully upgraded, Wind-Up Rocket is the fastest car on all 32 tracks, so the end-game
  garage has one car. That is a new box in the plan. Nothing about cars or prizes changed in this release.
- Checks: `scripts/test-back.mjs` (every screen's back press) and a new check in `scripts/test-earn.mjs` (the chip and
  the Garage agree) are in `npm test`, both seen failing on purpose first. The sweep shoots the Moon track list with
  the chip and the Garage it opens, and the Stop playing? card. Not checked on a real tablet.

## v1.19.0 — Special cars 🌟

- **🌟 Four special cars, one in each world.** They are never sold. They are won by playing in their world:
  🦘 **Moon Hopper** for 500 boost rings on the Moon, ⚓ **Deep Diver** for 900 pearls in Deep Blue, 🧊 **Snow Cat**
  for 120 drift boosts on the Glacier Rink, and 🚀 **Boost Buggy** for 80 loop-the-loops in Toy Track World.
- **Each one has a power.** The Moon Hopper jumps 35% higher (it rides on two big springs), water currents can't
  push the Deep Diver, the Snow Cat does not slide on ice, and Toy Track World boosters fling the Boost Buggy 12%
  farther. Like every world car it is also 5% faster at home. The Moon Hopper is a Fast car, the Deep Diver Grippy,
  the Snow Cat and the Boost Buggy Tough.
- **A "New car!" card** with the car, its power as a picture and a 🚗 Drive it! button (and the 🔊 speaker) shows
  when one is won. In the Garage a special car still to win shows its counter, such as "⭕ 137 / 500", and an owned
  one shows its power under its name.
- **Old saves:** a save that has already collected enough gets its cars when the game opens, and sees the card on
  Main Street.
- Polish: the four cars and the New car card are the new things to see, the Garage counter is the new thing to use.
- For the grown-ups: the powers are in `statsFor` (`PERKS` in `src/data.js`), so the game, the race sims and the
  career run share them. `earnCars` in `src/rules.js` hands them out after each race and on load.
  `scripts/test-earn.mjs` (in `npm test`) checks the goals, the counters, one car per goal and an old save, and
  `scripts/test-physics.mjs` checks each power on its own world's track. Both were seen failing with the rule
  broken on purpose. The sweep and the audit open the New car card of all four cars and the Garage on one.
- **Balance, measured:** with the kid driver over 48 races per car, the Boost Buggy's booster power at 30% won a whole
  race by 9%, far more than the other three powers (each under 1%), so it is 12% now (about 2.5%). The Best pill's
  rule counts that share on the car's home tracks, and `npm run sim -- best` stays green.
- **Read-aloud check:** this machine had no sound output during the release (Windows listed no audio device), so the
  browser could not play any voice. `scripts/say-test.mjs` now reports that case as "NOT CHECKED" in plain sight and
  still runs its other checks, instead of failing for a reason that has nothing to do with the game. The voice itself
  was not heard for this release. Nothing in the read-aloud code changed.

## v1.18.0 — Read it to me 🔊

- **🔊 A speaker button on the picture cards.** The car kinds card, the rival of the week card, the boss card, the
  Best car card and the world preview card each have a round yellow speaker at the end of their buttons. A tap reads
  the card's words aloud (coins are said as "300 coins", pictures and quote marks are skipped), the speaker pulses
  while it talks, and a second tap stops it. Leaving the card, or the game going to the background, stops it too.
- **On-device voice only.** The game only speaks with a voice the browser marks as living on the device (never an
  online one, and never the browser's default voice, which can be online). With no such voice the speaker is hidden.
- Polish: the speaker is the new thing to see and to use.
- On a 1024x600 tablet held sideways the boss card's face and car are a little smaller, so its second row of buttons
  (Not yet and the speaker) stays on the card. The sweep found the speaker under the card's edge there.
- For the grown-ups: `src/speak.js` (the voice pick and the spoken line are tested in `scripts/test-say.mjs`).
  `npm run check` now runs `scripts/say-test.mjs`, which taps the speaker with a real tap in headless Edge and checks a
  local voice starts, the speaker pulses, and a second tap and leaving the card both stop it.
- **Picture guard for Toy Track World.** `npm run guard` now also draws one seeded Toy Track World frame with the
  game's own 3D code and compares it with `scripts/guard/toy.png`. The frame is picked when a row of coins is drawn
  in the middle of the picture and no pop-up is on the road. With the coins hidden on purpose it fails (0.53% changed,
  worst block 100%). The accepted picture comes from this machine's software 3D (SwiftShader).

## v1.17.0 — Best car 🏆

- **🏆 Best car on each track.** When another of the player's cars is clearly faster on a track (at least 1%), that
  track's card shows a yellow Best pill with a picture of that car, beside the medal. The first one opens a picture
  card once ("Best car here!", "Champion X is faster here than Zippy.") with a 🚗 Drive it! button that switches to
  that car, and then the pill glows. A Moon car on Moon tracks is the usual find.
- **In the Garage** a Best row under the car's name shows the tracks where that car is the best of the player's cars
  (the first five track pictures, then how many more).
- Polish: the Best pill and its card are the new things to see, and the Garage's Best row tells which car to pick.
  The track, cup, boss and trial lists have a thin yellow scrollbar instead of the wide gray one in desktop browsers.
- For the grown-ups: the rule is in `src/best.js` (top speed with trait and home bonus, a small share for Turbo and
  quick starts). `npm run sim -- best` races every pick in 25 garages on all 32 tracks (in `npm run check`): the
  pick was the fastest car 771 of 800 times, never more than 3.0% slower, and never a swap to a slower car.
- **Picture guard** (`npm run guard`, in `npm run check`): one seeded race frame per classic world, drawn by the
  game's own code in headless Edge, compared with `scripts/guard/`. A missing boost pad turns it red.

## v1.16.0 — Fast, Grippy, Tough ⚡

- **⚡🛞💪 Every car is a kind.** Each car is Fast, Grippy or Tough, and each kind costs something. A Fast car has a
  higher top speed (3%) and slides more on curves. A Grippy car slides less on curves and is a little slower on top
  (2.5%). A Tough car loses half as much speed on a bump (walls, trees when steering back, rails, puddles,
  snowbanks, other cars) and speeds up a little slower (12%). Riding the trees hands-off is still a hard stop for
  every car. The kinds are mixed along the car ladder, so the next car up is often a different kind.
- **In the Garage** a pill beside each car's name shows its kind (a picture and one word), and the All cars grid
  shows the kind's picture on each card. Tapping the pill opens a card with the three kinds and a car of each. That
  card also shows once by itself the first time the Garage opens, and the pill glows for a moment after it.
- Polish: the pill and the grid pictures are the new things to see, and the pill's card is the new thing to use.
- **Plainer Garage.** "✔ Driving" is a flat green mark, not a sign that looks like a button. A long car name shrinks
  to share its line with the pill on short screens.
- For the grown-ups: the rules live in `statsFor` (`src/stats.js`) and `bumpKeep` (`src/physics-common.js`), so
  both race engines, the race sim and the career run use them. `npm run sim -- rival` and `-- boss` now sort the
  cars by their real top speed on each track (trait and home bonus), not by the raw speed number.

## v1.15.1 — Tidy up 🧹

- **🪙 One coin total.** The result card shows one coin amount (the prize, the coins grabbed on the road and a
  boss's prize together) instead of three lines. The rival of the week's line shows that rival's grumpy face, not a
  small colored dot.
- **Clearer pictures.** In Toy Track World a marker floats over the player's car at the start, the power-up boxes
  never spin upside down, and "BAM!" and "BOOSTER!" no longer land on top of each other. A shiny car's gleam stays
  on the car.
- **Plainer screens.** MAX! is a flat green word in the Lab and the Garage, not a button. The Lab bar has no "3/10"
  beside it, and its card words are bigger. Main Street's tower has no rank number (the Rank pill shows it), and the
  Gifts "!" sits on the Gifts roof. Garage world chips show a 🚗 by the car count. Long track names shrink onto one
  line, and the track cards fill the screen's height on big tablets. The rival chip hides on the Boss and Trials
  tabs.
- **Upright phones.** The share code sits in the sky under the logo, not on the car. On a 360 px wide screen the logo
  clears the Install button, the Rank pill and the Next sign get their own rows, and boss cards are tall enough for
  the boss's name.
- Polish: the rival's face on the result card is the new thing to see, and the one coin total is the new thing to
  use.
- For the grown-ups: `npm run sweep` now has an eighth size, 360x740 (an upright phone). `scripts/test-words.mjs`
  checks the result card, the Lab robot's lines, the tower and the Lab bar so the old words cannot come back.

## v1.15.0 — Boss rematches 👑

- **👑 The bosses come back.** After the player beats a boss, that boss returns for Round 2, then Round 3 and
  Round 4, a little faster each time (4% a round). The wins pay 2000, 3000 and 4000 coins. After Round 4 the boss
  stays at its fastest and a win pays 1000, like a repeat win before.
- **🎨 A boss paint.** Winning Round 2 gives that boss's own shiny paint: Bronze, Starlight, Sea Glass, Ice Wolf
  and Gumball. They are never sold, and the Paint tab shows a 👑 on each one until it is won.
- **The boss card** shows a crown for each round won, a red "Round 2" pill and the next prize, with a 🎨 when the
  paint is next. The intro has a new line for each boss and names the paint, and in Round 2 it draws the boss's car
  in the paint the player can win. A win says "ROUND 2 WON!".
- Old saves: every boss already beaten is ready for Round 2.
- Fixes: on a short screen the buttons after picking a gift could hide under the result card's bottom edge (the
  opened gifts now fold away there, "You got 🪙60!" stays). Boss result lines are shorter so they stay on the card,
  and the boss intro's Race button fits a 360 px tall screen.
- Polish: the boss's car in its prize paint is the new thing to see, and the rematch is the new thing to use.
- For the grown-ups: save v24 counts boss wins (a v23 `true` is one win). `npm run sim -- boss` is in
  `npm run check` and fails when any round of any boss has no car that wins it. The career run tries a rematch now
  and then. `npm run sweep` now takes its race pictures from the Rank 16 save (so they show the horn and no
  first-race lesson), keeps one brand-new race picture, adds a Toy Track World picture on the first sharp curve,
  and shoots the boss tab, a boss rematch intro and result card, and a Lab sheet at every size.

## v1.14.0 — Faces 😄

- **😄 Rivals with faces.** Rosie, Splash, Sunny, Rocky and Snowball each have a little face under a helmet in their
  car's colors. During the countdown a face pops up over every rival's car, on the classic road and in Toy Track
  World, and stays a moment past GO! (the big countdown numbers cover the middle cars) before it fades. The rival of the week's target waits until the faces are gone.
- **😠 Happy or grumpy.** A rival who finished ahead of the player smiles, and one who finished behind frowns. The
  next start grid shows the same faces, so a rival the player just beat lines up grumpy. Before the first race of
  a play time they all look ready.
- **📯 A row of faces on the result card,** in finishing order, with the player's own car in a gold ring in its
  place. Tap a rival's face and that rival honks in their own horn voice while the face pops up. Not in boss races
  or Time Trials.
- Fix: a Time Trial's result card could still show the "Beat Rosie" coin line from the race before it.
- Words: "Pick a gift!" under the gift boxes after a race (it said treasure chest), and the Lab's Lucky Chests is
  now Lucky Gifts.
- Polish: the faces over the cars are the new thing to see, and tapping a face on the result card is the new thing
  to use.
- For the grown-ups: `src/faces.js` holds the moods and the drawing, shared by both engines and the result card.
  `scripts/test-faces.mjs` (in `npm test`) covers the moods, the start grid, the row, that every face draws inside
  its circle, and that a race with faces plays exactly like one without on both engines. The moods are kept for
  the play time only, so the save did not change. `scripts/probes/faces.js` takes pictures of the start grid and
  the result row. `npm run sweep` now waits for other headless browsers on the machine before it starts (a busy
  machine made one size time out).

## v1.13.0 — Rival of the week 🎯

- **🎯 A rival of the week.** From Racer Rank 3, one of the five named rivals (Rosie, Splash, Sunny, Rocky and
  Snowball) takes a turn each calendar week, Monday to Sunday. They race in every race and cup race (never a boss
  race or a Time Trial) and wear a red and white target over their car, on the classic road and in Toy Track World.
  Their dot on the race bar has a red ring.
- **🪙 Beat them for coins.** Finishing ahead of the rival of the week pays half of that track's 1st place prize
  and makes them 1% faster, up to five times a week (five dots on their card). A new week brings the next rival
  back to their normal speed.
- **🃏 A rival card.** The first visit to the track list each week shows the rival's car, their shout and their
  five dots. A button with their car and dots above the track list opens the card again.
- **Never a wall.** The boost never takes the rival past 95% of the player's own top speed, and a rival already
  faster than the player's car stays as it is. `npm run sim -- rival` (now in `npm run check`) proves every track
  can still be won 3 times in 8 with the next faster car and the fastest rival at the cap.
- Small fixes: a newly opened track now says "🔓 Beach Boardwalk is open!" (no colon), and the What's new card
  keeps room for its scrollbar, so a long line is never cut off.
- A helper that saw only the pictures reviewed the new card, button and badge. From it: the card shows the same
  target over the rival's car, and the button's dots are bigger and it lines up with Easy, Normal and Hard.
- Polish: the target badge is the new thing to see, and the rival card's button is the new thing to use.
- For the grown-ups: save version 23 adds `rivalWeek` (the week number, the level, the week whose card was shown),
  with a port and a broken-save fixture in `scripts/test-saves.mjs`. `scripts/test-rival-week.mjs` covers the
  weeks, the turns, the cap, the bonus, the reset and both race engines.

## v1.12.1 — Clearer screens 🔍

- **🏙️ Main Street on a tall screen.** Held upright, the town now fills most of the screen instead of sitting in a
  thin strip under empty sky, so the signs are big enough to read. The street scrolls sideways like it does in
  landscape, and the ◀ ▶ arrows sit on the road.
- **🧸 Toy Track World camera.** The camera rides closer behind the car and a little lower, so the player's car is big
  near the bottom of the picture. It also no longer falls further behind the faster the car goes. A rival in the gap
  between the camera and the player turns see-through, so it never fills the front of the picture on a curve.
- **🔬 Turbo Lab on small screens.** Empty and locked benches are small tiles in one row after the busy ones, so the
  project cards get the room (they were pushed down or squeezed on phones and upright tablets).
- **🔤 Small words.** The Garage gauge "Grip" is now "Turning" (it matches the Tires card, "Turn better"). The Garage no
  longer repeats the car's name over its upgrade cards (like the Paint tab, the line is gone for a car you own). A track card's star bar ends in a ⭐ instead of tiny numbers
  like "19/25". The title screen's share box just says "Scan to share!".
- **🐢 Rivals don't wait for a car on the grass.** Rivals far ahead ease off a little so a player can catch up. They
  no longer do that for 3 seconds after the player's car was off the road, so letting go of the screen loses.
- A helper that saw only the pictures reviewed this build. From it: the Garage line that said "🔧 Upgrades" twice is gone, the
  upright town lost a seam in its sky and grew a little, and a rival in the way fades further. The rest of its list
  was already on screen before this release and is a box in PLAN.md.
- Polish: the see-through rival in Toy Track World is the new thing to see. This is a fix release: every change
  comes from the picture reviews and the hands-off check, so there is no new button.
- For the grown-ups: `npm run sim -- start` has a "hands" driver that touches nothing, and it must finish last at
  every upgrade level (12 races each). The old "none" driver never steers but presses Turbo at random; a Turbo bump
  can knock a rival aside, so at +2 and +3 it may still pass one, and that stays a printed warning. A physics test
  proves rivals ease off for a player on the road and not for one on the grass. No save change.

## v1.12.0 — Honk! 📯

- **📯 A horn.** A new button sits just above the left arrow. Tap it and the car honks, and the two closest rivals
  honk back a moment later, each in its own voice, with a little horn in a white bubble over their car. It works on every world,
  Toy Track World too, and on the keyboard with H. It is only for fun: speed, places and prizes do not change.
  The first race after the update, a hand points at it once ("Tap 📯 to honk!"). A brand-new player's first race
  still teaches only the arrows and Turbo, and the horn appears after that.
- **🔬 Turbo Lab in plain words.** Every card has a short line that says what it does ("Start faster",
  "Cheaper upgrades", "Know curves"), like the Garage cards. Prices are the full number, written like the coin
  counter (39080, not 39k). Each row has a number badge instead of "Lab tier", and every finished card shows a
  green MAX! badge (it no longer looks like a gray button that does nothing). The card's sheet no longer has a colon ("All done!").
- **◀ ▶ Steering arrows you can see on snow.** A dark rim around the white ring and a dark edge on the arrow, so
  they stand out on Glacier Rink's snow and Toy Track World's pale colors.
- Polish: the horn bubble over a rival is the new thing to see, the horn button the new thing to use.
- A helper that saw only the pictures reviewed this build. From it: the horn bubble got a white background and
  shows only over a car that is fully on screen, the horn button is navy with a yellow rim so the horn shows, the
  arrows' fill is a little darker, and three Lab lines changed ("Glow paint", "Bigger magnet", "Robot plug").
- For the grown-ups: the horn's rules live in `src/horn.js` with a test (`scripts/test-horn.mjs`) that proves it
  never changes the race. The word test now checks every Lab card has a one- or two-word line. The one-time tip is
  remembered under `turbodash.tips`, outside the save, so the save's shape does not change.

## v1.11.4 — What's new ✨

- **✨ What's new card.** After an update, the title screen shows what changed since this tablet last played: one
  picture and a few words for each thing. One tap on OK! closes it. A brand-new player never sees it.
- **📲 A proper Android app icon.** The car sits in the middle of its own icon, so a round or rounded home-screen
  icon no longer cuts it off.
- For the grown-ups:
  - Every release now makes a GitHub release page from its tag, so the owner gets an email for each one. The notes
    come from that version's entry in `src/news.js`, and `npm run release` refuses a version with no entry.
  - `npm run install-test` asks the browser itself whether the game can be installed, and checks the manifest and
    every icon. Give it a web address to check the live site.
  - `npm run update-test` installs this version, publishes a newer one, taps Update, and checks the What's new
    card, the single cache and offline start.
  - Both are part of `npm run check`, with a test that the release in `package.json` has its What's new entry.

## v1.11.3 — Plain words 🔤

Small fixes to the words on screen, found by a helper reading the pictures of every screen.

- **School:** the hard line "lap = +10% for 30 min" is gone. The big card just says "Do a lap. Get more coins!"
- **No more colons in game words:** "Tricky bonus!", "Next is Rank 17", "Rank 12 opens Ice Cream Shop",
  "School bonus +71", "You got 53!", and the rank-up card now says "You are a Pro!"
- **Racer Rank** asks for a small next step ("Win 6 more races!") instead of a far total like "Win 66 more races!"
- **Garage:** the Turbo upgrade says "Longer turbo", not "More nitro".
- **Tracks:** Haunted Hill "Opens in fall" with its leaf picture, not "Opens in October". "Preview worlds" is now
  "More worlds".
- **Racer Rank:** the "Win 6 more races!" line and the Rank up button sit above the gauges, so a small screen shows
  them without scrolling.
- **Main Street:** the plate under the rank just says what to do ("Win more races ▶"). The School coach no longer
  repeats the card.
- For the grown-ups: the screen sweep now flags any colon or semicolon in game words (the grown-up pages may use
  them), a new word test checks toasts and race pop-ups, and the sweep's pictures use a save the career bot really
  reached at Rank 16 instead of made-up numbers, with no pop-ups over them.

## v1.11.2 — Checks that can't be skipped 🧰

Nothing changes in the game itself. This release is for the grown-ups who build it.

- **`npm run check`** runs the save and drawing tests, the drawing budget, the hands-off race sim and the whole
  career run, one after another. The first failure stops it. `npm run release` now refuses to build a new release
  unless the check passed on that exact commit.
- **The race sim and the career run now fail loudly.** `npm run sim -- start` fails if driving hands-off ever
  reaches the podium (or isn't last with the starter car at +0 and +1), or if the starter car wins the first race.
  `npm run career` fails on a rank that stays stuck for 60 days or a rank cap it never reaches, and prints the day
  each world opens.
- **`npm run sweep`** checks every screen at all 7 sizes by itself: it starts the dev server, drives a headless
  browser with a throwaway save, saves pictures of the main screens and one race per world, and cleans up.
- The layout checker no longer flags the TURBO / DASH title (drawn tight on purpose) or the red "!" badge on Main
  Street's arrows.
- American spelling everywhere: a few British spellings in the notes and code comments are fixed, and `npm test`
  now fails if one comes back.

## v1.11.1 — Back on the road 🛣️

- **Fix:** v1.11.0's faster road drawing left out six things painted on the road: boost pads, rain puddles, ocean
  currents, Downtown crosswalks, skid marks and the shine on ice. They still pushed the car but couldn't be seen.
  All six are back, exactly as in v1.10. A new drawing test races on tracks with each one and fails if its color
  is never painted.
- **Fix:** Toy Track World's colorful play rug was missing (a code comment had swallowed the line that adds it).
  It's back, with a check that it stays in the room.
- The road drawing is still faster than v1.10, by 13 to 26% fewer canvas calls (the v1.11.0 notes said about a
  quarter; that was measured without the six things above).

## v1.11.0 — Feel and finish 🏠

- **🏠 Home-world bonus.** Every world's own cars (its shop car, cup prize and boss prize) are 5% faster, with 5%
  more acceleration, in their own world: the Lunar Rover on the Moon, the Turbo Sub in Deep Blue, the Frost Runner
  and friends on ice, the Toy Racer in Toy Track World. It replaces the old 4% slowdown for other cars on ice and in
  Toy Track World. The Garage shows it under the car's name ("🌙 Faster in Moon Base"), and a race at home starts
  with "🏠 HOME BONUS!".
- **Toy Track World no longer needs the Toy Racer on Normal.** Its rivals are a little slower (1.04 → 1.00 of their
  old speed). With the Glacier cars it can be started on Normal; the Toy Racer still makes it clearly easier, and
  Hard stays a challenge.
- **Toy Track World drives like the classic road:** the same short ease-in on the steering buttons, drafting behind
  another car (💨), and catching a slower car eases off and slides around it instead of braking hard.
- **Toy Track World keeps the race when the 3D picture is lost** (the tablet's graphics reset, or the browser took
  it back). The picture is rebuilt, a running race pauses ("Ready?"), and a finished one still pays. A single loss,
  or one while the game was in the background, no longer lowers the 3D quality for good.
- **Jumps are the same height at any frame rate,** and power-up picks, boss Turbo timing and puddle shoves follow
  each race's own seeded luck, so the race simulators give steady answers.
- **Graphics:**
  - Stars stay put when the horizon moves (they used to jitter and wrap).
  - The far end of the road fades into the haze instead of ending in a hard stub; Lava and the Caves have their own
    haze color (it was orange and purple).
  - Tunnels have a rocky rim around the way out, and far-off tunnels are solid, not see-through.
  - Snow always falls on Snowy Peaks.
  - Coins, pearls, boxes and lava flames keep their own sparkle instead of flickering as they slide sideways.
  - Toy Track World: the start line lies on the banked road and the start arch stands level on it; banked corners
    no longer dip through the playroom floor; rainbow paint and the coin twinkle keep working in the simpler 3D
    looks; smoother road shading; the fog matches the sky.
- **Faster drawing:** the classic road is drawn in layers (all the grass at once, then the curbs, the road, the
  lines), 13 to 26% fewer canvas calls (corrected in v1.11.1); only the last 3 tracks are kept in memory; less garbage per frame.
- **Small fixes:** Effects Auto measures the screen's speed on every frame for both engines, so the first race on
  an engine is judged correctly; on a tall (portrait) screen the Main Street arrows sit in the sky above the street
  instead of over its signs.

## v1.10.0 — Smooth on every screen ✨

- **One picture, one step.** The game clock now runs physics once for every frame the screen shows, sized to how
  long that frame really lasted. Before, it ran fixed 1/60 s steps, which was only even on a screen at exactly
  60 Hz: a 90 Hz phone repeated one picture in three, a 120 Hz tablet showed 60 new pictures a second, a 50 Hz
  screen jumped every fifth frame. Now every frame moves the race by the same amount at 30 to 144 Hz, with the
  browser's timer rounding smoothed out, and race time still matches real time (checked over 60 seconds).
  Races come out the same: the same seeded races at 40, 60, 90 and 144 Hz finish within 1% of each other.
- **Effects that spawn "a chance per step"** (drift sparks, tire smoke, dust, bubbles, Auto Steer sparkles) and the
  side-by-side shove in Toy Track World now scale with the step, so they look the same at any frame rate.
- **Less drawing on the classic road**, the same picture:
  - The sky and far hills are only painted above the far end of the road (the road paints everything below).
    Pixels painted per frame dropped by 40 to 55%.
  - Roadside things wholly hidden behind a hill crest are skipped (up to 50 a frame on the Moon and Glacier).
  - Small roadside things and far rival cars are drawn from little pictures made once, instead of 30 to 200 canvas
    calls each. Things that move or blink (flames, ghosts, lights, windmills, balloons) only do that when they are
    tiny, and every picture keeps the colors of the thing it shows.
  - The rain, underwater and tunnel tints are a see-through layer over the game instead of being painted into
    every frame.
  - On ice only the two nearest rivals get a reflection.
- **Effects: Auto is a ladder now, not a one-way switch.** It used to switch to Simple after one slow moment and
  stay there for every track until the game was restarted. Now there are three levels (full, lighter, Simple).
  The game steps down one level when races run slowly for 2 seconds, and back up between races after two smooth
  ones. A level that was too slow twice in two weeks waits until those slow races are older (or the game updates).
  The classic road and Toy Track World each keep their own level. "Slow" is measured against the screen's own
  speed, so a 50 Hz or 120 Hz screen isn't mistaken for a slow tablet. The level is remembered per device.
  Simple now really is lighter: a smaller canvas, a shorter view, every second far roadside thing, flat cars,
  no clouds or far mountains, fewer bits flying. Settings > Effects still pins Full or Simple.
- **Toy Track World:** each car is drawn with 8 draw calls instead of 23 (one per material, wheels as instances),
  the playroom and track decorations are merged the same way, and the road no longer casts a shadow (its 30,000+
  triangles were drawn again in the shadow pass every frame). About 80 to 90 draw calls a frame instead of 150 to
  180, and a shadow pass a quarter of the size. The road is now a plain shiny plastic instead of a clear-coated one.
  Simple effects also lower the 3D resolution a step and give the cars soft blob shadows. The safe 3D look no longer
  makes a new material for every part.
- **Battery and heat:** nothing races or draws behind Main Street or inside a building; behind the track picker
  and Settings the demo race moves 15 times a second instead of every frame; a paused race is drawn once. The race
  HUD only touches the page when a number or a dot actually changed.
- **For checking a device:** open the game with `#steps` at the end of its address and finish a race: a box shows
  how the screen's frames went (frame times, refresh rate, steps per frame, and what the old clock would have done).
  `npm run perf` measures the classic road's drawing per frame and fails if it gets 10% worse.

## v1.9.1 — Safe and correct 🍂

- **🍂 Seasonal tracks, starting with 🦇 Haunted Hill.** A seasonal track opens when the game is played during its
  dates on the calendar, and then stays open for good. Haunted Hill opens from 1 October to 15 November every year.
  It is now a night track with headlights and glowing rivals. A save that already had Haunted Hill open keeps it.
  Outside its season the track picker shows it locked with "🍂 Opens in October". Seasonal tracks never count toward
  a goal or open another track, so nobody is stuck waiting for October.
- **Tracks stay open.** Once a track has opened it never closes again, even if a grown-up changes the difficulty
  settings later.
- **The bank can't be fooled by the tablet's clock.** Setting the clock back no longer restarts the bank day, so
  moving it back and forth pays nothing extra. The bank checks the time with the game's website and pays at most
  3 days past that time until the game is online again; then the real backlog pays out, so a week offline still
  earns every day. Without any website time, one payout covers at most 7 days.
- **A lost boss race pays half the 2nd-place prize** (still something). Winning is unchanged.
- **Turbo Lab cards show their level again** (v1.7 had moved it behind a tap). Each card has a row of segments and
  "3/10" (a bar for Auto Steer's 100 levels); the next segment blinks while that research is on a bench; a one-level
  research says "✔ Done" when finished. A running bench says "Lv 4", and the professor says the new level when you
  collect it. The layout checker now fails if a Lab card hides its level.
- **Fixes:**
  - If the tablet's storage was full, opening the game could load the older backup copy and then save over the good
    save. The game now reads the main save first and writes the backup copy separately. When storage is full the
    backup is dropped to make room, and if saving still fails the game says so once.
  - Time Trials showed the Good Student bonus but didn't pay it. They pay it now, like races.
  - With Easy and Hard allowed but Hard still locked by rank, Easy was the only level left to pick, yet Easy wins
    opened nothing. Easy wins now count whenever Easy is the hardest level that can be picked.
  - Leaving a Math or Word Lap right after the last answer could lose the lap. It counts the moment the last answer
    is right.
  - Taking coins out of the bank counted as "coins earned" on the Progress page. Bank interest counts instead.
  - Race history rows are checked when a save loads.

## v1.9.0 — More Earth, more wins 🎢

- **Four new Earth tracks.** The race simulator showed that each car wins every time up to some track and then not
  at all on the next one, with big jumps after Night Lights and Lava Mountain, and Farm Fields, Pirate Port and
  Night Lights opened nothing. Now each of those opens a new track, placed between the old ones in difficulty, so
  there is almost always a track you can just about win:
  - **🎢 County Fair** (after Farm Fields): a Ferris wheel on the horizon, striped tents, balloons, cotton candy.
  - **🦇 Haunted Hill** (after Pirate Port): a purple evening, a big moon with bats, friendly ghosts,
    jack-o'-lanterns and a spooky old house.
  - **🤖 Robot Factory** (after Night Lights): smokestacks, turning gears, waving robots, crates, hazard-stripe curbs.
  - **✨ Crystal Caves** (after Lava Mountain): a cave ceiling with twinkling gems, glowing crystals and mushrooms,
    mine carts, crystal tunnels and headlights.
- **The School fits the screen.** Math Lap and Word Lap sit side by side under the bonus; Word Lap used to hide below
  the screen on tablets. The boss card also fits on small phones.
- **The Next sign is smarter.** It names the track that opens the next one, and says "on Normal" when a win on Easy
  wouldn't open anything.
- Fixes from a code review: a Good Student bonus can never last more than 30 minutes, even if the tablet's clock was
  wrong; a race pays the bonus the race screen showed at the start; the grown-ups' race history counts bonus coins;
  Google Save compares Math and Word Laps instead of the old lessons when deciding which copy is further along; the
  last of the old lesson and License code is gone.
- For grown-ups: `npm run sim -- ladder` shows which tracks each car can win, and the layout checker flags a big
  button that you'd have to scroll to.

## v1.8.0 — One School, Good Student bonus 📚

- **Laps give a short coin bonus instead of permanent upgrades.** Every Math Lap or Word Lap adds a **Good Student
  bonus**: races pay +10% coins (+20% for a lap with no mistakes) for the next 30 real minutes. Bonuses stack, each
  with its own 30 minutes, up to the daily limit a grown-up sets (now shown as a percentage). The race screen shows
  the bonus next to the coins, and the result tells how many bonus coins it paid.
- **Lessons and tickets are gone.** Focus, Reflexes, Courage and Smarts lessons already learned were reset, and the
  License rank gauge is removed (ranks need Wins, Trophies, Garage and Research again).
- **One School.** The Library building is gone from Main Street; Math Laps and Word Laps are both at the School
  (it used to be called the Driver School).
- **The School Resource Officer car** (it was the Piqua Patrol) now comes after 20 laps. Anyone who already had it
  keeps it. The two school goals count laps now.
- For grown-ups: the long "You earned…" messages wrap instead of running off the screen, and the Grown-ups help text
  explains the bonus. Saves from before 1.8 load with lessons reset; everything else carries over.

## v1.7.3 — Turbo you can read

- **The Turbo meter drains while Turbo burns.** It used to stay full for the whole boost and only drop to empty at
  the end, so it looked like Turbo hadn't used the tank. The button also glows while boosting.
- **Super Turbo has its own ⚡ picture.** The power-up from ❓ boxes used the same 🚀 as the Turbo button, and since
  it's a free boost that doesn't use the tank, tapping it looked like Turbo firing without emptying. The parent's
  guide now lists all four power-ups (🛡️ shield, 💰 8 coins, 🧲 magnet, ⚡ Super Turbo).

## v1.7.2 — Fair Downtown corners

- **Fixed: Downtown kept throwing the car into the trucks.** Its city-block corners pushed the car outward about
  twice as hard as full steering could push back, so a driver who steered back once pushed hit the barriers about
  27 times a race. Now the corners push only a little harder than a sharp curve elsewhere, the car eases off a
  little for each corner (rivals already did; there is no brake), and touching a barrier costs less speed. The
  same driver now hits none, with about the same race times. Other tracks are unchanged. `npm test` checks it.

## v1.7.1 — Learn to steer

- **The first race teaches the controls.** On a new player's first race, bouncing hands point at ◀ and ▶ with
  "Hold ◀ or ▶ to steer!" until both have been used, then at 🚀 the first time Turbo is full, until it's used.
- **Turbo always answers.** Tapping 🚀 before the meter is full used to do nothing; now the button shakes, a
  "nope" sounds and "Turbo is filling up!" shows, so it never feels broken.
- **Fixed:** at the start of a race the view could sit off to one side (the car drawn right of center) because the
  camera kept its position from the race before. It now starts on the car every race.

## v1.7.0 — Clean screens, real road 🛣️

**Driving**
- **Curves you can see coming:** yellow chevron signs on the outside before every sharp curve, pointing the way the
  road turns. The camera trails the car a little, so you see it slide when a curve pushes it, and the car leans
  and rolls with the curve.
- **Friendlier bumps:** hitting something at the roadside while steering back to the road is a bump, not a wall
  (the car keeps at least a third of its speed). Bumping while nobody steers, or bumping again right away, is still
  a big slowdown, so a car left alone still finishes last. Roadside things stand a little further from the road,
  and grinding along a guard rail no longer also counts as driving on the grass.
- **Smoother rivals:** rivals far ahead or behind ease off or catch up gradually instead of at a fixed distance,
  and their lane changes are the same every time a race is replayed the same way.
- **Steering:** it still works when the car is slow (after a bump), and taps ease in over a tenth of a second.
- **Looks:** the far scenery rises and sinks with the hills, lane dashes are spaced like real ones, the road
  reaches further into a light haze, brake lights glow when slowing, and the view widens a touch at speed.
- **Faster drawing:** the aurora draws with 3 gradients instead of about 96 a frame, and Simple effects also skips
  it and the shading on every car.

**Screens**
- **The back button is top-left** on every screen and goes back to where you came from (it used to always go to
  Main Street). Coins sit top-right on those screens.
- **Content sits in the middle** of each screen instead of hugging the top; Settings tiles are centered in rows.
- **Less to read:** the track picker shows the open tracks plus only the next locked one (stars appear after the
  first win); race tabs appear one rank before they open; Turbo Lab cards show just the picture, name and price,
  with the details on a tap; the bank's fine print moved to Parent Progress.
- **Main Street:** a yellow "Next" sign shows one thing to do next, and at most two "!" badges show at once.
- Brain Chips show only in the Turbo Lab and on the Rank screen. The result card shows one "what's new" line.

**Under the hood**
- `src/rules.js` holds every reward rule (races, chests, bosses, cups, trials, rank-ups, gifts, treats, missions,
  lap tickets). The game and the career simulator both use it, so the simulator now checks the same rules the game
  plays by, including Math and Word Lap tickets and the bank. `npm test` checks the rules (`scripts/test-rules.mjs`).
- `src/physics-common.js` holds what both race engines share. One "run" object replaces six race flags, and a
  back stack replaces five "return to" variables. Repeated stylesheet rules were folded together where the order
  couldn't matter (checked with a layout snapshot of every screen), and the stylesheet has spacing and type tokens.

## v1.6.1 — Smooth calmer races

- **Fixed: races stuttered after v1.6.** The calmer pace skipped one physics step in four, so on a 60 Hz screen
  one frame in four showed the same picture twice. Now the game runs one step every frame and makes each step a
  little shorter, so the road moves smoothly at the same calmer speed. (`npm test` now checks this:
  scripts/test-pace.mjs.)
- **Fixed:** at the top of a hill, road from behind the crest could draw over the road in front.
- Side bumps push the same amount however fast the game runs.

## v1.6.0 — Calmer races, Piqua National Bank and real rooms 🏦

- **Calmer races.** Every race runs at three-quarter speed: the road comes at you 25% slower, so there's more time
  to steer. Everything slows together (your car, the other racers, jumps, Turbo), so tracks, jumps, wins and coins
  work exactly as before. The race clock counts race seconds, so old best times and Time Trial medals stay fair.
- **A speedometer.** A dial under your place shows your speed in mph. Zippy tops out at 45 mph; faster cars,
  upgrades and Turbo push the needle past 100.
- **Piqua National Bank** on Main Street, next to the Library. Coins kept in the bank earn 7% every real day (put in
  100, and a day later there are 107). The bank holds up to 400 coins per rank, so it grows as he ranks up. A red
  badge on the bank means it paid him while he was away.
- **Inside the buildings.** The Garage, Turbo Lab, Driver School, Library, Bank, Trophy Room, Rank tower, Missions
  office, Gift shop, Car Wash and Museum each show their own room instead of a race going by behind the menus.
  The rooms are drawn in the game's own style (scripts/rooms.mjs). Not drawing the race there also saves battery.

## v1.5.0 — Word Laps at the Library 📚

- **The Library has its own game.** A Word Lap is 5 reading questions: see a picture and tap its word, or read a
  word and tap its picture. It starts with 3-letter words (cat, sun, bus) whose choices look different, then the
  choices start to look alike (cat, cap, can) so he has to read every letter, then 4-letter words (frog, cake,
  boat) and longer ones (rocket, turtle, carrot). Two perfect laps in a row move up a level.
- **Same tickets as math.** A lap earns a 🎟️ (two with no mistakes) for Driver School lessons. Math Laps and Word
  Laps share one daily ticket limit, so it doesn't add screen time. Tap the Library, or the new Word Lap button at
  the Driver School.
- **For grown-ups:** School settings (Driver School → Grown-ups) has a new "Hardest words" choice (3 letters,
  4 letters, longer words). Progress shows Word Laps and the reading level. Old saves start at the first level.
- Before, tapping the Library only said "read a book" and opened the Driver School.

## v1.4.0 — Race-day look 🏁

A new look for every menu and dialog, drawn from the game's own world (toy race cars, a county speedway, pit boards,
race numbers and checkered flags) instead of generic purple glass:
- **Panels are race stickers:** solid asphalt with a thick white die-cut edge, a hard shadow and a checkered-flag
  band across the top of each dialog.
- **Type with a voice:** headlines in a slanted racing face (Racing Sans One), everything a child reads in a round,
  sturdy face (Nunito). Both ship with the game and work offline (SIL Open Font License).
- **Buttons are road signs:** flat color with a solid lip that presses down. The coin and rank counters are white
  plates like race numbers.
- **The Rank screen is a pit board:** one row per gauge instead of a grid of identical cards, with a race-number
  roundel for the rank.
- **Fewer decorations:** no pink italics, no dot-joined fine print, headings in normal case ("Rank up!",
  "1st place!"). The world previews are a plain "Preview worlds" button, and world chips are just names.

## v1.3.0 — The game's own pictures 🎨

- **Every emoji is now the game's own picture.** Phones and tablets draw emoji with their own fonts, so the same game
  looked different on every device (a gold coin on one, a silver coin with a bird on another). Now all ~140 emoji in
  menus, buttons, the town, track cards and race messages use one picture set that ships with the game and works
  offline: Twemoji (© Twitter, Inc. and other contributors, CC-BY 4.0). Coins are the game's own gold coin.
  Plain arrows and ticks (◀ ▶ ✔) stay normal text.
- **Fixed: Downtown's buildings flashed colors** (and traffic lights and beach umbrellas flickered) while driving.
  Each roadside thing now keeps its own colors. The ❓ power-up boxes change color slowly instead of fast.
- **Track stars mean something you can see:** earned stars are gold, the rest dim, and a small bar under them shows
  how close the next one is (a star at 3, 10, 25, 50 and 100 wins on that track and difficulty).
- For grown-ups: `npm run emoji` fetches the picture for any new emoji added to the code, and `npm test` fails
  if one is missing.

## v1.2.4 — Toy Track World on the Pixel 10, mystery cars stay mystery

- **Toy Track World on phones and tablets:** the 3D now has three levels: full (computers), light (tablets) and
  minimal (no shadows, simple plastic, lower resolution). Phones with a PowerVR graphics chip, like the Pixel 10,
  start at minimal, because their drivers give up on big shadow shaders. If the 3D stops anyway, the game steps
  down one level and remembers it on that device. Settings shows the 3D level and the graphics chip under the version.
- **Mystery cars stay a mystery everywhere:** a car you can't buy yet (cup and boss prizes, the fire truck, the
  Driver School car, cars from worlds that aren't open) shows as "???" and a purple shape in the garage (both views),
  on cup and boss cards ("Win: 🎁 a mystery car"), in the boss intro and on preview cards.
- **The preview card** is tidied up: the car sits in the middle, the "opens at" line fits on one line and both
  buttons are the same size.

## v1.2.3 — Gold coins on every tablet 🟡

- **Fixed: coins looked silver on some tablets.** The coin picture came from each device's own emoji font (gold on
  Samsung, a silver coin with a bird on others). The game now draws its own gold coin everywhere a coin appears.

## v1.2.2 — Toy Track World on tablets, for real 🧸

- **Fixed: Toy Track World turned white a few seconds into a race on tablets.** The tablet's graphics chip gave up
  (Chrome shows a little sad face in the corner when that happens). Tablets now get a **light 3D look**: no edge
  smoothing, simpler shadows and plastic, no reflection map and a slightly lower 3D resolution, which is far less
  work for the chip. (✨ Effects → Full still gives the shiny look, if a tablet can handle it.)
- **If the 3D stops anyway,** the game goes back to the track list ("Toy Track World needed a little rest") and the
  next try starts a fresh 3D screen. If it happens twice, it says the tablet can't show Toy Track World yet instead
  of trying again. Everything else keeps working.

## v1.2.1 — Toy Track World on more tablets 🧸

- **Fixed: Toy Track World could show only a white screen on some tablets.** Its shiny reflections need a graphics
  feature ("half-float" render targets) that many tablets don't have. Now the game checks first, and if the picture
  still comes out blank or white in the first frames (or the tablet can't build a shader), it switches to a
  simpler 3D look by itself and says "🧸 Simple 3D". Nothing else changes.

## v1.2.0 — Feel the Speed 🏎️

Racing looks and feels better on every track, plus a garage with every car, world previews and a tricky new bonus course.

**How it feels**
- **💨 Drafting:** drive right behind another car for a moment and you get a little extra speed ("DRAFT!").
- **Friendlier bumps:** side by side, the other car gets nudged aside and wobbles; you only lose a little speed if
  you steer into it. Catching a slower car from behind no longer stops you like a wall.
- **Guardrails are solid:** on sharp curves the rail holds you on the road with sparks (a small slowdown). If you go
  wide before the rail starts, it guides you back onto the road.
- **Landings:** the car squashes down on a big landing and kicks up dust.

**How it looks**
- Skid marks and tire smoke on hard turns, a Turbo zoom with stronger speed lines, cars that lean into turns.
- Far-away layers: snowy mountains, desert mesas, a sunset over purple hills (Autumn Forest) and the Piqua skyline.
- **🚇 Tunnels** on Desert Dash, Snowy Peaks, Lava Mountain and the new night track, with an engine echo.
- **🌃 Piqua Night Lights:** a new Earth track at night with lit windows, streetlamps and headlights (opens after
  Candy Land).
- **🧸 Toy Track World:** shinier plastic, a rim light, soft shadows under the toys, twinkling coins, and toy cars
  whose bodies bounce on their wheels when they land.
- **✨ Effects** (Settings): Auto, Full or Simple. Auto switches to Simple by itself if a tablet starts to struggle.

**New things to do**
- **▦ All cars** in the garage: every car by world, in color once it's yours, dimmed if you can buy it now, and a
  mystery shape (with how to get it) for the rest. Tap one to see it.
- **👀 World previews:** the 👀 chip on the race screen (or 👀 Try in the garage) gives one lap of a world that isn't
  open yet, in that world's own car. No coins or prizes, and nothing is saved; the card says what opens it for real.
- **🏙️ Downtown:** a bonus course outside the progression, always open. Squared-off city-block corners closed off
  by dump trucks and ROAD CLOSED barriers. Steer early or BONK! It pays like any race but never changes a goal, cup or
  rank gauge.

**Tested:** a new physics test (drafting, bumps, rails, landings, skid marks, zoom, tunnels, Downtown, Toy Track World,
whole bot races) now runs with the save test before every release; every screen checked at 7 sizes.

## v1.1.0 — Math School 🧮

The Driver School's tickets now come from a math game he plays himself, instead of time a grown-up logs.

- **🧮 Math Lap** (Driver School → the big green button): 5 questions with pictures to count (cars, coins, apples,
  ducks…). Adding starts with sums to 5; taking away shows the pictures with some crossed out. Big answer buttons, no
  timer, and a wrong answer just fades out so he can try again. His car drives along a little track as he answers.
- **Tickets:** every lap earns a 🎟️, and a lap with no mistakes earns two. Two perfect laps in a row make the
  questions a step harder (adding to 5 → adding to 10 → adding and taking away to 10 → to 20); a lap with lots of
  tries steps back down.
- Tickets still buy the same lessons (Focus, Reflexes, Courage, Smarts) and the same license levels, so the License
  gauge from Rank 10 works as before.
- **For grown-ups** (Driver School → 👪 Grown-ups): the hardest level allowed (adding to 10, adding and taking away
  to 10, or to 20), the most tickets per day (3, 6, 10 or no limit; 6 to start), the License gauge switch, and the
  history. Progress shows laps, right answers, tries and the current level. The reading/outside log is gone, so
  there's nothing to fake; tickets, lessons and history from before carry over.
- **A harder grown-up check:** a two-digit multiplication (like 24 × 8) typed on a number pad, with no answers to
  pick from, and a 30-second wait after two wrong tries.
- The Main Street library, the break screen and Coach Cone now point to Math Laps.

## v1.0.1 — Faster early ranks 🏁

- **Ranking up is much quicker at the start.** Rank 3 now needs 10 wins in total (was 36), Rank 4 needs 23 (was 70)
  and Rank 5 needs 40 (was 111). In the career sim a kid reaches Rank 3 after about 25 races (was 80) and Rank 5
  after about 90 (was 260). From about Rank 20 the climb is the same as before, so the long game is unchanged.
- **The Rank screen says how many wins are left** ("🏁 Win 4 more races!") when wins are what's holding him back.
- Saves carry over as usual; a save that already has enough wins can rank up straight away.
- Roadmap: next is **Math School** (the Driver School becomes an addition and subtraction game).

## v1.0.0 — Carter's 1.0 🏁

The 1.0 milestone: everything from the roadmap's 1.0 plan in one big release, then a full review.

**New things to do**
- **🚜 Farm Fields, 🏴‍☠️ Pirate Port and 🛶 Piqua River Run**: three new Earth tracks for early in the game (cows,
  barns and a windmill; a pirate ship, parrots and cannons; covered bridges, ducks and the Great Miami River).
  They branch off Beach Boardwalk, Desert Dash and Autumn Forest, so no track an older save had open closes.
- **🌾 Country Cup** (Farm, Pirate, River) with a new prize car, the 🚜 **Barnstormer**.
- **🌧️ Weather:** about one Earth race in four is rainy (gray sky, rain streaks, puddles that splash and nudge
  you sideways, a soft rain sound) or snowy on Snowy Peaks. Parent Corner can switch it off.
- **🧼 Car Wash** (Rank 4): cars get a little muddier every race (you can see the splats). Rub the car clean with
  your finger; a freshly washed car earns a ✨ sparkly bonus on its next race (once a day).
- **🏛️ Museum** (Rank 8): a timeline of his firsts — first wins on each track, cups, bosses, new cars, new worlds and
  every rank. Older saves start it from the trophies they already have.
- **📱 Tilt to steer** (Settings): tilt the tablet like a steering wheel. It zeroes itself at every countdown, and
  the buttons still work. Settings shows a live ⬅️ ➡️ arrow and a Flip option in case a tablet reports tilt the
  other way round. (Works on the website and the installed app.)
- **🏁 A launch splash** when the game opens (a tap skips it).

**For grown-ups (Parent Corner)**
- **📊 Progress:** time played, races, wins and win rate, coins earned, races per day for the last two weeks, his
  best tracks, the next rank's gauges with an estimate of how much play it will take, and the reading/outdoor
  minutes logged. Everything stays on the tablet.
- **📖 How it works:** a short guide to ranks, the Turbo Lab, Driver School, the grown-up settings and saving.
- **Play Store package prepared** (not published): `android/ANDROID.md` walks through making the Android app with
  PWABuilder, the store listing text, a feature graphic, the Play Console steps (12 testers × 14 days) and a privacy
  page at https://jonathanwessel.github.io/turbo-dash/privacy.html.

**Review fixes** (three independent reviews of everything new, plus layout checks at 7 screen sizes)
- Google Save: the play-time counter no longer makes every sync look like "this device changed" (that could have
  uploaded over another device's newer copy); a tie keeps this device's copy.
- The Barnstormer's upgrades were priced like an end-game car (a car's price tier no longer depends only on its
  place in the list).
- Covered bridges, pirate ships, barns and palms stood partly on the road (and you could drive through them); they
  now stand fully beside it.
- Rain puddles splashed every two seconds; now every few seconds. The rain picture no longer lingers behind the
  results. The Time Trial ghost is never muddy.
- Tilt: only offered where the sensor can work (not on the home-network address), asks iPhone/iPad again after a
  restart, and a bad sensor reading can never break steering.
- Play time counts real time, and only while playing (not on the title, pause or grown-up screens).
- The Progress page says "ready to rank up" only when it really is; older saves get an estimated play time and coins
  earned instead of zero.
- Museum text from a save code is always shown as text; worlds an older save already raced don't get a new "first
  race" entry; the Fire Station's truck goes in the Museum.
- The sparkle bonus shows on the result card instead of a toast that another toast could replace.
- The name screen has a Back button when opened from Settings; re-pasting this tablet's own save code is recognized.
- The splash can never block the game (a fail-safe removes it), and a tap that skips it doesn't press PLAY.
- Emoji icons get room on the garage, Settings, trophy and cup cards at large sizes; Main Street's arrows fit inside
  the road at any height; locked track cards in portrait.
- Saves from every earlier version carry over (20 save checks, new fixtures for v0.22 and v1.0).

## v0.22.1 — Install Button

- **📲 Install** on the title screen (and only there): installs Turbo Dash as an app on the device, so it opens
  full screen from the home screen and works offline. It only shows when the device can install it and it isn't
  installed yet:
  - Android tablets/phones and Chrome or Edge on a computer: tapping it opens the browser's own install prompt.
  - iPhone/iPad (Safari): it shows how to do it (Share ⬆️ → Add to Home Screen ➕).
  - Hidden when the game is already running as an installed app, and on the home-network (http) address, where
    browsers don't allow installing.

## v0.22.0 — A Growing Town, Your Name & New Sounds

- **Construction sites that grow.** The 🍦 Ice Cream Shop (Rank 12), 🚒 Fire Station (Rank 15) and 🧺 Park
  (Rank 20) are built step by step over the 5 ranks before they open: a fenced lot with a dirt pile and a digger,
  then a foundation, low walls and a crane, then tall walls with scaffolding, then the finished building. Each
  site's sign shows what it will be and fills one green pip per rank.
- **"What's your name?"** The first time someone plays (and after a reset), the game asks for the player's
  name, and every message uses it ("Way to go, Carter!", the Driver License, Coach Cone, the professor). Change it
  any time in Settings → ✏️ My name. Friends who play from the shared link get their own name. (The title still
  says "Made for Carter".)
- **Every world sounds different.** Each Earth track, the Moon, Deep Blue, Glacier Rink and Toy Track World has its
  own race tune, speed and instruments (dreamy on the Moon, bubbly under the sea, sparkly bells on the ice, a toy
  piano in the playroom).
- **Every kind of car sounds different:** monster trucks rumble low, sports cars whine high, rockets roar, the
  submarine hums, the fire truck chugs.
- **Google Save syncs safely between devices.** It now checks what changed on each side since the last sync, so
  reading tickets logged on one device aren't overwritten by more races on another.
- **Fixes:** the construction-site signs ("RANK 12", "RANK 15", "RANK 20") ran off their boards; the ◀ ▶ scroll
  arrows on Main Street covered building signs (they now sit on the road); "TURBO LAB" was a pixel too wide.
- **The layout checker now checks Main Street too.** It's drawn as one big picture (SVG), which the checker used
  to skip; now it measures every label against its sign, checks for buttons covering labels, and looks at the
  street scrolled to the start, middle and end.
- New release checks: the Google Save sync decision (5 cases).

## v0.21.0 — Bug Hunt

A full bug hunt: three independent code reviews (menus and flow, both race engines, saves and data), a scripted
first session as a brand-new player, and the layout checker now looking inside every button. 25 fixes.

**Things Carter could hit**
- **Easy-only games could never open a new track.** If a grown-up allows only Easy in Parent Corner, Easy wins
  now open the next track (before, only Normal or Hard wins counted, so the game was stuck on the first track).
- **🏠 after the last race of a cup threw the cup away** (no prize car, no coins, no trophy). It now shows the cup
  results first.
- **The "update now" banner no longer appears in the middle of a cup** (tapping it reloaded the game and lost the
  cup).
- **Pausing right after the finish line lost the race's coins.** The pause button now waits for the results.
- **Losing a boss race counted as "2nd place"** (a silver medal and mission credit for losing). It no longer
  does; beating a boss again pays a 1,000 bonus (the first win still pays 5,000).
- **The 🤖 Auto Steer button showed in boss races**, where Auto Steer is meant to be off.
- **Locked track cards were a jumble** (lock, "Win first!", name and stars on top of each other). They now show
  the track's picture, a big lock and what to win.
- **The garage showed future worlds (🌙 🌊 🧊 🧸 0/3) to a new player.** It now shows the worlds he can race in
  plus the next one, like the race screen.
- **The rank-up screen now names everything that opens** (Time Trials at Rank 4, the Champion Cup at 7, Big Bruno
  at 9, the 4th lab bench at 15).
- The "Win all three cups" goal is now "Win 3 different cups" (there are more than three now).
- Tapping a Toy Track World race while it loads, then leaving, no longer starts a race on some other screen.
- Screens that open a moment later (missions, the library, a locked lab) no longer pull him back if he already
  tapped something else.
- The park's Brain Chip day follows the local calendar, and its message shows the coins.

**Racing**
- **A bump could set off boost pads, ? boxes and coins far ahead.** After a bump pushed a car back, the next
  frame "drove over" up to 30 pieces of road. Fixed in both engines.
- **A snowbank hit 5 to 7 times instead of once** (cutting speed far more than it should). It hits once now.
- **A hidden minimum speed:** the hill code quietly raised every car to a minimum speed (which also made Bumper
  Shield level 1 do nothing). Hills now only slow or speed cars on slopes.
- **Toy Time Trials:** the ghost ran ahead after a fall (it stopped recording while the toy hand carried you).
- **Toy Track World:** rivals no longer pass through each other or get knocked through the wall; a rival level
  with you bumps you sideways instead of pushing you back.
- Toy Track World no longer leaks graphics memory race after race (old cars, shields and tracks are freed).
- Some per-race state (boost pad counter, tractor beam) no longer carries into the next race.

**Saves and grown-up screens**
- A save with broken daily missions no longer crashes the result screen (which could lose a session's
  progress); the missions are simply made fresh. Coins can never become "not a number".
- The grown-up check no longer pops back up after a quick wrong-then-right answer (or a quick Cancel).
- If a tablet can't show 3D, Toy Track World says so instead of running a toy track in the wrong engine.

**Checks:** 18 save checks (new: broken missions, Easy-only unlocks), the reviewers' own repro scripts all pass,
hands-off driving still finishes last, the starter car still has to be upgraded to win, the career simulator has
no stuck gates, and the layout checker is clean.

## v0.20.2 — No More "null"

- **Garage fix:** cars you earn instead of buy showed "🪙 null" on a gold, buy-looking button (the Fire Dash, and
  boss cars like the Thunder King). Every car now says how to get it: "🚒 Fire Station · Rank 15", "👑 Beat Big
  Bruno", "🏆 Win the Gold Cup", "🌙 Reach the Moon Base", "🚦 Driver School", or its price.
- **The layout checker now reads the words too:** it flags "null", "undefined", "NaN" and similar anywhere on
  screen, and steps through every car in the garage. It runs with a brand-new save, a mid-game save and a
  late-game save, because some text only shows when you don't own something yet.

## v0.20.1 — Every Screen Fits

Fixes for things Carter's dad spotted on the tablet, and a check of every screen at 8 screen sizes.
- **Result screen:** the treasure chests no longer spill their numbers into the buttons. Opened chests show the
  coin and number neatly inside, and the line reads "🎁 Treasure: 🪙164!" so it's clear what it is. On short,
  wide screens the card is more compact.
- **Racer Rank:** the hint no longer says "Finish research" when Research is already full (a 0 / 0 gauge counted
  as empty). It now points at the gauge that really needs filling, like "🏁 Win races!".
- **Gifts building:** it always opens now. After today's gift is collected it says "Come back tomorrow!" and shows
  tomorrow's gift, instead of quietly doing nothing.
- **Short, wide screens** (phones and wide tablets in landscape):
  - The race screen's buttons fit in a tighter band, so the track cards (and their prizes) fit.
  - The Trophy Room's top shelf rows could be pushed above the screen where they couldn't be reached; the shelf
    now starts at the top and scrolls.
  - The Racer Rank gauges, the License gauge and the hint fit on the screen.
  - The garage car picture is smaller, so the Drive button fits.
  - The title logo no longer runs into "Made for Carter".
- Big emoji icons get room so they never touch the words under them (rank gauges, school skills, lab, gifts).
- Any screen taller than the display can now scroll, so nothing is ever out of reach.
- **New quality check:** a layout checker (dev builds only) that finds overlapping, spilling and off-screen text
  and buttons on every screen. Checked at 740×360, 915×412, 1000×448, 1024×600, 1280×800, 1920×1080 and
  800×1280 (portrait).

## v0.20.0 — Smoother Racing & a Simpler Race Screen

A tune-up of the classic engine (Earth, Moon, Deep Blue, Glacier Rink) after a full review of its physics and
collisions, plus a race screen made simpler for young kids.

**Physics and collisions**
- **Rivals no longer drive through each other.** Before, two rivals overlapped about 4% of every race; now
  they ease apart sideways (overlap is down by about 97%).
- **Side bumps feel right.** Touching a rival side by side now bumps you both apart sideways. Before, it snapped
  you behind them like an invisible wall. Rear-ending a rival still slows you down.
- **Boost pads only work when you drive over them**, not when you fly over them.
- **Hills matter a little:** rolling downhill speeds you up, climbing slows you down (rivals too).
- **Jumps depend on speed:** hit a ramp faster to fly higher and farther.
- Checked: hands-off driving still finishes last, the starter car still has to be upgraded to win, and the
  career simulator has no stuck gates.

**A simpler race screen**
- The world buttons only show the worlds you can race in, plus the next one as a goal. No more rows of locked
  worlds or "coming soon" buttons.
- The Cups, Boss and Trials tabs appear only once they open (Trials at Rank 4, Cups at Rank 5, Boss at
  Rank 9). Early on the screen is just Easy / Normal / Hard and the big track cards.
- Difficulty shows coins as pictures (🪙 / 🪙🪙 / 🪙🪙🪙) instead of numbers.
- Locked tracks say "Win 🍭 first!" with the picture of the track to win, instead of a sentence.
- Bigger buttons and easier-to-read track names.

**Polish (graphics)**
- Distance haze: the far road and fields fade softly toward the sky, so the world looks deeper.
- Soft shadows under trees, rocks and other roadside things.
- A jumping rival's shadow stays on the ground under it.

## v0.19.0 — 🧸 Toy Track World (Next Gen)

- **The game levels up!** Toy Track World is a whole new kind of racing with a **brand-new 3D engine**. It opens
  at **Rank 35** after researching the **🪄 Shrink Ray** (new lab tier 7). The first visit shows a big "THE
  GAME LEVELS UP!" card.
  - **Real 3D:** a giant sunny playroom (wooden floor, a rainbow play rug, a big window, star wallpaper) with
    giant toys all around: letter blocks, crayons, bouncy balls, brick towers and a teddy bear.
  - **Plastic toy track** with side walls on little stilts, in a different color on every track, with joints
    between the pieces. Bump the walls and you slow down a little.
  - **Loop-the-loops!** The camera rides upside down with you. Go in fast: too slow at the top and you fall
    off, and a friendly giant 🖐️ toy hand puts you back on the track.
  - **Jumps over gaps** (too slow and you drop in, and the hand helps again), **banked curves**, hills, and
    **booster stations** with big spinning tires that fling you forward.
  - **Shiny toy cars** with glossy paint, spinning wheels, soft shadows and reflections. Every car in the
    garage gets a 3D toy version.
  - **Four toy tracks:** Bedroom Loop, Block Tower Run, Cookie Jar Dash and Playroom Grand Prix.
  - **New cars:** the **Toy Racer** (400,000 coins), the **Loop Legend** (win the new **Toy Cup**) and the
    **Wind-Up Rocket** (beat the new boss **🤖 Major Wind-Up**). Cars made for toy tracks are a little faster
    there.
  - **New research:** Loop Grip (stay on loops when slower), Booster Tune (boosters fling you farther), Wall
    Bumpers (walls slow you less), Wind-Up Motor (speed up faster on toy tracks).
  - Coins, ? boxes, Turbo, power-ups, cups, Time Trials with a ghost, bosses and Auto Steer all work in the new
    engine.
  - The 3D part loads only when Toy Track World is first needed, so the game still starts fast.
- **Ranks go up to 40.** New goals: win in Toy Track World, drive through 25 loop-the-loops.
- Saves from every earlier version carry over (17 save checks).
- Tuned with the career simulator: Toy Track World opens after about 120 hours of racing, and Rank 40 takes
  about 160 hours, with no stuck gates. The best ice car finishes mid-pack on plastic track, and Major Wind-Up
  beats a fully upgraded Loop Legend about half the time.

## v0.18.0 — 🧊 Glacier Rink

- **The third new world: Glacier Rink, on the ice.** It opens at **Rank 30** after researching **🧊 Ice
  Studs** (new lab tier 6). Pick 🧊 Glacier Rink in the world bar.
  - **Slippery ice:** your car keeps sliding, so steering changes where you're *going*, not where you are.
    Steer early and gently! Curves push harder too.
  - **❄️ Drift boosts:** steer *into* an icy curve and hold it until the snow spray turns blue and pink, then
    let go for a **DRIFT BOOST**.
  - **Snowbanks** sit in one lane: steer around them, or go **POOF** through them (slowly).
  - **Ice cars:** cars made for ice have a ❄️ by their name in the garage. Other cars spin their wheels a
    little on the ice.
  - **Four ice tracks:** Ice Cave, Frozen Lake, Aurora Pass and Glacier Summit.
  - **New cars:** the **Frost Runner** (220,000 coins: studded tires and two skis on the roof), the **Polar
    Bear** (win the new **Glacier Cup**) and the **Blizzard Wolf** (beat the new boss **🐺 Fang the Ice Wolf**).
  - **New research:** Snow Chains (slide less), Drift Master (bigger drift boosts), Snowplow (snowbanks slow you
    less), Warm Engine (speed up faster on ice).
- **Ranks go up to 35.** New goals: win on the ice, do 50 drift boosts.
- Saves from every earlier version carry over (16 save checks).
- Tuned with the career simulator: Glacier Rink arrives around month 11, Fang falls around month 13, and the
  whole game now runs about 15 months to Rank 35, with no stuck gates. The Kraken Cruiser (the best sea car)
  finishes mid-pack on the ice, so the new ice cars are worth earning.
- Split-screen Two Players is off the plan.

**Polish (graphics ladder, step 4: shiny ice)**
- The northern lights waving across a starry evening sky, and snow falling in two layers.
- Glossy ice roads with long shines and twinkling glints, and cars reflected in the ice.
- Frosty pines with icicles, see-through ice crystals, igloos, snow forts with flags, and waddling penguins.
- Snow spray and blue and pink sparkles off your tires while you drift.
- **Garage:** a row of world buttons (🌍 🌙 🌊 🧊) jumps straight to that world's cars and shows how many you
  own.

## v0.17.0 — 🌊 Deep Blue & Time Trials

- **The second new world: Deep Blue, under the sea.** It opens at **Rank 25** after researching **🤿 Snorkel
  Seals** (new lab tier 5). Pick 🌊 Deep Blue in the world bar.
  - **Heavy water:** everything is slower and speeding up is hard, so bumps and bonks cost more.
  - **Currents** push your car sideways on long stretches (a blue sheen with sliding arrows shows which way):
    steer against them!
  - **Bubble vents** on the road float you up high. Hit one to fly through a row of **🦪 pearls** (5 coins
    each).
  - **Four sea tracks:** Kelp Forest, Coral Reef, Shipwreck Bay and Deep Trench.
  - **New cars:** the **Turbo Sub** (120,000 coins: periscope, side fins and a spinning propeller), the
    **Manta Ray** (win the new **Ocean Cup**) and the **Kraken Cruiser** (beat the new boss **🐙 Captain
    Kraken**).
  - **New research:** Propellers (speed up faster underwater), Fins (currents push less), Pearl Diver (grab
    pearls from farther away).
  - Underwater races sound muffled, like being under water.
- **⏱️ Time Trials!** A new Trials tab on the Race Track screen. Race alone against the clock on any open track.
  Your best run comes back as a **see-through ghost car** to beat next time. Bronze, silver and gold medal times
  for every track, each medal pays coins once.
- **Ranks go up to 30.** New goals: win under the sea, collect 50 pearls, earn Time Trial medals.
- **Fix:** the Turbo Lab only showed research tiers 1 to 3, so Moon Tires couldn't be started. Every tier shows
  now, and the 4th lab bench shows when it unlocks (Rank 15).
- Saves from every earlier version carry over (15 save checks).
- Tuned with the career simulator: Deep Blue arrives around month 7, Captain Kraken falls around month 9, and
  the whole game now runs about 10 months to Rank 30, with no stuck gates.

**Polish (graphics ladder, step 3: under the sea is the most detailed world yet)**
- The sea surface shimmering far above, light rays swaying down through the water, schools of fish, and
  bubbles rising everywhere.
- Swaying kelp, branching coral, shell rocks with starfish, glowing jellyfish, sea anemones and sparkly
  treasure chests along the road.
- Light ripples dancing on the road, a bubble trail behind your car, glowing pearls, and bubble vents with
  bubbles streaming up.
- A new Glacier Rink sign in the world bar for what's coming next.

## v0.16.0 — 👑 Main Street Grows & Bosses

- **Bosses!** A new **👑 Boss** tab on the Race Track screen. A boss race is one-on-one against a named rival who
  fires a Turbo burst every few seconds. Beat them to win **their car, a Brain Chip and 5,000 coins** (rematch any
  time for fun).
  - **🦏 Big Bruno** on Space Road (Rank 9): win the **Thunder King** monster truck.
  - **👩‍🚀 Captain Luna** on Earthrise Run (Rank 23): win the **Starfire** moon car.
  - Each boss shows an intro card with what they say and the car you can win.
- **Main Street grows with your rank.** New buildings start as fenced construction sites showing the rank they
  open at:
  - **📚 Library** (open now).
  - **🍦 Ice Cream Shop** (Rank 12): a free treat of coins once a day.
  - **🚒 Fire Station** (Rank 15): the firefighters give you **Fire Dash**, a real fire truck with a ladder and
    flashing lights.
  - **🌳 Park** (Rank 20): a daily coin picnic, plus a Brain Chip every third day.
- New goal: **Beat a boss**. Beaten bosses also count toward your trophy gauge.
- Saves from every earlier version carry over (14 save checks).
- Tuned with the career simulator: Bruno falls around day 40, Luna around month 6, and the whole game still runs
  about 7½ months with no stuck gates.

**Polish**
- Main Street is wider and **scrolls sideways**, with big ◀ ▶ arrows at the edges. The ▶ arrow shows a red dot
  when a building off screen has something waiting for you.
- New building art: library columns and a book sign, a striped ice-cream awning with a giant cone, a fire house
  with big garage doors.
- The boss intro card draws the prize car big, in full detail.

## v0.15.0 — 🌙 Moon Base

- **The first new world: the Moon.** It opens at **Rank 20** after researching **Moon Tires** in the Turbo Lab
  (new lab tier 4). Pick 🌙 Moon Base in the world bar on the Race Track screen.
  - **Low gravity:** ramps launch you sky-high and you float down slowly. Steer in the air to grab the tall coin
    arcs.
  - **Gaps in the road:** every ramp jumps a gap. Miss it and a friendly **tractor beam** floats you across
    (slowly, and no crash).
  - **⭕ Boost rings** float near the top of each jump: fly through them for a speed boost.
  - **Four moon tracks:** Crater Hop, Moonbase Loop, Asteroid Alley and Earthrise Run, tougher than anything on
    Earth.
  - **New cars:** the **Lunar Rover** (60,000 coins, big wheels, an antenna and a dish) and the **Comet**, the
    prize for winning the new **Moon Cup**.
  - **New research:** Thrusters (steer better in the air) and Ring Magnet (catch rings more easily).
- **Ranks go up to 25.** New goals: win on the Moon, fly through 25 boost rings.
- Moon cars can only be bought once you reach the Moon.
- Tuned with the career simulator: the Moon arrives around month 5 of regular play, and today's whole game now
  runs about 7½ months (with ~20 minutes a day of logged real-world time), with no stuck gates.

**Polish (graphics ladder, step 2: the Moon is more detailed than Earth)**
- Earth glowing in the sky with clouds and a shadow side, a deep twinkling starfield and a soft nebula.
- Shaded moon rocks, flat craters, turning radar dishes with blinking lights, and glass domes with glowing
  windows.
- A dark pit where the road is missing, with glowing edges; a soft light cone for the tractor beam.
- The world bar shows which worlds are open and what's needed for the locked ones.

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
  Drive and load it on any device.
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
