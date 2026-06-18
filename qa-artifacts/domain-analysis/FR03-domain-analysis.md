# Domain Analysis — FR-03: Forgot Password & Reset Password (Mobile)

## Step 1: Input & Output Variable Identification

### 1.1 Input Variables

#### Direct Inputs (UI Form / API Body)

| #   | Variable             | Source             | Type   | Description                         |
| --- | -------------------- | ------------------ | ------ | ----------------------------------- |
| I1  | `email_step1`        | UI form + API body | string | Email entered to request OTP        |
| I2  | `email_step2`        | UI form + API body | string | Email entered during password reset |
| I3  | `otp_code`           | UI form + API body | string | 6-digit reset token/OTP             |
| I4  | `newPassword`        | UI form + API body | string | The new password                    |
| I5  | `confirmNewPassword` | UI form only       | string | Password confirmation               |

#### Indirect Inputs (Hidden / System State)

| #   | Variable                 | Source      | Type    | Description                                            |
| --- | ------------------------ | ----------- | ------- | ------------------------------------------------------ |
| I6  | `email_registered_state` | DB state    | boolean | Whether the email exists in the database               |
| I7  | `otp_expiry_state`       | System time | boolean | Whether the OTP is still within its validity window    |
| I8  | `otp_used_state`         | DB state    | boolean | Whether the OTP has already been used                  |
| I9  | `otp_bound_email`        | DB state    | string  | The email address the OTP was originally generated for |

### 1.2 Output Variables

#### Direct Outputs (Visible)

| #   | Variable             | Channel | Description                                         |
| --- | -------------------- | ------- | --------------------------------------------------- |
| O1  | HTTP status code     | API     | 200 OK or 4xx/5xx Error                             |
| O2  | Response body        | API     | Success message or error details                    |
| O3  | UI step transition   | UI      | Move from Step 1 to Step 2                          |
| O4  | UI redirect          | UI      | Navigate to Login page after successful reset       |
| O5  | UI error message     | UI      | Validation errors above submit button               |
| O6  | UI step indicator    | UI      | Update from "Bước 1 / 2" to "Bước 2 / 2"            |
| O9  | UI_secure_text_entry | UI      | Password fields correctly apply `secureTextEntry`   |
| O10 | UI_keyboard_type     | UI      | Email field triggers `keyboardType="email-address"` |
| O11 | UI_required_marker   | UI      | Required fields display the `*` symbol              |
| O12 | UI_button_color      | UI      | Positive action buttons are blue                    |
| O13 | UI_back_button       | UI      | "Quay lại đăng nhập" button is present              |

#### Indirect Outputs (Hidden / State Changes)

| #   | Variable         | Channel | Description                                        |
| --- | ---------------- | ------- | -------------------------------------------------- |
| O7  | DB password hash | State   | User's password record updated in database         |
| O8  | DB OTP state     | State   | OTP is invalidated or deleted after successful use |

### 1.3 Variable Summary for EP

- **Total inputs identified:** 9 (5 direct + 4 indirect)
- **Total outputs identified:** 13 (11 direct + 2 indirect)
- **Variables requiring EP:** `email_step1`, `email_step2`, `otp_code`, `newPassword`, `confirmNewPassword`, `email_registered_state`, `otp_expiry_state`, `otp_used_state`, `otp_bound_email`
- **Boundary candidates:** `newPassword` (length min 8 characters), `otp_code` (length exactly 6 digits)

## Step 2: Equivalence Classes

### Variable: `email_step1` & `email_registered_state` — Guideline 3 × 2 (Must-Be: format & exists in DB) + Guideline 4 (sub-split) + B1

| Class ID | Type    | Description                                    | Representative Value           |
| -------- | ------- | ---------------------------------------------- | ------------------------------ |
| EC01     | Valid   | Valid format AND exists in DB                  | `"test@eshop.com"`             |
| EC02     | Invalid | Invalid format — missing `@` symbol            | `"invalidemail"`               |
| EC03     | Invalid | Invalid format — missing domain after `@`      | `"user@"`                      |
| EC04     | Invalid | Invalid format — missing local part before `@` | `"@domain.com"`                |
| EC05     | Invalid | Valid format, but does NOT exist in DB         | `"unknown@eshop.com"`          |
| EC06     | Invalid | Empty string (B1)                              | `""`                           |
| EC07     | Invalid | Null / missing in API body (B1)                | _(omit `email` key from JSON)_ |

### Variable: `email_step2` — Guideline 3 × 2 (Must-Be: format & match step 1) + Guideline 4 (sub-split) + B1

| Class ID | Type    | Description                                    | Representative Value           |
| -------- | ------- | ---------------------------------------------- | ------------------------------ |
| EC08     | Valid   | Valid format AND matches `email_step1`         | `"test@eshop.com"`             |
| EC09     | Invalid | Valid format, but does NOT match `email_step1` | `"different@eshop.com"`        |
| EC10     | Invalid | Invalid format — missing `@` symbol            | `"invalidemail"`               |
| EC11     | Invalid | Invalid format — missing domain after `@`      | `"user@"`                      |
| EC12     | Invalid | Invalid format — missing local part before `@` | `"@domain.com"`                |
| EC13     | Invalid | Empty string (B1)                              | `""`                           |
| EC14     | Invalid | Null / missing in API body (B1)                | _(omit `email` key from JSON)_ |

### Variable: `otp_code` & Context — Guideline 1 (Range) + Guideline 3 (Must-Be) + B1

| Class ID | Type    | Description                                          | Representative Value                  |
| -------- | ------- | ---------------------------------------------------- | ------------------------------------- |
| EC15     | Valid   | Correct OTP digits for correct email, active, unused | `"123456"`                            |
| EC16     | Invalid | Wrong OTP digits                                     | `"999999"`                            |
| EC17     | Invalid | OTP from a different email (cross-email attack)      | OTP generated for `"admin@eshop.com"` |
| EC18     | Invalid | OTP already used (reuse attempt)                     | `"123456"` (already used)             |
| EC19     | Invalid | OTP expired                                          | `"123456"` (expired 1 min ago)        |
| EC20     | Invalid | OTP length < 6 digits                                | `"12345"`                             |
| EC21     | Invalid | OTP length > 6 digits                                | `"1234567"`                           |
| EC22     | Invalid | Empty OTP string (B1)                                | `""`                                  |
| EC23     | Invalid | Null / missing in API body (B1)                      | _(omit `resetToken` key)_             |

### Variable: `newPassword` — Guideline 1 (Range: length ≥ 8) + Guideline 3 × 4 (char types) + Guideline 4 (split special char) + B1

| Class ID | Type    | Description                                                                  | Representative Value          |
| -------- | ------- | ---------------------------------------------------------------------------- | ----------------------------- |
| EC24     | Valid   | Length ≥ 8; has uppercase, lowercase, digit, and special char from `@$!%*?&` | `"Test@123"`                  |
| EC25     | Invalid | Length < 8 (G1)                                                              | `"Te@1"` (4 chars)            |
| EC26     | Invalid | Missing uppercase letter (G3)                                                | `"test@123"`                  |
| EC27     | Invalid | Missing lowercase letter (G3)                                                | `"TEST@123"`                  |
| EC28     | Invalid | Missing digit (G3)                                                           | `"Test@abc"`                  |
| EC29     | Invalid | Missing any special character (G3)                                           | `"Test1234"`                  |
| EC30     | Invalid | Special character present but OUTSIDE allowed set `@$!%*?&` (G4)             | `"Test#123"` (`#` not in set) |
| EC31     | Invalid | Empty string (B1)                                                            | `""`                          |
| EC32     | Invalid | Null / missing in API body (B1)                                              | _(omit `newPassword` key)_    |

### Variable: `confirmNewPassword` — Guideline 3 (Must-Be: match `newPassword`) + B1 — UI channel only

| Class ID | Type    | Description                                   | Representative Value              |
| -------- | ------- | --------------------------------------------- | --------------------------------- |
| EC33     | Valid   | Exactly matches `newPassword` field           | Same value as EC23 (`"Test@123"`) |
| EC34     | Invalid | Does not match `newPassword` field (mismatch) | `"DifferentPass@1"`               |
| EC35     | Invalid | Empty confirm password (B1)                   | `""`                              |

## Step 3: Test Case Optimization

### 3.1 Valid Classes Coverage (Combination Rule)

| TC ID       | Valid Classes Covered        | Test Data Summary                                              | Channel  |
| ----------- | ---------------------------- | -------------------------------------------------------------- | -------- |
| FR03-EP-001 | EC01, EC08, EC15, EC24, EC33 | Step 1: Valid email. Step 2: Valid OTP, New Pw, and Confirm Pw | UI + API |

### 3.2 Invalid Classes Coverage (Isolation Rule)

_Note on Isolation Rule for `newPassword` constraints: To prevent defect masking (e.g., getting a "passwords do not match" error instead of a "weak password" error), `confirmNewPassword` must always exactly mirror the invalid `newPassword` value._

| TC ID       | Invalid Class Tested                                 | Other Inputs                                                | Channel  |
| ----------- | ---------------------------------------------------- | ----------------------------------------------------------- | -------- |
| FR03-EP-002 | EC02 (Email Step 1 invalid: no `@`)                  | N/A (Fails at Step 1)                                       | UI + API |
| FR03-EP-003 | EC03 (Email Step 1 invalid: no domain)               | N/A (Fails at Step 1)                                       | UI + API |
| FR03-EP-004 | EC04 (Email Step 1 invalid: no local part)           | N/A (Fails at Step 1)                                       | UI + API |
| FR03-EP-005 | EC05 (Email Step 1 does not exist in DB)             | N/A (Fails at Step 1)                                       | UI + API |
| FR03-EP-006 | EC06 (Email Step 1 empty)                            | N/A (Fails at Step 1)                                       | UI + API |
| FR03-EP-007 | EC07 (Email Step 1 missing in API body)              | N/A (Fails at Step 1)                                       | API      |
| FR03-EP-008 | EC09 (Email Step 2 mismatch)                         | otp = valid, newPw = valid, confirmPw = valid               | API      |
| FR03-EP-009 | EC10 (Email Step 2 invalid: no `@`)                  | otp = valid, newPw = valid, confirmPw = valid               | UI + API |
| FR03-EP-010 | EC11 (Email Step 2 invalid: no domain)               | otp = valid, newPw = valid, confirmPw = valid               | UI + API |
| FR03-EP-011 | EC12 (Email Step 2 invalid: no local part)           | otp = valid, newPw = valid, confirmPw = valid               | UI + API |
| FR03-EP-012 | EC13 (Email Step 2 empty)                            | otp = valid, newPw = valid, confirmPw = valid               | UI + API |
| FR03-EP-013 | EC14 (Email Step 2 missing in API body)              | otp = valid, newPw = valid, confirmPw = valid               | API      |
| FR03-EP-014 | EC16 (Wrong OTP digits)                              | email2 = valid, newPw = valid, confirmPw = valid            | UI + API |
| FR03-EP-015 | EC17 (OTP from different email - cross-email attack) | email2 = valid, newPw = valid, confirmPw = valid            | UI + API |
| FR03-EP-016 | EC18 (OTP already used - reuse attempt)              | email2 = valid, newPw = valid, confirmPw = valid            | UI + API |
| FR03-EP-017 | EC19 (OTP expired)                                   | email2 = valid, newPw = valid, confirmPw = valid            | UI + API |
| FR03-EP-018 | EC20 (OTP length < 6)                                | email2 = valid, newPw = valid, confirmPw = valid            | UI + API |
| FR03-EP-019 | EC21 (OTP length > 6)                                | email2 = valid, newPw = valid, confirmPw = valid            | UI + API |
| FR03-EP-020 | EC22 (OTP empty)                                     | email2 = valid, newPw = valid, confirmPw = valid            | UI + API |
| FR03-EP-021 | EC23 (OTP missing in API body)                       | email2 = valid, newPw = valid, confirmPw = valid            | API      |
| FR03-EP-022 | EC25 (newPassword length < 8)                        | email2 = valid, otp = valid, confirmPw = mirrors invalid Pw | UI + API |
| FR03-EP-023 | EC26 (newPassword missing uppercase)                 | email2 = valid, otp = valid, confirmPw = mirrors invalid Pw | UI + API |
| FR03-EP-024 | EC27 (newPassword missing lowercase)                 | email2 = valid, otp = valid, confirmPw = mirrors invalid Pw | UI + API |
| FR03-EP-025 | EC28 (newPassword missing digit)                     | email2 = valid, otp = valid, confirmPw = mirrors invalid Pw | UI + API |
| FR03-EP-026 | EC29 (newPassword missing special char)              | email2 = valid, otp = valid, confirmPw = mirrors invalid Pw | UI + API |
| FR03-EP-027 | EC30 (newPassword special char OUTSIDE allowed set)  | email2 = valid, otp = valid, confirmPw = mirrors invalid Pw | UI + API |
| FR03-EP-028 | EC31 (newPassword empty)                             | email2 = valid, otp = valid, confirmPw = mirrors invalid Pw | UI + API |
| FR03-EP-029 | EC32 (newPassword missing in API body)               | email2 = valid, otp = valid _(no confirm in API)_           | API      |
| FR03-EP-030 | EC34 (confirmNewPassword mismatch)                   | email2 = valid, otp = valid, newPw = valid                  | UI       |
| FR03-EP-031 | EC35 (confirmNewPassword empty)                      | email2 = valid, otp = valid, newPw = valid                  | UI       |

### 3.3 EC Coverage Summary

| Total ECs | Valid ECs | Invalid ECs | TCs for Valid | TCs for Invalid | Total TCs |
| --------- | --------- | ----------- | ------------- | --------------- | --------- |
| 35        | 5         | 30          | 1             | 30              | 31        |
