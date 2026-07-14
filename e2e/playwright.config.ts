import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env file in the e2e/ root
dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * Playwright configuration for EShop SUT.
 *
 * Multi-project structure:
 *   - web-chromium / web-firefox / web-webkit       → Frontend Web (localhost:5173), authenticated as standard user
 *   - admin-chromium / admin-firefox / admin-webkit → Web Admin (localhost:5174), authenticated as admin
 *   - api                                           → Backend API (localhost:3000), no browser, auth via headers
 *   - smoke-web                                     → Critical path subset, Chromium only, authenticated as standard user
 *   - smoke-admin                                   → Critical path subset, Chromium only, authenticated as admin
 */
export default defineConfig({
  // ---------------------------------------------------------------------------
  // Global test settings
  // ---------------------------------------------------------------------------

  // Maximum time (ms) a single test may run before it is marked as timed out.
  timeout: 30_000,

  // Maximum time (ms) for expect() assertions to auto-retry before failing.
  expect: {
    timeout: 5_000,
  },

  // Run all tests in all files in parallel within each project.
  fullyParallel: true,

  // Fail the build on CI if any test.only() is accidentally committed.
  forbidOnly: !!process.env.CI,

  // Retry failed tests: 2 times on CI to surface flakiness; 0 locally to fail fast.
  retries: process.env.CI ? 2 : 0,

  // Parallel workers: 4 on CI for controlled concurrency; default (50% of CPU cores) locally.
  workers: process.env.CI ? 4 : undefined,

  // Reporters: In CI, use blob (for shard merging) + github (PR annotations).
  // Locally, use html (interactive) + list (readable console output).
  reporter: process.env.CI
    ? [["blob"], ["github"], ["list"]]
    : [["html"], ["list"]],

  // ---------------------------------------------------------------------------
  // Global setup & teardown — run once before/after the entire test suite
  // ---------------------------------------------------------------------------

  // Authenticates both user and admin roles, saves storageState to .auth/
  globalSetup: "./global-setup.ts",

  // Cleans up any dynamically created test data after the full suite completes
  globalTeardown: "./global-teardown.ts",

  // ---------------------------------------------------------------------------
  // Shared settings applied to all projects unless overridden per-project
  // ---------------------------------------------------------------------------
  use: {
    // Capture a trace on the first retry of a failed test.
    trace: "on-first-retry",

    // Capture a screenshot only when a test fails.
    screenshot: "only-on-failure",

    // Record video only for failed tests; discard it for passing ones.
    video: "retain-on-failure",

    // Always use the locale that matches the SUT's Vietnamese UI.
    locale: "vi-VN",

    // Timezone for consistent date/time assertions across environments.
    timezoneId: "Asia/Ho_Chi_Minh",
  },

  // ---------------------------------------------------------------------------
  // Projects — each project is an independent test run configuration
  // ---------------------------------------------------------------------------
  projects: [
    // -------------------------------------------------------------------------
    // Frontend Web — localhost:5173 — Standard user session
    // -------------------------------------------------------------------------
    {
      name: "web-chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.WEB_BASE_URL ?? "http://localhost:5173",
        // storageState is created by global-setup.ts before any test runs
        storageState: ".auth/user.json",
      },
      testMatch: "tests/web/**/*.spec.ts",
    },
    {
      name: "web-firefox",
      use: {
        ...devices["Desktop Firefox"],
        baseURL: process.env.WEB_BASE_URL ?? "http://localhost:5173",
        storageState: ".auth/user.json",
      },
      testMatch: "tests/web/**/*.spec.ts",
    },
    {
      name: "web-webkit",
      use: {
        ...devices["Desktop Safari"],
        baseURL: process.env.WEB_BASE_URL ?? "http://localhost:5173",
        storageState: ".auth/user.json",
      },
      testMatch: "tests/web/**/*.spec.ts",
    },

    // -------------------------------------------------------------------------
    // Web Admin — localhost:5174 — Admin user session
    // -------------------------------------------------------------------------
    {
      name: "admin-chromium",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.ADMIN_BASE_URL ?? "http://localhost:5174",
        storageState: ".auth/admin.json",
      },
      testMatch: "tests/admin/**/*.spec.ts",
    },
    {
      name: "admin-firefox",
      use: {
        ...devices["Desktop Firefox"],
        baseURL: process.env.ADMIN_BASE_URL ?? "http://localhost:5174",
        storageState: ".auth/admin.json",
      },
      testMatch: "tests/admin/**/*.spec.ts",
    },
    {
      name: "admin-webkit",
      use: {
        ...devices["Desktop Safari"],
        baseURL: process.env.ADMIN_BASE_URL ?? "http://localhost:5174",
        storageState: ".auth/admin.json",
      },
      testMatch: "tests/admin/**/*.spec.ts",
    },

    // -------------------------------------------------------------------------
    // API tests — localhost:3000 — No browser, auth managed per-test via headers
    // -------------------------------------------------------------------------
    {
      name: "api",
      use: {
        baseURL: process.env.API_BASE_URL ?? "http://localhost:3000",
        // No storageState — API tests obtain tokens via POST /api/login directly
        // and pass them in Authorization: Bearer <token> headers per request.
        extraHTTPHeaders: {
          "Content-Type": "application/json",
        },
      },
      testMatch: "tests/api/**/*.spec.ts",
    },

    // -------------------------------------------------------------------------
    // Smoke suite Web — Chromium only, critical path, target runtime < 2 minutes
    // Uses user storageState to skip login overhead for non-auth smoke tests
    // -------------------------------------------------------------------------
    {
      name: "smoke-web",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.WEB_BASE_URL ?? "http://localhost:5173",
        storageState: ".auth/user.json",
      },
      testMatch: "tests/smoke/web/**/*.spec.ts",
    },

    // -------------------------------------------------------------------------
    // Smoke suite Admin — Chromium only, critical path, target runtime < 2 minutes
    // Uses admin storageState to skip login overhead for non-auth smoke tests
    // -------------------------------------------------------------------------
    {
      name: "smoke-admin",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.ADMIN_BASE_URL ?? "http://localhost:5174",
        storageState: ".auth/admin.json",
      },
      testMatch: "tests/smoke/admin/**/*.spec.ts",
    },
  ],
});
