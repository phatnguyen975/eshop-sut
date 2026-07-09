# Worked Example — Bank Fund Transfer Feature

> This example demonstrates a complete application of the `scenario-test-design` skill from start to finish, following all 6 steps of the Design Process.  
> **Input provided:** Business Requirements (BR) and Functional Requirements (FR) for a bank fund transfer feature.

## Requirements

### Business Requirements

- **BR-01:** A user may only initiate a transfer from an account they own.
- **BR-02:** The transfer amount must be greater than zero and must not exceed the current account balance.
- **BR-03:** The maximum transfer limit is 500,000,000 VND per transaction and 1,000,000,000 VND per calendar day.
- **BR-04:** Every transaction must be authenticated with a one-time password (OTP) delivered via SMS to the user's registered mobile number.
- **BR-05:** An OTP is valid for 5 minutes. The transaction is automatically cancelled after 3 consecutive incorrect OTP entries.
- **BR-06:** A user may not initiate a transfer from an account that is currently suspended.
- **BR-07:** Every completed transaction must be recorded in the transaction history and a confirmation email must be sent to the account holder.

### Functional Requirements

- **FR-01:** The system displays the list of accounts owned by the authenticated user for source account selection.
- **FR-02:** The system supports entering a destination account number manually or selecting one from the user's saved payee list.
- **FR-03:** The system validates the destination account number and displays the account holder's name before the user proceeds to confirmation.
- **FR-04:** The system delivers an OTP via SMS within 60 seconds of the user submitting the transaction confirmation.
- **FR-05:** The system debits the source account and credits the destination account immediately upon successful OTP verification.
- **FR-06:** The system records a transaction history entry containing: timestamp, amount, source account, destination account, and status.
- **FR-07:** The system sends a confirmation email within 2 minutes of a successful transaction.

# Scenario Testing Design — Bank Fund Transfer

> **Date:** 2026-07-09  
> **Input:** BR-01 through BR-07, FR-01 through FR-07

## 1. Requirement Summary

| ID    | Type                   | Description                                                                         |
| ----- | ---------------------- | ----------------------------------------------------------------------------------- |
| BR-01 | Business Rule          | Transfers may only be initiated from an account owned by the authenticated user     |
| BR-02 | Business Rule          | Transfer amount must be greater than zero and must not exceed the current balance   |
| BR-03 | Business Rule          | Per-transaction limit: 500,000,000 VND; per-day limit: 1,000,000,000 VND            |
| BR-04 | Business Rule          | OTP authentication via SMS is mandatory for every transaction                       |
| BR-05 | Business Rule          | OTP expires after 5 minutes; transaction is cancelled after 3 incorrect entries     |
| BR-06 | Business Rule          | Transfers are not permitted from a suspended account                                |
| BR-07 | Business Rule          | Completed transactions must be recorded in history and trigger a confirmation email |
| FR-01 | Functional Requirement | Display the authenticated user's accounts for source account selection              |
| FR-02 | Functional Requirement | Accept destination account input manually or via saved payee selection              |
| FR-03 | Functional Requirement | Validate destination account and display the account holder's name                  |
| FR-04 | Functional Requirement | Deliver OTP via SMS within 60 seconds of transaction confirmation                   |
| FR-05 | Functional Requirement | Debit and credit accounts immediately upon successful OTP verification              |
| FR-06 | Functional Requirement | Record transaction history with timestamp, amount, accounts, and status             |
| FR-07 | Functional Requirement | Send confirmation email within 2 minutes of transaction completion                  |

### Assumptions & Open Questions

| ID     | Type          | Description                                                                                                                                                                        |
| ------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ASM-01 | Assumption    | Same-bank and inter-bank transfers share the same flow; no BR distinguishes between them                                                                                           |
| ASM-02 | Assumption    | The daily limit resets at 00:00 each calendar day                                                                                                                                  |
| OQ-01  | Open Question | When an OTP expires while the user is still on the OTP entry screen, what state does the transaction roll back to? Requires confirmation from the BA before SC-10 can be finalized |
| OQ-02  | Open Question | If the email service is unavailable after a transaction completes, is the transaction still considered successful? Requires confirmation from the PO before SC-15 can be finalized |

## 2. Actor & Context Map

| Actor           | Type            | Role / Permissions                                     | Notes                                                                                   |
| --------------- | --------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Customer        | Human           | Authenticated — may only operate on their own accounts | Has an active session and a registered OTP delivery number                              |
| Admin           | Human           | Privileged — read access to all accounts               | Does not perform transactions on behalf of customers                                    |
| SMS Gateway     | External System | Delivers OTP messages                                  | Subject to delivery delays and service failures                                         |
| Email Service   | External System | Delivers confirmation emails                           | May fail after a transaction has already completed                                      |
| Disfavored User | Human           | Attacker / Abuser                                      | Attempts to bypass OTP, spoof the destination account, or replay completed transactions |

**System Boundary:**

- **In scope:** The complete transfer flow from initiation through confirmation
- **Out of scope:** Internal processing of the SMS Gateway and Email Service; core banking settlement layer

**Key Object States — Account:**

- `Active` → eligible as a source or destination account
- `Suspended` → blocked from use as a source account (BR-06)
- `Closed` → blocked from use as a source or destination account

**Key Object States — Transaction:**

- `Initiated` → `OTP Pending` → `Completed` / `Failed` / `Cancelled`

## 3. Scenario Overview Table

> **Generation techniques applied:** T2 (Actor Analysis), T3 (Disfavored Users), T4 (System Events), T7 (Specific Transactions), T16 (Sequence Analysis)

| ID    | Scenario Name                                                                             | Type              | Priority | Actor           | Traced BR/FR                                                                |
| ----- | ----------------------------------------------------------------------------------------- | ----------------- | -------- | --------------- | --------------------------------------------------------------------------- |
| SC-01 | Customer completes a transfer to an account at the same bank                              | Happy Path        | P1       | Customer        | BR-01, BR-02, BR-04, BR-07, FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07 |
| SC-02 | Customer completes a transfer using a saved payee                                         | Happy Path        | P1       | Customer        | FR-02, BR-04, BR-07, FR-05, FR-06, FR-07                                    |
| SC-03 | System rejects a transfer when the amount exceeds the source account balance              | Negative          | P1       | Customer        | BR-02                                                                       |
| SC-04 | System rejects a transfer when the amount exceeds the per-transaction limit               | Negative          | P1       | Customer        | BR-03                                                                       |
| SC-05 | System rejects a transfer when the daily cumulative limit has been reached                | Negative          | P1       | Customer        | BR-03                                                                       |
| SC-06 | System rejects a transfer when the entered amount is zero or negative                     | Negative          | P2       | Customer        | BR-02                                                                       |
| SC-07 | System blocks a transfer initiated from a suspended account                               | Negative          | P1       | Customer        | BR-06                                                                       |
| SC-08 | System returns an error when the destination account number does not exist                | Negative          | P2       | Customer        | FR-03                                                                       |
| SC-09 | System cancels the transaction after 3 consecutive incorrect OTP entries                  | Negative          | P1       | Customer        | BR-05                                                                       |
| SC-10 | System rejects an OTP submitted after the 5-minute validity window has elapsed            | Edge Case         | P1       | Customer        | BR-05                                                                       |
| SC-11 | Customer successfully transfers an amount equal to the entire remaining balance           | Edge Case         | P2       | Customer        | BR-02, FR-05                                                                |
| SC-12 | Customer successfully transfers exactly the per-transaction maximum of 500,000,000 VND    | Boundary          | P2       | Customer        | BR-03                                                                       |
| SC-13 | System rejects a transfer of 500,000,001 VND — one unit above the per-transaction limit   | Boundary          | P2       | Customer        | BR-03                                                                       |
| SC-14 | System handles SMS Gateway failure gracefully when OTP cannot be delivered                | Error Recovery    | P1       | Customer        | FR-04, BR-04                                                                |
| SC-15 | Transaction is recorded successfully despite email service being unavailable              | Error Recovery    | P2       | Customer        | BR-07, FR-07                                                                |
| SC-16 | System rejects a transfer where the destination account is the same as the source account | Security & Misuse | P2       | Disfavored User | BR-01                                                                       |
| SC-17 | System rejects a replay of a previously completed transaction request                     | Security & Misuse | P1       | Disfavored User | BR-04                                                                       |
| SC-18 | System sanitizes and rejects malicious or non-numeric input in the amount field           | Security & Misuse | P2       | Disfavored User | BR-02                                                                       |

**Summary:** 18 total scenarios — 2 Happy Path, 6 Negative, 2 Edge Case, 2 Boundary, 2 Error Recovery, 3 Security & Misuse

## 4. Scenario Detail Cards

### SC-01: Customer completes a transfer to an account at the same bank

| Field            | Value                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| **ID**           | SC-01                                                                       |
| **Name**         | Customer completes a transfer to an account at the same bank                |
| **Type**         | Happy Path                                                                  |
| **Priority**     | P1                                                                          |
| **Actor**        | Customer                                                                    |
| **Traced BR/FR** | BR-01, BR-02, BR-04, BR-07, FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07 |

**Preconditions:**

- Customer "alice@test.com" is authenticated with the Customer role
- Source account VCB-001 (balance: 10,000,000 VND, status: Active) is owned by this customer
- Destination account VCB-002 (status: Active) is owned by a different user, account holder name: "Bob Tran"
- Mobile number +84-912-345-678 is registered as the OTP delivery number for VCB-001
- Daily transfer limit consumed today: 0 VND
- SMS Gateway and Email Service are both operational

**Steps:**

1. Customer navigates to the Fund Transfer feature
2. The system displays the customer's account list — customer selects VCB-001 (balance: 10,000,000 VND) as the source account
3. Customer enters destination account number: VCB-002
4. The system validates VCB-002 and displays the account holder name: "Bob Tran"
5. Customer enters transfer amount: 5,000,000 VND and memo: "Dinner repayment"
6. Customer submits the transaction confirmation
7. The system sends an OTP to +84-912-345-678 and presents the OTP entry screen
8. Customer enters the valid OTP received via SMS
9. The system processes the transaction

**Expected Result:**

- Screen displays "Transfer Successful" with a transaction reference number in the format TXN-xxxxxxxxxx
- VCB-001 balance decreases by exactly 5,000,000 VND (from 10,000,000 VND to 5,000,000 VND)
- VCB-002 balance increases by exactly 5,000,000 VND
- A new transaction history record exists for VCB-001 with: amount = 5,000,000 VND, source = VCB-001, destination = VCB-002, memo = "Dinner repayment", status = Completed, timestamp = time of processing
- A confirmation email is delivered to alice@test.com within 2 minutes
- The used OTP is invalidated and cannot be reused

**Test Data (suggested):**

- Source account: VCB-001, balance 10,000,000 VND, status Active
- Destination account: VCB-002, status Active
- Transfer amount: 5,000,000 VND

### SC-02: Customer completes a transfer using a saved payee

| Field            | Value                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **ID**           | SC-02                                                                                     |
| **Name**         | Customer completes a transfer to a destination account selected from the saved payee list |
| **Type**         | Happy Path                                                                                |
| **Priority**     | P1                                                                                        |
| **Actor**        | Customer                                                                                  |
| **Traced BR/FR** | FR-02, BR-04, BR-07, FR-05, FR-06, FR-07                                                  |

**Preconditions:**

- Customer is authenticated
- Source account VCB-001 (balance: 2,000,000 VND, status: Active) is owned by this customer
- Saved payee "Charlie Nguyen" with account VCB-003 exists in the customer's payee list
- Remaining daily limit is sufficient for the intended transfer amount

**Steps:**

1. Customer navigates to Fund Transfer and selects VCB-001 as the source account
2. Customer selects "Choose from saved payees" instead of entering a number manually
3. Customer selects "Charlie Nguyen" from the saved payee list
4. The system populates the destination field with VCB-003 and displays the name "Charlie Nguyen"
5. Customer enters transfer amount: 1,000,000 VND
6. Customer confirms the transaction and enters a valid OTP

**Expected Result:**

- Transaction completes successfully
- VCB-001 balance decreases by exactly 1,000,000 VND
- Transaction history records VCB-003 as the destination account

### SC-03: System rejects a transfer when the amount exceeds the source account balance

| Field            | Value                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| **ID**           | SC-03                                                                                               |
| **Name**         | System rejects a transfer when the entered amount exceeds the current balance of the source account |
| **Type**         | Negative                                                                                            |
| **Priority**     | P1                                                                                                  |
| **Actor**        | Customer                                                                                            |
| **Traced BR/FR** | BR-02                                                                                               |

**Preconditions:**

- Customer is authenticated
- Source account VCB-001 has a balance of 3,000,000 VND and status Active

**Steps:**

1. Customer navigates to Fund Transfer and selects VCB-001 as the source account
2. Customer enters a valid destination account number
3. Customer enters transfer amount: 5,000,000 VND (exceeds the balance of 3,000,000 VND)
4. Customer submits the transaction confirmation

**Expected Result:**

- System displays an error: "Insufficient funds. The transfer amount exceeds your available balance."
- The system does not send an OTP
- VCB-001 balance remains unchanged at 3,000,000 VND
- No transaction history record is created

### SC-04: System rejects a transfer when the amount exceeds the per-transaction limit

| Field            | Value                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| **ID**           | SC-04                                                                                                  |
| **Name**         | System rejects a transfer of 600,000,000 VND that exceeds the per-transaction limit of 500,000,000 VND |
| **Type**         | Negative                                                                                               |
| **Priority**     | P1                                                                                                     |
| **Actor**        | Customer                                                                                               |
| **Traced BR/FR** | BR-03                                                                                                  |

**Preconditions:**

- Source account VCB-001 has a balance of 1,000,000,000 VND and status Active
- Daily limit consumed today: 0 VND

**Steps:**

1. Customer selects VCB-001 as the source account and enters a valid destination account number
2. Customer enters transfer amount: 600,000,000 VND (exceeds the 500,000,000 VND per-transaction limit)
3. Customer submits the transaction confirmation

**Expected Result:**

- System displays an error: "Transfer amount exceeds the maximum per-transaction limit of 500,000,000 VND."
- The system does not send an OTP
- No funds are debited

### SC-05: System rejects a transfer when the daily cumulative limit has been reached

| Field            | Value                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **ID**           | SC-05                                                                                                       |
| **Name**         | System rejects a transfer when adding it would cause the day's cumulative total to exceed 1,000,000,000 VND |
| **Type**         | Negative                                                                                                    |
| **Priority**     | P1                                                                                                          |
| **Actor**        | Customer                                                                                                    |
| **Traced BR/FR** | BR-03                                                                                                       |

**Preconditions:**

- Source account VCB-001 has a balance of 2,000,000,000 VND and status Active
- Daily limit consumed today: 900,000,000 VND (remaining: 100,000,000 VND)

**Steps:**

1. Customer enters transfer amount: 200,000,000 VND (valid per transaction, but would cause the daily total to exceed 1,000,000,000 VND)
2. Customer submits the transaction confirmation

**Expected Result:**

- System displays an error: "Daily transfer limit reached. Remaining limit today: 100,000,000 VND."
- The system does not send an OTP
- No funds are debited

### SC-06: System rejects a transfer when the entered amount is zero or negative

| Field            | Value                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| **ID**           | SC-06                                                                                              |
| **Name**         | System rejects the transaction when the customer enters a transfer amount that is zero or negative |
| **Type**         | Negative                                                                                           |
| **Priority**     | P2                                                                                                 |
| **Actor**        | Customer                                                                                           |
| **Traced BR/FR** | BR-02                                                                                              |

**Preconditions:**

- Source account VCB-001 is Active with any positive balance

**Steps:**

1. Customer enters a valid destination account number
2. Customer enters transfer amount: 0 VND (variant a) or -100,000 VND (variant b)
3. Customer attempts to submit the transaction confirmation

**Expected Result:**

- System displays an inline validation error immediately: "Transfer amount must be greater than zero."
- The confirmation button is disabled or the form cannot be submitted
- The system does not send an OTP

**Test Data:** Test with values 0; -1; -1,000,000

### SC-07: System blocks a transfer initiated from a suspended account

| Field            | Value                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ |
| **ID**           | SC-07                                                                                      |
| **Name**         | System prevents a customer from initiating a transfer when the source account is suspended |
| **Type**         | Negative                                                                                   |
| **Priority**     | P1                                                                                         |
| **Actor**        | Customer                                                                                   |
| **Traced BR/FR** | BR-06                                                                                      |

**Preconditions:**

- Source account VCB-001 has status: **Suspended**

**Steps:**

1. Customer navigates to the Fund Transfer feature
2. The system displays the customer's account list, including VCB-001

**Expected Result:**

- VCB-001 appears in the list with a "Suspended" status indicator and cannot be selected, OR
- If the customer attempts to select VCB-001, the system displays: "This account is currently suspended and cannot be used to initiate a transfer."
- The transfer flow does not proceed beyond account selection

### SC-08: System returns an error when the destination account number does not exist

| Field            | Value                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| **ID**           | SC-08                                                                                              |
| **Name**         | System displays an error when the customer enters a destination account number that does not exist |
| **Type**         | Negative                                                                                           |
| **Priority**     | P2                                                                                                 |
| **Actor**        | Customer                                                                                           |
| **Traced BR/FR** | FR-03                                                                                              |

**Preconditions:**

- Customer has selected a valid source account

**Steps:**

1. Customer enters destination account number: 9999999999 (does not exist in the system)
2. Customer leaves the field (blur event) or triggers account lookup

**Expected Result:**

- System displays: "Account number not found. Please check and try again."
- No account holder name is displayed
- The customer cannot proceed to the amount entry step

### SC-09: System cancels the transaction after 3 consecutive incorrect OTP entries

| Field            | Value                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| **ID**           | SC-09                                                                                               |
| **Name**         | System cancels the transaction after the customer enters an incorrect OTP three times in succession |
| **Type**         | Negative                                                                                            |
| **Priority**     | P1                                                                                                  |
| **Actor**        | Customer                                                                                            |
| **Traced BR/FR** | BR-05                                                                                               |

**Preconditions:**

- Customer has reached the OTP entry screen following transaction confirmation
- A valid OTP has been delivered to +84-912-345-678

**Steps:**

1. Customer enters an incorrect OTP: "000000" — system responds: "Incorrect OTP. 2 attempts remaining."
2. Customer enters an incorrect OTP: "111111" — system responds: "Incorrect OTP. 1 attempt remaining."
3. Customer enters an incorrect OTP: "222222"

**Expected Result:**

- System displays: "You have entered an incorrect OTP 3 times. This transaction has been cancelled."
- Transaction status changes to "Cancelled"
- Source account balance remains unchanged
- The OTP is invalidated
- The customer must restart the transfer flow from the beginning

### SC-10: System rejects an OTP submitted after the 5-minute validity window has elapsed

| Field            | Value                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| **ID**           | SC-10                                                                                                    |
| **Name**         | System rejects OTP entry when the 5-minute validity period has expired, even if the OTP value is correct |
| **Type**         | Edge Case                                                                                                |
| **Priority**     | P1                                                                                                       |
| **Actor**        | Customer                                                                                                 |
| **Traced BR/FR** | BR-05                                                                                                    |

**Preconditions:**

- Customer is on the OTP entry screen
- OTP was delivered at T=00:00
- Customer has not entered anything for more than 5 minutes (submission occurs at T≥05:01)

**Steps:**

1. After 5 minutes have elapsed, customer enters the OTP (including the correct value)

**Expected Result:**

- System displays: "This OTP has expired. Please request a new one."
- Transaction is not processed and no funds are debited
- System offers a "Resend OTP" option [ASSUMPTION: based on OQ-01 — behavior pending BA confirmation]

### SC-11: Customer successfully transfers an amount equal to the entire remaining balance

| Field            | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| **ID**           | SC-11                                                                                                 |
| **Name**         | Customer successfully completes a transfer where the amount equals the full remaining account balance |
| **Type**         | Edge Case                                                                                             |
| **Priority**     | P2                                                                                                    |
| **Actor**        | Customer                                                                                              |
| **Traced BR/FR** | BR-02, FR-05                                                                                          |

**Preconditions:**

- Source account VCB-001 has a balance of exactly **5,000,000 VND** and status Active
- Remaining daily limit is sufficient

**Steps:**

1. Customer enters transfer amount: **5,000,000 VND** (equal to the full remaining balance)
2. Customer confirms the transaction and enters a valid OTP

**Expected Result:**

- Transaction completes successfully
- VCB-001 balance is **0 VND** after the transaction
- VCB-001 status remains Active (a zero balance does not trigger suspension)

### SC-12: Customer successfully transfers exactly the per-transaction maximum of 500,000,000 VND

| Field            | Value                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| **ID**           | SC-12                                                                                             |
| **Name**         | Customer successfully completes a transfer of exactly 500,000,000 VND — the per-transaction limit |
| **Type**         | Boundary                                                                                          |
| **Priority**     | P2                                                                                                |
| **Actor**        | Customer                                                                                          |
| **Traced BR/FR** | BR-03                                                                                             |

**Preconditions:**

- Source account VCB-001 has a balance of 600,000,000 VND and status Active
- Daily limit consumed today: 0 VND

**Steps:**

1. Customer enters transfer amount: **500,000,000 VND** (exactly at the per-transaction limit)
2. Customer confirms the transaction and enters a valid OTP

**Expected Result:**

- Transaction is **accepted and processed successfully** — 500,000,000 VND equals the limit and does not exceed it
- Daily limit consumed: 500,000,000 VND

### SC-13: System rejects a transfer of 500,000,001 VND — one unit above the per-transaction limit

| Field            | Value                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| **ID**           | SC-13                                                                                                      |
| **Name**         | System rejects a transfer where the amount exceeds the per-transaction limit by the smallest possible unit |
| **Type**         | Boundary                                                                                                   |
| **Priority**     | P2                                                                                                         |
| **Actor**        | Customer                                                                                                   |
| **Traced BR/FR** | BR-03                                                                                                      |

**Preconditions:**

- Source account VCB-001 has a balance of 600,000,000 VND and status Active
- Daily limit consumed today: 0 VND

**Steps:**

1. Customer enters transfer amount: **500,000,001 VND**
2. Customer submits the transaction confirmation

**Expected Result:**

- System rejects the transaction with the same per-transaction limit error as SC-04
- The system does not send an OTP

### SC-14: System handles SMS Gateway failure gracefully when OTP cannot be delivered

| Field            | Value                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| **ID**           | SC-14                                                                                                                |
| **Name**         | System handles an SMS Gateway failure gracefully — displays an actionable error and does not process the transaction |
| **Type**         | Error Recovery                                                                                                       |
| **Priority**     | P1                                                                                                                   |
| **Actor**        | Customer                                                                                                             |
| **Traced BR/FR** | FR-04, BR-04                                                                                                         |

**Preconditions:**

- Customer has confirmed a valid transaction and submitted it
- The SMS Gateway is unavailable or unable to deliver the message to the registered number

**Steps:**

1. The system attempts to send an OTP via the SMS Gateway
2. After 60 seconds, the OTP has not been successfully delivered

**Expected Result:**

- System displays: "We were unable to send your OTP at this time. Please try again or contact support."
- The transaction has **not been processed** — no funds have been debited
- System offers "Resend OTP" and "Cancel Transaction" options
- The failure is recorded in the system error log for debugging and monitoring

### SC-15: Transaction is recorded successfully despite email service being unavailable

| Field            | Value                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| **ID**           | SC-15                                                                                                                 |
| **Name**         | Transaction is fully recorded and balances are correctly updated even when the email confirmation cannot be delivered |
| **Type**         | Error Recovery                                                                                                        |
| **Priority**     | P2                                                                                                                    |
| **Actor**        | Customer                                                                                                              |
| **Traced BR/FR** | BR-07, FR-07                                                                                                          |

**Preconditions:**

- The core transaction has already been processed successfully (funds have been debited and credited correctly)
- The Email Service is unavailable at the moment the confirmation email is to be sent

**Steps:**

1. The system completes the fund transfer (FR-05 fulfilled)
2. The system attempts to send a confirmation email — the Email Service returns an error

**Expected Result:**

- The screen still displays "Transfer Successful" [ASSUMPTION: based on OQ-02 — behavior pending PO confirmation]
- Source and destination account balances reflect the correct post-transfer amounts
- A complete transaction history record has been written
- The confirmation email is queued for retry — the delivery failure does **not** block or reverse the transaction
- The email delivery failure is recorded in the system log for monitoring

### SC-16: System rejects a transfer where the destination account is the same as the source account

| Field            | Value                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| **ID**           | SC-16                                                                                    |
| **Name**         | System rejects a transfer where the customer enters their own account as the destination |
| **Type**         | Security & Misuse                                                                        |
| **Priority**     | P2                                                                                       |
| **Actor**        | Disfavored User                                                                          |
| **Traced BR/FR** | BR-01                                                                                    |

**Preconditions:**

- Customer owns account VCB-001

**Steps:**

1. Customer selects VCB-001 as the source account
2. Customer enters VCB-001 as the destination account number
3. Customer attempts to submit the transaction

**Expected Result:**

- System displays: "The destination account cannot be the same as the source account."
- The transfer flow does not proceed and no OTP is sent

### SC-17: System rejects a replay of a previously completed transaction request

| Field            | Value                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| **ID**           | SC-17                                                                                                 |
| **Name**         | System rejects a replayed HTTP request for a transaction that has already been successfully processed |
| **Type**         | Security & Misuse                                                                                     |
| **Priority**     | P1                                                                                                    |
| **Actor**        | Disfavored User                                                                                       |
| **Traced BR/FR** | BR-04                                                                                                 |

**Preconditions:**

- Transaction TXN-001 has already been completed successfully with a valid OTP
- The attacker has captured the HTTP request for TXN-001

**Steps:**

1. Attacker re-submits the captured HTTP request for TXN-001 with the same OTP and payload as the original

**Expected Result:**

- System rejects the request: "This transaction has already been processed and cannot be submitted again."
- No funds are debited a second time
- A security alert is written to the system log

### SC-18: System sanitizes and rejects malicious or non-numeric input in the amount field

| Field            | Value                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **ID**           | SC-18                                                                                                                             |
| **Name**         | System sanitizes and rejects input containing scripts, injection payloads, or non-numeric characters in the transfer amount field |
| **Type**         | Security & Misuse                                                                                                                 |
| **Priority**     | P2                                                                                                                                |
| **Actor**        | Disfavored User                                                                                                                   |
| **Traced BR/FR** | BR-02                                                                                                                             |

**Preconditions:**

- Customer is on the transaction entry screen

**Steps:**

1. Attacker enters one of the following into the amount field:
   - `<script>alert(1)</script>`
   - `'; DROP TABLE transactions;--`
   - `999999999999999999`

**Expected Result:**

- System displays a validation error: "Please enter a valid transfer amount."
- No script is executed in the browser
- No SQL injection reaches the database
- No transaction record is created

## 5. Coverage Matrix

| BR/FR | SC-01 | SC-02 | SC-03 | SC-04 | SC-05 | SC-06 | SC-07 | SC-08 | SC-09 | SC-10 | SC-11 | SC-12 | SC-13 | SC-14 | SC-15 | SC-16 | SC-17 | SC-18 | Status     |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ---------- |
| BR-01 | ✅    |       |       |       |       |       |       |       |       |       |       |       |       |       |       | ✅    |       |       | ✅ Covered |
| BR-02 | ✅    |       | ✅    |       |       | ✅    |       |       |       |       | ✅    |       |       |       |       |       |       | ✅    | ✅ Covered |
| BR-03 |       |       |       | ✅    | ✅    |       |       |       |       |       |       | ✅    | ✅    |       |       |       |       |       | ✅ Covered |
| BR-04 | ✅    | ✅    |       |       |       |       |       |       |       |       |       |       |       | ✅    |       |       | ✅    |       | ✅ Covered |
| BR-05 |       |       |       |       |       |       |       |       | ✅    | ✅    |       |       |       |       |       |       |       |       | ✅ Covered |
| BR-06 |       |       |       |       |       |       | ✅    |       |       |       |       |       |       |       |       |       |       |       | ✅ Covered |
| BR-07 | ✅    | ✅    |       |       |       |       |       |       |       |       |       |       |       |       | ✅    |       |       |       | ✅ Covered |
| FR-01 | ✅    |       |       |       |       |       | ✅    |       |       |       |       |       |       |       |       |       |       |       | ✅ Covered |
| FR-02 | ✅    | ✅    |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       | ✅ Covered |
| FR-03 | ✅    |       |       |       |       |       |       | ✅    |       |       |       |       |       |       |       |       |       |       | ✅ Covered |
| FR-04 | ✅    |       |       |       |       |       |       |       |       |       |       |       |       | ✅    |       |       |       |       | ✅ Covered |
| FR-05 | ✅    |       |       |       |       |       |       |       |       |       | ✅    |       |       |       |       |       |       |       | ✅ Covered |
| FR-06 | ✅    | ✅    |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       |       | ✅ Covered |
| FR-07 | ✅    |       |       |       |       |       |       |       |       |       |       |       |       |       | ✅    |       |       |       | ✅ Covered |

**Result:** All 14 BRs/FRs are covered ✅

## 6. Quality Self-Check Summary

### Process Compliance Checklist: 10/10 ✅

| #   | Check                                                                        | Status |
| --- | ---------------------------------------------------------------------------- | ------ |
| 1   | All BRs, FRs, and constraints parsed and listed                              | ✅     |
| 2   | All actors identified, including the disfavored user                         | ✅     |
| 3   | 5 generation techniques applied: T2, T3, T4, T7, T16                         | ✅     |
| 4   | All scenarios classified by type                                             | ✅     |
| 5   | All scenarios designed with detailed steps and measurable expected results   | ✅     |
| 6   | Forward traceability confirmed: every BR/FR covered by at least one scenario | ✅     |
| 7   | Reverse traceability confirmed: every scenario traces to at least one BR/FR  | ✅     |
| 8   | Scenario Quality Checklist completed                                         | ✅     |
| 9   | No duplicate scenarios                                                       | ✅     |
| 10  | Output follows the standard template                                         | ✅     |

### Scenario Quality Checklist: 15/15 ✅

| #   | Check                                                                  | Status                        |
| --- | ---------------------------------------------------------------------- | ----------------------------- |
| 1   | At least one happy path for each primary business flow                 | ✅ SC-01, SC-02               |
| 2   | At least one negative scenario for each significant validation rule    | ✅ SC-03 through SC-09        |
| 3   | Edge cases and boundary values covered                                 | ✅ SC-10, SC-11, SC-12, SC-13 |
| 4   | Disfavored user scenarios included                                     | ✅ SC-16, SC-17, SC-18        |
| 5   | Every actor has at least one scenario                                  | ✅                            |
| 6   | Every scenario has preconditions sufficient for independent execution  | ✅                            |
| 7   | Steps are clear enough for any tester to execute without clarification | ✅                            |
| 8   | All expected results are specific and objectively verifiable           | ✅                            |
| 9   | No scenario conflates multiple independent flows                       | ✅                            |
| 10  | Every BR/FR covered — Coverage Matrix confirms 14/14                   | ✅                            |
| 11  | Every scenario traces back to at least one BR/FR                       | ✅                            |
| 12  | No duplicate scenarios                                                 | ✅                            |
| 13  | Every scenario contains 15 steps or fewer (maximum: SC-01 at 9 steps)  | ✅                            |
| 14  | No precondition depends on the output of another scenario              | ✅                            |
| 15  | Scenarios can be executed in any order                                 | ✅                            |

### Red Flag Scan: 0 flags ✅

| Flag                                                          | Status                               |
| ------------------------------------------------------------- | ------------------------------------ |
| 🚩 Suite consists entirely of happy path scenarios            | ✅ Clear                             |
| 🚩 All scenarios involve only one actor                       | ✅ Clear                             |
| 🚩 Duplicate scenarios with identical preconditions and steps | ✅ Clear                             |
| 🚩 One or more BRs/FRs with no covering scenario              | ✅ Clear                             |
| 🚩 Scenario names use implementation-level language           | ✅ Clear                             |
| 🚩 Expected results contain non-measurable language           | ✅ Clear                             |
| 🚩 Total scenario count less than total BR/FR count           | ✅ Clear — 18 scenarios vs 14 BR/FRs |

_Generation techniques applied: T2 (Actor Analysis), T3 (Disfavored Users), T4 (System Events — SC-14, SC-15), T7 (Specific Transactions — SC-01 full flow), T16 (Sequence Analysis — SC-10 covers the interrupted OTP flow)_
