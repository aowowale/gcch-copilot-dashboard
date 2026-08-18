import { defineConfig } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './tests',
  testIgnore: 'onboarding-hub.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
})
