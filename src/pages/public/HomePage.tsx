/**
 * HomePage — "Premium Civic Command Center".
 *
 * Structure (deliberate, not decorative):
 *   1. Hero            — who this is for, what it does, and a live product panel
 *   2. Trust strip     — provenance states, stated plainly
 *   3. How it works    — the six-stage pipeline as a CONNECTED pathway
 *   4. Service universe— categories arranged around the Sahara mark
 *   5. Popular records — real records from the mock API
 *   6. Capabilities    — what the platform does, and what it refuses to do
 *   7. Coverage        — Punjab-first, honestly scoped
 *   8. Closing CTA
 *
 * Copy rules enforced here: no "AI-powered", no invented statistics, no
 * testimonial, no government affiliation, no promise of an outcome.
 */
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  FileText,
  Gauge,
  Landmark,
  Languages,
  MapPin,
  MessagesSquare,
  Mic,
  Scale,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { LinkButton } from '@/components/common/Button';
import { VerificationBadge } from '@/components/common/Badge';
import { CardGridSkeleton, ErrorState } from '@/components/common/States';
import { Reveal } from '@/components/common/Reveal';
import { SaharaOrb } from '@/components/brand/SaharaOrb';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAsync } from '@/hooks/useAsync';
import { getPopularServices } from '@/services/api/services';
import { errorMessage } from '@/services/api/errors';
import { cn } from '@/utils/cn';

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

const pipeline = [
  {
    step: '01',
    title: 'You ask',
    body: 'Type or speak in Urdu, Punjabi or English. No account needed to start.',
    icon: Mic,
  },
  {
    step: '02',
    title: 'Sahara understands',
    body: 'The question is read for a service, a document or an intent — not just keywords.',
    icon: Languages,
  },
  {
    step: '03',
    title: 'Records are verified',
    body: 'Only records a reviewer has approved and published are eligible to be retrieved.',
    icon: ShieldCheck,
  },
  {
    step: '04',
    title: 'Sources are retrieved',
    body: 'The matching record is pulled with its publisher, official URL and date checked.',
    icon: BookOpenCheck,
  },
  {
    step: '05',
    title: 'The AI explains',
    body: 'The model explains the record in plain language. It cannot add facts of its own.',
    icon: Sparkles,
  },
  {
    step: '06',
    title: 'You act',
    body: 'Read the checklist, prepare a draft, or open the tool that helps you finish the task.',
    icon: FileText,
  },
];

const serviceUniverse = [
  { label: 'Identity', detail: 'Domicile · CNIC', to: '/services?category=identity', icon: BadgeCheck },
  { label: 'Travel', detail: 'Passport · B-Form', to: '/services?category=travel', icon: MapPin },
  { label: 'Welfare', detail: 'BISP · Zakat', to: '/welfare', icon: Building2 },
  { label: 'Utilities', detail: 'Electricity · Gas', to: '/services?category=utilities', icon: Gauge },
  { label: 'Complaints', detail: 'Draft · Escalate', to: '/complaints', icon: ScrollText },
  { label: 'Legal', detail: 'FIR · Rights', to: '/legal', icon: Scale },
];

const capabilities = [
  {
    title: 'Answers with a visible source',
    body: 'Every response shows the publisher, the record title and the date it was last checked — or says that no reviewed record exists.',
    icon: ShieldCheck,
    tone: 'green' as const,
  },
  {
    title: 'Voice-first, three languages',
    body: 'Urdu, Punjabi and English, with a right-to-left interface and browser speech input where it is supported.',
    icon: Mic,
    tone: 'gold' as const,
  },
  {
    title: 'Finishes the task, not just the answer',
    body: 'Document checklists, application drafts and complaint templates that you review and submit yourself.',
    icon: FileText,
    tone: 'green' as const,
  },
  {
    title: 'Clear about its limits',
    body: 'No government database access, no submission, no guaranteed eligibility, no claim that a message is definitely a scam.',
    icon: ShieldAlert,
    tone: 'sand' as const,
  },
];

const scope = [
  { label: 'Punjab', detail: '16 service records across 7 departments', status: 'In review' },
  { label: 'Federal', detail: 'Passport and NADRA guidance', status: 'In review' },
  { label: 'Sindh · KP · Balochistan', detail: 'Structure ready, records not yet authored', status: 'Planned' },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  const { t } = useLanguage();
  useDocumentTitle(
    'Sahara AI — Civic services for Pakistani citizens',
    'Ask about public services, documents, applications, complaints and public information in English, Urdu or Punjabi. Answers cite the reviewed source and the date it was checked.',
  );

  const { data: services, loading, error, reload } = useAsync(() => getPopularServices(4), []);

  return (
    <>
      {/* ================================================================== */}
      {/* 1 · Hero                                                           */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        {/* Warm field + surveyed grid. Both are inert decorations. */}
        <div className="pointer-events-none absolute inset-0 surface-page" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 grid-lines opacity-[0.55] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,black,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -end-40 -top-40 size-[34rem] rounded-full bg-brand-200/25 blur-[120px]"
          aria-hidden="true"
        />

        <div className="container-page relative pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 xl:gap-16">
            {/* ---- Copy ---- */}
            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-900/10 bg-paper/80 py-1 pe-3 ps-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-800 shadow-1 backdrop-blur">
                <span className="grid size-5 place-items-center rounded-full bg-brand-900 text-[0.5rem] text-accent-300">
                  ●
                </span>
                {t('home.eyebrow')}
              </p>

              <h1
                id="hero-heading"
                className="mt-5 text-[2.15rem] font-semibold leading-[1.06] tracking-[-0.03em] text-ink-950 sm:text-[3rem] lg:text-[3.5rem]"
              >
                {t('home.heroLead')}
                <br />
                <span className="display-serif italic text-brand-800">{t('home.titleAccent')}</span>
              </h1>

              <p className="mt-5 max-w-[34rem] text-[0.9375rem] leading-relaxed text-ink-600 sm:text-base">
                {t('home.subtitle')}
              </p>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <LinkButton
                  to="/assistant"
                  size="lg"
                  trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}
                >
                  {t('nav.talkToSahara')}
                </LinkButton>
                <LinkButton to="/services" size="lg" variant="outline">
                  {t('home.secondaryCta')}
                </LinkButton>
              </div>

              <dl className="mt-8 grid max-w-lg grid-cols-1 gap-x-6 gap-y-3 border-t border-brand-900/10 pt-5 min-[380px]:grid-cols-3">
                {[
                  [t('home.languages'), t('home.languagesValue')],
                  [t('home.everyAnswer'), t('home.everyAnswerValue')],
                  [t('home.access'), t('home.accessValue')],
                ].map(([dt, dd]) => (
                  <div key={dt}>
                    <dt className="text-[0.6875rem] font-medium uppercase tracking-wider text-ink-500">
                      {dt}
                    </dt>
                    <dd className="mt-1 text-[0.8125rem] font-medium leading-snug text-ink-900">{dd}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* ---- Product panel: the hero object ---- */}
            <div className="relative mx-auto w-full max-w-[30rem] lg:max-w-none">
              {/* Contact shadow grounds the panel on the page. */}
              <div
                className="pointer-events-none absolute inset-x-8 -bottom-6 h-16 rounded-[50%] bg-brand-950/20 blur-2xl"
                aria-hidden="true"
              />

              <div
                className="relative panel-night overflow-hidden"
                style={{ transform: 'perspective(1400px) rotateY(-1.5deg) rotateX(1deg)' }}
              >
                <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-60" aria-hidden="true" />
                <div
                  className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full bg-accent-500/20 blur-3xl"
                  aria-hidden="true"
                />

                {/* Panel chrome */}
                <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <SaharaOrb size={30} />
                    <div className="leading-none">
                      <p className="text-[0.8125rem] font-semibold text-white">Sahara AI</p>
                      <p className="mt-1 text-[0.625rem] uppercase tracking-[0.12em] text-sand-300/70">
                        Assistant
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-emerald-200">
                    <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse-soft" />
                    Grounded
                  </span>
                </div>

                {/* Conversation */}
                <div className="relative space-y-3 px-4 py-4">
                  <div className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-ee-md bg-white/12 px-3.5 py-2 text-[0.8125rem] leading-relaxed text-sand-50 ring-1 ring-white/10 backdrop-blur-sm">
                      Mera domicile banwanay ke liye kya chahiye?
                    </p>
                  </div>

                  <div className="flex gap-2.5">
                    <SaharaOrb size={24} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl rounded-es-md border border-white/10 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-sm">
                        <p className="text-[0.8125rem] leading-relaxed text-sand-50">
                          The reviewed record lists three documents. The fee is not currently verified,
                          so Sahara will not quote one.
                        </p>

                        <ul className="mt-2.5 space-y-1.5 border-t border-white/10 pt-2.5">
                          {['CNIC copy', 'Proof of residence', 'Two photographs'].map((item) => (
                            <li
                              key={item}
                              className="flex items-center gap-1.5 text-[0.75rem] text-sand-200"
                            >
                              <ShieldCheck className="size-3 shrink-0 text-emerald-300" aria-hidden="true" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Provenance — the whole point of the product, made visible. */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-brand-950/40 px-2.5 py-1.5">
                        <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-sand-300/60">
                          Source
                        </span>
                        <span className="text-[0.6875rem] font-medium text-sand-100">
                          District Administration (Punjab)
                        </span>
                        <span className="ms-auto inline-flex items-center gap-1 rounded bg-amber-400/15 px-1.5 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-wide text-amber-200">
                          <ShieldAlert className="size-2.5" aria-hidden="true" />
                          Pending verification
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Composer */}
                <div className="relative border-t border-white/10 px-3 py-3">
                  <div className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.07] py-1 pe-1 ps-3 backdrop-blur-sm">
                    <Mic className="size-3.5 shrink-0 text-sand-300/70" aria-hidden="true" />
                    <span className="flex-1 truncate text-[0.75rem] text-sand-200/60">
                      Ask in your language…
                    </span>
                    <span className="rounded-lg bg-accent-500 px-2.5 py-1.5 text-[0.6875rem] font-semibold text-brand-950">
                      Ask
                    </span>
                  </div>
                  <p className="mt-2 text-center text-[0.5625rem] leading-relaxed text-sand-300/45">
                    Demonstration conversation · sample record shown with generic office labels
                  </p>
                </div>
              </div>

              {/* Floating corroboration card — level 3 above the hero object. */}
              <div className="absolute -bottom-5 -start-3 hidden w-44 animate-float-slow panel px-3 py-2.5 sm:block">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-brand-700" aria-hidden="true" />
                  <p className="text-[0.6875rem] font-semibold text-ink-900">Answer checkable</p>
                </div>
                <p className="mt-1 text-[0.625rem] leading-relaxed text-ink-500">
                  Publisher, record and date are always shown.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 2 · Trust strip                                                    */}
      {/* ================================================================== */}
      <section className="border-y border-brand-900/[0.07] bg-paper/70" aria-label="Verification states">
        <div className="container-page flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-500">
            Every record carries one of three states
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge status="verified" />
            <VerificationBadge status="pending_verification" />
            <VerificationBadge status="demo" />
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 3 · How Sahara works                                               */}
      {/* ================================================================== */}
      <section className="relative" aria-labelledby="how-it-works">
        <div className="container-page py-14 sm:py-20">
          <Reveal className="max-w-2xl">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
              How Sahara works
            </p>
            <h2
              id="how-it-works"
              className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-[2rem]"
            >
              Knowledge provides the facts.
              <br />
              <span className="display-serif italic text-brand-800">The AI explains them.</span>
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-600">
              Retrieval happens before generation. That order is what makes an answer checkable — and
              what stops the model from inventing a fee or a form number.
            </p>
          </Reveal>

          {/* Connected pathway: a rule runs through all six stages. */}
          <ol className="mt-10 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
            {pipeline.map((item, index) => (
              <Reveal as="li" key={item.step} delay={index * 60} className="relative">
                <div className="flex items-center gap-3">
                  <span className="relative grid size-10 shrink-0 place-items-center rounded-xl border border-brand-900/10 bg-paper text-brand-800 shadow-1">
                    <item.icon className="size-[1.05rem]" aria-hidden="true" />
                    <span className="absolute -top-1.5 -end-1.5 rounded-full bg-brand-900 px-1.5 py-px text-[0.5625rem] font-bold tabular text-accent-300 ring-2 ring-cream">
                      {item.step}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-gradient-to-r from-brand-900/15 to-transparent"
                  />
                </div>
                <h3 className="mt-3 text-[0.9375rem] font-semibold text-ink-950">{item.title}</h3>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">{item.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 4 · Service universe                                               */}
      {/* ================================================================== */}
      <section
        className="relative overflow-hidden border-y border-brand-900/[0.07] bg-white"
        aria-labelledby="service-universe"
      >
        <div className="pointer-events-none absolute inset-0 grain" aria-hidden="true" />
        <div className="container-page relative py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <Reveal>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
                Service universe
              </p>
              <h2
                id="service-universe"
                className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-[2rem]"
              >
                One place for the errands
                <br />
                <span className="display-serif italic text-brand-800">that take three offices.</span>
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-600">
                Identity papers, utility complaints, welfare schemes and legal basics — organised by what
                you are trying to do, not by which department owns it.
              </p>
              <LinkButton to="/services" variant="outline" className="mt-6" trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}>
                Browse all 16 records
              </LinkButton>
            </Reveal>

            {/* Orbital map on lg+, clean grid below. */}
            <Reveal delay={120}>
              <div className="relative mx-auto hidden aspect-square w-full max-w-[26rem] lg:block">
                {/* Orbit rings */}
                <span className="absolute inset-[9%] rounded-full border border-dashed border-brand-900/15" aria-hidden="true" />
                <span className="absolute inset-[22%] rounded-full border border-brand-900/10" aria-hidden="true" />

                {/* Centre */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <SaharaOrb size={112} />
                </div>

                {serviceUniverse.map((item, index) => {
                  const angle = (index / serviceUniverse.length) * Math.PI * 2 - Math.PI / 2;
                  const radius = 41; // % of container
                  const x = 50 + Math.cos(angle) * radius;
                  const y = 50 + Math.sin(angle) * radius;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-brand-900/10 bg-paper px-3 py-2 text-center shadow-2 shadow-bevel transition-[transform,box-shadow] duration-300 hover:scale-[1.04] hover:shadow-3 focus-visible:scale-[1.04]"
                    >
                      <item.icon className="mx-auto size-3.5 text-brand-700" aria-hidden="true" />
                      <span className="mt-1 block text-[0.75rem] font-semibold leading-none text-ink-900">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block whitespace-nowrap text-[0.625rem] text-ink-500">
                        {item.detail}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile: 2-col grid, no orbits. */}
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:hidden">
                {serviceUniverse.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="flex h-full flex-col rounded-xl border border-brand-900/10 bg-paper p-3 shadow-1 shadow-bevel transition-shadow hover:shadow-2"
                    >
                      <item.icon className="size-4 text-brand-700" aria-hidden="true" />
                      <span className="mt-2 text-[0.8125rem] font-semibold text-ink-950">{item.label}</span>
                      <span className="mt-0.5 text-[0.6875rem] leading-snug text-ink-500">{item.detail}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 5 · Popular records                                                */}
      {/* ================================================================== */}
      <section className="container-page py-14 sm:py-20" aria-labelledby="popular-services">
        <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
              Most requested
            </p>
            <h2 id="popular-services" className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink-950">
              {t('home.popularServices')}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-600">
              Each record lists documents, steps and its source — or says plainly that a detail is not yet
              verified.
            </p>
          </div>
          <LinkButton to="/services" variant="ghost" size="sm" trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}>
            All services
          </LinkButton>
        </Reveal>

        {loading && <CardGridSkeleton count={4} />}
        {!loading && error && (
          <ErrorState title="Unable to load services" message={errorMessage(error)} onRetry={reload} />
        )}
        {!loading && !error && services && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* Secondary tools — deliberately quieter than the records above. */}
        <Reveal className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/applications', label: 'Generate an application', icon: FileText },
            { to: '/readiness', label: 'Check my documents', icon: Gauge },
            { to: '/scam-detector', label: 'Check a suspicious message', icon: ShieldAlert },
            { to: '/complaints', label: 'Draft a complaint', icon: MessagesSquare },
          ].map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group flex items-center gap-2.5 rounded-xl border border-brand-900/[0.07] bg-paper/70 px-3 py-2.5 shadow-1 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-900/15 hover:shadow-2"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-sand-100 text-brand-800 ring-1 ring-brand-900/[0.06]">
                <tool.icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-[0.8125rem] font-medium text-ink-800">{tool.label}</span>
              <ArrowUpRight
                className="size-3.5 shrink-0 text-ink-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-brand-700"
                aria-hidden="true"
              />
            </Link>
          ))}
        </Reveal>
      </section>

      {/* ================================================================== */}
      {/* 6 · Capabilities                                                   */}
      {/* ================================================================== */}
      <section className="border-y border-brand-900/[0.07] bg-white" aria-labelledby="capabilities">
        <div className="container-page py-14 sm:py-20">
          <Reveal className="max-w-2xl">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
              Capabilities and limits
            </p>
            <h2 id="capabilities" className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-[2rem]">
              {t('home.whyTitle')}
            </h2>
          </Reveal>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {capabilities.map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <div className="group flex h-full items-start gap-3.5 rounded-xl border border-brand-900/[0.07] bg-cream/50 p-4 shadow-1 shadow-bevel transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-2">
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset',
                      item.tone === 'green' && 'bg-brand-900 text-accent-300 ring-brand-950/40',
                      item.tone === 'gold' && 'bg-accent-500/15 text-accent-700 ring-accent-500/25',
                      item.tone === 'sand' && 'bg-sand-200/60 text-sand-800 ring-sand-300',
                    )}
                  >
                    <item.icon className="size-[1.05rem]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[0.9375rem] font-semibold text-ink-950">{item.title}</h3>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* The "never" statement gets its own weight — it is not fine print. */}
          <Reveal className="mt-6 overflow-hidden rounded-2xl border border-amber-900/15 bg-amber-50/60">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-800 ring-1 ring-amber-600/20">
                <ShieldAlert className="size-[1.05rem]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.8125rem] font-semibold text-amber-950">
                  Sahara AI is an independent assistant, not a government service.
                </p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-amber-900/85">
                  It does not access government databases, submit applications or complaints, confirm
                  welfare eligibility, or declare a document or message genuine or fake.
                </p>
              </div>
              <Link
                to="/about#disclaimer"
                className="shrink-0 text-[0.8125rem] font-semibold text-amber-900 underline underline-offset-4 hover:text-amber-950"
              >
                Read the disclaimer
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 7 · Coverage                                                       */}
      {/* ================================================================== */}
      <section className="container-page py-14 sm:py-20" aria-labelledby="coverage">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14">
          <Reveal>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
              Coverage
            </p>
            <h2 id="coverage" className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-[2rem]">
              Punjab first.
              <br />
              <span className="display-serif italic text-brand-800">Built to extend.</span>
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-600">
              The knowledge base is authored province by province, because the procedure, the fee and the
              office differ between them. Publishing a Punjab record and a Sindh record as if they were the
              same would be exactly the kind of error this project exists to prevent.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <ul className="divide-y divide-brand-900/[0.07] overflow-hidden rounded-2xl border border-brand-900/[0.07] bg-paper shadow-2 shadow-bevel">
              {scope.map((row) => (
                <li key={row.label} className="flex items-center gap-3 px-4 py-3.5">
                  <Landmark className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.875rem] font-semibold text-ink-950">{row.label}</p>
                    <p className="mt-0.5 text-[0.75rem] text-ink-500">{row.detail}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide ring-1 ring-inset',
                      row.status === 'In review'
                        ? 'bg-amber-50 text-amber-800 ring-amber-200'
                        : 'bg-ink-100 text-ink-600 ring-ink-200',
                    )}
                  >
                    {row.status}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ================================================================== */}
      {/* 8 · Closing CTA                                                    */}
      {/* ================================================================== */}
      <section className="container-page pb-14 sm:pb-20">
        <Reveal className="relative overflow-hidden rounded-3xl panel-night px-6 py-10 sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-50" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-accent-500/20 blur-[90px]"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <SaharaOrb size={44} state="idle" />
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-sand-300/70">
                  Start with a question
                </span>
              </div>
              <h2 className="mt-4 text-[1.6rem] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[2rem]">
                Ask in your own words.
                <br />
                <span className="display-serif italic text-sand-200">In your own language.</span>
              </h2>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-brand-100/85">
                You will get an explanation grounded in a reviewed record — or a clear statement that no
                reliable record exists yet.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <LinkButton
                to="/assistant"
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
                trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}
              >
                {t('nav.talkToSahara')}
              </LinkButton>
              <Link
                to="/about"
                className="text-center text-[0.8125rem] font-medium text-sand-200/80 underline underline-offset-4 hover:text-white sm:text-end"
              >
                How Sahara works
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
