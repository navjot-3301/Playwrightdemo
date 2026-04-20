// @ts-check
// ─────────────────────────────────────────────
// Playwright Configuration — Gmail Login Tests
// ─────────────────────────────────────────────

require('dotenv').config();

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({

  // ─── Test Directory ───────────────────────
  testDir: '.',
  testMatch: '**/*.test.js',

  // ─── Parallelism ──────────────────────────
  // Run test files in parallel; disable within a single file
  fullyParallel: false,
  workers: 2,

  // ─── Retries ──────────────────────────────
  // Retry failed tests once in CI, no retries locally
  retries: process.env.CI ? 2 : 1,

  // ─── Timeout ──────────────────────────────
  timeout: 45000,           // Per-test timeout (ms)
  expect: {
    timeout: 10000,         // Per-assertion timeout (ms)
  },

  // ─── Reporters ────────────────────────────
  reporter: [
    ['list'],                                                          // Console output
    ['html', { open: 'never', outputFolder: 'playwright-report' }],   // HTML report
    ['json', { outputFile: 'test-results/results.json' }],            // JSON report
  ],

  // ─── Global Settings ──────────────────────
  use: {
    // Base URL loaded from .env
    baseURL: process.env.BASE_URL || 'https://gmail.com',

    // Run headless from .env (true in CI, false for local debugging)
    headless: process.env.HEADLESS !== 'false',

    // Capture screenshot on failure only
    screenshot: 'only-on-failure',

    // Record video on first retry
    video: 'retain-on-failure',

    // Collect trace on first retry for debugging
    trace: 'on-first-retry',

    // Browser viewport
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS certificate errors
    ignoreHTTPSErrors: false,

    // Slow down actions for debugging (set 0 in CI)
    launchOptions: {
      slowMo: process.env.CI ? 0 : 0,
    },

    // Default navigation timeout
    navigationTimeout: 30000,

    // Default action timeout (click, fill, etc.)
    actionTimeout: 10000,

    // Locale
    locale: 'en-US',

    // Timezone
    timezoneId: 'Asia/Kolkata',
  },

  // ─── Output Directory ─────────────────────
  outputDir: 'test-results',

  // ─── Browser Projects ─────────────────────
  projects: [

    // TC-022: Google Chrome
    {
      name: 'Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    // TC-023: Firefox
    {
      name: 'Firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    // TC-024: Safari (WebKit)
    {
      name: 'Safari',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // TC-025: Microsoft Edge
    {
      name: 'Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },

    // Mobile — Chrome on Android (bonus)
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },

    // Mobile — Safari on iPhone (bonus)
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
  ],

});
