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

- The full E2E flow as a sequence of user actions and system responses
- The expected outcome at each step
- The test layer (UI or API) for each step
- The test data matrix — input value sets derived from functional test design techniques

The output (`spec.md`) is the **implementation contract** for `wat-build`. No test code may be written without an `APPROVED` spec.

## Input

| Source                            | Location                        | Purpose                                                              |
| --------------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| Approved scope document           | `docs/test-scope.md`            | Identifies which scenario to specify (SC-XX) and which FRs it covers |
| System Requirements Specification | `docs/sut/srs.md`               | Source of truth for expected behavior at each step                   |
| API Contract                      | `docs/sut/api-specification.md` | Endpoint details for API-layer steps                                 |

**Required before starting:** `docs/test-scope.md` must have status `APPROVED`. If it is still `DRAFT`, stop and instruct the human to complete `wat-scope` first.

## Output

| Artifact               | Location                               | Status on Creation                   |
| ---------------------- | -------------------------------------- | ------------------------------------ |
| Scenario specification | `docs/scenarios/{scenario-id}/spec.md` | `DRAFT` until human approves Phase 2 |

The `docs/scenarios/{scenario-id}/` directory must be created if it does not exist. The scenario-id format matches the scope document: e.g., `SC-01-auth-flow`.

## External Skills Invoked

| Skill                    | When                                               | What to extract                                                                        |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `playwright-skill`       | Phase 1 — when assigning test layer per step       | Confirms whether a behavior is testable via UI locators or requires APIRequestContext. |
| `functional-test-design` | Phase 2 — for each step with input, rule, or state | Input value sets only — never full test cases. Perform analysis silently.              |

## Theoretical Foundations

### Phase 1: Scenario Flow Design — Scenario Testing Approach

Scenario Testing at the design level (distinct from scenario identification in `wat-scope`) means designing a test that reflects a **complete, realistic user journey** through the system. The following principles govern flow design:

#### Core Principles

1. **User goal orientation:** Every scenario must start from a user's stated goal and end when that goal is achieved, rejected, or interrupted. Never design from a function list. Ask: _"What is this user trying to accomplish?"_
2. **Realistic sequencing:** Steps must follow the natural order a real user would take. Do not skip preconditions or inject state artificially. If a user must be logged in to reach the cart, login is a step — not an assumption.
3. **State continuity:** Each step builds on the state left by the previous step. The scenario uses a single browser context (or API session) throughout. Shared state is what makes scenarios catch integration defects.
4. **Error paths within the journey:** If a realistic user journey involves encountering an error and recovering (e.g., entering a wrong coupon then a correct one), that error path is part of the main flow, not a separate negative test. Separate negative tests are only for isolated validation checks with no journey context.
5. **Observable outcomes:** Every step must end with a system response that can be asserted. If a step has no observable outcome, it is either incomplete in the SRS or should be merged with the next step.

#### Step Anatomy

Each step in the E2E flow must specify all five elements:

| Element               | Description                        | Example                                               |
| --------------------- | ---------------------------------- | ----------------------------------------------------- |
| **Action**            | What the user or system does       | User submits the registration form                    |
| **Actor**             | Who performs the action            | Customer / Admin / System                             |
| **Precondition**      | What must be true before this step | User is on `/register` page, form is filled           |
| **Expected Response** | What the system does in response   | System creates account, redirects to `/login`         |
| **Test Layer**        | How this step is verified          | UI E2E (observe redirect) + API (verify user created) |

#### Test Layer Assignment per Step

Use `playwright-skill` to confirm testability when uncertain.

| Assign UI E2E when…                                                        | Assign API when…                                                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Behavior is visible in the browser (redirect, toast, badge, error message) | Behavior is enforced server-side regardless of UI (auth check, data recomputation, role validation) |
| The step involves user interaction (fill, click, navigate)                 | The step verifies a security constraint (unauthorized access returns 403)                           |
| The assertion requires a rendered DOM element                              | The step verifies response schema, status code, or header                                           |

A step can have both UI E2E and API layers when the UI shows feedback AND the server must independently enforce the rule (e.g., checkout — UI shows success, API must verify backend recomputed total).

#### Using `test.step()` Structure

Design the flow with `test.step()` grouping in mind. Each logical phase of the journey becomes a named step. This maps directly to Playwright's `test.step()` in implementation:

```
Step 1: [Setup] Navigate to registration page
Step 2: [Action] Fill and submit registration form
Step 3: [Verification] Confirm redirect to login page
Step 4: [Action] Login with newly registered credentials
Step 5: [Verification] Confirm authenticated session
Step 6: [Action] Add product to cart
...
```

### Phase 2: Test Data Design — Functional Test Design Techniques

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

#### Output Format for Test Data Matrix

For each step where a technique applies, produce a compact table:

```md
| Variant ID | Technique                   | Input / Trigger | Expected Outcome |
| ---------- | --------------------------- | --------------- | ---------------- |
| {step}.V1  | EP (valid)                  | {value}         | {outcome}        |
| {step}.V2  | EP (invalid - wrong format) | {value}         | {outcome}        |
| {step}.V3  | BVA (on-point)              | {value}         | {outcome}        |
| {step}.V4  | BVA (off-point)             | {value}         | {outcome}        |
| ...        | ...                         | {value}         | {outcome}        |
```

Each variant in this table becomes one `test()` block in the implementation.

## Workflow

### Phase 1 — E2E Flow Design

**Step 1 — Verify prerequisites**

Check that `docs/test-scope.md` exists and has status `APPROVED`. If not, stop:

> "The scope document at `docs/test-scope.md` is not yet `APPROVED`. Please complete `wat-scope` before running `wat-spec`."

**Step 2 — Read the target scenario from the scope document**

Identify the scenario ID provided by the human. Read its entry in `docs/test-scope.md`:

- Scenario name
- Primary FR coverage list
- Dependency FRs
- Test layer
- Priority

**Step 3 — Read all relevant SRS sections**

Read `docs/sut/srs.md` — focus on every FR listed as primary coverage for this scenario. **Extract:** required behavior, validation rules, state machine definitions, security constraints, and any explicit error messages or UI text specified in the SRS.

**Step 4 — Read relevant API contracts**

Read `docs/sut/api-specification.md` — identify endpoints relevant to this scenario. **Note:** request shapes, required authentication headers, expected response formats, and HTTP status codes for success and error cases.

**Step 5 — Design the E2E flow**

Apply the Scenario Testing principles from the Theoretical Foundations section. Design the complete step sequence for the scenario's primary user journey, including realistic error paths that a real user would encounter and recover from within the same session.

For each step, specify all five elements: Action, Actor, Precondition, Expected Response, Test Layer.

Use `playwright-skill` when uncertain about whether a behavior is testable via UI or requires the API layer.

**Step 6 — Write Phase 1 to `spec.md`**

Create `docs/scenarios/{scenario-id}/spec.md`. Write the Phase 1 section only (flow steps, no test data yet). Use the Output Format defined below.

**Step 7 — Human Gate A**

Present the following message exactly:

> "Phase 1 complete. E2E flow written to `docs/scenarios/{scenario-id}/spec.md`. Please review the flow against `docs/sut/srs.md`:
>
> - Does the step sequence reflect a realistic user journey?
> - Is every SRS requirement for this scenario covered by at least one step?
> - Are the expected responses derived from the SRS (not assumed)?
> - Are the test layer assignments correct?
>
> Reply **APPROVED** to proceed to Phase 2 (test data design), or **REJECTED** with specific feedback so I can revise the flow."

- If **APPROVED** → proceed to Phase 2
- If **REJECTED** → revise the flow based on feedback, update `spec.md` Phase 1 section, and repeat Gate A until `APPROVED`

### Phase 2 — Test Data Design

**Step 8 — Identify technique-applicable steps**

Review each step from the approved Phase 1 flow. For each step, determine which techniques apply using the rules in the Theoretical Foundations section.

**Step 9 — Apply techniques silently and extract input value sets**

For each technique-applicable step, invoke `functional-test-design` silently. Do not print analysis steps, partition identification, or technique walkthroughs. Extract only the final input value sets according to the selection rules.

**Step 10 — Build the test data matrix**

For each technique-applicable step, produce the variant table (Variant ID, Technique, Input/Trigger, Expected Outcome).

Verify the matrix against these constraints before writing:

- Every invalid class has exactly one representative — no duplicates
- Every boundary has an on-point and off-point value
- Decision Table has N+1 combinations for N conditions
- State Transition covers all valid, invalid, and terminal-state triggers
- Error Guessing covers integration boundaries and security constraints specific to this scenario

**Step 11 — Update `spec.md` with Phase 2**

Add the test data matrix to the Phase 2 section of `spec.md`. Do not modify the Phase 1 flow — only append Phase 2 content. Update the document status to `DRAFT` with Phase 2 complete.

**Step 12 — Human Gate B**

Present the following message exactly:

> "Phase 2 complete. Full spec updated in `docs/scenarios/{scenario-id}/spec.md`. Please review the test data matrix against `docs/sut/srs.md`:
>
> - Does each variant correctly correspond to a distinct equivalence class or boundary?
> - Are the Decision Table combinations complete for multi-condition rules?
> - Are the State Transition triggers aligned with the state machine in the SRS?
> - Are security and integration boundaries covered by Error Guessing variants?
>
> Reply **APPROVED** to finalize the spec and proceed to `wat-build`, or **REJECTED** with specific feedback so I can revise the data design."

- If **APPROVED** → update document status to `APPROVED`, confirm readiness for `wat-build`
- If **REJECTED** → revise the matrix based on feedback, update `spec.md` Phase 2 section, and repeat Gate B until APPROVED

## Output Format — `docs/scenarios/{scenario-id}/spec.md`

```markdown
# Scenario Specification: {Scenario ID} — {Scenario Name}

**Project:** {Project Name}  
**SUT Version:** {version from SRS if available}  
**Created:** {YYYY-MM-DD}  
**Last Updated:** {YYYY-MM-DD}  
**Status:** DRAFT | APPROVED  
**Approved By:** {filled in by human after Gate B approval}

## 1. Scenario Overview

| Field                   | Value                                                 |
| ----------------------- | ----------------------------------------------------- |
| **Scenario ID**         | SC-XX                                                 |
| **Name**                | {Descriptive name}                                    |
| **Primary FR Coverage** | FR-XX, FR-YY, SEC-ZZ                                  |
| **Dependency FRs**      | FR-AA (precondition)                                  |
| **Test Layer**          | UI E2E + API                                          |
| **Priority**            | Critical / High / Medium                              |
| **Goal**                | {One sentence: what the user is trying to accomplish} |

## 2. Preconditions

List all conditions that must be true before the scenario begins:

- {e.g., SUT is running at localhost:5173 and localhost:3000}
- {e.g., Default test accounts exist: test@eshop.com / Test1234!}
- {e.g., At least one product exists in the database}

## 3. E2E Flow (Phase 1)

> **Status:** DRAFT | APPROVED (Gate A)

| Step | Action               | Actor    | Precondition        | Expected Response | Test Layer   |
| ---- | -------------------- | -------- | ------------------- | ----------------- | ------------ |
| 1    | {action description} | Customer | {what must be true} | {system response} | UI E2E       |
| 2    | {action description} | Customer | Step 1 complete     | {system response} | UI E2E + API |
| 3    | {action description} | System   | Step 2 complete     | {system response} | API          |
| ...  |                      |          |                     |                   |              |

**Notes:**

- {Any SRS-derived constraints on the flow not captured in the table}
- {Expected UI text or error messages derived from the SRS}

## 4. Test Data Matrix (Phase 2)

> **Status:** DRAFT | APPROVED (Gate B)

### Step {N} — {Step Title} [{technique(s) applied}]

| Variant ID | Technique               | Input / Trigger | Expected Outcome |
| ---------- | ----------------------- | --------------- | ---------------- |
| S{N}.V1    | EP (valid)              | {value}         | {expected}       |
| S{N}.V2    | EP (invalid — {reason}) | {value}         | {expected error} |
| S{N}.V3    | BVA (on-point)          | {value}         | {expected}       |
| S{N}.V4    | BVA (off-point invalid) | {value}         | {expected error} |

### Step {M} — {Step Title} [Decision Table]

| Variant ID | C1: {condition} | C2: {condition} | C3: {condition} | Expected Outcome    |
| ---------- | --------------- | --------------- | --------------- | ------------------- |
| S{M}.V1    | TRUE            | TRUE            | TRUE            | {full success}      |
| S{M}.V2    | FALSE           | TRUE            | TRUE            | {failure due to C1} |
| S{M}.V3    | TRUE            | FALSE           | TRUE            | {failure due to C2} |
| S{M}.V4    | TRUE            | TRUE            | FALSE           | {failure due to C3} |

### Step {P} — {Step Title} [State Transition]

| Variant ID | Current State    | Trigger         | Expected Next State | Valid?  |
| ---------- | ---------------- | --------------- | ------------------- | ------- |
| S{P}.V1    | {state}          | {trigger input} | {next state}        | Valid   |
| S{P}.V2    | {state}          | {trigger input} | Rejected            | Invalid |
| S{P}.V3    | {terminal state} | {any trigger}   | Rejected — terminal | Invalid |

### Step {Q} — {Step Title} [Error Guessing]

| Variant ID | Attack Vector                         | Input / Trigger              | Expected Defense             |
| ---------- | ------------------------------------- | ---------------------------- | ---------------------------- |
| S{Q}.V1    | Client-supplied {field} manipulation  | {crafted value}              | Backend recomputes / rejects |
| S{Q}.V2    | Unauthenticated request to {endpoint} | No token                     | 401 Unauthorized             |
| S{Q}.V3    | Wrong role accessing {endpoint}       | User token on admin endpoint | 403 Forbidden                |

## 5. Implementation Notes

{Optional: any additional context for wat-build that is not captured in the tables above. Examples: specific locator hints from the SRS UI description, known SUT quirks documented in the SRS, test isolation considerations.}
```

## Quality Checklist

Run this checklist before presenting Gate A and Gate B to the human.

### Before Gate A (Phase 1 complete)

**Flow completeness:**

- [ ] Every FR listed as primary coverage for this scenario has at least one step that directly tests its required behavior.
- [ ] The flow starts from a realistic user entry point (not from an artificial mid-flow state).
- [ ] The flow ends with a verifiable system state or outcome.
- [ ] Error paths that are part of a realistic user journey are included in the main flow, not left for separate negative tests.

**Step quality:**

- [ ] Every step has all five elements: Action, Actor, Precondition, Expected Response, Test Layer.
- [ ] Expected responses are derived from `docs/sut/srs.md` — no invented or assumed values.
- [ ] Test layer assignments follow the rules in the Theoretical Foundations section.
- [ ] Steps that require server-side verification have API in their test layer.

**Document format:**

- [ ] All contents are in English and follow the specified markdown structure.
- [ ] File created at `docs/scenarios/{scenario-id}/spec.md`.
- [ ] Metadata is complete (Scenario ID, Created date, Status = DRAFT).
- [ ] Phase 2 section is absent or clearly marked as not yet complete.

### Before Gate B (Phase 2 complete)

**Technique application:**

- [ ] Every step with user input has Domain Testing applied.
- [ ] Every step with a multi-condition business rule has Decision Table applied.
- [ ] Every step with a stateful workflow has State Transition applied.
- [ ] Every security boundary and integration point has Error Guessing applied.
- [ ] No technique was applied silently without its output appearing in the matrix.

**Input value set correctness:**

- [ ] EP: exactly one value per equivalence class — no class has multiple representatives.
- [ ] BVA: on-point and off-point values present for every numeric boundary.
- [ ] Decision Table: `N+1` combinations for `N` conditions (not fewer, not `2^N`).
- [ ] State Transition: covers all valid transitions, all invalid transitions, and all terminal state exits.
- [ ] Error Guessing: integration boundaries and auth/role checks are present.

**Variant completeness:**

- [ ] Every variant has a distinct expected outcome.
- [ ] No two variants are identical in both input and expected outcome.
- [ ] Variant IDs are unique and follow `S{step}.V{n}` format.

## Completion Criteria

This skill is complete when:

1. `docs/scenarios/{scenario-id}/spec.md` exists with status `APPROVED`
2. Both Gate A and Gate B have received explicit `APPROVED` responses from the human
3. Every step in the flow has either a technique-driven data matrix or an explicit note that no technique applies
4. The human has been informed that the spec is ready for `wat-build`

## Constraints

**MUST do:**

- Verify `docs/test-scope.md` is `APPROVED` before starting.
- Read `docs/sut/srs.md` and `docs/sut/api-specification.md` before designing the flow.
- Derive all expected values from `docs/sut/srs.md` — never from SUT behavior or assumption.
- Invoke `functional-test-design` silently — surface only final input value sets.
- Write Phase 1 to `spec.md` before presenting Gate A.
- Update `spec.md` with Phase 2 before presenting Gate B.
- Stop at each human gate and wait for explicit `APPROVED` or `REJECTED`.

**MUST NOT do:**

- Begin Phase 2 before Gate A is `APPROVED`.
- Write test code — that is `wat-build`'s responsibility.
- Invent expected values not present in `docs/sut/srs.md`.
- Print `functional-test-design` analysis steps or technique walkthroughs to screen or file.
- Apply a technique to a step and omit its output from the spec.
- Mark the document as `APPROVED` — only the human can approve.
- Proceed to `wat-build` without Gate B being explicitly `APPROVED`.
- Reference `playwright-automation-plan.md` — that file is for human reference only.
- Modify any file other than `docs/scenarios/{scenario-id}/spec.md`.
