/**
 * Navigation structure shared by the desktop header, the mobile drawer and the
 * footer, so link groups can never drift apart.
 *
 * Admin links are intentionally absent from the public navigation; they are
 * rendered only inside the admin layout for authenticated administrators.
 */
import type { TranslationKey } from '@/i18n/dictionaries';

export interface NavLink {
  /** Present when the label is a translated key; plain labels are English-only. */
  labelKey?: TranslationKey;
  label: string;
  to: string;
  description?: string;
}

export interface NavGroup {
  labelKey?: TranslationKey;
  label: string;
  items: NavLink[];
}

export const primaryNav: { label: string; to: string }[] = [
  { label: 'Services', to: '/services' },
  { label: 'Ask AI', to: '/assistant' },
];

export const toolGroups: NavGroup[] = [
  {
    labelKey: 'nav.applications',
    label: 'Applications',
    items: [
      {
        label: 'Application generator',
        to: '/applications',
        description: 'Prepare an editable application draft for a public office.',
      },
      {
        label: 'Complaint assistant',
        to: '/complaints',
        description: 'Write a structured complaint about a utility or service.',
      },
      {
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
        label: 'Scam detector',
        to: '/scam-detector',
        description: 'Check a suspicious message for known fraud indicators.',
      },
      {
        label: 'Document analyzer',
        to: '/documents',
        description: 'Upload a document for extraction and review flags.',
      },
      {
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

export const footerColumns: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Services',
    links: [
      { label: 'Service catalogue', to: '/services' },
      { label: 'Ask Sahara AI', to: '/assistant' },
      { label: 'Readiness checker', to: '/readiness' },
      { label: 'Welfare assistant', to: '/welfare' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { label: 'Application generator', to: '/applications' },
      { label: 'Complaint assistant', to: '/complaints' },
      { label: 'Scam detector', to: '/scam-detector' },
      { label: 'Document analyzer', to: '/documents' },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'Emergency centre', to: '/emergency' },
      { label: 'Office finder', to: '/offices' },
      { label: 'Legal awareness', to: '/legal' },
      { label: 'Lawyer directory', to: '/lawyers' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'How Sahara AI works', to: '/about' },
      { label: 'Contact & feedback', to: '/feedback' },
      { label: 'Privacy & data', to: '/about#privacy' },
      { label: 'Terms & disclaimer', to: '/about#disclaimer' },
    ],
  },
];
