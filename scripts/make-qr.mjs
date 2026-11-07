// Makes public/share-qr.svg: a QR code for the public site, shown on the title screen ("Scan to share").
// Run: node scripts/make-qr.mjs   (only needed if the site address changes)
import QRCode from "qrcode";
import { writeFileSync } from "node:fs";
const SITE = "https://jonathanwessel.github.io/turbo-dash/";
const svg = await QRCode.toString(SITE, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#1a0b3d", light: "#ffffff" } });
writeFileSync(new URL("../public/share-qr.svg", import.meta.url), svg);
console.log("wrote public/share-qr.svg for", SITE);
