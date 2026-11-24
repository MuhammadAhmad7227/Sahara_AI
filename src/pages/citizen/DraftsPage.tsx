import { useState } from 'react';
import { Copy, FileText, PenLine, Printer, Trash2 } from 'lucide-react';
import { LinkButton } from '@/components/common/Button';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal, useToast } from '@/components/common/Feedback';
import { SectionCard } from '@/components/common/Card';
import { EmptyState, ErrorState, TableSkeleton } from '@/components/common/States';
import { DraftDocument } from '@/components/applications/DraftDocument';
import { useAsync } from '@/hooks/useAsync';
import { deleteDraft, listDrafts } from '@/services/api/applications';
import { errorMessage } from '@/services/api/errors';
import { copyText, formatDateTime } from '@/utils/cn';
import type { ApplicationDraft } from '@/types/domain';

export default function DraftsPage() {
  const { data, loading, error, reload } = useAsync(() => listDrafts(), []);
  const { toast } = useToast();
  const [open, setOpen] = useState<ApplicationDraft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ApplicationDraft | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteDraft(confirmDelete.id);
      toast('Draft deleted from this browser.', 'success');
      setConfirmDelete(null);
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Saved drafts"
        description="Drafts are demonstrations stored locally — no government office has received them."
        action={
          <LinkButton to="/applications" size="sm" leadingIcon={<PenLine className="size-4" aria-hidden="true" />}>
            New draft
          </LinkButton>
        }
        flush
      >
        {loading && <TableSkeleton rows={3} />}
        {!loading && error && <div className="p-4"><ErrorState message={errorMessage(error)} onRetry={reload} /></div>}
        {!loading && !error && data && data.length === 0 && (
          <div className="p-4">
            <EmptyState
              icon={<FileText className="size-5" />}
              title="No saved drafts yet"
              description="Generate an application or complaint draft and save it to see it here."
              action={
                <LinkButton to="/applications" size="sm">
                  Generate a draft
                </LinkButton>
              }
            />
          </div>
        )}
        {!loading && !error && data && data.length > 0 && (
          <ul className="divide-y divide-ink-100">
            {data.map((draft) => (
              <li key={draft.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink-900">{draft.templateName}</p>
                    <Badge tone={draft.category === 'complaint' ? 'warning' : 'neutral'}>{draft.category}</Badge>
                    <Badge tone="info">Stored in browser</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {draft.department} · Updated {formatDateTime(draft.updatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setOpen(draft)}>
                    Open
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      void copyText(draft.body).then((ok) =>
                        toast(ok ? 'Draft copied.' : 'Copy failed.', ok ? 'success' : 'warning'),
                      );
                    }}
                    aria-label={`Copy ${draft.templateName}`}
                  >
                    <Copy className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(draft)}
                    aria-label={`Delete ${draft.templateName}`}
                    className="text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <Modal
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.templateName ?? 'Draft'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => window.print()} leadingIcon={<Printer className="size-4" aria-hidden="true" />}>
              Print
            </Button>
            <Button onClick={() => setOpen(null)}>Close</Button>
          </>
        }
      >
        {open && <DraftDocument draft={open} />}
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete this draft?"
        description="It will be removed from this browser permanently. You cannot undo this."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => void handleDelete()} loading={deleting}>
              Delete draft
            </Button>
          </>
        }
      />
    </div>
  );
}
