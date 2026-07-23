import {
  test as base,
  Page,
  APIRequestContext,
  request,
} from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Custom fixture types for EShop test suite.
 *
 * Fixtures are the recommended Playwright mechanism for sharing setup/teardown
 * logic across tests. Each fixture is created fresh per test ('test' scope)
 * to ensure full isolation — no shared mutable state between tests.
 *
 * Current fixtures:
 *   userPage        → Page pre-loaded with standard user session
 *   adminPage       → Page pre-loaded with admin user session
 *   userApiRequest  → APIRequestContext with user Bearer token
 *   adminApiRequest → APIRequestContext with admin Bearer token
 *   seededProduct   → Creates a product before test, deletes it after
 *   seededOrder     → Creates a pending order before test, cancels it after
 *
 * Adding new fixtures:
 *   Define new fixture types in EShopFixtures and implement them in the
 *   test.extend() call below. Keep each fixture focused on one resource.
 *   Always include teardown code after await use(...).
 */
type EShopFixtures = {
  userPage: Page;
  adminPage: Page;
  userApiRequest: APIRequestContext;
  adminApiRequest: APIRequestContext;
  seededProduct: { id: number; name: string; price: number };
  seededOrder: { id: number };
  emptyCart: void;
  cleanup: { add: (fn: () => Promise<void>) => void };
};

// ---------------------------------------------------------------------------
// Helpers — reused across multiple fixtures
// ---------------------------------------------------------------------------

async function getAuthenticatedContext(
  email: string,
  password: string,
): Promise<APIRequestContext> {
  const baseURL = process.env.API_BASE_URL ?? "http://localhost:3000";

  const plain = await request.newContext({ baseURL });
  const loginRes = await plain.post("/api/login", {
    data: { email, password },
  });
  const { token } = await loginRes.json();
  await plain.dispose();

  return request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

// ---------------------------------------------------------------------------
// Fixture implementations
// ---------------------------------------------------------------------------

export const test = base.extend<EShopFixtures>({
  // ---------------------------------------------------------------------------
  // userPage — Page with standard user storageState pre-loaded
  // Scope: 'test' (default) — fresh context per test
  // ---------------------------------------------------------------------------
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: ".auth/user.json",
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // ---------------------------------------------------------------------------
  // adminPage — Page with admin storageState pre-loaded
  // Scope: 'test' (default) — fresh context per test
  // ---------------------------------------------------------------------------
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: ".auth/admin.json",
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // ---------------------------------------------------------------------------
  // userApiRequest — APIRequestContext authenticated as standard user
  // Obtains a fresh token via POST /api/login before each test.
  // Scope: 'test' (default)
  // ---------------------------------------------------------------------------
  userApiRequest: async ({}, use) => {
    const ctx = await getAuthenticatedContext(
      process.env.USER_EMAIL ?? "test@eshop.com",
      process.env.USER_PASSWORD ?? "Test1234!",
    );
    await use(ctx);
    await ctx.dispose();
  },

  // ---------------------------------------------------------------------------
  // adminApiRequest — APIRequestContext authenticated as admin
  // Scope: 'test' (default)
  // ---------------------------------------------------------------------------
  adminApiRequest: async ({}, use) => {
    const ctx = await getAuthenticatedContext(
      process.env.ADMIN_EMAIL ?? "admin@eshop.com",
      process.env.ADMIN_PASSWORD ?? "Admin123!",
    );
    await use(ctx);
    await ctx.dispose();
  },

  // ---------------------------------------------------------------------------
  // seededProduct — creates a product via API before the test, deletes it after
  // Requires: adminApiRequest fixture (implicitly via request.newContext)
  // Scope: 'test' (default)
  // ---------------------------------------------------------------------------
  seededProduct: async ({}, use) => {
    const adminCtx = await getAuthenticatedContext(
      process.env.ADMIN_EMAIL ?? "admin@eshop.com",
      process.env.ADMIN_PASSWORD ?? "Admin123!",
    );

    // Create a product with deterministic test data
    const createRes = await adminCtx.post("/api/products", {
      data: {
        name: `Test Product ${Date.now()}`,
        price: 150000,
        description: "Seeded by Playwright fixture",
        imageUrl: "",
        category_id: 1,
      },
    });
    const product = await createRes.json();

    // Yield the product data to the test
    await use({ id: product.id, name: product.name, price: product.price });

    // Teardown — always runs even if the test fails
    await adminCtx.delete(`/api/products/${product.id}`).catch(() => {
      console.warn(
        `seededProduct teardown: could not delete product ${product.id}`,
      );
    });
    await adminCtx.dispose();
  },

  // ---------------------------------------------------------------------------
  // seededOrder — creates a pending order via API before the test
  // Flow: add product to cart → checkout → yields order id
  // Teardown: cancels the order if still in a cancellable state
  // Scope: 'test' (default)
  // ---------------------------------------------------------------------------
  seededOrder: async ({}, use) => {
    const userCtx = await getAuthenticatedContext(
      process.env.USER_EMAIL ?? "test@eshop.com",
      process.env.USER_PASSWORD ?? "Test1234!",
    );

    // Add a product to cart
    await userCtx.post("/api/cart", {
      data: { id: 1, name: "Seeded Product", price: 150000, quantity: 1 },
    });

    // Checkout to create the order
    const checkoutRes = await userCtx.post("/api/checkout", {
      data: {
        total_amount: 150000,
        shipping_address: "123 Test Street, Ho Chi Minh City",
      },
    });
    const order = await checkoutRes.json();
    const orderId: number = order.id ?? order.order?.id;

    await use({ id: orderId });

    // Teardown — cancel order; silently skip if already in terminal state
    await userCtx.put(`/api/orders/${orderId}/cancel`).catch(() => {});
    await userCtx.dispose();
  },

  // ---------------------------------------------------------------------------
  // emptyCart — ensures the user's cart is empty before and after the test via API
  // Scope: 'test' (default)
  // ---------------------------------------------------------------------------
  emptyCart: async ({}, use) => {
    const userCtx = await getAuthenticatedContext(
      process.env.USER_EMAIL ?? "test@eshop.com",
      process.env.USER_PASSWORD ?? "Test1234!",
    );

    // Setup: clear cart before test
    await userCtx.delete("/api/cart").catch(() => {
      console.warn(
        "emptyCart setup: could not clear cart (endpoint might not exist)",
      );
    });

    await use();

    // Teardown: clear cart after test
    await userCtx.delete("/api/cart").catch(() => {
      console.warn(
        "emptyCart teardown: could not clear cart (endpoint might not exist)",
      );
    });
    await userCtx.dispose();
  },

  // ---------------------------------------------------------------------------
  // cleanup — Registry fixture for teardown of data created within tests
  // Tests can call cleanup.add(async () => { ... }) immediately after creating data.
  // Scope: 'test' (default)
  // ---------------------------------------------------------------------------
  cleanup: async ({}, use) => {
    const tasks: Array<() => Promise<void>> = [];
    await use({
      add: (fn: () => Promise<void>) => tasks.push(fn),
    });
    // Teardown: execute all registered cleanup tasks in reverse order
    for (const task of tasks.reverse()) {
      await task().catch((err) =>
        console.warn(`[cleanup] Task failed: ${err.message}`),
      );
    }
  },
});

export { expect } from "@playwright/test";
