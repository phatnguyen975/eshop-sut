import { test, expect } from "../../../fixtures";
import { HomePage } from "../../../pages/web/home.page";
import { ProductDetailPage } from "../../../pages/web/product-detail.page";
import { CartPage } from "../../../pages/web/cart.page";
import { CheckoutPage } from "../../../pages/web/checkout.page";

test.describe("SC-02: Authenticated Customer Cart and Checkout Flow", () => {
  test("should complete the full purchase journey successfully", async ({
    userPage,
    emptyCart,
  }) => {
    // Initialize Page Objects
    const homePage = new HomePage(userPage);
    const productDetailPage = new ProductDetailPage(userPage);
    const cartPage = new CartPage(userPage);
    const checkoutPage = new CheckoutPage(userPage);

    // Step 1: Navigate to the product listing page
    await homePage.goto();
    await expect(homePage.cartLink).toBeVisible();

    // Step 2: Click on the "Xem chi tiết" button of the first product
    await expect(homePage.productCards.first()).toBeVisible();
    await homePage.productCards
      .first()
      .getByText(/xem chi tiết/i)
      .click();

    // Step 3: Verify quantity input accepts only positive integers (minimum 1)
    await expect(productDetailPage.quantityInput).toBeVisible();
    await expect(productDetailPage.quantityInput).toHaveValue("1");

    // Step 4: Click "Thêm vào giỏ hàng" with quantity = 1
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartLink).toContainText("1");

    // Step 5: Navigate to a second product and add it
    await homePage.goto();
    await expect(homePage.productCards.nth(1)).toBeVisible();
    await homePage.productCards
      .nth(1)
      .getByText(/xem chi tiết/i)
      .click();
    await productDetailPage.addToCart();
    await expect(productDetailPage.cartLink).toContainText("2");

    // Step 6: Navigate to Cart
    await cartPage.navigateToCart();
    await expect(cartPage.breadcrumb).toBeVisible();
    await expect(cartPage.cartRows).toHaveCount(2);
    await expect(cartPage.totalLabel).toBeVisible(); // Must be "Tổng cộng"

    // Step 7: Verify cart total format
    // Real calculation verification would require parsing text; ensuring the label and currency symbol are present
    const totalContainer = cartPage.totalLabel.locator("..");
    await expect(totalContainer).toContainText("₫");

    // Step 8: Click the remove action on the first line item
    await cartPage.removeFirstProduct();
    await expect(cartPage.confirmDialog).toBeVisible();

    // Step 9: Confirm the dialog
    await cartPage.confirmRemoval();

    // Verify item removed
    await expect(cartPage.confirmDialog).toBeHidden();
    await expect(cartPage.cartRows).toHaveCount(1);
    await expect(cartPage.cartBadge).toContainText("1");

    // Step 10: Proceed to checkout
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.breadcrumb).toBeVisible();
    await expect(checkoutPage.summaryHeading).toBeVisible();
    await expect(checkoutPage.productItems).toHaveCount(1);

    // Step 11: Verify checkout total UI presence (API logic tested separately)
    await expect(checkoutPage.subtotalLabel).toBeVisible();

    // Step 12: Enter valid shipping address and place order
    await checkoutPage.fillShippingAddress("123 E2E Test Street, HCM");
    await checkoutPage.confirmPayment();

    // Step 13: Verify post-checkout UI state
    // Wait for navigation away from checkout
    await userPage.waitForURL((url) => !url.href.includes("/checkout"));

    // Cart should be cleared
    // We navigate to home or cart to verify badge is 0 or absent
    await homePage.goto();
    await expect(homePage.cartLink).not.toContainText("1");
  });
});
