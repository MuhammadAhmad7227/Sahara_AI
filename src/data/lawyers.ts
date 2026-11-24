/**
 * DEMO LAWYER DIRECTORY — ILLUSTRATIVE LISTINGS ONLY.
 * These are fictional demonstration profiles. No real person is represented and
 * no contact information is included. The directory exists to show the search
 * and filter interface; a real directory requires a documented verification
 * method before any listing is shown as verified.
 */
import type { Lawyer } from '@/types/domain';

export const demoLawyers: Lawyer[] = [
  {
    id: 'law-1',
    name: 'Demo profile — Civil & property matters',
    city: 'Multan',
    specializations: ['Property', 'Civil litigation'],
    experienceYears: 12,
    contactNote: 'Contact details are collected only for verified listings.',
    verificationStatus: 'listed',
    profileSummary:
      'Illustrative listing showing how a civil and property practice profile appears in the directory.',
  },
  {
    id: 'law-2',
    name: 'Demo profile — Family law',
    city: 'Burewala',
    specializations: ['Family', 'Guardianship'],
    experienceYears: 8,
    contactNote: 'Contact details are collected only for verified listings.',
    verificationStatus: 'listed',
    profileSummary:
      'Illustrative listing for family matters, including maintenance and guardianship questions.',
  },
  {
    id: 'law-3',
    name: 'Demo profile — Criminal defence',
    city: 'Vehari',
    specializations: ['Criminal', 'Police matters'],
    experienceYears: 15,
    contactNote: 'Contact details are collected only for verified listings.',
    verificationStatus: 'listed',
    profileSummary: 'Illustrative listing for criminal defence and police-station related matters.',
  },
  {
    id: 'law-4',
    name: 'Demo profile — Labour & employment',
    city: 'Faisalabad',
    specializations: ['Employment', 'Industrial relations'],
    experienceYears: 6,
    contactNote: 'Contact details are collected only for verified listings.',
    verificationStatus: 'unverified',
    profileSummary: 'Illustrative listing for wage, termination and workplace-safety questions.',
  },
  {
    id: 'law-5',
    name: 'Demo profile — Consumer protection',
    city: 'Lahore',
    specializations: ['Consumer', 'Contracts'],
    experienceYears: 9,
    contactNote: 'Contact details are collected only for verified listings.',
    verificationStatus: 'listed',
    profileSummary: 'Illustrative listing for consumer complaints and contract disputes.',
  },
  {
    id: 'law-6',
    name: 'Demo profile — Land revenue',
    city: 'Sahiwal',
    specializations: ['Land records', 'Revenue'],
    experienceYears: 11,
    contactNote: 'Contact details are collected only for verified listings.',
    verificationStatus: 'listed',
    profileSummary: 'Illustrative listing for Fard, mutation and land-record disputes.',
  },
];

export const lawyerCities = Array.from(new Set(demoLawyers.map((l) => l.city))).sort();

export const lawyerSpecializations = Array.from(
  new Set(demoLawyers.flatMap((l) => l.specializations)),
).sort();
