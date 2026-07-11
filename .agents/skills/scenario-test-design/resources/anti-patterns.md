# Scenario Test Design — Anti-Patterns

Common design mistakes that undermine the value of a scenario suite. Recognize and avoid these in every engagement.

## AP-01: CRUD-Based Scenarios

**Description:** Scenarios are organized around technical operations (Create, Read, Update, Delete) rather than business workflows.

❌ Wrong:

```
- Test user creation (POST /users)
- Test user retrieval (GET /users/:id)
- Test user update (PUT /users/:id)
- Test user deletion (DELETE /users/:id)
```

✅ Correct:

```
- HR staff registers a new employee account with full profile information
- Employee updates their own personal details (name, phone number)
- Manager deactivates an account for an employee who has left the organization
```

**Why it fails:** CRUD scenarios validate implementation, not business value. Defects in business logic — incorrect permission enforcement, missing notifications, wrong state transitions — will not be caught.

## AP-02: Scenarios That Are Too Long

**Description:** Multiple independent flows are merged into a single scenario that exceeds a maintainable length.

❌ Wrong:

```
Scenario: "Complete end-to-end purchase flow"
Steps:
  1.  Register an account
  2.  Verify email address
  3.  Log in
  4.  Search for a product
  5.  Add to cart
  6.  Apply a coupon code
  7.  Enter a shipping address
  8.  Select a payment method
  9.  Confirm the order
  10. Receive confirmation email
  11. Track the shipment
  12. Receive the delivery
  13. Submit a product review
```

✅ Correct:

```
Split into independent scenarios:
  - SC-01: New user registers an account successfully
  - SC-02: Customer purchases a single item with a valid coupon code
  - SC-03: Customer tracks an order after placement
  - SC-04: Customer submits a product review after delivery
```

**Why it fails:** When a long scenario fails at step 7, the defective feature cannot be identified. When any one feature changes, the entire mega-scenario must be updated.

**Rule of thumb:** More than 10 steps warrants consideration of splitting. More than 15 steps almost always requires splitting.

## AP-03: Happy-Path-Only Suites

**Description:** The scenario suite covers only the success flow, leaving negative and edge cases undesigned.

❌ Wrong:

```
Scenarios for "Login":
  - SC-01: User logs in successfully ← the only scenario
```

✅ Correct:

```
- SC-01: User logs in successfully with valid credentials
- SC-02: Login rejected with an incorrect password
- SC-03: Login rejected with an email address that does not exist
- SC-04: Login rejected for a suspended account
- SC-05: Account is locked after 5 consecutive failed login attempts
- SC-06: Login behavior when an active session already exists
```

**Why it fails:** The majority of defects are found in negative cases and edge cases. Happy paths are typically the most thoroughly tested by developers themselves.

## AP-04: Vague or Incomplete Preconditions

**Description:** Preconditions do not provide enough context for the scenario to be executed in isolation.

❌ Wrong:

```
Preconditions:
  - User is logged in
  - Data exists in the system
```

✅ Correct:

```
Preconditions:
  - User "alice@test.com" is authenticated with the Customer role
  - Account A (ID: ACC-001) is Active with a balance of $10,000.00
  - Account B (ID: ACC-002) belongs to a different user and is Active
  - No pending transactions exist on Account A
  - The registered OTP delivery number for Account A is +1-555-000-1234
```

**Why it fails:** Testers cannot set up the required test data. When a scenario fails, it is impossible to determine whether the failure is a defect or a data preparation issue.

## AP-05: Non-Measurable Expected Results

**Description:** Expected results are stated at a level of abstraction that makes it impossible to determine objectively whether the scenario has passed or failed.

❌ Wrong:

```
Expected Result:
  - The transaction completes successfully
  - The system behaves correctly
  - The user receives a notification
```

✅ Correct:

```
Expected Result:
  - The screen displays "Transfer Successful" with a transaction reference in the format TXN-xxxxxxxxxx
  - Account A balance decreases by exactly $500.00 (from $10,000.00 to $9,500.00)
  - Account B balance increases by exactly $500.00
  - A confirmation email is delivered to alice@test.com within 2 minutes
  - The transaction history for Account A contains a new record with the correct amount, timestamp, counterpart account, and status "Completed"
```

**Why it fails:** Testers do not know when to mark a scenario as passed. Minor business logic defects — off-by-one amounts, missing audit records — can be silently overlooked.

## AP-06: Duplicate Scenarios

**Description:** Two or more scenarios test the same condition using different labels or minor data variations.

❌ Wrong:

```
- SC-05: Enter email in invalid format "abc"
- SC-06: Enter email in invalid format "abc@"
- SC-07: Enter email in invalid format "@gmail.com"
```

✅ Correct:

```
- SC-05: Attempt to register with an invalid email format (representative invalid value used as test data; additional formats covered in the test data set, not as separate scenarios)
```

**Why it fails:** The suite grows in size without increasing meaningful coverage. Every duplicate is maintenance overhead — when the validation rule changes, multiple scenarios must be updated.

**Exception:** When each input variation triggers a distinctly different business rule, separate scenarios are appropriate.

## AP-07: Scenarios Without Requirement Traceability

**Description:** A scenario exists with no reference to the requirement it is intended to verify.

❌ Wrong:

```
| SC-09 | Verify that a loading spinner appears during processing | HP | P3 | — |
```

✅ Correct:

```
| SC-09 | System displays a processing indicator while awaiting OTP delivery | HP | P3 | NFR-02 |
```

**Why it fails:** There is no basis for deciding whether to keep or remove this scenario when the product evolves. When requirements change, it is impossible to identify which scenarios are affected.

## AP-08: Scenarios That Depend on Each Other

**Description:** Scenario B requires Scenario A to have executed first in order to have the necessary test data.

❌ Wrong:

```
SC-01: Create an order → produces order_id = 12345
SC-02: Cancel the order → Precondition: order_id 12345 from SC-01
```

✅ Correct:

```
SC-01: Create an order → fully self-contained preconditions
SC-02: Cancel an order → Precondition: order ACC-99999 already exists in the test environment (set up independently via fixture or test data script)
```

**Why it fails:** When SC-01 fails, SC-02 also fails even if the cancel feature is working correctly. The suite becomes unreliable (flaky), and failure analysis is confounded.

## AP-09: Omitting External System Failure Scenarios

**Description:** No scenarios cover the behavior of the system when a third-party dependency (email, SMS, payment gateway) is unavailable or returns an error.

❌ Wrong:

```
Scenarios for "Payment":
  - Payment completes successfully
  - Payment rejected — card declined
  [No scenario for payment gateway timeout]
```

✅ Correct:

```
- SC-15: System handles payment gateway timeout gracefully — displays error message, does not deduct funds
- SC-16: User successfully retries payment after the gateway recovers
- SC-17: Transaction is recorded as successful even when the email notification service is unavailable at the moment of confirmation
```

**Why it fails:** Partial failure states — where money is deducted but an order is not created — are among the most severe and damaging defects in financial and e-commerce systems.

## AP-10: Implementation-Level Scenario Names

**Description:** Scenario names describe technical operations rather than business events.

❌ Wrong:

```
- POST /api/users with valid request body
- Validate email format via regex
- Successful DB insert with transaction rollback on error
```

✅ Correct:

```
- HR staff creates a new employee account with complete profile information
- System rejects registration when the email address format is invalid
- Transfer is fully reversed when one processing step fails
```

**Why it fails:** Implementation details change. When the API is renamed or the database layer is refactored, implementation-level scenario names become inaccurate. Business stakeholders and non-technical team members cannot read or review the suite.
