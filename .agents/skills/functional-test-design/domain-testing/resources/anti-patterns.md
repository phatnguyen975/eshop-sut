# Domain Testing — Anti-Patterns

## Purpose

Anti-patterns are recurring mistakes in applying Domain Testing that reduce test effectiveness, create false confidence, or waste effort. Each anti-pattern includes the mistake, its consequence, and the correct approach.

## AP-01: Combining Multiple Invalid Inputs in One Test Case

**Mistake:** Designing a test case that contains two or more invalid values simultaneously (e.g., invalid username AND invalid password in the same test).

**Consequence: Defect Masking.** The system rejects the first invalid input it encounters and halts. Subsequent invalid inputs are never evaluated. The test case may "fail" (show an error) even if the error handling for the second invalid input is completely absent or broken. The QA engineer gains false confidence that all invalid cases are handled.

**Correct approach:** One invalid class per test case. All other inputs in the same test case must be valid.

## AP-02: No Invalid Equivalence Classes Defined

**Mistake:** Only defining valid equivalence classes; skipping negative testing entirely. Common among testers who focus on "making the system work."

**Consequence:** No coverage of error-handling behavior. Invalid inputs that reach production cause crashes, data corruption, or security vulnerabilities.

**Correct approach:** For every variable with a constraint, always identify at least one invalid equivalence class. In practice, most variables have multiple distinct invalid classes (e.g., below range, above range, wrong type, wrong format).

## AP-03: Overlapping Equivalence Classes

**Mistake:** Defining partitions that share values — a single input value belongs to more than one class.

**Example:** Defining "EC1: values 1–10" and "EC2: values 8–20" — values 8, 9, 10 belong to both.

**Consequence:** Ambiguous test results. It is impossible to determine which class a test is actually exercising. Coverage reporting is unreliable.

**Correct approach:** Classes must be mutually exclusive. Review all class boundaries for overlaps before proceeding to test case design.

## AP-04: Gap in Partition Space

**Mistake:** Leaving values that belong to no equivalence class — the union of all classes does not cover the full domain.

**Example:** Defining "EC1: 1–10" and "EC2: 15–100" — values 11, 12, 13, 14 are unclassified.

**Consequence:** Portions of the domain are completely untested. Defects in those regions are invisible.

**Correct approach:** After defining all classes, explicitly verify that their union covers the complete domain (all values from the theoretical minimum to maximum, including type-violating inputs).

## AP-05: Testing Only at Boundaries, Skipping LB−1 / UB+1

**Mistake:** Testing only the exact boundary values (LB, UB) without testing the values just outside the boundaries (LB−1, UB+1).

**Consequence:** Off-by-one errors in the implementation are completely missed. A developer who coded `<` instead of `<=` will produce a defect at LB that is only caught by LB−1 (which falls into invalid territory but the system incorrectly accepts).

**Correct approach:** Always include the out-of-range boundary points. 2-value BVA minimum: {LB−1, LB, UB, UB+1}. The invalid boundary points are often where the most critical defects hide.

## AP-06: Applying BVA to Non-Ordered / Categorical Fields

**Mistake:** Attempting to apply BVA to enumeration fields, boolean flags, or unordered sets.

**Example:** For a "status" field with values {ACTIVE, INACTIVE, PENDING}, testing "value just before ACTIVE" or "value just after PENDING" — these concepts have no meaning for unordered sets.

**Consequence:** Meaningless test cases that cannot be constructed logically, or confusion about what to test.

**Correct approach:** BVA applies only to ordered, sequential domains where the concept of "adjacent value" is defined. For enumerations and booleans, EP with one representative per class is sufficient.

## AP-07: Treating All "Invalid" as a Single Class

**Mistake:** Grouping all invalid inputs into one class and testing with a single invalid value.

**Example:** For a numeric range 1–100, defining "Invalid: anything not 1–100" and testing only with the value −5.

**Consequence:** Distinct error-handling paths are not exercised. A system may correctly reject negative numbers but crash on strings, or correctly reject values above 100 but silently accept floats when only integers are allowed. Each distinct invalid condition must be a separate class.

**Correct approach:** For most range constraints, identify at minimum: below-range invalid class, above-range invalid class, and wrong-type invalid class(es). Use the Splitting Principle to determine if further subdivision is warranted.

## AP-08: Ignoring Output Domain Analysis

**Mistake:** Designing test cases only based on input partitions, without analyzing the output domain.

**Consequence:** Missing defects that are output-dependent — cases where the correct output class is not produced even when the input is valid, or where different valid inputs should produce different output classes but produce the same one.

**Correct approach:** For requirements that define multiple distinct outputs (e.g., different shipping costs, different access levels, different response codes), partition the output domain as well and ensure each output class is exercised by at least one test case.

## AP-09: Skipping the Nominal (Mid-Range) Value

**Mistake:** Designing only boundary test cases, omitting a representative value from the interior of the valid partition.

**Consequence:** If there is a systemic defect that affects the entire valid range (e.g., a wrong formula), boundary tests may not catch it — boundaries can accidentally pass even when the core logic is wrong. The nominal value confirms the basic happy path.

**Correct approach:** Always include at least one nominal value per valid range — typically the midpoint.

## AP-10: Ignoring Technical Constraints Beyond the Business Rule

**Mistake:** Partitioning only based on stated business rules, ignoring implementation-level constraints such as database column size, API payload limits, UI field character limits, or data type maximums.

**Example:** The business rule says "username: 3–30 characters" but the database column is VARCHAR(50). A 31-character username will be caught by the business rule; a 51-character one might bypass validation and hit a database error — only caught if the technical boundary is known and tested.

**Consequence:** Production defects caused by hidden technical boundaries that were never documented in requirements.

**Correct approach:** Always ask about technical constraints. When in doubt, test the technical limit separately, labeled as a technical boundary test rather than standard BVA.

## AP-11: Assuming Spec Is Complete Without Verification

**Mistake:** Proceeding directly to partition design based on the given requirements, assuming the spec covers all edge cases.

**Consequence:** Requirements are frequently ambiguous, incomplete, or silent on boundary behavior. For example: "age must be between 18 and 60" — does 18 itself qualify? Does the spec say what happens on the exact 18th birthday? Untested assumptions become production defects.

**Correct approach:** Before partitioning, explicitly verify: (1) Is the boundary inclusive or exclusive? (2) What is the expected system behavior for each invalid class? (3) Are there any undocumented constraints? If unclear, raise with the business analyst or product owner (ask the human) before designing test cases.

## AP-12: Redundant Test Cases Within the Same Class

**Mistake:** Testing multiple values from the same equivalence class (e.g., testing 15, 20, 35, 50, and 75 as five separate test cases for one valid numeric range).

**Consequence:** No additional coverage. Wasted test execution time and maintenance burden. Creates an illusion of thoroughness without substance.

**Correct approach:** One representative per class is sufficient (unless that class has been consciously split into sub-classes via the Splitting Principle). The representative should be the most revealing value — for valid ranges, the nominal midpoint; for invalid ranges, a clear exemplar of the violation.
