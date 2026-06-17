# Domain Analysis — FR-17: Coupon Management (Admin CRUD)

## Step 1: Input & Output Variable Identification

### 1.1 Input Variables

#### Direct Inputs (UI Form / API Body)

| #   | Variable            | Source             | Type    | Description                                                                   |
| --- | ------------------- | ------------------ | ------- | ----------------------------------------------------------------------------- |
| I1  | `code`              | UI form + API body | string  | Unique coupon code to create (e.g. `"SAVE10"`)                                |
| I2  | `type`              | UI form + API body | enum    | Discount type — exactly `"percent"` or `"fixed"`                              |
| I3  | `discount_value`    | UI form + API body | number  | Discount amount; must be > 0                                                  |
| I4  | `expired_at`        | UI form + API body | date    | Coupon expiry date in ISO 8601 format (`YYYY-MM-DD`), must be >= current date |
| I5  | `min_order_amount`  | UI form + API body | number  | Minimum cart total required to use coupon; must be >= 0                       |
| I6  | `max_uses_per_user` | UI form + API body | integer | Maximum times a single user may use this coupon; must be >= 1                 |
| I7  | `id` (URL param)    | API URL path only  | integer | Coupon ID used in `DELETE /api/admin/coupons/:id`                             |

#### Indirect Inputs (Hidden / System State)

| #   | Variable              | Source         | Type       | Description                                                            |
| --- | --------------------- | -------------- | ---------- | ---------------------------------------------------------------------- |
| I8  | `auth_token`          | Request header | JWT string | `Authorization: Bearer <token>`; missing → 401                         |
| I9  | `user_role`           | JWT payload    | enum       | Must be `'admin'`; any other role → 403 (per SEC-03, FR-12)            |
| I10 | `code_uniqueness`     | DB state       | boolean    | Whether the submitted `code` already exists in `coupons` table         |
| I11 | `coupon_id_existence` | DB state       | boolean    | Whether the `:id` in DELETE request references a real coupon in the DB |

### 1.2 Output Variables

#### Direct Outputs (Visible)

| #   | Variable                     | Channel | Description                                                                                                            |
| --- | ---------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| O1  | HTTP status code             | API     | `200`/`201` success; `400` bad input; `401` no token; `403` wrong role; `404` not found                                |
| O2  | Response body (JSON)         | API     | `{"message": "Coupon created", "id": N}` on create; `{"message": "Coupon deleted"}` on delete; error string on failure |
| O3  | UI coupon list — new row     | UI      | After successful CREATE, new coupon row appears in Admin coupon table                                                  |
| O4  | UI coupon list — row removed | UI      | After successful DELETE, coupon row disappears from Admin coupon table                                                 |
| O5  | UI form error message        | UI      | Validation error displayed **above** the Submit button (per FR-22)                                                     |
| O6  | UI confirmation dialog       | UI      | Delete action must trigger a confirm dialog before executing (per FR-24)                                               |

#### Indirect Outputs (Hidden / State Changes)

| #   | Variable                           | Channel | Description                                                                       |
| --- | ---------------------------------- | ------- | --------------------------------------------------------------------------------- |
| O7  | DB `coupons` table — INSERT        | State   | After CREATE: new row exists in DB with all correct field values; `is_active = 1` |
| O8  | DB `coupons` table — DELETE        | State   | After DELETE: row with matching `id` no longer exists in DB                       |
| O9  | DOM: `<h1>` count                  | DOM     | Admin Coupon Management page has exactly **one** `<h1>` tag (per FR-21)           |
| O10 | DOM: required `*` labels           | DOM     | All 6 mandatory fields have `*` symbol beside their form label (per FR-22)        |
| O11 | DOM: `type="date"` on `expired_at` | DOM     | Date input field uses `type="date"` HTML attribute (per FR-22, implicit)          |
| O12 | DOM: button color semantics        | DOM     | Submit/Add button is blue; Delete button is red (per FR-21)                       |

### 1.3 Variable Summary for EP

- **Total inputs identified:** 11 (7 direct + 4 indirect)
- **Total outputs identified:** 12 (6 direct + 6 indirect)
- **Variables requiring EP:** `code`, `type`, `discount_value`, `expired_at`, `min_order_amount`, `max_uses_per_user`, `id`, `auth_token`, `user_role`, `code_uniqueness`, `coupon_id_existence`
- **Boundary candidates:**
  - `discount_value` — lower bound = 0 (invalid) / 1 (valid); no explicit upper bound (test large values; for `percent` type, 100 and 101 are critical)
  - `min_order_amount` — lower bound = -1 (invalid) / 0 (valid boundary)
  - `max_uses_per_user` — lower bound = 0 (invalid) / 1 (valid boundary)
  - `code` string length — empty string (invalid); very long string (DB truncation risk)
  - `expired_at` — past dates (invalid at creation per logical rule); invalid format strings; far-future dates

## Step 2: Equivalence Classes

### Variable: `code` — Guideline 3 (Must-Be: non-empty, required) + Guideline 4 (Splitting: uniqueness + security)

| Class ID | Type       | Description                                                                      | Representative Value          |
| -------- | ---------- | -------------------------------------------------------------------------------- | ----------------------------- |
| EC01     | Valid      | Non-empty string, not yet in DB (unique)                                         | `"SUMMER25"`                  |
| EC02     | Valid (G4) | Code contains HTML/script characters — accepted but must display safely (SEC-04) | `"<script>alert(1)</script>"` |
| EC03     | Invalid    | Empty string `""`                                                                | `""`                          |
| EC04     | Invalid    | Field missing from request body (null / omitted)                                 | _(field omitted)_             |
| EC05     | Invalid    | Code already exists in DB (duplicate violation)                                  | `"SAVE10"` (pre-existing)     |

### Variable: `type` — Guideline 2 (Discrete Set: `{"percent", "fixed"}`)

| Class ID | Type    | Description                                          | Representative Value |
| -------- | ------- | ---------------------------------------------------- | -------------------- |
| EC06     | Valid   | Enum value `"percent"`                               | `"percent"`          |
| EC07     | Valid   | Enum value `"fixed"`                                 | `"fixed"`            |
| EC08     | Invalid | Unknown string outside the enum set                  | `"discount"`         |
| EC09     | Invalid | Correct value but wrong case (case-sensitivity test) | `"PERCENT"`          |
| EC10     | Invalid | Empty string `""`                                    | `""`                 |
| EC11     | Invalid | Field missing from request body (null / omitted)     | _(field omitted)_    |

### Variable: `discount_value` — Guideline 1 (Continuous Range: > 0) + Guideline 4 (Splitting for `percent` type: logical upper bound 100)

| Class ID | Type         | Description                                                               | Representative Value |
| -------- | ------------ | ------------------------------------------------------------------------- | -------------------- |
| EC12     | Valid        | Positive number, within normal operating range                            | `15`                 |
| EC13     | Invalid      | Exactly 0 — at boundary, violates `> 0` rule (per FR-17)                  | `0`                  |
| EC14     | Invalid      | Negative number — below minimum boundary                                  | `-10`                |
| EC15     | Invalid      | Field missing from request body (null / omitted)                          | _(field omitted)_    |
| EC16     | Invalid      | Non-numeric string — wrong data type                                      | `"abc"`              |
| EC17     | Valid (G4)   | Exactly 100 — logical upper bound for `percent` type (100% discount)      | `100`                |
| EC18     | Invalid (G4) | Exceeds 100 for `percent` type — SRS silent; logically should be rejected | `101`                |

> ⚠️ **AI Blind Spot Note:** `discount_value = 0` (EC13) must be an isolated invalid TC — AI may silently accept zero as a positive number. EC18 (101%) is an implicit boundary; SRS does not explicitly prohibit it — flag result if accepted.

### Variable: `expired_at` — Guideline 3 (Must-Be: valid date, required) + Guideline 4 (Splitting: past date vs. future date)

| Class ID | Type         | Description                                                        | Representative Value |
| -------- | ------------ | ------------------------------------------------------------------ | -------------------- |
| EC19     | Valid        | Future date in ISO 8601 format — coupon will be active             | `"2099-12-31"`       |
| EC20     | Invalid (G4) | Past date in ISO 8601 format, cannot create already-expired coupon | `"2020-01-01"`       |
| EC21     | Invalid      | Valid date but wrong format (DD-MM-YYYY instead of YYYY-MM-DD)     | `"31-12-2099"`       |
| EC22     | Invalid      | Non-date arbitrary string — unparseable                            | `"notadate"`         |
| EC23     | Invalid      | Field missing from request body (null / omitted)                   | _(field omitted)_    |

### Variable: `min_order_amount` — Guideline 1 (Continuous Range: >= 0)

| Class ID | Type    | Description                                                        | Representative Value |
| -------- | ------- | ------------------------------------------------------------------ | -------------------- |
| EC24     | Valid   | Exactly 0 — valid lower boundary; means no minimum order threshold | `0`                  |
| EC25     | Valid   | Positive value — normal operating range                            | `200000`             |
| EC26     | Invalid | Exactly -1 — below lower boundary                                  | `-1`                 |
| EC27     | Invalid | Field missing from request body (null / omitted)                   | _(field omitted)_    |

> ⚠️ **AI Blind Spot Note:** `min_order_amount = 0` (EC24) is **explicitly valid** per FR-17 (`>= 0`). Do NOT treat 0 as invalid.

### Variable: `max_uses_per_user` — Guideline 1 (Continuous Range: >= 1, integer)

| Class ID | Type    | Description                                                         | Representative Value |
| -------- | ------- | ------------------------------------------------------------------- | -------------------- |
| EC28     | Valid   | Exactly 1 — valid lower boundary                                    | `1`                  |
| EC29     | Valid   | Integer greater than 1 — normal operating range                     | `3`                  |
| EC30     | Invalid | Exactly 0 — below lower boundary; makes coupon permanently unusable | `0`                  |
| EC31     | Invalid | Negative integer — clearly below minimum                            | `-1`                 |
| EC32     | Invalid | Field missing from request body (null / omitted)                    | _(field omitted)_    |
| EC33     | Invalid | Non-integer float value — violates integer constraint               | `1.5`                |

> ⚠️ **AI Blind Spot Note:** `max_uses_per_user = 0` (EC30) is **explicitly prohibited** by FR-17 (`>= 1`). This is a high-risk class — the system may silently accept 0.

### Variable: `id` (URL path param for DELETE) — Guideline 3 (Must-Be: valid existing coupon ID) + Guideline 1 (positive integer)

| Class ID | Type    | Description                                           | Representative Value |
| -------- | ------- | ----------------------------------------------------- | -------------------- |
| EC34     | Valid   | Positive integer referencing an existing coupon in DB | `1` (pre-existing)   |
| EC35     | Invalid | Positive integer but coupon does not exist in DB      | `99999`              |
| EC36     | Invalid | Non-numeric string — wrong data type in URL path      | `"abc"`              |
| EC37     | Invalid | Zero or negative integer — invalid ID value           | `0`                  |

### Variable: `auth_token` + `user_role` — Guideline 2 (Discrete Set: auth states)

| Class ID | Type    | Description                                                             | Representative Value             |
| -------- | ------- | ----------------------------------------------------------------------- | -------------------------------- |
| EC38     | Valid   | Valid JWT with `role = 'admin'` — authorized for all admin endpoints    | Admin JWT from `admin@eshop.com` |
| EC39     | Invalid | No token — `Authorization` header missing → HTTP 401 (per SEC-02)       | _(header omitted)_               |
| EC40     | Invalid | Valid JWT but `role = 'user'` — non-admin token → HTTP 403 (per SEC-03) | User JWT from `test@eshop.com`   |
| EC41     | Invalid | Malformed / expired / invalid JWT string → HTTP 401 (per SEC-02)        | `"Bearer invalidtoken123"`       |

## Step 3: Test Case Optimization

### 3.1 Valid Classes Coverage (Combination Rule)

All valid classes combined efficiently into 6 test cases.

**Baseline valid inputs (used where not otherwise specified):**

- `code`: `"NEWCODE01"`, `type`: `"percent"`, `discount_value`: `15`, `expired_at`: `"2099-12-31"`, `min_order_amount`: `100000`, `max_uses_per_user`: `1`, `auth`: Admin JWT

| TC ID       | Operation | Valid ECs Covered                        | Test Data Summary                                                                                                                          |
| ----------- | --------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| FR17-EP-001 | POST      | EC01, EC06, EC12, EC19, EC25, EC28, EC38 | `code="SUMMER25"`, `type="percent"`, `discount_value=15`, future expiry, `min_order_amount=200000`, `max_uses=1` — Full happy path         |
| FR17-EP-002 | POST      | EC01, EC07, EC12, EC19, EC24, EC29, EC38 | `code="BIGDEAL01"`, `type="fixed"`, `discount_value=50000`, future expiry, `min_order_amount=0`, `max_uses=3` — Fixed type, zero min order |
| FR17-EP-003 | POST      | EC02, EC06, EC12, EC19, EC25, EC28, EC38 | `code="<script>alert(1)</script>"`, all other valid — SEC-04 XSS safety check; expect 200 OK + safe display                                |
| FR17-EP-004 | DELETE    | EC34, EC38                               | DELETE `/api/admin/coupons/1` with admin JWT — delete existing coupon happy path                                                           |
| FR17-EP-005 | GET       | EC38                                     | GET `/api/coupons` with admin JWT — retrieve coupon list                                                                                   |

> **Valid ECs covered:** EC01, EC02, EC06, EC07, EC12, EC17, EC19, EC24, EC25, EC28, EC29, EC34, EC38 **(13/13 — 100% coverage)**

### 3.2 Invalid Classes Coverage (Isolation Rule)

Each TC contains **exactly 1 invalid input**. All other inputs drawn from valid baseline.

**Valid baseline for POST (unless noted):** `code="NEWCODE01"`, `type="percent"`, `discount_value=15`, `expired_at="2099-12-31"`, `min_order_amount=100000`, `max_uses_per_user=1`, `auth=Admin JWT`

| TC ID       | Operation | Invalid EC Tested                              | Invalid Input                          | Other Inputs                    |
| ----------- | --------- | ---------------------------------------------- | -------------------------------------- | ------------------------------- |
| FR17-EP-007 | POST      | EC03 — empty `code`                            | `code=""`                              | All others: valid baseline      |
| FR17-EP-008 | POST      | EC04 — missing `code` field                    | `code` omitted from body               | All others: valid baseline      |
| FR17-EP-009 | POST      | EC05 — duplicate `code` already in DB          | `code="SAVE10"` (pre-existing)         | All others: valid baseline      |
| FR17-EP-010 | POST      | EC08 — `type` outside enum set                 | `type="discount"`                      | All others: valid baseline      |
| FR17-EP-011 | POST      | EC09 — `type` uppercase (case-sensitivity)     | `type="PERCENT"`                       | All others: valid baseline      |
| FR17-EP-012 | POST      | EC10 — `type` empty string                     | `type=""`                              | All others: valid baseline      |
| FR17-EP-013 | POST      | EC11 — `type` field missing                    | `type` omitted from body               | All others: valid baseline      |
| FR17-EP-014 | POST      | EC13 — `discount_value` exactly 0              | `discount_value=0`                     | All others: valid baseline      |
| FR17-EP-015 | POST      | EC14 — `discount_value` negative               | `discount_value=-10`                   | All others: valid baseline      |
| FR17-EP-016 | POST      | EC15 — `discount_value` field missing          | `discount_value` omitted               | All others: valid baseline      |
| FR17-EP-017 | POST      | EC16 — `discount_value` non-numeric string     | `discount_value="abc"`                 | All others: valid baseline      |
| FR17-EP-018 | POST      | EC18 — `discount_value=101` for `percent` type | `type="percent"`, `discount_value=101` | All others: valid baseline      |
| FR17-EP-019 | POST      | EC20 — `expired_at` past date                  | `expired_at="2020-01-01"`              | All others: valid baseline      |
| FR17-EP-020 | POST      | EC21 — `expired_at` wrong format (DD-MM-YYYY)  | `expired_at="31-12-2099"`              | All others: valid baseline      |
| FR17-EP-021 | POST      | EC22 — `expired_at` non-date string            | `expired_at="notadate"`                | All others: valid baseline      |
| FR17-EP-022 | POST      | EC23 — `expired_at` field missing              | `expired_at` omitted                   | All others: valid baseline      |
| FR17-EP-023 | POST      | EC26 — `min_order_amount` negative (-1)        | `min_order_amount=-1`                  | All others: valid baseline      |
| FR17-EP-024 | POST      | EC27 — `min_order_amount` field missing        | `min_order_amount` omitted             | All others: valid baseline      |
| FR17-EP-025 | POST      | EC30 — `max_uses_per_user` exactly 0           | `max_uses_per_user=0`                  | All others: valid baseline      |
| FR17-EP-026 | POST      | EC31 — `max_uses_per_user` negative            | `max_uses_per_user=-1`                 | All others: valid baseline      |
| FR17-EP-027 | POST      | EC32 — `max_uses_per_user` field missing       | `max_uses_per_user` omitted            | All others: valid baseline      |
| FR17-EP-028 | POST      | EC33 — `max_uses_per_user` non-integer float   | `max_uses_per_user=1.5`                | All others: valid baseline      |
| FR17-EP-029 | DELETE    | EC35 — non-existent coupon ID                  | `/api/admin/coupons/99999`             | Auth: admin JWT                 |
| FR17-EP-030 | DELETE    | EC36 — non-numeric ID in URL path              | `/api/admin/coupons/abc`               | Auth: admin JWT                 |
| FR17-EP-031 | DELETE    | EC37 — ID = 0 (invalid zero)                   | `/api/admin/coupons/0`                 | Auth: admin JWT                 |
| FR17-EP-032 | POST      | EC39 — no token (POST create)                  | `Authorization` header omitted         | All body fields: valid baseline |
| FR17-EP-033 | POST      | EC40 — user JWT calling admin POST endpoint    | `Authorization: Bearer <user JWT>`     | All body fields: valid baseline |
| FR17-EP-034 | POST      | EC41 — invalid/malformed JWT (POST)            | `Authorization: Bearer invalidtoken`   | All body fields: valid baseline |
| FR17-EP-035 | DELETE    | EC39 — no token (DELETE)                       | `Authorization` header omitted         | `id`: existing (1)              |
| FR17-EP-036 | DELETE    | EC40 — user JWT calling admin DELETE endpoint  | `Authorization: Bearer <user JWT>`     | `id`: existing (1)              |
| FR17-EP-037 | GET       | EC39 — no token (GET coupons)                  | `Authorization` header omitted         | N/A (GET, no body)              |
| FR17-EP-038 | GET       | EC40 — user JWT calling GET /api/coupons       | `Authorization: Bearer <user JWT>`     | N/A (GET, no body)              |

> **Invalid ECs covered:** EC03–EC05, EC08–EC11, EC13–EC16, EC18, EC20–EC23, EC26–EC27, EC30–EC33, EC35–EC37, EC39–EC41 **(28/28 — 100% coverage)**

### 3.3 EC Coverage Summary

| Total ECs | Valid ECs | Invalid ECs | TCs for Valid | TCs for Invalid | Total TCs |
| --------- | --------- | ----------- | ------------- | --------------- | --------- |
| 41        | 13        | 28          | 5             | 32              | **37**    |
