'use client';

import { useEffect, useState } from 'react';
import ToolsCollage from './ToolsCollage';
import ToolsSlider from './ToolsSlider';

/* The analytical tools: the Collage card above phone width, the slider on phones (≤559px). Both are in the
   first HTML (tools-slider.css shows the right one, so nothing flashes); once the width is known only that
   one stays mounted. The hidden Collage on phones still ran its scroll-driven arrival on every scroll (and
   its research and intro handles), which doubled the frame time of Section 2 on phones (2026-11-23). */
export default function ToolsByWidth() {
  const [phone, setPhone] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 559px)');
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return (
    <>
      {phone !== true && <ToolsCollage theme="white" motion scroll research="auto" intro="small" />}
      {phone !== false && <ToolsSlider />}
    </>
  );
}
