// 🎃🎄🎆 Holiday decorations on Main Street (v1.22), picked by the calendar, any year. Plain data and one pure
// function, so the node tests check every date. The drawing is in src/town.js (holidayDeco), and tapping the big
// decoration makes it jump and play a little tune (main.js).
//   fall:   pumpkins by the trees and lamps, orange trees, and a scarecrow
//   winter: string lights over the street, snow on the grass, snowmen, and a big tree with a star
//   summer: flags over the street and fireworks in the sky
import { inSeason } from "./data.js";

export const HOLIDAYS = [
  { id: "fall",   icon: "🎃", from: [10, 1],  to: [11, 30] },
  { id: "winter", icon: "🎄", from: [12, 1],  to: [1, 6] },     // wraps past New Year
  { id: "summer", icon: "🎆", from: [6, 28],  to: [7, 7] },
];

/* the holiday on this date, or null (most of the year has none) */
export const holidayOn = (date = new Date()) => HOLIDAYS.find(h => inSeason(h, date))?.id || null;
