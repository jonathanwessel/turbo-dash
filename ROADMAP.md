# Roadmap

Turbo Dash is a racing game made for Carter, by Carter's Dad, set on Main Street in **Piqua, Ohio**. It is free
forever: no purchases, no ads, no accounts, no premium currency. Everything is earned by playing, and (from the
Driver School on) some things are earned by **not** playing: reading, playing outside and helping out.

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
  "are you sure"; a 6-year-old taps everything.
- **Show a 6-year-old only what he can use.** Menus show open things plus one next goal; locked modes and
  far-future worlds stay hidden until they're close.
- **Keep the art simple and recognizable.** The Piqua sign works best as plain, clear lettering.
- **The pay-to-win feel, without the pay.** Race → coins → shiny thing → faster, with something new to unlock every
  release and a reason to come back tomorrow.

---

# How the game fits together

```
  🏁 WINS ─┐                                   ┌─ 🚦 DRIVER SCHOOL (real-world reading,
  🏆 TROPHIES ─┼─►  RACER RANK  ─► unlocks ─────┤    outside time, helping) ─► Driver
  🔧 GARAGE ──┤    (all gauges full)            │    License + Driver Skills
  🔬 RESEARCH ─┘   + 🪪 LICENSE (Rank 10+, opt)  └─ new worlds, buildings, cars, lab tiers, Auto Steer
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
- **🪪 License gauge (new, from Rank 10, parent can switch it off):** see Driver School.

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

## 🚦 Driver School & real-world rewards (shipped in v0.14.0; became Math School in v1.1)
**Goal: the game gives Carter a reason to put the tablet down.** A grown-up logs what he did away from the screen,
and that becomes driver training in the game.
- **Parent log (Parent Corner → Driver School, behind the grown-up check):** big buttons for 📚 Reading,
  🌳 Outside play, 🧹 Helping out, 🎨 Making something, 🚲 Exercise, each in 10-minute steps. Optional daily cap and a
  history list. Nothing is collected or sent anywhere; it's stored with the save (and Google Save).
- **Training Tickets 🎟️:** every 10 minutes logged = 1 ticket (reading counts double, a Parent Corner option).
- **In the Driver School:** Coach Cone, a friendly traffic cone, runs lessons. Spending tickets trains permanent
  **Driver Skills** that help every car: Focus (steadier steering), Reflexes (Turbo fills faster), Courage
  (bigger landing boosts), Smarts (more coins from missions). Each skill has 10 levels, so it's a long road.
- **Driver License 🪪:** lessons earn license levels: Learner → Bronze → Silver → Gold → Platinum → Piqua Pro.
  Each level gives a license card with Carter's name, a new license-plate sticker, and at Gold a special car
  (**Piqua Patrol**). From Rank 10, the License becomes a 5th rank gauge, so ranking up also needs some
  real-world time. A Parent Corner switch turns that gauge off.
- **Also counts for the break reminder:** when the break screen shows, it suggests something to log ("Go read a
  book → come back for a ticket!").

## 🏙️ Piqua Main Street grows
New buildings appear on Main Street as Carter ranks up, so the town itself shows his progress (the street scrolls
sideways once it's full): 🍦 Ice Cream Shop (Rank 12, daily treat bonus), 🚒 Fire Station (Rank 15, red paint
and a fire-truck car), 📚 Library (with Driver School: reading tickets), 🏞️ Riverside Park (Rank 20, picnic
gifts), 🚗 Car Wash (repaint for free), 🏛️ Museum (a history of every trophy). Buildings stay simple and separate,
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

### Next: more worlds in the Next Gen engine
The remaining worlds come after Toy Track World and are built in the new 3D engine, each with its own physics,
cars, cup, boss and research (Rank 40, 45 … up to Turbo God at 60). A track builder fits naturally here
(snapping plastic track pieces together).

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
- **A harder grown-up check** for Parent Corner (one a 6-year-old can't answer, such as a two-digit multiplication
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

### v1.3 – v1.7 More worlds
Cloud Kingdom, Dino Jungle, Neon City and Gravity Flip, about one world per release, each
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
- **How you get there:** after the classic worlds (around Rank 40) plus a Next Gen license at the Driver School,
  with a big "the game levels up" moment.
- **Track Builder fits here:** snapping plastic track pieces together is the most natural track builder.
- **Name:** "Toy Track World" in the game (Matchbox is a toy brand name, and the game is public).
- **Plan:** a prototype release (one test track with loops and boosters working), then the world (cars, tracks,
  bosses), then the builder.

### v2.x Make your own
A track builder (Carter designs tracks from curve, hill, ramp and boost pieces), a car designer, a car
showroom, holiday events (Halloween, winter, his birthday), photo mode.

## Ideas parking lot
- More Earth tracks every couple of releases (Farm Fields, Pirate Port, Haunted Hill, a Piqua river track).
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
