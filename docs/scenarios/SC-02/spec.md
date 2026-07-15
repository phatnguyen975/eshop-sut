# Scenario Specification: Authenticated Customer Adds Items to Cart and Completes Checkout

**Scenario ID:** SC-02  
**Coverage Label:** Happy Path  
**Actor:** Standard User (`test@eshop.com`)  
**Project:** EShop — Web Automation Testing  
**Created:** 2026-07-15  
**Last Updated:** 2026-07-15  
**Status:** APPROVED  
**Approved By:** Group 06 — 2026-07-15

## 1. Scenario Overview

| Field                         | Value                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scenario ID**               | SC-02                                                                                                                                                                                      |
| **Name**                      | Authenticated customer adds items to cart and completes checkout successfully                                                                                                              |
| **Coverage Label**            | Happy Path                                                                                                                                                                                 |
| **Actor**                     | Standard User (`test@eshop.com`)                                                                                                                                                           |
| **Objective**                 | Verify the full purchase journey: product detail → add to cart → cart management → checkout → cart cleared, confirming the API recomputes total and the UI displays correct totals.        |
| **Primary FR Coverage**       | FR-06 (product detail, add-to-cart), FR-07 (cart management), FR-08 (checkout)                                                                                                             |
| **GUI Requirements Verified** | FR-23 (cart badge count, breadcrumb on cart/checkout), FR-24 (toast after add-to-cart, confirm dialog on remove, empty state after checkout), FR-21 (₫ currency format, "Tổng cộng" label) |
| **Dependency FRs**            | FR-02 (authenticated session — user is pre-logged in via `storageState`)                                                                                                                   |
| **Test Layer**                | UI + API                                                                                                                                                                                   |
| **Priority**                  | Critical                                                                                                                                                                                   |

## 2. Preconditions

- The Standard User (`test@eshop.com`) is authenticated via a pre-saved `storageState` (`.auth/user.json`).
- At least **two distinct products** exist in the system with known names and prices.
- The user's cart is **empty** at the start of the test — enforced by a dedicated **`emptyCart` fixture** that clears the cart via API before `use()` and again in teardown after `use()`, ensuring isolation regardless of prior test state.
- The SUT backend is running at `API_BASE_URL` and the frontend is running at `WEB_BASE_URL`.

## 3. Scenario Flow

> **Phase 1 Status:** APPROVED (Gate A)

| Step | Action                                                                                          | Actor         | Precondition                                                       | Expected Response                                                                                                                                                                                                                                             | Test Layer |
| ---- | ----------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1    | Navigate to the product listing page (home/products).                                           | Standard User | User is authenticated; cart is empty (badge shows 0 or is absent). | Product listing page renders a grid of products with names and prices in ₫ format. Cart badge count is 0.                                                                                                                                                     | UI         |
| 2    | Click on the first product to open its detail page.                                             | Standard User | Product listing is visible with at least one product.              | Product detail page loads showing: large image, product name, price (₫ format), description, category name, and a quantity input defaulted to 1.                                                                                                              | UI         |
| 3    | Verify quantity input accepts only positive integers (minimum 1).                               | Standard User | Product detail page is loaded.                                     | Quantity input is present, defaulted to 1, and does not accept values below 1.                                                                                                                                                                                | UI         |
| 4    | Click **"Thêm vào giỏ hàng"** with quantity = 1.                                                | Standard User | Quantity input is set to 1.                                        | A toast notification appears confirming the item was added, AND/OR the cart badge in the navbar increments to 1.                                                                                                                                              | UI         |
| 5    | Navigate to a second product's detail page and click **"Thêm vào giỏ hàng"** with quantity = 1. | Standard User | Cart badge shows 1 (one item from Step 4).                         | Toast appears again. Cart badge increments to 2.                                                                                                                                                                                                              | UI         |
| 6    | Navigate to the Cart page (`/cart`).                                                            | Standard User | Cart badge shows 2 items.                                          | Cart page renders a table with two line items showing: product name, unit price (₫), quantity (with +/- controls), subtotal (₫), and a remove action. The **"Tổng cộng"** label (not "Tổng tạm tính") is visible with the correct sum. Breadcrumb is present. | UI         |
| 7    | Verify the cart total calculation.                                                              | Standard User | Both products are visible in the cart table.                       | "Tổng cộng" value = (price₁ × qty₁) + (price₂ × qty₂), displayed in ₫ format.                                                                                                                                                                                 | UI         |
| 8    | Click the **remove** action on the first line item.                                             | Standard User | Both products are in the cart.                                     | A confirmation dialog appears asking the user to confirm removal.                                                                                                                                                                                             | UI         |
| 9    | Confirm the dialog.                                                                             | Standard User | Confirmation dialog is open.                                       | The first product disappears from the cart. The cart now shows only 1 item. "Tổng cộng" updates to reflect only the remaining product. Cart badge decrements to 1.                                                                                            | UI         |
| 10   | Click **"Tiến hành thanh toán"** (or equivalent checkout button).                               | Standard User | Cart has 1 item remaining.                                         | User is navigated to the checkout page. The checkout page displays the order summary listing the remaining product, its price, and the total amount. Shipping address field is present. Breadcrumb is present.                                                | UI         |
| 11   | Verify the checkout total matches the cart total at API level.                                  | Standard User | User is on checkout page.                                          | `GET /api/cart` returns the cart contents. The `total_amount` displayed on the UI matches what the server would compute — it is NOT taken from a client-sent value.                                                                                           | UI + API   |
| 12   | Enter a valid shipping address and click the **"Đặt hàng"** (Place Order) button.               | Standard User | Shipping address field is filled. User is on checkout page.        | `POST /api/checkout` is called. The server **recomputes** the total from the cart server-side and ignores any `total_amount` sent by the client. HTTP 200/201 is returned. The order is created in the system.                                                | UI + API   |
| 13   | Verify post-checkout UI state.                                                                  | System        | Checkout request succeeds.                                         | User is redirected to an order confirmation page or order history. The cart is **cleared** — cart badge shows 0.                                                                                                                                              | UI         |

**Notes:**

- **FR-06:** The product detail page must display image, name, price, description, and category. The quantity input accepts only positive integers (minimum 1). After clicking "Thêm vào giỏ hàng", a toast notification or badge update must be visible — this is the required visual feedback.
- **FR-07:** Adding the same product twice must increment quantity, not create a duplicate row. The cart table must use the label **"Tổng cộng"** exactly (not "Tổng tạm tính" or any other variant). The remove button must trigger a confirmation dialog before deletion. An empty cart must show an illustration and a clear message.
- **FR-08:** Checkout is only available to authenticated users. The backend must recompute `total_amount` from the server's cart state — it must not accept the client-supplied `total_amount` value. After successful checkout, the cart is cleared.
- **FR-21 (GUI):** All monetary values must use the ₫ symbol and Vietnamese number formatting.
- **FR-23 (GUI):** Cart badge must reflect the current item count. Breadcrumb must be visible on the cart and checkout pages.
- **FR-24 (GUI):** Toast notification after add-to-cart. Confirmation dialog before cart item removal. Empty state shown after checkout.
- **Step 12 (API-layer assertion):** To verify the server recomputes `total_amount`, the test will directly call `POST /api/checkout` with a deliberately incorrect `total_amount` value (e.g., 1 ₫) and verify the resulting order's `total_amount` in `GET /api/orders/my-orders` does NOT equal 1. This confirms the server ignores the client-supplied value and recomputes correctly.

## 4. Test Data Matrix

> **Phase 2 Status:** APPROVED (Gate B)

### Technique Applicability per Step

| Step | Has Input / Condition / State / Security Boundary?                               | Technique Applied         |
| ---- | -------------------------------------------------------------------------------- | ------------------------- |
| 1    | No input, no condition, no state                                                 | None                      |
| 2    | No input — navigation action only                                                | None                      |
| 3    | Input field with defined numeric constraint (min=1, positive integers only)      | Domain Testing (EP + BVA) |
| 4    | No new input — uses qty=1 from Step 3 valid class                                | None (covered by Step 3)  |
| 5    | No new input — repeat of valid add action                                        | None                      |
| 6    | No input — navigation action only                                                | None                      |
| 7    | No input — computed value verification only                                      | None                      |
| 8–9  | Binary UI decision: confirm or cancel the dialog                                 | Decision Table            |
| 10   | No input — navigation action only                                                | None                      |
| 11   | No input — UI/API verification only                                              | None                      |
| 12   | Security boundary: server must recompute `total_amount`; authentication required | Error Guessing            |
| 13   | No input — UI state observation only                                             | None                      |

### Step 3 — Quantity Input Validation [Domain Testing — EP + BVA] `[data-driven]`

> **Implementation annotation:** `[data-driven]` — all variants use the same product detail page and the same UI interaction (fill quantity → attempt to add to cart). Only the quantity value and its acceptance outcome differ. Implement as a `for...of` loop in a dedicated validation spec file.

**Equivalence Classes (derived from FR-06: "chỉ nhận số nguyên dương, tối thiểu là 1"):**

| Class                     | Definition              | Representative |
| ------------------------- | ----------------------- | -------------- |
| **Valid**                 | Positive integer ≥ 1    | `2`            |
| **Invalid — at boundary** | `0` (one below minimum) | `0`            |
| **Invalid — negative**    | Any negative integer    | `-1`           |
| **Invalid — non-integer** | Decimal numbers         | `1.5`          |
| **Invalid — non-numeric** | Text characters         | `"abc"`        |

**Numeric constraint boundary (min = 1):**

- **On-point:** `1` (exact minimum — valid)
- **Off-point:** `0` (one below minimum — invalid)

| Variant ID | Technique                            | Quantity Input | Full Payload (Product Detail Page)                     | Expected Outcome (per FR-06)                                                                |
| ---------- | ------------------------------------ | -------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| S3.V1      | EP (valid class)                     | `2`            | Navigate to any product detail page; set qty = `2`     | Input is accepted; "Thêm vào giỏ hàng" button is active and operable                        |
| S3.V2      | BVA — on-point (minimum boundary)    | `1`            | Navigate to any product detail page; set qty = `1`     | Input accepted (1 is the minimum valid value); button is active                             |
| S3.V3      | BVA — off-point (one below minimum)  | `0`            | Navigate to any product detail page; set qty = `0`     | Input is rejected or clamped to 1; system does not allow adding 0 items                     |
| S3.V4      | EP (invalid — negative)              | `-1`           | Navigate to any product detail page; set qty = `-1`    | Input is rejected or clamped to 1; negative values are not accepted                         |
| S3.V5      | EP (invalid — non-integer / decimal) | `1.5`          | Navigate to any product detail page; set qty = `1.5`   | Input is rejected or truncated to integer; non-integer quantities are not accepted          |
| S3.V6      | EP (invalid — non-numeric text)      | `"abc"`        | Navigate to any product detail page; set qty = `"abc"` | Input field ignores non-numeric characters (type=number behavior) or shows validation error |

**Note:** The main E2E flow (Steps 4–13) always uses `qty = 1` (S3.V2 — the on-point minimum), which is the canonical valid value for end-to-end journey tests. The variants above are implemented in a **separate validation spec** (`sc-02-cart-validation.spec.ts`), not inline in the E2E flow test.

### Steps 8–9 — Remove Item with Confirmation Dialog [Decision Table — 1 condition] `[separate-test]`

> **Implementation annotation:** `[separate-test]` — the two variants lead to fundamentally different post-step states: one removes the item (state-changing), the other preserves it (state-preserving). Each must be set up independently to begin with a cart containing at least one item and a dialog open. Implement as two individual `test()` blocks.

**Condition matrix (FR-07: "Nút Xóa sản phẩm phải có dialog xác nhận trước khi thực hiện"):**

| Variant ID | C1: User Response to Confirm Dialog | Precondition                              | Expected Outcome                                                                                                                                                              |
| ---------- | ----------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S8.V1      | **Confirm** (click OK / "Xác nhận") | Cart has ≥ 1 item; confirm dialog is open | Item is removed from the cart table. "Tổng cộng" recalculates excluding the removed item. Cart badge decrements by 1. (This is the path used in the main E2E flow at Step 9.) |
| S8.V2      | **Cancel** (click Cancel / "Hủy")   | Cart has ≥ 1 item; confirm dialog is open | Dialog closes. Cart remains unchanged — item is still present, total unchanged, badge unchanged.                                                                              |

**Note:** S8.V1 is the path exercised in the main E2E flow (Step 9). S8.V2 must be tested separately in a dedicated test block because after cancelling the dialog, the cart state differs from the post-confirm state, making the remainder of the E2E flow impossible to continue from S8.V2 without a different setup.

### Step 12 — Server-Side Total Recomputation & Authentication Guard [Error Guessing] `[separate-test]`

> **Implementation annotation:** `[separate-test]` — each attack vector requires a different precondition state and targets a different security property. V1 requires an authenticated session with items in cart; V2 requires no auth header. Implement as individual `test()` blocks in the API spec (`sc-02-checkout-api.spec.ts`).

**Attack vectors (derived from FR-08: "Backend phải tự tính lại tổng tiền; không chấp nhận giá trị `total_amount` do client gửi lên" and FR-08: "Chỉ người dùng đã đăng nhập mới tiến hành thanh toán được"):**

| Variant ID | Attack Vector                                                            | Request Payload                                                                                                                     | Precondition                                                                                      | Expected Outcome                                                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S12.V1     | **Manipulated `total_amount`** — client sends a deliberately wrong value | `POST /api/checkout` with `{ "total_amount": 1, "shipping_address": "123 Test St" }` and valid `Authorization: Bearer <user_token>` | Cart contains 1 item with price > 1 ₫ (e.g., product priced at 100,000 ₫). User is authenticated. | HTTP 200/201. Order is created. The stored `total_amount` retrieved via `GET /api/orders/my-orders` is **not** 1 — it equals the server-computed value (product price × quantity). This confirms the server ignores the client-sent `total_amount`. |
| S12.V2     | **No authentication token** — unauthenticated checkout attempt           | `POST /api/checkout` with `{ "total_amount": 100000, "shipping_address": "123 Test St" }` and **no** `Authorization` header         | No session required.                                                                              | HTTP 401 Unauthorized. No order is created.                                                                                                                                                                                                         |

**Coverage rationale:**

- **S12.V1** targets the core FR-08 server-side recomputation requirement — the most critical integration trust boundary in this scenario. A server that blindly accepts `total_amount` from the client allows price manipulation attacks.
- **S12.V2** targets SEC-02 (authenticated APIs require JWT) as enforced on the checkout endpoint. This is the authentication guard test for FR-08.

## 5. Implementation Notes for `wat-build`

| File                                               | Content                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `e2e/pages/web/product-detail.page.ts`             | POM for product detail page: quantity input, "Thêm vào giỏ hàng" button, toast assertion helper |
| `e2e/pages/web/cart.page.ts`                       | POM for cart page: line items, total label, remove button, confirm dialog, checkout button      |
| `e2e/pages/web/checkout.page.ts`                   | POM for checkout page: order summary, shipping address input, place order button                |
| `e2e/fixtures/index.ts`                            | Add `emptyCart` fixture (API-based, with setup + teardown)                                      |
| `e2e/tests/web/cart/sc-02-cart-e2e.spec.ts`        | Main E2E flow test (Steps 1–13, happy path)                                                     |
| `e2e/tests/web/cart/sc-02-cart-validation.spec.ts` | Data-driven quantity input validation (S3.V1–S3.V6) + confirm dialog variants (S8.V1–S8.V2)     |
| `e2e/tests/api/cart/sc-02-checkout-api.spec.ts`    | API-layer Error Guessing tests (S12.V1–S12.V2)                                                  |
