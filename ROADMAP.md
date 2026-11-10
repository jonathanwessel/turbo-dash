# Roadmap

Turbo Dash is a racing game made for Carter, by Carter's Dad, set on Main Street in **Piqua, Ohio**. It is free
forever: no purchases, no ads, no accounts, no premium currency. Everything is earned by playing. The School adds
short Math and Word Laps that give a 30-minute coin bonus, so learning helps racing without being required.

Releases go to the play server (`npm run play`, port 5183) **and** to the public site
https://jonathanwessel.github.io/turbo-dash/. It is designed for an Android tablet, in landscape, full screen.

## Release rules
1. **Fewer, bigger releases.** Each release is a real chunk of new game. Hotfixes only for things that bother
   Carter right now.
2. **Every release has a substantial graphics piece and an interface piece**, listed under "Polish" in the
   changelog. Graphics means new art, animation or scenery, not a color tweak.
3. **Keep the look (until the Next Gen leap).** Retro pseudo-3D road, bright flat colors, chunky shapes drawn in
   code, cars from behind. No photos or heavy effects. New worlds use the same style with their own colors and
   props. The one planned exception is **Next Gen: Toy Track World** (below), where the game deliberately
   levels up into a more futuristic, 3D look as a reward for getting far.
4. **Every old save loads.** `npm test` loads a save from every past release (plus a broken one) and runs
   automatically before every release. Any save change adds a new fixture to `scripts/test-saves.mjs`.
5. **No stuck stage gates.** `npm run career` plays the whole game day by day; a release can't ship if it reports
   a gate that never opens. `npm run sim` is re-run whenever speed, physics, prizes or prices change.
6. The update path (version check → update button → update gate) never breaks.
6b. **Every screen fits.** Before a release, run the layout checker (`await __sweep()` in the dev server console,
   from `src/dev/audit.js`) at several sizes, including a short wide tablet (1000×448) and a small phone
   (740×360). No overlapping, spilling or off-screen text or buttons, and no broken words like "null" (use
   `await __sweepAll()`, which also tries a brand-new save and every garage car).
7. Tested at tablet size (1280×800) before shipping. Nothing is ever for real money; timers can only be rushed
   with in-game coins.

## Shipped
- **v0.1.0** Proof of Concept · **v0.2.0** Garage & Tracks (MVP) · **v0.3.0** Jumps & Stunts
- **v0.4.0** Paint Shop & Trophy Room · **v0.4.1** Update Before You Race · **v0.4.2** Upgrades Belong to Each Car
- **v0.5.0** Turbo Town, Racer Rank & Difficulty · **v0.6.0** Turbo Lab · **v0.7.0** Cups & Brain Chips
- **v0.8.0** Power-Up Boxes · **v0.9.0** Parent Corner+ & Daily Missions · **v0.10.0** More Earth & Physics Engine
- **v0.11.0** Auto Steer · **v0.11.1** Quiet Town · **v0.12.0** The Long Game (career sim, Mastery, Google Save,
  save tests, 12 fixes) · **v0.13.0** Piqua Main Street (town redraw, Settings + safe reset, title screen,
  race graphics pass, Driver School placeholder) · **v0.13.1** Earn Your Wins (no hidden steering,
  tougher early rivals, win to unlock) · **v0.13.2** Smooth Roads · **v0.14.0** Driver School · **v0.14.1** Scan to Share · **v0.15.0** Moon Base · **v0.16.0** Main Street Grows & Bosses · **v0.17.0** Deep Blue & Time Trials · **v0.18.0** Glacier Rink · **v0.19.0** Toy Track World (Next Gen 3D engine) · **v0.20.0** Smoother Racing & a Simpler Race Screen · **v0.20.1** Every Screen Fits · **v0.20.2** No More "null" · **v0.21.0** Bug Hunt · **v0.22.0** A Growing Town, Your Name & New Sounds · **v0.22.1** Install Button · **v1.0.0** Carter's 1.0

## What we learned
- **Carter doesn't stop to read.** Anything important must block the way and work with pictures (the update gate,
  the big RACE! button, one word per building).
- **The first pacing was far too fast.** The career simulator showed Rank 10 in 8 days and a hard dead end at
  Rank 17. Since v0.12 today's content takes ~4 months at 15 min/day; every new feature is checked the same way.
- **Gauges must always be fillable.** Trophy points count against the difficulties a parent allows, and each
  rank cap is only raised when the new content can fill all gauges (the career sim proves it).
- **A fresh code review finds real bugs.** v0.12 fixed 12 found by an independent review; do one every few releases.
- **Old versions can't be patched**, so the update path and save porting are sacred.
- **Winning must be earned.** Hands-off driving once won; the starter car now loses until it is upgraded, a
  track opens only after a Normal/Hard win, and `npm run sim -- start` checks that hands-off finishes last.
- **Grown-up controls must be kid-proof.** Reset and Parent Corner sit behind a sum, a 3-second hold and a last
  "are you sure"; a young kid taps everything.
- **Show a young kid only what he can use.** Menus show open things plus one next goal; locked modes and
  far-future worlds stay hidden until they're close.
- **There is always a track you can almost win.** Each car wins every time up to some track and then not at
  all on the next, so tracks must be spaced closely in difficulty. v1.9 filled the gaps with four new tracks.
- **Keep the art simple and recognizable.** The Piqua sign works best as plain, clear lettering.
- **The pay-to-win feel, without the pay.** Race → coins → shiny thing → faster, with something new to unlock every
  release and a reason to come back tomorrow.

---

# How the game fits together

```
  🏁 WINS ──────┐                                 ┌─ new worlds, buildings, cars, lab tiers, Auto Steer
  🏆 TROPHIES ──┼─►  RACER RANK  ─► unlocks ───────┤
  🔧 GARAGE ────┤    (all gauges full)             └─ 🏦 bank limit grows with every rank
  🔬 RESEARCH ──┘
  🏫 SCHOOL: Math and Word Laps ─► +10% race coins for 30 min (stacks) ─► 🚓 a car after 20 laps
```

## Racer Rank
Four gauges must all be full to RANK UP (the emptiest one glows with a picture hint). Current requirements
(formulas in `src/data.js`; the career sim decides changes):

| Rank → next | 🏁 Wins | 🏆 Trophies | 🔧 Garage | 🔬 Research | Unlocks |
|---|---|---|---|---|---|
| 1 → 2 | 12 | 5 | 6 | 0 | Turbo Lab |
| 2 → 3 | 36 | 11 | 14 | 2 | 🔥 Hard |
| 4 → 5 | 110 | 29 | 32 | 8 | Cups |
| 6 → 7 | 211 | 51 | 52 | 15 | Daily Missions |
| 9 → 10 | 404 | 87 | 84 | 27 | Auto Steer |
| 15 → 16 | 914 | 174 | 155 | 54 | 4th lab bench |
| 20 → 21 | 1448 | 257 | 218 | 79 | needs new worlds |
| 30 → 31 | 2771 | 444 | 355 | 135 | |
| 59 → 60 | 8176 | 1106 | 800 | 320 | TURBO GOD (needs Auto Steer 100) |

- **Trophies** = medals (1–3 per track and difficulty) + cup trophies (3–8) + ⭐ Mastery stars (wins 3/10/25/50/100
  per track and difficulty) + claimed goals.
- **Garage** = 5 per car owned + every upgrade level on every car. Each new world must add cars (the Garage
  gauge maxes at 225 with today's 9 cars).
- **Rank cap** is 40 now (Toy Track World) and rises with each world: 45, 50 … 60.

## Turbo Lab
Real-time research on 1–4 benches (Rank 2/4/9/15), coins only, rush for coins. Tier 1 (Rank 2): Coin Boost,
Lucky Chests, Head Start, Pit Crew. Tier 2 (Rank 6): Turbo Tanks, Bigger Ramps, Bumper Shield, Magnet Field,
Super Paint. Tier 3 (Rank 8+): the Robot Brain chain → **Auto Steer**. Future tiers arrive with worlds
(World Kits like Moon Tires and Snorkel Seals, lab-only Blueprint cars).

## Auto Steer (end-game "God mode")
100 levels, opens at Rank 10 after the Robot Brain chain. Level 1: 60,000 coins, 4 🧠, 1 h. Level 50: 324,000,
9 🧠, 5 h, Rank 34. Level 100: 1.8 million, 14 🧠, 24 h, Rank 59. All 100 add up to about 52 million coins,
860 Brain Chips and 840 hours: **a multi-year goal**. Level bands: road (1+), coins (26+), boxes and air coins
(46+), boost pads and dodging (66+), smart Turbo (86+), perfect line with gold trail (100). Hand steering always
wins, it's off in time trials and boss races, and Parent Corner can disable it.

## 🏫 School: Math Laps, Word Laps and the Good Student bonus
**Goal: learning helps racing, but racing never needs it.** The School started in v0.14 as a log a grown-up
filled in (reading, outside play) that paid tickets for permanent Driver Skills and a License gauge. v1.1 replaced
the log with Math Laps, v1.5 added Word Laps, and v1.8 replaced the permanent rewards with a short bonus.
- **A lap is 5 questions.** Math Laps: adding and taking away with pictures to count. Word Laps: match a picture to
  its word or a word to its picture, from 3-letter words up. A wrong answer just tries again; no timer.
- **Good Student bonus:** each lap adds +10% race coins (+20% for a perfect lap) for 30 real minutes. Bonuses
  stack, each with its own timer. A grown-up sets a daily limit (default +60% a day) in Grown-ups.
- **School Resource Officer:** a police car for finishing 20 laps.
- **Nothing permanent:** no skills, no license and no rank gauge, so a kid who skips the School still ranks up.

## 🏙️ Piqua Main Street grows
New buildings appear on Main Street as Carter ranks up, so the town itself shows his progress (the street scrolls
sideways once it's full): 🍦 Ice Cream Shop (Rank 12, daily treat bonus), 🚒 Fire Station (Rank 15, red paint
and a fire-truck car), 🏫 School (Math and Word Laps), 🏦 Piqua National Bank (7% interest a real day),
🏞️ Riverside Park (Rank 20, picnic gifts), 🚗 Car Wash (repaint for free), 🏛️ Museum (a history of every trophy). Buildings stay simple and separate,
one word on each sign.

## 🎨 The graphics ladder
The art gets a little richer with every world, so the whole game slowly climbs from today's flat retro look to
the shiny, futuristic Toy Track World at the end. Each step keeps everything that came before:

| Step | Arrives with | New detail |
|---|---|---|
| 1 | Earth (now) | flat colors, simple shadows, guardrails, lamp posts, birds |
| 2 | 🌙 Moon Base | soft gradients on cars and scenery, glowing lights, a starfield with depth |
| 3 | 🌊 Deep Blue | light rays and caustic ripples, translucent bubbles, color fog in the distance |
| 4 | ❄️ Glacier Rink | shiny ice reflections under cars, sparkle highlights, falling snow layers |
| 5 | 🧸 Toy Track World (shipped early, v0.19) | the leap: a new 3D engine, glossy plastic, real lighting and shadows |
| 5½ | v1.2 Feel the Speed (all tracks) | skid marks and smoke, Turbo zoom, far mountains/mesas/skyline, tunnels, night and headlights, a sunset, car lean and landing squash; glossier toys that bounce |
| 6+ | later worlds | built in the 3D engine, each a step more detailed |

Earth tracks get touched up along the way too (each release's Polish section), but never lose their simple style.

## Worlds and physics
Earth (8 tracks today, more over time) keeps today's feel. Every other world has its own physics profile (already
supported by the engine) and its own cars, lab kit and boss:

| World | Physics | Rank |
|---|---|---|
| 🌙 Moon Base | gravity 0.3: giant floaty jumps, gaps to jump, boost rings in the sky, thrusters | 20 |
| 🌊 Deep Blue | heavy drag, slow acceleration, currents, bubble vents, pearls, propellers | 25 |
| ❄️ Glacier Rink | low grip: sliding and drift turns | 30 |
| 🧸 Toy Track World | Next Gen 3D: walls, loops (need speed), jumps over gaps, booster stations | 35 |
| ☁️ Cloud Kingdom | bouncy clouds, wind gusts, rainbow bridges | 35 |
| 🦖 Dino Jungle | mud, vine swings, friendly dino stampedes | 40 |
| 🌃 Neon City | night driving, headlights, rooftop jumps | 50 |
| 🌀 Gravity Flip | gravity changes mid-track | 55 |

---

# Release plan

### v0.15.0 🌙 Moon Base (shipped)
The first new world: four low-gravity tracks, gaps to jump, boost rings, Thrusters part, Moon Tires research, two
moon cars, a Moon boss rival. Rank cap 25.
- **Graphics:** a full moon art set: grey crater roadsides, Earth in the sky, stars, little dust puffs.
- **Interface:** the world picker becomes a world map.

### v0.16.0 Main Street Grows & Bosses (shipped)
New Main Street buildings with rank (Library, Ice Cream Shop, Fire Station, Park); a named boss rival per world (win
their car and a Brain Chip). Time Trials moved to v0.17.
- **Graphics:** new buildings, construction sites, boss intro cards, the Fire Dash truck.
- **Interface:** Main Street scrolls sideways when it's full, with edge arrows that show a "!" for buildings off
  screen.

### v0.17.0 🌊 Deep Blue & Time Trials (shipped)
The underwater world: drag, currents, bubble vents, pearls, propellers and fins, Snorkel Seals research.
Rank cap 30. Plus **Time Trials** with a see-through ghost of your best lap.
- **Graphics:** blue-green palette, bubbles, fish, wavy seaweed, light ripples on the road; muffled sound.

### v0.18.0 🧊 Glacier Rink (shipped)
Ice: cars slide, drift into curves for a DRIFT BOOST, snowbanks, Ice Studs research, three ice cars, the Glacier
Cup and the boss Fang the Ice Wolf. Rank cap 35. (Split-screen Two Players was dropped.)
- **Graphics:** northern lights, falling snow, glossy ice with glints and reflections, penguins, igloos.
- **Interface:** world buttons in the garage.

### v0.19.0 🧸 Toy Track World (shipped)
The Next Gen leap, built for real: a new 3D engine (three.js), a giant playroom, plastic track with walls,
loop-the-loops, jumps over gaps, booster stations, the toy hand, Shrink Ray research, three toy cars, the Toy Cup
and the boss Major Wind-Up. Rank cap 40.


### v1.0.0 Carter's 1.0 (shipped)
Tilt to steer, a launch splash, the Parent Progress page and guide, three new Earth tracks and the Country Cup,
weather, the Car Wash and Museum, and the Play Store package prepared (publishing is up to the parent). The original
plan for it was:
- **Optional Play Store package:** a Trusted Web Activity built from the existing site. You do the Play
  Console account, testers and listing.
- **Tilt-to-steer option.**
- **A launch splash.**
- **A parent's guide page.**
- **A review of every screen:** a full code review, the career sim, and a save test from every version.

### v1.1.0 🧮 Math School (shipped)
The Driver School stops depending on a parent's log and earns its tickets from a math game the child plays:
- **Coach Cone's Math Lap:** simple addition and subtraction (sums to 10 at first, then to 20; no negative
  answers), shown as big numbers with pictures (cars, cones, coins) to count. Three or four big answer buttons.
- **Tickets for right answers:** a lap of 5 questions earns a ticket, with a small streak bonus. A wrong answer just
  tries again (no lost tickets, no timer). The questions get harder slowly as he gets them right.
- **The same rewards:** tickets still train Focus, Reflexes, Courage and Smarts and still earn license levels, so
  the Rank 10+ License gauge stays, now fed by math.
- **Parent Corner:** pick the level (to 10 / to 20 / adding only) and a daily cap; Progress shows questions answered
  and how many were right. The reading/outside log goes away, so there's nothing to fake. Saves keep the tickets,
  skills and history they already have.
- **A harder grown-up check** for Parent Corner (one a young kid can't answer, such as a two-digit multiplication
  or a long press), since the old one was easy for him.

### v1.2.0 🏎️ Feel the Speed (shipped)
Drafting, friendlier bumps, solid guardrails, landing squash; skid marks, Turbo zoom, mountain/mesa/skyline layers,
tunnels, a night track with headlights, a sunset; a glossier Toy Track World with bouncy toys; an Effects setting;
the garage grid; world previews; the 🏙️ Downtown bonus course.

### v1.5.0 📚 Word Laps at the Library (shipped)
The Library had nothing of its own after Math School replaced the reading log. Now it has a reading game he plays
himself: a Word Lap is 5 questions that match a picture to its word or a word to its picture. It starts with
3-letter words, moves to look-alike choices (cat, cap, can), then 4-letter and longer words. Same tickets and one
shared daily limit with Math Laps; a grown-up picks the hardest words.

### v1.6.0 🏦 Calmer races, the bank, real rooms (shipped)
Races at three-quarter speed with an mph speedometer; Piqua National Bank (7% a real day, limit 400 coins per
rank); every building's menus show the inside of that building.

### v1.7.0 🛣️ Clean screens, real road (shipped)
The evaluation of v1.6: one panel template (back top-left, centred content), less text on the busiest screens, a
Next sign and at most two badges on Main Street; shared reward rules for the game and the career simulator; curve
chevrons, friendlier bumps, a smooth rubber band, hills that move the background, cheaper drawing.
Still to do from it: rewriting the remaining ~55 repeated stylesheet rules by hand (they override each other on
purpose, so each needs checking) and moving every font size onto the type ramp.

### v1.8.0 📚 One School, Good Student bonus (shipped)
Laps give a stacking +10% / +20% race-coin bonus for 30 minutes instead of permanent lessons; lessons reset, the
License gauge removed, the Library folded into the School, and the School Resource Officer car after 20 laps.

### v1.9.0 🎢 More Earth, more wins (shipped)
The race simulator showed that each car wins every time up to some track and then not at all on the next one, and
the jumps were big: Night Lights → Lava Mountain and Lava Mountain → Space Road. Farm Fields, Pirate Port and
Night Lights also opened nothing. Four new Earth tracks fill the gaps, each opened by one of those tracks:
- **🎢 County Fair** (after Farm Fields): a Ferris wheel on the horizon, striped tents, balloons, a cotton candy stand.
- **🦇 Haunted Hill** (after Pirate Port; seasonal from v1.9.1): a purple evening, a big moon with bats, friendly
  ghosts, jack-o'-lanterns, a spooky old house.
- **🤖 Robot Factory** (after Night Lights): smokestacks, turning gears, waving robots, crates, hazard-stripe curbs.
- **✨ Crystal Caves** (after Lava Mountain, before Space Road): a cave ceiling with hanging rocks, glowing crystals
  and mushrooms, mine carts, crystal tunnels.
- **Interface:** the School puts both laps side by side under the bonus, so nothing needs scrolling; the layout
  checker now flags a main button you'd have to scroll to.
- **Code review** of v1.7–v1.8 (a fresh session): the Good Student bonus is capped at 30 minutes against a wrong
  device clock, the race pays the bonus it showed, history and Google Save count laps, the lesson code is removed.

### v1.9.1 🍂 Safe and correct (shipped)
From the performance, physics and graphics review of v1.9.0, the bug-fix part plus the owner's answers:
- **🍂 Seasonal tracks** (a new system). A track with a `season` (from/to month and day, any year, may wrap past New
  Year) opens when the game is played inside that window and stays open for good (`S.opened`). Seasonal tracks are
  never in a cup, a goal or an unlock chain. Haunted Hill is the first: 1 October to 15 November, now a night track
  with headlights. Saves that had it open keep it. Later seasons slot in the same way (winter, spring, summer).
- **Tracks stay open** once opened, whatever the difficulty settings do later.
- **Bank clock:** the bank day never moves backwards, and the bank pays at most 3 days past the last time the
  game's website reported (read from the update check). With no website time, one payout covers at most 7 days.
- **Boss:** a lost boss race pays half the 2nd-place prize. A Hard boss win still earns the track's Hard chip.
- **Turbo Lab levels are back on the cards** (segments and "3/10"; a bar for Auto Steer). Lesson kept for every
  screen: state stays on the card (level, working, done, locked); explanation goes behind a tap.
- **Fixes:** the save backup can no longer replace a good save when storage is full; Time Trials pay the Good
  Student bonus they show; Easy wins count while Hard is still rank-locked; a lap counts at its last answer; bank
  withdrawals no longer count as coins earned; history rows are checked on load.

### v1.10.0 ✨ Smooth on every screen (shipped)
From the same review, the performance part:
- **One physics step per screen frame**, sized to the display (`src/pace.js`), so 50, 75, 90, 120 and 144 Hz
  screens show no repeated or doubled frames. Per-step chances and the toy shove scale with the step first.
  Seeded races at the old 60 Hz step are identical to v1.9.1; at 40 to 144 Hz they finish within 1%.
- **Classic road drawing:** background stops at the road's far edge, hidden sprites skipped, small sprites and far
  rivals from cached pictures, tints as a CSS layer. Painted area per frame 4.4–5.7 → 2.3–3.1 screens; canvas
  calls 17–43% fewer. `npm run perf` guards it (`scripts/perf-budget.json`).
- **A quality ladder** (`src/quality.js`) replaces the one-way auto-Simple latch.
- **Toy Track World:** merged meshes and instanced wheels (150–180 → 80–90 draw calls), no road shadow casting
  (shadow triangles 47–55k → 11–13k), materials shared in the safe look.
- **No work behind rooms and menus;** the HUD writes only on change.
- Lesson: measure before tuning. The step counter (`#steps`) shows a device's real frame pattern in one race.

### v1.11.0 🏠 Feel and finish (shipped)
The rest of the same review, plus the owner's answer on world cars:
- **Home-world bonus** (`homeBonus` in `physics-common.js`): a world's shop, cup and boss cars are 5% faster (top
  speed and acceleration) in that world; it replaced the 4% penalty on ice and in Toy World. The Lunar Rover is the
  Moon's car; no new car. Toy World rivals 1.04 → 1.00, so the Toy Racer isn't required on Normal (the Glacier cars
  can start it). Other worlds were measured and left as they are: making the previous world's best shop car win on
  Normal there would have made every Hard race a walk-over for the home car.
- **Toy World** steering ease-in, drafting and the soft catch-up of the classic road; survives a lost 3D context
  (rebuilds the picture, keeps the race); start line and arch on the banked road; never below the floor.
- **Step-independent jumps, seeded race luck, stars, haze, tunnel exits, Snowy Peaks snow, no shimmer.**
- **Road drawn in layers** (P8), 3 cached tracks (P10), less per-frame garbage (P11), view lifecycle fixes (T5).
- Lesson: a balance target written as "the previous car can win" only works if the cars of neighbouring worlds are
  close in stats; check both ends (Normal for the old car, Hard for the new one) before tuning.

### Next
Still open for the owner: whether late-game curves should need more steering (X3). The Turbo Lab leftovers
(locked-box opacity, the bright poster) wait for the owner too.

### Later: more worlds
Cloud Kingdom, Dino Jungle, Neon City and Gravity Flip, about one world per release in the Next Gen engine, each
raising the rank cap by 5 with new cars and a boss. **Turbo God** (Rank 60) arrives with the last one.

## 🚀 Next Gen: Toy Track World (the big leap)
A late-game chapter that feels like a whole new game Carter advances into: **plastic toy-car tracks** with side
walls, **loop-the-loops**, banked curves, jumps between track pieces and **booster stations** (spinning wheels that
fling the car forward), all set in a giant playroom.
- **A new engine:** true 3D track pieces (straights, curves, loops, ramps, boosters) on a path the car follows,
  with wall collisions, loop physics (enough speed or you fall off!) and a chase camera. Built as a separate
  module so the classic game keeps working; likely WebGL (three.js) for the 3D.
- **A new look:** the graphics jump from today's flat retro style to a shinier, more futuristic one (glossy
  plastic, lighting, reflections). The leap itself is the reward: Carter "graduates" into it.
- **How you get there:** Rank 35 plus the 🪄 Shrink Ray research, with a big "the game levels up" moment.
- **Track Builder fits here:** snapping plastic track pieces together is the most natural track builder.
- **Name:** "Toy Track World" in the game (Matchbox is a toy brand name, and the game is public).
- **Plan:** a prototype release (one test track with loops and boosters working), then the world (cars, tracks,
  bosses), then the builder.

### v2.x Make your own
A track builder (Carter designs tracks from curve, hill, ramp and boost pieces), a car designer, a car
showroom, holiday events (Halloween, winter, his birthday), photo mode.

## Ideas parking lot
- More Earth tracks wherever the race simulator shows a difficulty gap.
- A pet sidekick that rides along and cheers. Weather on Earth tracks.
- The City of Piqua's feather in the Q, if we find a version that looks good (set aside in v0.13).

## Known issues (not fixed yet)
- Saves from before v0.13.1 lost tracks that were open under the old "3rd place opens the next track" rule but
  never raced.
- On a device that can't show 3D, the Toy Track World goals and cars can't be finished, and a daily mission can
  still pick a toy track.

## Notes
- Over plain `http://` Chrome can't install the app; the https site can.
- All numbers are starting points; the career simulator and Carter's play decide the final values.
