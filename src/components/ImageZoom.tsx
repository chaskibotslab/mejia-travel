'use client';
import { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export default function ImageZoom({ src, alt, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastTouch = useRef({ x: 0, y: 0 });
  const lastDist = useRef(0);

  const handleOpen = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      dragging.current = true;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.touches.length === 2) {
      lastDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 1 && dragging.current && scale > 1) {
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastDist.current > 0) {
        const newScale = Math.min(5, Math.max(1, scale * (dist / lastDist.current)));
        setScale(newScale);
        if (newScale <= 1) setPos({ x: 0, y: 0 });
      }
      lastDist.current = dist;
    }
  }

  function onTouchEnd() {
    dragging.current = false;
    lastDist.current = 0;
  }

  function onDoubleTap() {
    if (scale > 1) {
      setScale(1);
      setPos({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-zoom-in`}
        onClick={handleOpen}
      />

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={handleClose}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur grid place-items-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              transition: dragging.current ? 'none' : 'transform 0.2s ease',
            }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={onDoubleTap}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            draggable={false}
          />
        </div>
      )}
    </>
  );
}
