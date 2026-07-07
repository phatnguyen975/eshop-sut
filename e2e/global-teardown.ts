/**
 * Global teardown — runs once after the entire test suite completes.
 *
 * Responsibilities:
 *   - Clean up any dynamically created test data that was not deleted by
 *     individual fixture teardown functions.
 *
 * Design principle:
 *   Individual test fixtures are responsible for cleaning up the data they
 *   create (via the code after await use(...) in each fixture). This file
 *   is a safety net for edge cases where fixture teardown was skipped due to
 *   a test runner crash or forced termination.
 *
 * Current implementation:
 *   No global cleanup is needed at this stage because all test data is managed
 *   by individual fixtures. Add cleanup logic here if shared seed data is
 *   introduced in the future.
 */
async function globalTeardown(): Promise<void> {
  console.log("[global-teardown] Suite complete. No global cleanup required.");
}

export default globalTeardown;
