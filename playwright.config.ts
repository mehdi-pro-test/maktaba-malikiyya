import { adminE2EConfig, adminE2EEnv } from './tests/fixtures/admin-e2e/environment';
import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const adminConfig = adminE2EConfig();
const port = new URL(baseURL).port || '3000';
export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: './tests/fixtures/admin-e2e/setup.ts',
  globalTeardown: './tests/fixtures/admin-e2e/teardown.ts',
  fullyParallel: false,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  webServer: [
    {
      command: `npm run ${process.env.CI ? 'start' : 'dev'} -- --port ${port}`,
      url: baseURL,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ?? '',
        ADMIN_ENABLED: 'false',
        ADMIN_DATA_ENABLED: 'false',
        QUIZ_DB_ENABLED: 'false',
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'npm run start -- --port 3102',
      url: 'http://localhost:3102/admin/connexion',
      env: adminE2EEnv(adminConfig),
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: 'npx next dev tests/fixtures/quiz-app --hostname 127.0.0.1 --port 3101',
      url: 'http://127.0.0.1:3101',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
  projects: [
    { name: 'admin-desktop', testMatch: 'admin.spec.ts', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'admin-mobile',
      testMatch: 'admin.spec.ts',
      dependencies: ['admin-desktop'],
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
    { name: 'desktop', testIgnore: 'admin.spec.ts', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      testIgnore: 'admin.spec.ts',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' },
    },
    {
      name: 'firefox',
      testIgnore: 'admin.spec.ts',
      use: { ...devices['Desktop Firefox'], launchOptions: {} },
    },
    {
      name: 'webkit-mobile',
      testIgnore: 'admin.spec.ts',
      use: {
        ...devices['iPhone 13'],
        launchOptions: process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH }
          : {},
      },
    },
  ],
});
