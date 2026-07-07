import { Page } from "@playwright/test";

/**
 * BasePage — abstract base class for all Page Object Model classes.
 *
 * Provides shared navigation helpers available to every page.
 * All concrete POM classes (LoginPage, CartPage, etc.) extend this class.
 *
 * Design rules:
 *   - No assertions inside this class or any POM class.
 *   - No hardcoded URLs — all navigation uses relative paths with baseURL from config.
 *   - Locators are defined in concrete subclasses as readonly properties.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Navigate to a relative path within the application.
   * Playwright auto-waits for the load event after goto().
   *
   * Do NOT call waitForLoadState('networkidle') here — it is slow and flaky
   * with React apps that maintain persistent WebSocket or polling connections.
   * Add specific expect(locator).toBeVisible() assertions in individual tests instead.
   */
  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for the page URL to match a given pattern.
   * Useful after form submissions that trigger a redirect.
   */
  async waitForURL(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }

  /**
   * Return the current page title.
   * Used in assertions: expect(await page.title()).toBe('...')
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
