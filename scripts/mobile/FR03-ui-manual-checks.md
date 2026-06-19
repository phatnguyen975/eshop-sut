# FR-03: UI Manual Checks (Mobile)

**Feature:** FR-03 — Forgot Password & Reset Password  
**Platform:** Mobile App (React Native)

## Prerequisites

- SUT Mobile App must be running in simulator or physical device.
- Ensure the backend is reachable from the mobile app (e.g., via correct IP/localhost configuration).

## Check 1: Required Mobile UI Attributes (MANUAL TCs)

**TC ID:** FR03-EP-030, FR03-EP-031

1. Open the app and navigate to the Forgot Password screen (Step 1).
2. Tap the Email input field.
   - **Verify:** The virtual keyboard that appears MUST be email-optimized (shows the `@` key by default, indicating `keyboardType="email-address"` is used).
3. Enter an email and submit to reach Step 2 (Reset Password).
4. Tap the `newPassword` and `confirmNewPassword` fields.
   - **Verify:** The typed characters MUST be obscured (dots/asterisks, indicating `secureTextEntry` is properly applied).
   - **Verify (FR03-EP-030):** Enter `newPassword = "Test@123"`, `confirmNewPassword = "DifferentPass@1"`, all other inputs valid.
   - **Verify (FR03-EP-031):** Enter `newPassword = "Test@123"`, `confirmNewPassword = ""`, all other inputs valid.

## Check 2: Validation Messages (SCRIPT-PARTIAL TCs)

For the following tests, attempt the action on the UI and **verify the exact error message appears on screen** before submission is blocked.

_(Note: the API rejection for these inputs is covered by the automated script `FR03-api-tests.sh`)_

**Step 1 Form Errors:**

- **FR03-EP-002, 003, 004:** Enter an improperly formatted email (missing `@`, missing domain, or missing local part) and submit. **Verify** format validation error is shown.
- **FR03-EP-005:** Enter an email not in DB (`unknown@eshop.com`) and submit. **Verify** "Email does not exist" is shown.
- **FR03-EP-006:** Leave the email field blank and submit. **Verify** required field validation error is shown.

**Step 2 Form Errors (OTP & Passwords):**

- **FR03-EP-014, 015, 016, 017:** Enter an invalid OTP (wrong digits, cross-email OTP, used OTP, or expired OTP) and valid passwords, then submit. **Verify** "Invalid or expired OTP" error message is shown.
- **FR03-EP-018:** Leave OTP blank. **Verify** validation error.
- **FR03-EP-019:** Leave new password blank. **Verify** validation error.
- **FR03-EP-020:** Leave confirm password blank. **Verify** validation error.
- **FR03-EP-022 to 027:** Enter passwords that fail strength rules (length < 8, no uppercase, no lowercase, no digit, no allowed special char, invalid special char). **Verify** password requirement error is shown on screen.
- **FR03-EP-028:** Enter different values in `newPassword` and `confirmNewPassword`. **Verify** "Passwords do not match" error is shown on screen.

## Check 3: Happy Path E2E Flow

**TC ID:** FR03-EP-001

1. Navigate to Forgot Password Step 1.
2. Enter `test@eshop.com` and submit.
   - **Verify:** Moves to Step 2. Required markers (`*`) are visible.
3. Note the OTP received (e.g. via console or notification).
4. Enter the OTP, a valid new password (`Test@123`), and confirm it.
5. Tap Reset.
   - **Verify:** Success message appears and app navigates back to the Login screen.
