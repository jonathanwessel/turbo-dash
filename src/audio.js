// Synthesized sound: effects, an engine hum and a little looping tune. Starts on the first tap (browsers require it).
let ac = null, master, sfxBus, musicBus, engOsc, engOsc2, engGain, engFilter, noiseBuf;
const opts = { sfx: true, music: true };
let musicTimer = null, step = 0, nextT = 0, song = "menu";

export function initAudio() {
  if (ac) { if (ac.state === "suspended") ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  master = ac.createGain(); master.gain.value = 0.8; master.connect(ac.destination);
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
  engOsc.start(); engOsc2.start();
  applyOpts();
  startMusic();
}

export function setAudioOpts(o) { Object.assign(opts, o); applyOpts(); }
function applyOpts() {
  if (!ac) return;
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

export function engine(ratio, boosting) {
  if (!ac) return;
  const t = ac.currentTime;
  engOsc.frequency.setTargetAtTime(45 + ratio * 110 + (boosting ? 30 : 0), t, 0.08);
  engOsc2.frequency.setTargetAtTime(22 + ratio * 55, t, 0.08);
  engFilter.frequency.setTargetAtTime(350 + ratio * 900, t, 0.1);
  engGain.gain.setTargetAtTime(ratio > 0.01 ? 0.05 + ratio * 0.03 : 0, t, 0.1);
}
export function engineOff() { if (ac) engGain.gain.setTargetAtTime(0, ac.currentTime, 0.1); }

// Music: two 16-step patterns (menu / race) of bass + melody.
const N = n => 440 * Math.pow(2, (n - 69) / 12);
const SONGS = {
  menu: { bpm: 112, bass: [48, 0, 48, 0, 53, 0, 53, 0, 55, 0, 55, 0, 53, 0, 52, 0], mel: [72, 0, 76, 79, 0, 76, 77, 0, 79, 0, 81, 79, 77, 0, 76, 0] },
  race: { bpm: 150, bass: [45, 45, 57, 45, 43, 43, 55, 43, 41, 41, 53, 41, 43, 43, 55, 47], mel: [69, 0, 72, 0, 76, 0, 74, 72, 71, 0, 74, 0, 72, 0, 71, 67] },
};
export function setSong(name) { song = name; step = 0; }
function startMusic() {
  nextT = ac.currentTime + 0.1;
  musicTimer = setInterval(() => {
    if (!ac || ac.state !== "running") return;
    const S = SONGS[song], dur = 60 / S.bpm / 2;
    while (nextT < ac.currentTime + 0.25) {
      const when = nextT - ac.currentTime, b = S.bass[step % 16], m = S.mel[(step + (Math.floor(step / 16) % 2 ? 0 : 0)) % 16];
      if (b) tone(N(b), dur * 0.9, "triangle", 0.5, when, 0, musicBus);
      if (m) tone(N(m), dur * 0.8, "square", 0.16, when, 0, musicBus);
      if (step % 4 === 0) { /* kick */ tone(110, 0.12, "sine", 0.6, when, 0.3, musicBus); }
      nextT += dur; step++;
    }
  }, 60);
}
