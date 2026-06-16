# Requirement Analysis — FR-07: Shopping Cart

## 1. Feature Overview

| Attribute         | Value                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------- |
| Feature ID        | FR-07                                                                                   |
| Feature Name      | Shopping Cart                                                                           |
| Test Layer        | Both (Web UI + API)                                                                     |
| Entry Point (UI)  | `http://localhost:5173/cart`                                                            |
| Entry Point (API) | `GET http://localhost:3000/api/cart` · `POST http://localhost:3000/api/cart` (add item) |
| Actors            | Logged-in User only                                                                     |
| Auth Required     | Yes — User JWT (`Authorization: Bearer <token>`)                                        |

## 2. Input Fields & Constraints

| Field/Param | Layer    | Type    | Explicit Constraints (from SRS)                                                                                | Implicit Constraints (Architecture/DB)                                                 | API Param Name |
| ----------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------- |
| `id`        | API      | integer | Required; must reference an existing product in DB                                                             | Must be a positive integer; non-existent ID should be rejected                         | `id`           |
| `name`      | API      | string  | Required; product name displayed in cart view                                                                  | Max length constrained by DB column (typically 255 chars); must not be empty           | `name`         |
| `price`     | API      | number  | Required; unit price of the product (per FR-15: price > 0); displayed in ₫ with thousand-separator (per FR-21) | Must be a positive numeric value; floating-point precision TBD by DB schema            | `price`        |
| `quantity`  | API + UI | integer | Required; must be a positive integer (≥ 1) per FR-06; UI has +/- buttons to adjust quantity                    | Minimum = 1; no explicit maximum specified in SRS (implicit: system/DB capacity limit) | `quantity`     |
| `JWT Token` | Header   | string  | Required; valid user JWT must be sent in `Authorization: Bearer <token>` header (per SEC-02)                   | Token must be unexpired and have a valid signature                                     | Header only    |

> **Note on duplicate-product rule (BR-03):** When the same product `id` is added again via `POST /api/cart`, the quantity is merged (incremented), **not** inserted as a new row.

## 3. Business Rules

- **[BR-01]** The cart is only accessible to authenticated users. An unauthenticated request to any cart API must receive HTTP 401. (per FR-07, SEC-02)
- **[BR-02]** The cart page must display items with the following columns: **Product**, **Unit Price**, **Quantity** (with +/− adjustment buttons), **Subtotal**, **Action** (delete). (per FR-07)
- **[BR-03]** Adding the same product to the cart again must **increment quantity**, not create a new duplicate row. (per FR-07)
- **[BR-04]** `quantity` must be a positive integer ≥ 1. A quantity of 0 or negative is invalid. (per FR-06, FR-07)
- **[BR-05]** The delete action for a cart item must trigger a **confirmation dialog** before executing. The item is only removed after the user confirms. (per FR-07, FR-24)
- **[BR-06]** The cart page must display a **"Continue Shopping"** button (`Tiếp tục mua sắm`) that navigates back to the homepage. (per FR-07)
- **[BR-07]** The total amount label must read exactly **"Tổng cộng"** — not "Tổng tạm tính" or any other label. (per FR-07)
- **[BR-08]** When the cart is empty, the page must display an **illustration image and a clear empty-state message**. (per FR-07, FR-24)
- **[BR-09]** All prices must be displayed with the `₫` symbol and thousand-separator formatting (e.g., `100,000 ₫`). (per FR-21)
- **[BR-10]** After clicking "Add to Cart" from the Product Detail page (FR-06), a **visual feedback** must appear: toast notification or cart badge update. (per FR-06, FR-24)
- **[BR-11]** The cart badge in the Navigation Bar must display the **current count** of items in the cart. (per FR-23)
- **[BR-12]** The cart page must be accessible via a **Breadcrumb** navigation element. (per FR-23)
- **[BR-13]** The Navbar must **highlight** the "Giỏ hàng" (Cart) link when the user is on the cart page. (per FR-23)
- **[BR-14]** The cart page must have exactly **one `<h1>` tag** describing the page content. (per FR-21, FR-05)
- **[BR-15]** All product images displayed in the cart must have a non-empty `alt` attribute. (per FR-24)
- **[BR-16]** User input (e.g., product names) displayed in the cart must be **safely escaped** — no raw HTML rendering / XSS risk. (per SEC-04)

## 4. Expected Outputs

### 4.1 Success Paths

**GET /api/cart — Retrieve cart:**

- HTTP: `200 OK`
- Response body: JSON array of cart items, each with `id`, `name`, `price`, `quantity`
- UI: Cart page renders table with all cart items, subtotals per row, and grand total labeled "Tổng cộng"
- DB: No change (read-only)

**POST /api/cart — Add item (new product):**

- HTTP: `200 OK` (or `201 Created` — confirm against actual API)
- Response body: Updated cart state or success message
- UI: Cart badge in navbar increments; toast notification appears on product detail page
- DB: New row inserted into cart table for this user + product

**POST /api/cart — Add item (existing product, merge):**

- HTTP: `200 OK`
- Response body: Updated cart with incremented quantity
- UI: Cart badge updates; no duplicate row created in cart display
- DB: `quantity` field of existing cart row is incremented by the added amount

**Update quantity via +/- buttons (UI):**

- HTTP: Underlying API call (likely `PUT /api/cart/:id` or re-POST — to be confirmed via testing)
- UI: Subtotal for that row updates immediately; grand total updates
- DB: `quantity` updated for the corresponding cart item

**Delete item (after confirm dialog):**

- HTTP: Underlying DELETE API (to be confirmed via testing)
- UI: Item removed from cart table; grand total recalculates; if last item removed → empty state shown
- DB: Cart row deleted

**Empty cart state:**

- UI: Illustration image shown + friendly empty-state message; "Continue Shopping" button visible
- DB: No cart rows for this user

### 4.2 Failure Paths

- **No JWT token** → `GET /api/cart` or `POST /api/cart`: HTTP **401 Unauthorized** (per SEC-02)
- **Invalid/expired JWT token** → HTTP **401 Unauthorized**
- **`quantity` ≤ 0** → System must reject or treat as invalid input; expected: HTTP 4xx + error message (exact behavior TBD from SRS — flagged as high-risk)
- **`id` references non-existent product** → Expected: HTTP 4xx + error message (per implicit constraint)
- **Missing required field** (`id`, `name`, `price`, or `quantity` absent in POST body) → HTTP 4xx + validation error
- **Delete without confirmation** → Action must NOT proceed if user dismisses the confirm dialog

## 5. GUI Requirements Applicable (FR-21–24)

> **Platform:** Web UI — HTML/DOM semantics checks apply.

- **[GUI-01]** Cart page must contain exactly **one `<h1>` tag** with descriptive text. (per FR-21)
- **[GUI-02]** All product images in the cart must have a **non-empty `alt` attribute**. (per FR-24)
- **[GUI-03]** The cart link in the Navbar must display a **badge** showing the number of items in the cart. (per FR-23)
- **[GUI-04]** The Navbar must **highlight** the cart navigation item when the user is on the cart page. (per FR-23)
- **[GUI-05]** A **Breadcrumb** component must be present on the cart page. (per FR-23)
- **[GUI-06]** When the cart is empty, an **illustration + friendly message** (Empty State) must be displayed. (per FR-07, FR-24)
- **[GUI-07]** Deleting a cart item must trigger a **confirm dialog** before the delete is executed. (per FR-07, FR-24)
- **[GUI-08]** After clicking "Add to Cart" from product detail, a **toast notification or badge update** must appear. (per FR-06, FR-24)
- **[GUI-09]** The total label must read **exactly** "Tổng cộng" (not "Tổng tạm tính" or similar). (per FR-07)
- **[GUI-10]** Positive action buttons (e.g., "Continue Shopping", "Checkout") use **blue color**; destructive action buttons (delete) use **red color**. (per FR-21)
- **[GUI-11]** All currency values must be formatted as `xxx,xxx ₫` with thousand-separator. (per FR-21)
- **[GUI-12]** Tab order in the cart form/table must flow **top-to-bottom, left-to-right**. (per FR-21)
- **[GUI-13]** No Step Indicator is required for the cart page (single-step, not a multi-step form). (per FR-22 — N/A for this FR)

## 6. Security Requirements Applicable (SEC-xx)

- **[SEC-02]** All cart API endpoints (`GET /api/cart`, `POST /api/cart`) require a **valid JWT token**. Requests without a token must return HTTP 401. (per SEC-02)
- **[SEC-04]** Product names and user-provided data displayed in the cart must be **HTML-escaped**. Injecting `<script>alert(1)</script>` as a product name must NOT execute. (per SEC-04)
- _SEC-01, SEC-03, SEC-05, SEC-06, SEC-07 — Not directly applicable to Shopping Cart FR-07._

## 7. Notes for Domain Testing

- **Input variables identified:** `id` (integer), `name` (string), `price` (numeric), `quantity` (positive integer), `JWT token` (auth state: absent / valid user / valid admin)
- **Output variables identified:** HTTP status code, response body (cart item list / success message / error message), UI cart table state, cart badge count, DB cart row state (created / updated / deleted), empty-state UI display, confirm dialog behavior
- **Boundary candidates:**
  - `quantity`: boundary at 0 (invalid), 1 (lower bound — valid), very large values (upper boundary — system limit)
  - `price`: boundary at 0 (should be rejected per FR-15), positive values
  - `id`: valid existing ID vs. non-existent ID
- **High-risk areas:**
  - **Quantity = 0:** SRS does not explicitly state behavior when quantity is set to 0 via the +/- UI buttons — does it remove the item, or reject the action? This is a known gap.
  - **Duplicate product add:** Merge vs. new-row behavior (BR-03) — commonly mis-implemented
  - **Total label text:** Exact string "Tổng cộng" vs. "Tổng tạm tính" — easy to miss in testing
  - **JWT not sent:** Cart APIs must be protected (SEC-02) — test all 3 auth states
  - **Confirm dialog bypass:** API can be called directly without the UI confirm dialog — test via API channel
- **AI blind spot warnings:**
  - Quantity = 0 (edge between "reduce to zero" and "remove item") — AI might not generate this class
  - Adding a product whose `id` does not exist in the product table — implicit constraint, not stated in FR-07 body
  - Badge count accuracy after multi-item add/delete operations
  - XSS via product name in cart display (SEC-04) — often overlooked in cart feature analysis
