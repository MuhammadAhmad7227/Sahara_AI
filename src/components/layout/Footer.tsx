import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/common/BrandMark';
import { LanguageMenu } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { footerColumns } from '@/components/layout/navigation';

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-brand-950/40 bg-brand-950 text-sand-100">
      <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-40" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -start-24 -top-32 size-72 rounded-full bg-brand-700/25 blur-[100px]"
        aria-hidden="true"
      />
      <div className="container-page relative py-12">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <div>
                <p className="text-sm font-semibold text-white">Sahara AI</p>
                <p className="text-[0.6875rem] uppercase tracking-[0.12em] text-sand-300/60">Civic assistant</p>
              </div>
            </div>
            <p className="mt-3.5 max-w-xs text-xs leading-relaxed text-sand-200/70">{t('footer.disclaimer')}</p>
            <div className="mt-4 inline-flex rounded-lg bg-white/[0.07] p-0.5 text-sand-100 ring-1 ring-white/10 [&_button]:text-sand-100 [&_button:hover]:bg-white/10">
              <LanguageMenu />
            </div>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-sand-300/60">{column.title}</h2>
              <ul className="space-y-1.5">
                {column.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      className="text-[0.8125rem] text-sand-100/75 underline-offset-4 transition-colors hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-[0.6875rem] text-sand-300/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Sahara AI · Final Year Project, University of Agriculture Faisalabad (Burewala Campus)</p>
          <p className="hidden sm:block" aria-hidden="true">
            ·
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link to="/about#privacy" className="transition-colors hover:text-white hover:underline">
              Privacy & data
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/about#disclaimer" className="transition-colors hover:text-white hover:underline">
              Disclaimer
            </Link>
            <span aria-hidden="true">·</span>
            <span>Frontend development build — demo data</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
