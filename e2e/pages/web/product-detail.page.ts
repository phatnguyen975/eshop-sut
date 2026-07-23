import { Locator, Page } from "@playwright/test";
import { BasePage } from "../base.page";

export class ProductDetailPage extends BasePage {
  // Locators
  readonly productName: Locator = this.page.getByRole("heading", { level: 1 });
  readonly quantityInput: Locator = this.page.getByRole("spinbutton");
  readonly addToCartButton: Locator = this.page.getByRole("button", {
    name: /thêm vào giỏ hàng/i,
  });
  readonly toastNotification: Locator = this.page.getByRole("alert");

  // Global navbar elements used for verification in product detail tests
  readonly cartLink: Locator = this.page.getByRole("link", {
    name: /giỏ hàng/i,
  });

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate directly to a product detail page by its ID.
   */
  async navigateToProduct(productId: number | string): Promise<void> {
    await this.navigate(`/product/${productId}`);
  }

  /**
   * Set the quantity input to the specified value.
   */
  async setQuantity(qty: number | string): Promise<void> {
    await this.quantityInput.fill(qty.toString());
  }

  /**
   * Click the "Thêm vào giỏ hàng" button.
   */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
