# Decision Table Reduction Guide

## Purpose

Step-by-step procedures for reducing the full decision table into the collapsed (optimized) table. Use during **Step 3** of the design process.

→ Use [`output-template.md`](output-template.md) for the recommended format.

## Overview of Reduction

Table reduction has two operations, applied in sequence:

1. **Remove Impossible Rules** — eliminate rules that cannot occur in reality
2. **Merge Rules via Don't Care** — combine rules with identical actions that differ in exactly one condition

Both operations reduce the total number of test cases without losing logical coverage.

## Operation 1: Removing Impossible Rules

### What Is an Impossible Rule?

A rule is impossible when its combination of condition values cannot occur in the real system. No test case should be derived from an impossible rule.

### Two Types of Impossible Rules

Not all impossible rules carry the same certainty. The key distinction determines whether stakeholder confirmation is required before removal:

**Type 1 — Structurally Impossible (proven by the requirements themselves)**

The impossibility is directly and unambiguously stated or logically derived from the BR/spec — not inferred by the tester. Examples:

- The spec explicitly defines two conditions as mutually exclusive: "A customer is either new OR existing — never both" (BR-001).
- Two conditions are logically contradictory by definition: "Status = ACTIVE" AND "Status = CLOSED" cannot both be true for the same record simultaneously.
- The same BR defines both conditions and their mutual exclusion in the same sentence.

For Type 1, **No stakeholder confirmation required.** Document the source BR/spec reference as the proof of impossibility. The rationale speaks for itself.

**Type 2 — Assumed Impossible (inferred by the tester, not proven by the spec)**

The tester believes the combination cannot occur based on reasoning, intuition, or domain knowledge — but the spec does not explicitly state it. Examples:

- "A cancelled order can't have a successful payment" — seems logical, but data migration, admin overrides, API race conditions, or legacy records might allow it.
- "An account with zero balance can't have a transaction in progress" — plausible but not explicitly ruled out in the spec.
- Any combination where the impossibility relies on how the system works rather than what the spec says.

For Type 2, **Stakeholder confirmation is mandatory before removal.** What appears impossible to the tester may be a valid edge case the developer must handle. Document the confirmation (who confirmed, when).

### Decision Procedure

1. Review each rule in the full table. For each rule, ask: "Can this specific combination of condition values actually occur in the system?"
2. For every candidate impossible rule, classify it:
   - **Type 1:** Is the impossibility directly proven by a specific BR or spec statement? → cite the source; proceed to Step 4 without confirmation
   - **Type 2:** Is the impossibility an inference or assumption not explicitly in the spec? → confirmation required; proceed to Step 3
3. **(Type 2 only)** Confirm with a stakeholder (product owner, business analyst, or developer). Ask explicitly: "Can this combination [C1=X AND C2=Y] ever occur — through any path, including admin tools, API calls, data migration, or legacy data?" Document: who confirmed, when, and what was said.
4. Mark the rule as `IMPOSSIBLE` in the table with its type and rationale:
   - **Type 1:** `IMPOSSIBLE (Type 1) — proven by BR-[N]: "[quote or reference]"`
   - **Type 2:** `IMPOSSIBLE (Type 2) — confirmed by [Name], [Date]: "[summary]"`
5. After all impossible rules are classified and Type 2 rules are confirmed, remove them from the working table. Keep a copy of the full table with all impossible rules marked for traceability.

## Operation 2: Merging Rules via Don't Care

### Formal Merging Criterion

Two rules R₁ and R₂ may be merged if and only if:

- **Criterion A:** R₁ and R₂ produce **exactly the same set of actions** (identical action entries in every action row)
- **Criterion B:** R₁ and R₂ differ in the value of **exactly one condition**

If both criteria are satisfied: merge the two rules into one. Replace the differing condition with `—` (Don't Care).

### Why Both Criteria Are Required

- **Without Criterion A:** Merging rules with different actions would create a rule that incorrectly represents behavior — some cases in the merged rule would have the wrong action set.
- **Without Criterion B:** Merging rules that differ in two or more conditions creates ambiguity — which condition actually doesn't matter? The formal criterion prevents invalid merges.

### Merging Procedure

1. Scan the table for pairs of rules that satisfy both criteria.
2. For each valid pair, verify:
   - List the actions in R₁: [A1, A3]
   - List the actions in R₂: [A1, A3]
   - Are they identical? Yes → proceed
   - Which condition differs? C3 (T in R₁, F in R₂) → C3 becomes Don't Care
3. Create the merged rule:
   - All conditions same as R₁/R₂ except the differing one → replace with `—`
   - Actions: same as both R₁ and R₂ (they are identical)
   - Label: "R₁+R₂" or renumber as appropriate
   - Document: "C3 is Don't Care because A1+A3 apply regardless of C3 value"
4. Remove R₁ and R₂ from the table. Add the merged rule.
5. Check if the merged rule is now eligible for further merging with another rule. Apply iteratively.
6. Stop when no further valid merges are possible.

## Verification After Reduction

After completing reduction, verify:

- **Coverage check:** Every rule in the full table (excluding impossibles) must be covered by exactly one rule in the reduced table. A rule with Don't Care (`—`) covers all original rules where that condition was T and where it was F.
- **Count check:**
  - Full table: `2ⁿ` rules
  - Minus impossible rules: `N` rules removed
  - Minus merged rules: `M` pairs merged (each pair saves 1 rule)
  - Reduced table should have: `2ⁿ − N − M` rules
- **No overlap check:** No two rules in the reduced table should cover the same original rule.
- **No gap check:** No rule from the full table (excluding impossibles) should be uncovered by the reduced table.

## Common Reduction Mistakes

| Mistake                                                                      | Consequence                                                                     | Detection                                                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Merging rules with different action sets                                     | Merged rule misrepresents behavior for some combinations                        | Recheck all action rows are identical before merging                                               |
| Merging rules that differ in 2+ conditions                                   | Don't Care incorrectly applied to conditions that do matter                     | Count differing conditions before merging                                                          |
| Removing Type 2 impossible rules without confirmation                        | Valid edge case removed from test suite                                         | Classify the rule first; confirm Type 2 with stakeholder before removal                            |
| Treating all impossible rules as Type 2 (asking confirmation for everything) | Unnecessary friction; delays design for rules already proven impossible by spec | Classify correctly: If a BR explicitly proves impossibility, it is Type 1 — no confirmation needed |
| Merging rules where one is already a merged rule with Don't Care             | May create invalid cascading merge                                              | Verify all values of the Don't Care condition still satisfy Criterion A                            |
| Stopping reduction too early                                                 | Leaving mergeable rules as separate test cases (redundancy)                     | After each merge, re-scan all remaining rule pairs                                                 |
| Applying Don't Care to conditions with 3+ values without checking all values | Only checked 2 of 3 values; the third may trigger different actions             | For extended entry, verify all k values of the condition produce identical actions                 |
