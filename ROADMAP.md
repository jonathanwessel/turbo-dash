# Roadmap

Turbo Dash is a racing game made for Carter (6), by Carter's Dad. It is free forever: no purchases, no ads,
no accounts, no premium currency. Everything is earned by playing. Every release must load every older save
without losing anything.

Releases go to the play server (`npm run play`, port 5183, on the LAN at http://192.168.1.162:5183).
Carter plays on an Android tablet, in landscape, full screen.

## Release rules
1. **Every release looks and feels a little better.** Besides its main feature, each release ships a
   **Polish** pass: at least one graphics improvement (art, animation, effects) and at least one interface
   improvement (clearer buttons, smoother screens, easier navigation). Each release below lists its polish
   items, and the changelog gets a "Polish" heading.
2. Old saves always load, with nothing lost. Anything that changes the save gets a migration and a test with
   a save from the previous version.
3. The update path (version check → update button → update gate) never breaks.
4. Every release is tested at tablet size before it ships. The race simulator (`npm run sim`, from v0.5.0)
   is re-run whenever anything touches speed, physics, prizes or prices.
5. Nothing is ever for sale for real money, and no timer can be skipped with anything but in-game coins.
6. **Keep the look.** Carter likes how the game looks, so it stays the same style: the retro pseudo-3D road,
   bright flat colors, simple chunky shapes drawn in code, cars seen from behind. No switch to a real 3D
   engine, realistic textures, photo backgrounds or heavy effects. "Polish" means doing this style better
   (cleaner shapes, a bit more animation, nicer colors, more things on the roadside), never a new style.
   New worlds use the same style with their own colors and props.

## Shipped
- **v0.1.0** Proof of Concept: one track, rivals, coins, boost pads, Turbo, sound.
- **v0.2.0** Garage & Tracks (MVP): six tracks, six cars, four upgrades, prizes, treasure chests,
  daily gift, full screen on tablets.
- **v0.3.0** Jumps & Stunts: ramps, air coins, stunt landings.
- **v0.4.0** Paint Shop & Trophy Room: paints, stickers, goals, Carter credits, big update button,
  safer saves and save codes.
- **v0.4.1** Update Before You Race: a waiting update stops the next race and installs itself.
- **v0.4.2** Upgrades Belong to Each Car: per-car upgrade levels; old saves keep what was bought.
- **v0.5.0** Turbo Town, Racer Rank & Difficulty: the town hub, four-front ranks (cap 10), Easy/Normal/Hard,
  parent limits, economy pass, race simulator.
- **v0.6.0** Turbo Lab: research tiers 1–2, real-time benches, rushing, neon paints, lab goals.

## What we learned from Carter playing
- **He doesn't stop to read.** He saw the update notice and started a race anyway. Anything important
  has to block the way (like the v0.4.1 update screen), use big icons, and work without reading.
- **Old versions can't be fixed after the fact.** A fix only reaches the tablet after one update, so the
  update path must never break, in any release.
- **Upgrades are per car (v0.4.2), so the economy has to be re-tuned.** Maxing every car now costs about
  six times more than before. Prices, prizes and rewards get a balance pass in v0.5.0.
- **The save lives at one exact address.** If the PC's LAN IP changes, the tablet opens an empty save.
  Reserve the IP in the router, and keep a save code (Parent Corner) as a backup. HTTPS hosting (v1.0) is
  a new address too, so it needs a built-in "bring my progress" step.
- **Pay-to-win feel, without the pay.** The loop is: race → coins → buy something shiny → go faster.
  Each release should add something new to earn or unlock, and a reason to come back tomorrow.

---

# The big picture

Progress happens on **four fronts at once**. None of them is enough on its own; Carter has to push all four
forward to rank up, and ranking up opens new things on every front.

```
            🏁 WINS ───────────┐
                               │
  🔬 RESEARCH ── RACER RANK ── 🏆 TROPHIES
       ▲            │          │
       │            ▼          │
   Turbo Lab   unlocks worlds, │
       ▲       cars, lab tiers,│
       │       Auto Steer      │
  🔧 GARAGE POWER ─────────────┘
```

- **🏁 Wins:** races won (any world, any difficulty).
- **🏆 Trophies:** trophy points. A bronze is 1, silver 2, gold 3 per track and difficulty, cup trophies are
  worth 5–10, and every claimed goal adds 1.
- **🔧 Garage Power:** every upgrade level on every car he owns, plus 5 per car owned.
- **🔬 Research:** total research levels finished in the Turbo Lab.

## Racer Rank (the "4D" level)

The Rank screen shows four big gauges, one per front. When **all four are full**, a giant **RANK UP!**
button appears with a fanfare, confetti, a new title and a reward chest. If one gauge is behind, it glows and
shows a picture hint (a lab flask, a wrench, a trophy, a checkered flag) so Carter knows what to do next
without reading.

Requirements to reach the next rank (starting point; tuned with the simulator):

| Rank → next | 🏁 Wins | 🏆 Trophy pts | 🔧 Garage power | 🔬 Research | Unlocks at the new rank |
|---|---|---|---|---|---|
| 1 → 2 | 3 | 4 | 6 | 0 | **Turbo Lab** |
| 2 → 3 | 8 | 10 | 14 | 2 | 🔥 Hard difficulty |
| 3 → 4 | 13 | 17 | 22 | 4 | Second lab bench |
| 4 → 5 | 19 | 24 | 32 | 6 | Cups |
| 5 → 6 | 26 | 32 | 41 | 8 | Lab tier 2 |
| 6 → 7 | 34 | 41 | 52 | 11 | Daily missions |
| 7 → 8 | 41 | 50 | 62 | 14 | Robot Brain research |
| 8 → 9 | 50 | 60 | 73 | 17 | Third lab bench |
| 9 → 10 | 58 | 70 | 84 | 20 | **Auto Steer** research opens |
| 15 → 16 | 116 | 135 | 155 | 41 | |
| 20 → 21 | 171 | 197 | 218 | 60 | |
| 30 → 31 | 296 | 333 | 355 | 101 | |
| 40 → 41 | 436 | 484 | 502 | 146 | |
| 50 → 51 | 590 | 647 | 656 | 194 | |
| 59 → 60 | 738 | 802 | 800 | 240 | **TURBO GOD** (needs Auto Steer 100) |

Formulas: wins = 3·r^1.35, trophies = 4·r^1.3, research = 1.5·(r−1)^1.25, garage = 6·r^1.2.

**Rank titles:** Rookie (1–4), Racer (5–9), Pro (10–19), Champion (20–29), Superstar (30–39),
Legend (40–49), Mega Legend (50–59), **Turbo God (60)**.

**Rank caps:** each release raises the highest reachable rank, so Carter can't run out of content. The cap is
10 in v0.5.0, 20 in v1.2.0, 30 in v1.5.0, 40 in v1.9.0, 50 in v2.2.0 and 60 in v2.4.0.

## Turbo Lab (research facility)

Locked until **Rank 2**. Before then, the hub shows the lab building boarded up with a 🔒 and the four
gauges, so he can see it's coming.

- A robot scientist, **Professor Bolt**, runs it. Research costs coins and takes **real time**; it keeps going
  while the tablet is off. Finishing means a fanfare and "Tap to collect".
- **Benches:** one at Rank 2, a second at Rank 4, a third at Rank 9. Each bench researches one project.
- **Rushing:** a running project can be finished now for extra coins (never for anything else).
- **Projects have levels.** Each level costs more and takes longer, and some projects need a minimum Rank or
  another project first. The lab is a picture map with lines between unlocks.

**Lab tier 1 (Rank 2):**
- *Coin Boost* 1–10: +5% race prizes per level.
- *Lucky Chests* 1–5: better treasure chest prizes.
- *Head Start* 1–5: start every race with some Turbo.
- *Pit Crew* 1–10: car upgrades 3% cheaper per level.

**Lab tier 2 (Rank 6):**
- *Turbo Tanks* 1–10: Turbo lasts longer on every car.
- *Bigger Ramps* 1–5: higher jumps, more air coins.
- *Bumper Shield* 1–5: bonks and bumps slow you down less.
- *Super Paint*: glow, sparkle and color-change paints.
- *Coin Magnet Field* 1–10: extra magnet range on every car.

**Lab tier 3 (Rank 8+):**
- *Blueprints*: lab-only cars (Hover Car, Thunder Truck, Jet Racer), each a multi-step project.
- *Robot Brain* (5 steps: Eyes, Ears, Map Memory, Reflexes, Brain Chip Socket): the gateway to Auto Steer.
- *World Kits*: research needed to enter new worlds (Moon Tires, Snorkel Seals, and so on; see Worlds).

Lab research is shared by **every car**, unlike upgrades, so research is the long-term goal and upgrades are
the quick win.

## Auto Steer: the biggest, baddest research

**100 levels.** Opens at **Rank 10** after all five *Robot Brain* steps. Getting even level 1 or 2 should feel
like a big deal.

Each level costs coins, **🧠 Brain Chips** and real time, and needs a minimum Rank:

| Level | Coins | 🧠 Chips | Time | Min rank |
|---|---|---|---|---|
| 1 | 25,000 | 2 | 1 h | 10 |
| 2 | 26,000 | 2 | 1 h | 10 |
| 5 | 28,000 | 2 | 1.1 h | 12 |
| 10 | 31,000 | 3 | 1.4 h | 14 |
| 25 | 45,000 | 4 | 2.3 h | 22 |
| 50 | 84,000 | 7 | 5.4 h | 34 |
| 75 | 155,000 | 9 | 12.8 h | 47 |
| 100 | 288,000 | 12 | 24 h | 59 |

Formulas: coins = 25,000 · 1.025^(n−1), chips = 2 + ⌊n/10⌋, time = 1.035^(n−1) hours (24 h max),
minimum rank = 9 + ⌈n/2⌉. All 100 levels add up to about 10.8 million coins, 660 Brain Chips and 840 hours.
That's a goal of a year or more.

**🧠 Brain Chips** are rare and earned only: gold on 🔥 Hard (first time per track), winning a cup, beating a
world boss, rank-ups, a 7-day gift streak, and a few big goals. Expect about one every day or two of
regular play.

**What each level band does** (Auto Steer is a switch on the race screen; off by default):

| Levels | Auto Steer… |
|---|---|
| 1–10 | Gently keeps the car on the road through curves. Still easy to fall off. |
| 11–25 | Holds a lane well and steers around trees and signs. |
| 26–45 | Heads for coin lines. |
| 46–65 | Lines up with ramps and catches air coins. |
| 66–85 | Hits most boost pads and steers around slower rivals. |
| 86–99 | Times Turbo for straights and finds the fastest line. |
| **100** | **God mode.** A perfect line: hits **every** boost pad, ramp and coin, dodges every rival, gold sparkle trail on the car. |

Rules:
- Strength is the level percent. At level 37 it does 37% of the work and Carter still steers the rest.
- Holding ◀ or ▶ always overrides it, so he's never fighting the car.
- It's off in Time Trials and boss races, so those stay a real challenge.
- Dad can turn it off entirely in Parent Corner.

## Worlds and physics

The six current tracks stay as they are and become **World 1: Earth**. New tracks keep being added to Earth
over time. Every other world changes **how the car behaves**, using a physics profile per world:

| World | Gravity | Drag | Accel | Grip | Special physics |
|---|---|---|---|---|---|
| 🌍 Earth | 1.0 | low | 1.0 | 1.0 | normal |
| 🌙 Moon Base | **0.3** | none | 1.0 | 0.8 | giant floaty jumps, steer in the air, jump over gaps |
| 🌊 Deep Blue | 0.4 (buoyant) | **very high** | **0.35** | 0.9 | slow to speed up, currents push sideways, bubble vents |
| ❄️ Glacier Rink | 1.0 | low | 0.9 | **0.35** | sliding on ice, drift turns, snowdrifts slow you down |
| ☁️ Cloud Kingdom | 0.6 | low | 1.0 | 0.9 | bouncy trampoline clouds, wind gusts, rainbow boost bridges |
| 🦖 Dino Jungle | 1.0 | medium | 0.9 | 0.8 | mud pits, vine swings over rivers, friendly dino stampedes |
| 🧸 Toy Room | 1.0 | low | 1.1 | 1.2 | loop-the-loops, wall rides, giant block ramps |
| 🌃 Neon City | 1.0 | low | 1.0 | 1.0 | night driving, headlights, jumps between rooftops |
| 🌀 Gravity Flip | changes | low | 1.0 | 1.0 | gravity flips mid-track, driving on the ceiling |

**🌙 Moon Base (low gravity):**
- Ramps throw the car very high; jumps last 3× longer. Mega ramps launch over craters and gaps in the road.
- Boost rings float in the sky, and coins hang in constellations you can only reach by jumping.
- *Thrusters* (a new car part) steer in the air. Miss a landing and a friendly tractor beam puts you back on
  the road (slowly; no crashes).
- Tracks: Crater Hop, Moonbase Loop, Asteroid Alley, Earthrise Run. Needs *Moon Tires* research.

**🌊 Deep Blue (underwater):**
- Water drag grows with speed, so cars accelerate slowly and top out lower. Turbo is extra valuable.
- Jumps float up and drift down slowly. Bubble vents push you upward like a soft ramp.
- Currents (shown by flowing arrows and fish) push the car sideways. Kelp slows you down.
- Pearls instead of coins (worth 5 each). Treasure-chest shipwrecks hide bonus pearls.
- New parts: *Propeller* (acceleration underwater) and *Fins* (grip in currents). Needs *Snorkel Seals*
  research.
- Sound is muffled underwater; light ripples shimmer on the road; the car leaves a trail of bubbles.
- Tracks: Coral Cove, Shipwreck Sprint, Kelp Forest, The Trench.

**Engine work behind this:** a physics profile per world (gravity, drag, acceleration, grip, air control),
road gaps, currents and wind, world-only parts, and simulator runs per world. The current hard-coded values
become the Earth profile.

## Difficulty

Ships in v0.5.0 with Racer Rank.
- **Carter picks per race** on the track card: 🐢 **Easy**, 🚗 **Normal**, 🔥 **Hard** (Hard unlocks at
  Rank 3). Harder pays more coins (×0.75, ×1, ×1.5) and earns more trophy points. Medals won on Hard get a
  fire badge, and first gold on Hard earns a 🧠 Brain Chip.
  - **Easy:** slower rivals, steering help that keeps the car on the road, softer bonks.
  - **Normal:** today's game.
  - **Hard:** faster rivals with less catch-up help.
- **Dad sets the limits** in Parent Corner: which difficulties Carter can pick, plus a steering helper
  (Off / A little / Lots) that works on any difficulty.
- The simulator is run on all three, so Easy is always winnable and Hard is never impossible with a good car.

---

# Release plan

## Phase 1: Progress (v0.5 – v1.0)

### v0.5.0 Racer Rank & Difficulty
- Racer Rank with the four gauges, rank-up ceremony and rank titles (cap: Rank 10).
- Difficulty settings (above).
- **Economy balance pass** for per-car upgrades: upgrade prices scale gently with each car, prizes and goal
  rewards are re-tuned.
- `npm run sim`: the race simulator as a script in the repo, runnable before every release.
- **Polish:** far scenery fades in gently instead of popping; rounder car shadows.
  Interface: a Rank badge on the hub, and a little bounce when screens open.

### v0.6.0 Turbo Lab
- The lab building (locked until Rank 2), Professor Bolt, tier 1 and tier 2 research, real-time timers,
  benches, rushing for coins.
- Auto Steer is visible in the lab from day one as a glowing locked machine ("Rank 10"), as a goal.
- Lab goals in the Trophy Room.
- **Polish:** animated lab machines (bubbling tubes, sparks, a spinning dish); the hub becomes a little town
  with buildings to tap. Interface: a "research done" badge and a lab countdown on the hub.

### v0.7.0 Cups & Brain Chips
- Three-race championships with points, a big cup trophy, a special car for each cup, and 🧠 Brain Chips.
- **Polish:** a podium scene with the top three cars; a start/finish arch with flags; animated coin
  counting. Interface: a cup progress map.

### v0.8.0 Power-Up Boxes
- Drive through ? boxes for a shield, a coin shower, a mega magnet or a super turbo. No weapons, nothing mean.
- **Polish:** spinning glowing boxes; tire dust off-road, sparks on bumps. Interface: a power-up slot on the
  HUD with one big "use" button.

### v0.9.0 Parent Corner+ & Daily Missions
- Parent Corner: difficulty limits, steering helper, Auto Steer switch, volume, play-time reminders
  ("Time for a break!"), race history, reset.
- Daily missions: three small picture tasks a day for coins and a chance at a Brain Chip.
- **Polish:** slide transitions between screens; buzz feedback on taps (can be turned off). Interface: a
  cleaner Parent Corner layout and a missions board on the hub.

### v1.0.0 Take It With You
- HTTPS hosting (needs your OK, since it publishes the game): a real app icon, offline play, tilt-to-steer
  option. Includes a one-tap "bring my progress from the LAN game" transfer.
- **Polish:** a launch splash with the logo and "Made for Carter"; a sharper app icon. Interface: a final
  look-and-feel pass over every screen.

## Phase 2: Physics & Big Goals (v1.1 – v1.6)

### v1.1.0 Physics Engine & More Earth
- Physics profiles, road gaps, air control and currents (all set to Earth values, so nothing changes yet).
- Two new Earth tracks (Beach Boardwalk, Autumn Forest).
- **Polish:** one more layer of hills in the background; trees that sway a little. Interface: a world picker
  (only Earth for now, with "coming soon" silhouettes).

### v1.2.0 Auto Steer
- *Robot Brain* research chain, Auto Steer levels 1–100 with level bands, and the race-screen switch.
- Rank cap 20.
- **Polish:** a little blinking robot icon on the car and dotted arrows on the road while Auto Steer drives. Interface: an
  Auto Steer meter showing its level percent.

### v1.3.0 🌙 Moon Base
- The low-gravity world: four tracks, mega ramps, gaps, floating boost rings, Thrusters, *Moon Tires*
  research.
- **Polish:** a big flat Earth in the sky, grey crater roadsides, little dust puffs on landing. Interface: a world map screen.

### v1.4.0 Boss Rivals & Time Trials
- A named boss rival on every world (beat them to win their car and a Brain Chip).
- Time Trials with see-through ghost cars of your best lap.
- **Polish:** a boss intro card with the rival's car; a chunkier lap timer. Interface: a "beat your record" banner.

### v1.5.0 🌊 Deep Blue
- The underwater world: heavy drag, slow acceleration, floaty jumps, currents, bubble vents, pearls,
  Propeller and Fins parts, *Snorkel Seals* research.
- Rank cap 30.
- **Polish:** a blue-green color set, simple bubbles and fish shapes, wavy seaweed, muffled sound. Interface: a depth gauge on
  the HUD.

### v1.6.0 Two Players
- Split-screen races on one tablet: Carter vs. Dad (second player uses the other half of the screen).
- **Polish:** player name plates over cars. Interface: a "who's racing?" picker with car pictures.

## Phase 3: More Worlds (v1.7 – v2.4)

- **v1.7.0 ❄️ Glacier Rink:** ice sliding and drift turns. *Polish:* sparkly ice and snowfall.
- **v1.8.0 ☁️ Cloud Kingdom:** trampoline clouds, wind gusts, rainbow bridges. *Polish:* puffy flat clouds
  and a rainbow road.
- **v1.9.0 🦖 Dino Jungle:** mud, vine swings, friendly dino stampedes. Rank cap 40. *Polish:* swaying
  jungle and big dinos in the background.
- **v2.0.0 🧸 Toy Room:** loop-the-loops, wall rides, giant toys. *Polish:* loops drawn as big colorful
  rings the road goes through, in the same flat style.
- **v2.1.0 🌃 Neon City:** night racing, headlights, rooftop jumps. *Polish:* bright neon colors on a dark
  sky, simple street lamps.
- **v2.2.0 Mega Legend:** ranks 41–50, new lab tier 4 (World Kits mastery, legendary paints). Rank cap 50.
- **v2.3.0 🌀 Gravity Flip:** gravity changes mid-track; driving on the ceiling.
- **v2.4.0 Turbo God:** ranks 51–60. Rank 60 needs Auto Steer 100. A golden car, a gold trail, a hall of fame
  screen. Rank cap 60.

Each of these also gets interface polish (a new world map region, world-specific HUD touches) and a
simulator pass for its physics.

## Phase 4: Make Your Own (v2.5+)
- **Track Builder:** Carter lays out his own tracks with curve, hill, ramp and boost pieces, picks a world,
  and races them.
- **Car Designer:** pick a body, wheels, spoiler and colors to make a custom car.
- **Car Showroom:** a garage view of every car he owns with its paint and upgrade stars.
- **Seasons and holiday events:** a Halloween track, a winter holiday track, birthday surprises.
- **Photo mode:** freeze a jump, take a picture.

## Ideas parking lot
- More Earth tracks every few releases (Farm Fields, Pirate Port, Haunted Hill).
- A pet sidekick that rides in the car and cheers.
- Car sounds that change with the engine level.
- Weather on Earth tracks (rain puddles, fog).
- A "story" with rival characters introduced per world.

## Notes
- Over the LAN (`http://`), Chrome can't install the game as an app or use the tilt sensor. Everything
  else works. Full screen comes back with any tap.
- All numbers above are starting points. The simulator and Carter's play-testing decide the final values.
