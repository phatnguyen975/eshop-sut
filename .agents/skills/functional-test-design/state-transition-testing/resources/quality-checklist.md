# State Transition Testing — Quality Checklists

## Two Distinct Checklists

This file contains two separate checklists serving different purposes:

1. **Process Quality Checklist** — Was the design methodology applied correctly?
2. **Test Case Quality Checklist** — Are the resulting test cases correct, complete, and executable?

Use both before finalizing any test suite derived from State Transition Testing.

## Checklist 1: Process Quality Checklist

_Verify the design methodology was applied correctly — before reviewing individual test cases._

### FSM Component Identification (Step 1)

- [ ] All states identified — each is uniquely named and externally distinguishable.
- [ ] No two states have identical behavior for all events (if they do, they should be merged into one state).
- [ ] All events identified — including system-generated events (timeouts, async callbacks), not just user actions.
- [ ] All guard conditions documented with boolean expressions.
- [ ] All actions specified with observable, verifiable outcomes.
- [ ] Initial pseudostate identified — first real state is clearly defined.
- [ ] All final states identified and documented.
- [ ] Initial pseudostate is NOT modeled as a real state.
- [ ] Implied components (negative conditions, complement guards, behavior in unstated states) have been investigated and documented.

### STD Construction (Step 2)

- [ ] STD constructed before the STT.
- [ ] Every state is reachable from the initial pseudostate.
- [ ] Every non-final state has at least one outgoing valid transition.
- [ ] Self-transitions explicitly modeled where the system stays in the same state after an event.
- [ ] Every transition is fully labeled: `Event [Guard] / Action` (omissions only where genuinely absent).
- [ ] No transitions lead back to the initial pseudostate (it has no incoming arrows).
- [ ] STD reviewed and confirmed by at least one stakeholder (PO, BA, or developer).

### STT Construction (Step 3)

- [ ] STT has one row per state (excluding initial pseudostate) and one column per event.
- [ ] Total cells = states × events (confirmed against count).
- [ ] All valid transitions from the STD appear as correct entries in the STT.
- [ ] All remaining cells are identified as invalid transitions with defined expected system responses.
- [ ] No blank or "TBD" cells exist at the time of test case derivation.
- [ ] Guard conditions producing multiple transitions from the same state × event are modeled as separate rows or sub-rows.

### Coverage and Test Path Design (Step 4)

- [ ] Coverage level selected before test case derivation — rationale documented.
- [ ] All valid transitions to cover are enumerated in a list.
- [ ] All invalid transitions to cover are enumerated in a list.
- [ ] Test paths are optimized — multiple transitions covered per path where feasible.
- [ ] Every test case has a defined, reachable precondition (starting state).
- [ ] Coverage matrix created — all required transitions mapped to specific test cases.

### Test Case Derivation (Step 5)

- [ ] Every valid transition (at chosen coverage level) maps to at least one test case.
- [ ] Every invalid transition selected for coverage maps to at least one test case.
- [ ] Every test case has steps with expected results per step (not just final state).

## Checklist 2: Test Case Quality Checklist

_Verify that individual test cases are correct, complete, and executable._

### Completeness

- [ ] Every valid transition in the coverage scope has at least one test case covering it.
- [ ] Every invalid transition selected for coverage has at least one test case.
- [ ] No transition in scope is uncovered.

### Correctness

- [ ] Every test case has an explicit **Precondition** stating the exact starting state.
- [ ] Every test case has **Steps** listing events in order with required input data per event.
- [ ] Every step has an **Expected Result** — a specific, observable action, not "system works".
- [ ] Every test case has a **Postcondition** stating the expected ending state.
- [ ] Postconditions match the destination state in the STT.
- [ ] Invalid transition test cases specify the exact rejection behavior (error message, error code, or no-op).
- [ ] Test data for guard conditions includes boundary values where applicable (EP/BVA applied).

### Executability

- [ ] The precondition (starting state) is reachable via a documented setup sequence.
- [ ] Each step is achievable via the system's interface (UI, API, or test harness).
- [ ] No step requires white-box access to internals not available during black-box testing.

### Coverage Tracking

- [ ] Each test case documents which transition(s) it covers (by transition ID).
- [ ] A coverage matrix shows all transitions and their corresponding test cases.
- [ ] Coverage percentage is calculated and documented for both valid and invalid transitions.
