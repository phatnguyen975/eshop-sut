# Domain Analysis — FR-17: Coupon Management (Admin CRUD)

## Step 1: Input & Output Variable Identification

### 1.1 Input Variables

#### Direct Inputs (UI Form / API Body)

| #   | Variable            | Source             | Type    | Description                                                   |
| --- | ------------------- | ------------------ | ------- | ------------------------------------------------------------- |
| I1  | `code`              | UI form + API body | string  | Unique coupon code to create (e.g. `"SAVE10"`)                |
| I2  | `type`              | UI form + API body | enum    | Discount type — exactly `"percent"` or `"fixed"`              |
| I3  | `discount_value`    | UI form + API body | number  | Discount amount; must be > 0                                  |
| I4  | `expired_at`        | UI form + API body | date    | Coupon expiry date in ISO 8601 format (`YYYY-MM-DD`)          |
| I5  | `min_order_amount`  | UI form + API body | number  | Minimum cart total required to use coupon; must be >= 0       |
| I6  | `max_uses_per_user` | UI form + API body | integer | Maximum times a single user may use this coupon; must be >= 1 |
| I7  | `id` (URL param)    | API URL path only  | integer | Coupon ID used in `DELETE /api/admin/coupons/:id`             |

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
  - `expired_at` — past dates (valid at creation per SRS); invalid format strings; far-future dates
