---
name: requirement-analyzer
description: >
  Analyze a Feature Requirement (FR) from the SRS to extract all constraints,
  business rules, actors, preconditions, and acceptance criteria. This is the
  mandatory FIRST step before any Domain Testing work begins. Output serves
  as the foundation for domain-identifier.
trigger:
  - "analyze FR-xx"
  - "analyze requirement"
  - "requirement analysis for"
  - "start testing FR-xx"
output: qa-artifacts/requirements/FR{nn}-requirement-analysis.md
---

# Skill: requirement-analyzer

## 1. Purpose

Extract and structure all information from a FR in `eshop-srs.md` into a requirement analysis document that can be directly used in the EP and BVA steps. Do NOT start `domain-identifier` until this skill is complete and the human has approved the output.

## 2. Input Required

- FR ID to analyze (e.g., FR-01, FR-07, FR-17, FR-03)
- **Reference files:** `.agents/context/eshop-srs.md` and `.agents/context/eshop-api-spec.md`

## 3. Step-by-Step Instructions

### Step A — Identify Feature Context

1. Read the full FR section in `eshop-srs.md`.
2. Determine which layer this feature belongs to:
   - **Web UI:** Test via Browser (e.g., FR-01, FR-07, FR-17)
   - **Mobile UI:** Test via React Native App (e.g., FR-03)
   - **API Only:** Test via Postman/cURL only
   - **Both (Web/Mobile + API):** Test via UI and API (most common)
3. Identify all entry points: URL + API endpoint

### Step B — Extract Actors & Access Control

List:

- **Actors**: Anonymous / Logged-in User / Admin
- **Auth requirement**: Is a token required? Which type?
- **Role requirement**: Does it need `role = 'admin'`? (applies SEC-03)

### Step C — Extract Input Fields & Constraints

For each input field/parameter, record in a table:

| Field/Param | Layer    | Type   | Explicit Constraints (from SRS) | Implicit Constraints (Architecture/DB) | API Param Name |
| ----------- | -------- | ------ | ------------------------------- | -------------------------------------- | -------------- |
| name        | UI + API | string | required, non-empty             | ASCII vs Unicode, Max length           | `name`         |
| email       | UI + API | string | valid format, unique            | RFC 5322 format, DB length limits      | `email`        |

Constraint sources to read in order:

1. Main FR spec (business rules)
2. FR-21 (UI language, currency format)
3. FR-22 (form: `type="email"`, `type="password"`, required `*`, error position)
4. FR-23 (navigation: badge, highlight, breadcrumb)
5. FR-24 (feedback: toast, confirm dialog, empty state)
6. SEC-01~07 (security constraints)
7. API Spec (request body schema, response format)

### Step D — Extract Business Rules

Each rule must:

- Be numbered: [BR-01], [BR-02], ...
- Have a specific FR/SEC citation
- Include positive rules (conditions for success)
- Include negative rules (conditions for rejection)
- Include special cases (edge cases from the spec)

Example format:

```
[BR-01] Email must be a valid format user@domain.com (per FR-01)
[BR-02] Email must be unique in the system (per FR-01)
[BR-03] Password minimum 8 characters, must contain uppercase, lowercase, digit,
        and special character from the set @$!%*?& (per FR-01)
[BR-04] OTP is only valid for the email that requested it; cannot be used for
        another email (per FR-03, SEC-07)
```

### Step E — Extract Expected Outputs

Describe in detail for each scenario:

**Success path:**

- HTTP status + response body (from API spec)
- UI behavior (redirect, toast, badge update)
- DB state change (what was created/modified/deleted)

**Failure paths (one bullet per error type):**

- Invalid input → error message + HTTP status
- Unauthorized → 401/403
- Business rule violation → specific error

### Step F — GUI Requirements Applicable

Check FR-21~24 and list which requirements apply to this feature. Apply branching logic based on the platform:

- For Web UI (FR-01, FR-07, FR-17), check HTML/DOM semantics (e.g., `required` attributes, `type="email"`, exact `<h1>` count, `alt` attributes).
- For Mobile UI (FR-03), skip HTML/DOM checks. Focus ONLY on visual feedback, state changes, color consistency, and step indicators.
- For Common UI/UX, where must error messages appear? (must be ABOVE the submit button). Are there toast/badge/confirm dialog requirements?
- Which fields need `required` attribute + `*` label?
- Does the form need `type="email"` or `type="password"`?
- Is there a Step Indicator? (FR-22: forms with 2+ steps)
- Is a breadcrumb required? (FR-23)
- Where must error messages appear? (must be ABOVE the submit button, per FR-22)
- Are there toast/badge/confirm dialog requirements? (FR-24)

### Step G — Security Requirements Applicable

List applicable SEC rules:

- **SEC-02:** Does the API require JWT?
- **SEC-03:** Does the Admin API check `role='admin'`?
- **SEC-04:** Is user input displayed back on UI? (XSS risk)
- **SEC-07:** OTP-related? (invalidation after use, cross-email binding)

## 4. Output Format

> **CRITICAL RULE:** All generated content MUST be strictly in English.

Save to `qa-artifacts/requirements/FR{nn}-requirement-analysis.md`:

```markdown
# Requirement Analysis — FR-{nn}: {Feature Name}

## 1. Feature Overview

| Attribute         | Value                                 |
| ----------------- | ------------------------------------- |
| Feature ID        | FR-{nn}                               |
| Feature Name      | {name}                                |
| Test Layer        | UI / API / Both                       |
| Entry Point (UI)  | {URL}                                 |
| Entry Point (API) | {endpoint}                            |
| Actors            | Anonymous / User / Admin              |
| Auth Required     | Yes (User JWT) / Yes (Admin JWT) / No |

## 2. Input Fields & Constraints

| Field/Param | Layer | Type | Constraints | Source |
| ----------- | ----- | ---- | ----------- | ------ |
|             |       |      |             |        |

## 3. Business Rules

- [BR-01] ... (per FR-xx)
- [BR-02] ... (per FR-xx, SEC-xx)

## 4. Expected Outputs

### 4.1 Success Path

- HTTP: {status} + `{response body}`
- UI: {behavior description}
- DB: {state change}

### 4.2 Failure Paths

- Invalid {field}: HTTP {status} + {error description}
- Unauthorized: HTTP 401 (no token) / HTTP 403 (wrong role)

## 5. GUI Requirements Applicable (FR-21~24)

- [GUI-01] ... (per FR-22)
- [GUI-02] ... (per FR-23)

## 6. Security Requirements Applicable (SEC-xx)

- [SEC-02] ...
- [SEC-03] ...

## 7. Notes for Domain Testing

- **Input variables identified:** [comma-separated list]
- **Output variables identified:** [comma-separated list]
- **Boundary candidates:** [fields with numeric/length/date constraints]
- **High-risk areas:** [areas likely to have bugs based on analysis]
- **AI blind spot warnings:** [classes AI might miss]
```

## 5. Quality Checklist (before approving output)

- [ ] All generated content is completely in English
- [ ] All input fields from both UI form and API body are listed, including implicit architectural constraints
- [ ] Auth/role requirements are clearly stated
- [ ] Every constraint has a specific FR/SEC citation
- [ ] GUI requirements (FR-21~24) are correctly filtered by Web vs. Mobile platform
- [ ] Security requirements have been noted
- [ ] "Notes for Domain Testing" section has sufficient guidance for the next step
- [ ] A preview has been shown to the human, and explicit `APPROVE` command was received before saving to disk

## 6. Reusability

This skill applies to **any FR** in the EShop SRS. Just change the FR ID in the input. Can be reused for similar projects by replacing the context files.
