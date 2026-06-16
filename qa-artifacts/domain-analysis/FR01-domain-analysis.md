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

| Class ID | Type    | Description                                                                                                   | Representative Value          |
| -------- | ------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| EC01     | Valid   | Non-empty string name                                                                                         | `"Nguyen Van A"`              |
| EC02     | Invalid | Empty string (B1: required field left blank)                                                                  | `""`                          |
| EC03     | Invalid | Null / field omitted from API body (B1: missing)                                                              | _(omit `name` key from JSON)_ |
| EC24     | Valid   | Name containing HTML/XSS injection payload — tests escaped rendering on UI, not rejection (G4 split — SEC-04) | `"<script>alert(1)</script>"` |

> **Guideline applied:** G3 — binary must-be condition: name must be non-empty. B1 extension adds empty and null cases. G4 split adds EC24: a valid name containing HTML/script tags verifies the system accepts the input but renders it safely on UI (per SEC-04, O14). Rejection is NOT expected — safe display is the pass criterion.

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

### Variable: `confirmPassword` (I4) — Guideline 3 (Must-Be: matches `password`) + B1 — **UI channel only**

| Class ID | Type    | Description                                            | Representative Value              |
| -------- | ------- | ------------------------------------------------------ | --------------------------------- |
| EC20     | Valid   | Matches `password` field exactly                       | Same value as EC11 (`"Test@123"`) |
| EC21     | Invalid | Does not match `password` field (mismatch — per BR-09) | `"DifferentPass@1"`               |
| EC22     | Invalid | Empty confirmPassword (B1: required field left blank)  | `""`                              |

> **Guideline applied:** G3 — binary must-be: confirmPassword must equal password. B1 adds empty case. **UI-only variable — no corresponding API class.**

### Variable: `auth_token_presence` (I7) — Guideline 3 (Must-Be: public endpoint, no JWT required — SEC-02)

| Class ID | Type  | Description                                                      | Representative Value          |
| -------- | ----- | ---------------------------------------------------------------- | ----------------------------- |
| EC23     | Valid | No `Authorization` header — anonymous request to public endpoint | _(omit Authorization header)_ |

> **Guideline applied:** G3 — SEC-02 compliance: `POST /api/register` must be accessible without a JWT. The valid class is "no token present → HTTP 200".

> **Note on I5 (`email_uniqueness`) and I6 (`password_char_set`):** These indirect variables are folded into the EP classes of their parent variables — I5 → EC08 (duplicate email), I6 → EC17 (out-of-set special char). They do not require separate EP tables.

### EP Class Summary

| Variable               | Guideline(s)          | Valid ECs  | Invalid ECs | Total ECs |
| ---------------------- | --------------------- | ---------- | ----------- | --------- |
| `name` (I1)            | G3 + B1 + G4 (SEC-04) | EC01, EC24 | EC02, EC03  | 4         |
| `email` (I2)           | G3 × 2 + B1           | EC04       | EC05–EC10   | 7         |
| `password` (I3)        | G1 + G3×4 + G4 + B1   | EC11       | EC12–EC19   | 9         |
| `confirmPassword` (I4) | G3 + B1               | EC20       | EC21, EC22  | 3         |
| `auth_token` (I7)      | G3                    | EC23       | —           | 1         |
| **TOTAL**              |                       | **6**      | **18**      | **24**    |

## Step 3: Test Case Optimization

### 3.1 Valid Classes Coverage (Combination Rule)

Core valid classes (EC01, EC04, EC11, EC20, EC23) combined into one single happy-path TC. EC24 (XSS security) is tested separately as FR01-EP-020 due to its distinct output verification requirement.

| TC ID       | Valid ECs Combined               | Test Data Summary                                                                                                      | Channel  |
| ----------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| FR01-EP-001 | EC01 + EC04 + EC11 + EC20 + EC23 | name=`"Nguyen Van A"`, email=`"newuser@test.com"`, password=`"Test@123"`, confirmPassword=`"Test@123"`, no auth header | UI + API |

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

**`name` security class (EC24 — UI + DOM channel):**

| TC ID       | EC Tested                                                      | Other Inputs (all valid)                                           | Channel  |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------------------ | -------- |
| FR01-EP-020 | EC24 — `name` with XSS payload (`"<script>alert(1)</script>"`) | email=valid, password=`"Test@123"`, confirm=`"Test@123"`, no token | UI + DOM |

> **Expected result for FR01-EP-020:** HTTP 200 — system accepts registration. On UI, the name is displayed as escaped text; no script executes in the browser. Verify via DevTools DOM inspection: confirm name rendered as `&lt;script&gt;alert(1)&lt;/script&gt;` (per SEC-04, O14).

### 3.3 EC Coverage Summary

| Total ECs | Valid ECs | Invalid ECs | TCs for Valid | TCs for Invalid | Security TCs | Total TCs |
| --------- | --------- | ----------- | ------------- | --------------- | ------------ | --------- |
| 24        | 6         | 18          | 1             | 18              | 1            | **20**    |

## Step 5: Domain Coverage Review & AI Gap Analysis

### 5.1 EP Guidelines Compliance

| Variable               | Guideline(s) Applied         | Valid ECs      | Invalid ECs | Verdict |
| ---------------------- | ---------------------------- | -------------- | ----------- | ------- |
| `name` (I1)            | G3 + B1 + G4 (SEC-04)        | 2 (EC01, EC24) | 2 (EC02–03) | ✅ PASS |
| `email` (I2)           | G3 × 2 + G4 (sub-split) + B1 | 1 (EC04)       | 6 (EC05–10) | ✅ PASS |
| `password` (I3)        | G1 + G3 × 4 + G4 + B1        | 1 (EC11)       | 8 (EC12–19) | ✅ PASS |
| `confirmPassword` (I4) | G3 + B1 (UI only)            | 1 (EC20)       | 2 (EC21–22) | ✅ PASS |
| `auth_token` (I7)      | G3 (SEC-02)                  | 1 (EC23)       | 0           | ✅ PASS |

### 5.2 Missing Classes Detection

#### B1 — Empty / Null Classes

| Variable          | Empty String EC | Null/Missing EC  | Status |
| ----------------- | --------------- | ---------------- | ------ |
| `name`            | EC02 ✅         | EC03 ✅          | PASS   |
| `email`           | EC09 ✅         | EC10 ✅          | PASS   |
| `password`        | EC18 ✅         | EC19 ✅          | PASS   |
| `confirmPassword` | EC22 ✅         | N/A (UI-only) ✅ | PASS   |

#### B2 — Cross-field Classes

| Cross-field Dependency       | EC Present | Status |
| ---------------------------- | ---------- | ------ |
| `confirmPassword ≠ password` | EC21 ✅    | PASS   |

#### B3 — DB-State Classes

| DB-State Dependency          | EC Present | Status |
| ---------------------------- | ---------- | ------ |
| `email` already exists in DB | EC08 ✅    | PASS   |

#### B4 — Security-Specific Classes

| Security Class                                             | EC Present                   | Status          |
| ---------------------------------------------------------- | ---------------------------- | --------------- |
| Public endpoint: no JWT required (SEC-02)                  | EC23 ✅                      | PASS            |
| XSS payload in `name` field (SEC-04: name displayed on UI) | EC24 ✅ (added after review) | PASS (resolved) |

#### B5 — Boundary Edge Cases

| Edge Case                                         | EC Present | Status |
| ------------------------------------------------- | ---------- | ------ |
| Password: special char in allowed set (`@$!%*?&`) | EC11 ✅    | PASS   |
| Password: special char OUTSIDE allowed set        | EC17 ✅    | PASS   |

#### B6 — State-Transition Classes

FR-01 is a single-step form — no multi-step workflow. **N/A ✅**

#### B7 — Implicit / Architectural Classes

| Architectural Boundary              | BVA TC Present                     | Status |
| ----------------------------------- | ---------------------------------- | ------ |
| `password` length DB VARCHAR (~255) | +α FR01-BVA-006 ✅                 | PASS   |
| `name` length DB VARCHAR (~255)     | UB/UB+1/+α FR01-BVA-012/013/014 ✅ | PASS   |
| `email` length DB VARCHAR (~255)    | UB/UB+1/+α FR01-BVA-016/017/018 ✅ | PASS   |

### 5.3 Rule Violations Found

#### Isolation Rule Scan (all 18 invalid TCs + FR01-EP-020)

All 18 invalid TCs verified: each contains exactly 1 invalid input; all other inputs drawn from valid classes.

- FR01-EP-010 to 016: `confirmPassword` mirrors invalid password value — correctly remains in EC20 ("matches password") since EC20's condition is "matches `password` field", not "is a strong password". ✅
- FR01-EP-020: EC24 is a **valid** class (security payload accepted by system) — no isolation concern. ✅

**No Isolation Rule violations found.** ✅

#### Combination Rule Scan

| TC ID       | Valid ECs Combined       | All Valid ECs Covered? | Verdict |
| ----------- | ------------------------ | ---------------------- | ------- |
| FR01-EP-001 | EC01+EC04+EC11+EC20+EC23 | Covers 5 of 6 ✅       | ✅ PASS |
| FR01-EP-020 | EC24 (security split)    | Covers EC24 separately | ✅ PASS |

> EC24 is tested separately (FR01-EP-020) because its output verification (DOM/XSS check) differs from the standard success path (FR01-EP-001). This is a justified exception to the combination rule.

### 5.4 BVA Completeness

| Variable          | BVA Table | Points Generated        | −α  | +α  | Missing           | Verdict |
| ----------------- | --------- | ----------------------- | --- | --- | ----------------- | ------- |
| `password` length | ✅ Yes    | 6 (FR01-BVA-001 to 006) | ✅  | ✅  | None              | ✅ PASS |
| `name` length     | ✅ Yes    | 8 (FR01-BVA-007 to 014) | ✅  | ✅  | None              | ✅ PASS |
| `email` length    | ✅ Yes    | 4 (FR01-BVA-015 to 018) | N/A | ✅  | LB N/A (implicit) | ✅ PASS |
| Date fields       | N/A       | —                       | —   | —   | —                 | ✅ N/A  |
| Numeric fields    | N/A       | —                       | —   | —   | —                 | ✅ N/A  |

### 5.5 AI Gap Analysis

#### What AI Generated Correctly

1. Identified `confirmPassword` as **UI-only** (not in API body) — prevents incorrect API test design
2. Applied **G4 split** to `password` special chars — EC16 (missing) vs EC17 (out-of-set) — flagged as commonly missed in skill Section 7
3. Applied **B1** (empty + null) to all required fields without omission
4. Applied **B2** (cross-field) with EC21 — confirmPassword mismatch class
5. Applied **B3** (DB-state) with EC08 — duplicate email class
6. Implemented the **"mirror" approach** for password invalid TCs to prevent defect masking in confirmPassword
7. Applied **BVA to string length fields** — `name`, `email`, `password` all covered
8. Made **architectural assumption** of DB VARCHAR=255 for implicit UB boundaries
9. Constructed **valid-format boundary emails** precisely using `"a"×(n−9) + "@test.com"` formula

#### What AI Missed

| #   | Missing Item                                      | Description                                                                                                                                                                      | Root Cause                                                                                                                                                                       |
| --- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **EC24 — XSS payload in `name`**                  | No EC for `name = "<script>alert(1)</script>"`. Output variable O14 (XSS safety) was correctly identified but did not translate into a G4 input split.                           | **Feature complexity** — XSS is an output-side security requirement. AI correctly mapped O14 as an output but did not auto-generate the corresponding input EC via G4 splitting. |
| 2   | **Self-generated EC17 (out-of-set special char)** | EC17 was generated correctly, but only after explicit human prompting referencing the allowed set `@$!%*?&`. Without the prompt hint, this class would likely have been omitted. | **AI limitation** — the skill itself flags EC17 as a "commonly missed" class (Section 7). Human compensated via targeted prompt.                                                 |

#### Root Cause Summary

| Category           | Count | Description                                                                      |
| ------------------ | ----- | -------------------------------------------------------------------------------- |
| Feature complexity | 1     | EC24 (XSS): output-side SEC-04 requirement not auto-translated to input EC       |
| AI limitation      | 1     | EC17 (out-of-set special char) required explicit human prompting to be generated |
| Prompt quality     | 0     | No gaps attributable purely to insufficient context                              |

#### Lesson Learned

**1. AI struggles with Output-to-Input reverse engineering (Security/State constraints):** While the AI effectively maps validation rules directly tied to input fields (e.g., length, missing data), it fails to auto-generate Equivalence Classes for constraints defined on the output side or UI rendering side (e.g., SEC-04 XSS escaping).

- **Mitigation Strategy for future FRs:** The QA Engineer must manually cross-reference the `Output Variables` table against the generated `Equivalence Classes`. If an output behavior (like security escaping, specific error UI, or DB state change) does not have a dedicated input trigger in the EC table, the human must manually prompt the AI to add it via a G4 split.

**2. AI exhibits "Happy Path Bias" and requires explicit prompting for nuanced Negative Testing:** The AI successfully generates standard invalid classes (B1 empty/null, G1 length bounds), but routinely misses edge-case negative classes (e.g., characters _outside_ a specific allowed set like EC17).

- **Mitigation Strategy for future FRs:** Do not rely on the AI's autonomous generation for complex domain constraints. Always review the "Common AI Blind Spots" or "EShop-Specific EP Patterns" in the skill instructions and explicitly force the AI to include these specific invalid classes in the initial Prompt.

### 5.6 Final EC Count After Review

| Category      | Before Review | Added            | After Review |
| ------------- | ------------- | ---------------- | ------------ |
| Valid ECs     | 5             | +1 (EC24)        | **6**        |
| Invalid ECs   | 18            | 0                | **18**       |
| BVA Points    | 18            | 0                | **18**       |
| EP TCs        | 19            | +1 (FR01-EP-020) | **20**       |
| BVA TCs       | 18            | 0                | **18**       |
| **Total TCs** | **37**        | **+1**           | **38**       |

### 5.7 Overall Coverage Verdict

| Check                           | Result                                           |
| ------------------------------- | ------------------------------------------------ |
| EP Guidelines (G1/G2/G3/G4)     | ✅ ALL PASS                                      |
| Missing Classes (B1–B7)         | ✅ ALL RESOLVED (EC24 added)                     |
| Isolation Rule (18 invalid TCs) | ✅ ALL PASS — no defect masking                  |
| Combination Rule                | ✅ PASS                                          |
| BVA Completeness (3 variables)  | ✅ ALL PASS                                      |
| **Overall verdict**             | ✅ **APPROVED — proceed to test-case-generator** |
