# Example: Product Code Validation — Multi-Condition String Field

## Scenario

**Feature:** Product management system — Create New Product form  
**Business Rules:**

- **BR-101:** Product Code is mandatory.
- **BR-102:** Product Code must be between 6 and 12 characters in length (inclusive).
- **BR-103:** Product Code must start with exactly 2 uppercase letters (A–Z).
- **BR-104:** Product Code must end with exactly 4 digits (0–9).
- **BR-105:** Characters between the prefix and suffix (positions 3 to length−4) may be alphanumeric (letters or digits); no spaces or special characters are permitted.
- **BR-106:** Product Code must be unique within the system (no duplicate allowed).

**Example of a valid product code:** `AB123C4567` (2 letters + 3 alphanumeric + 4 digits = 9 chars)

## Step 1 — Parse Requirements & Identify Variables

**Observations before partitioning:**

- BR-102 defines a length range → ordered, BVA applicable.
- BR-103 defines a format rule for positions 1–2 → boolean/must-be condition.
- BR-104 defines a format rule for last 4 positions → boolean/must-be condition.
- BR-105 defines character set for middle section → boolean/must-be condition.
- BR-106 defines a uniqueness constraint → systemic/state-based condition (requires a pre-existing duplicate in the DB to test).
- All 5 rules apply simultaneously — a valid product code must satisfy ALL rules at the same time.

**Input variables:**

| Variable Name | Type   | Constraint / Description                                                                           | Mandatory? | Source           |
| ------------- | ------ | -------------------------------------------------------------------------------------------------- | ---------- | ---------------- |
| product_code  | String | 6–12 chars; starts with 2 uppercase letters; ends with 4 digits; middle chars alphanumeric; unique | Yes        | BR-101 to BR-106 |

**Output variables:**

| Variable Name | Type   | Description                     | Source           |
| ------------- | ------ | ------------------------------- | ---------------- |
| save_result   | State  | Product saved or rejected       | BR-101 to BR-106 |
| error_message | String | Displayed on validation failure | BR-101 to BR-106 |

## Step 2 — Identify Equivalence Classes

Each business rule generates its own set of equivalence classes. Since all rules apply to the same field (product_code), classes are defined per rule.

### EC Group 1: Mandatory (BR-101)

| Class ID | Class Type | Description                  | BVA? |
| -------- | ---------- | ---------------------------- | ---- |
| EC-01    | Valid      | product_code is provided     | No   |
| EC-02    | Invalid    | product_code is empty / null | No   |

### EC Group 2: Length 6–12 characters (BR-102)

| Class ID | Class Type | Description            | BVA? |
| -------- | ---------- | ---------------------- | ---- |
| EC-03    | Valid      | 6 ≤ length ≤ 12        | Yes  |
| EC-04    | Invalid    | length < 6 (too short) | Yes  |
| EC-05    | Invalid    | length > 12 (too long) | Yes  |

**BVA points for EC-03/EC-04/EC-05 (LB=6, UB=12, integer increment):**

| BVA Point | Length | Class |
| --------- | ------ | ----- |
| LB−1      | 5      | EC-04 |
| LB        | 6      | EC-03 |
| LB+1      | 7      | EC-03 |
| Nominal   | 9      | EC-03 |
| UB−1      | 11     | EC-03 |
| UB        | 12     | EC-03 |
| UB+1      | 13     | EC-05 |

_3-value BVA chosen — string length errors are extremely common off-by-one mistakes._

### EC Group 3: First 2 characters must be uppercase letters A–Z (BR-103)

| Class ID | Class Type | Description                             | BVA? |
| -------- | ---------- | --------------------------------------- | ---- |
| EC-06    | Valid      | Chars 1–2 are both uppercase A–Z        | No   |
| EC-07    | Invalid    | Char 1 or char 2 is a digit             | No   |
| EC-08    | Invalid    | Char 1 or char 2 is lowercase letter    | No   |
| EC-09    | Invalid    | Char 1 or char 2 is a special character | No   |
| EC-10    | Invalid    | Only 1 letter prefix (not 2)            | No   |

_Splitting Principle applied to "invalid prefix": digits, lowercase, and special characters are distinct invalid sub-types — they may trigger different validation messages or code paths._

### EC Group 4: Last 4 characters must be digits 0–9 (BR-104)

| Class ID | Class Type | Description                                        | BVA? |
| -------- | ---------- | -------------------------------------------------- | ---- |
| EC-11    | Valid      | Last 4 chars are all digits 0–9                    | No   |
| EC-12    | Invalid    | One or more of last 4 chars is a letter            | No   |
| EC-13    | Invalid    | One or more of last 4 chars is a special character | No   |
| EC-14    | Invalid    | Fewer than 4 trailing digits                       | No   |

### EC Group 5: Middle characters must be alphanumeric (BR-105)

| Class ID | Class Type | Description                                                       | BVA? |
| -------- | ---------- | ----------------------------------------------------------------- | ---- |
| EC-15    | Valid      | All middle chars are alphanumeric (A–Z, a–z, 0–9)                 | No   |
| EC-16    | Invalid    | Middle section contains a space                                   | No   |
| EC-17    | Invalid    | Middle section contains a special character (e.g., `-`, `_`, `@`) | No   |

_This class only applies when the code length is > 6 (i.e., there are characters between the 2-letter prefix and 4-digit suffix). A minimum-length code of exactly 6 has no middle characters._

### EC Group 6: Uniqueness (BR-106)

| Class ID | Class Type | Description                               | BVA? |
| -------- | ---------- | ----------------------------------------- | ---- |
| EC-18    | Valid      | Product code does not exist in the system | No   |
| EC-19    | Invalid    | Product code already exists in the system | No   |

_EC-19 requires a prerequisite test data setup — an existing product with the same code must be in the DB._

## Step 3 — Apply BVA

- BVA applies only to EC-03, EC-04, EC-05 (Length rule — ordered range).
- BVA points already identified in Step 2 above (3-value BVA).
- All other classes (EC-06 through EC-19) are boolean/format conditions — BVA does not apply.

## Step 4 — Build Test Case Suite

### Combination Strategy for Valid Classes

A test case that satisfies ALL valid classes simultaneously:

- Non-empty (EC-01)
- Length in range — use nominal length = 9 (EC-03)
- First 2 chars: uppercase letters (EC-06)
- Last 4 chars: digits (EC-11)
- Middle chars: alphanumeric (EC-15)
- Unique code (EC-18)

**Valid representative:** `AB12X4567` (A, B = prefix; 1, 2, X = middle; 4, 5, 6, 7 = suffix; length = 9)

Additional valid test cases are needed for BVA boundary lengths (6, 7, 11, 12) — ensure format rules are still satisfied at each length.

### Isolation Strategy for Invalid Classes

Each invalid class gets its own test case. All other rules must be satisfied in that test case.

### Test Case Suite

| TC ID | Description                                         | Variable(s) Under Test | EC(s) Covered                            | BVA Point       | Input Value(s)                                  | Expected Output                                       | BR     |
| ----- | --------------------------------------------------- | ---------------------- | ---------------------------------------- | --------------- | ----------------------------------------------- | ----------------------------------------------------- | ------ |
| TC-01 | Valid code — nominal (all rules satisfied)          | product_code           | EC-01, EC-03, EC-06, EC-11, EC-15, EC-18 | Nominal (len=9) | `product_code="AB12X4567"`                      | Product saved successfully                            | All    |
| TC-02 | Valid code — minimum length (6 chars)               | product_code           | EC-03                                    | LB (len=6)      | `product_code="AB4567"`                         | Product saved successfully                            | BR-102 |
| TC-03 | Valid code — just above minimum length (7 chars)    | product_code           | EC-03                                    | LB+1 (len=7)    | `product_code="AB14567"`                        | Product saved successfully                            | BR-102 |
| TC-04 | Valid code — just below maximum length (11 chars)   | product_code           | EC-03                                    | UB−1 (len=11)   | `product_code="AB12XYZ4567"`                    | Product saved successfully                            | BR-102 |
| TC-05 | Valid code — maximum length (12 chars)              | product_code           | EC-03                                    | UB (len=12)     | `product_code="AB12XYZW4567"`                   | Product saved successfully                            | BR-102 |
| TC-06 | Invalid — empty product code                        | product_code           | EC-02                                    | N/A             | `product_code=(empty)`                          | Error: "Product Code is required"                     | BR-101 |
| TC-07 | Invalid — length too short (just below minimum)     | product_code           | EC-04                                    | LB−1 (len=5)    | `product_code="AB567"`                          | Error: "Product Code must be 6–12 characters"         | BR-102 |
| TC-08 | Invalid — length too long (just above maximum)      | product_code           | EC-05                                    | UB+1 (len=13)   | `product_code="AB12XYZAB4567"`                  | Error: "Product Code must be 6–12 characters"         | BR-102 |
| TC-09 | Invalid — prefix contains digit instead of letter   | product_code           | EC-07                                    | N/A             | `product_code="1B12X4567"`                      | Error: "First 2 characters must be uppercase letters" | BR-103 |
| TC-10 | Invalid — prefix contains lowercase letter          | product_code           | EC-08                                    | N/A             | `product_code="aB12X4567"`                      | Error: "First 2 characters must be uppercase letters" | BR-103 |
| TC-11 | Invalid — prefix contains special character         | product_code           | EC-09                                    | N/A             | `product_code="@B12X4567"`                      | Error: "First 2 characters must be uppercase letters" | BR-103 |
| TC-12 | Invalid — only 1 letter prefix (not 2)              | product_code           | EC-10                                    | N/A             | `product_code="A123X4567"`                      | Error: "First 2 characters must be uppercase letters" | BR-103 |
| TC-13 | Invalid — suffix contains a letter                  | product_code           | EC-12                                    | N/A             | `product_code="AB12XA567"`                      | Error: "Last 4 characters must be digits"             | BR-104 |
| TC-14 | Invalid — suffix contains special character         | product_code           | EC-13                                    | N/A             | `product_code="AB12X456!"`                      | Error: "Last 4 characters must be digits"             | BR-104 |
| TC-15 | Invalid — fewer than 4 trailing digits              | product_code           | EC-14                                    | N/A             | `product_code="AB12X567"`                       | Error: "Last 4 characters must be digits"             | BR-104 |
| TC-16 | Invalid — middle section contains space             | product_code           | EC-16                                    | N/A             | `product_code="AB1 X4567"`                      | Error: "Product Code must be alphanumeric only"       | BR-105 |
| TC-17 | Invalid — middle section contains special character | product_code           | EC-17                                    | N/A             | `product_code="AB1-X4567"`                      | Error: "Product Code must be alphanumeric only"       | BR-105 |
| TC-18 | Invalid — duplicate product code                    | product_code           | EC-19                                    | N/A             | `product_code="AB12X4567"` (pre-existing in DB) | Error: "Product Code already exists"                  | BR-106 |

> **Prerequisites for TC-18:** A product with code `AB12X4567` must already exist in the system before executing this test case.  
> **Total: 18 test cases** (5 valid, 13 invalid).

## Step 5 — Review Against Quality Checklist

**Process Quality Checklist:**

- [x] All input/output variables identified.
- [x] Variable inventory documented.
- [x] Valid and invalid classes defined for all 6 BRs (19 classes total).
- [x] Splitting Principle applied to prefix invalid class (EC-07, EC-08, EC-09, EC-10) and suffix invalid classes (EC-12, EC-13, EC-14).
- [x] BVA applied only to the ordered length range (EC-03/04/05); NOT applied to format conditions.
- [x] 3-value BVA chosen with rationale (string length off-by-one risk).
- [x] Boundary inclusivity confirmed: length 6 and 12 are both valid (inclusive).
- [x] Each invalid class covered by exactly one test case; all other inputs in that test case are valid.

**Test Case Quality Checklist:**

- [x] All 19 equivalence classes covered.
- [x] All 7 BVA points (LB−1, LB, LB+1, nominal, UB−1, UB, UB+1) covered by TC-07, TC-02, TC-03, TC-01, TC-04, TC-05, TC-08.
- [x] All test cases have specific expected results (specific error messages).
- [x] No identical test cases.
- [x] EC-15 (valid middle chars) is covered implicitly in all valid test cases (TC-01 through TC-05).
- [x] Prerequisite for TC-18 documented.

## Coverage Summary

| EC Group      | Class IDs                         | Test Cases                                |
| ------------- | --------------------------------- | ----------------------------------------- |
| Mandatory     | EC-01, EC-02                      | TC-01 (valid), TC-06                      |
| Length        | EC-03, EC-04, EC-05               | TC-01 to TC-05 (valid BVA), TC-07, TC-08  |
| Prefix format | EC-06, EC-07, EC-08, EC-09, EC-10 | TC-01 (valid), TC-09, TC-10, TC-11, TC-12 |
| Suffix format | EC-11, EC-12, EC-13, EC-14        | TC-01 (valid), TC-13, TC-14, TC-15        |
| Middle chars  | EC-15, EC-16, EC-17               | TC-01 (valid), TC-16, TC-17               |
| Uniqueness    | EC-18, EC-19                      | TC-01 (valid), TC-18                      |
