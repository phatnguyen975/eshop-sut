---
name: boundary-value-analysis
description: >
  Perform Step 4 of Domain Testing: apply the 9-point BVA strategy to all
  ordered/numeric variables. BVA runs after EP (Steps 2+3) and produces a
  separate set of BVA test cases that complement the EP test cases.
trigger:
  - "apply BVA"
  - "boundary value analysis"
  - "step 4 domain testing"
  - "boundary testing"
output: qa-artifacts/boundary-analysis/FR{nn}-boundary-analysis.md
---

# Skill: boundary-value-analysis

## 1. Purpose

Perform **Step 4** of the 4-step Domain Testing framework: identify and test all boundary points for ordered variables. BVA supplements EP by targeting exact boundary values — where off-by-one errors most commonly occur.

## 2. Input Required

- Approved output of `equivalence-partitioning` (EC list)
- **Reference file:** `.agents/context/theory-domain-testing.md` (Section 4)

## 3. Core Theory — 9-Point BVA Strategy

> **Source:** `theory-domain-testing.md` Section 4.3

For every ordered/numeric variable with a Lower Boundary (LB) and Upper Boundary (UB):

```
-α ── LB-1 ── LB ── LB+1 ── Nominal ── UB-1 ── UB ── UB+1 ── +α
```

| Point     | Description                                         | Valid/Invalid |
| --------- | --------------------------------------------------- | ------------- |
| `-α`      | Absolute system minimum (empty, null, 0)            | Invalid       |
| `LB-1`    | One unit below LB                                   | Invalid       |
| `LB`      | Exact lower boundary (minimum valid)                | Valid         |
| `LB+1`    | One unit above LB (safely inside)                   | Valid         |
| `Nominal` | Center value of valid range                         | Valid         |
| `UB-1`    | One unit below UB (safely inside)                   | Valid         |
| `UB`      | Exact upper boundary (maximum valid)                | Valid         |
| `UB+1`    | One unit above UB                                   | Invalid       |
| `+α`      | Absolute system maximum (max int, very long string) | Invalid       |

> **Smallest increment by data type:**
>
> - Integer: 1
> - String length: 1 character (add or remove 1 char)
> - Date: 1 day
> - Float: smallest representable unit

## 4. Step-by-Step Instructions

### Step A — Identify Boundary Variables

From the EP output, filter all variables with ordered constraints. You must also check the "Implicit Constraints" column from the requirement analysis to identify physical boundaries (e.g., DB string limits, max integer limits).

- Numeric ranges (price > 0, quantity >= 1, discount_value > 0)
- String length (password >= 8 chars, name <= 255 chars)
- Date constraints (expired_at must be in the future)
- Counter/usage limits (max_uses_per_user >= 1)
- Array/list sizes (if max items constraint exists)

For each variable: identify LB and UB. If UB is not specified in the SRS, note "unspecified — test with large value."

### Step B — Apply 9-Point Strategy to Each Variable

**B1. Determine the smallest increment:**

- Integer count → increment = 1
- String length → increment = 1 character (add/remove 1 char)
- Date → increment = 1 day

**B2. Generate test points per variable:**

```markdown
### Variable: `password` (string length)

- Constraint: length >= 8 (per FR-01)
- LB = 8, UB = unspecified (test +α = 300 chars)

| Point   | Value                   | Length | Valid/Invalid    | Test Data                  |
| ------- | ----------------------- | ------ | ---------------- | -------------------------- |
| -α      | empty string            | 0      | Invalid          | `""`                       |
| LB-1    | 7 chars                 | 7      | Invalid          | `Test@12`                  |
| LB      | 8 chars (exact minimum) | 8      | Valid            | `Test@123`                 |
| LB+1    | 9 chars                 | 9      | Valid            | `Test@1234`                |
| Nominal | ~14 chars               | 14     | Valid            | `TestPassword1!`           |
| UB-1    | N/A (no UB spec)        | —      | —                | —                          |
| UB      | N/A (no UB spec)        | —      | —                | —                          |
| UB+1    | N/A (no UB spec)        | —      | —                | —                          |
| +α      | 300 chars               | 300    | Invalid (likely) | `"A".repeat(295) + "@1aB"` |
```

**B3. Handle N/A points:** If UB is not defined, mark UB-1, UB, UB+1 as N/A and include only the +α test.

### Step C — BVA for String Length (Important)

> "A common mistake junior testers make is assuming BVA only applies to numbers." — `theory-domain-testing.md` Section 4.4

Apply BVA to string fields with length constraints:

| Field        | LB      | UB          | Test Points                 |
| ------------ | ------- | ----------- | --------------------------- |
| password     | 8 chars | unspecified | 0, 7, 8, 9, ~14, 300        |
| product name | 1 char  | 255 chars   | 0, 1, 2, 127, 254, 255, 256 |
| coupon code  | 1 char  | unspecified | 0 (empty), 1, 2, ~8         |

### Step D — BVA for Numeric Fields

| Field             | LB      | UB          | Test Points                            |
| ----------------- | ------- | ----------- | -------------------------------------- |
| quantity (cart)   | 1       | unspecified | 0, 1, 2, ~5, 999, 9999                 |
| discount_value    | 1 (>0)  | unspecified | 0, 1, 2, 50, 100, 101 (semantic for %) |
| min_order_amount  | 0 (>=0) | unspecified | -1, 0, 1, 100000                       |
| max_uses_per_user | 1 (>=1) | unspecified | 0, 1, 2, 99                            |

### Step E — BVA for Date Fields

| Field               | Constraint                | Boundary                |
| ------------------- | ------------------------- | ----------------------- |
| expired_at (coupon) | Must be in the future     | today-1, today, today+1 |
| OTP expiry          | System-defined (implicit) | Verify via behavior     |

### Step F — Map BVA Points to TC IDs

Each BVA point → 1 separate TC with ID `FR{nn}-BVA-{nnn}`

**Critical Rule:** Each BVA TC tests only 1 boundary point at a time.
All other inputs must be VALID (same as the Isolation Rule for invalid EP classes).

## 5. Output Format

> **CRITICAL RULE:** All generated content MUST be strictly in English.

File `qa-artifacts/boundary-analysis/FR{nn}-boundary-analysis.md`:

```markdown
# Boundary Value Analysis — FR-{nn}: {Feature Name}

## Boundary Variables Identified

| Variable          | Data Type        | LB  | UB          | Increment | Note      |
| ----------------- | ---------------- | --- | ----------- | --------- | --------- |
| `password` length | integer (string) | 8   | unspecified | 1 char    | Per FR-01 |
| `quantity`        | integer          | 1   | unspecified | 1         | Per FR-07 |

## BVA Table: `password` (string length)

**Constraint:** length >= 8 characters (per FR-01)
**LB = 8, UB = unspecified**

| TC ID        | BVA Point      | Test Value          | Length | Valid/Invalid    | Expected Result           |
| ------------ | -------------- | ------------------- | ------ | ---------------- | ------------------------- |
| FR01-BVA-001 | -α (empty)     | `""`                | 0      | Invalid          | Reject: password required |
| FR01-BVA-002 | LB-1           | `Test@12`           | 7      | Invalid          | Reject: too short         |
| FR01-BVA-003 | LB (exact)     | `Test@123`          | 8      | Valid            | Accept                    |
| FR01-BVA-004 | LB+1           | `Test@1234`         | 9      | Valid            | Accept                    |
| FR01-BVA-005 | Nominal        | `TestPassword1!`    | 15     | Valid            | Accept                    |
| FR01-BVA-006 | +α (very long) | `{300-char string}` | 300    | Invalid (likely) | Reject or system error    |

## BVA Summary

| Variable          | Total BVA Points | Valid Points | Invalid Points | BVA TCs Generated |
| ----------------- | ---------------- | ------------ | -------------- | ----------------- |
| `password` length | 6                | 3            | 3              | 6                 |
| `quantity`        | 7                | 4            | 3              | 7                 |
| **Total**         |                  |              |                | {n}               |
```

## 6. Quality Checklist

- [ ] All generated content is completely in English
- [ ] All ordered/numeric variables identified (including string lengths)
- [ ] Implicit architectural constraints were reviewed to define absolute boundaries (+α / -α)
- [ ] BVA applied to string length fields (not only numbers)
- [ ] BVA applied to date fields where applicable
- [ ] Each BVA TC tests only 1 boundary point
- [ ] All other inputs in BVA TCs are VALID
- [ ] LB and UB clearly noted (if UB unspecified, state so)
- [ ] +α test case included (test with very large value)
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk

## 7. EShop-Specific BVA Patterns

### FR-01 (Register):

- `password` length: {0, 7, 8, 9, ~15, 300 chars}
- `name` length: {0 (empty), 1, 2, ~20, 254, 255, 256 chars} — 255 is typical DB VARCHAR limit

### FR-07 (Cart):

- `quantity`: {0, 1, 2, ~5, 999, 9999} — SRS does not define UB; test to find it
- Cart total with 0 items (empty cart boundary)

### FR-17 (Coupon CRUD):

- `discount_value`: {0, 1, 2, 50, 99, 100, 101} — 100 is a semantic boundary for percent type
- `min_order_amount`: {-1, 0, 1, 100000}
- `max_uses_per_user`: {0, 1, 2, 10}
- `expired_at`: {today-1, today, today+1}

### FR-03 (Forgot PW):

- `newPassword` length: {0, 7, 8, 9, ~15, 300 chars} — same pattern as FR-01
- `resetToken` format: 5 digits, 6 digits (correct), 7 digits — length boundary test
