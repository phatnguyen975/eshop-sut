# Domain Analysis — FR-07: Shopping Cart

## Step 1: Input & Output Variable Identification

### 1.1 Input Variables

#### Direct Inputs (UI Form / API Body)

| #   | Variable       | Source              | Type    | Description                                                                                           |
| --- | -------------- | ------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| I1  | `product_id`   | API body            | integer | ID of the product to add to cart (`"id"` in POST /api/cart body). Must reference an existing product. |
| I2  | `product_name` | API body            | string  | Name of the product (`"name"` in POST /api/cart body). Displayed in cart UI.                          |
| I3  | `price`        | API body            | number  | Unit price of the product (`"price"` in POST /api/cart body). Must be > 0 per FR-15.                  |
| I4  | `quantity`     | API body + UI (+/-) | integer | Number of units to add/set (`"quantity"` in POST /api/cart). Must be ≥ 1 per FR-06.                   |

#### Indirect Inputs (Hidden / System State)

| #   | Variable                    | Source                  | Type       | Description                                                                                                              |
| --- | --------------------------- | ----------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| I5  | `auth_token`                | HTTP request header     | JWT string | `Authorization: Bearer <token>` header. Absent / valid user JWT / valid admin JWT. Required by SEC-02.                   |
| I6  | `user_auth_state`           | Session / token payload | enum       | Derived from token: `anonymous` (no token) / `authenticated_user` / `authenticated_admin`. Drives 401 vs 200.            |
| I7  | `duplicate_product_in_cart` | DB state                | boolean    | Whether the same `product_id` already exists as a row in this user's cart. Determines merge vs. insert behavior (BR-03). |
| I8  | `cart_empty_state`          | DB state                | boolean    | Whether the user's cart currently has zero items. Determines empty-state UI display (BR-08).                             |
| I9  | `confirm_dialog_response`   | UI state (user action)  | boolean    | User's response to the delete confirmation dialog: `confirmed` or `dismissed` (BR-05).                                   |
| I10 | `product_exists_in_db`      | DB state                | boolean    | Whether the given `product_id` actually exists in the products table (implicit constraint from API spec).                |

### 1.2 Output Variables

#### Direct Outputs (Visible)

| #   | Variable                   | Channel | Description                                                                                      |
| --- | -------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| O1  | HTTP status code           | API     | `200 OK` (success) / `401 Unauthorized` (no/invalid token) / `4xx` (invalid input/missing field) |
| O2  | Response body (JSON)       | API     | Array of cart items on GET; success message or updated cart on POST; error message on failure    |
| O3  | Cart item table            | UI      | Table rendered with columns: Product, Unit Price, Quantity (+/- buttons), Subtotal, Action       |
| O4  | Row subtotal display       | UI      | Per-row `price × quantity` calculation displayed as formatted `₫` value (per FR-21, BR-09)       |
| O5  | Grand total display        | UI      | Sum of all row subtotals, labeled exactly **"Tổng cộng"** (per BR-07)                            |
| O6  | Toast notification         | UI      | Visual feedback shown after "Add to Cart" action on Product Detail page (per BR-10, FR-24)       |
| O7  | Error message              | UI      | Validation or auth error displayed on screen (above submit — per FR-22 if applicable)            |
| O8  | Empty state display        | UI      | Illustration + friendly text when cart has zero items (per BR-08, FR-24)                         |
| O9  | Confirm dialog             | UI      | Modal/dialog that appears before item deletion is executed (per BR-05)                           |
| O10 | "Continue Shopping" button | UI      | Button visible on cart page; navigates back to homepage (per BR-06)                              |

#### Indirect Outputs (Hidden / State Changes)

| #   | Variable                    | Channel    | Description                                                                                       |
| --- | --------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| O11 | DB cart row — insert        | State      | After POST with new `product_id`: new row created in cart table for user + product (per BR-03)    |
| O12 | DB cart row — update        | State      | After POST with existing `product_id`: `quantity` field incremented, no duplicate row (per BR-03) |
| O13 | DB cart row — delete        | State      | After confirmed delete: cart row removed from DB (per BR-05)                                      |
| O14 | DB cart row — qty update    | State      | After +/- button action in UI: `quantity` field updated in DB (per BR-04)                         |
| O15 | Cart badge count (navbar)   | UI + State | Integer badge on navbar "Giỏ hàng" link, reflects current number of cart items (per BR-11, FR-23) |
| O16 | Navbar highlight state      | DOM        | "Giỏ hàng" nav link is visually highlighted/active when on cart page (per BR-13, FR-23)           |
| O17 | DOM: `<h1>` count           | DOM        | Cart page has exactly one `<h1>` tag (per BR-14, FR-21)                                           |
| O18 | DOM: image `alt` attributes | DOM        | All `<img>` elements in cart have non-empty `alt` attributes (per BR-15, FR-24)                   |
| O19 | DOM: breadcrumb presence    | DOM        | Breadcrumb navigation element exists on cart page (per BR-12, FR-23)                              |
| O20 | XSS safety in product name  | DOM        | Product name displayed in cart is HTML-escaped; `<script>` tags not executed (per BR-16, SEC-04)  |

### 1.3 Variable Summary for EP

- **Total inputs identified:** 10 (4 direct + 6 indirect)
- **Total outputs identified:** 20 (10 direct + 10 indirect)
- **Variables requiring EP:**
  - `quantity` (I4): Ordered numeric — valid range ≥ 1; BVA also applies
  - `price` (I3): Ordered numeric — must be > 0; BVA also applies
  - `product_id` (I1): Discrete — valid (exists in DB) vs. invalid (non-existent)
  - `product_name` (I2): String — valid (non-empty) vs. invalid (empty/too long)
  - `auth_token` (I5): Tri-state enum — absent / valid-user / valid-admin
  - `user_auth_state` (I6): Enum — anonymous vs. authenticated
  - `duplicate_product_in_cart` (I7): Boolean — first-time add (insert) vs. repeat-add (merge)
  - `cart_empty_state` (I8): Boolean — non-empty cart vs. empty cart
  - `confirm_dialog_response` (I9): Boolean — confirmed vs. dismissed
  - `product_exists_in_db` (I10): Boolean — exists vs. non-existent
- **Boundary candidates:**
  - `quantity` (I4): −∞ → 0 (invalid) → 1 (LB, valid) → 2 (LB+1) → large number (UB TBD)
  - `price` (I3): 0 (invalid LB) → positive number (valid)
  - `product_name` (I2): empty string (invalid) → 1 char (LB) → 255 chars (UB) → 256+ chars (UB+1)
- **AI Blind Spot Checklist (verified):**

| Blind Spot                                                  | Variable Added? |
| :---------------------------------------------------------- | :-------------- |
| `duplicate_product_in_cart` state (merge vs. insert)        | ✅ I7           |
| `cart_item_count` badge as output                           | ✅ O15          |
| `confirm_dialog_response` as an input (dismiss = no delete) | ✅ I9           |
| XSS safety in product name output (SEC-04)                  | ✅ O20          |
| `product_exists_in_db` — non-existent product_id            | ✅ I10          |
| `cart_empty_state` — drives empty-state UI rendering        | ✅ I8           |
