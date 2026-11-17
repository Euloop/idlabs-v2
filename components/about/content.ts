/* /about (2026-11-17): the copy, word for word as the team sent it to corroborate the founders' public
   details, and the schema.org graph to go with it (one JSON-LD script). Change both together. */

import { ORGANIZATION, SOCIAL_CAPITAL } from '../seo';

export const ABOUT_INTRO = 'San Francisco · London · Bangalore';

// the page's copy (2026-11-17, from the team; Shimona to validate), word for word
export const ABOUT_PARAS = [
  "Identity Labs was founded in March 2022 and is led by co-founders Ruchir Jajoo and Vedika Bhaia. The firm is built on a simple conviction: organic distribution can be engineered, measured and predicted like any other growth channel. Every year, companies spend more on paid channels to reach fewer people. Identity Labs is a growth consulting firm that helps the world's largest technology companies build a more durable alternative, through algorithm research, predictive analytics and creative teams embedded inside their organizations.",
  "Our work starts with research. We have studied more than a trillion weighted views to understand how platforms rank content. Our analytics platform, built on over two billion data points, can tell within 30 minutes whether a post is on track to pass a million views. We published our first findings in 2026 in \"How the X Algorithm Works,\" and we bring that research to every engagement, from founder brands to global product launches. Our launch clients include Deel, Lovable, Gamma, Wispr Flow, Matic Robots, Cartesia and a range of a16z portfolio companies, together valued at more than $35B. That demand has grown our revenue 7x to $20M ARR.",
  "In October 2026, Identity Labs merged with Social Capital Inc., the launch firm Ruchir and Vedika founded in July 2023, bringing research and execution into one practice. We work from San Francisco, London and Bangalore.",
];

// the founders, each name linked to their own site (in the copy's first mention too); roles as the JSON-LD
export const FOUNDERS = [
  { name: 'Ruchir Jajoo', role: 'Co-founder', url: 'https://ruchirjajoo.com' },
  { name: 'Vedika Bhaia', role: 'Co-founder', url: 'https://vedikabhaia.com' },
];

export const ABOUT_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    ORGANIZATION,
    SOCIAL_CAPITAL,
    {
      '@type': 'Person',
      '@id': 'https://ruchirjajoo.com/#person',
      name: 'Ruchir Jajoo',
      jobTitle: 'Co-founder',
      url: 'https://ruchirjajoo.com',
      worksFor: { '@id': 'https://identitylabs.com/#organization' },
      sameAs: ['https://www.wikidata.org/wiki/Q142089196', 'https://www.linkedin.com/in/ruchirjajoo', 'https://x.com/ruchirjajoo'],
    },
    {
      '@type': 'Person',
      '@id': 'https://vedikabhaia.com/#person',
      name: 'Vedika Bhaia',
      jobTitle: 'Co-founder',
      url: 'https://vedikabhaia.com',
      worksFor: { '@id': 'https://identitylabs.com/#organization' },
      identifier: '/g/11q2xmcrgh',
      sameAs: [
        'https://www.wikidata.org/wiki/Q142031635',
        'https://www.google.com/search?kgmid=/g/11q2xmcrgh',
        'https://www.linkedin.com/in/vedikabhaia',
        'https://x.com/vedikabhaia',
        'https://www.instagram.com/vedikabhaia',
      ],
    },
    {
      '@type': 'AboutPage',
      '@id': 'https://identitylabs.com/about#webpage',
      url: 'https://identitylabs.com/about',
      name: 'About | Identity Labs',
      about: { '@id': 'https://identitylabs.com/#organization' },
      mainEntity: { '@id': 'https://identitylabs.com/#organization' },
    },
  ],
};
