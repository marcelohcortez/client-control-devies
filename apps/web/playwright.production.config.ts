import { defineConfig, devices } from "@playwright/test";

// Production test config — runs against the deployed Vercel URL.
// No webServer block because servers are already live.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 1,
  reporter: "list",
  use: {
    baseURL: "https://client-control-lac.vercel.app",
    headless: true,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
