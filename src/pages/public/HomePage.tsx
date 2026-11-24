import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  FileText,
  Gauge,
  Languages,
  Mic,
  MessagesSquare,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { LinkButton } from '@/components/common/Button';
import { Badge, VerificationBadge } from '@/components/common/Badge';
import { CardGridSkeleton, ErrorState } from '@/components/common/States';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAsync } from '@/hooks/useAsync';
import { getPopularServices } from '@/services/api/services';
import { errorMessage } from '@/services/api/errors';
import { cn } from '@/utils/cn';

const quickActions = [
  { to: '/assistant', label: 'Ask AI', description: 'A question in your own words, in your language.', icon: MessagesSquare },
  { to: '/services', label: 'Find a service', description: 'Browse reviewed public-service records.', icon: BookOpenCheck },
  { to: '/applications', label: 'Generate application', description: 'Prepare an editable draft for an office.', icon: FileText },
  { to: '/readiness', label: 'Check documents', description: 'Compare your papers with a checklist.', icon: Gauge },
  { to: '/scam-detector', label: 'Detect a scam', description: 'Check a suspicious SMS or WhatsApp message.', icon: ShieldAlert },
  { to: '/complaints', label: 'Draft a complaint', description: 'Write a clear complaint about a service.', icon: ScrollText },
];

const whyPoints = [
  { title: 'Grounded in reviewed records', body: 'Answers come from records a reviewer has checked, with the publisher and the date checked shown next to them.', icon: ShieldCheck },
  { title: 'Plain language, three languages', body: 'Urdu, Punjabi and English, with a right-to-left interface and a voice input where your browser supports it.', icon: Languages },
  { title: 'Guided tasks, not just answers', body: 'Drafts, checklists and complaint templates help you finish the task after you understand it.', icon: Sparkles },
  { title: 'Honest about the limits', body: 'When no reviewed record exists, Sahara AI says so instead of inventing a fee, a form or a phone number.', icon: BadgeCheck },
];

const pipeline = [
  { step: '01', title: 'You ask', body: 'Type or speak your question in Urdu, Punjabi or English.' },
  { step: '02', title: 'Reviewed records are retrieved', body: 'Sahara AI searches the curated knowledge base, not the open internet.' },
  { step: '03', title: 'The AI explains', body: 'The model explains only what the retrieved record contains.' },
  { step: '04', title: 'You see the source and act', body: 'The publisher and the date checked are shown, with a tool to help you complete the task.' },
];

export default function HomePage() {
  const { t } = useLanguage();
  useDocumentTitle(
    'Sahara AI — Civic, legal and public service guidance for Pakistan',
    'Ask about public services in Urdu, Punjabi or English and get source-referenced answers, application drafts, document readiness checks and scam indicators.',
  );

  const { data: services, loading, error, reload } = useAsync(() => getPopularServices(4), []);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden border-b border-ink-200 bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 60% 60% at 85% 0%, var(--color-brand-100), transparent 60%), radial-gradient(ellipse 50% 50% at 0% 100%, var(--color-sand-100), transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div className="container-page relative py-12 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-900">
                <span className="size-1.5 rounded-full bg-brand-600" aria-hidden="true" />
                {t('home.eyebrow')}
              </p>

              <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.18] tracking-tight text-ink-950 sm:text-4xl lg:text-[2.9rem]">
                Your AI-powered guide to public services, applications, complaints and civic information.
              </h1>

              <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink-600 sm:text-base">
                {t('home.subtitle')}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <LinkButton to="/assistant" size="lg" trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}>
                  {t('home.primaryCta')}
                </LinkButton>
                <LinkButton to="/services" size="lg" variant="outline">
                  {t('home.secondaryCta')}
                </LinkButton>
              </div>

              <dl className="mt-8 grid max-w-lg grid-cols-1 gap-4 border-t border-ink-200 pt-5 min-[380px]:grid-cols-3">
                <div>
                  <dt className="text-xs text-ink-500">Languages</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink-900">Urdu · Punjabi · English</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-500">Every answer shows</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink-900">Source + date checked</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-500">Access</dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink-900">Free, no account needed</dd>
                </div>
              </dl>
            </div>

            {/* Voice / assistant visual */}
            <div className="relative">
              <div className="rounded-2xl border border-ink-200 bg-white p-4 shadow-raised sm:p-5">
                <div className="flex items-center justify-between gap-2 border-b border-ink-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-900 text-white" aria-hidden="true">
                      <Sparkles className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-900">Sahara AI assistant</p>
                      <p className="text-[0.6875rem] text-ink-500">Grounded in reviewed records</p>
                    </div>
                  </div>
                  <Badge tone="brand">Demo</Badge>
                </div>

                <div className="space-y-2.5 py-3.5" aria-hidden="true">
                  <div className="ms-auto max-w-[85%] rounded-xl rounded-ee-sm bg-brand-900 px-3 py-2 text-sm text-white">
                    Mujhe domicile banwana hai, kya documents chahiye?
                  </div>
                  <div className="max-w-[92%] rounded-xl rounded-es-sm bg-ink-100 px-3 py-2.5 text-sm text-ink-800">
                    <p>
                      The reviewed record lists a CNIC copy, proof of residence and photographs as
                      required documents. Fee information is not currently verified.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-ink-200 pt-2 text-[0.6875rem]">
                      <span className="font-semibold uppercase tracking-wider text-ink-500">Source</span>
                      <span className="rounded bg-white px-1.5 py-0.5 text-ink-700 ring-1 ring-ink-200">
                        District Administration
                      </span>
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-800 ring-1 ring-amber-200">
                        Pending verification
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 p-1.5">
                  <Mic className="ms-1 size-4 text-brand-800" aria-hidden="true" />
                  <span className="flex-1 text-xs text-ink-500">Ask in your language…</span>
                  <span className="rounded-md bg-brand-900 px-2.5 py-1.5 text-xs font-medium text-white">
                    {t('action.askAi')}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[0.6875rem] leading-relaxed text-amber-900">
                This is a demonstration build. Records show a verification badge and the date they were
                checked; demonstration records are labelled <strong>Demo data</strong>.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Quick actions                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="container-page py-10 sm:py-12" aria-labelledby="quick-actions">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 id="quick-actions" className="text-xl font-semibold tracking-tight text-ink-900">
              {t('home.quickActions')}
            </h2>
            <p className="mt-1 text-sm text-ink-600">Six tools, one place. No account required to start.</p>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <li key={action.to}>
              <Link
                to={action.to}
                className="group relative flex h-full items-start gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-raised"
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-800 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-900 group-hover:text-white"
                  aria-hidden="true"
                >
                  <action.icon className="size-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-semibold text-ink-900">
                    {action.label}
                    <ArrowRight
                      className="size-3.5 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700 dir-arrow"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{action.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* How it works                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-ink-200 bg-white" aria-labelledby="how-it-works">
        <div className="container-page py-10 sm:py-14">
          <div className="max-w-2xl">
            <h2 id="how-it-works" className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
              {t('home.howItWorks')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Sahara AI is retrieval-augmented: the model explains, and the reviewed knowledge base
              supplies the facts. That order is what makes the answer checkable.
            </p>
          </div>

          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pipeline.map((item) => (
              <li key={item.step} className="relative rounded-xl border border-ink-200 bg-ink-50/60 p-4">
                <span className="text-xs font-semibold tabular text-brand-700">{item.step}</span>
                <h3 className="mt-1.5 text-sm font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Popular services                                                   */}
      {/* ------------------------------------------------------------------ */}
      <section className="container-page py-10 sm:py-12" aria-labelledby="popular-services">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="popular-services" className="text-xl font-semibold tracking-tight text-ink-900">
              {t('home.popularServices')}
            </h2>
            <p className="mt-1 text-sm text-ink-600">
              Each record lists documents, steps and its source — or says plainly that a detail is not yet
              verified.
            </p>
          </div>
          <LinkButton to="/services" variant="ghost" size="sm" trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}>
            All services
          </LinkButton>
        </div>

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
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Why Sahara AI                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section className="border-y border-ink-200 bg-white" aria-labelledby="why-sahara">
        <div className="container-page py-10 sm:py-14">
          <h2 id="why-sahara" className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
            {t('home.whyTitle')}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {whyPoints.map((point) => (
              <div key={point.title} className="flex items-start gap-3 rounded-xl border border-ink-200 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sand-100 text-sand-800" aria-hidden="true">
                  <point.icon className="size-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">{point.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{point.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Trust / safety                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="container-page py-10 sm:py-14" aria-labelledby="trust">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
          <div>
            <h2 id="trust" className="text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl">
              {t('home.trustTitle')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Sahara AI is a civic assistant, not a government service. Being clear about that is part of the
              design, not a footnote.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <VerificationBadge status="verified" />
              <VerificationBadge status="pending_verification" />
              <VerificationBadge status="demo" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-emerald-900">
                <ShieldCheck className="size-4" aria-hidden="true" /> What it does
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-emerald-900/90">
                <li>· Explains reviewed public information with its source and date checked.</li>
                <li>· Prepares editable drafts that you review and submit yourself.</li>
                <li>· Compares your documents against a stored checklist.</li>
                <li>· Explains why a message looks suspicious.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                <ShieldAlert className="size-4" aria-hidden="true" /> What it never does
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-amber-900/90">
                <li>· Access government databases or private records.</li>
                <li>· Submit an application, complaint or FIR for you.</li>
                <li>· Tell you that a document or message is definitively genuine or fake.</li>
                <li>· Confirm welfare eligibility or guarantee an outcome.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Closing CTA                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="container-page pb-14">
        <div className={cn('overflow-hidden rounded-2xl bg-brand-900 px-6 py-8 text-white sm:px-10 sm:py-10')}>
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Start with a question.</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-100">
                Ask in Urdu, Punjabi or English. You will get an explanation grounded in a reviewed record
                — or a clear statement that no reliable record exists.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <LinkButton to="/assistant" variant="secondary" size="lg">
                {t('home.primaryCta')}
              </LinkButton>
              <LinkButton
                to="/about"
                size="lg"
                variant="ghost"
                className="text-brand-100 hover:bg-brand-800 hover:text-white"
              >
                How it works
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
