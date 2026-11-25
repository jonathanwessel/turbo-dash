# Turbo Dash: plan

This file is the roadmap the scheduled task works through, every 4 hours. `ROADMAP.md` keeps the history, the
lessons learned and how the game fits together. `CHANGELOG.md` lists every release.

## How the task works through this roadmap
1. **Pick the next box.** Take the first unticked box in the first unfinished milestone. Work boxes in order for
   as long as the run lasts. A big box may take several runs: commit working steps, and note where you stopped.
   A new check counts as a working step only once it has passed and has been seen red on purpose; before the run
   stops, stash anything that has not (v1.18.0). A working step is committed only behind a passing test, chained
   with `&&` (`npm test && git commit ...`), never after a `;` (v1.21.0). Every step commit also writes a
   `Stopped at:` line in the box's Notes (what is done, what is left, which checks have run), so a run that ends
   early leaves the next one a map, not only commit titles (v1.22.0, seen twice: v1.18.0 and v1.22.0 were built by a
   run that stopped before its release with nothing in the box).
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
- **Measure a number before it ships** (v1.19.0). A new goal, price or power gets its number from the career run's
  counters or from the same seeded races with and without it, and the notes say how it was measured.
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
1. `npm run check` passes: `npm test`, the drawing budget (`npm run perf`), the picture guard
   (`npm run guard`), the sim gates (`npm run sim -- start`, `rival`, `boss`, `best`), the whole career run
   (`npm run career`), the strategy bots (`npm run bots`, v1.20.0), the install test and the update test, stopping
   at the first failure. It takes about 7 minutes. A picture guard failure is looked at in `.guard/` (the new picture and a pink diff): accept it
   (`npm run guard -- --accept`, and say so in the changelog) only when the race picture changed on purpose. Re-record the drawing budget (`npm run perf -- --write`) only when the picture gained
   something on purpose, and say so in the changelog. Run the full sim for any track, car or physics you changed.
   Write the day of Rank 40 and of each world opening (the career run's last line) in the notes. A change to car
   stats also checks that each sim gate orders cars by `statsFor` (with the home bonus), never by a raw data field.
2. `npm run sweep`: every screen at all 7 sizes in headless Edge with a throwaway save, about 20 minutes (run it in
   the background, and save no source file while it runs: the dev server reloads the page). No overlap, no spill,
   no "null". Pictures land in `.sweep/`.
3. Look at the sweep's pictures of every screen you changed, plus its race frame per world. Then a helper that sees
   only the pictures reads every visible line and flags anything a young player could not follow. Fixes made after
   the sweep are swept again at every size they can touch (`npm run sweep -- 740x360 ...`) before the commit.
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
- [x] **A picture guard.** One fixed, seeded race frame per world and one picture per screen, compared with the
  pictures kept from the last release. A large difference fails until the new picture is accepted on purpose.
  Notes: v1.17.0 (race frames for the four classic worlds; Toy Track World and the screens moved to the box below,
  since this box was too big for one run). `npm run guard` (`scripts/guard.mjs`, a step of `npm run check` right
  after the drawing budget): the dev server on 127.0.0.1:5184 and headless Edge with a throwaway profile
  (`scripts/cdp.mjs`). In the page it imports `src/engine.js` (the same module the game uses), builds its own Race on
  a 640x400 canvas, seeds Math.random, takes fixed 1/60 steps with the kid bot from `perf.mjs`, and keeps the first
  frame (car on the ground) where a boost pad has at least 3 of its 6 pieces in the open band just in front of the
  cars and no rival on the road up to it. All of it runs in one go, so the game's own frame loop can't step in. The
  accepted pictures are `scripts/guard/<world>.png` (83 to 152 KB each, committed). A pixel counts as changed when a
  channel moved by more than 40; a frame fails when more than 0.5% changed or one 8x8 block changed by more than
  30%. Two clean runs give 0.00% on every world. `npm run guard -- --accept` keeps new pictures on purpose; a failure
  writes the new picture and a pink diff to `.guard/` (git-ignored). Decisions on the way: the first try picked a
  frame by distance to the pad, and the pad sat under the cars (Moon, the car mid-jump) or behind rivals (Earth), so
  a missing pad changed too few pixels to fail; the frame is now picked by where the pad is drawn on screen. 16x16
  blocks missed a far pad; 8x8 blocks catch it.
  Earlier notes (2026-11-23, scoping): the classic road already draws a seeded frame headless in
  `scripts/perf.mjs` (Math.random seeded, fixed 1/60 steps, the kid bot steering). The guard can do the same in the
  sweep's headless Edge on the real canvas: seed Math.random, set up the race without starting the frame loop, step
  it a fixed number of times, call `render()`, and read the canvas. Keep the accepted pictures small (for example
  320x200 PNGs under `scripts/guard/`, committed) and compare them in the page (draw both on a canvas, count pixels
  that differ by more than a small amount). `-- --accept` writes new pictures on purpose. Toy Track World needs a
  fixed camera time as well; start with the four classic worlds and add Toy after. Screens are harder to keep
  still (animations, the town's cars): take them only after the race frames work.
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
- [x] **The sweep sees what a playing child sees.** Its race frames use a brand-new save, so every race picture
  shows the first-race lesson and hides the horn; take them from the Rank 16 save instead (one brand-new race frame
  stays, for the lesson). It also never opens a card's sheet (the Lab sheet's colon in v1.12.0 was found by reading
  code): open one sheet or pop-up per screen (Lab project, Garage upgrade, track card) and audit it. Also save one
  Toy Track World frame mid-race on the first sharp curve with a rival close behind the player
  (`scripts/probes/toy-curve.js`, from v1.12.1): the start-line frame could never show the camera problem that
  review found.
  Notes: v1.15.0, rode along with Boss rematches. Race frames now come from the Rank 16 save with the horn tip seen
  (`race-earth` ... `race-toy`), the sweep fails a played-save frame whose horn is hidden, `race-earth-new` keeps the
  brand-new lesson, and `race-toy-curve` runs the curve probe. Each size also saves pictures of cards that only open
  on a tap: the boss tab, a boss rematch intro, a boss result card and a Lab sheet. The audit opens boss intros (first
  meeting, Round 2, after the last round) and boss result cards (won and lost); the Lab sheet was already audited
  (since v1.12.0). Decision: the Garage and the track cards have no sheet (a tap on a track card starts the race,
  a Garage card buys), so the cards that open on a tap are the Lab sheet, the rival card, the boss intro and the
  result card, and all four are now audited filled in. What it found right away, all older than this release:
  the boss result line ran off the card, the tilted title box ran into the line under it on wide cards, the
  boss intro's Race button sat under the card's bottom edge at 740x360 for Major Wind-Up, and after a gift pick
  Next hid under the result card's edge on landscape screens from 360 to 600 px tall (the audit's "needs scrolling"
  check only looked at the screen's edge, now it looks at the card's edge too). All fixed.
- [x] **The picture guard for Toy Track World and the screens.** Toy Track World needs a fixed camera time and the
  three.js view on a canvas the guard reads (WebGL in headless Edge uses SwiftShader, so keep the accepted pictures
  from this machine). Screens need their animations held still (the town's cars, the Garage car's bounce, toasts):
  start with the Garage on the Rank 16 save, then the track list, then Main Street.
  Notes (v1.18.0, progress): Toy Track World is in. `scripts/guard.mjs` imports `src/toy/race.js` and
  `src/toy/view.js` in the page, builds its own ToyRace with its own ToyView on a 640x400 picture (the "light" look a
  tablet gets), seeds Math.random, steps 1/60 with a steer-to-the-middle bot, and keeps the first quiet moment (3 s
  in, on the ground, no pop-up, no shake) where at least 3 coins between 6 and 24 steps ahead are drawn in the open
  middle of the picture (projected with the view's own camera). The camera is snapped, the picture drawn and read in
  one go (a WebGL picture is gone once the browser shows it). The first try picked a frame by distance alone: it had
  four BAM! pop-ups stacked over the road and no coin in sight, so a missing coin would not have failed it; the pick
  is now by what is on screen (the v1.17.0 rule). Proved red: with the coins hidden in `view.js` the guard fails
  (0.53% changed, worst block 100%); put back, two runs give 0.00%. `scripts/guard/toy.png` is this machine's
  SwiftShader picture. Still to do: the screens (Garage on the Rank 16 save first).
  Notes (v1.21.0, done): the Garage, the track list and Main Street, from the career bot's Rank 16 save at 1280x800,
  each opened from its Main Street button. They run in a second page that holds still everything that moves or
  changes by itself: the clock stops at one moment (Date fixed, UTC, so the rival of the week and every timer read the
  same), Math.random seeded, one-time tips marked seen, every CSS animation and transition off (the town's cars and
  flags sit at their rest place), the race behind the menus and toasts hidden, and the frame loop held before each
  picture with the Garage car in one fixed pose (`garage.pose(0)`, a new three-line hook in `src/garage.js`). Three runs
  in a row gave 0.00% on all three. Seen red: with the Garage car's drawing switched off, the rival chip hidden and
  Main Street's ! badges hidden, all three failed (track list 2.09% changed, worst block 100%; Main Street 0.30%,
  100%; the Garage failed too). Put back, all 0.00%. Decision: one size (a tablet) is enough for the guard; the sweep
  covers the other sizes for layout. The guard takes about 80 seconds now.
- [x] **Android back button.** Back closes the open screen or card. On Main Street it asks before leaving.
  Notes: v1.20.0. `src/backkey.js` decides what a back press does, so `scripts/test-back.mjs` (in `npm test`) checks
  every one of the screens in index.html without a browser: a card taps its own button (OK, Not yet, Collect, the
  result card's 🏠 once the gift is picked), the Lab sheet and the Toy World level-up card close first, a race pauses,
  a menu screen does what its ◀ does, and the break and update screens wait. Main Street shows a new picture card,
  👋 "Stop playing?" with **🏁 Play** and **👋 Stop** (and the 🔊 speaker). In `main.js` one extra history step is kept
  while a screen catches back, and popstate runs the rule. Decision: the title screen and the Stop playing? card leave
  back free, so a second back there leaves the game the phone's own way, and nothing is ever lost (the save is
  already written). Stop tries `window.close()` and else shows the title screen. Seen red: a wrong button id and a
  Main Street that does not ask each fail the test. Proved in headless Edge with a real `history.back()`
  (`scripts/probes/back.js`): Main Street to Stop playing?, Play back to Main Street, the track list and the Garage
  back to Main Street, the Lab sheet closed first, a race paused. Not checked on a real Android tablet: the back
  gesture there, and whether Stop closes the installed app or shows the title screen, need the owner's eyes.
- [x] **Target:** with one boost pad's drawing removed on purpose, `npm run check` plus the picture guard is
  red. Put it back and it is green.
  Notes: passed in v1.17.0. With the boost pad drawing switched off in `drawRoad`, the guard failed on all four
  worlds (Earth 0.31% changed, worst block 100%; Moon 0.34%, 100%; Ocean 0.31%, 100%; Glacier 0.37%, 100%). Put back,
  all four were 0.00%. M0 stays open for the two boxes above.

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
  released it. Picture review (a helper that saw only the probe pictures): the big 3, 2, 1 and GO! covered the
  middle cars' faces, so the faces now stay 1.4 s past GO! (GO! shows for 0.9 s) and then fade over 0.6 s; the
  face taps on a short screen were 22 px, now 36 px slots (on screens under 430 px tall the row takes the place of
  the small cheer line under the title: with both, a re-sweep found Next 2 px off a 360 px screen); the player's car in the gold ring was a smudge, now
  drawn bigger; "Pick a treasure chest!" named gift boxes, now "Pick a gift!" (and the Lab's "Lucky Gifts").
  Decisions: no place numbers under the faces (the order reads from happy, the gold ring, then grumpy), and the
  older things it found went to the leftovers box below. Check on the release commit: career Rank 40 on day 548,
  Moon 106, Ocean 186, Glacier 282, Toy 411 (no rule changed). Sweep clean at 7 sizes. Not checked on a real
  tablet: the size of the faces over the cars needs the owner's eyes.
- [x] **Boss rematches.** A beaten boss comes back stronger for a bigger prize. The first rematch win gives a
  new paint.
  Notes: v1.15.0. Rules in `src/rules.js` (`bossRound`, `bossLevel`, `bossSpeed`, `bossPrize`, `bossPaintNext`,
  `bossReward`), numbers in `BOSS_ROUNDS` (data.js). After the first win a boss comes back for Round 2, 3 and 4,
  each 4% faster than the last, paying 2000, 3000 and 4000 coins (the first win still pays 5000 and the car). After
  Round 4 the boss stays at its fastest and a win pays 1000, as a repeat win did before. Round 2 gives the boss's own
  paint once: Bronze (Big Bruno), Starlight (Captain Luna), Sea Glass (Captain Kraken), Ice Wolf (Fang) and Gumball
  (Major Wind-Up), shiny, never sold, shown in the Paint tab with a 👑 until won. Decisions: 4% a round, found with a
  probe over the car ladder: with the world kits done each round needs the next car or two up, and the top round is
  beaten by the boss's own car or the next world's (`npm run sim -- boss`, now in `npm run check`, fails if any
  round of any boss has no car that wins 3 of 6). "Round 2" is the word on screen (a child knows rounds; "rematch"
  is a grown-up word). The boss card shows a crown per round won (up to 4), a red "Round N" pill and the next prize,
  with a 🎨 when the paint is next. The intro shows the boss's own rematch line and "Round 2! Win Bronze paint and
  🪙 2000!", and in Round 2 the boss's car is drawn in the paint the player can win. A win's result card says
  "ROUND 2 WON!" with only the prize on the line under it ("🎨 Bronze paint! +🪙2000"), the first win's line is
  "🚗 Thunder King! +🪙5000", and a loss says "Big Bruno wins!". Decisions: the title stays the boss's plain name
  ("Fang the Ice Wolf is back!" was too long for a short screen, and the rematch line already says it). The picture
  review (a helper that saw only the sweep pictures) found the paint dot on the boss card unclear (now 🎨), a lone
  💪 in the intro's corner that said nothing on its own (removed), "a new paint" that did not say which (now the
  paint's name) and a prize line that touched the card's edge at 740 and 800 px wide (shorter). Its other finds
  were already on screen before this release and went to the leftovers box below.
  Save v24: `bosses` counts wins (a v23 `true` is one win, so an old save gets Round 2 right away), with a port and
  two fixtures. The Museum keeps "Won Round N against ..." for Rounds 2 to 4 (its boss count still counts only
  "Beat ..."). The career bot now tries a rematch now and then on the world it races in: it won Rounds 2 to 4 of
  four bosses (Major Wind-Up's rounds are left for after Rank 40 in that run). Career on this build: Rank 40 on day
  542 (548 before, inside 5%), Moon 102, Ocean 184, Glacier 278, Toy 406. Check on the release commit: Rank 40 on
  day 552, Moon 107, Ocean 187, Glacier 281, Toy 413 (the bot's luck moves these a few days). Sweep clean at 7
  sizes, and again after the picture review fixes. Not checked on a real tablet.
- [x] **v1.12.1 picture review leftovers** (all on screen before v1.12.1, so that release shipped). Toy Track
  World start: the player's car blends into a pack of look-alike cars with navy roofs (a marker or a brighter
  outline for the player's car). Turbo Lab: the pip bar and "10/10" say the same thing twice, "MAX!" chips and card
  lines are about 11 px, and "Research makes EVERY car better!" sounds like a narrator. Main Street: "16" shows on
  the tower and in "16 Pro", and the red "!" on Gifts covers the Missions board. At 360x740 the coin counter
  touches the "16 Pro" badge (add 360x740 to the sweep). Garage: "Earth 13/13" has no picture for what it counts.
  Track cards: "Beach Boardwalk" wraps onto the trophy, and 1280x800 has an empty band over the cards. Portrait
  title: the QR box covers the car. The toy power-up boxes show "¿" when they spin upside down. From the v1.14.0
  review: on the result card at 740x360 the coin counter runs over the card's top corner, "Road coins" is a grown-up
  word, and the "Beat Rosie" line has only a small colored dot where Rosie's face (`drawFace`) would say who it is.
  From the v1.15.0 review: the result card shows three coin amounts (Prize, Road coins and a boss bonus) where one
  total would do; the rival of the week chip shows on the Boss and Cups tabs, where that rival never races; the
  green "MAX!" pill in the Garage looks like a button; in Toy Track World "BAM!" and "BOOSTER!" stack on top of each
  other; and the boss intro's car has a small white speed line beside it.
  Notes: v1.15.1, built over two runs (the first committed its work and stopped before the sweep; this run read
  that commit, checked it and released it). Toy Track World: a bouncing yellow arrow over the player's car while
  the start faces show, power-up boxes spin upright with a small wobble, and a newer popup pushes the older ones up a
  row. Lab: no "3/10" beside the bar (the sheet keeps the number), card words 15 px (were 13), the robot's narrator
  line is now "Bubbles! Fizz! Pop!". Main Street: no number on the Rank tower (a star with a shine), the Gifts "!"
  sits over the Gifts roof. Garage world chips read "🚗 13/13". Long track names shrink to one line, and on
  landscape screens 600 px and taller the track cards are taller (no empty band). Portrait title: the share code
  sits in the sky under the logo. Result card: one coin total (prize, road coins and a boss's prize together), the
  boss line only names the car or the paint, the rival line shows the rival's grumpy face, and the coin counter
  no longer reaches the card at 740x360. MAX! is a flat green word in the Lab and the Garage. The rival chip hides on
  the Boss and Trials tabs. The shiny gleam is clipped to the car body (the "white speed line" in the boss intro).
  Added 360x740 to the sweep, as the box asked. Its first run found three more things at that size, all fixed: the
  logo under the Install button, the coin counter and Rank pill side by side (the Rank pill and the Next sign now
  have their own rows on screens up to 500 px wide), and the boss name squeezed into the world picture (taller
  cards). A probe picture also found the race tabs cut at both edges at 360 px (narrower padding) and the rival's
  coin touching the name on the result card. `scripts/test-words.mjs` now checks the coin total, the Lab robot's
  lines, the tower number and the Lab bar's "3/10". Not checked on a real tablet or phone.
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
- [x] **Target:** the race sim shows every track still has a result the "kid" driver can reach with the car
  one step above the starter, with the rival of the week at its cap. The career run reaches Rank 40 within 5% of
  the day it does today.
  Notes (v1.13.0, progress): `npm run sim -- rival` is in `npm run check` and passes: for each track, the car one
  step above the slowest car that wins it still wins at least 3 of 8 with Rosie at the cap (32 tracks, lowest 5 of
  8 on Earthrise and 6 of 8 on Moonbase). Career with the rival in: Rank 40 on day 550 (552 before, inside 5%),
  Moon 107, Ocean 188, Glacier 284, Toy 412, the rival beaten below the cap 401 times for 215,975 bonus coins.
  Stays open until the rest of M1 (faces, boss rematches) ships, since it gates the whole milestone.
  Notes (v1.15.0, progress): career Rank 40 on day 552 on the release commit (548 before), inside 5%. Faces and boss rematches have
  shipped; the leftovers box is the last M1 box before this target is judged.
  Notes (v1.15.1, passed): every M1 box has shipped. On the v1.15.1 release commit `npm run sim -- rival` passes on
  all 32 tracks with the rival of the week at the cap (28 tracks win 8 of 8, the lowest 5 of 8), and the career run
  reaches Rank 40 on day 549 (Moon 103, Ocean 184, Glacier 280, Toy 410), inside 5% of the 552 measured when this
  target was set. The check on the commit before it said day 544: the bot's luck moves these a few days. M1 is done.

### M2. Cars that feel different (v1.13)
- [ ] **v1.15.1 picture review leftovers** (all on screen before v1.15.1, so that release shipped). Garage: the
  green "✓ Driving" looks like a button but only shows a state (make it a flat mark like MAX!), at 360x740 the
  "Garage" title touches the back button, and the world chips' "🚗 13/13" is small. Lab words a young child may not
  follow: "Robot plug", "Softer bonks", "Brain Chip Socket". The result card's "Upgrade your car and try again,
  Racer!" leaves "Racer!" alone on a line at 360 px. "More worlds" has a dashed outline and does not read as a
  button. The track and cup lists show a gray scrollbar in desktop browsers (thin or hidden, the cards still
  scroll). Main Street at 1280x800 has a hard color seam in the sky. On a 360 px phone a long track name such as
  "Beach Boardwalk" shrinks to about 14 px (the shrink rule is sized for landscape cards). Done in v1.16.0: "✓ Driving" is a flat
  green mark. Done in v1.17.0: the track, cup, boss and trial lists have a thin yellow scrollbar instead of the gray one. Decided to leave: the rival chip and the
  boss card's prize row are pictures without words (decided in v1.13.0 and v1.15.0), Super Paint has no level bar
  (it has one level), and the player's name and the home town stay (owner decision).
  Added from the v1.18.0 picture review (all on screen before v1.18.0): the world preview card says "Opens with Rank 20
  and the Moon Tires research" ("research" is a grown-up word) and "Take a peek! One lap of Crater Hop in a mystery
  car. No coins or prizes in a preview." (three sentences, the last one reads like a manual); its mystery car's roof
  is cut flat under the words at 1024x600 and 1280x800; the car kinds card leaves "roads." and "much." alone on a line
  at 1024x600 and 1280x800; the small "Not yet" and "OK" buttons have small words in a narrow box; at 360x740 the
  rival and preview cards run edge to edge and the preview arrows touch the screen's edge.
  Added in v1.19.0: the special car's counter ("⭕ 137 / 500") only shows in the Garage. Show it where the child
  collects (for example a small ⭕ counter with the car's dark shape on the world's track list or the result card).
  Done in v1.20.0: a chip on each world's track list with the car's mystery shape and its counter (`earnLine`, the
  same words as the Garage, a test says so), and a tap opens the Garage on that car.
  From the v1.20.0 picture review (all older than v1.20.0 unless said): the Garage on a mystery car shows the four
  upgrade cards with padlocks and prices the player could pay, so a tap seems to do nothing (hide them or show one
  big padlock); "This car is still a mystery!" is pale pink and easy to miss; at 740x360 the button under the bars
  ("✓ Driving", or the counter on a mystery car) is cut by the screen's bottom edge; Garage labels ("Go faster", the
  13/13 and 0/4 counts, Speed, Power, Turning, Turbo) are about 10 to 11 px at 740x360 and 1024x600; "137 / 500" is
  a big number for a young child (a bar that fills toward the car may read better, on the chip too, new in v1.20.0);
  the rival chip and the counter chip both use circles and look alike side by side (new in v1.20.0); on the boss card
  the crowns do not show how many rounds are left. Fixed in v1.20.0: the Garage's sideways scroll at 360 px.
  From the v1.19.0 picture review (older than v1.19.0 unless said): on the All cars grid a price the player can't
  pay yet is white, not red ("have / need, red when short"); "Deep Blue, Rank 25" under a far world's car reads like
  a manual; the ⭕ counter picture is red while the Moon's boost rings are blue (new in v1.19.0); the home and power
  lines under a car's name are about 12 px at 740x360 and 360x740. Decided to leave: the Fast / Grippy / Tough pill
  looks like a button because it is one (it opens the car kinds card), and the world icon after a car's name is the
  home mark.
- [x] **Three traits per car, shown as words and pictures:** Fast, Grippy, Tough. A fast car slides more. A
  grippy car is slower on the straight. A tough car loses less speed on a bump. No bare numbers on the card.
  Notes: v1.16.0. Decision: "three traits" read as three kinds of car, one kind per car (a pill with a picture and
  one word), because the card already shows Speed, Power and Turning bars, and three more meters would say the same
  thing twice. `TRAITS` and one trait per car in data.js, the rules in `statsFor` (`slide`, `tough`) and
  `bumpKeep` (physics-common.js), so both engines, the sim and the career run share them. Fast: top speed x1.03,
  curves push it out x1.3. Grippy: curves push it out x0.7, top speed x0.975. Tough: a bump costs half as much speed
  (barriers, guardrails, trees when steering back, puddles, snowbanks, other cars, Toy Track World walls), and it
  speeds up x0.88. Riding the trees hands-off stays a hard stop for every kind. 8 Fast, 8 Grippy, 9 Tough, mixed
  along the ladder (Zippy is Fast). 13 physics tests (each fails on the old engine), word tests for the lines.
  Found by `npm run sim -- rival`: the trait speeds reorder neighbors on the ladder (Grippy Shark Fin is now a bit
  slower on top than Fast Green Machine), and the gate sorted cars by the raw `speed` number, so its "one up" car
  could be one that is really slower. Decision, in the open: the rival and boss gates now sort by the real top speed
  on each track (trait and home bonus); the target itself (3 of 8 with the rival at the cap) is unchanged. With
  that, every track passes (lowest Earthrise 4 of 8 at the cap) and every boss round has a car. Garage: a pill
  beside the name (a tap opens a card of the three kinds, each with a car, the car on show when it is that kind),
  the kind's picture on the All cars grid, and the card once by itself the first time the Garage opens
  (`turbodash.tips`, no save change), after which the pill glows. The sweep and the audit open the card filled in,
  first visit and from the pill. A long name plus the pill wrapped and pushed Drive off a 740x360 screen: a long
  name now shrinks to share the line. Career on this build: Rank 40 on day 548 (549 before), Moon 106, Ocean 185,
  Glacier 278, Toy 408. Picture review (a helper that saw only the sweep pictures): the highlighted tile of the
  car's own kind looked like a choice to pick (all tiles now look the same), a dark car vanished on its dark tile
  (a light spot under each car, lighter tiles), the Fast and Grippy cars did not say their kind (the Fast car shows
  its flames, the Grippy car its wheels turned), "straights" and "Bumps slow it less" were grown-up words (now
  "Zooms on straight roads. Slides on turns.", "Turns well. A bit slower.", "Bumps don't slow it much. Slow to
  start.", each sentence on its own line, so no word is left alone on a line), the yellow bolt vanished on the
  yellow pill (Fast is red now), and the coin counter covered the card's corner at 740x360 (hidden on this card).
  Its older finds (the Garage title by the back button at 360 px, the "🚗13/13" chips, full bars that do not show
  the kind) are in the leftovers box above or belong to the "Best on" box. Check on the release commit: career Rank 40 on day 549 (Moon 105, Ocean 186, Glacier 280, Toy 409), inside 5% of the 549 before. Sweep clean at 8 sizes, and again after the review fixes. Not checked on a real tablet: how the slide feels on the Fast cars needs
  the owner's eyes.
- [x] **A "Best on" badge** on each track card, and a matching badge in the garage.
  Notes: v1.17.0. Decision: "best" means the best of the player's own cars, because at full upgrades the sim's
  fastest car wins on all 32 tracks (Wind-Up Racer), so a badge naming one car for the whole game would say nothing.
  (Making every car the best pick somewhere is this milestone's target, for the strategy bots box.) The rule is in
  `src/best.js`: a car's pace on a track is its top speed there (upgrades, trait, home-world bonus) with a small share
  for a longer Turbo and quicker starts (fitted against whole races; top speed alone matched the sim 94% of the time
  and was up to 5.7% off, the fitted pace 96 to 98% and at most 3.4% off on garages it was not fitted on). The car
  being driven keeps the title unless another is at least 1% faster. A track card shows a yellow Best pill with that
  car's picture beside the medal, only when it is not the car being driven (labels stay quiet; decision after the
  corner badge covered the track picture at 740x360 and the stars at 360x740). The first one opens a picture card
  once ("Best car here!", the track's picture, the car, "Your Champion X is faster on Sunny Hills. Pick it in the
  Garage.", `turbodash.tips`, no save change), then the pill glows. The Garage shows a "🏆 Best" row under the car's
  name with the first five open tracks where that car is the best of the player's cars, and "+N" for the rest. Both
  screens use `chipFor` and `bestTracks`, and `scripts/test-best.mjs` checks they agree on every track for the
  Rank 16 save and 30 random saves (one state, one source). `npm run sim -- best` (in `npm run check`, about a
  minute) races every pick in 25 garages on all 32 tracks: on the first run the pick was the fastest car 771 of 800
  times, at worst 3.0% slower, and no badge asks for a swap to a car that is not faster than the one being driven.
  The Rank 16 save drives its fastest car, so the sweep and audit switch it to Zippy to open the pill and the card
  filled in. No race, prize or price changed, so the career run is unchanged by design. Picture review (a helper that
  saw only the sweep pictures): the pill's car and word were tiny at 740x360 (now at least 26 px and 12 px), the
  Garage's track pictures were about 15 px (now at least 22 px), "+10" had no unit ("+10 more"), the Garage used a
  trophy where the track pill shows a car (both are now a flat yellow "Best" mark, no border, so neither looks like a
  button), and the card said "Pick it in the Garage" with only an OK button, so the child could not act on it. The
  card now says "Champion X is faster here than Zippy." with **🚗 Drive it!** (drives that car and shows the list
  again) and **OK**. Left as is: on an upright phone the pill moves the medal to its own row, so about 1.5 track cards
  fit on screen instead of 2.5 (only when a pill shows). A tap on the pill itself does not switch cars (the whole
  track card starts the race). Check on the release commit: career Rank 40 on day 547 (Moon 104, Ocean 187,
  Glacier 280, Toy 408), inside 5% of the 549 before. Sweep clean at 8 sizes, again after the review fixes, and at the
  three sizes the last text fix touches. Not checked on a real tablet.
- [x] **Explainers read aloud.** games/CLAUDE.md asks for a speaker button on every first-time explainer that reads
  it with an on-device voice only (`speechSynthesis` with a local voice, never an online one), and Turbo Dash has
  none yet. Start with the car kinds card, the rival of the week card and the boss intro. Hide the button when the
  device has no local voice.
  Notes: v1.18.0, built by a run that committed it and stopped before the release; the next run released it.
  `src/speak.js`: `pickVoice` takes only voices the browser marks `localService`, English (US first), and never one
  named Online, Natural or Cloud, and never the browser's default voice (it can be an online one). No such voice
  hides every speaker. A round yellow 🔊 sits at the end of the buttons on the car kinds, rival of the week, boss
  intro, Best car and world preview cards; the words it reads are the card's `[data-say]` parts on screen, with
  coins said as "300 coins" and pictures and quote marks dropped (`sayLine`). It pulses while it talks, a second
  tap stops it, and leaving the card or hiding the app stops it. `scripts/test-say.mjs` (in `npm test`) checks the
  voice pick and the spoken line; `scripts/say-test.mjs` (in `npm run check`) taps the speaker with a real DevTools
  mouse event in headless Edge, because a browser only speaks after a real tap, and on this machine heard "Microsoft
  David" (a local voice) start, pulse, stop on a second tap and stop on leaving the card. The audit flags a picture
  card with no speaker when a voice exists, and counts the speaker in its "must be on screen" check. Decision: the
  sweep shows the speaker even on a machine with no voice (`fakeVoice`, dev builds only), so the pictures always
  have it. No race, prize or save change, so the sim and career numbers move only by the bot's luck: on this
  build's check career Rank 40 on day 544 (Moon 105, Ocean 181, Glacier 277, Toy 405). The sweep found the speaker
  under the boss card's edge at 1024x600 (a smaller face and car there now). Picture review (a helper that saw only
  the sweep pictures): the speaker squeezed its row so "Preview lap" and "Not yet" broke onto two lines (the buttons
  beside it now keep one line, and the speaker moves under them when the row is too narrow), and the gray speaker
  picture was faint on the yellow (drawn darker). Decision: a speaker under the buttons on a narrow card stays,
  centered (a speaker in the card's corner was considered, but it would sit on the big titles at 360 px). Its older finds
  went to the leftovers box at the top of M2. Check on the release commit: career Rank 40 on day 543 (Moon 104,
  Ocean 184, Glacier 277, Toy 405), the Toy guard frame 0.00%. Sweep clean at 8 sizes, then again at the sizes each
  review fix touched (1024x600; all 8; 360x740, 800x1280, 1280x800). Live install test ok. Not checked on a real
  tablet: which voices an Android tablet marks as local, and whether it speaks offline, need the owner's ears.
- [x] **A second special car per world,** earned by play: a Moon hopper that jumps farther, a submarine that
  ignores currents, an ice car that does not slide.
  Notes: v1.19.0. Decision: "per world" read as all four worlds, so Toy Track World got one too (the Boost Buggy,
  boosters fling it farther). The cars are never sold and never a cup or boss prize: each is earned by the world's own
  counter, which old saves already keep (`S.stats`), so no save change. 🦘 Moon Hopper for 500 boost rings, ⚓ Deep
  Diver for 900 pearls, 🧊 Snow Cat for 120 drift boosts, 🚀 Boost Buggy for 80 loops. The powers live in `PERKS`
  (data.js) and `statsFor`: jump x1.35; `fins` 1 (currents can't push it); `studs` 1, and the engine skips the
  ice slide when studs reach 1 (Snow Chains top out at 0.5); booster x1.12. `earnCars` (rules.js) runs after every race
  and Time Trial and when a save loads ("New choices reach old saves": a save with enough rings gets the Hopper on
  load and sees the card on Main Street). Goals measured, not guessed: the first goals (120 rings and so on) gave the
  Hopper one bot day after the Moon opened, so the career run printed the counters every 5 days (about 50 rings, 90
  pearls, 8 drifts, 8 loops a bot day at first) and the goals were set for about 10 bot days into each world. The
  bot drifts little after its first weeks on ice (its count stops near 220), so the Snow Cat goal stays low.
  Balance measured too (48 kid-driver races per car, same seeds with and without the power): the booster power at 30%
  won a whole race by 9%, the others by under 1%, so the booster is 12% (about 2.5%). `npm run sim -- best` then
  failed twice: the Best rule ignored the Buggy's power in Toy Track World (it now counts each power's measured share,
  `PERKS.pace`, on home tracks only), and it named the Buggy (Fast) on a Moon track where it slid slower than Loop
  Legend. Decision: the Buggy is Tough and the Hopper Fast (9 Fast, 9 Grippy, 11 Tough). Seen red: with the powers
  switched off in `statsFor` nine physics checks fail; without the engine's ice change the Snow Cat check fails; with
  the earn rule off by one, 14 of 50 earn checks fail. Look: the Moon Hopper rides on two drawn springs, the others use
  existing bodies in new colors. A "New car!" picture card (car, power picture, one line, 🚗 Drive it!, OK, 🔊) shows
  over the result card, or on Main Street for a save that earned cars on load. The Garage shows "⭕ 137 / 500" on a
  car still to win and the power beside the home line on an owned one. The sweep found the power line pushed the car
  into the title at 740x360 and 915x412 (it now sits beside the home line), and the audit's late-game Garage (cars
  from five worlds) found the world chips running into the upgrade cards at 1024x600, older than this release (with
  more than three chips each shows its world's picture now). Swept again clean at those sizes. Machine: the release
  check's read-aloud step failed with "synthesis-failed" while Windows listed no audio device at all; `say-test` now
  reports that one case as NOT CHECKED in plain sight. Picture review (a helper that saw only the sweep pictures): the
  Garage's Turbo flames sat on the Hopper's springs and looked like spikes (the springs moved inward, swept again at
  740x360 and 1280x800); its older finds went to the leftovers box. Check on the release commit: career Rank 40 on
  day 555 (Moon 107, Ocean 185, Glacier 286, Toy 417), within 3% of v1.18.0's 543; Hopper day 118, Diver 197, Snow Cat
  295, Buggy 423; Best picks the fastest car 775 of 800 times, at worst 2.4% slower; the voice was NOT heard (no sound
  output on this machine). Live install test ok. Not checked on a real tablet.
- [x] **Strategy bots.** Speed first, grip first, coins first and Auto Steer, each over several seeds.
  Notes: v1.20.0. `CAREER_BOT` and `CAREER_SEED` in `scripts/career.mjs` (the default "kid" bot, the release gate's,
  plays exactly as before; `Math.random` is seeded with the physics `rng` when a seed is given). speed: Engine and
  Turbo first, Head Start, Turbo Tanks and Pit Crew first in the Lab, and it drives the fastest car it owns on each
  track by the game's own Best rule (`bestCar`, so not by a raw `speed` field). grip: Tires first, Bumper Shield first,
  and its best Grippy car unless another is more than 5% faster there. coins: Magnet first, Coin Boost, Lucky Gifts,
  Magnet Field and Pit Crew first. auto: the Robot Brain chain and Auto Steer before anything else, and from Auto Steer
  level 20 it stops steering and only taps Turbo and power-ups (the idle player). Decision: the world kits stay at the
  front of every Lab order, so no strategy walls a world off. `npm run bots` (`scripts/bots.mjs`, a step of
  `npm run check`, about 3 minutes) plays 3 seeds of each plus the kid bot side by side and fails when a strategy's
  average day for Rank 10, 20, 30 or 40 is more than 25% after the best strategy's, or any run is stuck. It also
  prints what did the work: races per car and upgrades bought. Seen red: a trap "speed" bot that only drives Zippy
  never reaches the cap and fails all four milestones. Numbers (3 seeds, average day): Rank 10 speed 31, grip 30,
  coins 33, auto 27; Rank 20 90, 89, 92, 89; Rank 30 271, 271, 271, 269; Rank 40 554, 557, 554, 552 (kid 554). The
  slowest is behind the best by 21% at Rank 10, 4% at Rank 20, 1% at Rank 30 and 1% at Rank 40. What it shows: by
  Rank 40 every bot has bought every upgrade on every car (145 of each), so the order of spending only matters early,
  and the late game is paced by the rank gauges and Lab timers, not by coins. Blizzard Wolf, Champion X and Wind-Up
  Rocket do the most racing (about 15 to 20% of races each); no car carries more than 21%. Check on the release
  commit: career Rank 40 on day 554 (Moon 107, Ocean 190, Glacier 286, Toy 416), inside 1% of v1.19.0's 555; bots the
  same numbers as above (the runs are seeded); the voice was NOT heard (no sound output on this machine). Sweep clean
  at 8 sizes after the review fixes. Live install test ok. Not checked on a real tablet.
- [x] **Every car has a place at the end** (added in v1.20.0, the target below found it). Fully upgraded with every Lab
  project, Wind-Up Rocket is the best pick on all 32 tracks by the game's own pace rule (6% ahead of the Boost Buggy on
  Earth, Moon and Deep Blue tracks, 3.3% ahead of Blizzard Wolf on the Glacier Rink), so the end-game garage has one
  car. Make the top cars sidegrades, not a ladder: for example a bigger home-world bonus for each world's top cars so
  each wins at home, and tracks with a character the traits answer (Grippy best on twisty tracks, Tough on bumpy ones,
  Fast on long straights). Measure it with `npm run sim -- best` style races, keep "winning is earned" and the early
  ladder as they are, and re-run `npm run sim`, `npm run career` and `npm run bots`.
  Notes (v1.21.0, done): measured first. `scripts/probes/kinds.mjs` races one car as Fast, Grippy and Tough with the
  trait top speed switched off: on their own the traits change race times by about 1% (curve slide and bump loss
  hardly matter to the kid driver), so they could never decide which car is best. Decision: **track kinds**. Every
  track is a Fast, Grippy or Tough track (`track.kind`, data.js), shown as a round badge on its card in the trait
  pill's color, and a car of that kind is 6% faster there (`kindBonus`, physics-common.js). It replaced the traits'
  old top speed (Fast +3%, Grippy -2.5% everywhere). Kinds were picked from what each trait does on the track's road,
  then shared so each world has more than one kind and each kind has at most 10 or 11 tracks. Sunny Hills became
  Tough, not Fast: as a Fast track the starter car (Fast) won the first race and `npm run sim -- start` went red. The
  home bonus went from 5% to 10%, because at 5% the trio of Toy cars took every kind everywhere (32 tracks cannot
  split three ways into a third each). The Boost Buggy's booster power went from 12% to 5%: measured with
  `scripts/probes/perk.mjs` (the car with and without its power, whole races) it was worth 8.4% of a race at full
  upgrades and took all four Toy tracks, while the Best rule counted 2.5%. Now it is worth 3.0% and the rule counts 3%.
  The same probe shows the other three powers are worth about 0% of a race (hop -1.1%, steady -0.1%, studs +0.1%):
  they change how the car feels, not its time. `scripts/probes/endgame.mjs` (every car fully upgraded with every Lab
  project): the Best rule and real races now agree on every track, Wind-Up Rocket 9, Loop Legend 10, Boost Buggy 10,
  Snow Cat 2, Blizzard Wolf 1 (before: Wind-Up Rocket 32 by the rule, 28 in races). At Rank 16 the save's garage has
  three cars with a place (Champion X on Fast tracks, Thunder King on Tough, Galaxy GT on Grippy). The car kinds card
  says "Zooms on ⚡ tracks" and opens once from the first track list of a player with more than one car (tip `kinds`),
  and the badge in view glows after OK. GO shouts the bonus with its pictures. Read aloud says "Fast tracks". The
  career run now reports which cars are ever the Best pick and fails when one car is the best on more than a third
  of the tracks at the end (seen red on v1.20.0's code: Wind-Up Rocket on 32). Not checked on a real tablet.
  Check on the release commit: career Rank 40 on day 543 (Moon 106, Ocean 181, Glacier 280, Toy 408), 22 of 29 cars
  ever the best pick, at the end Boost Buggy 10, Loop Legend 10, Wind-Up Rocket 9, Polar Bear 2, Blizzard Wolf 1;
  bots 17%, 6%, 2%, 1% apart, kid seeds 24, 23, 22 ever best. Sweep clean at 8 sizes after the review fixes. Live
  install test ok, GitHub release made from the tag.
- [x] **Side cars have a place** (added in v1.21.0, the target below found it). Nine cars are never the Best pick of the
  bot's garage on an open track in some careers, and three in every seeded kid career: Green Machine, Fire Dash and
  School Resource Officer. They are side prizes (a cup, the Fire Station, the School) that arrive slower than the
  cars the garage already has, and Rocket Rex, Gold Rush, Barnstormer, Polar Bear, Toy Racer and Manta Ray are often
  passed by. Give each a place where it is the best for a while: for example a home of its own (the Fire Station's
  truck on a Tough Earth track it is built for), or a speed that puts it just ahead of the cars a player has when it
  arrives. Measure with the career's "Best pick at some point" line over several seeds, and raise the floor in
  `scripts/bots.mjs` (22 now) as it goes up, until it is 29 of 29.
  Notes: v1.22.0. Built by a run that committed it and stopped before the release, with no note here; the next run
  checked it and released it. Decision: **home tracks**. Each of Earth's six prize cars has one Earth track of its own
  (`car.home`, data.js) with the same 10% home bonus a world's cars get in their world (`homeBonus`,
  physics-common.js): Green Machine on Desert Dash, Barnstormer on Autumn Forest, Gold Rush on Pirate Port, Fire Dash on
  Robot Factory, School Resource Officer on the night track, Rocket Rex on County Fair. Each home fits the car's story and,
  where it can, its kind. Polar Bear became Grippy and Toy Racer Fast, so each meets a track kind its neighbors do not
  cover. The Garage line says "🤖 Faster on Robot Factory", the car's name carries the track's picture, the Best
  badge and GO's "🏠 BONUS!" use the same rule. Measured: the career's never line now prints how short each car came
  (the gap to the best car, on which track and day), so a fix aims at the real shortfall. Result: 29 of 29 cars are
  the best pick at some point on all three seeded kid careers in `npm run bots` (24, 23, 22 before) and on the default
  career run, so the floor in `scripts/bots.mjs` is now every car. Tests: the home track physics checks (a home is a
  real Earth track, one car each, the bonus only there, the Garage words, GO's shout) and the Rank 16 save's Best
  chips. Check on the release commit: career Rank 40 on day 547 (Moon 106, Ocean 187, Glacier 279, Toy 411), inside 1%
  of v1.21.0's 543 to 555. At the end Boost Buggy 10, Loop Legend 9, Wind-Up Rocket 9, Snow Cat 2, Blizzard Wolf 1,
  Polar Bear 1 of 32. Bots 13%, 5%, 1% and 1% apart at Rank 10, 20, 30, 40 (17%, 6%, 2%, 1% before). Best badges pick
  the fastest car 772 of 800 times, at worst 3.0% slower. The starter car still does not win the first race. Not
  checked on a real tablet.
- [ ] **v1.21.0 picture review leftovers** (all older than v1.21.0, so it shipped; take one or two as a release's
  polish). On a 360 px upright phone the rival of the week's card runs to both screen edges and its border is cut,
  and the Garage title sits against the ◀ button. The Garage's world chips wrap Moon Base and Deep Blue onto two lines
  while Earth stays on one. The Best card says "faster here than Zippy" to a child who may not know the car's name
  (a picture of the car being driven would say it). The What's new card scrolls when many releases are listed, so a
  child who cannot read never sees the lower lines.
  From the v1.22.0 picture review (all older than v1.22.0): on the Toy curve frame "BOOSTED!" and "BAM!" show at the
  same time, faded and stacked, so neither can be read; cars at the left edge of a race pass under the horn and steer
  buttons, and the gray steer arrow is faint on Glacier snow; the track list's corner signs and the special car's
  counter chip have no word, and "Trials" is a grown-up word; the 1280x800 and 1920x1080 sky seam (also in the box at
  the top of M2).
- [ ] **Special car powers help at home** (added in v1.21.0, found by `scripts/probes/perk.mjs`). Measured in whole
  races at full upgrades, three of the four powers are worth nothing to a race: the Moon Hopper's high jump -1.1% (it
  is a little slower with it), the Deep Diver's steadiness -0.1%, the Snow Cat's studs +0.1%. Only the Boost Buggy's
  boosters count (3%). A child who earns one of these cars should feel it win more at home. Give each power a real
  effect where its world has the thing it changes (for example rings collected in the air count double for the
  Hopper, or a current pushes it forward instead of sideways), measure it with the probe, and keep the end-game
  spread (no car the best on more than a third of the tracks).
- [ ] **Target:** every car is the best pick on at least one track, no car is the best pick on more than a
  third of them, and the four bots reach Rank 40 within 25% of the best one.
  Notes (v1.20.0, progress): the bots part passes (+1% at Rank 40, gated in `npm run check`). The car part does not:
  Wind-Up Rocket is best on 32 of 32 tracks at full upgrades. Decision, in the open: "every car" cannot mean every one
  of the 29 cars on 32 tracks at the end of the game (Zippy can never be best there, and the ladder is how the game is
  earned). Read it as two lines, measured by the Best rule in the career run: every car is the Best pick of the bot's
  own garage on at least one open track at some point of the career, and at the end no car is the best pick on more
  than a third of the tracks. The box above works on the second line.
  Notes (v1.21.0, progress): the second line passes (the most any car has at the end is 10 of 32, gated in
  `npm run career`), and the bots still pass (17%, 6%, 2% and 1% apart at Rank 10, 20, 30 and 40). The first line does
  not: 20 to 24 of 29 cars are ever the best pick over six seeds (it was 15 of 29 before the track kinds). The box
  "Side cars have a place" above works on it, and `npm run bots` holds a floor of 22 on its seeded kid runs, so the
  count cannot slip back while it does.
  Notes (v1.22.0, passes): all three lines pass on the release check. 29 of 29 cars are ever the best pick (all three
  seeded kid careers and the default run, gated at 29 in `npm run bots`), the most any car has at the end is 10 of 32
  (gated in `npm run career`), and the bots reach Rank 40 within 1% (gated in `npm run check`). Decision: leave this box
  open until the two boxes above it are done (the picture leftovers and the special car powers), because the powers
  box can move the end-game spread. Tick it in the release that closes the last of them, after re-running the gates.

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
- [x] Holiday decorations on Main Street by the calendar.
  Notes: v1.22.0's polish. `src/holiday.js` picks the holiday from the date, any year: fall (pumpkins, orange trees and
  a scarecrow, 1 October to 30 November), winter (snow, string lights, snowmen and a big tree with a star, 1 December to
  6 January) and summer (flags and fireworks, 28 June to 7 July). Most of the year has none. The big decoration stands
  in the widest gap, between the School and the Bank, behind the buildings so a building's tap always wins, and a tap
  makes it jump with a little tune and confetti. Main Street is drawn again when the calendar moves into another
  holiday while the game is open. No save change. `scripts/test-holiday.mjs` checks the windows (seen red with winter
  running to 7 January, the picture guard's day), one holiday a day, every building still there to tap, and each
  drawing. The audit taps each decoration at every size, and the sweep shoots Main Street for each holiday.
  Decision: no explainer card. It is a decoration with one tap that only plays, and a card would block the street.
  The release run's full sweep found the Garage's Drive it! under the edge at 1024x600 on every home-track car (the
  home line is one more row; the run that built it never ran the sweep): that size now gets the smaller car picture
  and tighter rows. Picture review (a helper that saw only the pictures): fall did not read as fall (the hills and
  grass turn gold now), and the summer fireworks reached the coin counter at 1000x448 (lower now). Both are node
  checks in `scripts/test-holiday.mjs`, seen red on the old drawing. Decided to leave: the scarecrow's arms pass
  behind the School and Bank roofs (it stands behind them on purpose, so their taps win), and the Garage's home line
  and Best row both name the home track (two facts: faster there, and the best of the player's cars there).


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
- 2026-11-22 (v1.14.0): Faces and reactions shipped, the second release in a row that moves the game forward. The
  run that built it committed its work and then stopped in its sweep, so this run only had to check, review and
  release (the commit-early rule paid off). This run's sweep timed out at 1280x800 while another game's headless
  smoke test was running; the same sizes swept clean right after. That is the second sweep timeout from a busy
  machine (2026-11-20 was the first), so `npm run sweep` now waits, up to 20 minutes, until no other headless Edge
  runs, and says so (probes do not wait). Rule: **a sweep or check timeout is first checked against other
  headless browsers on the machine, never "fixed" in the game.** The picture review again found a thing only a
  moving picture shows (the countdown covering faces): probes for a new on-screen thing take one frame in the
  countdown and one just after GO!. Also seen in this run: a review fix (a taller face row) was checked with a probe
  picture only, and the next sweep found it pushed Next off a short screen. Rule: **every change made after the
  sweep is swept again at the sizes it touches before the release commit.** The M0 sweep box did not ride along this time (the run went into finishing
  v1.14.0); the next release takes **Boss rematches** as its main piece and the M0 sweep box with it, since the
  sweep still opens no sheets and shoots no result card.
- 2026-11-22 (v1.15.0): Boss rematches shipped as the main piece, with the M0 sweep box riding along, as the last
  note asked. Third release in a row that moves the game forward. The sweep's new pictures of cards that open on a
  tap found four layout problems that were already live (a boss line off the card, a tilted title box into the
  line under it, Wind-Up's Race button under the card's edge, Next under the result card's edge after a gift pick
  on screens 360 to 600 px tall). Rule learned, seen twice now (the rival card in v1.13.0 and these): **a card that
  opens on a tap is not checked until the sweep opens it filled in**, so every new card gets a sweep step with real
  content the release it appears. The audit's "needs scrolling" check also only looked at the screen's edge; it now
  looks at the edge of a card that scrolls. Two sweeps timed out mid-run when another game's headless test started
  after the sweep had checked for a quiet machine (the third and fourth sweep timeouts from a busy machine, after
  2026-11-20 and v1.14.0); the same sizes then swept clean. `npm run sweep` now waits for a quiet machine and runs a
  timed-out size once more, instead of failing the whole run. Also, this run once saved a source file while a sweep
  was running (the existing rule says never): the sweep was already red, but the rule stands. Next: the
  **v1.12.1 picture review leftovers** box (it now also lists the v1.15.0 review's older finds), which closes M1
  with its target, and the M0 picture guard riding along.
- 2026-11-23 (v1.15.1): the M1 leftovers box shipped as a tidy-up release and the M1 target passed, so M1 is done.
  The run that started the box committed its work and stopped before the sweep; this run checked, finished and
  released it (the commit-early rule paid off again). This run was also paused once by the owner mid-run and carried
  on when asked. The new 360x740 sweep size found three layout problems at once that had been live for many
  releases, and the picture review found two more at that size. Rule (it follows the "phone first" rule in
  games/CLAUDE.md): **the sweep's sizes cover every screen shape the rules name**, so an upright phone is now one of
  them. Seen once in this run: a background `npm run sweep` failed with "command not found" while the same call had
  worked an hour earlier; `node scripts/sweep.mjs` worked. If it happens again, call the scripts with node in
  background runs. Pacing: v1.15.1 is one fix release after three that moved the game forward, so the next release
  must move the game forward: **M2's first real box, three traits per car**, with the M0 picture guard riding
  along (scoped in its notes). The new v1.15.1 leftovers box sits at the top of M2; take one or two of its items as
  the release's polish, not as a release of its own.
- 2026-11-23 (v1.16.0): M2's first real box, car traits, shipped as the main piece, so the game moved forward after
  one fix release, as the last note asked. Seen twice now (v1.12.1's "hands-off" bot that pressed Turbo, and this
  run's car ladder sorted by the raw `speed` field, which put a slower car "one up"): **a gate is only as good as what
  it measures. When a change touches car stats, check that every sim gate orders and judges cars by what they really
  do (`statsFor` plus the home bonus on that track), not by a data field.** The checklist's step 1 now says so. The
  picture review again found grown-up words and a tile that looked like a choice on the new card: the helper that
  sees only pictures earns its place every release. Gap found while reading games/CLAUDE.md: Turbo Dash has no
  speaker button on its explainers, so M2 has a new box for it. The M0 picture guard did not ride along this time
  (the traits box filled the run). Next: **the "Best on" badge** as the main piece (it needs the per-track best car,
  which the sim ladders now compute honestly), with the picture guard or the read-aloud box riding along.
- 2026-11-24 (v1.17.0): the "Best on" badge shipped as the main piece with the M0 picture guard (race frames for the
  four classic worlds), so the game moved forward for the second release in a row and the guard finally rode along
  after five releases of waiting. The guard box was too big for one run, so it was split: Toy Track World and the
  screens are a new M0 box. The M0 target (a missing boost pad turns the check red) passed. Seen a third time now
  (the "hands-off" bot that pressed Turbo, the car ladder sorted by a raw field, and this run's first guard frames,
  where the boost pad sat under the cars or behind rivals): **a check must be shown to see the thing it guards.**
  Every new check is run once with the thing broken on purpose before it counts, and its sample is picked by what is
  on screen, not by a distance or a count. The checklist's step 1 now names the guard and the four sim gates. Also
  found: the Rank 16 save drives its fastest car, so a new thing that depends on the car (the Best pill) never showed
  in the sweep until the sweep set up a save that shows it. That is the v1.15.0 rule ("a card is not checked until
  the sweep opens it filled in") again, so no new rule. Next: **Explainers read aloud** as the main piece (games/
  CLAUDE.md asks for it and Turbo Dash has none), with the guard's Toy Track World frame riding along.
- 2026-11-24 (v1.18.0): Explainers read aloud shipped as the main piece with the guard's Toy Track World frame, as
  the last note asked. Third release in a row that moves the game forward. Again a run built the box, committed it
  and stopped before releasing (its lock went stale after 8 hours), but this time it also left the Toy guard step
  uncommitted with no accepted picture: the next run had to judge a dirty tree. The commit-early rule (v1.13.0) holds;
  it now also covers half-done tool steps: **commit a tool step only once it has been run green and seen red, and
  stash anything that has not**, so a dirty tree always means "work in progress from this box". The Toy guard's first
  frame was picked by distance again and showed no coins: the v1.17.0 rule (pick by what is on screen) caught it
  before it counted. The sweep found the new speaker under the boss card's edge at 1024x600, a size between the two
  the old boss card rule covered; the audit's on-screen check caught it because the box added the speaker to it.
  Next: M0's picture guard for the screens (Garage first) and the Android back button can ride along, and the main
  piece is **a second special car per world** (M2), so the game keeps moving forward.
- 2026-11-24 (v1.19.0): a second special car per world shipped as the main piece, the fourth release in a row that
  moves the game forward. The M0 screens guard and the back button did not ride along (the box, its balance work and
  a machine problem filled the run); the next release takes the screens guard with it. Two numbers set by feel were
  wrong and only a measurement showed it: the first earn goals (a car one bot day after its world opened) and the
  first booster power (9% of a whole race). With the boost pad guard frame (v1.17.0) and the trait ladder (v1.16.0)
  that is the same lesson again, so it is now a rule: **a new goal, price or power gets its number from a
  measurement (the career run's counters, or the same seeded races with and without it), written in the notes.**
  Also new: this machine had no sound output during the check (Windows listed no audio device), and the read-aloud
  step failed on that alone. Like a timeout on a busy machine, it was checked against the machine first, and the
  test now names that case instead of failing; nothing in the game was changed for it. Gap found: the special car's
  counter only shows in the Garage, so a child racing on the Moon never sees the rings add up; it is in the leftovers
  box below. Next: **Strategy bots** (M2) as the main piece, with the M0 screens guard riding along.
- 2026-11-24 (v1.20.0): Strategy bots (M2) shipped with two boxes riding along, the M0 Android back button and the
  special car counter from the leftovers box, so the release has something new to see and to use and the game moved
  forward for the fifth release in a row. The M0 screens guard did not ride along again (second time); the next
  release takes it first. What the bots showed: at Rank 40 all four strategies are within 1%, because every bot has
  bought everything by then. A pacing target read only at the end hides where choices matter, so the gate also reads
  Rank 10, 20 and 30 (21% apart at Rank 10, inside the 25% rule). Rule (fits every game, added to games/CLAUDE.md):
  **strategy bots are compared at several milestones along the way, not only at the end.** The M2 target's car half
  failed as written (Wind-Up Rocket is best on all 32 tracks at full upgrades), so a fix box sits above it and the
  target's wording was made measurable in the open (its notes say why). Seen again (the v1.16.0 rule): the career's kid
  bot still picks its main car by the raw `speed` field. It is a player model, not a judge, so it stays for now, and
  the new "Every car has a place" box moves it to the Best rule when it changes the cars. The picture review saw a
  sideways bar in the Garage at 360 px that the audit had never flagged (it only looked at the screen's edge). The
  audit now flags any panel that scrolls up and down and also sideways; seen red, it found the Word Lap's answers cut
  off on an upright phone too. Also learned: a new sweep step can change what later steps measure (the Moon step
  marked the rival card seen, so the boss tab was measured with the rival chip for the first time, and a squeezed
  boss card showed up); that was a real older bug, not noise. Next: **the M0 screens guard** and **Every car has a
  place** as the main piece.
- 2026-11-25 (v1.21.0): the M0 screens guard and **Every car has a place** (M2) shipped, as the last note asked, so M0
  is done and the game moved forward for the sixth release in a row. The design came from measuring first (the
  v1.19.0 rule): a probe showed that traits on their own change race times by about 1%, so no trait could ever decide
  the best car, and that the Boost Buggy's power was worth 8.4% of a race while the Best rule counted 2.5%. Track
  kinds (a 6% bonus for the matching trait) and a 10% home bonus spread the end game to five cars, at most 10 of 32
  tracks each. The target's first line still misses (20 to 24 of 29 cars are ever the best), so a fix box sits above
  it, and `npm run bots` holds a floor so the count can only go up. A second new box: three of the four special car
  powers are worth about 0% of a race (the Moon Hopper's is -1.1%). Seen once in this run, and it breaks the
  commit-early rule (v1.13.0): a step commit went in with `npm test` red, because the commit was chained with `;`
  after the test, not `&&`. It was fixed in the next commit, before anything was pushed. Rule: **a step commit is
  always chained to a passing `npm test` with `&&`**, the same idea as `set -o pipefail` for releases. Also learned:
  the default `npm run career` is not seeded, so its Rank 40 day moves by a few days from run to run (549 to 555
  here). A gate on one of its counts belongs on the seeded runs in `npm run bots`, where it repeats exactly. The picture
  helper found that the sweep's two new pictures showed the wrong screens (the rival card opened first), which is the
  v1.17.0 rule again (a check must see what it guards): a sweep picture step now returns whether its screen opened,
  and a false fails the sweep. Next:
  **Side cars have a place** as the main piece, with a Small delight (holiday decorations, the season is near) as its
  polish.
- 2026-11-25 (v1.22.0): **Side cars have a place** (M2) and the holiday decorations (Small delights) shipped, as the
  last note asked. A run built both, committed them, and stopped before the release with no note in either box; this
  run found three commits ahead of origin, ran the whole check and the sweep on them, and released. The check was
  green, but the sweep was red (Drive it! under the edge at 1024x600 on every home-track car), so the commits had
  never been swept, and nothing in them said so. That is the second time a run stopped with no note (v1.18.0 too), so
  step 1 of "How the task works" now asks for a `Stopped at:` line in the box with every step commit, naming the
  checks that have run. The M2 target's three lines all pass now (29 of 29 cars ever the best, at most 10 of 32 at the end, bots
  within 1% at Rank 40), but the target stays open until the two boxes above it are done, because the special car
  powers box can move the end-game spread. The game moved forward for the seventh release in a row. Next: **Special
  car powers help at home** as the main piece (the first leftovers box is a backlog that each release takes a piece
  of), with one or two lines of the v1.21.0 picture leftovers as its polish.
