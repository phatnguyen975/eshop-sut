---
name: test-case-generator
description: >
  Compile all approved EP classes and BVA points into a final test case table
  following the standard defined in TestCaseDesign.md. Output is a Markdown file
  containing the complete TC table with all mandatory fields. Only run after
  domain-coverage-reviewer has been approved.
trigger:
  - "generate test cases"
  - "compile test cases"
  - "build TC table"
  - "create test cases"
output: qa-artifacts/test-cases/FR{nn}-test-cases.md
---

# Skill: test-case-generator

## 1. Purpose

Transform all EP classes and BVA points into a complete, structured test case table that complies with `theory-testcase-design.md`. This is the direct deliverable used during test execution and submitted as part of HW02.

## 2. Input Required

- Approved output of `domain-coverage-reviewer` (complete EP + BVA + gap analysis)
- **Reference:** `.agents/context/theory-testcase-design.md`
- **Reference:** `.agents/context/eshop-srs.md` (for Expected Results)
- **Reference:** `.agents/context/eshop-api-spec.md` (for HTTP response details)

## 3. TC Structure Rules

### 3.1 Mandatory Fields

Every TC must contain exactly these 9 columns in this order:

| Column              | Description                                   | Example                                                 |
| ------------------- | --------------------------------------------- | ------------------------------------------------------- |
| **TC ID**           | `FR{nn}-EP-{nnn}` or `FR{nn}-BVA-{nnn}`       | `FR01-EP-001`                                           |
| **Objective**       | `Action + Function + Operating Condition`     | `Verify user registration with all valid inputs`        |
| **Pre-condition**   | Exact system state before test begins         | `SUT is running. No account with email X exists in DB.` |
| **Test Data**       | Specific concrete input values                | `email="new@test.com", password="Test@123"`             |
| **Steps**           | Numbered sequential actions                   | `1. Navigate to... 2. Fill in... 3. Click...`           |
| **Expected Result** | Exact outcome with FR/SEC citation            | `HTTP 200 + body matches spec (per FR-01)`              |
| **Test Channel**    | UI / API / Role-Auth / DOM (Web only) / State | `UI + API`                                              |
| **Observed Result** | Blank — filled during execution               | _(blank)_                                               |
| **Status**          | Blank — filled during execution               | _(blank)_                                               |

### 3.2 Objective Title Syntax — CRITICAL

From `theory-testcase-design.md` Section 2.2 — **`Action + Function + Operating Condition`**:

| Part      | Good Examples                             | Bad Examples           |
| --------- | ----------------------------------------- | ---------------------- |
| Action    | Verify, Validate, Confirm                 | Check, See, Make sure  |
| Function  | user registration, coupon creation        | it, the feature        |
| Condition | with all valid inputs, when cart is empty | correctly, as expected |

**Good:** `Verify user registration with valid name, email, and strong password`
**Good:** `Validate cart item deletion confirmation dialog when item exists`
**Bad:** `Test registration` — missing condition
**Bad:** `Verify the system works correctly` — vague

### 3.3 Pre-condition Rules

- Must be complete enough for any tester to set up without clarification
- Abstract repetitive setup: "User is logged in as admin" not the full login steps
- State data requirements: "Product ID 1 exists in DB", "Cart is empty"
- For API tests: "Admin JWT is stored in Postman env variable `admin_token`"

### 3.4 Expected Result Rules — CRITICAL

- Must be **specific and measurable** — never write "system works correctly"
- Must **cite FR or SEC number**: "(per FR-01)", "(per SEC-03)"
- Cover all validation points relevant to the test channel

**Good Expected Result:**

```
1. HTTP 200 OK
2. Response body: {"message": "User registered successfully", "id": <integer>}
3. UI navigates to Login page (per FR-01)
4. User record created in DB — verified via GET /api/admin/users
```

**Bad Expected Result:**

```
Registration is successful.
```

### 3.5 Self-Cleaning Rule

If a TC creates persistent data (user, coupon, cart item), add a **Teardown step**:

```
[Teardown] Delete the created user: DELETE /api/admin/users/{id} with admin token.
```

## 4. Step-by-Step Instructions

### Step A — Organize TCs into Two Sections

**Section 1: EP Test Cases** (FR{nn}-EP-001, FR{nn}-EP-002, ...)

- First TC: Happy Path (all valid, Combination Rule)
- Remaining: One TC per invalid EC (Isolation Rule), ordered by variable

**Section 2: BVA Test Cases** (FR{nn}-BVA-001, FR{nn}-BVA-002, ...)

- One TC per BVA point per variable
- Lower boundary group first, upper boundary group second

### Step B — Write Each TC

For each EC or BVA point:

1. Assign sequential TC ID
2. Write objective using `Action + Function + Condition`
3. Write pre-condition abstracting repetitive setup
4. Write concrete test data (no placeholders like `[valid email]`)
5. Write economical numbered steps
6. Write specific expected result citing FR/SEC
7. Assign correct test channel(s)
8. Add teardown if TC creates persistent data

### Step C — Number TC IDs Sequentially

**Keep order:** Happy Path → Invalid ECs → BVA lower boundary → BVA upper boundary

- **EP TCs:** FR{nn}-EP-001, FR{nn}-EP-002, ...
- **BVA TCs:** FR{nn}-BVA-001, FR{nn}-BVA-002, ...

### Step D — Add EC Traceability Column

| TC ID        | EC/BVA Ref              | Objective                                        | ... |
| ------------ | ----------------------- | ------------------------------------------------ | --- |
| FR01-EP-001  | EC01 + EC06 + EC13      | Verify registration with all valid inputs        | ... |
| FR01-EP-002  | EC02                    | Verify registration rejects invalid email format | ... |
| FR01-BVA-002 | password LB-1 (7 chars) | Verify registration rejects 7-character password | ... |

## 5. Output Format

> **CRITICAL RULE:** All generated content MUST be strictly in English.

Output to `qa-artifacts/test-cases/FR{nn}-test-cases.md` with the following structure:

```markdown
# Test Cases — FR-{nn}: {Feature Name}

**Total TCs:** {n} ({n_ep} EP + {n_bva} BVA)
**Feature:** FR-{nn} — {Feature Name}
**SRS Reference:** eshop-srs.md FR-{nn}
**Generated by:** test-case-generator skill
**Date:** {YYYY-MM-DD}

## Part 1: EP Test Cases

### FR{nn}-EP-001 — Happy Path

| Field               | Value                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------- |
| **TC ID**           | FR{nn}-EP-001                                                                         |
| **Objective**       | Verify {feature} with all valid inputs                                                |
| **EC Ref**          | EC01, EC05, EC09 (covers {n} valid classes)                                           |
| **Pre-condition**   | SUT is running. {Data state}. {Auth state}.                                           |
| **Test Data**       | `field1 = "value1"`, `field2 = "value2"`                                              |
| **Steps**           | 1. Navigate to {URL}<br>2. Fill in {fields}<br>3. Click {button}<br>4. Observe result |
| **Expected Result** | 1. HTTP {status}<br>2. Response: `{body}`<br>3. UI: {behavior} (per FR-{nn})          |
| **Test Channel**    | UI + API                                                                              |
| **Observed Result** | _(to be filled during execution)_                                                     |
| **Status**          | _(to be filled during execution)_                                                     |

### FR{nn}-EP-002 — {Invalid Class Name}

| Field               | Value                                                               |
| ------------------- | ------------------------------------------------------------------- |
| **TC ID**           | FR{nn}-EP-002                                                       |
| **Objective**       | Verify {feature} rejects {specific invalid input}                   |
| **EC Ref**          | EC02 — invalid {field}: {reason}                                    |
| **Pre-condition**   | {state}                                                             |
| **Test Data**       | `{invalid_field} = "{value}"`, all other fields = valid             |
| **Steps**           | 1. {Action}<br>2. {Action}<br>3. Observe result                     |
| **Expected Result** | System rejects input. {Specific error or HTTP status} (per FR-{nn}) |
| **Test Channel**    | {channel}                                                           |
| **Observed Result** | _(blank)_                                                           |
| **Status**          | _(blank)_                                                           |

## Part 2: BVA Test Cases

### FR{nn}-BVA-001 — `{variable}` at -α (empty / absolute minimum)

| Field               | Value                                                           |
| ------------------- | --------------------------------------------------------------- |
| **TC ID**           | FR{nn}-BVA-001                                                  |
| **Objective**       | Verify {feature} rejects {variable} at absolute minimum (empty) |
| **BVA Ref**         | `{variable}` = empty string, BVA Point: -α                      |
| **Pre-condition**   | {state}                                                         |
| **Test Data**       | `{variable} = ""`, all other inputs = valid                     |
| **Steps**           | 1. {Action}<br>2. {Action}<br>3. Observe result                 |
| **Expected Result** | System rejects empty {variable}. Error displayed (per FR-{nn})  |
| **Test Channel**    | API                                                             |
| **Observed Result** | _(blank)_                                                       |
| **Status**          | _(blank)_                                                       |

## TC Summary Table

| TC ID          | Type | EC / BVA Ref | Test Focus           | Channel  | Status |
| -------------- | ---- | ------------ | -------------------- | -------- | ------ |
| FR{nn}-EP-001  | EP   | EC01, EC05   | Happy path           | UI + API |        |
| FR{nn}-EP-002  | EP   | EC02         | Invalid email format | UI + API |        |
| FR{nn}-BVA-001 | BVA  | password -α  | Empty password       | API      |        |

**Coverage:**

- EP Valid Classes: {n}/{n} covered
- EP Invalid Classes: {n}/{n} covered
- BVA Points: {n}/{n} generated
```

## 6. Quality Checklist — 7 Characteristics

- [ ] All generated content is completely in English
- [ ] **Accurate**: Each TC tests exactly one objective
- [ ] **Economical**: No unnecessary steps; pre-conditions abstract setup
- [ ] **Repeatable**: No hardcoded dynamic values (abstract OTPs, dates)
- [ ] **Traceable**: Every Expected Result cites FR or SEC number
- [ ] **Appropriate**: Correct Test Channel assigned to each TC
- [ ] **Self-standing**: Executable by any tester without author clarification
- [ ] **Self-cleaning**: Teardown step present if TC creates persistent data
- [ ] All valid EP classes covered (Combination Rule applied)
- [ ] Each invalid EP class has its own separate TC (Isolation Rule applied)
- [ ] No TC contains two invalid inputs (no defect masking)
- [ ] Each BVA point has its own TC
- [ ] All Expected Results are specific and measurable
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk
