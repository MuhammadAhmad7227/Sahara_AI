/**
 * Reveal — scroll-triggered entrance for groups of content.
 *
 * Rules it enforces (from the design brief):
 *  - animate GROUPS, never every paragraph;
 *  - opacity + small translate only, no rotation or scale drama;
 *  - 600ms, once, then the observer disconnects;
 *  - if IntersectionObserver is unavailable, or motion is reduced, content is
 *    visible immediately rather than stuck at opacity 0.
 */
import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
}: {
  children: ReactNode;
  /** Stagger in ms. Keep groups to 0–180ms; long cascades feel like a slideshow. */
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      // Start slightly before the element enters, so it settles as you arrive.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-revealed={revealed ? 'true' : 'false'}
      style={{ ['--reveal-delay' as string]: `${delay}ms` }}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
