import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Scale, Search } from 'lucide-react';
import { Badge, VerificationBadge } from '@/components/common/Badge';
import { PageHeader } from '@/components/common/Feedback';
import { CardGridSkeleton, EmptyState, ErrorState, InlineNotice } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { listLegalArticles } from '@/services/api/directory';
import { errorMessage } from '@/services/api/errors';
import { legalCategories } from '@/data/legal';
import { formatDate } from '@/utils/cn';
import type { LegalArticle } from '@/types/domain';

export default function LegalPage() {
  useDocumentTitle(
    'Legal awareness',
    'Plain-language civic and legal awareness for Pakistani citizens. General awareness only — not legal advice.',
  );

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<LegalArticle['category'] | 'all'>('all');
  const { data, loading, error, reload } = useAsync(() => listLegalArticles({ search, category }), [search, category]);

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow="Legal awareness"
        title="Understand your options in plain language"
        description="Short explanations of common civic and legal situations. This is general awareness for citizens — it is not legal advice about your case."
      />

      <div className="mt-4">
        <InlineNotice tone="warning" title="General awareness only">
          <p>
            This information does not replace advice from a qualified legal professional. Case outcomes depend on
            facts and law that only a lawyer can assess properly.
          </p>
        </InlineNotice>
      </div>

      <div className="mt-5 space-y-3">
        <div className="relative">
          <label htmlFor="legal-search" className="sr-only">
            Search articles
          </label>
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink-400" aria-hidden="true" />
          <input
            id="legal-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics, e.g. FIR, land record, wages…"
            className="h-11 w-full rounded-lg border border-ink-300 bg-white ps-9 pe-3 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by topic">
          <button
            type="button"
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}
            className={
              category === 'all'
                ? 'rounded-full border border-brand-700 bg-brand-900 px-3 py-1.5 text-xs font-medium text-white'
                : 'rounded-full border border-ink-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-700'
            }
          >
            All topics
          </button>
          {legalCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={
                category === c.id
                  ? 'rounded-full border border-brand-700 bg-brand-900 px-3 py-1.5 text-xs font-medium text-white'
                  : 'rounded-full border border-ink-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-400'
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading && <CardGridSkeleton count={4} columns={2} />}
        {!loading && error && <ErrorState title="Unable to load articles" message={errorMessage(error)} onRetry={reload} />}
        {!loading && !error && data && data.length === 0 && (
          <EmptyState
            icon={<Scale className="size-5" />}
            title="No article matched"
            description="Try a different search term or topic. New awareness articles are added as they are reviewed."
          />
        )}
        {!loading && !error && data && data.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {data.map((article) => (
              <li key={article.id} className="flex h-full flex-col rounded-xl border border-ink-200 bg-white p-4 shadow-card transition-colors hover:border-brand-300">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge tone="brand">{legalCategories.find((c) => c.id === article.category)?.label ?? article.category}</Badge>
                  <VerificationBadge status={article.verification} />
                </div>
                <h2 className="mt-2 text-base font-semibold leading-snug text-ink-900">
                  <Link to={`/legal/${article.slug}`} className="hover:text-brand-800 hover:underline underline-offset-2">
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{article.summary}</p>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-ink-100 pt-2.5 text-[0.6875rem] text-ink-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-3" aria-hidden="true" />
                    Checked: {article.source.lastVerifiedAt ? formatDate(article.source.lastVerifiedAt) : 'not recorded'}
                  </span>
                  <Link to={`/legal/${article.slug}`} className="inline-flex items-center gap-0.5 font-medium text-brand-800 hover:underline">
                    Read <ArrowRight className="size-3 dir-arrow" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
