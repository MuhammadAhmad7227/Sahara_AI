import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { PageHeader, Pagination } from '@/components/common/Feedback';
import { Button } from '@/components/common/Button';
import { CardGridSkeleton, EmptyState, ErrorState, InlineNotice } from '@/components/common/States';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAsync } from '@/hooks/useAsync';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { listServices, getDepartments } from '@/services/api/services';
import { errorMessage } from '@/services/api/errors';
import { serviceCategories } from '@/data/services';
import { departments } from '@/data/services';
import type { ServiceCategory, ServiceListQuery } from '@/types/domain';

const PAGE_SIZE = 9;

const jurisdictions = ['all', 'Punjab', 'Federal'] as const;

export default function ServiceCataloguePage() {
  useDocumentTitle(
    'Public service catalogue',
    'Browse reviewed public-service records for Punjab and federal services: documents, steps, fees where verified, and the source each record comes from.',
  );

  const [params, setParams] = useSearchParams();
  const { items: recentlyViewed, clear: clearRecent } = useRecentlyViewed();

  // URL is the source of truth for filters, so a filtered view can be shared.
  const query: ServiceListQuery = useMemo(
    () => ({
      search: params.get('q') ?? '',
      category: (params.get('category') as ServiceCategory | 'all' | null) ?? 'all',
      department: params.get('department') ?? 'all',
      jurisdiction: (params.get('jurisdiction') as ServiceListQuery['jurisdiction']) ?? 'all',
      sort: (params.get('sort') as ServiceListQuery['sort']) ?? 'relevance',
      page: Number(params.get('page') ?? '1') || 1,
      pageSize: PAGE_SIZE,
    }),
    [params],
  );

  const [searchInput, setSearchInput] = useState(query.search ?? '');
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setSearchInput(query.search ?? '');
  }, [query.search]);

  const update = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(patch)) {
        if (!value || value === 'all') next.delete(key);
        else next.set(key, value);
      }
      // Any filter change resets pagination.
      if (!('page' in patch)) next.delete('page');
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update({ q: value.trim() || undefined }), 320);
  };

  const { data, loading, error, reload } = useAsync(() => listServices(query), [params.toString()]);

  const activeFilters = [
    query.category && query.category !== 'all' ? { key: 'category', label: serviceCategories.find((c) => c.id === query.category)?.label ?? query.category } : null,
    query.department && query.department !== 'all' ? { key: 'department', label: query.department } : null,
    query.jurisdiction && query.jurisdiction !== 'all' ? { key: 'jurisdiction', label: query.jurisdiction } : null,
  ].filter(Boolean) as { key: string; label: string }[];

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <label htmlFor="filter-category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-500">
          Category
        </label>
        <select
          id="filter-category"
          value={query.category}
          onChange={(e) => update({ category: e.target.value })}
          className="h-10 w-full rounded-lg border border-brand-900/15 bg-white px-2.5 text-sm"
        >
          <option value="all">All categories</option>
          {serviceCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-department" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-500">
          Department
        </label>
        <select
          id="filter-department"
          value={query.department}
          onChange={(e) => update({ department: e.target.value })}
          className="h-10 w-full rounded-lg border border-brand-900/15 bg-white px-2.5 text-sm"
        >
          <option value="all">All departments</option>
          {getDepartments().map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[0.6875rem] text-ink-400">{departments.length} departments in the demo catalogue</p>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500">Jurisdiction</legend>
        <div className="space-y-1.5">
          {jurisdictions.map((j) => (
            <label key={j} className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="radio"
                name="jurisdiction"
                checked={(query.jurisdiction ?? 'all') === j}
                onChange={() => update({ jurisdiction: j === 'all' ? undefined : j })}
                className="size-4 accent-brand-800"
              />
              {j === 'all' ? 'All jurisdictions' : j}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="filter-sort" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-500">
          Sort by
        </label>
        <select
          id="filter-sort"
          value={query.sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="h-10 w-full rounded-lg border border-brand-900/15 bg-white px-2.5 text-sm"
        >
          <option value="relevance">Most relevant</option>
          <option value="name">Name (A–Z)</option>
          <option value="recently_verified">Recently verified</option>
        </select>
      </div>

      {activeFilters.length > 0 && (
        <Button variant="outline" size="sm" fullWidth onClick={() => setParams({}, { replace: true })}>
          Reset all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="container-page py-8 sm:py-10">
      <PageHeader
        eyebrow="Service catalogue"
        title="Public services, in plain language"
        description="Search reviewed records for Punjab and federal services. Every record lists its required documents and steps, and shows its source and the date it was last checked — or says that a detail is not yet verified."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-20 rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
              <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters
            </h2>
            {filterPanel}
          </div>
        </aside>

        <div>
          {/* Search + mobile filter trigger */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="service-search" className="sr-only">
                Search services
              </label>
              <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink-400" aria-hidden="true" />
              <input
                id="service-search"
                type="search"
                value={searchInput}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by service, department or keyword…"
                className="h-11 w-full rounded-lg border border-brand-900/15 bg-white ps-9 pe-3 text-[0.9375rem] focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
              />
            </div>
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFilters((v) => !v)}
              leadingIcon={<Filter className="size-4" aria-hidden="true" />}
              aria-expanded={showFilters}
            >
              Filters{activeFilters.length ? ` (${activeFilters.length})` : ''}
            </Button>
          </div>

          {showFilters && (
            <div className="mb-4 rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4 lg:hidden">{filterPanel}</div>
          )}

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <ul className="mb-4 flex flex-wrap gap-1.5" aria-label="Active filters">
              {activeFilters.map((f) => (
                <li key={f.key}>
                  <button
                    type="button"
                    onClick={() => update({ [f.key]: undefined })}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-900/15 bg-white px-2.5 py-1 text-xs text-ink-700 hover:border-brand-400"
                  >
                    {f.label}
                    <X className="size-3" aria-hidden="true" />
                    <span className="sr-only">Remove filter</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Result count */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm text-ink-600" aria-live="polite">
              {loading ? 'Searching…' : data ? `${data.total} service${data.total === 1 ? '' : 's'} found` : ''}
            </p>
            {query.search && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  update({ q: undefined });
                }}
                className="text-xs text-ink-500 underline hover:text-brand-800"
              >
                Clear search
              </button>
            )}
          </div>

          {loading && <CardGridSkeleton count={6} />}

          {!loading && error && (
            <ErrorState title="Unable to load services" message={errorMessage(error)} onRetry={reload} />
          )}

          {!loading && !error && data && data.items.length === 0 && (
            <EmptyState
              title="No services match your filters"
              description="Try a different keyword, or remove one of the filters. If the service you need is not listed, it has not yet been added to the reviewed catalogue."
              action={
                <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                  Reset filters
                </Button>
              }
            />
          )}

          {!loading && !error && data && data.items.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
              <div className="mt-6">
                <Pagination
                  page={data.page}
                  totalPages={data.totalPages}
                  onChange={(page) => {
                    update({ page: String(page) });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            </>
          )}

          {/* Recently viewed */}
          {recentlyViewed.length > 0 && (
            <section className="mt-8 rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4" aria-labelledby="recently-viewed">
              <div className="flex items-center justify-between gap-2">
                <h2 id="recently-viewed" className="text-sm font-semibold text-ink-900">
                  Recently viewed
                </h2>
                <button type="button" onClick={clearRecent} className="text-xs text-ink-500 hover:text-brand-800">
                  Clear
                </button>
              </div>
              <ul className="mt-2 divide-y divide-ink-100">
                {recentlyViewed.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/services/${item.slug}`}
                      className="flex flex-wrap items-center justify-between gap-1 py-2 text-sm hover:text-brand-800"
                    >
                      <span className="font-medium text-ink-800">{item.name}</span>
                      <span className="text-xs text-ink-500">{item.department}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-8">
            <InlineNotice tone="info" title="About this catalogue">
              <p>
                Records in this development build are demonstration data. A record marked{' '}
                <strong>Pending verification</strong> has not been checked against an official source, and fees
                are shown only when a reviewer has confirmed them.
              </p>
            </InlineNotice>
          </div>
        </div>
      </div>
    </div>
  );
}
