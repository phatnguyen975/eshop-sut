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

## Step 2: Equivalence Classes

### Variable I1: `product_id` — G3 (Must-Be: valid reference) + G4 (splitting by type)

> G3 applied: product_id must exist in DB (boolean condition: exists / not-exists).  
> G4 applied: split further by data type (integer vs. non-integer).

| Class ID | Type    | Description                                     | Representative |
| -------- | ------- | ----------------------------------------------- | -------------- |
| EC01     | Valid   | Positive integer, references existing product   | `1`            |
| EC02     | Invalid | Positive integer, NOT in products DB table      | `99999`        |
| EC03     | Invalid | `id` field is null or missing from request body | `null`         |
| EC04     | Invalid | Non-integer type (string passed instead of int) | `"abc"`        |

### Variable I2: `product_name` — G3 (Must-Be: non-empty) + G1 (length ≤ 255 implicit) + G4 (XSS split)

> G3 applied: must be non-empty.  
> G1 applied: implicit DB VARCHAR(255) upper bound.  
> G4 applied: split valid class into normal string vs. XSS payload — same input domain, different output behavior (SEC-04 tests output safety, not input rejection).

| Class ID | Type       | Description                                               | Representative                |
| -------- | ---------- | --------------------------------------------------------- | ----------------------------- |
| EC05     | Valid      | Non-empty string, length 1–255 chars                      | `"Laptop ABC"`                |
| EC06     | Valid (G4) | XSS-payload string — tests safe output rendering (SEC-04) | `"<script>alert(1)</script>"` |
| EC07     | Invalid    | Empty string `""`                                         | `""`                          |
| EC08     | Invalid    | `name` field null or missing from request body            | `null`                        |
| EC09     | Invalid    | String exceeds DB limit (> 255 chars)                     | 300-character string          |

### Variable I3: `price` — G1 (Continuous range: price > 0)

> G1 applied: 1 valid class (> 0) + 2 invalid classes (= 0, < 0).  
> G3 applied additionally: null/missing is a separate must-be violation.

| Class ID | Type    | Description                   | Representative |
| -------- | ------- | ----------------------------- | -------------- |
| EC10     | Valid   | Positive number (> 0)         | `100000`       |
| EC11     | Invalid | Price equals zero exactly     | `0`            |
| EC12     | Invalid | Negative price (< 0)          | `-50000`       |
| EC13     | Invalid | `price` field null or missing | `null`         |

### Variable I4: `quantity` — G1 (Continuous range: quantity ≥ 1)

> G1 applied: 1 valid class (≥ 1) + 2 invalid classes (= 0, < 0).  
> G3 applied: null/missing is a separate violation.  
> G4 applied: non-integer decimal — same numeric domain, different parsing behavior.  
> **User-specified:** `quantity = 0` is a mandatory separate invalid class (boundary between "minimum valid" and "remove item" ambiguity).

| Class ID | Type    | Description                                            | Representative |
| -------- | ------- | ------------------------------------------------------ | -------------- |
| EC14     | Valid   | Integer ≥ 1                                            | `2`            |
| EC15     | Invalid | Quantity = 0 exactly (boundary — remove-or-reject gap) | `0`            |
| EC16     | Invalid | Negative integer (< 0)                                 | `-1`           |
| EC17     | Invalid | `quantity` field null or missing                       | `null`         |
| EC18     | Invalid | Non-integer decimal value                              | `1.5`          |

### Variable I5: `auth_token` — G2 (Discrete set of token states)

> G2 applied: token state is a discrete set — 1 valid class per meaningful state + 1 invalid catch-all.  
> Auth states for FR-07 (user-facing feature): absent / valid-user / valid-admin / invalid.  
> Note: Admin also holds a valid JWT; cart access with admin token tests whether SEC-02 enforcement is role-agnostic (per FR-07, SEC-02).

| Class ID | Type       | Description                                        | Representative                 |
| -------- | ---------- | -------------------------------------------------- | ------------------------------ |
| EC19     | Valid      | Valid user JWT in Authorization header             | `Bearer <user_jwt>`            |
| EC20     | Valid (G2) | Valid admin JWT — tests whether admin can use cart | `Bearer <admin_jwt>`           |
| EC21     | Invalid    | No Authorization header (anonymous)                | (header absent)                |
| EC22     | Invalid    | Invalid or expired token                           | `Bearer invalid.expired.token` |

> **Note:** I6 (`user_auth_state`) is fully derived from I5. EC19–EC22 cover both variables. No additional ECs required for I6.

### Variable I7: `duplicate_product_in_cart` — G3 (Boolean DB state: first-add vs. repeat-add)

> G3 applied: binary must-be condition — is the product already in this user's cart?  
> **User-specified:** Merge behavior (EC24) is a mandatory separate valid class (per BR-03).

| Class ID | Type       | Description                                                                   | Representative                                                  |
| -------- | ---------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| EC23     | Valid      | Product NOT yet in cart — first-time add → INSERT new row                     | Cart contains no entry for product_id=1; POST with product_id=1 |
| EC24     | Valid (G4) | Product ALREADY in cart — repeat add → MERGE (increment quantity, no new row) | Cart has product_id=1 qty=1; POST with product_id=1 again       |

### Variable I8: `cart_empty_state` — G3 (Boolean: non-empty vs. empty)

> G3 applied: binary state — cart has items vs. cart is empty. Both are valid states that drive different UI outputs (BR-02 table view vs. BR-08 empty state).

| Class ID | Type    | Description                             | Representative                          |
| -------- | ------- | --------------------------------------- | --------------------------------------- |
| EC25     | Valid-A | Cart has ≥ 1 item — table view rendered | Cart with product_id=1, qty=2           |
| EC26     | Valid-B | Cart has 0 items — empty-state UI shown | Cart with no items (just authenticated) |

### Variable I9: `confirm_dialog_response` — G3 (Boolean: confirmed vs. dismissed)

> G3 applied: binary user decision after delete button is pressed. Both outcomes are valid user actions; they drive different system responses.

| Class ID | Type    | Description                                          | Representative         |
| -------- | ------- | ---------------------------------------------------- | ---------------------- |
| EC27     | Valid-A | User clicks **Confirm** in dialog → item deleted     | Click "Confirm" button |
| EC28     | Valid-B | User clicks **Dismiss/Cancel** in dialog → item kept | Click "Cancel" button  |

### Variable I10: `product_exists_in_db` — G3 (Boolean DB state)

> G3 applied: already captured via product_id classes.  
> EC01 maps to `product_exists_in_db = true`; EC02 maps to `product_exists_in_db = false`. No additional ECs needed — cross-reference only.

| Cross-ref   | Mapped EC | Explanation                     |
| ----------- | --------- | ------------------------------- |
| I10 = true  | EC01      | Product ID exists in DB         |
| I10 = false | EC02      | Product ID does not exist in DB |

## Step 3: Test Case Optimization

### 3.1 Valid Classes Coverage (Combination Rule)

> Combine as many valid ECs as possible into the minimum number of test cases.  
> Valid ECs: EC01, EC05, EC06, EC10, EC14, EC19, EC20, EC23, EC24, EC25, EC26, EC27, EC28

| TC ID       | Valid Classes Covered                    | Test Data Summary                                                                                           |
| ----------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| FR07-EP-001 | EC01, EC05, EC10, EC14, EC19, EC23, EC25 | Add new product (id=1, name="Laptop ABC", price=100000, qty=2) with user JWT to non-empty cart → Happy Path |
| FR07-EP-002 | EC01, EC05, EC10, EC14, EC19, EC24       | Add same product_id again to cart → quantity merges (BR-03), no duplicate row                               |
| FR07-EP-003 | EC19, EC26                               | Authenticated user views empty cart → empty-state UI shown (BR-08)                                          |
| FR07-EP-004 | EC01, EC19, EC27                         | Click delete → confirm dialog appears → user confirms → item removed (BR-05)                                |
| FR07-EP-005 | EC01, EC19, EC28                         | Click delete → confirm dialog appears → user dismisses → item retained (BR-05)                              |
| FR07-EP-006 | EC06, EC10, EC14, EC19, EC23             | Add product with XSS name; cart renders it escaped — no script execution (SEC-04)                           |
| FR07-EP-007 | EC01, EC05, EC10, EC14, EC20, EC23       | Admin JWT used to access cart → behaves as authenticated user (BR-01, SEC-02)                               |

### 3.2 Invalid Classes Coverage (Isolation Rule)

> Each invalid TC: exactly 1 invalid EC + all other inputs drawn from valid classes (EC01, EC05, EC10, EC14, EC19).

| TC ID       | Invalid Class Isolated                            | Other Inputs (All Valid)                                |
| ----------- | ------------------------------------------------- | ------------------------------------------------------- |
| FR07-EP-008 | EC02 — `product_id` not in DB (99999)             | name="Laptop ABC", price=100000, qty=2, valid user JWT  |
| FR07-EP-009 | EC03 — `id` field null/missing from body          | name="Laptop ABC", price=100000, qty=2, valid user JWT  |
| FR07-EP-010 | EC04 — `id` is non-integer ("abc")                | name="Laptop ABC", price=100000, qty=2, valid user JWT  |
| FR07-EP-011 | EC07 — `name` is empty string ("")                | id=1, price=100000, qty=2, valid user JWT               |
| FR07-EP-012 | EC08 — `name` field null/missing from body        | id=1, price=100000, qty=2, valid user JWT               |
| FR07-EP-013 | EC09 — `name` is > 255 chars string               | id=1, price=100000, qty=2, valid user JWT               |
| FR07-EP-014 | EC11 — `price` = 0                                | id=1, name="Laptop ABC", qty=2, valid user JWT          |
| FR07-EP-015 | EC12 — `price` < 0 (-50000)                       | id=1, name="Laptop ABC", qty=2, valid user JWT          |
| FR07-EP-016 | EC13 — `price` field null/missing                 | id=1, name="Laptop ABC", qty=2, valid user JWT          |
| FR07-EP-017 | EC15 — `quantity` = 0 (boundary gap)              | id=1, name="Laptop ABC", price=100000, valid user JWT   |
| FR07-EP-018 | EC16 — `quantity` < 0 (-1)                        | id=1, name="Laptop ABC", price=100000, valid user JWT   |
| FR07-EP-019 | EC17 — `quantity` field null/missing              | id=1, name="Laptop ABC", price=100000, valid user JWT   |
| FR07-EP-020 | EC18 — `quantity` is decimal (1.5)                | id=1, name="Laptop ABC", price=100000, valid user JWT   |
| FR07-EP-021 | EC21 — No Authorization header (anonymous access) | id=1, name="Laptop ABC", price=100000, qty=2 (no token) |
| FR07-EP-022 | EC22 — Invalid/expired JWT token                  | id=1, name="Laptop ABC", price=100000, qty=2, bad token |

### 3.3 EC Coverage Summary

| Total ECs | Valid ECs | Invalid ECs | TCs for Valid | TCs for Invalid | Total TCs |
| --------- | --------- | ----------- | ------------- | --------------- | --------- |
| 28        | 13        | 15          | 7             | 15              | 22        |
