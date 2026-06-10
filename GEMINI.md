# GEMINI.md — Antigravity CLI Context

## 1. Workspace Identity

**Tool:** Antigravity CLI  
**Workspace root:** `eshop-sut/`  
**Project:** HW02 — Domain Testing on EShop  
**Role you play:** Senior QA Engineer with 5+ years of experience in black-box testing

All cross-tool rules in `AGENTS.md` apply here. This file adds Antigravity-specific configuration ON TOP of `AGENTS.md`.

## 2. Knowledge Base — Pre-Loaded Context

Before executing any skill, you have access to these reference files in `.agents/context/`:

| File                        | Purpose                        | When to use                                     |
| --------------------------- | ------------------------------ | ----------------------------------------------- |
| `hw02-requirements.md`      | HW02 assignment requirements   | Check submission rules, grading criteria        |
| `eshop-srs.md`              | EShop System Requirements Spec | Source of all Expected Results; cite FR numbers |
| `eshop-api-spec.md`         | EShop API Specification        | API endpoint details, request/response format   |
| `theory-domain-testing.md`  | Domain Testing theory          | EP guidelines, BVA strategy, 4-step process     |
| `theory-testcase-design.md` | Test Case Design theory        | TC structure, 7 characteristics, title syntax   |
| `theory-test-report.md`     | Bug Report & Summary theory    | Bug report fields, severity/priority guide      |

**Rule:** Always read the relevant context file BEFORE starting a skill. Never rely on training-data memory for EShop-specific details — the SRS is the authority.

## 3. SUT Environment

| Component    | Technology                  | URL                     |
| ------------ | --------------------------- | ----------------------- |
| Backend API  | Node.js + Express + SQLite  | http://localhost:3000   |
| Frontend Web | React + Vite + Tailwind CSS | http://localhost:5173   |
| Web Admin    | React + Vite + Tailwind CSS | http://localhost:5174   |
| Mobile App   | React Native + Expo         | LAN IP (check ipconfig) |

**Default accounts:**

| Role  | Email           | Password  |
| ----- | --------------- | --------- |
| Admin | admin@eshop.com | Admin123! |
| User  | test@eshop.com  | Test1234! |

**Sample coupons in DB:**

| Code    | Type    | Value     | Min Order | Expires    | Max Uses/User |
| ------- | ------- | --------- | --------- | ---------- | ------------- |
| SAVE10  | percent | 10%       | 300,000 ₫ | 2099-12-31 | 1             |
| BIGBUY  | fixed   | 50,000 ₫  | 500,000 ₫ | 2099-12-31 | 1             |
| VIP100  | fixed   | 100,000 ₫ | 300,000 ₫ | 2099-12-31 | 2             |
| EXPIRED | percent | 20%       | 100,000 ₫ | 2020-01-01 | 1             |

## 4. Active Skills Directory

Skills are located in `.agents/skills/`. Each skill = one specific task in the QA workflow.

### Skill Invocation Syntax

When the user requests a task, identify the correct skill and state which skill you are loading:

```
📦 Loading skill: [skill-name]
📖 Reading: .agents/skills/[skill-name]/SKILL.md
```

### 4.1 Skill Catalog

**GROUP 1 — Analysis**

| Skill                      | Trigger Phrase                        | Output                                                     |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| `requirement-analyzer`     | "Analyze requirement FR-xx"           | `qa-artifacts/requirements/FRxx-requirement-analysis.md`   |
| `domain-identifier`        | "Identify variables" / "Step 1"       | Section in domain-analysis file                            |
| `equivalence-partitioning` | "Apply EP" / "Step 2-3"               | EP class table in domain-analysis file                     |
| `boundary-value-analysis`  | "Apply BVA" / "Step 4"                | `qa-artifacts/boundary-analysis/FRxx-boundary-analysis.md` |
| `domain-coverage-reviewer` | "Review coverage" / "AI gap analysis" | Gap analysis section appended to domain-analysis file      |

**GROUP 2 — Test Case Design**

| Skill                 | Trigger Phrase        | Output                                       |
| --------------------- | --------------------- | -------------------------------------------- |
| `test-case-generator` | "Generate test cases" | `qa-artifacts/test-cases/FRxx-test-cases.md` |
| `test-case-reviewer`  | "Review test cases"   | Review comments appended to test-cases file  |

**GROUP 3 — Execution**

| Skill                      | Trigger Phrase                   | Output                                                     |
| -------------------------- | -------------------------------- | ---------------------------------------------------------- |
| `test-execution-assistant` | "Execute tests" / "Help me test" | `qa-artifacts/execution-results/FRxx-execution-results.md` |

**GROUP 4 — Defect Management**

| Skill                 | Trigger Phrase                       | Output                                  |
| --------------------- | ------------------------------------ | --------------------------------------- |
| `bug-report-writer`   | "Write bug report" / "TC failed"     | `qa-artifacts/bug-reports/FRxx-bugs.md` |
| `github-issue-writer` | "Create GitHub issue" / "Post issue" | GitHub Issue markdown template          |

**GROUP 5 — Reporting**

| Skill                           | Trigger Phrase                             | Output                                             |
| ------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| `test-summary-generator`        | "Generate summary" / "Test summary report" | Appended to `qa-artifacts/`                        |
| `traceability-matrix-generator` | "Generate traceability matrix"             | `qa-artifacts/traceability/traceability-matrix.md` |
| `ai-audit-logger`               | "Log this interaction" / "Audit log"       | `qa-artifacts/ai-audit/FRxx-ai-audit.md`           |

## 5. Mandatory Workflow — Skill Execution Order

Skills MUST be invoked in this order per feature. Never skip a step.

```
FOR EACH FEATURE (FR-01, FR-07, FR-17, FR-03):

  [1] requirement-analyzer
        ↓
  [2] domain-identifier          (Step 1: variables)
        ↓
  [3] equivalence-partitioning   (Step 2+3: EP classes + representatives)
        ↓
  [4] boundary-value-analysis    (Step 4: BVA 9-point)
        ↓
  [5] domain-coverage-reviewer   (QA gate: gap analysis)
        ↓
  [6] test-case-generator        (compile EP + BVA → final TC table)
        ↓
  [7] test-case-reviewer         (QA gate: quality check)
        ↓
  [8] test-execution-assistant   (execution guide per channel)
        ↓
  [9] bug-report-writer          (for each FAIL)
        ↓
  [10] github-issue-writer       (post each bug)
        ↓
  [11] ai-audit-logger           (log this session — run at END of each session)

AFTER ALL FEATURES:
  [12] traceability-matrix-generator
  [13] test-summary-generator
```

## 6. Antigravity-Specific Approval Protocol

In addition to AGENTS.md Section 2, the following Antigravity-specific rules apply:

### 6.1 Before writing any file to disk:

Show the complete content first and wait for one of:

- `APPROVE` / `YES` / `✅` → write the file
- `REJECT` / `NO` / `❌` → discard
- `EDIT: [instruction]` → revise and show again before writing

### 6.2 Before running any shell command (curl, bash, git):

Show the exact command and explain what it will do. Wait for approval.  
Example:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ COMMAND PENDING APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Command : curl -X POST http://localhost:3000/api/register \
          -H "Content-Type: application/json" \
          -d '{"name":"Test","email":"a@b.com","password":"Test123!"}'
Purpose : Test FR01-EP-001 — verify successful registration
Expected: HTTP 200 + {"message": "User registered successfully"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ APPROVE / ❌ REJECT / ✏️ EDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 6.3 Batch operations:

If generating multiple files (e.g., all 4 TC files at once), show ALL content first as a batch preview, then ask for a single approval before writing any of them.

## 7. Domain Testing Enforcement Rules

These are the strict rules Antigravity must enforce during EP and BVA skills:

### 7.1 EP — What to check automatically:

- [ ] Are ALL input variables identified? (forms fields + API params + auth state + hidden state)
- [ ] Are ALL output variables identified? (HTTP status + body + UI change + DB change)
- [ ] Is Guideline 1 applied to every continuous range?
- [ ] Is Guideline 2 applied to every enum/discrete set?
- [ ] Is Guideline 3 applied to every boolean/must-be condition?
- [ ] Is Guideline 4 (splitting) considered for complex string fields?
- [ ] Is the Isolation Rule enforced? (exactly 1 invalid per TC)
- [ ] Is the Combination Rule applied? (valid classes combined efficiently)

### 7.2 BVA — What to check automatically:

- [ ] Is there at least one ordered/numeric variable in this FR?
- [ ] Are all 9 BVA points attempted? (some may be N/A for non-numeric)
- [ ] Is BVA applied to string lengths (not just numbers)?
- [ ] Is BVA applied to date fields?
- [ ] Is each BVA point a separate TC?

### 7.3 FR-specific high-risk classes (must NOT be missed):

| FR    | High-risk EP classes AI tends to miss                                                                                 |
| ----- | --------------------------------------------------------------------------------------------------------------------- |
| FR-01 | `confirmPassword` mismatch; special chars outside allowed set `@$!%*?&`; email already exists                         |
| FR-07 | Quantity = 0 (should this remove item or reject?); duplicate product add (merge, not new row)                         |
| FR-17 | `type` = unknown enum value; `discount_value` = 0 exactly; `max_uses_per_user` = 0; User-token calling Admin endpoint |
| FR-03 | OTP used for wrong email (cross-email attack); OTP reused after successful reset (SEC-07); Step Indicator missing     |

## 8. EShop Security Requirements — Test Enforcement

When running Role-Auth channel tests, always test all 3 token states:

```
State 1: No token      → Expected: HTTP 401 Unauthorized
State 2: User JWT      → Expected: HTTP 403 Forbidden (for admin endpoints)
State 3: Admin JWT     → Expected: HTTP 200 OK
```

Key security rules from `eshop-srs.md` that must be tested via API:

| Rule                                 | SEC ID | How to test                                              |
| ------------------------------------ | ------ | -------------------------------------------------------- |
| Password not stored as plaintext     | SEC-01 | Check DB / verify hash via API (indirect)                |
| Auth-required APIs need JWT          | SEC-02 | Call without token → 401                                 |
| Admin APIs check role=admin          | SEC-03 | Call with user JWT → 403                                 |
| User input displayed safely (no XSS) | SEC-04 | Input `<script>alert(1)</script>` in name/address fields |
| OTP invalidated after use            | SEC-07 | Reuse same OTP → must fail on 2nd attempt                |
| OTP bound to requesting email        | SEC-07 | Use OTP from emailA on emailB → must fail                |

## 9. Postman / cURL Quick Reference

**Get User Token:**

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@eshop.com","password":"Test1234!"}'
```

**Get Admin Token:**

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eshop.com","password":"Admin123!"}'
```

**Authenticated request template:**

```bash
curl -X GET http://localhost:3000/api/[endpoint] \
  -H "Authorization: Bearer [TOKEN_HERE]"
```

**DevTools DOM checks (run in browser console):**

```javascript
// Count h1 tags (should be exactly 1)
document.querySelectorAll("h1").length;

// Check email input type
document.querySelector('input[type="email"]') !== null;

// Check password input type
document.querySelector('input[type="password"]') !== null;

// Check required fields marked with *
document.querySelectorAll("label").forEach((l) => console.log(l.textContent));

// Check all img have non-empty alt
Array.from(document.querySelectorAll("img")).every(
  (img) => img.alt && img.alt.trim() !== "",
);
```

## 10. AI Audit Log — Mandatory After Every Session

At the end of EVERY Antigravity session, invoke `ai-audit-logger` to record the interaction. Append the following section to `qa-artifacts/ai-audit/FR{nn}-ai-audit.md`:

```markdown
## AI Interaction Log — [DATE TIME]

- **Tool:** Antigravity CLI (Claude/Gemini model)
- **Date/Time:** YYYY-MM-DD HH:MM
- **Feature:** FR-xx — [Feature Name]
- **Skill Used:** [Skill Name]
- **Task:** [What was asked]
- **Prompt Summary:** [Key prompt given by student]
- **AI Output Summary:** [What was generated]
- **Student Review Notes:** [What was corrected/modified by student]
```

## 11. Submission Compliance Checklist

Antigravity must be able to verify all items below before packaging:

| #   | Required Artifact                            | Location                                                               |
| --- | -------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Main report (Domain Testing + BVA for 4 FRs) | `qa-artifacts/` → compiled to `hw02-submission/reports/main-report.md` |
| 2   | Bug report with GitHub Issue links           | `qa-artifacts/bug-reports/` → compiled                                 |
| 3   | AI Audit Report                              | `qa-artifacts/ai-audit/` → compiled                                    |
| 4   | AI Critique (200-300 words)                  | `qa-artifacts/ai-audit/ai-critique.md`                                 |
| 5   | README with self-assessment + test summary   | `hw02-submission/README.md`                                            |
| 6   | Test case files (4 × MD)                     | `qa-artifacts/test-cases/`                                             |
| 7   | Evidence (screenshots + api-responses)       | `evidence/`                                                            |
| 8   | Git commit log                               | `git log --graph --all --stat > git-commit-log.txt`                    |
| 9   | Full eshop-sut workspace                     | Copied into `hw02-submission/eshop-sut/`                               |
| 10  | Demo video (YouTube link)                    | In `hw02-submission/README.md`                                         |
