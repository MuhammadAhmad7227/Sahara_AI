import { History } from 'lucide-react';
import { LinkButton } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { EmptyState, InlineNotice } from '@/components/common/States';
import { readRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { formatDateTime } from '@/utils/cn';

export default function HistoryPage() {
  const viewed = readRecentlyViewed();

  return (
    <div className="space-y-4">
      <SectionCard title="Recently viewed services" description="Kept in this browser to help you return to a record." flush>
        {viewed.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<History className="size-5" />}
              title="No history yet"
              description="Services you open are listed here for quick access."
              action={
                <LinkButton to="/services" size="sm">
                  Browse services
                </LinkButton>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {viewed.map((item) => (
              <li key={item.slug} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-500">{item.department}</p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-ink-500">{formatDateTime(item.viewedAt)}</p>
                  <LinkButton to={`/services/${item.slug}`} variant="ghost" size="sm">
                    Open
                  </LinkButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Analyses and assistant history" description="Scam analyses, document analyses and assistant conversations.">
        <InlineNotice tone="info" title="Not stored in this build">
          <p>
            Analysis history is saved to your account once authentication and the backend are connected. Until then,
            scam and document analyses are shown only for the current session, and the assistant keeps its
            conversation in this tab.
          </p>
        </InlineNotice>
      </SectionCard>
    </div>
  );
}
