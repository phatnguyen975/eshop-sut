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
