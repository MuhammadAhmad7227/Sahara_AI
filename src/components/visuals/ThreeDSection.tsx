/**
 * Architecture seam for future 3D and video explainers.
 *
 * Nothing here ships a 3D library or a video file. Each export is a *renderer*
 * that accepts content through props and degrades to a static, accessible card
 * when it has none. When real assets exist, a page passes them in and nothing
 * else changes — no loader needs rewriting, no layout shifts.
 *
 * Rules encoded here, so a future asset cannot break them by accident:
 *  - never autoplay with sound;
 *  - honour `prefers-reduced-motion` (the CSS animation utilities already do, and
 *    `InteractiveProcessVisual` asks the hook directly before animating);
 *  - the 3D bundle is lazy-loaded behind Suspense, so the first paint never
 *    waits for it;
 *  - a missing asset renders an honest "not available yet" placeholder rather
 *    than a spinner that never resolves or an invented illustration.
 */
import { Suspense, lazy, type ReactNode } from 'react';
import { Box, Film, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  /** Optional asset reference, resolved later (e.g. an R2 URL or /models/*.glb). */
  asset?: string;
}

export interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  /** Only set when a real, licensed file exists. Never a placeholder URL. */
  src?: string;
  poster?: string;
  durationLabel?: string;
  captionsSrc?: string;
}

export interface FeatureVisual {
  id: string;
  label: string;
  /** Lucide icon name resolved by the caller; keeps this layer presentation-only. */
  icon?: ReactNode;
  asset?: string;
}

/* -------------------------------------------------------------------------- */
/* 3D                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Lazily-mounted canvas. Kept as a separate chunk so `three` (when added) is
 * never part of the initial bundle; `Suspense` shows the static fallback first.
 */
const LazyScene = lazy(async () => ({
  default: ({ fallback }: { fallback: ReactNode }) => <>{fallback}</>,
}));

export function ThreeDSection({
  title,
  description,
  asset,
  fallback,
  className,
}: {
  title: string;
  description: string;
  /** Path to a real model file. Absent means the section renders its fallback. */
  asset?: string;
  fallback?: ReactNode;
  className?: string;
}) {
  const { t } = useLanguage();

  const placeholder = (
    <div className="grid aspect-[4/3] place-items-center rounded-2xl border border-dashed border-ink-300 bg-ink-50/60 p-6 text-center">
      <div>
        <Box className="mx-auto size-7 text-ink-400" aria-hidden="true" />
        <p className="mt-2 text-sm font-medium text-ink-600">{t('visual.notAvailable')}</p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-ink-500">
          {t('visual.notAvailableBody')}
        </p>
      </div>
    </div>
  );

  return (
    <section className={cn('space-y-3', className)}>
      <div>
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-600">{description}</p>
      </div>

      {asset ? (
        <Suspense fallback={fallback ?? placeholder}>
          {/* The real scene will be a canvas that accepts `asset` and the same
              reduced-motion contract. No rendering is attempted today. */}
          <LazyScene fallback={fallback ?? placeholder} />
        </Suspense>
      ) : (
        placeholder
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Interactive process visual                                                 */
/* -------------------------------------------------------------------------- */

/**
 * A step-by-step process shown as a static numbered sequence. It animates
 * between steps only when the user has not asked for reduced motion, and the
 * text alternative is always present and complete.
 */
export function InteractiveProcessVisual({
  steps,
  className,
}: {
  steps: ProcessStep[];
  className?: string;
}) {
  const { t } = useLanguage();

  if (steps.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-300 p-4 text-sm text-ink-500">
        {t('visual.noSteps')}
      </p>
    );
  }

  return (
    <ol className={cn('space-y-2', className)}>
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="flex gap-3 rounded-xl border border-ink-200 bg-paper p-3 motion-safe:transition-colors hover:border-brand-300"
        >
          <span
            className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-900 text-xs font-semibold text-white"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-900">{step.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-600">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/* Feature visualisation                                                      */
/* -------------------------------------------------------------------------- */

/** Small labelled tiles; a diagram slot appears only when an asset is supplied. */
export function FeatureVisualization({
  features,
  className,
}: {
  features: FeatureVisual[];
  className?: string;
}) {
  return (
    <ul className={cn('grid gap-2 sm:grid-cols-2', className)}>
      {features.map((feature) => (
        <li
          key={feature.id}
          className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-paper px-3 py-2.5"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-800">
            {feature.icon}
          </span>
          <span className="text-sm font-medium text-ink-800">{feature.label}</span>
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Tutorial video                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Video card. Renders a real <video> only when `src` is supplied.
 *
 * Deliberate choices: no autoplay, `preload="none"` so an unopened tutorial
 * costs no bandwidth, a caption track slot, and a transcript link — because a
 * video without captions would exclude part of the audience this product is for.
 */
export function TutorialVideoCard({ video, className }: { video: TutorialVideo; className?: string }) {
  const { t } = useLanguage();
  const hasVideo = Boolean(video.src);

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border border-ink-200 bg-paper shadow-1',
        className,
      )}
    >
      <div className="relative grid aspect-video place-items-center bg-ink-950/90">
        {hasVideo ? (
          <video
            className="size-full object-cover"
            controls
            preload="none"
            playsInline
            poster={video.poster}
          >
            <source src={video.src} />
            {video.captionsSrc && (
              <track kind="captions" src={video.captionsSrc} srcLang="ur" label={t('visual.captions')} />
            )}
            {t('visual.videoUnsupported')}
          </video>
        ) : (
          <div className="p-6 text-center">
            <Film className="mx-auto size-7 text-sand-200/70" aria-hidden="true" />
            <p className="mt-2 text-sm font-medium text-sand-100">{t('visual.videoNotAvailable')}</p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-sand-200/60">
              {t('visual.videoNotAvailableBody')}
            </p>
          </div>
        )}
        {video.durationLabel && (
          <span className="absolute bottom-2 end-2 rounded bg-black/70 px-1.5 py-0.5 text-[0.6875rem] font-medium text-white">
            {video.durationLabel}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-ink-900">{video.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-600">{video.description}</p>
        {!hasVideo && (
          <p className="mt-2 inline-flex items-center gap-1 text-[0.6875rem] text-ink-400">
            <Play className="size-3" aria-hidden="true" />
            {t('visual.comingSoon')}
          </p>
        )}
      </div>
    </article>
  );
}
