'use client';
import Image from 'next/image';
import { useState } from 'react';
export function BookImage({
  src,
  title,
  fallbackSrc = '/images/book-fallback.svg',
}: {
  src: string;
  title: string;
  fallbackSrc?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const usingFallback = failedSrc === src;
  const current = usingFallback ? fallbackSrc : src;
  if (usingFallback && (fallbackFailed || fallbackSrc === src))
    return (
      <div className="image-fallback">
        {title}
        <small>Visuel indisponible</small>
      </div>
    );
  return (
    <>
      <Image
        src={current}
        alt={
          current.endsWith('.svg')
            ? `Couverture graphique provisoire — ${title}`
            : `Couverture de ${title} — édition à confirmer`
        }
        width={420}
        height={500}
        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 420px"
        onError={() => {
          if (usingFallback) setFallbackFailed(true);
          else setFailedSrc(src);
        }}
      />
      {usingFallback && <span className="sr-only">Illustration de remplacement</span>}
    </>
  );
}
