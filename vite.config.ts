/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { createReadStream, readFileSync } from 'node:fs';
import type { Plugin } from 'vite';

// Keep OCR models on the same origin in development and production.
function ocrLanguageAssets(): Plugin {
  const files = Object.fromEntries(['eng', 'urd'].map((lang) => [
    `${lang}.traineddata.gz`,
    path.resolve(__dirname, `node_modules/@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`),
  ]));
  return {
    name: 'ocr-language-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split('?')[0]?.match(/^\/ocr\/(eng|urd)\.traineddata\.gz$/)?.[0].slice(5);
        if (!name || !files[name]) return next();
        res.setHeader('Content-Type', 'application/octet-stream');
        createReadStream(files[name]).pipe(res);
      });
    },
    generateBundle() {
      for (const [name, file] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName: `ocr/${name}`, source: readFileSync(file) });
      }
    },
  };
}

// Sahara AI — frontend build configuration.
// The Vite dev/preview servers bind to 0.0.0.0 so the sandbox preview proxy can reach them.
export default defineConfig({
  plugins: [react(), tailwindcss(), ocrLanguageAssets()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Allow proxied preview hosts (e.g. 5173-xxxx.e2b.app) to reach the dev server.
    allowedHosts: true,
    hmr: { clientPort: 443 },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    env: {
      // Keep the mock transport instantaneous so tests do not wait on demo latency.
      VITE_API_SIMULATE_LATENCY: 'false',
      VITE_API_SIMULATE_FAILURES: 'false',
    },
  },
});
