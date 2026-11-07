# Roadmap

Turbo Dash is a racing game made for Carter (6), by Carter's Dad. It is free forever: no purchases, no ads,
no accounts, no premium currency. Coins come only from playing. Every release must load every older save
without losing anything.

Releases go to the play server (`npm run play`, port 5183, on the LAN at http://192.168.1.162:5183).
Carter plays on an Android tablet, in landscape, full screen.

## Release rules
1. **Every release looks and feels a little better.** Besides its main feature, each release ships a
   **Polish** pass: at least one graphics improvement (art, animation, effects) and at least one interface
   improvement (clearer buttons, smoother screens, easier navigation). Each release section below lists its
   polish items, and the changelog gets a "Polish" heading.
2. Old saves always load, with nothing lost.
3. The update path (version check → update button → update gate) never breaks.
4. Every release is tested at tablet size before it ships, and the race simulator is re-run when anything
   touches speed, prizes or prices.

## Shipped
- **v0.1.0** Proof of Concept: one track, rivals, coins, boost pads, Turbo, sound.
- **v0.2.0** Garage & Tracks (MVP): six tracks, six cars, four upgrades, prizes, treasure chests,
  daily gift, full screen on tablets.
- **v0.3.0** Jumps & Stunts: ramps, air coins, stunt landings.
- **v0.4.0** Paint Shop & Trophy Room: paints, stickers, goals, Carter credits, big update button,
  safer saves and save codes.
- **v0.4.1** Update Before You Race: a waiting update stops the next race and installs itself.
- **v0.4.2** Upgrades Belong to Each Car: per-car upgrade levels; old saves keep what was bought.

## What we learned from Carter playing
- **He doesn't stop to read.** He saw the update notice and started a race anyway. Anything important
  has to block the way (like the v0.4.1 update screen), use big icons, and work without reading.
- **Old versions can't be fixed after the fact.** A fix only reaches the tablet after one update, so the
  update path (version check → update button → update gate) must never break, in any release.
- **Upgrades are per car (v0.4.2), so the economy has to be re-tuned.** Maxing every car now costs about
  six times more than before. Upgrade prices, track prizes and goal rewards need a balance pass (below),
  checked with the race simulator so later tracks still feel winnable with a newer car.
- **The save lives at one exact address.** If the PC's LAN IP changes, the tablet opens an empty save.
  Reserve the IP in the router, and keep a save code (Parent Corner) as a backup. Moving to HTTPS hosting
  (v1.0) is a new address too, so it needs a built-in "bring my progress" step.
- **Pay-to-win feel, without the pay.** The fun loop is: race → coins → buy something shiny → go faster.
  Each release should add something new to earn or unlock, and a reason to come back tomorrow.

## Next

### v0.5.0 Turbo Lab (research facility)
A science lab on the hub where a friendly robot scientist researches permanent boosts. Research costs
coins and takes **real time** (it keeps going when the tablet is off), which gives Carter a reason to come
back later. No paying to skip, ever. Rushing a project costs extra coins at most.
- **One project at a time** to start, with a second lab bench to research (two at once).
- **Short timers sized for a 6-year-old**: 2–10 minutes early on, up to about an hour for the top tiers.
  A big countdown, a bubbling machine animation, and a "Research done! Tap to collect" fanfare.
- **Three research trees, shown as a picture map with lines between unlocks:**
  - **Garage science:** Pit Crew (upgrades 5% cheaper per level), Super Paint (unlocks glow and sparkle
    paints), Blueprints (unlocks lab-only cars: a Hover Car, a Thunder Truck, a Jet Racer).
  - **Race science:** Head Start (begin races with some Turbo), Turbo Tanks (Turbo lasts longer on every
    car), Bigger Ramps (higher jumps, more air coins), Bumper Shield (bonks slow you down less).
  - **Money science:** Coin Boost (+10% race prizes per level), Lucky Chests (better treasure chests),
    Bigger Gifts (larger daily gift), Coin Magnet Field (extra magnet range on every car).
- Lab results apply to every car, unlike upgrades, so research is the long-term goal and upgrades are the
  quick win.
- Lab goals in the Trophy Room ("Finish 5 research projects").
- Includes the **economy balance pass** for per-car upgrades.
- **Difficulty settings** (see below) ship in this release too.
- **Polish:** the lab's animated machines and robot; a light haze where the road meets the sky so far-off
  scenery fades in instead of popping; softer car shadows. Interface: a lab-ready "!" badge, bigger back
  buttons, and a little bounce when screens open.

### Difficulty (ships with v0.5.0)
- **Carter picks per race** on the track card: 🐢 **Easy**, 🚗 **Normal**, 🔥 **Hard**. Harder pays more:
  Easy ×0.75 coins, Normal ×1, Hard ×1.5, with a fire badge on medals won on Hard.
  - **Easy:** slower rivals, stronger steering help that keeps the car on the road, softer bonks.
  - **Normal:** today's game.
  - **Hard:** faster rivals with less catch-up help, so it's a real challenge once a car is upgraded.
- **Dad controls the limits** in Parent Corner: which difficulties Carter can pick, plus a "steering
  helper" switch (Off / A little / Lots) that works on any difficulty.
- The race simulator is re-run on all three difficulties so Easy is always winnable and Hard is never
  impossible with a maxed car.

### v0.6.0 Cups
Three-race championships with points, a big cup trophy, and a special car for winning each cup.
- **Polish:** a podium scene with the top three cars after each race; a start/finish arch with flags;
  animated coin counting. Interface: a cup progress map instead of a list.

### v0.7.0 Power-Up Boxes
Drive through ? boxes for a shield, a coin shower, a mega magnet or a super turbo. No weapons, nothing mean.
- **Polish:** spinning glowing boxes; tire dust off-road, sparks when bumping, smoke on hard turns.
  Interface: a power-up slot on the HUD with one big "use" button.

### v0.8.0 More Worlds
Jungle Jam, Ocean Bridge, Night City; rain and snow; tunnels.
- **Polish:** night lighting with headlights and street lamps; rain and snow particles; a third background
  layer for depth. Interface: a world map screen to pick worlds, then tracks.

### v0.9.0 Parent Corner+
The hidden screen (tap the version label 5 times; save codes shipped in v0.4.0) gains volume, play-time
reminders ("Time for a break!" after a set time), a race history, and a reset. Difficulty limits arrive
earlier, in v0.5.0.
- **Polish:** smooth slide transitions between screens; buzz feedback on taps (vibration, can be turned
  off). Interface: a cleaner, labeled Parent Corner layout.

### v0.10.0 Time Trials & Ghosts
Race your own best lap as a see-through ghost car.
- **Polish:** a redesigned speedometer and lap timer; a motion-blur effect at top speed. Interface: a
  "beat your record" banner when he's ahead of the ghost.

### v1.0.0 Take It With You
Host a release on HTTPS (GitHub Pages or similar, needs your OK because it publishes the game) so it
installs as a real app icon on the tablet, runs fully offline and full screen, and tilt-to-steer works
(Chrome only allows motion sensors on HTTPS). Includes a one-tap "bring my progress from the LAN game"
transfer, since the new address starts with an empty save.
- **Polish:** a launch splash screen with the logo and "Made for Carter"; a sharper app icon; a final
  look-and-feel pass over every screen.

## Ideas for later
- **Two players on one tablet**: split-screen races, Carter against Dad.
- **Daily missions**: three small tasks a day ("Do 5 jumps on Desert Dash") for bonus coins.
- **Boss races**: beat a named rival on each world to win their car.
- **Car showroom**: a garage view of every car Carter owns, with its paint and upgrade stars.
- **Tilt to steer** as an option (needs HTTPS, see v1.0).

## Notes
- Over the LAN (`http://`), Chrome can't install the game as an app or use the tilt sensor. Everything
  else works. Full screen comes back with any tap.
