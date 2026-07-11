---
name: scenario-test-design
description: >
  Apply this skill whenever a user needs to design test scenarios based on real-world business
  workflows before writing test data or test scripts. Triggers on: "design test scenarios",
  "scenario testing", "create test scenarios", "scenario-based testing", "test scenario design",
  "identify test scenarios", "write test cases from requirements", or any request to analyze
  requirements, BRs, FRs, or User Stories and produce scenario flows. This skill covers TEST DESIGN
  (analysis + scenario flow), NOT automation code or test scripts. Invoke even if the user only
  pastes requirements and says "help me test this".
---

# Scenario Test Design Skill

## Overview

**Scenario Testing** is a **black-box test design technique** (ISTQB) that structures test cases around **real-world business workflows** from the end-user's perspective. Each scenario describes a connected sequence of actions that reflects a complete business process or user journey — rather than testing individual features in isolation.

As defined by Cem Kaner, who formalized the technique: _"A scenario test is a narrative about how the program will be used, besides emotional, social and business contexts, that gets stakeholders to care about failures."_

### Scenario Testing is a technique, not a test level

This is a critical distinction. Scenario Testing is a **test design technique** — it describes _how_ test cases are derived (from user journeys and business workflows), not _where_ they run in the test pyramid. The technique makes no assumption about test level or execution medium: the same design approach applies whether the scenarios will be executed as manual tests, UI automation, API tests, mobile tests, or desktop tests.

### Scenario vs Scenario-Based Test Case

In the original Kaner literature, a **scenario** is a high-level narrative describing a realistic user situation, goal, and context. A **scenario-based test case** is the concrete realization of that scenario: specific preconditions, step-by-step actions, and measurable expected results.

This skill produces **scenario-based test cases** — scenarios developed to a level of detail sufficient for direct execution or automation. This is the standard practice in the industry. The terms are often used interchangeably in teams; what matters is that every test case produced here is grounded in a realistic user journey, not in an isolated function or API call.

This skill guides the AI through analyzing requirements → identifying scenarios → designing scenario-based test cases **before** any test data or automation scripts are created. The output is a suite that is complete, non-redundant, and fully traceable to requirements.

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

- Business Requirements (BRs), Functional Requirements (FRs), User Stories, or feature descriptions are available and test scenarios need to be designed.
- Designing scenario-based test cases for **manual test execution** — any context where a tester will execute steps against the system.
- Designing scenario-based test cases as the **specification for test automation** — whether the automation targets a UI, API, mobile app, or desktop application.
- Identifying which user journeys should be automated versus kept as manual tests.
- Building or refreshing a **regression suite** — scenarios re-executed across sprints or releases.
- Building or reviewing a scenario suite from scratch at the start of a project or sprint.

## When NOT to Use

- Writing automation test scripts or code (test design only — use a separate coding skill).
- Unit testing or isolated component testing — scenario testing operates at the workflow level, not the function level.
- Performance, load, or stress testing — different technique and tooling required.
- Security penetration testing — a specialized discipline distinct from scenario-based design.
- Producing a flat feature checklist with no flow-based structure.
- Test data preparation only, when the scenario suite already exists.

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

1. **Scenario = Business workflow, not a feature check.** Every scenario must reflect a realistic sequence of actions a user takes to accomplish a business goal. It has a clear starting condition, a sequence of steps, and a verifiable outcome. It is not a list of features to tick off.
2. **User-centric perspective.** Write from the point of view of each distinct actor, not from the structure of the code, the API, or the database schema.
3. **Sufficient coverage, no redundancy.** Each scenario must test at least one distinct condition. Duplicate scenarios are maintenance waste, not extra safety.
4. **Full traceability.** Every scenario must trace back to at least one BR, FR, or constraint. Every BR/FR must be covered by at least one scenario.
5. **Independence.** Every scenario must be executable in isolation with self-contained preconditions and test data. No scenario may depend on the output of another.
6. **Realism.** Base scenarios on how users actually behave, including misuse and error paths — not on the ideal path the developer intended.

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
2. Scenario names follow the pattern `[Actor] + [Action / Goal] + [Context / Condition]`, for example: _"Customer completes a transfer to an account with insufficient funds"_.
3. Scenarios may be tagged with a coverage label to help organize the suite and identify gaps. This classification is not part of Kaner's original technique — it is a practical organizational tool developed in industry to make coverage gaps visible at a glance. Commonly used labels include: Happy Path / Negative / Error Recovery / Concurrent / Security & Misuse.
   > **On single-BR/FR scenarios:** A scenario covering only one BR/FR is not prohibited, but it should still read as a **credible user story**, not a feature check. If it cannot be told as a story a stakeholder would find meaningful, it is likely better handled by a more focused test design technique (domain testing, decision table testing, or equivalence partitioning). The scenario's value lies in discovering problems in the **relationships among features**.
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
- [ ] Scenarios have been tagged with coverage labels where useful (e.g., Happy Path, Negative, Error Recovery, Security & Misuse) to make coverage gaps visible.
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
- [ ] Disfavored user / misuse scenarios are included where applicable.
- [ ] Every actor has at least one scenario.
- [ ] Error Recovery scenarios exist for every external system dependency.

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
- 🚩 One or more BRs/FRs have no scenario at all tracing back to them — regardless of total scenario count, any uncovered requirement is a gap that must be addressed before execution.

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
