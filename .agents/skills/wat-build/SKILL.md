---
name: wat-build
description: >
  Web Automation Testing — Test Code Implementation command skill. Invoke this skill when
  the user provides a scenario ID with an APPROVED spec.md and wants to implement the
  corresponding Playwright TypeScript test code (POM classes, fixtures, test spec files).
  This skill is invoked once per scenario, after wat-spec Gate B is APPROVED.
  Trigger phrases: "wat-build", "/wat-build", "implement tests for SC-XX", "build test code",
  "write playwright tests", "implement scenario", "code the tests for".
---

# wat-build — Playwright Test Code Implementation

## Purpose

Implement production-quality Playwright TypeScript test code for one approved scenario specification. The implementation covers three artifact types in a fixed order:

1. **Page Object Model (POM) classes** — encapsulate locators and interactions per page
2. **Fixtures** — reusable setup and teardown for test preconditions
3. **Test spec files** — executable test cases derived from the spec's flow and data matrix

Each artifact is implemented one piece at a time, with human verification after each piece before proceeding to the next.

## Input

| Source                          | Location                               | Purpose                                                                |
| ------------------------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| Approved scenario specification | `docs/scenarios/{scenario-id}/spec.md` | Implementation contract — steps, expected outcomes, test data variants |
| Project structure reference     | `docs/sut/project-structure.md`        | Canonical file placement for all generated files                       |
| SRS                             | `docs/sut/srs.md`                      | Expected UI text, error messages, and behavior details for assertions  |

**Required before starting:** `docs/scenarios/{scenario-id}/spec.md` must have status `APPROVED`. If it is still `DRAFT`, stop and instruct the human to complete `wat-spec` first.

## Output

| Artifact Type              | Location Pattern                                   | Created When                                               |
| -------------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| POM class (web)            | `e2e/pages/web/{name}.page.ts`                     | Step 1 — always first                                      |
| POM class (admin)          | `e2e/pages/admin/{name}.page.ts`                   | Step 1 — if scenario covers admin pages                    |
| Fixture additions          | `e2e/fixtures/index.ts`                            | Step 2 — if scenario needs new fixtures                    |
| Test spec file (web E2E)   | `e2e/tests/web/{domain}/{name}.spec.ts`            | Step 3                                                     |
| Test spec file (admin E2E) | `e2e/tests/admin/{domain}/{name}.spec.ts`          | Step 3 — if admin                                          |
| Test spec file (API)       | `e2e/tests/api/{domain}/{name}.spec.ts`            | Step 3 — if API layer present                              |
| Validation spec file       | `e2e/tests/web/{domain}/{name}-validation.spec.ts` | Step 3 — for isolated negative tests                       |
| Utility function           | `e2e/utils/{concern}.ts`                           | As needed — only if a pure function is reused across files |

Read `docs/sut/project-structure.md` before writing any file to confirm the correct path.

## External Skills Invoked

### `playwright-skill` — Primary Reference

`playwright-skill` is the **authoritative source** for all Playwright API usage in this skill. It must be consulted before writing any piece of code. Never rely on memory or assumption for Playwright API details.

**Consult `playwright-skill` in this order for each implementation piece:**

| What you are implementing                    | Primary guide to consult                        |
| -------------------------------------------- | ----------------------------------------------- |
| POM class with locators                      | `pom/page-object-model.md` + `core/locators.md` |
| Decision between POM, fixture, or helper     | `pom/pom-vs-fixtures-vs-helpers.md`             |
| Fixture with setup and teardown              | `core/fixtures-and-hooks.md`                    |
| Authentication state in tests                | `core/authentication.md` + `core/auth-flows.md` |
| API test with `APIRequestContext`            | `core/api-testing.md`                           |
| Form interaction and validation steps        | `core/forms-and-validation.md`                  |
| Web-first assertions and waiting             | `core/assertions-and-waiting.md`                |
| Network interception for error simulation    | `core/network-mocking.md`                       |
| Security test (auth bypass, role escalation) | `core/security-testing.md`                      |
| React/Vite-specific locator issues           | `core/react.md`                                 |
| Debugging a failing test                     | `core/debugging.md` + `core/error-index.md`     |
| Flaky test investigation                     | `core/flaky-tests.md`                           |
| Test file and describe block organization    | `core/test-organization.md`                     |

You should read the [`playwright-skill`](../playwright-skill/SKILL.md) to understand the full set of guides available. Always consult the relevant guide before writing any Playwright API call.

Do not write any Playwright API call without first confirming the correct pattern from the relevant guide. This prevents subtle API misuse (e.g., `locator.textContent()` vs `expect(locator).toHaveText()`) that causes flakiness.

## Theoretical Foundations

### Implementation Order — Why POM First

The mandatory implementation order (POM → Fixtures → Test Spec) follows dependency direction:

- Test spec files import POM classes and fixtures — they cannot be written until their dependencies exist
- Fixtures may depend on POM classes for setup (e.g., navigating to a page to seed state)
- POM classes have no runtime dependencies on the other two

Always determine the full set of pieces needed before starting, then implement in order.

### Page Object Model (POM) Design Rules

POM is the structural pattern that separates **what to interact with** (locators) from **how to use them** (test logic). Consult `pom/page-object-model.md` for authoritative patterns. Core rules:

**Locators are class properties, not method-local variables:**

```typescript
// CORRECT — defined once, reused across methods
export class LoginPage extends BasePage {
  readonly emailInput: Locator = this.page.getByLabel('Email');
  readonly passwordInput: Locator = this.page.getByLabel('Mật khẩu');
  readonly submitButton: Locator = this.page.getByRole('button', { name: 'Đăng nhập' });
  readonly errorAlert: Locator = this.page.getByRole('alert');
}

// WRONG — locator created inside method, not reusable
async login(email: string, password: string) {
  await this.page.getByLabel('Email').fill(email); // ← brittle, not reusable
}
```

**Actions are methods named for user intent, not implementation:**

```typescript
// CORRECT — named for what the user does
async login(email: string, password: string): Promise<void> {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.submitButton.click();
}

// WRONG — named for implementation detail
async clickSubmitButton(): Promise<void> { ... }
```

**Zero assertions inside POM classes:**

```typescript
// WRONG — assertion in POM
async login(email: string, password: string): Promise<void> {
  await this.emailInput.fill(email);
  await this.submitButton.click();
  await expect(this.page).toHaveURL('/dashboard'); // ← NEVER in POM
}

// CORRECT — assertion in test spec, POM only acts
// In test spec:
await loginPage.login(email, password);
await expect(page).toHaveURL('/dashboard');
```

### Locator Priority — Semantic First

Consult `core/locators.md` for the full hierarchy. Apply in this order:

| Priority  | Locator                     | When to use                                                           |
| --------- | --------------------------- | --------------------------------------------------------------------- |
| 1 (best)  | `getByRole(role, { name })` | Buttons, links, inputs with accessible names                          |
| 2         | `getByLabel(text)`          | Form inputs with `<label>` elements                                   |
| 3         | `getByPlaceholder(text)`    | Inputs without labels but with placeholder                            |
| 4         | `getByText(text)`           | Static text content, non-interactive elements                         |
| 5         | `getByAltText(text)`        | Images                                                                |
| 6         | `getByTitle(text)`          | Elements with `title` attribute                                       |
| 7 (avoid) | CSS selector                | Last resort — add comment explaining why semantic locator unavailable |
| Never     | `getByTestId()`             | SUT source files cannot be modified to add `data-testid` attributes   |

### Assertions — Web-First Only

Consult `core/assertions-and-waiting.md` for patterns. The single most important rule:

```typescript
// CORRECT — web-first, auto-retries until timeout
await expect(locator).toBeVisible();
await expect(locator).toHaveText("Expected text");
await expect(locator).toContainText("partial");
await expect(page).toHaveURL("/dashboard");

// WRONG — resolves immediately, no retry, causes flakiness
expect(await locator.textContent()).toBe("Expected text");
expect(await page.url()).toBe("http://localhost:5173/dashboard");
```

### Test Structure — E2E Flow vs Validation Tests

**E2E flow test** (`test()` with `test.step()`):

- One `test()` block per scenario's primary user journey
- Each logical phase wrapped in `test.step()` for named reporting
- Includes error paths that are part of the realistic journey
- Named with the scenario ID and goal: `TC-ORDER-01: complete checkout with coupon`

**Validation test** (separate `test()` block):

- One `test()` block per isolated input validation check
- No `test.step()` needed — single action + single assertion
- Placed in a separate `-validation.spec.ts` file
- Named with specific behavior: `TC-AUTH-03: rejects password shorter than 8 characters`

**E2E flow structure template:**

```typescript
test("TC-{MODULE}-01: {scenario goal}", async ({ userPage, seededProduct }) => {
  const loginPage = new LoginPage(userPage);
  const cartPage = new CartPage(userPage);

  await test.step("Navigate and authenticate", async () => {
    await loginPage.navigate("/login");
    await loginPage.login(email, password);
    await expect(userPage).not.toHaveURL("/login");
  });

  await test.step("Add product to cart", async () => {
    await cartPage.navigate("/");
    await cartPage.addProductToCart(seededProduct.id);
    await expect(cartPage.cartBadge).toContainText("1");
  });

  await test.step("Checkout with valid coupon", async () => {
    // ...
  });
});
```

### Test Isolation Rules

Consult `core/fixtures-and-hooks.md` and `core/test-data-management.md` for patterns.

- Every test must be independently executable — no dependency on execution order
- Dynamic test data (created during test) must be cleaned up in fixture teardown
- Static preconditions (existing products, default accounts) must be verified before use, not assumed
- Each test that modifies shared state (cart, orders) must either reset it in teardown or use isolated accounts/contexts

### Fixture Design Rules

```typescript
// CORRECT — teardown always runs via use() pattern
seededProduct: async ({}, use) => {
  const adminCtx = await getAuthenticatedContext(...);
  const product = await createProductViaApi(adminCtx);

  await use({ id: product.id, name: product.name });

  // Teardown — runs even if test fails
  await adminCtx.delete(`/api/products/${product.id}`).catch(() => {
    console.warn(`Teardown failed for product ${product.id}`);
  });
  await adminCtx.dispose();
},

// WRONG — no teardown, test data leaks
seededProduct: async ({}, use) => {
  const product = await createProductViaApi(...);
  await use({ id: product.id });
  // No cleanup — product remains in DB after test
},
```

## Workflow

### Step 1 — Verify Prerequisites

Check that `docs/scenarios/{scenario-id}/spec.md` exists and has status `APPROVED`. If not, stop:

> "The specification at `docs/scenarios/{scenario-id}/spec.md` is not yet `APPROVED`. Please complete `wat-spec` before running `wat-build`."

### Step 2 — Read Inputs

1. Read `docs/scenarios/{scenario-id}/spec.md` in full — both Phase 1 (flow) and Phase 2 (test data matrix)
2. Read `docs/sut/project-structure.md` — note correct file paths for each artifact type
3. Read `docs/sut/srs.md` sections relevant to this scenario — extract exact UI text, error messages, and behavioral constraints needed for assertions

### Step 3 — Plan Implementation Pieces

Internally determine all pieces needed and their order:

1. List all pages touched by this scenario → one POM class per page
2. Determine if any fixtures need to be added to `e2e/fixtures/index.ts`
3. Determine test file count:
   - One E2E flow spec file (main journey)
   - One validation spec file per feature domain that has isolated negative tests
   - One API spec file if the scenario has API-layer test variants

Do not present this plan to the human — determine it internally and proceed.

### Step 4 — Implement Each Piece (repeat per piece)

For each piece in order:

**4a — Consult `playwright-skill`**

Before writing any code, identify the relevant guides from the table in External Skills Invoked and apply the patterns described there. This is mandatory — do not skip even for patterns that seem familiar.

**4b — Write the piece**

Enforce all rules from Theoretical Foundations:

- **POM:** locators as `readonly` properties, actions as methods, zero assertions
- **Locators:** semantic first, CSS/XPath only as last resort with comment
- **Assertions:** web-first form only
- **URLs:** `baseURL` from config, never hardcoded
- **Credentials:** `process.env` only, never hardcoded
- **Test IDs:** `TC-{MODULE}-{NUMBER}` format
- No `waitForTimeout()` or `sleep()` anywhere

**4c — Human Gate (after each piece)**

Present the following message:

> "Piece complete: `{relative-file-path}`. Please run:
>
> - For web test files: `npx playwright test {file} --headed --project=web-chromium`
> - For admin test files: `npx playwright test {file} --headed --project=admin-chromium`
> - For API test files: `npx playwright test {file} --project=api`
> - For POM/fixture files: run the test file that uses them
>
> Reply **PASSED** to proceed to the next piece, or **FAILED** with the full erroroutput so I can diagnose and fix."

- If **PASSED** → proceed to the next piece
- If **FAILED** → follow the Failure Diagnosis Protocol below, then repeat the gate

**Failure Diagnosis Protocol:**

When the human reports `FAILED` with error output:

1. Read the full error message and stack trace
2. Consult `core/error-index.md` in `playwright-skill` — look up the error message
3. Consult `core/debugging.md` if the error is unclear
4. If the error is a locator issue → consult `core/locators.md` and re-examine the locator strategy
5. If the error is a timing/flakiness issue → consult `core/flaky-tests.md`
6. State the root cause before applying any fix
7. Apply the minimal fix — do not rewrite the entire file
8. Repeat gate 4c

### Step 5 — Completion Check

After all pieces pass, verify the completion criteria below before informing the human that `wat-build` is complete.

## Code Conventions

| Convention        | Rule                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Language          | All code and comments in English                                                            |
| Test ID           | `TC-{MODULE}-{NUMBER}` — MODULE is functional domain (AUTH, CART, ORDER, ADMIN, SEC, API)   |
| File naming       | `kebab-case.spec.ts` for tests, `kebab-case.page.ts` for POM                                |
| Import style      | Named imports from `@fixtures` barrel; path aliases from `tsconfig.json`                    |
| baseURL           | Always from `playwright.config.ts` via `baseURL` — never `http://localhost:xxxx` in code    |
| Credentials       | Always `process.env.VAR_NAME` — never hardcoded strings                                     |
| Selector fallback | CSS/XPath only as last resort; add `// CSS: no semantic locator available because {reason}` |
| Expected values   | Derived from `docs/sut/srs.md` — never from SUT observation or assumption                   |

## Quality Checklist

Run before presenting each human gate.

### POM Class Checklist

- [ ] Extends `BasePage` from `e2e/pages/base.page.ts`.
- [ ] All locators defined as `readonly` class properties at class level.
- [ ] All locators use semantic strategy (`getByRole`, `getByLabel`, `getByText`) — no CSS/XPath without comment.
- [ ] All action methods named for user intent, not implementation.
- [ ] Zero `expect()` assertions inside the class.
- [ ] No hardcoded URLs — navigation uses relative paths.
- [ ] File placed in correct directory per `project-structure.md`.
- [ ] All contents in English, including comments.

### Fixture Checklist

- [ ] Fixture uses `await use(...)` pattern with teardown code after `use()`.
- [ ] Teardown uses `.catch()` to suppress errors silently rather than throwing (teardown failure must not obscure test failure).
- [ ] Fixture scope is `'test'` (default) unless shared resource explicitly requires `'worker'` scope.
- [ ] No assertions inside fixtures.
- [ ] No hardcoded credentials — reads from `process.env`.
- [ ] All contents in English, including comments.

### Test Spec Checklist (E2E Flow)

- [ ] One `test()` block for the primary E2E journey.
- [ ] Journey phases wrapped in `test.step()` with descriptive names.
- [ ] Error paths that are part of the realistic journey are inside the main `test()` block.
- [ ] Test ID follows `TC-{MODULE}-{NUMBER}` format.
- [ ] All assertions use web-first form.
- [ ] No `waitForTimeout()` or `sleep()` anywhere.
- [ ] Every spec variant from the Phase 2 data matrix has a corresponding `test()` block or is represented as a step variant within the flow.
- [ ] All contents in English, including comments.

### Test Spec Checklist (Validation Tests)

- [ ] Each isolated validation check is its own `test()` block.
- [ ] Each test name clearly describes the expected behavior (not the input).
- [ ] Each test has exactly one action and one assertion (single responsibility).
- [ ] Tests are in a dedicated `-validation.spec.ts` file.
- [ ] All contents in English, including comments.

### API Test Checklist

- [ ] Uses `APIRequestContext` from fixtures — not a browser Page.
- [ ] Auth header set correctly (`Authorization: Bearer {token}`).
- [ ] Asserts HTTP status code explicitly (`expect(response.status()).toBe(200)`).
- [ ] Asserts response body shape where relevant.
- [ ] Security variants (401, 403) are present for protected endpoints.
- [ ] All contents in English, including comments.

## Completion Criteria

`wat-build` is complete when:

1. All pieces listed in Step 3 have been implemented
2. Every piece has received a `PASSED` response from the human
3. Every test variant from the spec's Phase 2 data matrix is covered by at least one `test()` block
4. All generated files are in the correct directories per `project-structure.md`
5. The human has been informed that the scenario is ready for `wat-review`

## Constraints

**MUST do:**

- Verify `spec.md` is `APPROVED` before starting.
- Read `docs/sut/project-structure.md` before writing any file.
- Consult `playwright-skill` guides before implementing each piece.
- Implement in order: POM → Fixtures → Test Spec.
- Stop after each piece and wait for human `PASSED`/`FAILED` response.
- Derive all expected values and UI text from `docs/sut/srs.md`.
- Apply the Failure Diagnosis Protocol before fixing any reported error.

**MUST NOT do:**

- Start implementing before `spec.md` is `APPROVED`.
- Skip consulting `playwright-skill` for any Playwright API usage.
- Write assertions inside POM classes.
- Use `getByTestId()` — SUT source files cannot be modified.
- Hardcode URLs, credentials, or expected values not from the SRS.
- Use `waitForTimeout()` or `sleep()` anywhere.
- Implement multiple pieces before a human gate.
- Modify SUT source files (`backend/`, `frontend-web/`, `frontend-admin/`).
- Mock the application's own API in E2E tests.
- Write direct database queries.
- Reference `playwright-automation-plan.md` — that file is for human reference only.
- Proceed to the next piece without explicit `PASSED` response.
