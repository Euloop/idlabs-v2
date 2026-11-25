import { PICTURED, RATIO_OF, slug, type Launch } from '../flow/LaunchesCloud';

/* /home-3 content. Copy is the live site's (Hero, Section 2, Research, Tools, Services, Launches);
   only the short connective lines between scenes are new. */

const HD = new Set([
  'airwallex-growth-story', 'akai', 'cartesia-fundraise-model-launch', 'deel-growth-story', 'fish-audio-seed-raise',
  'gamma-100m-arr-announcement', 'lovable-fundraise', 'matic-robots-design-documentary', 'matic-robots-launch',
  'playerzero', 'pocket-fm-product-launch', 'polyai-product-demo', 'wispr-flow-feature-release',
]);

export type Shot = Launch & { file: string; src: string; hd: string; ratio: number; href: string; title: string; meta: string };

export const SHOTS: Shot[] = PICTURED.map((l) => {
  const file = slug(l);
  return {
    ...l,
    file,
    src: `/assets/launches/${file}.webp`,
    hd: HD.has(file) ? `/assets/launches/hd/${file}.webp` : `/assets/launches/${file}.webp`,
    ratio: RATIO_OF(l),
    href: l.x ?? l.li ?? '#',
    title: l.client,
    meta: [l.what, l.reach && `${l.reach} views`].filter(Boolean).join(' · '),
  };
});
export const shot = (file: string) => SHOTS.find((s) => s.file === file) ?? SHOTS[0];

export const CHAPTERS = [
  { id: 'im-top', label: 'Identity Labs' },
  { id: 'im-pipeline', label: 'The pipeline' },
  { id: 'im-research', label: 'Research' },
  { id: 'im-tools', label: 'Software' },
  { id: 'im-services', label: 'Services' },
  { id: 'im-launches', label: 'Launches' },
  { id: 'im-contact', label: 'Contact' },
];

export const CLIENTS = ['Cursor', 'OpenAI', 'Airwallex', 'Gamma', 'Deel', 'Lovable'];

export const RESEARCH_LEAD =
  'Our research lab backpropagates 500M posts/week to analyse how the algorithm treats each post as it goes through the sourcing and ranking stages. The dominant patterns that emerge fine-tune how we game ‘sourcing’ and ensure every post or launch we do goes consistently viral.';

export const PAPERS = [
  {
    title: 'How the X Algorithm Works: Candidate Sourcing, Ranking, & the Determinants of Reach.',
    short: 'How the X Algorithm Works',
    href: 'https://assets.ctfassets.net/xsgwjwcuxltx/2D7hwss9WnXBNLD3T8e7mK/8a276a95b9f7b0f2f1c0d1d6b14b450e/How_the_X_Algorithm_Works_2026.pdf',
    figs: ['/assets/research/front-fig-1.webp', '/assets/research/front-fig-2.webp', '/assets/research/front-fig-3.webp'],
  },
  {
    title: 'How the LinkedIn Algorithm Works: Two-Pass Retrieval, Multi-Objective Ranking, and the Determinants of Reach.',
    short: 'How the LinkedIn Algorithm Works',
    href: 'https://assets.ctfassets.net/xsgwjwcuxltx/7ydGxl5W28i2QZued6Z4N7/3ef2f08644ca45b23820e3b6aa6bc9ca/How_the_LinkedIn_Algorithm_Works_2026.pdf',
    figs: ['/assets/research/linkedin-fig-1.webp', '/assets/research/linkedin-fig-2.webp', '/assets/research/linkedin-fig-3.webp'],
  },
];
export const AUTHORS = 'Jajoo R, Husain (2026)';
export const LAB = 'Identity Labs Research';

export const TOOLS_LEAD =
  'We turned this research into software, built on 2B+ data points, that weights every engagement by the engager’s influence, measures engagement velocity in real time, and maps how deep a post penetrates each niche, to forecast its reach and shelf-life within the first 30 minutes.';

export const TOOLS = [
  {
    name: 'Engagement Classifier',
    href: 'https://graphs-seven-pi.vercel.app/tools/classifier',
    img: '/assets/tools/classifier-4.webp', w: 818, h: 649,
    tint: '#dcefed',
    lead: 'A post is only fast or slow compared to itself.',
    text: 'The classifier takes a post’s engagement rate in its first 15 minutes as a baseline and measures its performance after against it. This lets us predict how far a post will go within 30 minutes.',
  },
  {
    name: 'Weighted Engagement Scoring',
    href: 'https://graphs-seven-pi.vercel.app/tools/scoring',
    img: '/assets/tools/weighted-score.webp', w: 920, h: 307,
    tint: '#e6e0d8',
    lead: 'A 100 likes from a 100 strangers is not the same as 1 quote from someone important.',
    text: 'Weighted Engagement scores each interaction by who performed it -their influence, their cluster, the kind of action.',
  },
  {
    name: 'Post Velocity',
    href: 'https://graphs-seven-pi.vercel.app/tools/velocity',
    img: '/assets/tools/velocity-5.webp', w: 1120, h: 452,
    tint: '#dbe1ea',
    lead: 'Tracks how fast engagement is accelerating in real time.',
    text: 'A steep curve in the first 6 hours is the strongest predictor of a breakout. Combined with the Classifier, it tells us how a launch/post will perform within its first 30 minutes.',
  },
  {
    name: 'Cluster Penetration',
    href: 'https://graphs-seven-pi.vercel.app/tools/clusters',
    img: '/assets/tools/cluster-3.webp', w: 1120, h: 520,
    tint: '#e7e3ee',
    lead: 'Measures how deep a post travelled within a niche.',
    text: 'When a post goes out, we can see which clusters it reached and how much of each it covered.',
  },
];

export const SERVICES = [
  {
    title: 'Founder & CEO Brand',
    text: 'Grow the CEO/Founder and company’s account to 100K followers on Twitter and LinkedIn to raise >$2B USD, drive $4M+ in pipeline, hire better talent globally.',
    included: ['Positioning & narrative', 'Ghostwriting', 'Content calendar', 'Founder video', 'Audience growth', 'Investor & talent signal'],
    shots: ['gamma-100m-arr-announcement', 'wispr-flow-feature-release', 'pocket-fm-product-launch'],
  },
  {
    title: '10M views global product launches',
    text: 'Engineer product/service launches for companies in a way that reaches 10M people and generates 1000+ SQOs',
    included: ['Launch strategy', 'Narrative & messaging', 'Creator seeding', 'Asset production', 'Launch-day war room', 'Pipeline attribution'],
    shots: ['matic-robots-launch', 'fish-audio-seed-raise', 'polyai-product-demo'],
  },
  {
    title: 'Company Social and Creative Transformation',
    text: 'End-to-end transformation of a company’s recruiting, customer, and enterprise brand, delivered as pure consulting or consulting plus execution. This includes a 100M views/month engine, built by mobilising the company’s employees into creators.',
    included: ['Brand audit', 'Employee creator program', 'Recruiting brand', 'Content engine', 'Playbooks & training', 'Consulting or execution'],
    shots: ['deel-growth-story', 'airwallex-growth-story', 'lovable-fundraise'],
  },
];
