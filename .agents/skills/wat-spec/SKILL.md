---
name: wat-spec
description: >
  Web Automation Testing — Scenario Specification command skill. Invoke this skill when
  the user provides a scenario ID from an approved test scope document and wants to produce
  a detailed E2E scenario specification including flow design and test data matrix. This
  skill is invoked once per scenario, after wat-scope is APPROVED. Trigger phrases:
  "wat-spec", "/wat-spec", "design scenario", "spec SC-XX", "write test specification",
  "design E2E flow for", "create spec for scenario".
---

# wat-spec — E2E Scenario Specification Design

## Purpose

Produce a complete, implementation-ready specification for one E2E scenario from the approved scope document. The specification defines:

- The full E2E flow as a sequence of user actions and system responses — shaped by the scenario's type (Happy Path, Negative, Error Recovery, Security & Misuse, etc.)
- The expected outcome at each step
- The test layer (UI or API) for each step
- The test data matrix — input value sets derived from functional test design techniques

The output (`spec.md`) is the **implementation contract** for `wat-build`. No test code may be written without an `APPROVED` spec.

## Input

| Source                            | Location                        | Purpose                                                             |
| --------------------------------- | ------------------------------- | ------------------------------------------------------------------- |
| Approved scope document           | `docs/test-scope.md`            | Scenario ID, type, FRs, actor, objective                            |
| System Requirements Specification | `docs/sut/srs.md`               | Expected behavior, validation rules, state machines, error messages |
| API Contract                      | `docs/sut/api-specification.md` | Endpoint details for API-layer steps                                |

**Required before starting:** `docs/test-scope.md` must have status `APPROVED`. If it is still `DRAFT`, stop and instruct the human to complete `wat-scope` first.

## Output

| Artifact               | Location                               | Status on Creation                   |
| ---------------------- | -------------------------------------- | ------------------------------------ |
| Scenario specification | `docs/scenarios/{scenario-id}/spec.md` | `DRAFT` until human approves Phase 2 |

## External Skills Invoked

| Skill                    | When                                               | What to extract                                                                        |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `playwright-skill`       | Phase 1 — when assigning test layer per step       | Confirms whether a behavior is testable via UI locators or requires APIRequestContext. |
| `functional-test-design` | Phase 2 — for each step with input, rule, or state | Input value sets only — never full test cases. Perform analysis silently.              |

## Theoretical Foundations

### Phase 1: Scenario Flow Design by Scenario Type

The scenario type from `docs/test-scope.md` determines how the E2E flow is designed. Never design all scenarios as if they were happy paths.

#### Happy Path (HP)

Design the primary success flow: valid data, all preconditions met, system responds correctly at every step. This is the baseline journey the SRS describes as the intended behavior.

Flow characteristics:

- Starts from user's entry point with all preconditions satisfied
- Every system response is the expected success response
- Ends with the business goal achieved and assertable

#### Negative (NEG)

Design a multi-step journey where a business rule violation or constraint is encountered and the system correctly rejects the action. This is NOT a single-step validation check — it is a realistic user journey that ends in correct rejection.

Flow characteristics:

- User begins a legitimate journey (e.g., attempts to login)
- At a specific step, a business constraint is violated (e.g., 3rd consecutive wrong password)
- The system responds with the correct rejection behavior (lockout, error message, redirect)
- Subsequent steps may include recovery (e.g., OTP flow) as part of the same journey
- Ends with the system in the correct post-rejection state (assertable)

**Example:** Account lockout scenario

```
Step 1: Navigate to login page
Step 2: Submit wrong password (attempt 1) → system increments failure counter
Step 3: Submit wrong password (attempt 2) → system increments failure counter
Step 4: Submit wrong password (attempt 3) → system locks account, shows lockout message
Step 5: Verify lockout message does not over-disclose failure reason
Step 6: Attempt login again within 30 seconds → system rejects with lockout error
Step 7: Wait 30 seconds, attempt login with correct password → system allows access
```

#### Error Recovery (ER)

Design a journey where the user encounters an error mid-flow and successfully recovers within the same session. The error is part of the realistic user experience, not a test of an error state in isolation.

Flow characteristics:

- Journey starts normally (happy path entry)
- An error occurs at a specific step (wrong coupon, failed validation, session issue)
- System responds correctly to the error
- User corrects the input or takes the recovery path
- Journey resumes and completes successfully
- Ends with the business goal achieved

#### Security & Misuse (SEC)

Design a multi-step attack scenario from the perspective of a disfavored user who deliberately attempts to bypass access controls, escalate privileges, or manipulate data.

Flow characteristics:

- Actor is an attacker or a user acting outside their role
- Steps simulate a realistic attack sequence (obtain token → craft request → attempt bypass)
- System correctly rejects each unauthorized action
- Ends with the attack defeated and system in correct state (no data leaked, no privilege granted)

**Example:** Role escalation scenario

```
Step 1: Login as standard user, obtain user-role JWT token
Step 2: Call GET /api/admin/users with user token → expect 403
Step 3: Call DELETE /api/admin/users/:id with user token → expect 403
Step 4: Attempt to modify own role via PUT /api/users/me with role=admin in body → expect rejection
Step 5: Verify user's role remains unchanged in subsequent GET /api/users/me
```

#### Edge Case (EC)

Design a journey where a boundary condition or unusual but valid system state is reached. The user's actions are legitimate, but the data or state is at an extreme value.

#### Core Flow Design Principles (All Types)

1. **Type-driven design** — The scenario type determines the journey structure. Read the Type and Objective from `docs/test-scope.md` before designing any step.
2. **User goal orientation** — Every scenario starts from a user's goal (or an attacker's objective) and ends when that goal is achieved, rejected, or defeated.
3. **Realistic sequencing** — Steps follow the natural order a real user or attacker would take. Do not inject state artificially.
4. **State continuity** — Each step builds on the state left by the previous step. A single browser context (or API session) is used throughout.
5. **Observable outcomes** — Every step ends with a system response that can be asserted.
6. **Error paths within the journey** — Errors that a real user would encounter and recover from within the same session belong inside the main flow, not as separate scenarios. Separate scenarios are for journeys with distinct start states or objectives.

#### Step Anatomy

Each step in the E2E flow must specify all five elements:

| Element               | Description                          |
| --------------------- | ------------------------------------ |
| **Action**            | What the user/attacker/system does   |
| **Actor**             | Customer / Admin / Attacker / System |
| **Precondition**      | What must be true before this step   |
| **Expected Response** | What the system does in response     |
| **Test Layer**        | UI E2E / API / UI E2E + API          |

#### Test Layer Assignment per Step

Use `playwright-skill` to confirm testability when uncertain.

| Assign UI E2E when…                                                        | Assign API when…                                                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Behavior is visible in the browser (redirect, toast, badge, error message) | Behavior is enforced server-side regardless of UI (auth check, data recomputation, role validation) |
| The step involves user interaction (fill, click, navigate)                 | The step verifies a security constraint (unauthorized access returns 403)                           |
| The assertion requires a rendered DOM element                              | The step verifies response schema, status code, or header                                           |

For Security scenarios: most steps are API layer — direct HTTP calls without the UI.

### Phase 2: Test Data Design

#### Invocation Rule for `functional-test-design`

When invoking `functional-test-design` in Phase 2:

- Perform the full technique analysis **silently** — do not print reasoning steps, intermediate partitions, or technique walkthroughs to the screen or file
- Only surface the **final extracted input value sets** in the spec
- This applies even when multiple FRs in the same scenario require different techniques

#### When to Apply Each Technique

For each step in the approved Phase 1 flow, determine whether a technique applies:

| Step Characteristic                                                                                                                          | Apply This Technique                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Step accepts user input with defined valid/invalid ranges (text fields, numeric fields, dropdowns with constraints)                          | **Domain Testing (EP + BVA)**                             |
| Step outcome is determined by multiple independent boolean conditions evaluated simultaneously                                               | **Decision Table Testing**                                |
| Step involves a feature with defined states and transition rules (order status, account status, session state)                               | **State Transition Testing**                              |
| Step is a security boundary, authentication check, authorization check, or integration point where components may make incorrect assumptions | **Error Guessing**                                        |
| Step has no input, no conditions, no state, and no security concern                                                                          | No technique — step is already fully specified by Phase 1 |

Multiple techniques may apply to a single step. Apply all that are relevant.

For **Negative scenarios:** The primary test data is the specific condition that triggers rejection. EP identifies the invalid class; BVA refines the boundary.

For **Security scenarios:** Error Guessing is the primary technique — craft inputs that a disfavored user would attempt (manipulated tokens, wrong roles, injected values).

#### Input Value Set Selection Rules

These rules define the **minimum sufficient set** of input values per technique. The goal is maximum defect detection with minimum redundancy.

**Domain Testing (EP + BVA):**

First, identify all equivalence classes:

- **Valid class:** inputs the system should accept
- **Invalid class(es):** inputs the system should reject — one class per distinct rejection reason (wrong format, too short, missing required, duplicate, etc.)

Then select values:

- One representative value from the valid class (typically a clean, realistic value)
- One representative value from each invalid class
- For any class boundary defined by a numeric constraint (min length, max value, threshold): add the **on-point** (exact boundary value) and the **off-point** (one unit outside the boundary on the invalid side)

Do not select multiple values from the same class — they provide no additional defect detection.

**Decision Table Testing:**

Identify all independent boolean conditions that affect the step outcome. Build the minimum test set:

- One combination where ALL conditions are TRUE → expected: full success
- For each condition C: one combination where ONLY C is FALSE, all others TRUE → expected: outcome changes due to C failing

This gives `N+1` combinations for `N` conditions. Do not enumerate all `2^N` combinations unless the requirement explicitly states that condition interactions matter.

**State Transition Testing:**

Map the feature as a finite state machine:

- Identify all states
- Identify all valid transitions (allowed by the SRS)
- Identify invalid transitions (explicitly forbidden or not mentioned in the SRS)
- Identify terminal states (states from which no further transition is permitted)

Select input triggers:

- One input per valid transition
- One input per invalid transition that must be rejected
- One input attempting to exit each terminal state

**Error Guessing:**

Apply after all systematic techniques. Focus on:

- Integration boundaries: data sent by one component that the receiving component should not trust (e.g., `total_amount` in checkout — backend must recompute)
- Authentication boundaries: requests to authenticated endpoints without a token, or with a token of the wrong role
- Client-side bypass attempts: values that pass UI validation but should be caught server-side (negative prices, manipulated IDs, script injection in text fields)
- Known common defect patterns for this type of feature (off-by-one in counters, race conditions in concurrent requests, case sensitivity in email matching)

## Workflow

### Step 1 — Verify Prerequisites

Check that `docs/test-scope.md` exists and has status `APPROVED`. If not, stop:

> "The scope document at `docs/test-scope.md` is not yet `APPROVED`. Please complete `wat-scope` before running `wat-spec`."

### Step 2 — Read the Target Scenario

From `docs/test-scope.md`, extract for the target scenario ID:

- Name, Type, Actor, Primary FR Coverage, Dependency FRs, Test Layer, Objective

**The Type field is critical** — it determines how the flow is designed in Phase 1.

### Step 3 — Read SRS and API Spec

Read all FR sections listed as primary coverage. Extract:

- Required behaviors, validation rules, state machine definitions
- Explicit error messages, redirects, and UI text from `docs/sut/srs.md`
- Endpoint contracts from `docs/sut/api-specification.md`

### Phase 1 — E2E Flow Design

### Step 4 — Design the Flow

Using the principles and type-specific guidance from **Theoretical Foundations** section, design the complete step sequence for this scenario. For each step, specify all five elements. Derive all expected responses from the SRS — never from SUT observation or assumption.

Use `playwright-skill` when uncertain about UI vs API testability.

### Step 5 — Write Phase 1 to `spec.md`

Create `docs/scenarios/{scenario-id}/spec.md`. Write Phase 1 section only (flow steps, no test data). Use the **Output Format** defined below.

### Step 6 — Human Gate A

> "Phase 1 complete. E2E flow written to `docs/scenarios/{scenario-id}/spec.md`. Please review the flow against `docs/sut/srs.md`:
>
> - Is the scenario type ({type}) correctly reflected in the flow design?
> - For Negative/Security scenarios: does the flow simulate a realistic journey ending in correct system rejection?
> - Is every FR listed as primary coverage tested by at least one step?
> - Are expected responses derived from the SRS — not assumed?
> - Are test layers assigned correctly per step?
>
> Reply **APPROVED** to proceed to Phase 2 (test data design), or **REJECTED** with specific feedback so I can revise the flow."

- If **APPROVED** → proceed to Phase 2
- If **REJECTED** → revise, update `spec.md` Phase 1, repeat Gate A until `APPROVED`

### Phase 2 — Test Data Design

### Step 7 — Identify Technique-Applicable Steps

For each step, determine which techniques apply using the rules in **Theoretical Foundations** section.

- **For Negative scenarios:** Focus on the step where the business rule is violated — apply EP/BVA to identify the exact invalid class and boundary values.
- **For Security scenarios:** Apply Error Guessing to every step involving an auth check, role check, or data the server should not trust from the client.

### Step 8 — Apply Techniques Silently

Invoke `functional-test-design` silently. Extract only the final input value sets per the selection rules. Do not print analysis.

### Step 9 — Build the Test Data Matrix

Produce the variant table for each technique-applicable step. Verify:

- Every invalid class has exactly one representative
- Every boundary has an on-point and off-point value
- Decision Table has N+1 combinations
- State Transition covers all valid, invalid, and terminal-state transitions
- Error Guessing covers all attack vectors relevant to this scenario type

### Step 10 — Update `spec.md` with Phase 2

Add the test data matrix to the Phase 2 section of `spec.md`. Do not modify the Phase 1 flow — only append Phase 2 content. Update the document status to `DRAFT` with Phase 2 complete.

### Step 11 — Human Gate B

> "Phase 2 complete. Full spec updated in `docs/scenarios/{scenario-id}/spec.md`. Please review the test data matrix against `docs/sut/srs.md`:
>
> - Are the technique selections appropriate for each step?
> - For Negative scenarios: does the data matrix cover the specific condition that triggers rejection and its boundary values?
> - For Security scenarios: does Error Guessing cover all relevant attack vectors?
> - Are Decision Table combinations complete for multi-condition rules?
> - Are State Transition triggers aligned with the state machine in the SRS?
>
> Reply **APPROVED** to finalize the spec and proceed to `wat-build`, or **REJECTED** with specific feedback so I can revise the data design."

- If **APPROVED** → update document status to `APPROVED`, confirm readiness for `wat-build`
- If **REJECTED** → revise Phase 2, repeat Gate B until `APPROVED`

## Output Format — `docs/scenarios/{scenario-id}/spec.md`

```markdown
# Scenario Specification: {Scenario Name}

**Scenario ID:** SC-XX  
**Type:** Happy Path / Negative / Edge Case / Error Recovery / Security & Misuse  
**Actor:** Customer / Admin / Attacker  
**Project:** {Project Name}  
**Created:** {YYYY-MM-DD}  
**Last Updated:** {YYYY-MM-DD}  
**Status:** DRAFT | APPROVED  
**Approved By:** {filled in by human after Gate B approval}

## 1. Scenario Overview

| Field                   | Value                                       |
| ----------------------- | ------------------------------------------- |
| **Scenario ID**         | SC-XX                                       |
| **Name**                | {Descriptive name: verb + object + context} |
| **Type**                | {type}                                      |
| **Actor**               | {actor}                                     |
| **Objective**           | {One sentence from test-scope.md}           |
| **Primary FR Coverage** | FR-XX, FR-YY, SEC-ZZ                        |
| **Dependency FRs**      | FR-AA (precondition)                        |
| **Test Layer**          | UI E2E + API                                |
| **Priority**            | Critical / High / Medium                    |

## 2. Preconditions

List all conditions that must be true before the scenario begins:

- {Condition 1 — system state, data, actor state}
- {Condition 2}
- ...

## 3. E2E Flow

> **Phase 1 Status:** DRAFT | APPROVED (Gate A)

| Step | Action   | Actor   | Precondition    | Expected Response   | Test Layer   |
| ---- | -------- | ------- | --------------- | ------------------- | ------------ |
| 1    | {action} | {actor} | {precondition}  | {response from SRS} | UI E2E       |
| 2    | {action} | {actor} | Step 1 complete | {response}          | API          |
| 3    | {action} | {actor} | Step 2 complete | {response}          | UI E2E + API |
| ...  |          |         |                 |                     |              |

**Notes:**

- {SRS-derived constraints not captured in the table}
- {Exact UI text or error messages from SRS}
- {For Negative/Security: which step triggers the rejection and why}

## 4. Test Data Matrix

> **Phase 2 Status:** DRAFT | APPROVED (Gate B)

### Step {N} — {Step Title} [{techniques applied}]

| Variant ID | Technique               | Input / Trigger | Expected Outcome          |
| ---------- | ----------------------- | --------------- | ------------------------- |
| S{N}.V1    | EP (valid)              | {value}         | {outcome}                 |
| S{N}.V2    | EP (invalid — {reason}) | {value}         | {error response from SRS} |
| S{N}.V3    | BVA (on-point)          | {value}         | {outcome}                 |
| S{N}.V4    | BVA (off-point)         | {value}         | {error response}          |

### Step {M} — {Step Title} [Decision Table — {N} conditions]

| Variant ID | C1: {condition} | C2: {condition} | Expected Outcome        |
| ---------- | --------------- | --------------- | ----------------------- |
| S{M}.V1    | TRUE            | TRUE            | {full success}          |
| S{M}.V2    | FALSE           | TRUE            | {failure — C1 violated} |
| S{M}.V3    | TRUE            | FALSE           | {failure — C2 violated} |

### Step {P} — {Step Title} [State Transition]

| Variant ID | Current State    | Trigger       | Expected Next State | Valid?  |
| ---------- | ---------------- | ------------- | ------------------- | ------- |
| S{P}.V1    | {state}          | {trigger}     | {next state}        | Valid   |
| S{P}.V2    | {state}          | {trigger}     | Rejected            | Invalid |
| S{P}.V3    | {terminal state} | {any trigger} | Rejected — terminal | Invalid |

### Step {Q} — {Step Title} [Error Guessing — Security/Integration]

| Variant ID | Attack Vector            | Input / Trigger                      | Expected Defense             |
| ---------- | ------------------------ | ------------------------------------ | ---------------------------- |
| S{Q}.V1    | No auth token            | Request without Authorization header | 401 Unauthorized             |
| S{Q}.V2    | Wrong role               | User token on admin endpoint         | 403 Forbidden                |
| S{Q}.V3    | Manipulated client value | {crafted value}                      | Server rejects or recomputes |
| S{Q}.V4    | Script injection         | {script input}                       | HTML escaped, no execution   |

## 5. Implementation Notes

{Optional: locator hints, known SUT quirks per SRS, isolation considerations}
```

## Quality Checklist

### Before Gate A (Phase 1)

- [ ] Scenario type from `docs/test-scope.md` is reflected in the flow design.
- [ ] For Negative scenarios: the flow includes the specific step where rejection occurs and verifies the correct system response per the SRS.
- [ ] For Security scenarios: the flow simulates a realistic attack sequence with HTTP-layer verification steps.
- [ ] For Error Recovery scenarios: the flow includes both the error occurrence and the recovery path within the same session.
- [ ] Every FR in Primary FR Coverage has at least one step testing it.
- [ ] All expected responses are derived from SRS — no invented values.
- [ ] Every step has all five elements (Action, Actor, Precondition, Response, Layer).
- [ ] Steps that require server-side verification have API in their test layer.
- [ ] All contents are in English and follow the specified markdown structure.

### Before Gate B (Phase 2)

- [ ] Technique selection matches the step characteristics.
- [ ] For Negative scenarios: the rejection-triggering step has EP applied to identify the exact invalid class that causes rejection.
- [ ] For Security scenarios: Error Guessing covers all auth boundaries, role checks, and client-supplied values the server should recompute.
- [ ] EP: one value per class — no redundant representatives.
- [ ] BVA: on-point and off-point for every numeric boundary.
- [ ] Decision Table: N+1 combinations for N conditions.
- [ ] State Transition: valid, invalid, and terminal-state triggers all present.
- [ ] All variant expected outcomes are derived from SRS.
- [ ] All contents are in English and follow the specified markdown structure.

## Completion Criteria

1. `spec.md` exists with status `APPROVED`
2. Both Gate A and Gate B have received explicit `APPROVED` from the human
3. Every step has either a technique-driven data matrix or a note that no technique applies
4. Human informed that spec is ready for `wat-build`

## Constraints

**MUST do:**

- Read Type and Objective from `docs/test-scope.md` before designing the flow.
- Design flow according to the scenario type — not all scenarios are happy paths.
- Derive all expected values from `docs/sut/srs.md`.
- Invoke `functional-test-design` silently in Phase 2.
- Write Phase 1 before presenting Gate A.
- Update `spec.md` with Phase 2 before presenting Gate B.

**MUST NOT do:**

- Design a Negative or Security scenario as a happy path with a single failing step.
- Print `functional-test-design` analysis.
- Invent expected values not in `docs/sut/srs.md`.
- Mark document as `APPROVED`.
- Proceed past any gate without explicit `APPROVED`.
- Reference `playwright-automation-plan.md`.
