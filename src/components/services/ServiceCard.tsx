import { Link } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, Tag } from 'lucide-react';
import { VerificationBadge } from '@/components/common/Badge';
import { formatDate } from '@/utils/cn';
import type { Service } from '@/types/domain';

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-ink-900/[0.07] bg-paper p-4 shadow-1 shadow-bevel transition-[transform,box-shadow,border-color] duration-300 ease-out-soft hover:-translate-y-[3px] hover:border-brand-900/15 hover:shadow-3 focus-within:-translate-y-[3px] focus-within:shadow-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50/80 px-1.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wide text-brand-800 ring-1 ring-brand-100">
          <Tag className="size-3" aria-hidden="true" />
          {service.category.replace('_', ' ')}
        </span>
        <VerificationBadge status={service.verification} />
      </div>

      <h3 className="text-base font-semibold leading-snug text-ink-900">
        <Link
          to={`/services/${service.slug}`}
          className="hover:text-brand-800 hover:underline underline-offset-2 after:absolute after:inset-0 focus-visible:outline-none"
        >
          {service.name}
        </Link>
      </h3>

      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-600">{service.shortDescription}</p>

      <dl className="mt-3 space-y-1 text-xs text-ink-500">
        <div className="flex items-center gap-1.5">
          <Building2 className="size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
          <dt className="sr-only">Department</dt>
          <dd className="truncate">{service.department}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
          <dt className="sr-only">Jurisdiction</dt>
          <dd className="truncate">
            {service.jurisdiction}
            {service.district && service.district !== 'All districts' ? ` · ${service.district}` : ''}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-100 pt-3 text-xs">
        <span className="text-ink-500">
          {service.lastVerifiedAt ? `Checked ${formatDate(service.lastVerifiedAt)}` : 'No check recorded'}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-brand-800 group-hover:underline">
          View details
          <ArrowRight className="size-3 dir-arrow transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
