# Requirement Analysis — FR-03: Forgot Password & Reset Password (Mobile)

## 1. Feature Overview

| Attribute         | Value                                                      |
| ----------------- | ---------------------------------------------------------- |
| Feature ID        | FR-03                                                      |
| Feature Name      | Forgot Password & Reset Password (Mobile)                  |
| Test Layer        | Both (Mobile UI + API)                                     |
| Entry Point (UI)  | React Native App (Forgot Password Screen)                  |
| Entry Point (API) | `POST /api/forgot-password` and `POST /api/reset-password` |
| Actors            | Anonymous                                                  |
| Auth Required     | No                                                         |

## 2. Input Fields & Constraints

| Field/Param        | Layer    | Type   | Constraints                                                                            | Source        |
| ------------------ | -------- | ------ | -------------------------------------------------------------------------------------- | ------------- |
| email (Step 1)     | UI + API | string | Valid format, must be an already registered email                                      | FR-03         |
| email (Step 2)     | UI + API | string | Valid format, must exactly match the email that requested the OTP                      | FR-03, SEC-07 |
| OTP / resetToken   | UI + API | string | Exactly 6 random digits, not expired, not previously used                              | FR-03, SEC-07 |
| newPassword        | UI + API | string | Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char from `@$!%*?&` | FR-03, FR-01  |
| confirmNewPassword | UI       | string | Must exactly match `newPassword`                                                       | FR-03         |

## 3. Business Rules

- [BR-01] Email must be an existing, registered email in the system to request an OTP (per FR-03).
- [BR-02] New password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character from the set `@$!%*?&` (per FR-03, FR-01).
- [BR-03] Confirm new password must exactly match the new password (per FR-03).
- [BR-04] OTP must be exactly 6 digits, requested by the same email, have not expired, and not used before (per FR-03, SEC-07).
- [BR-05] OTP is strictly bound to the requesting email and cannot be used to reset the password for a different email (per FR-03, SEC-07).

## 4. Expected Outputs

### 4.1 Success Path

- HTTP: `200 OK`
  - `POST /api/forgot-password` returns `{"message": "Mã đặt lại mật khẩu đã được tạo", "resetToken": "..."}`
  - `POST /api/reset-password` returns `{"message": "Password reset successfully"}`
- UI:
  - After requesting OTP: Transitions from Step 1 to Step 2, Step Indicator updates.
  - After resetting password: Redirects to Login screen with a success toast/message.
- DB: User's password hash is updated. The used OTP is invalidated or deleted.

### 4.2 Failure Paths

- Invalid/Unregistered Email: HTTP error (e.g., 400/404) + error message indicating email not found or invalid format.
- Invalid OTP (wrong, expired, reused, cross-email): HTTP error (e.g., 400) + error message indicating invalid OTP.
- Weak Password: HTTP error (e.g., 400) + error message detailing the password requirements.
- Passwords Do Not Match: UI validation error displayed above the submit button.

## 5. GUI Requirements Applicable (FR-21~24)

- [GUI-01] All required fields must have a `*` symbol next to the label (per FR-22).
- [GUI-02] Error messages must appear ABOVE the submit button (per FR-22).
- [GUI-03] The form has 2 steps, so it must display a Step Indicator (e.g., "Bước 1 / 2") (per FR-22, FR-03).
- [GUI-04] Must have a "Quay lại đăng nhập" (Back to login) button (per FR-03).
- [GUI-05] Positive action buttons must use blue color (per FR-21).
- [GUI-06] Password fields must obscure input (e.g., using `secureTextEntry` in React Native) (per FR-22).
- [GUI-07] The Email input field must trigger the email-optimized virtual keyboard (e.g., `keyboardType="email-address"`) (Mobile equivalent of `type="email"` per FR-22).

## 6. Security Requirements Applicable (SEC-xx)

- [SEC-01] Password must not be stored as plaintext in the database.
- [SEC-07] OTP must have sufficient entropy (6 digits), be time-limited, and be invalidated after use. It must be strictly bound to the requesting email.

## 7. Notes for Domain Testing

- **Input variables identified:** email (Step 1), email (Step 2), OTP / resetToken, newPassword, confirmNewPassword
- **Output variables identified:** HTTP status, HTTP response body, UI step transition, UI error message, DB password hash update, DB OTP status
- **Boundary candidates:** newPassword length (8 chars limit), OTP length (exactly 6 digits)
- **High-risk areas:** OTP cross-email attack (using valid OTP from email A to reset email B), OTP reuse attack (resetting twice with same OTP), password validation logic with characters outside the specific special character set.
- **AI blind spot warnings:** Missing cross-email OTP validation class, forgetting to test OTP reuse, missing check for exactly 6 digits OTP, assuming `confirmPassword` is sent to API (it's UI only).
