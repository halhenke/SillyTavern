import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  timeout: 30_000,
  use: {
    baseURL: process.env.ST_E2E_BASE_URL ?? 'http://127.0.0.1:8000',
    trace: 'on-first-retry',
  },
});
