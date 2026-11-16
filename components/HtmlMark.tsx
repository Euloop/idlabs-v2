'use client';

import { useEffect } from 'react';

/* A page marker on <html> (html[data-<name>]), set before first paint by its inline script and cleared when the
   page goes. The stylesheets key off these instead of body:has(...) (2026-11-16, lag): a :has() on body is
   rechecked over the whole page whenever anything is added anywhere in it — the diagram and the research
   rebuild parts of themselves many times a second, and every one restyled all ~3,000 elements. */
export default function HtmlMark({ name }: { name: string }) {
  useEffect(() => {
    const d = document.documentElement;
    d.setAttribute(`data-${name}`, '');
    return () => d.removeAttribute(`data-${name}`);
  }, [name]);
  return <script dangerouslySetInnerHTML={{ __html: `document.documentElement.setAttribute('data-${name}','')` }} />;
}
