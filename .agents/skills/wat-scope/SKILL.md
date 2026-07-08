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

- Every E2E scenario the automation suite must cover
- Which functional requirements each scenario covers
- Which test layer (UI E2E / API / both) applies to each scenario
- The priority of each scenario

This document is the **entry point for all subsequent `wat-spec` invocations**. No scenario specification or test implementation may begin without an APPROVED scope document.

## Input

| Source                            | Location                        | Purpose                                         |
| --------------------------------- | ------------------------------- | ----------------------------------------------- |
| System Requirements Specification | `docs/sut/srs.md`               | Source of truth for all testable requirements   |
| API Contract                      | `docs/sut/api-specification.md` | Identifies which FRs have backend API endpoints |

Read both files in full before beginning analysis. Do not rely on memory or assumptions — derive everything from the documents.

## Output

| Artifact            | Location             | Status                |
| ------------------- | -------------------- | --------------------- |
| Test scope document | `docs/test-scope.md` | Created by this skill |

## Theoretical Foundations

### What Makes a Good E2E Scenario

An E2E scenario represents a **complete, realistic user journey** through the system. It must satisfy all of the following criteria:

1. **Business goal oriented** — The scenario accomplishes something meaningful from a user or business perspective (e.g., "a customer successfully purchases a product").
2. **Cross-feature** — It spans at least two distinct functional areas or FR groups. A scenario that tests only one FR in isolation is not an E2E scenario — it is a unit or integration test.
3. **Realistic sequence** — The steps follow the natural order a real user would take. Preconditions are implicit in the journey, not artificially injected.
4. **Verifiable outcome** — It ends with a system state that can be asserted (order created, email sent, status updated, access denied).
5. **Independently executable** — Each scenario can run without depending on the output of another scenario.

### Grouping Principles for FR → Scenario Mapping

Group FRs into scenarios based on the following criteria, applied in order:

1. **Business domain boundary** — FRs that belong to the same domain (authentication, shopping cart, order management, admin panel) naturally form scenario groups.
2. **Sequential dependency** — If FR-A must complete before FR-B can begin in a real user journey (e.g., registration before login, cart before checkout), they belong together.
3. **Shared actor** — FRs performed by the same actor (customer, admin) in the same session are candidates for the same scenario.
4. **Risk concentration** — FRs that interact at integration boundaries (frontend calls backend which updates state read by another frontend view) should be in the same scenario to catch integration defects.

One FR may appear in multiple scenarios if it is a precondition for different journeys (e.g., FR-02 Login appears in nearly every customer-facing scenario as a precondition). Do not duplicate it — note it as a dependency, not a primary coverage target.

### Test Layer Assignment Rules

| Layer          | When to Assign                                                                                                                  | Rationale                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `UI E2E`       | FR describes user-visible behavior, visual feedback, navigation, form interaction, or UI state                                  | These behaviors can only be verified through a real browser rendering the UI                           |
| `API`          | FR describes authorization rules, data validation enforced at server, business logic independent of UI, or security constraints | These behaviors must be verified at the HTTP layer because the UI cannot be trusted to enforce them    |
| `UI E2E + API` | FR has both user-visible behavior AND server-side enforcement that must be independently verified                               | The UI test verifies the happy path; the API test verifies the security/validation constraint directly |

**Key principle:** If a requirement says the backend MUST enforce something (e.g., FR-08: "Backend must recompute `total_amount` — do not accept client-supplied value"), assign `API` regardless of whether it also has a UI flow. Server-side enforcement is only testable at the API layer.

### Priority Assignment Rules

Assign priority based on **business impact of failure**, not implementation complexity:

| Priority     | Criteria                                                                                                                                         | Examples                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| **Critical** | Failure completely blocks core business function or exposes a security vulnerability. The system cannot be considered operational if this fails. | Login, checkout, payment, admin access control, authentication         |
| **High**     | Failure significantly degrades user experience or breaks an important feature, but the system remains partially usable.                          | Product search, cart management, order history, admin order management |
| **Medium**   | Failure affects a secondary feature or edge case. Core flows remain functional.                                                                  | Profile management, coupon validation, CSV import, GUI standards       |

When in doubt between Critical and High: ask "Would this defect stop a user from completing a purchase or accessing the system?" If yes → Critical.

## Workflow

### Step 1 — Read and Parse the SRS

Read `docs/sut/srs.md` in full. For each requirement section, extract:

- FR/SEC identifier (e.g., FR-01, SEC-03)
- Feature name
- Whether it is user-facing (UI behavior) or server-enforced (API behavior) or both
- Which actor performs it (customer, admin, system)
- Dependencies on other FRs (e.g., FR-07 Cart requires FR-02 Login)

Do not summarize or skip sections. Every FR and SEC requirement must be accounted for.

### Step 2 — Read and Cross-Reference the API Spec

Read `docs/sut/api-specification.md`. For each endpoint, note:

- Which FR it implements
- Whether the endpoint has authentication requirements
- Whether it has server-side validation that is separate from UI validation

Any FR that has a corresponding API endpoint with authentication or validation logic is a candidate for `UI E2E + API` or `API` layer assignment.

### Step 3 — Map Each FR to a Test Layer

For every FR and SEC requirement identified in Step 1, assign a test layer using the rules in the Theoretical Foundations section. Document the rationale for each non-obvious assignment.

Special handling:

- **GUI Requirements (FR-21 to FR-24):** Always `UI E2E` — these are visual and interaction standards that cannot be verified via API.
- **Security Requirements (SEC-01 to SEC-07):** Always include `API` layer — security constraints must be verified at the HTTP layer regardless of UI behavior.
- **Out-of-scope items:** Explicitly list any FR marked out of scope and state the reason (e.g., FR-20 Mobile — requires Appium/Detox, outside Playwright scope).

### Step 4 — Group FRs into E2E Scenarios

Apply the grouping principles from the Theoretical Foundations section. For each scenario:

- Assign a unique scenario ID: `SC-{NN}` (two-digit zero-padded, e.g., SC-01, SC-02)
- Write a descriptive scenario name that reflects the user journey, not the FR numbers (e.g., "Customer Registration and First Login", not "FR-01 + FR-02 Test")
- List all FR/SEC identifiers covered as primary coverage targets
- Note any FR identifiers covered as dependencies (preconditions, not primary targets)

Aim for scenarios that are **cohesive and independently testable**. Avoid:

- Scenarios that are too broad (covering 10+ FRs across unrelated domains)
- Scenarios that are too narrow (covering only one FR with no integration context)

**After grouping FRs, apply the following scenario discovery heuristics to identify any scenarios not captured by the requirements-driven approach:**

1. **Object life history** — For each key domain object (Order, User, Product, Coupon), trace its full lifecycle: how is it created, modified, used, and destroyed/cancelled? Each lifecycle transition is a candidate scenario.
2. **User goals** — List each actor's primary goals. Does each goal have a scenario?
3. **Disfavored users** — How would a malicious user attempt to abuse the system? (Unauthorized access, privilege escalation, data manipulation)
4. **System events** — What external events trigger system behavior? (Login failure threshold, coupon expiry, order status change)
5. **End-to-end benefits** — For each stated business benefit, is there a scenario that verifies it end-to-end? (e.g., "customer can purchase with discount")
6. **Transaction sequences** — What are the most common orderings of sub-tasks? (browse → cart → checkout vs. direct checkout with saved cart)
7. **Error recovery paths** — What happens when a step in a normal flow fails and the user retries? (wrong coupon → retry with valid coupon, payment fails → retry)

Apply these heuristics as a **gap check** after the FR-driven grouping, not as a replacement. Add new scenarios only if they represent user journeys not already covered.

### Step 5 — Assign Priority to Each Scenario

Apply the priority rules from the Theoretical Foundations section. Review the full scenario list and check for consistency — no scenario that is a precondition for a Critical scenario should itself be lower than High priority.

### Step 6 — Write `docs/test-scope.md`

Write the complete scope document using the Output Format defined below.

### Step 7 — Human Gate

After writing the file, present the following message to the human exactly:

> "Scope analysis complete. Scenario inventory written to `docs/test-scope.md`. Please review:
>
> - Does the scenario list cover all in-scope FRs from `docs/sut/srs.md`?
> - Is the FR-to-layer mapping correct? (Check especially any `API`-only assignments)
> - Are the priorities appropriate for your project context?
> - Are any important user journeys missing?
>
> Reply **APPROVED** to finalize the scope, or **REJECTED** with specific feedback so I can revise."

- If **APPROVED** → update the document status from `DRAFT` to `APPROVED` and confirm readiness for `wat-spec`
- If **REJECTED** → revise based on feedback, update `docs/test-scope.md`, and repeat Step 7 until `APPROVED`

## Output Format — `docs/test-scope.md`

```markdown
# Test Scope Document

**Project:** {Project Name}  
**SUT Version:** {version from SRS if available}  
**Created:** {YYYY-MM-DD}  
**Last Updated:** {YYYY-MM-DD}  
**Status:** DRAFT | APPROVED  
**Approved By:** {human name or role — filled in by human after approval}

## 1. Scope Summary

### In Scope

- Frontend Web (localhost:5173) — customer-facing UI E2E tests
- Web Admin (localhost:5174) — admin panel UI E2E tests
- Backend API (localhost:3000) — API contract and security tests

### Out of Scope

| Item   | Reason   |
| ------ | -------- |
| {item} | {reason} |

## 2. FR-to-Layer Mapping

| FR / SEC ID | Feature Name       | Test Layer   | Notes                                       |
| ----------- | ------------------ | ------------ | ------------------------------------------- |
| FR-01       | {Feature Name}     | UI E2E + API | {rationale if non-obvious}                  |
| FR-02       | {Feature Name}     | UI E2E + API |                                             |
| ...         |                    |              |                                             |
| SEC-01      | {Requirement Name} | API          | Security constraints verified at HTTP layer |
| ...         |                    |              |                                             |

## 3. Scenario Inventory

### SC-01 — {Scenario Name}

| Field                   | Value                                                 |
| ----------------------- | ----------------------------------------------------- |
| **Scenario ID**         | SC-01                                                 |
| **Name**                | {Descriptive name reflecting user journey}            |
| **Primary FR Coverage** | FR-XX, FR-YY, SEC-ZZ                                  |
| **Dependency FRs**      | FR-AA (precondition — covered as dependency)          |
| **Test Layer**          | UI E2E + API                                          |
| **Priority**            | Critical / High / Medium                              |
| **Rationale**           | {Why this scenario exists and what risk it mitigates} |

**E2E scenario description:**

- Step 1: {User action or system event}
- Step 2: {User action or system event}
- ...

**Scope of testing:**

- {What is verified in this scenario, including both UI and API checks}
- {Any preconditions or setup required for this scenario}
- {Any edge cases or error conditions covered}
- {Any security or validation checks included}

{Repeat for each scenario SC-02, SC-03, ...}

## 4. Coverage Matrix

| FR / SEC ID | Feature   | Covered By   | Test Layer   |
| ----------- | --------- | ------------ | ------------ |
| FR-01       | {Feature} | SC-01        | UI E2E + API |
| FR-02       | {Feature} | SC-01, SC-03 | UI E2E + API |
| ...         |           |              |              |

## 5. Execution Order Recommendation

List scenarios in the recommended implementation order, prioritizing Critical scenarios and scenarios that are dependencies for others:

1. SC-XX — {Name} (Critical — required as precondition for SC-YY, SC-ZZ)
2. SC-YY — {Name} (Critical)
3. SC-ZZ — {Name} (High)
4. ...
```

## Quality Checklist

Before presenting the scope document to the human, verify every item:

**Coverage completeness:**

- [ ] Every FR from `docs/sut/srs.md` appears in the FR-to-Layer Mapping table.
- [ ] Every SEC requirement appears in the FR-to-Layer Mapping table.
- [ ] Every FR appears in at least one scenario's Primary or Dependency FR list.
- [ ] Out-of-scope items are explicitly listed with reasons.
- [ ] All seven scenario discovery heuristics have been considered — at minimum, object life histories and disfavored user paths have been checked against the scenario list.

**Scenario quality:**

- [ ] Each scenario name describes a user journey, not a list of FR numbers.
- [ ] Each scenario covers at least two FRs (not a single-FR isolated test).
- [ ] No two scenarios are identical in scope.
- [ ] Scenarios are independently executable (no scenario requires the output of another).
- [ ] Security requirements (SEC-XX) appear in at least one scenario.

**Layer assignment:**

- [ ] All server-side enforcement requirements have `API` in their test layer.
- [ ] All GUI/visual requirements are assigned `UI E2E`.
- [ ] No requirement that must be enforced server-side is assigned `UI E2E` only.

**Priority:**

- [ ] At least one scenario is Critical.
- [ ] No scenario that is a precondition for a Critical scenario is Medium priority.
- [ ] Priority rationale is defensible based on business impact.

**Document format:**

- [ ] All contents are in English and follow the specified markdown structure.
- [ ] Status is `DRAFT` (not `APPROVED` — only the human approves).
- [ ] Created date is today's date.
- [ ] All tables are complete — no empty cells in required columns.
- [ ] Coverage matrix accounts for every FR in the mapping table.
- [ ] Execution order is listed and respects Critical > High > Medium.

## Constraints

**MUST do:**

- Read `docs/sut/srs.md` and `docs/sut/api-specification.md` in full before producing any output.
- Account for every FR and SEC requirement — no silent omissions.
- Write the output to `docs/test-scope.md` before presenting the human gate.
- Set document status to `DRAFT` — never `APPROVED` (only the human can approve).
- Stop at the human gate and wait for explicit APPROVED or REJECTED response.

**MUST NOT do:**

- Begin scenario flow design — that is `wat-spec`'s responsibility.
- Define test steps, test data, or expected outcomes — scope only.
- Invent requirements not present in `docs/sut/srs.md`.
- Modify any file other than `docs/test-scope.md`.
- Mark the document as APPROVED on behalf of the human.
- Proceed to `wat-spec` without explicit APPROVED response.
- Reference `playwright-automation-plan.md` — that file is for human reference only.
