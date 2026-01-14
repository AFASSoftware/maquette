import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for maquette browser tests.
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test files location
  testDir: "./tests",

  // Timeout for each test - 10s on CI, 3s locally
  timeout: process.env.CI ? 10000 : 3000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit parallel workers on CI to avoid flakiness
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: process.env.CI ? "github" : "html",

  // Shared settings for all the projects below
  use: {
    // Base URL for all tests - points to local dev server
    // Using 127.0.0.1 instead of localhost to avoid IPv6 resolution issues
    baseURL: "http://127.0.0.1:8080",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Take screenshot on failure
    screenshot: "only-on-failure",
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Uncomment to test on more browsers:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run a local dev server before starting the tests
  webServer: {
    command: "npx http-server .. -p 8080 -c-1",
    url: "http://127.0.0.1:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
