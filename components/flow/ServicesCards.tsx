'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './services-cards.css';

/* Services (/home-2), two three-up layouts after the client's references:
     columns  three ruled cells rule to rule (hairlines above, below and between), a hairline-boxed
              serif number, the title in mono caps, the copy in 12px mono caps, and a
              solid [Learn More] button at the foot of each cell
     cards    three separate hairline cards with a gap, a solid rounded number badge, the title in
              mono caps, the copy below, and a plain [Work with us] link at the foot
   The label "Our services" sits centred above. Copy: the client's, word for word
   (as in Services.tsx). Same section shell as the others (.sv: corners, theme, lights-up). */

export type CardsLayout = 'columns' | 'cards';

const SERVICES = [
  {
    title: 'Founder & CEO Brand',
    text: 'Grow the CEO/Founder and company’s account to 100K followers on Twitter and LinkedIn to raise >$2B USD, drive $4M+ in pipeline, hire better talent globally.',
  },
  {
    title: '10M views global product launches',
    text: 'Engineer product/service launches for companies in a way that reaches 10M people and generates 1000+ SQOs',
  },
  {
    title: 'Company Social and Creative Transformation',
    text: 'End-to-end transformation of a company’s recruiting, customer, and enterprise brand, delivered as pure consulting or consulting plus execution. This includes a 100M views/month engine, built by mobilising the company’s employees into creators.',
  },
];

// `still` (the home page): no appear animation — the cards are simply there, and nothing watches the scroll
export default function ServicesCards({ light = true, layout, still = false }: { light?: boolean; layout: CardsLayout; still?: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const s = sectionRef.current;
    if (!s || still) return;
    let raf = 0;
    const measure = () => { raf = 0; setOn(s.getBoundingClientRect().top < window.innerHeight * 0.5); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [still]);

  const cta = layout === 'columns' ? '[Learn More]' : '[Work with us]';
  return (
    <section
      ref={sectionRef}
      className="sv svc"
      data-layout={layout}
      data-tone={light ? 'light' : 'dark'}
      data-lights-up={light || undefined}
      data-foot="/Forward-Deployed"
      data-foot-group="/Our Services"
      data-on={on || undefined}
      data-still={still || undefined}
      aria-labelledby="svc-title"
    >
      <div className="sv-pin">
        <div className="frame sv-frame">
          <div className="sv-inner svc-inner">
            <h2 id="svc-title" className="svc-label">Our services</h2>
            <ol className="svc-grid">
              {SERVICES.map((s, i) => (
                <li key={s.title} className="svc-cell" style={{ '--i': i } as CSSProperties}>
                  <span className="svc-num" aria-hidden="true">{i + 1}</span>
                  {/* "Founder &" / "CEO Brand": all three titles on two lines, so the descriptions
                      start on the same line (phones: one line again, flow.css) */}
                  <h3 className="svc-title">{s.title === 'Founder & CEO Brand' ? <>Founder &amp;{' '}<br className="svc-br" />CEO Brand</> : s.title}</h3>
                  <p className="svc-text">{s.text}</p>
                  <a className="svc-cta" href="#" aria-label={`${cta.slice(1, -1)}: ${s.title}`}>{cta}</a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
