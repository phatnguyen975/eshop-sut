# Error Guessing — Output Templates

## Template 1: Fault List

```
FAULT ATTACK — FAULT LIST
═══════════════════════════════════════════════════════════════════
Feature / Component : [Name of feature or API endpoint]
Tester              : [Name]
Date                : [Date]
Scope               : [What layer/area is being attacked: UI / API / Business Logic / Integration]
Systematic coverage : [Reference to existing test suite — what is already covered]
═══════════════════════════════════════════════════════════════════

ID         : FH-01
Category   : [Taxonomy category number and name, e.g., 1.2 Special String Values]
Hypothesis : [Specific suspected defect — what might break, in what component, under what condition]
Rationale  : [Why suspected: experience / historical defect / taxonomy reasoning / developer input]
Risk       : H / M / L
Test Case  : TC-EG-[nn] (to be filled after test case design)

───────────────────────────────────────────────────────────────────

ID         : FH-02
Category   : [...]
Hypothesis : [...]
Rationale  : [...]
Risk       : H / M / L
Test Case  : TC-EG-[nn]

[Continue for all hypotheses]

═══════════════════════════════════════════════════════════════════
SUMMARY
Total hypotheses    : [N]
High priority       : [n]
Medium priority     : [n]
Low priority        : [n]
Test cases designed : [n] (High + Medium)
Acknowledged risks (Low, not tested): [n]
```

## Template 2: Test Case Table

| TC ID    | Description                               | Fault Hypothesis            | Category            | Priority  | Input Value(s)                       | Expected Output              | Req / Notes                     |
| -------- | ----------------------------------------- | --------------------------- | ------------------- | --------- | ------------------------------------ | ---------------------------- | ------------------------------- |
| TC-EG-01 | [What scenario; which defect is targeted] | FH-[nn]: [brief hypothesis] | [Taxonomy category] | H / M / L | `field="value"`<br>`field2="value2"` | [Specific verifiable result] | [BR-xxx or implementation note] |

**Column definitions:**

- **TC ID:** Unique identifier prefixed with `TC-EG` to distinguish from systematic test cases
- **Description:** Human-readable summary of what is being tested and why
- **Fault Hypothesis:** Reference to fault list entry (`FH-nn`) and brief hypothesis summary
- **Category:** Which taxonomy category this test case belongs to
- **Priority:** Inherited from the fault hypothesis risk priority
- **Input Value(s):** Fully specified inputs using `field="value"` format; use `<br>` for multiple fields
- **Expected Output:** Specific, verifiable correct behavior — not "no error" or "system works"
- **Req / Notes:** Relevant requirement ID if applicable; implementation notes if the expected behavior is based on developer input rather than spec

## Template 3: Combined Fault List + Test Case (Compact Format)

For smaller features where the fault list and test cases can be presented together:

### Fault List and Test Cases

**Scope:** [Feature name]
**Existing coverage:** [Reference to systematic test suite]

#### High Priority

**FH-01 | Category:** [1.2 Special String Values]
**Hypothesis:** [Suspected defect]
**Rationale:** [Why suspected]

| TC ID    | Input Value(s)    | Expected Output   |
| -------- | ----------------- | ----------------- |
| TC-EG-01 | `field="[value]"` | [Expected result] |

**FH-02 | Category:** [5.3 Third-Party Service Failures]
**Hypothesis:** [Suspected defect]
**Rationale:** [Why suspected]

| TC ID    | Input Value(s)    | Expected Output   |
| -------- | ----------------- | ----------------- |
| TC-EG-02 | `field="[value]"` | [Expected result] |

#### Medium Priority

[Continue with medium priority hypotheses and test cases]

#### Low Priority (Documented, Not Tested)

| FH ID | Hypothesis   | Rationale   | Acknowledged by |
| ----- | ------------ | ----------- | --------------- |
| FH-07 | [Hypothesis] | [Rationale] | [Name / Date]   |

## Notes on Output Format

- Error Guessing test cases should be clearly distinguished from systematic test cases — use the `TC-EG-` prefix.
- The fault list is the primary artifact; test cases are derived from it. Both must be presented together for the output to be complete.
- Low priority hypotheses that are not tested must be explicitly documented as acknowledged risks — not silently dropped.
- When presenting results: state how many hypotheses were generated, how many test cases were designed, and what the coverage gap is for Low priority items.
