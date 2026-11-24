import { Link } from 'react-router-dom';
import { BrandMark } from '@/components/common/BrandMark';
import { LanguageMenu } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { footerColumns } from '@/components/layout/navigation';

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-ink-200 bg-white">
      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <div>
                <p className="text-sm font-semibold text-ink-900">Sahara AI</p>
                <p className="text-xs text-ink-500">{t('app.tagline')}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-500">{t('footer.disclaimer')}</p>
            <div className="mt-3">
              <LanguageMenu />
            </div>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-700">{column.title}</h2>
              <ul className="space-y-1.5">
                {column.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-600 underline-offset-2 hover:text-brand-800 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-ink-100 pt-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Sahara AI · Final Year Project, University of Agriculture Faisalabad (Burewala Campus)</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link to="/about#privacy" className="hover:text-brand-800 hover:underline">
              Privacy & data
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/about#disclaimer" className="hover:text-brand-800 hover:underline">
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
