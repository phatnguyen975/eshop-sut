# Example 1: Customer Discount System

## Scenario

**Feature:** E-commerce order checkout — discount calculation engine  
**Business Rules:**

- **BR-001:** A new customer (first purchase) receives a 15% discount on the order total.
- **BR-002:** An existing customer who holds an active loyalty card receives a 10% discount.
- **BR-003:** A customer who presents a valid coupon receives a 20% discount. However, the coupon discount **cannot** be combined with the new customer discount (BR-001). If a new customer presents a coupon, the coupon is silently ignored and only the 15% new customer discount applies.
- **BR-004:** Discount amounts are cumulative where applicable (e.g., loyalty + coupon = 30%).
- **BR-005 (implied):** A customer who qualifies for no discount receives 0% off; the order total is unchanged.

## Step 1 — Identify Conditions and Actions

### Requirement Analysis

**Parsing the BRs above:**

- "New customer" → C1 (boolean)
- "Existing customer with loyalty card" → C2 (boolean)
- "Has coupon" → C3 (boolean)
- Implied constraint: a customer cannot be simultaneously "new" (no prior account) and "existing with loyalty card" (requires an account) → C1=T AND C2=T is mutually exclusive

**Spec gap identified:** BR-003 says the coupon "cannot be combined" with the new customer discount — but does not specify whether this triggers an error or silently ignores the coupon.

→ **Raised with PO. Confirmed: coupon is silently ignored; BR-001 (15%) applies.** [Confirmed: Product Owner, sprint planning 2026-Q4]

### Conditions

| ID  | Description                                 | Values | Source | Mutual Exclusion         |
| --- | ------------------------------------------- | ------ | ------ | ------------------------ |
| C1  | Customer is a new customer (first purchase) | T / F  | BR-001 | C1=T and C2=T impossible |
| C2  | Customer holds an active loyalty card       | T / F  | BR-002 | C2=T and C1=T impossible |
| C3  | Customer presents a valid coupon            | T / F  | BR-003 | —                        |

### Actions

| ID  | Description                     | Observable Outcome                                           | Source |
| --- | ------------------------------- | ------------------------------------------------------------ | ------ |
| A1  | Apply 15% new customer discount | Order total × 0.85; discount line "New Customer: −15%" shown | BR-001 |
| A2  | Apply 10% loyalty discount      | Order total × 0.90; discount line "Loyalty: −10%" shown      | BR-002 |
| A3  | Apply 20% coupon discount       | Order total × 0.80; discount line "Coupon: −20%" shown       | BR-003 |
| A4  | No discount applied             | Order total unchanged; no discount line shown                | BR-005 |

## Step 2 — Build the Full Decision Table

3 binary conditions → **2³ = 8 rules**

Fill condition rows using binary counting pattern:

|                   |  R1   |  R2   |               R3                | R4  | R5  | R6  | R7  | R8  |
| ----------------- | :---: | :---: | :-----------------------------: | :-: | :-: | :-: | :-: | :-: |
| **CONDITIONS**    |       |       |                                 |     |     |     |     |     |
| C1 (New customer) |   T   |   T   |                T                |  T  |  F  |  F  |  F  |  F  |
| C2 (Loyalty card) |   T   |   T   |                F                |  F  |  T  |  T  |  F  |  F  |
| C3 (Has coupon)   |   T   |   F   |                T                |  F  |  T  |  F  |  T  |  F  |
| **ACTIONS**       |       |       |                                 |     |     |     |     |     |
| A1 (15% new)      |       |       |                X                |  X  |     |     |     |     |
| A2 (10% loyalty)  |       |       |                                 |     |  X  |  X  |     |     |
| A3 (20% coupon)   |       |       |                                 |     |  X  |     |  X  |     |
| A4 (No discount)  |       |       |                                 |     |     |     |     |  X  |
| **IMPOSSIBLE**    |   X   |   X   |                                 |     |     |     |     |     |
| Rationale         | C1+C2 | C1+C2 | BR-003: coupon ignored for C1=T |     |     |     |     |     |

**Action evaluation notes:**

- **R3 (C1=T, C2=F, C3=T):** BR-003 prohibits coupon+new customer combination. Coupon silently ignored. Only A1 (15%) applies.
- **R4 (C1=T, C2=F, C3=F):** New customer only. A1 (15%) applies.
- **R5 (C1=F, C2=T, C3=T):** Loyalty + coupon. BR-004 allows stacking. A2 (10%) + A3 (20%) = 30%.
- **R6 (C1=F, C2=T, C3=F):** Loyalty only. A2 (10%).
- **R7 (C1=F, C2=F, C3=T):** Coupon only. A3 (20%).
- **R8 (C1=F, C2=F, C3=F):** No qualification. A4 (0%).

## Step 3 — Reduce the Decision Table

### 3a: Remove Impossible Rules

**R1 (C1=T, C2=T, C3=T) and R2 (C1=T, C2=T, C3=F):**

- **Rationale:** C1=T (new customer, no prior account) and C2=T (existing loyalty card holder) are mutually exclusive.
- **Classification: Type 1 (Structurally impossible)**. BR-001 states "a loyalty card is issued only to customers who have completed at least one prior purchase; new customers have no prior purchases." The impossibility is proven directly by BR-001 — not inferred by the tester.
- **Source:** BR-001. Stakeholder confirmation: **not required** — BR-001 is the proof.
- **Remaining rules:** R3, R4, R5, R6, R7, R8

### 3b: Merge via Don't Care

**Check R3 vs R4:**

- Actions R3: {A1} — Actions R4: {A1} ✓ **Identical**
- Conditions differ: only C3 (T in R3, F in R4) ✓ **Exactly one**
- **Valid merge.** C3 becomes Don't Care (`—`).
- **Rationale:** BR-003 prohibits coupon for new customers — whether a new customer has a coupon or not, only A1 applies. C3 is irrelevant when C1=T.
- **Merged rule:** R3+R4

**Check R5 vs R6:**

- Actions R5: {A2, A3} — Actions R6: {A2} ✗ **Different** → No merge.

**Check R5 vs R7:**

- Actions R5: {A2, A3} — Actions R7: {A3} ✗ **Different** → No merge.

**Check R6 vs R8:**

- Actions R6: {A2} — Actions R8: {A4} ✗ **Different** → No merge.

**Check R7 vs R8:**

- Actions R7: {A3} — Actions R8: {A4} ✗ **Different** → No merge.

No further merges possible.

### 3c: Reduced Decision Table

|                       | R3+R4  | R5  | R6  | R7  | R8  |
| --------------------- | :----: | :-: | :-: | :-: | :-: |
| **CONDITIONS**        |        |     |     |     |     |
| C1 (New customer)     |   T    |  F  |  F  |  F  |  F  |
| C2 (Loyalty card)     |   F    |  T  |  T  |  F  |  F  |
| C3 (Has coupon)       |   —    |  T  |  F  |  T  |  F  |
| **ACTIONS**           |        |     |     |     |     |
| A1 (15% new)          |   X    |     |     |     |     |
| A2 (10% loyalty)      |        |  X  |  X  |     |     |
| A3 (20% coupon)       |        |  X  |     |  X  |     |
| A4 (No discount)      |        |     |     |     |  X  |
| **Covers full rules** | R3, R4 | R5  | R6  | R7  | R8  |

**Reduction summary:**

- **Rules removed (impossible):** R1, R2 → 2 rules eliminated
- **Rules merged (Don't Care):** R3+R4 → 1 rule saved
- **Full table:** 8 rules → **Reduced table:** 5 rules

**Coverage verification:**

- R1: IMPOSSIBLE ✓
- R2: IMPOSSIBLE ✓
- R3: covered by R3+R4 (C3=T sub-case) ✓
- R4: covered by R3+R4 (C3=F sub-case) ✓
- R5: covered by R5 ✓
- R6: covered by R6 ✓
- R7: covered by R7 ✓
- R8: covered by R8 ✓

All 6 non-impossible rules covered. No gaps. No overlaps.

## Step 4 — Derive Test Cases

One test case per reduced rule:

| TC ID | Description                                            | Rule  | C1      | C2             | C3            | A1 (15%)                             | A2 (10%)    | A3 (20%)    | A4 (0%)             | BR                     |
| ----- | ------------------------------------------------------ | ----- | ------- | -------------- | ------------- | ------------------------------------ | ----------- | ----------- | ------------------- | ---------------------- |
| TC-01 | New customer with coupon — coupon ignored, 15% applies | R3+R4 | T (New) | F (No loyalty) | T\* (Coupon)  | 15% applied; total = original × 0.85 | N/A         | N/A         | N/A                 | BR-001, BR-003         |
| TC-02 | Existing loyalty customer with coupon — 30% stacked    | R5    | F       | T (Loyalty)    | T (Coupon)    | N/A                                  | 10% applied | 20% applied | N/A                 | BR-002, BR-003, BR-004 |
| TC-03 | Existing loyalty customer without coupon — 10% only    | R6    | F       | T (Loyalty)    | F (No coupon) | N/A                                  | 10% applied | N/A         | N/A                 | BR-002                 |
| TC-04 | Non-loyalty customer with coupon — 20% only            | R7    | F       | F (No loyalty) | T (Coupon)    | N/A                                  | N/A         | 20% applied | N/A                 | BR-003                 |
| TC-05 | No qualification — 0% discount                         | R8    | F       | F (No loyalty) | F (No coupon) | N/A                                  | N/A         | N/A         | 0%; total unchanged | BR-005                 |

**Don't Care value notes:**

- **TC-01, C3:** Chosen value = T (has coupon).
- **Rationale:** If the system incorrectly applies the coupon discount for a new customer (defect in BR-003 implementation), C3=T will expose it. C3=F would not.

## Step 5 — Review Against Quality Checklists

### Process Quality Checklist

- [x] All conditions identified including mutual exclusion (C1+C2).
- [x] Implied condition complement covered (e.g., C1=F cases).
- [x] All actions identified including implied default A4 (0%).
- [x] Spec gap on BR-003 coupon behavior raised and resolved before construction.
- [x] Full table constructed first (8 rules, confirmed 2³).
- [x] All action cells consciously marked — no ambiguous blanks.
- [x] Impossible rules R1, R2 confirmed with stakeholder before removal.
- [x] Don't Care merge R3+R4 satisfies both criteria (identical actions, one differing condition).
- [x] Don't Care rationale documented.
- [x] Post-reduction coverage check: all 6 non-impossible full rules covered by reduced table.

### Test Case Quality Checklist

- [x] All 5 reduced rules have exactly one test case.
- [x] Every action appears as expected result in at least one test case.
- [x] All expected results are specific and verifiable (percentage values, UI elements).
- [x] Don't Care condition has concrete value (C3=T) with documented rationale.
- [x] No duplicate input combinations in test suite.
- [x] All conditions fully specified in every test case.

## Coverage Summary

| Reduced Rule | Full Rules Covered                  | Test Case | Key Scenario                      |
| ------------ | ----------------------------------- | --------- | --------------------------------- |
| R3+R4        | R3 (coupon present), R4 (no coupon) | TC-01     | New customer — coupon irrelevant  |
| R5           | R5                                  | TC-02     | Loyalty + coupon stacked (30%)    |
| R6           | R6                                  | TC-03     | Loyalty only (10%)                |
| R7           | R7                                  | TC-04     | Coupon only (20%)                 |
| R8           | R8                                  | TC-05     | No discount (0%)                  |
| R1, R2       | IMPOSSIBLE                          | —         | New + Loyalty: mutually exclusive |
