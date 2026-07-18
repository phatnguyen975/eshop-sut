# Decision Table Construction Guide

## Purpose

Step-by-step guidance for constructing the full (unoptimized) decision table. Use during **Step 2** of the design process.

→ Use [`output-template.md`](output-template.md) for the recommended format.

## Notation Standards

### Condition Entry Notation

| Symbol       | Meaning                                                      |
| ------------ | ------------------------------------------------------------ |
| `T`          | True / Yes / Condition is satisfied                          |
| `F`          | False / No / Condition is not satisfied                      |
| `—`          | Don't Care (only in reduced table, never in full table)      |
| `A, B, C...` | Specific values for extended entry (multi-valued conditions) |

### Action Entry Notation

| Symbol         | Meaning                                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| `X`            | This action applies for this rule                                                 |
| _(blank)_      | This action does NOT apply for this rule                                          |
| `IMPOSSIBLE`   | This rule is logically impossible (cannot occur)                                  |
| Specific value | For extended entry: the actual output value (e.g., "15%", "GRANTED", "ERROR-001") |

**Important:** A blank in the action section means "this action does not apply" — NOT "undefined" or "unknown". Every action cell must be consciously marked. Leaving cells blank without explicit intent is an anti-pattern.

## Step-by-Step Construction for Limited Entry Tables

### 1. Determine the Number of Rules

For n binary conditions: **Total rules = 2ⁿ**

### 2. Fill Condition Rows Using Binary Counting Pattern

List conditions top-to-bottom (C1, C2, C3...). Fill columns left-to-right using this pattern:

- **Last condition (Cₙ):** Alternate T/F every 1 column: T F T F T F T F...
- **Second-to-last (Cₙ₋₁):** Alternate every 2 columns: T T F F T T F F...
- **Third-to-last (Cₙ₋₂):** Alternate every 4 columns: T T T T F F F F...
- **Pattern:** Each condition alternates every `2^(position from bottom - 1)` columns

**Example — 3 conditions, 8 rules:**

| Condition | R1  | R2  | R3  | R4  | R5  | R6  | R7  | R8  |
| --------- | --- | --- | --- | --- | --- | --- | --- | --- |
| C1        | T   | T   | T   | T   | F   | F   | F   | F   |
| C2        | T   | T   | F   | F   | T   | T   | F   | F   |
| C3        | T   | F   | T   | F   | T   | F   | T   | F   |

### 3. Evaluate Each Rule Against Requirements

For each column (rule), read the combination of condition values and evaluate:

- What actions does this combination trigger according to the requirements?
- Is this combination logically impossible? (Mark `IMPOSSIBLE`, do not remove yet)
- Mark each action row with `X` or leave _blank_ accordingly.

### 4. Verify Completeness

After filling all cells:

- Count total rules that should match `2ⁿ`.
- Every action cell must be consciously marked (no ambiguous blanks).
- At least one action should be marked for each non-impossible rule.

## Step-by-Step Construction for Extended Entry Tables

### 1. Enumerate Values for Each Condition

List all possible values for each condition:

- **C1:** values v₁₁, v₁₂, v₁₃ (k₁ values)
- **C2:** values v₂₁, v₂₂ (k₂ values)
- **C3:** values v₃₁, v₃₂, v₃₃, v₃₄ (k₃ values)

### 2. Calculate Total Rules

**Total rules = k₁ × k₂ × k₃ × ... × kₙ**

**Example:** Month (4 values) × Day class (5 values) × Year type (2 values) = 40 rules

### 3. Fill Condition Rows Systematically

Use the same rotation principle as binary, adapted for multiple values:

- **Last condition:** Cycle through all its values every 1 column
- **Second-to-last:** Cycle through all values every k(last) columns
- **Third-to-last:** Cycle through all values every k(last) × k(second-to-last) columns

**Example — Month (M1/M2/M3/M4) × Day (D1/D2/D3/D4/D5) × Year (Y1/Y2):**

| Condition | R1  | R2  | R3  | R4  | R5  | R6  | ... | R40 |
| --------- | --- | --- | --- | --- | --- | --- | --- | --- |
| Month     | M1  | M1  | M1  | M1  | M1  | M1  | ... | M4  |
| Day       | D1  | D1  | D2  | D2  | D3  | D3  | ... | D5  |
| Year      | Y1  | Y2  | Y1  | Y2  | Y1  | Y2  | ... | Y2  |

### 4. Evaluate Each Rule Against Requirements

For each column (rule), read the combination of condition values and evaluate:

- What actions does this combination trigger according to the requirements?
- Is this combination logically impossible?
- Mark each action row with the applicable value (for extended entry, use specific output values such as `"APPROVED"`, `"15%"`, `"ERROR-003"`) or leave _blank_ if the action does not apply to this rule.

### 5. Verify Completeness

After filling all cells:

- Count total rules: should match the product formula `k₁ × k₂ × ... × kₙ`.
- Every action cell must be consciously marked — no ambiguous blanks.
- At least one action value should be specified for each non-impossible rule.

## Handling "What Happens When..." Gaps

During construction, you will encounter rules where the requirement does not explicitly define the behavior. Do not skip these rules or leave actions blank. Options:

1. **Raise as spec gap:** Document the undefined rule, flag it to the product owner, and wait for clarification before proceeding.
2. **Apply most conservative interpretation:** Mark the action as the safest default (often "error" or "no action") and note it as an assumption requiring confirmation.
3. **Derive from system invariants:** If the system has documented default behavior for undefined cases, apply it and cite the source.

Never silently assume undefined behavior.
