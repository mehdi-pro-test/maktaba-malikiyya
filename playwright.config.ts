import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const port = new URL(baseURL).port || '3000';
export default defineConfig({
  testDir: 'tests/e2e',
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
      reuseExistingServer: !process.env.CI,
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
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], launchOptions: {} } },
    {
      name: 'webkit-mobile',
      use: {
        ...devices['iPhone 13'],
        launchOptions: process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH }
          : {},
      },
    },
  ],
});
