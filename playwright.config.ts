import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: '{testDir}/__snapshots__/{projectName}/{arg}{ext}',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    // Suppress reduced-motion preference so CSS disabling in tests is explicit
    reducedMotion: 'reduce',
  },
  expect: {
    // Allow up to 5% pixel difference to tolerate minor font/antialiasing variation
    toHaveScreenshot: { maxDiffPixelRatio: 0.05 },
  },
  projects: [
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 667 } },
    },
    {
      name: 'tablet',
      use: { viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop',
      use: { viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    // Locally: reuse an already-running preview server to avoid rebuilding every run
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
