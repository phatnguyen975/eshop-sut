---
name: traceability-matrix-generator
description: >
  Batch-generate a complete traceability matrix for all 4 FRs in a single pass.
  Links FR Business Rules → Equivalence Classes → Test Cases → Execution Status →
  Bug IDs → GitHub Issues. Reads all requirement-analysis, domain-analysis,
  boundary-analysis, test-cases, execution-results, and bug-report files to produce
  qa-artifacts/traceability/traceability-matrix.md. Run after all 4 FRs have completed
  bug reporting and GitHub issue posting (all GitHub issue numbers must be final).
trigger:
  - "traceability matrix"
  - "generate traceability"
  - "coverage matrix"
  - "build traceability"
output: qa-artifacts/traceability/traceability-matrix.md
---

# Skill: traceability-matrix-generator

## 1. Purpose

Generate a single `traceability-matrix.md` file covering all 4 FRs that:

1. Proves every FR business rule has at least one covering test case
2. Links every FAIL TC to its Bug ID and GitHub Issue number
3. Identifies EC coverage gaps (ECs without TCs)
4. Provides quantitative coverage metrics for the grader
5. Serves as input for `test-summary-generator` (EC coverage % field)

**Batch operation:** Read all artifact files in one pass and generate the complete matrix without requiring the human to provide data manually.

## 2. Input Files (Read All Before Starting)

| File                                                       | What to extract                                                            |
| ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| `qa-artifacts/requirements/FR01-requirement-analysis.md`   | Business Rule IDs (BR-xx) and their descriptions                           |
| `qa-artifacts/requirements/FR07-requirement-analysis.md`   | Same                                                                       |
| `qa-artifacts/requirements/FR17-requirement-analysis.md`   | Same                                                                       |
| `qa-artifacts/requirements/FR03-requirement-analysis.md`   | Same                                                                       |
| `qa-artifacts/domain-analysis/FR01-domain-analysis.md`     | EC IDs, EC type (Valid/Invalid), EC description, which BR each EC covers   |
| `qa-artifacts/domain-analysis/FR07-domain-analysis.md`     | Same                                                                       |
| `qa-artifacts/domain-analysis/FR17-domain-analysis.md`     | Same                                                                       |
| `qa-artifacts/domain-analysis/FR03-domain-analysis.md`     | Same                                                                       |
| `qa-artifacts/boundary-analysis/FR01-boundary-analysis.md` | BVA point IDs and which variable/BR each covers                            |
| `qa-artifacts/boundary-analysis/FR07-boundary-analysis.md` | Same                                                                       |
| `qa-artifacts/boundary-analysis/FR17-boundary-analysis.md` | Same                                                                       |
| `qa-artifacts/boundary-analysis/FR03-boundary-analysis.md` | Same                                                                       |
| `qa-artifacts/test-cases/FR01-test-cases.md`               | TC IDs, EC/BVA Ref, Channel, Automation category, Status, Objective        |
| `qa-artifacts/test-cases/FR07-test-cases.md`               | Same                                                                       |
| `qa-artifacts/test-cases/FR17-test-cases.md`               | Same                                                                       |
| `qa-artifacts/test-cases/FR03-test-cases.md`               | Same                                                                       |
| `qa-artifacts/execution-results/FR01-execution-results.md` | Final Status per TC (PASS/FAIL/BLOCKED/SKIPPED)                            |
| `qa-artifacts/execution-results/FR07-execution-results.md` | Same                                                                       |
| `qa-artifacts/execution-results/FR17-execution-results.md` | Same                                                                       |
| `qa-artifacts/execution-results/FR03-execution-results.md` | Same                                                                       |
| `qa-artifacts/bug-reports/FR01-bugs.md`                    | Bug ID, Linked TCs, Severity, Priority, Summary, GitHub Issue link, Status |
| `qa-artifacts/bug-reports/FR07-bugs.md`                    | Same                                                                       |
| `qa-artifacts/bug-reports/FR17-bugs.md`                    | Same                                                                       |
| `qa-artifacts/bug-reports/FR03-bugs.md`                    | Same                                                                       |

## 3. Batch Processing Procedure

### Step A — Build the BR → EC → TC → Status Chain per FR

For each FR, construct the chain as follows:

1. Read all Business Rules (BR-xx) from `FR{nn}-requirement-analysis.md`
2. For each BR, find which ECs cover it in `FR{nn}-domain-analysis.md`
   - If a BR has no EC, mark as **coverage gap**
3. For each EC, find which TC covers it in `FR{nn}-test-cases.md` (via EC Ref column)
   - If an EC has no TC, mark as **coverage gap**
4. For each TC, look up Status in `FR{nn}-execution-results.md`
5. If Status = FAIL, find the Bug ID in `FR{nn}-bugs.md` (by checking if the TC ID is included in the comma-separated `Linked TCs` field) and extract the GitHub Issue link

Additionally include BVA points:

- Read all BVA points from `FR{nn}-boundary-analysis.md`
- For each BVA point, find the TC covering it (ID pattern: `FR{nn}-BVA-*`)
- Link to the same BR that the variable's EP class links to

### Step B — Build the Complete TC List (Matrix 2)

List every TC across all 4 FRs with:

- TC ID, FR, Type (EP/BVA), Objective (brief, ≤55 chars), Channel, Automation category, Status, Bug ID (if FAIL), GitHub Issue (if FAIL)

This is a full enumeration — list ALL TCs, not just highlights.

### Step C — Build the Bug Register (Matrix 3)

List every bug across all 4 FRs from the bug report files with:

- Bug ID, FR, Severity, Priority, Linked TC, Summary (brief ≤55 chars), GitHub Issue as clickable Markdown link `[#N](url)`, Status (from bug report)

### Step D — Detect Coverage Gaps

A coverage gap exists when:

- A BR has no EC defined for it, OR
- An EC exists but has no covering TC in the test-cases files

Document each gap with: EC/BR ID, FR, description, and reason not covered.

### Step E — Calculate Coverage Metrics per FR and Total

For each FR and overall:

```
EC Coverage (%)      = ECs with at least 1 covering TC / Total ECs × 100
BVA Coverage (%)     = BVA points with TC / Total BVA points × 100
TC Execution (%)     = Executed TCs / Total designed TCs × 100
TC Pass Rate (%)     = Passed TCs / Executed TCs × 100
Bug Link Rate (%)    = Failed TCs with Bug ID / Total Failed TCs × 100
                       (should be 100% after complete flow — flag if not)
```

## 4. Output Format

File: `qa-artifacts/traceability/traceability-matrix.md`

```markdown
# Traceability Matrix — HW02 Domain Testing on EShop

**Generated by:** traceability-matrix-generator skill
**Date:** {YYYY-MM-DD}
**FRs covered:** FR-01, FR-07, FR-17, FR-03

**Overall Summary:**

- EC Coverage: {%} ({n}/{n} ECs have covering TCs)
- BVA Coverage: {%} ({n}/{n} BVA points have TCs)
- TC Execution: {%} ({n}/{n} TCs executed)
- TC Pass Rate: {%} ({n}/{n} executed TCs passed)
- Total Bugs: {n} | Bug Link Rate: {%}

## Matrix 1: FR → Business Rule → EC → TC → Status

> **Purpose:** Proves every SRS requirement has test coverage.

### FR-01: Account Registration

| BR ID  | Business Rule (per SRS)                      | EC / BVA Ref | EC Type  | Covering TC  | Automation     | Channel     | Status   | Bug ID              |
| ------ | -------------------------------------------- | ------------ | -------- | ------------ | -------------- | ----------- | -------- | ------------------- |
| BR-01  | name field required (per FR-01)              | EC03         | Invalid  | FR01-EP-003  | SCRIPT-FULL    | API         | PASS     | —                   |
| BR-02  | Email valid format (per FR-01)               | EC02         | Invalid  | FR01-EP-002  | SCRIPT-FULL    | API         | PASS     | —                   |
| BR-03  | Email unique in DB (per FR-01)               | EC04         | Invalid  | FR01-EP-004  | SCRIPT-FULL    | API + State | FAIL     | [BUG-001](#bug-001) |
| BR-04  | Password ≥ 8 chars (per FR-01)               | EC07         | Invalid  | FR01-EP-006  | SCRIPT-FULL    | API         | PASS     | —                   |
| BR-04  | Password LB = 8 chars (BVA)                  | FR01-BVA-002 | BVA LB-1 | FR01-BVA-002 | SCRIPT-FULL    | API         | PASS     | —                   |
| BR-08  | Special char from `@$!%*?&` only (per FR-01) | EC12         | Invalid  | FR01-EP-012  | SCRIPT-FULL    | API         | PASS     | —                   |
| BR-09  | confirmPassword must match (per FR-01)       | EC13         | Invalid  | FR01-EP-013  | MANUAL         | UI          | PASS     | —                   |
| BR-10  | Redirect to Login after success (per FR-01)  | EC01         | Valid    | FR01-EP-001  | SCRIPT-PARTIAL | UI + API    | PASS     | —                   |
| SEC-01 | Password stored as hash (per SEC-01)         | EC01-hash    | DB State | FR01-EP-001  | SCRIPT-FULL    | API + DB    | {status} | {bug or —}          |
| SEC-04 | Input escaped on display (per SEC-04)        | EC-XSS       | Invalid  | FR01-EP-020  | DOM + SCRIPT   | UI + DOM    | {status} | {bug or —}          |
| GUI-01 | Exactly 1 h1 tag (per FR-21)                 | EC-h1        | DOM      | FR01-EP-021  | DOM            | DOM         | {status} | {bug or —}          |
| GUI-03 | Email input type="email" (per FR-22)         | EC-email     | DOM      | FR01-EP-022  | DOM            | DOM         | {status} | {bug or —}          |

### FR-07: Shopping Cart

| BR ID | Business Rule (per SRS) | EC / BVA Ref | EC Type | Covering TC | Automation | Channel | Status | Bug ID |
| ----- | ----------------------- | ------------ | ------- | ----------- | ---------- | ------- | ------ | ------ |

{— same pattern for all FR-07 BRs and ECs}

### FR-17: Coupon Management (Admin)

| BR ID | Business Rule (per SRS) | EC / BVA Ref | EC Type | Covering TC | Automation | Channel | Status | Bug ID |
| ----- | ----------------------- | ------------ | ------- | ----------- | ---------- | ------- | ------ | ------ |

{— same pattern for all FR-17 BRs and ECs}

### FR-03: Forgot Password & Reset Password (Mobile)

| BR ID | Business Rule (per SRS) | EC / BVA Ref | EC Type | Covering TC | Automation | Channel | Status | Bug ID |
| ----- | ----------------------- | ------------ | ------- | ----------- | ---------- | ------- | ------ | ------ |

{— same pattern for all FR-03 BRs and ECs}

## Matrix 2: Complete TC List

> Purpose: full operational view of all test cases across all 4 FRs.

| TC ID       | FR    | Type | Objective (≤55 chars)                 | Automation  | Channel     | Status | Bug ID  | GitHub                  |
| ----------- | ----- | ---- | ------------------------------------- | ----------- | ----------- | ------ | ------- | ----------------------- |
| FR01-EP-001 | FR-01 | EP   | Register with all valid inputs        | SCRIPT-FULL | API + State | PASS   | —       | —                       |
| FR01-EP-002 | FR-01 | EP   | Register rejects invalid email format | SCRIPT-FULL | API         | PASS   | —       | —                       |
| FR01-EP-003 | FR-01 | EP   | Register rejects empty email          | SCRIPT-FULL | API         | PASS   | —       | —                       |
| FR01-EP-004 | FR-01 | EP   | Register rejects existing email       | SCRIPT-FULL | API + State | FAIL   | BUG-001 | [#12]({repo}/issues/12) |

{— one row per TC, all TCs for all 4 FRs, no ellipsis}

## Matrix 3: Bug Register

> Purpose: defect traceability — every bug linked to its source TC and GitHub Issue.

| Bug ID  | FR    | Severity | Priority  | Linked TCs                | Summary (≤55 chars)              | GitHub Issue              | Status |
| ------- | ----- | -------- | --------- | ------------------------- | -------------------------------- | ------------------------- | ------ |
| BUG-001 | FR-01 | Medium   | Medium    | FR01-EP-004, FR01-BVA-003 | Register accepts duplicate email | [#12]({repo}/issues/12)   | New    |
| BUG-002 | FR-07 | Medium   | High      | FR07-EP-{n}               | {summary}                        | [#{n}]({repo}/issues/{n}) | New    |
| BUG-003 | FR-17 | Serious  | Immediate | FR17-EP-{n}, FR17-BVA-{n} | {summary}                        | [#{n}]({repo}/issues/{n}) | New    |
| BUG-004 | FR-03 | Serious  | High      | FR03-EP-{n}               | {summary}                        | [#{n}]({repo}/issues/{n}) | New    |

{— one row per bug, all bugs across all 4 FRs}

## Coverage Summary

| FR        | Total BRs | BRs Covered | BR Coverage | Total ECs | ECs w/ TC | EC Coverage | BVA Points | BVA Coverage |
| --------- | --------- | ----------- | ----------- | --------- | --------- | ----------- | ---------- | ------------ |
| FR-01     | {n}       | {n}         | {%}         | {n}       | {n}       | {%}         | {n}        | {%}          |
| FR-07     | {n}       | {n}         | {%}         | {n}       | {n}       | {%}         | {n}        | {%}          |
| FR-17     | {n}       | {n}         | {%}         | {n}       | {n}       | {%}         | {n}        | {%}          |
| FR-03     | {n}       | {n}         | {%}         | {n}       | {n}       | {%}         | {n}        | {%}          |
| **Total** | **{n}**   | **{n}**     | **{%}**     | **{n}**   | **{n}**   | **{%}**     | **{n}**    | **{%}**      |

| FR        | Total TCs | Executed | Pass Rate | Failed  | Bug Link Rate |
| --------- | --------- | -------- | --------- | ------- | ------------- |
| FR-01     | {n}       | {n}      | {%}       | {n}     | {%}           |
| FR-07     | {n}       | {n}      | {%}       | {n}     | {%}           |
| FR-17     | {n}       | {n}      | {%}       | {n}     | {%}           |
| FR-03     | {n}       | {n}      | {%}       | {n}     | {%}           |
| **Total** | **{n}**   | **{n}**  | **{%}**   | **{n}** | **{%}**       |

## Coverage Gaps

| FR  | EC / BR ID | Description | Reason Not Covered |
| --- | ---------- | ----------- | ------------------ |

{— one row per gap. If no gaps: single row saying "No coverage gaps identified — all BRs and ECs have at least one covering TC."}
```

## 5. Special Cases

### Multiple TCs covering one EC

When more than one TC covers the same EC (e.g., one EP TC and one BVA TC both test password length), include one row per TC in Matrix 1, both referencing the same EC:

```
| BR-04 | Password ≥ 8 chars (per FR-01) | EC07 | Invalid | FR01-EP-006 | SCRIPT-FULL | API | PASS | — |
| BR-04 | Password ≥ 8 chars (per FR-01) | EC07 | Invalid | FR01-BVA-002 | SCRIPT-FULL | API | PASS | — |
```

### BVA points with no corresponding EP class

BVA points on variable boundaries (e.g., `password` length = 255 chars, DB limit) may not map to a specific named EC. In Matrix 1, use the BVA point ID as the EC/BVA Ref and reference the parent BR:

```
| BR-04 | Password length at DB limit (BVA +α) | FR01-BVA-006 | BVA +α | FR01-BVA-006 | SCRIPT-FULL | API | {status} | {bug or —} |
```

### BLOCKED or SKIPPED TCs

Include in Matrix 2 with Status = BLOCKED or SKIPPED. Leave Bug ID = "—". In Matrix 1, mark Status = BLOCKED or SKIPPED and note the reason in a footnote below the table.

### Bug Link Rate < 100%

If any FAIL TC has no Bug ID (Bug Link Rate < 100%), flag this in the Coverage Summary with a warning note:

```
⚠️ WARNING: {n} FAIL TC(s) have no linked Bug ID. Run bug-report-writer to complete reporting before submitting.
```

## 6. Quality Checklist

- [ ] All 4 FR requirement-analysis files read for BR IDs
- [ ] Matrix 1 includes every BR from every FR (no BRs omitted)
- [ ] Matrix 1 includes BVA points linked to their parent BRs
- [ ] Matrix 2 lists ALL TCs (no ellipsis `...` rows) across all 4 FRs
- [ ] Matrix 2 has Automation category column (SCRIPT-FULL / SCRIPT-PARTIAL / MANUAL / DOM)
- [ ] Matrix 3 uses clickable Markdown links for GitHub Issues `[#N](url)`
- [ ] All Bug IDs in Matrix 3 have GitHub Issue numbers (no `_(pending)_` remaining)
- [ ] Coverage Summary has both EC coverage table and TC pass rate table
- [ ] Bug Link Rate = 100% (all FAIL TCs have Bug IDs); warning printed if not
- [ ] Coverage Gaps section explicitly states "no gaps" if none found
- [ ] No `{placeholder}` text remaining in the generated file
