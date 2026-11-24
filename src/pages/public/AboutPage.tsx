import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  BookOpenCheck,
  Database,
  FileText,
  GitBranch,
  Languages,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { LinkButton } from '@/components/common/Button';
import { PageHeader, Prose } from '@/components/common/Feedback';
import { InlineNotice } from '@/components/common/States';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const pipeline = [
  {
    title: 'You ask',
    body: 'A question typed in Urdu, Punjabi or English — or spoken, where the browser supports speech recognition, with the transcript shown for confirmation.',
    icon: UserCheck,
  },
  {
    title: 'The reviewer-maintained knowledge base is searched',
    body: 'Sahara AI retrieves reviewed service records: required documents, ordered steps, verified fees where confirmed, and the official source for each.',
    icon: Database,
  },
  {
    title: 'The AI explains, it does not invent',
    body: 'A language model explains the retrieved record in your language. It is instructed not to introduce facts absent from the record.',
    icon: Sparkles,
  },
  {
    title: 'The source and date are shown',
    body: 'Every answer carries the publisher, the source title and the date it was last checked. If nothing reliable is found, the assistant says so.',
    icon: BadgeCheck,
  },
];

const guardrails = [
  { title: 'Drafts, not filings', body: 'Generated applications and complaints carry a visible draft label. They are never submitted anywhere by Sahara AI.', icon: FileText },
  { title: 'Indicators, not verdicts', body: 'Scam analysis reports wording patterns and safety steps. It does not prove that a message is fraudulent.', icon: ShieldCheck },
  { title: 'Review, not certification', body: 'The document analyzer extracts text and flags items for review. It does not certify a document as genuine.', icon: BookOpenCheck },
  { title: 'Matching, not eligibility', body: 'The welfare assistant shows programmes whose stored criteria may match. The programme authority decides.', icon: RefreshCw },
  { title: 'No private records', body: 'Sahara AI does not access government databases, does not track application status, and does not query your records.', icon: Lock },
  { title: 'Three languages, one system', body: 'Urdu, Punjabi and English share one interface and one knowledge base. Urdu and Punjabi are laid out right-to-left.', icon: Languages },
];

export default function AboutPage() {
  useDocumentTitle(
    'How Sahara AI works',
    'How Sahara AI grounds civic answers in reviewed public records, displays sources and verification dates, and states the limits of what it can claim.',
  );

  return (
    <div className="container-page py-8">
      <PageHeader
        eyebrow="About the project"
        title="How Sahara AI works — and what it will not do"
        description="Sahara AI is a Final Year Project from the Department of Computer Science, University of Agriculture Faisalabad (Burewala Campus). It is built so that a citizen can check every procedural claim against a reviewed source."
      />

      <section className="mt-8" aria-labelledby="architecture">
        <h2 id="architecture" className="text-lg font-semibold text-ink-900">
          The path of an answer
        </h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2">
          {pipeline.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-ink-200 bg-white p-4 shadow-card">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-800" aria-hidden="true">
                  <step.icon className="size-4" />
                </span>
                <span className="text-xs font-semibold tabular text-brand-700">Step {index + 1}</span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8" aria-labelledby="guardrails">
        <h2 id="guardrails" className="text-lg font-semibold text-ink-900">
          Guardrails built into the product
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guardrails.map((item) => (
            <div key={item.title} className="rounded-xl border border-ink-200 bg-white p-4">
              <item.icon className="size-4 text-brand-700" aria-hidden="true" />
              <h3 className="mt-1.5 text-sm font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2" aria-labelledby="verification-workflow">
        <div>
          <h2 id="verification-workflow" className="text-lg font-semibold text-ink-900">
            The verification workflow
          </h2>
          <Prose className="mt-2">
            <p>
              A service record is created only after an official department page or document has been located and
              compared with the stored content. It then moves through review before it is published.
            </p>
          </Prose>
          <ol className="mt-3 space-y-2">
            {['Draft', 'Pending review', 'Approved', 'Published'].map((stage, index) => (
              <li key={stage} className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm">
                <span className="grid size-6 place-items-center rounded-full bg-brand-900 text-[0.625rem] font-semibold text-white" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="font-medium text-ink-800">{stage}</span>
                <span className="ms-auto text-xs text-ink-500">
                  {index === 0 && 'Content entered by an administrator'}
                  {index === 1 && 'Reviewer compares it with the official source'}
                  {index === 2 && 'Source URL, date checked and reviewer recorded'}
                  {index === 3 && 'Visible to citizens with its provenance'}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink-500">
            <GitBranch className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            Every change to a published record is written to an audit log with the previous and new value.
          </p>
        </div>

        <div className="scroll-mt-24 space-y-4" id="privacy">
          <h2 className="text-lg font-semibold text-ink-900">Privacy and data</h2>
          <Prose>
            <p>
              Registration collects a name, an email address and a preferred language. No CNIC number is required to
              use the platform.
            </p>
            <p>
              Passwords are hashed on the server with Argon2 or bcrypt; the frontend never stores a password. Uploaded
              documents are restricted by type and size and are processed only after you give consent. Temporary files
              follow a stated retention rule.
            </p>
            <p>
              You can delete your saved drafts and analyses from your dashboard at any time. In this development build
              those items are stored in your own browser, so clearing them deletes them locally.
            </p>
          </Prose>

          <div id="disclaimer" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-ink-900">Disclaimer</h2>
            <InlineNotice tone="warning" className="mt-2">
              <p>
                Sahara AI provides general information based on reviewed public sources. It is not a government
                service, does not issue certificates, does not submit applications, and does not provide legal advice.
                Always confirm requirements, fees and eligibility with the relevant official authority.
              </p>
            </InlineNotice>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-ink-200 bg-white p-5" aria-labelledby="team">
        <h2 id="team" className="text-lg font-semibold text-ink-900">
          Project team
        </h2>
        <p className="mt-1 text-sm text-ink-600">
          Two-member BSCS Final Year Project, session 2026–27. Frontend developed with React, TypeScript and Tailwind
          CSS; the planned backend uses FastAPI and PostgreSQL with a hosted language-model API.
        </p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-ink-500">Student 1</dt>
            <dd className="font-medium text-ink-900">Muhammad Ahmad · 2023-ag-7227</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Student 2</dt>
            <dd className="font-medium text-ink-900">Rana Husnain Ali · 2023-ag-7181</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Supervisor</dt>
            <dd className="font-medium text-ink-900">Dr Muhammad Ahmad</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Committee</dt>
            <dd className="font-medium text-ink-900">Mrs. Sidra Habib · Mr. Waqas Ahmad</dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <LinkButton to="/assistant">Try the assistant</LinkButton>
        <LinkButton to="/services" variant="outline">
          Browse services
        </LinkButton>
        <Link to="/feedback" className="inline-flex h-11 items-center px-3 text-sm font-medium text-brand-800 hover:underline">
          Report a correction
        </Link>
      </div>
    </div>
  );
}
