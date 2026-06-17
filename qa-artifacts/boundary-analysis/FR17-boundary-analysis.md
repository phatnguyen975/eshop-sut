# Boundary Value Analysis — FR-17: Coupon Management (Admin CRUD)

## Boundary Variables Identified

From EP Step 2 and the requirement analysis, the following ordered/numeric variables have boundary constraints and require BVA:

| Variable               | Data Type         | LB           | UB                                      | Increment   | Source           |
| ---------------------- | ----------------- | ------------ | --------------------------------------- | ----------- | ---------------- |
| `discount_value`       | number (float)    | >0 (LB = 1)  | unspecified (semantic: 100 for percent) | 1 (integer) | FR-17            |
| `min_order_amount`     | number (float)    | >=0 (LB = 0) | unspecified                             | 1           | FR-17            |
| `max_uses_per_user`    | integer           | >=1 (LB = 1) | unspecified                             | 1           | FR-17            |
| `expired_at`           | date (YYYY-MM-DD) | >= today     | unspecified                             | 1 day       | Logical BR-05    |
| `code` (string length) | integer (length)  | >=1 (LB = 1) | unspecified                             | 1 char      | FR-17 (implicit) |

> **Variables excluded from BVA:** `type` (discrete enum, no ordering), `id` (not length-constrained, covered by EP), `auth_token`/`user_role` (discrete states, not ordered numeric).

## BVA Table 1: `discount_value` (numeric)

**Constraint:** must be > 0 (per FR-17, BR-04)
**LB = 1 (first valid positive integer; 0 is the exact invalid boundary), UB = unspecified**
**Semantic UB for `type="percent"`: 100 is meaningful; 101 exceeds full discount**

| TC ID        | BVA Point       | Test Value  | Type Param  | Valid/Invalid    | Expected Result                                                             |
| ------------ | --------------- | ----------- | ----------- | ---------------- | --------------------------------------------------------------------------- |
| FR17-BVA-001 | -α (null/empty) | _(omitted)_ | `"percent"` | Invalid          | HTTP 400 — `discount_value` is required (per BR-04, FR-17)                  |
| FR17-BVA-002 | LB-1 (below LB) | `0`         | `"percent"` | Invalid          | HTTP 400 — `discount_value` must be > 0 (per BR-04, FR-17)                  |
| FR17-BVA-003 | LB (exact)      | `1`         | `"percent"` | Valid            | HTTP 200/201 — coupon created successfully (per FR-17)                      |
| FR17-BVA-004 | LB+1            | `2`         | `"percent"` | Valid            | HTTP 200/201 — coupon created successfully (per FR-17)                      |
| FR17-BVA-005 | Nominal         | `50`        | `"percent"` | Valid            | HTTP 200/201 — coupon created successfully (per FR-17)                      |
| FR17-BVA-006 | Semantic UB-1   | `99`        | `"percent"` | Valid            | HTTP 200/201 — coupon created successfully (per FR-17)                      |
| FR17-BVA-007 | Semantic UB     | `100`       | `"percent"` | Valid            | HTTP 200/201 — 100% discount coupon accepted (per FR-17; SRS silent on UB)  |
| FR17-BVA-008 | Semantic UB+1   | `101`       | `"percent"` | Invalid (likely) | HTTP 400 — exceeds 100% for percent type; SRS silent — **flag if accepted** |
| FR17-BVA-009 | +α (very large) | `9999999`   | `"percent"` | Invalid (likely) | HTTP 400 or system error — test DB storage limit (per implicit constraint)  |

> ⚠️ **Note on UB:** The SRS does not state an explicit upper bound for `discount_value`. The semantic boundary at 100 applies only to `type="percent"`. For `type="fixed"`, there is no semantic UB — BVA-007 and BVA-008 use `"percent"` type specifically to probe this semantic boundary. BVA-009 applies to both types.

**All other inputs in BVA-001 through BVA-009 use valid baseline:** `code="BVATEST01"`, `type="percent"` (unless noted), `expired_at="2099-12-31"`, `min_order_amount=100000`, `max_uses_per_user=1`, auth=Admin JWT.

## BVA Table 2: `min_order_amount` (numeric)

**Constraint:** must be >= 0 (per FR-17, BR-06) — zero is explicitly valid
**LB = 0, UB = unspecified**

| TC ID        | BVA Point       | Test Value  | Valid/Invalid  | Expected Result                                                                    |
| ------------ | --------------- | ----------- | -------------- | ---------------------------------------------------------------------------------- |
| FR17-BVA-010 | -α (null/empty) | _(omitted)_ | Invalid        | HTTP 400 — `min_order_amount` is required (per BR-06, FR-17)                       |
| FR17-BVA-011 | LB-1 (below LB) | `-1`        | Invalid        | HTTP 400 — `min_order_amount` must be >= 0 (per BR-06, FR-17)                      |
| FR17-BVA-012 | LB (exact)      | `0`         | Valid          | HTTP 200/201 — zero min order accepted; coupon has no threshold (per BR-06, FR-17) |
| FR17-BVA-013 | LB+1            | `1`         | Valid          | HTTP 200/201 — coupon created successfully (per FR-17)                             |
| FR17-BVA-014 | Nominal         | `100000`    | Valid          | HTTP 200/201 — coupon created successfully (per FR-17)                             |
| FR17-BVA-015 | +α (very large) | `999999999` | Valid (likely) | HTTP 200/201 — test DB storage limit for large monetary value                      |

> ⚠️ **Note on LB:** `min_order_amount = 0` is **explicitly valid** per FR-17 (`>= 0`). This is a high-risk boundary — AI tends to treat 0 as invalid. This TC (BVA-012) must PASS.

**All other inputs use valid baseline:** `code="BVATEST02"`, `type="percent"`, `discount_value=15`, `expired_at="2099-12-31"`, `max_uses_per_user=1`, auth=Admin JWT.

## BVA Table 3: `max_uses_per_user` (integer)

**Constraint:** must be >= 1 (per FR-17, BR-07) — zero is explicitly invalid
**LB = 1, UB = unspecified**

| TC ID        | BVA Point       | Test Value  | Valid/Invalid  | Expected Result                                                                               |
| ------------ | --------------- | ----------- | -------------- | --------------------------------------------------------------------------------------------- |
| FR17-BVA-016 | -α (null/empty) | _(omitted)_ | Invalid        | HTTP 400 — `max_uses_per_user` is required (per BR-07, FR-17)                                 |
| FR17-BVA-017 | LB-1 (below LB) | `0`         | Invalid        | HTTP 400 — `max_uses_per_user` must be >= 1; value 0 makes coupon unusable (per BR-07, FR-17) |
| FR17-BVA-018 | LB (exact)      | `1`         | Valid          | HTTP 200/201 — coupon created; each user may use it exactly once (per BR-07, FR-17)           |
| FR17-BVA-019 | LB+1            | `2`         | Valid          | HTTP 200/201 — coupon created successfully (per FR-17)                                        |
| FR17-BVA-020 | Nominal         | `10`        | Valid          | HTTP 200/201 — coupon created successfully (per FR-17)                                        |
| FR17-BVA-021 | +α (very large) | `9999`      | Valid (likely) | HTTP 200/201 — test DB storage limit for large integer value                                  |

> ⚠️ **Note on LB:** `max_uses_per_user = 0` is **explicitly prohibited** — this is a high-risk class where the system may silently accept 0, making the coupon permanently unusable in practice. BVA-017 is a critical security/correctness test.

**All other inputs use valid baseline:** `code="BVATEST03"`, `type="percent"`, `discount_value=15`, `expired_at="2099-12-31"`, `min_order_amount=100000`, auth=Admin JWT.

## BVA Table 4: `expired_at` (date — boundary at today)

**Constraint:** must be >= today's date at creation time (per logical BR-05)
**LB = today, UB = unspecified (any future date is valid)**

> **Reference date for test cases:** `TODAY` = current system date at execution time (e.g., 2026-06-18). Testers must substitute actual date at execution time.

| TC ID        | BVA Point        | Test Value      | Valid/Invalid  | Expected Result                                                                          |
| ------------ | ---------------- | --------------- | -------------- | ---------------------------------------------------------------------------------------- |
| FR17-BVA-022 | -α (null/empty)  | _(omitted)_     | Invalid        | HTTP 400 — `expired_at` is required (per BR-05, FR-17)                                   |
| FR17-BVA-023 | LB-1 (yesterday) | `TODAY - 1 day` | Invalid        | HTTP 400 — past date is invalid; cannot create already-expired coupon (per BR-05, FR-17) |
| FR17-BVA-024 | LB (today)       | `TODAY`         | Valid          | HTTP 200/201 — coupon expires at end of today; created successfully (per BR-05)          |
| FR17-BVA-025 | LB+1 (tomorrow)  | `TODAY + 1 day` | Valid          | HTTP 200/201 — coupon created with tomorrow's expiry (per FR-17)                         |
| FR17-BVA-026 | Nominal          | `"2027-12-31"`  | Valid          | HTTP 200/201 — standard future expiry date (per FR-17)                                   |
| FR17-BVA-027 | +α (far future)  | `"9999-12-31"`  | Valid (likely) | HTTP 200/201 — test DB storage limit for very far future date                            |

> ⚠️ **Critical execution note:** BVA-023 (LB-1 = yesterday) and BVA-024 (LB = today) **must be computed dynamically at execution time**. Use `date -d "yesterday" +%Y-%m-%d` and `date +%Y-%m-%d` in the test script to get the correct values. Do NOT hardcode dates that will become stale.

**All other inputs use valid baseline:** `code="BVATEST04"`, `type="percent"`, `discount_value=15`, `min_order_amount=100000`, `max_uses_per_user=1`, auth=Admin JWT.

## BVA Table 5: `code` (string length)

**Constraint:** must be non-empty (length >= 1) per FR-17; no explicit upper bound in SRS
**LB = 1 character, UB = unspecified (typical DB VARCHAR limit = 50 or 255 chars)**

| TC ID        | BVA Point       | Test Value   | Length | Valid/Invalid    | Expected Result                                                                  |
| ------------ | --------------- | ------------ | ------ | ---------------- | -------------------------------------------------------------------------------- |
| FR17-BVA-028 | -α (empty)      | `""`         | 0      | Invalid          | HTTP 400 — `code` must not be empty (per BR-01, FR-17)                           |
| FR17-BVA-029 | LB (1 char)     | `"A"`        | 1      | Valid            | HTTP 200/201 — single-char code accepted (per FR-17)                             |
| FR17-BVA-030 | LB+1 (2 chars)  | `"AB"`       | 2      | Valid            | HTTP 200/201 — coupon created successfully (per FR-17)                           |
| FR17-BVA-031 | Nominal         | `"SUMMER25"` | 8      | Valid            | HTTP 200/201 — typical coupon code length (per FR-17)                            |
| FR17-BVA-032 | UB-1 (49 chars) | `"A" × 49`   | 49     | Valid (likely)   | HTTP 200/201 — near typical DB VARCHAR(50) limit                                 |
| FR17-BVA-033 | UB (50 chars)   | `"A" × 50`   | 50     | Valid (likely)   | HTTP 200/201 — at typical DB VARCHAR(50) limit                                   |
| FR17-BVA-034 | UB+1 (51 chars) | `"A" × 51`   | 51     | Invalid (likely) | HTTP 400 or DB truncation — test whether system rejects or silently truncates    |
| FR17-BVA-035 | +α (very long)  | `"A" × 300`  | 300    | Invalid (likely) | HTTP 400 or system error — DB truncation/overflow risk (per implicit constraint) |

> ⚠️ **Note on UB:** The SRS does not state a maximum `code` length. The 50-char boundary is a hypothesis based on typical SQLite VARCHAR conventions. UB-1, UB, UB+1 assume 50 as the likely limit — **flag actual DB schema column length during execution**. If the actual column is VARCHAR(255), adjust UB to 255.

**All other inputs use valid baseline:** `type="percent"`, `discount_value=15`, `expired_at="2099-12-31"`, `min_order_amount=100000`, `max_uses_per_user=1`, auth=Admin JWT.

## BVA Summary

| Variable            | LB    | UB (Semantic/Implicit)   | BVA Points Tested | Valid TCs | Invalid TCs | Total BVA TCs |
| ------------------- | ----- | ------------------------ | ----------------- | --------- | ----------- | ------------- |
| `discount_value`    | 1     | 100 (percent semantic)   | 9                 | 5         | 4           | 9             |
| `min_order_amount`  | 0     | unspecified              | 6                 | 4         | 2           | 6             |
| `max_uses_per_user` | 1     | unspecified              | 6                 | 4         | 2           | 6             |
| `expired_at`        | today | unspecified (far future) | 6                 | 4         | 2           | 6             |
| `code` length       | 1     | unspecified (assumed 50) | 8                 | 5         | 3           | 8             |
| **Total**           |       |                          | **35**            | **22**    | **13**      | **35**        |

### Combined EP + BVA TC Count for FR-17

| Phase     | TCs    |
| --------- | ------ |
| EP TCs    | 38     |
| BVA TCs   | 35     |
| **Total** | **73** |
