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
- **No new personal details.** Do not add names, places or family stories to code, docs or commits. What is
  already in the game stays until the owner decides (see "Waiting for the owner").
- Nothing is ever for real money. Timers can only be rushed with in-game coins.

## Release checklist (every release; stop and fix on any failure)
1. `npm test` passes.
2. `npm run perf` prints `All drawing budgets met`. Re-record the budget only when the picture gained something
   on purpose, and say so in the changelog.
3. `npm run sim -- start`: hands-off finishes last. Run the sim for any track, car or physics you changed.
4. `npm run career`: no gate that never opens. Write the day of Rank 40 (and of each world opening) in the notes.
5. The screen sweep at all 7 sizes, in a headless browser with a throwaway profile against the dev server on
   port 5184 (`await __sweepAll()` from `src/dev/audit.js`). After M0 this is `npm run sweep`. No overlap, no
   spill, no "null".
6. Screenshots of every screen you changed, plus one race frame per world. Look at each one. Then a helper that
   sees only the screenshots reads every visible line and flags anything a young player could not follow.
7. Bump the version in `package.json`, add the `CHANGELOG.md` entry and the "What's new" entry (after M0), and a
   one-line "shipped" entry in `ROADMAP.md`.
8. Commit, then `npm run release` (it runs the tests, tags and builds the home copy). Then
   `git push origin main --tags`.
9. Wait for the Pages build to pass. Confirm the live `version.json` shows the new version. After M0, run the
   install test and the update test against the live site.
10. Tell the owner: the pushed tag makes a GitHub release (after M0), plus one push notification, best effort.

Until a tool exists, the box that creates it is the first to use it. Skip the steps for tools that do not exist yet.

## Roadmap

### M0. Safety net (no visible change except "What's new")
Unattended releases need checks that cannot be skipped. v1.11.0 shipped with six road features missing and
every test green.
- [ ] **One command for the checks.** `npm run check` runs steps 1 to 4 with `set -o pipefail` behavior: any
  failure stops it with a non-zero exit. `npm run release` refuses to run unless the check passed on this commit.
- [ ] **The sweep as a script.** `npm run sweep`: starts the dev server, drives a headless browser over CDP with
  a throwaway profile, runs `__sweepAll()` at all 7 sizes, saves screenshots, stops the server and the browser.
- [ ] **A picture guard.** One fixed, seeded race frame per world and one picture per screen, compared with the
  pictures kept from the last release. A large difference fails until the new picture is accepted on purpose.
- [ ] **Tell the owner.** `.github/workflows/release.yml` makes a GitHub release from each pushed tag, using
  the tag message (2 to 5 plain lines). An in-game "What's new" card lists every change since this device last
  played, in pictures and a few words, and closes with one tap.
- [ ] **Install and update tests.** Separate maskable icons, a manifest `id`, and two scripts: one checks the
  browser offers "Install app" with no errors, one proves an installed copy picks up a new version.
- [ ] **Android back button.** Back closes the open screen or card. On Main Street it asks before leaving.
- [ ] **Target:** with one boost pad's drawing removed on purpose, `npm run check` plus the picture guard is
  red. Put it back and it is green.

### M1. Rivals with character (v1.12)
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
- **The player's name and the home town in the public repo.** They were kept on purpose earlier. The rules for
  every game now say no personal details. The owner decides whether anything changes.
- **Google Save** talks to another host. Keep it behind Parent Corner as it is, or remove it?
- **Play Store.** The developer account, the site repository that lets Android trust the game, the signing key
  and the 12 testers are the owner's steps. `android/ANDROID.md` has the walk-through.
- **A real tablet check.** No release has been checked on a real device by the task. Say so in each release note
  when a change needs one.

## Roadmap notes
- 2026-11-20: plan written from the owner's review of enhancement ideas. "Race together on one tablet" was
  turned down. Pace set to one run every 4 hours.
