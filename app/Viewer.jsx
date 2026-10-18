'use client';

import { useEffect, useRef, useState } from 'react';

const SIZES = '(min-width: 1600px) 1600px, 100vw';

function srcSet(page, ext) {
  return page.widths.map((w) => `/pages/p${page.id}-${w}.${ext} ${w}w`).join(', ');
}

export default function Viewer({ pages }) {
  const dialogRef = useRef(null);
  const [active, setActive] = useState(null);
  const pageRefs = useRef([]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (dialogRef.current?.open) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      e.preventDefault();
      const els = pageRefs.current.filter(Boolean);
      let current = 0;
      els.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= 5) current = i;
      });

      let target = current;
      if (e.key === 'ArrowRight') {
        target = current + 1;
      } else if (els[current].getBoundingClientRect().top < -5) {
        target = current;
      } else {
        target = current - 1;
      }
      if (target < 0 || target >= els.length) return;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      els[target].scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function open(page) {
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    setActive(page);
    // The dialog is always mounted, so it can be shown right away.
    dialogRef.current?.showModal();
  }

  const largest = active ? active.widths[active.widths.length - 1] : null;

  return (
    <>
      <main className="doc">
        {pages.map((page, i) => {
          const fallback = page.widths.includes(1080) ? 1080 : page.widths[0];
          return (
            <button
              key={page.id}
              ref={(el) => (pageRefs.current[i] = el)}
              type="button"
              className="page"
              onClick={() => open(page)}
              aria-label={`Zoom ${page.alt}`}
            >
              <picture>
                <source type="image/avif" srcSet={srcSet(page, 'avif')} sizes={SIZES} />
                <source type="image/webp" srcSet={srcSet(page, 'webp')} sizes={SIZES} />
                <img
                  src={`/pages/p${page.id}-${fallback}.webp`}
                  width={page.width}
                  height={page.height}
                  alt={page.alt}
                  decoding="async"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : undefined}
                  style={{ backgroundImage: `url(${page.blur})` }}
                />
              </picture>
            </button>
          );
        })}
      </main>

      <dialog
        ref={dialogRef}
        className="zoom"
        onClose={() => setActive(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
        >
          ✕
        </button>
        {active && (
          <img
            src={`/pages/p${active.id}-${largest}.webp`}
            width={active.width}
            height={active.height}
            alt={active.alt}
          />
        )}
      </dialog>
    </>
  );
}
