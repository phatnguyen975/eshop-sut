---
name: wat-spec
description: >
  Web Automation Testing — Scenario Specification command skill. Invoke this skill when
  the user provides a scenario ID from an approved scope document and wants to produce
  a detailed scenario specification including flow design and test data matrix. This
  skill is invoked once per scenario, after wat-scope is APPROVED. Trigger phrases:
  "wat-spec", "/wat-spec", "design scenario", "spec SC-XX", "write specification",
  "design flow for", "create spec for scenario".
---

# wat-spec — E2E Scenario Specification Design

## Purpose

Produce a complete, implementation-ready specification for one scenario from the approved scope document. The specification defines:

- The complete scenario flow as a sequence of user actions and system responses, shaped by the scenario's coverage label
- The expected outcome at each step, derived from the SRS
- The test layer (UI / API) for each step
- The test data matrix — input value sets derived from functional test design techniques

The output (`spec.md`) is the **implementation contract** for `wat-build`. No test code may be written for a scenario without an `APPROVED` spec.

## Input

| Source                  | Location                        | Purpose                                                                   |
| ----------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| Approved scope document | `docs/test-scope.md`            | Scenario ID, coverage label, FRs, actor, objective                        |
| SRS                     | `docs/sut/srs.md`               | Expected behavior, validation rules, state machines, exact error messages |
| API Contract            | `docs/sut/api-specification.md` | Endpoint details, authentication requirements, response shapes            |

**Required:** `docs/test-scope.md` must have status `APPROVED` before starting.

## Output

| Artifact               | Location                               | Status on Creation                   |
| ---------------------- | -------------------------------------- | ------------------------------------ |
| Scenario specification | `docs/scenarios/{scenario-id}/spec.md` | `DRAFT` until human approves Phase 2 |

## External Skills Invoked

| Skill                    | When                                          | How                                                                                 |
| ------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| `playwright-skill`       | Phase 1 — when assigning test layer per step  | Confirms whether a behavior requires browser interaction or HTTP-level verification |
| `functional-test-design` | Phase 2 — per step with input, rule, or state | Silently. Extract input value sets only. Never print analysis or walkthroughs.      |

## Theoretical Foundations

### Scenario Flow Design

A scenario specification translates a high-level scenario story into a concrete, step-by-step flow that can be directly implemented as automation. The flow must:

- Reflect the **coverage label** from the scope document — different labels require different flow structures (see below)
- Follow the **natural sequence** a real actor would take — never inject state artificially or skip steps a user would actually perform
- Maintain **state continuity** — each step builds on state from the previous step within a single browser session or API client session
- Produce **observable outcomes** at every step — each step ends with a system response that can be asserted
- Keep **error recovery within the same flow** — if a realistic user journey involves encountering an error and recovering within the same session, that recovery is part of the main flow, not a separate scenario

### Flow Structure by Coverage Label

The coverage label from `docs/test-scope.md` determines the flow structure:

#### Happy Path

The primary success flow: valid inputs, all preconditions satisfied, system responds correctly at every step. The journey delivers the stated business benefit end to end.

Structure:

- **Entry point:** realistic starting state for the actor
- **Each step:** valid action → expected success response
- **Exit:** business goal achieved, assertable outcome

#### Negative

A multi-step journey where a business rule or constraint is violated at a specific step, and the system correctly rejects or blocks the action. This is a **journey**, not a single-step validation check. The scenario begins with a legitimate intent, reaches a rejection point, and may continue to show what the system state is after rejection.

Structure:

- **Entry:** actor begins a legitimate journey
- **Violation step:** specific constraint is violated
- **Rejection:** system responds with the correct rejection behavior per the SRS
- **Post-rejection:** verify the system is in the correct state (no partial commit, correct error message, correct counter state, etc.)

#### Error Recovery

A journey where an error occurs mid-flow — due to invalid input, system event, or temporary condition — and the actor recovers and completes the goal within the same session. Both the error occurrence and the recovery are part of the same flow.

Structure:

- **Entry:** actor begins normally
- **Error point:** error occurs (wrong input, timeout, invalid state)
- **System response:** correct error handling behavior per the SRS
- **Recovery:** actor corrects the condition
- **Completion:** goal achieved

#### Security & Misuse

A multi-step attack or misuse sequence from the perspective of a disfavored actor who deliberately attempts to bypass controls, escalate privileges, or manipulate data. Most steps in this type of flow are at the API layer — direct HTTP calls crafted to probe for vulnerabilities.

Structure:

- **Entry:** disfavored actor establishes initial position (may involve obtaining a valid session to then misuse)
- **Attack sequence:** multiple attempts to exploit the system
- **System defense:** each attempt is correctly rejected per the SRS and security requirements
- **Exit:** confirm the system is in correct state (no privilege granted, no data leaked, no unauthorized modification)

### Step Anatomy

Every step in the flow must specify all five elements:

| Element               | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| **Action**            | What the actor or system does at this step                      |
| **Actor**             | Who performs this action: Customer / Admin / Attacker / System  |
| **Precondition**      | What must be true immediately before this step executes         |
| **Expected Response** | The system's response — derived from SRS, never assumed         |
| **Test Layer**        | `UI` (browser) / `API` (HTTP) / `UI + API` (both independently) |

**Test layer per step:**

| Assign `UI` when                                      | Assign `API` when                                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| Behavior is visible in the browser                    | Behavior is enforced server-side                                  |
| Step involves user interaction with rendered elements | Step verifies authorization, role check, or server-computed value |
| Assertion requires a rendered DOM element             | Step verifies HTTP status code, response body, or header          |

A single step may have both `UI` and `API` when the UI shows feedback AND the server must independently enforce the rule — these become separate assertions in implementation.

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

**For Negative scenarios:** Focus EP on the step where the constraint is violated — identify the exact invalid equivalence class and its boundary value.

**For Security & Misuse scenarios:** Error Guessing is the primary technique — enumerate attack vectors: no auth token, wrong role token, manipulated client-supplied values, injection payloads.

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

#### Test Case Payload Completeness

When defining variants (especially for Domain Testing and Error Guessing), the input cannot just be the isolated value being tested. Every variant in the matrix **must specify the complete, executable test payload** required to trigger the action.

For example, if testing the validation of an "Email" field in a registration form, the variant must specify not only the invalid email value but also the valid baseline values for the "Password" and "Confirm Password" fields required to submit the form. This complete payload is necessary for `wat-build` to correctly construct the `for...of` data array.

#### Data-Driven Implementation Annotation

After building the variant table for each step, annotate each variant group with exactly one of the following labels. This annotation is the contract for `wat-build` — it determines which Playwright implementation pattern must be used.

| Annotation            | Definition                                                                                                                                       | `wat-build` pattern                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| **`[data-driven]`**   | All variants share the **same test flow** and differ only in input value and expected output. Preconditions are identical across all variants.   | `for...of` loop generating a `test()` block |
| **`[separate-test]`** | Variants require **different setup**, different preconditions, different navigation paths, or cause irreversible state changes between variants. | One `test()` block per variant              |

**Selection rules:**

| Condition                                                                                                         | Annotation        |
| ----------------------------------------------------------------------------------------------------------------- | ----------------- |
| EP/BVA variants on a single input field — same form, same action, only the input value changes                    | `[data-driven]`   |
| Error Guessing auth variants — same endpoint, only the Authorization header changes                               | `[data-driven]`   |
| Decision Table combinations where each combination requires a distinct fixture state                              | `[separate-test]` |
| State Transition variants — each variant starts from a different system state                                     | `[separate-test]` |
| Variants where one variant's action permanently modifies shared state (e.g., consumes a coupon, locks an account) | `[separate-test]` |

**Cross-feature E2E flow data rule:**

Do **not** build a cross-feature data matrix that combines variants from multiple features into a single parameterised E2E flow. Each feature boundary's variants belong in their own validation or API spec. The E2E flow test always uses fully valid data at every step — its purpose is to verify the complete business journey succeeds end to end, not to vary inputs across features.

## Workflow

### Step 1 — Verify Prerequisites

Check that `docs/test-scope.md` exists and has status `APPROVED`. If not:

> "The scope document at `docs/test-scope.md` is not yet `APPROVED`. Please complete `wat-scope` before running `wat-spec`."

### Step 2 — Read the Target Scenario

From `docs/test-scope.md`, extract for the target scenario ID:

- Name, Coverage Label, Actor, Primary FR Coverage, GUI Requirements Verified, Dependency FRs, Test Layer, Objective

The **Coverage Label** is the most important field — it determines the flow structure designed in Phase 1.

### Step 3 — Read SRS and API Spec

Read all requirement sections listed in the scenario's Primary FR Coverage. Extract from the SRS: required behaviors, validation rules, state machine definitions, exact error messages, and UI text. Read endpoint contracts for all relevant endpoints.

All expected responses in the spec must be derived from this reading — never from observation of the SUT or assumption.

### Phase 1 — Scenario Flow Design

### Step 4 — Design the Flow

Using the principles and type-specific guidance from **Theoretical Foundations** section, design the complete step sequence for this scenario. For each step, specify all five elements. Derive all expected responses from the SRS — never from SUT observation or assumption.

Use `playwright-skill` when uncertain about UI vs API testability.

### Step 5 — Write Phase 1 to `spec.md`

Create `docs/scenarios/{scenario-id}/spec.md`. Write Phase 1 section only (flow table and notes, no test data). Use the **Output Format** defined below.

### Step 6 — Human Gate A

> "Phase 1 complete. Scenario flow written to `docs/scenarios/{scenario-id}/spec.md`. Please review the flow against `docs/sut/srs.md`:
>
> - Does the flow structure match the coverage label ({coverage label})?
> - For Negative scenarios: is the violation step present with the correct rejection response per the SRS?
> - For Security & Misuse scenarios: does the flow simulate a realistic attack sequence?
> - Does every requirement in Primary FR Coverage have at least one step testing it?
> - Are all expected responses derived from the SRS?
>
> Reply **APPROVED** to proceed to Phase 2, or **REJECTED** with specific feedback."

- If **APPROVED** → proceed to Phase 2
- If **REJECTED** → revise the flow, update Phase 1 in `spec.md`, repeat Gate A

### Phase 2 — Test Data Design

### Step 7 — Identify Technique-Applicable Steps

For each step in the approved Phase 1 flow, determine which technique applies using the technique selection table in **Theoretical Foundations**.

### Step 8 — Apply Techniques Silently

Invoke `functional-test-design` silently. Apply the appropriate technique per step. Extract only the final input value sets — do not print analysis.

### Step 9 — Build the Test Data Matrix

For each technique-applicable step, produce a variant table. Verify before writing:

- No equivalence class has more than one representative
- Decision Table has exactly N+1 combinations for N conditions
- State Transition covers valid transitions, invalid transitions, and terminal states
- Error Guessing covers all attack vectors relevant to this scenario type

Steps with no applicable technique get a note: "No technique applicable — step is fully specified by Phase 1."

### Step 10 — Update `spec.md` with Phase 2

Add the test data matrix to the Phase 2 section of `spec.md`. Do not modify the Phase 1 flow — only append Phase 2 content. Update the document status to `DRAFT` with Phase 2 complete.

### Step 11 — Human Gate B

> "Phase 2 complete. Full spec updated in `docs/scenarios/{scenario-id}/spec.md`. Please review the test data matrix against `docs/sut/srs.md`:
>
> - Is the technique selection correct for each step?
> - For Negative scenarios: does the matrix cover the specific constraint that triggers rejection and its boundary value?
> - For Security & Misuse scenarios: does Error Guessing cover all relevant attack vectors?
> - Are Decision Table combinations complete for multi-condition rules?
> - Are State Transition triggers aligned with the state machine in the SRS?
>
> Reply **APPROVED** to finalize the spec and proceed to `wat-build`, or **REJECTED** with specific feedback."

- If **APPROVED** → update status to `APPROVED`; spec is ready for `wat-build`
- If **REJECTED** → revise Phase 2, repeat Gate B until `APPROVED`

## Output Format — `docs/scenarios/{scenario-id}/spec.md`

```markdown
# Scenario Specification: {Scenario Name}

**Scenario ID:** SC-XX  
**Coverage Label:** Happy Path / Negative / Error Recovery / Security & Misuse  
**Actor:** {actor from scope document}  
**Project:** {Project Name}  
**Created:** {YYYY-MM-DD}  
**Last Updated:** {YYYY-MM-DD}  
**Status:** DRAFT | APPROVED  
**Approved By:** {filled in by human after Gate B approval}

## 1. Scenario Overview

| Field                         | Value                                         |
| ----------------------------- | --------------------------------------------- |
| **Scenario ID**               | SC-XX                                         |
| **Name**                      | {Descriptive name}                            |
| **Coverage Label**            | {label}                                       |
| **Actor**                     | {actor}                                       |
| **Objective**                 | {One sentence from scope document}            |
| **Primary FR Coverage**       | {functional requirements}                     |
| **GUI Requirements Verified** | {GUI/UX requirements — additional assertions} |
| **Dependency FRs**            | {precondition requirements}                   |
| **Test Layer**                | UI / API / UI + API                           |
| **Priority**                  | Critical / High / Medium                      |

## 2. Preconditions

List all conditions that must be true before the scenario begins:

- {Condition 1 — system state, data, actor state}
- {Condition 2}
- ...

## 3. Scenario Flow

> **Phase 1 Status:** DRAFT | APPROVED (Gate A)

| Step | Action   | Actor   | Precondition    | Expected Response     | Test Layer |
| ---- | -------- | ------- | --------------- | --------------------- | ---------- |
| 1    | {action} | {actor} | {precondition}  | {response — from SRS} | UI         |
| 2    | {action} | {actor} | Step 1 complete | {response — from SRS} | API        |
| 3    | {action} | {actor} | Step 2 complete | {response — from SRS} | UI + API   |
| ...  |          |         |                 |                       |            |

**Notes:**

- {SRS-derived text, constraints, or state rules not captured in the table}
- {For Negative: which step is the violation step and what the SRS says about the response}
- {For Security & Misuse: which step is the critical defense point}

## 4. Test Data Matrix

> **Phase 2 Status:** DRAFT | APPROVED (Gate B)

### Step {N} — {Step Title} [Domain Testing — EP + BVA] `[data-driven]`

> **Implementation annotation:** `[data-driven]` — all variants share the same form submission flow; implement as a `for...of` loop in the validation spec.

| Variant ID | Technique               | Test Payload (All required fields) | Expected Outcome   |
| ---------- | ----------------------- | ---------------------------------- | ------------------ |
| S{N}.V1    | EP (valid)              | {full valid payload}               | {outcome from SRS} |
| S{N}.V2    | EP (invalid — {reason}) | {value}                            | {error from SRS}   |
| S{N}.V3    | BVA (on-point)          | {value}                            | {outcome}          |
| S{N}.V4    | BVA (off-point)         | {value}                            | {error}            |

### Step {M} — {Step Title} [Decision Table — {N} conditions] `[separate-test]`

> **Implementation annotation:** `[separate-test]` — each combination requires its own precondition state; implement as individual `test()` blocks in the validation spec.

| Variant ID | C1: {condition} | C2: {condition} | Expected Outcome |
| ---------- | --------------- | --------------- | ---------------- |
| S{M}.V1    | TRUE            | TRUE            | {success}        |
| S{M}.V2    | FALSE           | TRUE            | {failure — C1}   |
| S{M}.V3    | TRUE            | FALSE           | {failure — C2}   |

### Step {P} — {Step Title} [State Transition] `[separate-test]`

> **Implementation annotation:** `[separate-test]` — each variant starts from a different system state; implement as individual `test()` blocks.

| Variant ID | Current State | Trigger       | Expected Next State | Valid?  |
| ---------- | ------------- | ------------- | ------------------- | ------- |
| S{P}.V1    | {state}       | {trigger}     | {next state}        | Valid   |
| S{P}.V2    | {state}       | {trigger}     | Rejected            | Invalid |
| S{P}.V3    | {terminal}    | {any trigger} | Rejected — terminal | Invalid |

### Step {Q} — {Step Title} [Error Guessing] `[data-driven]`

> **Implementation annotation:** `[data-driven]` — all auth-boundary variants target the same endpoint with different Authorization headers; implement as a `for...of` loop in the API spec.

| Variant ID | Attack Vector            | Test Payload (All required fields)   | Expected Defense          |
| ---------- | ------------------------ | ------------------------------------ | ------------------------- |
| S{Q}.V1    | No auth token            | Request without Authorization header | 401 per SRS               |
| S{Q}.V2    | Wrong role               | User token on privileged endpoint    | 403 per SRS               |
| S{Q}.V3    | Manipulated client value | {crafted value}                      | Server rejects/recomputes |

## 5. Implementation Notes

{Optional: locator hints, known SRS-documented SUT behaviors, isolation considerations}
```

## Quality Checklist

### Before Gate A (Phase 1)

- [ ] Coverage label from scope document is reflected in the flow structure.
- [ ] For Negative: the violation step is present with the SRS-specified rejection response.
- [ ] For Error Recovery: both error occurrence and recovery are in the same flow.
- [ ] For Security & Misuse: flow simulates a realistic attack sequence.
- [ ] Every requirement in Primary FR Coverage has at least one step testing it.
- [ ] Every expected response is derived from the SRS — no invented or assumed values.
- [ ] Every step has all five elements.
- [ ] Steps requiring server-side verification have `API` in their test layer.
- [ ] Phase 1 section is complete; Phase 2 section is absent.

### Before Gate B (Phase 2)

- [ ] Technique selection matches each step's characteristics.
- [ ] For Negative: EP covers the specific invalid class that triggers rejection and its boundary.
- [ ] For Security & Misuse: Error Guessing covers all auth boundaries and trust violations.
- [ ] EP: exactly one value per class — no redundant representatives.
- [ ] BVA: on-point and off-point for every numeric boundary.
- [ ] Decision Table: N+1 combinations for N conditions.
- [ ] State Transition: valid, invalid, and terminal-state triggers all present.
- [ ] Every variant's expected outcome is derived from the SRS.
- [ ] Every variant includes a complete, executable test payload (all fields required to trigger the action), not just isolated target values.
- [ ] Steps with no applicable technique have an explicit "No technique applicable" note.
- [ ] Every variant group has exactly one implementation annotation: `[data-driven]` or `[separate-test]`.
- [ ] No cross-feature variant matrix exists — each feature boundary's variants are annotated independently.
- [ ] The E2E flow (Phase 1) uses only valid data at every step — no variant inputs injected into the main flow.

## Completion Criteria

1. `docs/scenarios/{scenario-id}/spec.md` has status `APPROVED`
2. Both Gate A and Gate B received explicit `APPROVED` responses
3. Every step has either a variant table or an explicit no-technique note
4. Human informed that spec is ready for `wat-build`

## Constraints

**MUST do:**

- Read the Coverage Label from the scope document before designing any step
- Read the SRS and API spec before designing the flow
- Design flow structure according to the coverage label
- Invoke `functional-test-design` silently in Phase 2
- Derive all expected values from the SRS
- Write Phase 1 before presenting Gate A
- Update `spec.md` with Phase 2 before presenting Gate B
- Stop at each gate and wait for explicit `APPROVED` or `REJECTED`

**MUST NOT do:**

- Design a Negative or Security scenario as a happy path with one failing step
- Print `functional-test-design` analysis
- Invent expected values not in the SRS
- Mark the document as `APPROVED`
- Proceed past any gate without explicit `APPROVED`
- Reference `playwright-automation-plan.md`
