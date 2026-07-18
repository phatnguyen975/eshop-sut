# Decision Table Testing — Anti-Patterns

## Purpose

Anti-patterns are recurring mistakes in applying Decision Table Testing that reduce test effectiveness, create false confidence, or produce incorrect tables. Each entry includes the mistake, its consequence, and the correct approach.

## AP-01: Building the Reduced Table Directly (Skipping the Full Table)

**Mistake:** Jumping straight to a "simplified" table by instinct, skipping the construction of the full 2ⁿ table.

**Why it happens:** The full table seems wasteful when many rules will be reduced. Experienced practitioners may feel they can "see" the merged rules immediately.

**Consequence:** Without the full table as a reference, there is no proof that all combinations have been considered. Combinations that are not obviously impossible or mergeable are silently dropped. The resulting test suite has undetected gaps.

**Correct approach:** Always construct the full table first. The full table is the completeness proof. Reduction is a separate, subsequent step applied to a known-complete starting point.

## AP-02: Treating Conditions as Test Data Values

**Mistake:** Putting raw input values into the condition rows instead of behavioral categories.

**Example (wrong):** Condition row = "Purchase amount = $75"  
**Example (correct):** Condition row = "Purchase amount class = Medium ($50–$99.99)" (after EP)

**Consequence:** The table becomes tied to specific test data rather than behavioral logic. Continuous ranges cannot be exhaustively represented in a finite table. The "condition" is no longer a categorical variable — it's a data point.

**Correct approach:** Conditions must represent discrete behavioral categories. For range-based inputs, apply Equivalence Partitioning first to define classes, then use those classes as condition values.

## AP-03: Marking Don't Care Without Formal Verification

**Mistake:** Marking a condition as Don't Care (`—`) based on intuition or assumption — "this condition probably doesn't matter here" — without formally verifying that the action sets are identical for all values of that condition.

**Consequence:** The Don't Care hides a real behavioral difference. The merged rule covers combinations that should produce different actions. A defect in those combinations will not be caught.

**Correct approach:** Don't Care is only valid when:

1. The action sets of the two rules being merged are **provably identical**
2. The two rules differ in **exactly one condition**

Both must be verified explicitly. If in doubt, do not merge — keep the rules separate.

## AP-04: Applying the Same Confirmation Rule to All Impossible Rules

**Mistake — variant A:** Removing every impossible rule without any confirmation or documented rationale — treating all impossible rules as self-evident.  
**Mistake — variant B:** Always requiring stakeholder confirmation for every impossible rule, including those already proven impossible by the spec itself — creating unnecessary friction and delays.

**Why both are wrong:** Not all impossible rules are the same. There are two types, each with a different handling requirement:

- **Type 1 (Structurally impossible):** The impossibility is directly and explicitly proven by a BR or spec statement. **Example:** BR-001 states "a loyalty card requires a prior purchase; new customers have none" — `C1=New` AND `C2=HasLoyaltyCard` is impossible by definition. No stakeholder confirmation needed; the BR is the proof. Document the source BR.
- **Type 2 (Assumed impossible):** The impossibility is an inference by the tester, not stated in the spec. **Example:** "a cancelled order can't have a succeeded payment" — plausible, but data migration, race conditions, or admin tools might allow it. Stakeholder confirmation is mandatory before removal.

**Consequence of Variant A:** What the tester assumes is impossible may be a legitimate edge case — data migration records, API calls that bypass UI validation, admin overrides, or legacy records. Removing without rationale means no one can audit the decision.  
**Consequence of Variant B:** Unnecessary confirmation requests slow down design and signal to stakeholders that the QA process lacks analytical rigor.

**Correct approach:** Classify every candidate impossible rule before acting. Type 1 → document the source BR and remove. Type 2 → confirm with at least one stakeholder (PO, BA, or developer), record the confirmation (who confirmed, when, scope), then remove. Retain all impossible rules in the full table artifact for traceability regardless of type.

## AP-05: Missing Implied Conditions

**Mistake:** Only listing conditions that are explicitly named in the requirements, ignoring implied conditions.

**Example:** Requirement states "VIP customers receive free shipping." The tester defines only: Is VIP customer? (T/F). And designs test cases only for the True case.

**Consequence:** The complementary condition (non-VIP behavior) is untested. If the system incorrectly grants free shipping to non-VIPs, it will not be caught.

**Correct approach:** For every condition identified, explicitly define and include its complement. For every "If X" statement, ask "what happens when NOT X?" and add that to the condition enumeration.

## AP-06: Missing Implied Actions

**Mistake:** Only listing actions explicitly mentioned in the requirements. Omitting default outcomes, error states, or "no-op" cases.

**Example:** Requirements define discounts to apply. The tester lists A1 (15%), A2 (10%), A3 (20%) but forgets to add A4 (0% / No discount) as an explicit action.

**Consequence:** Rules that result in no action have no defined expected result. During test execution, "no action" is ambiguous — the tester cannot distinguish between "no action was correctly taken" and "no action was incorrectly taken."

**Correct approach:** Always include an explicit action for every possible outcome, including "no discount applied", "access denied", "request rejected", "error displayed". The no-op or default case must be an explicit, testable action.

## AP-07: Leaving Action Cells Blank Ambiguously

**Mistake:** Using blank cells in the action section without a clear convention — sometimes blank means "does not apply", sometimes it means "not yet evaluated", sometimes it means "unknown".

**Consequence:** Table is unreadable and unauditable. During test case derivation, it is impossible to know whether a blank means "verified not applicable" or "forgotten."

**Correct approach:** Establish a consistent notation before building the table:

- `X` = action applies
- _(blank)_ = action explicitly does not apply (not skipped — actively evaluated and confirmed as N/A)
- `?` or `TBD` = not yet determined (flag as incomplete; do not use for test derivation)

Every cell must be consciously filled.

## AP-08: Using Decision Table for Single-Condition Logic

**Mistake:** Applying Decision Table Testing when only one condition exists. For example, building a 2-rule table for "user is logged in (T/F) → show dashboard / show login page."

**Consequence:** Overkill. The table adds complexity without benefit. Domain Testing (EP/BVA) handles single-condition behavior more efficiently.

**Correct approach:** Decision Table Testing is the right technique when **two or more conditions interact** to produce different behaviors. For single conditions, use Domain Testing. For sequential behaviors, use State Transition Testing.

## AP-09: Confusing Mutually Exclusive Conditions with Impossible Rules

**Mistake:** Treating mutually exclusive conditions as separate valid test cases, or conversely, treating a genuinely valid combination as impossible because it seems unlikely.

**Example of first error:** Defining C1="New Customer" and C2="Existing Customer" as independent T/F conditions and designing 4 rules — including C1=T AND C2=T — without marking it as impossible.  
**Example of second error:** Marking C1=T AND C3=T (new customer with coupon) as impossible because the coupon is "ignored" — but the combination itself can occur and the system must handle it (by ignoring the coupon, not by preventing the combination).

**Consequence (first):** Test suite includes an untestable rule based on a contradictory combination.  
**Consequence (second):** A valid system behavior (new customer presents coupon → coupon silently ignored → 15% applied) is not tested.

**Correct approach:** Mutually exclusive conditions that cannot simultaneously be true → mark as impossible (confirm first). Conditions that CAN simultaneously occur but produce a specific defined behavior → keep as a valid rule and define its action correctly.

## AP-10: Not Verifying Reduction Completeness

**Mistake:** After performing Don't Care merges, failing to verify that all original rules are still covered by the reduced table.

**Consequence:** A valid rule from the full table may have been accidentally dropped — not merged into a Don't Care rule, not marked impossible, just lost. The gap is invisible without a coverage check.

**Correct approach:** After reduction, perform a coverage check: list every non-impossible rule from the full table and confirm it is covered by exactly one rule in the reduced table. Document which original rules each reduced rule covers.

## AP-11: Applying Decision Table to Sequential / Temporal Logic

**Mistake:** Using Decision Table Testing for requirements that describe sequences of states or events over time (e.g., "if user clicks A, then B becomes available, then if user clicks B, C is shown").

**Consequence:** Decision tables model simultaneous condition combinations at a single point in time. Sequential behavior cannot be correctly represented. Critical paths through a workflow will be missed.

**Correct approach:** Use **State Transition Testing** for sequential state-based behavior. Decision Table Testing can complement State Transition Testing by modeling the conditions within each state — but cannot replace it for temporal/sequential logic.

## AP-12: Deriving Test Cases from the Full Table Instead of the Reduced Table

**Mistake:** Using the full (unoptimized) table to generate test cases, executing all 2ⁿ rules without applying reduction.

**Consequence:** Massive redundancy in the test suite. Rules that differ only by a Don't Care condition produce identical system behavior — running both wastes execution time without finding additional defects. For large tables (5+ conditions), this is practically infeasible.

**Correct approach:** Test cases are always derived from the **reduced table**. The full table is a construction and verification artifact — not an execution artifact.
