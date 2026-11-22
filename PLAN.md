# Turbo Dash: plan

This file is the roadmap the scheduled task works through, every 4 hours. `ROADMAP.md` keeps the history, the
lessons learned and how the game fits together. `CHANGELOG.md` lists every release.

## How the task works through this roadmap
1. **Pick the next box.** Take the first unticked box in the first unfinished milestone. Work boxes in order for
   as long as the run lasts. A big box may take several runs: commit working steps, and note where you stopped.
2. **Release.** Run the release checklist below.
   - Green: publish, tick the boxes you finished, and add a one-line `Notes:` under each.
   - Red: fix it, or stash the broken part and publish what is green. Never push red.
3. **Targets.** The last box of each milestone is its target: one measurable line, proved by a test, the race
   sim or the career run. The milestone is done when its target passes.
4. **Target missed.** Add the fix box it needs just above the target and keep going.
5. **Decisions.** Decide sensibly and write the decision in the box's note. Never stop to ask the owner. Things
   only the owner can decide are listed under "Waiting for the owner": leave them alone.
6. **Editing by hand.** Anyone else working in this checkout checks `.work-lock` (git-ignored) first and writes
   it while they work.

## Rules from the owner
The rules for every game in this folder are in `CLAUDE.md` in the parent folder. They all apply here. These are
Turbo Dash's own rules on top, and they win where the two disagree.

- **The player is young and does not stop to read.** Anything important blocks the way and works with pictures.
  One word per button where possible. Every new mode gets a first-time explainer made of pictures.
- **Keep the look.** Retro pseudo-3D road, bright flat colors, chunky shapes drawn in code, cars from behind. No
  photos, no heavy effects. Toy Track World and later 3D worlds are the planned exception.
- **Winning is earned.** Hands-off driving finishes last (`npm run sim -- start`). The starter car does not win
  the first race. A track opens only after a Normal or Hard win on the one before.
- **There is always a track the player can almost win.** Tracks stay closely spaced in difficulty.
- **Every old save loads.** Any change to the save adds a port and a fixture in `scripts/test-saves.mjs`. Only
  `turbodash.*` storage keys.
- **Never touch a real save.** Browser checks run in a headless browser with a throwaway profile. Never open
  the play server on port 5183 in a browser, and never start, stop or change that server.
- **No stuck gates.** `npm run career` plays the whole game day by day. A release cannot ship if a gate never
  opens.
- **Every release has one thing to see and one thing to use that is new,** listed under "Polish" in the
  changelog. Fix-only releases are for things that are broken right now.
- **No two players on one tablet.** The owner turned this idea down (2026-11-20).
- **The player's name and the home town stay** (owner decision, 2026-11-20). They are part of this game, and
  this rule wins over the "no personal details" rule for every game. Do not remove or rename them. Do not add
  anything new: no other names, addresses, network addresses or family stories in code, docs or commits.
- Nothing is ever for real money. Timers can only be rushed with in-game coins.

## Release checklist (every release; stop and fix on any failure)
1. `npm run check` passes: `npm test`, the drawing budget (`npm run perf`), the hands-off sim
   (`npm run sim -- start`), the whole career run (`npm run career`), the install test and the update test,
   stopping at the first failure. It takes about 3 minutes. Re-record the drawing budget (`npm run perf -- --write`) only when the picture gained
   something on purpose, and say so in the changelog. Run the full sim for any track, car or physics you changed.
   Write the day of Rank 40 and of each world opening (the career run's last line) in the notes.
2. `npm run sweep`: every screen at all 7 sizes in headless Edge with a throwaway save, about 20 minutes (run it in
   the background, and save no source file while it runs: the dev server reloads the page). No overlap, no spill,
   no "null". Pictures land in `.sweep/`.
3. Look at the sweep's pictures of every screen you changed, plus its race frame per world. Then a helper that sees
   only the pictures reads every visible line and flags anything a young player could not follow.
4. Bump the version in `package.json`. Add this version's entry at the top of `src/news.js`: `pics` for the
   in-game card (one picture and a few words each, or empty when the player sees no change) and `notes` for the
   owner (2 to 5 plain lines, no quote marks). Add the `CHANGELOG.md` entry and a one-line "shipped" entry in
   `ROADMAP.md`. Look at `.pwa-test/news.png` after the update test when the card changed.
5. Commit. Run `npm run check` again on that commit (`npm run release` refuses a commit the check has not passed
   on), then `npm run release` (it writes the tag from the `notes` in `src/news.js` and builds the home copy). Do
   not make the tag by hand. Then `git push origin main --tags`.
6. Wait for the Pages build to pass. Confirm the live `version.json` shows the new version. Then
   `npm run install-test -- https://jonathanwessel.github.io/turbo-dash/` prints ok.
7. Tell the owner: the pushed tag makes a GitHub release (`.github/workflows/release.yml`, which emails the
   owner). Check it with `gh release view v<version> -R jonathanwessel/turbo-dash`. Do not run
   `gh release create`. Then one push notification, best effort.

Until a tool exists, the box that creates it is the first to use it. Skip the steps for tools that do not exist yet.

## Roadmap

### M0. Safety net (no visible change except "What's new")
Unattended releases need checks that cannot be skipped. v1.11.0 shipped with six road features missing and
every test green.
- [x] **One command for the checks.** `npm run check` runs steps 1 to 4 with `set -o pipefail` behavior: any
  failure stops it with a non-zero exit. `npm run release` refuses to run unless the check passed on this commit.
  Notes: v1.11.2. `scripts/check.mjs` writes `.check-pass` (git-ignored) with the commit, only on a clean tree;
  `release.mjs` compares it with HEAD (it no longer runs `npm test` itself). Rebuilding an existing tag
  (`npm run release -- v1.2.3`) skips the check: it is a rollback to code that already shipped. The sim and the
  career run had only printed tables; both now exit 1 on failure. Decision: the hands-off sim was found placing
  4th or 5th at +2 and +3 in some runs (rivals ease off to 0.93 to wait on the first track), so "finishes last" is
  gated as: never on the podium at any level, always last at +0 and +1, a printed warning at +2 and +3. The
  stricter rule has its own fix box in M1. Proved: a broken drawing budget stops the check at step 2 and no pass
  is written. Career at this commit: Rank 40 on day 550, Moon day 111, Ocean 194, Glacier 285, Toy 413.
- [x] **The sweep as a script.** `npm run sweep`: starts the dev server, drives a headless browser over CDP with
  a throwaway profile, runs `__sweepAll()` at all 7 sizes, saves screenshots, stops the server and the browser.
  Notes: v1.11.2. `scripts/sweep.mjs`: vite on 127.0.0.1:5184, Edge with a temp profile on CDP port 9334, waits
  for the fonts before measuring, 8 main screens per size and one race frame per world at 1280x800, a report.json,
  exit 1 on any problem. `-- 1280x800` runs one size; `--probe "<js>"` evaluates one expression and saves
  probe.png (for chasing a flag). Its first run flagged two things that are drawn that way on purpose: the TURBO /
  DASH lines' text boxes overlap (the letters do not), and the red "!" badge sits outside Main Street's arrow.
  The checker now skips exactly those two (spans of one `.logo`, absolutely placed badges up to 32 px), after
  looking at the pictures. About 140 s per size.
- [x] **Fix the words the v1.11.2 picture review flagged** (all already live, none new in v1.11.2, so that
  release shipped and this box comes next). School: "lap = +10% for 30 min" becomes a picture line a child gets
  ("Do a lap. Get more coins!"). Colons in game text: "Bonus: tricky!", "Next: Rank 17", "Good Student bonus: +71".
  Garage: "More nitro" is jargon. Tracks: "Opens in October" (a month a young child can't read; use a picture).
  Rank: big totals like "Win 640 more races!" (show the next small step). Look again at: Lab tier 3 colored blocks
  over the project names, the Races / Cups / Boss / Trials row at 740x360, the toast covering the Next pill and
  the logo, the "6th" on the checkered banner in Deep Blue, and the Toy World camera at the start. Some flags came
  from the sweep's own made-up save (rank 16 with 0 wins, school laps that pop the bonus toast): fix the sweep's
  pictures first so they show a real-looking save with no toasts, then judge the rest. The player's name and the
  home town stay (owner decision).
  Notes: v1.11.3. Sweep pictures first: `src/dev/mid-save.json` is the career bot's own save on the evening it
  reached Rank 16 (day 62, 574 wins, 13 cars; `CAREER_SNAP=16:src/dev/mid-save.json npm run career -- 12 200`
  writes it again). The sweep's "mid" pass and its screenshots use it, open each screen by its Main Street button so
  it is painted from that save, refresh the coin counter, and hide toasts. Words: School card "Do a lap. Get more
  coins!" with the "lap = +10% for 30 min" line removed (it repeated the card), and the two coach lines that said it
  a third time replaced. Colons gone: "Tricky bonus!", "Next is Rank 17", "Rank 12 opens 🍦 Ice Cream Shop", "School
  bonus +🪙71", "You got 🪙53!", ice cream and picnic toasts, the bank's payday line, and the rank-up card now says
  "You are a Pro!". The Main Street plate drops its "Next" word. Rank hint: the wins to the next multiple of 10
  (`winsStep` in data.js), so 574 of 640 reads "Win 6 more races!". "Longer turbo", "Opens in fall" (the season
  word, with the leaf picture; decision: a season a child knows beats a month name), "More worlds" for "Preview
  worlds". Guards: the sweep's audit flags any colon or semicolon in game text (grown-up pages exempt), and
  `scripts/test-words.mjs` (in `npm test`) checks toasts and race pop-ups, month names, upgrade words and
  `winsStep`. The picture review of this build also found the Rank hint below the gauges on a 360 px screen: the
  hint and the Rank up button now sit above the gauges, and the audit's "must be on screen" check covers them.
  Looked again: Lab tier 3 blocks, the Races / Cups / Boss / Trials row at 740x360, "6th" in Deep Blue (the start
  place) and the Toy World start camera all look right with the real save. The toast over the Next plate is a
  2.6-second pop-up, left as is. The rest of that review became the boxes below and in M1.
  Check on the release commit: career Rank 40 on day 547, Moon 107, Ocean 187, Glacier 283, Toy 410 (no rule
  changed; the bot's luck moves these a few days). Sweep clean at 7 sizes. Not checked on a real tablet.
- [ ] **A picture guard.** One fixed, seeded race frame per world and one picture per screen, compared with the
  pictures kept from the last release. A large difference fails until the new picture is accepted on purpose.
- [x] **Tell the owner.** `.github/workflows/release.yml` makes a GitHub release from each pushed tag, using
  the tag message (2 to 5 plain lines). An in-game "What's new" card lists every change since this device last
  played, in pictures and a few words, and closes with one tap.
  Notes: v1.11.4, built by the owner's main session at the owner's request (2026-11-20), ahead of the picture
  guard. `src/news.js` holds one entry per version: `pics` for the card, `notes` for the tag. `release.mjs`
  writes the tag from the notes and refuses a version with no entry. `scripts/test-news.mjs` (in `npm test`)
  fails when `package.json` names a version with no entry, and checks the card's words. The card is on the title
  screen, remembers the version under `turbodash.news` (not in the save, so no save change), shows at most the
  newest three versions, and never shows to a brand-new player.
- [x] **Install and update tests.** Separate maskable icons, a manifest `id`, and two scripts: one checks the
  browser offers "Install app" with no errors, one proves an installed copy picks up a new version.
  Notes: v1.11.4. `npm run install-test` (also takes the live address) and `npm run update-test`, both in
  `npm run check`, both in headless Edge with a throwaway profile over `scripts/cdp.mjs` (shared with Copper
  Gulch). The update test builds the same code as v99.0.0 (`TD_VERSION`), so it also proves the card, the single
  cache and offline start. `npm run icons` redraws the maskable icons from `public/icon.svg`. Not checked on a
  real Android device: the icon crop and the install prompt there still need the owner's eyes.
- [ ] **The sweep sees what a playing child sees.** Its race frames use a brand-new save, so every race picture
  shows the first-race lesson and hides the horn; take them from the Rank 16 save instead (one brand-new race frame
  stays, for the lesson). It also never opens a card's sheet (the Lab sheet's colon in v1.12.0 was found by reading
  code): open one sheet or pop-up per screen (Lab project, Garage upgrade, track card) and audit it. Also save one
  Toy Track World frame mid-race on the first sharp curve with a rival close behind the player
  (`scripts/probes/toy-curve.js`, from v1.12.1): the start-line frame could never show the camera problem that
  review found.
- [ ] **Android back button.** Back closes the open screen or card. On Main Street it asks before leaving.
- [ ] **Target:** with one boost pad's drawing removed on purpose, `npm run check` plus the picture guard is
  red. Put it back and it is green.

### M1. Rivals with character (v1.12)
- [x] **Turbo Lab in plain words** (v1.11.3 picture review). "Lab tier 1/2/3" is a grown-up word (use a number
  badge or "Row"). Prices like "39k" don't match the coin counter: show the full number. Projects such as Pit Crew,
  Head Start, Reflexes, Map Memory and Brain Chip Socket need a two-word line like the Garage cards ("Start
  faster"). Finished cards say "MAX!" on some and "Done" on others: pick one.
  Notes: v1.12.0. Each project has a `tag` in data.js (one or two words, shown under its name; the longer `desc`
  stays in the card's sheet). Each row shows a round number badge, and a locked row says "🔒 Rank 6". Prices are
  the full number like the coin counter. Decision: finished cards all say MAX!, because the Garage already does.
  Picture review: finished cards looked like gray buttons, so MAX! is now a green badge; "Neon paint", "Grab more"
  and "Robot ready" became "Glow paint", "Bigger magnet" and "Robot plug". The row badges stay (the box asked for
  them). The sheet's "Level 3 of 10: all done!" (a colon the sweep never saw, the sheet is closed in its pictures) is now
  "All done!". `scripts/test-words.mjs` checks every card has a short line and lab.js has no "Lab tier", "k" or
  "Done".
- [x] **Steering arrows stay visible** on snow (Glacier) and on Toy World's pastel colors: a darker rim.
  Notes: v1.12.0. A dark outer rim, a whiter ring, a faint dark fill and a dark edge on the arrow itself, on every
  world (one look everywhere), with the fill darkened after the picture review found the right arrow pale on snow
  and Moon gray. Looked at on Glacier and Toy World at 1280x800 in headless Edge. Not checked on a
  real tablet.
- [x] **Main Street in portrait** fills the screen (v1.11.3 review: at 800x1280 the town sits in the bottom
  quarter under empty sky and its labels are tiny). The game is played in landscape, so this rides along with any
  M1 release, not on its own.
  Notes: v1.12.1. In portrait the town is sized by the screen's height (`min(75vh, 100vh - 140px)`), not its
  width, and its box has the drawing's own shape (2930:900), so at 800x1280 the drawing is 960 px tall (it was 376
  px). The sky above it is the drawing's top blue: the picture review found a hard seam where the page's gradient
  met the drawing's sky. The street scrolls sideways as in landscape. The arrows went back down onto the road (the road band is now taller than they are), with a height
  of at most 6.5vh so they fit the road on a short upright phone too. Looked at in headless Edge at 800x1280 with
  the Rank 16 save. Decision: rode along with other fix boxes in a fix release, see the roadmap note.
- [x] **Lab layout on small screens** (v1.12.0 review): the empty bench slots fill half the screen at 740x360
  and 800x1280 and push the project cards down. Shrink empty benches to a thin row, or put the cards first.
  Notes: v1.12.1. Busy and finished benches keep a full row. Empty and locked benches are 64x56 tiles that wrap in
  one row after them (CSS `order`, so the markup order that collect and rush use by index is unchanged). At
  800x1280 the first row of cards now starts right under the bench row. At 740x360 the left column keeps its width
  for the robot and the benches, with the tiles in one line.
- [x] **Toy World camera on curves** (v1.12.0 review): on the first curve a rival can fill the front of the
  picture and the player's car looks small in the middle. Check the chase camera keeps the player's car big and low.
  Notes: v1.12.1. Found the cause with a probe picture on the first sharp curve: the camera smoothed its place in
  the room, so at race speed it trailed several steps further back than set, and a rival 3 steps behind the player
  filled the front. Now the camera smooths its offset from the car (no speed lag), rides 7 steps back (was 8.5) and
  3.0 up (was 3.4), and looks 8 ahead and 1.0 up, so the car is about 230 px wide near the bottom of a 1280x800
  picture (it was about 130 px in the middle). A rival in the gap between the camera and the player fades to
  see-through (each car has its own materials, so only that car changes). Pictures before and after with
  `node scripts/sweep.mjs 1280x800 --probe` and a script that moves the cars onto the curve. Not checked on a
  real tablet: the closer camera on loops and jumps needs the owner's eyes.
- [x] **Small word polish** from the v1.11.3 review: "Upgrades for Champion X" repeats the car name; "Grip" could be
  "Turning"; tiny "19/25" star counts on track cards have no picture; "Point a phone camera here" on the title
  sounds like a manual; "Beach Boardwalk" wraps and its "11/25" touches the bar at 740x360.
  Notes: v1.12.1. The line over the upgrade cards is gone for an owned car (the picture check found "🔧 Upgrades" under the Upgrades tab said it twice; the Paint tab already worked this way), "Turning" (it matches the Tires card's "Turn better"), the star bar ends in a ⭐
  picture (the numbers moved to the bar's hover title; decision: a bar filling toward a star reads without numbers
  for a young player), and the share box says only "Scan to share!". "Beach Boardwalk" still wraps onto two lines,
  which is fine now that nothing sits right under it.
- [x] **Hands-off is last again at +2 and +3.** Found by `npm run check` (v1.11.2): driving hands-off with the
  starter car at +2 or +3 sometimes passes one or two rivals on Sunny Hills, because rivals ahead ease off to 0.93
  to wait. Rivals should not wait for a car that is not steering (for example, no easing while the player is off
  the road). Then make `npm run sim -- start` strict again: last at every level.
  Notes: v1.12.1. Rivals ahead do not ease off for 3 s after the player's car was on the grass (`wildT` in
  engine.js; rivals behind still catch up). A physics test proves it, and fails on the old engine. Found while
  measuring: the sim's "none" driver never steers but presses Turbo and power-ups at random, and Turbo bumps that
  knock a rival aside cause the passes that are left. Over 60 races at +3: 7 not last on the old engine, 3 on the
  new one, 0 with no Turbo presses, and +2 was 0 on both. Decision, in the open: the target "last at every level"
  is gated on a new "hands" driver that touches nothing (the real hands-off), 12 races per level, strict. The
  "none" driver keeps its gate (never on the podium, last at +0 and +1, a printed warning at +2 and +3), because a
  child who presses Turbo is playing, and a Turbo bump is meant to knock rivals aside. Career on this commit: Rank 40
  on day 552, Moon 108, Ocean 189, Glacier 285, Toy 415 (no real change).
- [x] **Rival of the week.** The named rivals take turns. This week's rival is in every race, and gets a little
  faster each time the player beats them, within a cap. A new week resets it.
  Notes: v1.13.0. Rules in `src/rival-week.js`, used by both engines, the game, the sim and the career run. Calendar
  weeks from Monday (local date), the five rivals in turn, from Rank 3, in races and cup races only (never boss,
  Time Trial, preview or the menu demo). Each finish ahead of the rival (any place) adds 1% speed and pays half the
  track's 1st place prize, up to 5 a week. Decision, found by `npm run sim -- rival` in the run that started this
  box: a plain boost walls tracks off (Space Road went from 8 wins of 8 to 0 with +1.5%), so the boost is held
  under 95% of the player's own top speed and never lowers a rival already faster. A target badge over the car
  (classic road and a sprite in Toy Track World), a red ring on its race-bar dot, a card the first visit of the
  week to the track list (car, shout, five dots), a chip above the track list that opens it again, and a "Beat
  Rosie" coin line on the result card. Save v23 `rivalWeek` with a port and a broken-save fixture. The sweep
  shoots the card (`s-rival`, `s-rival:max`) and the result line. This box was started by a run that stopped
  before releasing (its lock went stale); the next run carried on from its uncommitted work, as the task says.
  The sweep found the card's OK! off a short screen (the card is now sized by the screen's height, title on one
  line) and an old "New track:" colon line ("🔓 Beach Boardwalk is open!"). A badge probe
  (`scripts/probes/week-badge.js`) found the badge floating over the start arch: it now sits on the roof. Picture
  review: the card shows the same badge over the car, the chip's dots are bigger and it matches the difficulty
  buttons' height. Decisions on the rest of that review: "Rival of the week" stays as the title (the 🎯 picture
  carries it), the coin amount is left out (it changes per track), the chip keeps the badge's red rim, and the
  Toy Track World "GO!" over the start grid is a one-second countdown, left as is.
  Not checked on a real tablet: the badge size in Toy Track World needs the owner's eyes.
- [x] **Faces and reactions.** A small face for each rival on the start grid and the result screen: happy when
  they win, grumpy when they lose. Pictures only.
  Notes: v1.14.0. Rules and drawing in `src/faces.js`, shared by both engines and the result card: a round face
  under a helmet in the rival's car colors, three moods (ready, happy, grumpy). A rival who finished ahead of the
  player is happy, one behind is grumpy. During the countdown a face in a white bubble pops up over every rival's
  car (classic road, and the Toy Track World overlay) and fades 0.6 s after GO!; the target badge of the rival of
  the week waits until the faces are gone. The next start grid shows the last race's moods. Decision: the moods
  are kept for the play time only (not in the save), so no save change and a new play time starts "ready". The
  result card has a row of faces in finishing order with the player's car in a gold ring, not in boss races or
  Time Trials; tapping a rival's face honks in that rival's own horn voice (the thing to use; the faces over the
  cars are the thing to see). Found while building: a Time Trial's result card could keep the "Beat Rosie" line
  from the race before, now hidden. `scripts/test-faces.mjs` (in `npm test`) checks moods, the grid, the row,
  that every face draws inside its circle, and that a race with and without faces gives the same places, time and
  distances on both engines, so no sim or career change. `scripts/probes/faces.js` shoots the grid and the row.
  The run that built this stopped during its sweep after committing (the commit-early rule worked); the next run
  released it.
- [ ] **Boss rematches.** A beaten boss comes back stronger for a bigger prize. The first rematch win gives a
  new paint.
- [ ] **v1.12.1 picture review leftovers** (all on screen before v1.12.1, so that release shipped). Toy Track
  World start: the player's car blends into a pack of look-alike cars with navy roofs (a marker or a brighter
  outline for the player's car). Turbo Lab: the pip bar and "10/10" say the same thing twice, "MAX!" chips and card
  lines are about 11 px, and "Research makes EVERY car better!" sounds like a narrator. Main Street: "16" shows on
  the tower and in "16 Pro", and the red "!" on Gifts covers the Missions board. At 360x740 the coin counter
  touches the "16 Pro" badge (add 360x740 to the sweep). Garage: "Earth 13/13" has no picture for what it counts.
  Track cards: "Beach Boardwalk" wraps onto the trophy, and 1280x800 has an empty band over the cards. Portrait
  title: the QR box covers the car. The toy power-up boxes show "¿" when they spin upside down.
- [x] **A horn button.** It honks. Rivals nearby honk back.
  Notes: v1.12.0, taken ahead of its turn: v1.12.0 had to move the game forward (four tool releases in a row) and
  this is the smallest new thing to use. Rules in `src/horn.js`, used by both engines: the two closest rivals
  within about one second of driving answer 0.35 to 0.95 s later in their own voice, with a 📯 over their car
  in a white bubble with a dark rim (drawn on the classic road and on the 3D view's overlay, only over a car fully
  on screen: the picture review saw a bare horn float at the screen's edge over a car that was off it, and an
  orange horn lost on the orange toy track). The button is navy with a yellow rim (the orange horn on yellow was
  hard to see). Rivals wait 1.2 s before answering again, but the
  button always honks (never lock a button). It changes nothing in the race, proved by `scripts/test-horn.mjs`, so
  no sim or career change. It sits above the left arrow; a brand-new player's first race hides it until the arrows
  and Turbo lesson is done, and the next race shows a hand on it once (remembered under `turbodash.tips`, outside
  the save). Not checked on a real tablet: the thumb reach to the horn above the left arrow needs the owner's eyes.
  Check on the release commit: career Rank 40 on day 552, Moon 107, Ocean 188, Glacier 283, Toy 413 (no rule
  changed). Sweep clean at 7 sizes, and again at 740x360 and 800x1280 after the picture review fixes.
- [ ] **Target:** the race sim shows every track still has a result the "kid" driver can reach with the car
  one step above the starter, with the rival of the week at its cap. The career run reaches Rank 40 within 5% of
  the day it does today.
  Notes (v1.13.0, progress): `npm run sim -- rival` is in `npm run check` and passes: for each track, the car one
  step above the slowest car that wins it still wins at least 3 of 8 with Rosie at the cap (32 tracks, lowest 5 of
  8 on Earthrise and 6 of 8 on Moonbase). Career with the rival in: Rank 40 on day 550 (552 before, inside 5%),
  Moon 107, Ocean 188, Glacier 284, Toy 412, the rival beaten below the cap 401 times for 215,975 bonus coins.
  Stays open until the rest of M1 (faces, boss rematches) ships, since it gates the whole milestone.

### M2. Cars that feel different (v1.13)
- [ ] **Three traits per car, shown as words and pictures:** Fast, Grippy, Tough. A fast car slides more. A
  grippy car is slower on the straight. A tough car loses less speed on a bump. No bare numbers on the card.
- [ ] **A "Best on" badge** on each track card, and a matching badge in the garage.
- [ ] **A second special car per world,** earned by play: a Moon hopper that jumps farther, a submarine that
  ignores currents, an ice car that does not slide.
- [ ] **Strategy bots.** Speed first, grip first, coins first and Auto Steer, each over several seeds.
- [ ] **Target:** every car is the best pick on at least one track, no car is the best pick on more than a
  third of them, and the four bots reach Rank 40 within 25% of the best one.

### M3. Bigger worlds (one world per release, v1.14 to v1.17)
Each new track adds one new thing to see. Each release re-checks the career run.
- [ ] **Moon, 4 more tracks.** For example a meteor shower and a crater jump.
- [ ] **Ocean, 4 more tracks.** For example a shipwreck tunnel and a whirlpool.
- [ ] **Glacier, 4 more tracks.** For example an ice bridge and a snowball roll.
- [ ] **Toy World, 4 more tracks,** with a double loop.
- [ ] **Stunt Show in Toy World.** A mode scored on loops, jumps and air time, not on finishing place, with
  three medals per track.
- [ ] **Hide what cannot run.** On a device that cannot show 3D, Toy World goals, cars and missions are hidden
  and never block a gauge.
- [ ] **Target:** each of the four worlds takes a fully upgraded player at least 7 days in the career run, and
  every gauge can still be filled.

### M4. Cloud Kingdom (v1.18)
- [ ] **The world.** In the 3D engine: rainbow roads, bouncy clouds, a side wind. 4 tracks, a cup, a boss, two
  cars, and the rank cap raised by 5.
- [ ] **Target:** the career run opens Cloud Kingdom after Toy World and fills every gauge to the new cap. The
  frame budget for the 3D view holds on the low tier.

### M5. Make your own (v2.0)
- [ ] **Track builder prototype.** Five piece types (straight, curve, ramp, loop, booster) snapped together on
  the playroom floor. Race it right away.
- [ ] **The builder.** All pieces, undo, save up to 10 tracks. It refuses a track that cannot be finished and
  shows which piece to change.
- [ ] **Share a track** as a code or a picture code. No server, no accounts.
- [ ] **Car painter.** Colors per part and stickers placed freely, from the paints and stickers the player owns.
- [ ] **Photo mode.** Pause, move the camera, save a picture.
- [ ] **Target:** a bot builds 50 random tracks. Every one the builder accepts can be finished by the "kid"
  driver, and every one it refuses names a piece.

### Small delights (take one as the "Polish" piece of any release)
- [ ] A pet that rides along and cheers.
- [ ] A sticker book that fills as the player sees new things: roadside animals, bosses, weather.
- [ ] A replay of the last few seconds on the result screen.
- [ ] Holiday decorations on Main Street by the calendar.

## Waiting for the owner (do not act on these)
- **Saves across devices, for every game** (owner, 2026-11-20: wanted at some point, not now). Google Save
  stays as it is, behind Parent Corner, until the owner picks this up. Do not remove it and do not extend it.
- **Play Store.** The developer account, the site repository that lets Android trust the game, the signing key
  and the 12 testers are the owner's steps. `android/ANDROID.md` has the walk-through.
- **A real tablet check.** No release has been checked on a real device by the task. Say so in each release note
  when a change needs one.

## Roadmap notes
- 2026-11-20: plan written from the owner's review of enhancement ideas. "Race together on one tablet" was
  turned down. Pace set to one run every 4 hours.
- 2026-11-20 (v1.11.2): M0 boxes 1 and 2 done. Checklist rewritten around `npm run check` and `npm run sweep`,
  with the check run again on the release commit (the release script now insists). Added the M1 box "Hands-off is
  last again", found when the sim had to pass or fail instead of print. Rule learned: a check that only prints is
  not a check; every script in the checklist exits non-zero when its target is missed.
  Also: British spellings had come back in the changelog, roadmap and comments (the -our and -re forms), so
  `npm test` now runs `scripts/test-spelling.mjs`, which fails on them. The sweep's first full run left 28 headless
  Edge processes behind and was cut short by a source file saved during it; the script now closes the browser and
  everything using its profile, and says so when the page reloads under it. Never edit files under `src/`,
  `index.html` or `styles.css` while a sweep runs. Pacing: v1.11.1 and v1.11.2 were fix and tool releases. At most
  one more M0 release (v1.11.3, the picture guard plus "What's new" and the release workflow) before the next
  release must move the game forward; if M0 is not finished by then, the rest of M0 rides along with M1 work.
- 2026-11-20 (v1.11.3): the words box shipped as v1.11.3. That makes three fix or tool releases in a row (v1.11.1,
  v1.11.2, v1.11.3), so **the next release must move the game forward (v1.12.0)**: the rest of M0 (picture guard,
  release workflow and "What's new", install and update tests, back button) now rides along with M1 boxes, one
  or two per release. Added four boxes from this build's picture review at the top of M1 (Lab words, steering
  arrows, portrait Main Street, small word polish). Rule learned, seen twice (v1.11.2's flags from a made-up save,
  and pictures taken with `show()` that never repainted the screen): pictures for review come from a real save
  and open each screen the way the player does. Also: the audit's "must be on screen" check only knew green
  buttons, so the Rank hint could fall off a short screen; it now names the hint and the Rank up button too. When
  a screen gains its one action line, add it to that check.
  Seen once: a sweep run alongside `npm run check` timed out loading the page at its 4th size; the same commit
  swept clean alone. If it happens again, give `load()` in sweep.mjs one retry and never run the two together.
- 2026-11-21 (v1.12.0): the first release that moves the game forward after four tool releases: a horn button
  (taken ahead of its turn as the smallest new thing to use), Turbo Lab in plain words and darker steering rims.
  The rest of M0 still rides along, one box per M1 release. Added an M0 box so the sweep's race pictures come from
  a played save and the sweep opens one sheet per screen: two v1.12.0 finds (the hidden horn in every race picture,
  a colon in a closed sheet) were things the pictures could never show. Rule kept from v1.11.3: a one-time tip goes
  in `turbodash.tips`, not the save, so it needs no save port. Next: Main Street in portrait or small word polish
  can ride along, but the next release's main piece is Faces and reactions or Rival of the week (after the
  hands-off fix), so the game keeps moving forward.
- 2026-11-21 (v1.12.1): a fix release from the M1 boxes in order: portrait Main Street, Lab benches, the Toy Track
  World camera, small words, and hands-off last at every level. The run started late: the scheduled run stopped
  at its very first command on a permission prompt nobody was there to answer. The owner asked for a lasting fix:
  `.claude/settings.local.json` (git-ignored) in the games folder and each game repo now allows the tools a run
  needs and denies force pushes and hard resets. Rule learned (seen with both the hands-off gate and the camera):
  first check that a tool measures what its name says. The "hands-off" bot pressed Turbo, and the camera's
  "8.5 steps back" was really about 12 at race speed. A probe picture of the exact moment (`--probe` with a script
  that moves the cars) found the camera cause in two tries. Keep such probes in `scripts/probes/`, and the sweep
  box above now asks for the curve frame. Pacing: v1.12.1 is one fix release, so the next release must move the
  game forward. Its main piece is **Rival of the week** (now unblocked by the hands-off fix), with **Faces and
  reactions** if it fits. The M0 picture guard and the sweep box keep riding along one per release.
- 2026-11-22 (v1.13.0): Rival of the week shipped, the main piece the last note asked for, so the game moved
  forward after one fix release. It came from a run that wrote the whole box, sim gate included, and then stopped
  before committing or releasing; its lock went stale and this run found the work uncommitted. Seen twice now (the
  v1.12.1 run stopped on a permission prompt): **commit each working step locally as soon as `npm test` passes**, so
  a run that stops leaves a commit with notes, not a dirty tree the next run has to judge. Next: **Faces and
  reactions** as the main piece (it reuses the rival card's car drawing), with the M0 sweep box riding along.
