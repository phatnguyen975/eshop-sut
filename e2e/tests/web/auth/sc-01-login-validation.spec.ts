import { test, expect } from "../../../fixtures";
import { LoginPage } from "../../../pages/web/login.page";

const loginVariants = [
  {
    id: "V1",
    email: "test@eshop.com",
    pass: process.env.USER_PASSWORD ?? "Test1234!",
    desc: "All Valid",
    expectReject: false,
  },
  {
    id: "V2",
    email: "nouser@nowhere.com",
    pass: "Valid@Pass1",
    desc: "Email invalid — non-existent",
    expectReject: true,
    errorStr: "Email hoặc mật khẩu không chính xác",
  },
  {
    id: "V3",
    email: "",
    pass: "Valid@Pass1",
    desc: "Email invalid — empty",
    expectReject: true,
    errorStr: "Email là bắt buộc",
  },
  {
    id: "V4",
    email: "userdomain.com",
    pass: "Valid@Pass1",
    desc: "Email invalid — format",
    expectReject: true,
    errorStr: "Email không hợp lệ",
  },
  {
    id: "V5",
    email: "test@eshop.com",
    pass: "WrongPass999!",
    desc: "Password invalid — incorrect",
    expectReject: true,
    errorStr: "Email hoặc mật khẩu không chính xác",
  },
  {
    id: "V6",
    email: "test@eshop.com",
    pass: "",
    desc: "Password invalid — empty",
    expectReject: true,
    errorStr: "Mật khẩu là bắt buộc",
  },
];

test.describe("TC-AUTH-03: Login Form Validation", () => {
  for (const variant of loginVariants) {
    test(`TC-LOG-${variant.id}: ${variant.desc}`, async ({ page }) => {
      const { email, pass, expectReject, errorStr } = variant;
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login(email, pass);

      if (expectReject) {
        if (errorStr) {
          // HTML5 validation or form-level error message
          await expect(
            page.getByText(errorStr, { exact: false }).first(),
          ).toBeVisible({ timeout: 2000 });
        }
        await expect(page).toHaveURL(/\/login/);
      } else {
        await expect(page).toHaveURL(/\/$/);
      }
    });
  }
});

test("TC-SEC-V7: API — missing password field", async ({ request }) => {
  const response = await request.post("/api/login", {
    data: { email: "test@eshop.com" },
  });
  expect(response.status()).toBeGreaterThanOrEqual(400);
  expect(response.status()).toBeLessThan(500);
});
