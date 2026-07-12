# Test Scope Document

**Project:** EShop — Web Automation Testing  
**SUT Version:** 2.0 (updated 2026-05-14)  
**Created:** 2026-07-12  
**Last Updated:** 2026-07-12  
**Status:** APPROVED  
**Approved By:** Group 06 — 2026-07-12

## 1. Scope Summary

### In Scope

| Component    | URL                     | Test Types                        |
| ------------ | ----------------------- | --------------------------------- |
| Frontend Web | `http://localhost:5173` | E2E UI, Smoke                     |
| Web Admin    | `http://localhost:5174` | E2E UI, Smoke                     |
| Backend API  | `http://localhost:3000` | API (security, server-side rules) |

### Out of Scope

| Item                         | Reason                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| Mobile App (React Native)    | FR-20 targets Expo/RN — requires a separate mobile automation framework; out of scope per AGENTS.md |
| Performance / Load Testing   | Requires dedicated tooling (k6, Locust); out of scope for this assignment                           |
| Email delivery verification  | OTP is displayed on screen in demo mode — real SMTP delivery cannot be asserted in tests            |
| SEC-01 (password hashing)    | Requires direct DB access; not verifiable via HTTP or browser automation                            |
| SEC-05 (parameterized query) | White-box requirement; not observable through the public API surface                                |

## 2. Requirement-to-Layer Mapping

| Requirement ID | Feature / Requirement Name                                                   | Test Layer | Notes                                                                             |
| -------------- | ---------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| FR-01          | User Registration                                                            | UI + API   | UI validates form rules; API enforces uniqueness and password strength            |
| FR-02          | Login & Account Lockout                                                      | UI + API   | UI shows lockout message; API enforces counter and 30s block                      |
| FR-03          | Forgot Password / OTP Reset (2-step)                                         | UI + API   | UI shows step indicator and OTP; API validates OTP scope per-email                |
| FR-04          | User Profile Management                                                      | UI + API   | UI form; API enforces no role escalation                                          |
| FR-05          | Product Listing & Search                                                     | UI         | Rendering, search keyword safe display; no server-side constraint to verify       |
| FR-06          | Product Detail View                                                          | UI         | Quantity input, add-to-cart feedback                                              |
| FR-07          | Shopping Cart                                                                | UI         | Add, update, remove with confirm dialog; total label                              |
| FR-08          | Checkout (Authenticated)                                                     | UI + API   | UI guards login; API must recompute total_amount (client-provided value rejected) |
| FR-09          | Coupon Code (5 conditions)                                                   | UI + API   | UI input at checkout; API enforces all 5 conditions server-side                   |
| FR-10          | Order State Machine                                                          | UI + API   | Admin UI drives transitions; API enforces valid state transitions                 |
| FR-11          | User Order History                                                           | UI         | Data isolation — user sees only own orders; status labels in Vietnamese           |
| FR-12          | Admin Access Control                                                         | API        | JWT + role=admin enforcement on all `/api/admin/*` and data-mutation endpoints    |
| FR-13          | Admin Dashboard                                                              | UI         | Revenue only from delivered orders; total order count                             |
| FR-14          | Category CRUD (Admin)                                                        | UI + API   | Admin UI; API requires auth+role                                                  |
| FR-15          | Product CRUD (Admin)                                                         | UI + API   | Admin UI; API requires auth+role; input constraints enforced server-side          |
| FR-16          | CSV Product Import (Admin)                                                   | UI + API   | File upload UI; API atomically rollbacks on any error                             |
| FR-17          | Coupon CRUD (Admin)                                                          | UI + API   | Admin UI; API requires auth+role                                                  |
| FR-18          | Admin Order Management                                                       | UI + API   | Admin sees all orders; status transition via UI; safe address display             |
| FR-19          | Admin User Management                                                        | UI + API   | Admin user list; cannot delete own account; API enforces constraint               |
| FR-21          | GUI Standards (language, colors, currency, h1)                               | UI         | Cross-cutting — verified as additional assertions within functional scenarios     |
| FR-22          | Form Requirements (labels, types, error position, step indicator)            | UI         | Cross-cutting — verified within functional scenarios                              |
| FR-23          | Navigation Requirements (navbar, badge, logout, breadcrumb)                  | UI         | Cross-cutting — verified within functional scenarios                              |
| FR-24          | Feedback & State Requirements (toast, confirm dialog, empty state, alt text) | UI         | Cross-cutting — verified within functional scenarios                              |
| SEC-01         | Password not stored in plaintext                                             | —          | Out of scope — requires DB access                                                 |
| SEC-02         | Authenticated APIs require JWT                                               | API        | Covered within FR-08, FR-09, FR-12 API scenarios                                  |
| SEC-03         | Admin APIs check role='admin' in token                                       | API        | Covered in SC-10 (Security & Misuse)                                              |
| SEC-04         | XSS — user input escaped on display                                          | UI         | Covered in SC-07 (search) and SC-14 (order address)                               |
| SEC-05         | Parameterized queries                                                        | —          | Out of scope — white-box requirement                                              |
| SEC-06         | Profile update must not allow role escalation                                | API        | Covered in SC-09 (Security & Misuse)                                              |
| SEC-07         | OTP entropy, expiry, and single-use                                          | API        | Covered in SC-04 (negative) and SC-09 partial                                     |

## 3. Scenario Inventory

### SC-01 — Customer Registers, Logs In, and Browses Products

| Field                         | Value                                                                                                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-01                                                                                                                                                                   |
| **Name**                      | Customer completes registration then logs in and browses product catalog                                                                                                |
| **Coverage Label**            | Happy Path                                                                                                                                                              |
| **Execution Mode**            | Automation                                                                                                                                                              |
| **Actor**                     | New Customer (Dynamic User)                                                                                                                                             |
| **Primary FR Coverage**       | FR-01 (registration), FR-02 (login), FR-05 (product listing & search)                                                                                                   |
| **GUI Requirements Verified** | FR-21 (language, h1), FR-22 (form fields: email type, password type, required markers), FR-23 (navbar highlight, cart badge), FR-24 (loading state)                     |
| **Dependency FRs**            | —                                                                                                                                                                       |
| **Test Layer**                | UI + API                                                                                                                                                                |
| **Priority**                  | Critical                                                                                                                                                                |
| **Objective**                 | Verify that a new user can successfully register, log in, and explore the product catalog end-to-end, and that all required form and navigation standards are in place. |

**Scenario Description:**

- A new user navigates to the registration page and fills in all required fields (name, email, strong password, confirm password).
- System accepts the form and redirects to the login page.
- User logs in with their new credentials.
- System authenticates and redirects to the home page showing a product grid.
- User searches for a product by keyword.
- System returns matching results; user verifies the displayed list.

### SC-02 — Customer Adds Products, Manages Cart, and Completes Checkout

| Field                         | Value                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scenario ID**               | SC-02                                                                                                                                                                                      |
| **Name**                      | Authenticated customer adds items to cart and completes checkout successfully                                                                                                              |
| **Coverage Label**            | Happy Path                                                                                                                                                                                 |
| **Execution Mode**            | Automation                                                                                                                                                                                 |
| **Actor**                     | Standard User (`test@eshop.com`)                                                                                                                                                           |
| **Primary FR Coverage**       | FR-06 (product detail, add-to-cart), FR-07 (cart management), FR-08 (checkout)                                                                                                             |
| **GUI Requirements Verified** | FR-23 (cart badge count, breadcrumb on cart/checkout), FR-24 (toast after add-to-cart, confirm dialog on remove, empty state after checkout), FR-21 (₫ currency format, "Tổng cộng" label) |
| **Dependency FRs**            | FR-02 (authenticated session)                                                                                                                                                              |
| **Test Layer**                | UI + API                                                                                                                                                                                   |
| **Priority**                  | Critical                                                                                                                                                                                   |
| **Objective**                 | Verify the full purchase journey: product detail → add to cart → cart management → checkout → cart cleared, confirming the API recomputes total and the UI displays correct totals.        |

**Scenario Description:**

- Authenticated user opens a product detail page; verifies full details (image, name, price, description, category).
- User sets quantity and clicks "Thêm vào giỏ hàng"; system shows toast/badge feedback.
- User adds a second product to the same cart.
- User navigates to the cart; verifies line items, unit prices, quantities, and the "Tổng cộng" total.
- User removes one item (confirm dialog appears and is accepted); item disappears.
- User proceeds to checkout; system shows order summary with shipping address.
- User places the order; system creates the order and clears the cart.
- User is redirected to order confirmation or history; cart badge shows 0.

### SC-03 — Customer Applies Coupon at Checkout

| Field                         | Value                                                                                                                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-03                                                                                                                                                                                          |
| **Name**                      | Customer applies valid coupon and verifies discount is applied correctly at checkout                                                                                                           |
| **Coverage Label**            | Happy Path                                                                                                                                                                                     |
| **Execution Mode**            | Automation                                                                                                                                                                                     |
| **Actor**                     | Standard User (`test@eshop.com`)                                                                                                                                                               |
| **Primary FR Coverage**       | FR-09 (coupon validation: all 5 conditions satisfied), FR-08 (checkout with discount)                                                                                                          |
| **GUI Requirements Verified** | FR-21 (₫ currency format for discount and final amounts)                                                                                                                                       |
| **Dependency FRs**            | FR-06, FR-07 (cart with sufficient total), FR-02 (authenticated session)                                                                                                                       |
| **Test Layer**                | UI + API                                                                                                                                                                                       |
| **Priority**                  | High                                                                                                                                                                                           |
| **Objective**                 | Verify that a valid coupon satisfying all 5 conditions is accepted, the discount is computed correctly by the server (percent and fixed types), and the final total shown matches the formula. |

**Scenario Description:**

- Authenticated user builds a cart with total ≥ 300,000 ₫.
- User proceeds to checkout and enters coupon code `SAVE10` (10% off, min 300k).
- System applies coupon; UI shows original amount, discount amount, and final amount.
- User verifies the calculated discount matches the 10% formula.
- User completes checkout; order is created at the discounted final_amount.
- (API-level: verify server recomputes discount rather than accepting client-sent values.)

### SC-04 — Customer Resets Password Using OTP (2-Step Flow)

| Field                         | Value                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-04                                                                                                                                                               |
| **Name**                      | Customer successfully resets password via OTP and logs in with new credentials                                                                                      |
| **Coverage Label**            | Happy Path                                                                                                                                                          |
| **Execution Mode**            | Automation                                                                                                                                                          |
| **Actor**                     | Dynamic User (registered in test setup)                                                                                                                             |
| **Primary FR Coverage**       | FR-03 (forgot password / OTP / reset), FR-02 (login with new password)                                                                                              |
| **GUI Requirements Verified** | FR-22 (step indicator visible at each step), FR-22 (back-to-login link present), FR-22 (password type fields)                                                       |
| **Dependency FRs**            | FR-01 (account must exist)                                                                                                                                          |
| **Test Layer**                | UI + API                                                                                                                                                            |
| **Priority**                  | High                                                                                                                                                                |
| **Objective**                 | Verify the complete 2-step password reset flow: OTP request → OTP displayed on screen → new password set meeting strength rules → login succeeds with new password. |

**Scenario Description:**

- User navigates to the "Quên mật khẩu" page; step indicator shows "Bước 1/2" and a back-to-login link is present.
- User enters their registered email; system generates and displays a 6-digit OTP on screen.
- UI transitions to step 2; step indicator now shows "Bước 2/2".
- User enters the OTP, new strong password, and confirmation; all match.
- System resets the password; user is redirected or prompted to log in.
- User logs in with the new password; session is established successfully.

### SC-05 — Customer Views and Cancels an Order (State Machine — Permitted Transitions)

| Field                         | Value                                                                                                                                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-05                                                                                                                                                                                                    |
| **Name**                      | Customer views order history and cancels a pending order                                                                                                                                                 |
| **Coverage Label**            | Happy Path                                                                                                                                                                                               |
| **Execution Mode**            | Automation                                                                                                                                                                                               |
| **Actor**                     | Standard User (`test@eshop.com`)                                                                                                                                                                         |
| **Primary FR Coverage**       | FR-11 (order history), FR-10 (cancel from pending — valid state transition)                                                                                                                              |
| **GUI Requirements Verified** | FR-11 (status labels in Vietnamese, color-coded), FR-21 (₫ currency)                                                                                                                                     |
| **Dependency FRs**            | FR-08 (an existing pending order), FR-02 (authenticated session)                                                                                                                                         |
| **Test Layer**                | UI + API                                                                                                                                                                                                 |
| **Priority**                  | High                                                                                                                                                                                                     |
| **Objective**                 | Verify that the user can view their own order history with correct data, and cancel a pending order — confirming the state machine allows this transition and the UI reflects the new "canceled" status. |

**Scenario Description:**

- Authenticated user navigates to order history; sees only their own orders (not other users').
- Each order displays: order ID, date, total (₫ format), and status in Vietnamese with colour coding.
- User selects a pending order and requests cancellation.
- System transitions order status to "canceled"; UI updates to reflect the new status.
- User verifies the canceled order can no longer be cancelled again (final state).

### SC-06 — Admin Manages Full Order Lifecycle (State Machine — All Transitions)

| Field                         | Value                                                                                                                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-06                                                                                                                                                                                    |
| **Name**                      | Admin drives an order through all valid state transitions from pending to delivered                                                                                                      |
| **Coverage Label**            | Happy Path                                                                                                                                                                               |
| **Execution Mode**            | Automation                                                                                                                                                                               |
| **Actor**                     | Admin (`admin@eshop.com`)                                                                                                                                                                |
| **Primary FR Coverage**       | FR-18 (admin order management), FR-10 (state machine: pending→confirmed→shipping→delivered)                                                                                              |
| **GUI Requirements Verified** | FR-18 (shipping address displayed safely, not rendered as HTML)                                                                                                                          |
| **Dependency FRs**            | FR-08 (existing pending order from any user)                                                                                                                                             |
| **Test Layer**                | UI + API                                                                                                                                                                                 |
| **Priority**                  | High                                                                                                                                                                                     |
| **Objective**                 | Verify that an admin can drive a full order lifecycle (pending → confirmed → shipping → delivered), that each transition is reflected in the UI, and that delivered is a terminal state. |

**Scenario Description:**

- Admin logs into the admin panel and views the full order list (all users' orders visible).
- Admin selects a pending order and confirms it → status becomes "confirmed".
- Admin marks the confirmed order as shipping → status becomes "shipping".
- Admin marks as delivered → status becomes "delivered".
- Admin attempts to change the delivered order's status again → system rejects and shows an error.
- Admin verifies shipping address is displayed as safe text (no HTML injection).

### SC-07 — Admin Creates Products and Categories via CRUD

| Field                         | Value                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-07                                                                                                                                                                           |
| **Name**                      | Admin creates a category and adds a product, then customer sees the new product                                                                                                 |
| **Coverage Label**            | Happy Path                                                                                                                                                                      |
| **Execution Mode**            | Automation                                                                                                                                                                      |
| **Actor**                     | Admin (`admin@eshop.com`) → Standard User (`test@eshop.com`)                                                                                                                    |
| **Primary FR Coverage**       | FR-14 (category CRUD), FR-15 (product CRUD), FR-05 (product listing reflects new data)                                                                                          |
| **GUI Requirements Verified** | FR-21 (₫ format on product listing), FR-24 (product image alt text)                                                                                                             |
| **Dependency FRs**            | FR-12 (admin auth)                                                                                                                                                              |
| **Test Layer**                | UI + API                                                                                                                                                                        |
| **Priority**                  | High                                                                                                                                                                            |
| **Objective**                 | Verify that an admin can create a category and a product with valid data, and that the product immediately appears in the customer-facing product listing with correct details. |

**Scenario Description:**

- Admin creates a new category with a unique name; category appears in the category list.
- Admin creates a new product assigned to the new category (name, positive price, description, imageUrl).
- Product appears in the admin product list with the correct details.
- Customer (on the web frontend) refreshes the product listing; the new product is visible with correct name, price (₫ format), and non-empty alt text on the image.

### SC-08 — Admin Imports Products via CSV (Atomic Rollback on Error)

| Field                         | Value                                                                                                                                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-08                                                                                                                                                                                                                                       |
| **Name**                      | Admin imports valid CSV then imports invalid CSV and confirms atomic rollback                                                                                                                                                               |
| **Coverage Label**            | Error Recovery                                                                                                                                                                                                                              |
| **Execution Mode**            | Automation                                                                                                                                                                                                                                  |
| **Actor**                     | Admin (`admin@eshop.com`)                                                                                                                                                                                                                   |
| **Primary FR Coverage**       | FR-16 (CSV import: valid file succeeds; invalid file triggers full rollback)                                                                                                                                                                |
| **GUI Requirements Verified** | FR-16 (import report shows row counts and error reasons)                                                                                                                                                                                    |
| **Dependency FRs**            | FR-12 (admin auth), FR-14 (category must exist for category_id)                                                                                                                                                                             |
| **Test Layer**                | UI + API                                                                                                                                                                                                                                    |
| **Priority**                  | Medium                                                                                                                                                                                                                                      |
| **Objective**                 | Verify that a well-formed CSV with valid rows imports all products successfully, and that a CSV with one invalid row causes the entire import to be rolled back (no partial inserts), with a report identifying the failing row and reason. |

**Scenario Description:**

- Admin uploads a valid CSV file (correct header, all rows have non-empty name and positive price).
- System reports all rows imported successfully; products appear in the product list.
- Admin uploads a second CSV where one row has an empty name and another has a negative price.
- System rejects the entire import; none of the rows from this batch appear in the product list.
- Admin reads the import report: error count, error row numbers, and reason messages are displayed.

### SC-09 — Customer Attempts Registration with Invalid Data

| Field                         | Value                                                                                                                                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-09                                                                                                                                                                                                                                   |
| **Name**                      | Customer attempts registration with invalid and duplicate credentials and is rejected                                                                                                                                                   |
| **Coverage Label**            | Negative                                                                                                                                                                                                                                |
| **Execution Mode**            | Automation                                                                                                                                                                                                                              |
| **Actor**                     | New Customer (Dynamic User)                                                                                                                                                                                                             |
| **Primary FR Coverage**       | FR-01 (registration validation: weak password, mismatched confirm, duplicate email)                                                                                                                                                     |
| **GUI Requirements Verified** | FR-22 (error message appears above submit button), FR-22 (required field markers \*)                                                                                                                                                    |
| **Dependency FRs**            | —                                                                                                                                                                                                                                       |
| **Test Layer**                | UI + API                                                                                                                                                                                                                                |
| **Priority**                  | High                                                                                                                                                                                                                                    |
| **Objective**                 | Verify that the system correctly rejects registration attempts with weak passwords, mismatched confirm passwords, invalid email formats, and duplicate email addresses — with appropriate error messages shown above the submit button. |

**Scenario Description:**

- User attempts to register with a password that lacks uppercase, digit, or special character (each variant separately) → system rejects with appropriate error.
- User fills in a valid password but a different confirmation password → system rejects with a mismatch error.
- User submits with an already-registered email → system rejects with a duplicate email error.
- In all rejection cases, the error message appears above the submit button; the form remains on the registration page.

### SC-10 — Customer Triggers Account Lockout with Failed Logins

| Field                         | Value                                                                                                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-10                                                                                                                                                                                           |
| **Name**                      | Customer triggers account lockout after 3 consecutive failed login attempts                                                                                                                     |
| **Coverage Label**            | Negative                                                                                                                                                                                        |
| **Execution Mode**            | Automation                                                                                                                                                                                      |
| **Actor**                     | Dynamic User (locked-out account)                                                                                                                                                               |
| **Primary FR Coverage**       | FR-02 (login lockout after ≥ 3 failures; 30-second block; counter increments by exactly 1)                                                                                                      |
| **GUI Requirements Verified** | FR-22 (error message above submit button)                                                                                                                                                       |
| **Dependency FRs**            | FR-01 (account must exist)                                                                                                                                                                      |
| **Test Layer**                | UI + API                                                                                                                                                                                        |
| **Priority**                  | High                                                                                                                                                                                            |
| **Objective**                 | Verify that after exactly 3 consecutive failed login attempts the account is locked for 30 seconds, an appropriate error message is displayed, and login succeeds again after the lock expires. |

**Scenario Description:**

- User submits incorrect password once; system shows a login failure message (attempt 1).
- User submits incorrect password a second time; system shows a failure message (attempt 2).
- User submits incorrect password a third time; system locks the account and shows a lockout message (not a generic "wrong password" message).
- User immediately tries to log in with the correct password → rejected (account still locked).
- After 30 seconds, user logs in with correct credentials → succeeds.

### SC-11 — Customer Attempts Checkout as Guest (Unauthenticated)

| Field                         | Value                                                                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-11                                                                                                                                                                 |
| **Name**                      | Guest customer attempts checkout without authentication and is redirected to login                                                                                    |
| **Coverage Label**            | Negative                                                                                                                                                              |
| **Execution Mode**            | Automation                                                                                                                                                            |
| **Actor**                     | Guest (unauthenticated)                                                                                                                                               |
| **Primary FR Coverage**       | FR-08 (checkout requires authentication), FR-02 (login gate)                                                                                                          |
| **GUI Requirements Verified** | FR-23 (navbar state: no user-specific links for guests)                                                                                                               |
| **Dependency FRs**            | —                                                                                                                                                                     |
| **Test Layer**                | UI + API                                                                                                                                                              |
| **Priority**                  | Critical                                                                                                                                                              |
| **Objective**                 | Verify that an unauthenticated user cannot access the checkout flow — UI redirects to login and the API rejects checkout requests without a valid JWT token with 401. |

**Scenario Description:**

- Guest user browses products and adds an item to the cart (cart may be local/session).
- Guest attempts to navigate to the checkout page.
- System redirects to the login page (UI enforces authentication gate).
- Guest attempts to call `POST /api/checkout` without an Authorization header (API-level).
- API responds with 401 Unauthorized; no order is created.

### SC-12 — Customer Attempts Coupon with Violated Conditions

| Field                         | Value                                                                                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-12                                                                                                                                                                                                                  |
| **Name**                      | Customer applies coupons that fail each of the 5 validation conditions and is rejected                                                                                                                                 |
| **Coverage Label**            | Negative                                                                                                                                                                                                               |
| **Execution Mode**            | Automation                                                                                                                                                                                                             |
| **Actor**                     | Standard User (`test@eshop.com`)                                                                                                                                                                                       |
| **Primary FR Coverage**       | FR-09 (coupon validation: all 5 failure conditions — invalid code, expired, below minimum, usage limit exceeded)                                                                                                       |
| **GUI Requirements Verified** | FR-22 (error message displayed for each rejection)                                                                                                                                                                     |
| **Dependency FRs**            | FR-06, FR-07 (cart), FR-02 (authenticated session)                                                                                                                                                                     |
| **Test Layer**                | UI + API                                                                                                                                                                                                               |
| **Priority**                  | High                                                                                                                                                                                                                   |
| **Objective**                 | Verify that each of the 5 coupon conditions is individually enforced: non-existent code, expired coupon, order below minimum threshold, and exceeding max-uses-per-user — each returning an appropriate error message. |

**Scenario Description:**

- User enters a non-existent coupon code → system rejects with "invalid code" message.
- User enters coupon code `EXPIRED` (expired 2020-01-01) → system rejects with expiry error.
- User builds a cart below 300,000 ₫ and enters `SAVE10` (min 300k) → system rejects with minimum order error.
- User who has already used `SAVE10` once enters it again → system rejects with usage-exceeded error (max_uses_per_user = 1).

### SC-13 — Customer Attempts to Cancel a Shipping-State Order (Blocked Transition)

| Field                         | Value                                                                                                                                                                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-13                                                                                                                                                                                                                                           |
| **Name**                      | Customer attempts to cancel an order in shipping state and is correctly blocked                                                                                                                                                                 |
| **Coverage Label**            | Negative                                                                                                                                                                                                                                        |
| **Execution Mode**            | Automation                                                                                                                                                                                                                                      |
| **Actor**                     | Standard User (`test@eshop.com`) + Admin (for setup)                                                                                                                                                                                            |
| **Primary FR Coverage**       | FR-10 (state machine: user cannot cancel a shipping order), FR-11 (order history shows correct state)                                                                                                                                           |
| **GUI Requirements Verified** | FR-11 (status label in Vietnamese)                                                                                                                                                                                                              |
| **Dependency FRs**            | FR-08 (pending order), FR-18 (admin transitions to shipping)                                                                                                                                                                                    |
| **Test Layer**                | UI + API                                                                                                                                                                                                                                        |
| **Priority**                  | High                                                                                                                                                                                                                                            |
| **Objective**                 | Verify that the system enforces the state machine constraint — a user cannot cancel an order once it reaches "shipping" status — both in the UI (button hidden or disabled) and at the API level (PUT /api/orders/:id/cancel returns an error). |

**Scenario Description:**

- Admin (via API fixture) creates an order and advances it to "shipping" status.
- User navigates to order history; order shows "Đang giao hàng" status.
- User attempts to cancel the order via the UI → cancel button is absent or disabled; no cancellation occurs.
- User directly calls `PUT /api/orders/:id/cancel` API → system returns an error response; order remains in shipping state.

### SC-14 — Unauthorized User Attempts to Access Admin Panel

| Field                         | Value                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-14                                                                                                                                                                           |
| **Name**                      | Non-admin authenticated user attempts to access admin endpoints and is rejected                                                                                                 |
| **Coverage Label**            | Security & Misuse                                                                                                                                                               |
| **Execution Mode**            | Automation                                                                                                                                                                      |
| **Actor**                     | Standard User (`test@eshop.com`) — authenticated but role=user                                                                                                                  |
| **Primary FR Coverage**       | FR-12 (admin access control), SEC-03 (role check in token, not just token presence)                                                                                             |
| **GUI Requirements Verified** | —                                                                                                                                                                               |
| **Dependency FRs**            | FR-02 (authenticated user session)                                                                                                                                              |
| **Test Layer**                | API                                                                                                                                                                             |
| **Priority**                  | Critical                                                                                                                                                                        |
| **Objective**                 | Verify that a valid JWT token belonging to a role=user account is rejected (403 Forbidden) by all admin-only API endpoints — the backend checks role, not just token existence. |

**Scenario Description:**

- Standard user authenticates and obtains a valid JWT token with role=user.
- User sends requests with this token to: `GET /api/admin/users`, `GET /api/admin/orders`, `POST /api/products`, `DELETE /api/products/:id`, `POST /api/categories`, `DELETE /api/categories/:id`, `POST /api/admin/coupons`, `DELETE /api/admin/coupons/:id`.
- Each request returns 403 Forbidden (not 200, not 401).
- No data is returned or modified by any of these requests.

### SC-15 — Unauthenticated Attacker Attempts to Access Protected Endpoints

| Field                         | Value                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-15                                                                                                                                                                       |
| **Name**                      | Unauthenticated attacker calls protected endpoints without a token and is rejected                                                                                          |
| **Coverage Label**            | Security & Misuse                                                                                                                                                           |
| **Execution Mode**            | Automation                                                                                                                                                                  |
| **Actor**                     | Attacker (no authentication)                                                                                                                                                |
| **Primary FR Coverage**       | SEC-02 (authenticated APIs require JWT), FR-12 (all admin APIs require JWT + role)                                                                                          |
| **GUI Requirements Verified** | —                                                                                                                                                                           |
| **Dependency FRs**            | —                                                                                                                                                                           |
| **Test Layer**                | API                                                                                                                                                                         |
| **Priority**                  | Critical                                                                                                                                                                    |
| **Objective**                 | Verify that every protected API endpoint rejects requests with no Authorization header — returning 401 Unauthorized — and does not expose any data or perform any mutation. |

**Scenario Description:**

- Attacker sends requests with no Authorization header to: `GET /api/cart`, `POST /api/checkout`, `GET /api/orders/my-orders`, `PUT /api/orders/:id/cancel`, `GET /api/admin/users`, `GET /api/admin/orders`, `PUT /api/admin/orders/:id/status`, `POST /api/products`, `DELETE /api/admin/users/:id`.
- Each request returns 401 Unauthorized.
- No data is leaked and no state is mutated.

### SC-16 — Attacker Attempts to Escalate Role via Profile Update API

| Field                         | Value                                                                                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-16                                                                                                                                                                                   |
| **Name**                      | Authenticated user attempts to escalate their role to admin via the profile update API                                                                                                  |
| **Coverage Label**            | Security & Misuse                                                                                                                                                                       |
| **Execution Mode**            | Automation                                                                                                                                                                              |
| **Actor**                     | Standard User (`test@eshop.com`) acting as attacker                                                                                                                                     |
| **Primary FR Coverage**       | FR-04 (profile update: email immutable), SEC-06 (role field must be ignored by server)                                                                                                  |
| **GUI Requirements Verified** | —                                                                                                                                                                                       |
| **Dependency FRs**            | FR-02 (authenticated session)                                                                                                                                                           |
| **Test Layer**                | API                                                                                                                                                                                     |
| **Priority**                  | Critical                                                                                                                                                                                |
| **Objective**                 | Verify that the `PUT /api/users/me` endpoint ignores the `role` field in the request body — the role is not changed to 'admin', even when explicitly included by an authenticated user. |

**Scenario Description:**

- Standard user authenticates and obtains a JWT token.
- User sends `PUT /api/users/me` with body: `{"name": "Hacker", "role": "admin"}`.
- API responds with 200 (profile update accepted for permitted fields).
- User calls `GET /api/users/me` → response shows role is still 'user', not 'admin'.
- User attempts to call an admin endpoint with the same token → still 403 Forbidden.

### SC-17 — Attacker Attempts Total Price Manipulation at Checkout

| Field                         | Value                                                                                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-17                                                                                                                                                                                                                      |
| **Name**                      | Attacker manipulates total_amount in checkout request and server recomputes correctly                                                                                                                                      |
| **Coverage Label**            | Security & Misuse                                                                                                                                                                                                          |
| **Execution Mode**            | Automation                                                                                                                                                                                                                 |
| **Actor**                     | Standard User (`test@eshop.com`) acting as attacker                                                                                                                                                                        |
| **Primary FR Coverage**       | FR-08 (backend must recompute total; client-sent total_amount must be ignored)                                                                                                                                             |
| **GUI Requirements Verified** | —                                                                                                                                                                                                                          |
| **Dependency FRs**            | FR-02 (authenticated session), FR-06, FR-07 (items in cart with known price)                                                                                                                                               |
| **Test Layer**                | API                                                                                                                                                                                                                        |
| **Priority**                  | Critical                                                                                                                                                                                                                   |
| **Objective**                 | Verify that the backend recomputes the order total from cart contents and ignores the `total_amount` value sent by the client — an attacker sending `total_amount: 1` cannot create an order at an artificially low price. |

**Scenario Description:**

- Authenticated user populates their cart with products totalling a known amount (e.g. 500,000 ₫).
- User crafts a `POST /api/checkout` request with `total_amount: 1` (a tampered value).
- API creates the order but the stored `total_amount` in the database matches the server-computed total (500,000 ₫), not the client-provided value of 1.
- User retrieves the created order via `GET /api/orders/:id` and verifies `total_amount` is correct.

### SC-18 — Admin Manages Coupons and Verifies Coupon Constraints

| Field                         | Value                                                                                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-18                                                                                                                                                                                                                      |
| **Name**                      | Admin creates, views, and deletes coupons; validates required field constraints                                                                                                                                            |
| **Coverage Label**            | Happy Path                                                                                                                                                                                                                 |
| **Execution Mode**            | Automation                                                                                                                                                                                                                 |
| **Actor**                     | Admin (`admin@eshop.com`)                                                                                                                                                                                                  |
| **Primary FR Coverage**       | FR-17 (coupon CRUD: create, list, delete; required fields and uniqueness of code)                                                                                                                                          |
| **GUI Requirements Verified** | FR-21 (₫ currency for min_order_amount display)                                                                                                                                                                            |
| **Dependency FRs**            | FR-12 (admin auth)                                                                                                                                                                                                         |
| **Test Layer**                | UI + API                                                                                                                                                                                                                   |
| **Priority**                  | Medium                                                                                                                                                                                                                     |
| **Objective**                 | Verify that an admin can create coupons with all required fields, see them in the coupon list, and delete them — and that the system rejects coupon creation when required fields are missing or a duplicate code is used. |

**Scenario Description:**

- Admin navigates to the coupon management page and creates a new coupon with all required fields (unique code, type=percent, positive discount_value, future expired_at, min_order_amount ≥ 0, max_uses_per_user ≥ 1).
- New coupon appears in the coupon list with the correct details.
- Admin attempts to create a second coupon with the same code → system rejects with a uniqueness error.
- Admin deletes the original coupon; it disappears from the list.

### SC-19 — Admin Manages Users and Cannot Delete Own Account

| Field                         | Value                                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scenario ID**               | SC-19                                                                                                                                                                                            |
| **Name**                      | Admin views user list and is blocked from deleting their own account                                                                                                                             |
| **Coverage Label**            | Negative                                                                                                                                                                                         |
| **Execution Mode**            | Automation                                                                                                                                                                                       |
| **Actor**                     | Admin (`admin@eshop.com`)                                                                                                                                                                        |
| **Primary FR Coverage**       | FR-19 (admin user management: list users, delete users, cannot delete own account)                                                                                                               |
| **GUI Requirements Verified** | FR-19 (passwords not visible in user list)                                                                                                                                                       |
| **Dependency FRs**            | FR-12 (admin auth)                                                                                                                                                                               |
| **Test Layer**                | UI + API                                                                                                                                                                                         |
| **Priority**                  | High                                                                                                                                                                                             |
| **Objective**                 | Verify that the admin can view all users (without passwords), delete another user successfully, and that attempting to delete their own account is rejected both in the UI and at the API level. |

**Scenario Description:**

- Admin navigates to the user management page; sees a list of all registered users.
- User list does not display password fields in any form.
- Admin deletes a dynamically-created test user → user disappears from the list.
- Admin attempts to delete their own account (admin@eshop.com) via the UI → system shows an error or the button is disabled.
- Admin calls `DELETE /api/admin/users/:id` with their own user ID → API returns an error; admin account remains.

### SC-20 — Admin Dashboard Displays Correct Revenue Statistics

| Field                         | Value                                                                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scenario ID**               | SC-20                                                                                                                                                                                                                          |
| **Name**                      | Admin dashboard shows revenue only from delivered orders and correct total order count                                                                                                                                         |
| **Coverage Label**            | Happy Path                                                                                                                                                                                                                     |
| **Execution Mode**            | Automation                                                                                                                                                                                                                     |
| **Actor**                     | Admin (`admin@eshop.com`)                                                                                                                                                                                                      |
| **Primary FR Coverage**       | FR-13 (dashboard: revenue = sum of delivered orders only; total order count)                                                                                                                                                   |
| **GUI Requirements Verified** | FR-21 (₫ currency format on dashboard figures)                                                                                                                                                                                 |
| **Dependency FRs**            | FR-18 (orders in various states: pending, confirmed, delivered, canceled)                                                                                                                                                      |
| **Test Layer**                | UI + API                                                                                                                                                                                                                       |
| **Priority**                  | Medium                                                                                                                                                                                                                         |
| **Objective**                 | Verify that the admin dashboard revenue figure equals the sum of total_amount for delivered orders only (not pending, confirmed, shipping, or canceled), and the order count matches the total number of orders in the system. |

**Scenario Description:**

- Via API fixtures, ensure the system has: at least one delivered order (known amount), one pending order, and one canceled order.
- Admin logs in and views the dashboard.
- Dashboard revenue figure = sum of only the delivered order amounts; pending and canceled amounts are excluded.
- Dashboard total order count = total orders across all statuses.
- Admin verifies the ₫ format is correct.

### SC-21 — Customer Updates Profile with Valid and Invalid Data

| Field                         | Value                                                                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scenario ID**               | SC-21                                                                                                                                                                                                               |
| **Name**                      | Customer updates profile with valid data, then attempts invalid phone and immutable email                                                                                                                           |
| **Coverage Label**            | Negative                                                                                                                                                                                                            |
| **Execution Mode**            | Automation                                                                                                                                                                                                          |
| **Actor**                     | Standard User (`test@eshop.com`)                                                                                                                                                                                    |
| **Primary FR Coverage**       | FR-04 (profile update: name, phone validation, shipping address; email immutable)                                                                                                                                   |
| **GUI Requirements Verified** | FR-22 (email field not editable or absent), FR-22 (required field markers)                                                                                                                                          |
| **Dependency FRs**            | FR-02 (authenticated session)                                                                                                                                                                                       |
| **Test Layer**                | UI + API                                                                                                                                                                                                            |
| **Priority**                  | Medium                                                                                                                                                                                                              |
| **Objective**                 | Verify that a user can update name, phone, and shipping address; that invalid phone numbers (wrong length, not starting with 0) are rejected; and that the email field cannot be changed through the UI or the API. |

**Scenario Description:**

- Authenticated user navigates to the profile page.
- User updates name and shipping address with valid values → saved successfully.
- User enters a phone number that doesn't start with '0' → rejected with validation error.
- User enters a phone number with fewer than 10 digits → rejected.
- User enters a valid phone number (starts with 0, 10-11 digits) → accepted.
- Email field is absent from the editable fields or is read-only.
- (API-level) User sends `PUT /api/users/me` with `{"email": "newemail@test.com"}` → email field is unchanged in the response.

## 4. Coverage Matrix

| Requirement ID | Feature                                 | Covered By                                        | Test Layer |
| -------------- | --------------------------------------- | ------------------------------------------------- | ---------- |
| FR-01          | User Registration                       | SC-01 (HP), SC-09 (NEG)                           | UI + API   |
| FR-02          | Login & Account Lockout                 | SC-01 (HP), SC-04 (HP), SC-10 (NEG), SC-11 (NEG)  | UI + API   |
| FR-03          | Forgot Password / OTP Reset             | SC-04 (HP)                                        | UI + API   |
| FR-04          | User Profile Management                 | SC-21 (NEG)                                       | UI + API   |
| FR-05          | Product Listing & Search                | SC-01 (HP), SC-07 (HP)                            | UI         |
| FR-06          | Product Detail View                     | SC-02 (HP)                                        | UI         |
| FR-07          | Shopping Cart                           | SC-02 (HP), SC-03 (HP), SC-12 (NEG)               | UI         |
| FR-08          | Checkout (Authenticated)                | SC-02 (HP), SC-03 (HP), SC-11 (NEG), SC-17 (SEC)  | UI + API   |
| FR-09          | Coupon Code (5 conditions)              | SC-03 (HP), SC-12 (NEG)                           | UI + API   |
| FR-10          | Order State Machine                     | SC-05 (HP), SC-06 (HP), SC-13 (NEG)               | UI + API   |
| FR-11          | User Order History                      | SC-05 (HP), SC-13 (NEG)                           | UI         |
| FR-12          | Admin Access Control                    | SC-14 (SEC), SC-15 (SEC)                          | API        |
| FR-13          | Admin Dashboard                         | SC-20 (HP)                                        | UI + API   |
| FR-14          | Category CRUD (Admin)                   | SC-07 (HP)                                        | UI + API   |
| FR-15          | Product CRUD (Admin)                    | SC-07 (HP)                                        | UI + API   |
| FR-16          | CSV Product Import (Admin)              | SC-08 (ER)                                        | UI + API   |
| FR-17          | Coupon CRUD (Admin)                     | SC-18 (HP)                                        | UI + API   |
| FR-18          | Admin Order Management                  | SC-06 (HP), SC-13 (NEG)                           | UI + API   |
| FR-19          | Admin User Management                   | SC-19 (NEG)                                       | UI + API   |
| FR-20          | Mobile Features                         | _(Out of Scope)_                                  | —          |
| FR-21          | GUI Standards (language, colors, h1, ₫) | SC-01–SC-07, SC-20 (within)                       | UI         |
| FR-22          | Form Requirements                       | SC-01, SC-04, SC-09, SC-10, SC-12, SC-21 (within) | UI         |
| FR-23          | Navigation Requirements                 | SC-01, SC-02, SC-05, SC-11 (within)               | UI         |
| FR-24          | Feedback & State Requirements           | SC-02, SC-07, SC-08 (within)                      | UI         |
| SEC-01         | Password not stored in plaintext        | _(Out of Scope — DB access required)_             | —          |
| SEC-02         | Authenticated APIs require JWT          | SC-11 (NEG), SC-15 (SEC)                          | API        |
| SEC-03         | Admin APIs check role in token          | SC-14 (SEC)                                       | API        |
| SEC-04         | XSS — user input escaped on display     | SC-01 (search, within), SC-06 (address, within)   | UI         |
| SEC-05         | Parameterized queries                   | _(Out of Scope — white-box)_                      | —          |
| SEC-06         | Profile update cannot change role       | SC-16 (SEC)                                       | API        |
| SEC-07         | OTP entropy, expiry, single-use         | SC-04 (HP — partial), SC-09 (NEG — partial)       | API        |

## 5. Execution Order Recommendation

| Order | Scenario ID | Name                                                         | Coverage Label    | Priority | Rationale                                                                              |
| ----- | ----------- | ------------------------------------------------------------ | ----------------- | -------- | -------------------------------------------------------------------------------------- |
| 1     | SC-01       | Customer registers, logs in, and browses products            | Happy Path        | Critical | Foundational: registration + login needed by nearly all other scenarios                |
| 2     | SC-15       | Unauthenticated attacker calls protected endpoints           | Security & Misuse | Critical | API-only; no browser; fast to validate; protects all subsequent scenarios' integrity   |
| 3     | SC-14       | Non-admin user attempts admin endpoints                      | Security & Misuse | Critical | API-only; validates role check before any admin UI scenarios run                       |
| 4     | SC-16       | User attempts role escalation via profile API                | Security & Misuse | Critical | API-only; fast; closes the role escalation attack surface before full flows are tested |
| 5     | SC-17       | Attacker manipulates total_amount at checkout                | Security & Misuse | Critical | API-only; validates server-side total recomputation before UI checkout scenarios run   |
| 6     | SC-02       | Customer adds products, manages cart, and completes checkout | Happy Path        | Critical | Core commerce flow; prerequisite for order-state and coupon scenarios                  |
| 7     | SC-11       | Guest attempts checkout (unauthenticated)                    | Negative          | Critical | Guards core checkout; validates auth gate on UI and API                                |
| 8     | SC-09       | Customer attempts registration with invalid data             | Negative          | High     | Covers all registration validation rules early                                         |
| 9     | SC-10       | Customer triggers account lockout                            | Negative          | High     | Lockout behavior; requires fresh dynamic account                                       |
| 10    | SC-04       | Customer resets password via OTP                             | Happy Path        | High     | Covers full 2-step forgot-password flow                                                |
| 11    | SC-03       | Customer applies valid coupon at checkout                    | Happy Path        | High     | Happy-path coupon; depends on SC-02 patterns                                           |
| 12    | SC-12       | Customer applies coupons that fail each condition            | Negative          | High     | All coupon rejection cases; can share fixture setup with SC-03                         |
| 13    | SC-05       | Customer views order history and cancels pending order       | Happy Path        | High     | Order history + valid cancellation                                                     |
| 14    | SC-13       | Customer attempts to cancel shipping-state order             | Negative          | High     | State machine enforcement; requires admin fixture for setup                            |
| 15    | SC-06       | Admin drives order through all state transitions             | Happy Path        | High     | Full state machine happy path; admin panel order management                            |
| 16    | SC-07       | Admin creates category and product; customer sees result     | Happy Path        | High     | Admin CRUD → customer-facing result; cross-system integration                          |
| 17    | SC-19       | Admin views users and cannot delete own account              | Negative          | High     | User management + self-deletion guard                                                  |
| 18    | SC-21       | Customer updates profile with valid and invalid data         | Negative          | Medium   | Profile validation; email immutability                                                 |
| 19    | SC-18       | Admin manages coupons                                        | Happy Path        | Medium   | Coupon CRUD; admin panel                                                               |
| 20    | SC-20       | Admin dashboard shows correct revenue statistics             | Happy Path        | Medium   | Dashboard calculation validation; requires orders in multiple states                   |
| 21    | SC-08       | Admin imports CSV; confirms atomic rollback on error         | Error Recovery    | Medium   | CSV import; both success and rollback paths                                            |

## 6. Scenario Discovery Heuristics — Results

| Technique                                        | Result Summary                                                                                                                        | Scenarios Derived                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| T2 — Actor Analysis                              | 3 actors identified: Customer (unauthenticated guest + authenticated user), Admin, Attacker. Each actor drove distinct scenario sets. | SC-01–SC-13, SC-21 (Customer); SC-06–SC-08, SC-18–SC-20 (Admin); SC-14–SC-17 (Attacker) |
| T3 — Disfavored Users                            | Attacker scenarios: unauthenticated API access, role escalation, price manipulation, admin endpoint probing with user token.          | SC-14, SC-15, SC-16, SC-17                                                              |
| T7 — Specific Transactions                       | Key business transactions: registration, login, checkout, coupon apply, order cancel, CSV import, password reset.                     | SC-01, SC-02, SC-03, SC-04, SC-05, SC-08                                                |
| T4 — System Events                               | Lockout trigger (3 failures), OTP generation, cart-clear post-checkout, order status broadcast.                                       | SC-10, SC-04, SC-02, SC-06                                                              |
| T16 — Sequence Analysis                          | Identified cross-actor sequences: Admin creates product → Customer sees it; Admin advances order → Customer tries to cancel.          | SC-07, SC-13                                                                            |
| T1 — Object Life History (Order State Machine)   | 5 states, 6 valid transitions, 2 terminal states, 1 actor-restricted transition (shipping→cancel blocked for user).                   | SC-05, SC-06, SC-13                                                                     |
| T1 — Object Life History (Coupon Usage Counter)  | Coupon usage tracks per-user count against max_uses_per_user; exhaustion is a distinct state.                                         | SC-12                                                                                   |
| T1 — Object Life History (Account Lockout State) | Account transitions: normal → locked (after 3 failures) → normal (after 30s). Counter increment exactness is critical.                | SC-10                                                                                   |
