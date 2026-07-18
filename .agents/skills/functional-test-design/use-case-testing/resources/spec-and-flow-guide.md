# Use Case Spec Validation and Flow Analysis Guide

## Part 1: Use Case Specification Validation Guide

### Purpose

Validate the use case specification before starting test design. A defective spec produces a defective test suite. Use during **Step 1** of the design process.

### Validation Checklist for Use Case Specifications

#### Actor(s)

- [ ] At least one primary actor is identified.
- [ ] The actor is clearly defined — who or what initiates the use case.
- [ ] If multiple actor types can initiate the same use case with different behavior, each is listed separately.
- [ ] Secondary actors (systems the SUT interacts with during the use case) are identified if their behavior affects the flow.

#### Preconditions

- [ ] All preconditions are specific and testable — not vague ("system is available").
- [ ] Each precondition can be verified before test execution.
- [ ] Each precondition can be set up reliably (via DB script, API call, UI setup, or test fixture).
- [ ] The preconditions are necessary — would test results be affected if a precondition were not met?

**Common spec gaps to raise:**

- "User has an account" → **Clarify:** active? verified? specific role?
- "System is in a clean state" → **Clarify:** which data must exist or not exist?
- Implicit prerequisites (e.g., product must be in stock before purchase) not listed

#### Main Flow

- [ ] Steps are numbered explicitly.
- [ ] Each step is clearly either an actor action or a system response — not mixed.
- [ ] No implicit steps (steps the spec assumes but does not state).
- [ ] The flow leads to a single, clearly defined success endpoint.
- [ ] No branching conditions in the main flow — branching belongs in alternate flows.

**Common spec gaps to raise:**

- Step says "system processes the request" — what does processing entail? What are the observable indicators?
- Step says "user clicks Submit" — what does the system do immediately after?
- Flow ends with "user is logged in" — what exactly does this mean? Token issued? Session created? Page redirect?

#### Alternate Flows

- [ ] Each alternate flow has a unique ID (AF-1, AF-2, etc.).
- [ ] Each alternate flow references the specific main flow step where it branches ("Branches from Step 2").
- [ ] Each alternate flow is classified: **optional flow** or **exception flow**.
- [ ] Each alternate flow defines its endpoint: rejoins main flow at step N / terminates use case.
- [ ] If it rejoins the main flow, which step does it rejoin at?

**Common spec gaps to raise:**

- "User enters invalid data" — which step? What constitutes invalid? What does the system do?
- Alternate flow with no endpoint — does the use case terminate or loop?
- Missing system failure alternate flows — what happens if the database is unreachable at Step 3?

#### Business Rules / Constraints

- [ ] All business rules are explicit (not "as per business logic").
- [ ] Boundary conditions in business rules are numerically specified (e.g., "max 5 attempts", not "several").
- [ ] The behavior for rule violations is specified (reject? warn? limit?).

#### Postconditions

- [ ] Success postconditions are listed (what the system state is after successful completion).
- [ ] Failure/abandonment postconditions are listed (what the system state is after each failure endpoint).
- [ ] Database state changes are specified (not just UI state).
- [ ] Audit/logging events are specified if the system produces them.
- [ ] Email/notification behaviors are specified if applicable.

### Handling Spec Gaps

When a gap is found:

| Gap Type                              | Action                                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Ambiguous precondition                | Raise with PO/BA; document the assumption made if proceeding                                                      |
| Missing alternate flow                | Raise with PO/BA; if the system behavior is inferable from business rules, document the inferred flow and confirm |
| Undefined endpoint for alternate flow | Raise with PO/BA; do not assume a loop or termination                                                             |
| Missing postconditions                | Raise with PO/BA; add inferred postconditions (database changes implied by the main flow) and confirm             |

Never design test cases based on unresolved ambiguities. A test case derived from an ambiguous spec is not a valid test case — its pass/fail criterion is undefined.

## Part 2: Flow Analysis Guide

### Purpose

Systematically enumerate all flows from the use case specification and discover hidden alternate flows. Use during **Step 2** of the design process.

### Flow Inventory Output Format

| Flow ID | Type      | Description                                                          | Branches From | Endpoint                  | Classification |
| ------- | --------- | -------------------------------------------------------------------- | ------------- | ------------------------- | -------------- |
| MF      | Main      | Step 1 → Step 2 → Step 3 → Step 4 → Step 5                           | —             | Success                   | —              |
| AF-1    | Alternate | Invalid credentials at Step 2; system shows error; return to Step 1  | Step 2        | Rejoin MF Step 1          | Exception      |
| AF-2    | Alternate | Account locked after max attempts; session terminated                | Step 2        | Terminate                 | Exception      |
| AF-3    | Alternate | User selects "Forgot Password" at Step 1; redirect to password reset | Step 1        | Terminate (exits this UC) | Optional       |

→ Use [`output-template.md`](output-template.md) for the recommended format.

### Discovering Hidden Alternate Flows

The specified alternate flows in the UC spec are the starting point — not the complete list. Apply these techniques to discover missing flows:

#### Technique 1: "What If?" at Every Main Flow Step

For each step in the Main Flow, ask:

**For actor action steps:**

- What if the actor provides invalid data? (invalid format, out-of-range value, missing required field)
- What if the actor provides data that violates a business rule?
- What if the actor takes no action (timeout)?
- What if the actor cancels or navigates away mid-flow?

**For system response steps:**

- What if the external service/system the SUT calls is unavailable?
- What if the external service returns an error response?
- What if the system's response takes longer than the defined timeout?
- What if the database query returns unexpected results (no records, multiple records, corrupted data)?

#### Technique 2: Business Rule → Alternate Flow Mapping

For each business rule/constraint:

- What triggers a violation of this rule?
- What is the system's response to a violation?
- Does the violation constitute an alternate flow not yet in the spec?

**Example:**

- **BR:** "max 5 failed login attempts before lockout."
- **AF:** "At exactly the 5th failed attempt, system locks account" → must be documented as its own alternate flow if not already in the spec

#### Technique 3: Postcondition Reverse Analysis

For each postcondition in the spec:

- What alternate flow could result in this postcondition NOT being met?
- Is there an alternate flow for each "failure" postcondition listed?

**Example:**

- **Postcondition:** "audit event published to logging service."
- **Hidden alternate flow:** "What if the logging service is unavailable? Does the use case still complete? Is an error returned? Is the main transaction rolled back?"

#### Technique 4: Concurrency Analysis

- Can two actors initiate the same use case simultaneously?
- If yes: what happens when they act on the same data at the same time?
- Does the system serialize access (locking)? What is the experience of the second actor?

**Example:** Two users attempt to book the last available seat simultaneously. One succeeds; the other receives an "unavailable" alternate flow.

#### Technique 5: State Boundary Analysis

- At which steps does the system change state?
- What if the actor repeats an action that has already succeeded (idempotency)?
- What if the actor retries a failed action immediately?

### Flow Classification Reference

| Alternate Flow Type                    | Definition                                                       | Example                                                            |
| -------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Optional flow**                      | A valid path the actor can take that differs from the default    | User selects a different payment method; user adds a discount code |
| **Exception flow — input validation**  | System rejects actor input due to format or business rule        | Invalid email format; password too short                           |
| **Exception flow — business rule**     | System rejects a valid-format input due to a business constraint | Account locked; insufficient balance; item out of stock            |
| **Exception flow — system failure**    | An external dependency fails during the flow                     | Payment gateway timeout; database unreachable                      |
| **Exception flow — concurrent access** | Another actor or process has modified the relevant data          | Item purchased by another user; record modified by admin           |
| **Optional flow — navigation**         | Actor navigates to a related use case mid-flow                   | "Forgot Password" during Login; "Add New Address" during Checkout  |
