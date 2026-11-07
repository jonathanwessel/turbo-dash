// Google Save: keeps a copy of the save in the parent's Google Drive (a hidden app folder only this game can see).
// No server: Google's sign-in script gives the page a short-lived token for the drive.appdata scope only.
// Needs GOOGLE_CLIENT_ID (README → "Google Save") and an https:// page (the GitHub Pages site) or localhost.
import { GOOGLE_CLIENT_ID } from "./cloud-config.js";
import { S, save, replaceSave, port } from "./save.js";

const SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const FILE = "turbodash-save.json";
const API = "https://www.googleapis.com/drive/v3/files", UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
let token = null, tokenUntil = 0, client = null, fileId = null, busy = false, dirty = false, timer = 0;
let status = "", onStatus = () => {};
const say = t => { status = t; onStatus(t); };

export const cloudReady = () => !!GOOGLE_CLIENT_ID && (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname));
export const cloudWhy = () => !GOOGLE_CLIENT_ID ? "Google Save needs a sign-in key first (see the README, \"Google Save\")."
  : "Google Save works on the website (https://jonathanwessel.github.io/turbo-dash/), not on the home network address.";
export const cloudStatus = () => status;
export const cloudLinked = () => !!S.cloud?.linked;
export const onCloudStatus = fn => { onStatus = fn; };

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true;
    s.onload = () => res(); s.onerror = () => rej(new Error("Could not reach Google")); document.head.appendChild(s);
  });
}
/* Ask Google for a token. Must run from a tap (Google opens a small window). quiet = no account chooser if already allowed. */
function getToken(quiet) {
  return loadGis().then(() => new Promise((res, rej) => {
    client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID, scope: SCOPE,
      callback: r => { if (r.error) return rej(new Error(r.error)); token = r.access_token; tokenUntil = Date.now() + (r.expires_in - 60) * 1000; res(); },
      error_callback: e => rej(new Error(e.type || "cancelled")),
    });
    client.requestAccessToken({ prompt: quiet ? "" : "consent" });
  }));
}
const hasToken = () => token && Date.now() < tokenUntil;
async function api(url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { Authorization: "Bearer " + token, ...(opts.headers || {}) } });
  if (r.status === 401) { token = null; throw new Error("signed out"); }
  if (!r.ok) throw new Error("Google Drive said " + r.status);
  return r;
}
async function findFile() {
  if (fileId) return fileId;
  const r = await api(`${API}?spaces=appDataFolder&fields=files(id,modifiedTime)&q=${encodeURIComponent(`name='${FILE}'`)}`);
  fileId = (await r.json()).files?.[0]?.id || null;
  return fileId;
}
async function download() { const id = await findFile(); if (!id) return null; return (await api(`${API}/${id}?alt=media`)).json(); }
async function upload() {
  const body = JSON.stringify(S), id = await findFile();
  if (id) await api(`${UPLOAD}/${id}?uploadType=media`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body, keepalive: body.length < 60000 });
  else {
    const meta = { name: FILE, parents: ["appDataFolder"] }, b = "tdsave" + Math.random().toString(36).slice(2);
    const multipart = `--${b}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`;
    const r = await api(`${UPLOAD}?uploadType=multipart&fields=id`, { method: "POST", headers: { "Content-Type": "multipart/related; boundary=" + b }, body: multipart });
    fileId = (await r.json()).id;
  }
}
const progress = s => (s.races || 0) * 1e6 + (s.savedAt || 0) / 1e6;   // more races wins; then the newer one

/* Sign in from Parent Corner. If Google has more progress than this tablet, load it; otherwise upload this one. */
export async function cloudSignIn() {
  if (!cloudReady()) { say(cloudWhy()); return; }
  try {
    say("Signing in…"); await getToken(false);
    S.cloud = { linked: true }; save();
    await syncNow(true);
  } catch (e) { say("Sign-in didn't finish (" + e.message + ")."); }
}
export function cloudSignOut() {
  if (token && window.google?.accounts?.oauth2) google.accounts.oauth2.revoke(token, () => {});
  token = null; fileId = null; S.cloud = { linked: false }; save(); say("Signed out. Progress stays on this tablet.");
}
/* Compare with Google and keep the one with more progress. Returns "loaded" when the cloud copy replaced this one. */
export async function syncNow(fromTap = false) {
  if (!cloudReady() || !cloudLinked() || busy) return;
  busy = true;
  try {
    if (!hasToken()) { if (!fromTap) { say("Tap Play to reconnect Google Save."); return; } await getToken(true); }
    say("Checking Google Drive…");
    const remote = await download();
    if (remote && progress(remote) > progress(S) + 1e5) {          // cloud has more races: use it
      replaceSave({ ...port(remote), cloud: { linked: true } });
      say("Loaded your progress from Google ✔"); return "loaded";
    }
    await upload(); dirty = false;
    say("Saved to Google ✔ " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  } catch (e) { say("Google Save problem: " + e.message); }
  finally { busy = false; }
}
/* After any save, upload a little later (batched), if signed in and the token is still good. */
export function cloudSaved() {
  if (!cloudLinked() || !cloudReady()) return;
  dirty = true; clearTimeout(timer);
  timer = setTimeout(() => { if (dirty && hasToken()) syncNow(); }, 15000);
}
/* Called from a tap (Play): refresh the token quietly so uploads keep working this session. */
export async function cloudWake() {
  if (!cloudReady() || !cloudLinked() || hasToken()) return;
  try { await getToken(true); return await syncNow(true); } catch (e) { say("Google Save is paused: open Parent Corner to sign in again."); }
}
document.addEventListener("visibilitychange", () => { if (document.hidden && dirty && hasToken()) upload().catch(() => {}); });
