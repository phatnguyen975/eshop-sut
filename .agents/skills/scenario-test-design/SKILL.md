---
name: scenario-test-design
description: >
  Apply this skill whenever a user needs to design end-to-end test scenarios (E2E flows) before
  writing test data or test scripts. Triggers on: "design test scenarios", "write E2E test cases",
  "scenario testing", "create test scenarios", "flow testing", "test scenario design",
  "E2E test design", "identify test scenarios", "scenario-based testing", or any request to analyze
  requirements, BRs, or FRs and produce scenario flows. This skill covers TEST DESIGN
  (analysis + scenario flow), NOT automation code or test scripts. Invoke even if the user only
  pastes requirements and says "help me test this".
---

# Scenario Testing Design Skill

## Overview

**Scenario Testing** is a test design technique that structures test cases around **real-world business workflows** from the end-user's perspective. Each scenario describes a connected sequence of actions (an E2E flow) rather than validating individual features in isolation.

This skill guides the AI through analyzing requirements → identifying scenarios → designing complete E2E flows **before** any test data or test scripts are created. The output is a scenario suite that is complete, non-redundant, and fully traceable to requirements.

## Invoke Syntax

```
/scenario-test-design [--file="path/to/output.md"]
```

| Mode                   | Syntax                                             | Behavior                                                                |
| ---------------------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| Default (conversation) | `/scenario-test-design`                            | All analysis and scenario tables are printed inline in the conversation |
| File output            | `/scenario-test-design --file="path/to/output.md"` | All output is written to the specified file                             |

**Notes:**

- `--file` mode requires a file-capable environment. If file tools are unavailable, the AI will notify the user and fall back to conversation output.
- `--file` can be combined with any input: `/scenario-test-design --file="path/to/output.md"` then paste the requirements.
- If the target file already exists, the AI must ask before overwriting.
- Both modes produce identical content — only the delivery method differs.

## When to Use

- Business Requirements (BRs), Functional Requirements (FRs), User Stories, or feature descriptions are available.
- E2E test scenarios or scenario flows need to be designed for a feature or system.
- Preparing for sprint testing, UAT, or a regression test plan.
- Identifying happy paths, negative paths, and edge cases within a business workflow.
- Building a test suite from scratch at the start of a project.

## When NOT to Use

- Writing automation test scripts or code (use a separate skill).
- Unit testing or component-level testing (not E2E flow design).
- Performance, load, or security penetration testing (different scope).
- Producing a flat feature checklist without flow-based structure.
- Test data creation only, when scenarios already exist.

## Input

At least one of the following inputs is required:

| Input                           | Required        | Description                                            |
| ------------------------------- | --------------- | ------------------------------------------------------ |
| BR / FR / User Story            | ✅ (at least 1) | Business rules or functional requirements              |
| System / feature description    | ✅ (at least 1) | Description of the system or feature under test        |
| Business constraints            | Optional        | Role restrictions, permission rules, limits            |
| UI wireframes / flow diagrams   | Optional        | Help identify screen-level flows                       |
| Existing scenarios (for review) | Optional        | When reviewing or extending an existing scenario suite |

## Core Principles

1. **Scenario = End-to-End flow.** Every scenario must have a clear starting point, a sequence of actions, and a verifiable expected outcome. It is not a feature checklist.
2. **User-centric perspective.** Write from the point of view of each distinct user type, not from the structure of the code or the API.
3. **Sufficient coverage, no redundancy.** Each scenario must test at least one distinct condition. Duplicate scenarios are waste, not safety.
4. **Full traceability.** Every scenario must trace back to at least one BR, FR, or constraint.
5. **Independence.** Every scenario must be executable in isolation with self-contained test data.
6. **Realism.** Base scenarios on how users actually interact with the system, not how developers assume they will.

## Design Process

> Full step-by-step detail: [`resources/design-process.md`](resources/design-process.md)

The process follows **6 mandatory steps** in sequence:

**Step 1 — Input Analysis:** Parse and classify all requirements, constraints, and ambiguities  
**Step 2 — Actor & Context Mapping:** Identify actors, roles, permissions, and system boundaries  
**Step 3 — Scenario Identification:** Generate a raw scenario list using multiple techniques  
**Step 4 — Scenario Design:** Write detailed scenario cards for each identified scenario  
**Step 5 — Coverage Review:** Verify full traceability and identify gaps or redundancies  
**Step 6 — Quality Self-Check:** Run both checklists and scan for red flags before producing output

No step may be skipped. Steps 5 and 6 are mandatory even when the scenario suite appears complete.

## Design Rules

1. Every scenario **must** include: ID, Name, Actor, Preconditions, Steps, Expected Result, and Traced BR/FR references.
2. Scenario names follow the pattern **verb + object + context** as "Customer submits transfer to an account with insufficient funds"
3. Every scenario must be classified: Happy Path / Negative / Edge Case / Boundary / Error Recovery / Concurrent / Security & Misuse.
4. One scenario tests one primary flow. Do not combine multiple independent flows into a single scenario.
5. Preconditions must be fully self-contained — no dependency on the output of another scenario.
6. Expected Results must be specific and measurable. Phrases like "the system works correctly" or "the operation succeeds" are not acceptable.
7. Do not design scenarios based on assumptions about implementation details.

## Anti-Patterns

> Full list with examples: [`resources/anti-patterns.md`](resources/anti-patterns.md)

| Anti-Pattern                      | Problem                                                               |
| --------------------------------- | --------------------------------------------------------------------- |
| CRUD-based scenarios              | Tests individual buttons rather than business workflows               |
| Scenarios exceeding 15 steps      | Hard to maintain; usually multiple flows merged into one              |
| Happy-path-only suite             | Misses the negative and edge cases where most defects live            |
| Vague or incomplete preconditions | Scenario cannot run in isolation; result depends on environment state |
| Non-measurable expected results   | Cannot determine pass or fail with confidence                         |
| Duplicate scenarios               | Inflates the suite without increasing real coverage                   |
| Scenarios with no BR/FR trace     | No justification for existence; cannot be maintained                  |

## Best Practices

> Full list with rationale: [`resources/best-practices.md`](resources/best-practices.md)

- Apply at least 5 of the **16 scenario generation techniques** (see [`resources/generation-techniques.md`](resources/generation-techniques.md)) to generate the raw scenario list before filtering.
- Clarify all ambiguities in requirements **before** designing any scenario.
- Group scenarios by **user journey** or **business process**, not by screen or module.
- Prioritize scenarios using a **risk-based approach** (impact × likelihood) for each sprint or release.
- Use a **state transition diagram** for systems with complex object lifecycles to avoid missing state-dependent scenarios.
- Always include **disfavored user scenarios** for any feature that handles sensitive data, financial transactions, or access control.

## Process Compliance Checklist

_Verifies that the design process was followed correctly — distinct from the Scenario Quality Checklist below, which evaluates the output._

- [ ] All BRs, FRs, and constraints have been parsed and listed from the input.
- [ ] All actors have been identified with their roles and permission levels.
- [ ] At least 5 of the 16 generation techniques were applied to produce the raw scenario list.
- [ ] All scenarios have been classified by type (Happy Path / Negative / Edge Case / etc.).
- [ ] Every scenario has been designed with detailed steps and a measurable expected result.
- [ ] Forward traceability confirmed: every BR/FR is covered by at least one scenario.
- [ ] Reverse traceability confirmed: every scenario traces back to at least one BR/FR.
- [ ] Scenario Quality Checklist has been completed (Step 6).
- [ ] Duplicate scenarios have been removed or merged.
- [ ] Output follows the standard template.

## Scenario Quality Checklist

_Used in Step 6 to evaluate the quality of the designed scenario suite._

**Completeness**

- [ ] At least one happy path scenario exists for each primary business flow.
- [ ] At least one negative scenario exists for each significant validation rule.
- [ ] Edge cases cover boundary values (minimum, maximum, null, empty).
- [ ] Disfavored user / misuse scenarios are included where applicable.
- [ ] Every actor has at least one scenario

**Correctness**

- [ ] Every scenario has preconditions sufficient to run in isolation.
- [ ] Steps are written clearly enough for any tester to execute without clarification.
- [ ] Expected results are specific and objectively verifiable.
- [ ] No scenario conflates multiple independent flows into a single test.

**Coverage**

- [ ] Every BR/FR is covered by at least one scenario.
- [ ] Every scenario traces back to at least one BR/FR.
- [ ] No duplicate scenarios exist in the suite.

**Practicality**

- [ ] Every scenario contains 15 steps or fewer (split if longer).
- [ ] No precondition depends on the output of another scenario.
- [ ] Scenarios can be executed in any order.

## Common Rationalizations

Justifications that frequently lead to under-designed scenario suites:

- _"Testing the happy path is enough."_ — It is not. The majority of defects surface in negative and edge cases.
- _"This scenario is too obvious to document."_ — Obvious to whom? Documentation exists for the next person, and for six months from now.
- _"I know the system — I don't need to trace requirements."_ — Others do not. Traceability exists for maintainability, not for the original author.
- _"We'll write the scenarios after manual testing."_ — Scenarios must precede test execution. Documenting what you already tested is not test design.
- _"These scenarios are from the last project — we can reuse them."_ — Every project has different requirements and constraints. Reused scenarios must be reviewed against the current BRs.
- _"More scenarios means better coverage."_ — Redundant scenarios are technical debt. Every scenario must justify its existence with a distinct test condition.

## Red Flags

Stop and review the scenario suite when any of the following are true:

- 🚩 The entire suite consists of happy path scenarios only.
- 🚩 All scenarios involve a single actor.
- 🚩 Multiple scenarios share the same preconditions and steps but differ only in expected result — likely duplicates.
- 🚩 One or more BRs/FRs have no scenario tracing back to them.
- 🚩 Scenario names use implementation-level language: "Click button", "Call API", "Insert database record".
- 🚩 Expected results contain phrases like "works correctly", "succeeds", or "no errors" without measurable specifics.
- 🚩 The total number of scenarios is less than the total number of BRs/FRs — almost certainly indicates missing coverage.

## Output

A complete scenario testing output consists of:

1. **Requirement Summary:** Classified list of all BRs, FRs, constraints, assumptions, and open questions
2. **Actor & Context Map:** All actors with roles, permissions, system boundary, and key object states
3. **Scenario Overview Table:** All scenarios with ID, Name, Type, Priority, Actor, and Traced BR/FR
4. **Scenario Detail Cards:** Full detail for each scenario — Preconditions, Steps, Expected Result, and Test Data hints
5. **Coverage Matrix:** BR/FR × Scenario traceability grid showing coverage status
6. **Quality Self-Check Summary:** Results of both checklists and the red flag scan

> Full output template: [`resources/output-template.md`](resources/output-template.md)

## Resources

| File                                 | Contents                                             |
| ------------------------------------ | ---------------------------------------------------- |
| `resources/design-process.md`        | Step-by-step detail for all 6 design process steps   |
| `resources/generation-techniques.md` | All 16 scenario generation techniques with examples  |
| `resources/anti-patterns.md`         | Full anti-pattern catalog with before/after examples |
| `resources/best-practices.md`        | Full best practice catalog with rationale            |
| `resources/output-template.md`       | Standard output template                             |
| `examples/banking-transfer.md`       | Complete worked example: bank transfer feature       |
