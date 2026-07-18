# Decision Table Testing — Theoretical Background

## 1. What Is a Decision Table?

A decision table is a tabular representation of conditional logic that maps every meaningful combination of condition values to the corresponding set of actions (outcomes) the system must perform. It is a tool for both **specification** (clarifying requirements) and **test design** (deriving test cases).

In software testing, Decision Table Testing is classified as a **black-box test design technique** in the ISTQB Foundation Level Syllabus. It is used when the system's behavior is determined by combinations of multiple conditions — not by a single condition in isolation.

## 2. Anatomy of a Decision Table

A standard decision table has four regions:

```
┌─────────────────────┬──────┬──────┬──────┬──────┐
│ Stub                │  R1  │  R2  │  R3  │  R4  │  ← Rules (columns)
├─────────────────────┼──────┼──────┼──────┼──────┤
│ Condition 1         │  T   │  T   │  F   │  F   │
│ Condition 2         │  T   │  F   │  T   │  F   │  ← Condition entries
├─────────────────────┼──────┼──────┼──────┼──────┤
│ Action 1            │  X   │      │  X   │      │
│ Action 2            │      │  X   │      │      │  ← Action entries
│ Action 3 (no-op)    │      │      │      │  X   │
└─────────────────────┴──────┴──────┴──────┴──────┘
```

**Four regions:**

- **Stub (row headers):** Lists all conditions (upper half) and all actions (lower half).
- **Condition entries:** The values each condition takes in each rule.
- **Action entries:** Whether each action applies in each rule.
- **Rules (columns):** Each column represents one unique combination of condition values — one rule maps to one test case.

## 3. Table Entry Types

### 3.1 Limited Entry Decision Table

Condition values are restricted to **binary values** only — **True/False**, **Yes/No**, or **0/1**.

- Each condition has exactly 2 possible values
- **Total rules = 2ⁿ** where n = number of conditions
- Simplest form; most common in practice

**Example:** 3 binary conditions → 2³ = 8 rules

### 3.2 Extended Entry Decision Table

Condition values can be **multi-valued** (more than two possible states).

- Each condition can take k values; **total rules = k₁ × k₂ × ... × kₙ**
- Used when a condition has more than two meaningful states (e.g., account status = `ACTIVE` / `SUSPENDED` / `CLOSED`)
- More expressive but generates more rules; reduction is especially important

**Example:** 3 conditions with 2, 3, and 2 values → 2 × 3 × 2 = 12 rules

### 3.3 Mixed Entry Decision Table

Some conditions are limited entry (binary), others are extended entry (multi-valued). Common in practice when some conditions are boolean flags and others are multi-state enumerations.

## 4. The State Explosion Problem

As the number of conditions increases, the number of rules grows exponentially:

| Binary Conditions | Total Rules |
| ----------------- | ----------- |
| 2                 | 4           |
| 3                 | 8           |
| 4                 | 16          |
| 5                 | 32          |
| 6                 | 64          |
| 7                 | 128         |
| 10                | 1,024       |

This is the **State Explosion Problem** — the primary challenge with Decision Table Testing for complex systems. It is managed through:

- **Table reduction** (merging rules via Don't Care conditions)
- **Eliminating impossible rules**
- **Pre-grouping conditions using Equivalence Partitioning** (converting continuous values into discrete classes before building the table)
- **Splitting the table** into multiple sub-tables for independent subsystems

## 5. Full Decision Table vs. Collapsed (Reduced) Decision Table

### Full Decision Table

The **full decision table** (also called the unoptimized or expanded table) contains every possible combination of condition values — 2ⁿ rules for n binary conditions. It is constructed first, before any reduction.

**Purpose:** Proof of completeness. Building the full table ensures no combination is overlooked before optimization begins.

### Collapsed Decision Table

The **collapsed decision table** (also called the reduced or optimized table) is derived from the full table by:

1. Removing impossible rules
2. Merging rules that produce the same actions and differ in exactly one condition (Don't Care entries)

**Purpose:** The collapsed table is what drives test case derivation. Each remaining rule becomes one test case.

**ISTQB principle:** Test cases are derived from the **collapsed** table, not the full table. The full table is an intermediate analytical artifact.

## 6. Don't Care Conditions

A **Don't Care** condition (notated as `—`) in a merged rule means: the value of this condition does not affect which actions apply for this rule.

### Formal Merging Criterion

Two rules R₁ and R₂ may be merged into one rule with a Don't Care if and only if:

1. R₁ and R₂ produce **exactly the same set of actions**
2. R₁ and R₂ differ in the value of **exactly one condition**

If either criterion is violated, the merge is invalid.

### Cascading Merges

After an initial merge, the resulting merged rule may itself be eligible for further merging with another rule. Apply iteratively until no further valid merges exist.

### Don't Care in Test Execution

When a Don't Care condition appears in a test case derived from a merged rule, the tester must choose a concrete value to use during execution. Choose the value most likely to reveal a defect if the condition were to unexpectedly matter — typically the boundary value or the less-common value.

## 7. Impossible Rules

An **impossible rule** is a rule where the combination of condition values cannot occur in the real system.

**Common causes of impossible rules:**

- **Mutually exclusive conditions:** Two conditions that cannot both be true simultaneously (e.g., a user cannot be both "new customer" and "existing loyalty member").
- **Logically dependent conditions:** The value of one condition constrains the possible values of another (e.g., if account is CLOSED, balance cannot be > 0)
- **Physical/domain constraints:** Real-world constraints that prevent a combination (e.g., a date of February 31st)

## 8. Relationship to Other Techniques

### Decision Table + Equivalence Partitioning

When a condition involves a continuous range (e.g., "purchase amount"), use EP first to partition it into discrete classes. Use the class (not the raw value) as the condition entry in the decision table. This prevents unbounded condition values and keeps the table finite.

**Example:** Instead of "Amount = any value", use EP to define:

- **Class A:** amount < $50
- **Class B:** $50 ≤ amount ≤ $100
- **Class C:** amount > $100

Then use A, B, C as the condition values in the table.

### Decision Table + BVA

After the decision table identifies which conditions and combinations to test, use BVA to select the specific test data values within each condition class. The decision table governs _which path_ to test; BVA governs _which exact value_ to use for range-based inputs.

### Decision Table vs. State Transition Testing

| Aspect    | Decision Table                                  | State Transition                                     |
| --------- | ----------------------------------------------- | ---------------------------------------------------- |
| Focus     | Combinations of conditions at one point in time | Sequences of states and transitions over time        |
| Structure | Columns = rules (simultaneous combinations)     | Diagram/table = events causing state changes         |
| Best for  | Business rules, eligibility, pricing            | Object lifecycle, session management, workflow steps |

## 9. Strengths and Limitations

### Strengths

- **Completeness guarantee:** Systematic enumeration ensures no combination is accidentally omitted.
- **Specification tool:** Building the table reveals gaps, contradictions, and ambiguities in requirements.
- **Traceability:** Every test case traces to a specific rule, and every rule to a requirement.
- **Defect prevention:** Most effective when applied before development begins (shift-left).

### Limitations

- **State explosion:** Number of rules grows exponentially with condition count.
- **Single-point-in-time analysis:** Does not model sequences or temporal behavior.
- **Binary-condition assumption:** Most natural for boolean conditions; multi-valued conditions increase complexity rapidly.
- **Specification dependence:** Table quality is entirely dependent on requirement quality; missing conditions produce incomplete tables.
- **Intra-condition boundaries not covered:** Decision Table confirms which combination to test, not which specific values within a range — BVA must complement it.
