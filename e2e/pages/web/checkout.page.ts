import { Locator, Page } from "@playwright/test";
import { BasePage } from "../base.page";

export class CheckoutPage extends BasePage {
  // Navigation & Structure
  readonly breadcrumb: Locator = this.page.getByRole("navigation", {
    name: /breadcrumb/i,
  });

  // Products and Summary
  readonly summaryHeading: Locator = this.page.getByRole("heading", {
    name: /xác nhận đơn hàng/i,
  });
  readonly productsSection: Locator = this.page
    .getByText(/sản phẩm/i)
    .locator(".."); // The container holding the product list
  readonly productItems: Locator = this.page.getByRole("listitem");

  // Totals
  readonly subtotalLabel: Locator =
    this.page.getByText(/tổng tiền thanh toán/i);
  readonly finalTotalLabel: Locator = this.page.getByText(/tổng thanh toán/i);

  // Coupon elements
  readonly couponInput: Locator = this.page
    .getByRole("textbox", { name: /mã giảm giá/i })
    .or(this.page.getByPlaceholder(/mã giảm giá/i));
  readonly applyCouponButton: Locator = this.page.getByRole("button", {
    name: /áp dụng/i,
  });
  readonly couponMessage: Locator = this.page.getByRole("alert");

  // Checkout Form elements
  readonly shippingAddressInput: Locator = this.page
    .getByLabel(/địa chỉ giao hàng/i)
    .or(this.page.getByPlaceholder(/địa chỉ/i));
  readonly confirmPaymentButton: Locator = this.page.getByRole("button", {
    name: /xác nhận thanh toán/i,
  });

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate directly to the checkout page.
   */
  async navigateToCheckout(): Promise<void> {
    await this.navigate("/checkout");
  }

  /**
   * Fill in the shipping address.
   */
  async fillShippingAddress(address: string): Promise<void> {
    await this.shippingAddressInput.fill(address);
  }

  /**
   * Enter and apply a coupon code.
   */
  async applyCoupon(code: string): Promise<void> {
    await this.couponInput.fill(code);
    await this.applyCouponButton.click();
  }

  /**
   * Click the confirm payment button to place the order.
   */
  async confirmPayment(): Promise<void> {
    await this.confirmPaymentButton.click();
  }
}
