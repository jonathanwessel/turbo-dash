// A small stand-in for the parts of Playwright the scripts use, driving an installed Edge or Chrome over the DevTools
// protocol (shared with Copper Gulch). Needs Node 22+ (built-in fetch and WebSocket), nothing else.
// The browser runs headless on a free port with its own temporary profile, and is closed and cleaned up
// by browser.close(). Set CHROME_PATH to pick a browser.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const sleep = ms => new Promise(r => setTimeout(r, ms));

export function findBrowser() {
  const env = process.env.CHROME_PATH;
  if (env && fs.existsSync(env)) return env;
  const pf = process.env['PROGRAMFILES'] || 'C:/Program Files', pf86 = process.env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)', local = process.env.LOCALAPPDATA || '';
  const list = {
    win32: [pf86 + '/Microsoft/Edge/Application/msedge.exe', pf + '/Microsoft/Edge/Application/msedge.exe', pf + '/Google/Chrome/Application/chrome.exe', pf86 + '/Google/Chrome/Application/chrome.exe', local + '/Google/Chrome/Application/chrome.exe'],
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/microsoft-edge', '/snap/bin/chromium'],
  }[process.platform] || [];
  return list.find(p => p && fs.existsSync(p));
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url); let id = 0; const pend = new Map(), subs = new Map();
    ws.onmessage = m => {
      const d = JSON.parse(m.data);
      if (d.id && pend.has(d.id)) { const { ok, no } = pend.get(d.id); pend.delete(d.id); d.error ? no(new Error(d.error.message)) : ok(d.result); }
      else if (d.method) for (const cb of subs.get(d.method) || []) cb(d.params);
    };
    ws.onerror = e => reject(e.error || new Error('DevTools connection failed'));
    ws.onopen = () => resolve({
      send: (method, params = {}) => new Promise((ok, no) => { const i = ++id; pend.set(i, { ok, no }); ws.send(JSON.stringify({ id: i, method, params })); }),
      on: (method, cb) => { if (!subs.has(method)) subs.set(method, []); subs.get(method).push(cb); },
      close: () => { try { ws.close(); } catch (e) {} },
    });
  });
}

async function launch(opts = {}) {
  const exe = findBrowser();
  if (!exe) throw new Error('No Edge or Chrome found. Install one, or set CHROME_PATH to its executable.');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'turbodash-cdp-'));
  const proc = spawn(exe, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + dir, '--no-first-run', '--no-default-browser-check',
    '--enable-unsafe-swiftshader', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--disable-extensions', ...(opts.args || []), 'about:blank'], { stdio: 'ignore' }); // swiftshader: WebGL even without a GPU
  const onExit = () => { try { proc.kill(); } catch (e) {} };
  process.on("exit", onExit); // never leave a headless browser behind (removed on close, so many launches do not pile up listeners)
  let port, wsPath;
  for (let i = 0; i < 150 && !port; i++) {
    try { const [p, w] = fs.readFileSync(path.join(dir, 'DevToolsActivePort'), 'utf8').trim().split(/\r?\n/); if (p && w) { port = p; wsPath = w; } } catch (e) {}
    if (!port) await sleep(100);
  }
  if (!port) { proc.kill(); throw new Error('The browser did not open a DevTools port.'); }
  const bws = await connect(`ws://127.0.0.1:${port}${wsPath}`);
  const pages = [];
  return {
    async newPage(opts = {}) {
      const { targetId } = await bws.send('Target.createTarget', { url: 'about:blank' });
      const s = await connect(`ws://127.0.0.1:${port}/devtools/page/${targetId}`);
      await s.send('Page.enable'); await s.send('Runtime.enable');
      let loaded = null; s.on('Page.loadEventFired', () => { if (loaded) { loaded(); loaded = null; } });
      const waitLoad = () => new Promise(r => { loaded = r; setTimeout(r, 15000); });
      const page = {
        async setViewportSize({ width, height }) {
          await s.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: opts.deviceScaleFactor || 1, mobile: !!opts.mobile });
          if (opts.mobile) await s.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); // a phone: coarse pointer, touch
        },
        async addInitScript(fn) { await s.send('Page.addScriptToEvaluateOnNewDocument', { source: typeof fn === 'function' ? `(${fn})()` : String(fn) }); },
        async goto(url) { const w = waitLoad(); await s.send('Page.navigate', { url }); await w; },
        async reload() { const w = waitLoad(); await s.send('Page.reload'); await w; },
        waitForTimeout: ms => sleep(ms),
        async evaluate(fn, arg) {
          const expression = typeof fn === 'function' ? `(${fn})(${arg === undefined ? '' : JSON.stringify(arg)})` : String(fn);
          const r = await s.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
          if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text);
          return r.result.value;
        },
        $$eval(sel, fn) { return page.evaluate(`(${fn})([...document.querySelectorAll(${JSON.stringify(sel)})])`); },
        click(sel) { return page.evaluate(`document.querySelector(${JSON.stringify(sel)}).click()`); },
        keyboard: { async press(key) { for (const type of ['keyDown', 'keyUp']) await s.send('Input.dispatchKeyEvent', { type, key, code: key.length === 1 ? 'Key' + key.toUpperCase() : key, text: type === 'keyDown' && key.length === 1 ? key : undefined }); } },
        async screenshot({ path: file, fullPage } = {}) {
          const r = await s.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!fullPage });
          const buf = Buffer.from(r.data, 'base64'); if (file) fs.writeFileSync(file, buf); return buf;
        },
        on(ev, cb) {
          if (ev === 'pageerror') s.on('Runtime.exceptionThrown', p => cb({ message: (p.exceptionDetails.exception && p.exceptionDetails.exception.description) || p.exceptionDetails.text }));
          if (ev === 'console') s.on('Runtime.consoleAPICalled', p => cb({ type: () => p.type, text: () => p.args.map(a => a.value !== undefined ? a.value : a.description).join(' ') }));
        },
        async close() { s.close(); try { await bws.send('Target.closeTarget', { targetId }); } catch (e) {} },
        cdp: (method, params) => s.send(method, params), // raw DevTools protocol call

      };
      if (opts.viewport) await page.setViewportSize(opts.viewport);
      pages.push(page);
      return page;
    },
    async close() {
      process.off('exit', onExit);
      try { await bws.send('Browser.close'); } catch (e) {}
      bws.close();
      for (let i = 0; i < 30 && proc.exitCode === null; i++) await sleep(100);
      if (proc.exitCode === null) { try { process.platform === 'win32' ? spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' }) : proc.kill('SIGKILL'); } catch (e) {} await sleep(300); }
      for (let i = 0; i < 10; i++) { try { fs.rmSync(dir, { recursive: true, force: true }); break; } catch (e) { await sleep(200); } }
    },
  };
}

export const chromium = { launch };
