import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const [,, SITE, OUTDIR] = process.argv;
const CFG = {
  semente: { url: 'https://lucsal2603.github.io/semente/', patchMain: true, ready: "!document.getElementById('velo')", settle: 3000 },
  granaio: { url: 'https://lucsal2603.github.io/granaio/', patchMain: false, ready: "(() => { const l = document.querySelector('.loader-main'); return !l || l.classList.contains('hide'); })()", settle: 5500 },
}[SITE];
fs.rmSync(OUTDIR, { recursive: true, force: true }); fs.mkdirSync(OUTDIR, { recursive: true });
const EXE = '/Users/lucas/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STUB = `window.Lenis = class Lenis { constructor(){ this.velocity = 0; } on(){} off(){} raf(){} start(){} stop(){} destroy(){} resize(){}
  scrollTo(t, o){ o = o || {}; let y = t; if (typeof t === 'string') t = document.querySelector(t);
    if (t && t.getBoundingClientRect) y = t.getBoundingClientRect().top + window.scrollY; if (typeof y !== 'number') y = 0; y += o.offset || 0;
    window.scrollTo({ top: y, behavior: 'instant' }); } };`;

const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, locale: 'it-IT', reducedMotion: 'no-preference',
  recordVideo: { dir: OUTDIR, size: { width: 1280, height: 720 } } });
const t0 = Date.now();
const page = await ctx.newPage();
await page.route(/lenis[^/]*\.js/, (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: STUB }));
if (CFG.patchMain) {
  await page.route(/\/js\/main\.js(\?.*)?$/, async (route) => {
    const res = await route.fetch(); const body = await res.text();
    const rx = /window\.addEventListener\('load',\s*\(\)\s*=>\s*\{\s*document\.fonts\.ready\.then\(\(\)\s*=>\s*\{\s*ScrollTrigger\.refresh\(\);\s*ingresso\.play\(\);\s*\}\);\s*\}\);/;
    const patched = body.replace(rx, 'window.__avvia = () => { ScrollTrigger.refresh(); ingresso.play(); };');
    console.log('patch main.js:', patched !== body ? 'applicata' : 'NON APPLICATA');
    await route.fulfill({ status: 200, contentType: 'application/javascript', body: patched });
  });
}
await page.goto(CFG.url, { waitUntil: 'load', timeout: 90000 });
let tIntro = Date.now();
await page.evaluate(() => document.fonts.ready);
await sleep(500);
if (CFG.patchMain) { tIntro = Date.now(); await page.evaluate(() => window.__avvia && window.__avvia()); }
await page.waitForFunction(CFG.ready, null, { timeout: 60000, polling: 100 });
console.log('intro finita dopo', ((Date.now() - tIntro) / 1000).toFixed(1), 's');
await sleep(CFG.settle);

const D = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const v = Math.min(480, Math.max(260, D / 40));
console.log(`corsa: D=${D}px v=${v.toFixed(0)}px/s`);
const T = await page.evaluate(({ D, v }) => new Promise((res) => {
  const Tu = 1.4, Td = 2.0; let vv = v; let Tm = D / vv - Tu / 2 - Td / 2; if (Tm < 0) { vv = D / (Tu / 2 + Td / 2); Tm = 0; }
  const T = Tu + Tm + Td;
  const vel = (t) => t < Tu ? vv * (1 - Math.cos(Math.PI * t / Tu)) / 2 : t < Tu + Tm ? vv : vv * (1 + Math.cos(Math.PI * (t - Tu - Tm) / Td)) / 2;
  let y = 0, t = 0, last = performance.now();
  const f = (now) => { const dt = Math.min(0.05, (now - last) / 1000); last = now; y = Math.min(D, y + vel(t) * dt); t += dt;
    window.scrollTo({ top: y, behavior: 'instant' });
    if (t < T && y < D) requestAnimationFrame(f); else { window.scrollTo({ top: D, behavior: 'instant' }); res(T); } };
  requestAnimationFrame(f);
}), { D, v });
console.log('corsa durata', T.toFixed(1), 's');
await sleep(2400);
const offset = Math.max(0, (tIntro - t0) / 1000 - 0.15);
await ctx.close();
const webm = fs.readdirSync(OUTDIR).find((f) => f.endsWith('.webm'));
fs.writeFileSync(path.join(OUTDIR, 'meta.json'), JSON.stringify({ webm, offset }));
console.log('webm:', webm, '| taglio iniziale', offset.toFixed(2), 's');
await browser.close();
