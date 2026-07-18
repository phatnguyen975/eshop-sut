# Domain Testing — Theoretical Background

## 1. What Is a Domain?

In software testing, a **domain** is the complete set of all possible values that an input or output variable can hold. For a field accepting user age, the domain includes every integer, every float, every string, every special character, and null — not just the values the business rule permits.

Domain Testing is the discipline of analyzing this total domain and deriving a manageable, high-yield set of test cases from it.

## 2. Why Exhaustive Testing Is Impossible

Even a single integer field accepting values from 1 to 999 has thousands of valid inputs, plus an effectively infinite number of invalid ones (negatives, floats, strings, unicode, null, overflow values). Real systems have dozens of interconnected fields. Testing every combination leads to **combinatorial explosion** — a number of test cases that no team could execute in a finite timeline.

Domain Testing solves this by substituting exhaustive coverage with **stratified sampling** — dividing the infinite input space into a small number of meaningful subsets and testing one well-chosen representative from each.

## 3. Equivalence Partitioning (EP)

### Core Concept

An **equivalence class** (also called a partition) is a subset of the input or output domain such that:

- Every value in the class is expected to trigger **identical behavior** in the system under test.
- If the system processes one value correctly, it is assumed to process all other values in the class correctly.
- Testing multiple values from the same class is **redundant** — it adds cost without adding coverage.

### Valid vs. Invalid Partitions

Every domain must be analyzed through two lenses:

- **Valid equivalence classes:** Values the system is designed to accept and process successfully. Testing these verifies the "happy path".
- **Invalid equivalence classes:** Values the system should reject — out-of-range values, wrong formats, empty inputs, values violating business rules. Testing these verifies robustness and error handling.

### Partition Completeness Rule

The set of all equivalence classes for a variable must satisfy:

- **Complete coverage:** Every possible value of the variable belongs to exactly one class.
- **No overlap:** A single value cannot belong to two different classes simultaneously.
- **No gap:** There must be no value that belongs to no class.

## 4. Boundary Value Analysis (BVA)

### Why Boundaries Fail

Empirical evidence and decades of defect data show that software failures disproportionately occur at the **edges of equivalence classes** — the exact values where the system transitions from one behavior to another. This happens because:

- Developers frequently make **off-by-one** errors — using `<` instead of `<=`, mistyping `10` as `11`, terminating a loop one iteration early.
- Boundary conditions require explicit, precise coding — any ambiguity in requirements translates directly into a boundary defect.
- Boundary values are often not exercised by typical user behavior, leaving them undertested in manual and exploratory testing.

### BVA Variants

ISTQB Foundation Level Syllabus defines two variants of BVA:

#### 2-Value BVA

For a valid range [LB, UB]:

| Point  | Description                         |
| ------ | ----------------------------------- |
| LB     | Lower boundary (valid)              |
| LB − 1 | Just below lower boundary (invalid) |
| UB     | Upper boundary (valid)              |
| UB + 1 | Just above upper boundary (invalid) |

**Total:** 4 boundary test points per range (plus nominal value).

#### 3-Value BVA

For a valid range [LB, UB]:

| Point  | Description                         |
| ------ | ----------------------------------- |
| LB − 1 | Just below lower boundary (invalid) |
| LB     | Lower boundary (valid)              |
| LB + 1 | Just inside lower boundary (valid)  |
| UB − 1 | Just inside upper boundary (valid)  |
| UB     | Upper boundary (valid)              |
| UB + 1 | Just above upper boundary (invalid) |

**Total:** 6 boundary test points per range (plus nominal value).

#### Which to Use

- **2-value BVA** — sufficient for most functional testing; recommended by ISTQB as the standard
- **3-value BVA** — provides higher defect detection for off-by-one errors inside the valid range; appropriate for high-risk or safety-critical systems

### "Increment" Depends on Data Type

The concept of "just inside" and "just outside" a boundary requires defining the minimum increment for the data type:

| Data Type                | Minimum Increment | Example (boundary at 100)           |
| ------------------------ | ----------------- | ----------------------------------- |
| Integer                  | 1                 | 99, 100, 101                        |
| Float (2 decimal places) | 0.01              | 99.99, 100.00, 100.01               |
| String length            | 1 character       | 7, 8, 9 chars                       |
| Date                     | 1 day             | day before, boundary day, day after |
| List/array count         | 1 item            | n-1, n, n+1 items                   |

## 5. Test Case Combination Rules

### Valid Classes: Combination Strategy

When designing test cases for valid equivalence classes:

- Combine as many valid classes as possible into a single test case.
- Continue combining until all valid classes have been covered at least once.
- This reduces total test count without sacrificing coverage.

**Rationale:** Valid inputs do not mask each other. A system correctly processing one valid input is expected to correctly process all valid inputs simultaneously.

### Invalid Classes: Isolation Strategy

When designing test cases for invalid equivalence classes:

- Each invalid class must be covered by **exactly one test case**.
- That test case must contain only **one invalid input** — all other inputs in the same test case must be drawn from valid classes.
- Never combine two or more invalid inputs in one test case.

**Rationale:** This prevents **Defect Masking** — a phenomenon where the system rejects the first invalid input it encounters and halts processing, never reaching subsequent invalid inputs. A test case combining invalid A and invalid B may "pass" (show an error) even if the error handling for B is completely absent or broken.

## 6. Strengths and Limitations of Domain Testing

### Strengths

- **High defect yield per test case:** Boundary values and invalid partitions target the highest-probability failure points.
- **Efficient:** Dramatically reduces test count compared to random or exhaustive testing.
- **Specification-driven:** Forces explicit analysis of requirements, revealing ambiguities before testing begins.
- **Accessible:** Does not require code access or deep technical knowledge of implementation.

### Limitations

- **The "middle" blind spot:** Domain Testing assumes all values within a class behave identically. A defect that only triggers on a specific value inside a valid partition (e.g., division by zero for the value 42 in a range of 1–100) will not be caught by standard EP/BVA. **Error Guessing** and **Exploratory Testing** complement this weakness.
- **Specification dependence:** If requirements are incomplete or incorrect, partitions will be wrong. Hidden technical constraints (undocumented DB limits, encoding limits) will not be found unless actively investigated.
- **Single-variable focus:** EP and BVA analyze variables individually. They do not inherently address interactions _between_ variables — **Decision Table Testing** or **Pairwise Testing** is needed for multi-variable combinations.
- **Black-box by design:** Domain Testing cannot detect internal defects unrelated to input/output behavior — memory leaks, race conditions, database deadlocks, or concurrency issues.
