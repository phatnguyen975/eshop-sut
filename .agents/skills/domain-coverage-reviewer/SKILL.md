---
name: domain-coverage-reviewer
description: >
  QA Gate after EP and BVA: review all equivalence classes and boundary points
  to detect missing classes, misapplied guidelines, isolation rule violations,
  and perform the AI gap analysis required by HW02 Section 6.3. Results must
  be approved by the human before proceeding to test-case-generator.
trigger:
  - "review coverage"
  - "AI gap analysis"
  - "domain coverage review"
  - "QA gate EP BVA"
  - "check coverage"
output: Gap Analysis section appended to qa-artifacts/domain-analysis/FR{nn}-domain-analysis.md
---

# Skill: domain-coverage-reviewer

## 1. Purpose

Mandatory QA Gate after EP and BVA. This skill:

1. Verifies EP was applied correctly using all 4 guidelines
2. Verifies Isolation and Combination rules were followed
3. Verifies BVA covered all boundary variables
4. Performs AI gap analysis (HW02 Section 6.3 requirement)
5. Flags high-risk missing classes for human review

## 2. Input Required

- Approved output of `equivalence-partitioning`
- Approved output of `boundary-value-analysis`
- **Reference files:** `.agents/context/eshop-srs.md` and `.agents/context/theory-domain-testing.md`

## 3. Step-by-Step Instructions

### Step A — EP Guidelines Compliance Review

For each variable, check:

| Check          | Question                                                        | Verdict   |
| -------------- | --------------------------------------------------------------- | --------- |
| G1 Applied?    | Do continuous range variables have 1 valid + 2 invalid classes? | Pass/Fail |
| G2 Applied?    | Do enum variables have 1 valid class per element?               | Pass/Fail |
| G3 Applied?    | Do must-be conditions have 1 valid + 1 invalid?                 | Pass/Fail |
| G4 Considered? | Were complex strings split where hidden logic is suspected?     | Pass/Fail |

### Step B — Missing Class Detection

Systematically check for classes AI commonly misses. Apply branching logic for Web vs. Mobile UI. Do NOT flag missing DOM/HTML classes (like `<h1>`, `type="email"`) as errors for the Mobile App (FR-03).

**B1. Empty / Null classes:**

- Does every required field have a class for `empty string`?
- Does every required API field have a class for `null / missing from body`?

**B2. Cross-field classes:**

- If two fields depend on each other, is there a "mismatch" class?
- Examples: `password != confirmPassword`, `newPassword != confirmNewPassword`

**B3. DB-state classes:**

- If validation depends on DB state, is there an "already exists" class?
- Examples: email uniqueness, coupon code uniqueness

**B4. Security-specific classes:**

- Auth features: classes for `no-token`, `expired-token`, `wrong-role-token`?
- OTP features: classes for `cross-email OTP use`, `reused OTP`?
- Admin features: class for `user-token calling admin API`?

**B5. Boundary edge cases:**

- Is there a class for special characters in the ALLOWED set vs OUTSIDE?
- Example: password with `@` (allowed) vs `#` (not in set `@$!%*?&`) — two distinct classes

**B6. State-transition classes:**

- Multi-step workflow: is there a class for attempting step 2 before step 1?
- OTP reset: is there a class for "OTP already used on a previous attempt"?

**B7. Implicit/Architectural classes:**

- Did the previous steps generate classes or boundaries for the implicit constraints (e.g., DB max length, integer limits) identified in the requirement analysis?

### Step C — Isolation Rule Compliance Review

Scan each invalid TC:

- [ ] Exactly 1 invalid input per TC?
- [ ] All other inputs are VALID?
- [ ] No TC contains 2 or more invalid inputs?

Flag violations using this format:

```
WARNING — ISOLATION RULE VIOLATION:
TC FR01-EP-006 contains both invalid email AND invalid password simultaneously.
Action required: split into 2 separate TCs.
```

### Step D — Combination Rule Review

Scan valid TCs:

- [ ] Do valid TCs combine multiple valid classes where possible?
- [ ] Is any valid TC testing only 1 valid class when more could be combined?

### Step E — BVA Completeness Review

- [ ] All ordered/numeric variables have a BVA table?
- [ ] String length variables included in BVA?
- [ ] Date variables included in BVA?
- [ ] Both -alpha and +alpha points present?
- [ ] Each BVA point is a separate TC?

### Step F — AI Gap Analysis (HW02 Mandatory)

Required output per HW02 Section 6.3. Analyze and document:

1. **What AI did correctly:** Classes AI generated without prompting
2. **What AI missed:** Classes AI failed to generate
3. **Root cause per miss:** Classify as one of:
   - _Prompt quality:_ Human did not provide sufficient context
   - _AI limitation:_ AI lacks specific EShop domain knowledge
   - _Feature complexity:_ Hidden business rule not explicit in the FR spec
4. **Lesson learned:** One clear principle for collaborating with AI

### Step G — Supplementary TC Recommendations

After gap analysis, suggest TCs for classes that were added manually:

| Reason    | Missing Class                             | Suggested TC                                       |
| --------- | ----------------------------------------- | -------------------------------------------------- |
| AI missed | OTP cross-email attack                    | FR03-EP-XXX: use OTP from emailA to reset emailB   |
| AI missed | Password special char outside allowed set | FR01-EP-XXX: password = "Test#123"                 |
| AI missed | User token on admin endpoint              | FR17-EP-XXX: POST /api/admin/coupons with user JWT |

## 4. Output Format

> **CRITICAL RULE:** All generated content MUST be strictly in English.

Append to end of `qa-artifacts/domain-analysis/FR{nn}-domain-analysis.md`:

```markdown
## Step 5: Domain Coverage Review & AI Gap Analysis

### 5.1 EP Guidelines Compliance

| Variable        | Guideline Applied | Valid Classes | Invalid Classes | Status |
| --------------- | ----------------- | ------------- | --------------- | ------ |
| `email`         | G3                | 1             | 3               | Pass   |
| `password`      | G1 + G3 x4        | 1             | 6               | Pass   |
| `type` (coupon) | G2                | 2             | 1               | Pass   |

### 5.2 Missing Classes Found

| #   | Missing Class                              | Reason                      | Action Taken |
| --- | ------------------------------------------ | --------------------------- | ------------ |
| 1   | Password: special char outside allowed set | G4 splitting not applied    | Added EC-XX  |
| 2   | OTP cross-email use                        | Hidden security rule SEC-07 | Added EC-XX  |
| 3   | User token on admin endpoint               | Auth class not generated    | Added EC-XX  |

### 5.3 Rule Violations Found

| TC ID | Violation | Description | Fix Applied |
| ----- | --------- | ----------- | ----------- |
| —     | None      | —           | —           |

### 5.4 BVA Completeness

| Variable          | BVA Applied | Points Generated | Missing Points |
| ----------------- | ----------- | ---------------- | -------------- |
| `password` length | Yes         | 6                | None           |
| `quantity`        | Yes         | 7                | None           |

### 5.5 AI Gap Analysis

#### What AI Did Correctly

- Identified all direct input variables from the FR spec
- Applied G1 correctly to all numeric range variables
- Generated basic invalid classes for each form field

#### What AI Missed

1. **OTP cross-email class (FR-03)**
   - Description: AI did not generate the class where a user attempts to use the OTP generated for emailA to reset the password of emailB.
   - Root cause: AI limitation — SEC-07 is an implicit requirement not restated in the FR-03 section. Requires cross-referencing the SEC section simultaneously.

2. **Password special char outside allowed set (FR-01)**
   - Description: AI created a "missing special character" class but did not split it into "missing" vs "present but outside allowed set @$!%\*?&".
   - Root cause: Guideline 4 (Splitting Principle) was not applied by AI.

3. **User token on admin endpoint (FR-17)**
   - Description: AI did not create the role-based auth class for testing regular user tokens against admin-only endpoints.
   - Root cause: Prompt quality — prompt did not explicitly instruct AI to generate authorization test classes alongside functional input classes.

#### Root Cause Summary

| Category           | % Share | Description                                         |
| ------------------ | ------- | --------------------------------------------------- |
| Prompt quality     | 30%     | Context about security rules not included in prompt |
| AI limitation      | 50%     | Lacks EShop-specific domain and security knowledge  |
| Feature complexity | 20%     | Hidden business rules not explicit in FR spec       |

#### Lesson Learned

> (Placeholder — Human writes the final version in `ai-critique.md`)

### 5.6 Final EC Count After Review

| Category      | Before Review | Added | After Review |
| ------------- | ------------- | ----- | ------------ |
| Valid ECs     | {n}           | {n}   | {n}          |
| Invalid ECs   | {n}           | {n}   | {n}          |
| BVA Points    | {n}           | {n}   | {n}          |
| **Total TCs** | {n}           | {n}   | {n}          |
```

## 5. Quality Checklist

- [ ] All generated content is completely in English
- [ ] All 4 EP guidelines verified for each variable
- [ ] Missing classes detected and added to EP output (excluding Web DOM checks for Mobile)
- [ ] Implicit architectural constraints were verified for coverage
- [ ] Isolation rule violations flagged and fixed
- [ ] BVA completeness verified across all variable types
- [ ] AI gap analysis section fully completed
- [ ] Supplementary TCs recommended for all manually-added classes
- [ ] Human reviewed and approved before proceeding to test-case-generator
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk
