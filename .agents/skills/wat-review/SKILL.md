---
name: wat-review
description: >
  Web Automation Testing — Test Code Quality Review command skill. Invoke this skill when
  the user has completed implementing all test code for a scenario (wat-build complete) and
  wants a comprehensive multi-axis quality review before marking the scenario done.
  Trigger phrases: "wat-review", "/wat-review", "review SC-XX", "review test code",
  "quality check", "review the tests for", "check test quality".
---

# wat-review — Multi-Axis Test Code Quality Review

## Purpose

Perform a systematic, evidence-based quality review of all Playwright test code produced for one completed scenario. The review covers four independent axes:

1. **Playwright Golden Rule conformance** — is the code written correctly?
2. **Spec coverage** — does the code test what the spec required?
3. **Test isolation** — can each test run independently in any order?
4. **Security coverage** — are authorization and trust boundaries tested?

All findings are classified and written to `review-notes.md` for human confirmation before any action is taken.

## Input

| Source                   | Location                               | Purpose                                   |
| ------------------------ | -------------------------------------- | ----------------------------------------- |
| Scenario specification   | `docs/scenarios/{scenario-id}/spec.md` | Implementation contract to verify against |
| SRS                      | `docs/sut/srs.md`                      | Security requirements (SEC-XX) for axis 4 |
| All generated test files | `e2e/tests/{domain}/*.spec.ts`         | Primary review targets                    |
| All POM classes          | `e2e/pages/**/*.page.ts`               | Review for pattern conformance            |
| Fixture additions        | `e2e/fixtures/index.ts`                | Review for isolation and teardown         |

**Required before starting:** All pieces from `wat-build` must have `PASSED` their human gates. The scenario implementation must be complete before review begins.

## Output

| Artifact     | Location                                       | Status on Creation        |
| ------------ | ---------------------------------------------- | ------------------------- |
| Review notes | `docs/scenarios/{scenario-id}/review-notes.md` | Written before human gate |

## External Skills Invoked

| Skill                    | When                                | How to use                                                                                                                                             |
| ------------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `playwright-skill`       | Axis 1 — Golden Rule conformance    | Consult `core/common-pitfalls.md`, `core/assertions-and-waiting.md`, `core/locators.md`, `core/fixtures-and-hooks.md` to validate patterns in the code |
| `functional-test-design` | Axis 2 — Spec coverage verification | Silently verify that each technique applied in `spec.md` Phase 2 was correctly implemented. Do not print analysis. Report only findings.               |

## Review Axes

### Axis 1 — Playwright Golden Rule Conformance

Consult `playwright-skill` guides (`core/common-pitfalls.md`, `core/locators.md`, `core/assertions-and-waiting.md`, `core/fixtures-and-hooks.md`) to validate each rule.

Check every generated file for violations of the following rules:

| Rule                                   | What to look for                                                                                          | Violation severity |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------ |
| `getByRole()` preferred over CSS/XPath | Any `page.locator('css')` or `page.$()` without a comment explaining why semantic locator was unavailable | Blocking           |
| No `waitForTimeout()` or `sleep()`     | Any occurrence of `waitForTimeout`, `sleep`, or `setTimeout` in test code                                 | Blocking           |
| Web-first assertions only              | Any `expect(await locator.textContent())`, `expect(await page.url())`, or other resolved-value assertions | Blocking           |
| Fixtures over `beforeAll` globals      | Any `beforeAll` or module-level mutable state shared across tests                                         | Blocking           |
| No hardcoded URLs                      | Any `http://localhost` or absolute URL in test or POM files                                               | Blocking           |
| No hardcoded credentials               | Any password, token, or email string literal not from `process.env`                                       | Blocking           |
| Zero assertions in POM classes         | Any `expect()` call inside a POM class method                                                             | Blocking           |
| `getByTestId()` not used               | Any `getByTestId()` call — SUT cannot be modified to add data-testid                                      | Blocking           |
| Locator defined at class level         | Any locator created inside a method body instead of as a class property                                   | Non-blocking       |
| Action methods named for intent        | Any method named `clickButton()`, `fillField()` instead of `login()`, `addToCart()`                       | Non-blocking       |

### Axis 2 — Spec Coverage

Verify against `docs/scenarios/{scenario-id}/spec.md` Phase 1 (flow) and Phase 2 (data matrix).

**Flow coverage:**

- Every step from Phase 1 has at least one corresponding assertion in the test code
- The E2E flow test uses `test.step()` to mirror the Phase 1 step structure
- Error paths that are part of the realistic user journey (included in Phase 1) are inside the main `test()` block, not in separate files

**Technique coverage:** Invoke `functional-test-design` silently. For each technique applied in Phase 2:

| Technique                 | What to verify                                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Domain Testing (EP + BVA) | Every equivalence class has a corresponding `test()` block. Boundary values (on-point and off-point) have their own blocks. No class is tested with multiple redundant values. |
| Decision Table            | Each condition-flip combination from the matrix has a corresponding `test()` block. The all-true (happy path) combination is present.                                          |
| State Transition          | Each valid transition, invalid transition, and terminal-state attempt has a corresponding test.                                                                                |
| Error Guessing            | Integration boundary tests (client-supplied values, auth bypass, role escalation) are present as API-layer tests.                                                              |

Report findings as Coverage Gap if any variant from the Phase 2 matrix is missing from the implementation. Do not print the technique analysis — report only what is missing and which variant ID it corresponds to.

### Axis 3 — Test Isolation

Each test must be independently executable in any order and in any parallel worker.

| Check                         | What to look for                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| No shared mutable state       | Any `let` variable at `describe` block or module level that is mutated by tests                             |
| Fixture teardown present      | Every fixture that creates a resource has cleanup code after `await use(...)`                               |
| Teardown uses `.catch()`      | Teardown code that throws on failure (would mask test result)                                               |
| No execution-order dependency | Any test that assumes a previous test has run (e.g., relies on data created by TC-01 without its own setup) |
| Dynamic data is unique        | Any test that creates data with a fixed name/email that would conflict in parallel execution                |

### Axis 4 — Security Coverage

Cross-reference with `docs/sut/srs.md` SEC-01 to SEC-07 and any security-relevant FRs covered by this scenario.

For each protected endpoint relevant to this scenario:

| Security concern                                     | Expected test coverage                                                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Unauthenticated access                               | API test that calls the endpoint with no `Authorization` header → expects 401                                          |
| Wrong-role access                                    | API test that calls an admin endpoint with a user token → expects 403                                                  |
| Client-supplied value that must be server-recomputed | API test that sends a manipulated value (e.g., lower `total_amount`) → expects server to reject or recompute           |
| SQL injection / XSS input                            | Test that submits script-containing input in a text field → expects safe rendering (no script execution, HTML escaped) |

If this scenario does not cover any protected endpoints or security-relevant FRs, note that explicitly in the review notes rather than leaving this axis empty.

## Finding Classification

Every finding must be classified before it is written to `review-notes.md`:

| Classification   | Definition                                                                                                                                                                              | Action required                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Blocking**     | The finding causes the test to produce incorrect results, miss a defect, or violate a security requirement. The scenario cannot be considered complete while this finding is Confirmed. | Must be fixed by `wat-fix`                                 |
| **Non-blocking** | Code smell, style violation, or suboptimal pattern that does not affect test correctness. Fixing it would improve maintainability.                                                      | Noted; does not block completion                           |
| **Coverage Gap** | A required test variant (from Phase 2 matrix) or security check is entirely absent from the implementation.                                                                             | Must be fixed by `wat-fix` (with `functional-test-design`) |

When uncertain between Blocking and Non-blocking: ask _"Does this finding mean the test could pass when it should fail, or fail when it should pass?"_ If yes → Blocking.

## Workflow

### Step 1 — Collect All Files for Review

Identify every file produced during `wat-build` for this scenario:

- POM classes in `e2e/pages/`
- Fixture additions in `e2e/fixtures/index.ts`
- Test spec files in `e2e/tests/`

Read all files in full before beginning any axis review.

### Step 2 — Read the Spec

Read `docs/scenarios/{scenario-id}/spec.md` in full — both Phase 1 (E2E flow) and Phase 2 (test data matrix). This is the contract against which the code is reviewed.

### Step 3 — Read Relevant SRS Sections

Read `docs/sut/srs.md` sections relevant to this scenario, focusing on SEC requirements and any explicit expected behaviors (error messages, redirects, status codes) that must appear in assertions.

### Step 4 — Execute All Four Review Axes

Work through Axis 1 → Axis 2 → Axis 3 → Axis 4 in order. For each axis:

- Read the relevant `playwright-skill` guide before evaluating that axis
- For Axis 2, invoke `functional-test-design` silently and compare output against the Phase 2 matrix — report only gaps, not the analysis
- Record every finding as you go — do not defer to after all axes are complete

### Step 5 — Write `review-notes.md`

Create `docs/scenarios/{scenario-id}/review-notes.md` using the Output Format below. Include every finding — even if there are no findings, write a section stating "No findings" per axis.

### Step 6 — Human Gate

Present the following message exactly:

> "Review complete. Findings written to `docs/scenarios/{scenario-id}/review-notes.md`. For each finding, please mark it as **CONFIRMED** or **DISMISSED** with a written reason directly in the file. Reply **DONE** when all findings are marked — I will read the file and proceed."

After the human replies `DONE`, read the updated `review-notes.md` and determine the next action:

- Zero Blocking or Coverage Gap findings Confirmed → scenario is complete; inform human and recommend proceeding to the next scenario
- Any Blocking findings Confirmed → instruct human to invoke `wat-fix`
- Any Coverage Gap findings Confirmed → instruct human to invoke `wat-fix`
- Non-blocking findings Confirmed only → note for improvement; scenario is complete

## Output Format — `docs/scenarios/{scenario-id}/review-notes.md`

````markdown
# Review Notes: {Scenario Name}

**Scenario ID:** SC-XX  
**Reviewed:** {YYYY-MM-DD}  
**Reviewer:** AI (wat-review)  
**Status:** PENDING HUMAN CONFIRMATION

## Axis 1 — Playwright Golden Rule Conformance

### FINDING-01 [{Blocking | Non-blocking | Coverage Gap}]

**File:** `e2e/tests/web/auth/login.spec.ts`
**Location:** Line {N}
**Rule violated:** {e.g., Golden Rule 3 — web-first assertions}
**Description:** {What the code does and why it is wrong}
**Evidence:**

```typescript
// Current code (line N)
expect(await page.url()).toBe("/dashboard");
```

**Expected:**

```typescript
await expect(page).toHaveURL("/dashboard");
```

**Human decision:** [ ] `CONFIRMED` — reason: ... / [ ] `DISMISSED` — reason: ...

## Axis 2 — Spec Coverage

### FINDING-02 [{Blocking | Coverage Gap}]

**Spec reference:** Phase 2 — Step {N}, Variant S{N}.V{M} ({technique})  
**Description:** {Which variant is missing and what it was supposed to test}  
**Human decision:** [ ] `CONFIRMED` — reason: ... / [ ] `DISMISSED` — reason: ...

## Axis 3 — Test Isolation

### FINDING-03 [{Blocking | Non-blocking}]

**File:** `e2e/fixtures/index.ts`  
**Description:** {What isolation issue was found}  
**Human decision:** [ ] `CONFIRMED` — reason: ... / [ ] `DISMISSED` — reason: ...

## Axis 4 — Security Coverage

### FINDING-04 [{Blocking | Coverage Gap}]

**SEC reference:** SEC-{XX} / FR-{XX}  
**Missing test:** {What endpoint and what attack vector has no test}  
**Human decision:** [ ] `CONFIRMED` — reason: ... / [ ] `DISMISSED` — reason: ...

## Summary

| Finding ID | Classification | Axis          | Status  |
| ---------- | -------------- | ------------- | ------- |
| FINDING-01 | Blocking       | Golden Rules  | PENDING |
| FINDING-02 | Coverage Gap   | Spec Coverage | PENDING |
| FINDING-03 | Non-blocking   | Isolation     | PENDING |
| FINDING-04 | Coverage Gap   | Security      | PENDING |
````

## Quality Checklist

Before presenting the human gate, verify:

- [ ] All contents are in English and follow the specified markdown structure.
- [ ] All files from `wat-build` have been read and reviewed.
- [ ] `spec.md` Phase 1 and Phase 2 have been read in full.
- [ ] All four axes have been evaluated — no axis skipped.
- [ ] `functional-test-design` was invoked silently for Axis 2 — no analysis printed.
- [ ] Every finding has a unique FINDING-ID.
- [ ] Every finding specifies the file, location, rule violated, and evidence.
- [ ] Every finding is classified as Blocking, Non-blocking, or Coverage Gap.
- [ ] Every finding has a blank human decision field — never pre-filled.
- [ ] If an axis has no findings, it is documented explicitly as "No findings".
- [ ] The summary table matches the individual finding entries.

## Completion Criteria

`wat-review` is complete when:

1. `docs/scenarios/{scenario-id}/review-notes.md` has been written
2. The human has replied DONE after marking all findings CONFIRMED or DISMISSED
3. The next action (complete scenario, or invoke `wat-fix`) has been communicated to the human

## Constraints

**MUST do:**

- Read all implementation files before beginning any axis.
- Consult `playwright-skill` guides for Axis 1 evaluation.
- Invoke `functional-test-design` silently for Axis 2 — print no analysis.
- Document every finding with evidence (file, line, current code, expected code).
- Write `review-notes.md` before presenting the human gate.
- Leave all human decision fields blank.
- Read the updated file after human replies DONE before determining next action.

**MUST NOT do:**

- Pre-fill human decision fields.
- Skip any review axis.
- Print `functional-test-design` analysis to screen or file.
- Modify any test code during review — review is read-only.
- Declare findings Confirmed or Dismissed on behalf of the human.
- Proceed to `wat-fix` without the human explicitly marking findings `CONFIRMED`.
- Reference `playwright-automation-plan.md` — that file is for human reference only.
