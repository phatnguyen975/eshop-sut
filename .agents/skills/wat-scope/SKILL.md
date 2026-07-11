---
name: wat-scope
description: >
  Web Automation Testing — Scope Analysis command skill. Invoke this skill when the user
  wants to analyze project requirements and produce a structured test scope document
  defining all automation scenarios, requirement-to-layer mapping, and priorities before
  any test specification or implementation begins. This skill runs ONCE at project start.
  Trigger phrases: "wat-scope", "/wat-scope", "analyze test scope", "define test scenarios",
  "identify what to test", "produce scope document", "map requirements to scenarios".
---

# wat-scope — Web Automation Testing Scope Analysis

## Purpose

Analyze the project's SRS and API specification to produce a **single authoritative scope document** (`docs/test-scope.md`) that defines:

- Every scenario the automation suite must cover, with coverage label and execution mode
- Which functional requirements each scenario covers
- Which test layer (UI / API / both) applies to each scenario
- The priority of each scenario

This document is the **entry point for all subsequent `wat-spec` invocations**. No scenario specification or implementation may begin without an APPROVED scope document.

## Input

| Source                            | Location                        | Purpose                                                                          |
| --------------------------------- | ------------------------------- | -------------------------------------------------------------------------------- |
| System Requirements Specification | `docs/sut/srs.md`               | Source of truth for all testable requirements                                    |
| API Contract                      | `docs/sut/api-specification.md` | Identifies which requirements have backend endpoints and server-side constraints |

Read both files in full before beginning any analysis.

## Output

| Artifact            | Location             | Status on Creation           |
| ------------------- | -------------------- | ---------------------------- |
| Test scope document | `docs/test-scope.md` | `DRAFT` until human approves |

## External Skills Invoked

| Skill                  | When                             | How                                                                                                                                                         |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scenario-test-design` | Step 3 — scenario identification | Invoke silently. Do not print analysis, technique walkthroughs, or intermediate steps to screen. Extract only the final scenario list with coverage labels. |

## Theoretical Foundations

### What Makes a Valid Automation Scenario

In web automation testing, a scenario represents a **complete user journey** — a connected sequence of actions spanning multiple functional areas that a real actor would perform to accomplish a business goal. This reflects how defects actually occur in web applications: most bugs manifest at the **integration point between features**, not within a single feature in isolation.

**A valid automation scenario must:**

1. **Span multiple functional features** — involve at least two distinct functional capabilities. A scenario covering only one functional capability is a unit or integration test, not a user journey scenario. The exception is a single-feature scenario where that feature itself has a rich multi-step stateful workflow (for example, an order state machine with multiple transitions, retries, and terminal states) — provided a stakeholder would recognize it as a meaningful user story.
2. **Reflect realistic user behavior** — steps follow the natural sequence a real actor would take. State carries forward from step to step within the same session.
3. **Have a verifiable business outcome** — ends with an assertable system state that confirms the goal was achieved, correctly rejected, or correctly blocked.
4. **Be independently executable** — requires no output from another scenario to run.
5. **Be told as a user story** — Cem Kaner's original criterion: if a scenario cannot be told as a credible story that a stakeholder would find meaningful, it is not a scenario — it is a checklist item.

### GUI/UX Standards Are Cross-Cutting Requirements

The SRS includes GUI/UX requirements that apply across the system. These are **cross-cutting concerns**, not functional features. They do not contribute to forming a scenario — they are verified as additional assertions within scenarios designed around functional features.

When a scenario naturally exercises a functional feature that has GUI/UX requirements associated with it, those GUI/UX requirements are noted in the scenario's "GUI Requirements Verified" field — they are not listed as primary coverage.

### Coverage Labels

Scenarios are tagged with coverage labels to make gaps visible at a glance. These labels map to the generation techniques used to discover them:

| Coverage Label        | What It Signals                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **Happy Path**        | Primary success flow delivering the intended business benefit end to end                                |
| **Negative**          | Actor violates a business rule or constraint; system must respond correctly across a multi-step journey |
| **Error Recovery**    | An error occurs mid-journey; user recovers and completes the goal within the same session               |
| **Security & Misuse** | A disfavored actor attempts to exploit, bypass, or abuse the system across a multi-step sequence        |

A suite with zero Negative or Security & Misuse scenarios almost certainly has coverage gaps regardless of scenario count.

### Execution Mode

Not every scenario identified by `scenario-test-design` is a candidate for automation. Evaluate each scenario against these criteria:

| Automate when                                                         | Keep as Manual when                                                        |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Deterministic flow with clear pass/fail criteria                      | Pass/fail depends on subjective human judgment                             |
| High regression risk — run frequently                                 | Executed rarely; automation cost exceeds value                             |
| Multi-step stateful flow where scripted assertions provide confidence | Exploratory or usability testing requiring human creativity                |
| Security scenarios with exact HTTP-level assertions                   | Requires real external system interaction impractical to reproduce in test |

Only Automation scenarios are included in the scope document. Manual scenarios may be noted in a separate section for reference.

### Test Layer Assignment

| Layer      | When to Assign                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| `UI`       | Behavior is verified through a real browser — visual feedback, navigation, form interaction, rendered DOM state |
| `API`      | Behavior is enforced server-side — authorization, role validation, server-computed values, security constraints |
| `UI + API` | The scenario has both user-visible behavior AND server-side enforcement that must be independently verified     |

### Priority Assignment Rules

Assign priority based on **business impact of failure**, not implementation complexity:

| Priority     | Criteria                                                                                                                                         | Examples                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| **Critical** | Failure completely blocks core business function or exposes a security vulnerability. The system cannot be considered operational if this fails. | Login, checkout, payment, admin access control, authentication         |
| **High**     | Failure significantly degrades UX or breaks an important feature, but the system remains partially usable.                                       | Product search, cart management, order history, admin order management |
| **Medium**   | Failure affects a secondary feature or edge case. Core flows remain functional.                                                                  | Profile management, coupon validation, CSV import, GUI standards       |

When in doubt between Critical and High: ask "Would this defect stop a user from completing a purchase or accessing the system?" If yes → Critical.

## Workflow

### Step 1 — Read and Understand the SRS

Read `docs/sut/srs.md` in full. Identify and classify every requirement into:

- **Functional features:** Requirements that describe distinct capabilities actors can use. These are the building blocks of scenarios.
- **Cross-cutting GUI/UX requirements:** Requirements that apply to the presentation layer across all features. These are verified within scenarios but do not form scenarios on their own.
- **Security requirements:** Requirements that drive Security & Misuse scenarios and API-layer test assignments.
- **Out-of-scope requirements:** Requirements that cannot be covered by the chosen automation tool (e.g., mobile features requiring a different framework).

Note all actors, their roles, their permissions, and the key system objects with lifecycle states.

### Step 2 — Read and Cross-Reference the API Spec

Read `docs/sut/api-specification.md`. For each endpoint, note:

- Which functional requirement it implements
- Whether authentication is required
- Whether there is server-side validation separate from UI validation

Any functional requirement with authentication enforcement or server-side validation is a candidate for `API` or `UI + API` layer assignment.

### Step 3 — Identify Scenarios Using `scenario-test-design`

Invoke `scenario-test-design` silently to generate a comprehensive raw scenario list. Do not print any analysis.

The invocation must apply at minimum: Technique 2 (Actor Analysis), Technique 3 (Disfavored Users), Technique 7 (Specific Transactions), Technique 4 (System Events), and Technique 16 (Sequence Analysis). Apply Technique 1 (Object Life History) for any requirement with a defined state machine.

After receiving the output, apply the following **automation-specific refinement rules** before proceeding:

- **Rule 1 — Enforce multi-feature coverage.** Every scenario must span at least two distinct functional features, or represent a single feature with a rich multi-step stateful workflow (as described in Theoretical Foundations). If `scenario-test-design` produces a scenario spanning only one functional feature without a stateful workflow, either expand it to include the adjacent natural next step in the user journey, or merge it with a related scenario.
- **Rule 2 — Separate GUI/UX requirements from primary coverage.** If a scenario's only connection to a second "feature" is a GUI/UX requirement, it does not qualify as multi-feature. Move that GUI/UX requirement to the "GUI Requirements Verified" field and expand the scenario to include a genuine second functional feature.
- **Rule 3 — Filter for automation suitability.** Apply the Execution Mode criteria. Remove scenarios that are not suitable for automation. Note them separately if needed.
- **Rule 4 — Assign coverage labels.** Every scenario must have exactly one coverage label: Happy Path, Negative, Error Recovery, or Security & Misuse.

### Step 4 — Assign Test Layers

For each scenario, assign a test layer based on the rules in Theoretical Foundations. Consider the scenario as a whole: if any step in the scenario requires server-side verification, the scenario gets `UI + API` or `API`.

### Step 5 — Assign Priorities and IDs

Assign `SC-{NN}` IDs (two-digit zero-padded). Assign priority:

- **Critical** — failure blocks core business function or exposes a security vulnerability
- **High** — failure significantly degrades user experience or breaks an important feature
- **Medium** — failure affects a secondary feature; core flows remain functional

### Step 6 — Write `docs/test-scope.md`

Write the complete scope document using the **Output Format** defined below.

### Step 7 — Human Gate

After writing the file, present this message exactly:

> "Scope analysis complete. Scenario inventory written to `docs/test-scope.md`. Please review:
>
> - Does each scenario span multiple functional features, or have a compelling multi-step stateful workflow if single-feature?
> - Does the list include Happy Path, Negative, Error Recovery, and Security & Misuse scenarios where applicable?
> - Are the test layer assignments correct?
> - Are the priorities appropriate?
> - Are the execution modes correct (Automation vs Manual)?
> - Are any important user journeys missing?
>
> Reply **APPROVED** to finalize the scope and proceed to `wat-spec`, or **REJECTED** with specific feedback so I can revise."

- If **APPROVED** → update status to `APPROVED`; scope is ready for `wat-spec`
- If **REJECTED** → revise based on feedback, update `docs/test-scope.md`, repeat until `APPROVED`

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

## 2. Requirement-to-Layer Mapping

| Requirement ID | Feature / Requirement Name | Test Layer | Notes                                           |
| -------------- | -------------------------- | ---------- | ----------------------------------------------- |
| {FR-XX}        | {Feature Name}             | UI + API   | {rationale if non-obvious}                      |
| {SEC-XX}       | {Security Requirement}     | API        | Server-side constraint — HTTP layer only        |
| {GUI-REQ}      | {GUI/UX Requirement}       | UI         | Cross-cutting — verified within other scenarios |
| ...            |                            |            |                                                 |

## 3. Scenario Inventory

### SC-01 — {Scenario Name}

| Field                         | Value                                                            |
| ----------------------------- | ---------------------------------------------------------------- |
| **Scenario ID**               | SC-01                                                            |
| **Name**                      | {Descriptive name: verb + object + context}                      |
| **Coverage Label**            | Happy Path / Negative / Error Recovery / Security & Misuse       |
| **Execution Mode**            | Automation                                                       |
| **Actor**                     | {Customer / Admin / Attacker}                                    |
| **Primary FR Coverage**       | {Functional feature requirements only}                           |
| **GUI Requirements Verified** | {GUI/UX requirements verified as additional assertions — if any} |
| **Dependency FRs**            | {Precondition requirements — not primary coverage targets}       |
| **Test Layer**                | UI / API / UI + API                                              |
| **Priority**                  | Critical / High / Medium                                         |
| **Objective**                 | {One sentence: what this scenario proves or disproves}           |

**Scenario Description:** {Describe the scenario as a user story, including the sequence of steps, and separate the steps with bullet points.}

{Repeat for each scenario}

## 4. Coverage Matrix

| Requirement ID | Feature              | Covered By                   | Test Layer |
| -------------- | -------------------- | ---------------------------- | ---------- |
| {FR-XX}        | {Feature}            | SC-01 (HP), SC-04 (NEG)      | UI + API   |
| {GUI-REQ}      | {GUI/UX Requirement} | SC-01, SC-03, SC-05 (within) | UI         |
| ...            |                      |                              |            |

## 5. Execution Order Recommendation

| Order | Scenario ID | Name   | Coverage Label    | Priority | Rationale                                         |
| ----- | ----------- | ------ | ----------------- | -------- | ------------------------------------------------- |
| 1     | SC-XX       | {Name} | Happy Path        | Critical | Precondition for multiple downstream scenarios    |
| 2     | SC-YY       | {Name} | Security & Misuse | Critical | API-only; no browser dependency; fast to validate |
| ...   |             |        |                   |          |                                                   |

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

**Scenario structure:**

- [ ] Every scenario spans at least two distinct functional features, OR is a single-feature scenario with a demonstrably rich multi-step stateful workflow.
- [ ] No scenario's second "feature" is solely a GUI/UX requirement.
- [ ] GUI/UX requirements appear in the "GUI Requirements Verified" field, not in "Primary FR Coverage".
- [ ] API-only scenarios cover a multi-step business or security journey — not a single endpoint call.
- [ ] Every scenario has exactly one coverage label assigned.

**Coverage completeness:**

- [ ] Every functional feature requirement appears in at least one scenario's Primary FR Coverage.
- [ ] Every security requirement is covered by at least one Security & Misuse scenario.
- [ ] GUI/UX requirements appear in the Coverage Matrix with multiple scenarios listed.
- [ ] Out-of-scope items are explicitly listed with reasons.

**Coverage label balance:**

- [ ] At least one Happy Path scenario per major business domain.
- [ ] At least one Negative scenario for each significant business rule.
- [ ] At least one Security & Misuse scenario for any feature with access control or sensitive data.
- [ ] Absence of Negative or Security & Misuse scenarios triggers re-examination.

**Execution mode:**

- [ ] Every scenario has Execution Mode = `Automation`.
- [ ] Any scenario unsuitable for automation has been removed from the main inventory.

**Layer assignment:**

- [ ] All server-side enforcement requirements have `API` in the scenario's test layer.
- [ ] All visual-only requirements are `UI`.

**Document:**

- [ ] All contents are in English and follow the specified markdown structure.
- [ ] Status is `DRAFT`.
- [ ] Execution Order table is complete.

## Constraints

**MUST do:**

- Read both SRS and API spec in full before producing any output
- Invoke `scenario-test-design` silently
- Apply all four refinement rules after extracting from `scenario-test-design`
- Treat GUI/UX requirements as cross-cutting — never as primary coverage
- Write output to `docs/test-scope.md` before presenting the human gate
- Set status to `DRAFT`

**MUST NOT do:**

- Print `scenario-test-design` analysis or intermediate steps
- Create scenarios that span only one functional feature unless it has a rich multi-step stateful workflow
- List GUI/UX requirements in "Primary FR Coverage"
- Begin scenario flow design — that belongs to `wat-spec`
- Define test steps, test data, or expected outcomes
- Mark the document as `APPROVED`
- Produce a scope with only Happy Path scenarios
- Reference `playwright-automation-plan.md`
