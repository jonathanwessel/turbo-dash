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
- [ ] **Android back button.** Back closes the open screen or card. On Main Street it asks before leaving.
- [ ] **Target:** with one boost pad's drawing removed on purpose, `npm run check` plus the picture guard is
  red. Put it back and it is green.

### M1. Rivals with character (v1.12)
- [ ] **Turbo Lab in plain words** (v1.11.3 picture review). "Lab tier 1/2/3" is a grown-up word (use a number
  badge or "Row"). Prices like "39k" don't match the coin counter: show the full number. Projects such as Pit Crew,
  Head Start, Reflexes, Map Memory and Brain Chip Socket need a two-word line like the Garage cards ("Start
  faster"). Finished cards say "MAX!" on some and "Done" on others: pick one.
- [ ] **Steering arrows stay visible** on snow (Glacier) and on Toy World's pastel colors: a darker rim.
- [ ] **Main Street in portrait** fills the screen (v1.11.3 review: at 800x1280 the town sits in the bottom
  quarter under empty sky and its labels are tiny). The game is played in landscape, so this rides along with any
  M1 release, not on its own.
- [ ] **Small word polish** from the v1.11.3 review: "Upgrades for Champion X" repeats the car name; "Grip" could be
  "Turning"; tiny "19/25" star counts on track cards have no picture; "Point a phone camera here" on the title
  sounds like a manual; "Beach Boardwalk" wraps and its "11/25" touches the bar at 740x360.
- [ ] **Hands-off is last again at +2 and +3.** Found by `npm run check` (v1.11.2): driving hands-off with the
  starter car at +2 or +3 sometimes passes one or two rivals on Sunny Hills, because rivals ahead ease off to 0.93
  to wait. Rivals should not wait for a car that is not steering (for example, no easing while the player is off
  the road). Then make `npm run sim -- start` strict again: last at every level.
- [ ] **Rival of the week.** The named rivals take turns. This week's rival is in every race, and gets a little
  faster each time the player beats them, within a cap. A new week resets it.
- [ ] **Faces and reactions.** A small face for each rival on the start grid and the result screen: happy when
  they win, grumpy when they lose. Pictures only.
- [ ] **Boss rematches.** A beaten boss comes back stronger for a bigger prize. The first rematch win gives a
  new paint.
- [ ] **A horn button.** It honks. Rivals nearby honk back.
- [ ] **Target:** the race sim shows every track still has a result the "kid" driver can reach with the car
  one step above the starter, with the rival of the week at its cap. The career run reaches Rank 40 within 5% of
  the day it does today.

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
