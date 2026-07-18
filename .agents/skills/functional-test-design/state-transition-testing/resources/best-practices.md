# State Transition Testing — Best Practices

## BP-01: Treat the STD as a Specification Review Tool, Not Just a Test Design Tool

**Practice:** Present the STD to the product owner, BA, and lead developer immediately after construction — before writing any test cases.

**Why:** The STD construction process almost always reveals specification gaps: states that have no defined behavior for certain events, guards that are ambiguous, transitions implied by one requirement that contradict another. Finding these during diagram construction is cheaper than finding them during test execution. The STD is a shared specification artifact — not just a testing artifact.

## BP-02: Combine All Transitions + Invalid Transitions as the Minimum Functional Baseline

**Practice:** Never accept All Transitions Coverage alone as "done." Always pair it with Invalid Transitions Coverage for functional testing of stateful systems.

**Why:** All Transitions Coverage confirms the happy paths work. Invalid Transitions Coverage confirms the system handles everything it should reject. Both halves are needed for a functional baseline. Skipping invalid transitions leaves the most common source of stability and security defects untested.

## BP-03: Use Path Optimization — Cover Multiple Transitions Per Test Case

**Practice:** Design test paths that traverse multiple transitions in a single journey. One realistic end-to-end path can cover many valid transitions.

**Why:** More efficient (fewer test setups), more realistic (closer to actual user behavior), and more revealing (catches context carry-over defects that single-transition tests cannot find).

**How:** Starting from the initial state, trace the longest executable path that covers the most uncovered valid transitions. Start a new path only when remaining transitions cannot be reached from the current path.

## BP-04: Combine with EP/BVA for Guard Conditions with Data Ranges

**Practice:** When a guard condition involves a numeric or date range (e.g., `[Amount ≤ Balance]`), apply Equivalence Partitioning and BVA to select test data values.

**Why:** The STT confirms which state × event combination to test. It does not specify the exact data value within the guard condition range. EP/BVA selects the most revealing values — the boundary points where guard evaluation defects concentrate.

**Example:** For `Withdraw [Amount ≤ Balance]` with Balance = $100: Amount = $100 (exact boundary, valid), Amount = $100.01 (just over, triggers invalid path), Amount = $50 (nominal valid), Amount = $0 (lower boundary valid).

## BP-05: Specify Expected Intermediate Actions, Not Just Final State

**Practice:** In multi-step test cases, define the expected observable outcome after each event — not just the final state at the end of the path.

**Why:** Defects frequently occur during transition actions (wrong message displayed, wrong database field updated, wrong email sent) while the destination state is still reached correctly. Testing only the final state produces false passes.

## BP-06: Always Test Invalid Transitions via API/Direct Call, Not Just UI

**Practice:** When testing invalid transitions, trigger the event via direct API call (or equivalent) in addition to verifying that the UI prevents it.

**Why:** UI controls (disabled buttons, hidden menus) prevent casual invalid inputs but do not guarantee backend protection. A malicious or automated actor can bypass the UI. The system's backend must independently validate and reject invalid state transitions. Testing via API confirms this.

## BP-07: Document Why Each Invalid Transition Is Invalid

**Practice:** For each invalid cell in the STT, document the business rule or technical reason why the transition is not valid.

**Why:** Enables accurate expected result specification. "Error: Cannot close account with non-zero balance (BR-012)" is a better expected result than "Error displayed." The specific reason determines the specific expected error message, which is the assertion in the test case.

## BP-08: Apply EP Inside States to Manage State Explosion

**Practice:** When a system has many states that differ only in continuous data values, apply Equivalence Partitioning to group them into behavioral classes before modeling.

**Why:** Prevents state explosion. A bank account is in "In Credit" state whether the balance is $1 or $1,000,000 — the behavior for all events is identical. Modeling these as one state keeps the FSM tractable.
