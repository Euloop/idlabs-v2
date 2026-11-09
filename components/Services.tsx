'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import TokenText from './TokenText';
import { usePullUp } from './pullUp';
import './services.css';

/* Services (/home-2 only): two copies, dark (after the analytical tools, night theme) and
   light. Layout after the client's reference (tag row with the call to action, three bordered
   cells rule to rule, each a line diagram over a number, title and text). Copy is the client's
   "Our Forward-Deployed Services", word for word.
   Each diagram reads left → right, input → outcome, with one focus (the promise in the copy)
   and everything else receding. They are drawn already when they arrive (no draw-in); only
   the focus marker pulses softly. Soft geometry: S-curves that settle onto their targets,
   curved connectors, rounded boxes and line ends. Reduced motion: no pulse. */

const r2 = (n: number) => Math.round(n * 100) / 100; // same digits on server and client
const BOX = { rx: 4, ry: 4 };

/* 01 · Founder & CEO brand: both accounts (X, LinkedIn) grow along an S-curve and settle on
   the 100K line; the audience then pays out in the three outcomes from the copy. */
function BrandDiagram() {
  const id = 'sv' + useId().replace(/[^a-zA-Z0-9_-]/g, ''); // safe inside url(#…)
  const outs = [
    { y: 40, t: '$2B+ RAISED', c: 'M184 40 H214' },
    { y: 92, t: '$4M+ PIPELINE', c: 'M184 40 C200 40 198 92 214 92' },
    { y: 144, t: 'GLOBAL HIRING', c: 'M184 40 C202 40 196 144 214 144' },
  ];
  const X = 'M24 148 C80 147 102 46 150 41 S176 40 184 40';
  return (
    <svg viewBox="0 0 300 180" className="sv-svg" role="img" aria-label="Founder and company accounts grow to 100K followers on X and LinkedIn, which drives funding, pipeline and hiring">
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="st-a" />
          <stop offset="1" className="st-b" />
        </linearGradient>
      </defs>
      <path className="ln-dim" d="M24 22 V150 H184" />
      <text className="lb" x={24} y={14}>FOLLOWERS</text>
      <text className="lb" x={184} y={166} textAnchor="end">MONTHS</text>
      <path className="ln-dash" d="M24 40 H184" />
      <text className="lb lb-hi" x={28} y={34}>100K</text>
      <path className="area" fill={`url(#${id}a)`} d={`${X} V150 H24 Z`} />
      <path className="ln-soft" d="M24 149 C100 148 122 60 168 46 S182 41 184 40" />
      <path className="ln" d={X} />
      <text className="lb lb-mid" x={82} y={92} textAnchor="end">X</text>
      <text className="lb" x={116} y={112}>LINKEDIN</text>
      {outs.map((o) => (
        <g key={o.t}>
          <path className="ln-dim" d={o.c} />
          <rect className="box" {...BOX} x={214} y={o.y - 11} width={80} height={22} />
          <text className="lb lb-mid" x={254} y={o.y + 3} textAnchor="middle">{o.t}</text>
        </g>
      ))}
      <circle className="dot" cx={184} cy={40} r={2.6} />
      <circle className="pulse" cx={184} cy={40} r={2.6} />
    </svg>
  );
}

/* 02 · 10M-view launches: one launch ripples out to 100K → 1M → 10M views, and the reach
   narrows through a soft funnel into 1,000+ sales-qualified opportunities. */
function LaunchDiagram() {
  const cx = 40, cy = 96;
  const rings = [
    { r: 28, t: '100K' },
    { r: 56, t: '1M' },
    { r: 86, t: '10M VIEWS' },
  ];
  const a = (55 * Math.PI) / 180;
  const pt = (r: number, s: number) => [r2(cx + r * Math.cos(a)), r2(cy + s * r * Math.sin(a))] as const;
  const [tx, ty] = pt(86, -1), [bx, by] = pt(86, 1);
  // leads thinning out along the funnel
  const leads = [
    [116, 60], [120, 90], [114, 124], [124, 146], [146, 80], [152, 104], [148, 124], [180, 92], [184, 102],
  ];
  return (
    <svg viewBox="0 0 300 180" className="sv-svg" role="img" aria-label="A launch reaches 100K, then 1M, then 10M views, and the reach is funnelled into 1,000 plus sales-qualified opportunities">
      <path className="ln-dim" d={`M${tx} ${ty} C150 30 170 88 212 89`} />
      <path className="ln-dim" d={`M${bx} ${by} C150 162 170 104 212 103`} />
      {leads.map(([x, y], i) => (
        <circle key={i} className="lead" cx={x} cy={y} r={1.6} />
      ))}
      {rings.map((g, i) => {
        const [x1, y1] = pt(g.r, -1), [x2, y2] = pt(g.r, 1);
        return (
          <g key={g.t}>
            <path className={i === 2 ? 'ln' : 'ln-dim'} d={`M${x1} ${y1} A${g.r} ${g.r} 0 0 1 ${x2} ${y2}`} />
            <text className={`lb${i === 2 ? ' lb-hi' : ''}`} x={x1 - 4} y={y1 - 4} textAnchor="end">{g.t}</text>
          </g>
        );
      })}
      <circle className="dot dot-mid" cx={cx} cy={cy} r={2.5} />
      <text className="lb" x={cx} y={cy + 20} textAnchor="middle">LAUNCH</text>
      <rect className="box box-hi" {...BOX} x={212} y={84} width={82} height={24} />
      <text className="lb lb-hi" x={253} y={99} textAnchor="middle">1,000+ SQOS</text>
      <circle className="pulse" cx={212} cy={96} r={2.5} />
      <text className="lb" x={253} y={128} textAnchor="middle">PIPELINE</text>
    </svg>
  );
}

/* 03 · Social & creative transformation: the company mobilises its employees as creators
   (a column of hollow rings); their output flows on as soft bands (Sankey style) into the
   recruiting, customer and enterprise brands, together the 100M views/month engine. */
function TransformDiagram() {
  const id = 'sv' + useId().replace(/[^a-zA-Z0-9_-]/g, ''); // safe inside url(#…)
  const CX = 100; // creator column
  const groups = [
    { ys: [30, 48, 66], s: [26, 70], b: 44, t: 'RECRUITING' },
    { ys: [84, 102], s: [80, 106], b: 90, t: 'CUSTOMER' },
    { ys: [120, 138, 156], s: [116, 160], b: 136, t: 'ENTERPRISE' },
  ];
  const band = (s0: number, s1: number, b0: number, b1: number) =>
    `M106 ${s0} C160 ${s0} 160 ${b0} 214 ${b0} V${b1} C160 ${b1} 160 ${s1} 106 ${s1} Z`;
  const edge = (s0: number, b0: number) => `M106 ${s0} C160 ${s0} 160 ${b0} 214 ${b0}`;
  return (
    <svg viewBox="0 0 300 180" className="sv-svg" role="img" aria-label="The company turns its employees into creators; their output flows into the recruiting, customer and enterprise brands, a 100M views a month engine">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="st-b" />
          <stop offset="1" className="st-a st-strong" />
        </linearGradient>
      </defs>
      {/* company → each employee */}
      {groups.flatMap((g) => g.ys).map((y) => (
        <path key={y} className="ln-dim" d={`M64 90 C82 90 80 ${y} ${CX - 3.2} ${y}`} />
      ))}
      <rect className="box box-fill" {...BOX} x={8} y={79} width={56} height={22} />
      <text className="lb lb-mid" x={36} y={93} textAnchor="middle">COMPANY</text>
      {/* creators' output, flowing into the three brands */}
      {groups.map((g) => {
        const b0 = g.b - 11, b1 = g.b + 11;
        return (
          <g key={g.t}>
            <path className="area" fill={`url(#${id}f)`} d={band(g.s[0], g.s[1], b0, b1)} />
            <path className="ln-soft" d={edge(g.s[0], b0)} />
            <path className="ln-soft" d={edge(g.s[1], b1)} />
            <rect className="box" {...BOX} x={214} y={b0} width={80} height={22} />
            <text className="lb lb-mid" x={254} y={g.b + 3} textAnchor="middle">{g.t}</text>
          </g>
        );
      })}
      {groups.flatMap((g) => g.ys).map((y) => (
        <circle key={y} className="ring" cx={CX} cy={y} r={3.2} />
      ))}
      <circle className="pulse" cx={64} cy={90} r={2.2} />
      <text className="lb lb-mid" x={CX} y={175} textAnchor="middle">EMPLOYEES AS CREATORS</text>
      <text className="lb lb-hi" x={254} y={18} textAnchor="middle">100M VIEWS / MO</text>
    </svg>
  );
}

type Service = { title: string; text: string; diagram: ReactNode };

const SERVICES: Service[] = [
  {
    title: 'Founder & CEO Brand',
    text: 'Grow the CEO/Founder and company’s account to 100K followers on Twitter and LinkedIn to raise >$2B USD, drive $4M+ in pipeline, hire better talent globally.',
    diagram: <BrandDiagram />,
  },
  {
    title: '10M views global product launches',
    text: 'Engineer product/service launches for companies in a way that reaches 10M people and generates 1000+ SQOs',
    diagram: <LaunchDiagram />,
  },
  {
    title: 'Company Social and Creative Transformation',
    text: 'End-to-end transformation of a company’s recruiting, customer, and enterprise brand, delivered as pure consulting or consulting plus execution. This includes a 100M views/month engine, built by mobilising the company’s employees into creators.',
    diagram: <TransformDiagram />,
  },
];

/** `light`: the same section on the light page (the lights come up as it arrives; SectionTwoFlow.tsx
    reads data-lights-up). The first, dark copy is pulled up under Section 4's hold. */
export default function Services({ light = false }: { light?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  usePullUp(sectionRef, light
    ? { prevContent: '#sv-none', prevPin: '#sv-none', content: '#sv-none', pin: '#sv-none' } // no pull-up: it follows the dark copy
    : { prevContent: '.s4-inner', prevPin: '.s4-pin', content: '.sv-inner', pin: '.sv-pin' }, 200);

  // Draw the diagrams once the section is well on screen; undraw when it leaves below.
  useEffect(() => {
    const s = sectionRef.current;
    if (!s) return;
    let raf = 0;
    const measure = () => { raf = 0; setOn(s.getBoundingClientRect().top < window.innerHeight * 0.5); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="sv"
      data-tone={light ? 'light' : 'dark'}
      data-lights-up={light || undefined}
      data-foot="/Forward-Deployed"
      data-foot-night="/Forward-Deployed"
      data-foot-group="/Our Services"
      data-on={on || undefined}
      aria-labelledby={light ? 'sv-title-l' : 'sv-title'}
    >
      <div className="sv-pin">
        <div className="frame sv-frame">
          <div className="sv-inner">
            <div className="sv-head">
              <h2 id={light ? 'sv-title-l' : 'sv-title'} className="sv-tag">
                <TokenText as="span" text="Our Forward-Deployed Services" show={on} probs />
              </h2>
              <a className="sv-cta" href="#">[Work with us]</a>
            </div>

            <ol className="sv-grid">
              {SERVICES.map((s, i) => (
                <li key={s.title} className="sv-cell" style={{ '--i': i } as CSSProperties}>
                  <div className="sv-fig">{s.diagram}</div>
                  <span className="sv-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="sv-title">{s.title}</h3>
                  <p className="sv-text">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
