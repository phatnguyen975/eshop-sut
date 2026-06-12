# Boundary Value Analysis — FR-01: Account Registration

## Boundary Variables Identified

| Variable          | Data Type               | LB                                           | UB                                           | Increment | Note                                  |
| ----------------- | ----------------------- | -------------------------------------------- | -------------------------------------------- | --------- | ------------------------------------- |
| `password` length | integer (string length) | 8 chars (explicit, per FR-01)                | Unspecified in SRS                           | 1 char    | Must also satisfy all char-type rules |
| `name` length     | integer (string length) | 1 char (implicit: non-empty, per FR-01)      | Unspecified in SRS (assumed DB VARCHAR ~255) | 1 char    | SRS only states "non-empty"           |
| `email` length    | integer (string length) | Implicit (~5 chars for minimum valid format) | Unspecified in SRS (assumed DB VARCHAR ~255) | 1 char    | SRS specifies format, not length      |

> **Note on UB:** For all 3 variables, no explicit upper bound is stated in the SRS. The value 255 is used as the assumed architectural boundary (typical SQLite/MySQL VARCHAR default). UB-1/UB/UB+1 points are tested against this assumed value, and the +α point tests the system beyond any reasonable limit.

---

## BVA Table 1: `password` (string length)

**Constraint:** length ≥ 8 characters (per FR-01, BR-04)
**LB = 8 | UB = unspecified | +α = 300 chars**

> **Isolation:** All other inputs are valid in each TC (name=`"Nguyen Van A"`, unique email, `confirmPassword` mirrors password value, no auth token).

| TC ID        | BVA Point          | Test Value                                         | Length | Valid/Invalid    | Expected Result                                                           |
| ------------ | ------------------ | -------------------------------------------------- | ------ | ---------------- | ------------------------------------------------------------------------- |
| FR01-BVA-001 | −α (absolute min)  | `""`                                               | 0      | Invalid          | Reject — HTTP 400: password is required (per BR-04, BR-11)                |
| FR01-BVA-002 | LB−1               | `"Te@1aBc"` _(all char types, 7 chars)_            | 7      | Invalid          | Reject — HTTP 400: password must be at least 8 characters (per FR-01)     |
| FR01-BVA-003 | LB (exact minimum) | `"Test@123"` _(all char types, 8 chars)_           | 8      | **Valid**        | Accept — HTTP 200: `{"message": "User registered successfully", "id": N}` |
| FR01-BVA-004 | LB+1               | `"Test@1234"` _(9 chars)_                          | 9      | **Valid**        | Accept — HTTP 200 (per FR-01)                                             |
| FR01-BVA-005 | Nominal            | `"TestPassword1!"` _(15 chars)_                    | 15     | **Valid**        | Accept — HTTP 200 (per FR-01)                                             |
| FR01-BVA-006 | +α (very long)     | `"Aa1@" + "A"×296` _(300 chars, meets char rules)_ | 300    | Invalid (likely) | Reject — HTTP 400 or 500 (implicit DB/system limit exceeded)              |

> **Note on FR01-BVA-003, 004, 005:** These are success cases — each must use a **unique email** not previously registered in the DB (e.g., `bva003@test.com`, `bva004@test.com`, `bva005@test.com`). Clean up after execution (delete test user via Admin API or DB).

---

## BVA Table 2: `name` (string length)

**Constraint:** length ≥ 1 (non-empty, per FR-01, BR-01) | UB = unspecified in SRS (assumed DB VARCHAR = 255)
**LB = 1 | UB = 255 (assumed) | +α = 500 chars**

> **Note:** Since LB = 1, the LB−1 point (0 chars) is identical to the −α point (empty string). Both are merged into FR01-BVA-007.
> **Isolation:** All other inputs valid (unique email per TC, password=`"Test@123"`, confirmPassword=`"Test@123"`, no auth token).

| TC ID        | BVA Point                | Test Value       | Length | Valid/Invalid    | Expected Result                                                         |
| ------------ | ------------------------ | ---------------- | ------ | ---------------- | ----------------------------------------------------------------------- |
| FR01-BVA-007 | −α / LB−1 (empty)        | `""`             | 0      | Invalid          | Reject — HTTP 400: name is required (per FR-01, BR-01)                  |
| FR01-BVA-008 | LB (exact minimum)       | `"A"`            | 1      | **Valid**        | Accept — HTTP 200 (per FR-01)                                           |
| FR01-BVA-009 | LB+1                     | `"AB"`           | 2      | **Valid**        | Accept — HTTP 200 (per FR-01)                                           |
| FR01-BVA-010 | Nominal                  | `"Nguyen Van A"` | 12     | **Valid**        | Accept — HTTP 200 (per FR-01)                                           |
| FR01-BVA-011 | UB−1 (assumed 254 chars) | `"A"×254`        | 254    | **Valid**        | Accept — HTTP 200 (within assumed DB VARCHAR limit)                     |
| FR01-BVA-012 | UB (assumed 255 chars)   | `"A"×255`        | 255    | **Valid**        | Accept — HTTP 200 (at assumed DB VARCHAR limit)                         |
| FR01-BVA-013 | UB+1 (assumed 256 chars) | `"A"×256`        | 256    | Invalid (likely) | Reject or truncate — behavior depends on DB schema (not defined in SRS) |
| FR01-BVA-014 | +α (very long)           | `"A"×500`        | 500    | Invalid (likely) | Reject or server error — exceeds any reasonable DB limit                |

---

## BVA Table 3: `email` (string length)

**Constraint:** LB = implicit (minimum valid format ~5 chars e.g. `a@b.c`) | UB = unspecified in SRS (assumed DB VARCHAR = 255)
**+α = 300 chars**

> **Note:** The SRS specifies email **format** validity, not explicit length constraints. This BVA table targets **architectural** boundaries only. LB boundary points are omitted since format validity already governs the minimum (covered in EP). UB tests focus on the assumed DB VARCHAR limit.
> **Isolation:** All other inputs valid (name=`"Nguyen Van A"`, unique email per TC, password=`"Test@123"`, confirmPassword=`"Test@123"`, no auth token).
> **Test email construction:** `"a"×(n−9) + "@test.com"` produces a valid-format email of exactly n characters.

| TC ID        | BVA Point                | Test Value                            | Length | Valid/Invalid    | Expected Result                                    |
| ------------ | ------------------------ | ------------------------------------- | ------ | ---------------- | -------------------------------------------------- |
| FR01-BVA-015 | Nominal                  | `"newuser@test.com"`                  | 16     | **Valid**        | Accept — HTTP 200 (per FR-01)                      |
| FR01-BVA-016 | UB (assumed 255 chars)   | `"a"×246 + "@test.com"` _(255 chars)_ | 255    | **Valid**        | Accept — HTTP 200 (at assumed DB VARCHAR limit)    |
| FR01-BVA-017 | UB+1 (assumed 256 chars) | `"a"×247 + "@test.com"` _(256 chars)_ | 256    | Invalid (likely) | Reject or truncate — behavior depends on DB schema |
| FR01-BVA-018 | +α (very long)           | `"a"×291 + "@test.com"` _(300 chars)_ | 300    | Invalid (likely) | Reject or server error                             |

---

## BVA Summary

| Variable          | LB       | UB (assumed)  | BVA Points Generated                           | Valid TCs | Invalid TCs | Total BVA TCs |
| ----------------- | -------- | ------------- | ---------------------------------------------- | --------- | ----------- | ------------- |
| `password` length | 8        | unspecified   | −α, LB−1, LB, LB+1, Nominal, +α                | 3         | 3           | 6             |
| `name` length     | 1        | 255 (assumed) | −α/LB−1, LB, LB+1, Nominal, UB−1, UB, UB+1, +α | 5         | 3           | 8             |
| `email` length    | implicit | 255 (assumed) | Nominal, UB, UB+1, +α                          | 2         | 2           | 4             |
| **Total**         |          |               |                                                | **10**    | **8**       | **18**        |

---

> **Combined TC count for FR-01:**
>
> - EP test cases: 19 (FR01-EP-001 to FR01-EP-019)
> - BVA test cases: 18 (FR01-BVA-001 to FR01-BVA-018)
> - **Grand total: 37 test cases**
