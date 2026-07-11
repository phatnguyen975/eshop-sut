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

# Scenario Test Design — Bank Fund Transfer

> **Date:** 2026-07-09  
> **Input:** BR-01 through BR-07, FR-01 through FR-07

## 1. Requirement Summary

| ID    | Type                   | Description                                                                                 |
| ----- | ---------------------- | ------------------------------------------------------------------------------------------- |
| BR-01 | Business Rule          | Transfers may only be initiated from an account owned by the authenticated user             |
| BR-02 | Business Rule          | Transfer amount must be greater than zero and must not exceed the current balance           |
| BR-03 | Business Rule          | Per-transaction limit: 500,000,000 VND; per-day limit: 1,000,000,000 VND                    |
| BR-04 | Business Rule          | OTP authentication via SMS is mandatory for every transaction                               |
| BR-05 | Business Rule          | OTP expires after 5 minutes; transaction is cancelled after 3 consecutive incorrect entries |
| BR-06 | Business Rule          | Transfers are not permitted from a suspended account                                        |
| BR-07 | Business Rule          | Completed transactions must be recorded in history and trigger a confirmation email         |
| FR-01 | Functional Requirement | Display the authenticated user's accounts for source account selection                      |
| FR-02 | Functional Requirement | Accept destination account input manually or via saved payee selection                      |
| FR-03 | Functional Requirement | Validate destination account and display the account holder's name                          |
| FR-04 | Functional Requirement | Deliver OTP via SMS within 60 seconds of transaction confirmation                           |
| FR-05 | Functional Requirement | Debit and credit accounts immediately upon successful OTP verification                      |
| FR-06 | Functional Requirement | Record transaction history with timestamp, amount, accounts, and status                     |
| FR-07 | Functional Requirement | Send confirmation email within 2 minutes of transaction completion                          |

### Assumptions & Open Questions

| ID     | Type          | Description                                                                                                                                                                                       |
| ------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ASM-01 | Assumption    | Same-bank and inter-bank transfers share the same flow; no BR distinguishes between them                                                                                                          |
| ASM-02 | Assumption    | The daily limit resets at 00:00 each calendar day                                                                                                                                                 |
| OQ-01  | Open Question | When an OTP expires while the user is still on the OTP entry screen, does the transaction roll back to Initiated or to Cancelled? Requires BA confirmation before SC-09 is finalized              |
| OQ-02  | Open Question | If the email service is unavailable after a transaction completes, is the transaction still considered successful from the user's perspective? Requires PO confirmation before SC-11 is finalized |

## 2. Actor & Context Map

| Actor           | Type            | Role / Permissions                                     | Notes                                                                                   |
| --------------- | --------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Customer        | Human           | Authenticated — may only operate on their own accounts | Has an active session and a registered OTP delivery number                              |
| SMS Gateway     | External System | Delivers OTP messages                                  | Subject to delivery delays and service failures                                         |
| Email Service   | External System | Delivers confirmation emails                           | May fail after a transaction has already completed                                      |
| Disfavored User | Human           | Attacker / Abuser                                      | Attempts to bypass OTP, access another user's account, or replay completed transactions |

**System Boundary:**

- **In scope:** The complete transfer flow from account selection through post-transaction confirmation
- **Out of scope:** Internal processing of the SMS Gateway and Email Service; core banking settlement layer

**Key Object States — Account:**

- `Active` → eligible as a source or destination account
- `Suspended` → blocked from use as a source account (BR-06)
- `Closed` → blocked from use as a source or destination account

**Key Object States — Transaction:**

- `Initiated` → `OTP Pending` → `Completed` / `Failed` / `Cancelled`

## 3. Scenario Overview Table

> **Generation techniques applied:**
>
> - T2 (Actor Analysis): identified Customer and Disfavored User journeys
> - T3 (Disfavored Users): SC-12, SC-13
> - T4 (System Events): SC-10, SC-11
> - T7 (Specific Transactions): SC-01 full flow design
> - T16 (Sequence Analysis): SC-08, SC-09 — interrupted and failed OTP flows
> - T1 (Life History of Objects): Account state transitions driving SC-06, SC-07

| ID    | Scenario Name                                                                              | Coverage Label    | Priority | Actor           | Traced BR/FR                                                                       |
| ----- | ------------------------------------------------------------------------------------------ | ----------------- | -------- | --------------- | ---------------------------------------------------------------------------------- |
| SC-01 | Customer completes a fund transfer using a manually entered destination account            | Happy Path        | P1       | Customer        | BR-01, BR-02, BR-03, BR-04, BR-07, FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07 |
| SC-02 | Customer completes a fund transfer by selecting a destination from the saved payee list    | Happy Path        | P1       | Customer        | BR-01, BR-02, BR-04, BR-07, FR-01, FR-02, FR-04, FR-05, FR-06, FR-07               |
| SC-03 | Customer attempts a transfer that would violate the per-transaction or per-day limit       | Negative          | P1       | Customer        | BR-01, BR-02, BR-03, FR-01, FR-02, FR-03                                           |
| SC-04 | Customer attempts to transfer an amount exceeding the current account balance              | Negative          | P1       | Customer        | BR-01, BR-02, FR-01, FR-02, FR-03                                                  |
| SC-05 | Customer attempts to transfer funds when their source account is suspended                 | Negative          | P1       | Customer        | BR-06, FR-01                                                                       |
| SC-06 | Customer attempts a transfer to an account number that does not exist                      | Negative          | P2       | Customer        | BR-01, BR-02, FR-01, FR-02, FR-03                                                  |
| SC-07 | Customer transfers the entire remaining balance of their account                           | Happy Path        | P2       | Customer        | BR-01, BR-02, BR-04, BR-07, FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07        |
| SC-08 | Customer abandons a transfer after the OTP screen by allowing the OTP to expire            | Negative          | P1       | Customer        | BR-01, BR-02, BR-04, BR-05, FR-01, FR-02, FR-03, FR-04                             |
| SC-09 | Customer exhausts all OTP attempts and the transaction is cancelled                        | Negative          | P1       | Customer        | BR-01, BR-02, BR-04, BR-05, FR-01, FR-02, FR-03, FR-04                             |
| SC-10 | SMS Gateway fails to deliver the OTP after the customer confirms a valid transaction       | Error Recovery    | P1       | Customer        | BR-01, BR-02, BR-04, FR-01, FR-02, FR-03, FR-04                                    |
| SC-11 | Email service fails to deliver the confirmation after a transaction completes successfully | Error Recovery    | P2       | Customer        | BR-01, BR-02, BR-04, BR-07, FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07        |
| SC-12 | Disfavored user attempts to transfer funds to their own source account                     | Security & Misuse | P2       | Disfavored User | BR-01, FR-01, FR-02, FR-03                                                         |
| SC-13 | Disfavored user replays a completed transaction request to trigger a duplicate debit       | Security & Misuse | P1       | Disfavored User | BR-04, FR-05                                                                       |

**Summary:** 13 total scenarios — 3 Happy Path, 5 Negative, 2 Error Recovery, 2 Security & Misuse

> **Scenarios deliberately excluded:** Scenarios testing a single input validation in isolation (e.g., zero-amount entry, amount of exactly 500,000,001 VND) are not included because they test a single variable against a single rule — the appropriate techniques for those are Boundary Value Analysis and Equivalence Partitioning, applied when selecting test data _within_ the scenarios above, not as standalone scenarios.

## 4. Scenario Detail Cards

### SC-01: Customer completes a fund transfer using a manually entered destination account

| Field              | Value                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| **ID**             | SC-01                                                                              |
| **Name**           | Customer completes a fund transfer using a manually entered destination account    |
| **Coverage Label** | Happy Path                                                                         |
| **Priority**       | P1                                                                                 |
| **Actor**          | Customer                                                                           |
| **Traced BR/FR**   | BR-01, BR-02, BR-03, BR-04, BR-07, FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07 |

**Preconditions:**

- Customer "alice@test.com" is authenticated with the Customer role
- Source account VCB-001 (balance: 10,000,000 VND, status: Active) is owned by this customer
- Destination account VCB-002 (status: Active) is owned by a different user — account holder name: "Bob Tran"
- Mobile number +84-912-345-678 is registered as the OTP delivery number for VCB-001
- Daily transfer limit consumed today: 0 VND
- SMS Gateway and Email Service are both operational

**Steps:**

1. Customer navigates to the Fund Transfer feature
2. System displays account list — customer selects VCB-001 (balance: 10,000,000 VND) as source
3. Customer selects "Enter account number manually" and enters: VCB-002
4. System validates VCB-002 and displays account holder name: "Bob Tran"
5. Customer enters transfer amount: 5,000,000 VND and memo: "Dinner repayment"
6. Customer submits the transaction confirmation
7. System sends OTP to +84-912-345-678 and displays the OTP entry screen
8. Customer enters the valid OTP received via SMS
9. System processes the transaction and displays the result

**Expected Result:**

- Screen displays "Transfer Successful" with a transaction reference number in the format TXN-xxxxxxxxxx
- VCB-001 balance decreases by exactly 5,000,000 VND (from 10,000,000 VND to 5,000,000 VND)
- VCB-002 balance increases by exactly 5,000,000 VND
- Transaction history record for VCB-001 contains: amount = 5,000,000 VND, source = VCB-001, destination = VCB-002, memo = "Dinner repayment", status = Completed, timestamp = time of processing
- Confirmation email is delivered to alice@test.com within 2 minutes
- The used OTP is invalidated and cannot be reused

**Test Data:**

- Source: VCB-001, balance 10,000,000 VND, Active
- Destination: VCB-002, Active, owner "Bob Tran"
- Amount: 5,000,000 VND

### SC-02: Customer completes a fund transfer by selecting a destination from the saved payee list

| Field              | Value                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- |
| **ID**             | SC-02                                                                                   |
| **Name**           | Customer completes a fund transfer by selecting a destination from the saved payee list |
| **Coverage Label** | Happy Path                                                                              |
| **Priority**       | P1                                                                                      |
| **Actor**          | Customer                                                                                |
| **Traced BR/FR**   | BR-01, BR-02, BR-04, BR-07, FR-01, FR-02, FR-04, FR-05, FR-06, FR-07                    |

**Preconditions:**

- Customer "alice@test.com" is authenticated
- Source account VCB-001 (balance: 2,000,000 VND, status: Active) is owned by this customer
- Saved payee "Charlie Nguyen" with account VCB-003 exists in the customer's payee list
- Daily transfer limit consumed today: 0 VND
- SMS Gateway and Email Service are both operational

**Steps:**

1. Customer navigates to Fund Transfer
2. System displays account list — customer selects VCB-001 as source
3. Customer selects "Choose from saved payees"
4. Customer selects "Charlie Nguyen" from the list
5. System populates destination with VCB-003 and displays name "Charlie Nguyen"
6. Customer enters transfer amount: 1,000,000 VND
7. Customer submits the transaction confirmation
8. System sends OTP and displays OTP entry screen
9. Customer enters valid OTP
10. System processes the transaction

**Expected Result:**

- Transaction completes successfully with a reference number
- VCB-001 balance decreases by exactly 1,000,000 VND
- Transaction history records VCB-003 as destination, status = Completed
- Confirmation email delivered to alice@test.com within 2 minutes

> **Why this is a separate scenario from SC-01:** FR-02 defines two distinct paths for entering a destination account. SC-01 covers the manual-entry path; SC-02 covers the saved-payee path. The interaction between the payee list feature (FR-02) and the validation step (FR-03) can reveal defects not exercised by the manual path — for example, a stale payee record pointing to a closed account.

### SC-03: Customer attempts a transfer that would violate the per-transaction or per-day limit

| Field              | Value                                                                               |
| ------------------ | ----------------------------------------------------------------------------------- |
| **ID**             | SC-03                                                                               |
| **Name**           | Customer attempts a fund transfer that would violate the configured transfer limits |
| **Coverage Label** | Negative                                                                            |
| **Priority**       | P1                                                                                  |
| **Actor**          | Customer                                                                            |
| **Traced BR/FR**   | BR-01, BR-02, BR-03, FR-01, FR-02, FR-03                                            |

**Preconditions:**

- Customer is authenticated
- Source account VCB-001 (balance: 2,000,000,000 VND, status: Active) is owned by this customer
- Destination account VCB-002 is valid and Active
- Two variants to be tested:
  - Variant A — per-transaction limit: daily limit consumed = 0 VND
  - Variant B — per-day limit: daily limit consumed = 900,000,000 VND (remaining: 100,000,000 VND)

**Steps:**

1. Customer navigates to Fund Transfer and selects VCB-001 as source
2. Customer enters destination account VCB-002; system confirms the account holder name
3. Customer enters the transfer amount:
   - Variant A: 600,000,000 VND (exceeds the 500,000,000 VND per-transaction limit)
   - Variant B: 200,000,000 VND (valid per-transaction, but would push the daily total to 1,100,000,000 VND)
4. Customer submits the transaction confirmation

**Expected Result:**

- Variant A: System rejects with "Transfer amount exceeds the maximum per-transaction limit of 500,000,000 VND"
- Variant B: System rejects with "Daily transfer limit reached. Remaining limit today: 100,000,000 VND"
- In both variants: no OTP is sent, no funds are debited, no transaction record is created
- The customer remains on the transfer form and can correct the amount

> **Why both variants are in one scenario:** Both are violations of BR-03 encountered at the same point in the same flow (post-account-selection, pre-OTP). They differ only in test data. Using BVA to select the specific values (600M and 200M) is the appropriate technique here.

### SC-04: Customer attempts to transfer an amount exceeding the current account balance

| Field              | Value                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **ID**             | SC-04                                                                                            |
| **Name**           | Customer attempts to transfer an amount that exceeds the available balance of the source account |
| **Coverage Label** | Negative                                                                                         |
| **Priority**       | P1                                                                                               |
| **Actor**          | Customer                                                                                         |
| **Traced BR/FR**   | BR-01, BR-02, FR-01, FR-02, FR-03                                                                |

**Preconditions:**

- Customer is authenticated
- Source account VCB-001 (balance: 3,000,000 VND, status: Active) is owned by this customer
- Destination account VCB-002 is valid and Active
- Daily transfer limit consumed today: 0 VND

**Steps:**

1. Customer navigates to Fund Transfer and selects VCB-001 as source (balance displayed: 3,000,000 VND)
2. Customer enters destination account VCB-002; system confirms account holder name
3. Customer enters transfer amount: 5,000,000 VND (exceeds the available balance of 3,000,000 VND)
4. Customer submits the transaction confirmation

**Expected Result:**

- System rejects with: "Insufficient funds. The transfer amount exceeds your available balance."
- No OTP is sent
- VCB-001 balance remains unchanged at 3,000,000 VND
- No transaction history record is created
- Customer remains on the transfer form

> **Why this is separate from SC-03:** BR-02 (balance check) and BR-03 (limit check) are independent rules. A customer with a high balance but exceeding the limit hits SC-03; a customer with a low balance but within the limit hits SC-04. The two rules can also produce conflicting messages if both are violated simultaneously — a defect scenario that only becomes visible when tested separately.

### SC-05: Customer attempts to transfer funds when their source account is suspended

| Field              | Value                                                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **ID**             | SC-05                                                                                                                |
| **Name**           | Customer attempts to initiate a transfer from a suspended account and is blocked before entering transaction details |
| **Coverage Label** | Negative                                                                                                             |
| **Priority**       | P1                                                                                                                   |
| **Actor**          | Customer                                                                                                             |
| **Traced BR/FR**   | BR-06, FR-01                                                                                                         |

**Preconditions:**

- Customer is authenticated
- Source account VCB-001 (status: **Suspended**) is visible in the customer's account list

**Steps:**

1. Customer navigates to the Fund Transfer feature
2. System displays the customer's account list, including VCB-001 with status "Suspended"
3. Customer attempts to select VCB-001 as the source account

**Expected Result:**

- VCB-001 is either non-selectable with a "Suspended" indicator, or selecting it displays: "This account is currently suspended and cannot be used to initiate a transfer."
- The transfer flow does not proceed to destination or amount entry
- No OTP is generated, no transaction record is created

> **Note on single-BR trace:** This scenario traces primarily to BR-06 and FR-01. It is included because it represents a distinct, credible user situation — a customer whose account has been suspended attempting to make a payment — and its expected behavior (blocked at account selection, not at OTP or debit) has meaningful implications for system design. The account lifecycle (T1 — Life History of Objects) is the generation technique that surfaced this scenario.

### SC-06: Customer attempts a transfer to an account number that does not exist

| Field              | Value                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **ID**             | SC-06                                                                                                                    |
| **Name**           | Customer enters a destination account number that does not exist and receives an error before confirming the transaction |
| **Coverage Label** | Negative                                                                                                                 |
| **Priority**       | P2                                                                                                                       |
| **Actor**          | Customer                                                                                                                 |
| **Traced BR/FR**   | BR-01, BR-02, FR-01, FR-02, FR-03                                                                                        |

**Preconditions:**

- Customer is authenticated
- Source account VCB-001 (balance: 5,000,000 VND, status: Active) is owned by this customer

**Steps:**

1. Customer navigates to Fund Transfer and selects VCB-001 as source
2. Customer selects "Enter account number manually" and enters: 9999999999 (does not exist)
3. System attempts to validate the destination account number

**Expected Result:**

- System displays: "Account number not found. Please check and try again."
- No account holder name is displayed
- Customer cannot proceed to the amount entry step
- No OTP is sent, no transaction record is created

### SC-07: Customer transfers the entire remaining balance of their account

| Field              | Value                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **ID**             | SC-07                                                                                            |
| **Name**           | Customer successfully transfers the entire remaining balance, leaving the source account at zero |
| **Coverage Label** | Happy Path                                                                                       |
| **Priority**       | P2                                                                                               |
| **Actor**          | Customer                                                                                         |
| **Traced BR/FR**   | BR-01, BR-02, BR-04, BR-07, FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07                      |

**Preconditions:**

- Customer is authenticated
- Source account VCB-001 (balance: **5,000,000 VND**, status: Active) is owned by this customer
- Destination account VCB-002 is valid and Active
- Daily transfer limit: 5,000,000 VND is within both per-transaction and per-day limits
- SMS Gateway and Email Service are operational

**Steps:**

1. Customer navigates to Fund Transfer and selects VCB-001 as source (balance: 5,000,000 VND)
2. Customer enters destination VCB-002; system confirms account holder name
3. Customer enters transfer amount: 5,000,000 VND (equal to the full remaining balance)
4. Customer submits confirmation, receives OTP, enters valid OTP
5. System processes the transaction

**Expected Result:**

- Transaction completes successfully with a reference number
- VCB-001 balance is exactly 0 VND after the transaction
- VCB-001 status remains Active — a zero balance does not trigger suspension
- VCB-002 balance increases by exactly 5,000,000 VND
- Transaction history and confirmation email are produced correctly

> **Why this is a scenario and not a BVA test case:** "Transfer all my money" is a credible, meaningful user goal — a customer closing a joint account, settling a final debt, or moving funds entirely. The critical behavior being validated is that a zero-balance outcome does not accidentally trigger account suspension (an interaction between FR-05 and BR-06 that a unit test of either rule alone would not reveal).

### SC-08: Customer abandons a transfer after the OTP screen by allowing the OTP to expire

| Field              | Value                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **ID**             | SC-08                                                                                                                          |
| **Name**           | Customer reaches the OTP screen but does not enter the OTP within the validity window, causing the transaction to be cancelled |
| **Coverage Label** | Negative                                                                                                                       |
| **Priority**       | P1                                                                                                                             |
| **Actor**          | Customer                                                                                                                       |
| **Traced BR/FR**   | BR-01, BR-02, BR-04, BR-05, FR-01, FR-02, FR-03, FR-04                                                                         |

**Preconditions:**

- Customer is authenticated
- Source account VCB-001 (balance: 5,000,000 VND, status: Active) is owned by this customer
- Destination account VCB-002 is valid and Active
- Customer has completed all steps up to and including OTP delivery (steps 1–7 of SC-01)
- OTP has been delivered to +84-912-345-678 at T=00:00

**Steps:**

1. Customer is on the OTP entry screen; the OTP is valid at T=00:00
2. Customer does not enter the OTP (distracted, or deliberately abandons)
3. At T=05:01, customer enters the OTP (correct value, but beyond the 5-minute window)

**Expected Result:**

- System displays: "This OTP has expired. Please request a new one to continue."
- Transaction is not processed — no funds are debited, no transaction record with status Completed is created
- Transaction state returns to Initiated or Cancelled [pending OQ-01]
- System offers options to resend the OTP or cancel the transaction

> **Why this is a scenario and not a simple expiry test:** This tests the interaction between BR-04 (OTP required), BR-05 (OTP validity window), and FR-05 (debit only on valid OTP). The critical question being answered is: does an expired OTP allow the transaction to proceed if the value is technically correct? That is a real-world concern — and the answer must be no.

### SC-09: Customer exhausts all OTP attempts and the transaction is cancelled

| Field              | Value                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| **ID**             | SC-09                                                                                                  |
| **Name**           | Customer enters an incorrect OTP three consecutive times, causing the system to cancel the transaction |
| **Coverage Label** | Negative                                                                                               |
| **Priority**       | P1                                                                                                     |
| **Actor**          | Customer                                                                                               |
| **Traced BR/FR**   | BR-01, BR-02, BR-04, BR-05, FR-01, FR-02, FR-03, FR-04                                                 |

**Preconditions:**

- Customer is authenticated
- Customer has completed steps 1–7 of SC-01 (transaction confirmed, OTP delivered)
- A valid OTP has been delivered to +84-912-345-678

**Steps:**

1. Customer enters incorrect OTP: "000000" — system responds: "Incorrect OTP. 2 attempts remaining."
2. Customer enters incorrect OTP: "111111" — system responds: "Incorrect OTP. 1 attempt remaining."
3. Customer enters incorrect OTP: "222222"

**Expected Result:**

- System displays: "You have entered an incorrect OTP 3 times. This transaction has been cancelled."
- Transaction status is Cancelled
- No funds are debited from VCB-001
- No transaction history record with status Completed is created
- The OTP is permanently invalidated
- Customer must restart the transfer flow from the beginning to retry

### SC-10: SMS Gateway fails to deliver the OTP after the customer confirms a valid transaction

| Field              | Value                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | SC-10                                                                                                                                               |
| **Name**           | SMS Gateway is unavailable when the system attempts to deliver the OTP, and the customer receives an actionable error without any funds being moved |
| **Coverage Label** | Error Recovery                                                                                                                                      |
| **Priority**       | P1                                                                                                                                                  |
| **Actor**          | Customer                                                                                                                                            |
| **Traced BR/FR**   | BR-01, BR-02, BR-04, FR-01, FR-02, FR-03, FR-04                                                                                                     |

**Preconditions:**

- Customer is authenticated
- Source account VCB-001 (balance: 5,000,000 VND, status: Active) is owned by this customer
- Destination account VCB-002 is valid and Active
- Customer has completed steps 1–6 of SC-01 (transaction confirmed, system attempting OTP delivery)
- SMS Gateway is unavailable

**Steps:**

1. System attempts to send OTP to +84-912-345-678 via SMS Gateway
2. SMS Gateway returns a failure or does not respond within 60 seconds

**Expected Result:**

- System displays: "We were unable to send your verification code at this time. Please try again or contact support."
- No funds are debited from VCB-001
- No transaction history record with status Completed is created
- System offers "Resend OTP" and "Cancel Transaction" options
- The failure event is recorded in the system error log

### SC-11: Email service fails to deliver the confirmation after a transaction completes successfully

| Field              | Value                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | SC-11                                                                                                                                     |
| **Name**           | Transaction is debited, credited, and recorded correctly even when the email confirmation service is unavailable at the moment of sending |
| **Coverage Label** | Error Recovery                                                                                                                            |
| **Priority**       | P2                                                                                                                                        |
| **Actor**          | Customer                                                                                                                                  |
| **Traced BR/FR**   | BR-01, BR-02, BR-04, BR-07, FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07                                                               |

**Preconditions:**

- Customer has completed steps 1–8 of SC-01 (OTP submitted successfully)
- System has debited VCB-001 and credited VCB-002 (FR-05 fulfilled)
- Email Service is unavailable at the moment the system attempts to send the confirmation email

**Steps:**

1. System successfully processes the fund transfer (FR-05 complete)
2. System records the transaction history entry (FR-06 complete)
3. System attempts to send confirmation email to alice@test.com — Email Service returns an error

**Expected Result:**

- Screen displays "Transfer Successful" with the transaction reference number [pending OQ-02]
- VCB-001 balance has decreased by the correct amount
- VCB-002 balance has increased by the correct amount
- Transaction history record is complete and accurate
- The email delivery failure does not reverse or block the transaction — funds remain transferred
- Email is queued for retry delivery
- The delivery failure is recorded in the system error log

### SC-12: Disfavored user attempts to transfer funds to their own source account

| Field              | Value                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **ID**             | SC-12                                                                                                                    |
| **Name**           | Disfavored user enters the same account number as both source and destination in an attempt to exploit the transfer flow |
| **Coverage Label** | Security & Misuse                                                                                                        |
| **Priority**       | P2                                                                                                                       |
| **Actor**          | Disfavored User                                                                                                          |
| **Traced BR/FR**   | BR-01, FR-01, FR-02, FR-03                                                                                               |

**Preconditions:**

- User is authenticated and owns account VCB-001

**Steps:**

1. User navigates to Fund Transfer and selects VCB-001 as the source account
2. User enters VCB-001 as the destination account number (same as source)
3. System validates the destination account

**Expected Result:**

- System rejects with: "The destination account cannot be the same as the source account."
- The transfer flow does not proceed to amount entry
- No OTP is sent, no transaction record is created

### SC-13: Disfavored user replays a completed transaction request to trigger a duplicate debit

| Field              | Value                                                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | SC-13                                                                                                                      |
| **Name**           | Attacker re-submits a captured HTTP request for a completed transaction to trigger an unauthorized duplicate fund transfer |
| **Coverage Label** | Security & Misuse                                                                                                          |
| **Priority**       | P1                                                                                                                         |
| **Actor**          | Disfavored User                                                                                                            |
| **Traced BR/FR**   | BR-04, FR-05                                                                                                               |

**Preconditions:**

- Transaction TXN-001 has been completed successfully — OTP verified, funds transferred
- Attacker has captured the HTTP request payload of TXN-001 including the OTP and all parameters

**Steps:**

1. Attacker re-submits the captured HTTP request for TXN-001 with the original OTP and payload

**Expected Result:**

- System rejects the request: "This transaction has already been processed and cannot be resubmitted."
- No funds are debited a second time
- VCB-001 balance is unchanged from its post-TXN-001 state
- A security alert is written to the system log

## 5. Coverage Matrix

| BR/FR | SC-01 | SC-02 | SC-03 | SC-04 | SC-05 | SC-06 | SC-07 | SC-08 | SC-09 | SC-10 | SC-11 | SC-12 | SC-13 | Status     |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ---------- |
| BR-01 | ✅    | ✅    | ✅    | ✅    |       | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    |       | ✅ Covered |
| BR-02 | ✅    | ✅    | ✅    | ✅    |       | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    |       |       | ✅ Covered |
| BR-03 | ✅    |       | ✅    |       |       |       |       |       |       |       |       |       |       | ✅ Covered |
| BR-04 | ✅    | ✅    |       |       |       |       | ✅    | ✅    | ✅    | ✅    | ✅    |       | ✅    | ✅ Covered |
| BR-05 |       |       |       |       |       |       |       | ✅    | ✅    |       |       |       |       | ✅ Covered |
| BR-06 |       |       |       |       | ✅    |       |       |       |       |       |       |       |       | ✅ Covered |
| BR-07 | ✅    | ✅    |       |       |       |       | ✅    |       |       |       | ✅    |       |       | ✅ Covered |
| FR-01 | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    |       | ✅ Covered |
| FR-02 | ✅    | ✅    | ✅    | ✅    |       | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    |       | ✅ Covered |
| FR-03 | ✅    |       | ✅    | ✅    |       | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    | ✅    |       | ✅ Covered |
| FR-04 | ✅    | ✅    |       |       |       |       | ✅    | ✅    | ✅    | ✅    | ✅    |       |       | ✅ Covered |
| FR-05 | ✅    | ✅    |       |       |       |       | ✅    |       |       |       | ✅    |       | ✅    | ✅ Covered |
| FR-06 | ✅    | ✅    |       |       |       |       | ✅    |       |       |       | ✅    |       |       | ✅ Covered |
| FR-07 | ✅    | ✅    |       |       |       |       | ✅    |       |       |       | ✅    |       |       | ✅ Covered |

**Result**: All 14 BRs/FRs are covered ✅

## 6. Quality Self-Check Summary

### Process Compliance Checklist: 10/10 ✅

| #   | Check                                                                                           | Status |
| --- | ----------------------------------------------------------------------------------------------- | ------ |
| 1   | All BRs, FRs, and constraints parsed and listed                                                 | ✅     |
| 2   | All actors identified, including the disfavored user                                            | ✅     |
| 3   | 6 generation techniques applied: T1, T2, T3, T4, T7, T16                                        | ✅     |
| 4   | Scenarios tagged with coverage labels (Happy Path, Negative, Error Recovery, Security & Misuse) | ✅     |
| 5   | All scenarios have detailed steps and measurable expected results                               | ✅     |
| 6   | Forward traceability confirmed: every BR/FR covered                                             | ✅     |
| 7   | Reverse traceability confirmed: every scenario traces to at least one BR/FR                     | ✅     |
| 8   | Scenario Quality Checklist completed                                                            | ✅     |
| 9   | No duplicate scenarios                                                                          | ✅     |
| 10  | Output follows the standard template                                                            | ✅     |

### Scenario Quality Checklist: 14/14 ✅

| #   | Check                                                                                                                       | Status                                                                                                     |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | At least one happy path scenario for each primary business flow                                                             | ✅ SC-01, SC-02, SC-07                                                                                     |
| 2   | At least one negative scenario for each business rule, validation rule, permission constraint, and invalid state transition | ✅ SC-03 (BR-03), SC-04 (BR-02), SC-05 (BR-06), SC-06 (FR-03), SC-08 (BR-05 expiry), SC-09 (BR-05 lockout) |
| 3   | Error Recovery scenarios exist for every external system dependency                                                         | ✅ SC-10 (SMS Gateway), SC-11 (Email Service)                                                              |
| 4   | Disfavored user / misuse scenarios included                                                                                 | ✅ SC-12, SC-13                                                                                            |
| 5   | Every actor has at least one scenario                                                                                       | ✅ Customer: SC-01 through SC-11; Disfavored User: SC-12, SC-13                                            |
| 6   | Every scenario has preconditions sufficient for independent execution                                                       | ✅                                                                                                         |
| 7   | Steps are clear enough for any tester to execute without clarification                                                      | ✅                                                                                                         |
| 8   | Expected results are specific and objectively verifiable                                                                    | ✅                                                                                                         |
| 9   | No scenario conflates multiple independent flows                                                                            | ✅                                                                                                         |
| 10  | Every BR/FR covered — Coverage Matrix confirms 14/14                                                                        | ✅                                                                                                         |
| 11  | Every scenario traces back to at least one BR/FR                                                                            | ✅                                                                                                         |
| 12  | No duplicate scenarios                                                                                                      | ✅                                                                                                         |
| 13  | Every scenario contains 15 steps or fewer (maximum: SC-01 and SC-02 at 10 steps)                                            | ✅                                                                                                         |
| 14  | No precondition depends on the output of another scenario                                                                   | ✅                                                                                                         |

### Red Flag Scan: 0 flags ✅

| Flag                                                                         | Status                                                     |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 🚩 Suite consists entirely of happy path scenarios                           | ✅ Clear                                                   |
| 🚩 All scenarios involve only one actor                                      | ✅ Clear                                                   |
| 🚩 Duplicate scenarios with identical preconditions and steps                | ✅ Clear                                                   |
| 🚩 One or more BRs/FRs with no covering scenario                             | ✅ Clear — Coverage Matrix confirms all 14 BRs/FRs covered |
| 🚩 Scenario names use implementation-level language                          | ✅ Clear                                                   |
| 🚩 Expected results contain non-measurable language                          | ✅ Clear                                                   |
| 🚩 One or more BRs/FRs with no covering scenario — regardless of total count | ✅ Clear                                                   |

_Generation techniques applied: T1 (Life History — Account state transitions), T2 (Actor Analysis), T3 (Disfavored Users — SC-12, SC-13), T4 (System Events — SC-10, SC-11), T7 (Specific Transactions — SC-01 full flow design), T16 (Sequence Analysis — SC-08, SC-09 interrupted OTP flows)_
