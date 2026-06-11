---
name: traceability-matrix-generator
description: >
  Build a Traceability Matrix linking FR Business Rules → EP Classes → Test Cases
  → Execution Status → Bugs → GitHub Issues. Proves test coverage for the grader
  and ensures no requirement is left untested. Run after all 4 FRs complete
  execution and bug reporting.
trigger:
  - "traceability matrix"
  - "generate traceability"
  - "coverage matrix"
  - "build traceability"
output: qa-artifacts/traceability/traceability-matrix.md
---

# Skill: traceability-matrix-generator

## 1. Purpose

Build a traceability matrix to:

1. Prove every FR business rule has test case coverage
2. Link Bug IDs to TC IDs so developers know where each bug was found
3. Detect coverage gaps (ECs without TCs)
4. Provide a high-level quality view for the grader

## 2. Input Required

- 4 domain-analysis files (EC and BR lists)
- 4 boundary-analysis files (BVA points)
- 4 test-cases files (TC list with IDs)
- 4 execution-results files (Pass/Fail/Blocked/Skipped status)
- 4 bug-reports files (Bug ID + GitHub Issue number)

## 3. Matrix Structure

Three interconnected tables:

**Matrix 1:** FR Business Rule → EC → TC → Status (proves requirements coverage)
**Matrix 2:** Complete TC list → Execution → Bug (operational view)
**Matrix 3:** Bug Register → FR → TC (defect traceability)

## 4. Step-by-Step Instructions

### Step A — Collect All IDs

From each FR artifact, collect:

- Business Rules and Constraints (from requirement-analysis, citing exact FR-xx or SEC-xx sources)
- Equivalence Class IDs (EC-xx from domain-analysis)
- BVA point descriptions (from boundary-analysis)
- TC IDs with execution status (from execution-results)
- Bug IDs with GitHub issue numbers (from bug-reports)

### Step B — Build FR to TC to Bug Chain

For each BR → find covering EC → find covering TC → find execution status → find Bug ID if FAIL

### Step C — Detect Coverage Gaps

Any EC without a covering TC = coverage gap. Document and explain.

### Step D — Calculate Coverage Metrics

```
EC Coverage (%)     = (ECs with at least 1 TC) / (Total ECs) * 100
TC Execution (%)    = (Executed TCs) / (Total Designed TCs) * 100
Bug Link Rate (%)   = (Failed TCs with Bug ID) / (Total Failed TCs) * 100
```

## 5. Output Format

> **CRITICAL RULE:** All generated content MUST be strictly in English.

```markdown
# Traceability Matrix — HW02 Domain Testing on EShop

**Generated:** {YYYY-MM-DD}
**Overall Coverage:** {EC coverage}% EC | {TC execution}% TC | {n} total bugs

## Matrix 1: FR Business Rule → EC → TC → Status

### FR-01: Account Registration

| BR ID  | Business Rule                                | EC ID  | EC Type | Covering TC  | Channel  | Status | Bug ID  |
| ------ | -------------------------------------------- | ------ | ------- | ------------ | -------- | ------ | ------- |
| BR-01  | Email must have valid format (per FR-01)     | EC02   | Invalid | FR01-EP-002  | UI + API | PASS   | —       |
| BR-02  | Email must be unique in DB (per FR-01)       | EC04   | Invalid | FR01-EP-004  | UI + API | FAIL   | BUG-001 |
| BR-03  | Password >= 8 chars (per FR-01)              | EC07   | Invalid | FR01-EP-006  | API      | PASS   | —       |
| BR-03  | Password LB = 8 chars (per FR-01)            | BVA-LB | BVA     | FR01-BVA-002 | API      | PASS   | —       |
| SEC-04 | Input displayed safely — no XSS (per SEC-04) | EC-XSS | Invalid | FR01-EP-015  | UI       | PASS   | —       |

### FR-07: Shopping Cart

| BR ID | Business Rule                                     | EC ID | EC Type | Covering TC | Channel    | Status | Bug ID  |
| ----- | ------------------------------------------------- | ----- | ------- | ----------- | ---------- | ------ | ------- |
| BR-01 | Quantity must be integer >= 1 (per FR-07)         | EC02  | Invalid | FR07-EP-002 | UI + API   | PASS   | —       |
| BR-02 | Duplicate product add merges quantity (per FR-07) | EC05  | Valid   | FR07-EP-005 | UI + State | FAIL   | BUG-002 |
| BR-03 | Delete requires confirm dialog (per FR-07)        | EC07  | Valid   | FR07-EP-007 | UI + DOM   | PASS   | —       |

### FR-17: Coupon Management (Admin)

| BR ID | Business Rule                                     | EC ID   | EC Type | Covering TC | Channel   | Status | Bug ID  |
| ----- | ------------------------------------------------- | ------- | ------- | ----------- | --------- | ------ | ------- |
| BR-01 | Only admin can create coupons (per FR-17, SEC-03) | EC-user | Invalid | FR17-EP-008 | Role-Auth | FAIL   | BUG-003 |
| BR-02 | discount_value must be > 0 (per FR-17)            | EC03    | Invalid | FR17-EP-003 | API       | PASS   | —       |

### FR-03: Forgot Password & Reset Password (Mobile)

| BR ID | Business Rule                                            | EC ID     | EC Type | Covering TC | Channel      | Status | Bug ID  |
| ----- | -------------------------------------------------------- | --------- | ------- | ----------- | ------------ | ------ | ------- |
| BR-01 | OTP bound to requesting email (per SEC-07)               | EC-xemail | Invalid | FR03-EP-006 | API          | FAIL   | BUG-004 |
| BR-02 | OTP invalidated after use (per SEC-07)                   | EC-reuse  | Invalid | FR03-EP-007 | API          | PASS   | —       |
| BR-03 | New password must meet strength requirements (per FR-03) | EC07      | Invalid | FR03-EP-008 | Mobile + API | PASS   | —       |

## Matrix 2: Complete TC List

| TC ID        | FR    | Type | Objective (brief)                   | Channel    | Status | Bug ID  | GitHub |
| ------------ | ----- | ---- | ----------------------------------- | ---------- | ------ | ------- | ------ |
| FR01-EP-001  | FR-01 | EP   | Happy path registration             | UI + API   | PASS   | —       | —      |
| FR01-EP-002  | FR-01 | EP   | Invalid email format                | UI + API   | PASS   | —       | —      |
| FR01-EP-004  | FR-01 | EP   | Email already exists in DB          | UI + API   | FAIL   | BUG-001 | #12    |
| FR01-BVA-002 | FR-01 | BVA  | Password 7 chars (LB-1)             | API        | PASS   | —       | —      |
| FR07-EP-005  | FR-07 | EP   | Duplicate product merges quantity   | UI + State | FAIL   | BUG-002 | #13    |
| FR17-EP-008  | FR-17 | EP   | User token on admin coupon endpoint | Role-Auth  | FAIL   | BUG-003 | #14    |
| FR03-EP-006  | FR-03 | EP   | OTP cross-email attack              | API        | FAIL   | BUG-004 | #15    |
| ...          |       |      |                                     |            |        |         |        |

## Matrix 3: Bug Register

| Bug ID  | FR    | Severity | Priority  | Linked TC   | Summary                                    | GitHub | Status |
| ------- | ----- | -------- | --------- | ----------- | ------------------------------------------ | ------ | ------ |
| BUG-001 | FR-01 | Medium   | Medium    | FR01-EP-004 | Registration allows duplicate email        | #12    | New    |
| BUG-002 | FR-07 | Medium   | Medium    | FR07-EP-005 | Duplicate product creates new cart row     | #13    | New    |
| BUG-003 | FR-17 | Serious  | Immediate | FR17-EP-008 | User JWT accepted by admin coupon endpoint | #14    | New    |
| BUG-004 | FR-03 | Serious  | High      | FR03-EP-006 | OTP from emailA resets password of emailB  | #15    | New    |

## Coverage Summary

| FR        | Total ECs | ECs Covered | EC Coverage | Total TCs | Executed | Passed | Failed | Bugs    |
| --------- | --------- | ----------- | ----------- | --------- | -------- | ------ | ------ | ------- |
| FR-01     | {n}       | {n}         | {%}         | {n}       | {n}      | {n}    | {n}    | {n}     |
| FR-07     | {n}       | {n}         | {%}         | {n}       | {n}      | {n}    | {n}    | {n}     |
| FR-17     | {n}       | {n}         | {%}         | {n}       | {n}      | {n}    | {n}    | {n}     |
| FR-03     | {n}       | {n}         | {%}         | {n}       | {n}      | {n}    | {n}    | {n}     |
| **Total** |           |             | **{%}**     |           |          |        |        | **{n}** |

### Coverage Gaps

| EC ID | FR  | Description                         | Reason Not Covered |
| ----- | --- | ----------------------------------- | ------------------ |
| —     | —   | None — all ECs have at least one TC | —                  |
```

## 6. Quality Checklist

- [ ] All generated content is completely in English
- [ ] Every EC from all domain-analysis files appears in Matrix 1
- [ ] Every TC from all test-cases files appears in Matrix 2
- [ ] Every Bug has a linked TC in Matrix 3
- [ ] Every FAIL TC has a Bug ID
- [ ] GitHub issue numbers populated for all bugs
- [ ] Coverage gaps identified and explained
- [ ] Coverage metrics calculated correctly
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk
