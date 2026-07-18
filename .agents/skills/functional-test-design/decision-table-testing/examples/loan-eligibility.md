# Example 2: Loan Application Eligibility — Extended Entry Table

## Scenario

**Feature:** Personal loan application assessment system  
**Business Rules:**

- **BR-101:** Applicant must be at least 18 years old to apply. Applicants under 18 are automatically rejected.
- **BR-102:** Employment status affects loan eligibility:
  - Full-time employed applicants may apply for any loan tier.
  - Part-time employed applicants may apply only for Tier 1 (small loans).
  - Unemployed applicants are automatically rejected regardless of other factors.
- **BR-103:** Credit score determines the loan tier available:
  - Score ≥ 700 (Good): eligible for Tier 2 (medium loans) and Tier 1.
  - Score 500–699 (Fair): eligible for Tier 1 only.
  - Score < 500 (Poor): automatically rejected.
- **BR-104:** An applicant who passes all eligibility checks receives an "Approved" decision with the highest tier they qualify for. An applicant who fails any eligibility check receives a "Rejected" decision with the specific rejection reason(s).
- **BR-105 (implied):** Age and credit score eligibility checks apply only if the applicant is not already rejected by employment status. However, **all checks must be evaluated** to provide a complete rejection reason if multiple criteria fail (the system does not short-circuit).

## Step 1 — Identify Conditions and Actions

### Requirement Analysis

**Conditions identified:**

- **Age (BR-101):** Under 18 vs 18 or older → binary → limited entry
- **Employment status (BR-102):** Full-time / Part-time / Unemployed → 3 values → **extended entry**
- **Credit score class (BR-103):** Good (≥700) / Fair (500–699) / Poor (<500) → 3 values → **extended entry** (EP pre-applied)

**Note on Credit Score:** The raw condition is a numeric score. EP was applied first:

- **Good:** score ≥ 700
- **Fair:** 500 ≤ score ≤ 699
- **Poor:** score < 500

**Actions identified:**

- **A1:** Approve for Tier 2 (highest eligibility)
- **A2:** Approve for Tier 1 only
- **A3:** Reject — underage
- **A4:** Reject — unemployed
- **A5:** Reject — poor credit score
- **A6:** Reject — employment tier limitation (part-time + Good credit: can only access Tier 1, but this is approval, not rejection — see analysis below)

**Spec gap resolved during Step 1:**

- BR-103 says Good credit qualifies for "Tier 2 and Tier 1" — but what if the applicant is part-time employed (Tier 1 max per BR-102)? The system approves for Tier 1 (lower of the two eligible tiers). Not a rejection — an approval at the constrained tier. Confirmed with BA: "Approve for highest tier the applicant qualifies for given ALL constraints."

**Revised Actions after clarification:**

| ID  | Description          | Observable Outcome                                                          | Source |
| --- | -------------------- | --------------------------------------------------------------------------- | ------ |
| A1  | Approve for Tier 2   | Decision = APPROVED, Tier = 2                                               | BR-104 |
| A2  | Approve for Tier 1   | Decision = APPROVED, Tier = 1                                               | BR-104 |
| A3  | Reject — underage    | Decision = REJECTED, Reason includes "Applicant must be 18 or older"        | BR-101 |
| A4  | Reject — unemployed  | Decision = REJECTED, Reason includes "Employment status: unemployed"        | BR-102 |
| A5  | Reject — poor credit | Decision = REJECTED, Reason includes "Credit score below minimum threshold" | BR-103 |

**Conditions (final):**

| ID  | Description                     | Values                           | Source | Notes          |
| --- | ------------------------------- | -------------------------------- | ------ | -------------- |
| C1  | Age eligibility                 | Under18 / 18OrOver               | BR-101 | Binary         |
| C2  | Employment status               | FullTime / PartTime / Unemployed | BR-102 | Extended entry |
| C3  | Credit score class (EP applied) | Good / Fair / Poor               | BR-103 | Extended entry |

## Step 2 — Build the Full Decision Table

**Total rules = 2 × 3 × 3 = 18 rules**

|                          | R1  | R2  | R3  | R4  | R5  | R6  | R7  | R8  | R9  | R10 | R11 | R12 | R13 | R14 | R15 | R16 | R17 | R18 |
| ------------------------ | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **CONDITIONS**           |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| C1 (Age)                 | U18 | U18 | U18 | U18 | U18 | U18 | U18 | U18 | U18 | 18+ | 18+ | 18+ | 18+ | 18+ | 18+ | 18+ | 18+ | 18+ |
| C2 (Employment)          | FT  | FT  | FT  | PT  | PT  | PT  | UE  | UE  | UE  | FT  | FT  | FT  | PT  | PT  | PT  | UE  | UE  | UE  |
| C3 (Credit)              | Gd  | Fr  | Po  | Gd  | Fr  | Po  | Gd  | Fr  | Po  | Gd  | Fr  | Po  | Gd  | Fr  | Po  | Gd  | Fr  | Po  |
| **ACTIONS**              |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |     |
| A1 (Approve Tier 2)      |     |     |     |     |     |     |     |     |     |  X  |     |     |     |     |     |     |     |     |
| A2 (Approve Tier 1)      |     |     |     |     |     |     |     |     |     |     |  X  |     |  X  |  X  |     |     |     |     |
| A3 (Reject: underage)    |  X  |  X  |  X  |  X  |  X  |  X  |  X  |  X  |  X  |     |     |     |     |     |     |     |     |     |
| A4 (Reject: unemployed)  |     |     |     |     |     |     |  X  |  X  |  X  |     |     |     |     |     |     |  X  |  X  |  X  |
| A5 (Reject: poor credit) |     |     |  X  |     |     |  X  |     |     |  X  |     |     |  X  |     |     |  X  |     |     |  X  |

**Action evaluation notes:**

- **R1–R9 (C1=Under18):** All rejected for underage (A3). Additionally, other rejection reasons still apply per BR-105 (system does not short-circuit).
- **R10 (18+, FT, Good):** Approved Tier 2 — full-time allows any tier; good credit qualifies for Tier 2.
- **R11 (18+, FT, Fair):** Approved Tier 1 — full-time allows any tier; fair credit limits to Tier 1.
- **R12 (18+, FT, Poor):** Rejected — poor credit.
- **R13 (18+, PT, Good):** Approved Tier 1 — part-time limits to Tier 1 (even though good credit would allow Tier 2).
- **R14 (18+, PT, Fair):** Approved Tier 1 — part-time allows Tier 1; fair credit also Tier 1. Same outcome.
- **R15 (18+, PT, Poor):** Rejected — poor credit.
- **R16–R18 (18+, UE):** All rejected for unemployment.

## Step 3 — Reduce the Decision Table

### 3a: Impossible Rules

**Review all 18 rules:** No combination is logically impossible in this scenario.

**Classification analysis:**

- Age Under 18 + Full-time/Part-time/Unemployed: all possible (a 17-year-old can hold any employment status)
- Age Under 18 + Good/Fair/Poor credit: all possible (credit scores exist for minors in some systems)
- Age 18+ + Unemployed: possible (an adult can be unemployed)
- No BR in the spec defines any two conditions as mutually exclusive

**No Type 1 candidates** (nothing in the spec prohibits any combination).  
**No Type 2 candidates** — the combinations are not merely assumed-impossible; they are genuinely possible in reality.

→ **No impossible rules removed.**

### 3b: Merge via Don't Care

The systematic approach checks **all pairs** across all three condition dimensions (C1, C2, and C3) — not only pairs that differ in C3. For each pair, verify: (a) action sets are identical, (b) exactly one condition differs.

#### Round 1 — Direct merges from the full table

**Pairs differing only in C3:**

| Rules      | C1  | C2  | C3       | Actions            | Same actions? | Merge?                 |
| ---------- | --- | --- | -------- | ------------------ | ------------- | ---------------------- |
| R1 vs R2   | U18 | FT  | Gd vs Fr | {A3} vs {A3}       | ✓             | ✓ → **R1+R2** (C3=—)   |
| R4 vs R5   | U18 | PT  | Gd vs Fr | {A3} vs {A3}       | ✓             | ✓ → **R4+R5** (C3=—)   |
| R7 vs R8   | U18 | UE  | Gd vs Fr | {A3,A4} vs {A3,A4} | ✓             | ✓ → **R7+R8** (C3=—)   |
| R13 vs R14 | 18+ | PT  | Gd vs Fr | {A2} vs {A2}       | ✓             | ✓ → **R13+R14** (C3=—) |
| R16 vs R17 | 18+ | UE  | Gd vs Fr | {A4} vs {A4}       | ✓             | ✓ → **R16+R17** (C3=—) |

**Pairs differing only in C2:**

| Rules      | C1  | C2       | C3  | Actions            | Same actions? | Merge?                           |
| ---------- | --- | -------- | --- | ------------------ | ------------- | -------------------------------- |
| R1 vs R4   | U18 | FT vs PT | Gd  | {A3} vs {A3}       | ✓             | ✓ (captured via cascading below) |
| R2 vs R5   | U18 | FT vs PT | Fr  | {A3} vs {A3}       | ✓             | ✓ (captured via cascading below) |
| R3 vs R6   | U18 | FT vs PT | Po  | {A3,A5} vs {A3,A5} | ✓             | ✓ → **R3+R6** (C2=—)             |
| R11 vs R14 | 18+ | FT vs PT | Fr  | {A2} vs {A2}       | ✓             | ✓ → **R11+R14** (C2=—)           |
| R12 vs R15 | 18+ | FT vs PT | Po  | {A5} vs {A5}       | ✓             | ✓ → **R12+R15** (C2=—)           |

**Pairs differing only in C1:** None share the same action set — U18 always adds A3 which 18+ rules do not have.

**Round 1 result — 7 valid merges found:** R1+R2, R4+R5, R7+R8, R13+R14, R16+R17, R3+R6, R11+R14, R12+R15

#### Round 2 — Cascading merges on the merged rules

After Round 1, check whether any newly merged rules can be merged further.

**R1+R2 = (U18, FT, —, {A3}) vs R4+R5 = (U18, PT, —, {A3}):**

- Actions: {A3} vs {A3} ✓
- Differ in C2 only (FT vs PT) ✓
- **VALID cascading merge → R1+R2+R4+R5 = (U18, —, —, {A3})**
- Rationale: Under-18 applicants with FT or PT employment and non-poor credit are ALL rejected for age only, regardless of employment type or credit class. C2 and C3 are both Don't Care.

**R3+R6 = (U18, —, Po, {A3,A5}) vs R7+R8 = (U18, UE, —, {A3,A4}):**

- Actions: {A3,A5} vs {A3,A4} ✗ Different → No merge.

**R11+R14 = (18+, —, Fr, {A2}) vs R13+R14 = (18+, PT, —, {A2}):**

- These two merged rules both have {A2} but differ in two dimensions (C2 and C3) simultaneously — they do not form a simple rectangular block. Cannot merge further.
- **Note:** R14 is covered by both R11+R14 and R13+R14. This is valid — R14 is redundantly covered, which is acceptable. Both merged rules are kept for completeness.

**R12+R15 = (18+, —, Po, {A5}) vs R18 = (18+, UE, Po, {A4,A5}):**

- Actions: {A5} vs {A4,A5} ✗ Different → No merge.

**No further cascading merges possible after Round 2.**

#### Round 3 — Final check: no further merges possible

All remaining rules checked — no additional valid pairs exist. Reduction is complete.

### 3c: Reduced Decision Table

**10 rules** after full reduction (18 → 10):

|                          |  R1+R2+R4+R5   | R3+R6  | R7+R8  | R9  | R10 | R11+R14  | R12+R15  | R13+R14  | R16+R17  | R18 |
| ------------------------ | :------------: | :----: | :----: | :-: | :-: | :------: | :------: | :------: | :------: | :-: |
| **CONDITIONS**           |                |        |        |     |     |          |          |          |          |     |
| C1 (Age)                 |      U18       |  U18   |  U18   | U18 | 18+ |   18+    |   18+    |   18+    |   18+    | 18+ |
| C2 (Employment)          |       —        |   —    |   UE   | UE  | FT  |    —     |    —     |    PT    |    UE    | UE  |
| C3 (Credit)              |       —        |   Po   |   —    | Po  | Gd  |    Fr    |    Po    |    —     |    —     | Po  |
| **ACTIONS**              |                |        |        |     |     |          |          |          |          |     |
| A1 (Approve T2)          |                |        |        |     |  X  |          |          |          |          |     |
| A2 (Approve T1)          |                |        |        |     |     |    X     |          |    X     |          |     |
| A3 (Reject: underage)    |       X        |   X    |   X    |  X  |     |          |          |          |          |     |
| A4 (Reject: unemployed)  |                |        |   X    |  X  |     |          |          |          |    X     |  X  |
| A5 (Reject: poor credit) |                |   X    |        |  X  |     |          |    X     |          |          |  X  |
| **Covers full rules**    | R1, R2, R4, R5 | R3, R6 | R7, R8 | R9  | R10 | R11, R14 | R12, R15 | R13, R14 | R16, R17 | R18 |

_R14 is covered by both R11+R14 and R13+R14 — redundant coverage is acceptable._

**Don't Care rationale:**

| Merged Rule | Don't Care Condition(s) | Rationale                                                                                                                                                                                        |
| ----------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1+R2+R4+R5 | C2=—, C3=—              | Under-18 with FT/PT and non-poor credit → rejected for age only. Employment type (FT/PT) and credit class (Good/Fair) have no effect on the outcome.                                             |
| R3+R6       | C2=— (FT/PT only)       | Under-18 with poor credit → rejected for age AND poor credit. Employment type (FT vs PT) does not change this outcome. Note: UE is excluded because R7+R8+R9 handle unemployed cases separately. |
| R7+R8       | C3=— (Good/Fair only)   | Under-18, unemployed, non-poor credit → rejected for age AND unemployment. Credit class (Good vs Fair) does not change this outcome.                                                             |
| R11+R14     | C2=— (FT/PT only)       | Adult with fair credit → Tier 1 approved regardless of FT or PT employment (both lead to Tier 1 given Fair credit). Note: UE excluded (different action set).                                    |
| R12+R15     | C2=— (FT/PT only)       | Adult with poor credit → rejected for poor credit, regardless of FT or PT employment. Note: UE excluded (adds A4 to action set).                                                                 |
| R13+R14     | C3=— (Good/Fair only)   | Adult, part-time → Tier 1 approved regardless of Good or Fair credit (PT caps at Tier 1 either way).                                                                                             |
| R16+R17     | C3=— (Good/Fair only)   | Adult, unemployed, non-poor credit → rejected for unemployment only. Credit class (Good vs Fair) does not change this outcome.                                                                   |

**Reduction summary:**

- Impossible rules removed: 0
- Round 1 merges: R1+R2, R4+R5, R7+R8, R13+R14, R16+R17, R3+R6, R11+R14, R12+R15 (8 merges)
- Round 2 cascading merges: R1+R2+R4+R5 (1 cascading merge)
- **Full table:** 18 rules → **Reduced:** 10 rules

## Step 4 — Derive Test Cases

One test case per reduced rule. Rules with Don't Care conditions require a concrete value choice — documented below.

| TC ID | Description                                                          | Rule        | C1  | C2   | C3   | Expected Result                                                 | BR                     |
| ----- | -------------------------------------------------------------------- | ----------- | --- | ---- | ---- | --------------------------------------------------------------- | ---------------------- |
| TC-01 | Under-18, non-unemployed, non-poor credit — rejected for age only    | R1+R2+R4+R5 | U18 | FT\* | Gd\* | REJECTED: "Applicant must be 18 or older"                       | BR-101                 |
| TC-02 | Under-18, non-unemployed, poor credit — rejected age + poor credit   | R3+R6       | U18 | PT\* | Po   | REJECTED: underage + poor credit score                          | BR-101, BR-103         |
| TC-03 | Under-18, unemployed, non-poor credit — rejected age + unemployed    | R7+R8       | U18 | UE   | Fr\* | REJECTED: underage + unemployed                                 | BR-101, BR-102         |
| TC-04 | Under-18, unemployed, poor credit — all three rejections             | R9          | U18 | UE   | Po   | REJECTED: underage + unemployed + poor credit                   | BR-101, BR-102, BR-103 |
| TC-05 | Adult, full-time, good credit — Tier 2 approved                      | R10         | 18+ | FT   | Gd   | APPROVED: Tier 2                                                | BR-104                 |
| TC-06 | Adult, non-unemployed, fair credit — Tier 1 approved                 | R11+R14     | 18+ | FT\* | Fr   | APPROVED: Tier 1                                                | BR-102, BR-103, BR-104 |
| TC-07 | Adult, non-unemployed, poor credit — rejected for poor credit        | R12+R15     | 18+ | PT\* | Po   | REJECTED: poor credit score                                     | BR-103                 |
| TC-08 | Adult, part-time, good/fair credit — Tier 1 (employment cap)         | R13+R14     | 18+ | PT   | Gd\* | APPROVED: Tier 1 (part-time caps at Tier 1 despite good credit) | BR-102, BR-104         |
| TC-09 | Adult, unemployed, non-poor credit — rejected for unemployment       | R16+R17     | 18+ | UE   | Gd\* | REJECTED: unemployed                                            | BR-102                 |
| TC-10 | Adult, unemployed, poor credit — rejected unemployment + poor credit | R18         | 18+ | UE   | Po   | REJECTED: unemployed + poor credit score                        | BR-102, BR-103         |

**Don't Care value notes:**

| TC ID | Don't Care Condition | Chosen Value | Rationale                                                                                                                                |
| ----- | -------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| TC-01 | C2 (Employment)      | FT           | FT is the cleaner "non-unemployed" representative; most clearly demonstrates that employment type doesn't affect outcome                 |
| TC-01 | C3 (Credit)          | Gd           | Good credit is the most revealing choice — if the system incorrectly triggers A5 for a Good-credit under-18, this will expose it         |
| TC-02 | C2 (Employment)      | PT           | PT chosen to differentiate from TC-01 (which uses FT) and confirm both FT and PT produce same outcome for R3+R6                          |
| TC-03 | C3 (Credit)          | Fr           | Fair chosen to complement TC-01 (Good) — confirms both Good and Fair produce same outcome for R7+R8                                      |
| TC-06 | C2 (Employment)      | FT           | FT chosen to exercise the FT+Fair path; PT+Fair is covered implicitly by R13+R14 (TC-08 uses Good but R14 = PT+Fair)                     |
| TC-07 | C2 (Employment)      | PT           | PT chosen to differentiate from TC-09 (FT poor credit path exercised less critically since R12 alone is a valid rule)                    |
| TC-08 | C3 (Credit)          | Gd           | Good credit is the most critical choice — confirms that even Good credit is capped at Tier 1 by part-time employment (key business rule) |
| TC-09 | C3 (Credit)          | Gd           | Good credit chosen — confirms unemployment rejection overrides even the highest credit class                                             |

## Step 5 — Review Against Quality Checklists

### Process Quality Checklist

- [x] All conditions identified: Age (binary), Employment (3 values), Credit (3 values with EP applied).
- [x] Implied conditions covered: "18 or older" complement (Under 18).
- [x] All actions identified including multiple simultaneous rejections per BR-105.
- [x] Spec gap (part-time + good credit tier resolution) confirmed with BA before construction.
- [x] Full table built first: 18 rules, confirmed 2 × 3 × 3 = 18.
- [x] No impossible rules — all 18 combinations can realistically occur (Type 1 and Type 2 analysis performed).
- [x] Merge analysis performed systematically across all three condition dimensions (C1, C2, C3) — not C3 only.
- [x] 9 merges verified across 2 rounds: Round 1 (8 direct merges) + Round 2 (1 cascading merge).
- [x] Don't Care rationale documented for all 7 merged rules with scope limitations noted (e.g., "FT/PT only — UE excluded").
- [x] Post-reduction coverage check: all 18 full rules covered by exactly one reduced rule (R14 covered by two merged rules — redundant coverage documented and acceptable).
- [x] Full table: 18 rules → Reduced: 10 rules.

### Test Case Quality Checklist

- [x] All 10 reduced rules have exactly one test case.
- [x] Every action (A1–A5) appears in at least one test case.
- [x] All expected results specify decision (APPROVED/REJECTED) and specific reason(s).
- [x] Don't Care values chosen with documented rationale for all 8 applicable cases.
- [x] No duplicate input combinations in final suite.

## Coverage Summary

| Reduced Rule | Covers Full Rules                              | TC    | Key Scenario                                                             |
| ------------ | ---------------------------------------------- | ----- | ------------------------------------------------------------------------ |
| R1+R2+R4+R5  | R1 (FT,Gd), R2 (FT,Fr), R4 (PT,Gd), R5 (PT,Fr) | TC-01 | Under-18 non-UE non-poor: age rejection only (C2 and C3 both Don't Care) |
| R3+R6        | R3 (FT,Po), R6 (PT,Po)                         | TC-02 | Under-18 non-UE poor credit: age + poor credit (C2 Don't Care)           |
| R7+R8        | R7 (UE,Gd), R8 (UE,Fr)                         | TC-03 | Under-18 unemployed non-poor: age + unemployed (C3 Don't Care)           |
| R9           | R9                                             | TC-04 | Under-18 unemployed poor: all three rejections                           |
| R10          | R10                                            | TC-05 | Adult FT Good: Tier 2 approved (only rule for Tier 2)                    |
| R11+R14      | R11 (FT,Fr), R14 (PT,Fr)                       | TC-06 | Adult non-UE Fair: Tier 1 approved (C2 Don't Care)                       |
| R12+R15      | R12 (FT,Po), R15 (PT,Po)                       | TC-07 | Adult non-UE Poor: credit rejection (C2 Don't Care)                      |
| R13+R14      | R13 (PT,Gd), R14 (PT,Fr)                       | TC-08 | Adult PT non-poor: Tier 1 employment cap (C3 Don't Care)                 |
| R16+R17      | R16 (UE,Gd), R17 (UE,Fr)                       | TC-09 | Adult UE non-poor: unemployment rejection (C3 Don't Care)                |
| R18          | R18                                            | TC-10 | Adult UE Poor: unemployed + credit rejection                             |

**Note on R14:** Covered by both R11+R14 and R13+R14. This is acceptable redundant coverage — R14 (Adult, PT, Fair → Tier 1) satisfies the action sets of both merged rules. TC-06 and TC-08 each independently confirm correct handling of paths that include R14.

**Coverage metrics:**

- **Full rules:** 18 → **Reduced rules:** 10 (44% reduction)
- **Test cases:** 10 (reduced from the naive 18)
- **All actions covered:** A1 ✓ (TC-05), A2 ✓ (TC-06, TC-08), A3 ✓ (TC-01–04), A4 ✓ (TC-03, TC-04, TC-09, TC-10), A5 ✓ (TC-02, TC-04, TC-07, TC-10)
