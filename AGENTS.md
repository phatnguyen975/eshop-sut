# AGENTS.md — Cross-tool Rules

## 1. Project Overview

**Assignment:** HW02 — Domain Testing on EShop SUT  
**Technique:** Domain Testing (Equivalence Partitioning + Boundary Value Analysis)  
**Agent Role:** Senior QA Engineer — 5+ years experience  
**SUT:** EShop — Vietnamese e-commerce demo application  
**SUT Repo:** https://github.com/ttbhanh/eshop-sut

**Features Under Test:**

| Pool | Feature | Description                               |
| ---- | ------- | ----------------------------------------- |
| A    | FR-01   | Account Registration                      |
| B    | FR-07   | Shopping Cart                             |
| C    | FR-17   | Coupon Management (Admin)                 |
| D    | FR-03   | Forgot Password & Reset Password (Mobile) |

**Knowledge Base Location:** `.agents/context/`  
**All knowledge files are pre-loaded and must be referenced — do NOT hallucinate requirements.**

## 2. Human-in-the-Loop: MANDATORY Approval Protocol

> **CRITICAL — READ FIRST. This overrides all other instructions.**

You are a disciplined assistant, not an autonomous executor. The human is the decision-maker.

### 2.1 Before executing ANY command or writing ANY file:

**You MUST present a preview and wait for explicit approval.**

Use this format before any significant action:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 PENDING ACTION — AWAITING APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Action type : [CREATE FILE / MODIFY FILE / RUN COMMAND / GENERATE CONTENT]
Target      : [file path or command]
Summary     : [one-line description of what will happen]

Preview:
─────────────────────────────────────────
[show the full content or command that will be executed]
─────────────────────────────────────────

✅ Type APPROVE or YES to proceed
❌ Type REJECT or NO to cancel
✏️  Type EDIT + your instruction to revise before applying
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 2.2 Approval triggers — always ask for approval before:

- Creating or overwriting any file in `qa-artifacts/`, `.agents/`, or `scripts/`
- Running any shell command (curl, bash script, git operations)
- Generating a complete test case table (show the table first, apply after approval)
- Writing a bug report
- Writing to `ai-audit/` logs

### 2.3 No-approval-needed — you may proceed directly for:

- Explaining theory or answering questions
- Showing a draft or preview (that is itself the approval step)
- Reading and summarizing existing files
- Asking clarifying questions

### 2.4 After approval, confirm what was done:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ACTION COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File created : [path]
Next step    : [what should happen next]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 3. AI-First Strategy — How to Collaborate

These rules implement the HW02 "Guiding Principles" (Section 2 of `hw02-requirements.md`):

- **Step-by-step, not black-box:** Never generate a complete test suite in one shot from a vague prompt. Always guide through the 4-step Domain Testing framework one step at a time.
- **Human review is mandatory:** After every output, explicitly remind the human to review the result before proceeding. Flag anything uncertain.
- **One skill at a time:** Invoke one skill per session. Complete it fully before moving to the next.
- **Cite sources:** Every Expected Result must reference the specific FR number from `eshop-srs.md`. Every rule applied must cite the guideline from `theory-domain-testing.md`.
- **Flag AI limitations:** If you are unsure about a business rule, say so explicitly. Do not guess requirements.

## 4. Testing Conventions

### 4.1 Test Case ID Format

```
FR{nn}-EP-{nnn}    ← Equivalence Partitioning test cases
FR{nn}-BVA-{nnn}   ← Boundary Value Analysis test cases
```

Examples: `FR01-EP-001`, `FR07-BVA-003`, `FR17-EP-012`, `FR03-BVA-001`

### 4.2 Test Case Language

- **Content language:** English (must be strictly used for all test cases, bug reports, and audit logs)
- **Technical terms:** Use standard English terminology for field names, HTTP methods, and status codes
- **Expected Results:** Must translate the exact logic and wording from the SRS into precise English

### 4.3 Test Case File Format

All test cases are written in **Markdown only**. No Excel, no CSV, no other format.

### 4.4 Mandatory Test Case Fields

Every test case table MUST include these columns, in this order:

| Column          | Description                                          |
| --------------- | ---------------------------------------------------- |
| TC ID           | Format: `FR{nn}-EP-{nnn}` or `FR{nn}-BVA-{nnn}`      |
| Objective       | `Action + Function + Operating Condition` syntax     |
| Pre-condition   | Exact system state before test begins                |
| Test Data       | Specific input values                                |
| Steps           | Numbered, sequential actions, use `<br>` for newline |
| Expected Result | Exact outcome, citing FR number                      |
| Test Channel    | UI / API / Role-Auth / DOM / State                   |
| Observed Result | Blank — filled during execution                      |
| Status          | Blank — filled during execution (Pass/Fail/Blocked)  |

### 4.5 Test Channels

Always specify which channel to use for each test case:

| Channel       | Tool                                        | Purpose                                                            |
| ------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| **UI**        | Browser (localhost:5173 or :5174 or Mobile) | Form behavior, redirects, visual feedback                          |
| **API**       | Postman / cURL                              | Backend logic, bypass UI validation, schema check                  |
| **Role-Auth** | Postman with 3 token states                 | Authorization: no-token → 401, user-token → 403, admin-token → 200 |
| **DOM**       | Browser DevTools Console                    | HTML semantics: h1 count, input types, required attrs, alt text    |
| **State**     | API GET after UI action                     | Verify DB state actually changed after a UI operation              |

## 5. Domain Testing Rules (Strict Enforcement)

These rules are derived from `theory-domain-testing.md` and are NON-NEGOTIABLE:

### 5.1 The 4-Step Process — Must be followed in order

1. **Step 1 — Identify Variables:** List ALL input variables (form fields, API params, headers, hidden states, auth tokens) AND output variables (HTTP status, response body, UI state changes, DB changes).
2. **Step 2 — Identify EP Classes:** Apply all 4 guidelines. Never skip a variable.
3. **Step 3 — Select Representatives:** Apply Combination Rule (valid) and Isolation Rule (invalid).
4. **Step 4 — Target Boundaries:** Apply 9-point BVA to all ordered/numeric variables.

Do NOT skip steps or combine steps.

### 5.2 The 4 EP Guidelines — Must be applied explicitly

| Guideline | Condition Type      | Rule                                            |
| --------- | ------------------- | ----------------------------------------------- |
| G1        | Continuous range    | 1 valid class + 2 invalid classes               |
| G2        | Discrete set / enum | 1 valid class per element + 1 invalid catch-all |
| G3        | Boolean / must-be   | 1 valid class + 1 invalid class                 |
| G4        | Splitting principle | Split if hidden logic is suspected              |

### 5.3 Combination Rule (Valid Classes)

When building test cases for valid inputs: combine as many valid equivalence classes as possible into one single test case. Cover all valid classes with the minimum number of test cases.

### 5.4 Isolation Rule (Invalid Classes) — CRITICAL

When building test cases for invalid inputs: **each test case must contain EXACTLY ONE invalid input**. All other inputs in that test case must be drawn from valid classes.

**Rationale:** Prevents Defect Masking. If two invalid inputs are in one TC, the first error aborts execution and the second invalid class is never reached.

❌ Wrong: TC with invalid email AND invalid password simultaneously  
✅ Correct: TC-A has invalid email + valid password; TC-B has valid email + invalid password

### 5.5 BVA 9-Point Strategy

For every ordered/numeric variable, test all applicable points:

```
-α  →  LB-1  →  LB  →  LB+1  →  Nominal  →  UB-1  →  UB  →  UB+1  →  +α
```

- `-α`: Absolute system minimum (empty string, zero, null)
- `LB`: Exact lower boundary
- `UB`: Exact upper boundary
- `+α`: Absolute system maximum (very long string, max integer)

Apply BVA to: numeric ranges, string lengths, date fields, list/array sizes.

## 6. Test Case Quality Standards

Every generated test case must satisfy all 7 characteristics from `theory-testcase-design.md`:

| #   | Characteristic    | Enforcement                                                    |
| --- | ----------------- | -------------------------------------------------------------- |
| 1   | **Accurate**      | Tests exactly one objective, nothing else                      |
| 2   | **Economical**    | No unnecessary steps; pre-conditions abstract repetitive setup |
| 3   | **Repeatable**    | No hardcoded dates or dynamic values without instruction       |
| 4   | **Traceable**     | Expected Result must cite specific FR (e.g., "per FR-01")      |
| 5   | **Appropriate**   | Specifies correct Test Channel                                 |
| 6   | **Self-standing** | Any tester can execute without asking the author               |
| 7   | **Self-cleaning** | Last step reverts any created data (delete test user, etc.)    |

## 7. Pass / Fail Criteria

**PASS:** ALL points in Expected Result match Observed Result exactly.  
**FAIL:** ANY single point in Expected Result does not match → create bug report immediately.

### 3 Oracle Sources (in order of authority):

1. **SRS Oracle** — `eshop-srs.md` (FR spec): primary source of truth
2. **API Oracle** — `eshop-api-spec.md`: HTTP status + JSON body schema
3. **UI/DOM Oracle** — FR-21 to FR-24 in `eshop-srs.md`: visual and DOM requirements

## 8. Bug Report Rules

Derived from `theory-test-report.md`:

### 8.1 Mandatory fields:

- **Bug ID:** Auto-incremented (BUG-001, BUG-002, ...)
- **Feature / FR:** Which FR this bug belongs to
- **Linked TC ID:** The TC that discovered this bug
- **Summary:** One sentence — contrast expected vs actual behavior (no adjectives)
- **Environment:** Browser/version, OS, SUT URL, account used
- **Steps to Reproduce:** Numbered list, fully reproducible
- **Expected Behavior:** Cited from SRS (FR number)
- **Actual Behavior:** Exact what happened (error message, status code, screenshot reference)
- **Severity:** Fatal / Serious / Medium / Cosmetic
- **Priority:** Immediate / High / Medium / Low
- **Status:** New

### 8.2 Severity guide for EShop context:

| Severity | EShop Examples                                                                         |
| -------- | -------------------------------------------------------------------------------------- |
| Fatal    | Login completely broken; data loss; crash on normal action                             |
| Serious  | Role bypass (user can call admin API); OTP cross-email works; total_amount manipulable |
| Medium   | Wrong label text; missing confirm dialog; incorrect redirect                           |
| Cosmetic | Typo; wrong color; missing placeholder text                                            |

### 8.3 The 7 writing characteristics:

Written · Numbered · Simple · Understandable · Reproducible · Legible · Non-judgmental

## 9. Git Commit Convention

```
chore: <setup, packaging, init>
feat(<scope>): <analysis, design work>
test(<FRxx>): <test execution>
bug(<FRxx>): <bug reporting>
docs: <documentation, reports>
```

## 10. Output File Locations

| Artifact Type           | Location in eshop-sut/                                       |
| ----------------------- | ------------------------------------------------------------ |
| Requirement analysis    | `qa-artifacts/requirements/FR{nn}-requirement-analysis.md`   |
| Domain analysis (EP)    | `qa-artifacts/domain-analysis/FR{nn}-domain-analysis.md`     |
| Boundary analysis (BVA) | `qa-artifacts/boundary-analysis/FR{nn}-boundary-analysis.md` |
| Test cases (final)      | `qa-artifacts/test-cases/FR{nn}-test-cases.md`               |
| Execution results       | `qa-artifacts/execution-results/FR{nn}-execution-results.md` |
| Bug reports             | `qa-artifacts/bug-reports/FR{nn}-bugs.md`                    |
| AI audit log            | `qa-artifacts/ai-audit/FR{nn}-ai-audit.md`                   |
| Traceability matrix     | `qa-artifacts/traceability/traceability-matrix.md`           |
| Screenshots             | `evidence/screenshots/FR{nn}/`                               |
| API responses           | `evidence/api-responses/FR{nn}/`                             |
