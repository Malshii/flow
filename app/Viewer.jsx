'use client';

import { useRef, useState } from 'react';

const SIZES = '(min-width: 1600px) 1600px, 100vw';

function srcSet(page, ext) {
  return page.widths.map((w) => `/pages/p${page.id}-${w}.${ext} ${w}w`).join(', ');
}

export default function Viewer({ pages }) {
  const dialogRef = useRef(null);
  const [active, setActive] = useState(null);

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
