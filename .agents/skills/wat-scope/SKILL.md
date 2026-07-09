---
name: wat-scope
description: >
  Web Automation Testing — Scope Analysis command skill. Invoke this skill when the user
  wants to analyze a System Requirements Specification (SRS) and produce a structured test
  scope document defining all E2E scenarios, FR-to-layer mapping, and priorities before any
  test specification or implementation begins. This skill runs ONCE at project start.
  Trigger phrases: "wat-scope", "/wat-scope", "analyze test scope", "define test scenarios",
  "identify what to test", "produce scope document", "map requirements to test scenarios".
---

# wat-scope — Web Automation Testing Scope Analysis

## Purpose

Analyze the project's SRS and API specification to produce a **single authoritative scope document** (`docs/test-scope.md`) that defines:

- Every E2E scenario the automation suite must cover, classified by type
- Which functional requirements each scenario covers
- Which test layer (UI E2E / API / both) applies to each scenario
- The priority of each scenario

This document is the **entry point for all subsequent `wat-spec` invocations**. No scenario specification or test implementation may begin without an `APPROVED` scope document.

## Input

| Source                            | Location                        | Purpose                                         |
| --------------------------------- | ------------------------------- | ----------------------------------------------- |
| System Requirements Specification | `docs/sut/srs.md`               | Source of truth for all testable requirements   |
| API Contract                      | `docs/sut/api-specification.md` | Identifies which FRs have backend API endpoints |

Read both files in full before beginning analysis.

## Output

| Artifact            | Location             | Status                |
| ------------------- | -------------------- | --------------------- |
| Test scope document | `docs/test-scope.md` | Created by this skill |

## External Skills Invoked

| Skill                  | When                             | How                                                                                                                                             |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `scenario-test-design` | Step 4 — scenario identification | Invoke silently. Do not print analysis, technique walkthroughs, or intermediate steps. Extract only the final scenario list classified by type. |

## Theoretical Foundations

### Scenario Types

Every E2E scenario must be classified by type. This classification drives how `wat-spec` will later design the flow for that scenario.

| Type                        | Description                                                                                                                 | Example                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Happy Path (HP)**         | Primary success flow with valid data and normal conditions                                                                  | Customer completes checkout successfully                          |
| **Negative (NEG)**          | Invalid input, violated business rule, or system rejection that is part of a realistic user journey spanning multiple steps | Account lockout after 3 failed logins → OTP recovery → re-login   |
| **Edge Case (EC)**          | Boundary condition or unusual but valid state                                                                               | Checkout with order total exactly at coupon minimum threshold     |
| **Error Recovery (ER)**     | User encounters an error mid-journey and recovers within the same session                                                   | Wrong coupon entered → corrected → checkout succeeds              |
| **Security & Misuse (SEC)** | Disfavored user attempting to exploit the system across multiple steps                                                      | User-role token calling admin endpoints → role escalation attempt |

**Important:** Negative, Error Recovery, and Security scenarios are **independent scenarios** with their own journeys — they are NOT alternative flows or branches within a happy path scenario. Each has its own start state, sequence, and verifiable outcome.

### What Makes a Good E2E Scenario

An E2E scenario represents a **complete, realistic user journey** through the system. It must satisfy all of the following criteria:

1. **Business goal oriented** — The scenario accomplishes something meaningful from a user or business perspective (e.g., "a customer successfully purchases a product").
2. **Cross-feature** — It spans at least two distinct functional areas or FR groups. A scenario that tests only one FR in isolation is not an E2E scenario — it is a unit or integration test.
3. **Realistic sequence** — The steps follow the natural order a real user would take. Preconditions are implicit in the journey, not artificially injected.
4. **Verifiable outcome** — It ends with a system state that can be asserted (order created, email sent, status updated, access denied).
5. **Independently executable** — Each scenario can run without depending on the output of another scenario.
6. **Single primary flow** — The scenario does not combine multiple independent journeys.

### Test Layer Assignment Rules

| Layer          | When to Assign                                                                                                                  | Rationale                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `UI E2E`       | FR describes user-visible behavior, visual feedback, navigation, form interaction, or UI state                                  | These behaviors can only be verified through a real browser rendering the UI                           |
| `API`          | FR describes authorization rules, data validation enforced at server, business logic independent of UI, or security constraints | These behaviors must be verified at the HTTP layer because the UI cannot be trusted to enforce them    |
| `UI E2E + API` | FR has both user-visible behavior AND server-side enforcement that must be independently verified                               | The UI test verifies the happy path; the API test verifies the security/validation constraint directly |

**Key principle:** If a requirement says the backend MUST enforce something, assign `API` regardless of whether it also has a UI flow. Server-side enforcement is only testable at the API layer.

### Priority Assignment Rules

Assign priority based on **business impact of failure**, not implementation complexity:

| Priority     | Criteria                                                                                                                                         | Examples                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| **Critical** | Failure completely blocks core business function or exposes a security vulnerability. The system cannot be considered operational if this fails. | Login, checkout, payment, admin access control, authentication         |
| **High**     | Failure significantly degrades UX or breaks an important feature, but the system remains partially usable.                                       | Product search, cart management, order history, admin order management |
| **Medium**   | Failure affects a secondary feature or edge case. Core flows remain functional.                                                                  | Profile management, coupon validation, CSV import, GUI standards       |

When in doubt between Critical and High: ask "Would this defect stop a user from completing a purchase or accessing the system?" If yes → Critical.

## Workflow

### Step 1 — Read and Parse the SRS

Read `docs/sut/srs.md` in full. Extract every FR and SEC requirement with:

- Feature name
- Which actor performs it (customer, admin, system)
- Whether behavior is user-facing, server-enforced, or both
- Dependencies on other FRs

### Step 2 — Read and Cross-Reference the API Spec

Read `docs/sut/api-specification.md`. For each endpoint, note:

- Which FR it implements
- Whether the endpoint has authentication requirements
- Whether it has server-side validation that is separate from UI validation

Any FR that has a corresponding API endpoint with authentication or validation logic is a candidate for `UI E2E + API` or `API` layer assignment.

### Step 3 — Map Each FR to a Test Layer

For every FR and SEC requirement, assign a test layer using the rules in the **Theoretical Foundations** section above. Document the rationale for each non-obvious assignment.

Special handling:

- **GUI Requirements (FR-21 to FR-24):** Always `UI E2E` — these are visual and interaction standards that cannot be verified via API.
- **Security Requirements (SEC-01 to SEC-07):** Always include `API` layer — security constraints must be verified at the HTTP layer regardless of UI behavior.
- **Out-of-scope items:** Explicitly list any FR marked out of scope and state the reason.

### Step 4 — Identify All Scenarios Using `scenario-test-design`

Invoke `scenario-test-design` silently to generate a comprehensive scenario list. Do not print any analysis, technique application steps, or intermediate reasoning.

The silent invocation must:

1. Apply at minimum Techniques 2 (Actor Analysis), 3 (Disfavored Users), 7 (Specific Transactions), 4 (System Events), and 16 (Sequence Analysis) from the 16 generation techniques
2. Additionally apply Technique 1 (Object Life History) for any FR with a defined state machine
3. Produce scenarios of all relevant types: Happy Path, Negative, Edge Case, Error Recovery, and Security & Misuse
4. Ensure every FR has at least one scenario covering it as a primary target

Extract from the `scenario-test-design` output only:

- Scenario name
- Scenario type (HP / NEG / EC / ER / SEC)
- Primary FR/SEC coverage
- Actor

Then format these into the `wat-scope` output structure below.

> **Note:** `scenario-test-design` may produce a more granular scenario list than needed for this scope document. Apply deduplication and grouping: if two scenarios test the same journey from the same actor with overlapping FR coverage, merge them. The scope document represents the implementation units for `wat-spec`, not every possible test case.

### Step 5 — Assign Scenario IDs and Priorities

Assign `SC-{NN}` IDs (two-digit zero-padded). Assign priority per the rules above. **Verify consistency:** no scenario that is a precondition for a Critical scenario should be lower than High.

### Step 6 — Write `docs/test-scope.md`

Write the complete scope document using the **Output Format** section below.

### Step 7 — Human Gate

After writing the file, present the following message exactly:

> "Scope analysis complete. Scenario inventory written to `docs/test-scope.md`. Please review:
>
> - Does the scenario list include Happy Path, Negative, Error Recovery, and Security scenario types where applicable?
> - Does the scenario list cover all in-scope FRs from `docs/sut/srs.md`?
> - Is the FR-to-layer mapping correct?
> - Are the priorities appropriate?
> - Are any important user journeys missing?
>
> Reply **APPROVED** to finalize the scope and proceed to `wat-spec`, or **REJECTED** with specific feedback so I can revise."

- If **APPROVED** → update document status to `APPROVED`, confirm readiness for `wat-spec`
- If **REJECTED** → revise, update `docs/test-scope.md`, repeat Step 7 until APPROVED

## Output Format — `docs/test-scope.md`

```markdown
# Test Scope Document

**Project:** {Project Name}  
**SUT Version:** {version from SRS if available}  
**Created:** {YYYY-MM-DD}  
**Last Updated:** {YYYY-MM-DD}  
**Status:** DRAFT | APPROVED  
**Approved By:** {filled in by human after approval}

## 1. Scope Summary

### In Scope

- {component} — {URL} — {test type}

### Out of Scope

| Item   | Reason   |
| ------ | -------- |
| {item} | {reason} |

## 2. FR-to-Layer Mapping

| FR / SEC ID | Feature Name       | Test Layer   | Notes                                 |
| ----------- | ------------------ | ------------ | ------------------------------------- |
| FR-01       | {Feature Name}     | UI E2E + API | {rationale if non-obvious}            |
| SEC-01      | {Requirement Name} | API          | Security constraint — HTTP layer only |
| ...         |                    |              |                                       |

## 3. Scenario Inventory

### SC-01 — {Scenario Name}

| Field                   | Value                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| **Scenario ID**         | SC-01                                                                  |
| **Name**                | {Descriptive name: verb + object + context}                            |
| **Type**                | Happy Path / Negative / Edge Case / Error Recovery / Security & Misuse |
| **Actor**               | Customer / Admin / Attacker                                            |
| **Primary FR Coverage** | FR-XX, FR-YY, SEC-ZZ                                                   |
| **Dependency FRs**      | FR-AA (precondition — not primary target)                              |
| **Test Layer**          | UI E2E + API                                                           |
| **Priority**            | Critical / High / Medium                                               |
| **Objective**           | {One sentence: what this scenario proves or disproves}                 |

**E2E Scenario Description:** {Chain of events, user actions, and system responses. This is a high-level description, not a step-by-step test case.}

### SC-XX — {Scenario Name}

{Repeat for each scenario}

## 4. Coverage Matrix

| FR / SEC ID | Feature   | Covered By Scenario(s)  | Test Layer   |
| ----------- | --------- | ----------------------- | ------------ |
| FR-01       | {Feature} | SC-01 (HP), SC-02 (NEG) | UI E2E + API |
| FR-02       | {Feature} | SC-01 (HP), SC-03 (SEC) | UI E2E + API |
| ...         |           |                         |              |

## 5. Execution Order Recommendation

| Order | Scenario ID | Name   | Type | Priority | Reason                                     |
| ----- | ----------- | ------ | ---- | -------- | ------------------------------------------ |
| 1     | SC-XX       | {Name} | HP   | Critical | Entry point; precondition for SC-YY        |
| 2     | SC-YY       | {Name} | SEC  | Critical | No UI dependency; fast API-only validation |
| ...   |             |        |      |          |                                            |

## 6. Scenario Discovery Heuristics — Results

Record which generation techniques were applied and what they produced:

| Technique                                | Result    | Scenarios Derived |
| ---------------------------------------- | --------- | ----------------- |
| T2 — Actor Analysis                      | {summary} | SC-XX, SC-YY      |
| T3 — Disfavored Users                    | {summary} | SC-ZZ             |
| T7 — Specific Transactions               | {summary} | SC-AA, SC-BB      |
| T4 — System Events                       | {summary} | SC-CC             |
| T16 — Sequence Analysis                  | {summary} | SC-DD             |
| T1 — Object Life History (if applicable) | {summary} | SC-EE             |
| ...                                      |           |                   |
```

## Quality Checklist

Before presenting the human gate, verify every item:

**Coverage completeness:**

- [ ] Every FR from `docs/sut/srs.md` appears in the FR-to-Layer Mapping table.
- [ ] Every SEC requirement appears in the FR-to-Layer Mapping table.
- [ ] Every FR appears in at least one scenario's Primary FR Coverage.
- [ ] Out-of-scope items are explicitly listed with reasons.

**Scenario type balance:**

- [ ] At least one Happy Path scenario exists for each primary business flow.
- [ ] At least one Negative scenario exists for each significant validation rule or business constraint that spans multiple steps.
- [ ] At least one Security & Misuse scenario exists for features with access control or sensitive data.
- [ ] Zero Negative or Security scenarios is a red flag — stop and re-apply techniques.

**Scenario quality:**

- [ ] Each scenario name follows `verb + object + context` pattern.
- [ ] Each scenario has a Type assigned.
- [ ] Each scenario has a single clear Objective.
- [ ] Each scenario covers at least two FRs.
- [ ] Scenarios are independently executable.

**Layer assignment:**

- [ ] All server-side enforcement requirements have `API` in their test layer.
- [ ] All GUI/visual requirements are assigned `UI E2E`.

**Document format:**

- [ ] All contents are in English and follow the specified markdown structure.
- [ ] Status is `DRAFT`.
- [ ] Section 6 (Heuristics Results) is populated — not left blank.
- [ ] Coverage Matrix shows which scenario types cover each FR.

## Constraints

**MUST do:**

- Read `docs/sut/srs.md` and `docs/sut/api-specification.md` in full before any output.
- Invoke `scenario-test-design` silently in Step 4.
- Produce scenarios of multiple types — never only Happy Path.
- Write the output to `docs/test-scope.md` before presenting the human gate.
- Set document status to `DRAFT`.

**MUST NOT do:**

- Print `scenario-test-design` analysis or technique walkthroughs.
- Begin scenario flow design — that is `wat-spec`'s responsibility.
- Define test steps, test data, or expected outcomes.
- Invent requirements not in `docs/sut/srs.md`.
- Mark the document as `APPROVED`.
- Produce a scope with only Happy Path scenarios.
- Reference `playwright-automation-plan.md`.
