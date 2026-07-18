# Coverage Selection and Test Path Guide

## Purpose

Guidance for selecting the appropriate coverage level and deriving optimized test paths. Use during **Step 4** of the design process.

## Step 1: Select Coverage Level

### Decision Framework

Answer these questions to determine the appropriate coverage level:

**Q1: Is this a safety-critical, financial, or security-sensitive system?**

- Yes → All Transitions + Invalid Transitions + 1-switch for critical paths (minimum)
- No → proceed to Q2

**Q2: Is this a standard commercial application with user-facing state behavior?**

- Yes → All Transitions (0-switch) + Invalid Transitions (both at 100%)
- No → proceed to Q3

**Q3: Is this a low-risk informational or support feature?**

- Yes → All States + All Transitions (smoke test level)

### Coverage Level Quick Reference

| Level                      | What It Covers                                    | Guarantees                                   | Does NOT Guarantee              |
| -------------------------- | ------------------------------------------------- | -------------------------------------------- | ------------------------------- |
| All States                 | Every state visited ≥ 1 time                      | All states reachable                         | All transitions exercised       |
| All Transitions (0-switch) | Every valid transition exercised ≥ 1 time         | All valid paths covered + all states covered | Sequential combinations correct |
| Invalid Transitions        | Every invalid state×event tested ≥ 1 time         | Graceful rejection of invalid inputs         | (Complements All Transitions)   |
| 1-Switch                   | Every pair of consecutive transitions (A→B→C)     | Context carry-over correctness               | Longer sequences correct        |
| 2-Switch                   | Every triple of consecutive transitions (A→B→C→D) | Deeper sequence correctness                  | Even longer sequences           |

## Step 2: Enumerate Items to Cover

Based on the selected coverage level, list all items that must be covered:

### For All Transitions Coverage

List every valid transition from the STD:

| Transition ID | From State | Event [Guard] | To State   | Action   |
| ------------- | ---------- | ------------- | ---------- | -------- |
| T1            | S1: [Name] | E1            | S2: [Name] | [Action] |
| T2            | S2: [Name] | E2            | S1: [Name] | [Action] |
| T3            | S1: [Name] | E3 [Guard]    | S3: [Name] | [Action] |

### For Invalid Transitions Coverage

List every invalid cell from the STT:

| IT ID | From State  | Event   | Expected System Response    |
| ----- | ----------- | ------- | --------------------------- |
| IT1   | S2: [Name]  | [Event] | Error: "[Specific message]" |
| IT2   | S3: [Final] | [Event] | Error: "[Specific message]" |

### For 1-Switch Coverage

For each state B, enumerate all incoming→outgoing transition pairs through B:

**Example for state S1 (Active) with:**

- **Incoming:** T2 (Reactivate from S2→S1)
- **Outgoing:** T1 (Suspend S1→S2), T3 (Close S1→S3), T4 (Deposit self S1→S1)

**1-switch pairs through S1:**

| Pair ID | Sequence | Description                      |
| ------- | -------- | -------------------------------- |
| 1S-01   | T2 → T1  | Reactivate → immediately Suspend |
| 1S-02   | T2 → T3  | Reactivate → immediately Close   |
| 1S-03   | T2 → T4  | Reactivate → Deposit             |

## Step 3: Design Optimized Test Paths

### Path Optimization Principle

One test path = one test case. A path may cover multiple transitions. Design paths that:

1. Cover the maximum number of transitions per path.
2. Follow realistic user journeys where possible.
3. Are executable (each step must follow from the previous state).

### Path Optimization Strategy

**Start from the initial state.** Trace paths that cover the most uncovered transitions before starting a new path. Use a greedy algorithm:

1. Start at the initial state.
2. At each state, choose the outgoing transition that leads to the most uncovered transitions downstream.
3. Continue until no uncovered transitions remain reachable, or the path reaches a final state.
4. Start a new path from a state that can reach remaining uncovered transitions.

**Exception: Invalid transitions require individual test cases** (or small batches). An invalid transition test case puts the system in a specific state and fires a specific invalid event — this usually cannot be combined with other tests in a meaningful path.

### Example Path Optimization (3-state account lifecycle)

**Valid transitions to cover:** T1 (Active→Suspended), T2 (Suspended→Active), T3 (Active→Closed), T4 (Active→Active, Deposit self-transition)

**Path 1 (covers T4, T1, T2, T3 in one journey):**

- **Precondition:** System in S1 (Active)
- **Steps:** Deposit [T4] → Suspend [T1] → Reactivate [T2] → Deposit [T4 again, if needed] → Close [T3]
- **Transitions covered:** T4, T1, T2, T3 — all 4 valid transitions in one path

**Result:** 1 multi-transition test case covers all 4 valid transitions. Compare to naive approach: 4 separate single-transition test cases.

## Step 4: Assign Transitions to Test Cases

After designing paths, create a coverage matrix:

| Test Case | Path                                                                   | Transitions Covered | Invalid Transitions Covered |
| --------- | ---------------------------------------------------------------------- | ------------------- | --------------------------- |
| TC-01     | Active→Deposit→Active→Suspend→Suspended→Reactivate→Active→Close→Closed | T1, T2, T3, T4      | —                           |
| TC-02     | Invalid: Deposit while Suspended                                       | —                   | IT1                         |
| TC-03     | Invalid: Close while Closed                                            | —                   | IT2                         |
| TC-04     | Invalid: Reactivate while Active                                       | —                   | IT3                         |

**Coverage verification:**

- **Valid transitions:** T1 ✓, T2 ✓, T3 ✓, T4 ✓ → 100% All Transitions
- **Invalid transitions:** IT1 ✓, IT2 ✓, IT3 ✓ → 100% Invalid Transitions

## Step 5: Define Coverage Metrics for Reporting

Report coverage using the standard formula:

- **Valid transition coverage:** `(Transitions exercised / Total valid transitions) × 100`
- **Invalid transition coverage:** `(Invalid combinations tested / Total invalid combinations) × 100`
- **State coverage:** `(States visited / Total states) × 100`

Document both target coverage (before testing) and actual coverage (after execution) in the test plan.

## N-Switch Pair Derivation (Reference)

For 1-switch coverage, systematically derive all consecutive pairs:

For each state S in the FSM:

1. List all **incoming transitions** to S: I₁, I₂, ... Iₘ
2. List all **outgoing transitions** from S: O₁, O₂, ... Oₙ
3. Generate all pairs: Iᵢ → Oⱼ for all i, j combinations
4. Total pairs through S = m × n

Sum across all states to get total 1-switch pairs.

**Example:** State B has 2 incoming (X, Y) and 3 outgoing (A, B, C) — **Pairs:** X→A, X→B, X→C, Y→A, Y→B, Y→C = 6 pairs through state B

**Pruning:** Some pairs may not be testable if the system cannot reach the required precondition. Document these as unreachable pairs with rationale.
