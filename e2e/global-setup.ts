import { chromium, request } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env from the e2e/ root
dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * Global setup — runs once before the entire test suite.
 *
 * Responsibilities:
 *   1. Authenticate as the standard user (test@eshop.com) via API login
 *   2. Authenticate as the admin user (admin@eshop.com) via API login
 *   3. Save each session's storageState to .auth/user.json and .auth/admin.json
 *
 * These storageState files are loaded by the web-* and admin-* projects in
 * playwright.config.ts, allowing all tests to skip the login step entirely.
 *
 * Note: Authentication is performed via direct API call (POST /api/login)
 * rather than through the UI, making setup faster and more reliable.
 */
async function globalSetup(): Promise<void> {
  // Ensure the .auth/ directory exists before writing state files
  const authDir = path.resolve(__dirname, ".auth");
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const apiBaseURL = process.env.API_BASE_URL ?? "http://localhost:3000";
  const webBaseURL = process.env.WEB_BASE_URL ?? "http://localhost:5173";
  const adminBaseURL = process.env.ADMIN_BASE_URL ?? "http://localhost:5174";

  // ---------------------------------------------------------------------------
  // Authenticate standard user and save storageState for web-* projects
  // ---------------------------------------------------------------------------
  await authenticateAndSave({
    apiBaseURL,
    appBaseURL: webBaseURL,
    email: process.env.USER_EMAIL ?? "test@eshop.com",
    password: process.env.USER_PASSWORD ?? "Test1234!",
    stateFile: path.resolve(authDir, "user.json"),
    label: "Standard User",
    localStorageKey: "token", // frontend-web stores JWT under 'token'
  });

  // ---------------------------------------------------------------------------
  // Authenticate admin user and save storageState for admin-* projects
  // ---------------------------------------------------------------------------
  await authenticateAndSave({
    apiBaseURL,
    appBaseURL: adminBaseURL,
    email: process.env.ADMIN_EMAIL ?? "admin@eshop.com",
    password: process.env.ADMIN_PASSWORD ?? "Admin123!",
    stateFile: path.resolve(authDir, "admin.json"),
    label: "Admin User",
    localStorageKey: "adminToken", // frontend-admin stores JWT under 'adminToken'
  });
}

// ---------------------------------------------------------------------------
// Helper — login via API, inject token into browser context, save storageState
// ---------------------------------------------------------------------------
async function authenticateAndSave(options: {
  apiBaseURL: string;
  appBaseURL: string;
  email: string;
  password: string;
  stateFile: string;
  label: string;
  localStorageKey: string;
}): Promise<void> {
  const {
    apiBaseURL,
    appBaseURL,
    email,
    password,
    stateFile,
    label,
    localStorageKey,
  } = options;

  console.log(`[global-setup] Authenticating ${label} (${email})...`);

  // Step 1: Obtain JWT token via direct API call — faster than UI login
  const apiContext = await request.newContext({ baseURL: apiBaseURL });
  const loginResponse = await apiContext.post("/api/login", {
    data: { email, password },
  });

  if (!loginResponse.ok()) {
    const body = await loginResponse.text();
    throw new Error(
      `[global-setup] Login failed for ${label} (${email}). ` +
        `Status: ${loginResponse.status()}. Body: ${body}`,
    );
  }

  const { token } = await loginResponse.json();
  await apiContext.dispose();

  // Step 2: Open a browser context, navigate to the app, and inject the token
  // into localStorage so the frontend recognises the authenticated session.
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: appBaseURL });
  const page = await context.newPage();

  // Navigate to the app root to initialise the origin in the browser context
  await page.goto("/");

  // Inject the JWT token into localStorage under the correct key for this frontend.
  // frontend-web uses 'token'; frontend-admin uses 'adminToken'.
  await page.evaluate(
    ({ jwtToken, key }: { jwtToken: string; key: string }) => {
      localStorage.setItem(key, jwtToken);
    },
    { jwtToken: token, key: localStorageKey },
  );

  // Reload to let the frontend pick up the token from localStorage
  await page.reload();

  // Step 3: Persist the full browser state (cookies + localStorage) to disk
  await context.storageState({ path: stateFile });
  console.log(`[global-setup] storageState saved → ${stateFile}`);

  await browser.close();
}

export default globalSetup;
