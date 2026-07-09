# Scenario Testing — Output Template

This is the standard output structure for every `/scenario-test-design` invocation. Use this exact structure regardless of feature complexity or scenario count.

```markdown
# Scenario Testing Design — [Feature Name]

> **Date:** [YYYY-MM-DD]  
> **Input:** [Name of the document or brief description of the requirements provided]

## 1. Requirement Summary

| ID     | Type                   | Description   |
| ------ | ---------------------- | ------------- |
| BR-01  | Business Rule          | [Description] |
| BR-02  | Business Rule          | [Description] |
| FR-01  | Functional Requirement | [Description] |
| CON-01 | Constraint             | [Description] |

### Assumptions & Open Questions

| ID     | Type          | Description                                                       |
| ------ | ------------- | ----------------------------------------------------------------- |
| ASM-01 | Assumption    | [Assumption made due to missing or ambiguous information]         |
| OQ-01  | Open Question | [Item requiring confirmation from a stakeholder before execution] |

## 2. Actor & Context Map

| Actor             | Type                    | Role / Permissions | Notes                            |
| ----------------- | ----------------------- | ------------------ | -------------------------------- |
| [Actor 1]         | Human / External System | [Permissions]      | [Key behavioral characteristics] |
| [Disfavored User] | Human                   | Attacker / Abuser  | [Target of misuse attempt]       |

**System Boundary:**

- **In scope:** [What this system is responsible for handling]
- **Out of scope:** [External systems and responsibilities; test the interface only]

**Key Object States:** [List the primary states of the main domain object(s)]

## 3. Scenario Overview Table

| ID    | Scenario Name                                   | Type              | Priority | Actor           | Traced BR/FR |
| ----- | ----------------------------------------------- | ----------------- | -------- | --------------- | ------------ |
| SC-01 | [Full name following: Actor + Action + Context] | Happy Path        | P1       | [Actor]         | BR-01, FR-02 |
| SC-02 | [Full name]                                     | Negative          | P2       | [Actor]         | BR-01        |
| SC-03 | [Full name]                                     | Edge Case         | P2       | [Actor]         | BR-02        |
| SC-04 | [Full name]                                     | Boundary          | P3       | [Actor]         | BR-02        |
| SC-05 | [Full name]                                     | Error Recovery    | P2       | [Actor]         | FR-03        |
| SC-06 | [Full name]                                     | Security & Misuse | P1       | Disfavored User | CON-01       |

**Summary:** [N] total scenarios — [x] Happy Path, [y] Negative, [z] Edge Case / Boundary, [w] Error Recovery, [v] Security & Misuse

## 4. Scenario Detail Cards

### SC-01: [Scenario Name]

| Field            | Value                   |
| ---------------- | ----------------------- |
| **ID**           | SC-01                   |
| **Name**         | [Full descriptive name] |
| **Type**         | Happy Path              |
| **Priority**     | P1                      |
| **Actor**        | [Actor]                 |
| **Traced BR/FR** | BR-01, FR-02            |

**Preconditions:**

- [Condition 1: required system state or data]
- [Condition 2]
- [...]

**Steps:**

1. [Step 1 — specific action by the actor or observable system response]
2. [Step 2]
3. [...]

**Expected Result:**

- [Specific, measurable outcome 1]
- [Specific, measurable outcome 2]
- [...]

**Test Data (suggested):**

- [Field: specific value to use]

### SC-02: [Scenario Name]

[Repeat the card structure above for every scenario]

## 5. Coverage Matrix

| BR/FR  | SC-01 | SC-02 | SC-03 | SC-04 | SC-05 | SC-06 | Status     |
| ------ | ----- | ----- | ----- | ----- | ----- | ----- | ---------- |
| BR-01  | ✅    | ✅    |       |       |       |       | ✅ Covered |
| BR-02  |       |       | ✅    | ✅    |       |       | ✅ Covered |
| FR-01  | ✅    |       |       |       | ✅    |       | ✅ Covered |
| CON-01 |       |       |       |       |       | ✅    | ✅ Covered |

## 6. Quality Self-Check Summary

### Process Compliance Checklist

| #   | Check                                                                       | Status  |
| --- | --------------------------------------------------------------------------- | ------- |
| 1   | All BRs, FRs, and constraints parsed and listed                             | ✅ / ❌ |
| 2   | All actors identified with roles and permissions                            | ✅ / ❌ |
| 3   | At least 5 of 16 generation techniques applied                              | ✅ / ❌ |
| 4   | All scenarios classified by type                                            | ✅ / ❌ |
| 5   | All scenarios have detailed steps and measurable expected results           | ✅ / ❌ |
| 6   | Forward traceability confirmed: every BR/FR has at least one scenario       | ✅ / ❌ |
| 7   | Reverse traceability confirmed: every scenario traces to at least one BR/FR | ✅ / ❌ |
| 8   | Scenario Quality Checklist completed                                        | ✅ / ❌ |
| 9   | Duplicate scenarios removed or merged                                       | ✅ / ❌ |
| 10  | Output follows the standard template                                        | ✅ / ❌ |

**Process Compliance:** X/10

### Scenario Quality Checklist

**Completeness**

| #   | Check                                                               | Status  |
| --- | ------------------------------------------------------------------- | ------- |
| 1   | At least one happy path scenario for each primary business flow     | ✅ / ❌ |
| 2   | At least one negative scenario for each significant validation rule | ✅ / ❌ |
| 3   | Edge cases covering boundary values (min, max, null, empty)         | ✅ / ❌ |
| 4   | Disfavored user / misuse scenarios included where applicable        | ✅ / ❌ |
| 5   | Every actor has at least one scenario                               | ✅ / ❌ |

**Correctness**

| #   | Check                                                                             | Status  |
| --- | --------------------------------------------------------------------------------- | ------- |
| 6   | Every scenario has preconditions sufficient for independent execution             | ✅ / ❌ |
| 7   | Steps are clear enough for any tester to execute without asking for clarification | ✅ / ❌ |
| 8   | Expected results are specific and objectively verifiable                          | ✅ / ❌ |
| 9   | No scenario conflates multiple independent flows                                  | ✅ / ❌ |

**Coverage**

| #   | Check                                            | Status  |
| --- | ------------------------------------------------ | ------- |
| 10  | Every BR/FR is covered by at least one scenario  | ✅ / ❌ |
| 11  | Every scenario traces back to at least one BR/FR | ✅ / ❌ |
| 12  | No duplicate scenarios exist                     | ✅ / ❌ |

**Practicality**

| #   | Check                                                     | Status  |
| --- | --------------------------------------------------------- | ------- |
| 13  | Every scenario contains 15 steps or fewer                 | ✅ / ❌ |
| 14  | No precondition depends on the output of another scenario | ✅ / ❌ |
| 15  | Scenarios can be executed in any order                    | ✅ / ❌ |

**Scenario Quality:** Y/15

### Red Flag Scan

| Flag                                                                  | Status              |
| --------------------------------------------------------------------- | ------------------- |
| 🚩 Suite consists entirely of happy path scenarios                    | ✅ Clear / ❌ Found |
| 🚩 All scenarios involve only one actor                               | ✅ Clear / ❌ Found |
| 🚩 Scenarios with identical preconditions and steps likely duplicates | ✅ Clear / ❌ Found |
| 🚩 One or more BRs/FRs with no covering scenario                      | ✅ Clear / ❌ Found |
| 🚩 Scenario names use implementation-level language                   | ✅ Clear / ❌ Found |
| 🚩 Expected results contain non-measurable language                   | ✅ Clear / ❌ Found |
| 🚩 Total scenario count is less than total BR/FR count                | ✅ Clear / ❌ Found |

**Red Flags:** [N] identified, all resolved / [describe any that remain]

_Generation techniques applied: [list techniques used in Step 3]_
```
