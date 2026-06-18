# AI Audit Log — FR-03: Forgot Password & Reset Password (Mobile)

| Metric                          | Value            |
| ------------------------------- | ---------------- |
| Total skill sessions logged     | 3                |
| Total AI outputs reviewed       | 3                |
| Items accepted as-is            | All (cumulative) |
| Items modified by student       | 3                |
| Items added manually by student | 0                |
| Items rejected                  | 0                |

## Interaction [1] — requirement-analyzer

| Field             | Value                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Tool**          | Antigravity CLI (Gemini 3.1 Pro backend)                                                                      |
| **Date/Time**     | 2026-06-18 23:32                                                                                              |
| **Feature**       | FR-03 — Forgot Password & Reset Password (Mobile)                                                             |
| **Skill Invoked** | requirement-analyzer                                                                                          |
| **Task**          | Analyze requirement FR-03 and extract inputs, business rules, expected outputs, GUI, and security constraints |

### Prompt Given

```text
/requirement-analyzer Use the requirement-analyzer skill.
Analyze FR-03 from the EShop SRS.
Feature: Forgot Password
FR ID: FR-03
Read the following context files before starting:
- .agents/context/eshop-srs.md (look for FR-03 section)
- .agents/context/eshop-api-spec.md (look for related endpoints)
Follow all steps in the skill (A through G) in order.
Output the result to: qa-artifacts/requirements/FR03-requirement-analysis.md

EDIT: The requirement analysis is excellent, especially the identification of cross-email OTP attacks and UI-only validation for confirmPassword. However, since this feature is tested on the Mobile App (React Native) per FR-20, we need to adapt the web-centric GUI requirements from FR-22 to their mobile equivalents.
Please update section "5. GUI Requirements Applicable (FR-21~24)" to include:
1. Update GUI-06 to explicitly mention Mobile-specific behavior: Password fields must obscure input (e.g., using `secureTextEntry` in React Native) rather than just referring to HTML `type="password"`.
2. Add a new GUI rule: The Email input field must trigger the email-optimized virtual keyboard (e.g., `keyboardType="email-address"`, showing the '@' key by default). This is the mobile translation of FR-22's `type="email"` requirement.
Print the revised preview.
```

### AI Output Summary

- Identified that FR-03 uses both Mobile UI and API (2 endpoints: `forgot-password` and `reset-password`).
- Extracted business rules accurately, including the SEC-07 cross-email and OTP reuse security constraints.
- Generated comprehensive success and failure paths for HTTP, UI, and DB.
- Initially mapped UI constraints to HTML5, then updated to React Native mobile equivalents (`secureTextEntry` and `keyboardType="email-address"`) upon revision.

### Student Review Notes

- Accepted after modification: The AI's initial extraction of business and security logic was excellent. However, it defaulted to Web DOM terminology for UI constraints. I intervened to force the context into React Native mobile standards per FR-20.
- Modified: Instructed the AI to replace `type="password"` and `type="email"` with `secureTextEntry` and `keyboardType="email-address"`.
- Added manually: None.
- Rejected: None.

### Interaction Quality Assessment

| Criterion           | Rating (1–5) | Notes                                                                                         |
| ------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| Completeness        | 5            | Caught all rules including the cross-email attack and UI-only validation for confirmPassword. |
| Accuracy            | 4            | Initial GUI constraints were web-centric, fixed after student correction.                     |
| Guideline adherence | 5            | Followed all steps A through G perfectly.                                                     |
| Items missed        | 0            | Did not miss any input or constraint.                                                         |

## Interaction [2] — domain-identifier

| Field             | Value                                                                        |
| ----------------- | ---------------------------------------------------------------------------- |
| **Tool**          | Antigravity CLI (Gemini 3.1 Pro backend)                                     |
| **Date/Time**     | 2026-06-19 00:29                                                             |
| **Feature**       | FR-03 — Forgot Password & Reset Password (Mobile)                            |
| **Skill Invoked** | domain-identifier                                                            |
| **Task**          | Identify all direct/indirect input and output variables for domain analysis. |

### Prompt Given

```text
/domain-identifier Use the domain-identifier skill.

Feature: FR-03 — Forgot Password

The requirement analysis is complete. Read it at:
qa-artifacts/requirements/FR03-requirement-analysis.md

Also read: .agents/context/eshop-srs.md and .agents/context/eshop-api-spec.md

Identify ALL input variables (direct and hidden/indirect) and ALL output variables
(direct and hidden/indirect) for this feature.

Pay special attention to the Common AI Blind Spots section in the skill.

Append the output as Step 1 to: qa-artifacts/domain-analysis/FR03-domain-analysis.md

EDIT: Excellent extraction of the backend and OTP state variables! However, you missed tracking the Mobile GUI attributes (defined in Step 1) as explicit Output variables. If they aren't tracked here, they will be missed during test case generation.

Please update the "1.2 Output Variables" section. Add the following to "Direct Outputs (Visible)":
- O9 | UI_secure_text_entry | UI | Password fields correctly apply `secureTextEntry`
- O10 | UI_keyboard_type | UI | Email field triggers `keyboardType="email-address"`
- O11 | UI_required_marker | UI | Required fields display the `*` symbol
- O12 | UI_button_color | UI | Positive action buttons are blue
- O13 | UI_back_button | UI | "Quay lại đăng nhập" button is present

Also, update the totals in "1.3 Variable Summary for EP" to reflect these 5 new direct outputs (Total outputs should be 13).

Print the revised preview.
```

### AI Output Summary

- Successfully extracted 5 direct inputs and 4 indirect inputs (DB and time states).
- Initially extracted 8 outputs, missing the explicit GUI attributes.
- Revised to include 5 mobile-specific UI output variables (O9-O13) mapping to `secureTextEntry`, `keyboardType`, required markers, button color, and back button.
- Updated the variable summary with accurate totals: 9 inputs and 13 outputs.

### Student Review Notes

- Accepted after modification: The AI's backend logic extraction was flawless, capturing the nuance of OTP states and cross-email vulnerabilities. However, it suffered a traceability drop by failing to list the mobile GUI constraints (defined in Step 1) as outputs. I overrode this by forcing the inclusion of variables O9 through O13.
- Modified: Instructed the AI to add 5 specific UI output variables (O9-O13) representing the React Native constraints and general GUI requirements (button colors, required markers).
- Added manually: None.
- Rejected: None.

### Interaction Quality Assessment

| Criterion           | Rating (1–5) | Notes                                                            |
| ------------------- | ------------ | ---------------------------------------------------------------- |
| Completeness        | 4            | Missed the mobile GUI constraints as explicit outputs initially. |
| Accuracy            | 5            | The backend logic and OTP states were correct.                   |
| Guideline adherence | 5            | Followed the skill instructions correctly.                       |
| Items missed        | 5            | Missed the 5 UI outputs before the revision prompt.              |

## Interaction [3] — equivalence-partitioning

| Field             | Value                                                                    |
| ----------------- | ------------------------------------------------------------------------ |
| **Tool**          | Antigravity CLI (Gemini 2.5 Pro backend)                                 |
| **Date/Time**     | 2026-06-19 01:35                                                         |
| **Feature**       | FR-03 — Forgot Password & Reset Password (Mobile)                        |
| **Skill Invoked** | equivalence-partitioning                                                 |
| **Task**          | Generate Equivalence Classes and TC Optimization for all input variables |

### Prompt Given

```text
/equivalence-partitioning Use the equivalence-partitioning skill.

Feature: FR-03 — Forgot Password

The variable list is ready at:
qa-artifacts/domain-analysis/FR03-domain-analysis.md (Step 1 section)

Apply all 4 EP Guidelines to EVERY input variable identified.
Then apply the Combination Rule for valid classes and the Isolation Rule for invalid classes.

Important — do NOT miss these for FR-03:
Password strength (FR-01, FR-03) — must have 6 invalid classes:
1. Length < 8
2. No uppercase
3. No lowercase
4. No digit
5. No special character from allowed set `@$!%*?&`
6. Special character NOT in allowed set (e.g., `#`, `^`) ← AI commonly misses this

OTP (FR-03) — 4 OTP classes:
1. Correct OTP for correct email → success
2. Wrong OTP digits → fail
3. OTP from a different email (cross-email attack) → fail ← AI commonly misses this
4. OTP already used (reuse attempt) → fail ← AI commonly misses this

For FR-03 add:
- OTP from a different email (cross-email attack) as a separate invalid class
- OTP already used on a previous reset attempt as a separate invalid class

Append the output as Step 2 and Step 3 to:
qa-artifacts/domain-analysis/FR03-domain-analysis.md

EDIT: You need to review Step 2+3 in FR01-domain-analysis.md to check for more EC need for email and password in FR03. Then update and print the preview again for me. Note that the order of the EC and TC must be update for consistency.
```

### AI Output Summary

- Generated 34 equivalence classes and 30 optimized test cases.
- Successfully implemented isolation rule for `newPassword` and defect masking prevention using the mirror value strategy for `confirmNewPassword`.
- Added OTP security states as individual ECs per prompt instruction (e.g., cross-email attack, reuse attempt, expiration).
- Successfully synchronized class depths for email and password by checking FR-01 domain analysis, adjusting B1 missing payload rules accurately for API variables but erroneously adding it to the UI-only confirmNewPassword header initially.

### Student Review Notes

- Accepted as-is: The AI demonstrated Senior-level QA logic, particularly with the Defect Masking prevention strategy for the password fields. The coverage of the OTP security states (SEC-07) was strictly enforced via individual ECs.
- Modified: Instructed the AI to match the ECs with FR-01's depth for password and email fields. Subsequently requested a correction to remove a B1 (missing in API body) reference from the `confirmNewPassword` header, which is UI-only.
- Added manually: None.
- Rejected: None.

### Interaction Quality Assessment

| Criterion           | Rating (1–5) | Notes                                                                 |
| ------------------- | ------------ | --------------------------------------------------------------------- |
| Completeness        | 5            | Generated all requested ECs including OTP and password specific ones. |
| Accuracy            | 4            | Erroneous +B1 header label on confirmPassword before correction.      |
| Guideline adherence | 5            | Isolation and Combination Rules rigorously applied.                   |
| Items missed        | 0            | Did not miss any requested classes.                                   |
