/**
 * Document analyzer (maps to POST /api/documents/analyze, multipart upload).
 *
 * Demo behaviour: the file is validated in the browser but is NOT uploaded
 * anywhere, and no text is extracted. The API returns an honest result stating
 * that extraction requires the backend OCR/vision service. This keeps the UI,
 * validation, progress and result states fully demonstrable without pretending
 * a real analysis took place.
 */
import { mockRequest } from '@/services/api/client';
import { ApiError, type DocumentAnalysis } from '@/types/domain';

export const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
export const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp';
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Unsupported file type. Please upload a PDF, JPG, PNG or WebP file.';
  }
  if (file.size === 0) {
    return 'The selected file is empty.';
  }
  if (file.size > MAX_FILE_BYTES) {
    return `The file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The maximum size is 10 MB.`;
  }
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export async function analyzeDocument(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<DocumentAnalysis> {
  const invalid = validateFile(file);
  if (invalid) {
    throw new ApiError(422, invalid, 'validation_error');
  }

  // Local, honest processing steps — no bytes leave the browser.
  const steps = [15, 40, 70, 100];
  for (const p of steps) {
    await new Promise((r) => setTimeout(r, 260));
    onProgress?.(p);
  }

  const result = await mockRequest(
    () => ({
      id: `doc-${Date.now()}`,
      fileName: file.name,
      fileType: file.type,
      fileSizeBytes: file.size,
      extractedText: null,
      summary: null,
      flags: [
        {
          id: 'flag-1',
          label: 'Text extraction requires the backend service',
          detail:
            'This demonstration build validates the upload in your browser but does not send the file anywhere. Text extraction and review flags are produced by the document service once it is connected.',
          level: 'info',
        },
        {
          id: 'flag-2',
          label: 'No authenticity judgement is made',
          detail:
            'Sahara AI does not certify whether a document is genuine. If a document matters legally, have it checked by the issuing authority.',
          level: 'review',
        },
      ],
      processedBy: 'local-heuristic',
      createdAt: new Date().toISOString(),
      disclaimer:
        'Only upload documents you are comfortable processing. This demo keeps the file inside your browser session.',
    }) satisfies DocumentAnalysis,
    { latency: 400, failureRate: 0.06 },
  );

  if (!result.ok) throw result.error;
  return result.data;
}
