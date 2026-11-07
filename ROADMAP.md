# Roadmap

Turbo Dash is free forever: no purchases, no ads, no accounts. Coins come only from racing.
Every release must load every older save without losing anything.

Releases go to the play server (`npm run play`, port 5183, on the LAN at http://192.168.1.162:5183).

## Shipped
- **v0.1.0** Proof of Concept: one track, rivals, coins, boost pads, Turbo, sound.
- **v0.2.0** Garage & Tracks (MVP): six tracks, six cars, four upgrades, prizes, treasure chests,
  daily gift, full screen on tablets.

## Next
- **v0.3.0 Jumps & Stunts**: ramps that launch the car into the air, air-time coins, a landing boost,
  and "STUNT!" popups. Rivals jump too.
- **v0.4.0 Paint Shop & Trophy Room**: buy paint colors and stickers for each car; a shelf showing
  every trophy won; goals ("Win 5 races", "Collect 500 coins") that pay coin rewards.
- **v0.5.0 Cups**: three-race championships with points, a big cup trophy, and a special car for winning
  each cup.
- **v0.6.0 Power-Up Boxes**: drive through ? boxes for a shield, a coin shower, a mega magnet or a
  super turbo. No weapons, nothing mean.
- **v0.7.0 More Worlds**: Jungle Jam, Ocean Bridge, Night City; rain and snow; tunnels.
- **v0.8.0 Parent Corner**: a hidden settings screen (hold the version label) with an easy-steering
  assist, difficulty, volume, play-time reminders, and save backup/reset.
- **v0.9.0 Time Trials & Ghosts**: race your own best lap as a see-through ghost car.
- **v1.0.0 Take It With You**: host a release on HTTPS (GitHub Pages or similar, needs your OK because it
  publishes the game) so it installs as a real app icon on the tablet, runs fully offline and full screen,
  and tilt-to-steer works (Chrome only allows motion sensors on HTTPS).

## Notes
- Over the LAN (`http://`), Chrome can't install the game as an app or use the tilt sensor. Everything
  else works. Full screen works from any tap.
