# Decision Table Testing — Output Templates

## Template 1: Conditions and Actions List

Use at **Step 1** before constructing any table.

### Conditions

| Condition ID | Description                                                         | Possible Values     | Source (Req/BR) | Mutual Exclusion              |
| ------------ | ------------------------------------------------------------------- | ------------------- | --------------- | ----------------------------- |
| C1           | [What this condition represents]                                    | T / F               | BR-001          | [e.g., Cannot be T when C2=T] |
| C2           | [What this condition represents]                                    | T / F               | BR-002          | —                             |
| C3           | [What this condition represents; if range, include EP class labels] | Low / Medium / High | BR-003          | —                             |

### Actions

| Action ID | Description            | Observable Outcome                           | Source (Req/BR) | Type           |
| --------- | ---------------------- | -------------------------------------------- | --------------- | -------------- |
| A1        | [What the system does] | [e.g., Order total reduced by 15%]           | BR-001          | Positive       |
| A2        | [What the system does] | [e.g., Error message displayed: "..."]       | BR-002          | Negative/Error |
| A3        | [Default / no-op case] | [e.g., No discount applied; total unchanged] | Implied         | Default        |

**Notes:**

- Record any spec gaps discovered during this step (conditions or actions whose behavior is undefined)
- Record all stakeholder clarifications obtained and who provided them

## Template 2: Full Decision Table (Limited Entry — Binary Conditions)

Use at **Step 2**. For n conditions: `2ⁿ` columns. The table must be presented in Markdown format.

```
┌─────────────────────────┬─────┬─────┬────┬────┬────┬────┬────┬────┐
│                         │ R1  │ R2  │ R3 │ R4 │ R5 │ R6 │ R7 │ R8 │
├─────────────────────────┼─────┼─────┼────┼────┼────┼────┼────┼────┤
│ CONDITIONS              │     │     │    │    │    │    │    │    │
│ C1: [description]       │ T   │ T   │ T  │ T  │ F  │ F  │ F  │ F  │
│ C2: [description]       │ T   │ T   │ F  │ F  │ T  │ T  │ F  │ F  │
│ C3: [description]       │ T   │ F   │ T  │ F  │ T  │ F  │ T  │ F  │
├─────────────────────────┼─────┼─────┼────┼────┼────┼────┼────┼────┤
│ ACTIONS                 │     │     │    │    │    │    │    │    │
│ A1: [description]       │     │     │ X  │ X  │    │    │    │    │
│ A2: [description]       │     │     │    │    │ X  │ X  │    │    │
│ A3: [description]       │     │     │    │    │ X  │    │ X  │    │
│ A4: [description/no-op] │     │     │    │    │    │    │    │ X  │
│ IMPOSSIBLE              │ X   │ X   │    │    │    │    │    │    │
├─────────────────────────┼─────┼─────┼────┼────┼────┼────┼────┼────┤
│ Rationale               │[why │[why │    │    │    │    │    │    │
│                         │imp.]│imp.]│    │    │    │    │    │    │
└─────────────────────────┴─────┴─────┴────┴────┴────┴────┴────┴────┘
```

**Notation:**

- `T / F` — True / False for condition values
- `X` — Action applies for this rule
- _(blank)_ — Action explicitly does not apply (verified, not skipped)
- `IMPOSSIBLE` — This rule's combination cannot occur (pending or confirmed)

## Template 3: Reduced Decision Table

Use at **Step 3** output. Document after all reductions are applied. The table must be presented in Markdown format.

```
┌─────────────────────────┬─────────────────┬──────────┬──────────┬──────────┬─────────┐
│                         │      R3+R4      │    R5    │    R6    │    R7    │   R8    │
├─────────────────────────┼─────────────────┼──────────┼──────────┼──────────┼─────────┤
│ CONDITIONS              │                 │          │          │          │         │
│ C1: [description]       │        T        │    F     │    F     │    F     │    F    │
│ C2: [description]       │        F        │    T     │    T     │    F     │    F    │
│ C3: [description]       │        —        │    T     │    F     │    T     │    F    │
├─────────────────────────┼─────────────────┼──────────┼──────────┼──────────┼─────────┤
│ ACTIONS                 │                 │          │          │          │         │
│ A1: [description]       │        X        │          │          │          │         │
│ A2: [description]       │                 │    X     │    X     │          │         │
│ A3: [description]       │                 │    X     │          │    X     │         │
│ A4: [description/no-op] │                 │          │          │          │    X    │
├─────────────────────────┼─────────────────┼──────────┼──────────┼──────────┼─────────┤
│ Covers full rules       │      R3, R4     │    R5    │    R6    │    R7    │    R8   │
│ Don't Care rationale    │     [reason]    │    —     │    —     │    —     │    —    │
├─────────────────────────┼─────────────────┴──────────┴──────────┴──────────┴─────────┤
│ Impossible removed      │ R1, R2 (C1+C2 mutually exclusive; confirmed: [name, date]) │
└─────────────────────────┴────────────────────────────────────────────────────────────┘
```

**Reduction summary (required):**

| Reduction Type   | Rules Affected | Rationale                                      | Confirmed By          |
| ---------------- | -------------- | ---------------------------------------------- | --------------------- |
| Impossible       | R1, R2         | C1 and C2 are mutually exclusive — [reason]    | [Name], [Date]        |
| Don't Care merge | R3+R4          | C3 doesn't affect actions when C1=T — [reason] | Verified analytically |

## Template 4: Test Case Suite

Use at **Step 4**. One row per reduced rule.

| TC ID | Description                                      | Reduced Rule | C1  | C2  | C3  | Expected: A1             | Expected: A2      | Expected: A3      | Expected: A4 | Req/BR         |
| ----- | ------------------------------------------------ | ------------ | --- | --- | --- | ------------------------ | ----------------- | ----------------- | ------------ | -------------- |
| TC-01 | [What combination this tests and why it matters] | R3+R4        | T   | F   | T\* | [specific result or N/A] | N/A               | N/A               | N/A          | BR-001         |
| TC-02 | [...]                                            | R5           | F   | T   | T   | N/A                      | [specific result] | [specific result] | N/A          | BR-002, BR-003 |
| ...   |                                                  |              |     |     |     |                          |                   |                   |              |                |

**Column notes:**

- **TC ID:** Unique identifier (e.g., `TC-DT-001`)
- **Description:** Human-readable summary — "New customer with coupon: coupon ignored, 15% applies"
- **Reduced Rule:** Which column in the reduced table this test case represents
- **C1, C2, C3:** Concrete input values. For Don't Care (`—`): document chosen value and rationale in notes
- **Expected: Ax:** The specific, verifiable expected result for each action. Use "N/A" when the action does not apply to this rule — never leave blank
- **Req/BR:** Which requirements or business rules this test case verifies

**Don't Care value notes:**

| TC ID | Don't Care Condition | Chosen Value   | Rationale for Choice                                                                                        |
| ----- | -------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| TC-01 | C3                   | T (has coupon) | Coupon=True is the more complex path; reveals defect if system incorrectly applies coupon for new customers |
