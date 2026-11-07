# Roadmap

Turbo Dash is a racing game made for Carter (6), by Carter's Dad, set on Main Street in **Piqua, Ohio**. It is free
forever: no purchases, no ads, no accounts, no premium currency. Everything is earned by playing, and (from the
Driver School on) some things are earned by **not** playing: reading, playing outside and helping out.

Releases go to the play server (`npm run play`, port 5183, LAN http://192.168.1.162:5183) **and** to the public
site https://jonathanwessel.github.io/turbo-dash/ (`git push origin main --tags` after every `npm run release`).
Carter plays on an Android tablet, in landscape, full screen.

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
  tougher early rivals, win to unlock) · **v0.13.2** Smooth Roads · **v0.14.0** Driver School

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
- **Rank cap** is 20 now and rises with each world: 25 (Moon), 30 (Deep Blue), 35, 40 … 60.
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

## 🚦 Driver School & real-world rewards (shipped in v0.14.0)
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
| 5 | ☁️ Cloud Kingdom | sunbeams, soft cloud depth, rainbow glow trails |
| 6 | 🦖 Dino Jungle | layered foliage, swaying plants, dappled light |
| 7 | 🌃 Neon City | night lighting, neon glow and bloom, reflections on wet roads |
| 8 | 🌀 Gravity Flip | everything combined, plus warping sky effects |
| 9 | 🚀 Toy Track World | the leap: a new 3D engine, glossy plastic, real lighting |

Earth tracks get touched up along the way too (each release's Polish section), but never lose their simple style.

## Worlds and physics
Earth (8 tracks today, more over time) keeps today's feel. Every other world has its own physics profile (already
supported by the engine) and its own cars, lab kit and boss:

| World | Physics | Rank |
|---|---|---|
| 🌙 Moon Base | gravity 0.3: giant floaty jumps, gaps to jump, boost rings in the sky, thrusters | 20 |
| 🌊 Deep Blue | heavy drag, slow acceleration, currents, bubble vents, pearls, propellers | 25 |
| ❄️ Glacier Rink | low grip: sliding and drift turns | 30 |
| ☁️ Cloud Kingdom | bouncy clouds, wind gusts, rainbow bridges | 35 |
| 🦖 Dino Jungle | mud, vine swings, friendly dino stampedes | 40 |
| 🌃 Neon City | night driving, headlights, rooftop jumps | 50 |
| 🌀 Gravity Flip | gravity changes mid-track | 55 |

---

# Release plan

### v0.15.0 🌙 Moon Base
The first new world: four low-gravity tracks, gaps to jump, boost rings, Thrusters part, Moon Tires research, two
moon cars, a Moon boss rival. Rank cap 25.
- **Graphics:** a full moon art set: grey crater roadsides, Earth in the sky, stars, little dust puffs.
- **Interface:** the world picker becomes a world map.

### v0.16.0 Main Street Grows & Bosses
New Main Street buildings with rank (Ice Cream Shop, Fire Station, Library); a named boss rival per world (win
their car and a Brain Chip); Time Trials with a see-through ghost of your best lap.
- **Graphics:** new buildings, boss intro cards, ghost car effect.
- **Interface:** Main Street scrolls sideways when it's full, with edge arrows that show a "!" for buildings off
  screen.

### v0.17.0 🌊 Deep Blue
The underwater world: drag, currents, bubble vents, pearls, propellers and fins, Snorkel Seals research.
Rank cap 30.
- **Graphics:** blue-green palette, bubbles, fish, wavy seaweed, light ripples on the road; muffled sound.

### v0.18.0 Two Players
Split-screen races on one tablet: Carter vs. Dad.
- **Graphics:** a split view with name plates over each car. **Interface:** a "who's racing?" picker.

### v1.0.0 Carter's 1.0
A milestone release:
- **Optional Play Store package:** a Trusted Web Activity built from the existing site. You do the Play
  Console account, testers and listing.
- **Tilt-to-steer option.**
- **A launch splash.**
- **A parent's guide page.**
- **A review of every screen:** a full code review, the career sim, and a save test from every version.

### v1.1 – v1.6 More worlds
Glacier Rink, Cloud Kingdom, Dino Jungle, Neon City and Gravity Flip, about one world per release, each
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

## Notes
- Over the LAN (`http://`) Chrome can't install the app or use Google Save; the GitHub site can.
- All numbers are starting points; the career simulator and Carter's play decide the final values.
