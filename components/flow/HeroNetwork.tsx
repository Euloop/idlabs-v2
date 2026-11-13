import './hero-network.css';

/* /home-4: "Our Network" — a bordered card (corner ticks, like the frame's own markers) holding a
   5-column grid of name / affiliation pairs, under the hero's clients (both Zoom and Fade). Names
   and affiliations below are PLACEHOLDERS — the client has not yet confirmed a real, publishable
   list, so none of these should be mistaken for actual advisors. Swap PEOPLE for the confirmed
   list before this goes live. */

const PEOPLE: [string, string][] = [
  ['Theo Wren', 'Atlas Compute'], ['Priya Kanth', 'Vertex Labs'], ['Owen Castile', 'Flux Capital'], ['Lena Marchetti', 'OpenGrid'], ['Noah Albrecht', 'Cascade AI'],
  ['Sana Okafor', 'Drift Systems'], ['Marcus Yoon', 'Halcyon'], ['Ines Duarte', 'Founder, Quill'], ['Tobias Renner', 'Beacon Robotics'], ['Chidi Osei', 'Solstice Ventures'],
  ['Freya Lindqvist', 'Palisade'], ['Rhys Donahue', 'Granite Capital'], ['Amara Boateng', 'Lumen Health'], ['Victor Kessler', 'Meridian Fund'], ['Saoirse Flanagan', 'Nimbus Labs'],
  ['Devin Achebe', 'Pinecrest'], ['Yuki Tanaka', 'Arcadia Robotics'], ['Mira Kowalski', 'Overlook Ventures'], ['Elan Barak', 'Juniper Systems'], ['Nadia Volkov', 'Cobalt Research'],
  ['Kian Ashford', 'Corvid AI'], ['Petra Halvorsen', 'Tessera Capital'], ['Jamal Freeman', 'Stratus Networks'], ['Ingrid Sorensen', 'Anchorage Fund'], ['Ravi Malhotra', 'Outpost Robotics'],
  ['Elise Mercer', 'Founder, Driftwood'], ['Soren Vikander', 'Brightline'], ['Tasha Nwosu', 'Fathom Ventures'], ['Callum Reyes', 'Keystone Labs'], ['Mireille Faure', 'Anthem Capital'],
];

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  return <span className={`hn-tick hn-tick-${pos}`} aria-hidden="true" />;
}

export default function HeroNetwork() {
  return (
    <section className="hn" aria-label="Our network">
      <div className="frame hn-frame">
        <p className="hn-title">Our Network</p>
        <div className="hn-card">
          <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
          <ul className="hn-grid">
            {PEOPLE.map(([name, role]) => (
              <li className="hn-cell" key={name}>
                <p className="hn-name">{name}</p>
                <p className="hn-role">{role}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
