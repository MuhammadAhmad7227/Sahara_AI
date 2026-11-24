/**
 * Scam indicator analysis (maps to POST /api/scams/analyze).
 *
 * The demo engine below is a transparent, rule-based indicator scan that runs
 * entirely in the browser. It reports which indicator rules fired, quotes the
 * matched excerpt, and never claims proof of fraud. When the backend is
 * connected, the same `ScamAnalysis` shape is returned by the AI service.
 */
import { mockRequest } from '@/services/api/client';
import type { ScamAnalysis, ScamIndicator, ScamRiskLevel } from '@/types/domain';

interface Rule {
  id: string;
  label: string;
  severity: 'low' | 'medium' | 'high';
  pattern: RegExp;
  explanation: string;
}

const rules: Rule[] = [
  {
    id: 'otp_request',
    label: 'Asks for an OTP, PIN or password',
    severity: 'high',
    pattern: /\b(otp|o\.t\.p|one[- ]time password|pin code|pin number|password|پاس ورڈ|او ٹی پی)\b/i,
    explanation:
      'No genuine bank, utility or government office asks for your OTP, PIN or password. Sharing it authorises a transaction on your account.',
  },
  {
    id: 'urgency',
    label: 'Uses an urgent deadline to pressure you',
    severity: 'high',
    pattern: /\b(within \d+ (minutes|hours)|expire[sd]?|immediately|urgent|last warning|account (will be )?(blocked|closed|suspended)|آخری موقع|فوراً|بند کر دیا)\b/i,
    explanation:
      'A short deadline is used to stop you checking the message with the real organisation. Genuine offices do not demand instant action by SMS.',
  },
  {
    id: 'payment_request',
    label: 'Demands an immediate payment',
    severity: 'high',
    pattern: /\b(send (rs\.?|pkr|money)|transfer (rs\.?|pkr|amount)|pay (rs\.?|pkr)|easy ?paisa|jazz ?cash|easypaisa|جاز کیش|ایزی پیسہ)\b/i,
    explanation:
      'Payments requested through a personal wallet or by message are a common fraud pattern. Official fees are paid at an office or a bank counter with a receipt.',
  },
  {
    id: 'suspicious_link',
    label: 'Contains a link that is not an official domain',
    severity: 'medium',
    pattern: /(https?:\/\/[^\s]+)|(\bwww\.[^\s]+)|(\b[a-z0-9-]+\.(tk|xyz|top|click|zip|link|shop|online)\b)/i,
    explanation:
      'Look at the domain carefully. Fraudulent pages copy official designs but use a different address. Open the official website yourself instead of tapping the link.',
  },
  {
    id: 'prize',
    label: 'Announces a prize, lottery or reward',
    severity: 'medium',
    pattern: /\b(congratulation|congrats|you (have )?won|winner|lottery|prize|reward|scholarship award|مبارک ہو|انعام)\b/i,
    explanation:
      'Unexpected prizes are a standard bait. A real programme does not ask a winner to pay a fee or share bank details to release money.',
  },
  {
    id: 'sensitive_info',
    label: 'Requests CNIC, bank or card details',
    severity: 'high',
    pattern: /\b(cnic number|card number|cvv|pin code|account number|bank details|date of birth|mother'?s maiden|شناختی کارڈ نمبر)\b/i,
    explanation:
      'Identity and card details are used for impersonation and unauthorised transactions. Share them only through an official, verified channel you initiated.',
  },
  {
    id: 'fake_official',
    label: 'Claims to be a government or bank department',
    severity: 'medium',
    pattern: /\b(nadra|bisp|fbr|e-?sahulat|benazir|state bank|police department|excise|government of punjab|حکومت)\b/i,
    explanation:
      'Fraudsters often use the name of a real department. Verify by contacting the department through the contact details published on its own website — not the ones in the message.',
  },
  {
    id: 'sim_swap',
    label: 'Mentions SIM or biometric re-verification',
    severity: 'medium',
    pattern: /\b(sim (block|blocked|verification|re-verif)|biometric verification|sim band)\b/i,
    explanation:
      'SIM re-verification fraud is used to take over your number. Re-verification happens at an operator’s own franchise or official app, never through a link.',
  },
];

const safetyAdvice = [
  'Do not share OTPs, PINs, passwords or card numbers with anyone — including someone claiming to be from a bank or a government office.',
  'Do not call the number in the message. Find the official helpline on the organisation’s own website or on your bill.',
  'Do not tap links in an unexpected message. Open the official website or app yourself.',
  'If you already shared details, contact your bank immediately using the number printed on your card.',
  'Keep a screenshot of the message and report it through the official cybercrime complaint channel.',
];

function riskFor(indicators: ScamIndicator[]): ScamRiskLevel {
  const high = indicators.filter((i) => i.severity === 'high').length;
  const medium = indicators.filter((i) => i.severity === 'medium').length;
  if (high >= 1) return 'high_concern';
  if (medium >= 2) return 'high_concern';
  if (medium === 1) return 'needs_caution';
  return 'low_concern';
}

function explanationFor(level: ScamRiskLevel, indicators: ScamIndicator[]): string {
  const names = indicators.map((i) => i.label.toLowerCase());
  switch (level) {
    case 'high_concern':
      return `This message contains ${indicators.length} indicator${indicators.length === 1 ? '' : 's'} commonly used in fraud, including ${names.slice(0, 2).join(' and ')}. Treat it as unsafe until you have verified it independently through the organisation’s official contact details. This assessment is based on wording patterns — it is an indicator, not proof.`;
    case 'needs_caution':
      return `This message shows one caution indicator: ${names[0]}. It may still be genuine, but verify the sender independently before you act on it. This is an indicator, not proof of fraud.`;
    default:
      return 'No strong fraud indicator was detected in the text you entered. That does not make a message safe: a short or well-written message can still be fraudulent, so verify unexpected requests through the organisation’s official channel.';
  }
}

export async function analyzeScam(inputText: string): Promise<ScamAnalysis> {
  const result = await mockRequest(
    () => {
      const indicators: ScamIndicator[] = [];
      for (const rule of rules) {
        const match = inputText.match(rule.pattern);
        if (match) {
          indicators.push({
            id: rule.id,
            label: rule.label,
            severity: rule.severity,
            explanation: rule.explanation,
            evidence: match[0],
          });
        }
      }

      const riskLevel = riskFor(indicators);

      return {
        id: `scan-${Date.now()}`,
        inputText,
        riskLevel,
        indicators,
        explanation: explanationFor(riskLevel, indicators),
        safetyAdvice,
        engine: 'rule-based-local',
        createdAt: new Date().toISOString(),
        disclaimer:
          'This is a risk assessment based on wording patterns, not definitive proof of fraud. Never share an OTP, PIN or password with anyone.',
      } satisfies ScamAnalysis;
    },
    { latency: 750, failureRate: 0.08 },
  );
  if (!result.ok) throw result.error;
  return result.data;
}
