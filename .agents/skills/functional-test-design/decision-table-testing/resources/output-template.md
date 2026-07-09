# Decision Table Testing — Output Templates

## Overview

The decision table design process produces four artifacts in sequence. Each artifact is an input to the next.

1. **Conditions and Actions List** — extracted from requirements (Step 1)
2. **Full Decision Table** — all possible combinations (Step 2)
3. **Reduced Decision Table** — after impossible rule removal and Don't Care merges (Step 3)
4. **Test Case Suite** — one test case per reduced rule (Step 4)

## Template 1: Conditions and Actions List

Use at **Step 1** before constructing any table.

### Conditions

| Condition ID | Description                                                         | Possible Values     | Source (Req/BR) | Mutual Exclusion              |
| ------------ | ------------------------------------------------------------------- | ------------------- | --------------- | ----------------------------- |
| C1           | [What this condition represents]                                    | T / F               | BR-001          | [e.g., Cannot be T when C2=T] |
| C2           | [What this condition represents]                                    | T / F               | BR-002          | —                             |
| C3           | [What this condition represents; if range, include EP class labels] | Low / Medium / High | BR-003          | —                             |

### Actions

| Action ID | Description            | Observable / Verifiable Outcome              | Source (Req/BR) | Type           |
| --------- | ---------------------- | -------------------------------------------- | --------------- | -------------- |
| A1        | [What the system does] | [e.g., Order total reduced by 15%]           | BR-001          | Positive       |
| A2        | [What the system does] | [e.g., Error message displayed: "..."]       | BR-002          | Negative/Error |
| A3        | [Default / no-op case] | [e.g., No discount applied; total unchanged] | Implied         | Default        |

**Notes:**

- Record any spec gaps discovered during this step (conditions or actions whose behavior is undefined)
- Record all stakeholder clarifications obtained and who provided them

## Template 2: Full Decision Table (Limited Entry — Binary Conditions)

Use at **Step 2**. For n conditions: `2ⁿ` columns.

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
│ Notes / Reason          │[why │[why │    │    │    │    │    │    │
│                         │imp.]│imp.]│    │    │    │    │    │    │
└─────────────────────────┴─────┴─────┴────┴────┴────┴────┴────┴────┘
```

**Notation:**

- `T / F` — True / False for condition values
- `X` — Action applies for this rule
- _(blank)_ — Action explicitly does not apply (verified, not skipped)
- `IMPOSSIBLE` — This rule's combination cannot occur (pending or confirmed)

## Template 3: Reduced Decision Table

Use at **Step 3** output. Document after all reductions are applied.

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

**Reduction summary section (required):**

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

- **TC ID:** Unique identifier (e.g., TC-DT-001)
- **Description:** Human-readable summary — "New customer with coupon: coupon ignored, 15% applies"
- **Reduced Rule:** Which column in the reduced table this test case represents
- **C1, C2, C3:** Concrete input values. For Don't Care (`*`): document chosen value and rationale in notes
- **Expected: Ax:** The specific, verifiable expected result for each action. Use "N/A" when the action does not apply to this rule — never leave blank
- **Req/BR:** Which requirements or business rules this test case verifies

**Don't Care value documentation (separate notes section):**

| TC ID | Don't Care Condition | Chosen Value   | Rationale for Choice                                                                                        |
| ----- | -------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| TC-01 | C3                   | T (has coupon) | Coupon=True is the more complex path; reveals defect if system incorrectly applies coupon for new customers |

## Example: Filled Templates (3-Condition Discount System)

### Conditions and Actions List

**Conditions:**

| ID  | Description               | Values | Source | Mutual Exclusion      |
| --- | ------------------------- | ------ | ------ | --------------------- |
| C1  | Customer is new           | T / F  | BR-001 | Cannot be T when C2=T |
| C2  | Customer has loyalty card | T / F  | BR-002 | Cannot be T when C1=T |
| C3  | Customer has coupon       | T / F  | BR-003 | —                     |

**Actions:**

| ID  | Description                     | Observable Outcome    | Source  | Type     |
| --- | ------------------------------- | --------------------- | ------- | -------- |
| A1  | Apply 15% new customer discount | Order total × 0.85    | BR-001  | Positive |
| A2  | Apply 10% loyalty discount      | Order total × 0.90    | BR-002  | Positive |
| A3  | Apply 20% coupon discount       | Order total × 0.80    | BR-003  | Positive |
| A4  | No discount applied             | Order total unchanged | Implied | Default  |

**Spec gaps found during Step 1:**

- BR-003 states coupon "cannot be used in conjunction with new customer discount" — does this mean the coupon is silently ignored (A1 applies, A3 does not) or is an error shown? → Confirmed with PO: coupon silently ignored, A1 applies. [Jane Smith, 2024-11-15]

### Full Decision Table (3 conditions → 8 rules)

|                  | R1                              | R2                              | R3                        | R4  | R5  | R6  | R7  | R8  |
| ---------------- | ------------------------------- | ------------------------------- | ------------------------- | --- | --- | --- | --- | --- |
| **C1 (New)**     | T                               | T                               | T                         | T   | F   | F   | F   | F   |
| **C2 (Loyalty)** | T                               | T                               | F                         | F   | T   | T   | F   | F   |
| **C3 (Coupon)**  | T                               | F                               | T                         | F   | T   | F   | T   | F   |
| A1 (15%)         |                                 |                                 | X                         | X   |     |     |     |     |
| A2 (10%)         |                                 |                                 |                           |     | X   | X   |     |     |
| A3 (20%)         |                                 |                                 |                           |     | X   |     | X   |     |
| A4 (0%)          |                                 |                                 |                           |     |     |     |     | X   |
| IMPOSSIBLE       | X                               | X                               |                           |     |     |     |     |     |
| Type             | Type 1                          | Type 1                          |                           |     |     |     |     |     |
| Notes            | C1+C2 mutually excl. per BR-001 | C1+C2 mutually excl. per BR-001 | Coupon ignored per BR-003 |     |     |     |     |     |

### Reduced Decision Table

|                  | R3+R4  | R5  | R6  | R7  | R8  |
| ---------------- | ------ | --- | --- | --- | --- |
| **C1 (New)**     | T      | F   | F   | F   | F   |
| **C2 (Loyalty)** | F      | T   | T   | F   | F   |
| **C3 (Coupon)**  | —      | T   | F   | T   | F   |
| A1 (15%)         | X      |     |     |     |     |
| A2 (10%)         |        | X   | X   |     |     |
| A3 (20%)         |        | X   |     | X   |     |
| A4 (0%)          |        |     |     |     | X   |
| Covers           | R3, R4 | R5  | R6  | R7  | R8  |

**Reduction log:**

- IMPOSSIBLE R1, R2: C1=T AND C2=T — **Type 1** (structurally impossible). BR-001 states "a loyalty card requires at least one prior purchase; new customers have none" — mutually exclusive by spec definition. Source: BR-001. Stakeholder confirmation: not required.
- Don't Care merge R3+R4: C3=— because A1 is the only action regardless of C3 (BR-003 prohibits coupon for new customers). R3 actions={A1}, R4 actions={A1} — identical.

### Test Case Suite

| TC ID | Description                                                    | Rule  | C1      | C2             | C3               | Expected Discount                                   | BR              |
| ----- | -------------------------------------------------------------- | ----- | ------- | -------------- | ---------------- | --------------------------------------------------- | --------------- |
| TC-01 | New customer — coupon present but ignored; 15% applies         | R3+R4 | T (New) | F (No loyalty) | T\* (Has coupon) | 15% discount applied; order total = original × 0.85 | BR-001, BR-003  |
| TC-02 | Loyalty customer with coupon — both discounts stack; 30% total | R5    | F       | T (Loyalty)    | T (Has coupon)   | 30% discount applied; order total = original × 0.70 | BR-002, BR-003  |
| TC-03 | Loyalty customer without coupon — 10% only                     | R6    | F       | T (Loyalty)    | F (No coupon)    | 10% discount applied; order total = original × 0.90 | BR-002          |
| TC-04 | Non-loyalty customer with coupon — 20% only                    | R7    | F       | F (No loyalty) | T (Has coupon)   | 20% discount applied; order total = original × 0.80 | BR-003          |
| TC-05 | Non-loyalty customer without coupon — no discount              | R8    | F       | F (No loyalty) | F (No coupon)    | 0% discount; order total unchanged                  | Implied default |

**Don't Care value notes:**

- TC-01, C3 = T (has coupon) chosen: more revealing — if system incorrectly applies coupon discount for new customers, this value will expose the defect.
