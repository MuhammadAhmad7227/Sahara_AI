import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building2,
  Clock3,
  Gauge,
  MapPin,
  MessagesSquare,
  PenLine,
  Wallet,
} from 'lucide-react';
import { Button, LinkButton } from '@/components/common/Button';
import { Badge, UnverifiedNotice, VerificationBadge } from '@/components/common/Badge';
import { Breadcrumbs } from '@/components/common/Feedback';
import { EmptyState, ErrorState, InlineNotice, Skeleton } from '@/components/common/States';
import { ProcedureStep } from '@/components/services/ProcedureStep';
import { RequirementItem } from '@/components/services/RequirementItem';
import { SourceList } from '@/components/services/SourceCard';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useSavedServices } from '@/hooks/useSavedServices';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getRelatedServices, getServiceBySlug } from '@/services/api/services';
import { errorMessage } from '@/services/api/errors';
import { formatDate } from '@/utils/cn';
import { useToast } from '@/components/common/Feedback';

export default function ServiceDetailPage() {
  const { slug = '' } = useParams();
  const { data: service, loading, error, reload } = useAsync(() => getServiceBySlug(slug), [slug]);
  const { isSaved, toggle } = useSavedServices();
  const { record } = useRecentlyViewed();
  const { toast } = useToast();

  useDocumentTitle(
    service ? `${service.name} — requirements and procedure` : 'Service details',
    service?.shortDescription,
  );

  useEffect(() => {
    if (service) record(service);
  }, [service, record]);

  const related = useAsync(
    () => (service ? getRelatedServices(service, 3) : Promise.resolve([])),
    [service?.id],
    { immediate: Boolean(service) },
  );

  const saved = service ? isSaved(service.slug) : false;

  const feeBlock = useMemo(() => {
    if (!service) return null;
    if (service.fee.amount === null) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
          <p className="flex items-center gap-1.5 font-medium">
            <Wallet className="size-4" aria-hidden="true" /> Fee information not currently verified
          </p>
          <p className="mt-1 leading-relaxed">
            {service.fee.note ?? 'No verified fee has been recorded for this service.'} Please confirm the fee
            with the official office before travelling.
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-ink-200 bg-ink-50 p-3.5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Verified fee</p>
        <p className="mt-0.5 text-lg font-semibold text-ink-900 tabular">
          PKR {service.fee.amount.toLocaleString('en-PK')}
        </p>
        {service.fee.note && <p className="mt-1 text-xs text-ink-600">{service.fee.note}</p>}
      </div>
    );
  }, [service]);

  if (loading) {
    return (
      <div className="container-page py-8">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="mt-4 h-8 w-2/3 max-w-md" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-10">
        {error.status === 404 ? (
          <EmptyState
            title="Service not found"
            description="The service you are looking for is not in the catalogue. It may have been removed, or the link may be incorrect."
            action={<LinkButton to="/services">Browse all services</LinkButton>}
          />
        ) : (
          <ErrorState title="Unable to load this service" message={errorMessage(error)} onRetry={reload} />
        )}
      </div>
    );
  }

  if (!service) return null;

  const primarySource = service.sources[0];

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: service.name },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:gap-8">
        <div className="min-w-0 space-y-5">
          {/* Overview */}
          <header className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{service.category.replace('_', ' ')}</Badge>
              <VerificationBadge status={service.verification} />
              {service.status === 'pending_review' && <Badge tone="warning">Awaiting reviewer</Badge>}
            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink-950 sm:text-[1.75rem]">
              {service.name}
            </h1>
            {service.nameUr && (
              <p className="mt-1 font-urdu text-lg leading-loose text-ink-700" lang="ur" dir="rtl">
                {service.nameUr}
              </p>
            )}

            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-700">{service.description}</p>

            <dl className="mt-4 grid gap-3 border-t border-ink-100 pt-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-500">
                  <Building2 className="size-3.5" aria-hidden="true" /> Department
                </dt>
                <dd className="mt-0.5 font-medium text-ink-900">{service.department}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-500">
                  <MapPin className="size-3.5" aria-hidden="true" /> Jurisdiction
                </dt>
                <dd className="mt-0.5 font-medium text-ink-900">
                  {service.jurisdiction}
                  {service.district ? ` · ${service.district}` : ''}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs text-ink-500">
                  <Clock3 className="size-3.5" aria-hidden="true" /> Last checked
                </dt>
                <dd className="mt-0.5 font-medium text-ink-900">
                  {service.lastVerifiedAt ? formatDate(service.lastVerifiedAt) : 'Not recorded'}
                </dd>
              </div>
            </dl>
          </header>

          {(service.verification === 'demo' || service.verification === 'pending_verification') && (
            <UnverifiedNotice>
              This record is demonstration data and has not been verified against an official source.
              Requirements, fees and steps must be confirmed with {service.department} before you rely on them.
            </UnverifiedNotice>
          )}

          {/* Requirements */}
          <section aria-labelledby="requirements" className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="requirements" className="text-base font-semibold text-ink-900">
                Required documents
              </h2>
              <Badge tone="neutral">
                {service.requirements.filter((r) => r.mandatory).length} required ·{' '}
                {service.requirements.filter((r) => !r.mandatory).length} optional
              </Badge>
            </div>
            <ul className="mt-1 divide-y divide-ink-100">
              {[...service.requirements]
                .sort((a, b) => a.position - b.position)
                .map((req) => (
                  <RequirementItem key={req.id} requirement={req} />
                ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
              <LinkButton
                to={`/readiness?service=${service.slug}`}
                variant="subtle"
                size="sm"
                leadingIcon={<Gauge className="size-4" aria-hidden="true" />}
              >
                Check my documents
              </LinkButton>
              <LinkButton
                to={`/assistant?q=${encodeURIComponent(`What documents are required for ${service.name}?`)}`}
                variant="ghost"
                size="sm"
                leadingIcon={<MessagesSquare className="size-4" aria-hidden="true" />}
              >
                Ask about this service
              </LinkButton>
            </div>
          </section>

          {/* Procedure */}
          <section aria-labelledby="procedure" className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <h2 id="procedure" className="text-base font-semibold text-ink-900">
              Procedure
            </h2>
            <p className="mt-0.5 text-sm text-ink-500">
              The steps as recorded for this service. Your district office may follow a different order.
            </p>
            <ol className="mt-4">
              {service.procedure.map((step, index) => (
                <ProcedureStep key={step.id} step={step} isLast={index === service.procedure.length - 1} />
              ))}
            </ol>
          </section>

          {/* Fee */}
          <section aria-labelledby="fee" className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <h2 id="fee" className="mb-2 text-base font-semibold text-ink-900">
              Fee
            </h2>
            {feeBlock}
            {service.processingTime && (
              <p className="mt-2 text-sm text-ink-600">
                <span className="font-medium text-ink-800">Processing time as recorded: </span>
                {service.processingTime}
              </p>
            )}
          </section>

          {/* Sources */}
          <section aria-labelledby="sources" className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
            <h2 id="sources" className="text-base font-semibold text-ink-900">
              Official source
            </h2>
            <p className="mt-0.5 text-sm text-ink-500">
              Every published record must carry the publisher, the source title and the date it was checked.
            </p>
            <div className="mt-3">
              <SourceList sources={service.sources} />
            </div>
          </section>

          {/* Related */}
          {related.data && related.data.length > 0 && (
            <section aria-labelledby="related">
              <h2 id="related" className="mb-2 text-base font-semibold text-ink-900">
                Related services
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {related.data.map((item) => (
                  <ServiceCard key={item.id} service={item} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar actions */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
            <h2 className="text-sm font-semibold text-ink-900">What would you like to do?</h2>
            <div className="mt-3 space-y-2">
              <LinkButton
                to={`/assistant?q=${encodeURIComponent(`Explain the ${service.name} procedure in simple words.`)}`}
                fullWidth
                leadingIcon={<MessagesSquare className="size-4" aria-hidden="true" />}
              >
                Ask Sahara AI
              </LinkButton>
              <LinkButton
                to={`/applications?service=${service.slug}`}
                variant="outline"
                fullWidth
                leadingIcon={<PenLine className="size-4" aria-hidden="true" />}
              >
                Generate application
              </LinkButton>
              <LinkButton
                to={`/readiness?service=${service.slug}`}
                variant="outline"
                fullWidth
                leadingIcon={<Gauge className="size-4" aria-hidden="true" />}
              >
                Check readiness
              </LinkButton>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  const nowSaved = toggle({
                    id: service.id,
                    slug: service.slug,
                    name: service.name,
                    department: service.department,
                  });
                  toast(nowSaved ? 'Service saved to your dashboard.' : 'Service removed from saved.', 'success');
                }}
                leadingIcon={
                  saved ? (
                    <BookmarkCheck className="size-4 text-brand-800" aria-hidden="true" />
                  ) : (
                    <Bookmark className="size-4" aria-hidden="true" />
                  )
                }
              >
                {saved ? 'Saved' : 'Save service'}
              </Button>
            </div>
            <p className="mt-3 border-t border-ink-100 pt-3 text-[0.6875rem] leading-relaxed text-ink-500">
              Saved services are stored in this browser until you log in. A signed-in account keeps them on the
              server.
            </p>
          </div>

          {primarySource && (
            <div className="rounded-xl border border-ink-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-ink-900">Provenance</h2>
              <dl className="mt-2 space-y-2 text-xs">
                <div>
                  <dt className="text-ink-500">Publisher</dt>
                  <dd className="font-medium text-ink-800">{primarySource.publisher}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Source</dt>
                  <dd className="text-ink-800">{primarySource.title}</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Checked</dt>
                  <dd className="text-ink-800">
                    {primarySource.checkedAt ? formatDate(primarySource.checkedAt) : 'Not recorded'}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-500">Reviewer</dt>
                  <dd className="text-ink-800">{primarySource.reviewer ?? 'Not recorded'}</dd>
                </div>
              </dl>
            </div>
          )}

          <InlineNotice tone="warning" title="Confirm before you travel">
            <p>
              Requirements change without notice. Phone the office or check its own website before paying a fee
              or travelling.
            </p>
          </InlineNotice>

          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-800 hover:underline"
          >
            <ArrowLeft className="size-4 dir-arrow" aria-hidden="true" />
            Back to all services
          </Link>
        </aside>
      </div>
    </div>
  );
}
