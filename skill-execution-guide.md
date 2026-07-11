# Skill Execution Guide — EShop Web Automation Testing

> **Purpose:** Step-by-step workflow guide for using the five `wat-*` skills to complete web automation testing for EShop SUT. Follow this guide in order — each skill depends on the output of the previous one.  
> **Audience:** All team members working on this project.  
> **Prerequisites:** SUT services running, `e2e/` project initialized, `.env` configured, all five `wat-*` skills installed, plus the four external skills (`playwright-skill`, `functional-test-design`, `scenario-test-design`, `ai-audit`) available globally or in `.agents/skills/`.

---

## Table of Contents

1. [Overview — The Five-Skill Workflow](#1-overview)
2. [Before You Start — Checklist](#2-before-you-start)
3. [Skill 1: wat-scope — Define Test Scope](#3-skill-1-wat-scope)
4. [Skill 2: wat-spec — Design Scenario Specification](#4-skill-2-wat-spec)
5. [Skill 3: wat-build — Implement Test Code](#5-skill-3-wat-build)
6. [Skill 4: wat-review — Review Test Quality](#6-skill-4-wat-review)
7. [Skill 5: wat-fix — Fix Confirmed Findings](#7-skill-5-wat-fix)
8. [Audit Logging — ai-audit](#8-audit-logging)
9. [Workflow Diagram](#9-workflow-diagram)
10. [Quick Reference — All Prompts](#10-quick-reference--all-prompts)
11. [Common Mistakes](#11-common-mistakes)

---

## 1. Overview

The five `wat-*` skills form a linear workflow. Each skill produces an artifact that the next skill consumes. Human verification gates sit between every skill — you must explicitly approve or reject before proceeding.

```
wat-scope  →  wat-spec  →  wat-build  →  wat-review  →  wat-fix
   ↑             ↑            ↑             ↑              ↑
runs once   per scenario  per scenario  per scenario   if needed
```

| Skill        | Runs                  | Input                  | Output                                |
| ------------ | --------------------- | ---------------------- | ------------------------------------- |
| `wat-scope`  | Once at project start | SRS + API spec         | `docs/test-scope.md`                  |
| `wat-spec`   | Once per scenario     | Scenario ID from scope | `docs/scenarios/{id}/spec.md`         |
| `wat-build`  | Once per scenario     | Approved `spec.md`     | Test files in `e2e/`                  |
| `wat-review` | Once per scenario     | Completed test files   | `docs/scenarios/{id}/review-notes.md` |
| `wat-fix`    | If needed             | Confirmed findings     | Updated test files                    |

**Rule:** Never skip a skill. Never invoke the next skill before the current one is APPROVED.

---

## 2. Before You Start

Verify all of the following before invoking any skill:

**SUT is running:**

```bash
curl http://localhost:3000/api/products   # expect HTTP 200
# Open http://localhost:5173              # frontend-web loads
# Open http://localhost:5174              # frontend-admin loads
```

**Playwright framework is ready:**

```bash
cd e2e
npx playwright test --list                # no errors
```

**`.env` is configured:**

```bash
cat e2e/.env                              # all 7 keys present
```

**Skills are installed:** Confirm these paths exist:

```
.agents/skills/wat-scope/SKILL.md
.agents/skills/wat-spec/SKILL.md
.agents/skills/wat-build/SKILL.md
.agents/skills/wat-review/SKILL.md
.agents/skills/wat-fix/SKILL.md
```

And the four external skills are available (globally or in `.agents/skills/`):

```
playwright-skill/
functional-test-design/
scenario-test-design/
ai-audit/
```

---

## 3. Skill 1: wat-scope

**Runs:** Once at project start — before any `wat-spec`.

**What it does:** Reads `docs/sut/srs.md` and `docs/sut/api-specification.md`, maps all FR and SEC requirements to test layers, groups them into high-level E2E scenarios, assigns priorities, and writes `docs/test-scope.md`.

**You need to do:** Review the output and reply `APPROVED` or `REJECTED` with feedback.

### Invoke

```
/wat-scope
```

No additional input required. The skill reads the SRS and API spec automatically.

### What the AI will do

1. Read both SRS and API spec files in full
2. Map every FR and SEC requirement to a test layer (UI E2E / API / both)
3. Invoke `scenario-test-design` silently to generate a comprehensive scenario list covering multiple types: Happy Path, Negative, Error Recovery, Security & Misuse
4. Assign `SC-{NN}` IDs and Critical / High / Medium priority to each scenario
5. Write `docs/test-scope.md`
6. Stop and ask for your approval

### Human Gate — what to review

When the AI presents the scope document, open `docs/test-scope.md` and check:

- [ ] Every FR from `docs/sut/srs.md` appears in the mapping table.
- [ ] Every SEC requirement is present.
- [ ] Out-of-scope items (e.g., FR-20 Mobile) are explicitly listed.
- [ ] Scenario names describe user journeys, not FR numbers.
- [ ] Each scenario is a meaningful multi-step journey — not a single-action validation check.
- [ ] Priority assignments make sense for your project context.
- [ ] No important user journey is missing.
- [ ] Scenario list includes multiple types — Happy Path, Negative, Error Recovery, and Security & Misuse where applicable (not only Happy Path).
- [ ] Each scenario has a Type assigned (HP / NEG / EC / ER / SEC).

### How to respond

**If approved:**

```
APPROVED
```

**If changes needed:**

```
REJECTED
- SC-03 should also cover FR-11 (Order History) since it is part of the same user journey.
- FR-09 Coupon validation is missing from SC-02.
- Priority for SC-04 should be Critical, not High — it covers checkout which is core revenue.
```

### After approval

The AI will update the document status to `APPROVED`. Then invoke `ai-audit`:

```
/ai-audit
```

---

## 4. Skill 2: wat-spec

**Runs:** Once per scenario — after `wat-scope` is `APPROVED`.

**What it does:** Takes one scenario ID from the scope document, reads the relevant SRS sections and API contracts, designs the detailed E2E flow (Phase 1), then applies functional test design techniques to produce a test data matrix (Phase 2). Writes `docs/scenarios/{scenario-id}/spec.md`.

**Two human gates:** One after Phase 1 (flow), one after Phase 2 (data matrix).

### Invoke

```
/wat-spec SC-01
```

Replace `SC-01` with the scenario ID from `docs/test-scope.md`.

### What the AI will do

**Phase 1:**

1. Read the target scenario from `docs/test-scope.md`
2. Read all relevant FR sections from `docs/sut/srs.md`
3. Read relevant endpoint contracts from `docs/sut/api-specification.md`
4. Design the complete E2E flow based on the scenario's **Type**:
   - **Happy Path:** primary success flow with valid data and correct system responses
   - **Negative:** multi-step journey ending in correct system rejection — includes the specific step where the business rule is violated and the rejection response
   - **Error Recovery:** journey where user encounters an error mid-flow and recovers within the same session
   - **Security & Misuse:** multi-step attack sequence from a disfavored actor — most steps are API layer; flow ends with the attack defeated
5. Write Phase 1 to `docs/scenarios/SC-01/spec.md`
6. Stop at Gate A — ask you to review the flow

**Phase 2 (after Gate A approval):**

7. Apply functional test design techniques silently (no analysis printed)
8. Extract input value sets only — one representative per class
9. Build the test data matrix and attach to each applicable step
10. Update `spec.md` with Phase 2
11. Stop at Gate B — ask you to review the data matrix

### Human Gate A — what to review

Open `docs/scenarios/SC-01/spec.md` and check the E2E flow:

- [ ] The step sequence reflects how a real user would accomplish the scenario goal.
- [ ] Every FR listed as primary coverage has at least one step.
- [ ] Expected responses are derived from the SRS — not invented.
- [ ] Steps that need server-side verification have API in the test layer column.
- [ ] The scenario Type from `docs/test-scope.md` is correctly reflected in the flow:
  - **Negative:** the specific rejection step is present with the correct system response.
  - **Security:** the flow simulates a realistic attack sequence with API-layer verification.
  - **Error Recovery:** both the error occurrence and recovery path are in the same flow.
- [ ] Error paths within a realistic user journey are inside the main flow (not as separate scenarios)
- [ ] The flow starts from a realistic entry point (login page, homepage — not mid-flow).

### How to respond at Gate A

**If approved:**

```
APPROVED
```

**If changes needed:**

```
REJECTED
- Step 3 is missing: after login, the user should be redirected to the homepage, not the dashboard. Per FR-02, successful login redirects to the product listing page.
- Step 7 (checkout) should include the coupon input step since this scenario covers FR-09.
- Expected response for Step 5 should mention the cart badge updating to show item count (FR-24 visual feedback requirement).
```

### Human Gate B — what to review

Review the test data matrix in Phase 2 of `spec.md`:

- [ ] Every step with user input has EP/BVA variants (valid class, each invalid class, boundary values)
- [ ] Steps with multi-condition rules have Decision Table combinations (N+1 for N conditions)
- [ ] Steps with state transitions cover valid, invalid, and terminal-state triggers
- [ ] Security boundaries have Error Guessing variants (no auth, wrong role, manipulated client data)
- [ ] Each variant has a distinct expected outcome
- [ ] Variant IDs follow `S{step}.V{n}` format

### How to respond at Gate B

**If approved:**

```
APPROVED
```

**If changes needed:**

```
REJECTED
- S3.V2 is missing the BVA off-point for password length (7 characters — one below the minimum of 8 per FR-01).
- The Decision Table for Step 7 (coupon validation) is missing the combination where C3 (min_order_amount) is false — FR-09 lists 5 conditions, we need 6 combinations total.
- S7.V5 should be an Error Guessing variant testing that total_amount sent by the client cannot be manipulated (SEC requirement from FR-08).
```

### After Gate B approval

The AI will confirm the spec is ready for `wat-build`. Invoke `ai-audit`:

```
/ai-audit
```

---

## 5. Skill 3: wat-build

**Runs:** Once per scenario — after `wat-spec` Gate B is APPROVED.

**What it does:** Reads the approved `spec.md` and implements all test code in order: POM classes first, then fixtures if needed, then test spec files. Stops after each piece for you to run and verify locally.

**Human gate after every piece:** You must run the test and reply `PASSED` or `FAILED` before the next piece is implemented.

### Invoke

```
/wat-build SC-01
```

Replace `SC-01` with the scenario ID from `docs/test-scope.md`.

### What the AI will do

1. Read `docs/scenarios/SC-01/spec.md` in full
2. Read `docs/sut/project-structure.md` for correct file paths
3. Determine internally: which POM classes, fixtures, and test files are needed
4. Implement one piece at a time, stopping after each for your verification

### Running the test after each piece

When the AI presents a new file, run the command it provides. General patterns:

```bash
# Web E2E test or POM class used in web tests
npx playwright test e2e/tests/web/{path}.spec.ts --headed --project=web-chromium

# Admin E2E test or POM class used in admin tests
npx playwright test e2e/tests/admin/{path}.spec.ts --headed --project=admin-chromium

# API test (no browser)
npx playwright test e2e/tests/api/{path}.spec.ts --project=api

# Run all tests for this scenario across all browsers (use before commit)
npx playwright test e2e/tests/web/{path}.spec.ts \
  --project=web-chromium --project=web-firefox --project=web-webkit
```

### How to respond at each piece gate

**If test passed:**

```
PASSED
```

**If test failed:**

```
FAILED

Error output:
[paste the full terminal output here]

Example:
  Error: locator.fill: Error: strict mode violation: getByLabel('Email') resolved to 2 elements at LoginPage.login (e2e/pages/web/login.page.ts:18:5)
```

**Always paste the full error output** — partial output makes diagnosis unreliable.

### While `wat-build` is running

- Do not modify any generated file manually between pieces — let the AI finish
- If you notice an issue unrelated to the current piece's test failure, note it down and raise it during `wat-review`
- If the AI implements something you believe is wrong but the test still passes, reply `PASSED` and flag it in `wat-review`

### After all pieces pass

The AI will confirm all pieces are complete and recommend `wat-review`. Invoke `ai-audit` after each piece or as a batch at the end:

```
/ai-audit
```

---

## 6. Skill 4: wat-review

**Runs:** Once per scenario — after all `wat-build` pieces are `PASSED`.

**What it does:** Reviews all generated test code across four axes: Playwright Golden Rule conformance, spec coverage, test isolation, and security coverage. Writes `docs/scenarios/{scenario-id}/review-notes.md` with classified findings. You mark each finding `CONFIRMED` or `DISMISSED`.

### Invoke

```
/wat-review SC-01
```

Replace `SC-01` with the scenario ID from `docs/test-scope.md`.

### What the AI will do

1. Read all POM classes, fixtures, and test files for SC-01
2. Read `docs/scenarios/SC-01/spec.md` and relevant SRS sections
3. Review across all four axes (Playwright rules, spec coverage, isolation, security)
4. Write all findings to `review-notes.md` with evidence
5. Stop and ask you to mark each finding

### Marking findings in `review-notes.md`

Open `docs/scenarios/SC-01/review-notes.md`. For each finding, fill in the human decision field directly in the file:

```markdown
**Human decision:** [x] CONFIRMED — reason: assertion is non-retrying, will cause flakiness under load
or
**Human decision:** [x] DISMISSED — reason: this is a style preference, the test still correctly validates the behavior
```

Save the file after marking all findings. Then reply:

```
DONE
```

### How to evaluate findings

| Finding type | When to CONFIRM                                              | When to DISMISS                                                        |
| ------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Blocking     | Almost always — these are correctness issues                 | Only if you have evidence the specific scenario makes the pattern safe |
| Coverage Gap | If the missing variant would test something the SRS requires | If the variant was intentionally omitted with a documented reason      |
| Non-blocking | If the team wants to enforce the style consistently          | If it is a known trade-off acceptable for this project                 |

### After all findings are marked

The AI will read the file and determine next steps:

- Zero Blocking/Coverage Gap `CONFIRMED` → scenario complete, move to next scenario
- Any Blocking/Coverage Gap `CONFIRMED` → invoke `wat-fix`

Invoke `ai-audit` regardless of outcome:

```
/ai-audit
```

---

## 7. Skill 5: wat-fix

**Runs:** Only when `wat-review` produces `CONFIRMED` Blocking or Coverage Gap findings.

**What it does:** Processes each confirmed finding with a root-cause explanation, applies a targeted minimal fix, provides the CLI command to re-run the affected test, and waits for your `RESOLVED` or `FAILED` response before proceeding.

### Invoke

```
/wat-fix SC-01
```

Replace `SC-01` with the scenario ID from `docs/test-scope.md`.

### What the AI will do

For each `CONFIRMED` Blocking or Coverage Gap finding, in order:

1. State the root cause (why the code is wrong, not just what is wrong)
2. Show the exact before/after code change
3. Apply only the targeted fix — nothing else changes
4. Provide the CLI command to re-run
5. Stop and wait for your response

### How to respond at each fix gate

**If the fix passes:**

```
RESOLVED
```

**If the fix fails:**

```
FAILED

Error output:
[paste the full terminal output here]
```

The AI will re-diagnose from the error output and apply a revised fix.

### Important: Do not run all tests at once during wat-fix

Run only the specific file the AI instructs. Running the full suite during an in-progress fix session makes it harder to attribute failures to the right cause.

### After all findings are RESOLVED

The AI will update `review-notes.md` and inform you. At this point you have two options:

- **Option A — Scenario complete:** If you are confident the fixes are sufficient, proceed to the next scenario.
- **Option B — Re-review:** If the fixes were significant or touched multiple files, invoke `wat-review` again to verify the fixes did not introduce new issues:
  ```
  /wat-review SC-01
  ```

Invoke `ai-audit`:

```
/ai-audit
```

---

## 8. Audit Logging

The `ai-audit` skill generates a structured audit entry after each command cycle. You must invoke it manually and complete the human review fields yourself.

### When to invoke

Invoke `/ai-audit` after every skill completes — minimum one entry per skill per scenario. You may also invoke it after each `wat-build` piece if your project requires granular audit records.

### Invoke

```
/ai-audit
```

### What the AI generates (pre-filled)

```markdown
## [AUDIT-XXX] — /wat-spec / SC-01 Auth Flow — YYYY-MM-DD

| Field              | Value                                                      |
| ------------------ | ---------------------------------------------------------- |
| **Audit ID**       | AUDIT-XXX                                                  |
| **Command**        | /wat-spec                                                  |
| **Scenario**       | SC-01 — Authentication Flow                                |
| **AI Model**       | {model name}                                               |
| **Timestamp**      | YYYY-MM-DD HH:MM                                           |
| **Input Summary**  | Invoked wat-spec for SC-01 covering FR-01, FR-02, FR-03    |
| **Output Summary** | Produced spec.md with 8-step E2E flow and 14 test variants |
| **Files Produced** | `docs/scenarios/SC-01/spec.md`                             |
```

### What you must complete (never pre-filled by AI)

```markdown
| Field                   | Value                                  |
| ----------------------- | -------------------------------------- |
| **Human Review Result** | Agree / Partially Agree / Disagree     |
| **Disagreements**       | {list any outputs you found incorrect} |
| **Corrections Made**    | {what you changed or rejected}         |
| **Sign-off**            | {your name} — YYYY-MM-DD               |
```

---

## 9. Workflow Diagram

```
START
  │
  ▼
[Checklist] SUT running + framework ready + skills installed
  │
  ▼
/wat-scope
  │
  ├──────────────────────────────────────────────────────────────┐
  │                                                              │
  ▼                                                            revise
[Human] Review docs/test-scope.md                                │
  │                                                              │
  ├────────────────────────────REJECTED──────────────────────────┘
  │
APPROVED
  │
/ai-audit → [Human] Complete audit entry
  │
  ▼
  ┌──────────────────────────────────────────────────────────────┐
  │  For each scenario in docs/test-scope.md (in priority order) │
  │                                                              │
  │  /wat-spec SC-XX                                             │
  │    │                                                         │
  │    ├─ [Gate A] REJECTED → revise flow → Gate A again         │
  │    └─ [Gate A] APPROVED                                      │
  │         │                                                    │
  │         ├─ [Gate B] REJECTED → revise matrix → Gate B again  │
  │         └─ [Gate B] APPROVED                                 │
  │              │                                               │
  │  /ai-audit → [Human] Complete audit entry                    │
  │              │                                               │
  │  /wat-build SC-XX                                            │
  │    │                                                         │
  │    ├─ per piece: FAILED → AI fixes → run again               │
  │    └─ per piece: PASSED → next piece                         │
  │    (repeat until all pieces PASSED)                          │
  │              │                                               │
  │  /ai-audit → [Human] Complete audit entry                    │
  │              │                                               │
  │  /wat-review SC-XX                                           │
  │    │                                                         │
  │    └─ [Human] Mark each finding CONFIRMED or DISMISSED       │
  │    └─ Reply DONE                                             │
  │              │                                               │
  │  /ai-audit → [Human] Complete audit entry                    │
  │              │                                               │
  │    ┌─────────┴──────────────────────┐                        │
  │    │                                │                        │
  │  No Blocking/Gap              Blocking/Gap                   │
  │  findings CONFIRMED           findings CONFIRMED             │
  │    │                                │                        │
  │  Scenario                    /wat-fix SC-XX                  │
  │  COMPLETE                      │                             │
  │    │                           ├─ FAILED → re-diagnose       │
  │    │                           └─ RESOLVED → next finding    │
  │    │                           (repeat until all RESOLVED)   │
  │    │                                │                        │
  │    │                    /ai-audit → [Human] Complete entry   │
  │    │                                │                        │
  │    └────────────────────────────────┘                        │
  │              │                                               │
  │         Next scenario                                        │
  └──────────────────────────────────────────────────────────────┘
  │
  ▼
All scenarios complete → run full suite
npx playwright test --project=web-chromium --project=admin-chromium --project=api
```

---

## 10. Quick Reference — All Prompts

### One-time commands

| Action            | Prompt       |
| ----------------- | ------------ |
| Define test scope | `/wat-scope` |

### Per-scenario commands

| Action                 | Prompt              |
| ---------------------- | ------------------- |
| Design scenario spec   | `/wat-spec SC-XX`   |
| Implement test code    | `/wat-build SC-XX`  |
| Review test quality    | `/wat-review SC-XX` |
| Fix confirmed findings | `/wat-fix SC-XX`    |
| Log AI interaction     | `/ai-audit`         |

### Human gate responses

| Situation                                           | Response                     |
| --------------------------------------------------- | ---------------------------- |
| Approve scope / spec flow / spec data / build piece | `APPROVED` or `PASSED`       |
| Reject with feedback                                | `REJECTED` + bullet points   |
| Report test failure                                 | `FAILED` + full error output |
| Confirm fix passed                                  | `RESOLVED`                   |
| Done marking review findings                        | `DONE`                       |

### Playwright run commands

| Goal                      | Command                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| All tests, all browsers   | `npx playwright test`                                                                         |
| Web — Chromium only (dev) | `npx playwright test --project=web-chromium`                                                  |
| Web — all 3 browsers      | `npx playwright test --project=web-chromium --project=web-firefox --project=web-webkit`       |
| Admin — Chromium only     | `npx playwright test --project=admin-chromium`                                                |
| Admin — all 3 browsers    | `npx playwright test --project=admin-chromium --project=admin-firefox --project=admin-webkit` |
| API only                  | `npx playwright test --project=api`                                                           |
| Smoke suite (web)         | `npx playwright test --project=smoke`                                                         |
| Smoke suite (admin)       | `npx playwright test --project=smoke-admin`                                                   |
| One file, headed          | `npx playwright test {file} --headed --project=web-chromium`                                  |
| One file, debug mode      | `npx playwright test {file} --debug --project=web-chromium`                                   |
| Filter by test name       | `npx playwright test -g "TC-AUTH-01"`                                                         |
| Open HTML report          | `npx playwright show-report`                                                                  |
| Open trace file           | `npx playwright show-trace`                                                                   |
| Generate test (codegen)   | `npx playwright codegen http://localhost:5173`                                                |

---

## 11. Common Mistakes

| Mistake                                                       | Why it matters                                                                                                       | What to do instead                                                               |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Invoking `wat-spec` before `wat-scope` is APPROVED            | The spec has no approved scenario list to reference — the AI may design scenarios inconsistent with the agreed scope | Always wait for APPROVED on the scope document first                             |
| Invoking `wat-build` before `wat-spec` Gate B                 | The implementation contract is incomplete — the AI will have no data matrix to implement variants from               | Ensure both gates A and B are APPROVED                                           |
| Replying PASSED without running the test                      | A passing reply advances to the next piece even if the code is broken — issues are harder to isolate later           | Always run the exact command the AI provides before replying                     |
| Pasting partial error output on FAILED                        | The AI diagnoses from the error message and stack trace — truncated output leads to wrong diagnosis                  | Paste the complete terminal output, including all stack frames                   |
| Skipping `ai-audit`                                           | The audit log is a course requirement and a record of human decisions — gaps cannot be reconstructed later           | Invoke `/ai-audit` after every skill, fill in all human fields before proceeding |
| Marking findings DISMISSED without a reason                   | The human decision field is a required record of your judgment — blank or vague reasons cannot be audited            | Always write a specific reason, even for dismissals                              |
| Running the full suite during `wat-fix`                       | Makes it impossible to attribute new failures to the fix vs pre-existing issues                                      | Run only the specific file the AI instructs during `wat-fix`                     |
| Modifying generated files manually between `wat-build` pieces | The AI's next piece assumes the previous state — manual edits cause drift and unexpected test failures               | If you spot an issue, reply FAILED with an explanation; let the AI fix it        |
| Invoking `wat-fix` without reading `review-notes.md` first    | You may not know which findings are CONFIRMED — the AI will ask you to mark them first anyway                        | Mark all findings in the file and reply DONE before invoking `wat-fix`           |
