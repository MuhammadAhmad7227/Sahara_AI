import { useMemo, useState } from 'react';
import { Building2, Clock, MapPin, Navigation, Phone, Search } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge, VerificationBadge } from '@/components/common/Badge';
import { PageHeader } from '@/components/common/Feedback';
import { CardGridSkeleton, EmptyState, ErrorState, InlineNotice } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { listOffices } from '@/services/api/directory';
import { errorMessage } from '@/services/api/errors';
import { officeCategories } from '@/data/offices';
import { punjabDistricts } from '@/data/welfare';
import { cn, formatDate } from '@/utils/cn';

export default function OfficeFinderPage() {
  useDocumentTitle(
    'Office finder',
    'Find NADRA centres, police stations, hospitals, courts and facilitation centres. Locations are shown only when verified against an official source.',
  );

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | (typeof officeCategories)[number]['id']>('all');
  const [district, setDistrict] = useState('all');

  const { data, loading, error, reload } = useAsync(
    () => listOffices({ search, category, district }),
    [search, category, district],
  );

  const availableDistricts = useMemo(() => {
    if (!data) return punjabDistricts;
    return Array.from(new Set(data.map((o) => o.district))).sort();
  }, [data]);

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow="Office finder"
        title="Find the right office"
        description="Search the curated directory of public offices. Addresses, phone numbers and opening hours are published only when a reviewer has recorded them from an official source."
      />

      <div className="mt-5 space-y-3">
        <div className="relative">
          <label htmlFor="office-search" className="sr-only">
            Search offices
          </label>
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink-400" aria-hidden="true" />
          <input
            id="office-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by office, city or district…"
            className="h-11 w-full rounded-lg border border-brand-900/15 bg-white ps-9 pe-3 text-sm focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          />
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by office category">
          <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
            All offices
          </FilterChip>
          {officeCategories.map((c) => (
            <FilterChip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label}
            </FilterChip>
          ))}
        </div>

        <div>
          <label htmlFor="office-district" className="sr-only">
            District
          </label>
          <select
            id="office-district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="h-10 rounded-lg border border-brand-900/15 bg-white px-2.5 text-sm"
          >
            <option value="all">All districts</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          {loading && <CardGridSkeleton count={4} columns={2} />}
          {!loading && error && <ErrorState title="Unable to load offices" message={errorMessage(error)} onRetry={reload} />}
          {!loading && !error && data && data.length === 0 && (
            <EmptyState
              icon={<Building2 className="size-5" />}
              title="No offices match your search"
              description="Try a different term or clear the filters. The directory only contains offices an administrator has added."
              action={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setCategory('all');
                    setDistrict('all');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          )}
          {!loading && !error && data && data.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.map((office) => (
                <article key={office.id} className="flex h-full flex-col rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone="brand">{office.category}</Badge>
                    <VerificationBadge status={office.verification} />
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-ink-900">{office.name}</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                    <MapPin className="size-3.5" aria-hidden="true" /> {office.city}, {office.district}
                  </p>

                  <dl className="mt-3 space-y-1.5 text-xs">
                    <div className="flex gap-1.5">
                      <dt className="flex items-center gap-1 text-ink-500">
                        <Building2 className="size-3.5" aria-hidden="true" /> Address
                      </dt>
                      <dd className="font-medium text-ink-800">{office.address ?? 'Not yet recorded'}</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="flex items-center gap-1 text-ink-500">
                        <Phone className="size-3.5" aria-hidden="true" /> Phone
                      </dt>
                      <dd className="font-medium text-ink-800">{office.phone ?? 'Not yet recorded'}</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="flex items-center gap-1 text-ink-500">
                        <Clock className="size-3.5" aria-hidden="true" /> Opening
                      </dt>
                      <dd className="font-medium text-ink-800">{office.openingInfo ?? 'Not yet recorded'}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto border-t border-ink-100 pt-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[0.6875rem] text-ink-400">
                        Checked: {office.source.lastVerifiedAt ? formatDate(office.source.lastVerifiedAt) : 'Not recorded'}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        title="Directions require a verified address"
                        leadingIcon={<Navigation className="size-3.5" aria-hidden="true" />}
                      >
                        Directions
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-brand-900/[0.07] bg-paper shadow-1">
            <div
              className="relative grid h-48 place-items-center bg-[linear-gradient(45deg,var(--color-ink-100)_25%,transparent_25%,transparent_75%,var(--color-ink-100)_75%),linear-gradient(45deg,var(--color-ink-100)_25%,transparent_25%,transparent_75%,var(--color-ink-100)_75%)] bg-[length:16px_16px] bg-[position:0_0,8px_8px]"
              role="img"
              aria-label="Map placeholder — office locations will appear here once verified addresses are recorded"
            >
              <div className="rounded-lg border border-brand-900/15 bg-white/95 px-3 py-2 text-center text-xs text-ink-600 shadow-card">
                <MapPin className="mx-auto mb-1 size-4 text-brand-700" aria-hidden="true" />
                Map placeholder
                <p className="mt-0.5 text-[0.625rem] text-ink-500">Verified addresses required</p>
              </div>
            </div>
            <p className="px-3 py-2 text-xs leading-relaxed text-ink-500">
              The map will use an OpenStreetMap-based provider once verified coordinates are stored. No approximate
              location is shown for an unverified office.
            </p>
          </div>

          <InlineNotice tone="info" title="Do not travel on unverified details">
            <p>
              Call the office using a number you found on the office’s own website before travelling. The directory
              is being populated and may not yet list your office.
            </p>
          </InlineNotice>
        </aside>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active ? 'border-brand-700 bg-brand-900 text-white' : 'border-ink-300 bg-white text-ink-700 hover:border-brand-400',
      )}
    >
      {children}
    </button>
  );
}
