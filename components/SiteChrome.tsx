'use client';

import { useEffect, useState } from 'react';
import TokenText from './TokenText';

/* The light sections' chrome (Figma: the same header and footer on section 2, 3 and 4):
   wordmark + [M] at the top, the footer labels at the bottom, the frame markers. One fixed
   layer, so it stays put while the sections scroll underneath it. It fades in once the page
   has turned light (Section 2 flips html[data-theme]) and out again in the hero.
   The footer's left label names the section in view: each section carries data-foot, and
   the last one whose top has passed the middle of the screen wins. */

export default function SiteChrome() {
  const [on, setOn] = useState(false);
  const [foot, setFoot] = useState('/Algorithm Research');
  const [group, setGroup] = useState('/Our Tech');

  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    const sync = () => {
      clearTimeout(timer);
      const t = root.dataset.theme;
      // wait for the light to come up (~400ms) before the chrome appears; it stays through
      // the night theme (sections 3–4)
      if (t === 'light' || t === 'night') timer = window.setTimeout(() => setOn(true), 380);
      else setOn(false);
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => { mo.disconnect(); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    let raf = 0;
    const root = document.documentElement;
    const measure = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let label = '';
      let grp = '/Our Tech';
      document.querySelectorAll<HTMLElement>('[data-foot]').forEach((el) => {
        if (el.getBoundingClientRect().top <= mid) {
          const night = document.documentElement.dataset.theme === 'night';
          label = (night && el.dataset.footNight) || el.dataset.foot || label;
          // right-hand label: the group the section belongs to (data-foot-group), else "/Our Tech"
          grp = el.dataset.footGroup || '/Our Tech';
        }
      });
      if (label) setFoot(label);
      setGroup(grp);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // the label can depend on the theme (data-foot-night)
    const mo = new MutationObserver(onScroll);
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Phones (2026-11-17): the header has no background, so the sections' text would run through the
  // wordmark. While scrolling down it steps away — but only while something is actually under it (client,
  // 2026-11-22: "keep the logo on top visible when there is empty space"); on any scroll up, or near the
  // top, it comes back.
  const [away, setAway] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 559px)');
    const root = document.documentElement;
    let lastY = window.scrollY, raf = 0, down = false, lastProbe = 0, probeT = 0;
    // is anything drawn in the header's band (its top 56px)? Hit tests at a grid of points, everything made
    // hit-testable for the moment (many layers here are pointer-events: none); a hit counts if it is a
    // picture, a shape, or a line of text whose glyph boxes cover the point, and nothing over it is see-through
    const shown = (el: Element) => {
      for (let e: Element | null = el, i = 0; e && i < 8; e = e.parentElement, i++) {
        const cs = getComputedStyle(e);
        if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.08) return false;
      }
      return true;
    };
    const drawnAt = (el: Element, x: number, y: number) => {
      if (/^(IMG|VIDEO|CANVAS|PICTURE)$/.test(el.tagName)) return true;
      if (el instanceof SVGElement && el.tagName.toLowerCase() !== 'svg' && el.tagName.toLowerCase() !== 'g') return true;
      for (const n of Array.from(el.childNodes)) {
        if (n.nodeType !== 3 || !n.textContent?.trim()) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        for (const b of Array.from(r.getClientRects())) if (x >= b.left && x <= b.right && y >= b.top - 4 && y <= b.bottom + 4) return true;
      }
      return false;
    };
    const occupied = () => {
      root.setAttribute('data-probe', '');
      try {
        const W = window.innerWidth;
        for (const y of [14, 30, 46]) for (const fx of [0.08, 0.3, 0.5, 0.7, 0.92]) {
          const x = W * fx;
          for (const el of document.elementsFromPoint(x, y)) {
            if (el.closest('.chrome')) continue;
            if (drawnAt(el, x, y) && shown(el)) return true;
          }
        }
        return false;
      } finally { root.removeAttribute('data-probe'); }
    };
    const check = () => {
      raf = 0;
      const y = window.scrollY, dy = y - lastY;
      if (!mq.matches || y < 80) down = false;
      else if (dy > 6) down = true;
      else if (dy < -6) down = false;
      if (Math.abs(dy) > 6 || y < 80) lastY = y;
      if (!down) { setAway(false); return; }
      // the probe costs a style pass: at most every 120ms while scrolling, and once more as it stops
      const now = performance.now();
      clearTimeout(probeT);
      if (now - lastProbe > 120) { lastProbe = now; setAway(occupied()); }
      probeT = window.setTimeout(() => { if (down) { lastProbe = performance.now(); setAway(occupied()); } }, 140);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener('scroll', onScroll, { passive: true });
    mq.addEventListener('change', onScroll);
    return () => { cancelAnimationFrame(raf); clearTimeout(probeT); window.removeEventListener('scroll', onScroll); mq.removeEventListener('change', onScroll); };
  }, []);

  // At the very end of the page (the footer's end, the last thing on it) the wordmark and the nav step
  // away (html[data-page-end], sections.css), leaving the footer the whole screen
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const check = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.toggleAttribute('data-page-end', max > 0 && window.scrollY >= max - 4);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); root.removeAttribute('data-page-end'); };
  }, []);

  return (
    <div className="chrome" data-on={on || undefined} data-away={away || undefined}>
      <div className="frame s2-frame chrome-frame">
        <header className="site-header s2-header">
          {/* Back to the home page's hero without the loader (2026-11-17): on / it scrolls up, no reload;
              elsewhere it leaves a one-time flag that StartLoader's boot script reads to skip the loader.
              A reload or a fresh visit still plays it. New-tab clicks are left alone. */}
          <a className="wordmark" href="/" aria-label="Identity Labs home" onClick={(e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              return;
            }
            try { sessionStorage.setItem('il-skip-loader', '1'); } catch {}
          }}>
            <span>Identity</span>
            <span className="wm-space"> </span>
            <em>Labs</em>
          </a>
          {/* The nav (Manifesto, Careers) is off for now (2026-11-17), until those pages are written;
              .chrome-nav's styles stay in sections.css for when it comes back. */}
          <span className="tick tick-l" aria-hidden="true" />
          <span className="tick tick-r" aria-hidden="true" />
        </header>
        <div />
        <footer className="s2-foot">
          <TokenText as="span" text={foot} show={on} delay={200} fade />
          <TokenText as="span" text={group} show={on} delay={260} fade />
          <span className="tick tick-l" aria-hidden="true" />
          <span className="tick tick-r" aria-hidden="true" />
        </footer>
      </div>
    </div>
  );
}
