import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "../base.page";

export class HomePage extends BasePage {
  readonly searchInput: Locator;
  readonly productCards: Locator;
  readonly emptyState: Locator;
  readonly pageHeading: Locator;
  readonly cartLink: Locator;
  readonly logoutButton: Locator;
  readonly loadingIndicator: Locator;
  readonly navbar: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page
      .getByPlaceholder(/tìm kiếm/i)
      .or(page.getByRole("textbox"));
    this.pageHeading = page.locator("h1");
    this.navbar = page.getByRole("navigation");
    this.cartLink = page.getByRole("link", { name: /giỏ hàng/i });
    this.logoutButton = page.getByRole("button", { name: "Đăng xuất" });
    this.loadingIndicator = page
      .getByRole("status")
      .or(page.getByText(/đang tải/i));
    this.productCards = page.locator(".grid > div");
    this.emptyState = page.getByText(/không tìm thấy/i);
  }

  async goto(): Promise<void> {
    await this.navigate("/");
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
    await this.searchInput.press("Enter");
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
