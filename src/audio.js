// Synthesized sound: effects, an engine hum and a little looping tune. Starts on the first tap (browsers require it).
let muffle = null, water = false;
/* Underwater races sound muffled (a soft low-pass on everything). */
export function setWater(on) { water = !!on; if (muffle) muffle.frequency.setTargetAtTime(water ? 900 : 20000, ac.currentTime, 0.15); }
let ac = null, master, sfxBus, musicBus, engOsc, engOsc2, engGain, engFilter, noiseBuf, echoSend;
const opts = { sfx: true, music: true, volume: 0.8 };
let musicTimer = null, step = 0, nextT = 0, song = "menu";

export function initAudio() {
  if (ac) { if (ac.state === "suspended") ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  master = ac.createGain(); master.gain.value = 0.8;
  muffle = ac.createBiquadFilter(); muffle.type = "lowpass"; muffle.frequency.value = water ? 900 : 20000;
  master.connect(muffle); muffle.connect(ac.destination);
  sfxBus = ac.createGain(); sfxBus.connect(master);
  musicBus = ac.createGain(); musicBus.gain.value = 0.22; musicBus.connect(master);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  engFilter = ac.createBiquadFilter(); engFilter.type = "lowpass"; engFilter.frequency.value = 500;
  engGain = ac.createGain(); engGain.gain.value = 0;
  engOsc = ac.createOscillator(); engOsc.type = "sawtooth"; engOsc.frequency.value = 50;
  engOsc2 = ac.createOscillator(); engOsc2.type = "square"; engOsc2.frequency.value = 25;
  const g2 = ac.createGain(); g2.gain.value = 0.5;
  engOsc.connect(engFilter); engOsc2.connect(g2); g2.connect(engFilter); engFilter.connect(engGain); engGain.connect(sfxBus);
  // 🚇 tunnel echo: a short delay with feedback, only fed while inside a tunnel
  echoSend = ac.createGain(); echoSend.gain.value = 0;
  const dl = ac.createDelay(0.5), fb = ac.createGain(); dl.delayTime.value = 0.11; fb.gain.value = 0.38;
  engGain.connect(echoSend); echoSend.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(sfxBus);
  engOsc.start(); engOsc2.start();
  applyOpts();
  startMusic();
}

export function setAudioOpts(o) { Object.assign(opts, o); applyOpts(); }
function applyOpts() {
  if (!ac) return;
  master.gain.value = opts.volume;
  sfxBus.gain.value = opts.sfx ? 1 : 0;
  musicBus.gain.value = opts.music ? 0.22 : 0;
}
document.addEventListener("visibilitychange", () => { if (!ac) return; document.hidden ? ac.suspend() : ac.resume(); });

function tone(freq, dur, type = "square", vol = 0.2, when = 0, slide = 0, bus = sfxBus) {
  const t = ac.currentTime + when;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol = 0.3, freq = 1000, when = 0, sweep = 0) {
  const t = ac.currentTime + when;
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; f.type = "bandpass"; f.frequency.setValueAtTime(freq, t);
  if (sweep) f.frequency.exponentialRampToValueAtTime(freq * sweep, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + dur);
}

let lastCoin = 0, coinPitch = 0;
export function sfx(name) {
  if (!ac || !opts.sfx) return;
  switch (name) {
    case "coin": {
      const now = ac.currentTime; coinPitch = now - lastCoin < 0.4 ? Math.min(coinPitch + 1, 8) : 0; lastCoin = now;
      const f = 990 * Math.pow(2, coinPitch / 12);
      tone(f, 0.08, "square", 0.08); tone(f * 1.5, 0.15, "square", 0.08, 0.06); break;
    }
    case "beep": tone(440, 0.25, "square", 0.15); break;
    case "go": tone(880, 0.5, "square", 0.18); break;
    case "boost": noise(0.6, 0.35, 400, 0, 6); tone(300, 0.5, "sawtooth", 0.08, 0, 3); break;
    case "nitro": noise(0.9, 0.45, 300, 0, 8); tone(200, 0.8, "sawtooth", 0.12, 0, 4); break;
    case "bump": tone(120, 0.15, "square", 0.15, 0, 0.5); break;
    case "draft": noise(0.5, 0.12, 1800, 0, 0.6); break;
    case "scrape": noise(0.25, 0.18, 3200, 0, 0.7); tone(900, 0.12, "sawtooth", 0.04, 0, 0.8); break;
    case "jump": tone(300, 0.35, "square", 0.12, 0, 2.5); noise(0.3, 0.2, 600, 0, 3); break;
    case "land": tone(90, 0.2, "triangle", 0.4, 0, 0.5); noise(0.2, 0.3, 250); break;
    case "bonk": tone(200, 0.3, "triangle", 0.35, 0, 0.3); noise(0.15, 0.3, 300); break;
    case "bam": noise(0.3, 0.5, 800, 0, 0.2); tone(150, 0.25, "square", 0.15, 0, 0.4); break;
    case "click": tone(660, 0.06, "triangle", 0.15); break;
    case "buy": [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, "square", 0.1, i * 0.07)); break;
    case "nope": tone(220, 0.15, "square", 0.12); tone(180, 0.2, "square", 0.12, 0.12); break;
    case "chest": noise(0.4, 0.3, 2000, 0, 0.5); [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.3, "triangle", 0.12, 0.1 + i * 0.08)); break;
    case "win": [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i === 5 ? 0.6 : 0.18, "square", 0.12, i * 0.14)); break;
    case "lose": [392, 349, 330, 262].forEach((f, i) => tone(f, 0.25, "triangle", 0.14, i * 0.18)); break;
  }
}

/* Every kind of car has its own engine voice: monster trucks rumble low, sports cars whine high, the sub hums. */
const VOICES = {
  racer:   { a: "sawtooth", b: "square",   base: 45, span: 110, f: 350, fs: 900, v: 1 },
  sport:   { a: "sawtooth", b: "sawtooth", base: 62, span: 150, f: 500, fs: 1300, v: 0.9 },
  monster: { a: "square",   b: "square",   base: 30, span: 62,  f: 230, fs: 520, v: 1.25 },
  rocket:  { a: "sawtooth", b: "sawtooth", base: 72, span: 175, f: 650, fs: 1600, v: 0.85 },
  galaxy:  { a: "triangle", b: "sawtooth", base: 85, span: 170, f: 700, fs: 1500, v: 1 },
  shark:   { a: "sawtooth", b: "triangle", base: 52, span: 125, f: 420, fs: 1000, v: 1 },
  rover:   { a: "triangle", b: "square",   base: 58, span: 95,  f: 400, fs: 800, v: 1.1 },
  fire:    { a: "square",   b: "sawtooth", base: 36, span: 78,  f: 280, fs: 650, v: 1.15 },
  patrol:  { a: "sawtooth", b: "square",   base: 55, span: 125, f: 420, fs: 1100, v: 0.95 },
  sub:     { a: "sine",     b: "triangle", base: 40, span: 72,  f: 300, fs: 420, v: 1.5 },
  skis:    { a: "triangle", b: "sawtooth", base: 60, span: 125, f: 450, fs: 1100, v: 1 },
};
let voice = VOICES.racer;
export function setEngineVoice(type) {
  voice = VOICES[type] || VOICES.racer;
  if (ac) { engOsc.type = voice.a; engOsc2.type = voice.b; }
}
export function engine(ratio, boosting, tunnel = false) {
  if (!ac) return;
  const t = ac.currentTime, V = voice;
  echoSend?.gain.setTargetAtTime(tunnel ? 0.9 : 0, t, 0.15);
  if (engOsc.type !== V.a) { engOsc.type = V.a; engOsc2.type = V.b; }
  engOsc.frequency.setTargetAtTime(V.base + ratio * V.span + (boosting ? 30 : 0), t, 0.08);
  engOsc2.frequency.setTargetAtTime(V.base / 2 + ratio * V.span / 2, t, 0.08);
  engFilter.frequency.setTargetAtTime(V.f + ratio * V.fs, t, 0.1);
  engGain.gain.setTargetAtTime(ratio > 0.01 ? (0.05 + ratio * 0.03) * V.v : 0, t, 0.1);
}
/* 🌧️ rain: a soft, looping hiss while it rains */
let rainSrc = null;
export function setRain(on) {
  if (!ac) return;
  if (on && !rainSrc) {
    rainSrc = ac.createBufferSource(); rainSrc.buffer = noiseBuf; rainSrc.loop = true;
    const f = ac.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1800;
    const g = ac.createGain(); g.gain.value = 0.06;
    rainSrc.connect(f); f.connect(g); g.connect(sfxBus); rainSrc.start();
  } else if (!on && rainSrc) { try { rainSrc.stop(); } catch (e) { /* already stopped */ } rainSrc = null; }
}
export function engineOff() { if (ac) engGain.gain.setTargetAtTime(0, ac.currentTime, 0.1); }

// Music: 16-step patterns of bass + melody. The menu has its own tune, and every race theme (each Earth track,
// the Moon, Deep Blue, Glacier Rink, Toy Track World) has its own tune, speed and instruments.
const N = n => 440 * Math.pow(2, (n - 69) / 12);
const SONGS = {
  menu: { bpm: 112, bass: [48, 0, 48, 0, 53, 0, 53, 0, 55, 0, 55, 0, 53, 0, 52, 0], mel: [72, 0, 76, 79, 0, 76, 77, 0, 79, 0, 81, 79, 77, 0, 76, 0] },
  race: { bpm: 150, bass: [45, 45, 57, 45, 43, 43, 55, 43, 41, 41, 53, 41, 43, 43, 55, 47], mel: [69, 0, 72, 0, 76, 0, 74, 72, 71, 0, 74, 0, 72, 0, 71, 67] },
  "race:sunny":   { bpm: 150, bass: [48, 0, 55, 0, 57, 0, 55, 0, 53, 0, 52, 0, 50, 0, 55, 0], mel: [72, 76, 79, 76, 77, 76, 74, 72, 74, 77, 81, 79, 77, 76, 74, 0] },
  "race:beach":   { bpm: 140, lead: "triangle", bass: [41, 0, 48, 0, 46, 0, 53, 0, 43, 0, 50, 0, 48, 0, 45, 0], mel: [77, 0, 81, 79, 77, 0, 72, 74, 76, 0, 77, 79, 81, 0, 79, 0] },
  "race:desert":  { bpm: 146, bass: [38, 38, 50, 38, 39, 39, 51, 39, 38, 38, 50, 38, 36, 36, 48, 41], mel: [74, 0, 75, 0, 77, 0, 75, 74, 72, 0, 74, 0, 75, 77, 74, 0] },
  "race:snow":    { bpm: 138, lead: "triangle", mvol: 0.22, bass: [43, 0, 50, 0, 47, 0, 50, 0, 40, 0, 47, 0, 45, 0, 50, 0], mel: [79, 83, 86, 83, 81, 79, 78, 79, 76, 0, 79, 83, 81, 0, 79, 0] },
  "race:autumn":  { bpm: 144, bass: [40, 0, 47, 0, 43, 0, 50, 0, 45, 0, 52, 0, 47, 0, 50, 0], mel: [76, 0, 79, 81, 79, 76, 74, 0, 72, 74, 76, 0, 74, 72, 71, 0] },
  "race:candy":   { bpm: 166, bass: [48, 60, 48, 60, 53, 65, 53, 65, 55, 67, 55, 67, 53, 65, 55, 67], mel: [84, 0, 84, 88, 0, 86, 84, 0, 81, 0, 83, 84, 86, 0, 88, 0] },
  "race:lava":    { bpm: 156, lead: "sawtooth", mvol: 0.11, bass: [36, 36, 48, 36, 39, 39, 51, 39, 41, 41, 53, 41, 43, 43, 55, 43], mel: [72, 0, 75, 0, 79, 0, 77, 75, 74, 0, 75, 0, 72, 0, 70, 67] },
  "race:space":   { bpm: 150, bass: [45, 0, 45, 0, 41, 0, 41, 0, 43, 0, 43, 0, 40, 0, 40, 0], mel: [69, 72, 76, 81, 65, 69, 72, 77, 67, 71, 74, 79, 64, 68, 71, 76] },
  "race:moon":    { bpm: 120, lead: "sine", mvol: 0.3, kick: 8, bass: [45, 0, 0, 0, 41, 0, 0, 0, 43, 0, 0, 0, 40, 0, 0, 0], mel: [76, 0, 81, 0, 79, 0, 76, 0, 74, 0, 77, 0, 76, 0, 72, 0] },
  "race:ocean":   { bpm: 128, lead: "sine", mvol: 0.28, bassType: "sine", bass: [41, 0, 48, 0, 43, 0, 50, 0, 45, 0, 52, 0, 43, 0, 50, 0], mel: [72, 74, 77, 0, 79, 77, 74, 0, 72, 76, 79, 0, 81, 79, 76, 0] },
  "race:glacier": { bpm: 138, lead: "triangle", mvol: 0.24, bass: [38, 0, 45, 0, 43, 0, 50, 0, 40, 0, 47, 0, 45, 0, 49, 0], mel: [86, 0, 90, 88, 86, 0, 81, 0, 83, 85, 86, 0, 88, 0, 85, 0] },
  "race:toy":     { bpm: 160, short: true, bass: [48, 0, 52, 0, 55, 0, 52, 0, 53, 0, 57, 0, 55, 0, 59, 0], mel: [72, 76, 79, 79, 81, 79, 76, 0, 77, 76, 74, 77, 76, 74, 72, 0] },
};
export function setSong(name, theme) { const k = theme && SONGS[name + ":" + theme] ? name + ":" + theme : name; if (k !== song) step = 0; song = k; }
function startMusic() {
  nextT = ac.currentTime + 0.1;
  musicTimer = setInterval(() => {
    if (!ac || ac.state !== "running") return;
    const S = SONGS[song], dur = 60 / S.bpm / 2;
    while (nextT < ac.currentTime + 0.25) {
      const when = nextT - ac.currentTime, b = S.bass[step % 16], m = S.mel[(step + (Math.floor(step / 16) % 2 ? 0 : 0)) % 16];
      if (b) tone(N(b), dur * 0.9, S.bassType || "triangle", 0.5, when, 0, musicBus);
      if (m) tone(N(m), dur * (S.short ? 0.45 : 0.8), S.lead || "square", S.mvol || 0.16, when, 0, musicBus);
      if (step % (S.kick || 4) === 0) { /* kick */ tone(110, 0.12, "sine", 0.6, when, 0.3, musicBus); }
      nextT += dur; step++;
    }
  }, 60);
}
