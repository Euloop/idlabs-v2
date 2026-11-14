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
    <div className="chrome" data-on={on || undefined}>
      <div className="frame s2-frame chrome-frame">
        <header className="site-header s2-header">
          <a className="wordmark" href="/" aria-label="Identity Labs home">
            <span>Identity</span>
            <span className="wm-space"> </span>
            <em>Labs</em>
          </a>
          {/* The nav: one fixed copy for the whole page (hero included), always on screen, no
              background. Same links in light and dark; only the colour follows the theme. */}
          <nav className="chrome-nav" aria-label="Primary">
            <a href="#" className="roll" aria-label="Manifesto">
              <span className="roll-track" aria-hidden="true"><span>Manifesto</span><span>Manifesto</span></span>
            </a>
            <a href="#" className="roll" aria-label="Careers">
              <span className="roll-track" aria-hidden="true"><span>Careers</span><span>Careers</span></span>
            </a>
          </nav>
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
