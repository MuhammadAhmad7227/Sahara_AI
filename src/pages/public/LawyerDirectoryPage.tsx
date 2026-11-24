import { useState } from 'react';
import { BriefcaseBusiness, MapPin, Search, ShieldQuestion } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { PageHeader } from '@/components/common/Feedback';
import { CardGridSkeleton, EmptyState, ErrorState, InlineNotice } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { listLawyers } from '@/services/api/directory';
import { errorMessage } from '@/services/api/errors';
import { lawyerCities, lawyerSpecializations } from '@/data/lawyers';

export default function LawyerDirectoryPage() {
  useDocumentTitle(
    'Lawyer directory',
    'Search illustrative lawyer profiles by city and specialization. Listings are not a recommendation or a verified roster.',
  );

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('all');
  const [specialization, setSpecialization] = useState('all');

  const { data, loading, error, reload } = useAsync(
    () => listLawyers({ search, city, specialization }),
    [search, city, specialization],
  );

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow="Lawyer directory"
        title="Find legal help by city and specialty"
        description="Search illustrative profiles by city and area of practice. Appointments and payments are not part of this release."
      />

      <div className="mt-4">
        <InlineNotice tone="warning" title="Demo profiles — not real practitioners">
          <p>
            Every profile here is fictional demonstration content used to build the search interface. No real
            lawyer is listed, and no contact details are published. A real directory requires a documented
            verification method before a listing can be shown.
          </p>
        </InlineNotice>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <label htmlFor="lawyer-search" className="sr-only">
            Search lawyers
          </label>
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink-400" aria-hidden="true" />
          <input
            id="lawyer-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by specialty or name…"
            className="h-11 w-full rounded-lg border border-ink-300 bg-white ps-9 pe-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="lawyer-city" className="sr-only">
            City
          </label>
          <select
            id="lawyer-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 w-full rounded-lg border border-ink-300 bg-white px-2.5 text-sm sm:w-40"
          >
            <option value="all">All cities</option>
            {lawyerCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lawyer-spec" className="sr-only">
            Specialization
          </label>
          <select
            id="lawyer-spec"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="h-11 w-full rounded-lg border border-ink-300 bg-white px-2.5 text-sm sm:w-48"
          >
            <option value="all">All specializations</option>
            {lawyerSpecializations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {loading && <CardGridSkeleton count={4} columns={3} />}
        {!loading && error && <ErrorState title="Unable to load listings" message={errorMessage(error)} onRetry={reload} />}
        {!loading && !error && data && data.length === 0 && (
          <EmptyState
            icon={<BriefcaseBusiness className="size-5" />}
            title="No profile matched"
            description="Try a different city or specialization. The directory is a demonstration set and does not cover every area of practice."
          />
        )}
        {!loading && !error && data && data.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((lawyer) => (
              <li key={lawyer.id} className="flex h-full flex-col rounded-xl border border-ink-200 bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <Badge tone={lawyer.verificationStatus === 'verified' ? 'success' : 'neutral'}>
                    {lawyer.verificationStatus === 'verified' ? 'Verified listing' : 'Illustrative listing'}
                  </Badge>
                </div>
                <h2 className="mt-2 flex items-start gap-1.5 text-sm font-semibold text-ink-900">
                  <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
                  {lawyer.name}
                </h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                  <MapPin className="size-3.5" aria-hidden="true" /> {lawyer.city}
                  {lawyer.experienceYears !== null && ` · ${lawyer.experienceYears} years`}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{lawyer.profileSummary}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {lawyer.specializations.map((spec) => (
                    <Badge key={spec} tone="brand">
                      {spec}
                    </Badge>
                  ))}
                </div>
                <p className="mt-auto flex items-start gap-1 border-t border-ink-100 pt-2.5 text-[0.6875rem] leading-relaxed text-ink-500">
                  <ShieldQuestion className="mt-px size-3 shrink-0" aria-hidden="true" />
                  {lawyer.contactNote}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-ink-200 bg-white p-4 text-xs leading-relaxed text-ink-600">
        <h2 className="mb-1 text-sm font-semibold text-ink-900">Hiring a lawyer</h2>
        <p>
          Ask about the fee structure in writing, confirm the lawyer is enrolled with the relevant bar, and keep
          copies of everything you sign. Sahara AI cannot verify a lawyer’s standing for you.
        </p>
      </div>
    </div>
  );
}
