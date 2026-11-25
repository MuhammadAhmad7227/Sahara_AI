import { useParams } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { LinkButton } from '@/components/common/Button';
import { Badge, VerificationBadge } from '@/components/common/Badge';
import { Breadcrumbs } from '@/components/common/Feedback';
import { EmptyState, ErrorState, InlineNotice, Skeleton } from '@/components/common/States';
import { SourceCard } from '@/components/services/SourceCard';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getLegalArticle } from '@/services/api/directory';
import { errorMessage } from '@/services/api/errors';
import { demoServices } from '@/data/services';
import { legalCategories } from '@/data/legal';

export default function LegalArticlePage() {
  const { slug = '' } = useParams();
  const { data: article, loading, error, reload } = useAsync(() => getLegalArticle(slug), [slug]);
  useDocumentTitle(article ? article.title : 'Legal awareness', article?.summary);

  if (loading) {
    return (
      <div className="container-page max-w-3xl py-8">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-1 h-8 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-6 h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-10">
        {error.status === 404 ? (
          <EmptyState
            title="Article not found"
            description="This awareness article is not available. It may have been removed or the link may be incorrect."
            action={<LinkButton to="/legal">Back to legal awareness</LinkButton>}
          />
        ) : (
          <ErrorState title="Unable to load article" message={errorMessage(error)} onRetry={reload} />
        )}
      </div>
    );
  }

  if (!article) return null;

  const relatedServices = demoServices.filter((s) => article.relatedServiceIds.includes(s.id));

  return (
    <article className="container-page max-w-3xl py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Legal awareness', to: '/legal' },
          { label: article.title },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">{legalCategories.find((c) => c.id === article.category)?.label ?? article.category}</Badge>
        <VerificationBadge status={article.verification} />
      </div>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">{article.title}</h1>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">{article.summary}</p>

      <div className="mt-4">
        <InlineNotice tone="warning" title="General awareness only">
          <p>
            This article explains a topic in simple language. It is not legal advice and does not account for the
            facts of your particular case. Consult a qualified legal professional before acting.
          </p>
        </InlineNotice>
      </div>

      <div className="mt-6 space-y-3 rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-5 text-[0.9375rem] leading-relaxed text-ink-700 shadow-card">
        {article.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {relatedServices.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-base font-semibold text-ink-900">Related services</h2>
          <ul className="space-y-2">
            {relatedServices.map((service) => (
              <li key={service.id} className="rounded-lg border border-ink-200 bg-white p-3">
                <LinkButton to={`/services/${service.slug}`} variant="ghost" size="sm" className="!h-auto !justify-start !p-0 font-medium">
                  {service.name}
                </LinkButton>
                <p className="text-xs text-ink-500">{service.department}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-base font-semibold text-ink-900">Source</h2>
        <SourceCard
          source={{
            id: article.id,
            title: `${article.title} — awareness note`,
            publisher: article.source.publisher,
            url: article.source.url,
            checkedAt: article.source.lastVerifiedAt,
            reviewer: null,
            status: article.verification === 'verified' ? 'approved' : 'pending_review',
            notes: 'Awareness notes are not a statutory source. Consult a professional for case-specific advice.',
          }}
        />
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <LinkButton to="/legal" variant="outline" leadingIcon={<ArrowLeft className="size-4 dir-arrow" aria-hidden="true" />}>
          All topics
        </LinkButton>
        <LinkButton to="/lawyers" variant="ghost">
          Find a lawyer
        </LinkButton>
        <span className="inline-flex items-center gap-1 text-xs text-ink-500">
          <Info className="size-3.5" aria-hidden="true" /> Not legal advice
        </span>
      </div>
    </article>
  );
}
