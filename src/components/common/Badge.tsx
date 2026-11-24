/**
 * Badges and status pills.
 * Status is always communicated with text (and an icon where useful), never by
 * colour alone — see the accessibility requirement in the specification.
 */
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Clock, FlaskConical, ShieldQuestion } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/utils/cn';
import type { ReviewStatus, VerificationStatus } from '@/types/domain';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  brand: 'bg-brand-50 text-brand-800 ring-brand-200',
  success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-900 ring-amber-200',
  danger: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
};

interface BadgeProps {
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Domain-specific status badges                                              */
/* -------------------------------------------------------------------------- */

const verificationMeta: Record<
  VerificationStatus,
  { label: string; tone: Tone; Icon: typeof CheckCircle2; title: string; key: 'verify.verified' | 'verify.pending' | 'verify.outdated' | 'verify.demo' }
> = {
  verified: {
    key: 'verify.verified',
    label: 'Verified',
    tone: 'success',
    Icon: CheckCircle2,
    title: 'A reviewer has checked this record against an official source.',
  },
  pending_verification: {
    key: 'verify.pending',
    label: 'Pending verification',
    tone: 'warning',
    Icon: Clock,
    title: 'This record has not yet been checked against an official source.',
  },
  outdated: {
    key: 'verify.outdated',
    label: 'Review overdue',
    tone: 'danger',
    Icon: AlertTriangle,
    title: 'The last check of this record is older than the review interval.',
  },
  demo: {
    key: 'verify.demo',
    label: 'Demo data',
    tone: 'info',
    Icon: FlaskConical,
    title: 'Demonstration data for interface development — not an official record.',
  },
};

export function VerificationBadge({
  status,
  className,
  showIcon = true,
}: {
  status: VerificationStatus;
  className?: string;
  showIcon?: boolean;
}) {
  const { t } = useLanguage();
  const meta = verificationMeta[status];
  return (
    <Badge tone={meta.tone} className={className} icon={showIcon ? <meta.Icon className="size-3" aria-hidden="true" /> : undefined}>
      <span title={meta.title}>{t(meta.key)}</span>
    </Badge>
  );
}

const reviewMeta: Record<ReviewStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  pending_review: { label: 'Pending review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'info' },
  published: { label: 'Published', tone: 'success' },
  archived: { label: 'Archived', tone: 'neutral' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export function ReviewStatusBadge({ status, className }: { status: ReviewStatus; className?: string }) {
  const meta = reviewMeta[status];
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
}

/** A "not verified" notice that cannot be mistaken for an official claim. */
export function UnverifiedNotice({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900',
        className,
      )}
      role="note"
    >
      <ShieldQuestion className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        {children ??
          'This record is demonstration data and has not been verified against an official source. Confirm requirements with the relevant office.'}
      </p>
    </div>
  );
}
