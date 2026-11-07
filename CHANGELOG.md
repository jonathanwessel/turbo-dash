# Changelog

## v1.2.0 — Feel the Speed 🏎️

Racing looks and feels better on every track, plus a garage with every car, world previews and a tricky new bonus course.

**How it feels**
- **💨 Drafting:** drive right behind another car for a moment and you get a little extra speed ("DRAFT!").
- **Friendlier bumps:** side by side, the other car gets nudged aside and wobbles; you only lose a little speed if
  you steer into it. Catching a slower car from behind no longer stops you like a wall.
- **Guardrails are solid:** on sharp curves the rail holds you on the road with sparks (a small slowdown). If you go
  wide before the rail starts, it guides you back onto the road.
- **Landings:** the car squashes down on a big landing and kicks up dust.

**How it looks**
- Skid marks and tire smoke on hard turns, a Turbo zoom with stronger speed lines, cars that lean into turns.
- Far-away layers: snowy mountains, desert mesas, a sunset over purple hills (Autumn Forest) and the Piqua skyline.
- **🚇 Tunnels** on Desert Dash, Snowy Peaks, Lava Mountain and the new night track, with an engine echo.
- **🌃 Piqua Night Lights:** a new Earth track at night with lit windows, streetlamps and headlights (opens after
  Candy Land).
- **🧸 Toy Track World:** shinier plastic, a rim light, soft shadows under the toys, twinkling coins, and toy cars
  whose bodies bounce on their wheels when they land.
- **✨ Effects** (Settings): Auto, Full or Simple. Auto switches to Simple by itself if a tablet starts to struggle.

**New things to do**
- **▦ All cars** in the garage: every car by world, in color once it's yours, dimmed if you can buy it now, and a
  mystery shape (with how to get it) for the rest. Tap one to see it.
- **👀 World previews:** the 👀 chip on the race screen (or 👀 Try in the garage) gives one lap of a world that isn't
  open yet, in that world's own car. No coins or prizes, and nothing is saved; the card says what opens it for real.
- **🏙️ Downtown:** a bonus course outside the progression, always open. Squared-off city-block corners closed off
  by dump trucks and ROAD CLOSED barriers. Steer early or BONK! It pays like any race but never changes a goal, cup or
  rank gauge.

**Tested:** a new physics test (drafting, bumps, rails, landings, skid marks, zoom, tunnels, Downtown, Toy Track World,
whole bot races) now runs with the save test before every release; every screen checked at 7 sizes.

## v1.1.0 — Math School 🧮

The Driver School's tickets now come from a math game he plays himself, instead of time a grown-up logs.

- **🧮 Math Lap** (Driver School → the big green button): 5 questions with pictures to count (cars, coins, apples,
  ducks…). Adding starts with sums to 5; taking away shows the pictures with some crossed out. Big answer buttons, no
  timer, and a wrong answer just fades out so he can try again. His car drives along a little track as he answers.
- **Tickets:** every lap earns a 🎟️, and a lap with no mistakes earns two. Two perfect laps in a row make the
  questions a step harder (adding to 5 → adding to 10 → adding and taking away to 10 → to 20); a lap with lots of
  tries steps back down.
- Tickets still buy the same lessons (Focus, Reflexes, Courage, Smarts) and the same license levels, so the License
  gauge from Rank 10 works as before.
- **For grown-ups** (Driver School → 👪 Grown-ups): the hardest level allowed (adding to 10, adding and taking away
  to 10, or to 20), the most tickets per day (3, 6, 10 or no limit; 6 to start), the License gauge switch, and the
  history. Progress shows laps, right answers, tries and the current level. The reading/outside log is gone, so
  there's nothing to fake; tickets, lessons and history from before carry over.
- **A harder grown-up check:** a two-digit multiplication (like 24 × 8) typed on a number pad, with no answers to
  pick from, and a 30-second wait after two wrong tries.
- The Main Street library, the break screen and Coach Cone now point to Math Laps.

## v1.0.1 — Faster early ranks 🏁

- **Ranking up is much quicker at the start.** Rank 3 now needs 10 wins in total (was 36), Rank 4 needs 23 (was 70)
  and Rank 5 needs 40 (was 111). In the career sim a kid reaches Rank 3 after about 25 races (was 80) and Rank 5
  after about 90 (was 260). From about Rank 20 the climb is the same as before, so the long game is unchanged.
- **The Rank screen says how many wins are left** ("🏁 Win 4 more races!") when wins are what's holding him back.
- Saves carry over as usual; a save that already has enough wins can rank up straight away.
- Roadmap: next is **Math School** (the Driver School becomes an addition and subtraction game).

## v1.0.0 — Carter's 1.0 🏁

The 1.0 milestone: everything from the roadmap's 1.0 plan in one big release, then a full review.

**New things to do**
- **🚜 Farm Fields, 🏴‍☠️ Pirate Port and 🛶 Piqua River Run**: three new Earth tracks for early in the game (cows,
  barns and a windmill; a pirate ship, parrots and cannons; covered bridges, ducks and the Great Miami River).
  They branch off Beach Boardwalk, Desert Dash and Autumn Forest, so no track an older save had open closes.
- **🌾 Country Cup** (Farm, Pirate, River) with a new prize car, the 🚜 **Barnstormer**.
- **🌧️ Weather:** about one Earth race in four is rainy (grey sky, rain streaks, puddles that splash and nudge
  you sideways, a soft rain sound) or snowy on Snowy Peaks. Parent Corner can switch it off.
- **🧼 Car Wash** (Rank 4): cars get a little muddier every race (you can see the splats). Rub the car clean with
  your finger; a freshly washed car earns a ✨ sparkly bonus on its next race (once a day).
- **🏛️ Museum** (Rank 8): a timeline of his firsts — first wins on each track, cups, bosses, new cars, new worlds and
  every rank. Older saves start it from the trophies they already have.
- **📱 Tilt to steer** (Settings): tilt the tablet like a steering wheel. It zeroes itself at every countdown, and
  the buttons still work. Settings shows a live ⬅️ ➡️ arrow and a Flip option in case a tablet reports tilt the
  other way round. (Works on the website and the installed app.)
- **🏁 A launch splash** when the game opens (a tap skips it).

**For grown-ups (Parent Corner)**
- **📊 Progress:** time played, races, wins and win rate, coins earned, races per day for the last two weeks, his
  best tracks, the next rank's gauges with an estimate of how much play it will take, and the reading/outdoor
  minutes logged. Everything stays on the tablet.
- **📖 How it works:** a short guide to ranks, the Turbo Lab, Driver School, the grown-up settings and saving.
- **Play Store package prepared** (not published): `android/ANDROID.md` walks through making the Android app with
  PWABuilder, the store listing text, a feature graphic, the Play Console steps (12 testers × 14 days) and a privacy
  page at https://jonathanwessel.github.io/turbo-dash/privacy.html.

**Review fixes** (three independent reviews of everything new, plus layout checks at 7 screen sizes)
- Google Save: the play-time counter no longer makes every sync look like "this device changed" (that could have
  uploaded over another device's newer copy); a tie keeps this device's copy.
- The Barnstormer's upgrades were priced like an end-game car (a car's price tier no longer depends only on its
  place in the list).
- Covered bridges, pirate ships, barns and palms stood partly on the road (and you could drive through them); they
  now stand fully beside it.
- Rain puddles splashed every two seconds; now every few seconds. The rain picture no longer lingers behind the
  results. The Time Trial ghost is never muddy.
- Tilt: only offered where the sensor can work (not on the home-network address), asks iPhone/iPad again after a
  restart, and a bad sensor reading can never break steering.
- Play time counts real time, and only while playing (not on the title, pause or grown-up screens).
- The Progress page says "ready to rank up" only when it really is; older saves get an estimated play time and coins
  earned instead of zero.
- Museum text from a save code is always shown as text; worlds an older save already raced don't get a new "first
  race" entry; the Fire Station's truck goes in the Museum.
- The sparkle bonus shows on the result card instead of a toast that another toast could replace.
- The name screen has a Back button when opened from Settings; re-pasting this tablet's own save code is recognised.
- The splash can never block the game (a fail-safe removes it), and a tap that skips it doesn't press PLAY.
- Emoji icons get room on the garage, Settings, trophy and cup cards at large sizes; Main Street's arrows fit inside
  the road at any height; locked track cards in portrait.
- Saves from every earlier version carry over (20 save checks, new fixtures for v0.22 and v1.0).

## v0.22.1 — Install Button

- **📲 Install** on the title screen (and only there): installs Turbo Dash as an app on the device, so it opens
  full screen from the home screen and works offline. It only shows when the device can install it and it isn't
  installed yet:
  - Android tablets/phones and Chrome or Edge on a computer: tapping it opens the browser's own install prompt.
  - iPhone/iPad (Safari): it shows how to do it (Share ⬆️ → Add to Home Screen ➕).
  - Hidden when the game is already running as an installed app, and on the home-network (http) address, where
    browsers don't allow installing.

## v0.22.0 — A Growing Town, Your Name & New Sounds

- **Construction sites that grow.** The 🍦 Ice Cream Shop (Rank 12), 🚒 Fire Station (Rank 15) and 🧺 Park
  (Rank 20) are built step by step over the 5 ranks before they open: a fenced lot with a dirt pile and a digger,
  then a foundation, low walls and a crane, then tall walls with scaffolding, then the finished building. Each
  site's sign shows what it will be and fills one green pip per rank.
- **"What's your name?"** The first time someone plays (and after a reset), the game asks for the player's
  name, and every message uses it ("Way to go, Carter!", the Driver License, Coach Cone, the professor). Change it
  any time in Settings → ✏️ My name. Friends who play from the shared link get their own name. (The title still
  says "Made for Carter".)
- **Every world sounds different.** Each Earth track, the Moon, Deep Blue, Glacier Rink and Toy Track World has its
  own race tune, speed and instruments (dreamy on the Moon, bubbly under the sea, sparkly bells on the ice, a toy
  piano in the playroom).
- **Every kind of car sounds different:** monster trucks rumble low, sports cars whine high, rockets roar, the
  submarine hums, the fire truck chugs.
- **Google Save syncs safely between devices.** It now checks what changed on each side since the last sync, so
  reading tickets logged on one device aren't overwritten by more races on another. (It still needs the Google
  sign-in key: see README → "Google Save".)
- **Fixes:** the construction-site signs ("RANK 12", "RANK 15", "RANK 20") ran off their boards; the ◀ ▶ scroll
  arrows on Main Street covered building signs (they now sit on the road); "TURBO LAB" was a pixel too wide.
- **The layout checker now checks Main Street too.** It's drawn as one big picture (SVG), which the checker used
  to skip; now it measures every label against its sign, checks for buttons covering labels, and looks at the
  street scrolled to the start, middle and end.
- New release checks: the Google Save sync decision (5 cases).

## v0.21.0 — Bug Hunt

A full bug hunt: three independent code reviews (menus and flow, both race engines, saves and data), a scripted
first session as a brand-new player, and the layout checker now looking inside every button. 25 fixes.

**Things Carter could hit**
- **Easy-only games could never open a new track.** If a grown-up allows only Easy in Parent Corner, Easy wins
  now open the next track (before, only Normal or Hard wins counted, so the game was stuck on the first track).
- **🏠 after the last race of a cup threw the cup away** (no prize car, no coins, no trophy). It now shows the cup
  results first.
- **The "update now" banner no longer appears in the middle of a cup** (tapping it reloaded the game and lost the
  cup).
- **Pausing right after the finish line lost the race's coins.** The pause button now waits for the results.
- **Losing a boss race counted as "2nd place"** (a silver medal and mission credit for losing). It no longer
  does; beating a boss again pays a 1,000 bonus (the first win still pays 5,000).
- **The 🤖 Auto Steer button showed in boss races**, where Auto Steer is meant to be off.
- **Locked track cards were a jumble** (lock, "Win first!", name and stars on top of each other). They now show
  the track's picture, a big lock and what to win.
- **The garage showed future worlds (🌙 🌊 🧊 🧸 0/3) to a new player.** It now shows the worlds he can race in
  plus the next one, like the race screen.
- **The rank-up screen now names everything that opens** (Time Trials at Rank 4, the Champion Cup at 7, Big Bruno
  at 9, the 4th lab bench at 15).
- The "Win all three cups" goal is now "Win 3 different cups" (there are more than three now).
- Tapping a Toy Track World race while it loads, then leaving, no longer starts a race on some other screen.
- Screens that open a moment later (missions, the library, a locked lab) no longer pull him back if he already
  tapped something else.
- The park's Brain Chip day follows the local calendar, and its message shows the coins.

**Racing**
- **A bump could set off boost pads, ? boxes and coins far ahead.** After a bump pushed a car back, the next
  frame "drove over" up to 30 pieces of road. Fixed in both engines.
- **A snowbank hit 5 to 7 times instead of once** (cutting speed far more than it should). It hits once now.
- **A hidden minimum speed:** the hill code quietly raised every car to a minimum speed (which also made Bumper
  Shield level 1 do nothing). Hills now only slow or speed cars on slopes.
- **Toy Time Trials:** the ghost ran ahead after a fall (it stopped recording while the toy hand carried you).
- **Toy Track World:** rivals no longer pass through each other or get knocked through the wall; a rival level
  with you bumps you sideways instead of pushing you back.
- Toy Track World no longer leaks graphics memory race after race (old cars, shields and tracks are freed).
- Some per-race state (boost pad counter, tractor beam) no longer carries into the next race.

**Saves and grown-up screens**
- A save with broken daily missions no longer crashes the result screen (which could lose a session's
  progress); the missions are simply made fresh. Coins can never become "not a number".
- The grown-up check no longer pops back up after a quick wrong-then-right answer (or a quick Cancel).
- If a tablet can't show 3D, Toy Track World says so instead of running a toy track in the wrong engine.

**Checks:** 18 save checks (new: broken missions, Easy-only unlocks), the reviewers' own repro scripts all pass,
hands-off driving still finishes last, the starter car still has to be upgraded to win, the career simulator has
no stuck gates, and the layout checker is clean.

## v0.20.2 — No More "null"

- **Garage fix:** cars you earn instead of buy showed "🪙 null" on a gold, buy-looking button (the Fire Dash, and
  boss cars like the Thunder King). Every car now says how to get it: "🚒 Fire Station · Rank 15", "👑 Beat Big
  Bruno", "🏆 Win the Gold Cup", "🌙 Reach the Moon Base", "🚦 Driver School", or its price.
- **The layout checker now reads the words too:** it flags "null", "undefined", "NaN" and similar anywhere on
  screen, and steps through every car in the garage. It runs with a brand-new save, a mid-game save and a
  late-game save, because some text only shows when you don't own something yet.

## v0.20.1 — Every Screen Fits

Fixes for things Carter's dad spotted on the tablet, and a check of every screen at 8 screen sizes.
- **Result screen:** the treasure chests no longer spill their numbers into the buttons. Opened chests show the
  coin and number neatly inside, and the line reads "🎁 Treasure: 🪙164!" so it's clear what it is. On short,
  wide screens the card is more compact.
- **Racer Rank:** the hint no longer says "Finish research" when Research is already full (a 0 / 0 gauge counted
  as empty). It now points at the gauge that really needs filling, like "🏁 Win races!".
- **Gifts building:** it always opens now. After today's gift is collected it says "Come back tomorrow!" and shows
  tomorrow's gift, instead of quietly doing nothing.
- **Short, wide screens** (phones and wide tablets in landscape):
  - The race screen's buttons fit in a tighter band, so the track cards (and their prizes) fit.
  - The Trophy Room's top shelf rows could be pushed above the screen where they couldn't be reached; the shelf
    now starts at the top and scrolls.
  - The Racer Rank gauges, the License gauge and the hint fit on the screen.
  - The garage car picture is smaller, so the Drive button fits.
  - The title logo no longer runs into "Made for Carter".
- Big emoji icons get room so they never touch the words under them (rank gauges, school skills, lab, gifts).
- Any screen taller than the display can now scroll, so nothing is ever out of reach.
- **New quality check:** a layout checker (dev builds only) that finds overlapping, spilling and off-screen text
  and buttons on every screen. Checked at 740×360, 915×412, 1000×448, 1024×600, 1280×800, 1920×1080 and
  800×1280 (portrait).

## v0.20.0 — Smoother Racing & a Simpler Race Screen

A tune-up of the classic engine (Earth, Moon, Deep Blue, Glacier Rink) after a full review of its physics and
collisions, plus a race screen made simpler for a 6-year-old.

**Physics and collisions**
- **Rivals no longer drive through each other.** Before, two rivals overlapped about 4% of every race; now
  they ease apart sideways (overlap is down by about 97%).
- **Side bumps feel right.** Touching a rival side by side now bumps you both apart sideways. Before, it snapped
  you behind them like an invisible wall. Rear-ending a rival still slows you down.
- **Boost pads only work when you drive over them**, not when you fly over them.
- **Hills matter a little:** rolling downhill speeds you up, climbing slows you down (rivals too).
- **Jumps depend on speed:** hit a ramp faster to fly higher and farther.
- Checked: hands-off driving still finishes last, the starter car still has to be upgraded to win, and the
  career simulator has no stuck gates.

**A simpler race screen**
- The world buttons only show the worlds you can race in, plus the next one as a goal. No more rows of locked
  worlds or "coming soon" buttons.
- The Cups, Boss and Trials tabs appear only once they open (Trials at Rank 4, Cups at Rank 5, Boss at
  Rank 9). Early on the screen is just Easy / Normal / Hard and the big track cards.
- Difficulty shows coins as pictures (🪙 / 🪙🪙 / 🪙🪙🪙) instead of numbers.
- Locked tracks say "Win 🍭 first!" with the picture of the track to win, instead of a sentence.
- Bigger buttons and easier-to-read track names.

**Polish (graphics)**
- Distance haze: the far road and fields fade softly toward the sky, so the world looks deeper.
- Soft shadows under trees, rocks and other roadside things.
- A jumping rival's shadow stays on the ground under it.

## v0.19.0 — 🧸 Toy Track World (Next Gen)

- **The game levels up!** Toy Track World is a whole new kind of racing with a **brand-new 3D engine**. It opens
  at **Rank 35** after researching the **🪄 Shrink Ray** (new lab tier 7). The first visit shows a big "THE
  GAME LEVELS UP!" card.
  - **Real 3D:** a giant sunny playroom (wooden floor, a rainbow play rug, a big window, star wallpaper) with
    giant toys all around: letter blocks, crayons, bouncy balls, brick towers and a teddy bear.
  - **Plastic toy track** with side walls on little stilts, in a different color on every track, with joints
    between the pieces. Bump the walls and you slow down a little.
  - **Loop-the-loops!** The camera rides upside down with you. Go in fast: too slow at the top and you fall
    off, and a friendly giant 🖐️ toy hand puts you back on the track.
  - **Jumps over gaps** (too slow and you drop in, and the hand helps again), **banked curves**, hills, and
    **booster stations** with big spinning tires that fling you forward.
  - **Shiny toy cars** with glossy paint, spinning wheels, soft shadows and reflections. Every car in the
    garage gets a 3D toy version.
  - **Four toy tracks:** Bedroom Loop, Block Tower Run, Cookie Jar Dash and Playroom Grand Prix.
  - **New cars:** the **Toy Racer** (400,000 coins), the **Loop Legend** (win the new **Toy Cup**) and the
    **Wind-Up Rocket** (beat the new boss **🤖 Major Wind-Up**). Cars made for toy tracks are a little faster
    there.
  - **New research:** Loop Grip (stay on loops when slower), Booster Tune (boosters fling you farther), Wall
    Bumpers (walls slow you less), Wind-Up Motor (speed up faster on toy tracks).
  - Coins, ? boxes, Turbo, power-ups, cups, Time Trials with a ghost, bosses and Auto Steer all work in the new
    engine.
  - The 3D part loads only when Toy Track World is first needed, so the game still starts fast.
- **Ranks go up to 40.** New goals: win in Toy Track World, drive through 25 loop-the-loops.
- Saves from every earlier version carry over (17 save checks).
- Tuned with the career simulator: Toy Track World opens after about 120 hours of racing, and Rank 40 takes
  about 160 hours, with no stuck gates. The best ice car finishes mid-pack on plastic track, and Major Wind-Up
  beats a fully upgraded Loop Legend about half the time.

## v0.18.0 — 🧊 Glacier Rink

- **The third new world: Glacier Rink, on the ice.** It opens at **Rank 30** after researching **🧊 Ice
  Studs** (new lab tier 6). Pick 🧊 Glacier Rink in the world bar.
  - **Slippery ice:** your car keeps sliding, so steering changes where you're *going*, not where you are.
    Steer early and gently! Curves push harder too.
  - **❄️ Drift boosts:** steer *into* an icy curve and hold it until the snow spray turns blue and pink, then
    let go for a **DRIFT BOOST**.
  - **Snowbanks** sit in one lane: steer around them, or go **POOF** through them (slowly).
  - **Ice cars:** cars made for ice have a ❄️ by their name in the garage. Other cars spin their wheels a
    little on the ice.
  - **Four ice tracks:** Ice Cave, Frozen Lake, Aurora Pass and Glacier Summit.
  - **New cars:** the **Frost Runner** (220,000 coins: studded tires and two skis on the roof), the **Polar
    Bear** (win the new **Glacier Cup**) and the **Blizzard Wolf** (beat the new boss **🐺 Fang the Ice Wolf**).
  - **New research:** Snow Chains (slide less), Drift Master (bigger drift boosts), Snowplow (snowbanks slow you
    less), Warm Engine (speed up faster on ice).
- **Ranks go up to 35.** New goals: win on the ice, do 50 drift boosts.
- Saves from every earlier version carry over (16 save checks).
- Tuned with the career simulator: Glacier Rink arrives around month 11, Fang falls around month 13, and the
  whole game now runs about 15 months to Rank 35, with no stuck gates. The Kraken Cruiser (the best sea car)
  finishes mid-pack on the ice, so the new ice cars are worth earning.
- Split-screen Two Players is off the plan.

**Polish (graphics ladder, step 4: shiny ice)**
- The northern lights waving across a starry evening sky, and snow falling in two layers.
- Glossy ice roads with long shines and twinkling glints, and cars reflected in the ice.
- Frosty pines with icicles, see-through ice crystals, igloos, snow forts with flags, and waddling penguins.
- Snow spray and blue and pink sparkles off your tires while you drift.
- **Garage:** a row of world buttons (🌍 🌙 🌊 🧊) jumps straight to that world's cars and shows how many you
  own.

## v0.17.0 — 🌊 Deep Blue & Time Trials

- **The second new world: Deep Blue, under the sea.** It opens at **Rank 25** after researching **🤿 Snorkel
  Seals** (new lab tier 5). Pick 🌊 Deep Blue in the world bar.
  - **Heavy water:** everything is slower and speeding up is hard, so bumps and bonks cost more.
  - **Currents** push your car sideways on long stretches (a blue sheen with sliding arrows shows which way):
    steer against them!
  - **Bubble vents** on the road float you up high. Hit one to fly through a row of **🦪 pearls** (5 coins
    each).
  - **Four sea tracks:** Kelp Forest, Coral Reef, Shipwreck Bay and Deep Trench.
  - **New cars:** the **Turbo Sub** (120,000 coins: periscope, side fins and a spinning propeller), the
    **Manta Ray** (win the new **Ocean Cup**) and the **Kraken Cruiser** (beat the new boss **🐙 Captain
    Kraken**).
  - **New research:** Propellers (speed up faster underwater), Fins (currents push less), Pearl Diver (grab
    pearls from farther away).
  - Underwater races sound muffled, like being under water.
- **⏱️ Time Trials!** A new Trials tab on the Race Track screen. Race alone against the clock on any open track.
  Your best run comes back as a **see-through ghost car** to beat next time. Bronze, silver and gold medal times
  for every track, each medal pays coins once.
- **Ranks go up to 30.** New goals: win under the sea, collect 50 pearls, earn Time Trial medals.
- **Fix:** the Turbo Lab only showed research tiers 1 to 3, so Moon Tires couldn't be started. Every tier shows
  now, and the 4th lab bench shows when it unlocks (Rank 15).
- Saves from every earlier version carry over (15 save checks).
- Tuned with the career simulator: Deep Blue arrives around month 7, Captain Kraken falls around month 9, and
  the whole game now runs about 10 months to Rank 30, with no stuck gates.

**Polish (graphics ladder, step 3: under the sea is the most detailed world yet)**
- The sea surface shimmering far above, light rays swaying down through the water, schools of fish, and
  bubbles rising everywhere.
- Swaying kelp, branching coral, shell rocks with starfish, glowing jellyfish, sea anemones and sparkly
  treasure chests along the road.
- Light ripples dancing on the road, a bubble trail behind your car, glowing pearls, and bubble vents with
  bubbles streaming up.
- A new Glacier Rink sign in the world bar for what's coming next.

## v0.16.0 — 👑 Main Street Grows & Bosses

- **Bosses!** A new **👑 Boss** tab on the Race Track screen. A boss race is one-on-one against a named rival who
  fires a Turbo burst every few seconds. Beat them to win **their car, a Brain Chip and 5,000 coins** (rematch any
  time for fun).
  - **🦏 Big Bruno** on Space Road (Rank 9): win the **Thunder King** monster truck.
  - **👩‍🚀 Captain Luna** on Earthrise Run (Rank 23): win the **Starfire** moon car.
  - Each boss shows an intro card with what they say and the car you can win.
- **Main Street grows with your rank.** New buildings start as fenced construction sites showing the rank they
  open at:
  - **📚 Library** (open now).
  - **🍦 Ice Cream Shop** (Rank 12): a free treat of coins once a day.
  - **🚒 Fire Station** (Rank 15): the firefighters give you **Fire Dash**, a real fire truck with a ladder and
    flashing lights.
  - **🌳 Park** (Rank 20): a daily coin picnic, plus a Brain Chip every third day.
- New goal: **Beat a boss**. Beaten bosses also count toward your trophy gauge.
- Saves from every earlier version carry over (14 save checks).
- Tuned with the career simulator: Bruno falls around day 40, Luna around month 6, and the whole game still runs
  about 7½ months with no stuck gates.

**Polish**
- Main Street is wider and **scrolls sideways**, with big ◀ ▶ arrows at the edges. The ▶ arrow shows a red dot
  when a building off screen has something waiting for you.
- New building art: library columns and a book sign, a striped ice-cream awning with a giant cone, a fire house
  with big garage doors.
- The boss intro card draws the prize car big, in full detail.

## v0.15.0 — 🌙 Moon Base

- **The first new world: the Moon.** It opens at **Rank 20** after researching **Moon Tires** in the Turbo Lab
  (new lab tier 4). Pick 🌙 Moon Base in the world bar on the Race Track screen.
  - **Low gravity:** ramps launch you sky-high and you float down slowly. Steer in the air to grab the tall coin
    arcs.
  - **Gaps in the road:** every ramp jumps a gap. Miss it and a friendly **tractor beam** floats you across
    (slowly, and no crash).
  - **⭕ Boost rings** float near the top of each jump: fly through them for a speed boost.
  - **Four moon tracks:** Crater Hop, Moonbase Loop, Asteroid Alley and Earthrise Run, tougher than anything on
    Earth.
  - **New cars:** the **Lunar Rover** (60,000 coins, big wheels, an antenna and a dish) and the **Comet**, the
    prize for winning the new **Moon Cup**.
  - **New research:** Thrusters (steer better in the air) and Ring Magnet (catch rings more easily).
- **Ranks go up to 25.** New goals: win on the Moon, fly through 25 boost rings.
- Moon cars can only be bought once you reach the Moon.
- Tuned with the career simulator: the Moon arrives around month 5 of regular play, and today's whole game now
  runs about 7½ months (with ~20 minutes a day of logged real-world time), with no stuck gates.

**Polish (graphics ladder, step 2: the Moon is more detailed than Earth)**
- Earth glowing in the sky with clouds and a shadow side, a deep twinkling starfield and a soft nebula.
- Shaded moon rocks, flat craters, turning radar dishes with blinking lights, and glass domes with glowing
  windows.
- A dark pit where the road is missing, with glowing edges; a soft light cone for the tractor beam.
- The world bar shows which worlds are open and what's needed for the locked ones.

## v0.14.1 — Scan to Share

- **Scan to share!** The title screen has a QR code card: friends point a phone camera at it to open Turbo Dash
  (https://jonathanwessel.github.io/turbo-dash/). It's drawn into the game, so it works offline too.
- **Title screen spread out**: the logo sits at the top, "Made for Carter" in the middle, and PLAY at the bottom.

## v0.14.0 — Driver School

- **🚦 The Driver School opens** on Main Street. It turns time away from the screen into driver training:
  - **Grown-ups log real-world time** (Driver School → "Grown-ups: log time", behind the grown-up check):
    📚 Reading, 🌳 Playing outside, 🧹 Helping out, 🎨 Making something, 🚲 Exercise, in 10–60 minute steps.
    Every 10 minutes = 1 🎟️ Training Ticket (reading can count double). Optional daily limit and a history list.
  - **Coach Cone** teaches lessons: spend tickets on four **Driver Skills** that help every car:
    🎯 Focus (curves pull less), ⚡ Reflexes (Turbo fills faster), 🦁 Courage (bigger jump boosts and stunt coins),
    🧠 Smarts (more mission coins). Ten levels each.
  - **🪪 Driver License**: lessons raise it from Learner → Bronze → Silver → Gold → Platinum → Piqua Pro.
    **Gold** wins the **🚓 Piqua Patrol** car, with flashing lights.
  - **From Rank 10 the License is a 5th rank gauge**, so ranking up also takes some real-world time. A grown-up
    can switch that gauge off on the log page.
- The break screen now suggests reading or playing outside to earn tickets.
- New goals: take a lesson, earn a Gold license.
- Old saves get an empty Driver School; nothing else changes. The save test now covers v0.13 and v0.14 saves.
- Career simulator: with ~20 minutes a day of logged reading/outside time, today's content runs about 6 months.

**Polish**
- The Driver School classroom: a chalkboard sign with a working traffic light, Coach Cone (a blinking, bobbing
  traffic cone with a whistle), a big ticket counter, a license card in its level's color, skill cards with pips.
- The schoolhouse in town lost its "Coming soon" sash and gets a red "!" when there's a lesson to buy.

## v0.13.2 — Smooth Roads

- **No more horizontal lines on the road.** The road and grass used two alternating shades that raced toward
  you as stripes, and thin seams could show between road pieces. They now use one shade each and every piece
  overlaps the next, so the road looks smooth. The red-and-white curbs and lane dashes still show your speed.
- **The big RACE! button is on the Race Track building** itself now, right over the grandstand.

## v0.13.1 — Earn Your Wins

- **No more steering for you.** The car used to drift back onto the road on its own when no button was held,
  so letting go could still win. Now the car only steers itself if a grown-up turns on the **steering helper**
  in Parent Corner. 🐢 Easy makes curves pull a little less, but it doesn't steer either.
- **You have to build up to 1st place.** Rivals are faster from the very first race: the starter car finishes
  around 3rd–5th until Carter saves up for upgrades (first upgrades now 300, 600, 1,100… coins; Blue Bolt
  1,500). Hands off the controls finishes last.
- **One new track at a time.** A track now opens only after **winning** (1st place) the track before it on
  🚗 Normal or 🔥 Hard (Easy is for practice, coins and stars). Tracks already opened stay open.
- Checked with the career simulator: the first win comes after a few races and upgrades, each later track
  takes longer than the last, and today's whole game still runs about 4½ months with no stuck gates.

## v0.13.0 — Piqua Main Street

- **Main Street in Piqua, Ohio.** The town is redrawn: eight separate buildings, each on its own lot with a tree
  or lamp post between neighbors, a big picture on every roof and one clear word on every sign (Garage, Gifts,
  Missions, Race Track, Rank, Turbo Lab, Trophies, School). A "Welcome to PIQUA, Ohio" sign stands on the hill
  by the river.
- **A big green RACE! button** sits over the Race Track.
- **🚦 Driver School** (coming soon): its schoolhouse is on Main Street now. It will turn real-world reading and
  outdoor time, logged by a grown-up, into driver training in the game.
- **⚙️ Settings** (the gear in town): Music, Sounds, Full screen, Parent Corner and **Reset progress**.
  - Parent Corner and Reset both start with a grown-ups-only question (a sum with four big answers).
  - Reset then needs a **3-second hold** and a final "Last chance!" before anything is erased. A copy is kept
    for Undo, and Google Save is signed out so the old cloud copy can't bring the progress back.
- **New title screen**: a giant logo with speed streaks, bigger "Made for Carter" credits and a huge PLAY button.

**Polish (a big graphics pass, same flat style)**
- Cars: softer two-layer shadows, tire treads that roll with speed, exhaust pipes, a shine line on the body,
  glowing tail lights.
- Roadside: silver guardrails on every bend, lamp posts along the road, solid white edge lines.
- Sky: a glow ring around the sun and birds flapping across (not in space).
- Town: buildings never overlap, decorations never block taps, and squarer screens show the whole street.

## v0.12.0 — The Long Game

- **A much longer game.** A new career simulator (`npm run career`) plays the whole game day by day like a kid
  would and reports when every stage gate falls. Tuned with it, today's content takes about **4 months** at
  ~15 minutes a day: Rank 2 (lab) on day 2, Rank 5 (cups) ~day 12, Rank 10 (Auto Steer) ~day 37, Rank 20 ~day
  114. Ranks keep getting steeper as new worlds raise the cap toward 60 (years of play).
  - Ranks need more wins and trophies; cars cost more (Mega Monster 3,000 → Galaxy GT 40,000); upgrades on fancy
    cars cost more; research takes longer; Auto Steer costs 60,000+ coins and 4+ Brain Chips per level.
  - Cars and upgrades already bought are kept.
- **⭐ Track Mastery**: win a track again and again to earn up to 5 stars per track and difficulty (at 3, 10, 25,
  50 and 100 wins). Stars show on the track cards and count as trophy points.
- **☁️ Google Save** (Parent Corner): sign in with your Google account to keep a copy of the save in your Google
  Drive and load it on any device. Needs a one-time sign-in key; see README → "Google Save". Works on the
  website, not the LAN address.
- **Saves from every version load into this one.** Every field is checked and converted, and `npm test` loads a
  save from each past release (plus a deliberately broken one) before every release is allowed to ship.
- **Undo** in Parent Corner brings back the save from before the last reset or load.

**Fixed** (found by a full code review)
- The Trophies gauge could never fill if Parent Corner allowed only one or two difficulties.
- The results screen could pop up over the town (and lose a cup) after pausing right at the finish line.
- After crossing the finish line the car kept collecting coins, jumping and buzzing behind the results screen.
- The backup kept by Reset or Load was overwritten on the next reload.
- Allowing only Hard below Rank 3 left no difficulty to race on.
- The Brain Chip counter didn't update after spending chips in the lab.
- "Goal done!" didn't show for goals finished by a win.
- Head Start at its top level didn't quite fill the Turbo meter.
- An update or break screen could end a cup halfway through.
- A save from a newer version could break the lab; "Collect 3 Brain Chips" went backwards when chips were spent;
  races after midnight counted toward yesterday's missions.

**Polish**
- Gold ★ mastery stars on every track card, with a "Mastery star!" message when you earn one.
- Parent Corner: a Google Save panel and an Undo button; vibration only starts after the first tap.

## v0.11.1 — Quiet Town (hotfix)

- Fixed: the engine hum kept playing on the town screen and other menus. Menus now have only music; the engine
  sound plays only during races.
- The demo drive behind the menus pauses while the town is showing, which saves battery.

## v0.11.0 — Auto Steer

- **Lab tier 3** (Rank 8): the **Robot Brain** chain. Robot Eyes → Robot Ears → Map Memory → Reflexes → Brain
  Chip Socket, each one after the other. The Socket costs a 🧠 Brain Chip.
- **🧠 AUTO STEER** (Rank 10, after the Socket): 100 levels, the biggest research in the game. Every level costs
  coins, Brain Chips and real time (Level 1: 25,000 coins, 2 chips, 1 hour; Level 100: 288,000 coins,
  12 chips, 24 hours). Each level also needs a higher rank, so Level 100 needs Rank 59.
- **How Auto Steer drives** (when Carter isn't steering; tapping ◀ ▶ always wins):
  - Levels 1+ keep the car on the road, 26+ go for coins, 46+ grab ? boxes and air coins, 66+ head for boost
    pads and steer around slow rivals, 86+ fire Turbo on straights and use power-ups.
  - Its strength grows with its level. **Level 100 is God mode**: the perfect line, every boost pad, with a gold
    sparkle trail.
- **The 🤖 switch** on the race screen turns Auto Steer on or off and shows its level. Parent Corner can turn it
  off completely.
- **Ranks go up to 20** now (new titles: Pro, Champion). A 4th lab bench opens at Rank 15.
- New goals: Auto Steer level 1 and level 10, reach Rank 10.
- `npm run sim -- auto` shows how each Auto Steer level drives with hands off the controls.
- Fixed: in the lab, a second project finishing right after you collected another didn't show "Tap to collect".

**Polish**
- A little blinking robot rides next to the car and dotted arrows on the road show where Auto Steer is heading.
- Auto Steer has a big glowing card in the lab, and the 🤖 switch glows pink when it's on.

## v0.10.0 — More Earth & Physics Engine

- **Two new Earth tracks**:
  - 🏖️ **Beach Boardwalk**: a wooden boardwalk past sandcastles, beach umbrellas and surfboards. Opens after
    a 🥉 on Sunny Hills.
  - 🍂 **Autumn Forest**: orange trees, pumpkins, hay bales and mushrooms. Opens after a 🥉 on Snowy Peaks.
- Each track now opens from one specific track, so new tracks can be added anywhere without re-locking old
  ones. Winning a race can open more than one track at once, and the results screen lists them all.
- **World picker** on the track screen: 🌍 Earth now, with 🌙 Moon Base and 🌊 Deep Blue shown as coming soon.
- Physics engine: every world gets its own gravity, speed, grip and air steering. Earth keeps today's feel;
  this is the groundwork for the Moon (low gravity) and Deep Blue (heavy water drag).

**Polish**
- A third, faraway layer of hills behind every track.
- Trees and palm leaves sway a little in the wind.
- The track screen's world, race/cup and difficulty buttons share rows, so the track cards are bigger.

## v0.9.0 — Parent Corner+ & Daily Missions

- **Daily Missions** (the 📋 board in town, Rank 7): three picture missions a day, like "BAM 3 cars", "Do 8
  big jumps" or "Win on 🌵 Desert Dash". Each pays coins; finishing all three pays a **🧠 Brain Chip** and a
  coin bonus. New missions every day.
- **Parent Corner+** (tap the version number on the title screen 5 times):
  - **Break reminder**: Off, 20, 30, 45 or 60 minutes. When time is up, the next race start shows a 10-minute
    "Break time!" screen instead. "End rest now" lifts it early. (Tap the moon 5 times on the break screen to
    reach Parent Corner.)
  - **Volume** slider and **buzz on taps** (vibration) on/off.
  - **Recent races**: the last 20 races with date, track, difficulty, place and coins.
  - **Reset all**: erase progress (asks twice; the old save is kept as a backup copy).
  - Difficulty limits, steering helper and save codes, now in one organized screen.

**Polish**
- A short buzz on taps, and a bigger rumble when bonking a tree (on tablets that can vibrate).
- The Missions board in town, and "RANK" labels on locked buildings are easier to read.

## v0.8.0 — Power-Up Boxes

- **? boxes** sit in rows of three across the road a few times every lap. Drive through one to get a power-up,
  then tap the big pink button (bottom left) to use it:
  - 🛡️ **Shield**: 5 seconds of no bonks or slow-downs, and rivals bounce off you.
  - 💰 **Coin Shower**: +8 coins right away.
  - 🧲 **Mega Magnet**: grabs coins from all over the road for 8 seconds.
  - 🚀 **Super Turbo**: a longer-than-normal Turbo.
  - Boxes come back after a few seconds. No weapons, nothing mean.
- New goals: use 10 and 100 power-ups.
- Fixed: the daily gift could pop up over a race if one was started right away.

**Polish**
- Spinning, color-changing boxes with a soft glow.
- Dust puffs when driving off the road, and sparks when bumping or BAM-ing a rival.
- The power-up button wiggles so it's easy to spot.

## v0.7.0 — Cups & Brain Chips

- **Cups open at Rank 5** (Race Track → 🏆 Cups). Three races in a row with points for every place
  (10, 8, 6, 4, 2, 1). Most points wins the cup.
  - **Green Cup** (Sunny Hills, Desert Dash, Snowy Peaks) → wins the **Green Machine**.
  - **Gold Cup** (Candy Land, Lava Mountain, Space Road) → wins **Gold Rush**.
  - **Champion Cup** (Desert Dash, Lava Mountain, Space Road, Rank 7) → wins **Champion X**, the fastest car yet.
  - Cup cars can't be bought, only won. Cup trophies are worth extra trophy points for ranking up.
- **🧠 Brain Chips**: rare chips for big moments. You get one for winning a cup (once per difficulty), your first
  🔥 Hard win on each track, every rank-up from Rank 5, and every 7-day gift streak. They'll power Auto Steer
  research later. The chip count shows next to your coins.
- The rivals have names now: Rosie, Splash, Sunny, Rocky and Snowball.
- New goals: win a cup, win all three cups, collect 3 Brain Chips.

**Polish**
- A start/finish arch with a checkered banner over the road.
- A podium with the top three cars at the end of every cup, and a cup progress map between races.
- Prize and road-coin numbers count up on the results screen.

## v0.6.0 — Turbo Lab

- **The Turbo Lab opens at Rank 2.** Professor Bolt researches boosts that help **every** car. Research costs
  coins and takes real time (2 minutes at first, longer for higher levels), and keeps going while the tablet is
  off. Tap **Rush** to finish now for a few coins.
- **Lab tier 1 (Rank 2):** Coin Boost (+5% prizes per level), Lucky Chests, Head Start (start with Turbo),
  Pit Crew (cheaper upgrades).
- **Lab tier 2 (Rank 6):** Turbo Tanks, Bigger Ramps, Bumper Shield, Magnet Field, and Super Paint (unlocks
  three Neon paints in the Paint Shop).
- **Lab benches:** one at Rank 2, a second at Rank 4, a third at Rank 9.
- Every finished research level fills the 🔬 Research gauge for ranking up.
- New goals: finish 1, 10 and 30 research levels; reach Rank 5.
- Robot Brain and the 100-level **AUTO STEER** are on display in the lab as locked machines to work toward.

**Polish**
- Bubbling tubes in the lab and on the town's lab building; Professor Bolt bobs and talks to Carter.
- The lab building in town shows a countdown, then a red "!" when research is done or a bench is free.

## v0.5.0 — Turbo Town, Racer Rank & Difficulty

- **Turbo Town**: the home screen is now a little town. Tap the **Race Track**, **Garage**, **Gifts**,
  **Rank Tower**, **Trophies** hall or the **Turbo Lab** (boarded up until Rank 2). Cars drive down the street,
  flags wave, and a red "!" pops up on any building with something waiting.
- **Racer Rank**: four gauges (🏁 Wins, 🏆 Trophies, 🔧 Garage, 🔬 Research). Fill all four to press
  **RANK UP!** for a new rank, a coin reward and a new unlock. The emptiest gauge glows with a hint. Ranks go
  up to 10 for now.
- **Difficulty**: pick 🐢 Easy, 🚗 Normal or 🔥 Hard (Hard opens at Rank 3) on the track screen. Easy helps steer
  and pays ×0.75, Hard has faster rivals and pays ×1.5. Medals are kept per difficulty.
- **Parent Corner**: choose which difficulties Carter can pick, and a steering helper (Off / A little / Lots).
- **Balance**: cars cost more (Blue Bolt 700 up to Galaxy GT 10,000), upgrades cost a bit more on fancier cars,
  and later tracks pay more. Cars and upgrades already bought are kept.
- `npm run sim` runs the race simulator (difficulty table) and `npm run sim -- journey` plays a whole career.

**Polish**
- Far-away scenery fades in smoothly instead of popping onto the road.
- Screens and cards bounce in when they open.

## v0.4.2 — Upgrades Belong to Each Car

- **Every car has its own upgrades.** Engine, Turbo, Tires and Magnet levels now belong to the car you
  bought them for. A new car starts with no upgrades, and the Garage shows "Upgrades for <car>".
- You can only upgrade cars you own ("Buy Shark Fin to upgrade it!").
- Old saves: every car Carter owned before this update keeps the upgrade levels he already had, so
  nothing he paid for is lost.

## v0.4.1 — Update Before You Race

- If a new version is waiting when Carter starts a race (from the track list, Again or Next), the game
  stops and shows a big **✨ New version!** screen, then updates by itself after a 4-second countdown
  (or right away with **Update now!**). Progress is kept. Races never start on an old version.

## v0.4.0 — Paint Shop & Trophy Room

- **Made for Carter**: the title screen now says "Made for Carter, by Carter's Dad", and the results screen
  cheers him on by name.
- **Paint Shop** (Garage → 🎨 Paint): 12 paints, including Chrome, Gold and Rainbow, plus 5 stickers
  (Flames, Stars, Lightning, Checkers, Number 1). Buy once, use on any car you own.
- **Trophy Room** (new 🏆 tile): a shelf with your best medal on every track, and 16 goals ("Win 5 races",
  "Do 10 big jumps", "BAM 10 cars"…) that pay coins when you claim them. A red "!" shows when one is ready.
- **New version button**: when a new release is out, a big green "✨ New version! Tap to update" button
  appears on the menus (never during a race). Tap it to get the new version; progress is kept.
- **Safer saves**: progress is also saved when the game is closed or hidden, and a backup copy of the
  last good save is kept in case the main one is ever damaged.
- **Parent Corner**: tap the version number on the title screen 5 times to copy a save code (a backup of
  Carter's progress) or paste one in to restore it.

## v0.3.0 — Jumps & Stunts

- **Ramps!** Red-and-yellow striped ramps on every track launch your car into the air.
- **Air coins**: a rainbow arc of coins floats after each ramp. Steer in the air to grab them.
- **Stunt landings** give +3 coins, a speed boost and some Turbo, with "STUNT!", "AIR TIME!" popups.
- Rivals jump the ramps too. Cars in the air fly over cars on the ground.
- Jump and landing sounds.

## v0.2.0 — Garage & Tracks (MVP)

- **Six tracks** to unlock: Sunny Hills, Desert Dash, Snowy Peaks, Candy Land, Lava Mountain, Space Road.
  Finish 3rd or better to open the next one. Each is faster and pays more.
- **Garage**: six cars to buy with coins (Zippy, Blue Bolt, Mega Monster, Shark Fin, Rocket Rex, Galaxy GT),
  each faster than the last.
- **Upgrades**: Engine (speed), Turbo (more and longer turbo), Tires (turning), Magnet (grab coins from
  farther away), five levels each.
- **Prizes**: coins for your place, every coin you drove over, and a **treasure chest** pick after each race.
- **Free daily gift** that grows each day in a row (up to 450 coins).
- Hub screen, coin counter, music and sound toggles, confetti, and a red "!" when you can afford something.
- Full screen on tablets and phones: any tap returns to full screen, plus a ⛶ button on the hub.

## v0.1.0 — Proof of Concept

- Pseudo-3D racing on a looping road with curves and hills (Sunny Hills).
- Auto-drive forward; steer with big ◀ ▶ buttons or by touching either half of the road.
- Five rival cars, a 3-2-1-GO countdown, two laps, live position and a progress bar.
- Coins on the road, boost pads, and a Turbo meter that fires a speed burst. Turbo knocks rivals aside.
- Bonk into trees off the road (you slow down, nothing breaks).
- Synthesized engine sound, effects and music.
- Results screen with trophy and coins (saved).
- Works in landscape (full screen) and portrait (race view on top, controls below).
