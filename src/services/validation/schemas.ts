/**
 * Form validation schemas (Zod).
 * These run in the browser for fast feedback. The backend validates again with
 * Pydantic — client validation is a convenience, never a security control.
 *
 * LOCALISATION
 * ------------
 * Every message is a KEY (`validation.emailRequired`), not a sentence. The form
 * passes the key through `t()` at render time, so the same schema serves English,
 * Urdu and Punjabi and validation logic never has to know the active language.
 * `validationMessage()` keeps a readable English fallback for callers that are
 * not inside a React tree (tests, logs).
 */
import { z } from 'zod';


/** Map of validation key → English fallback, used outside React. */
const VALIDATION_DEFAULTS = {
  'validation.emailRequired': 'validation.emailRequired',
  'validation.emailTooLong': 'validation.emailTooLong',
  'validation.emailInvalid': 'validation.emailInvalid',
  'validation.passwordMin': 'validation.passwordMin',
  'validation.passwordMax': 'validation.passwordMax',
  'validation.passwordLetter': 'validation.passwordLetter',
  'validation.passwordNumber': 'validation.passwordNumber',
  'validation.passwordRequired': 'validation.passwordRequired',
  'validation.nameRequired': 'validation.nameRequired',
  'validation.nameTooLong': 'validation.nameTooLong',
  'validation.confirmRequired': 'validation.confirmRequired',
  'validation.termsRequired': 'validation.termsRequired',
  'validation.passwordMismatch': 'validation.passwordMismatch',
  'validation.subjectMin': 'validation.subjectMin',
  'validation.subjectMax': 'validation.subjectMax',
  'validation.messageMin': 'validation.messageMin',
  'validation.messageMax': 'validation.messageMax',
} as const satisfies Record<string, string>;

export type ValidationKey = keyof typeof VALIDATION_DEFAULTS;

/** Readable English text for a validation key (logs, non-React callers). */
export function validationDefault(key: ValidationKey): string {
  return VALIDATION_DEFAULTS[key];
}

const email = z
  .string()
  .trim()
  .min(1, 'validation.emailRequired')
  .max(254, 'validation.emailTooLong')
  .email('validation.emailInvalid');

const password = z
  .string()
  .min(8, 'validation.passwordMin')
  .max(128, 'validation.passwordMax')
  .regex(/[a-zA-Z]/, 'validation.passwordLetter')
  .regex(/[0-9]/, 'validation.passwordNumber');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'validation.passwordRequired'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'validation.nameRequired')
      .max(80, 'validation.nameTooLong'),
    email,
    password,
    confirmPassword: z.string().min(1, 'validation.confirmRequired'),
    preferredLanguage: z.enum(['en', 'ur', 'pa']),
    acceptTerms: z.boolean().refine((v) => v, 'validation.termsRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation.passwordMismatch',
  });

export const forgotPasswordSchema = z.object({ email });

export const feedbackSchema = z.object({
  category: z.enum(['service_correction', 'bug', 'suggestion', 'accessibility', 'other']),
  subject: z
    .string()
    .trim()
    .min(5, 'validation.subjectMin')
    .max(120, 'validation.subjectMax'),
  message: z
    .string()
    .trim()
    .min(20, 'validation.messageMin')
    .max(2000, 'validation.messageMax'),
  email: z.string().trim().email('validation.emailInvalid').optional().or(z.literal('')),
  relatedServiceId: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;

/**
 * Convert a Zod error into a { field: messageKey } map for form state.
 *
 * The values are translation keys (`validation.*`), not sentences. Forms render
 * them with `t(...)`, which falls back to a readable English sentence if a key
 * is ever missing — so a lookup can never show the user a raw dotted key.
 */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

/** True when a field error is a translatable key rather than a literal sentence. */
export function isValidationKey(message: string): message is ValidationKey {
  return message.startsWith('validation.') && message in VALIDATION_DEFAULTS;
}
