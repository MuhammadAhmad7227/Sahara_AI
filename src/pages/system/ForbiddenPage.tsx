import { ShieldOff } from 'lucide-react';
import { LinkButton } from '@/components/common/Button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuth } from '@/contexts/AuthContext';

export default function ForbiddenPage() {
  useDocumentTitle('Access denied');
  const { user } = useAuth();

  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-12">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-amber-50 text-amber-700" aria-hidden="true">
          <ShieldOff className="size-6" />
        </span>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand-700">403</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950">You do not have permission</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          {user
            ? 'This area is limited to administrators. If you believe you should have access, contact the project administrator.'
            : 'Please log in with an administrator account to open this area.'}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <LinkButton to="/">Go to home</LinkButton>
          {!user && <LinkButton to="/login" variant="outline">Log in</LinkButton>}
        </div>
      </div>
    </div>
  );
}
