/**
 * Consistent, human error messages for every failure path (spec §45).
 * Components call `errorMessage(err)` and get citizen-friendly copy.
 */
import { ApiError } from '@/types/domain';

const byStatus: Record<number, string> = {
  400: 'Please check the information you entered.',
  401: 'Please log in to continue.',
  403: 'You do not have permission to access this page.',
  404: 'The requested resource could not be found.',
  409: 'This record was changed by someone else. Refresh and try again.',
  422: 'Some fields need attention. Please review the highlighted values.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong. Please try again.',
  502: 'Sahara AI could not reach a required service. Please try again shortly.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
};

/**
 * Resource-specific codes take precedence over the generic status message: on the
 * login form a 401 means "wrong credentials", not "please log in".
 */
const byCode: Record<string, string> = {
  network_error: 'Unable to connect to Sahara AI. Please check your connection and try again.',
  ai_unavailable:
    'The AI assistant is temporarily unavailable. You can still browse services and use the other tools.',
  invalid_credentials: 'The email or password you entered is not correct.',
  unauthorized: 'Please log in to continue.',
  email_taken: 'An account with this email already exists. Try logging in instead.',
  validation_error: 'Please check the information you entered.',
  not_found: 'The requested resource could not be found.',
  unknown_template: 'That application type is not available. Please choose another.',
};

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code && byCode[error.code]) return byCode[error.code]!;
    if (error.status === 0) {
      return 'Unable to connect to Sahara AI. Please check your connection and try again.';
    }
    return byStatus[error.status] ?? error.message ?? byStatus[500];
  }
  if (error instanceof Error && error.message) return error.message;
  return byStatus[500];
}

export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function isForbidden(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}
