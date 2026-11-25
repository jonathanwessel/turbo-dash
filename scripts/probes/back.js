// A probe for the sweep: the Android back button (v1.20). It presses the browser's back (history.back(), what the
// phone's back gesture does) on Main Street, a menu screen, a card, the Lab sheet and in a race, and reports which
// screen shows after each press:
//   node scripts/sweep.mjs 1280x800 --out .sweep/back --probe "$(cat scripts/probes/back.js)"
(async () => {
  const w = ms => new Promise(r => setTimeout(r, ms));
  const on = () => [...document.querySelectorAll("section.screen")].find(s => !s.hidden)?.id || null;
  const press = async () => { history.back(); await w(400); return on(); };
  const tap = g => document.querySelector(`[data-go="${g}"]`).dispatchEvent(new MouseEvent("click", { bubbles: true }));
  const out = {};
  __td.goHub(); await w(300);
  out.hubArmed = history.state?.tdBack === 1;
  out.hubBack = await press();                                     // s-leave: "Stop playing?"
  out.leaveArmed = history.state?.tdBack === 1;                    // false: a second back would leave
  document.getElementById("lv-stay").click(); await w(300);
  out.stay = on();                                                 // s-hub
  tap("race"); await w(400); out.tracks = on();
  out.tracksBack = await press();                                  // s-hub (the ◀ of the track list)
  tap("garage"); await w(400); out.garage = on();
  out.garageBack = await press();                                  // the car kinds card first time, then s-hub
  if (out.garageBack !== "s-hub") out.garageBack2 = await press();
  __td.S.rank = Math.max(__td.S.rank, 3); __td.goHub(); await w(200); tap("lab"); await w(400);
  document.querySelector("#lab-list .proj .pi")?.dispatchEvent(new MouseEvent("click", { bubbles: true })); await w(300);
  out.sheetOpen = !document.getElementById("lab-sheet").hidden;
  out.sheetBack = await press(); out.sheetClosed = document.getElementById("lab-sheet").hidden;   // s-lab, sheet closed
  out.labBack = await press();                                     // s-hub
  __td.show("s-tracks"); __td.startRace(__td.TRACKS[0]); await w(4500);
  out.raceScreen = on();                                           // null: racing
  out.raceBack = await press();                                    // s-pause
  document.getElementById("btn-quit").click(); await w(300);
  out.quit = on();
  return out;
})()
