import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const OUT = process.argv[2];
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const EXE = '/Users/lucas/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const FPS = 60, STEP = 1000 / FPS, W = 1920, H = 1080;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STUB = `window.Lenis = class Lenis { constructor(){ this.velocity = 0; } on(){} off(){} raf(){} start(){} stop(){} destroy(){} resize(){}
  scrollTo(t, o){ o = o || {}; let y = t; if (typeof t === 'string') t = document.querySelector(t);
    if (t && t.getBoundingClientRect) y = t.getBoundingClientRect().top + window.scrollY; if (typeof y !== 'number') y = 0; y += o.offset || 0;
    window.scrollTo({ top: y, behavior: 'instant' }); } };`;

const browser = await chromium.launch({ executablePath: EXE, headless: true, args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, locale: 'it-IT', reducedMotion: 'no-preference' });
const page = await ctx.newPage();
await page.route(/lenis[^/]*\.js/, (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: STUB }));
await page.route(/\/js\/main\.js(\?.*)?$/, async (route) => {
  const res = await route.fetch(); const body = await res.text();
  const old = "const boot = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });";
  const patched = body.replace(old, "const boot = gsap.timeline({ paused: true, defaults: { ease: 'back.out(1.7)' } }); window.__avviaBoot = () => boot.play();");
  console.log('patch boot:', patched !== body ? 'applicata' : 'NON APPLICATA');
  await route.fulfill({ status: 200, contentType: 'application/javascript', body: patched });
});

/* pre-roll reale: pagina, font e video pronti */
await page.goto('http://localhost:8092/', { waitUntil: 'load', timeout: 90000 });
await page.evaluate(() => document.fonts.ready);
const t0 = Date.now();
while (Date.now() - t0 < 60000) {
  const ok = await page.evaluate(() => [...document.querySelectorAll('video')].every((v) => v.readyState >= 3));
  if (ok) break; await sleep(300);
}
console.log('pre-roll:', ((Date.now() - t0) / 1000).toFixed(1), 's, boot manuale:', await page.evaluate(() => typeof window.__avviaBoot));

/* orologio manuale: ticker GSAP addormentato, ogni frame avanzo di 1/60 s */
await page.evaluate(() => { gsap.ticker.sleep(); gsap.ticker.wake = () => {}; window.__t0 = gsap.ticker.time; window.__k = 0; });
async function tick(ms) {
  await page.evaluate((dtSec) => { window.__k += dtSec; ScrollTrigger.update(true); gsap.updateRoot(window.__t0 + window.__k); }, ms / 1000);
  return true;
}
let frame = 0, dup = 0, tFrames = Date.now();
async function shot() {
  const file = path.join(OUT, `f${String(frame).padStart(5, '0')}.jpg`);
  for (let attempt = 0; attempt < 2; attempt++) {
    try { await page.screenshot({ path: file, type: 'jpeg', quality: 90, timeout: 8000 }); frame++; return; }
    catch (e) { console.log('screenshot fallito al frame', frame, String(e).slice(0, 50)); await tick(1); }
  }
  const prev = path.join(OUT, `f${String(frame - 1).padStart(5, '0')}.jpg`);
  if (fs.existsSync(prev)) { fs.copyFileSync(prev, file); dup++; frame++; }
}
async function step(y) {
  if (y != null) await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
  await tick(STEP);
  await shot();
  if (frame % 30 === 0) {
    const msPerFrame = (Date.now() - tFrames) / 30; tFrames = Date.now();
    const rate = Math.min(1, Math.max(0.0625, STEP / msPerFrame));
    await page.evaluate((r) => document.querySelectorAll('video').forEach((v) => { v.playbackRate = r; if (v.paused) v.play().catch(() => {}); }), rate);
    if (frame % 300 === 0) console.log(`frame ${frame} | ${msPerFrame.toFixed(0)} ms/frame | video rate ${rate.toFixed(3)}`);
  }
}

/* intro: preloader + ingresso (5 s) */
await page.evaluate(() => { if (window.__avviaBoot) window.__avviaBoot(); return true; });
for (let i = 0; i < 5 * FPS; i++) await step(0);
await page.screenshot({ path: path.join(OUT, 'home-16x9.png'), type: 'png' });

/* corsa lenta */
const D = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
let v = Math.min(560, Math.max(300, D / 30));
const Tu = 1.4, Td = 2.0; let Tm = D / v - Tu / 2 - Td / 2; if (Tm < 0) { v = D / (Tu / 2 + Td / 2); Tm = 0; }
const T = Tu + Tm + Td;
console.log(`corsa: D=${D}px v=${v.toFixed(0)}px/s durata=${T.toFixed(1)}s`);
const vel = (t) => t < Tu ? v * (1 - Math.cos(Math.PI * t / Tu)) / 2 : t < Tu + Tm ? v : v * (1 + Math.cos(Math.PI * (t - Tu - Tm) / Td)) / 2;
let y = 0, t = 0; const dt = STEP / 1000;
while (t < T && y < D) { y = Math.min(D, y + vel(t) * dt); await step(Math.round(y)); t += dt; }
await step(D);
for (let i = 0; i < Math.round(2.4 * FPS); i++) await step(D);
console.log('frame totali', frame, '| duplicati', dup, '| durata', (frame / FPS).toFixed(1), 's');
await browser.close();
