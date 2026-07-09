# Error Guessing — Quality Checklists

## Two Distinct Checklists

This file contains two separate checklists serving different purposes:

- **Process Quality Checklist** — Was the error guessing approach applied correctly?
- **Test Case Quality Checklist** — Are the individual test cases correct and justified?

Use both before finalizing any test suite.

## Checklist 1: Process Quality Checklist

_Verify the Error Guessing process was applied correctly — before reviewing individual test cases._

### Prerequisites

- [ ] Systematic techniques (at minimum EP/BVA) were applied first; this test suite supplements, not replaces them.
- [ ] The existing systematic test suite was reviewed before generating error hypotheses.
- [ ] A clear gap analysis was performed: what is already covered vs. what Error Guessing should add.

### Fault List Generation

- [ ] The error taxonomy was consulted as a structured checklist — all major categories were evaluated (not just categories the tester already knew).
- [ ] Historical defect data was consulted where available (bug tracker, past project data, incident reports).
- [ ] Domain experts (developers, architects, BAs) were consulted where their implementation knowledge was relevant.
- [ ] Every hypothesis has a documented rationale — no "gut feel" entries without basis.
- [ ] Hypotheses are specific enough to translate directly into executable test cases.

### Prioritization

- [ ] Every fault hypothesis has been assigned a risk priority (H / M / L).
- [ ] Prioritization is based on explicit probability × impact reasoning, not arbitrary assignment.
- [ ] All High priority hypotheses are represented in the test case suite.

### Test Case Design

- [ ] Each test case targets exactly one fault hypothesis — no combinations of multiple hypotheses.
- [ ] No error guessing test case duplicates coverage already provided by the systematic test suite.
- [ ] Each test case has a specific, verifiable expected result.

## Checklist 2: Test Case Quality Checklist

_Verify that individual test cases are correct, justified, and executable._

### Justification

- [ ] Every test case has a documented rationale linking it to a specific fault hypothesis.
- [ ] Every test case's rationale identifies the defect mechanism being targeted (not just the input value).
- [ ] The fault hypothesis the test case is designed to expose is clearly stated.

### Correctness

- [ ] Expected result is the correct system behavior — what the system SHOULD do (not what the defect would produce).
- [ ] Expected result is specific and verifiable: exact error message, exact field value, exact system state — not "system works" or "no error".
- [ ] Input values are fully specified — all required fields have defined values, not just the field under test.
- [ ] For multi-field inputs: the field under test is identified; all other fields use valid representative values.

### Non-Duplication

- [ ] The test case is not testing the same equivalence class / boundary / condition already covered by the systematic test suite.
- [ ] If the input value was already covered systematically, the test case tests a different hypothesis about the same value (not just the same scenario).

### Executability

- [ ] Preconditions (if any) are specified — what system state is required before the test.
- [ ] The input values are achievable via the system's interface (UI, API, or test harness).
- [ ] For concurrency or race condition hypotheses: the test setup required to reproduce the condition is documented.

### Traceability

- [ ] Each test case references its fault hypothesis ID from the fault list.
- [ ] Each test case references the error taxonomy category it belongs to.
- [ ] Priority (H / M / L) is recorded on the test case.
