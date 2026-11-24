import { Link } from 'react-router-dom';
import { Bookmark, BookmarkX } from 'lucide-react';
import { Button, LinkButton } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { EmptyState } from '@/components/common/States';
import { useSavedServices } from '@/hooks/useSavedServices';
import { useToast } from '@/components/common/Feedback';
import { formatDateTime } from '@/utils/cn';

export default function SavedServicesPage() {
  const { saved, toggle } = useSavedServices();
  const { toast } = useToast();

  return (
    <SectionCard
      title="Saved services"
      description="Bookmarked service records. Saved items are stored in this browser until an account is connected."
      flush
    >
      {saved.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={<Bookmark className="size-5" />}
            title="No saved services yet"
            description="Open a service record and choose Save service to keep it here."
            action={
              <LinkButton to="/services" size="sm">
                Browse services
              </LinkButton>
            }
          />
        </div>
      ) : (
        <ul className="divide-y divide-ink-100">
          {saved.map((service) => (
            <li key={service.slug} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <Link to={`/services/${service.slug}`} className="text-sm font-medium text-ink-900 hover:text-brand-800 hover:underline">
                  {service.name}
                </Link>
                <p className="text-xs text-ink-500">
                  {service.department} · Saved {formatDateTime(service.savedAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-700 hover:bg-red-50"
                onClick={() => {
                  toggle({
                    id: service.id,
                    slug: service.slug,
                    name: service.name,
                    department: service.department,
                  });
                  toast('Service removed from saved.', 'success');
                }}
                leadingIcon={<BookmarkX className="size-3.5" aria-hidden="true" />}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
