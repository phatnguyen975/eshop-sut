---
name: github-issue-writer
description: >
  Batch-generate a complete, production-ready GitHub Issues Guide for all bugs in a
  given FR. Reads FR{nn}-bugs.md and produces a single guide file at
  scripts/github-issues/FR{nn}-github-issues-guide.md containing every issue fully
  formatted and ready to copy-paste into GitHub — title, labels, and complete body
  for each bug. After the human posts the issues and provides the assigned numbers,
  syncs them back into FR{nn}-bugs.md.
trigger:
  - "generate github issues"
  - "github issue writer"
  - "create github issues"
  - "github issues for FR"
  - "post issues"
output:
  - scripts/github-issues/FR{nn}-github-issues-guide.md
  - (After posting) qa-artifacts/bug-reports/FR{nn}-bugs.md ← GitHub Issue
---

# Skill: github-issue-writer

## 1. Purpose

After `bug-report-writer` has produced `FR{nn}-bugs.md`, this skill reads all bug reports in that file and generates a **single production-ready guide file** containing:

1. One-time label setup instructions (done once per repo, not per FR)
2. One fully formatted GitHub Issue per bug — title, labels, complete body — all `{placeholder}` values filled in from the bug reports
3. Post-submission checklist and sync-back instructions

The human opens GitHub Issues once per FR, posts each issue sequentially using the guide, then provides the assigned issue numbers for the agent to sync back.

**Output is production quality.** No placeholder text should remain in any issue body. Every field must be filled with actual values from the bug reports.

## 2. Input Files (Read All Before Starting)

| File                                                         | What to extract                                                                                                           |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `qa-artifacts/bug-reports/FR{nn}-bugs.md`                    | All bug entries: BUG ID, Linked TCs, Channel, Summary, Environment, Steps, Expected, Actual, Evidence, Severity, Priority |
| `qa-artifacts/test-cases/FR{nn}-test-cases.md`               | EC Ref details if needed to clarify bug context                                                                           |
| `qa-artifacts/execution-results/FR{nn}-execution-results.md` | Session recording YouTube URL (from header)                                                                               |

**How to identify bugs to process:**

- Read every `## BUG-{nnn}` section in `FR{nn}-bugs.md`
- Only process bugs where `**GitHub Issue**` = `_(pending — assigned by github-issue-writer)_`
- Skip any bug that already has a GitHub issue number assigned

## 3. Batch Processing Procedure

### Step A — Scan and List All Pending Bugs

Print the list of bugs to process before generating any content:

```
Pending bugs found in FR-{nn}:
1. BUG-{nnn} — {Summary} — Severity: {level}
2. BUG-{nnn} — {Summary} — Severity: {level}
...
Total issues to generate: {n}
```

Wait for human confirmation before generating the guide file.

### Step B — Generate the Complete Guide File

Write the entire `scripts/github-issues/FR{nn}-github-issues-guide.md` file in one pass, covering all pending bugs.

### Step C — After Human Posts Issues

When the human provides issue numbers (e.g., "BUG-001=#12, BUG-002=#13"):

1. Open `qa-artifacts/bug-reports/FR{nn}-bugs.md`
2. For each bug, replace `_(pending — assigned by github-issue-writer)_` with `#{issue_number} — {repo_url}/issues/{issue_number}`
3. Print sync-back confirmation

## 4. Issue Title Format

```
[BUG][FR{nn}] {Summary from bug report — max 72 chars total including prefix}
```

If the summary exceeds the limit after adding the prefix, shorten the summary while preserving: the endpoint/feature, what is wrong, and the key condition.

**Title character budget:**

- Prefix `[BUG][FR{nn}] ` uses 15 characters
- Summary budget: 57 characters

## 5. Label Set Per Issue

Always derive labels from the bug report fields. Do not ask the human.

**Always apply:**

- `bug`
- `FR-{nn}` (matching the feature pool)
- `severity: {level}` (lowercase, matching the Severity field)

**Apply based on Channel field:**

| Channel               | Additional label |
| --------------------- | ---------------- |
| API, Role-Auth, State | `api`            |
| UI, Mobile UI         | `ui`             |
| DOM                   | `dom`            |
| Mixed (UI + API)      | `api` and `ui`   |

**Apply if SEC violation:**

- Add `security` if Expected Behavior in the bug report cites any SEC-xx rule

**Final label string format for the guide:**

```
Labels: `bug`, `severity: {level}`, `FR-{nn}`, `{channel-label}` [, `security`]
```

## 6. Issue Body — Production Format

Every field must be filled with actual values. No `{placeholder}` text may remain.

```markdown
## Summary

{One-sentence summary from BUG-{nnn} Summary field}

## Bug Details

| Field          | Value                                     |
| -------------- | ----------------------------------------- |
| **Bug ID**     | BUG-{nnn}                                 |
| **Linked TCs** | {Exact Linked TCs string from bug report} |
| **Channel**    | {channel}                                 |
| **Severity**   | {Fatal / Serious / Medium / Cosmetic}     |
| **Priority**   | {Immediate / High / Medium / Low}         |

## Environment

| Component    | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| OS / Device  | {e.g., macOS 14.5 / Windows 11 OR iPhone 15 Pro / Pixel 7}         |
| Runtime Env  | {e.g., Chrome 125.0 OR Expo Go 2.31.0} — or "N/A (cURL test)"      |
| Backend      | http://localhost:3000                                              |
| Frontend/App | {http://localhost:{port} OR Mobile App} — or "N/A (API-only test)" |
| Test Account | {email used in Test Data}                                          |

## Steps to Reproduce

{Numbered steps from bug report — exact values, no placeholders}

1. {Step 1}
2. {Step 2}
3. {Step 3}
4. Observe result

## Expected Behavior

Per **FR-{nn}**{/ **SEC-{nn}** if applicable}:

> {Paraphrased requirement from bug report Expected Behavior section}

Specifically:
{— exact bullet points from bug report, filled with actual values}

## Actual Behavior

{— exact bullet points from bug report Actual Behavior section}

## Severity Rationale

**{Severity}:** {Exact rationale text from bug report}

## Priority Rationale

**{Priority}:** {Exact rationale text from bug report}

## Evidence

{Drag and drop the screenshot here — GitHub will auto-upload it}

_Screenshot file: `evidence/screenshots/FR{nn}/TC-{id}-fail.png`_

> Reported by: {Student ID} | Date: {YYYY-MM-DD}
```

## 7. Guide File Structure

Full structure of `scripts/github-issues/FR{nn}-github-issues-guide.md`:

````markdown
# GitHub Issues Guide — FR-{nn}: {Feature Name}

**Generated by:** github-issue-writer skill
**Date:** {YYYY-MM-DD}
**Repository:** {repo_url}
**Total issues:** {n}
**Source:** `qa-artifacts/bug-reports/FR{nn}-bugs.md`

## Before You Start — One-Time Label Setup

> Skip this section if labels are already configured in the repository.

Go to: **{repo_url} → Settings → Labels → New label**

Create the following labels if they do not exist:

| Label                | Color     | Purpose                                 |
| -------------------- | --------- | --------------------------------------- |
| `bug`                | `#d73a4a` | All defect reports                      |
| `severity: fatal`    | `#b60205` | System crash / data loss                |
| `severity: serious`  | `#e4e669` | Core feature broken / security violated |
| `severity: medium`   | `#0075ca` | SRS deviation, feature still works      |
| `severity: cosmetic` | `#cfd3d7` | Minor UI issues only                    |
| `FR-01`              | `#5319e7` | Account Registration                    |
| `FR-07`              | `#1d76db` | Shopping Cart                           |
| `FR-17`              | `#0e8a16` | Coupon Management                       |
| `FR-03`              | `#fbca04` | Forgot Password                         |
| `security`           | `#b60205` | SEC-xx violations                       |
| `api`                | `#0052cc` | API-level bugs                          |
| `ui`                 | `#e4e669` | UI / frontend bugs                      |
| `dom`                | `#fbca04` | DOM / HTML structure bugs               |

## How to Use This Guide

1. Open: **{repo_url}/issues/new**
2. For each issue below:
   a. Copy the **Title** exactly as shown into the Title field
   b. Paste the **Body** content into the description area
   c. Add the **Labels** listed (select from the dropdown)
   d. If a screenshot is listed in the Evidence section: drag and drop the file into the body text area — GitHub will upload and embed it automatically
   e. Click **Submit new issue**
   f. Note the issue number from the URL (e.g., the URL becomes `.../issues/15` → number is `15`)
3. After posting ALL issues for this FR, return and type:
   ```
   Issue numbers for FR-{nn}: BUG-{nnn}=#X, BUG-{nnn}=#Y, ...
   ```
  The agent will update `qa-artifacts/bug-reports/FR{nn}-bugs.md` with these numbers.

## Issue 1 of {n}

### BUG-{nnn} — {≤60-char summary}

**Title:**

```
[BUG][FR{nn}] {filled-in summary, ≤57 chars}
```

**Labels:** `bug`, `severity: {level}`, `FR-{nn}`, `{channel-label}`{`, security`}

**Screenshot to attach:** `{actual file path}` — drag into body before submitting
_(or: "None — API test, no screenshot required")_

**Body:**

{Complete formatted issue body from Section 6, all placeholders filled}

_(Do not paste this line — it marks the end of Issue 1 body)_

## Issue 2 of {n}

### BUG-{nnn} — {≤60-char summary}

{repeat same structure}

{... repeat for all n issues ...}

## Post-Submission Checklist

After posting all **{n}** issues to **{repo_url}/issues**:

- [ ] {n} issues submitted
- [ ] Each issue has the correct labels applied
- [ ] Screenshots attached where listed (UI/DOM bugs)
- [ ] Issue numbers noted:
  - BUG-{nnn} → #___
  - BUG-{nnn} → #___
    _(fill in above, then provide to agent)_

**When ready, provide issue numbers by typing:**

```
Issue numbers for FR-{nn}: BUG-{nnn}=#X, BUG-{nnn}=#Y
```

## Bug Index

| Bug ID    | Linked TCs                        | Summary            | Severity | Priority |
| --------- | --------------------------------- | ------------------ | -------- | -------- |
| BUG-{nnn} | FR{nn}-EP-{nnn}, FR{nn}-BVA-{nnn} | {≤55-char summary} | {level}  | {level}  |
| BUG-{nnn} | FR{nn}-EP-{nnn}                   | {≤55-char summary} | {level}  | {level}  |

## 8. Sync-Back Procedure

After the human types the issue numbers, execute this update on `FR{nn}-bugs.md`:

For each `BUG-{nnn}=#X` provided:

1. Find the line: `| **GitHub Issue** | _(pending — assigned by github-issue-writer)_ |` inside the specific `## BUG-{nnn}` section.
2. Replace it with: `| **GitHub Issue** | [#{X}]({repo_url}/issues/{X}) |`
3. Scroll down to the `## Bug Summary Table` at the end of the file. Find the row for `BUG-{nnn}` and replace its `_(pending)_` cell with the same markdown link `[#{X}]({repo_url}/issues/{X})`.

Then print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sync-back complete — FR-{nn}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUG-{nnn} → #{X} {repo_url}/issues/{X}
BUG-{nnn} → #{Y} {repo_url}/issues/{Y}
...
File updated: qa-artifacts/bug-reports/FR{nn}-bugs.md
No _(pending)_ entries remaining: {Yes / No — list any remaining if No}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
````

## 9. Quality Checklist

**Guide file generation:**

- [ ] Pending bug list shown to human and confirmed before generating
- [ ] One Issue section per pending bug — none skipped
- [ ] All `{placeholder}` text replaced with actual values from bug reports
- [ ] Title ≤72 characters total (including `[BUG][FR{nn}] ` prefix)
- [ ] Labels section lists all applicable labels in backtick format
- [ ] Screenshot instruction: exact file path given for UI/DOM bugs, "None" for API bugs
- [ ] Session recording YouTube URL filled in (or "pending upload" if not yet available)
- [ ] Post-submission checklist has blank lines for human to fill issue numbers
- [ ] Bug Index table at end of file includes all bugs with correct summaries, severity, priority, and pending issue links

**After sync-back:**

- [ ] All `_(pending)_` entries replaced in bug report file
- [ ] Each replaced entry is a clickable Markdown link `[#{X}]({URL})`
- [ ] Sync-back summary printed with confirmation of no remaining pending entries
