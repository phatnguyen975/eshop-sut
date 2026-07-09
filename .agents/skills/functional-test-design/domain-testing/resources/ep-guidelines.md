# Equivalence Partitioning — Partitioning Guidelines

## Purpose

This reference defines the standard heuristic guidelines for identifying equivalence classes from requirements. Apply these guidelines in **Step 2** of the design process for every input and output variable.

These guidelines are heuristics — they require analytical judgment, not mechanical application. The goal is to identify classes where the system genuinely behaves differently, not just to follow a formula.

## Guideline 1: Continuous Range Condition

**When to apply:** The requirement specifies a range of values with a lower and upper bound (e.g., "must be between X and Y", "must not exceed Z", "must be at least N").

**Rule:** Identify **1 valid class** and **2 invalid classes**.

| Class           | Description                                       |
| --------------- | ------------------------------------------------- |
| Valid           | Values within the range (inclusive of boundaries) |
| Invalid (below) | Values below the lower bound                      |
| Invalid (above) | Values above the upper bound                      |

**Example:** "Quantity must be between 1 and 999."

| Class ID | Type    | Values             |
| -------- | ------- | ------------------ |
| EC1      | Valid   | 1 ≤ quantity ≤ 999 |
| EC2      | Invalid | quantity < 1       |
| EC3      | Invalid | quantity > 999     |

**Note:** If the requirement uses strict inequality (e.g., "greater than 0, less than 100"), the boundary values themselves (0 and 100) fall into invalid classes — adjust accordingly.

## Guideline 2: Discrete Set / Enumeration

**When to apply:** The requirement specifies a fixed set of allowed values, and there is reason to believe the system processes each value **differently** (e.g., different pricing, different routing, different behavior per value).

**Rule:** Identify **1 valid class per element** in the set, and **1 invalid class** for everything outside the set.

| Class               | Description                                   |
| ------------------- | --------------------------------------------- |
| Valid (per element) | Each member of the set is its own valid class |
| Invalid             | Any value not in the set                      |

**Example:** "Vehicle type must be one of: BUS, TRUCK, TAXI, PASSENGER, MOTORCYCLE."

| Class ID | Type    | Values                                                       |
| -------- | ------- | ------------------------------------------------------------ |
| EC1      | Valid   | BUS                                                          |
| EC2      | Valid   | TRUCK                                                        |
| EC3      | Valid   | TAXI                                                         |
| EC4      | Valid   | PASSENGER                                                    |
| EC5      | Valid   | MOTORCYCLE                                                   |
| EC6      | Invalid | Any value not in the above set (e.g., TRAILER, empty string) |

**When NOT to split per element:** If the system treats all members of the set identically (e.g., a field accepting any ISO country code, all processed the same way), treat the entire set as **1 valid class**. Split only when behavior differs per value.

## Guideline 3: Boolean / "Must-Be" Condition

**When to apply:** The requirement specifies an absolute constraint that must either be true or false — a binary condition with no gradient (e.g., "must start with a letter", "must not be empty", "must be checked/unchecked").

**Rule:** Identify **1 valid class** and **1 invalid class**.

| Class   | Description                |
| ------- | -------------------------- |
| Valid   | Condition is satisfied     |
| Invalid | Condition is not satisfied |

**Example:** "The first character of the product code must be a letter (A–Z)."

| Class ID | Type    | Values                                                         |
| -------- | ------- | -------------------------------------------------------------- |
| EC1      | Valid   | First character is A–Z or a–z                                  |
| EC2      | Invalid | First character is a digit, special character, space, or empty |

**Note:** Sometimes "invalid" for a boolean condition has multiple distinct sub-cases (digit vs. special character vs. empty). Apply the Splitting Principle (Guideline 4) to determine whether to split EC2 further.

## Guideline 4: The Splitting Principle

**When to apply:** At any point during partitioning, when there is reasonable grounds to believe that values within a single equivalence class are **NOT processed identically** by the system — even if they appear to belong to the same class.

**Rule:** Split the class into smaller, more specific sub-classes. Each sub-class becomes an independent equivalence class requiring its own representative test value.

**Grounds for splitting:**

- Known differences in data type handling (e.g., ASCII vs. Unicode strings, integers vs. floats).
- Known differences in storage or processing at sub-ranges (e.g., database column size limits, API payload size limits, in-memory vs. disk processing).
- Different code paths triggered by sub-groups (e.g., "0" may be valid numerically but trigger special handling in a division operation).
- Business rules that implicitly subdivide a class (e.g., discount tiers within a valid purchase amount range).
- Historical defect data indicating a specific sub-range was problematic.

**Example:** "The comment field accepts any text input."

A junior tester might define:

| Class ID | Type    | Values               |
| -------- | ------- | -------------------- |
| EC1      | Valid   | Any non-empty string |
| EC2      | Invalid | Empty string         |

A senior QA applies the Splitting Principle:

| Class ID | Type    | Values                          | Rationale                 |
| -------- | ------- | ------------------------------- | ------------------------- |
| EC1      | Valid   | Standard ASCII text (short)     | Baseline behavior         |
| EC2      | Valid   | Text containing Unicode / emoji | Different encoding path   |
| EC3      | Valid   | Text at maximum length boundary | Storage limit risk        |
| EC4      | Valid   | Text with HTML/script tags      | XSS / sanitization path   |
| EC5      | Invalid | Empty string                    | Required field validation |
| EC6      | Invalid | Text exceeding maximum length   | Truncation or rejection   |

The Splitting Principle is a **judgment call** — split when there is a credible reason, not out of habit. Over-splitting without rationale creates redundant test cases.

## Guideline 5: Output Domain Partitioning

**When to apply:** When partitioning output variables (calculated results, response codes, UI state changes, error messages).

Output partitioning follows the same rules as input partitioning. For each possible output, determine whether the system can produce it, and design input combinations that exercise each output class.

**Example:** "Shipping cost is calculated as: Free if total ≥ $100; Standard ($5) if $50 ≤ total < $100; Express ($15) if total < $50."

| Class ID | Type           | Output                 | Input condition to trigger |
| -------- | -------------- | ---------------------- | -------------------------- |
| EC1      | Valid output   | Free shipping          | total ≥ 100                |
| EC2      | Valid output   | Standard shipping ($5) | 50 ≤ total < 100           |
| EC3      | Valid output   | Express shipping ($15) | 0 < total < 50             |
| EC4      | Invalid output | Error / rejection      | total ≤ 0                  |

## Common Partitioning Mistakes

| Mistake                                                                              | Consequence                                                        |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Treating all invalid values as one class when they produce different error behaviors | Misses distinct error-handling defects                             |
| Not identifying any invalid classes                                                  | No negative testing coverage                                       |
| Overlapping classes (a value belongs to two classes)                                 | Ambiguous test results, false coverage claims                      |
| Skipping output domain analysis                                                      | Misses output-based defects                                        |
| Applying Guideline 2 (discrete set) when all values are processed identically        | Unnecessary test case multiplication                               |
| Failing to question whether the spec is complete before partitioning                 | Partitions built on an incomplete spec produce incomplete coverage |
