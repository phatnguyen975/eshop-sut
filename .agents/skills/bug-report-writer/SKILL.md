---
name: bug-report-writer
description: >
  Write a professional bug report for each FAIL test case following the standard
  in TestReport.md. Each report must include all 12 mandatory fields, comply with
  the 7 writing characteristics, remain non-judgmental, and provide sufficient
  evidence for a developer to reproduce the issue immediately.
trigger:
  - "write bug report"
  - "TC failed"
  - "found a bug"
  - "create defect report"
output: qa-artifacts/bug-reports/FR{nn}-bugs.md
---

# Skill: bug-report-writer

## 1. Purpose

Write professional bug reports following `theory-test-report.md` standards for every failed test case. A good bug report enables a developer to reproduce and fix the defect without asking any additional questions.

## 2. Input Required

The human provides the following after running the execution scripts:

- **TC ID** of the failed TC (e.g., `FR01-EP-004`)
- **Expected Result** — paste from `qa-artifacts/test-cases/FR{nn}-test-cases.md`
- **Observed Result** — one of:
  - For API/Role-Auth: HTTP status code + response body from the `.json` file in `evidence/api-responses/FR{nn}/`
  - For UI: description of what was seen on screen + screenshot filename
  - For DOM: console output text from the DevTools check in `scripts/devtools/FR{nn}-dom-checks.md`
  - For State: BEFORE and AFTER JSON responses from `evidence/api-responses/FR{nn}/`
- **Environment details**: OS, browser/device, test account email, SUT git commit hash
- **Screenshot filename(s)**: path(s) under `evidence/screenshots/FR{nn}/` — screenshots only, no recordings required
- **API response JSON filename(s)**: path(s) under `evidence/api-responses/FR{nn}/` if applicable
- Reference: `.agents/context/theory-test-report.md` (Sections 2, 3)

## 3. Core Theory — Bug Report Anatomy

> **Source:** `theory-test-report.md` Section 2.1

### 12 Mandatory Fields

| #   | Field                  | Description                         | Format                               |
| --- | ---------------------- | ----------------------------------- | ------------------------------------ |
| 1   | **Bug ID**             | Auto-incremented unique identifier  | `BUG-001`, `BUG-002`, ...            |
| 2   | **Feature / FR**       | Feature and FR number               | `FR-01 — Account Registration`       |
| 3   | **Linked TC ID**       | TC that discovered this bug         | `FR01-EP-002`                        |
| 4   | **Summary**            | One-sentence problem statement      | Contrasts expected vs actual         |
| 5   | **Environment**        | Browser, OS, SUT URL, account       | Full specifications                  |
| 6   | **Steps to Reproduce** | Numbered list, fully reproducible   | 1. 2. 3.                             |
| 7   | **Expected Behavior**  | Cite FR/SEC source                  | "per FR-01: ..."                     |
| 8   | **Actual Behavior**    | Exact observation                   | Status code, message, screenshot ref |
| 9   | **Severity**           | Fatal / Serious / Medium / Cosmetic | + rationale                          |
| 10  | **Priority**           | Immediate / High / Medium / Low     | + rationale                          |
| 11  | **Status**             | Initial status                      | `New`                                |
| 12  | **Evidence**           | File references                     | Paths to screenshots / JSON          |

## 4. Severity & Priority Guide (EShop Context)

### Severity

| Level        | Definition                                     | EShop Examples                                                                                             |
| ------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Fatal**    | System crash, data loss, total feature failure | Login completely broken; payment crashes                                                                   |
| **Serious**  | Core feature broken or security compromised    | User JWT accepted by admin endpoint (SEC-03); OTP cross-email succeeds; client can manipulate total_amount |
| **Medium**   | Feature works but deviates from SRS            | Label "Tong tam tinh" instead of "Tong cong" (FR-07); missing confirm dialog (FR-07); wrong redirect page  |
| **Cosmetic** | Minor UI issue, no functional impact           | Typo in label; wrong button color; empty alt text                                                          |

### Priority

| Level         | Timeframe        | When to use                                   |
| ------------- | ---------------- | --------------------------------------------- |
| **Immediate** | Fix within 1 day | Blocks all testing; revenue-stopping          |
| **High**      | 2–4 days         | Core feature broken; security vulnerability   |
| **Medium**    | 5–8 days         | Feature works but deviates from SRS           |
| **Low**       | Later sprint     | Cosmetic; rare edge case; minor inconsistency |

> Note: Severity and Priority are independent. A Fatal-severity bug may have Low priority if it is in a rarely-used path. A Cosmetic bug may have High priority if it appears on the main landing page.

## 5. Step-by-Step Instructions

### Step A — Draft the Summary

Format: `[System] [does X] instead of [doing Y] when [condition]`

**Good summaries:**

```
POST /api/admin/coupons returns HTTP 200 instead of 403 when called with a regular user JWT
Registration form submits without error when the email field contains no @ symbol
Cart total label displays "Tong tam tinh" instead of "Tong cong" per FR-07
```

**Bad summaries:**

```
Bug in login                                    <- too vague
The system is broken when I try to register    <- emotional, no specifics
Error 500                                       <- symptom only, no context
```

### Step B — Write Steps to Reproduce

Rules:

- Numbered list ONLY — never a paragraph
- Include EXACT values used, not "some email" or "a valid password"
- Include precise UI element labels (button text, field labels)
- For API bugs: include exact endpoint, method, headers, and full request body

**API bug steps example:**

```
1. Obtain user JWT: POST /api/login with {"email":"test@eshop.com","password":"Test1234!"}
2. Copy the token from the response body.
3. Send request: POST http://localhost:3000/api/admin/coupons
   Header: Content-Type: application/json
   Header: Authorization: Bearer {user_token}
   Body: {"code":"TEST","type":"percent","discount_value":10,
          "min_order_amount":0,"expired_at":"2099-12-31","max_uses_per_user":1}
4. Observe the HTTP response status code and response body.
```

**UI bug steps example:**

```
1. Navigate to http://localhost:5173/register
2. Fill the "Email" field with: "invalidemail" (no @ symbol)
3. Fill "Password" with: "Test@123"
4. Fill "Confirm Password" with: "Test@123"
5. Click the "Register" button.
6. Observe: no validation error is displayed.
```

### Step C — Assess Severity

Apply the EShop severity guide. Always write a rationale sentence:

```
Severity: Serious
Rationale: This is a SEC-03 violation. A regular user can create and delete
           admin-managed coupons, bypassing role-based access control entirely.
```

### Step D — Assess Priority

Consider: business impact + user visibility + frequency of affected path:

```
Priority: Immediate
Rationale: A security vulnerability in the admin coupon management endpoint
           that any logged-in user can exploit to create unlimited discount codes.
```

### Step E — Reference Evidence Files

For each bug, reference the files that prove it exists. Evidence types:

| Evidence Type        | Source                                                        | Where it comes from              |
| -------------------- | ------------------------------------------------------------- | -------------------------------- |
| Screenshot (UI bug)  | `evidence/screenshots/FR{nn}/TC-{id}-fail.png`                | Captured manually during UI test |
| Screenshot (DOM bug) | `evidence/screenshots/FR{nn}/TC-{id}-console.png`             | DevTools console screenshot      |
| API response JSON    | `evidence/api-responses/FR{nn}/TC-{id}-response.json`         | Auto-saved by cURL script        |
| Role-Auth responses  | `evidence/api-responses/FR{nn}/TC-{id}-{state}-response.json` | Auto-saved by cURL script        |
| State before/after   | `evidence/api-responses/FR{nn}/TC-{id}-before-response.json`  | Auto-saved by cURL script        |

**Note:** Screenshots are sufficient for UI bugs — no screen recordings are required. For API bugs, the response JSON file saved by the cURL script is sufficient evidence.

## 6. Output Format

> **CRITICAL RULE:** All generated content MUST be strictly in English.

Append to `qa-artifacts/bug-reports/FR{nn}-bugs.md`:

```markdown
# Bug Reports — FR-{nn}: {Feature Name}

## BUG-{nnn}

| Field            | Value                                                |
| ---------------- | ---------------------------------------------------- |
| **Bug ID**       | BUG-{nnn}                                            |
| **Feature**      | FR-{nn} — {Feature Name}                             |
| **Linked TC**    | FR{nn}-EP-{nnn}                                      |
| **Summary**      | {One-sentence problem statement}                     |
| **Status**       | New                                                  |
| **Severity**     | {Fatal / Serious / Medium / Cosmetic}                |
| **Priority**     | {Immediate / High / Medium / Low}                    |
| **Reported by**  | {Student ID}                                         |
| **Date**         | {YYYY-MM-DD HH:MM}                                   |
| **GitHub Issue** | #{issue*number} *(assigned by github-issue-writer)\_ |

### Environment

| Component      | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| OS / Device    | {e.g., macOS 14.5 / Windows 11 OR iPhone 15 Pro / Pixel 7} |
| Runtime Env    | {e.g., Chrome 125.0 OR Expo Go 2.31.0}                     |
| Backend        | http://localhost:3000                                      |
| Frontend/App   | {http://localhost:{port} OR Mobile App}                    |
| SUT Git Commit | `{commit hash}`                                            |
| Test Account   | {email used for this TC}                                   |

### Steps to Reproduce

1. {Exact step 1}
2. {Exact step 2}
3. {Exact step 3}
4. Observe: {what to observe}

### Expected Behavior

Per **FR-{nn}** / **SEC-{nn}**:

> "{Exact quote or close paraphrase from the SRS}"

Specifically: {HTTP status expected, UI behavior expected, error message expected}

### Actual Behavior

- HTTP Status: `{actual status code}`
- Response Body: `{actual JSON content}`
- UI: {description of what actually happened}

### Severity Rationale

**{Severity level}:** {Explanation referencing the SRS rule or SEC requirement violated}

### Priority Rationale

**{Priority level}:** {Explanation of urgency and business impact}

### Evidence

| File                                                      | Type       | Description                       |
| --------------------------------------------------------- | ---------- | --------------------------------- |
| `evidence/screenshots/FR{nn}/TC-EP-{nnn}-fail.png`        | Screenshot | UI state showing the failure      |
| `evidence/api-responses/FR{nn}/TC-EP-{nnn}-response.json` | JSON       | Raw API response from cURL script |

> Note: Screenshots and JSON response files are sufficient. No screen recordings needed.
```

## 7. Anti-Patterns Checklist (Self-Review)

From `theory-test-report.md` Section 3.2:

- [ ] NOT a ghost report — it IS written in the bug file and will be posted to GitHub
- [ ] NOT symptom-only — steps show exactly what triggers the bug
- [ ] NOT vague environment — OS, browser version, SUT URL, test account all specified
- [ ] NOT adjectives over analytics — no "slow", "broken", "stupid"; use measurable data
- [ ] NOT judgmental — no "the developer forgot to...", "this is obviously wrong"
- [ ] Steps are a numbered list (not a paragraph)
- [ ] Language is simple and unambiguous
- [ ] Bug is reproducible by following the steps exactly
- [ ] Content is legible (tables, code blocks used appropriately)
- [ ] Non-judgmental (facts only)

## 8. Quality Checklist

- [ ] All generated content is completely in English
- [ ] Bug ID is unique and auto-incremented
- [ ] Summary is one sentence, specific, and non-emotional
- [ ] Steps to Reproduce include exact concrete values and match the platform (Web vs Mobile)
- [ ] Expected Behavior cites FR/SEC number
- [ ] Actual Behavior includes exact status code or error message
- [ ] Severity has a written rationale
- [ ] Priority has a written rationale
- [ ] Environment table correctly reflects the platform (Browser for Web, Device/Expo for Mobile)
- [ ] Evidence files are referenced and confirmed to exist
- [ ] GitHub Issue field left as placeholder for github-issue-writer
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk
