import { Locator, Page } from "@playwright/test";
import { BasePage } from "../base.page";

export class CartPage extends BasePage {
  // Navigation & Structure
  readonly breadcrumb: Locator = this.page.getByRole("navigation", {
    name: /breadcrumb/i,
  });

  // Table elements
  readonly cartTable: Locator = this.page.getByRole("table");
  readonly cartRows: Locator = this.cartTable.locator("tbody tr");

  // Summary elements
  readonly totalLabel: Locator = this.page.getByText("Tổng cộng");
  readonly checkoutButton: Locator = this.page.getByRole("button", {
    name: /Tiến hành thanh toán/i,
  });
  readonly emptyCartMessage: Locator = this.page.getByText(
    /giỏ hàng của bạn đang trống/i,
  );
  readonly continueShoppingButton: Locator = this.page.getByRole("link", {
    name: /Tiếp tục mua sắm/i,
  });

  // Dialog elements
  readonly confirmDialog: Locator = this.page.getByRole("dialog");
  readonly confirmButton: Locator = this.confirmDialog.getByRole("button", {
    name: /xác nhận|ok/i,
  });
  readonly cancelButton: Locator = this.confirmDialog.getByRole("button", {
    name: /hủy|cancel/i,
  });

  // Global navbar elements used for verification in cart tests
  readonly cartBadge: Locator = this.page.getByRole("link", {
    name: /giỏ hàng/i,
  });

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the Cart page.
   */
  async navigateToCart(): Promise<void> {
    await this.navigate("/cart");
  }

  /**
   * Get a specific line item row by product name.
   */
  getCartRow(productName: string): Locator {
    return this.cartRows.filter({ hasText: productName });
  }

  /**
   * Click the remove button for a specific product row.
   */
  async removeProduct(productName: string): Promise<void> {
    const row = this.getCartRow(productName);
    await row.getByRole("button", { name: /xóa sản phẩm/i }).click();
  }

  /**
   * Click the remove button for the first product row.
   */
  async removeFirstProduct(): Promise<void> {
    await this.cartRows
      .first()
      .getByRole("button", { name: /xóa sản phẩm/i })
      .click();
  }

  /**
   * Click to proceed to checkout.
   */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /**
   * Confirm the removal dialog.
   */
  async confirmRemoval(): Promise<void> {
    await this.confirmButton.click();
  }

  /**
   * Cancel the removal dialog.
   */
  async cancelRemoval(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Click to continue shopping (return to home) when cart is empty.
   */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }
}
