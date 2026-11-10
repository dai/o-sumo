import type { SyntheticEvent } from 'react';
import {
  responsiveRikishiImage,
  type RikishiImageSlot,
} from '../lib/rikishi-avatar';

interface RikishiPortraitProps {
  id: number | string;
  slot: RikishiImageSlot;
  className?: string;
  alt?: string;
  fallbackSrc?: string;
}

export default function RikishiPortrait({
  id,
  slot,
  className,
  alt = '',
  fallbackSrc,
}: RikishiPortraitProps) {
  const image = responsiveRikishiImage(id, slot);

  const onError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (!fallbackSrc) return;
    const target = event.currentTarget;
    if (target.currentSrc.startsWith('data:') || target.src.startsWith('data:')) return;
    const picture = target.parentElement;
    if (picture?.tagName === 'PICTURE') {
      picture.querySelectorAll('source').forEach((source) => source.remove());
    }
    target.src = fallbackSrc;
  };

  return (
    <picture>
      <source type="image/avif" srcSet={image.avifSrcSet} sizes={image.sizes} />
      <source type="image/webp" srcSet={image.webpSrcSet} sizes={image.sizes} />
      <img
        className={className}
        src={image.src}
        alt={alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        aria-hidden={alt === '' ? true : undefined}
        onError={fallbackSrc ? onError : undefined}
      />
    </picture>
  );
}
