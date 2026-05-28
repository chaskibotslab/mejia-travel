'use client';
import { useState } from 'react';

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
};

export default function SafeImage({ src, alt, className, fallback }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
