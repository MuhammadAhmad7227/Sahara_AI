import { useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, ExternalLink, HeartHandshake, Info, ShieldQuestion } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge, VerificationBadge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { PageHeader } from '@/components/common/Feedback';
import { EmptyState, ErrorState } from '@/components/common/States';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { checkWelfareMatches } from '@/services/api/welfare';
import { errorMessage } from '@/services/api/errors';
import { punjabDistricts } from '@/data/welfare';
import { cn, formatDate } from '@/utils/cn';
import type { IncomeBand, WelfareMatch } from '@/types/domain';

const incomeBands: { value: IncomeBand; label: string }[] = [
  { value: 'under_25k', label: 'Under PKR 25,000' },
  { value: '25k_50k', label: 'PKR 25,000 – 50,000' },
  { value: '50k_100k', label: 'PKR 50,000 – 100,000' },
  { value: 'over_100k', label: 'Over PKR 100,000' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function WelfarePage() {
  useDocumentTitle(
    'Welfare assistant',
    'See welfare programmes whose stored criteria may match your household. The programme authority decides eligibility — Sahara AI does not.',
  );

  const [district, setDistrict] = useState('');
  const [householdSize, setHouseholdSize] = useState('4');
  const [incomeBand, setIncomeBand] = useState<IncomeBand>('prefer_not_to_say');
  const [matches, setMatches] = useState<WelfareMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const districtError = touched && !district ? 'Select your district.' : undefined;
  const sizeError =
    touched && (!householdSize || Number(householdSize) < 1 || Number(householdSize) > 30)
      ? 'Enter a household size between 1 and 30.'
      : undefined;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!district || Number(householdSize) < 1) return;
    setLoading(true);
    setError(null);
    try {
      const result = await checkWelfareMatches({
        district,
        householdSize: Number(householdSize),
        incomeBand,
      });
      setMatches(result);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow="Welfare assistant"
        title="Find programmes that may apply to you"
        description="Answer three simple questions. Sahara AI compares them with programme criteria stored by an administrator and shows possible matches — the programme authority decides eligibility."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[20rem_1fr]">
        <aside>
          <SectionCard title="Your household" description="Only the facts needed for matching. No CNIC or name is requested.">
            <form onSubmit={submit} noValidate className="space-y-4">
              <div>
                <label htmlFor="welfare-district" className="mb-1.5 block text-sm font-medium text-ink-800">
                  District <span className="text-red-600">*</span>
                </label>
                <select
                  id="welfare-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  aria-invalid={districtError ? true : undefined}
                  aria-describedby={districtError ? 'wd-err' : undefined}
                  className={cn(
                    'h-11 w-full rounded-lg border bg-white px-3 text-sm',
                    districtError ? 'border-red-400' : 'border-ink-300',
                  )}
                >
                  <option value="">Select district…</option>
                  {punjabDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {districtError && (
                  <p id="wd-err" className="mt-1 text-xs font-medium text-red-700" role="alert">
                    {districtError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="welfare-size" className="mb-1.5 block text-sm font-medium text-ink-800">
                  Household size <span className="text-red-600">*</span>
                </label>
                <input
                  id="welfare-size"
                  type="number"
                  min={1}
                  max={30}
                  value={householdSize}
                  onChange={(e) => setHouseholdSize(e.target.value)}
                  aria-invalid={sizeError ? true : undefined}
                  aria-describedby={sizeError ? 'ws-err' : 'ws-help'}
                  className={cn(
                    'h-11 w-full rounded-lg border px-3 text-sm',
                    sizeError ? 'border-red-400' : 'border-ink-300',
                  )}
                />
                <p id="ws-help" className="mt-1 text-xs text-ink-500">
                  Number of people living in the household.
                </p>
                {sizeError && (
                  <p id="ws-err" className="mt-1 text-xs font-medium text-red-700" role="alert">
                    {sizeError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="welfare-income" className="mb-1.5 block text-sm font-medium text-ink-800">
                  Monthly household income
                </label>
                <select
                  id="welfare-income"
                  value={incomeBand}
                  onChange={(e) => setIncomeBand(e.target.value as IncomeBand)}
                  className="h-11 w-full rounded-lg border border-brand-900/15 bg-white px-3 text-sm"
                >
                  {incomeBands.map((band) => (
                    <option key={band.value} value={band.value}>
                      {band.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-ink-500">Used only to compare against stored criteria.</p>
              </div>

              <Button type="submit" fullWidth loading={loading} trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}>
                {loading ? 'Checking…' : 'Show possible matches'}
              </Button>
            </form>
          </SectionCard>

          <div className="mt-4 rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4 text-xs leading-relaxed text-ink-600">
            <p className="flex items-start gap-1.5">
              <Info className="mt-0.5 size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
              Your answers stay in this browser tab and are not saved to an account.
            </p>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          {error && <ErrorState title="Unable to check programmes" message={error} onRetry={() => void submit({ preventDefault() {} } as React.FormEvent)} />}

          {!matches && !error && (
            <EmptyState
              icon={<HeartHandshake className="size-5" />}
              title="No matches shown yet"
              description="Fill in the household details and choose Show possible matches. Results appear here with the criteria they matched and the programme's official source."
            />
          )}

          {matches && matches.length === 0 && (
            <EmptyState
              icon={<ShieldQuestion className="size-5" />}
              title="No stored programme matched your answers"
              description="This does not mean you are ineligible for support. The stored rules cover only programmes an administrator has entered. Contact your local social welfare office or the programme authority directly."
            />
          )}

          {matches && matches.length > 0 && (
            <>
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-sm text-sky-900" role="note">
                {matches.length} programme{matches.length === 1 ? '' : 's'} may match the criteria you entered. Each
                result states the criteria that matched and the criteria that did not.
              </div>

              <ul className="space-y-3">
                {matches.map((match) => (
                  <li key={match.scheme.id} className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4 shadow-card">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="text-base font-semibold text-ink-900">{match.scheme.name}</h2>
                        <p className="text-xs text-ink-500">{match.scheme.provider}</p>
                      </div>
                      <VerificationBadge status={match.scheme.verification} />
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{match.scheme.description}</p>

                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                      <strong className="font-semibold">Matched criteria</strong>
                      <ul className="mt-1 space-y-0.5">
                        {match.matchedCriteria.map((c) => (
                          <li key={c} className="flex items-start gap-1.5">
                            <CheckCircle2 className="mt-px size-3 shrink-0 text-emerald-700" aria-hidden="true" />
                            {c}
                          </li>
                        ))}
                        {match.unmatchedCriteria.map((c) => (
                          <li key={c} className="flex items-start gap-1.5 text-amber-800">
                            <Circle className="mt-px size-3 shrink-0" aria-hidden="true" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="mt-2.5 text-sm font-medium text-ink-800">{match.matchStatement}</p>

                    <dl className="mt-3 grid gap-2 border-t border-ink-100 pt-2.5 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-ink-500">Official source</dt>
                        <dd className="flex flex-wrap items-center gap-1.5 font-medium text-ink-800">
                          {match.scheme.officialSource.publisher}
                          {match.scheme.officialSource.url ? (
                            <a
                              href={match.scheme.officialSource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-brand-800 hover:underline"
                            >
                              <ExternalLink className="size-2.5" aria-hidden="true" /> Open
                            </a>
                          ) : (
                            <Badge tone="warning">URL not recorded</Badge>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink-500">Last verified</dt>
                        <dd className="font-medium text-ink-800">
                          {match.scheme.officialSource.lastVerifiedAt
                            ? formatDate(match.scheme.officialSource.lastVerifiedAt)
                            : 'Not recorded'}
                        </dd>
                      </div>
                    </dl>

                    <details className="mt-2 text-xs text-ink-600">
                      <summary className="cursor-pointer font-medium text-ink-800">Documents commonly requested</summary>
                      <ul className="mt-1 ms-4 list-disc space-y-0.5">
                        {match.scheme.requiredDocuments.map((doc) => (
                          <li key={doc}>{doc}</li>
                        ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ul>

              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-900">
                <p className="font-semibold">This is not an eligibility decision.</p>
                <p className="mt-0.5">
                  Programmes change their criteria, and the programme authority assesses every case. Confirm
                  eligibility and the current documents at the official centre — and never pay anyone to register you.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
