/** Extract screenshot text locally. Only wording is scanned; images are not authenticated. */
import workerPath from 'tesseract.js/dist/worker.min.js?url';
import corePath from 'tesseract.js-core/tesseract-core-lstm.wasm.js?url';

export async function extractScamImageText(file: File): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng+urd', 1, {
    workerPath,
    corePath,
    langPath: new URL(`${import.meta.env.BASE_URL}ocr`, window.location.origin).href,
    cacheMethod: 'none',
  });
  try {
    const result = await worker.recognize(file);
    return result.data.text.trim();
  } finally {
    await worker.terminate();
  }
}
