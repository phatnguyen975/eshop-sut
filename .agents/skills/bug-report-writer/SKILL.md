---
name: bug-report-writer
description: >
  Batch-generate all bug reports for a completed FR in a single pass. Reads
  FR{nn}-test-cases.md (for TC definitions and Observed Results), FR{nn}-execution-results.md
  (for execution context and script output), and eshop-srs.md (for requirement citations).
  Produces a complete, production-quality FR{nn}-bugs.md covering every FAIL TC without
  requiring the human to provide per-bug prompts.
trigger:
  - "write bug reports for FR"
  - "generate bug reports"
  - "bug report writer"
  - "create bug reports"
output: qa-artifacts/bug-reports/FR{nn}-bugs.md
---

# Skill: bug-report-writer

## 1. Purpose

After `test-execution-assistant` in Phase B has updated both `FR{nn}-test-cases.md` and `FR{nn}-execution-results.md` files with `FAIL` statuses, this skill reads those files and automatically generates a complete `FR{nn}-bugs.md` file.

**CRITICAL PRINCIPLE: Root Cause Grouping (1 Root Cause = 1 Bug Report)** Do NOT generate one bug report per FAIL TC. You MUST analyze the Observed Results of all FAIL TCs and group them by their underlying root cause. For example, if 5 TCs fail because the backend stores passwords in plaintext, they must be combined into a SINGLE bug report referencing all 5 TCs.

The human does not need to provide individual bug details. The skill extracts all necessary information from the existing execution artifacts.

## 2. Input Files (Read All Before Starting)

| File                                                         | What to extract                                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `qa-artifacts/test-cases/FR{nn}-test-cases.md`               | For each FAIL TC: TC ID, Objective, EC Ref, Pre-condition, Test Data, Steps, Expected Result, Channel  |
| `qa-artifacts/execution-results/FR{nn}-execution-results.md` | For each FAIL TC: Observed Result, DB Check result, API response file path, execution date/environment |
| `.agents/context/eshop-srs.md`                               | Exact FR and SEC requirement text to cite in Expected Behavior                                         |
| `.agents/context/eshop-api-spec.md`                          | API endpoint details for Steps to Reproduce in API bugs                                                |

**How to identify FAIL TCs:**

- From `FR{nn}-test-cases.md`: Find all TC entries where `Status` = `FAIL`
- From `FR{nn}-execution-results.md`: Find all entries where `Status` = `FAIL`
- Cross-reference both files to ensure consistency

## 3. Batch Processing Procedure

### Step A — Scan and List All FAIL TCs

Read both input files and extract every TC marked as `FAIL`.

### Step B — Analyze and Group by Root Cause (CRITICAL)

Analyze the `Observed Result` and `DB Check` for every `FAIL` TC. Group TCs together if they fail for the exact same underlying reason (e.g., "Missing Confirm Password field", "Native HTML5 validation used instead of custom UI").

Print this grouped list to the human BEFORE generating reports:

```
Bug Groups found in FR-{nn}:
  BUG-001: {Brief description of root cause}
    Affected TCs: FR{nn}-EP-001, FR{nn}-BVA-003
  BUG-002: {Brief description of root cause}
    Affected TCs: FR{nn}-EP-002, FR{nn}-EP-008
  ...
```

Wait for human confirmation before proceeding.

### Step C — Assign Bug IDs

Check if `qa-artifacts/bug-reports/FR{nn}-bugs.md` already exists to continue numbering (e.g., BUG-001, BUG-002).

### Step D — For Each BUG GROUP, Extract Fields

For each grouped bug, pick the **Primary TC** (usually the first EP test case in the group) to use as the base for the "Steps to Reproduce". Extract data (Test Data, Steps, Expected Result, API response, etc.) primarily from this Primary TC, but list ALL affected TCs in the Linked TCs field.

_Crucial: For UI/DOM bugs, the `Actual Behavior` MUST strictly use the human's manual observation notes recorded in the `FR{nn}-execution-results.md` file. Do not invent UI behavior._

### Step E — Determine Severity and Priority

For each bug, determine Severity and Priority using the rules in Section 4. Do NOT ask the human — determine automatically from the nature of the failure:

**Severity determination logic:**

- If the failure involves a SEC-xx rule (password plaintext, role bypass, OTP cross-email, XSS) → **Serious**
- If the failure causes complete feature breakage (login broken, crash) → **Fatal**
- If the failure is a functional deviation from SRS (wrong HTTP code, wrong redirect, wrong label, missing validation) → **Medium**
- If the failure is a DOM/HTML/CSS issue not affecting functionality → **Cosmetic**

**Priority determination logic:**

- Serious or Fatal → **Immediate** or **High** (Immediate if security or blocks testing)
- Medium affecting main user flow → **High**
- Medium on edge case or secondary path → **Medium**
- Cosmetic → **Low**

### Step F — Write Summary

Follow the Summary format rules in Section 5 precisely. Generate from extracted fields:

- Subject: what endpoint/feature/page
- Action: what it does wrong
- Condition: when / under what input
- Citation: per FR-xx or SEC-xx

### Step G — Write Steps to Reproduce

Reconstruct steps from `FR{nn}-test-cases.md` Steps field + Test Data field:

- For API/Role-Auth bugs: convert to manual cURL-style steps (human-readable, not bash)
- For UI bugs: use the browser navigation steps from the TC
- For DOM bugs: include the DevTools console paste instruction
- Always use the **exact concrete values** from Test Data (no placeholders)

### Step H — Generate All Reports in One Pass

Write the complete `qa-artifacts/bug-reports/FR{nn}-bugs.md` file with all bug reports in sequence (BUG-001, BUG-002, ...).

## 4. Severity & Priority Reference

### Severity

| Level        | When to apply                                                                                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fatal**    | Feature completely non-functional; system crash; data corruption                                                                                      |
| **Serious**  | SEC-xx violation (role bypass, plaintext password, OTP cross-email, XSS); core business rule completely ignored                                       |
| **Medium**   | Wrong HTTP status; wrong response body; wrong redirect; missing validation that SRS requires; wrong UI label/text; missing UI element required by SRS |
| **Cosmetic** | Wrong color; typo; tab order; missing `alt` on non-critical image; wrong font                                                                         |

### Priority

| Level         | When to apply                                         |
| ------------- | ----------------------------------------------------- |
| **Immediate** | Security vulnerability; blocks all downstream testing |
| **High**      | Core user flow broken; data integrity risk            |
| **Medium**    | SRS deviation visible to users; workaround exists     |
| **Low**       | Cosmetic; very rare edge case                         |

## 5. Summary Format Rules

**Template:** `{Feature/endpoint} {wrong behavior} instead of {correct behavior} when {condition} (per {FR/SEC reference})`

**By bug type:**

| Type                | Pattern                                                                                       | Example                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Wrong HTTP status   | `{METHOD} {endpoint} returns HTTP {actual} instead of {expected} when {condition}`            | `POST /api/register returns HTTP 200 instead of 400 when email already exists in DB`         |
| Wrong response body | `{endpoint} {response issue} when {condition}`                                                | `POST /api/register returns success message instead of error for duplicate email`            |
| Security bypass     | `{endpoint} accepts {forbidden token/input} and {performs forbidden action} when {condition}` | `POST /api/admin/coupons accepts user JWT and creates coupon, bypassing role check`          |
| DB integrity        | `{action} {DB wrong state} when {condition}`                                                  | `POST /api/register inserts duplicate user row when email already exists`                    |
| UI wrong behavior   | `{page/form} {wrong behavior} when {condition}`                                               | `Registration form submits without error when confirmPassword field does not match password` |
| DOM structure       | `{page} has {actual DOM state} instead of {expected} (per FR-{nn})`                           | `Registration page has 3 <h1> tags instead of exactly 1`                                     |

**Rules:**

- One sentence only
- No adjectives: no "broken", "bad", "wrong" as standalone words — always say _what_ is wrong
- No "the developer forgot to..." — facts only
- Must contain: subject, behavior, condition, FR/SEC citation

## 6. Steps to Reproduce — By Channel

**Note for Grouped Bugs:** Write the steps to reproduce based on the Test Data of the **Primary TC**. Add a note at the end of the steps explicitly stating: _"Note: This root cause also causes the following TCs to fail: [List other Linked TCs]"_.

### API / Role-Auth / State / DB bugs

Write as manual cURL commands. Do not use bash variables — write the full literal command:

```
1. Ensure the EShop backend is running at http://localhost:3000.
2. [If auth required] Obtain a {user/admin} JWT:
   curl -s -X POST http://localhost:3000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"{email}","password":"{password}"}'
   Copy the `token` field from the response.
3. Send the following request:
   curl -s -X {METHOD} http://localhost:3000{/api/endpoint} \
     -H "Content-Type: application/json" \
     [-H "Authorization: Bearer {token-type}"] \
     -d '{exact JSON body from Test Data}'
4. Observe the HTTP response status code.
5. Observe the response body.
[6. For DB checks] Query the database:
   sqlite3 backend/database.sqlite "{SQL query from script}"
```

### UI / Mobile UI bugs

```
1. Navigate to: http://localhost:{port}/{path}
2. [If login required] Log in with email="{email}", password="{password}".
3. Fill "{Field Label}" with: "{exact value from Test Data}"
   [repeat for each field]
4. Click the "{Button Label}" button.
5. Observe: [exact thing to look at]
```

### DOM bugs

```
1. Navigate to: http://localhost:{port}/{path}
2. Open DevTools: F12 → Console tab.
3. Paste the following and press Enter:
   {paste the specific check() invocation from FR{nn}-dom-checks.js that failed}
4. Observe the ❌ FAIL output in the console.
```

## 7. Output Format

File: `qa-artifacts/bug-reports/FR{nn}-bugs.md`

````markdown
# Bug Reports — FR-{nn}: {Feature Name}

**Generated by:** bug-report-writer skill
**Date:** {YYYY-MM-DD}
**Source files:**

- `qa-artifacts/test-cases/FR{nn}-test-cases.md`
- `qa-artifacts/execution-results/FR{nn}-execution-results.md`

**Total bugs:** {n}
**Session recording:** {YouTube URL from execution-results.md — or "pending upload"}

## BUG-{nnn}

| Field            | Value                                         |
| ---------------- | --------------------------------------------- |
| **Bug ID**       | BUG-{nnn}                                     |
| **Feature**      | FR-{nn} — {Feature Name}                      |
| **Linked TCs**   | FR{nn}-EP-{nnn}, FR{nn}-BVA-{nnn}, ...        |
| **Channel**      | {API / Role-Auth / UI / DOM / State}          |
| **Summary**      | {One-sentence summary per Section 5 rules}    |
| **Status**       | New                                           |
| **Severity**     | {Fatal / Serious / Medium / Cosmetic}         |
| **Priority**     | {Immediate / High / Medium / Low}             |
| **Reported by**  | {Student ID from execution-results.md header} |
| **Date**         | {Execution date from execution-results.md}    |
| **GitHub Issue** | _(pending — assigned by github-issue-writer)_ |

### Environment

| Component    | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| OS / Device  | {e.g., macOS 14.5 / Windows 11 OR iPhone 15 Pro / Pixel 7}         |
| Runtime Env  | {e.g., Chrome 125.0 OR Expo Go 2.31.0} — or "N/A (cURL test)"      |
| Backend      | http://localhost:3000                                              |
| Frontend/App | {http://localhost:{port} OR Mobile App} — or "N/A (API-only test)" |
| Test Account | {email used in Test Data}                                          |

### Steps to Reproduce

{Steps per Section 6, using exact values from Primary TC Test Data}

### Expected Behavior

Per **FR-{nn}** {/ **SEC-{nn}** if applicable}:

> {Close paraphrase of the relevant SRS requirement — do NOT copy verbatim}

Specifically (based on Primary TC):

- HTTP {expected status code from Primary TC}
- Response body: {expected JSON fields from Primary TC}
  {- DB state: {expected DB state if Primary TC involves State/DB}}
  {- UI: {expected UI behavior if Primary TC involves UI}}

### Actual Behavior

- HTTP Status: `{from Observed Result of Primary TC}`
- Response Body:

```json
{paste key fields from JSON response file of Primary TC}
```

{- DB State: {actual result from DB Check field of Primary TC}}
{- UI: {observed UI behavior of Primary TC}}

### Severity Rationale

**{Severity}:** {One or two sentences. Reference the specific SRS FR number or SEC
number violated. Explain the impact on users or system security.}

### Priority Rationale

**{Priority}:** {One or two sentences on urgency. Reference business impact or whether
this blocks downstream testing.}

## BUG-{nnn+1}

{repeat pattern for next BUG GROUP}

## Bug Summary Table

| Bug ID    | Linked TCs                        | Channel   | Summary (brief)    | Severity | Priority | GitHub Issue |
| --------- | --------------------------------- | --------- | ------------------ | -------- | -------- | ------------ |
| BUG-{nnn} | FR{nn}-EP-{nnn}, FR{nn}-BVA-{nnn} | {channel} | {≤60 char summary} | {level}  | {level}  | _(pending)_  |
| BUG-{nnn} | FR{nn}-EP-{nnn}                   | {channel} | {≤60 char summary} | {level}  | {level}  | _(pending)_  |
````

## 8. Anti-Patterns Checklist (Self-Review Before Presenting to Human)

- [ ] Summary is exactly one sentence — no comma-joined clauses forming two sentences
- [ ] Summary has no standalone adjectives ("broken", "bad", "wrong") — says what specifically is wrong
- [ ] Steps use EXACT values from Test Data — no `{placeholder}` or `<value>` remaining
- [ ] Steps for API bugs are manual cURL commands — not bash script syntax
- [ ] Expected Behavior cites a specific FR-xx or SEC-xx number
- [ ] Actual Behavior has the exact HTTP status and response body from execution results
- [ ] Severity rationale explains the impact with reference to an SRS rule
- [ ] Priority rationale explains the urgency concretely
- [ ] GitHub Issue field is `_(pending — assigned by github-issue-writer)_`
- [ ] No "the developer forgot to...", "obviously wrong", or judgmental language

## 9. Quality Checklist

- [ ] Bug Groups list shown to human before generating reports
- [ ] Every BUG GROUP has exactly one bug report (All FAIL TCs must be covered, but grouped by root cause)
- [ ] Bug IDs are sequential and unique (no gaps, no duplicates)
- [ ] Bug Summary Table at end of file covers all bugs
- [ ] All `_(pending)_` placeholders use exactly that text for `github-issue-writer` to find
- [ ] Output file is `qa-artifacts/bug-reports/FR{nn}-bugs.md`
- [ ] All fields in the bug report are filled with extracted data (no placeholders)
- [ ] Environment section is complete with values from execution results
- [ ] Steps to Reproduce are complete and use exact Test Data values
- [ ] Expected and Actual Behavior sections are complete with data from execution results and SRS citations
- [ ] Severity and Priority rationales are well-explained and justified
