import { test, expect } from "../../../fixtures";
import { faker } from "@faker-js/faker";
import { RegisterPage } from "../../../pages/web/register.page";
import { LoginPage } from "../../../pages/web/login.page";
import { HomePage } from "../../../pages/web/home.page";

test("TC-AUTH-01: Customer completes registration, logs in and browses product catalog", async ({
  page,
  request,
  cleanup,
  adminApiRequest,
}) => {
  const registerPage = new RegisterPage(page);
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);

  const fullName = faker.person.fullName();
  const email = `user_${faker.string.uuid()}@example.com`;
  const password = process.env.USER_PASSWORD as string;

  await test.step("Step 1, 2 & 3: Navigate and register a new account (UI & API)", async () => {
    await registerPage.goto();

    await expect(page.locator('label:has-text("Họ Tên")')).toContainText("*");
    await expect(page.locator('label:has-text("Email")')).toContainText("*");
    await expect(
      page.locator('label:has-text("Mật khẩu")').first(),
    ).toContainText("*");
    await expect(
      page.locator('label:has-text("Xác nhận mật khẩu")'),
    ).toContainText("*");

    await expect(registerPage.emailInput).toHaveAttribute("type", "email");
    await expect(registerPage.passwordInput).toHaveAttribute(
      "type",
      "password",
    );
    await expect(registerPage.confirmPasswordInput).toHaveAttribute(
      "type",
      "password",
    );

    const registerPromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/register") &&
        response.request().method() === "POST",
    );

    await registerPage.register(fullName, email, password, password);

    const registerRes = await registerPromise;
    const resBody = await registerRes.json().catch(() => ({}));

    // Register cleanup — runs even if subsequent assertions fail
    if (resBody.id) {
      cleanup.add(async () => {
        await adminApiRequest
          .delete(`/api/admin/users/${resBody.id}`)
          .catch(() => {});
      });
    }

    expect(registerRes.status()).toBe(200);
    expect(resBody.message).toBe("User registered successfully");
    expect(typeof resBody.id).toBe("number");
  });

  await test.step("Step 4, 5 & 6: Login with the new account (UI & API)", async () => {
    await loginPage.waitForURL(/\/login/);
    await expect(loginPage.emailInput).toHaveAttribute("type", "email");
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
    await expect(page.locator("h1")).toHaveCount(1);

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

  await test.step("Step 7 & 8: Verify Home page rendering and Navbar state", async () => {
    await homePage.waitForURL(/\/$/);

    await expect(homePage.loadingIndicator).not.toBeVisible();
    await expect(homePage.pageHeading).toHaveCount(1);
    await expect(homePage.cartLink).toContainText("0");
    await expect(homePage.logoutButton).toHaveText("Đăng xuất");

    const cards = homePage.productCards;
    await expect(cards.first()).toBeVisible();

    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const image = card.locator("img").first();
      await expect(image).toHaveAttribute("alt", /.+/);
      await expect(card).toContainText("₫");
    }
  });

  await test.step("Step 9 & 10: Search for a product (UI & API)", async () => {
    const firstCard = homePage.productCards.first();
    const firstProductName =
      (await firstCard.locator("h2, h3").first().textContent()) || "Product";

    await homePage.search(firstProductName);
    await expect(homePage.loadingIndicator).not.toBeVisible();
    await expect(homePage.productCards.filter({ hasText: firstProductName })).toBeVisible();

    // Verify search via API using the injected request fixture
    const apiRes = await request.get(
      `/api/products?search=${encodeURIComponent(firstProductName)}`,
    );
    expect(apiRes.status()).toBe(200);
    const products = await apiRes.json();
    expect(products.length).toBeGreaterThan(0);
    // Use regular expression or direct match
    const containsKeyword = products.some((p: any) =>
      p.name.includes(firstProductName),
    );
    expect(containsKeyword).toBe(true);
  });

  await test.step("Step 11: Empty state assertion", async () => {
    await homePage.search("xyzzy_nosuchproduct_12345");
    await expect(homePage.emptyState).toBeVisible();
  });
});
