---
name: test-summary-generator
description: >
  Batch-aggregate all testing results across all 4 FRs into a complete, production-ready
  Test Summary Report. Reads execution-results, bug-reports, test-cases, and traceability
  matrix files, then writes the full qa-artifacts/summary/README.md in a single pass. Only
  run after all 4 FRs have completed execution, bug reporting, github-issue posting,
  and traceability matrix generation.
trigger:
  - "generate summary"
  - "test summary report"
  - "create summary"
  - "final summary"
  - "generate readme"
output: qa-artifacts/summary/README.md (full file, written from scratch)
---

# Skill: test-summary-generator

## 1. Purpose

Produce the complete `qa-artifacts/summary/README.md` file — the Test Summary Report that will be copied to `hw02-submission/README.md` during the submission packaging step. All data is extracted from existing artifacts in one batch pass; the human does not need to provide any numbers manually.

> **Note on file location:** This skill writes to `qa-artifacts/summary/README.md` > inside `eshop-sut/`. When packaging for submission (Phase 11), copy this file to > `hw02-submission/README.md`. Do NOT write directly into `hw02-submission/` during > the testing phase.

## 2. Input Files (Read All Before Starting)

| File                                                       | What to extract                                                                                     |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `qa-artifacts/test-cases/FR01-test-cases.md`               | EP TC count, BVA TC count, total designed TCs                                                       |
| `qa-artifacts/test-cases/FR07-test-cases.md`               | Same                                                                                                |
| `qa-artifacts/test-cases/FR17-test-cases.md`               | Same                                                                                                |
| `qa-artifacts/test-cases/FR03-test-cases.md`               | Same                                                                                                |
| `qa-artifacts/execution-results/FR01-execution-results.md` | Executed, Passed, Failed, Blocked, Skipped counts; environment info; YouTube session recording link |
| `qa-artifacts/execution-results/FR07-execution-results.md` | Same                                                                                                |
| `qa-artifacts/execution-results/FR17-execution-results.md` | Same                                                                                                |
| `qa-artifacts/execution-results/FR03-execution-results.md` | Same                                                                                                |
| `qa-artifacts/bug-reports/FR01-bugs.md`                    | Bug count; Severity per bug; Defect type per bug; GitHub issue numbers                              |
| `qa-artifacts/bug-reports/FR07-bugs.md`                    | Same                                                                                                |
| `qa-artifacts/bug-reports/FR17-bugs.md`                    | Same                                                                                                |
| `qa-artifacts/bug-reports/FR03-bugs.md`                    | Same                                                                                                |
| `qa-artifacts/traceability/traceability-matrix.md`         | EC coverage %, TC execution %, Coverage gaps                                                        |

## 3. Data Extraction Procedure

### Step A — TC Statistics per FR

From each `FR{nn}-test-cases.md`, count:

- **EP TCs:** Number of TC entries with ID matching `FR{nn}-EP-*`
- **BVA TCs:** Number of TC entries with ID matching `FR{nn}-BVA-*`
- **Total Designed:** EP TCs + BVA TCs

From each `FR{nn}-execution-results.md`, read the **Execution Summary table** at the bottom of the file and extract: Executed, Passed, Failed, Blocked, Skipped.

Also extract from each execution-results file:

- **Automation breakdown** from the summary table columns (Script-Full, Script-Partial, Manual, DOM) — if the Execution Summary table has these columns
- **Session recording YouTube URL** from the file header

### Step B — Bug Statistics per FR

From each `FR{nn}-bugs.md`, read every `## BUG-{nnn}` section and extract:

- Count total bugs per FR
- Count bugs by Severity (Fatal / Serious / Medium / Cosmetic)
- Classify each bug by Defect Type using the mapping in Section 4
- For Notable Bugs (Severity = Serious or Fatal): extract Bug ID, FR, Summary (brief ≤60 chars), Severity, GitHub Issue number

### Step C — Calculate Key Metrics

```
Pass Rate (%)        = (Total Passed / Total Executed) × 100
TC Coverage (%)      = (Total Executed / Total Designed) × 100
Bug Density          = Total Bugs / Total Executed TCs (rounded to 2 decimal places)
EC Coverage (%)      = from traceability-matrix.md Coverage Summary row
```

### Step D — Coverage Gaps

Read `qa-artifacts/traceability/traceability-matrix.md` Coverage Gaps section. If no gaps exist, state "No coverage gaps identified."

## 4. Defect Type Classification

Map each bug's **Channel** field (from bug report) to a Defect Type:

| Channel in Bug Report          | Defect Type                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| API, State                     | API Contract                                                                                     |
| Role-Auth                      | Security / Access Control                                                                        |
| UI, Mobile UI                  | User Interface                                                                                   |
| DOM                            | User Interface                                                                                   |
| DB (sqlite3 assertion failure) | Depends on what failed: if password not hashed → Security; if wrong data stored → Business Logic |

Additionally, classify by what was actually wrong:

- Wrong HTTP status code (not related to auth) → **API Contract**
- Wrong response body content → **API Contract**
- Role bypass / SEC-xx violation → **Security / Access Control**
- Wrong redirect / wrong label / missing element → **User Interface**
- Wrong business calculation / wrong state in DB → **Business Logic**
- Crash / null pointer / 500 error → **Coding Logic**

## 5. Video Evidence Section Logic

- **Session recording videos:** One per FR. Extract YouTube URL from the header of each `FR{nn}-execution-results.md` file. If URL is "pending upload", write "_(pending)_".
- **Agent Skills demo video:** A separate video demonstrating skills end-to-end. The human provides this URL separately — leave as placeholder if not yet available.

## 6. Output Format

Write the entire `qa-artifacts/summary/README.md` from scratch. Replace any existing content. This file will later be copied to `hw02-submission/README.md` at packaging time.

> **Create the directory if it does not exist:** `mkdir -p qa-artifacts/summary`

```markdown
# HW02 — Domain Testing on EShop

**Student ID:** {from execution-results.md header or leave blank}
**Submission Date:** {YYYY-MM-DD}
**Repository:** {eshop-sut repo URL: https://github.com/ttbhanh/eshop-sut}
**Testing Technique:** Domain Testing — Equivalence Partitioning + Boundary Value Analysis
**AI Agent:** Antigravity CLI

## 1. Features Tested

| Pool | FR    | Feature                          | Test Layer         | Status    |
| ---- | ----- | -------------------------------- | ------------------ | --------- |
| A    | FR-01 | Account Registration             | Web UI + API       | Completed |
| B    | FR-07 | Shopping Cart                    | Web UI + API       | Completed |
| C    | FR-17 | Coupon Management (Admin)        | Web Admin UI + API | Completed |
| D    | FR-03 | Forgot Password & Reset Password | Mobile UI + API    | Completed |

## 2. Test Execution Summary

### 2.1 TC Statistics by Feature

| FR        | Feature         | EP TCs  | BVA TCs | Total Designed | Executed | Passed  | Failed  | Blocked | Skipped |
| --------- | --------------- | ------- | ------- | -------------- | -------- | ------- | ------- | ------- | ------- |
| FR-01     | Registration    | {n}     | {n}     | {n}            | {n}      | {n}     | {n}     | {n}     | {n}     |
| FR-07     | Shopping Cart   | {n}     | {n}     | {n}            | {n}      | {n}     | {n}     | {n}     | {n}     |
| FR-17     | Coupon CRUD     | {n}     | {n}     | {n}            | {n}      | {n}     | {n}     | {n}     | {n}     |
| FR-03     | Forgot Password | {n}     | {n}     | {n}            | {n}      | {n}     | {n}     | {n}     | {n}     |
| **Total** |                 | **{n}** | **{n}** | **{n}**        | **{n}**  | **{n}** | **{n}** | **{n}** | **{n}** |

### 2.2 Automation Coverage Breakdown

| FR        | SCRIPT-FULL | SCRIPT-PARTIAL | MANUAL  | DOM     | Total   |
| --------- | ----------- | -------------- | ------- | ------- | ------- |
| FR-01     | {n}         | {n}            | {n}     | {n}     | {n}     |
| FR-07     | {n}         | {n}            | {n}     | {n}     | {n}     |
| FR-17     | {n}         | {n}            | {n}     | {n}     | {n}     |
| FR-03     | {n}         | {n}            | {n}     | {n}     | {n}     |
| **Total** | **{n}**     | **{n}**        | **{n}** | **{n}** | **{n}** |

### 2.3 Key Metrics

| Metric                    | Value                           |
| ------------------------- | ------------------------------- |
| **Pass Rate**             | {%} ({passed}/{executed} TCs)   |
| **TC Execution Coverage** | {%} ({executed}/{designed} TCs) |
| **EC Coverage**           | {%} (from traceability matrix)  |
| **Total Bugs Found**      | {n}                             |
| **Bug Density**           | {n} bugs per executed TC        |

## 3. Defect Statistics

### 3.1 By Feature

| FR        | Feature              | Total Bugs | Fatal   | Serious | Medium  | Cosmetic |
| --------- | -------------------- | ---------- | ------- | ------- | ------- | -------- |
| FR-01     | Account Registration | {n}        | {n}     | {n}     | {n}     | {n}      |
| FR-07     | Shopping Cart        | {n}        | {n}     | {n}     | {n}     | {n}      |
| FR-17     | Coupon Management    | {n}        | {n}     | {n}     | {n}     | {n}      |
| FR-03     | Forgot Password      | {n}        | {n}     | {n}     | {n}     | {n}      |
| **Total** |                      | **{n}**    | **{n}** | **{n}** | **{n}** | **{n}**  |

### 3.2 By Severity

| Severity  | Count   | Percentage |
| --------- | ------- | ---------- |
| Fatal     | {n}     | {%}        |
| Serious   | {n}     | {%}        |
| Medium    | {n}     | {%}        |
| Cosmetic  | {n}     | {%}        |
| **Total** | **{n}** | **100%**   |

### 3.3 By Defect Type

| Type                      | Count | Examples from this project                      |
| ------------------------- | ----- | ----------------------------------------------- |
| Security / Access Control | {n}   | Role bypass, SEC-xx violations, OTP cross-email |
| Business Logic            | {n}   | Wrong validation, wrong state in DB             |
| API Contract              | {n}   | Wrong HTTP status, wrong response body          |
| User Interface            | {n}   | Wrong labels, missing elements, DOM violations  |
| Coding Logic              | {n}   | 500 errors, crashes, null pointers              |

### 3.4 Notable Bugs (Severity: Serious or Fatal)

| Bug ID | FR  | Summary | Severity | Priority | GitHub Issue |
| ------ | --- | ------- | -------- | -------- | ------------ |

{— one row per Serious/Fatal bug, extracted from bug reports}

## 4. Coverage Gaps & Open Points

### 4.1 EC Coverage Gaps

{From traceability-matrix.md Coverage Gaps section.
If none: "No coverage gaps — all identified equivalence classes have at least one
covering test case."}

### 4.2 Open Points & Residual Risks

{List any FAIL bugs that were deferred or could not be retested.
If none: "All identified defects have been reported to GitHub Issues. No deferred
items."}

| #   | Bug ID | Description | Risk Level | Status |
| --- | ------ | ----------- | ---------- | ------ |

{— rows only if applicable; otherwise remove this table}

## 5. Test Evidence

### 5.1 Session Recordings

| FR    | Feature              | Recording                                  |
| ----- | -------------------- | ------------------------------------------ |
| FR-01 | Account Registration | [{YouTube URL or "pending upload"}]({URL}) |
| FR-07 | Shopping Cart        | [{YouTube URL or "pending upload"}]({URL}) |
| FR-17 | Coupon Management    | [{YouTube URL or "pending upload"}]({URL}) |
| FR-03 | Forgot Password      | [{YouTube URL or "pending upload"}]({URL}) |

### 5.2 API Response Evidence

All JSON response files are located in `evidence/api-responses/FR{nn}/` and included in `evidence/api-responses/` within the `eshop-sut/` workspace. These will be included when `eshop-sut/` is copied into `hw02-submission/` at packaging time.

### 5.3 GitHub Issues

All bugs have been reported to the group repository:

| FR    | Bugs Reported | GitHub Issues  |
| ----- | ------------- | -------------- |
| FR-01 | {n}           | {list: #X, #Y} |
| FR-07 | {n}           | {list: #X, #Y} |
| FR-17 | {n}           | {list: #X, #Y} |
| FR-03 | {n}           | {list: #X, #Y} |

## 6. Agent Skills Demonstration

### 6.1 Skills Demo Video

| Demo                    | Skills Shown                                                                                                                                                        | Link                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Domain Testing Workflow | requirement-analyzer → domain-identifier → equivalence-partitioning → boundary-value-analysis → domain-coverage-reviewer → test-case-generator → test-case-reviewer | {YouTube URL or "_(pending)_"} |
| Execution & Reporting   | test-execution-assistant → bug-report-writer → github-issue-writer                                                                                                  | {YouTube URL or "_(pending)_"} |

### 6.2 Skills Used

| #   | Skill                         | Purpose                                                      |
| --- | ----------------------------- | ------------------------------------------------------------ |
| 1   | requirement-analyzer          | Extract FR constraints, business rules, GUI/SEC requirements |
| 2   | domain-identifier             | Identify all input/output variables (direct and hidden)      |
| 3   | equivalence-partitioning      | Apply 4 EP guidelines; Combination and Isolation rules       |
| 4   | boundary-value-analysis       | Apply 9-point BVA to all ordered/numeric variables           |
| 5   | domain-coverage-reviewer      | QA gate: detect missing classes; AI gap analysis             |
| 6   | test-case-generator           | Compile final TC table from EP + BVA                         |
| 7   | test-case-reviewer            | QA gate: verify 7 characteristics, coverage completeness     |
| 8   | test-execution-assistant      | Generate bash scripts + DOM checks; record Pass/Fail         |
| 9   | bug-report-writer             | Batch-generate all bug reports from FAIL TCs                 |
| 10  | github-issue-writer           | Generate GitHub Issues guide; sync issue numbers back        |
| 11  | traceability-matrix-generator | Build FR → EC → TC → Bug traceability matrix                 |
| 12  | test-summary-generator        | Generate this README                                         |
| 13  | ai-audit-logger               | Log all AI interactions for the AI Audit Report              |

## 7. Submission Contents

| Artifact                                   | Location                           | Status |
| ------------------------------------------ | ---------------------------------- | ------ |
| Main report (Domain Testing + BVA, 4 FRs)  | `reports/main-report.md` + PDF     |        |
| Bug report (all bugs + GitHub Issue links) | `reports/bug-report.md`            |        |
| AI Audit Report                            | `reports/ai-audit-report.md` + PDF |        |
| AI Critique (200–300 words)                | `reports/ai-critique.md` + PDF     |        |
| Test cases (4 × MD)                        | `test-cases/`                      |        |
| Evidence — API responses                   | `evidence/api-responses/`          |        |
| Git commit log                             | `git-commit-log.txt`               |        |
| EShop SUT workspace                        | `eshop-sut/`                       |        |
| Demo videos                                | See Section 6.1                    |        |

## 8. Self-Assessment

| No. | Criteria                                        | Max Grade | Self-Assessed Grade |
| --- | ----------------------------------------------- | --------- | ------------------- |
| 1   | Feature A: FR-01 — Domain Testing + BVA         | 25        |                     |
| 2   | Feature B: FR-07 — Domain Testing + BVA         | 25        |                     |
| 3   | Feature C: FR-17 — Domain Testing + BVA         | 25        |                     |
| 4   | Feature D: FR-03 — Mobile, Domain Testing + BVA | 15        |                     |
| 5   | Agent Skills                                    | 10        |                     |
|     | **Total**                                       | **100**   |                     |
```

## 7. Quality Checklist

- [ ] All numbers extracted from source files — no `{n}` placeholders remaining
- [ ] TC statistics match Execution Summary tables in execution-results files exactly
- [ ] Bug statistics match Bug Summary Tables in bug-report files exactly
- [ ] Pass rate, coverage, and bug density calculated correctly
- [ ] Notable Bugs table includes all Serious/Fatal bugs (not just a hardcoded subset)
- [ ] All GitHub issue numbers filled in (no `_(pending)_` in bug tables)
- [ ] Session recording URLs filled in or marked "pending upload"
- [ ] Submission Contents table status column filled in (✅ / ❌ per artifact present)
- [ ] Self-assessment grades left blank for student to fill
- [ ] File written to `qa-artifacts/summary/README.md` (not directly to `hw02-submission/`)
