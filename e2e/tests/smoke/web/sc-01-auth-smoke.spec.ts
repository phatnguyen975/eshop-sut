// Demo trigger CI
import { test, expect } from "../../../fixtures";
import { RegisterPage } from "../../../pages/web/register.page";
import { LoginPage } from "../../../pages/web/login.page";
import { HomePage } from "../../../pages/web/home.page";
import { faker } from "@faker-js/faker";

// Launch browser in unauthenticated state (Override default storageState of the smoke-web project)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Smoke Test - SC-01: Core Auth & Browse Flow", () => {
  test("User can complete the critical path: register, login, and search", async ({ page, adminApiRequest, cleanup }) => {
    // 1. Prepare test data
    const email = `smoke_${faker.string.uuid()}@example.com`;
    const password = process.env.USER_PASSWORD ?? "Test1234!";
    const name = faker.person.fullName();

    // 2. Registration
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    
    // Intercept API to capture the user ID for cleanup
    const registerPromise = page.waitForResponse(
      r => r.url().includes('/api/register') && r.request().method() === 'POST'
    );
    await registerPage.register(name, email, password, password);
    
    const res = await registerPromise;
    const body = await res.json().catch(() => ({}));
    
    // Immediately register cleanup task
    if (body.id) {
      cleanup.add(async () => {
        await adminApiRequest.delete(`/api/admin/users/${body.id}`).catch(() => {});
      });
    }
    
    // Wait for redirection to login page
    await expect(page).toHaveURL(/\/login/);

    // 3. Login
    const loginPage = new LoginPage(page);
    await loginPage.login(email, password);
    
    // Wait for redirection to home page
    await expect(page).toHaveURL(/\/$/);

    // 4. Product Search
    const homePage = new HomePage(page);
    
    // Ensure search input is rendered
    await expect(homePage.searchInput).toBeVisible();
    
    // Search for a common keyword to test search functionality
    await homePage.search("iPhone"); 
    
    // In Smoke Test, we just verify the system responds without crashing
    // The response could either be product cards or "Không tìm thấy" state
    await expect(homePage.productCards.first().or(homePage.emptyState)).toBeVisible();
  });
});
