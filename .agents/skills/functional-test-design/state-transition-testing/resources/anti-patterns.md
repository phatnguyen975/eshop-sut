# State Transition Testing — Anti-Patterns

## AP-01: Deriving Test Cases Directly from the STD Without Building the STT

**Mistake:** Using the STD alone to write test cases, skipping the State Transition Table entirely.

**Consequence:** The STD shows only valid transitions — it does not surface invalid state × event combinations. Without the STT, negative testing is purely intuitive and incomplete. Invalid transitions — the most likely source of security and stability defects — are missed systematically.

**Correct approach:** Always construct the STT after the STD. The STT is the mandatory bridge between the visual model and test case derivation. Invalid transition test cases must come from the STT, not from intuition.

## AP-02: Modeling the Initial Pseudostate as a Real State

**Mistake:** Adding "Start", "Initial", or "New" as a named state in the FSM, with events that can fire from it and transitions returning to it.

**Consequence:** Produces logically incorrect transitions. "What happens if event X fires in the Start state?" is a question with no real-world answer — the system is never actually "in" the initial pseudostate during normal operation. Test cases derived from these false transitions are unexecutable.

**Correct approach:** The initial pseudostate is not a state. It has exactly one outgoing unconditional transition to the first real state. It has no incoming transitions. It does not appear as a row in the STT. The first real state is whatever the system enters immediately upon instantiation.

## AP-03: Missing the Precondition in Test Cases

**Mistake:** Writing test cases that describe events and expected results but do not specify the starting state.

**Consequence:** The test case is non-deterministic and non-reproducible. Two testers executing the same test from different states will get different results — one may pass, one may fail — and neither result is meaningful. Defects found this way cannot be reliably reproduced.

**Correct approach:** Every State Transition test case must specify the **exact state** the system must be in before the first event is triggered. "Precondition: System is in state S2 (Suspended)" is mandatory, not optional.

## AP-04: Testing Only Valid Transitions (No Invalid Transition Coverage)

**Mistake:** Designing test cases only for the arrows in the STD — confirming that valid paths work — without testing any invalid state × event combinations.

**Consequence:** The entire left side of the quality equation is untested. Invalid transitions are where security vulnerabilities, stability failures, and unauthorized state changes concentrate. A user who submits a payment while already in "Payment Processing" state, or who closes an account with a negative balance, exposes exactly these untested paths.

**Correct approach:** All Transitions Coverage alone is insufficient as a functional testing baseline. Always combine with Invalid Transitions Coverage. The STT makes this systematic — every "N" or "—" cell in the table must have a corresponding test case.

## AP-05: One Test Case Per Transition (No Path Optimization)

**Mistake:** Designing exactly one test case for each individual valid transition — e.g., 8 transitions → 8 separate single-step test cases.

**Consequence:** Inefficiency and missed context carry-over defects. Single-transition test cases require the system to be reset to a specific state for each one — expensive to set up and closer to unit testing than functional testing. More critically, they cannot catch "1-switch" defects where the system behaves incorrectly after a specific sequence of two transitions.

**Correct approach:** Design **test paths** — sequences of transitions executable as a single end-to-end test case. One path can cover multiple valid transitions. This is both more efficient and more revealing. Single-transition test cases are reserved for transitions with no practical predecessor or for isolated invalid transition tests.

## AP-06: Leaving STT Cells Blank or Undefined

**Mistake:** When constructing the STT, leaving cells empty for state × event combinations that "obviously don't apply" or "are handled by the UI."

**Consequence:** Undefined behavior in the system. If the developer made assumptions about undefined state × event combinations, those assumptions may be wrong. A cell left undefined in the STT is a specification gap — not a testing decision.

**Correct approach:** Every cell must have a defined entry. If a combination is truly invalid, specify what the system must do: reject with a specific error, silently ignore, or return an error code. If the behavior is unknown, mark as TBD and raise with the product owner before proceeding. "The UI prevents it" is not acceptable — the backend must also handle it correctly.

## AP-07: Not Reviewing the STD with Stakeholders

**Mistake:** Building the STD independently from requirements without verifying it with the product owner, developer, or BA, then proceeding directly to test case derivation.

**Consequence:** STD errors — missing states, wrong transitions, incorrect guard conditions — propagate into the STT and all derived test cases. Discovering a missing state after 20 test cases have been written requires significant rework. More importantly, the STD is a specification artifact — discrepancies between the QA model and the developer's implementation are specification gaps that should be resolved before development, not after.

**Correct approach:** Treat the STD review as a mandatory step. Present the diagram to at least one stakeholder (PO, BA, or lead developer) and confirm: all states are correct, all transitions are accurate, all guards are correctly specified. Document any corrections made.

## AP-08: Treating Processing/Implementation Steps as States

**Mistake:** Breaking internal implementation steps (e.g., "Validating", "Persisting", "Committing") into separate FSM states when they are not distinguishable from the outside.

**Consequence:** An inflated FSM with states that cannot be verified from a black-box perspective. Test cases require system access to confirm "the system is in the Persisting state" — which is impossible without white-box access. The resulting STT is unmanageable.

**Correct approach:** States are **externally observable conditions**. If two internal implementation steps produce identical behavior for all external events (same events allowed, same responses, same observable outputs), they are the same state from a black-box perspective. Apply this test: "Could I tell from the outside that the system has moved from state X to state Y?" If no → they are the same state.

## AP-09: Missing Self-Transitions

**Mistake:** Not modeling transitions where the system receives an event and stays in the same state — either because they seem trivial or because they are not explicitly stated in requirements.

**Example:** In a "Logged In" state, a user performing a search returns to "Logged In". This is a self-transition and is frequently required for coverage.

**Consequence:** The STT is incomplete. Self-transitions represent real system behavior that must be verified — especially when an action is produced (e.g., error displayed, counter incremented, timer reset). Missing them produces a gap in All Transitions Coverage.

**Correct approach:** Explicitly model self-transitions in the STD and include them in the STT. Ask for every state: "Are there events that the system accepts in this state without changing to a different state?" If yes → add self-transitions.

## AP-10: Confusing States with Input Data Values

**Mistake:** Modeling every possible value of a data field as a separate state (e.g., Balance=$0, Balance=$1, Balance=$2... as separate states).

**Consequence:** State explosion. Infinite states for continuous-valued data. An unmanageable STD and STT that no team can maintain or execute.

**Correct approach:** Apply Equivalence Partitioning to continuous data values before modeling states. Group values by behavioral equivalence — values that cause the system to respond identically to all events belong to the same state. For example: Balance ≥ 0 → "In Credit" state; Balance < 0 → "Overdrawn" state. Two states, not infinite.

## AP-11: Specifying Only Final State as Expected Result

**Mistake:** In multi-step test cases, specifying only the final state as the expected result, with no intermediate assertions.

**Example:** Steps are: Login → AddItem → Checkout → Pay. Expected result: "User is in Completed state."

**Consequence:** Defects occurring during intermediate transitions (e.g., wrong action during AddItem→Checkout transition) are not caught. The test may show "Completed" state while intermediate behavior was incorrect.

**Correct approach:** Specify the expected observable action after each step. After "Login": "User is redirected to Dashboard; session token set." After "AddItem": "Cart badge shows item count = 1." After "Checkout": "Order summary displayed." Each step has its own assertion.
