import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Start both API and frontend servers before running tests
  webServer: [
    {
      command: "node_modules/.bin/tsx --env-file=../../.env.local src/index.ts",
      url: "http://localhost:3001/api/health",
      cwd: "../api",
      reuseExistingServer: !process.env["CI"],
      timeout: 15000,
    },
    {
      command: "node_modules/.bin/vite --port 5173",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env["CI"],
      timeout: 15000,
    },
  ],
});
