# Scenario Test Design — Design Process

## Step 1 — Input Analysis

**Objective:** Fully understand the scope before designing anything.

### 1.1 Collect and Classify Inputs

Read all provided documentation in full. Classify each statement into one of the following categories:

| Type                       | Label  | Example                                                                       |
| -------------------------- | ------ | ----------------------------------------------------------------------------- |
| Business Rule              | BR-xx  | "Account balance must be ≥ transfer amount"                                   |
| Functional Requirement     | FR-xx  | "System sends OTP when a transaction is confirmed"                            |
| Non-Functional Requirement | NFR-xx | "Page must load within 3 seconds" (usually out of scope for scenario testing) |
| Constraint                 | CON-xx | "Only users with the ADMIN role may access this endpoint"                     |
| Business Flow              | BF-xx  | High-level narrative of the end-to-end business process                       |

### 1.2 Resolve Ambiguities

Before proceeding to Step 2, identify every statement that is unclear or underspecified:

- Vague qualifiers such as "valid", "eligible", or "sufficient" → ask for the exact threshold or definition
- Generic subject "user" → clarify which user type, role, or permission level applies
- "The system processes the request" → clarify the concrete outcome (response, email, data change)
- Overlapping conditions → clarify which rule takes precedence when they conflict

If there is no one to ask, document each assumption with an explicit **[ASSUMPTION]** tag and note it in the output.

### 1.3 Step 1 Output

```markdown
## Requirement Summary

- **BR-01:** [description]
- **BR-02:** [description]
- **FR-01:** [description]
- **CON-01:** [description]

## Ambiguities & Assumptions

- [ASSUMPTION] Value X is interpreted as Y because the documentation does not specify it
- [OPEN QUESTION] Needs confirmation: what does the system do when A occurs?
```

## Step 2 — Actor & Context Mapping

**Objective:** Establish who uses the system, under what conditions, and where the system boundary lies.

### 2.1 Identify All Actors

List every actor — human or external system — that interacts with the feature:

| Actor           | Type            | Role / Permissions      | Key Characteristics                       |
| --------------- | --------------- | ----------------------- | ----------------------------------------- |
| Customer        | Human           | Authenticated user      | May only operate on their own accounts    |
| Admin           | Human           | Privileged user         | May view and act on any account           |
| Payment Gateway | External System | Third-party integration | May time out or return errors             |
| Disfavored User | Human           | Attacker / Abuser       | Intentionally attempts to bypass controls |

**Disfavored users must always be included** for any feature that involves sensitive data, financial operations, or access control. They represent users who deliberately misuse, abuse, or attack the system.

### 2.2 Define the System Boundary

```
IN SCOPE:
- Everything the system under test is responsible for handling

OUT OF SCOPE:
- Third-party system internals (test the interface only, not the provider)
- Background jobs or batch processes (unless explicitly required)
```

### 2.3 Identify Key System States

Systems typically expose different behaviors depending on the current state of their primary objects. Enumerate those states:

- **Account states:** Active / Suspended / Pending / Closed
- **Order states:** Draft / Submitted / Approved / Shipped / Cancelled
- **Session states:** Authenticated / Expired / Locked

Each state represents a distinct context that scenarios must cover.

## Step 3 — Scenario Identification

**Objective:** Generate a comprehensive raw scenario list by applying multiple techniques systematically.

### 3.1 Apply Generation Techniques

Read [`generation-techniques.md`](generation-techniques.md) and apply at least **5 of the 16 techniques** to ensure broad coverage.

**Always apply** (for every feature):

- **Technique 2:** Actor-based analysis
- **Technique 3:** Disfavored users
- **Technique 4:** System events (negative cases and error handling)
- **Technique 7:** Specific transactions (happy path flows)
- **Technique 16:** Sequence analysis (common orderings and interruptions)

**Apply additionally** based on context:

- **Technique 1:** Life history of key system objects
- **Technique 5:** Special events (holidays, maintenance windows, concurrent access)
- **Technique 6:** End-to-end benefit validation
- **Technique 13:** Mock business data simulation

### 3.2 Tag Scenarios for Coverage Visibility (Optional but Recommended)

Kaner's original technique does not define scenario types — a scenario is a story, judged by whether it is motivating, credible, complex, and easy to evaluate. However, tagging scenarios with coverage labels is a useful way to spot gaps at a glance: "do we have any scenarios for disfavored users?" or "have we covered what happens when an external system fails?"

The following labels map directly to Kaner's generation techniques and are appropriate for scenario testing:

| Label                 | Maps to Kaner Technique                      | What it signals                                                                                                             |
| --------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Happy Path**        | T6 — benefits-based validation               | Primary success flow that delivers the intended system benefit end to end                                                   |
| **Negative**          | T4 — system events                           | Actor violates a business rule or provides invalid input; system must respond correctly without crashing or corrupting data |
| **Error Recovery**    | T4 — system events (infrastructure failures) | An external dependency fails; system must handle it gracefully and preserve data integrity                                  |
| **Concurrent**        | T5 — special events                          | Multiple actors act simultaneously on shared state; system must handle contention correctly                                 |
| **Security & Misuse** | T3 — disfavored users                        | A disfavored user attempts to exploit, bypass, or abuse the system                                                          |

> **On single-BR/FR scenarios:** A scenario covering only one requirement is not prohibited. It is acceptable if it reads as a credible user story that a stakeholder would find meaningful. If it cannot be told as such a story, it is likely better handled by a more focused technique. The strength of scenario testing is in discovering interaction defects — problems that only appear when multiple features, roles, or data conditions are exercised together.

### 3.3 Deduplicate and Prioritize

Remove any scenarios that test the same condition. Assign a priority to each:

- **P1 – Critical:** Core happy paths; scenarios with high business impact if they fail
- **P2 – High:** Negative cases for primary validation rules
- **P3 – Medium:** Edge cases and boundary conditions
- **P4 – Low:** Cosmetic issues; scenarios covering very rare real-world conditions

### 3.4 Step 3 Output

```markdown
## Raw Scenario List

| #     | Scenario Name | Coverage Label | Priority | Source BR/FR |
| ----- | ------------- | -------------- | -------- | ------------ |
| SC-01 | ...           | Happy Path     | P1       | BR-01, FR-02 |
| SC-02 | ...           | Negative       | P2       | BR-01        |
| SC-03 | ...           | Error Recovery | P1       | FR-03        |
```

## Step 4 — Scenario Design

**Objective:** Write a complete, detailed scenario card for each identified scenario.

> **Terminology note:** In Cem Kaner's original definition, a _scenario_ is a high-level narrative describing a user's goal and context. A _scenario-based test case_ is the concrete realization of that narrative: specific preconditions, ordered steps, and measurable expected results. Step 4 produces scenario-based test cases — scenarios developed to the level of detail needed for direct execution or use as automation specifications. The term "scenario" is commonly used in teams to mean either; what matters is that every card produced here is grounded in a realistic user journey, not derived from an implementation detail or isolated function.

### 4.1 Scenario Card Template

```markdown
## [SC-XX] [Scenario Name]

| Field              | Value                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| **ID**             | SC-XX                                                                      |
| **Name**           | [Full descriptive name following: Actor + Action/Goal + Context/Condition] |
| **Coverage Label** | [Happy Path / Negative / Error Recovery / Concurrent / Security & Misuse]  |
| **Priority**       | [P1 / P2 / P3 / P4]                                                        |
| **Actor**          | [Who performs this scenario]                                               |
| **Traced BR/FR**   | [BR-xx, FR-xx — at least one reference required]                           |

### Preconditions

- [System state and data that must exist before execution begins]
- [Example: User "test@example.com" is authenticated with the Customer role]
- [Example: Account A (ID: ACC-001) has a balance of $10,000.00 and status Active]

### Steps

1. [Step 1 — specific action taken by the actor or the system]
2. [Step 2]
3. ...

### Expected Result

- [Specific, measurable outcome]
- [Example: Account A balance decreases by exactly $500.00 to $9,500.00]
- [Example: A confirmation email is delivered to test@example.com within 2 minutes]

### Test Data (suggested)

- Account A: balance $10,000.00, status Active
- Input amount: $500.00
```

### 4.2 Principles for Writing Steps

- Each step represents one observable action by the actor or one observable system response.
- Do not write steps at the implementation level ("call the API", "query the database").
- Write at the business level ("enter the transfer amount", "confirm the transaction").
- Each step should be verifiable — the tester must know unambiguously when the step is complete.

### 4.3 Principles for Writing Expected Results

```
❌ Inadequate: "The system processes the request successfully."
✅ Correct: "A success message displays with a transaction reference number. Account A balance decreases by exactly the transferred amount. A new record appears in the transaction history with the correct amount, timestamp, and status 'Completed'."

❌ Inadequate: "OTP is sent."
✅ Correct: "An SMS containing a 6-digit OTP is delivered to the registered mobile number within 60 seconds."
```

## Step 5 — Coverage Review

**Objective:** Confirm that the scenario suite is complete (no gaps) and non-redundant (no waste).

### 5.1 Build the BR/FR Coverage Matrix

Create a traceability matrix mapping every requirement to the scenarios that cover it:

```markdown
| BR/FR  | SC-01 | SC-02 | SC-03 | SC-04 | Status  |
| ------ | ----- | ----- | ----- | ----- | ------- |
| BR-01  | ✅    | ✅    |       |       | Covered |
| BR-02  |       |       | ✅    |       | Covered |
| FR-01  |       |       | ✅    | ✅    | Covered |
| CON-01 |       |       |       | ✅    | Covered |
```

Any BR/FR with no ✅ must have a new scenario added before proceeding.

### 5.2 Reverse Traceability Check

Every scenario must trace back to at least one BR/FR. Any scenario with no requirement reference should be either removed or have its scope formally added to the requirements.

### 5.3 Coverage Label Balance Check

If coverage labels were applied in Step 3.2, use them to identify obvious gaps:

| Label             | Signal when missing or zero                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| Happy Path        | Primary success flows have not been designed — start here                                                |
| Negative          | No scenarios test system rejection behavior — almost always a gap                                        |
| Error Recovery    | No scenarios cover external dependency failures — required for any feature with third-party integrations |
| Security & Misuse | Disfavored user paths not considered — required for features handling sensitive data or access control   |
| Concurrent        | Worth reviewing if the feature involves shared state or resource contention                              |

## Step 6 — Quality Self-Check

**Objective:** Review the completed scenario suite against both checklists and all red flags before producing the final output.

### 6.1 Run the Process Compliance Checklist

Refer to the Process Compliance Checklist in `SKILL.md`. Mark each item. If any item is incomplete, return to the relevant step and address it before continuing.

### 6.2 Run the Scenario Quality Checklist

Refer to the Scenario Quality Checklist in `SKILL.md`. Mark each item. Resolve any identified issues before producing the output.

### 6.3 Red Flag Scan

Review the complete scenario suite against all red flags listed in `SKILL.md`. Any active red flag must be resolved.

### 6.4 Quality Summary

Include a brief quality summary at the end of the output:

```markdown
## Quality Self-Check Summary

- **Process Compliance:** X/10 items passed
- **Scenario Quality:** Y/15 items passed
- **Red Flags:** Z identified, all resolved / [describe any unresolved items]
- **Assumptions recorded:** [list if any]
```
