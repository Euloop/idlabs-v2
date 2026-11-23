/* Safari check without a Mac or iPhone: screenshots pages in Playwright's WebKit (Safari's engine)
   at iPhone and desktop sizes. Not Apple's exact build — iOS chrome (address bar, notch, touch
   scrolling) isn't covered; use a real-device service for that.

   Usage (dev server or any URL):
     npm run safari                                  # http://localhost:3000/
     npm run safari -- https://idlabs-v2.vercel.app/ /about
   Shots land in safari-shots/ (gitignored).

   The loader is skipped (the same sessionStorage flag the click-to-skip sets) so the hero shows at
   once. The home hero is shot three times, once per city in the headline (HeroVertical CITIES). */
import { webkit, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const [base = 'http://localhost:3000/', ...paths] = process.argv.slice(2);
const routes = paths.length ? paths : ['/'];
const OUT = 'safari-shots';
mkdirSync(OUT, { recursive: true });

const PROFILES = {
  iphone: devices['iPhone 15'],
  desktop: devices['Desktop Safari'],
};
// moments on the animations' clock: the intro done on San Francisco, then London, then Bangalore (hero-vertical.css .hv-city)
const CITY_SHOTS = [['sanfrancisco', 1500], ['london', 7000], ['bangalore', 11000]];

const browser = await webkit.launch();
const errors = [];
for (const [name, profile] of Object.entries(PROFILES)) {
  const context = await browser.newContext(profile);
  await context.addInitScript(() => { try { sessionStorage.setItem('il-skip-loader', '1'); } catch {} });
  for (const route of routes) {
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(`${name} ${route}: ${e.message}`));
    const url = new URL(route, base).href;
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const slug = route.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
    const shots = slug === 'home' ? CITY_SHOTS : [['page', 2000]];
    for (const [label, at] of shots) {
      // every CSS animation paused and seeked to the same moment, so shots don't drift with load time
      await page.evaluate((t) => {
        for (const a of document.getAnimations()) { a.pause(); a.currentTime = t; }
      }, at);
      await page.waitForTimeout(100);
      const file = `${OUT}/${slug}-${name}-${label}.png`;
      await page.screenshot({ path: file });
      console.log(file);
    }
    await page.close();
  }
  await context.close();
}
await browser.close();
if (errors.length) { console.error('\nPage errors in WebKit:\n' + errors.join('\n')); process.exitCode = 1; }
