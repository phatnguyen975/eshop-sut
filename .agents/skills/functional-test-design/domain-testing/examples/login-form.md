# Example: Login Form Validation — Multi-Variable Input

## Scenario

**Feature:** User login form  
**Business Rules:**

- **BR-001:** Username is mandatory. Must be 5–20 characters. Only alphanumeric characters and underscores are allowed.
- **BR-002:** Password is mandatory. Must be between 8 and 30 characters.
- **BR-003:** If username does not exist in the system, display: "Invalid username or password."
- **BR-004:** If username exists but password does not match, display: "Invalid username or password." (Same message as BR-003 — intentionally generic for security.)
- **BR-005:** If both username and password are correct, redirect user to the Dashboard.

## Step 1 — Parse Requirements & Identify Variables

**Input variables:**

| Variable Name | Type   | Constraint / Description                   | Mandatory? | Source |
| ------------- | ------ | ------------------------------------------ | ---------- | ------ |
| username      | String | 5–20 chars; alphanumeric + underscore only | Yes        | BR-001 |
| password      | String | 8–30 chars                                 | Yes        | BR-002 |

**Output variables:**

| Variable Name | Type   | Description                                   | Source         |
| ------------- | ------ | --------------------------------------------- | -------------- |
| login_result  | State  | Redirect to Dashboard or remain on login page | BR-005         |
| error_message | String | Displayed on failed login                     | BR-003, BR-004 |

**Observations / clarifications captured:**

- BR-001 defines "alphanumeric and underscores" — confirmed: A–Z, a–z, 0–9, underscore (`_`) are valid; spaces and all other special characters are invalid.
- BR-001 defines length 5–20 — confirmed inclusive (5 and 20 are both valid).
- BR-002 defines length 8–30 — confirmed inclusive (8 and 30 are both valid).
- BR-002 defines no character set restriction stated for password — any character is valid as long as length is satisfied.
- BR-003/BR-004 defines same error message regardless of which field is wrong (security by design — do not distinguish between wrong username and wrong password).

## Step 2 — Identify Equivalence Classes

### Input: username

| Class ID | Class Type | Value / Range / Description                                         | BVA Applicable? | Rationale                                              |
| -------- | ---------- | ------------------------------------------------------------------- | --------------- | ------------------------------------------------------ |
| EC-01    | Valid      | 5 ≤ length ≤ 20; alphanumeric + underscore only                     | Yes (length)    | Satisfies both length and character set rules (BR-001) |
| EC-02    | Invalid    | length < 5                                                          | Yes             | Too short (BR-001)                                     |
| EC-03    | Invalid    | length > 20                                                         | Yes             | Too long (BR-001)                                      |
| EC-04    | Invalid    | Contains invalid characters (space, special chars excl. underscore) | No              | Character set violation (BR-001)                       |
| EC-05    | Invalid    | Empty / null                                                        | No              | Mandatory field (BR-001)                               |

### Input: password

| Class ID | Class Type | Value / Range / Description    | BVA Applicable? | Rationale                      |
| -------- | ---------- | ------------------------------ | --------------- | ------------------------------ |
| EC-06    | Valid      | 8 ≤ length ≤ 30; any character | Yes (length)    | Satisfies length rule (BR-002) |
| EC-07    | Invalid    | length < 8                     | Yes             | Too short (BR-002)             |
| EC-08    | Invalid    | length > 30                    | Yes             | Too long (BR-002)              |
| EC-09    | Invalid    | Empty / null                   | No              | Mandatory field (BR-002)       |

## Step 3 — Apply Boundary Value Analysis

BVA applies to ordered/range classes only.

**username — length range [5, 20], Integer increment = 1, applying 2-value BVA:**

| BVA Point | Length | Example Value         | Class |
| --------- | ------ | --------------------- | ----- |
| LB−1      | 4      | `john`                | EC-02 |
| LB        | 5      | `john_`               | EC-01 |
| Nominal   | 12     | `john_doe_123`        | EC-01 |
| UB        | 20     | `john_doe_123456789`  | EC-01 |
| UB+1      | 21     | `john_doe_1234567890` | EC-03 |

**password — length range [8, 30], Integer increment = 1, applying 2-value BVA:**

| BVA Point | Length | Example Value                    | Class |
| --------- | ------ | -------------------------------- | ----- |
| LB−1      | 7      | `Secret1`                        | EC-07 |
| LB        | 8      | `Secret1!`                       | EC-06 |
| Nominal   | 19     | `MySecurePassword_1!`            | EC-06 |
| UB        | 30     | `MySecurePassword_1234567890!!`  | EC-06 |
| UB+1      | 31     | `MySecurePassword_12345678901!!` | EC-08 |

BVA does NOT apply to EC-04 (invalid characters), EC-05 (empty username), EC-09 (empty password) — non-ordered.

## Step 4 — Build Test Case Suite

### Combination strategy for valid classes

When both `username` and `password` are valid (EC-01 and EC-06), they are combined in one test case — this is the happy path. BVA boundary points for each variable are tested independently: when testing a boundary of `username`, `password` is held at its valid nominal value, and vice versa.

### Isolation strategy for invalid classes

Each invalid class gets exactly one test case. The variable NOT under test is held at a valid representative value (nominal).

### Test Case Suite

**Prerequisites for all test cases:** A user account with `username="john_doe"` and `password="Secret1!"` exists in the system.

| TC ID | Description                                           | Variable(s) Under Test | EC(s) Covered | BVA Point      | Input Value(s)                                                       | Expected Output                                                      | Req            |
| ----- | ----------------------------------------------------- | ---------------------- | ------------- | -------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------- |
| TC-01 | Happy path — both valid, nominal values               | username<br>password   | EC-01, EC-06  | Nominal (both) | `username="john_doe_123"`<br>`password="MySecurePassword_1!"`        | Redirect to Dashboard                                                | BR-005         |
| TC-02 | Valid username — lower boundary (5 chars)             | username               | EC-01         | LB (len=5)     | `username="john_"`<br>`password="Secret1!"`                          | Redirect to Dashboard                                                | BR-001, BR-005 |
| TC-03 | Valid username — upper boundary (20 chars)            | username               | EC-01         | UB (len=20)    | `username="john_doe_123456789"`<br>`password="Secret1!"`             | Redirect to Dashboard                                                | BR-001, BR-005 |
| TC-04 | Valid password — lower boundary (8 chars)             | password               | EC-06         | LB (len=8)     | `username="john_doe"`<br>`password="Secret1!"`                       | Redirect to Dashboard                                                | BR-002, BR-005 |
| TC-05 | Valid password — upper boundary (30 chars)            | password               | EC-06         | UB (len=30)    | `username="john_doe"`<br>`password="MySecurePassword_1234567890!!"`  | Redirect to Dashboard                                                | BR-002, BR-005 |
| TC-06 | Invalid username — too short (LB−1, 4 chars)          | username               | EC-02         | LB−1 (len=4)   | `username="john"`<br>`password="Secret1!"`                           | Error: "Username must be 5–20 characters"                            | BR-001         |
| TC-07 | Invalid username — too long (UB+1, 21 chars)          | username               | EC-03         | UB+1 (len=21)  | `username="john_doe_1234567890"`<br>`password="Secret1!"`            | Error: "Username must be 5–20 characters"                            | BR-001         |
| TC-08 | Invalid username — contains invalid character (space) | username               | EC-04         | N/A            | `username="john doe"`<br>`password="Secret1!"`                       | Error: "Username may only contain letters, numbers, and underscores" | BR-001         |
| TC-09 | Invalid username — empty                              | username               | EC-05         | N/A            | `username=(empty)`<br>`password="Secret1!"`                          | Error: "Username is required"                                        | BR-001         |
| TC-10 | Invalid password — too short (LB−1, 7 chars)          | password               | EC-07         | LB−1 (len=7)   | `username="john_doe"`<br>`password="Secret1"`                        | Error: "Password must be 8–30 characters"                            | BR-002         |
| TC-11 | Invalid password — too long (UB+1, 31 chars)          | password               | EC-08         | UB+1 (len=31)  | `username="john_doe"`<br>`password="MySecurePassword_12345678901!!"` | Error: "Password must be 8–30 characters"                            | BR-002         |
| TC-12 | Invalid password — empty                              | password               | EC-09         | N/A            | `username="john_doe"`<br>`password=(empty)`                          | Error: "Password is required"                                        | BR-002         |

> **Total: 12 test cases** (5 valid, 7 invalid).

**Important notes:**

- TC-02 and TC-03 require accounts with those exact usernames pre-created in the system.
- TC-06 through TC-12 test field-level validation — the system should reject before attempting authentication. These test cases do not exercise BR-003/BR-004 (wrong credentials) — those require a separate test suite focused on authentication logic, not input validation.
- Each invalid test case contains exactly one invalid input — the other variable is held at a known-valid value. This prevents defect masking.

## Step 5 — Review Against Quality Checklists

**Process Quality Checklist:**

- [x] Both input variables (username, password) and output variables identified.
- [x] Variable inventory table created with type, constraint, and source.
- [x] All valid and invalid classes defined — 5 classes for username, 4 for password.
- [x] Splitting Principle evaluated for EC-04 — confirmed no split needed (single error message).
- [x] BVA applied to ordered classes only (length ranges for both variables).
- [x] BVA NOT applied to character set and empty classes (non-ordered).
- [x] 2-value BVA chosen — standard risk level for login validation.
- [x] Boundary inclusivity confirmed for both variables (5, 20, 8, 30 all inclusive).
- [x] Each invalid test case contains exactly one invalid input — other variable is valid.

**Test Case Quality Checklist:**

- [x] All 9 equivalence classes covered (EC-01 through EC-09).
- [x] All BVA points covered: username (LB−1, LB, Nominal, UB, UB+1), password (LB−1, LB, Nominal, UB, UB+1).
- [x] Each test case has a concrete, verifiable expected output.
- [x] Input Value(s) uses `variable="value"` format with `<br>` separator for multi-variable.
- [x] No two test cases have identical input combinations.
- [x] Prerequisites documented for all valid test cases requiring existing accounts.

## Coverage Summary

| Equivalence Class             | Representative Value(s)                                                                | Test Case(s)        |
| ----------------------------- | -------------------------------------------------------------------------------------- | ------------------- |
| EC-01 (username valid)        | `john_doe_123` (nominal), `john_` (LB), `john_doe_123456789` (UB)                      | TC-01, TC-02, TC-03 |
| EC-02 (username too short)    | `john` (LB−1, 4 chars)                                                                 | TC-06               |
| EC-03 (username too long)     | `john_doe_1234567890` (UB+1, 21 chars)                                                 | TC-07               |
| EC-04 (username invalid char) | `john doe` (space)                                                                     | TC-08               |
| EC-05 (username empty)        | (empty)                                                                                | TC-09               |
| EC-06 (password valid)        | `MySecurePassword_1!` (nominal), `Secret1!` (LB), `MySecurePassword_1234567890!!` (UB) | TC-01, TC-04, TC-05 |
| EC-07 (password too short)    | `Secret1` (LB−1, 7 chars)                                                              | TC-10               |
| EC-08 (password too long)     | `MySecurePassword_12345678901!!` (UB+1, 31 chars)                                      | TC-11               |
| EC-09 (password empty)        | (empty)                                                                                | TC-12               |
