# Boundary Value Analysis — FR-03: Forgot Password & Reset Password (Mobile)

## Boundary Variables Identified

| Variable             | Data Type               | LB  | UB             | Increment | Note                                    |
| -------------------- | ----------------------- | --- | -------------- | --------- | --------------------------------------- |
| `newPassword` length | integer (string length) | 8   | unspecified    | 1 char    | Per FR-01/FR-03 password strength rules |
| `otp_code` length    | integer (string length) | 6   | 6              | 1 char    | Exact length required (6 digits)        |
| `email_step1` length | integer (string length) | N/A | 255 (implicit) | 1 char    | Typical DB VARCHAR limit constraint     |

## BVA Table 1: `newPassword` (string length)

**Constraint:** length >= 8 characters
**LB = 8, UB = unspecified**

| TC ID        | BVA Point      | Test Value                         | Length | Valid/Invalid    | Expected Result            |
| ------------ | -------------- | ---------------------------------- | ------ | ---------------- | -------------------------- |
| FR03-BVA-001 | -α (empty)     | `""`                               | 0      | Invalid          | Reject: missing password   |
| FR03-BVA-002 | LB-1           | `"Test@12"`                        | 7      | Invalid          | Reject: password too short |
| FR03-BVA-003 | LB (exact)     | `"Test@123"`                       | 8      | Valid            | Accept (Success)           |
| FR03-BVA-004 | LB+1           | `"Test@1234"`                      | 9      | Valid            | Accept (Success)           |
| FR03-BVA-005 | Nominal        | `"TestPassword12!"`                | 15     | Valid            | Accept (Success)           |
| FR03-BVA-006 | +α (very long) | `"T" + "e".repeat(290) + "st@123"` | 300    | Invalid (likely) | Reject or system error     |

_Note on Isolation Rule:_ For all points, `confirmNewPassword` must EXACTLY mirror the test value for `newPassword`. This prevents defect masking where the system might reject the request due to a "passwords do not match" error rather than correctly testing the password length rule.

## BVA Table 2: `otp_code` (string length)

**Constraint:** length exactly 6 digits
**LB = 6, UB = 6**

| TC ID        | BVA Point      | Test Value  | Length | Valid/Invalid | Expected Result                   |
| ------------ | -------------- | ----------- | ------ | ------------- | --------------------------------- |
| FR03-BVA-007 | -α (empty)     | `""`        | 0      | Invalid       | Reject: missing OTP               |
| FR03-BVA-008 | LB-1           | `"12345"`   | 5      | Invalid       | Reject: invalid OTP format/length |
| FR03-BVA-009 | LB/UB (exact)  | `"123456"`  | 6      | Valid         | Accept (OTP verified)             |
| FR03-BVA-010 | UB+1           | `"1234567"` | 7      | Invalid       | Reject: invalid OTP format/length |
| FR03-BVA-011 | +α (very long) | `{"1"×100}` | 100    | Invalid       | Reject or system error            |

## BVA Table 3: `email_step1` (string length)

**Constraint:** length bounded by typical DB VARCHAR limit
**LB = implicit, UB = 255 (implicit)**

| TC ID        | BVA Point      | Test Value                | Length | Valid/Invalid    | Expected Result        |
| ------------ | -------------- | ------------------------- | ------ | ---------------- | ---------------------- |
| FR03-BVA-012 | UB-1           | `{"a"×245} + "@test.com"` | 254    | Valid            | Accept (OTP requested) |
| FR03-BVA-013 | UB (exact)     | `{"a"×246} + "@test.com"` | 255    | Valid            | Accept (OTP requested) |
| FR03-BVA-014 | UB+1           | `{"a"×247} + "@test.com"` | 256    | Invalid (likely) | Reject: email too long |
| FR03-BVA-015 | +α (very long) | `{"a"×291} + "@test.com"` | 300    | Invalid (likely) | Reject or system error |

_Note:_ Testing `email_step1` length is sufficient to cover DB boundaries. `email_step2` uses identical backend logic for the same underlying DB column constraint.

## BVA Summary

| Variable             | Total BVA Points | Valid Points | Invalid Points | BVA TCs Generated |
| -------------------- | ---------------- | ------------ | -------------- | ----------------- |
| `newPassword` length | 6                | 3            | 3              | 6                 |
| `otp_code` length    | 5                | 1            | 4              | 5                 |
| `email_step1` length | 4                | 2            | 2              | 4                 |
| **Total**            | **15**           | **6**        | **9**          | **15**            |
