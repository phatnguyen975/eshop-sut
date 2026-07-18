# FSM Components Extraction Guide

## Purpose

Step-by-step guidance for identifying all FSM components from requirements before constructing any diagram or table. Use during **Step 1** of the design process. Incomplete component identification produces an incorrect STD, which cascades into an incorrect STT and incorrect test cases.

## Component 1: States

### What Qualifies as a State?

A state is a **named, distinguishable condition** of the system. Two situations qualify as different states if — and only if — they cause the system to respond differently to at least one event.

**Test for a valid state:** "If the system is in situation X vs. situation Y, does the same event produce a different outcome?" If yes → X and Y are different states. If no → they may be the same state.

### Linguistic Signals in Requirements

| Signal phrase                          | Likely state         |
| -------------------------------------- | -------------------- |
| "The account is..."                    | Account status state |
| "Once the order is placed..."          | Order placed state   |
| "While the user is logged in..."       | Authenticated state  |
| "After the third failed attempt..."    | Locked/blocked state |
| "When the subscription has expired..." | Expired state        |
| "The device is in standby..."          | Standby state        |

### Common State Modeling Mistakes

**Mistake 1: Modeling the initial pseudostate as a real state**

- **Wrong:** States = {Start, Active, Suspended, Closed}
- **Correct:** Initial pseudostate → Active (the first real state); States = {Active, Suspended, Closed}

The initial pseudostate is not a state — it is the entry point from which the FSM begins. It has no incoming transitions, no events fire in it, and the system cannot return to it.

**Mistake 2: Treating processing steps as states**

- **Wrong:** States = {Validating, Processing, Committing, Complete}

If "Validating", "Processing", and "Committing" are internal implementation steps with no external observable behavior difference between them — they are not separate states from a black-box perspective. Collapse them into one state if they react identically to all external events.

**Mistake 3: Too many states due to data variation**

- **Wrong:** States = {Balance=$0, Balance=$1–$100, Balance=$101–$500, ...}
- **Correct:** Use Equivalence Partitioning to classify balance ranges into named states (InCredit, Overdrawn) based on behavioral difference — not on every possible data value.

### Output Format

| State ID | State Name | Description                          | Entry Condition                     | Source (Req/BR) |
| -------- | ---------- | ------------------------------------ | ----------------------------------- | --------------- |
| S1       | Active     | Account is open and in good standing | Initial deposit made; balance ≥ 0   | BR-001          |
| S2       | Suspended  | Account temporarily locked           | 3 consecutive failed login attempts | BR-005          |
| S3       | Closed     | Account permanently terminated       | Closure request processed           | BR-012          |

## Component 2: Events

### What Qualifies as an Event?

An event is a **point-in-time occurrence** that the system can receive and process. It is the input to the state machine — the trigger that causes state evaluation.

### Types of Events

**User-initiated events:**

- Form submissions ("Submit Order", "Click Pay")
- Button clicks ("Cancel", "Approve", "Reject")
- API calls (POST /checkout, DELETE /account)

**System-generated events:**

- Timeouts ("Session expires after 15 minutes of inactivity")
- Scheduled triggers ("Subscription renewal check runs daily at midnight")
- Async callbacks ("Payment gateway returns SUCCESS/FAILURE")

**Hardware/external events:**

- Sensor readings ("Temperature exceeds threshold")
- Hardware interrupts ("Power button pressed")
- External API responses ("Third-party identity verification returns PASS/FAIL")

### Linguistic Signals in Requirements

| Signal phrase                            | Likely event            |
| ---------------------------------------- | ----------------------- |
| "When the user clicks..."                | User action event       |
| "Upon receiving payment confirmation..." | External callback event |
| "After 30 minutes of inactivity..."      | Timeout event           |
| "When the administrator approves..."     | Admin action event      |
| "Once the batch job completes..."        | System trigger event    |

### Output Format

| Event ID | Event Name      | Type              | Description                               | Source (Req/BR) |
| -------- | --------------- | ----------------- | ----------------------------------------- | --------------- |
| E1       | Submit Order    | User action       | User confirms cart and initiates checkout | BR-003          |
| E2       | Payment Success | External callback | Payment gateway returns approval          | BR-008          |
| E3       | Payment Failure | External callback | Payment gateway returns decline           | BR-008          |
| E4       | Cancel Order    | User action       | User cancels before payment               | BR-004          |
| E5       | Session Timeout | System trigger    | No activity for 30 minutes                | BR-015          |

## Component 3: Guard Conditions

### What Qualifies as a Guard Condition?

A guard condition is a **boolean expression** that must evaluate to true for a specific transition to fire when its event occurs. Guards differentiate transitions that share the same source state and event but lead to different destination states.

**Format in UML notation:** `Event [Guard Condition] / Action`

**Example:** `Withdraw [Amount ≤ Balance] / Deduct amount` and `Withdraw [Amount > Balance] / Display overdraft warning` — same event ("Withdraw"), same source state ("In Credit"), but different guards produce different transitions.

### Linguistic Signals in Requirements

| Signal phrase                                | Likely guard condition        |
| -------------------------------------------- | ----------------------------- |
| "Only if the balance is sufficient..."       | [balance ≥ withdrawal amount] |
| "Provided that the account is verified..."   | [account.verified = true]     |
| "When the retry count is below the limit..." | [retryCount < maxRetries]     |
| "If and only if all fields are complete..."  | [allFieldsComplete = true]    |

### Output Format

| Guard ID | Associated Event | Condition Expression    | Transition It Qualifies | Source (Req/BR) |
| -------- | ---------------- | ----------------------- | ----------------------- | --------------- |
| G1       | Withdraw         | Amount ≤ AccountBalance | In Credit → In Credit   | BR-006          |
| G2       | Withdraw         | Amount > AccountBalance | In Credit → Overdrawn   | BR-006          |
| G3       | Close Account    | Balance = 0             | Any → Closed            | BR-012          |

## Component 4: Actions

### What Qualifies as an Action?

An action is an **observable, verifiable output** produced during a transition. Actions are what testers assert in expected results.

**Important:** Actions must be specific enough to verify. "System processes the request" is not verifiable. "Order status field in DB updates to PROCESSING; confirmation email sent to user@domain.com" is verifiable.

### Types of Actions

- **UI/display:** "Error message 'Incorrect PIN' displayed on screen"
- **State persistence:** "Account status field updated to SUSPENDED in database"
- **Communication:** "Confirmation email sent to registered email address"
- **Redirect:** "User redirected to /dashboard"
- **Audit/logging:** "Event written to audit_log table with timestamp"
- **Silent no-op:** "No visible change; event silently ignored" (valid for some invalid transitions)

### Output Format

| Action ID | Description      | Observable Indicator                                 | Triggered By Transition          | Source (Req/BR) |
| --------- | ---------------- | ---------------------------------------------------- | -------------------------------- | --------------- |
| A1        | Account created  | Record appears in accounts table; welcome email sent | Initial → Active                 | BR-001          |
| A2        | Balance deducted | Account's balance decremented by withdrawal amount   | In Credit → In Credit (withdraw) | BR-006          |
| A3        | Error displayed  | UI shows "Insufficient funds" message                | Guard G2 failure                 | BR-006          |

## Component 5: Initial Pseudostate and Final States

### Initial Pseudostate

- **Representation:** Solid filled circle in UML.
- **Rules:** Has exactly one outgoing unconditional transition to the first real state; has no incoming transitions; is NOT a state the system can be in.
- **In the STT:** Do NOT include the initial pseudostate as a row — it is not a state.

### Final States

- **Representation:** Bullseye or double-bordered rectangle in UML.
- **Rules:** Have no outgoing valid transitions within the modeled scope; the system cannot leave a final state in the model.
- **In the STT:** Include final states as rows — events can still be applied to them (all will be invalid transitions, since no valid transitions exist from a final state).

### Output Format

| Type                | Name   | Description                                            | Source |
| ------------------- | ------ | ------------------------------------------------------ | ------ |
| Initial pseudostate | —      | Entry point; first real state = Active                 | BR-001 |
| Final state         | Closed | Account permanently terminated; no further transitions | BR-012 |

## Implied Components: What Requirements Don't Say

Requirements typically describe the "happy path" explicitly and leave negative behavior implied or unstated. Before proceeding to the STD, actively ask:

- **For every event:** "What happens if this event fires in each state where it is NOT explicitly described?" — these produce invalid transition cells in the STT.
- **For every state:** "Are there events that are valid in other states but not in this one? What does the system do when those events arrive here?"
- **For every guard condition:** "What is the complementary guard? What happens when the guard evaluates to false?" — each guard typically produces two transitions (one for true, one for false).
- **For every terminal action sequence:** "What does the system do if the user attempts to continue after reaching a final state?" — final states must handle all events as invalid transitions.

Document all implied behaviors before constructing the STD. If behavior is truly undefined, raise it as a specification gap with the product owner or BA before proceeding.
