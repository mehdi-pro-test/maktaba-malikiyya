'use client';
import Image from 'next/image';
import { useState } from 'react';
export function BookImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="image-fallback">
      {title}
      <small>Visuel indisponible</small>
    </div>
  ) : (
    <Image
      src={src}
      alt={`Couverture graphique provisoire — ${title}`}
      width={420}
      height={500}
      onError={() => setFailed(true)}
    />
  );
}
