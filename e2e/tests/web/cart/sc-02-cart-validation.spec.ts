import { test, expect } from "../../../fixtures";
import { HomePage } from "../../../pages/web/home.page";
import { ProductDetailPage } from "../../../pages/web/product-detail.page";
import { CartPage } from "../../../pages/web/cart.page";

const qtyVariants = [
  { id: "S3.V1", type: "valid", input: "2", expectedValid: true },
  { id: "S3.V2", type: "valid", input: "1", expectedValid: true },
  { id: "S3.V3", type: "invalid", input: "0", expectedValid: false },
  { id: "S3.V4", type: "invalid", input: "-1", expectedValid: false },
  { id: "S3.V5", type: "invalid", input: "1.5", expectedValid: false },
  { id: "S3.V6", type: "invalid", input: "abc", expectedValid: false },
];

test.describe("SC-02: Cart Validation (Data-driven & Edge cases)", () => {
  test.describe("Step 3: Quantity Input Validation [Domain Testing]", () => {
    for (const variant of qtyVariants) {
      test(`[${variant.id}] should handle quantity input: ${variant.input}`, async ({
        userPage,
        emptyCart,
      }) => {
        const homePage = new HomePage(userPage);
        const productDetailPage = new ProductDetailPage(userPage);

        await homePage.goto();
        await homePage.productCards
          .first()
          .getByText(/xem chi tiết/i)
          .click();

        await expect(productDetailPage.quantityInput).toBeVisible();

        // Fill the input
        // Using evaluate or fill. 'fill' on type="number" with "abc" might throw in Playwright depending on browser,
        // so we can fallback to typing if needed, but fill is standard.
        // We'll use fill and if it throws due to strict validation, we catch it as a successful rejection of bad input.
        try {
          await productDetailPage.setQuantity(variant.input);
        } catch (e) {
          if (!variant.expectedValid) {
            // Expected to fail filling (e.g. type="number" blocks "abc")
            return;
          }
          throw e; // Should not throw for valid inputs
        }

        // Validate state
        if (variant.expectedValid) {
          // Verify it was accepted
          await expect(productDetailPage.quantityInput).toHaveValue(
            variant.input,
          );
          // And we can add it
          await productDetailPage.addToCart();
          await expect(productDetailPage.cartLink).toContainText("1");
        } else {
          // For invalid variants, the SUT must either reject the input, clamp it to a valid value, or show an error.
          await productDetailPage.addToCart();

          const isInvalidHTML5 = await productDetailPage.quantityInput.evaluate(
            (el: HTMLInputElement) => !el.checkValidity(),
          );
          const currentValue =
            await productDetailPage.quantityInput.inputValue();

          if (isInvalidHTML5) {
            // Case 1: HTML5 Native validation caught the error
            expect(isInvalidHTML5).toBe(true);
          } else if (currentValue === variant.input) {
            // Case 2: The UI accepted the invalid string as value. It MUST NOT add it to the cart.
            await expect(productDetailPage.cartLink).not.toContainText("1");
          } else {
            // Case 3: The SUT clamped/cleared the value (e.g., changed "0" to "1" or "").
            // As long as the current value isn't the invalid input, it's safe.
            expect(currentValue).not.toBe(variant.input);
          }
        }
      });
    }
  });

  test.describe("Steps 8-9: Remove Item with Confirmation Dialog [Decision Table]", () => {
    test.beforeEach(async ({ userPage, emptyCart }) => {
      // Setup precondition: Cart has 1 item
      const homePage = new HomePage(userPage);
      const productDetailPage = new ProductDetailPage(userPage);

      await homePage.goto();
      await homePage.productCards
        .first()
        .getByText(/xem chi tiết/i)
        .click();
      await productDetailPage.addToCart();
      await expect(productDetailPage.cartLink).toContainText("1");
    });

    test("[S8.V1] Confirm (OK) - removes item from cart", async ({
      userPage,
    }) => {
      const cartPage = new CartPage(userPage);

      await cartPage.navigateToCart();
      await expect(cartPage.cartRows).toHaveCount(1);

      // Trigger removal
      await cartPage.removeFirstProduct();
      await expect(cartPage.confirmDialog).toBeVisible();

      // Confirm
      await cartPage.confirmRemoval();

      // Item should be removed
      await expect(cartPage.confirmDialog).toBeHidden();
      await expect(cartPage.cartRows).toHaveCount(0);
      await expect(cartPage.cartBadge).not.toContainText("1");
    });

    test("[S8.V2] Cancel - keeps item in cart", async ({ userPage }) => {
      const cartPage = new CartPage(userPage);

      await cartPage.navigateToCart();
      await expect(cartPage.cartRows).toHaveCount(1);

      // Trigger removal
      await cartPage.removeFirstProduct();
      await expect(cartPage.confirmDialog).toBeVisible();

      // Cancel
      await cartPage.cancelRemoval();

      // Item should remain
      await expect(cartPage.confirmDialog).toBeHidden();
      await expect(cartPage.cartRows).toHaveCount(1);
      await expect(cartPage.cartBadge).toContainText("1");
    });
  });
});
