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
    title: 'Founder & CEO Brand', short: 'Founder & CEO Brand',
    text: 'Grow the CEO/Founder and company’s account to 100K followers on Twitter and LinkedIn to raise >$2B USD, drive $4M+ in pipeline, hire better talent globally.',
    included: ['Positioning & narrative', 'Ghostwriting', 'Content calendar', 'Founder video', 'Audience growth', 'Investor & talent signal', 'Analytics & iteration'],
  },
  {
    title: '10M views global product launches', short: 'Product launches',
    text: 'Engineer product/service launches for companies in a way that reaches 10M people and generates 1000+ SQOs',
    included: ['Launch strategy', 'Narrative & messaging', 'Creator seeding', 'Asset production', 'Launch-day war room', 'Distribution & amplification', 'Pipeline attribution'],
  },
  {
    title: 'Company Social and Creative Transformation', short: 'Creative transformation',
    text: 'End-to-end transformation of a company’s recruiting, customer, and enterprise brand, delivered as pure consulting or consulting plus execution. This includes a 100M views/month engine, built by mobilising the company’s employees into creators.',
    included: ['Brand audit', 'Employee creator program', 'Recruiting brand', 'Customer & enterprise brand', 'Content engine', 'Playbooks & training', 'Consulting or execution'],
  },
];

/* How a service is picked (all with the same panel below):
     radio    the list with radio buttons (the first version)
     cycle    the list; the selected one has a line that fills over CYCLE_MS, then the next one
              is selected on its own; clicking jumps there. Paused while the pointer or focus is
              in the section, and while it is off screen; no auto-advance with reduced motion
     echo     the radio list, and the selection echoed above its statement (01 / 03 — Title)
     numbers  no list: a boxed 1 · 2 · 3 tab control (as the bottom tabs), the selected
              service's name on its own line under it
     names    as numbers, with short service names in the tabs (the full name under them) */
export type Pick = 'radio' | 'cycle' | 'echo' | 'numbers' | 'names';
const CYCLE_MS = 7000;

export default function ServicesFocus({ light = true, pick = 'radio' }: { light?: boolean; pick?: Pick }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [on, setOn] = useState(false);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduce, setReduce] = useState(false);
  useEffect(() => { setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  // Cycle: the selected service's bar fills over CYCLE_MS; when it has filled, the next service is
  // selected (the bar drives it, so a pause — hover, focus, off screen — holds both together).
  const cycling = pick === 'cycle' && inView && !paused && !reduce;
  const next = () => setActive((a) => (a + 1) % SERVICES.length);

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
      data-pick={pick}
      data-tone={light ? 'light' : 'dark'}
      data-lights-up={light || undefined}
      data-foot="/Forward-Deployed"
      data-foot-group="/Our Services"
      data-on={on || undefined}
      aria-labelledby="svf-title"
    >
      <div className="sv-pin">
        <div className="frame sv-frame">
          <div className="sv-inner svf-col">
            <h2 id="svf-title" className="svf-label">Our forward-deployed services</h2>

            {pick === 'numbers' || pick === 'names' ? (
              <>
                <div className="svf-nums" role="tablist" aria-label="Services" data-names={pick === 'names' || undefined}>
                  {SERVICES.map((x, i) => (
                    <span key={x.title} className="svf-nums-item">
                      {i > 0 && <span className="svf-nums-sep" aria-hidden="true">·</span>}
                      <button type="button" role="tab" id={`svf-tab-${i}`} aria-selected={i === active} aria-controls="svf-panel"
                        aria-label={x.title} onClick={() => setActive(i)}>{pick === 'names' ? x.short : i + 1}</button>
                    </span>
                  ))}
                </div>
                <p key={`name-${active}`} className="svf-name">{s.title}</p>
              </>
            ) : (
              <ul className="svf-list" role="tablist" aria-label="Services" data-pick={pick}
                onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
                {SERVICES.map((x, i) => (
                  <li key={x.title}>
                    <button
                      type="button"
                      role="tab"
                      id={`svf-tab-${i}`}
                      aria-selected={i === active}
                      aria-controls="svf-panel"
                      onClick={() => setActive(i)}
                      onFocus={() => { setActive(i); setPaused(true); }}
                      onBlur={() => setPaused(false)}
                    >
                      {x.title}
                      {pick === 'cycle' && i === active && (
                        <span key={`bar-${active}`} className="svf-bar" aria-hidden="true" data-run={!reduce || undefined} data-paused={!cycling || undefined}
                          style={{ animationDuration: `${CYCLE_MS}ms` }} onAnimationEnd={next} />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div id="svf-panel" role="tabpanel" aria-labelledby={`svf-tab-${active}`} className="svf-panel"
              onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
              {pick === 'echo' && (
                <p key={`echo-${active}`} className="svf-echo">
                  <span>{String(active + 1).padStart(2, '0')} / {String(SERVICES.length).padStart(2, '0')}</span>
                  <span aria-hidden="true">—</span>
                  <span>{s.title}</span>
                </p>
              )}
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
