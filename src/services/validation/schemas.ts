/**
 * Form validation schemas (Zod).
 * These run in the browser for fast feedback. The backend validates again with
 * Pydantic — client validation is a convenience, never a security control.
 */
import { z } from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .max(254, 'Email address is too long.')
  .email('Enter a valid email address, for example name@example.com.');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be 128 characters or fewer.')
  .regex(/[a-zA-Z]/, 'Password must include at least one letter.')
  .regex(/[0-9]/, 'Password must include at least one number.');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Please enter your full name.')
      .max(80, 'Name must be 80 characters or fewer.'),
    email,
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    preferredLanguage: z.enum(['en', 'ur', 'pa']),
    acceptTerms: z.boolean().refine((v) => v, 'Please confirm you understand the limits of the service.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const forgotPasswordSchema = z.object({ email });

export const feedbackSchema = z.object({
  category: z.enum(['service_correction', 'bug', 'suggestion', 'accessibility', 'other']),
  subject: z
    .string()
    .trim()
    .min(5, 'Please write a short subject (at least 5 characters).')
    .max(120, 'Subject must be 120 characters or fewer.'),
  message: z
    .string()
    .trim()
    .min(20, 'Please describe the issue in at least 20 characters.')
    .max(2000, 'Message must be 2000 characters or fewer.'),
  email: z.string().trim().email('Enter a valid email address.').optional().or(z.literal('')),
  relatedServiceId: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;

/** Convert a Zod error into a { field: message } map for form state. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
