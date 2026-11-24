/**
 * DEMO WELFARE SCHEMES — NOT YET VERIFIED.
 * Eligibility rules here are illustrative matching rules for the frontend demo.
 * The Welfare Assistant never states that a person is eligible; it reports which
 * stored criteria appear to match and directs the person to the programme.
 */
import type { WelfareScheme } from '@/types/domain';

export const demoWelfareSchemes: WelfareScheme[] = [
  {
    id: 'wel-bisp-cash',
    name: 'Benazir Income Support Programme — Cash Transfer',
    provider: 'Benazir Income Support Programme (BISP)',
    description:
      'A federal unconditional cash transfer programme for low-income households, delivered through district registration centres.',
    eligibilitySummary:
      'Household income assessed through the programme’s own survey; household circumstances and district registration are considered by the programme.',
    districts: 'all',
    householdSizeMin: 1,
    incomeBands: ['under_25k', '25k_50k'],
    requiredDocuments: ['Original CNIC', 'B-Form for children', 'Household information'],
    officialSource: {
      publisher: 'BISP',
      url: null,
      lastVerifiedAt: null,
    },
    verification: 'demo',
    status: 'approved',
  },
  {
    id: 'wel-sehat',
    name: 'Sehat Sahulat / Health Card Programme',
    provider: 'Provincial health authority',
    description:
      'A health coverage programme for eligible families, used for specified procedures at empanelled hospitals.',
    eligibilitySummary:
      'Eligibility is assessed by the programme using its own registry. Coverage limits and empanelled hospitals change and must be confirmed with the programme.',
    districts: 'all',
    householdSizeMin: 1,
    incomeBands: ['under_25k', '25k_50k', 'prefer_not_to_say'],
    requiredDocuments: ['CNIC', 'Programme registration status'],
    officialSource: {
      publisher: 'Provincial health authority',
      url: null,
      lastVerifiedAt: null,
    },
    verification: 'demo',
    status: 'approved',
  },
  {
    id: 'wel-zakat',
    name: 'Zakat Assistance (Provincial Zakat Council)',
    provider: 'Provincial Zakat Council',
    description:
      'Monthly Zakat assistance for eligible families, distributed through local Zakat committees.',
    eligibilitySummary:
      'Households below the Zakat nisab assessed by the local Zakat committee; eligibility is determined by the committee, not by Sahara AI.',
    districts: 'all',
    householdSizeMin: 1,
    incomeBands: ['under_25k'],
    requiredDocuments: ['CNIC', 'Household particulars', 'Local committee verification'],
    officialSource: {
      publisher: 'Provincial Zakat Council',
      url: null,
      lastVerifiedAt: null,
    },
    verification: 'demo',
    status: 'approved',
  },
  {
    id: 'wel-drf',
    name: 'Punjab Disaster Relief / Emergency Cash Assistance',
    provider: 'Provincial Disaster Management Authority',
    description:
      'Emergency financial assistance for households affected by a notified disaster or flood.',
    eligibilitySummary:
      'Available where a disaster has been officially notified for the area; affected households are assessed on site by the district administration.',
    districts: ['Burewala', 'Multan', 'Vehari', 'Khanewal', 'Lodhran'],
    householdSizeMin: 1,
    incomeBands: ['under_25k', '25k_50k', '50k_100k', 'prefer_not_to_say'],
    requiredDocuments: ['CNIC', 'Damage assessment reference', 'Local administration record'],
    officialSource: {
      publisher: 'Provincial Disaster Management Authority',
      url: null,
      lastVerifiedAt: null,
    },
    verification: 'demo',
    status: 'approved',
  },
  {
    id: 'wel-tvet',
    name: 'Skills Training Stipend (TVET)',
    provider: 'Technical education authority',
    description:
      'Short skills-training courses with a stipend for youth in selected trades, run through accredited institutes.',
    eligibilitySummary:
      'Youth meeting the course’s stated age and education requirements; enrolment is through the accredited institute.',
    districts: 'all',
    householdSizeMin: 1,
    incomeBands: ['under_25k', '25k_50k', '50k_100k'],
    requiredDocuments: ['CNIC', 'Education certificate', 'Institute enrolment'],
    officialSource: {
      publisher: 'Technical Education & Vocational Training Authority',
      url: null,
      lastVerifiedAt: null,
    },
    verification: 'demo',
    status: 'pending_review',
  },
];

export const punjabDistricts = [
  'Burewala',
  'Bahawalnagar',
  'Bahawalpur',
  'Dera Ghazi Khan',
  'Faisalabad',
  'Gujranwala',
  'Gujrat',
  'Jhang',
  'Jhelum',
  'Kasur',
  'Khanewal',
  'Kot Addu',
  'Lahore',
  'Lodhran',
  'Multan',
  'Muzzafargarh',
  'Okara',
  'Pakpattan',
  'Rahim Yar Khan',
  'Rajanpur',
  'Rawalpindi',
  'Sahiwal',
  'Sargodha',
  'Sheikhupura',
  'Sialkot',
  'Toba Tek Singh',
  'Vehari',
];
