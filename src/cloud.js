// Google Save: keeps a copy of the save in the parent's Google Drive (a hidden app folder only this game can see).
// No server: Google's sign-in script gives the page a short-lived token for the drive.appdata scope only.
// Needs GOOGLE_CLIENT_ID (README → "Google Save") and an https:// page (the GitHub Pages site) or localhost.
//
// Syncing is three-way, so two devices never overwrite each other's progress by accident. This device remembers
// what it last agreed with Google on (the Drive file's modifiedTime and a fingerprint of the save), then:
//   only this device changed  → upload;   only Google changed (another device) → load it;
//   both changed              → keep the one that is further along (races, research, Driver School, cars, …).
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

/* The Drive file's id and when it last changed (any device's upload changes modifiedTime). */
async function remoteMeta() {
  const q = encodeURIComponent(`name='${FILE}'`);
  const r = await api(`${API}?spaces=appDataFolder&fields=files(id,modifiedTime)&q=${q}`);
  const f = (await r.json()).files?.[0] || null;
  fileId = f?.id || null;
  return f;
}
async function download(id) { return (await api(`${API}/${id}?alt=media`)).json(); }
async function upload() {
  const body = JSON.stringify(S);
  let r;
  if (fileId) r = await api(`${UPLOAD}/${fileId}?uploadType=media&fields=id,modifiedTime`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body });
  else {
    const meta = { name: FILE, parents: ["appDataFolder"] }, b = "tdsave" + Math.random().toString(36).slice(2), nl = "\r\n";
    const multipart = `--${b}${nl}Content-Type: application/json${nl}${nl}${JSON.stringify(meta)}${nl}--${b}${nl}Content-Type: application/json${nl}${nl}${body}${nl}--${b}--`;
    r = await api(`${UPLOAD}?uploadType=multipart&fields=id,modifiedTime`, { method: "POST", headers: { "Content-Type": "multipart/related; boundary=" + b }, body: multipart });
  }
  const f = await r.json(); fileId = f.id;
  remember(f.modifiedTime);
}

/* What this device last agreed with Google on. Kept apart from the save, so saving doesn't change it. */
const BOOK = "turbodash.cloudsync";
const book = () => { try { return JSON.parse(localStorage.getItem(BOOK)) || {}; } catch (e) { return {}; } };
export const fingerprint = s => {
  const c = { ...s }; delete c.savedAt; delete c.cloud;
  const j = JSON.stringify(c); let h = 0;
  for (let i = 0; i < j.length; i++) h = (h * 31 + j.charCodeAt(i)) | 0;
  return h;
};
const remember = mt => { try { localStorage.setItem(BOOK, JSON.stringify({ mt, print: fingerprint(S) })); } catch (e) { /* storage blocked */ } };
const sum = o => Object.values(o || {}).reduce((a, b) => a + (+b || 0), 0);
/* "How far along" a save is, for when both devices changed: everything that is earned, not just races. */
export const progress = s => (s.races || 0) * 10 + sum(s.research) * 40 + sum(s.school?.skills) * 30 + (s.school?.earned || 0) * 5
  + (s.owned || []).length * 60 + Object.values(s.ups || {}).reduce((a, u) => a + sum(u), 0) * 8 + (s.claimed || []).length * 20 + (s.rank || 1) * 200;
/* The decision, kept pure so it can be tested: "upload", "load" or "nothing". */
export function decide(local, remote, book) {
  if (!remote) return "upload";
  const remoteChanged = remote.mt !== book.mt, localChanged = fingerprint(local) !== book.print;
  if (!remoteChanged) return localChanged ? "upload" : "nothing";
  if (!localChanged && book.mt) return "load";
  return progress(remote.save) >= progress(local) ? "load" : "upload";   // both changed (or first sync on this device)
}

/* Sign in from Parent Corner, then sync. */
export async function cloudSignIn() {
  if (!cloudReady()) { say(cloudWhy()); return; }
  try {
    say("Signing in…"); await getToken(false);
    S.cloud = { linked: true }; save();
    return await syncNow(true);
  } catch (e) { say("Sign-in didn't finish (" + e.message + ")."); }
}
export function cloudSignOut() {
  if (token && window.google?.accounts?.oauth2) google.accounts.oauth2.revoke(token, () => {});
  token = null; fileId = null; S.cloud = { linked: false }; save();
  try { localStorage.removeItem(BOOK); } catch (e) { /* storage blocked */ }
  say("Signed out. Progress stays on this tablet.");
}
/* Compare with Google and keep the right copy. Returns "loaded" when the Google copy replaced this one. */
export async function syncNow(fromTap = false) {
  if (!cloudReady() || !cloudLinked() || busy) return;
  busy = true;
  try {
    if (!hasToken()) { if (!fromTap) { say("Tap Play to reconnect Google Save."); return; } await getToken(true); }
    say("Checking Google Drive…");
    const meta = await remoteMeta();
    const remote = meta && meta.modifiedTime !== book().mt ? { mt: meta.modifiedTime, save: await download(meta.id) } : meta ? { mt: meta.modifiedTime, save: null } : null;
    const what = decide(S, remote, book());
    if (what === "load") {
      replaceSave({ ...port(remote.save), cloud: { linked: true } }); remember(remote.mt); dirty = false;
      say("Loaded your progress from Google ✔"); return "loaded";
    }
    if (what === "upload") await upload();
    dirty = false;
    say("Saved to Google ✔ " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  } catch (e) { say("Google Save problem: " + e.message); }
  finally { busy = false; }
}
/* After any save, sync a little later (batched), if signed in and the token is still good. */
export function cloudSaved() {
  if (!cloudLinked() || !cloudReady()) return;
  dirty = true; clearTimeout(timer);
  timer = setTimeout(() => { if (dirty && hasToken()) syncNow(); }, 15000);
}
/* Called from a tap (Play): refresh the token quietly so syncing keeps working this session. */
export async function cloudWake() {
  if (!cloudReady() || !cloudLinked() || hasToken()) return;
  try { await getToken(true); return await syncNow(true); } catch (e) { say("Google Save is paused: open Parent Corner to sign in again."); }
}
// leaving the game: sync (it compares first, so it never blindly overwrites another device's progress)
if (typeof document !== "undefined") document.addEventListener("visibilitychange", () => { if (document.hidden && dirty && hasToken()) syncNow(); });
