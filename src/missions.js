// Daily missions: three small picture tasks a day (same three all day). Finishing all three pays a Brain Chip.
import { TRACKS } from "./data.js";
import { S, save } from "./save.js";

export const MISSIONS_RANK = 7;
const KINDS = [
  { id: "races", icon: "🏁", text: n => `Finish ${n} races`, goal: () => 3 },
  { id: "wins", icon: "🏆", text: n => `Win ${n} races`, goal: () => 2 },
  { id: "podium", icon: "🥉", text: n => `Finish top 3 ${n} times`, goal: () => 3 },
  { id: "coins", icon: "🪙", text: n => `Grab ${n} road coins`, goal: () => 80 },
  { id: "jumps", icon: "🦘", text: n => `Do ${n} big jumps`, goal: () => 8 },
  { id: "powers", icon: "❓", text: n => `Use ${n} power-ups`, goal: () => 4 },
  { id: "bams", icon: "💥", text: n => `BAM ${n} cars`, goal: () => 3 },
  { id: "track", icon: "🗺️", text: (n, t) => `Win on ${t.icon} ${t.name}`, goal: () => 1 },
];

function rng(seed) { return () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }; }

export function todaysMissions(today, openTracks) {
  if (S.missions?.day === today) return S.missions;
  const r = rng([...today].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0);
  const pool = KINDS.slice(), list = [];
  while (list.length < 3) {
    const k = pool.splice(Math.floor(r() * pool.length), 1)[0];
    const m = { kind: k.id, goal: k.goal(), have: 0, claimed: false, reward: 100 + 25 * S.rank };
    if (k.id === "track") { const opts = TRACKS.filter((t, i) => openTracks(i)); m.track = opts[Math.floor(r() * opts.length)].id; }
    list.push(m);
  }
  S.missions = { day: today, list, bonus: false };
  save();
  return S.missions;
}

export const missionText = m => { const k = KINDS.find(x => x.id === m.kind); return { icon: k.icon, text: k.text(m.goal, TRACKS.find(t => t.id === m.track)) }; };

/* Count a finished race toward today's missions. */
export function countRace(r, trackId) {
  const M = S.missions; if (!M) return;
  for (const m of M.list) {
    const add = { races: 1, wins: r.place === 1 ? 1 : 0, podium: r.place <= 3 ? 1 : 0, coins: r.coins, jumps: r.stats.stunts, powers: r.stats.powers, bams: r.stats.bams,
      track: r.place === 1 && trackId === m.track ? 1 : 0 }[m.kind] || 0;
    m.have = Math.min(m.goal, m.have + add);
  }
  save();
}
export const missionsReady = () => !!S.missions && S.missions.list.some(m => !m.claimed && m.have >= m.goal);
