# Fault Attack Guide

## Purpose

The Fault Attack is a structured approach to Error Guessing where error hypotheses are organized into a fault list by category before test cases are designed. This guide provides the step-by-step procedure for conducting a Fault Attack.

## What Is a Fault Attack?

A Fault Attack is Error Guessing made systematic. Rather than applying intuition ad hoc, the tester:

1. Creates a **fault list** — a structured catalog of suspected defects organized by category.
2. Derives test cases from the fault list, ensuring all major categories are covered.
3. Prioritizes the list so the highest-risk defects are tested first.

The fault list is the primary artifact of a Fault Attack. It makes the error guessing process:

- **Reviewable** — others can evaluate whether important categories were missed
- **Shareable** — team members with different experience can contribute to the list
- **Maintainable** — the list can be updated as new defects are found or requirements change
- **Improvable** — effective guesses are promoted; ineffective ones are retired

## Step-by-Step Procedure

### Step 1: Define the Target Scope

Identify what is being attacked:

- Which feature, component, or user story?
- Which layer (UI, API, business logic, database, integration)?
- What is the primary risk — correctness, security, performance, reliability?

This scoping prevents the fault list from becoming unfocused.

### Step 2: Gather Inputs

Collect available information before generating hypotheses:

| Input Source                      | What to Extract                                          |
| --------------------------------- | -------------------------------------------------------- |
| Existing test suite               | What is already covered — avoid duplicating it           |
| Requirements / BRs / User Stories | Feature-specific constraints and business logic          |
| Historical defect data            | Past bugs in this component or similar features          |
| Code review findings              | Known risky areas, technical debt, complex logic         |
| Developer knowledge               | Known implementation shortcuts, workarounds, assumptions |
| Error taxonomy                    | Structured checklist to ensure category coverage         |

### Step 3: Generate the Fault List

Work through each category in [`error-taxonomy.md`](error-taxonomy.md). For each category:

1. **Ask:** "Does this category apply to the feature under test?"
2. **If yes:** "What specific defect could exist here? What input or condition would trigger it?"
3. Write one fault list entry per specific hypothesis

**Fault list entry format:**

| Field          | Description                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| **ID**         | Unique identifier (e.g., FH-01, FH-02)                                        |
| **Category**   | Which taxonomy category (e.g., 1.2 Special String Values)                     |
| **Hypothesis** | Specific suspected defect — what might go wrong and where                     |
| **Rationale**  | Why this defect is suspected: experience, historical data, taxonomy reasoning |
| **Risk**       | H / M / L — based on probability × impact                                     |

### Step 4: Prioritize the Fault List

Rank each entry by **Risk = Probability × Impact**:

**High (H):** Test this regardless of time constraints

- High probability of defect existing (known pattern, complex code, no validation observed)
- AND/OR high impact if found in production (data loss, security breach, financial error, complete feature failure)

**Medium (M):** Test if time permits after all High items

- Moderate probability or moderate impact

**Low (L):** Document as acknowledged risk; test if time permits after H and M

- Low probability AND low impact

**Prioritization heuristics:**

- Security-related hypotheses: always High if the attack vector is realistic
- Data corruption or data loss scenarios: always High
- Known historical defect patterns repeating: High
- Rare edge cases with minor UX impact: Low

### Step 5: Derive Test Cases

For each fault hypothesis (starting with High priority):

- Design one test case per hypothesis (or more if multiple specific values are needed).
- Each test case targets exactly one hypothesis — do not combine multiple guesses into one test case (defect masking risk).
- Specify expected result as what the system should do if the code is correct (not what the defect would produce).

### Step 6: Review and Validate

Before executing:

- Confirm no test case duplicates existing systematic coverage (Step 1 gap analysis).
- Confirm all High priority hypotheses have at least one test case.
- Confirm all test cases have expected results and rationale.
- Optional: peer review — have another tester or developer review the fault list for missed categories.

## Common Fault Attack Mistakes

| Mistake                                                              | Consequence                                            | Correction                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Generating hypotheses without consulting the error taxonomy          | Entire defect categories missed                        | Work through each taxonomy category explicitly                                   |
| Generating hypotheses without reviewing existing test suite          | Duplicating systematic coverage                        | Review existing test cases first; document what is already covered               |
| Writing hypotheses at too high a level ("input validation may fail") | Cannot be translated into a specific test case         | Each hypothesis must specify: what value, what condition, what suspected failure |
| No rationale documented                                              | Hypotheses cannot be evaluated or defended             | Every hypothesis must have a "why"                                               |
| All hypotheses the same priority                                     | Time runs out before most important tests are executed | Prioritize deliberately; mark at least the top 5 as High                         |
| Stopping after generating the list without designing test cases      | Fault list is an analysis artifact, not a test suite   | Always translate each prioritized hypothesis into an executable test case        |
