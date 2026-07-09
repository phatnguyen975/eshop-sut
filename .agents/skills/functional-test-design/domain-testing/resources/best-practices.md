# Domain Testing — Best Practices

## Purpose

Best practices for applying Domain Testing (EP + BVA) effectively and correctly. These are derived from ISTQB standards, BBST (Black Box Software Testing) methodology, and established QA engineering practice.

## BP-01: Always Partition Both Valid AND Invalid Classes

**Practice:** For every variable with a defined constraint, always identify both valid equivalence classes AND invalid equivalence classes before moving to test case design.

**Why:** Invalid class testing reveals error-handling robustness — often more valuable than confirming the happy path. Systems that crash or corrupt data on invalid input cause production incidents.

**How to apply:** Use the question "What values should the system reject?" for every constraint you identify. If you cannot answer this, the requirement needs clarification before testing proceeds.

## BP-02: Build a Variable Inventory Table First

**Practice:** Before designing any test case, document all input and output variables in a structured table listing: variable name, data type, valid constraint, and source (requirement ID or BR number).

**Why:** Jumping straight to test cases without mapping variables leads to missed variables, forgotten constraints, and untraceable test cases.

**Minimum table structure:**

| Variable | Type    | Constraint                  | Source |
| -------- | ------- | --------------------------- | ------ |
| age      | Integer | 18 ≤ age ≤ 60               | BR-001 |
| username | String  | 3–30 chars, alphanumeric    | FR-012 |
| status   | Enum    | ACTIVE, INACTIVE, SUSPENDED | BR-005 |

## BP-03: Document Equivalence Classes Before Designing Test Cases

**Practice:** Create an explicit equivalence class table for every variable before writing test cases. Each class should have: an ID, a type (Valid/Invalid), a description of values it contains, and the rationale.

**Why:** The equivalence class table is the analytical artifact that justifies every test case. Without it, coverage cannot be audited, and updates when requirements change are guesswork.

**Minimum class table structure:**

| Class ID | Variable | Type    | Value / Range / Description | Rationale               |
| -------- | -------- | ------- | --------------------------- | ----------------------- |
| EC-01    | age      | Valid   | 18 ≤ age ≤ 60               | Within acceptable range |
| EC-02    | age      | Invalid | age < 18                    | Below minimum age       |
| EC-03    | age      | Invalid | age > 60                    | Above maximum age       |
| EC-04    | age      | Invalid | age is not an integer       | Wrong data type         |

## BP-04: Apply the Splitting Principle Consciously

**Practice:** At each equivalence class, explicitly ask: "Is there any reason to believe values within this class are NOT processed identically?" If yes, split. If no, document the decision and move on.

**Why:** Undiscriminating splitting creates redundant test cases. Undiscriminating merging misses defects. The split/merge decision must be explicit and reasoned.

**Common triggers to split:**

- Different data sub-types within a "valid string" class (ASCII vs. Unicode, short vs. near-limit)
- Business logic that creates implicit tiers within an apparent single range (e.g., tiered pricing)
- Known code paths that diverge for sub-groups (from code review or developer communication)
- Historical defect data showing failures at specific sub-values

## BP-05: Apply 3-Value BVA for High-Risk Areas

**Practice:** Default to 2-value BVA (LB−1, LB, UB, UB+1 + nominal) for standard testing. Escalate to 3-value BVA (additionally including LB+1 and UB−1) for high-risk areas.

**High-risk indicators:**

- Safety-critical or financial systems where boundary errors have significant consequences
- Historical defects at boundaries in the system or codebase
- Regulatory or audit requirements mandating high coverage
- Complex conditions where "just inside" the boundary might have distinct handling

**Why:** 3-value BVA catches off-by-one errors that occur _inside_ the valid range (e.g., a fence-post error where LB itself is incorrectly rejected but LB+1 is accepted).

## BP-06: Verify Boundary Inclusivity Before Designing BVA Points

**Practice:** Before setting boundary values, confirm whether boundary values are inclusive (≤, ≥) or exclusive (<, >) in the requirement.

**Why:** "Age between 18 and 60" is ambiguous. If it means 18 ≤ age ≤ 60, then 18 and 60 are valid (LB and UB). If it means 18 < age < 60, then 18 and 60 are invalid — which shifts all boundary points.

**Action:** If the requirement does not explicitly state inclusive/exclusive, raise as a defect in the spec before designing test cases. Document the interpretation used if proceeding without clarification.

## BP-07: Ensure Every Test Case Has a Specified Expected Result

**Practice:** Never write a test case without a concrete, verifiable expected result. "No error" or "works correctly" is not an expected result.

**Why:** Without a specific expected result, pass/fail judgment is subjective. Test cases become meaningless during execution.

**Good expected results:**

- "System displays error message: 'Age must be between 18 and 60'"
- "System returns HTTP 400 with error code INVALID_AGE"
- "Field is highlighted in red; form submission is blocked"
- "Discount of $5.00 is applied to order total"

## BP-08: Trace Every Test Case to a Requirement or Constraint

**Practice:** Every test case must reference the specific requirement ID, BR number, or constraint it is designed to verify.

**Why:** Traceability enables impact analysis when requirements change (which test cases need updating?), supports test coverage reporting, and satisfies audit/compliance requirements.

## BP-09: Investigate Technical Constraints in Addition to Business Rules

**Practice:** Before finalizing equivalence classes, actively investigate technical limits that may not appear in the business requirements: database column types and sizes, API field limits, UI component limits, data type maximums, encoding constraints.

**Why:** Technical boundaries that differ from business rule boundaries create a gap where invalid values may bypass business validation and hit a harder technical failure (DB error, overflow, crash). These defects are found in production because they were never tested.

**How:** Ask the developer or check the schema, API spec, or codebase. Add technical boundary tests labeled separately from standard BVA.

## BP-10: Combine Valid Classes, Isolate Invalid Classes

**Practice:** When building test cases:

- Combine as many valid classes as possible into a single test case (efficiency)
- Isolate each invalid class in its own test case, with all other variables valid (defect isolation)

**Why:** Combining valid classes reduces total test count without losing coverage. Isolating invalid classes prevents Defect Masking — where one invalid input masks the failure to test another.

## BP-11: Review the Spec for Silent Behaviors Before Testing

**Practice:** Before designing test cases, identify any behavior the spec does not explicitly define. These "silent" cases are frequently where defects live.

**Examples of silent spec behaviors to question:**

- What happens when an optional field is left empty vs. submitted as null vs. submitted as empty string?
- What happens at the exact boundary (is LB valid or invalid)?
- What happens when a valid field receives a valid value but in an unexpected format (e.g., "100" as string vs. 100 as integer)?
- What is the expected behavior when multiple fields interact at their respective boundaries simultaneously?

## BP-12: Use the Minimum Test Suite Size as a Sanity Check

**Practice:** After designing test cases, verify the count is reasonable:

- **Minimum possible:** At least 1 test case per equivalence class (valid or invalid)
- **Maximum efficient:** No more than (number of classes x boundary points per ordered class) for pure EP+BVA

If the test case count is significantly lower than the number of classes, coverage is likely incomplete. If significantly higher, redundant cases are present.

**Reference counts for a single numeric range [LB, UB]:**

- EP only: 3 test cases (1 valid + 2 invalid) + nominal
- EP + 2-value BVA: ~5–6 test cases
- EP + 3-value BVA: ~7–8 test cases
