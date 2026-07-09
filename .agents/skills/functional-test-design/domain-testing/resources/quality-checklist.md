# Domain Testing — Quality Checklists

## Two Distinct Checklists

This file contains two separate checklists serving different purposes:

1. **Process Quality Checklist** — Was the design process followed correctly?
2. **Test Case Quality Checklist** — Are the resulting test cases correct and complete?

Use both before finalizing any test suite.

## Checklist 1: Process Quality Checklist

_Verify that the design methodology was applied correctly._

### Variable Identification

- [ ] All input variables have been identified (UI fields, API parameters, hidden fields, system states, environment values).
- [ ] All output variables have been identified (response codes, UI state changes, calculated values, error messages, DB updates).
- [ ] A variable inventory table has been created with type, constraint, and requirement source for each variable.
- [ ] Technical constraints were investigated beyond business rule constraints (DB column types, API limits, field size limits).

### Equivalence Class Design

- [ ] Every variable has at least one valid equivalence class defined.
- [ ] Every constrained variable has at least one invalid equivalence class defined.
- [ ] All equivalence classes are mutually exclusive (no value belongs to two classes simultaneously).
- [ ] All equivalence classes together cover the complete input domain (no gaps).
- [ ] The Splitting Principle was consciously evaluated for each class (split decision is documented).
- [ ] Discrete enumeration fields: one valid class per distinct-behaving element was identified (Guideline 2).
- [ ] Boolean / must-be conditions: exactly one valid and one invalid class were defined (Guideline 3).
- [ ] Output domain partitioning was applied where the requirement specifies distinct output categories.

### BVA Application

- [ ] BVA was applied to all ordered (sequential / range) equivalence classes.
- [ ] BVA was NOT applied to non-ordered fields (enumerations, booleans, categorical data).
- [ ] For each ordered class: LB and UB were correctly identified.
- [ ] Boundary inclusivity (inclusive vs. exclusive) was confirmed from the requirement before setting boundary points.
- [ ] The correct BVA variant was chosen (2-value or 3-value) with documented rationale.
- [ ] A nominal value was included for each valid range.

### Test Case Composition

- [ ] Valid classes were combined efficiently (multiple valid classes per test case where possible).
- [ ] Each invalid class is covered by exactly one test case.
- [ ] Each invalid test case contains only one invalid input — all other inputs are valid.
- [ ] No test case contains two or more invalid inputs simultaneously.

### Traceability and Documentation

- [ ] Every equivalence class traces to a specific requirement, BR, or constraint.
- [ ] Every test case traces to one or more specific equivalence classes.
- [ ] Every test case traces to a specific requirement, BR, or constraint.

## Checklist 2: Test Case Quality Checklist

_Verify that individual test cases are correct, complete, and well-formed._

### Completeness

- [ ] Every equivalence class has at least one test case covering it.
- [ ] Every boundary point (per chosen BVA variant) has a corresponding test case.
- [ ] At least one nominal value test case exists for each valid range.
- [ ] No equivalence class is left without a representative test value.

### Correctness

- [ ] Each test case has a clearly specified expected result (not "no error" or "works correctly").
- [ ] Expected results are concrete and verifiable (specific error message, specific response code, specific calculated value, specific UI state).
- [ ] Boundary values are arithmetically correct for the data type (e.g., for integers: LB−1 = LB minus 1, not LB minus 0.5).
- [ ] Test values are actually achievable via the system's interface or API (no theoretical values that cannot be entered).
- [ ] Invalid test cases specify what the system should do (reject, return error, ignore) not just that something invalid was submitted.

### Efficiency

- [ ] No two test cases are identical in both input values and expected result.
- [ ] No valid-class test cases contain redundant coverage (multiple representatives from the same class without split rationale).
- [ ] The total test case count is justifiable relative to the number of classes and boundaries.

### Clarity

- [ ] Each test case has a unique ID.
- [ ] Each test case has a description that clearly states what it is testing and why.
- [ ] The equivalence class(es) covered by each test case are referenced in the test case.
- [ ] The requirement or BR being verified is referenced in each test case.
- [ ] Input values are fully specified (no ambiguous or partial inputs).

### Edge Case Coverage

- [ ] At least one test case exercises the exact lower boundary of each range (LB).
- [ ] At least one test case exercises the value just below the lower boundary (LB−1).
- [ ] At least one test case exercises the exact upper boundary of each range (UB).
- [ ] At least one test case exercises the value just above the upper boundary (UB+1).
- [ ] If 3-value BVA was chosen: LB+1 and UB−1 test cases exist for each range.
- [ ] At least one test case exercises each distinct invalid class with a clear invalid input.
