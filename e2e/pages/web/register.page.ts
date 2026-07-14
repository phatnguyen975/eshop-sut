import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "../base.page";

export class RegisterPage extends BasePage {
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.fullNameInput = page.getByLabel("Họ Tên");
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Mật khẩu", { exact: true });
    this.confirmPasswordInput = page.getByLabel("Xác nhận mật khẩu");
    this.submitButton = page.getByRole("button", { name: "Đăng Ký" });
    this.errorAlert = page.getByRole("alert");
  }

  async goto() {
    await this.navigate("/register");
  }

  async register(
    fullName: string,
    email: string,
    password: string,
    confirmPassword?: string,
  ) {
    await this.fullNameInput.fill(fullName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    // Use the provided confirmPassword or default to password to simplify happy-path tests
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
    await this.submitButton.click();
  }
}
