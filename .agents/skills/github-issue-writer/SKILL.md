---
name: github-issue-writer
description: >
  Format a completed bug report into a GitHub Issue and guide the human to post
  it on the group GitHub repository. Produces the issue title, labels, and body,
  then updates the Bug ID entry with the GitHub issue number after posting.
trigger:
  - "create github issue"
  - "post issue"
  - "report to github"
  - "github issue for bug"
output: GitHub Issue markdown + update to qa-artifacts/bug-reports/FR{nn}-bugs.md
---

# Skill: github-issue-writer

## 1. Purpose

Convert a completed bug report from `bug-report-writer` into GitHub Issue format, guide the human to post it on the group repo, and sync the issue number back into the bug report file.

## 2. Input Required

- Completed bug report from `bug-report-writer`
- Group GitHub repository URL (provided by human)

## 3. GitHub Issue Format

### Title Format

```
[BUG][FR{nn}] {Concise one-line bug summary}
```

**Examples:**

```
[BUG][FR17] POST /api/admin/coupons returns HTTP 200 instead of 403 for regular user JWT
[BUG][FR01] Registration form accepts email without @ symbol — no validation error shown
[BUG][FR07] Cart total label shows wrong text — "Tong tam tinh" instead of "Tong cong"
[BUG][FR03] OTP from email A successfully resets password of email B (cross-email attack)
```

### Recommended GitHub Labels

Create these labels in the group repo if they do not already exist:

| Label Name           | Color     | Purpose              |
| -------------------- | --------- | -------------------- |
| `bug`                | `#d73a4a` | All bug reports      |
| `severity: fatal`    | `#b60205` | Fatal severity       |
| `severity: serious`  | `#e4e669` | Serious severity     |
| `severity: medium`   | `#0075ca` | Medium severity      |
| `severity: cosmetic` | `#cfd3d7` | Cosmetic severity    |
| `FR-01`              | `#5319e7` | Registration feature |
| `FR-07`              | `#1d76db` | Cart feature         |
| `FR-17`              | `#0e8a16` | Coupon management    |
| `FR-03`              | `#fbca04` | Forgot password      |
| `security`           | `#b60205` | SEC-xx violations    |

## 4. Step-by-Step Instructions

### Step A — Draft the GitHub Issue Body

Use this template:

```markdown
## Bug Report: BUG-{nnn}

**Linked TC:** {FR{nn}-EP/BVA-{nnn}}
**Severity:** {Fatal / Serious / Medium / Cosmetic}
**Priority:** {Immediate / High / Medium / Low}

## Summary

{One-sentence bug summary — same as the Summary field in the bug report}

## Environment

| Component    | Value                   |
| ------------ | ----------------------- |
| OS / Device           | {e.g., macOS 14.5 / Windows 11 OR iPhone 15 Pro / Pixel 7}            |
| Runtime Env      | {e.g., Chrome 125.0 OR Expo Go 2.31.0}     |
| Backend      | http://localhost:3000   |
| Frontend/App     | {http://localhost:{port} OR Mobile App} |
| SUT Commit   | `{git commit hash}`     |
| Test Account | {email used}            |

## Steps to Reproduce

1. {Step 1}
2. {Step 2}
3. {Step 3}
4. Observe result

## Expected Behavior

Per **FR-{nn}** / **SEC-{nn}**:

> {Expected behavior description from the SRS}

## Actual Behavior

- HTTP Status: `{status}`
- Response Body: `{body content}`
- UI: {description of what actually happened}

## Evidence

{Drag and drop the screenshot here — GitHub will auto-upload it}

_Screenshot file: `evidence/screenshots/FR{nn}/TC-{id}-fail.png`_

> Reported by: {Student ID} | Date: {YYYY-MM-DD}
```

### Step B — Instructions for Posting on GitHub

Walk the human through these steps:

```
1. Open the group GitHub repository: {repo_url}
2. Click the "Issues" tab
3. Click "New issue"
4. Paste the Title: [BUG][FR{nn}] {summary}
5. Paste the Body from Step A
6. Drag and drop the screenshot into the body area (GitHub auto-uploads)
7. Apply labels: "bug", "severity:{level}", "FR-{nn}"
   (add "security" label for SEC-xx violations)
8. Click "Submit new issue"
9. Copy the issue number from the URL (e.g., #15) and paste it back into this chat
10. I (the AI Agent) will then ask for your final APPROVAL to safely update
    the qa-artifacts/bug-reports/FR{nn}-bugs.md file with the provided Issue Number and link:
    Change: "GitHub Issue | _(assigned by github-issue-writer)_"
    To:     "GitHub Issue | #15 ({repo_url}/issues/15)"
```

### Step C — Verify After Posting

```
Post-submission checklist:
- [ ] Title follows [BUG][FR{nn}] format
- [ ] Screenshot is actually embedded (not just a text reference)
- [ ] Labels are applied
- [ ] Issue number updated in the bug report file
- [ ] Issue number added to the traceability matrix
```

## 5. Approval Output

> **CRITICAL RULE:** All generated content MUST be strictly in English.

Present this to the human and wait for approval before posting:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GITHUB ISSUE READY — AWAITING APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title  : [BUG][FR{nn}] {summary}
Labels : bug, severity:{level}, FR-{nn}
Repo   : {repo_url}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Full issue body here}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPROVE to post / EDIT before posting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 6. Quality Checklist

- [ ] All generated content is completely in English
- [ ] Title follows `[BUG][FR{nn}] {summary}` format exactly
- [ ] Issue body contains all required sections
- [ ] Screenshot is attached (not just referenced as a file path)
- [ ] Labels are appropriate for the severity and FR
- [ ] Issue number synced back to the bug report file
- [ ] Issue link added to the traceability matrix
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk
