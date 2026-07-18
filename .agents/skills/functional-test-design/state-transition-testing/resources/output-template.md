# State Transition Testing — Output Templates

## Template 1: State Transition Table

### Compact Format

Use at **Step 3** for systems with few states and events (≤ 5 × 5). One cell per state × event combination.

| Current State   | E1: [Event Name]    | E2: [Event Name]    | E3: [Event Name]                |
| --------------- | ------------------- | ------------------- | ------------------------------- |
| **S1: [Name]**  | S2 / [Action]       | — / [Error message] | S1 / [Action] (self-transition) |
| **S2: [Name]**  | — / [Error message] | S3 / [Action]       | — / [no-op]                     |
| **S3: [Final]** | — / [Error message] | — / [Error message] | — / [Error message]             |

**Cell notation:**

- **Valid transition:** `Destination State / Action`
- **Valid self-transition:** `Same State / Action`
- **Invalid transition:** `— / Expected system response`
- Leave no cell blank — blank = undefined behavior = specification gap

### Expanded Format

Use at **Step 3** for systems with guard conditions, many events, or complex invalid transition responses. One row per state × event × guard combination.

| Current State | Event       | Guard              | Valid? | Destination State | Action / Expected Response  | Source (Req/BR) |
| ------------- | ----------- | ------------------ | ------ | ----------------- | --------------------------- | --------------- |
| S1: [Name]    | E1: [Event] | [Guard or —]       | Y      | S2: [Name]        | [Observable action]         | BR-xxx          |
| S1: [Name]    | E1: [Event] | [Complement guard] | Y      | S3: [Name]        | [Observable action]         | BR-xxx          |
| S1: [Name]    | E2: [Event] | —                  | N      | —                 | Error: "[Specific message]" | BR-xxx          |
| S2: [Name]    | E1: [Event] | —                  | Y      | S1: [Name]        | [Observable action]         | BR-xxx          |
| S2: [Name]    | E2: [Event] | —                  | N      | —                 | — / [no-op or exception]    | BR-xxx          |

## Template 2: Coverage Plan

Use at **Step 4** after the STT is complete and before any test case is written.

- **Coverage target:** [All Transitions + Invalid Transitions / 1-Switch / N-Switch]
- **Rationale:** [Why this level was chosen — risk level, system criticality, time constraints]

### Valid Transitions to Cover

| Transition ID | From State | Event [Guard] | To State   | Action   |
| ------------- | ---------- | ------------- | ---------- | -------- |
| T1            | S1: [Name] | E1            | S2: [Name] | [Action] |
| T2            | S2: [Name] | E2            | S1: [Name] | [Action] |
| T3            | S1: [Name] | E3 [Guard]    | S3: [Name] | [Action] |

### Invalid Transitions to Cover

| IT ID | From State  | Event      | Expected System Response    |
| ----- | ----------- | ---------- | --------------------------- |
| IT1   | S2: [Name]  | E3: [Name] | Error: "[Specific message]" |
| IT2   | S3: [Final] | Any event  | Error: "[Specific message]" |

### Coverage Summary

| Metric                      | Count           |
| --------------------------- | --------------- |
| Total valid transitions     | [N]             |
| Total invalid transitions   | [N]             |
| Valid transitions covered   | [N] / [N] = [%] |
| Invalid transitions covered | [N] / [N] = [%] |

## Template 3: Test Case

Use at **Step 5** for each test path. One test case per path.

### Header

| Field            | Content                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **TC ID**        | TC-[number]                                                                                                                              |
| **Description**  | [What scenario this test case exercises; which transitions are covered; positive or negative]                                            |
| **Precondition** | System is in state: **[State Name and ID]**. [Any data setup required, e.g., "account balance = $100", "user is authenticated as ADMIN"] |
| **Coverage**     | Valid transitions: [T1, T2, T3] / Invalid transitions: [IT1]                                                                             |

### Steps

| Step | Action / Event                   | Input Data         | Expected Result                                                            | Post-Step State              |
| ---- | -------------------------------- | ------------------ | -------------------------------------------------------------------------- | ---------------------------- |
| 1    | [Event name — what is triggered] | `variable="value"` | [Specific observable output — message, field value, HTTP status, redirect] | [State name after this step] |
| 2    | [Event name]                     | `variable="value"` | [Specific observable output]                                               | [State name]                 |
| 3    | [Event name]                     | `variable="value"` | [Specific observable output]                                               | [State name]                 |

**Step formatting notes:**

- Input data: use `variable="value"` format; use `<br>` for multiple fields in one step
- Expected result must be specific and verifiable — not "system works" or "no error"
- Post-Step State must match the destination state in the STT for valid transitions

### Footer

| Field               | Content                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postcondition**   | System is in state: **[Final State Name and ID]**. [Any data state assertions, e.g., "account.status = SUSPENDED in DB", "audit_log entry written"] |
| **Test Type**       | Positive (valid path) / Negative (invalid transition)                                                                                               |
| **Source (Req/BR)** | [BR-xxx, BR-yyy]                                                                                                                                    |

## Template 4: Coverage Matrix

Use after test case design to verify all transitions in scope are covered.

| Transition ID | Description            | Type         | Test Case(s) | Status    |
| ------------- | ---------------------- | ------------ | ------------ | --------- |
| T1            | S1 → S2 via E1         | Valid        | TC-01        | ✓ Covered |
| T2            | S2 → S1 via E2         | Valid        | TC-01        | ✓ Covered |
| T3            | S1 → S3 via E3 [Guard] | Valid        | TC-02        | ✓ Covered |
| T4            | S1 → S1 via E4 (self)  | Valid (self) | TC-02        | ✓ Covered |
| IT1           | S2 + E3 (invalid)      | Invalid      | TC-03        | ✓ Covered |
| IT2           | S3 + any event (final) | Invalid      | TC-04        | ✓ Covered |

**Coverage summary:**

- **Valid transitions:** [X] / [Y total] = [Z]%
- **Invalid transitions:** [A] / [B total] = [C]%
- **States visited:** [P] / [Q total] = [R]%

## Notes on Template Usage

- Templates can be implemented in any format: Markdown (primarily used), spreadsheet, or test management tool (TestRail, Jira Xray, Zephyr).
- TC IDs should use a prefix that identifies the technique — e.g., `TC-ST-` for state transition — to distinguish from domain testing (`TC-DT-`) or use case testing (`TC-UCT-`) test cases.
- The STT must be complete (no blank cells) before any test case is designed — completeness is a prerequisite, not an option.
- For multi-field input steps, use `<br>` to separate fields: `event="Withdraw"<br>amount="100.00"`.
- The Coverage Matrix is the traceability artifact — it proves every transition in scope maps to at least one test case.
