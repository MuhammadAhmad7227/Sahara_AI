/**
 * Navigation structure shared by the desktop header, the mobile drawer and the
 * footer, so link groups can never drift apart.
 *
 * Every label carries a `labelKey` into the translation dictionary plus a plain
 * English `label` used as the fallback and for non-React consumers (SEO, tests).
 * The ORDER of these arrays is what guarantees the product requirement that the
 * header reads Home · Services · Assistant · About identically in all three
 * languages — nothing here is ever reversed by language.
 *
 * Admin links are intentionally absent from the public navigation; they are
 * rendered only inside the admin layout for authenticated administrators.
 */
import type { TranslationKey } from '@/i18n';

export interface NavLink {
  /** Translation key; `label` is the English fallback. */
  labelKey: TranslationKey;
  label: string;
  to: string;
  description?: string;
}

export interface NavGroup {
  labelKey: TranslationKey;
  label: string;
  items: NavLink[];
}

export const primaryNav: NavLink[] = [
  { labelKey: 'nav.services', label: 'Services', to: '/services' },
  { labelKey: 'nav.assistant', label: 'Ask AI', to: '/assistant' },
];

export const toolGroups: NavGroup[] = [
  {
    labelKey: 'nav.applications',
    label: 'Applications',
    items: [
      {
        labelKey: 'nav.applications',
        label: 'Application generator',
        to: '/applications',
        description: 'Prepare an editable application draft for a public office.',
      },
      {
        labelKey: 'nav.complaints',
        label: 'Complaint assistant',
        to: '/complaints',
        description: 'Write a structured complaint about a utility or service.',
      },
      {
        labelKey: 'nav.readiness',
        label: 'Readiness checker',
        to: '/readiness',
        description: 'Compare your documents with a stored requirement list.',
      },
    ],
  },
  {
    labelKey: 'nav.tools',
    label: 'Tools',
    items: [
      {
        labelKey: 'nav.scam',
        label: 'Scam detector',
        to: '/scam-detector',
        description: 'Check a suspicious message for known fraud indicators.',
      },
      {
        labelKey: 'nav.documents',
        label: 'Document analyzer',
        to: '/documents',
        description: 'Upload a document for extraction and review flags.',
      },
      {
        labelKey: 'nav.welfare',
        label: 'Welfare assistant',
        to: '/welfare',
        description: 'See programmes whose stored criteria may match your situation.',
      },
    ],
  },
];

export const resourceLinks: NavLink[] = [
  { labelKey: 'nav.emergency', label: 'Emergency centre', to: '/emergency' },
  { labelKey: 'nav.offices', label: 'Office finder', to: '/offices' },
  { labelKey: 'nav.legal', label: 'Legal awareness', to: '/legal' },
  { labelKey: 'nav.lawyers', label: 'Lawyer directory', to: '/lawyers' },
  { labelKey: 'nav.about', label: 'How Sahara AI works', to: '/about' },
  { labelKey: 'nav.feedback', label: 'Contact & feedback', to: '/feedback' },
];

export const toolsMenu: NavGroup[] = [
  ...toolGroups,
  {
    labelKey: 'nav.resources',
    label: 'Resources',
    items: resourceLinks,
  },
];

export const footerColumns: NavGroup[] = [
  {
    labelKey: 'footer.services',
    label: 'Services',
    items: [
      { labelKey: 'nav.services', label: 'Service catalogue', to: '/services' },
      { labelKey: 'nav.assistant', label: 'Ask Sahara AI', to: '/assistant' },
      { labelKey: 'nav.readiness', label: 'Readiness checker', to: '/readiness' },
      { labelKey: 'nav.welfare', label: 'Welfare assistant', to: '/welfare' },
    ],
  },
  {
    labelKey: 'footer.tools',
    label: 'Tools',
    items: [
      { labelKey: 'nav.applications', label: 'Application generator', to: '/applications' },
      { labelKey: 'nav.complaints', label: 'Complaint assistant', to: '/complaints' },
      { labelKey: 'nav.scam', label: 'Scam detector', to: '/scam-detector' },
      { labelKey: 'nav.documents', label: 'Document analyzer', to: '/documents' },
    ],
  },
  {
    labelKey: 'footer.information',
    label: 'Information',
    items: [
      { labelKey: 'nav.emergency', label: 'Emergency centre', to: '/emergency' },
      { labelKey: 'nav.offices', label: 'Office finder', to: '/offices' },
      { labelKey: 'nav.legal', label: 'Legal awareness', to: '/legal' },
      { labelKey: 'nav.lawyers', label: 'Lawyer directory', to: '/lawyers' },
    ],
  },
  {
    labelKey: 'footer.project',
    label: 'Project',
    items: [
      { labelKey: 'nav.about', label: 'How Sahara AI works', to: '/about' },
      { labelKey: 'nav.feedback', label: 'Contact & feedback', to: '/feedback' },
      { labelKey: 'footer.privacy', label: 'Privacy & data', to: '/about#privacy' },
      { labelKey: 'footer.terms', label: 'Terms & disclaimer', to: '/about#disclaimer' },
    ],
  },
];
