# Use Case Testing — Best Practices

## BP-01: Validate the Spec Before Designing Tests

Spend time validating the use case spec before starting test design. Every gap in the spec is a gap in the test suite. Finding and resolving spec gaps before design is significantly cheaper than finding them during execution.

Use the Spec Validation Checklist in [`spec-and-flow-guide.md`](spec-and-flow-guide.md) — Part 1 systematically before writing any scenario or test case.

## BP-02: Discover Hidden Alternate Flows Actively

Do not passively accept the spec's listed alternate flows as complete. Actively apply "What if?" at every main flow step, map every business rule to its violation alternate flow, and analyze postconditions for implied failure paths.

The flows not listed in the spec are the ones most likely to contain defects precisely because they were not explicitly considered during design.

## BP-03: Build the Scenario Matrix Before Writing Test Cases

The Scenario Matrix is the coverage artifact. Without it, there is no way to prove which paths are covered and which are not. Build the matrix first; use it as the source for test case derivation. Writing test cases before the matrix is complete produces an ad hoc, unauditable test suite.

## BP-04: Always Verify All Postconditions

For every test case, verify every postcondition in the use case spec — not just the ones visible in the UI. Include database queries, log assertions, and notification checks as explicit test steps.

If a postcondition cannot be verified during test execution (e.g., audit log is inaccessible from the test environment), raise this as a test infrastructure gap — not a reason to skip the assertion.

## BP-05: Use Domain Testing for Test Data Selection

After the Scenario Matrix is complete, apply EP/BVA to select specific test data values for each data-entry step. Do not choose test data arbitrarily or by habit. For each alternate flow triggered by invalid data, select the most revealing invalid data class representative or boundary value — not just any invalid value.

## BP-06: Apply Risk-Based Prioritization

Not all alternate flows carry the same risk. Prioritize scenarios based on: frequency of occurrence in real usage, business impact of failure, historical defect density in this area, and recency of change. Execute high-priority scenarios first; document low-priority scenarios as acknowledged if not tested this cycle — do not silently omit them.

## BP-07: Maintain a Requirements Traceability Matrix (RTM)

Link every scenario to its source alternate flow and business rule, and every test case to its scenario. The RTM enables: coverage proof before release, impact analysis when requirements change, and gap detection when an alternate flow has no linked test case. An RTM gap (alternate flow with zero test cases) is a release risk.

## BP-08: Test at Multiple Layers for the Same Use Case

A use case flow can be tested at the UI layer (user-facing behavior), the API layer (system integration), and the database layer (data persistence). For high-risk flows, test at multiple layers. A defect that a UI test misses may be caught by an API test that bypasses UI validation — especially important for security-sensitive flows where the UI may prevent an invalid action but the backend does not.
