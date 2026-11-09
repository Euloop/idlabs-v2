'use client';

import { useEffect, useRef, useState } from 'react';
import './services-focus.css';

/* Services, "Detail" layout (/home-2; option to the card grid in Services.tsx). One centred
   column, 512px max: the three services as a list (the selected one in ink), its statement larger
   (15px, −2% tracking), the services it includes as tags, a media slot (placeholder until real
   imagery), and Work with us. Click (or focus) a service to switch. All other text 12px mono
   caps. Same section shell as Services (light tone, lights-up, corners). Copy: the client's
   (as in Services.tsx); the included services per service are ours, drafted to fit (to confirm). */

const SERVICES = [
  {
    title: 'Founder & CEO Brand',
    text: 'Grow the CEO/Founder and company’s account to 100K followers on Twitter and LinkedIn to raise >$2B USD, drive $4M+ in pipeline, hire better talent globally.',
    included: ['Positioning & narrative', 'Ghostwriting', 'Content calendar', 'Founder video', 'Audience growth', 'Investor & talent signal', 'Analytics & iteration'],
  },
  {
    title: '10M views global product launches',
    text: 'Engineer product/service launches for companies in a way that reaches 10M people and generates 1000+ SQOs',
    included: ['Launch strategy', 'Narrative & messaging', 'Creator seeding', 'Asset production', 'Launch-day war room', 'Distribution & amplification', 'Pipeline attribution'],
  },
  {
    title: 'Company Social and Creative Transformation',
    text: 'End-to-end transformation of a company’s recruiting, customer, and enterprise brand, delivered as pure consulting or consulting plus execution. This includes a 100M views/month engine, built by mobilising the company’s employees into creators.',
    included: ['Brand audit', 'Employee creator program', 'Recruiting brand', 'Customer & enterprise brand', 'Content engine', 'Playbooks & training', 'Consulting or execution'],
  },
];

export default function ServicesFocus() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [on, setOn] = useState(false);

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

  const s = SERVICES[active];
  return (
    <section
      ref={sectionRef}
      className="sv svf"
      data-tone="light"
      data-lights-up
      data-foot="/Forward-Deployed"
      data-foot-group="/Our Services"
      data-on={on || undefined}
      aria-labelledby="svf-title"
    >
      <div className="sv-pin">
        <div className="frame sv-frame">
          <div className="sv-inner svf-col">
            <h2 id="svf-title" className="svf-label">Our forward-deployed services</h2>

            <ul className="svf-list" role="tablist" aria-label="Services">
              {SERVICES.map((x, i) => (
                <li key={x.title}>
                  <button
                    type="button"
                    role="tab"
                    id={`svf-tab-${i}`}
                    aria-selected={i === active}
                    aria-controls="svf-panel"
                    onClick={() => setActive(i)}
                    onFocus={() => setActive(i)}
                  >
                    {x.title}
                  </button>
                </li>
              ))}
            </ul>

            <div id="svf-panel" role="tabpanel" aria-labelledby={`svf-tab-${active}`} className="svf-panel">
              <p key={`lead-${active}`} className="svf-lead">{s.text}</p>

              <h3 className="svf-label svf-ink">Services</h3>
              <ul key={`tags-${active}`} className="svf-tags">
                {s.included.map((t) => <li key={t}>{t}</li>)}
              </ul>

              <div className="svf-media" aria-hidden="true" />
            </div>

            <a className="svf-cta" href="#">[Work with us]</a>
          </div>
        </div>
      </div>
    </section>
  );
}
