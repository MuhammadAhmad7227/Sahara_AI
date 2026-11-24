import { LinkButton } from '@/components/common/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-12">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950">This page could not be found</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          The address may be mistyped, or the page may have moved. Nothing has been submitted or lost.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <LinkButton to="/">Go to home</LinkButton>
          <LinkButton to="/services" variant="outline">
            Browse services
          </LinkButton>
          <LinkButton to="/assistant" variant="ghost">
            Ask Sahara AI
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
