---
name: equivalence-partitioning
description: >
  Perform Steps 2 and 3 of Domain Testing: divide each input variable into
  Equivalence Classes (valid + invalid) and select Best Representatives.
  Apply all 4 EP Guidelines and 2 Optimization Rules (Combination + Isolation).
  Only run after domain-identifier is complete and approved.
trigger:
  - "apply EP"
  - "equivalence partitioning"
  - "step 2 domain testing"
  - "step 3 domain testing"
  - "partition classes"
output: Steps 2 and 3 section in qa-artifacts/domain-analysis/FR{nn}-domain-analysis.md
---

# Skill: equivalence-partitioning

## 1. Purpose

Perform **Steps 2 and 3** of the 4-step Domain Testing framework:

- **Step 2:** Divide the domain of each input variable into equivalence classes
- **Step 3:** Select the best representative for each class and optimize into a TC set

## 2. Input Required

- Approved output of `domain-identifier` (variable list)
- **Reference file:** `.agents/context/theory-domain-testing.md` (Sections 3, 5)

## 3. Core Theory — 4 EP Guidelines

> **Source:** `theory-domain-testing.md` Section 3.3

### Guideline 1: Continuous Range

**When:** Input is a continuous numeric range (e.g., length >= 8, price > 0, quantity >= 1)  
**Rule:** 1 valid class + 2 invalid classes

```
Example: password length >= 8
  Valid:    length >= 8           → representative: 10 chars
  Invalid1: length < 8 (too short) → representative: 7 chars
  Invalid2: length extremely long   → representative: 300 chars
```

### Guideline 2: Discrete Set / Enum

**When:** Input is a fixed set of allowed values (e.g., type ∈ {percent, fixed})  
**Rule:** 1 valid class PER element + 1 invalid catch-all class

```
Example: coupon type ∈ {percent, fixed}
  Valid1: "percent"
  Valid2: "fixed"
  Invalid: anything else (e.g., "discount", "", null)
```

### Guideline 3: Boolean / Must-Be Condition

**When:** Input is a binary must-satisfy condition (e.g., email format, required field)  
**Rule:** 1 valid class + 1 invalid class

```
Example: email format must be valid
  Valid:   "user@domain.com"
  Invalid: "notanemail", "@domain.com", "user@", ""
```

### Guideline 4: Splitting Principle

**When:** Suspecting the system handles values within the same class differently  
**Rule:** Split the large class into smaller, more specific sub-classes

```
Example: "valid string" → split into:
  Valid-ASCII:   "Nguyen Van A"
  Valid-Unicode: "Nguyen Van A with diacritics" (if relevant)
  Valid-Long:    string near DB VARCHAR limit (255 chars)
```

## 4. Step-by-Step Instructions

### Step A — Apply Guidelines to Each Variable

For each input variable from domain-identifier output:

1. Read BOTH "Explicit Constraints" and "Implicit Constraints" from the requirement analysis table
2. Determine which guideline applies (G1/G2/G3/G4)
3. Create EP class table for that variable
4. Choose one representative value per class
5. Assign Class ID: `EC{n}` — mark type as Valid or Invalid in the Type column

**EP Class Table format per variable:**

```markdown
### Variable: `{variable_name}` — Guideline {n}

| Class ID | Type    | Description                          | Representative Value |
| -------- | ------- | ------------------------------------ | -------------------- |
| EC01     | Valid   | Description of valid class           | specific value       |
| EC02     | Invalid | Description of invalid class         | specific value       |
| EC03     | Invalid | Description of another invalid class | specific value       |
```

### Step B — Handle Special Cases (Critical)

After running the 4 guidelines, also check:

**B1. Empty / Null / Missing:** Every required field must have a class for: `value = ""` (empty string) and `value = null` (missing field in API body)  
**B2. Cross-field Dependencies:** If two fields depend on each other (e.g., password + confirmPassword), create a dedicated class for the mismatch case  
**B3. DB State Dependencies:** If validation depends on DB state (e.g., email uniqueness), create separate classes:

- `email_already_exists_in_db`
- `email_not_exists_in_db`

**B4. Authorization Classes:** If the feature requires auth, create classes for:

- `no_token` (Anonymous)
- `valid_user_token` (Logged-in User)
- `valid_admin_token` (Admin)
- `invalid_or_expired_token`

### Step C — Combination Rule (Valid Classes)

> "Design test cases that cover as many Valid Equivalence Classes as possible simultaneously." — `theory-domain-testing.md` Section 5.2

**How to apply:**

1. List all valid classes: EC01-valid, EC03-valid, EC07-valid, ...
2. Combine as many valid classes as possible into one TC
3. Name the first TC: `FR{nn}-EP-001` (typically the Happy Path — all valid)

**Example:**

```
TC FR01-EP-001: EC01(valid email) + EC05(valid password) + EC08(passwords match)
               → Covers 3 valid classes in 1 test case
```

### Step D — Isolation Rule (Invalid Classes) — CRITICAL

> "Each test case covers ONE, and strictly ONLY ONE, Invalid Equivalence Class." — `theory-domain-testing.md` Section 5.3

**CRITICAL — Defect Masking Prevention:**

- If there are N invalid classes → need N separate test cases
- Each invalid TC MUST contain exactly 1 invalid input + all other inputs drawn from VALID classes

**Example:**

```
TC FR01-EP-002: EC02(invalid email format) + EC05(VALID password) + EC08(VALID match)
               → Tests ONLY email format validation
               → Password and confirmPassword must be VALID to prevent masking

TC FR01-EP-003: EC03(email already exists) + EC05(VALID password) + EC08(VALID match)
               → Tests ONLY email uniqueness
```

## 5. Output Format

> **CRITICAL RULE:** All generated content MUST be strictly in English.

Append to `qa-artifacts/domain-analysis/FR{nn}-domain-analysis.md`:

```markdown
## Step 2: Equivalence Classes

### Variable: `email` — Guideline 3 (Must-Be: valid format) + Guideline 3 (Must-Be: unique)

| Class ID | Type    | Description                           | Representative     |
| -------- | ------- | ------------------------------------- | ------------------ |
| EC01     | Valid   | Valid email format, not yet in DB     | `newuser@test.com` |
| EC02     | Invalid | Invalid email format (missing @)      | `notanemail`       |
| EC03     | Invalid | Invalid email format (missing domain) | `user@`            |
| EC04     | Invalid | Email already exists in DB            | `test@eshop.com`   |
| EC05     | Invalid | Empty email field                     | `""`               |

### Variable: `password` — Guideline 1 (Range: length >= 8) + Guideline 3 x4 (Must-Be: char types)

| Class ID | Type    | Description                                         | Representative     |
| -------- | ------- | --------------------------------------------------- | ------------------ |
| EC06     | Valid   | >= 8 chars, uppercase + lowercase + digit + special | `Test@123`         |
| EC07     | Invalid | Less than 8 characters                              | `Test@1` (7 chars) |
| EC08     | Invalid | Missing uppercase letter                            | `test@123`         |
| EC09     | Invalid | Missing lowercase letter                            | `TEST@123`         |
| EC10     | Invalid | Missing digit                                       | `Test@abc`         |
| EC11     | Invalid | Missing special character                           | `Test1234`         |
| EC12     | Invalid | Special char not in allowed set `@$!%*?&`           | `Test#123`         |

[... repeat for other variables ...]

## Step 3: Test Case Optimization

### 3.1 Valid Classes Coverage (Combination Rule)

| TC ID       | Valid Classes Covered | Test Data Summary             |
| ----------- | --------------------- | ----------------------------- |
| FR01-EP-001 | EC01, EC06, EC{match} | All valid inputs — Happy Path |

### 3.2 Invalid Classes Coverage (Isolation Rule)

| TC ID       | Invalid Class Tested                | Other Inputs                      |
| ----------- | ----------------------------------- | --------------------------------- |
| FR01-EP-002 | EC02 (email format: missing @)      | password = valid, confirm = valid |
| FR01-EP-003 | EC03 (email format: missing domain) | password = valid, confirm = valid |
| FR01-EP-004 | EC04 (email already exists in DB)   | password = valid, confirm = valid |
| FR01-EP-005 | EC05 (empty email)                  | password = valid, confirm = valid |
| FR01-EP-006 | EC07 (password too short)           | email = valid, confirm = valid    |

[...]

### 3.3 EC Coverage Summary

| Total ECs | Valid ECs | Invalid ECs | TCs for Valid | TCs for Invalid | Total TCs |
| --------- | --------- | ----------- | ------------- | --------------- | --------- |
| {n}       | {n}       | {n}         | {n}           | {n}             | {n}       |
```

## 6. Quality Checklist

- [ ] All generated content is completely in English
- [ ] Both explicit and implicit architectural constraints were considered for partitioning
- [ ] Applied guideline for each variable is explicitly stated (G1/G2/G3/G4)
- [ ] Every required field has an EC for `empty` / `null`
- [ ] Cross-field dependencies have their own class (e.g., password mismatch)
- [ ] DB-state dependencies have their own class (e.g., email already exists)
- [ ] Auth classes created if feature requires them (no-token, user-token, admin-token)
- [ ] Isolation rule enforced: each invalid TC has exactly 1 invalid input
- [ ] Combination rule applied: valid TC combines as many valid classes as possible
- [ ] No Defect Masking: no TC has 2 invalid inputs simultaneously
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk

## 7. EShop-Specific EP Patterns

### Password strength (FR-01, FR-03) — must have 6 invalid classes:

1. Length < 8
2. No uppercase
3. No lowercase
4. No digit
5. No special character from allowed set `@$!%*?&`
6. Special character NOT in allowed set (e.g., `#`, `^`) ← AI commonly misses this

### Authorization (FR-17 and any admin endpoint) — 3 auth classes:

1. No token → 401
2. Valid user token (non-admin) → 403
3. Valid admin token → 200

### OTP (FR-03) — 4 OTP classes:

1. Correct OTP for correct email → success
2. Wrong OTP digits → fail
3. OTP from a different email (cross-email attack) → fail ← AI commonly misses this
4. OTP already used (reuse attempt) → fail ← AI commonly misses this
