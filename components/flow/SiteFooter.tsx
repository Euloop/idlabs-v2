'use client';

import { useEffect, useRef } from 'react';
import Bookshelf, { type ShelfPalette } from './Bookshelf';
import OptionTabs, { useOption } from './OptionTabs';
import FooterGolden, { type GoldenVariant } from './FooterGolden';
import FooterFib from './FooterFib';
import './footer.css';

/* /home-2 footer: always dark — its own dark ground and grain, whatever the page theme; it does
   not switch the page theme, it just scrolls up like any section. The site's links in six columns, the reading list on a shelf, and a closing bar (status,
   offices, socials). In the frame between the rules, 12px mono caps like the rest of the chrome.
   While it is on screen the fixed chrome's footer labels step aside (html[data-footer]); once it
   has scrolled up under the fixed header, the header turns light over it (html[data-over-footer]). */

const COLUMNS: { title: string; links: string[] }[] = [
  { title: 'Platform', links: ['Identity Radar', 'Audience Intelligence', 'Research Suite', 'Analytics Dashboard'] },
  { title: 'Products', links: ['X Algorithm Tracker', 'LinkedIn Algo Insights', 'Leading Indicators', 'Followers Attribution'] },
  { title: 'Guides', links: ['Platform Guides', 'Audience Intelligence Guide', 'Research Playbooks', 'Algorithm Deep Dives'] },
  { title: 'Solutions', links: ['Enterprise', 'PR & Brand Teams', 'Social Media Teams', 'Affiliate Marketers'] },
  { title: 'Who it’s for', links: ['Marketers', 'Press & Media', 'Legal Teams', 'Founders'] },
  { title: 'Company', links: ['About', 'Research Papers', 'Careers', 'Press Kit'] },
];

// Reading-list colours: the books' own, or bound in Identity Labs' palette (?books=)
const SHELVES: [ShelfPalette, string][] = [['classic', 'Classic'], ['il', 'IL colours']];
// tabs while the footer's top is in the upper half of the screen
const footerInView = (r: DOMRect, vh: number) => r.top <= vh * 0.5;
// /footer (`golden`): the golden-ratio variants in place of the reading list (FooterGolden.tsx), ?golden=;
// or `fib`, the whole footer as / has it (the Fibonacci layout, FooterFib.tsx), to compare against; or
// `fib-focus`, that footer with Focus's golden section in place of its empty top band
export type Middle = GoldenVariant | 'books' | 'fib' | 'fib-focus';
const MIDDLES: [Middle, string][] = [
  ['spiral', 'Spiral'], ['compound', 'Compound'], ['focus', 'Focus'], ['reel', 'Reel'], ['trace', 'Trace'], ['books', 'Reading list'],
  ['fib', 'Fibonacci (/)'], ['fib-focus', 'Fibonacci + Focus'],
];

// /home-4 (`fib`): the Fibonacci footer (Figma Zoomcast 200:4, FooterFib.tsx) or this one, ?footer=
export type Layout = 'fib' | 'classic';
const LAYOUTS: [Layout, string][] = [['fib', 'Fibonacci'], ['classic', 'Reading list']];

const OFFICES = ['San Francisco', 'New York', 'Remote'];
// Instagram and Substack hidden for now
const SOCIALS = [
  { label: 'X / Twitter', href: 'https://x.com/IdentityLabsInc' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/theidentitylabs' },
];

/** a rule across the frame, rule to rule, with the frame's squares where it meets them */
function Rule() {
  return (
    <div className="ft-rule" aria-hidden="true">
      <span className="tick tick-l" />
      <span className="tick tick-r" />
    </div>
  );
}

// `layout`: a fixed layout with no tabs (the live pages: / and /launches use 'fib')
// `start` (with `golden`): the variant the tabs open on (/footer: Spiral; /home-4: Fibonacci, as /)
export default function SiteFooter({ golden = false, fib = false, layout: fixed, start = 'spiral' }: { golden?: boolean; fib?: boolean; layout?: Layout; start?: Middle } = {}) {
  const ref = useRef<HTMLElement>(null);
  const [layoutPicked, pickLayout] = useOption<Layout>('footer', LAYOUTS, 'fib');
  const [shelf, pickShelf] = useOption<ShelfPalette>('books', SHELVES, 'classic');
  const [picked, pickMiddle] = useOption<Middle>('golden', MIDDLES, start);
  const middle: Middle = golden ? picked : 'books';
  // /footer's Fibonacci tab: the / footer's layout
  const layout: Layout = fixed ?? (golden && (picked === 'fib' || picked === 'fib-focus') ? 'fib' : fib ? layoutPicked : 'classic');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    // "on screen" = its top is above 85% of the screen
    const io = new IntersectionObserver(([e]) => root.toggleAttribute('data-footer', e.isIntersecting), { rootMargin: '0px 0px -15% 0px' });
    io.observe(el);
    // the fixed header (wordmark, nav) is over the footer once the footer's top passes the
    // middle of the wordmark's line
    let raf = 0;
    const measure = () => {
      raf = 0;
      const wm = document.querySelector('.chrome .wordmark')?.getBoundingClientRect();
      const line = wm ? wm.top + wm.height / 2 : 34;
      root.toggleAttribute('data-over-footer', el.getBoundingClientRect().top < line);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      io.disconnect(); cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll);
      root.removeAttribute('data-footer'); root.removeAttribute('data-over-footer');
    };
  }, []);

  return (
    <>
    <section ref={ref} className={layout === 'fib' ? 'ft ft-fib' : 'ft'} data-foot="/Footer" aria-label="Footer">
      <div className="ft-texture" aria-hidden="true" />
      <div className="frame ft-frame">
        {layout === 'fib' ? <FooterFib top={golden && picked === 'fib-focus' ? <FooterGolden variant="focus" interactive caption={false} /> : undefined} /> : <>
        {/* /footer (golden): the golden band above, the links under it; otherwise the links, then
            the reading list */}
        {middle !== 'books' && middle !== 'fib' && middle !== 'fib-focus' && <><FooterGolden variant={middle} /><Rule /></>}
        <nav className="ft-cols" aria-label="Site">
          {COLUMNS.map((c) => (
            <div className="ft-col" key={c.title}>
              <h3 className="ft-h">{c.title}</h3>
              <ul>
                {c.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </nav>

        {middle === 'books' && <>
        <Rule />
        <div className="ft-read">
          <div className="ft-read-head">
            <h3 className="ft-h">Reading list</h3>
            <p className="ft-read-sub">What our researchers keep on the desk</p>
          </div>
          <Bookshelf palette={shelf} />
        </div>
        </>}

        <div className="ft-bar">
          <span className="ft-status"><span className="ft-dot" aria-hidden="true" />All systems operational</span>
          <span className="ft-offices">{OFFICES.map((o) => <span key={o}>{o}</span>)}</span>
          <span className="ft-socials">{SOCIALS.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>)}</span>
          <span className="tick tick-l" aria-hidden="true" />
          <span className="tick tick-r" aria-hidden="true" />
        </div>
        </>}
      </div>
    </section>
    {(fixed === undefined || golden) && <OptionTabs
      groups={[
        ...(fib ? [{ label: 'Footer', options: LAYOUTS, value: layout, onChange: (v: string) => pickLayout(v as Layout) }] : []),
        ...(golden ? [{ label: 'Golden ratio', options: MIDDLES, value: middle, onChange: (v: string) => pickMiddle(v as Middle) }] : []),
        ...(middle === 'books' && layout === 'classic' ? [{ label: 'Reading list', options: SHELVES, value: shelf, onChange: (v: string) => pickShelf(v as ShelfPalette) }] : []),
      ]}
      selector="section.ft" label="Footer options" when={footerInView}
    />}
    </>
  );
}
