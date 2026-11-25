import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { LinkButton } from '@/components/common/Button';
import { BrandMark } from '@/components/common/BrandMark';

/**
 * Route-level error boundary. A crash in one page must not show a white screen
 * to a citizen; it shows a recoverable message and a route home.
 */
export function RouteError() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : null;

  const message =
    status === 404
      ? 'That page could not be found. It may have moved, or the address may be mistyped.'
      : 'Something went wrong while loading this page. Your data has not been submitted anywhere.';

  return (
    <div className="grid min-h-dvh place-items-center surface-page px-4">
      <div className="w-full max-w-md panel-float p-6 text-center">
        <div className="mx-auto mb-3 w-fit">
          <BrandMark className="size-12" />
        </div>
        <h1 className="text-xl font-semibold text-ink-900">
          {status === 404 ? 'Page not found' : 'Unexpected error'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{message}</p>
        {import.meta.env.DEV && error instanceof Error && (
          <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-ink-100 p-2 text-start text-[0.6875rem] text-ink-700">
            {error.message}
          </pre>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <LinkButton to="/" variant="primary">
            Go to home
          </LinkButton>
          <LinkButton to="/services" variant="outline">
            Browse services
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
