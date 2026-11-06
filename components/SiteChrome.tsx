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

  useEffect(() => {
    const root = document.documentElement;
    let timer = 0;
    const sync = () => {
      clearTimeout(timer);
      const light = root.dataset.theme === 'light';
      // wait for the light to come up (~400ms) before the chrome appears
      if (light) timer = window.setTimeout(() => setOn(true), 380);
      else setOn(false);
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => { mo.disconnect(); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let label = '';
      document.querySelectorAll<HTMLElement>('[data-foot]').forEach((el) => {
        if (el.getBoundingClientRect().top <= mid) label = el.dataset.foot || label;
      });
      if (label) setFoot(label);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="chrome" data-on={on || undefined}>
      <div className="frame s2-frame chrome-frame">
        <header className="site-header s2-header">
          <a className="wordmark" href="/" aria-label="Identity Labs home" tabIndex={on ? 0 : -1}>
            <span>Identity</span>
            <span className="wm-space"> </span>
            <em>Labs</em>
          </a>
          <a className="s2-menu" href="#" aria-label="Menu" tabIndex={on ? 0 : -1}>
            <TokenText as="span" text="[M]" show={on} delay={120} fade />
          </a>
          <span className="tick tick-l" aria-hidden="true" />
          <span className="tick tick-r" aria-hidden="true" />
        </header>
        <div />
        <footer className="s2-foot">
          <TokenText as="span" text={foot} show={on} delay={200} fade />
          <TokenText as="span" text="/Our Tech" show={on} delay={260} fade />
          <span className="tick tick-l" aria-hidden="true" />
          <span className="tick tick-r" aria-hidden="true" />
        </footer>
      </div>
    </div>
  );
}
