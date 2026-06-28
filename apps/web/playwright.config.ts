import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["**/*.smoke.test.ts"],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PW_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // SESSION_0266 — firefox and webkit are scoped to e2e/lineage only via
    // per-project `testDir`, so the non-lineage suite cost stays
    // chromium-only. The 4 lineage specs run on all 3 engines (chromium +
    // firefox + webkit) to extend the SESSION_0265 drag/privacy proofs
    // cross-engine.
    //
    // Note: WebKit cannot be installed on macOS 12 (Monterey, darwin 21.x).
    // Local mac12 developers should run `--project=chromium --project=firefox`
    // explicitly; CI (Linux) runs all three. See SESSION_0266 notes.
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testDir: "./e2e/lineage",
      // SESSION_0266 — firefox hydration timing on Next.js App Router pages
      // is slower than chromium; click handlers occasionally fire before the
      // React tree is interactive. One retry covers the timing race without
      // masking real engine-specific regressions.
      retries: 1,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testDir: "./e2e/lineage",
      retries: 1,
    },
  ],
  webServer: {
    command: "bun run dev",
    url: process.env.PW_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
