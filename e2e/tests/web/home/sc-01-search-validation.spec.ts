import { test, expect } from "../../../fixtures";
import { HomePage } from "../../../pages/web/home.page";

const searchVariants = [
  {
    id: "V1",
    keyword: "iPhone",
    desc: "EP (Valid — results found)",
    expectEmpty: false,
  },
  {
    id: "V2",
    keyword: "xyzzy_nosuchproduct_12345",
    desc: "EP (Valid — no results)",
    expectEmpty: true,
  },
  {
    id: "V3",
    keyword: "<script>alert(1)</script>",
    desc: "Error Guessing (XSS payload)",
    expectEmpty: true,
    isXss: true,
  },
  { id: "V4", keyword: "", desc: "EP (Invalid — empty)", expectEmpty: false }, // empty string might just return all products
];

test.describe("TC-HOME-04: Product Search Validation", () => {
  // Use userPage fixture or just page? The spec says "Browser is unauthenticated; application is running" for step 1, but Step 9 comes after login in E2E.
  // Wait, for validation, we can just use the home page without logging in if the SUT allows it, or use userPage.
  // We'll use `userPage` just to be safe and match a logged-in state if search behaves differently, but standard `page` is fine if we just goto("/").
  for (const variant of searchVariants) {
    test(`TC-SEARCH-${variant.id}: ${variant.desc}`, async ({ page }) => {
      const { keyword, expectEmpty, isXss } = variant;
      const homePage = new HomePage(page);
      await homePage.goto();

      // Listen for dialog if it's an XSS test
      let dialogFired = false;
      if (isXss) {
        page.on("dialog", async (dialog) => {
          dialogFired = true;
          await dialog.dismiss();
        });
      }

      await homePage.search(keyword);

      if (expectEmpty && keyword !== "") {
        await expect(homePage.emptyState).toBeVisible();
      } else {
        // Just verify the page didn't crash and cards are shown (or not shown depending on SUT implementation)
        // If it's an empty search string, we might just stay on the home page with default products
        await expect(homePage.productCards.first()).toBeVisible();
      }

      if (isXss) {
        // Verify keyword is escaped in the UI (e.g., in a "results for..." message or just safely rendered)
        // Check body text content contains the raw XSS string, which means it wasn't parsed as HTML
        await expect(page.locator("body")).toContainText(keyword);
        expect(dialogFired).toBe(false);
      }
    });
  }
});
