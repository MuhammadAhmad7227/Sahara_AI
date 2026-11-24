/**
 * DEMO LEGAL AWARENESS ARTICLES — GENERAL AWARENESS ONLY.
 * Written in plain language without citing specific statutory sections, because
 * no section numbers have been verified for this demo. Every article carries an
 * explicit "general awareness, not legal advice" framing.
 */
import type { LegalArticle } from '@/types/domain';

export const demoLegalArticles: LegalArticle[] = [
  {
    id: 'legal-1',
    slug: 'what-to-do-if-police-refuses-fir',
    title: 'What can I do if a police station does not record my complaint?',
    category: 'criminal',
    summary:
      'A police station is expected to record a complaint about a cognizable offence. If it does not, there are official escalation routes — and you should keep a written record of what you reported.',
    body: [
      'A First Information Report (FIR) is the written record of a cognizable offence. The station with jurisdiction over where the incident happened is normally the correct place to report it.',
      'Write down what happened before you go: the date and time of the incident, the location, what was said or done, and the names of anyone who saw it. Keep a copy for yourself.',
      'If the station does not record your complaint, ask for the reason in writing. Keep the name and designation of the officer you spoke to, and the date and time of your visit.',
      'Escalation is normally through the senior police officer for the area or the official police complaint channel. For case-specific choices, consult a qualified legal professional.',
      'Sahara AI can help you write a clear account of the facts, but it cannot file an FIR, contact the police on your behalf, or tell you what the outcome will be.',
    ],
    relatedServiceIds: ['svc-police-complaint'],
    source: { publisher: 'Pending — no official source recorded', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'legal-2',
    slug: 'how-to-check-land-record',
    title: 'How can I check the land record for a plot or field?',
    category: 'property',
    summary:
      'The official revenue record is maintained by the district revenue office. A Fard is an extract of that record, and it should be checked against the official record before you rely on it.',
    body: [
      'Land in Punjab is recorded in the revenue record maintained by the district revenue office. The extract of that record for a specific parcel is called a Fard.',
      'You will normally need the Khasra number, Khatooni number and village or tehsil details to request a Fard. These can be taken from an existing record or from the local patwari.',
      'A Fard shows the record at the time it was issued. It is not a title guarantee, and a later mutation may not appear in an older copy.',
      'For any transaction, confirm the current position with the revenue office and have the documents checked by a qualified professional before paying money.',
    ],
    relatedServiceIds: ['svc-fard'],
    source: { publisher: 'Pending — no official source recorded', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'legal-3',
    slug: 'otp-and-banking-fraud-basics',
    title: 'Someone asked for my OTP or bank details. What should I do?',
    category: 'consumer',
    summary:
      'No genuine bank, government office or utility needs your OTP, PIN or password over a phone call or message. If you shared them, act immediately.',
    body: [
      'A One-Time Password exists to prove that you are the person making a transaction. Anyone who asks you to read it out is asking you to authorise something on their behalf.',
      'Government offices do not collect bank passwords or OTPs over message or phone. A message that threatens disconnection, arrest or account closure unless you act within minutes is a pressure tactic.',
      'If you have already shared an OTP or PIN, contact your bank immediately using the number printed on your card or its official app, and ask them to block the transaction or the card.',
      'Report the incident to the federal cybercrime authority through its official complaint channel. Keep screenshots of the message and any transaction reference.',
      'Sahara AI’s Scam Detector can explain which indicators appear in a message, but it cannot prove that a message is fraudulent and it cannot recover money.',
    ],
    relatedServiceIds: [],
    source: { publisher: 'Pending — no official source recorded', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'legal-4',
    slug: 'tenancy-basics-punjab',
    title: 'Renting a house: what should a written agreement contain?',
    category: 'property',
    summary:
      'A clear written rental agreement protects both tenant and landlord. This is general awareness — the terms must suit your situation and local requirements.',
    body: [
      'A rental agreement should identify the property, the parties, the monthly rent, the payment date, the security deposit and the notice period for ending the tenancy.',
      'It should state who pays for utilities and repairs, and whether sub-letting is allowed. Ambiguity here causes most disputes.',
      'Keep a signed copy, and keep receipts for rent and deposit payments. Where a rent agreement must be registered, the registering office will explain the requirement.',
      'Disputes are handled by the appropriate forum, which depends on the facts. Consult a qualified legal professional for your specific case.',
    ],
    relatedServiceIds: [],
    source: { publisher: 'Pending — no official source recorded', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'legal-5',
    slug: 'employee-rights-basics',
    title: 'What should I do if my employer has not paid my wages?',
    category: 'employment',
    summary:
      'Keep a written record first. Wage matters are handled through the labour authority or the appropriate forum, and evidence of the employment relationship matters most.',
    body: [
      'Gather what you have: appointment letter, salary slips, bank statements, attendance records, messages about work and any written promise of payment.',
      'Ask for the unpaid amount in writing, with the dates and the amount owed, and keep a copy of that request.',
      'Wage disputes are normally raised with the labour authority for the establishment, or through the appropriate legal forum. The correct route depends on the type and size of the establishment.',
      'There are time limits for many claims. Speak to a qualified legal professional promptly rather than waiting.',
    ],
    relatedServiceIds: [],
    source: { publisher: 'Pending — no official source recorded', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
  {
    id: 'legal-6',
    slug: 'complaining-about-a-public-office',
    title: 'How do I complain about poor service at a government office?',
    category: 'civic',
    summary:
      'A complaint works best when it is specific: which office, which date, which counter, what was asked and what happened.',
    body: [
      'Write down the facts in order: the office and counter, the date and time, the officer’s designation if you know it, the document you presented and what you were told.',
      'Keep receipts, acknowledgement slips and any written response. If you were asked to return, note who asked and why.',
      'Most departments publish a complaint channel or a citizen feedback line. Use the official channel and keep the reference number you receive.',
      'Sahara AI can produce a written complaint draft that you can submit. It cannot register the complaint or follow it up on your behalf.',
    ],
    relatedServiceIds: ['svc-district-request'],
    source: { publisher: 'Pending — no official source recorded', url: null, lastVerifiedAt: null },
    verification: 'demo',
  },
];

export const legalCategories: { id: LegalArticle['category']; label: string }[] = [
  { id: 'criminal', label: 'Police & criminal process' },
  { id: 'property', label: 'Property & land' },
  { id: 'family', label: 'Family' },
  { id: 'employment', label: 'Employment' },
  { id: 'consumer', label: 'Consumer & fraud' },
  { id: 'civic', label: 'Civic & administrative' },
  { id: 'rights', label: 'Rights & awareness' },
];
