# Requirement Analysis — FR-17: Coupon Management (Admin CRUD)

## 1. Feature Overview

| Attribute         | Value                                                                            |
| ----------------- | -------------------------------------------------------------------------------- |
| Feature ID        | FR-17                                                                            |
| Feature Name      | Coupon Management — Admin CRUD (Create / Read / Delete)                          |
| Test Layer        | Both (Web Admin UI + API)                                                        |
| Entry Point (UI)  | `http://localhost:5174` → Coupon Management section                              |
| Entry Point (API) | `POST /api/admin/coupons` · `DELETE /api/admin/coupons/:id` · `GET /api/coupons` |
| Actors            | Admin only                                                                       |
| Auth Required     | Yes — Admin JWT (`role = 'admin'` required)                                      |

## 2. Input Fields & Constraints

| Field/Param         | Layer    | Type    | Explicit Constraints (from SRS FR-17)                     | Implicit Constraints (Architecture/DB)                                                                                                                        | API Param Name      |
| ------------------- | -------- | ------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `code`              | UI + API | string  | Required; **unique** in the system                        | Likely case-sensitive; DB UNIQUE constraint; max length unknown (typical 50 chars)                                                                            | `code`              |
| `type`              | UI + API | enum    | Required; exactly one of: `"percent"` or `"fixed"`        | Any other value is invalid; stored as VARCHAR/ENUM in DB                                                                                                      | `type`              |
| `discount_value`    | UI + API | number  | Required; must be **positive (> 0)**                      | For `percent`: logical max ≤ 100; for `fixed`: positive float; no explicit upper bound in SRS                                                                 | `discount_value`    |
| `expired_at`        | UI + API | date    | Required; represents coupon expiry date                   | ISO 8601 format `YYYY-MM-DD`; must be parseable as date; no explicit lower bound (past dates allowed per business logic — C2 from FR-09 checks at usage time) | `expired_at`        |
| `min_order_amount`  | UI + API | number  | Required; must be **>= 0** (zero allowed)                 | Non-negative float/integer; 0 means no minimum threshold                                                                                                      | `min_order_amount`  |
| `max_uses_per_user` | UI + API | integer | Required; must be **>= 1**                                | Positive integer; value 0 would mean "never usable" — invalid per SRS; upper bound not stated                                                                 | `max_uses_per_user` |
| `id` (URL param)    | API only | integer | Required for DELETE; must reference an existing coupon ID | Must be a positive integer; non-existent ID → 404                                                                                                             | `:id`               |
| JWT Token (header)  | API      | string  | Required; must be valid; must carry `role = 'admin'`      | Passed via `Authorization: Bearer <token>`; missing → 401; invalid/user-role → 403                                                                            | `Authorization`     |

## 3. Business Rules

- **[BR-01]** The `code` field is required and must not be empty. (per FR-17)
- **[BR-02]** The `code` field must be unique — the system must reject a duplicate coupon code already existing in the database. (per FR-17)
- **[BR-03]** The `type` field is required and must be exactly one of the two enum values: `"percent"` or `"fixed"`. Any other value must be rejected. (per FR-17)
- **[BR-04]** The `discount_value` field is required and must be a positive number (> 0). A value of 0 or any negative number must be rejected. (per FR-17)
- **[BR-05]** The `expired_at` field is required and must be a valid date string. The SRS does not prohibit past dates at creation time — expiry is checked at coupon usage time (FR-09, C2). However, the format must be parseable. (per FR-17, FR-09)
- **[BR-06]** The `min_order_amount` field is required and must be >= 0. A value of 0 is valid (meaning no minimum order threshold). Negative values must be rejected. (per FR-17)
- **[BR-07]** The `max_uses_per_user` field is required and must be >= 1. A value of 0 is invalid — it would make the coupon permanently unusable. (per FR-17)
- **[BR-08]** Only authenticated users with `role = 'admin'` may call the Create (`POST`) and Delete (`DELETE`) coupon admin endpoints. Unauthenticated requests receive HTTP 401; authenticated non-admin users receive HTTP 403. (per FR-12, SEC-02, SEC-03)
- **[BR-09]** The Read (`GET /api/coupons`) endpoint also requires a valid JWT token per the API spec, but it is not listed under `/api/admin/*`. The role requirement should be verified empirically. (per API spec §5.2)
- **[BR-10]** Admin CRUD operations on coupons use the `/api/admin/coupons` path. All `/api/admin/*` endpoints require Admin JWT per FR-12. (per FR-12)
- **[BR-11]** For `type = "percent"`: `discount_amount = total × discount_value / 100`. For `type = "fixed"`: `discount_amount = discount_value`. (per FR-09) — Creation does not compute this; it is relevant to verify that `type` and `discount_value` are stored correctly and applied correctly at checkout.
- **[BR-12]** Deleting a coupon by ID must remove it from the system. Deleting a non-existent coupon ID must return an appropriate error (404 or similar). (per FR-17, implicit)
- **[BR-13]** The Admin Web UI must present the coupon list in a readable table. There is no explicit Edit operation for coupons — only Add and Delete are specified in FR-17. (per FR-17)

## 4. Expected Outputs

### 4.1 Success Path — Create Coupon (`POST /api/admin/coupons`)

- **HTTP:** `200 OK` or `201 Created` + JSON body confirming creation (exact body not specified in API spec; typically `{"message": "Coupon created", "id": <n>}`)
- **UI:** New coupon row appears in the coupon list table on the Admin UI
- **DB:** New record inserted in `coupons` table with all provided field values; `is_active = 1` by default

### 4.2 Success Path — Read Coupons (`GET /api/coupons`)

- **HTTP:** `200 OK` + JSON array of coupon objects (each with: `id`, `code`, `type`, `discount_value`, `min_order_amount`, `expired_at`, `max_uses_per_user`, `is_active`)
- **UI:** Admin UI displays coupon table populated with all coupons from DB

### 4.3 Success Path — Delete Coupon (`DELETE /api/admin/coupons/:id`)

- **HTTP:** `200 OK` + JSON confirmation (e.g., `{"message": "Coupon deleted"}`)
- **UI:** Coupon row disappears from the table after deletion
- **DB:** Record removed from `coupons` table for the given `id`

### 4.4 Failure Paths

- **Missing required field** (`code`, `type`, `discount_value`, `expired_at`, `min_order_amount`, `max_uses_per_user`): HTTP `400 Bad Request` + error description
- **Duplicate `code`**: HTTP `400 Bad Request` + error message indicating code already exists
- **Invalid `type`** (not `"percent"` or `"fixed"`): HTTP `400 Bad Request` + error message
- **`discount_value` <= 0**: HTTP `400 Bad Request` + validation error
- **`min_order_amount` < 0**: HTTP `400 Bad Request` + validation error
- **`max_uses_per_user` < 1**: HTTP `400 Bad Request` + validation error
- **No JWT Token provided**: HTTP `401 Unauthorized` (per SEC-02)
- **Valid JWT but `role ≠ 'admin'`** (user token): HTTP `403 Forbidden` (per SEC-03, FR-12)
- **Delete with non-existent ID**: HTTP `404 Not Found` + error message
- **Invalid `expired_at` format** (unparseable date string): HTTP `400 Bad Request`

## 5. GUI Requirements Applicable (FR-21~24)

This is a **Web Admin UI** feature (not Mobile). Apply HTML/DOM semantics checks.

- **[GUI-01]** The Admin Coupon Management page must have exactly **one `<h1>` tag** describing the page content (e.g., "Quản lý Mã Giảm Giá"). (per FR-21, FR-05)
- **[GUI-02]** All required fields in the Create Coupon form must have a `*` symbol next to their label: `code *`, `type *`, `discount_value *`, `expired_at *`, `min_order_amount *`, `max_uses_per_user *`. (per FR-22)
- **[GUI-03]** The `expired_at` date input field should use `type="date"` for proper date validation. (per FR-22, implicit)
- **[GUI-04]** Error messages on the Create Coupon form must appear **above** the Submit button, not below it. (per FR-22)
- **[GUI-05]** Action buttons: "Add Coupon" / "Submit" button must use **blue** (positive action). "Delete" button must use **red** (destructive action). (per FR-21)
- **[GUI-06]** Currency values (`min_order_amount`, `discount_value` for fixed type) must be displayed with the `₫` symbol and thousand-separator formatting in the coupon list view. (per FR-21)
- **[GUI-07]** Deleting a coupon via the UI **must show a confirmation dialog** before performing the delete action. (per FR-24, FR-07 pattern)
- **[GUI-08]** If no coupons exist, an **empty state** with icon/illustration and a friendly message must be displayed. (per FR-24)
- **[GUI-09]** The Admin navbar must **highlight** the currently active page/section (Coupon Management). (per FR-23)
- **[GUI-10]** The Create Coupon form is a **single-step form** — no Step Indicator is required (Step Indicator is only required for forms with 2+ steps per FR-22).
- **[GUI-11]** The coupon list table must display monetary values using the `₫` symbol consistently. (per FR-21)

## 6. Security Requirements Applicable (SEC-xx)

- **[SEC-02]** All coupon admin endpoints (`POST /api/admin/coupons`, `DELETE /api/admin/coupons/:id`, `GET /api/coupons`) must require a valid JWT token. A request without a token must return HTTP `401 Unauthorized`. (per SEC-02)
- **[SEC-03]** The `POST /api/admin/coupons` and `DELETE /api/admin/coupons/:id` endpoints must verify that the authenticated user has `role = 'admin'`. A request using a regular user token must return HTTP `403 Forbidden`. (per SEC-03, FR-12)
- **[SEC-04]** The coupon `code` value entered by admin is displayed back on the UI (in the coupon list table). It must be rendered safely — escaped, not injected as raw HTML — to prevent stored XSS. (per SEC-04) — Test by entering `<script>alert(1)</script>` as a `code` value.
- **[SEC-05]** All database queries for coupon operations must use parameterized queries (no SQL injection risk from `code`, `type`, or numeric fields). (per SEC-05) — Test by entering SQL injection payloads in the `code` field.

## 7. Notes for Domain Testing

- **Input variables identified:** `code`, `type`, `discount_value`, `expired_at`, `min_order_amount`, `max_uses_per_user`, `id` (for DELETE), `Authorization` header (JWT token / role)
- **Output variables identified:** HTTP status code, JSON response body (message/id), UI state (coupon list update, form error display, confirm dialog), DB state (coupons table: row inserted / row deleted)
- **Boundary candidates:**
  - `discount_value`: lower boundary = 0 (invalid) vs. 1 (valid); upper boundary = unspecified (test very large values)
  - `discount_value` for `percent` type: logical upper boundary at 100 (100% discount) — SRS doesn't state this explicitly; test 100 and 101
  - `min_order_amount`: lower boundary = 0 (valid, just at boundary) vs. -1 (invalid)
  - `max_uses_per_user`: lower boundary = 1 (valid) vs. 0 (invalid)
  - `code` string length: test empty string (invalid) and very long string (potential DB truncation)
  - `expired_at`: boundary at today's date (already-expired vs. future); past date at creation time (allowed per SRS)
- **High-risk areas:**
  - Role-Auth bypass: user-role JWT calling admin coupon endpoints
  - `type` enum validation: what happens with values like `"PERCENT"` (uppercase), `""` (empty), `"discount"` (unknown)
  - `discount_value = 0`: must be rejected but may be silently accepted
  - `max_uses_per_user = 0`: must be rejected (makes coupon unusable) — high risk of bug
  - Duplicate `code`: race condition / DB constraint handling
  - XSS via `code` field displayed in the coupon list
  - Delete non-existent ID: may return 500 instead of 404
  - Missing fields: partial body — which fields are actually validated vs silently defaulted?
- **AI blind spot warnings:**
  - The SRS allows `min_order_amount = 0` (exactly zero is valid) — AI may incorrectly treat 0 as invalid
  - The SRS does NOT specify an upper bound for `discount_value` — for `percent` type, 101% may or may not be rejected; this is a high-risk untested area
  - `max_uses_per_user = 0` is explicitly prohibited (>= 1 required) — AI may miss this boundary
  - `GET /api/coupons` is listed outside `/api/admin/*` but still requires Auth — role requirement is ambiguous; must test all 3 token states
  - No Edit (PUT) operation exists for coupons per FR-17 — do not design test cases for coupon update
  - `is_active` field is referenced in FR-09 (C1) but is NOT listed as an input field in the Create Coupon API — it may be auto-set to `1`; verify this via DB state check
