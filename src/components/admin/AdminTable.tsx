/**
 * DataTable for admin screens.
 * Desktop: a real <table> with scrollable overflow.
 * Mobile:  the table collapses to stacked cards, because a squeezed table is
 *          unusable on a phone (spec §32). Both views render the same data.
 */
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  /** Cell renderer for the table view. */
  cell: (row: T) => ReactNode;
  /** Right-aligned numeric/action column. */
  align?: 'start' | 'end';
  /** Hide below md if the table is dense. */
  hideBelow?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  actions?: (row: T) => ReactNode;
  empty?: ReactNode;
}

export function DataTable<T>({ columns, rows, rowKey, caption, actions, empty }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <div className="p-4">{empty}</div>;
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50/70 text-start">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500',
                    col.align === 'end' ? 'text-end' : 'text-start',
                    col.hideBelow === 'md' && 'hidden md:table-cell',
                    col.hideBelow === 'lg' && 'hidden lg:table-cell',
                  )}
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th scope="col" className="px-3 py-2.5 text-end text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-3 py-2.5 align-middle text-ink-700',
                      col.align === 'end' ? 'text-end' : 'text-start',
                      col.hideBelow === 'md' && 'hidden md:table-cell',
                      col.hideBelow === 'lg' && 'hidden lg:table-cell',
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
                {actions && <td className="px-3 py-2.5 text-end">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-ink-100 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="space-y-1.5 px-3 py-3">
            {columns.map((col, index) => (
              <div
                key={col.key}
                className={cn('flex items-start justify-between gap-3 text-sm', index === 0 && 'font-medium text-ink-900')}
              >
                <span className="shrink-0 text-xs uppercase tracking-wide text-ink-400">{col.header}</span>
                <span className={cn('min-w-0 text-end text-ink-700', index === 0 && 'font-medium text-ink-900')}>
                  {col.cell(row)}
                </span>
              </div>
            ))}
            {actions && <div className="flex justify-end border-t border-ink-100 pt-2">{actions(row)}</div>}
          </li>
        ))}
      </ul>
    </>
  );
}
