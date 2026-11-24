/**
 * DEMO EMERGENCY DIRECTORY — NOT YET VERIFIED.
 * ---------------------------------------------------------------------------
 * IMPORTANT: No telephone number is invented in this file.
 *
 * `number: null` is rendered by the UI as "Number pending verification" — the
 * emergency centre deliberately does not display a guessed number, because a
 * wrong emergency number is worse than none.
 *
 * When the backend is connected, verified rows (number + source + publisher +
 * last-verified date) replace these placeholders through the same interface.
 */
import type { EmergencyContact } from '@/types/domain';

export const demoTollFree: EmergencyContact[] = [
  {
    id: 'emg-police',
    name: 'Police Emergency',
    category: 'police',
    number: null,
    description: 'Emergency police response for an incident in progress or immediate danger.',
    available: '24 hours',
    source: { publisher: 'Punjab Police', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'emg-rescue',
    name: 'Rescue Services',
    category: 'rescue',
    number: null,
    description: 'Emergency rescue and medical response, including road accidents.',
    available: '24 hours',
    source: { publisher: 'Rescue 1122', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'emg-ambulance',
    name: 'Ambulance / Medical Emergency',
    category: 'ambulance',
    number: null,
    description: 'Ambulance dispatch and emergency medical assistance.',
    available: '24 hours',
    source: { publisher: 'Rescue 1122 / Health Department', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'emg-fire',
    name: 'Fire Emergency',
    category: 'fire',
    number: null,
    description: 'Fire brigade response for a building or vehicle fire.',
    available: '24 hours',
    source: { publisher: 'Local Government / Fire Brigade', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'emg-cyber',
    name: 'Cybercrime Reporting',
    category: 'cybercrime',
    number: null,
    description:
      'Reporting online fraud, harassment, identity theft or a compromised account to the federal cybercrime authority.',
    available: 'Complaint channel',
    source: { publisher: 'National Cyber Crime Investigation Agency', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'emg-gas',
    name: 'Gas Leak Emergency',
    category: 'other',
    number: null,
    description: 'Immediate gas leak reporting to the gas utility serving your area.',
    available: '24 hours',
    source: { publisher: 'Sui gas utility (regional)', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
];

export const demoHelplines: EmergencyContact[] = [
  {
    id: 'help-citizen',
    name: 'Citizen Support / Complaint Helpline (Punjab)',
    category: 'other',
    number: null,
    description: 'Provincial complaint and citizen support line for government services.',
    available: 'Working hours',
    source: { publisher: 'Government of the Punjab', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'help-women',
    name: 'Women’s Safety Helpline',
    category: 'other',
    number: null,
    description: 'Support and reporting line for women facing violence or harassment.',
    available: '24 hours',
    source: { publisher: 'Social Welfare Department', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'help-child',
    name: 'Child Protection Helpline',
    category: 'other',
    number: null,
    description: 'Reporting child abuse or a missing child to the child protection authority.',
    available: '24 hours',
    source: { publisher: 'Child Protection & Welfare Bureau', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'help-elect',
    name: 'Election / Registration Information',
    category: 'other',
    number: null,
    description: 'Voter registration and electoral roll questions.',
    available: 'Working hours',
    source: { publisher: 'Election Commission of Pakistan', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'help-consumer',
    name: 'Consumer Protection Helpline',
    category: 'other',
    number: null,
    description: 'Complaints about goods, prices and services.',
    available: 'Working hours',
    source: { publisher: 'Punjab Consumer Protection Council', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
];
