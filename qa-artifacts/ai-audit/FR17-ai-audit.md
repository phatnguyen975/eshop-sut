# AI Audit Log — FR-17: Coupon Management (Admin CRUD)

| Metric                          | Value            |
| ------------------------------- | ---------------- |
| Total skill sessions logged     | 4                |
| Total AI outputs reviewed       | 4                |
| Items accepted as-is            | All (cumulative) |
| Items modified by student       | 0                |
| Items added manually by student | 0                |
| Items rejected                  | 0                |

## Interaction [1] — requirement-analyzer

| Field             | Value                                                |
| ----------------- | ---------------------------------------------------- |
| **Tool**          | Antigravity CLI (Claude Sonnet 4.6 Thinking backend) |
| **Date/Time**     | 2026-06-18 01:21                                     |
| **Feature**       | FR-17 — Coupon Management (Admin CRUD)               |
| **Skill Invoked** | requirement-analyzer                                 |
| **Task**          | Analyze FR-17 from the EShop SRS.                    |

### Prompt Given

```text
/requirement-analyzer Use the requirement-analyzer skill.

Analyze FR-17 from the EShop SRS.

Feature: Coupon CRUD
FR ID: FR-17

Read the following context files before starting:
- .agents/context/eshop-srs.md (look for FR-17 section)
- .agents/context/eshop-api-spec.md (look for related endpoints)

Follow all steps in the skill (A through G) in order.
Output the result to: qa-artifacts/requirements/FR17-requirement-analysis.md
```

### AI Output Summary

- Generated a comprehensive requirement analysis covering input fields, constraints, business rules, expected outputs, GUI, and Security requirements for FR-17.
- Correctly identified 6 explicit UI/API input fields (`code`, `type`, `discount_value`, `expired_at`, `min_order_amount`, `max_uses_per_user`), plus `id` (API only) and the `Authorization` header.
- Correctly noted implicit constraints such as the lack of an Edit (PUT) endpoint and the edge cases for `discount_value` and `max_uses_per_user >= 1`.
- Identified 4 applicable security constraints (SEC-02, SEC-03, SEC-04, SEC-05).

### Student Review Notes

- **Accepted as-is:** The entire requirement analysis document. It accurately caught all edge cases like `max_uses_per_user >= 1` and the lack of an Edit (PUT) endpoint.
- **Modified:** None.
- **Added manually:** None.
- **Rejected:** None.

### Interaction Quality Assessment

| Criterion           | Rating (1–5) | Notes                                                                                             |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------------- |
| Completeness        | 5            | Did AI cover all required classes? Yes, covered all FR-17 constraints.                            |
| Accuracy            | 5            | Were generated items correct per SRS? Yes, fully accurate.                                        |
| Guideline adherence | 5            | Did AI follow EP/BVA rules correctly? N/A for requirement analysis, but followed all skill steps. |
| Items missed        | 0 count      | Number of classes AI did not generate                                                             |

## Interaction [2] — domain-identifier

| Field             | Value                                                |
| ----------------- | ---------------------------------------------------- |
| **Tool**          | Antigravity CLI (Claude Sonnet 4.6 Thinking backend) |
| **Date/Time**     | 2026-06-18 01:44                                     |
| **Feature**       | FR-17 — Coupon Management (Admin CRUD)               |
| **Skill Invoked** | domain-identifier                                    |
| **Task**          | Identify all input and output variables for FR-17.   |

### Prompt Given

```text
/domain-identifier Use the domain-identifier skill.

Feature: FR-17 — Coupon Management

The requirement analysis is complete. Read it at:
qa-artifacts/requirements/FR17-requirement-analysis.md

Also read: .agents/context/eshop-srs.md and .agents/context/eshop-api-spec.md

Identify ALL input variables (direct and hidden/indirect) and ALL output variables
(direct and hidden/indirect) for this feature.

Pay special attention to the Common AI Blind Spots section in the skill.

Append the output as Step 1 to: qa-artifacts/domain-analysis/FR17-domain-analysis.md
```

### AI Output Summary

- Identified 7 direct inputs and 4 indirect inputs (including `auth_token`, `user_role`, `code_uniqueness`, `coupon_id_existence`).
- Identified 6 direct outputs and 6 indirect outputs (including DB INSERT/DELETE states and DOM checks).
- Listed all variables requiring EP and identified valid boundary candidates for BVA (`discount_value`, `min_order_amount`, `max_uses_per_user`, etc.).
- Correctly assigned channels to each variable (UI, API, State, DOM).

### Student Review Notes

- **Accepted as-is:** The output flawlessly captured the common AI blind spots, particularly the hidden DB states and JWT role requirements.
- **Modified:** None.
- **Added manually:** None.
- **Rejected:** None.

### Interaction Quality Assessment

| Criterion           | Rating (1–5) | Notes                                                                                      |
| ------------------- | ------------ | ------------------------------------------------------------------------------------------ |
| Completeness        | 5            | Did AI cover all required variables? Yes, covered all direct and hidden variables.         |
| Accuracy            | 5            | Were generated items correct per SRS? Yes, fully accurate.                                 |
| Guideline adherence | 5            | Did AI follow EP/BVA rules correctly? Yes, properly identified EP and boundary candidates. |
| Items missed        | 0 count      | Number of classes AI did not generate                                                      |

## Interaction [3] — equivalence-partitioning

| Field             | Value                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Tool**          | Antigravity CLI (Claude Sonnet 4.6 Thinking backend)                                   |
| **Date/Time**     | 2026-06-18 03:38                                                                       |
| **Feature**       | FR-17 — Coupon Management                                                              |
| **Skill Invoked** | equivalence-partitioning                                                               |
| **Task**          | Applied EP guidelines to all FR-17 variables, optimizing valid and invalid test cases. |

### Prompt Given

```text
Feature: FR-17 — Coupon Management (Admin CRUD)

The variable list is ready at:
qa-artifacts/domain-analysis/FR17-domain-analysis.md (Step 1 section)

Apply all 4 EP Guidelines to EVERY input variable identified.
Then apply the Combination Rule for valid classes and the Isolation Rule for invalid classes.

Important — do NOT miss these for FR-17:
Authorization (FR-17 and any admin endpoint) — 3 auth classes:
1. No token → 401
2. Valid user token (non-admin) → 403
3. Valid admin token → 200

For FR-17 add:
- User JWT token calling admin endpoint as a separate auth invalid class
- discount_value = 0 exactly as a separate invalid class (boundary at zero)

Append the output as Step 2 and Step 3 to:
qa-artifacts/domain-analysis/FR17-domain-analysis.md
```

### AI Output Summary

- Generated 41 Equivalence Classes across 11 variables (14 valid, 27 invalid).
- Successfully enforced the Isolation Rule, resulting in exactly one invalid input per test case across 31 invalid TCs.
- Successfully applied the Combination Rule to consolidate valid classes into 6 valid TCs.
- Correctly implemented specific required classes such as `discount_value = 0` and role-based Auth boundaries (User JWT calling admin endpoint).

### Student Review Notes

- **Accepted as-is:** The AI perfectly navigated the logical constraints of the EShop SRS. No Defect Masking occurred.
- **Modified:** None.
- **Added manually:** None.
- **Rejected:** None.

### Interaction Quality Assessment

| Criterion           | Rating (1–5) | Notes                                                                            |
| ------------------- | ------------ | -------------------------------------------------------------------------------- |
| Completeness        | 5            | Did AI cover all required classes? Yes.                                          |
| Accuracy            | 5            | Were generated items correct per SRS? Yes.                                       |
| Guideline adherence | 5            | Did AI follow EP/BVA rules correctly? Yes, strict isolation/combination applied. |
| Items missed        | 0 count      | Number of classes AI did not generate                                            |

## Interaction [4] — boundary-value-analysis

| Field             | Value                                                                            |
| ----------------- | -------------------------------------------------------------------------------- |
| **Tool**          | Antigravity CLI (Claude Sonnet 4.6 Thinking backend)                             |
| **Date/Time**     | 2026-06-18 04:18                                                                 |
| **Feature**       | FR-17 — Coupon Management                                                        |
| **Skill Invoked** | boundary-value-analysis                                                          |
| **Task**          | Applied the 9-point BVA strategy to all ordered and numeric variables for FR-17. |

### Prompt Given

```text
/boundary-value-analysis Use the boundary-value-analysis skill.

Feature: FR-17 — Coupon Management

The EP classes are ready at:
qa-artifacts/domain-analysis/FR17-domain-analysis.md (Step 2+3 section)

From that output, identify all variables with ordered/numeric constraints and apply
the 9-point BVA strategy to each one.

Remember to apply BVA to:
- Numeric fields (quantity, discount_value, min_order_amount, max_uses_per_user)
- String LENGTH fields (password length, name length, coupon code length)
- Date fields (expired_at)
- NOT just numbers — string length is a boundary variable too

For any UB that is not specified in the SRS, note it as "unspecified" and include
a +alpha test case with a very large value.

Save the output to:
qa-artifacts/boundary-analysis/FR17-boundary-analysis.md
```

### AI Output Summary

- Identified 5 boundary variables: `discount_value`, `min_order_amount`, `max_uses_per_user`, `expired_at`, and `code` length. Excluded unordered variables.
- Generated 35 BVA test cases, enforcing the isolation rule (exactly one invalid point per TC with valid baselines for others).
- Authored dynamic date bounds (`TODAY`, `TODAY - 1 day`) for `expired_at` rather than hardcoding stale dates.
- Managed unspecified upper bounds via +α tests (e.g. 9999999 for discount, 300 chars for code) and noted semantic upper bound (100) for percent discounts.

### Student Review Notes

- **Accepted as-is:** The BVA execution was flawless and perfectly synchronized with the previous manual overrides. The dynamic date generation logic for `expired_at` was an exceptionally high-quality addition.
- **Modified:** None.
- **Added manually:** None.
- **Rejected:** None.

### Interaction Quality Assessment

| Criterion           | Rating (1–5) | Notes                                                                    |
| ------------------- | ------------ | ------------------------------------------------------------------------ |
| Completeness        | 5            | Did AI cover all required variables? Yes, 5 variables identified.        |
| Accuracy            | 5            | Were generated items correct per SRS? Yes, rules properly adhered to.    |
| Guideline adherence | 5            | Did AI follow EP/BVA rules correctly? Yes, 9-point BVA properly applied. |
| Items missed        | 0 count      | Number of classes AI did not generate                                    |
