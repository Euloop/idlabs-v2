import type { PaperText } from './paperText';
import './paperPage.css';

/* The Research scene's "Paper" cover: the paper's real first page (title, authors, abstract,
   keywords, two-column body with a drop cap, page number), dressed as a printed cover: a
   working-paper masthead, an arXiv-style id down the left margin, a staple, one of its figures set
   into the right column and a couple of pages stacked beneath (`stack`), or eight punched holes
   down the left edge (`holes`, /home-2, over the site's own back page). Laid out on US Letter
   (816 × 1056 units of --u, paperPage.css). */

export const PAGE_W = 816;
export const PAGE_H = 1056;

type Props = { paper: PaperText; fig: string; stack?: boolean; holes?: boolean };

export default function PaperPage({ paper, fig, stack = true, holes = false }: Props) {
  const [first, ...rest] = paper.body;
  return (
    <>
      {stack && <span className="pg-under pg-under-2" aria-hidden="true" />}
      {stack && <span className="pg-under" aria-hidden="true" />}
      {holes && <span className="pg-holes" aria-hidden="true" />}
      <span className="pg" data-holes={holes || undefined} aria-hidden="true">
        <span className="pg-staple" />
        <span className="pg-id">IL-2026.{paper.no} [cs.SI] · Identity Labs Research</span>

        <span className="pg-mast">
          <span>Identity Labs Research</span>
          <span>Working Paper No. {paper.no}</span>
          <span>2026</span>
        </span>

        <span className="pg-title">{paper.title}</span>
        <span className="pg-authors">Ruchir Jajoo<sup>1</sup> and Husain</span>
        <span className="pg-affil">
          Ruchir Jajoo, Founder, Identity Labs, India<br />
          Husain, Technical Lead, Identity Labs, India; IIT Delhi<br />
          <sup>1</sup>Corresponding author: ruchir@identity-labs.com
        </span>

        <span className="pg-abstract">{paper.abstract}</span>
        <span className="pg-keys">{paper.keywords.join(' | ')}</span>

        <span className="pg-body">
          <span className="pg-p pg-first"><span className="pg-drop">{first[0]}</span>{first.slice(1)}</span>
          {rest.map((p) => <span key={p.slice(0, 24)} className="pg-p">{p}</span>)}
          <span className="pg-fig">
            <img src={fig} alt="" draggable={false} />
          </span>
        </span>

        <span className="pg-num">1</span>
      </span>
    </>
  );
}
