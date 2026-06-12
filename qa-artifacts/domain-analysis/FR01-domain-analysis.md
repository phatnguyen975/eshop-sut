# Domain Analysis — FR-01: Account Registration

## Step 1: Input & Output Variable Identification

### 1.1 Input Variables

#### Direct Inputs (UI Form / API Body)

| #   | Variable          | Source             | Type   | Description                                                                               |
| --- | ----------------- | ------------------ | ------ | ----------------------------------------------------------------------------------------- |
| I1  | `name`            | UI form + API body | string | Full name of the registering user; required, non-empty                                    |
| I2  | `email`           | UI form + API body | string | Email address; must be valid format and unique in the system                              |
| I3  | `password`        | UI form + API body | string | Password; min 8 chars; must have uppercase, lowercase, digit, special char from `@$!%*?&` |
| I4  | `confirmPassword` | UI form **only**   | string | Must exactly match `password`; this field is **not sent to the API**                      |

#### Indirect Inputs (Hidden / System State)

| #   | Variable              | Source              | Type    | Description                                                                                                        |
| --- | --------------------- | ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| I5  | `email_uniqueness`    | DB state            | boolean | Whether the provided email already exists in the `users` table; drives BR-03                                       |
| I6  | `password_char_set`   | Input content       | enum    | Whether special chars used are from the allowed set `@$!%*?&` or outside it; drives BR-08 (G4 split)               |
| I7  | `auth_token_presence` | HTTP request header | boolean | Whether an `Authorization: Bearer` token is present; must NOT be required for this public endpoint (BR-12, SEC-02) |

---

### 1.2 Output Variables

#### Direct Outputs (Visible)

| #   | Variable                 | Channel | Description                                                                        |
| --- | ------------------------ | ------- | ---------------------------------------------------------------------------------- |
| O1  | HTTP status code         | API     | `200 OK` on success; `400 Bad Request` or `409 Conflict` on failure                |
| O2  | Response body: `message` | API     | `"User registered successfully"` on success; error description string on failure   |
| O3  | Response body: `id`      | API     | Positive integer — new user ID returned on success; absent on failure              |
| O4  | UI redirect              | UI      | On success, browser navigates to Login page (per BR-10, FR-01)                     |
| O5  | UI error message         | UI      | Validation error text displayed **above the submit button** on failure (per FR-22) |

#### Indirect Outputs (Hidden / State Changes)

| #   | Variable                    | Channel | Description                                                                                                      |
| --- | --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| O6  | DB: new user record         | State   | A new row inserted in the `users` table with `name`, `email`, hashed `password` (per SEC-01)                     |
| O7  | DB: password storage format | State   | `password` field in DB must be a hash (bcrypt), NOT plaintext (per SEC-01, BR-11)                                |
| O8  | DOM: `<h1>` count           | DOM     | Registration page must have **exactly 1** `<h1>` element (per FR-21, GUI-01)                                     |
| O9  | DOM: email input type       | DOM     | Email `<input>` must have `type="email"` attribute (per FR-22, GUI-03)                                           |
| O10 | DOM: password input types   | DOM     | Both password `<input>` fields must have `type="password"` attribute (per FR-22, GUI-04)                         |
| O11 | DOM: required field markers | DOM     | All 4 mandatory fields must display a `*` next to their labels (per FR-22, GUI-02)                               |
| O12 | DOM: error message position | DOM     | Error messages rendered above the submit button, not below (per FR-22, GUI-05)                                   |
| O13 | DOM: submit button color    | DOM     | Submit button must be blue (positive action color) (per FR-21, GUI-07)                                           |
| O14 | XSS safety: `name` display  | UI      | If `name` is echoed back (e.g., profile/welcome), it must be escaped — no raw HTML rendering (per SEC-04, BR-13) |

---

### 1.3 Variable Summary for EP

- **Total inputs identified:** 7 (4 direct + 3 indirect)
- **Total outputs identified:** 14 (5 direct + 9 indirect)
- **Variables requiring EP (input variables for equivalence partitioning):**
  - `name` (I1)
  - `email` (I2)
  - `password` (I3)
  - `confirmPassword` (I4) — UI channel only
  - `email_uniqueness` (I5) — System state variable
  - `password_char_set` (I6) — Hidden enum, G4 split candidate
  - `auth_token_presence` (I7) — SEC-02 test variable
- **Boundary candidates:**
  - `password` **length**: explicit LB = 8 chars; UB = implicit DB/system limit (→ BVA target)
  - `name` **length**: no explicit SRS bound; implicit DB VARCHAR limit (→ BVA candidate)
  - `email` **length**: no explicit SRS bound; implicit DB VARCHAR limit (→ BVA candidate)

---

> **Blind Spot Check (per domain-identifier skill Section 7):**
>
> - ✅ `confirmPassword` captured as I4 (UI-only, not in API body)
> - ✅ `email_uniqueness` captured as I5 (DB state — stateful hidden input)
> - ✅ `password_char_set` captured as I6 (G4 split: in-set vs out-of-set special chars)
> - ✅ `auth_token_presence` captured as I7 (SEC-02: endpoint must be public)
> - ✅ DOM outputs O8–O13 captured for Web UI channel
> - ✅ Password hashing output O7 captured (SEC-01 indirect test)

## Step 2: Equivalence Classes

### Variable: `name` (I1) — Guideline 3 (Must-Be: non-empty) + B1 (empty/null)

| Class ID | Type    | Description                                      | Representative Value          |
| -------- | ------- | ------------------------------------------------ | ----------------------------- |
| EC01     | Valid   | Non-empty string name                            | `"Nguyen Van A"`              |
| EC02     | Invalid | Empty string (B1: required field left blank)     | `""`                          |
| EC03     | Invalid | Null / field omitted from API body (B1: missing) | _(omit `name` key from JSON)_ |

> **Guideline applied:** G3 — binary must-be condition: name must be non-empty. Two classes: satisfies vs. violates. B1 extension adds the null/missing API variant as a separate invalid class.

---

### Variable: `email` (I2) — Guideline 3 (Must-Be: valid format) + Guideline 3 (Must-Be: unique in DB) + B1

| Class ID | Type    | Description                                        | Representative Value                |
| -------- | ------- | -------------------------------------------------- | ----------------------------------- |
| EC04     | Valid   | Valid format AND not yet registered in DB          | `"newuser@test.com"`                |
| EC05     | Invalid | Invalid format — missing `@` symbol                | `"invalidemail"`                    |
| EC06     | Invalid | Invalid format — missing domain after `@`          | `"user@"`                           |
| EC07     | Invalid | Invalid format — missing local part before `@`     | `"@domain.com"`                     |
| EC08     | Invalid | Email already exists in DB (duplicate — per BR-03) | `"test@eshop.com"` _(pre-existing)_ |
| EC09     | Invalid | Empty string (B1: required field left blank)       | `""`                                |
| EC10     | Invalid | Null / field omitted from API body (B1: missing)   | _(omit `email` key from JSON)_      |

> **Guidelines applied:** G3 × 2 — (1) email format must be valid; (2) email must be unique in DB. B1 extension adds empty and null cases. EC05–EC07 cover three structurally distinct invalid format sub-cases (G4 split within the invalid class).

---

### Variable: `password` (I3) — Guideline 1 (Range: length ≥ 8) + Guideline 3 × 4 (Must-Be: char types) + Guideline 4 (Split: special char set)

| Class ID | Type    | Description                                                                  | Representative Value                                       |
| -------- | ------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| EC11     | Valid   | Length ≥ 8; has uppercase, lowercase, digit, and special char from `@$!%*?&` | `"Test@123"`                                               |
| EC12     | Invalid | Length < 8 (G1: below lower bound)                                           | `"Te@1"` _(4 chars — has all char types, isolates length)_ |
| EC13     | Invalid | Missing uppercase letter (G3)                                                | `"test@123"` _(8 chars)_                                   |
| EC14     | Invalid | Missing lowercase letter (G3)                                                | `"TEST@123"` _(8 chars)_                                   |
| EC15     | Invalid | Missing digit (G3)                                                           | `"Test@abc"` _(8 chars)_                                   |
| EC16     | Invalid | Missing any special character (G3)                                           | `"Test1234"` _(8 chars)_                                   |
| EC17     | Invalid | Special character present but OUTSIDE allowed set `@$!%*?&` (G4)             | `"Test#123"` _(`#` not in set)_                            |
| EC18     | Invalid | Empty string (B1: required field left blank)                                 | `""`                                                       |
| EC19     | Invalid | Null / field omitted from API body (B1: missing)                             | _(omit `password` key from JSON)_                          |

> **Guidelines applied:** G1 for length range (≥ 8); G3 × 4 for each mandatory character category; G4 split to distinguish "no special char" (EC16) from "special char outside allowed set" (EC17). B1 adds empty and null. Representatives are designed to isolate exactly one violation each.

---

### Variable: `confirmPassword` (I4) — Guideline 3 (Must-Be: matches `password`) + B1 — **UI channel only**

| Class ID | Type    | Description                                            | Representative Value              |
| -------- | ------- | ------------------------------------------------------ | --------------------------------- |
| EC20     | Valid   | Matches `password` field exactly                       | Same value as EC11 (`"Test@123"`) |
| EC21     | Invalid | Does not match `password` field (mismatch — per BR-09) | `"DifferentPass@1"`               |
| EC22     | Invalid | Empty confirmPassword (B1: required field left blank)  | `""`                              |

> **Guideline applied:** G3 — binary must-be: confirmPassword must equal password. B1 adds empty case. **UI-only variable — no corresponding API class.**

---

### Variable: `auth_token_presence` (I7) — Guideline 3 (Must-Be: public endpoint, no JWT required — SEC-02)

| Class ID | Type  | Description                                                      | Representative Value          |
| -------- | ----- | ---------------------------------------------------------------- | ----------------------------- |
| EC23     | Valid | No `Authorization` header — anonymous request to public endpoint | _(omit Authorization header)_ |

> **Guideline applied:** G3 — SEC-02 compliance: `POST /api/register` must be accessible without a JWT. The valid class is "no token present → HTTP 200".

> **Note on I5 (`email_uniqueness`) and I6 (`password_char_set`):** These indirect variables are folded into the EP classes of their parent variables — I5 → EC08 (duplicate email), I6 → EC17 (out-of-set special char). They do not require separate EP tables.

---

### EP Class Summary

| Variable               | Guideline(s)        | Valid ECs | Invalid ECs | Total ECs |
| ---------------------- | ------------------- | --------- | ----------- | --------- |
| `name` (I1)            | G3 + B1             | EC01      | EC02, EC03  | 3         |
| `email` (I2)           | G3 × 2 + B1         | EC04      | EC05–EC10   | 7         |
| `password` (I3)        | G1 + G3×4 + G4 + B1 | EC11      | EC12–EC19   | 9         |
| `confirmPassword` (I4) | G3 + B1             | EC20      | EC21, EC22  | 3         |
| `auth_token` (I7)      | G3                  | EC23      | —           | 1         |
| **TOTAL**              |                     | **5**     | **18**      | **23**    |

## Step 3: Test Case Optimization

### 3.1 Valid Classes Coverage (Combination Rule)

All 5 valid classes (EC01, EC04, EC11, EC20, EC23) combined into one single happy-path TC:

| TC ID       | Valid ECs Combined               | Test Data Summary                                                                                                      | Channel  |
| ----------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| FR01-EP-001 | EC01 + EC04 + EC11 + EC20 + EC23 | name=`"Nguyen Van A"`, email=`"newuser@test.com"`, password=`"Test@123"`, confirmPassword=`"Test@123"`, no auth header | UI + API |

---

### 3.2 Invalid Classes Coverage (Isolation Rule)

Each TC isolates **exactly ONE** invalid class. All other inputs are drawn from valid classes (EC01, EC04, EC11, EC20, EC23).

**`name` invalid classes:**

| TC ID       | Invalid EC Tested                      | Other Inputs (all valid)                             | Channel  |
| ----------- | -------------------------------------- | ---------------------------------------------------- | -------- |
| FR01-EP-002 | EC02 — empty `name` (`""`)             | email=valid, password=valid, confirm=valid, no token | UI + API |
| FR01-EP-003 | EC03 — null/missing `name` in API body | email=valid, password=valid _(no confirm in API)_    | API      |

**`email` invalid classes:**

| TC ID       | Invalid EC Tested                                      | Other Inputs (all valid)                            | Channel  |
| ----------- | ------------------------------------------------------ | --------------------------------------------------- | -------- |
| FR01-EP-004 | EC05 — invalid email: no `@` (`"invalidemail"`)        | name=valid, password=valid, confirm=valid, no token | UI + API |
| FR01-EP-005 | EC06 — invalid email: no domain (`"user@"`)            | name=valid, password=valid, confirm=valid, no token | UI + API |
| FR01-EP-006 | EC07 — invalid email: no local part (`"@domain.com"`)  | name=valid, password=valid, confirm=valid, no token | UI + API |
| FR01-EP-007 | EC08 — email already exists in DB (`"test@eshop.com"`) | name=valid, password=valid, confirm=valid, no token | UI + API |
| FR01-EP-008 | EC09 — empty email (`""`)                              | name=valid, password=valid, confirm=valid, no token | UI + API |
| FR01-EP-009 | EC10 — null/missing `email` in API body                | name=valid, password=valid _(no confirm in API)_    | API      |

**`password` invalid classes:**

| TC ID       | Invalid EC Tested                                      | Other Inputs (all valid)                                            | Channel  |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------------- | -------- |
| FR01-EP-010 | EC12 — password < 8 chars (`"Te@1"`, 4 chars)          | name=valid, email=valid, confirm=mirrors invalid password, no token | UI + API |
| FR01-EP-011 | EC13 — missing uppercase (`"test@123"`)                | name=valid, email=valid, confirm=mirrors invalid password, no token | UI + API |
| FR01-EP-012 | EC14 — missing lowercase (`"TEST@123"`)                | name=valid, email=valid, confirm=mirrors invalid password, no token | UI + API |
| FR01-EP-013 | EC15 — missing digit (`"Test@abc"`)                    | name=valid, email=valid, confirm=mirrors invalid password, no token | UI + API |
| FR01-EP-014 | EC16 — missing special char entirely (`"Test1234"`)    | name=valid, email=valid, confirm=mirrors invalid password, no token | UI + API |
| FR01-EP-015 | EC17 — special char outside allowed set (`"Test#123"`) | name=valid, email=valid, confirm=mirrors invalid password, no token | UI + API |
| FR01-EP-016 | EC18 — empty password (`""`)                           | name=valid, email=valid, confirm=mirrors invalid password, no token | UI + API |
| FR01-EP-017 | EC19 — null/missing `password` in API body             | name=valid, email=valid _(no confirm in API)_                       | API      |

> **Note on FR01-EP-010 to FR01-EP-016:** `confirmPassword` mirrors the invalid password value to avoid triggering a second invalid class (mismatch). The only invalid condition under test is the password rule itself.

**`confirmPassword` invalid classes (UI only):**

| TC ID       | Invalid EC Tested                                       | Other Inputs (all valid)                                 | Channel |
| ----------- | ------------------------------------------------------- | -------------------------------------------------------- | ------- |
| FR01-EP-018 | EC21 — confirmPassword ≠ password (`"DifferentPass@1"`) | name=valid, email=valid, password=`"Test@123"`, no token | UI      |
| FR01-EP-019 | EC22 — empty confirmPassword (`""`)                     | name=valid, email=valid, password=`"Test@123"`, no token | UI      |

---

### 3.3 EC Coverage Summary

| Total ECs | Valid ECs | Invalid ECs | TCs for Valid | TCs for Invalid | Total TCs |
| --------- | --------- | ----------- | ------------- | --------------- | --------- |
| 23        | 5         | 18          | 1             | 18              | **19**    |
