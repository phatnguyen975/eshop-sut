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

**When to apply:** At any point during partitioning, when there are reasonable grounds to believe that values within a single equivalence class are **NOT processed identically** by the system — even if they appear to belong to the same class based on a surface reading of the requirement.

**Rule:** Split the class into smaller, more specific sub-classes. Each sub-class becomes an independent equivalence class requiring its own representative test value.

**Grounds for splitting:**

- Business rules that implicitly subdivide a class (e.g., discount tiers hidden within an apparent single valid range).
- Known differences in data type handling within a class (e.g., integers vs. floats within a numeric range).
- Known differences in storage or processing for sub-ranges (e.g., database column size limits, API payload limits).
- Different code paths triggered by sub-groups (e.g., value 0 within a numeric range may trigger special-case division logic).
- Historical defect data indicating a specific sub-range was problematic.

**Example:** "Age must be between 18 and 65 (inclusive)."

A tester applying only Guideline 1 defines:

| Class ID | Type    | Values        | Rationale     |
| -------- | ------- | ------------- | ------------- |
| EC1      | Valid   | 18 ≤ age ≤ 65 | Within range  |
| EC2      | Invalid | age < 18      | Below minimum |
| EC3      | Invalid | age > 65      | Above maximum |

The tester then discovers an additional business rule: _"Applicants aged 18–25 qualify for the Youth Rate; applicants aged 26–65 qualify for the Standard Rate."_

Applying the Splitting Principle — EC1 is now known to contain two sub-groups with **different system behavior** (different pricing tiers):

| Class ID | Type    | Values        | Rationale             |
| -------- | ------- | ------------- | --------------------- |
| EC1a     | Valid   | 18 ≤ age ≤ 25 | Youth Rate applies    |
| EC1b     | Valid   | 26 ≤ age ≤ 65 | Standard Rate applies |
| EC2      | Invalid | age < 18      | Below minimum         |
| EC3      | Invalid | age > 65      | Above maximum         |

The Splitting Principle is a **judgment call** — split only when there is a credible, specific reason (an explicit or implied business rule, known technical constraint, or historical defect pattern). Splitting without rationale inflates the test suite with redundant cases that add cost without adding defect detection value.

## Guideline 5: Output Domain Partitioning

**When to apply:** When the requirement defines multiple distinct outputs (calculated values, response codes, UI state changes, error messages) that the system can produce, and those outputs are not already in a 1-to-1 correspondence with the input classes already identified.

Output partitioning follows the same EP rules as input partitioning — outputs are grouped into classes where each class represents a distinct, distinguishable system response. For each output class, design the input combination that reliably triggers it.

**When output partitioning adds new value (beyond input partitioning):** Output partitioning is most valuable when the relationship between inputs and outputs is **many-to-one** or **one-to-many** — i.e., when multiple different input combinations produce the same output, or when a single input range maps to outputs that must be verified at different precision or value levels. If every input class already maps 1-to-1 to a unique output, input partitioning is sufficient and separate output partitioning is redundant.

**Important — "error" outputs are valid output classes:** A system response of "error" or "rejection" for an invalid input is itself a **valid output class** — it is what the system should correctly produce. Do not label it "Invalid output". The word "invalid" in output partitioning refers to an output that the system should never produce (e.g., a negative shipping cost, or a discount exceeding 100%) — not to error responses triggered by invalid inputs.

| Output class type        | Description                                                                | Example                                                           |
| ------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Valid output class**   | A correct, expected output the system should produce                       | "Free shipping", "Standard shipping ($5)", "Error: invalid total" |
| **Invalid output class** | An output the system should never produce — indicates a defect if observed | "Negative shipping cost", "Discount > 100%"                       |

**Example:** "Shipping cost is calculated as: Free if total ≥ $100; Standard ($5) if $50 ≤ total < $100; Express ($15) if $0 < total < $50. Orders with a total of $0 or less are rejected."

**Input classes (from Guideline 1):**

| Class ID | Type    | Input condition  |
| -------- | ------- | ---------------- |
| IC1      | Valid   | total ≥ 100      |
| IC2      | Valid   | 50 ≤ total < 100 |
| IC3      | Valid   | 0 < total < 50   |
| IC4      | Invalid | total ≤ 0        |

**Output classes — derived from the requirement's defined outputs:**

| Class ID | Type  | Expected output                              | Triggered by input class |
| -------- | ----- | -------------------------------------------- | ------------------------ |
| OC1      | Valid | Free shipping ($0.00)                        | IC1                      |
| OC2      | Valid | Standard shipping ($5.00)                    | IC2                      |
| OC3      | Valid | Express shipping ($15.00)                    | IC3                      |
| OC4      | Valid | Error: "Order total must be greater than $0" | IC4                      |

**Why OC4 is a valid output class:** The error response is the correct, expected system behavior for IC4. Producing this error is exactly what the system should do — it is not an "invalid output". An example of an actual invalid output class would be: "Shipping cost = −$5.00" (a negative value the system should never produce regardless of input).

**In this example:** Each input class maps 1-to-1 to one output class, so output partitioning does not add new test cases beyond what input partitioning already requires. It does, however, clarify what to verify in the expected result for each test case.

## Common Partitioning Mistakes

| Mistake                                                                              | Consequence                                                                                                                        |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Treating all invalid values as one class when they produce different error behaviors | Misses distinct error-handling defects                                                                                             |
| Not identifying any invalid classes                                                  | No negative testing coverage                                                                                                       |
| Overlapping classes (a value belongs to two classes)                                 | Ambiguous test results, false coverage claims                                                                                      |
| Skipping output domain analysis                                                      | Misses output-based defects                                                                                                        |
| Applying Guideline 2 (discrete set) when all values are processed identically        | Unnecessary test case multiplication                                                                                               |
| Failing to question whether the spec is complete before partitioning                 | Partitions built on an incomplete spec produce incomplete coverage                                                                 |
| Splitting a class without a documented rationale (invoking Guideline 4 by habit)     | Inflated test suite with redundant cases; no additional defect detection                                                           |
| Labeling an error/rejection response as an "invalid output class"                    | Conceptual confusion between invalid input (what triggers an error) and invalid output (an output the system should never produce) |
