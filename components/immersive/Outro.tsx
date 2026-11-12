'use client';

import { useRef } from 'react';
import Bookshelf from '../flow/Bookshelf';
import '../flow/footer.css';
import { PAPERS, SHOTS } from './data';
import { clamp, put, range, rnd, setCaption, setDark, smooth, useScene, wrap } from './engine';

/* Scene 7 · Close (after the Getty piece's last line, whose one word keeps changing). The line
   "Organic distribution, engineered for …" turns its last word with the scroll while launch
   pictures drift past the edges. Then the footer, on the site's dark textured ground: the site
   footer's links, the reading-list bookshelf (Bookshelf.tsx, as on /home-2), the wordmark as wide
   as the page, and the closing bar. The fixed chrome turns light once the footer reaches it. */

const COLUMNS: { title: string; links: string[] }[] = [
  { title: 'Platform', links: ['Identity Radar', 'Audience Intelligence', 'Research Suite', 'Analytics Dashboard'] },
  { title: 'Products', links: ['X Algorithm Tracker', 'LinkedIn Algo Insights', 'Leading Indicators', 'Followers Attribution'] },
  { title: 'Guides', links: ['Platform Guides', 'Audience Intelligence Guide', 'Research Playbooks', 'Algorithm Deep Dives'] },
  { title: 'Solutions', links: ['Enterprise', 'PR & Brand Teams', 'Social Media Teams', 'Affiliate Marketers'] },
  { title: 'Who it’s for', links: ['Marketers', 'Press & Media', 'Legal Teams', 'Founders'] },
  { title: 'Company', links: ['About', 'Research Papers', 'Careers', 'Press Kit'] },
];
const OFFICES = ['San Francisco', 'New York', 'Remote'];
const SOCIALS = ['X / Twitter', 'LinkedIn', 'Instagram', 'Substack'];

const WORDS = ['founders.', 'launches.', 'companies.', 'a billion people.'];
const DRIFT = Array.from({ length: 12 }, (_, i) => {
  let x = 0;
  for (let k = 0; k < 20; k++) {
    x = rnd(i * 7.1 + k * 3.3 + 90) - 0.5;
    if (Math.abs(x) > 0.24) break;
  }
  return { s: SHOTS[(i * 3 + 5) % SHOTS.length], x: x * 1.04, y: rnd(i * 4.9 + 91) - 0.5, d: 0.35 + 0.65 * rnd(i * 2.2 + 92) };
});

export default function Outro() {
  const ref = useRef<HTMLElement>(null);
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const line = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLElement>(null);

  useScene(ref, (p, f) => {
    const { vw, vh, mobile } = f;
    const ft = foot.current?.getBoundingClientRect().top ?? 1e4;
    setDark('footer', ft < 44);
    const w = range(p, 0.05, 0.85) * (WORDS.length - 1);
    words.current.forEach((el, i) => {
      const d = i - w;
      const o = clamp(1 - Math.abs(d) * 2.2);
      put(el, 'opacity', o.toFixed(3));
      put(el, 'transform', `translate3d(0, ${(d * 0.5).toFixed(3)}em, 0)`);
      put(el, 'filter', o > 0.99 || o < 0.01 ? 'none' : `blur(${((1 - o) * 6).toFixed(1)}px)`);
    });
    const lo = smooth(range(p, 0, 0.08));
    put(line.current, 'opacity', lo.toFixed(3));
    const H = Math.max(vh * 1.6, vh + 500);
    DRIFT.forEach((c, i) => {
      const x = c.x * vw + f.mx * 30 * c.d;
      const y = wrap(c.y * H - p * vh * 1.6 * (0.4 + 0.6 * c.d), H) + f.my * 18 * c.d;
      const h = (mobile ? 40 : 70) + (mobile ? 50 : 120) * c.d;
      put(cards.current[i], 'transform', `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(h / 200).toFixed(4)})`);
      put(cards.current[i], 'opacity', ((0.55 + 0.45 * c.d) * (mobile ? 0.5 : 1)).toFixed(3));
    });
  });

  return (
    <>
      <section className="im-scene im-outro" ref={ref} id="im-contact" aria-label="Contact">
        <div className="im-stage">
          <div className="im-field is-live" aria-hidden="true">
            {DRIFT.map((c, i) => {
              const w = 200 * c.s.ratio;
              return (
                <a
                  key={i}
                  ref={(el) => { cards.current[i] = el; }}
                  className="im-card"
                  href={c.s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                  style={{ width: w, height: 200, marginLeft: -w / 2, marginTop: -100 }}
                  onPointerEnter={() => setCaption({ title: c.s.title, meta: c.s.meta, hint: 'Open the post ↗' })}
                  onPointerLeave={() => setCaption(null)}
                  draggable={false}
                >
                  <img src={c.s.src} alt="" loading="lazy" draggable={false} />
                </a>
              );
            })}
          </div>
          <div className="im-statement im-outro-line" ref={line}>
            <p className="im-say im-say-lg">
              Organic distribution,<br />engineered for{' '}
              <span className="im-swap">
                {WORDS.map((x, i) => (
                  <span key={x} ref={(el) => { words.current[i] = el; }} style={{ opacity: i ? 0 : 1 }}>{x}</span>
                ))}
              </span>
            </p>
            <p className="im-sub">
              <a className="im-cta" href="#">Start a conversation</a>
            </p>
          </div>
        </div>
      </section>

      <footer className="im-footer" ref={foot}>
        <div className="im-night is-on" aria-hidden="true"><div className="texture" /></div>
        <div className="im-footer-inner">
          <div className="im-footer-top">
            <p className="im-footer-line">Algorithm research, analytics software and deployed services.</p>
            <nav className="im-footer-cols" aria-label="Footer">
              {COLUMNS.map((c) => (
                <div key={c.title}>
                  <p className="im-footer-head">{c.title}</p>
                  {c.links.map((l) => {
                    const paper = l === 'Research Papers' ? PAPERS[0].href : undefined;
                    return <a key={l} href={paper ?? '#'} {...(paper ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{l}</a>;
                  })}
                </div>
              ))}
            </nav>
          </div>

          <div className="im-shelf">
            <div className="im-shelf-head">
              <p className="im-footer-head">Reading list</p>
              <span>What our researchers keep on the desk</span>
            </div>
            <Bookshelf palette="il" />
            <div className="im-shelf-board" aria-hidden="true" />
          </div>

          <p className="im-footer-mark" role="img" aria-label="Identity Labs"><span className="im-logo" /></p>

          <div className="im-footer-bar">
            <span>© 2026 Identity Labs</span>
            <span>{OFFICES.join(' · ')}</span>
            <span className="im-footer-social">{SOCIALS.map((x) => <a key={x} href="#">{x}</a>)}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
