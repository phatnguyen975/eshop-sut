import { test, expect } from "../../../fixtures";
import { RegisterPage } from "../../../pages/web/register.page";

const registerVariants = [
  {
    id: "V1",
    name: "Nguyen Van A",
    email: "user@test-domain.com",
    pass: "Valid@Pass1",
    confirm: "Valid@Pass1",
    desc: "All valid",
    expectReject: false,
    errorStr: "",
  },
  {
    id: "V2",
    name: "",
    email: "user2@test-domain.com",
    pass: "Valid@Pass1",
    confirm: "Valid@Pass1",
    desc: "Name invalid - empty",
    expectReject: true,
    errorStr: "Họ tên là bắt buộc",
  },
  {
    id: "V3",
    name: "Nguyen Van A",
    email: "",
    pass: "Valid@Pass1",
    confirm: "Valid@Pass1",
    desc: "Email invalid - empty",
    expectReject: true,
    errorStr: "Email là bắt buộc",
  },
  {
    id: "V4",
    name: "Nguyen Van A",
    email: "userdomain.com",
    pass: "Valid@Pass1",
    confirm: "Valid@Pass1",
    desc: "Email invalid - format 1",
    expectReject: true,
    errorStr: "Email không hợp lệ",
  },
  {
    id: "V5",
    name: "Nguyen Van A",
    email: "user@",
    pass: "Valid@Pass1",
    confirm: "Valid@Pass1",
    desc: "Email invalid - format 2",
    expectReject: true,
    errorStr: "Email không hợp lệ",
  },
  {
    id: "V6",
    name: "Nguyen Van A",
    email: "test@eshop.com",
    pass: "Valid@Pass1",
    confirm: "Valid@Pass1",
    desc: "Email invalid - duplicate",
    expectReject: true,
    errorStr: "Email đã tồn tại",
  },
  {
    id: "V7",
    name: "Nguyen Van A",
    email: "user3@test-domain.com",
    pass: "",
    confirm: "",
    desc: "Password invalid - empty",
    expectReject: true,
    errorStr: "Mật khẩu là bắt buộc",
  },
  {
    id: "V8",
    name: "Nguyen Van A",
    email: "user4@test-domain.com",
    pass: "invalid@pass1",
    confirm: "invalid@pass1",
    desc: "Password invalid - no uppercase",
    expectReject: true,
    errorStr:
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
  },
  {
    id: "V9",
    name: "Nguyen Van A",
    email: "user5@test-domain.com",
    pass: "INVALID@PASS1",
    confirm: "INVALID@PASS1",
    desc: "Password invalid - no lowercase",
    expectReject: true,
    errorStr:
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
  },
  {
    id: "V10",
    name: "Nguyen Van A",
    email: "user6@test-domain.com",
    pass: "Invalid@Pass",
    confirm: "Invalid@Pass",
    desc: "Password invalid - no digit",
    expectReject: true,
    errorStr:
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
  },
  {
    id: "V11",
    name: "Nguyen Van A",
    email: "user7@test-domain.com",
    pass: "InvalidPass1",
    confirm: "InvalidPass1",
    desc: "Password invalid - no special",
    expectReject: true,
    errorStr:
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
  },
  {
    id: "V12",
    name: "Nguyen Van A",
    email: "user8@test-domain.com",
    pass: "Va@1abc",
    confirm: "Va@1abc",
    desc: "Password invalid - 7 chars",
    expectReject: true,
    errorStr: "Mật khẩu phải dài ít nhất 8 ký tự",
  },
  {
    id: "V13",
    name: "Nguyen Van A",
    email: "user9@test-domain.com",
    pass: "Valid@Pass1",
    confirm: "",
    desc: "Confirm invalid - empty",
    expectReject: true,
    errorStr: "Xác nhận mật khẩu là bắt buộc",
  },
  {
    id: "V14",
    name: "Nguyen Van A",
    email: "user10@test-domain.com",
    pass: "Valid@Pass1",
    confirm: "Different@Pass2",
    desc: "Confirm invalid - mismatch",
    expectReject: true,
    errorStr: "Mật khẩu xác nhận không khớp",
  },
];

test.describe("TC-AUTH-02: Registration Form Validation", () => {
  for (const variant of registerVariants) {
    test(`TC-REG-${variant.id}: ${variant.desc}`, async ({
      page,
      adminApiRequest,
      cleanup,
    }) => {
      const { email, name, pass, confirm, expectReject, errorStr } = variant;
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      // Intercept the API call to wait for it before asserting UI if we expect it to trigger
      const registerPromise = expectReject
        ? null
        : page.waitForResponse(
            (r) =>
              r.url().includes("/api/register") &&
              r.request().method() === "POST",
          );

      // Fill in and submit the form
      await registerPage.register(name, email, pass, confirm);

      if (expectReject) {
        // Assert that the registration was rejected and the correct error message is displayed
        if (errorStr) {
          // Check for the error message either in an alert box or near the fields (HTML5 validation or custom UI error)
          // Since we don't know the exact HTML structure, we'll check if the text exists on the page
          await expect(page.getByText(errorStr)).toBeVisible({ timeout: 2000 });
        }
        await expect(page).toHaveURL(/\/register/);
      } else {
        // Assert success path
        const res = await registerPromise!;
        const resBody = await res.json().catch(() => ({}));

        // Immediately register cleanup
        if (resBody.id) {
          cleanup.add(async () => {
            await adminApiRequest
              .delete(`/api/admin/users/${resBody.id}`)
              .catch(() => {});
          });
        }

        expect(res.status()).toBe(200);
        await expect(page).toHaveURL(/\/login/);
      }
    });
  }
});
