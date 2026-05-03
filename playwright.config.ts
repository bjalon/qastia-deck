import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/playwright",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:5180",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev:example -- --port 5180",
    url: "http://127.0.0.1:5180",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
