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

function pickLanguage(text: string, requested: Language): Language {
  if (requested !== 'en') return requested;
  // Small courtesy detection so a Roman-Urdu question still gets an Urdu-style note.
  if (/\b(mujhe|chahiye|kya|kaise|banwana|hai)\b/i.test(text)) return 'ur';
  return 'en';
}

function buildAnswer(service: Service, language: Language, question: string): AssistantAnswer {
  const required = service.requirements.filter((r) => r.mandatory);
  const optional = service.requirements.filter((r) => !r.mandatory);

  const requirementList = required.map((r) => `• ${r.title} — ${r.details}`).join('\n');
  const optionalList = optional.length
    ? `\n\nOptional or conditional documents:\n${optional.map((r) => `• ${r.title}`).join('\n')}`
    : '';
  const stepList = service.procedure
    .map((s) => `${s.stepNumber}. ${s.title} — ${s.instruction}`)
    .join('\n');

  const feeLine =
    service.fee.amount === null
      ? 'Fee information is not currently verified for this record. Please confirm the fee with the official office before travelling.'
      : `The verified fee recorded for this service is PKR ${service.fee.amount}.`;

  const source = service.sources[0];

  const body = `This is what the reviewed record for **${service.name}** currently says, in the language you selected.\n\n**Department:** ${service.department}\n**Jurisdiction:** ${service.jurisdiction}${service.district ? ` — ${service.district}` : ''}\n\n**Documents normally required**\n${requirementList}${optionalList}\n\n**Steps as recorded**\n${stepList}\n\n**Fee**\n${feeLine}\n\n**Where this came from**\n${source ? `${source.publisher} — ${source.title}` : 'No source has been recorded for this record yet.'}\n\nThis explanation is generated from the stored record, not from a government database. Your district office may ask for more or fewer documents.`;

  const languageNote =
    language === 'ur'
      ? 'آپ نے اردو میں سوال کیا ہے۔ نیچے دی گئی معلومات محفوظ شدہ سرکاری معلومات پر مبنی ہیں۔ براہِ کرم اہم دستاویزات کی تصدیق متعلقہ دفتر سے ضرور کریں۔'
      : language === 'pa'
        ? 'تہاڈی معلومات محفوظ شدہ سرکاری ریکارڈ توں لئی گئی اے۔ ضروری کاغذات دی تصدیق متعلقہ دفتر توں ضرور کرنو۔'
        : '';

  return {
    id: `ans-${Date.now()}`,
    answer: [languageNote, body].filter(Boolean).join('\n\n'),
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
      : 'I do not have a reviewed record that answers this question, so I will not guess. Please confirm with the relevant official office or its official website. You can also browse the service catalogue or contact the department directly.';

  return {
    id: `ans-${Date.now()}`,
    answer: `I could not find a reviewed record for "${question.slice(0, 160)}".\n\n${text}`,
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
  const language = pickLanguage(request.question, request.language);

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
