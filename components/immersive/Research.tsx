'use client';

import { useRef } from 'react';
import OptionTabs, { useOption } from '../flow/OptionTabs';
import PaperPage, { PAGE_H, PAGE_W } from './PaperPage';
import { PAPER_TEXT } from './paperText';
import { Paper, PAPERS as COVERS } from '../SectionThree';
import '../sections.css';
import { AUTHORS, LAB, PAPERS } from './data';
import { lerp, put, range, setCaption, setDark, smooth, useScene } from './engine';

/* Scene 3 · Research (after the Getty piece's "one object, then the lights go down" moments).
   The two papers float side by side under "Read our published findings"; scrolling dims the room
   and brings each paper up in turn, full height on the right, its title and link on the left; then
   the lights come back up for the software. The covers are the live site's (SectionThree's Paper:
   back page, front page, figures, hover fan), drawn at 2× and scaled down so they stay sharp at
   full height. The dark is the site's own: #2a2c31 with the colour-burned paper texture. The papers
   tilt toward the pointer and bob gently while they wait.
   Cover tabs at the bottom (home-2's OptionTabs; ?papers=site|sheet|paper): Paper (the default)
   is the paper's real first page as a printed cover (PaperPage.tsx), Site the live site's cover,
   Sheet the first one, a white sheet over a back page with lab and year, title, authors, a figure
   grid and a few ruled lines. */

export type CoverVariant = 'site' | 'sheet' | 'paper';

const K = 2; // site cover drawn at 2 × its Figma size
const COVERS_OPTS: [CoverVariant, string][] = [['paper', 'Paper'], ['site', 'Site'], ['sheet', 'Sheet']];
const SIZE = {
  site: { w: 310.25 * K, h: 347 * K, s0: 0.42, cap: 0.5, sF: 0.74 },
  sheet: { w: 300, h: 388, s0: 0.5, cap: 1.05, sF: 0.82 },
  paper: { w: PAGE_W, h: PAGE_H, s0: 0.5, cap: 0.4, sF: 0.84 },
};

export default function Research() {
  const [cover, pickCover] = useOption<CoverVariant>('papers', COVERS_OPTS, 'paper');
  const { w: PW, h: PH, s0: S0, cap: CAP, sF: SF } = SIZE[cover];
  const ref = useRef<HTMLElement>(null);
  const night = useRef<HTMLDivElement>(null);
  const papers = useRef<(HTMLElement | null)[]>([]);
  const intro = useRef<HTMLDivElement>(null);
  const notes = useRef<(HTMLDivElement | null)[]>([]);
  const hover = useRef(-1);
  const hv = useRef([0, 0]);

  useScene(ref, (p, f) => {
    const { vw, vh, mobile } = f;
    const dark = smooth(range(p, 0.24, 0.36)) * (1 - smooth(range(p, 0.86, 1)));
    put(night.current, 'opacity', dark.toFixed(3));
    setDark('research', dark > 0.5 && p > 0 && p < 1);

    const xIn = smooth(range(p, 0.26, 0.4));
    const xOut = smooth(range(p, 0.55, 0.67));
    const liIn = smooth(range(p, 0.58, 0.71));
    // the last paper stays while the lights come up, settling back a little; it leaves with the
    // stage as the next scene arrives, so the hand-off is never empty
    const end = smooth(range(p, 0.84, 1));

    const s0 = mobile ? Math.min((vw * 0.42) / PW, (vh * 0.3) / PH) : Math.min(CAP, (vh * S0) / PH);
    const sF = mobile ? Math.min((vw * 0.78) / PW, (vh * 0.5) / PH) : Math.min((vh * SF) / PH, (vw * 0.4) / PW);
    const focus = mobile ? { x: 0, y: -vh * 0.13 } : { x: vw * (0.2 - 0.2 * smooth(range(p, 0.86, 1))), y: 0 };
    const k = 1 - Math.exp(-f.dt * 10);

    for (let i = 0; i < 2; i++) {
      const el = papers.current[i];
      if (!el) continue;
      hv.current[i] += ((hover.current === i ? 1 : 0) - hv.current[i]) * k;
      const side = i === 0 ? -1 : 1;
      const bx = side * (mobile ? vw * 0.23 : vw * 0.14);
      const by = (mobile ? vh * 0.06 : vh * 0.05) + i * 14;
      const brot = side * 4;
      let x: number, y: number, s: number, rot: number, o = 1;
      if (i === 0) {
        x = lerp(bx, focus.x, xIn);
        y = lerp(by, focus.y, xIn) - xOut * vh * 1.05;
        s = lerp(s0, sF, xIn);
        rot = lerp(brot, 0, xIn) - xOut * 6;
      } else {
        const drop = xIn * (1 - liIn);
        x = lerp(bx, focus.x, liIn);
        y = lerp(by, focus.y, liIn) + drop * vh * 0.95;
        s = lerp(s0, sF, liIn) * (1 - end * 0.22);
        rot = lerp(brot, 0, liIn) + drop * 8;
        o = 1;
      }
      const tiltY = f.mx * 7 - hv.current[i] * f.mx * 3;
      const tiltX = -f.my * 6;
      y -= hv.current[i] * 10 - (f.reduce ? 0 : Math.sin(f.t * 0.7 + i * 2.1) * 7);
      s *= 1 + hv.current[i] * 0.025;
      put(el, 'transform', `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale(${s.toFixed(4)})`);
      put(el, 'opacity', o.toFixed(3));
      put(el, 'visibility', o < 0.01 ? 'hidden' : 'visible');
    }

    const io = 1 - smooth(range(p, 0.18, 0.27));
    put(intro.current, 'opacity', io.toFixed(3));
    put(intro.current, 'transform', `translate3d(-50%, ${(-(1 - io) * 20).toFixed(1)}px, 0)`);
    const no = [
      smooth(range(p, 0.33, 0.4)) * (1 - smooth(range(p, 0.51, 0.57))),
      smooth(range(p, 0.67, 0.73)) * (1 - smooth(range(p, 0.86, 0.92))),
    ];
    notes.current.forEach((el, i) => {
      put(el, 'opacity', no[i].toFixed(3));
      put(el, 'transform', `translate3d(0, calc(-50% + ${((1 - no[i]) * 16).toFixed(1)}px), 0)`);
      put(el, 'visibility', no[i] < 0.01 ? 'hidden' : 'visible');
    });
  });

  return (
    <section className="im-scene im-research" ref={ref} id="im-research" aria-label="Research">
      <div className="im-stage">
        <div className="im-night" ref={night} aria-hidden="true"><div className="texture" /></div>
        <div className="im-research-intro" ref={intro}>
          <p className="im-say">Read our published findings.</p>
        </div>

        <div className="im-papers">
          {cover === 'site' && COVERS.map((pp, i) => (
            <div
              key={pp.title}
              ref={(el) => { papers.current[i] = el; }}
              className="im-paper"
              style={{ width: PW, height: PH, marginLeft: -PW / 2, marginTop: -PH / 2 }}
              onPointerEnter={() => { hover.current = i; setCaption({ title: PAPERS[i].short, meta: AUTHORS, hint: 'Read the paper ↗' }); }}
              onPointerLeave={() => { hover.current = -1; setCaption(null); }}
            >
              <Paper {...pp} />
            </div>
          ))}
          {cover === 'sheet' && PAPERS.map((pp, i) => (
            <a
              key={pp.href}
              ref={(el) => { papers.current[i] = el; }}
              className="im-paper"
              href={pp.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${pp.title} ${AUTHORS}, ${LAB} (PDF, opens in a new tab)`}
              style={{ width: PW, height: PH, marginLeft: -PW / 2, marginTop: -PH / 2 }}
              onPointerEnter={() => { hover.current = i; setCaption({ title: pp.short, meta: AUTHORS, hint: 'Read the paper ↗' }); }}
              onPointerLeave={() => { hover.current = -1; setCaption(null); }}
            >
              <span className="im-paper-back" aria-hidden="true" />
              <span className="im-paper-sheet" aria-hidden="true">
                <span className="im-paper-head"><span>{LAB}</span><span>2026</span></span>
                <span className="im-paper-title">{pp.title}</span>
                <span className="im-paper-meta">{AUTHORS}</span>
                <span className="im-paper-figs">
                  {pp.figs.map((src) => <img key={src} src={src} alt="" draggable={false} />)}
                </span>
                <span className="im-paper-lines"><i /><i /><i /><i /></span>
              </span>
            </a>
          ))}
          {cover === 'paper' && PAPERS.map((pp, i) => (
            <a
              key={pp.href}
              ref={(el) => { papers.current[i] = el; }}
              className="im-paper"
              href={pp.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${pp.title} ${AUTHORS}, ${LAB} (PDF, opens in a new tab)`}
              style={{ width: PW, height: PH, marginLeft: -PW / 2, marginTop: -PH / 2 }}
              onPointerEnter={() => { hover.current = i; setCaption({ title: pp.short, meta: AUTHORS, hint: 'Read the paper ↗' }); }}
              onPointerLeave={() => { hover.current = -1; setCaption(null); }}
            >
              <PaperPage paper={PAPER_TEXT[i]} fig={pp.figs[0]} />
            </a>
          ))}
        </div>

        {PAPERS.map((pp, i) => (
          <div key={pp.href} className="im-side-text im-on-dark" ref={(el) => { notes.current[i] = el; }} style={{ opacity: 0 }}>
            <p className="im-say">{pp.title}</p>
            <p className="im-sub">{AUTHORS}, {LAB}. <a className="im-link" href={pp.href} target="_blank" rel="noopener noreferrer">Read the paper (PDF) ↗</a></p>
          </div>
        ))}
      </div>
      <OptionTabs
        groups={[{ label: 'Paper cover', options: COVERS_OPTS, value: cover, onChange: (v) => pickCover(v as CoverVariant) }]}
        selector="#im-research" label="Research options"
      />
    </section>
  );
}
