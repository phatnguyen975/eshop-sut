import { test, expect } from "../../../fixtures";
import { faker } from "@faker-js/faker";
import { RegisterPage } from "../../../pages/web/register.page";
import { LoginPage } from "../../../pages/web/login.page";

test.describe("SC-01 Validation: Authentication Forms", () => {
  test.describe("Registration Form", () => {
    let registerPage: RegisterPage;

    test.beforeEach(async ({ page }) => {
      registerPage = new RegisterPage(page);
      await registerPage.goto();
    });

    test("TC-AUTH-02: S2b.V2/V3 - Rejects invalid email formats", async ({
      page,
    }) => {
      await registerPage.register(
        "Test User",
        "invalidemail.com",
        "ValidPass123!",
        "ValidPass123!",
      );
      // HTML5 validation or application validation should show an error
      // HTML5 invalid field logic - pseudo class check or error message
      const emailInput = registerPage.emailInput;
      // Depending on implementation, we assert the error alert or HTML5 pseudo class
      // S2b expects "error message shown above submit button", which translates to an alert or text
      const errorMsg = registerPage.errorAlert.or(
        page.locator(".text-red-500"),
      );
      await expect(errorMsg.first()).toBeVisible();
    });

    test("TC-AUTH-03: S2b.V4 - Rejects duplicate email registration", async () => {
      // test@eshop.com is a known existing user per SRS
      await registerPage.register(
        "Existing User",
        "test@eshop.com",
        "ValidPass123!",
        "ValidPass123!",
      );
      await expect(registerPage.errorAlert.first()).toBeVisible();
    });

    test("TC-AUTH-04: S2c.V2 - Rejects password missing uppercase", async () => {
      await registerPage.register(
        "Test User",
        "testuser@example.com",
        "test1234!",
        "test1234!",
      );
      await expect(registerPage.errorAlert.first()).toBeVisible();
    });

    test("TC-AUTH-05: S2c.V3 - Rejects password missing lowercase", async () => {
      await registerPage.register(
        "Test User",
        "testuser@example.com",
        "TEST1234!",
        "TEST1234!",
      );
      await expect(registerPage.errorAlert.first()).toBeVisible();
    });

    test("TC-AUTH-06: S2c.V4 - Rejects password missing digit", async () => {
      await registerPage.register(
        "Test User",
        "testuser@example.com",
        "Testabcd!",
        "Testabcd!",
      );
      await expect(registerPage.errorAlert.first()).toBeVisible();
    });

    test("TC-AUTH-07: S2c.V5 - Rejects password missing special char", async () => {
      await registerPage.register(
        "Test User",
        "testuser@example.com",
        "Test12345",
        "Test12345",
      );
      await expect(registerPage.errorAlert.first()).toBeVisible();
    });

    test("TC-AUTH-08: S2c.V7 - Rejects password shorter than 8 chars (7 chars)", async () => {
      await registerPage.register(
        "Test User",
        "testuser@example.com",
        "Test12!",
        "Test12!",
      );
      await expect(registerPage.errorAlert.first()).toBeVisible();
    });

    test("TC-AUTH-09: S2d.V2 - Rejects mismatched passwords", async () => {
      await registerPage.register(
        "Test User",
        "testuser@example.com",
        "Test1234!",
        "Other123!",
      );
      await expect(registerPage.errorAlert.first()).toBeVisible();
    });
  });

  test.describe("Login Form", () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.goto();
    });

    test("TC-AUTH-10: S5a.V2 - Rejects login with wrong password", async () => {
      await loginPage.login("test@eshop.com", "Wrong123!");
      await expect(loginPage.errorAlert.first()).toBeVisible();
    });

    test("TC-AUTH-11: S5a.V3 - Rejects login with non-existent email", async () => {
      await loginPage.login(
        `nonexistent_${faker.string.uuid()}@example.com`,
        "Test1234!",
      );
      await expect(loginPage.errorAlert.first()).toBeVisible();
    });

    test("TC-AUTH-12: S5b.V2 - Login with case-insensitive email", async ({
      page,
    }) => {
      // test@eshop.com should work even if TEST@ESHOP.COM is passed
      await loginPage.login("TEST@ESHOP.COM", "Test1234!");
      await expect(page).not.toHaveURL(/\/login/);
    });
  });
});
