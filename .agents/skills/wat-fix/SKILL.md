---
name: wat-fix
description: >
  Web Automation Testing — Confirmed Finding Fix command skill. Invoke this skill when
  the human has marked one or more findings as CONFIRMED in review-notes.md and wants
  those findings resolved with root-cause analysis and targeted code fixes.
  Trigger phrases: "wat-fix", "/wat-fix", "fix SC-XX", "fix confirmed findings",
  "resolve findings", "fix the blocking issues", "apply fixes for".
---

# wat-fix — Confirmed Finding Resolution

## Purpose

Resolve every human-confirmed Blocking and Coverage Gap finding from `review-notes.md` with:

1. A root-cause explanation before any code is written
2. A targeted, minimal fix — only the specific lines identified
3. A CLI command to re-run the affected test
4. Human verification that the fix passes before proceeding

Non-blocking findings marked `CONFIRMED` are documented but do not require code changes unless the human explicitly requests them.

## Input

| Source                         | Location                                       | Purpose                                              |
| ------------------------------ | ---------------------------------------------- | ---------------------------------------------------- |
| Review notes (human-confirmed) | `docs/scenarios/{scenario-id}/review-notes.md` | Authoritative list of findings to fix                |
| Affected source files          | `e2e/` (various)                               | Files containing the confirmed findings              |
| Scenario specification         | `docs/scenarios/{scenario-id}/spec.md`         | Reference for Coverage Gap fixes — what was required |
| SRS                            | `docs/sut/srs.md`                              | Reference for expected values in new test cases      |

**Required before starting:** The human must have replied `DONE` in `wat-review`, and at least one finding must be marked `CONFIRMED`. Read `review-notes.md` in full before beginning — never assume which findings are confirmed without reading the file.

## Output

| Artifact                      | Location                                       | Change type                |
| ----------------------------- | ---------------------------------------------- | -------------------------- |
| Fixed test files              | `e2e/tests/**/*.spec.ts`                       | Targeted edits             |
| Fixed POM classes             | `e2e/pages/**/*.page.ts`                       | Targeted edits             |
| Fixed fixtures                | `e2e/fixtures/index.ts`                        | Targeted edits             |
| New test cases (Coverage Gap) | `e2e/tests/**/*.spec.ts`                       | Additions                  |
| Updated review notes          | `docs/scenarios/{scenario-id}/review-notes.md` | Status updates per finding |

## External Skills Invoked

| Skill                    | When                       | How to use                                                                                                                                             |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `playwright-skill`       | All Blocking fixes         | Consult the relevant guide before writing any fix. Never write a Playwright API call from memory.                                                      |
| `functional-test-design` | Coverage Gap findings only | Silently identify which technique or scenario branch is missing. Extract only the input value set needed for the new test case. Do not print analysis. |

**`playwright-skill` guide selection for fixes:**

| Finding type                                     | Guide to consult before fixing                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Assertion uses resolved value instead of locator | `core/assertions-and-waiting.md`                                                       |
| Locator uses CSS/XPath without justification     | `core/locators.md`                                                                     |
| `waitForTimeout()` present                       | `core/assertions-and-waiting.md` + `core/flaky-tests.md`                               |
| Fixture missing teardown                         | `core/fixtures-and-hooks.md`                                                           |
| Hardcoded URL or credential                      | `core/configuration.md`                                                                |
| Assertion inside POM                             | `pom/page-object-model.md`                                                             |
| Test depends on execution order                  | `core/fixtures-and-hooks.md` + `core/test-organization.md`                             |
| Security test missing                            | `core/security-testing.md` + `core/api-testing.md`                                     |
| New test case needed (Coverage Gap)              | `core/locators.md` + `core/assertions-and-waiting.md` + `core/forms-and-validation.md` |

## Theoretical Foundations

### Fix Scope Discipline

The most common mistake in fixing test code is **over-fixing** — rewriting sections of code that are not related to the confirmed finding. This creates new risks:

- Introduces new defects in code that was previously correct
- Makes it impossible to attribute a subsequent failure to the fix vs pre-existing code
- Invalidates the human's prior PASSED verifications from `wat-build`

**Rule:** A fix must touch only the minimum code necessary to resolve the confirmed finding. If fixing finding `FINDING-01` requires changing a locator on line 23, only line 23 changes. Lines 20-22 and 24+ remain untouched.

### Root Cause Before Code

Every fix must begin with a root cause statement. The root cause explains **why** the code is wrong, not just **what** is wrong. This matters because:

- A symptom-level fix addresses the observable problem without preventing recurrence
- A root-cause fix addresses the underlying misunderstanding or pattern error

**Examples:**

| Finding                                         | Symptom-level description (insufficient) | Root cause (required)                                                                                                                                                                                                                                                      |
| ----------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `expect(await locator.textContent()).toBe('x')` | "The assertion uses the wrong form"      | "The value was resolved before Playwright's retry loop could run, so the assertion evaluates a snapshot instead of the live DOM — causing flakiness under any network or render delay"                                                                                     |
| Fixture has no teardown                         | "Teardown code is missing"               | "The fixture creates a product via API but has no code after `await use(...)`, so the product persists in the database after the test completes, causing test pollution and unique-constraint failures in subsequent runs"                                                 |
| `waitForTimeout(2000)`                          | "Sleep call present"                     | "`waitForTimeout` is a fixed delay that does not respond to actual system state — if the system is slow the delay may not be enough; if fast it wastes time. The root cause is the absence of a web-first assertion that auto-retries until the expected state is reached" |

### Coverage Gap Fix Protocol

Coverage Gap findings require adding new test cases, not fixing existing ones. This involves two sub-steps:

1. **Identify the missing technique branch** — invoke `functional-test-design` silently to determine exactly which equivalence class, boundary value, condition combination, state transition, or error guessing variant is absent. Cross-reference with the Phase 2 matrix in `spec.md` to confirm the specific Variant ID that is missing.
2. **Implement the new test case** — consult `playwright-skill` for the correct pattern, then write the new `test()` block following the same conventions as the existing tests in the file. Place it in the correct file (E2E spec, validation spec, or API spec) based on the test layer assigned in `spec.md`.

## Workflow

### Step 1 — Read Confirmed Findings

Read `docs/scenarios/{scenario-id}/review-notes.md` in full. Extract every finding marked `CONFIRMED`. Build an ordered list:

1. Blocking findings first (in order of FINDING-ID)
2. Coverage Gap findings second (in order of FINDING-ID)
3. Non-blocking findings last (only if human explicitly requested fixes)

Do not begin fixing until the full list is known.

### Step 2 — Process Each Finding (repeat per finding)

For each confirmed finding in order:

**2a — State the root cause**

Before writing any code, state the root cause of this finding clearly. Explain why the current code is wrong, not just what the symptom is.

**2b — Identify the exact change**

Specify:

- File path (relative to project root)
- Line number or range
- The exact current code
- The exact replacement code

Do not describe the change in prose — show the before and after.

**2c — Consult `playwright-skill`**

Before writing the fix, consult the relevant guide from the guide selection table in External Skills Invoked. Confirm the correct pattern for this type of fix.

For Coverage Gap findings: invoke `functional-test-design` silently first to identify the missing branch, then consult `playwright-skill` to implement it correctly.

**2d — Apply the fix**

Write only the targeted change. Do not modify any code outside the identified line range. Do not reformat, rename, or reorganize surrounding code.

**2e — Human Gate**

Present the following message exactly:

> "Fix applied for **{FINDING-ID}** ({classification}).
>
> **Root cause:** {one sentence root cause statement}
>
> **Change:** `{file-path}`, line {N}
>
> ```typescript
> // Before
> {current code}
>
> // After
> {fixed code}
> ```
>
> Please run:
>
> - Web test: `npx playwright test {file} --headed --project=web-chromium`
> - Admin test: `npx playwright test {file} --headed --project=admin-chromium`
> - API test: `npx playwright test {file} --project=api`
>
> Reply **RESOLVED** if the test passes, or **FAILED** with the error output so I can re-diagnose."

- If **RESOLVED** → update the finding status in `review-notes.md` to `RESOLVED`, proceed to the next finding
- If **FAILED** → follow the Re-diagnosis Protocol below, then repeat gate 2e

**Re-diagnosis Protocol when FAILED:**

1. Read the full error output provided by the human
2. Consult `core/error-index.md` in `playwright-skill` — look up the error message
3. Consult `core/debugging.md` if the error category is unclear
4. State the revised root cause (may differ from original diagnosis)
5. Identify a new targeted fix
6. Apply only the new fix — revert the previous fix if it was incorrect
7. Repeat gate 2e

### Step 3 — Handle Emerging Findings

If applying a fix reveals a new Blocking finding that was not in the original `review-notes.md`:

- Do not silently loop
- Report the new finding to the human with its classification and evidence
- Ask the human whether to add it to `review-notes.md` and fix it inline, or invoke `wat-review` again for a full re-review

### Step 4 — Final Status Update

After all confirmed findings are `RESOLVED`:

1. Update the summary table in `review-notes.md` — all `CONFIRMED` findings should now show `RESOLVED` status
2. Inform the human:

> "All confirmed findings for SC-{XX} are resolved. Updated summary in `docs/scenarios/{scenario-id}/review-notes.md`. If no new findings emerged, this scenario is complete. You may proceed to the next scenario or invoke `wat-review` again to verify the fixes."

## Output Format — Updated `review-notes.md` Finding Entry

After a finding is `RESOLVED`, update its entry:

```markdown
### FINDING-01 [Blocking] — RESOLVED

**File:** `e2e/tests/web/auth/login.spec.ts`  
**Location:** Line 23  
**Rule violated:** Golden Rule 3 — web-first assertions  
**Description:** {original description}  
**Root cause:** {root cause stated during fix}  
**Fix applied:** Changed `expect(await page.url()).toBe(...)` to `await expect(page).toHaveURL(...)`  
**Human decision:** [x] `CONFIRMED` — reason: assertion was non-retrying  
**Resolution:** `RESOLVED` — {YYYY-MM-DD} — test passed after fix
```

## Quality Checklist

Before presenting each human gate, verify:

- [ ] Root cause has been stated before writing any code.
- [ ] The relevant `playwright-skill` guide was consulted before the fix.
- [ ] For Coverage Gap: `functional-test-design` was invoked silently.
- [ ] The fix touches only the identified lines — no surrounding code changed.
- [ ] The fix follows the correct Playwright pattern per `playwright-skill`.
- [ ] The human gate message includes before/after code, not just description.
- [ ] The CLI command matches the correct project flag for the file type.
- [ ] Finding status in `review-notes.md` is updated to `RESOLVED` only after human replies `RESOLVED` — never pre-emptively.
- [ ] All contents are in English and follow the specified markdown structure.

## Completion Criteria

`wat-fix` is complete when:

1. Every `CONFIRMED` Blocking finding has status `RESOLVED` in `review-notes.md`.
2. Every `CONFIRMED` Coverage Gap finding has status `RESOLVED` in `review-notes.md`.
3. All human gates have received `RESOLVED` responses.
4. The summary table in `review-notes.md` reflects final statuses.
5. The human has been informed of completion and recommended next action.

## Constraints

**MUST do:**

- Read `review-notes.md` in full before beginning — never assume which findings are `CONFIRMED`.
- State root cause before writing any code for each finding.
- Consult `playwright-skill` before writing any fix.
- Invoke `functional-test-design` silently for Coverage Gap findings only.
- Apply only targeted, minimal fixes — no rewrites of unrelated code.
- Update finding status to `RESOLVED` only after human confirms `RESOLVED`.
- Report emerging findings immediately — do not loop silently.

**MUST NOT do:**

- Fix a finding before stating its root cause.
- Rewrite code outside the identified line range of a finding.
- Pre-mark findings as `RESOLVED` before human confirmation.
- Print `functional-test-design` analysis to screen or file.
- Use `getByTestId()` in any new test code added for Coverage Gap.
- Hardcode URLs, credentials, or expected values not from `docs/sut/srs.md`.
- Modify SUT source files (`backend/`, `frontend-web/`, `frontend-admin/`).
- Mock the application's own API in any new E2E test code.
- Fix Non-blocking findings unless explicitly requested by the human.
- Reference `playwright-automation-plan.md` — that file is for human reference only.
