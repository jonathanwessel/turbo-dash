# Roadmap

Turbo Dash is a racing game made for Carter (6), by Carter's Dad. It is free forever: no purchases, no ads,
no accounts, no premium currency. Coins come only from playing. Every release must load every older save
without losing anything.

Releases go to the play server (`npm run play`, port 5183, on the LAN at http://192.168.1.162:5183).
Carter plays on an Android tablet, in landscape, full screen.

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

### v0.6.0 Cups
Three-race championships with points, a big cup trophy, and a special car for winning each cup.

### v0.7.0 Power-Up Boxes
Drive through ? boxes for a shield, a coin shower, a mega magnet or a super turbo. No weapons, nothing mean.

### v0.8.0 More Worlds
Jungle Jam, Ocean Bridge, Night City; rain and snow; tunnels.

### v0.9.0 Parent Corner+
The hidden screen (tap the version label 5 times; save codes shipped in v0.4.0) gains an easy-steering
assist, difficulty, volume, play-time reminders and a reset.

### v0.10.0 Time Trials & Ghosts
Race your own best lap as a see-through ghost car.

### v1.0.0 Take It With You
Host a release on HTTPS (GitHub Pages or similar, needs your OK because it publishes the game) so it
installs as a real app icon on the tablet, runs fully offline and full screen, and tilt-to-steer works
(Chrome only allows motion sensors on HTTPS). Includes a one-tap "bring my progress from the LAN game"
transfer, since the new address starts with an empty save.

## Ideas for later
- **Two players on one tablet**: split-screen races, Carter against Dad.
- **Daily missions**: three small tasks a day ("Do 5 jumps on Desert Dash") for bonus coins.
- **Boss races**: beat a named rival on each world to win their car.
- **Car showroom**: a garage view of every car Carter owns, with its paint and upgrade stars.
- **Tilt to steer** as an option (needs HTTPS, see v1.0).

## Notes
- Over the LAN (`http://`), Chrome can't install the game as an app or use the tilt sensor. Everything
  else works. Full screen comes back with any tap.
