import { defineConfig } from '@playwright/test'

const baseURL = process.env.HUB_BASE_URL || 'http://127.0.0.1:4174'

export default defineConfig({
  testDir: './tests',
  testMatch: 'onboarding-hub.spec.ts',
  reporter: [['list']],
  webServer: {
    command: 'npm --prefix copilot-onboarding-hub run dev -- --host 127.0.0.1 --port 4174',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
})
