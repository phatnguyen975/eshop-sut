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
    // Semantic locators with fallbacks for robust targeting
    this.searchInput = page
      .getByPlaceholder(/tìm kiếm/i)
      .or(page.getByRole("searchbox"));
    this.pageHeading = page.locator("h1");
    this.navbar = page.getByRole("navigation");
    this.cartLink = page.getByRole("link", { name: /giỏ hàng/i });
    this.logoutButton = page.getByRole("button", { name: "Thoát" });
    this.loadingIndicator = page
      .getByRole("status")
      .or(page.getByText(/đang tải/i));

    // CSS: Product cards might not have an explicit ARIA role, using a standard class fallback just in case
    this.productCards = page
      .getByRole("article")
      .or(page.locator(".product-card"));
    this.emptyState = page
      .locator(".empty-state")
      .or(page.getByText(/không tìm thấy/i));
  }

  async goto() {
    await this.navigate("/");
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchInput.press("Enter");
  }

  async logout() {
    await this.logoutButton.click();
  }

  /** Dynamic locator to find a specific product card by its name */
  productCard(name: string): Locator {
    return this.productCards.filter({ hasText: name });
  }
}
