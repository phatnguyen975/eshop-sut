# Example 1: Age Validation — Numeric Range

## Scenario

**Feature:** User registration form  
**Business Rule (BR-001):** "The applicant's age must be a whole number and must be between 18 and 60 years old (inclusive) to be eligible for registration."  
**Field behavior:** Mandatory field; system must display a specific validation error message for any rejection.

## Step 1 — Parse Requirements & Identify Variables

**Input variables:**

| Variable Name | Type    | Constraint / Description | Mandatory? | Source |
| ------------- | ------- | ------------------------ | ---------- | ------ |
| age           | Integer | 18 ≤ age ≤ 60            | Yes        | BR-001 |

**Output variables:**

| Variable Name       | Type   | Description                         | Source |
| ------------------- | ------ | ----------------------------------- | ------ |
| registration_result | State  | Registration proceeds or is blocked | BR-001 |
| error_message       | String | Displayed when age is invalid       | BR-001 |

**Observations / clarifications captured:**

- "Whole number" means the data type must be an integer (not float, not string).
- "Between 18 and 60 (inclusive)" — both 18 and 60 are valid (confirmed as inclusive from BR wording).
- No upper/lower technical constraints specified beyond the business rule in this example.

## Step 2 — Identify Equivalence Classes

### Input: age

| Class ID | Class Type | Value / Range / Description | BVA Applicable? | Rationale                             |
| -------- | ---------- | --------------------------- | --------------- | ------------------------------------- |
| EC-01    | Valid      | 18 ≤ age ≤ 60               | Yes             | Within eligible age range (BR-001)    |
| EC-02    | Invalid    | age < 18                    | Yes             | Below minimum eligible age            |
| EC-03    | Invalid    | age > 60                    | Yes             | Above maximum eligible age            |
| EC-04    | Invalid    | age is a float / decimal    | No              | Wrong data type — not a whole number  |
| EC-05    | Invalid    | age is a non-numeric string | No              | Wrong data type — not a number at all |
| EC-06    | Invalid    | age is null / empty         | No              | Field is mandatory; empty submission  |

**Splitting Principle applied to EC-04 and EC-05:** EC-04 (float) and EC-05 (string) were split from a generic "wrong type" class because floats may pass some numeric validations that strings do not — they trigger distinct code paths.

### Output: registration_result / error_message

| Class ID | Class Type     | Output                                        | Triggered by                      |
| -------- | -------------- | --------------------------------------------- | --------------------------------- |
| EC-07    | Valid output   | Registration proceeds                         | EC-01 (valid age)                 |
| EC-08    | Invalid output | Error message displayed; registration blocked | EC-02, EC-03, EC-04, EC-05, EC-06 |

## Step 3 — Apply Boundary Value Analysis

BVA applies to EC-01 (ordered range), EC-02 (ordered, lower invalid), EC-03 (ordered, upper invalid).

**Boundary identification:**

- LB = 18 (inclusive)
- UB = 60 (inclusive)
- Data type: Integer → minimum increment = 1

**Applying 3-value BVA** (chosen because this is a registration eligibility rule — moderate risk):

| BVA Point | Value | Class           | Notes                      |
| --------- | ----- | --------------- | -------------------------- |
| LB − 1    | 17    | EC-02 (Invalid) | Just below minimum age     |
| LB        | 18    | EC-01 (Valid)   | Exact minimum eligible age |
| LB + 1    | 19    | EC-01 (Valid)   | Just inside lower boundary |
| Nominal   | 39    | EC-01 (Valid)   | Midpoint of valid range    |
| UB − 1    | 59    | EC-01 (Valid)   | Just inside upper boundary |
| UB        | 60    | EC-01 (Valid)   | Exact maximum eligible age |
| UB + 1    | 61    | EC-03 (Invalid) | Just above maximum age     |

BVA does NOT apply to EC-04 (float), EC-05 (string), EC-06 (null/empty) — these are non-ordered type violations.

## Step 4 — Build Test Case Suite

### Combination strategy for valid classes:

EC-01 has multiple BVA representatives; each boundary point gets its own test case.

### Isolation strategy for invalid classes:

EC-02, EC-03, EC-04, EC-05, EC-06 each get exactly one test case. Since `age` is the only variable in this example, isolation is inherently satisfied.

### Test Case Suite

| TC ID | Description                                         | Variable(s) Under Test | EC(s) Covered | BVA Point | Input Value(s) | Expected Output                        | Req    |
| ----- | --------------------------------------------------- | ---------------------- | ------------- | --------- | -------------- | -------------------------------------- | ------ |
| TC-01 | Valid age — nominal value confirms core logic       | age                    | EC-01         | Nominal   | `age=39`       | Registration proceeds; no error        | BR-001 |
| TC-02 | Valid age — lower boundary (exact minimum)          | age                    | EC-01         | LB        | `age=18`       | Registration proceeds; no error        | BR-001 |
| TC-03 | Valid age — just inside lower boundary              | age                    | EC-01         | LB+1      | `age=19`       | Registration proceeds; no error        | BR-001 |
| TC-04 | Valid age — just inside upper boundary              | age                    | EC-01         | UB−1      | `age=59`       | Registration proceeds; no error        | BR-001 |
| TC-05 | Valid age — upper boundary (exact maximum)          | age                    | EC-01         | UB        | `age=60`       | Registration proceeds; no error        | BR-001 |
| TC-06 | Invalid age — just below minimum (off-by-one check) | age                    | EC-02         | LB−1      | `age=17`       | Error: "Age must be between 18 and 60" | BR-001 |
| TC-07 | Invalid age — just above maximum (off-by-one check) | age                    | EC-03         | UB+1      | `age=61`       | Error: "Age must be between 18 and 60" | BR-001 |
| TC-08 | Invalid age — decimal value (float)                 | age                    | EC-04         | N/A       | `age=25.5`     | Error: "Age must be a whole number"    | BR-001 |
| TC-09 | Invalid age — non-numeric string                    | age                    | EC-05         | N/A       | `age="twenty"` | Error: "Age must be a whole number"    | BR-001 |
| TC-10 | Invalid age — empty submission                      | age                    | EC-06         | N/A       | `age=(empty)`  | Error: "Age is required"               | BR-001 |

**Total: 10 test cases** — 5 valid, 5 invalid.

## Step 5 — Review Against Quality Checklist

**Process Quality Checklist:**

- [x] Input variable (age) and output variables (registration_result, error_message) identified.
- [x] Variable inventory table created.
- [x] All valid and invalid classes defined — 6 input classes, 2 output classes.
- [x] Splitting Principle applied to type-violation classes (EC-04 and EC-05 split).
- [x] BVA applied to all ordered classes (EC-01, EC-02, EC-03).
- [x] BVA NOT applied to type violation classes (EC-04, EC-05, EC-06).
- [x] Boundary inclusivity confirmed (inclusive).
- [x] 3-value BVA chosen — rationale documented.
- [x] Each invalid class covered by exactly one test case, with no other invalid inputs.

**Test Case Quality Checklist:**

- [x] All 6 equivalence classes have at least one test case.
- [x] All 7 BVA points (LB−1, LB, LB+1, nominal, UB−1, UB, UB+1) covered.
- [x] Each test case has a concrete expected result (specific error message or specific outcome).
- [x] No two test cases are identical.
- [x] No redundant valid-class test cases (nominal + boundaries only).
- [x] Each test case traces to BR-001.

## Coverage Summary

| Equivalence Class          | Representative Value(s) | Test Case(s)   |
| -------------------------- | ----------------------- | -------------- |
| EC-01 (Valid range)        | 39, 18, 19, 59, 60      | TC-01 to TC-05 |
| EC-02 (Below min)          | 17                      | TC-06          |
| EC-03 (Above max)          | 61                      | TC-07          |
| EC-04 (Float)              | 25.5                    | TC-08          |
| EC-05 (Non-numeric string) | "twenty"                | TC-09          |
| EC-06 (Empty)              | (empty)                 | TC-10          |
