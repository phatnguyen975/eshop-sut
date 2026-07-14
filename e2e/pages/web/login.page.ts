import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "../base.page";

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Mật khẩu");
    this.submitButton = page.getByRole("button", { name: "Đăng Nhập" });
    this.errorAlert = page.getByRole("alert");
  }

  async goto() {
    await this.navigate("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
