---
name: test-summary-generator
description: >
  Aggregate all results from 4 FRs into a Test Summary Report for HW02 README.md.
  Includes TC statistics, defect statistics by feature/severity/type, key metrics,
  and the self-assessment table. Only run after all 4 FRs have completed execution.
trigger:
  - "generate summary"
  - "test summary report"
  - "create summary"
  - "final summary"
output: Test Summary section in hw02-submission/README.md
---

# Skill: test-summary-generator

## 1. Purpose

Aggregate all testing results from 4 FRs into a complete Test Summary Report following `theory-test-report.md` Section 4. This populates the README.md of `hw02-submission/` — a required submission artifact for HW02.

## 2. Input Required

- 4 execution result files: `qa-artifacts/execution-results/FR{nn}-execution-results.md`
- 4 bug report files: `qa-artifacts/bug-reports/FR{nn}-bugs.md`
- 4 test case files: `qa-artifacts/test-cases/FR{nn}-test-cases.md`

## 3. Data Collection

### Step A — Collect TC Statistics per FR

Read each execution-results file and extract:

| FR        | EP TCs | BVA TCs | Total Designed | Executed | Passed | Failed | Blocked | Skipped |
| --------- | ------ | ------- | -------------- | -------- | ------ | ------ | ------- | ------- |
| FR-01     |        |         |                |          |        |        |         |         |
| FR-07     |        |         |                |          |        |        |         |         |
| FR-17     |        |         |                |          |        |        |         |         |
| FR-03     |        |         |                |          |        |        |         |         |
| **Total** |        |         |                |          |        |        |         |         |

### Step B — Collect Bug Statistics

Read each bug report file and extract:

**By Feature:**

| FR        | Total Bugs | Fatal | Serious | Medium | Cosmetic |
| --------- | ---------- | ----- | ------- | ------ | -------- |
| FR-01     |            |       |         |        |          |
| FR-07     |            |       |         |        |          |
| FR-17     |            |       |         |        |          |
| FR-03     |            |       |         |        |          |
| **Total** |            |       |         |        |          |

**By Defect Type** (from `theory-test-report.md` Section 4.2):

| Type                      | Count |
| ------------------------- | ----- |
| Business Logic            |       |
| Security / Access Control |       |
| User Interface            |       |
| API Contract              |       |
| Coding Logic              |       |

### Step C — Calculate Key Metrics

```
Pass Rate       = (Passed / Executed) * 100
TC Coverage     = (Executed / Designed) * 100
Bug Density     = Total Bugs / Total TCs Executed
```

### Step D — Prompt Human for Missing Inputs

Before generating the final report, explicitly ask the human to provide:

- The YouTube URLs for the Demonstration Videos (Section 6).
- The Self-Assessed Grades for each of the 5 criteria (Section 7).

Do NOT proceed to generate the output format until the human provides this information or explicitly tells you to leave them as placeholders.

## 4. Output Format

> **CRITICAL RULE:** All generated content MUST be strictly in English.

```markdown
# Test Summary Report — HW02 Domain Testing on EShop

**Student ID:** {id}
**Submission Date:** {YYYY-MM-DD}
**SUT:** EShop (github.com/ttbhanh/eshop-sut)
**Testing Technique:** Domain Testing — Equivalence Partitioning + Boundary Value Analysis
**AI Agent:** Antigravity CLI

## 1. Features Tested

| Pool | FR    | Description                               | Status    |
| ---- | ----- | ----------------------------------------- | --------- |
| A    | FR-01 | Account Registration                      | Completed |
| B    | FR-07 | Shopping Cart                             | Completed |
| C    | FR-17 | Coupon Management (Admin)                 | Completed |
| D    | FR-03 | Forgot Password & Reset Password (Mobile) | Completed |

## 2. Test Execution Summary

| FR        | EP TCs  | BVA TCs | Total Designed | Executed | Passed  | Failed  | Blocked | Skipped |
| --------- | ------- | ------- | -------------- | -------- | ------- | ------- | ------- | ------- |
| FR-01     | {n}     | {n}     | {n}            | {n}      | {n}     | {n}     | {n}     | {n}     |
| FR-07     | {n}     | {n}     | {n}            | {n}      | {n}     | {n}     | {n}     | {n}     |
| FR-17     | {n}     | {n}     | {n}            | {n}      | {n}     | {n}     | {n}     | {n}     |
| FR-03     | {n}     | {n}     | {n}            | {n}      | {n}     | {n}     | {n}     | {n}     |
| **Total** | **{n}** | **{n}** | **{n}**        | **{n}**  | **{n}** | **{n}** | **{n}** | **{n}** |

**Key Metrics:**

- **Pass Rate:** {%}
- **TC Execution Coverage:** {%} of designed TCs executed
- **Total Bugs Found:** {n}

## 3. Defect Statistics

### 3.1 By Feature

| FR        | Feature              | Bugs    | Fatal   | Serious | Medium  | Cosmetic |
| --------- | -------------------- | ------- | ------- | ------- | ------- | -------- |
| FR-01     | Account Registration | {n}     | {n}     | {n}     | {n}     | {n}      |
| FR-07     | Shopping Cart        | {n}     | {n}     | {n}     | {n}     | {n}      |
| FR-17     | Coupon Management    | {n}     | {n}     | {n}     | {n}     | {n}      |
| FR-03     | Forgot Password      | {n}     | {n}     | {n}     | {n}     | {n}      |
| **Total** |                      | **{n}** | **{n}** | **{n}** | **{n}** | **{n}**  |

### 3.2 By Severity

| Severity | Count | Percentage |
| -------- | ----- | ---------- |
| Fatal    | {n}   | {%}        |
| Serious  | {n}   | {%}        |
| Medium   | {n}   | {%}        |
| Cosmetic | {n}   | {%}        |

### 3.3 By Defect Type

| Type                      | Count | Description                                       |
| ------------------------- | ----- | ------------------------------------------------- |
| Business Logic            | {n}   | Wrong calculation, wrong workflow                 |
| Security / Access Control | {n}   | Auth bypass, role bypass, SEC violations          |
| User Interface            | {n}   | Wrong labels, missing UI elements, wrong behavior |
| API Contract              | {n}   | Wrong HTTP status, wrong response schema          |
| Coding Logic              | {n}   | Null pointer, crash, unexpected error             |

## 4. Notable Bugs

| Bug ID  | FR    | Summary   | Severity | GitHub Issue |
| ------- | ----- | --------- | -------- | ------------ |
| BUG-001 | FR-17 | {summary} | Serious  | #{n}         |
| BUG-002 | FR-03 | {summary} | Serious  | #{n}         |

## 5. Open Points & Residual Risks

| #   | Description                       | Risk Level          | Reason Deferred |
| --- | --------------------------------- | ------------------- | --------------- |
| 1   | {Unresolved bug or untested area} | High / Medium / Low | {reason}        |

## 6. Agent Skills Demonstration Videos

| Title                           | Description                                            | Link          |
| ------------------------------- | ------------------------------------------------------ | ------------- |
| Domain Testing Workflow (FR-01) | End-to-end: requirement-analyzer → test-case-generator | {YouTube URL} |
| Role-Auth Execution (FR-17)     | cURL role-bypass tests with 3 token states             | {YouTube URL} |

## 7. Self-Assessment

| No. | Criteria                                        | Grade   | Self-Assessed Grade |
| --- | ----------------------------------------------- | ------- | ------------------- |
| 1   | Feature A: FR-01 — Domain Testing + BVA         | 25      |                     |
| 2   | Feature B: FR-07 — Domain Testing + BVA         | 25      |                     |
| 3   | Feature C: FR-17 — Domain Testing + BVA         | 25      |                     |
| 4   | Feature D: FR-03 — Mobile, Domain Testing + BVA | 15      |                     |
| 5   | Agent Skills                                    | 10      |                     |
|     | **Total**                                       | **100** |                     |

## 8. Agent Skills Used

| #   | Skill                         | Purpose                                    |
| --- | ----------------------------- | ------------------------------------------ |
| 1   | requirement-analyzer          | Extract FR constraints and business rules  |
| 2   | domain-identifier             | Identify input and output variables        |
| 3   | equivalence-partitioning      | Apply EP guidelines and optimization rules |
| 4   | boundary-value-analysis       | Apply 9-point BVA strategy                 |
| 5   | domain-coverage-reviewer      | QA gate and AI gap analysis                |
| 6   | test-case-generator           | Compile final TC table                     |
| 7   | test-case-reviewer            | QA gate for TC quality                     |
| 8   | test-execution-assistant      | Execution guide per channel                |
| 9   | bug-report-writer             | Write defect reports                       |
| 10  | github-issue-writer           | Post bugs to GitHub Issues                 |
| 11  | test-summary-generator        | This summary report                        |
| 12  | traceability-matrix-generator | FR to TC to Bug traceability               |
| 13  | ai-audit-logger               | Log all AI interactions                    |
```

## 5. Quality Checklist

- [ ] All generated content is completely in English
- [ ] All 4 FRs present in every summary table
- [ ] TC statistics match the execution results files exactly
- [ ] Bug statistics match the bug report files exactly
- [ ] Pass rate and coverage calculated correctly
- [ ] Notable bugs table has GitHub issue numbers filled in
- [ ] Demo video links added (or placeholders left if human requested)
- [ ] Open points section completed (if any unresolved bugs exist)
- [ ] Self-assessment table filled in with human-provided grades
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk
