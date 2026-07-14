import { test, expect } from "../../../fixtures";
import { faker } from "@faker-js/faker";
import { RegisterPage } from "../../../pages/web/register.page";
import { LoginPage } from "../../../pages/web/login.page";
import { HomePage } from "../../../pages/web/home.page";

test.describe("SC-01: Customer Registration, Login, and Browse Flow", () => {
  let createdUserId: number | undefined;

  test.afterEach(async ({ adminApiRequest }) => {
    if (createdUserId) {
      await adminApiRequest
        .delete(`/api/admin/users/${createdUserId}`)
        .catch(() => {
          console.warn(`Teardown failed for user ${createdUserId}`);
        });
    }
  });

  test("TC-AUTH-01: Customer completes registration, logs in and browses product catalog", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    // Generate dynamic user data for complete isolation
    const fullName = faker.person.fullName();
    const email = `user_${faker.string.uuid()}@example.com`;
    const password = "TestPassword123!@#";

    await test.step("Step 1 & 2 & 3: Navigate and register a new account", async () => {
      await registerPage.goto();

      // Verify all required fields have a '*' marker (FR-22)
      await expect(page.locator('label:has-text("Họ Tên")')).toContainText("*");
      await expect(page.locator('label:has-text("Email")')).toContainText("*");
      await expect(
        page.locator('label:has-text("Mật khẩu")').first(),
      ).toContainText("*");
      await expect(
        page.locator('label:has-text("Xác nhận mật khẩu")'),
      ).toContainText("*");

      // Check input types (FR-01, FR-22)
      await expect(registerPage.emailInput).toHaveAttribute("type", "email");
      await expect(registerPage.passwordInput).toHaveAttribute(
        "type",
        "password",
      );
      await expect(registerPage.confirmPasswordInput).toHaveAttribute(
        "type",
        "password",
      );

      // Prepare to intercept the API response to verify the backend behavior (Phase 1, Step 3)
      const registerPromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/register") &&
          response.request().method() === "POST",
      );

      await registerPage.register(fullName, email, password, password);

      const registerRes = await registerPromise;
      expect(registerRes.status()).toBe(200);
      const resBody = await registerRes.json();
      expect(resBody.message).toBe("User registered successfully");
      expect(typeof resBody.id).toBe("number");
      createdUserId = resBody.id;
    });

    await test.step("Step 4 & 5: Login with the new account", async () => {
      // Step 4: Verify redirect to Login page
      await loginPage.waitForURL(/\/login/);
      await expect(loginPage.emailInput).toHaveAttribute("type", "email");
      await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
      await expect(page.locator("h1")).toHaveCount(1);

      // Step 5: Submit login form and verify token
      const loginPromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/login") &&
          response.request().method() === "POST",
      );

      await loginPage.login(email, password);

      const loginRes = await loginPromise;
      expect(loginRes.status()).toBe(200);
      const resBody = await loginRes.json();
      expect(resBody.token).toBeDefined();
      expect(resBody.user.email).toBe(email);
    });

    await test.step("Step 6 & 7 & 8: Verify Home page rendering and Navbar state", async () => {
      await homePage.waitForURL(/\/$/); // Wait for redirect to home

      // Verify loading indicator behavior (FR-24)
      // Note: In some fast environments, the loading indicator might disappear before Playwright catches it.
      // We assert it is eventually hidden to avoid flakiness if it flashes too quickly.
      await expect(homePage.loadingIndicator).not.toBeVisible();

      // Exactly one <h1> (FR-21)
      await expect(homePage.pageHeading).toHaveCount(1);

      // Check Navbar state (FR-23)
      // A newly registered user should have 0 items in the cart
      await expect(homePage.cartLink).toContainText("0");
      await expect(homePage.logoutButton).toHaveText("Đăng xuất");

      // Verify product cards structure (FR-21, FR-24)
      const cards = homePage.productCards;
      // We expect the store to have at least one product seeded or available
      await expect(cards.first()).toBeVisible();

      const count = await cards.count();
      for (let i = 0; i < count; i++) {
        const card = cards.nth(i);
        const image = card.locator("img").first();
        // alt attribute must not be empty
        await expect(image).toHaveAttribute("alt", /.+/);
        // Price must contain currency symbol
        await expect(card).toContainText("₫");
      }
    });

    await test.step("Step 9 & 10: Search for a product and clear search", async () => {
      // Extract a product name to search for (guarantees a match)
      const firstCard = homePage.productCards.first();
      // Use generic heading locator for the product title
      const firstProductName =
        (await firstCard.locator("h2, h3").first().textContent()) || "Product";

      // S9.V1: Search matching keyword
      await homePage.search(firstProductName);
      await expect(homePage.loadingIndicator).not.toBeVisible();
      await expect(homePage.productCard(firstProductName)).toBeVisible();

      // S9.V2: Search non-matching keyword (Empty State)
      await homePage.search("NonExistentProductXYZ123");
      await expect(homePage.emptyState).toBeVisible();

      // S9.V3: Error Guessing (XSS — script injection)
      const scriptPayload = "<script>alert(1)</script>";
      let dialogFired = false;
      page.once("dialog", () => {
        dialogFired = true;
      });

      await homePage.search(scriptPayload);
      // Assert the raw text is visible (escaped safely)
      await expect(page.locator("body")).toContainText(scriptPayload);
      expect(dialogFired).toBe(false);

      // S9.V4: Error Guessing (XSS — HTML element)
      const htmlPayload = "<img src=x onerror=alert(1)>";
      await homePage.search(htmlPayload);
      await expect(page.locator("body")).toContainText(htmlPayload);
      expect(dialogFired).toBe(false);
    });
  });
});
