# Conditions and Actions Extraction Guide

## Purpose

This guide covers how to correctly identify conditions and actions from requirements — the most critical and error-prone step in Decision Table Testing. A wrong or incomplete set of conditions/actions produces a wrong table regardless of how well the remaining steps are executed. Use during **Step 1** of the design process.

→ Use [`output-template.md`](output-template.md) for the recommended format.

## What Is a Condition?

A **condition** is an independent variable whose value affects which actions the system performs. Conditions are the "inputs" to the decision logic — the things the system evaluates before deciding what to do.

**Characteristics of a valid condition:**

- Its value can vary independently of other conditions (or its dependency on other conditions is explicitly modeled as an impossible rule).
- Different values of this condition lead to different actions (otherwise it is not a condition — it is irrelevant to the logic).
- Its possible values can be enumerated (binary or multi-valued).

**Linguistic signals in requirements:**

- "If [X]..." → X is a condition
- "When [X] is true/active/enabled..." → X is a condition
- "Given that [X]..." → X is a condition
- "For [customers/users/accounts] who [have/are/hold] [X]..." → X is a condition

## What Is an Action?

An **action** is a dependent outcome — a behavior the system performs as a result of a specific combination of condition values. Actions are the "outputs" of the decision logic.

**Characteristics of a valid action:**

- It is triggered (or not triggered) by specific condition combinations.
- It is observable and verifiable (can be confirmed in test execution).
- It is atomic at the level of the decision being modeled (though it may involve multiple sub-steps internally).

**Linguistic signals in requirements:**

- "Then the system will do [X]..." → X is an action
- "Resulting in [X]..." → X is an action
- "The system will display/apply/grant/reject/calculate [X]..." → X is an action
- "[X] is not permitted/allowed..." → prohibition of X is an action (or constrains a condition)

## Identifying Implied Conditions

### Pattern 1: The Implicit Negative

A requirement states what happens in one case but is silent about the complementary case.

**Example:**

> "VIP customers receive free shipping."

**Explicit:** VIP = True → Free shipping  
**Implied:** VIP = False → Standard shipping (not stated, but must be handled)

**Action:** Define both the explicit condition class AND its complement as condition values.

### Pattern 2: The Exclusive Constraint

A requirement states that two things cannot coexist, implying a condition about their combination.

**Example:**

> "The coupon discount cannot be used in conjunction with the new customer discount."

**Explicit:** Coupon applies a 20% discount; new customer discount applies 15%  
**Implied:** The combination C1=True AND C3=True has a specific (restricted) outcome — not simply the sum of both discounts

**Action:** This combination must appear in the table as a rule with a specific, defined action — not as an impossible rule (it CAN happen; the behavior is defined: apply only one of the discounts).

### Pattern 3: The Unstated Default

A requirement defines behavior for some cases but not all. The unstated cases have an implied default behavior.

**Example:**

> "Premium members get access to advanced features. Members with expired subscriptions see a renewal prompt."

**Implied:** Non-members who are neither premium nor expired have a third outcome (presumably no access, basic prompt, or redirect) that the spec does not mention.

**Action:** Identify and document the "else" case. If the behavior is undefined, raise it as a spec gap before proceeding.

### Pattern 4: The Hidden Prerequisite

A requirement assumes a precondition that must also be modeled as a condition.

**Example:**

> "Apply the referral bonus when the referred user makes their first purchase."

**Hidden conditions:**

- Is the referring user's account still active? (What if the referrer was banned?)
- Is this truly the referred user's first purchase? (How is "first" determined?)

**Action:** Surface and confirm all prerequisite conditions before finalizing the condition list.

## Identifying Implied Actions

### Pattern 1: The Unstated "No-Op"

When no action is triggered, that itself is an action that must be documented.

**Example:** Consider a discount system with two conditions: "Is new customer?" (T/F) and "Has coupon?" (T/F). The requirements state:

> "New customers receive a 15% discount. Customers with a valid coupon receive a 20% discount."

The requirements describe 2 actions (A1: 15% discount, A2: 20% coupon discount) but are silent about the case where the customer is neither new nor holds a coupon (C1=False AND C2=False). This combination is valid — it can and will occur — but no action is explicitly defined for it.

The no-op outcome must be explicitly stated as an action: "Apply 0% discount; order total unchanged." Without this, the table has a blank action row for this rule, which is ambiguous during test execution — the tester cannot distinguish between "no discount is correct" and "the system failed to apply a discount."

### Pattern 2: The Error/Rejection Action

Requirements may define valid scenarios explicitly but not state what happens for invalid/impossible combinations that reach the system.

**Example:**

> "February 30th is an invalid date."

The action for this rule must be defined: "Display error: Invalid date" or "Return HTTP 400" — not simply omitted from the table.

### Pattern 3: The Composite Action

Some rules trigger multiple simultaneous actions. Each atomic action must be listed separately.

**Example:**

> "At the end of December 31st, the next date resets to January 1st of the next year."

This is three atomic actions:

- Reset Day to 1
- Reset Month to January
- Increment Year by 1

List all three as separate action rows in the table.

## Condition Value Enumeration

For each condition, enumerate all meaningful values before building the table.

### Binary Conditions (Limited Entry)

The condition is either true or false; no intermediate states exist.

| Condition         | Values       |
| ----------------- | ------------ |
| Is new customer?  | True / False |
| Has loyalty card? | True / False |
| Has coupon?       | True / False |

### Multi-Valued Conditions (Extended Entry)

The condition has more than two meaningful states.

| Condition         | Values                                |
| ----------------- | ------------------------------------- |
| Account status    | ACTIVE / SUSPENDED / CLOSED           |
| Subscription tier | BASIC / PREMIUM / ENTERPRISE          |
| Month type        | 30-day / 31-day / February / December |

### Range Conditions (Requires EP Pre-Processing)

The condition involves a continuous numeric range. **Do not put raw ranges into the decision table.** Apply Equivalence Partitioning first to create discrete classes.

**Before EP:**

> **Condition:** Purchase amount (any number from $0 to ∞)

**After EP:**

| Class  | Values        |
| ------ | ------------- |
| Low    | $0.00–$49.99  |
| Medium | $50.00–$99.99 |
| High   | ≥ $100.00     |

Use Low / Medium / High as the condition values in the table.

## Mutual Exclusion Constraints

Some pairs (or groups) of condition values cannot coexist. Document these explicitly:

**Format:** "Condition X = [value] AND Condition Y = [value] is impossible because [reason]."

**Examples:**

- "New Customer = True AND Loyalty Card = True → Impossible: a customer cannot be both new and hold a loyalty card simultaneously"
- "Account Status = CLOSED AND Balance > 0 → Impossible: a closed account must have zero balance per system invariant"

These constraints will generate impossible rules in Step 2. Confirm each constraint with a stakeholder before marking as impossible in the table.

## Conditions vs. Test Data: A Common Confusion

A frequent mistake is confusing **conditions** (categories of behavior) with **test data** (specific values used during execution).

| Concept   | Example (Discount System)                             | Role                                    |
| --------- | ----------------------------------------------------- | --------------------------------------- |
| Condition | "Is customer a VIP?"                                  | Determines which rule applies           |
| Test Data | Customer ID: 12345, VIP flag: TRUE                    | Specific input used to execute the test |
| Condition | "Purchase amount class" (after EP: Low/Medium/High)   | Determines which rule applies           |
| Test Data | Purchase amount: $75.00 (Medium class representative) | Specific value used in execution        |

Conditions belong in the decision table. Test data is chosen during test case derivation (Step 4), after the table is built and reduced.
