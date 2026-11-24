/**
 * DEMO OFFICE DIRECTORY — NOT YET VERIFIED.
 * Addresses, phone numbers and opening hours are intentionally `null` until a
 * reviewer records them from an official source. The UI renders a "details not
 * yet verified" note rather than inventing a location.
 */
import type { PublicOffice } from '@/types/domain';

function office(
  id: string,
  name: string,
  category: PublicOffice['category'],
  district: string,
  city: string,
): PublicOffice {
  return {
    id,
    name,
    category,
    district,
    city,
    address: null,
    phone: null,
    openingInfo: null,
    source: { publisher: 'Pending — no official source recorded', url: null, lastVerifiedAt: null },
    verification: 'demo',
  };
}

export const demoOffices: PublicOffice[] = [
  office('off-1', 'NADRA Registration Centre — Burewala', 'nadra', 'Burewala', 'Burewala'),
  office('off-2', 'NADRA Registration Centre — Multan Cantt', 'nadra', 'Multan', 'Multan'),
  office('off-3', 'City Police Station — Burewala', 'police', 'Burewala', 'Burewala'),
  office('off-4', 'District Police Lines — Vehari', 'police', 'Vehari', 'Vehari'),
  office('off-5', 'District Headquarters Hospital — Burewala', 'hospital', 'Burewala', 'Burewala'),
  office('off-6', 'District Headquarters Hospital — Sahiwal', 'hospital', 'Sahiwal', 'Sahiwal'),
  office('off-7', 'District & Sessions Court — Vehari', 'court', 'Vehari', 'Vehari'),
  office('off-8', 'District & Sessions Court — Multan', 'court', 'Multan', 'Multan'),
  office('off-9', 'Deputy Commissioner Office / Facilitation Centre — Burewala', 'facilitation', 'Burewala', 'Burewala'),
  office('off-10', 'Deputy Commissioner Office — Lahore', 'facilitation', 'Lahore', 'Lahore'),
  office('off-11', 'Municipal Committee Office — Burewala', 'municipal', 'Burewala', 'Burewala'),
  office('off-12', 'Punjab Police Khidmat Markaz — Faisalabad', 'facilitation', 'Faisalabad', 'Faisalabad'),
];

export const officeCategories: { id: PublicOffice['category']; label: string }[] = [
  { id: 'nadra', label: 'NADRA centres' },
  { id: 'police', label: 'Police' },
  { id: 'hospital', label: 'Hospitals' },
  { id: 'court', label: 'Courts' },
  { id: 'facilitation', label: 'Facilitation centres' },
  { id: 'municipal', label: 'Municipal offices' },
];
