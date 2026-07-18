# Decision Table Testing — Quality Checklists

## Two Distinct Checklists

This file contains two separate checklists serving different purposes:

1. **Process Quality Checklist** — Was the design methodology applied correctly?
2. **Test Case Quality Checklist** — Are the resulting test cases correct and complete?

Use both before finalizing any test suite derived from a decision table.

## Checklist 1: Process Quality Checklist

_Verify that the decision table design methodology was applied correctly — before reviewing individual test cases._

### Step 1 — Conditions and Actions Identification

- [ ] All conditions (independent variables affecting behavior) have been identified — not just those explicitly named in the spec.
- [ ] Implied conditions (complements, negatives, unstated "else" cases) have been identified and included.
- [ ] All actions (dependent outcomes) have been identified — including "no action", "error", "reject", and default cases.
- [ ] Implied actions have been identified (outcomes stated indirectly or by omission in the spec).
- [ ] Each condition's possible values have been enumerated (binary: T/F; multi-valued: all discrete states).
- [ ] Range-based conditions have been pre-processed using Equivalence Partitioning before being entered as condition values.
- [ ] Mutual exclusion constraints between conditions have been identified and documented.
- [ ] Ambiguities in requirements were raised and resolved (or documented as assumptions) before table construction.

### Step 2 — Full Table Construction

- [ ] The full (unoptimized) table was constructed before any reduction was applied.
- [ ] Total rule count matches the expected formula: 2ⁿ for n binary conditions, or the product of value counts for extended/mixed entry.
- [ ] All condition rows were filled using a systematic pattern (not random or ad hoc).
- [ ] Every action cell is consciously marked — no ambiguous blanks (blank = "explicitly does not apply", not "not yet evaluated").
- [ ] All rules with undefined behavior (spec gaps) were flagged and resolved before proceeding.

### Step 3 — Reduction

- [ ] Every candidate impossible rule has been classified as Type 1 or Type 2 before any action was taken.
- [ ] Type 1 impossible rules (impossibility proven directly by spec/BR): source BR is cited; removed without stakeholder confirmation.
- [ ] Type 2 impossible rules (impossibility inferred by tester, not stated in spec): stakeholder confirmation documented (who confirmed, when, any scope limitations).
- [ ] All impossible rules retained in the full table artifact with type label and rationale — not silently deleted.
- [ ] Don't Care merges satisfy both formal criteria: (a) identical action sets, (b) differ in exactly one condition.
- [ ] Don't Care rationale is documented for every merged rule (which original rules are covered, why the condition doesn't matter).
- [ ] For extended entry conditions with 3+ values: all values (not just two) were verified to produce identical actions before applying Don't Care.
- [ ] Reduction was applied iteratively until no further valid merges exist.
- [ ] Post-reduction coverage check performed: every non-impossible full-table rule is covered by exactly one reduced rule.
- [ ] Post-reduction overlap check: no two reduced rules cover the same full-table rule.

### Step 4 — Test Case Derivation

- [ ] Each remaining rule in the reduced table has been translated into exactly one test case.
- [ ] Don't Care conditions have a concrete test data value chosen and documented (with rationale for the choice).
- [ ] Each test case traces to its reduced table rule number.
- [ ] Each reduced table rule traces to one or more full table rule numbers.
- [ ] Each test case traces to the specific requirement(s) or BR(s) it verifies.

## Checklist 2: Test Case Quality Checklist

_Verify that individual test cases are correct, complete, and well-formed — after the process checklist passes._

### Completeness

- [ ] Every rule in the reduced table has exactly one corresponding test case — no rule is missing a test case.
- [ ] Every condition appears in at least one test case as True/active and at least one test case as False/inactive (or all its values for multi-valued conditions).
- [ ] Every action appears in at least one test case as the expected result (including "no action" / "0%" / "access denied" actions).
- [ ] Rules that were marked impossible are NOT represented in the test case suite.

### Correctness

- [ ] Each test case specifies ALL condition values — not just the ones being highlighted (all inputs must be defined for execution).
- [ ] Each test case has a clearly specified, verifiable expected result for each applicable action.
- [ ] Expected results are concrete: specific error messages, specific values, specific UI states — not "system works correctly" or "no error".
- [ ] Test cases derived from Don't Care rules specify a concrete value for the Don't Care condition (not left as "any").
- [ ] The condition values in each test case correctly correspond to the rule in the reduced table it represents.
- [ ] Action entries for each test case match the action entries in the corresponding reduced table rule.

### Efficiency

- [ ] No two test cases in the final suite have identical input combinations (no duplicate rules survived reduction).
- [ ] Test cases are not duplicating coverage that belongs to Domain Testing (single-variable invalid inputs should be in Domain Testing test cases, not here).

### Clarity and Traceability

- [ ] Each test case has a unique ID.
- [ ] Each test case has a description that states what combination of conditions it is testing and why.
- [ ] The reduced table rule number covered by each test case is referenced.
- [ ] The requirement(s) or BR(s) verified by each test case are referenced.
- [ ] All input values (including Don't Care choices) are fully and unambiguously specified.
- [ ] All expected results are fully and unambiguously specified for every action row.
