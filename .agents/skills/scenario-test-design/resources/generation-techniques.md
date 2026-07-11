# Scenario Test Design — 16 Scenario Generation Techniques

Apply these techniques in **Step 3** to ensure comprehensive scenario coverage. Not all 16 need to be applied in every engagement, but a minimum of 5 must be used, and Techniques 2, 3, and 7 are mandatory for every feature.

## Technique 1: Life History of Objects

**Question:** How is each key system object created, modified, and eventually destroyed or retired?

Trace the full lifecycle of every primary domain object:

```
Order lifecycle:
  Created → Submitted → Under Review → Approved / Rejected → Shipped → Delivered / Returned

Scenarios derived from this lifecycle:
  - Create an order with valid data
  - Submit an existing draft order
  - Approve an order in the Under Review state
  - Reject an order with a stated reason
  - Attempt to cancel an order that has already shipped
  - Return an order after delivery
```

**When to apply:** Any feature where primary objects have multiple states or a defined lifecycle (orders, tickets, accounts, documents, contracts).

## Technique 2: Actor Analysis

**Question:** For each type of user, what are their goals, and what paths do they take to achieve them?

```
Actor: Individual customer
  Objective: Transfer funds to a family member
  Scenarios derived:
    - Transfer to an account at the same bank
    - Transfer to an account at another bank
    - Transfer to a saved payee
    - Attempt a transfer without a registered OTP number

Actor: Accounting staff
  Objective: Reconcile and verify transactions
  Scenarios derived:
    - View transaction history for a specified date range
    - Export transaction report to Excel
```

**When to apply:** Always. Every actor must have at least one scenario.

## Technique 3: Disfavored Users

**Question:** Who wants to misuse the system, and what will they try?

```
Disfavored user scenarios:
  - Submit a negative transfer amount
  - Transfer funds to one's own account to exploit a fee waiver
  - Submit the same transaction request repeatedly (replay attack)
  - Modify the transfer amount after OTP confirmation
  - Inject special characters or SQL into a memo or description field
  - Use another user's session to perform a transaction
  - Bypass the OTP screen and post directly to the processing endpoint
```

**When to apply:** Always, for any feature involving sensitive data, financial operations, or access control.

## Technique 4: System Events

**Question:** How does the system respond to infrastructure or integration events?

```
Events and corresponding scenarios:
  - Session expires while a form is being completed → what happens to the data?
  - Database connection is lost during transaction processing → is a rollback performed?
  - Email service is unavailable → does the system retry or return an error?
  - OTP expires while the user is still on the OTP screen → is a resend option offered?
  - File upload is interrupted mid-stream → how is the partial upload handled?
```

**When to apply:** Any feature that depends on external services (email, SMS, payment gateways, file storage, third-party APIs).

## Technique 5: Special Events

**Question:** Are there conditions under which the system behaves differently?

```
Special event scenarios:
  - Transaction submitted at end-of-day cutoff time
  - Transaction submitted on a public holiday (T+1 settlement rule applies)
  - System is in maintenance mode
  - Flash sale: 1,000 concurrent users attempting to purchase the last available unit
  - End of financial year: quota counters reset
  - Daylight saving time boundary: timestamp edge cases
```

**When to apply:** Any feature with time-sensitive logic, quota resets, peak load conditions, or regulatory settlement windows.

## Technique 6: Benefits-Based Validation

**Question:** What business benefit does this feature deliver? Which scenario validates that benefit through a complete user journey?

```
Stated benefit: "Users save time by completing transfers quickly"
  → Complete journey scenario: Open app → select payee → enter amount → confirm OTP → transaction complete
  → Measure: Full flow completes in ≤ 30 seconds

Stated benefit: "Sales staff can generate quotes from anywhere"
  → Complete journey scenario: Login on mobile → create quote → send PDF by email → customer can open it
```

**When to apply:** Smoke tests, critical path tests, and acceptance criteria validation.

## Technique 7: Specific Transactions

**Question:** What is the exact transaction the user completes? What are all the steps, data inputs, outputs, and displays involved?

```
Transaction: "Open a bank account"
  Steps:
    1. User completes personal information form (name, date of birth, ID number, address)
    2. User uploads front and back of government-issued ID
    3. User completes selfie verification
    4. User selects account type
    5. User accepts terms and conditions
    6. User submits application

  Data items: name, DOB, ID number, address, phone, email
  Outputs: account created, welcome email, push notification
  Displays: confirmation screen with new account number

  Scenarios derived:
    - Each field-level validation (missing, wrong format, too long)
    - Each account type option
    - Failure at each step (upload fails, selfie rejected, submission error)
```

**When to apply:** Always. This technique is the primary method for designing happy path scenarios.

## Technique 8: Forms and Documents

**Question:** Which forms or documents does the user work with, and what operations are possible?

```
Document: Loan application form
  Operations:
    - Create a new application
    - Save a draft
    - Edit a saved draft
    - Submit the application
    - View a submitted application (read-only)
    - Download the application as PDF
    - Cancel an application under review
    - Edit a submitted application
```

**When to apply:** Features involving complex multi-step forms or documents with a defined lifecycle.

## Technique 9: Famous Failures

**Question:** What failures has the predecessor system or a competitor experienced? Could this system repeat them?

```
Known failure scenarios from the previous system:
  - "Concurrent transactions could produce a negative balance"
    → Scenario: Two simultaneous withdrawals from an account with limited funds

  - "File uploads larger than 5 MB caused a server crash"
    → Boundary scenario: upload a file of exactly 5 MB; then 5.1 MB

  - "Changing a password did not invalidate existing sessions"
    → Security scenario: verify all active sessions are terminated on password change
```

**When to apply:** When information about bugs in legacy systems or competitors is available.

## Technique 10: User Observation

**Question:** How do real users actually behave when using this type of system, as opposed to how they are expected to behave?

```
Observed user behaviors and corresponding scenarios:
  - Users frequently copy and paste from spreadsheets → test with leading/trailing whitespace and special characters
  - Users open multiple browser tabs → test for session conflicts
  - Users press the browser Back button during checkout → test navigation with unsaved data
  - Users enter email addresses in lowercase regardless of case requirements → test case-insensitive matching
```

**When to apply:** When user research, usability testing results, or UAT feedback from previous projects is available.

## Technique 11: Domain Research

**Question:** What do industry standards, regulatory requirements, or domain knowledge say this type of system must handle?

```
Banking domain:
  - Regulatory: transactions above a threshold must be flagged for AML review
  - Industry standard: 3D Secure authentication for online payments
  - Common practice: per-day and per-session transaction limits

E-commerce domain:
  - Inventory reservation (holding stock while a user is in checkout)
  - Price change between the time an item is added to a cart and checkout
  - Coupon stacking rules and exclusions
```

**When to apply:** Any feature in a regulated or well-defined domain (banking, healthcare, fintech, e-commerce, insurance).

## Technique 12: Competitor and Predecessor Analysis

**Question:** What does the user expect based on systems they have used before?

```
Competitor feature parity:
  - A competitor supports feature X → test whether this system does too, and whether the behavior matches user expectations
  - A competitor has a known bug Z → explicitly test that this system does not share it

Data migration from the predecessor system:
  - Historical records with older data formats → backward compatibility scenarios
  - User workflows that differ from the new system → migration path testing
```

**When to apply:** When replacing a legacy system or when the product competes directly with established alternatives.

## Technique 13: Mock Business Simulation

**Question:** If this were a real business, what situations would arise in normal operation?

```
Mock business: Retail store using a point-of-sale system

Start of day:
  - Open the register and enter the opening float

During the day:
  - Standard sale transaction
  - Attempt to sell an item with zero stock
  - Process a customer return
  - Mid-shift handover from one staff member to another

End of day:
  - Perform end-of-day reconciliation
  - Cash drawer total does not match system total
```

**When to apply:** Complex features with many states, or when rich and realistic test data scenarios are needed.

## Technique 14: Real Data Migration and Import

**Question:** What problems arise when real-world data from another system is processed?

```
Data migration scenarios:
  - Source record is missing a field that is mandatory in the target system
  - Source field value exceeds the maximum length in the target system
  - Character encoding mismatch (UTF-8 vs. Latin-1) causes special characters to be corrupted
  - Duplicate records are present in the source data
  - Source record references another record that has been deleted (orphaned reference)
  - Date format mismatch between source (DD/MM/YYYY) and target (ISO 8601)
```

**When to apply:** Any feature involving data import, data migration, or API integration with an external system.

## Technique 15: Output-Driven Analysis

**Question:** What outputs does the system produce? Has every output type been covered?

```
System outputs and derived scenarios:
  - PDF report → test with multi-page data, special characters, and empty data sets
  - Email notification → test with long subject lines, attachments, and when the mail service is unavailable
  - Excel export → test with large row counts, formulas, and special characters
  - API response → test format correctness, HTTP status codes, and pagination behavior
  - Real-time dashboard → test refresh rate and behavior under concurrent data updates
```

**When to apply:** Features that produce diverse or complex outputs.

## Technique 16: Sequence Analysis

**Question:** In what order do users typically perform the sub-tasks of a workflow? What happens when the order changes?

```
Feature: Checkout process

Common sequences and derived scenarios:
  1. Browse → Add to cart → Checkout → Pay → Confirm (standard flow)
  2. Browse → Add to cart → Save for later → Return later → Checkout (interrupted flow)
  3. Checkout → Apply coupon → Change quantity → Re-confirm (in-flow modification)
  4. Checkout → Session expires → Re-authenticate → Resume (recovery from interruption)

Scenarios derived from sequence variation:
  - User changes item quantity while payment details are already entered
  - User applies a coupon after selecting a payment method
  - User navigates back to the product page from the checkout page and then returns
```

**When to apply:** Multi-step workflows, or any feature where users can reach the same outcome through different sequences of actions.
