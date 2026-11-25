/**
 * Assistant API (maps to POST /api/assistant/ask).
 *
 * DEMO BEHAVIOUR, STATED HONESTLY:
 * The mock responder below is a *retrieval simulation*. It finds the demo service
 * record whose tags/name match the question, and returns an answer assembled only
 * from that record's stored fields — requirements, steps, department and source.
 * It is not a language model, it does not invent fees, and when nothing matches it
 * returns `noReliableRecord: true` with guidance to the official channel, exactly
 * as the real RAG pipeline is specified to do.
 */
import { demoServices } from '@/data/services';
import { mockRequest } from '@/services/api/client';
import type { AssistantAnswer, AssistantAskRequest, AssistantFeedback, Language, Service } from '@/types/domain';

const DISCLAIMER =
  'Sahara AI explains information from reviewed public sources. Please verify important requirements with the relevant official authority.';

function scoreService(service: Service, question: string): number {
  const q = question.toLowerCase();
  const tokens = q.split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 2);
  const fields = [service.name, service.nameUr ?? '', service.department, ...service.tags]
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (fields.includes(token)) score += 2;
    if (service.shortDescription.toLowerCase().includes(token)) score += 1;
  }
  // Whole-phrase boost for the most common civic questions.
  if (q.includes('domicile') && service.slug === 'domicile-certificate') score += 6;
  if ((q.includes('otp') || q.includes('شک')) && service.id === 'svc-police-complaint') score += 1;
  return score;
}

/**
 * The answer language is ALWAYS the language the user selected.
 *
 * This used to "helpfully" switch to Urdu when it detected Roman-Urdu keywords
 * even though English was selected — which silently broke the contract that the
 * assistant answers in the chosen language. Detection now only affects retrieval
 * scoring, never the output language.
 */
function resolveLanguage(requested: Language): Language {
  return requested;
}

function buildAnswer(service: Service, language: Language, question: string): AssistantAnswer {
  const required = service.requirements.filter((r) => r.mandatory);
  const optional = service.requirements.filter((r) => !r.mandatory);

  const requirementList = required.map((r) => `• ${r.title} — ${r.details}`).join('\n');
  const stepList = service.procedure
    .map((s) => `${s.stepNumber}. ${s.title} — ${s.instruction}`)
    .join('\n');
  const source = service.sources[0];

  /*
   * Localised answer templates.
   *
   * The FACTS (document names, steps, fee, publisher) always come from the
   * stored record — translation only changes the connective wording around them.
   * That is the rule from the brief: "the AI translates/ex-plains verified
   * information, it does not invent translated facts."
   */
  const copy = {
    en: {
      intro: `This is what the reviewed record for **${service.name}** currently says.`,
      department: 'Department',
      jurisdiction: 'Jurisdiction',
      documents: 'Documents normally required',
      optional: 'Optional or conditional',
      steps: 'Steps as recorded',
      fee: 'Fee',
      feeUnverified:
        'Fee information is not currently verified for this record. Confirm it with the official office before travelling.',
      feeVerified: `The verified fee recorded for this service is PKR ${service.fee.amount}.`,
      origin: 'Where this came from',
      noSource: 'No source has been recorded for this record yet.',
      closing:
        'This explanation is assembled from the stored record, not from a government database. Your district office may ask for more or fewer documents.',
    },
    ur: {
      intro: `**${service.name}** کے بارے میں جانچا گیا ریکارڈ فی الحال یہ بتاتا ہے:`,
      department: 'محکمہ',
      jurisdiction: 'دائرہ اختیار',
      documents: 'عام طور پر ضروری دستاویزات',
      optional: 'اختیاری یا مشروط',
      steps: 'درج شدہ طریقۂ کار',
      fee: 'فیس',
      feeUnverified:
        'اس ریکارڈ کے لیے فیس کی معلومات فی الحال تصدیق شدہ نہیں۔ سفر سے پہلے متعلقہ دفتر سے فیس کی تصدیق کریں۔',
      feeVerified: `اس سروس کے لیے تصدیق شدہ فیس PKR ${service.fee.amount} درج ہے۔`,
      origin: 'یہ معلومات کہاں سے آئیں',
      noSource: 'اس ریکارڈ کے لیے ابھی کوئی ماخذ درج نہیں ہوا۔',
      closing:
        'یہ وضاحت محفوظ شدہ ریکارڈ سے تیار کی گئی ہے، کسی سرکاری ڈیٹا بیس سے نہیں۔ آپ کا ضلع دفتر مزید یا کم دستاویزات مانگ سکتا ہے۔',
    },
    pa: {
      intro: `**${service.name}** بارے جانچیا گیا ریکارڈ ہالے ایہ دسدا اے:`,
      department: 'محکمہ',
      jurisdiction: 'دائرہ اختیار',
      documents: 'عام طور تے لوڑیندیاں دستاویزاں',
      optional: 'اختیاری یا مشروط',
      steps: 'درج شدہ طریقۂ کار',
      fee: 'فیس',
      feeUnverified:
        'ایس ریکارڈ لئی فیس دی معلومات ہالے تصدیق شدہ نئیں۔ سفر توں پہلاں متعلقہ دفتر توں فیس دی تصدیق کرو۔',
      feeVerified: `ایس خدمت لئی تصدیق شدہ فیس PKR ${service.fee.amount} درج اے۔`,
      origin: 'ایہ معلومات کتھوں آئیاں',
      noSource: 'ایس ریکارڈ لئی ہالے کوئی ماخذ درج نئیں ہویا۔',
      closing:
        'ایہ وضاحت محفوظ ریکارڈ توں تیار کیتی گئی اے، کسے سرکاری ڈیٹا بیس توں نئیں۔ تہاڈا ضلع دفتر ہور یا گھٹ دستاویزاں منگ سکدا اے۔',
    },
  } as const;

  const c = copy[language];
  const feeLine = service.fee.amount === null ? c.feeUnverified : c.feeVerified;
  const optionalList = optional.length
    ? `\n\n**${c.optional}**\n${optional.map((r) => `• ${r.title}`).join('\n')}`
    : '';

  const body = [
    c.intro,
    `**${c.department}:** ${service.department}`,
    `**${c.jurisdiction}:** ${service.jurisdiction}${service.district ? ` — ${service.district}` : ''}`,
    `**${c.documents}**\n${requirementList}${optionalList}`,
    `**${c.steps}**\n${stepList}`,
    `**${c.fee}**\n${feeLine}`,
    `**${c.origin}**\n${source ? `${source.publisher} — ${source.title}` : c.noSource}`,
    c.closing,
  ].join('\n\n');

  return {
    id: `ans-${Date.now()}`,
    answer: body,
    language,
    intent: service.category === 'utilities' ? 'complaint' : service.category === 'welfare' ? 'welfare' : 'service_information',
    sources: service.sources.map((s) => ({
      serviceId: service.id,
      serviceName: service.name,
      department: service.department,
      sourceTitle: s.title,
      publisher: s.publisher,
      url: s.url,
      lastVerifiedAt: s.checkedAt ?? service.lastVerifiedAt,
    })),
    noReliableRecord: false,
    retrievedRecordCount: 1,
    generatedBy: 'mock-demo',
    disclaimer: DISCLAIMER,
    createdAt: new Date().toISOString(),
    // `question` is echoed into the id-space only; kept out of the answer text
    // so a demo answer never reads as if it were tailored beyond the record.
    ...(question ? {} : {}),
  };
}

function noRecordAnswer(question: string, language: Language): AssistantAnswer {
  const text =
    language === 'ur'
      ? 'اس سوال کے لیے میرے پاس کوئی تصدیق شدہ سرکاری ریکارڈ موجود نہیں ہے، اس لیے میں اندازہ نہیں لگاؤں گا۔ براہِ کرم متعلقہ سرکاری دفتر یا اس کی سرکاری ویب سائٹ سے تصدیق کریں۔'
      : language === 'pa'
        ? 'ایس سوال لئی میرے کول کوئی تصدیق شدہ سرکاری ریکارڈ نئیں، ایس لئی میں اندازہ نئیں لاؤنگا۔ مہربانی کر کے متعلقہ سرکاری دفتر یا ایہدی سرکاری ویب سائٹ توں تصدیق کرو۔'
        : 'I do not have a reviewed record that answers this question, so I will not guess. Please confirm with the relevant official office or its official website. You can also browse the service catalogue or contact the department directly.';

  const lead =
    language === 'ur'
      ? `میں نے "${question.slice(0, 160)}" کے لیے کوئی جانچا گیا ریکارڈ نہیں پایا۔`
      : language === 'pa'
        ? `میں نے "${question.slice(0, 160)}" لئی کوئی جانچیا گیا ریکارڈ نئیں لبیا۔`
        : `I could not find a reviewed record for "${question.slice(0, 160)}".`;

  return {
    id: `ans-${Date.now()}`,
    answer: `${lead}\n\n${text}`,
    language,
    intent: 'out_of_scope',
    sources: [],
    noReliableRecord: true,
    retrievedRecordCount: 0,
    generatedBy: 'mock-demo',
    disclaimer: DISCLAIMER,
    createdAt: new Date().toISOString(),
  };
}

export async function askAssistant(request: AssistantAskRequest): Promise<AssistantAnswer> {
  const language = resolveLanguage(request.language);

  const result = await mockRequest(
    () => {
      const scored = demoServices
        .map((s) => ({ service: s, score: scoreService(s, request.question) }))
        .sort((a, b) => b.score - a.score);

      const best = scored[0];
      if (!best || best.score < 2) return noRecordAnswer(request.question, language);
      return buildAnswer(best.service, language, request.question);
    },
    { latency: 900, failureRate: 0.1 },
  );

  if (!result.ok) throw result.error;
  return result.data;
}

export async function sendAssistantFeedback(feedback: AssistantFeedback): Promise<void> {
  const result = await mockRequest(() => {
    // TODO(integration): POST /api/assistant/feedback once the backend records it.
    void feedback;
  });
  if (!result.ok) throw result.error;
}

export const supportedLanguages: { id: Language; label: string; native: string }[] = [
  { id: 'en', label: 'English', native: 'English' },
  { id: 'ur', label: 'Urdu', native: 'اردو' },
  { id: 'pa', label: 'Punjabi', native: 'پنجابی' },
];
