/**
 * TextRun — wraps text that needs its own writing direction.
 *
 * This is the whole RTL strategy in one component.
 *
 *   <TextRun>اردو جملہ</TextRun>
 *
 * renders `<bdi dir="rtl" lang="ur">…</bdi>`. Because `<bdi>` is an
 * isolated, inline element:
 *   - the browser lays the Urdu words out right-to-left (correct shaping and
 *     punctuation placement),
 *   - the surrounding flex/grid/nav layout is completely unaffected,
 *   - mixed Urdu + Latin text (e.g. "CNIC نمبر") orders its segments correctly.
 *
 * It is the *only* place `dir` is applied to content, and it never applies to a
 * layout container.
 */
import type { ElementType, ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/utils/cn';

export function TextRun({
  children,
  className,
  as: Tag = 'bdi',
  lang,
  /** Force a direction (e.g. quoting English inside an Urdu sentence). */
  dir,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  lang?: string;
  dir?: 'ltr' | 'rtl';
}) {
  const { language, textDir } = useLanguage();
  const resolvedDir = dir ?? textDir;
  const resolvedLang = lang ?? language;

  return (
    <Tag
      dir={resolvedDir}
      lang={resolvedLang}
      className={cn(resolvedDir === 'rtl' && 'font-arabic-body', className)}
    >
      {children}
    </Tag>
  );
}

/**
 * Bilingual label for the language menu: native name plus its English name.
 * The native part is isolated so "اردو (Urdu)" does not reorder in an LTR list.
 */
export function NativeLabel({ native, className }: { native: string; className?: string }) {
  return (
    <bdi dir="auto" className={cn('font-arabic-body', className)} lang="ur">
      {native}
    </bdi>
  );
}
