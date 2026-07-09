# Use Case Testing — Quality Checklists

## Two Distinct Checklists

This file contains two separate checklists serving different purposes:

1. **Process Quality Checklist** — Was the design methodology applied correctly?
2. **Test Case Quality Checklist** — Are the resulting test cases correct, complete, and executable?

Use both before finalizing any test suite derived from a use case specification.

## Checklist 1: Process Quality Checklist

_Verify the methodology was applied correctly — before reviewing individual test cases._

### Spec Validation (Step 1)

- [ ] Use case spec validated: all required fields present and specific (UC ID, Actor, Preconditions, Main Flow, Alternate Flows, Business Rules, Postconditions).
- [ ] Preconditions are testable and achievable via a documented setup procedure.
- [ ] All alternate flows reference the specific Main Flow step where they branch.
- [ ] All alternate flows have a defined endpoint (rejoin Main Flow at step N / Terminate).
- [ ] All postconditions include backend state assertions (not just UI state).
- [ ] All gaps and ambiguities in the spec were raised and resolved (or documented as confirmed assumptions) before test design began.

### Flow Analysis (Step 2)

- [ ] Flow Inventory produced: Main Flow steps numbered; all alternate flows listed with classification (Optional / Exception), branching point, and endpoint.
- [ ] Hidden alternate flows were actively searched for at each Main Flow step using "What if?" analysis.
- [ ] Every Business Rule in the spec was mapped to its corresponding alternate flow (violation case).
- [ ] Concurrency scenarios were considered.
- [ ] All discovered hidden flows were confirmed with PO/BA or documented as assumptions.

### Scenario Matrix (Step 3)

- [ ] S1 is defined as Main Flow only (no alternate flows injected).
- [ ] Every alternate flow identified in the Flow Inventory appears in at least one scenario.
- [ ] Logically impossible combinations are documented explicitly as IMPOSSIBLE with rationale.
- [ ] Low-priority combinations not being tested this cycle are documented as Acknowledged — not silently absent.
- [ ] Risk-based prioritization is applied and documented for each scenario.

### Test Case Design (Steps 4–6)

- [ ] Every scenario in the Scenario Matrix has at least one corresponding test case.
- [ ] Alternate flow trigger is specified for every non-happy-path (non-S1) test case.
- [ ] Domain Testing (EP/BVA) was applied to select test data for each data-entry step.
- [ ] Every test case has a specific, verifiable precondition.
- [ ] All postconditions from the use case spec have explicit test assertions in each applicable test case.

## Checklist 2: Test Case Quality Checklist

_Verify that individual test cases are correct, complete, and executable._

### Completeness

- [ ] Every scenario in the Scenario Matrix has at least one test case.
- [ ] Every alternate flow in the spec appears in at least one test case's path.
- [ ] No alternate flow in the spec has zero corresponding test cases (RTM gap = release risk).

### Correctness

- [ ] Precondition is specific: exact system state, exact data records required, exact actor state (role, authentication status).
- [ ] Steps are in correct sequence: actor action → system response → actor action...
- [ ] Expected result is specified per step (not only at the final step).
- [ ] Expected result is specific and verifiable: exact error message, exact HTTP status, exact field value — not "system works" or "no error".
- [ ] Postconditions are listed as explicit test assertions including backend state (DB fields, audit log entries, email delivery, related entity state).
- [ ] The alternate flow trigger (for non-S1 scenarios) reliably forces the system into the intended path and does not accidentally exercise a different alternate flow.

### Executability

- [ ] Preconditions can be set up via a documented and repeatable procedure (DB script, API call, UI setup).
- [ ] All required test data is fully specified — no "to be determined during execution".
- [ ] All postcondition assertions are achievable during test execution (DB access, log access, email service access available in the test environment).
- [ ] For scenarios requiring special test conditions (concurrent access, timeouts, external service failures): the test environment supports these conditions and setup is documented.

### Traceability

- [ ] Each test case references its Scenario ID from the Scenario Matrix.
- [ ] Each test case references its source Use Case ID.
- [ ] Each test case references the relevant Business Rule ID(s) it verifies.
