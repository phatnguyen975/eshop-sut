# Decision Table Testing — Best Practices

## Purpose

Best practices for applying Decision Table Testing effectively and correctly. These are grounded in ISTQB Foundation Level Syllabus (v4.0), industry QA practice, and the BBST (Black Box Software Testing) methodology.

## BP-01: Apply EP to Range Conditions Before Building the Table

**Practice:** When a condition involves a continuous range (numeric, date, string length), apply Equivalence Partitioning first to define discrete behavioral classes. Use those classes as condition values in the decision table — never raw ranges.

**Why:** A continuous range has infinite possible values, making it impossible to enumerate in a finite table. EP converts the infinite range into a finite set of classes where behavior is expected to be identical within each class.

**How to apply:**

1. Identify the range condition (e.g., "purchase amount")
2. Apply EP to define classes (e.g., Low: < $50 / Medium: $50–$99.99 / High: ≥ $100)
3. Use the class labels (Low / Medium / High) as the condition values in the extended entry table

**Follow-up:** After the decision table identifies which combination to test, use BVA to select the specific test data value within each class (e.g., for High class: test with $99.99, $100.00, $100.01).

## BP-02: Combine with BVA for Range-Based Condition Test Data

**Practice:** After the decision table is fully reduced and test cases are derived, use Boundary Value Analysis to choose the specific input values for any range-based condition.

**Why:** The decision table confirms _which combination of conditions_ to test. BVA confirms _which specific value_ within a range class to use as test data. These are complementary concerns — the decision table alone does not guarantee boundary testing within a class.

**Example:**

- Decision table rule: "Purchase amount = High AND Loyalty = True → 10% discount"
- BVA test data for "High" class (≥ $100): use $99.99 (boundary just below), $100.00 (exact boundary), $100.01 (just inside)
- Each BVA point becomes a separate test execution of the same decision table rule

## BP-03: Always Document Rationale for Impossible Rules and Don't Cares

**Practice:** For every impossible rule removed and every Don't Care applied, document the rationale. The required documentation differs by impossible rule type:

**For Type 1 (Structurally impossible — proven by spec):**

- Which conditions are involved
- The source BR or spec statement that proves impossibility
- No stakeholder confirmation needed — the BR is the proof

**For Type 2 (Assumed impossible — inferred by tester):**

- Which conditions are involved
- Why the combination is believed to be impossible
- Who confirmed it (name, date, and any scope limitations noted)

**For Don't Care merges:**

- Which original rules are covered
- Why the differing condition does not affect the action set

**Why:** Without documented rationale, the table cannot be audited, updated when requirements change, or defended during test review. A Don't Care without rationale looks like an error — and may actually be one. An impossible rule without rationale cannot be re-evaluated when requirements change.

**Minimum documentation format:**

```
Impossible Rule R1+R2: C1=T AND C2=T
Type: Type 1 (Structurally impossible)
Rationale: BR-001 states "a loyalty card requires at least one prior purchase; new customers have no prior purchases" — these conditions are mutually exclusive by spec definition.
Source: BR-001. Stakeholder confirmation: not required.

Impossible Rule R9: C3=CANCELLED AND C4=PAYMENT_SUCCEEDED
Type: Type 2 (Assumed impossible)
Rationale: Inferred — a cancelled order should not have a succeeded payment. Not explicitly prohibited in spec; race condition or admin override could allow it.
Confirmed with: Jane Smith (PO), 2026-07-09. Scope: new system only; legacy data excluded.

Don't Care in R3+4: C3=—
Rationale: BR-003 prohibits coupon use for new customers. Whether C3=T or C3=F, the action set is {A1: 15%} only. Verified: R3 actions={A1}, R4 actions={A1} — identical.
Covers original rules: R3 (C3=T), R4 (C3=F).
```

## BP-04: Use Decision Table Construction as a Requirements Review Tool

**Practice:** Build the initial decision table collaboratively — or share it with the product owner and developer immediately after construction, before any test cases are written.

**Why:** The process of systematically enumerating all combinations almost always surfaces:

- Specification gaps (rules with undefined behavior)
- Contradictions in requirements (two rules producing conflicting actions)
- Implicit assumptions that different stakeholders resolve differently
- Missing conditions or actions that no one noticed were absent

Finding these issues during table construction is significantly cheaper than finding them during test execution or in production.

**How:** In Agile environments, use the Three Amigos approach — Product Owner + Developer + QA construct or review the table together during sprint planning or backlog refinement.

## BP-05: Classify Impossible Rules Before Deciding on Confirmation

**Practice:** Before acting on a candidate impossible rule, classify it as Type 1 or Type 2. Apply the appropriate handling for each type — do not treat all impossible rules identically.

**Type 1 — Structurally impossible (proven by spec):** The impossibility is directly stated or logically derived from a specific BR or spec statement without inference. The tester can cite the exact source.

- **Action:** Document the source BR as proof. Remove without stakeholder confirmation.
- **Signal:** "BR-[N] explicitly states these conditions are mutually exclusive."

**Type 2 — Assumed impossible (inferred by tester):** The impossibility relies on the tester's reasoning about how the system works, not on an explicit spec statement. The tester cannot cite a specific BR that proves it.

- **Action:** Confirm with at least one stakeholder (PO, BA, or developer) before removing. Ask: "Can this combination ever occur — through any path, including admin tools, API calls, data migration, or legacy data?"
- **Signal:** "I believe this combination is impossible because..." (note: belief, not proof)

**Why Type 1 does not need confirmation:** Asking a stakeholder to confirm something already proven by the spec they wrote adds friction without adding quality. The spec is the confirmation.

**Why Type 2 always needs confirmation:** What appears logically impossible may be achievable through:

- Direct API calls bypassing UI validation
- Data migration or import processes
- Administrative override functions
- Legacy records predating a constraint
- Race conditions in concurrent systems

**Documentation requirement:** Both types must be documented in the full table with their type label and rationale. This enables re-evaluation when requirements change.

## BP-06: Maintain a Traceability Map Between Tables and Requirements

**Practice:** For every rule in the full table, record which requirement or BR it is derived from. For every rule in the reduced table, record which full table rules it covers. For every test case, record which reduced table rule it derives from.

**Why:** When requirements change, traceability enables immediate identification of which test cases are affected. Without it, the team must re-analyze the entire table from scratch for every requirement change.

**Minimum traceability chain:**

```
BR-001, BR-003 → Full table rules R1–R8 → Reduced rules R3+4, R5, R6, R7, R8 → TC-001 to TC-005
```

## BP-07: Split Large Tables by Dominant Conditions

**Practice:** When the number of conditions exceeds 5–6 (resulting in 32–64+ rules), consider splitting the table into sub-tables grouped by a dominant "context" condition.

**Why:** Tables with many rules are difficult to construct correctly, review, and maintain. Splitting by a dominant condition (e.g., user type = Admin / Standard / Guest) creates smaller, more manageable tables that model the same logic.

**How:**

1. Identify the dominant condition — one whose value most significantly constrains the behavior of other conditions.
2. Create one sub-table per value of the dominant condition.
3. Within each sub-table, the dominant condition is a fixed context, not a variable row.
4. Verify that all sub-tables together cover the same combinations as the original full table.

**Note:** This is an organizational strategy, not a reduction. No rules are eliminated — they are distributed across sub-tables.

## BP-08: Explicitly Define the "No Action" / Default Case

**Practice:** Always include an explicit action row for the default or no-action outcome. Never leave rules with no marked actions — treat them as incomplete.

**Why:** "No action" is a valid, testable system behavior. Without an explicit expected result for these rules, the test case has no pass/fail criterion — it becomes unverifiable.

**Examples of explicit no-action definitions:**

- "Apply 0% discount" (not just a blank discount row)
- "Display no error message; form submits normally"
- "No email notification sent"
- "HTTP 200 returned with unchanged resource state"

## BP-09: Choose Revealing Test Data for Don't Care Conditions

**Practice:** When a test case includes a Don't Care condition (`—`), choose the concrete test data value for that condition carefully — pick the value most likely to expose a defect if the condition unexpectedly matters.

**Why:** Don't Care means the condition _should not_ affect the outcome. But if the implementation is wrong, it might. Choosing a revealing value maximizes the chance of catching such defects.

**Guidance for choosing Don't Care values:**

- Choose the value that is less "safe" or more unusual (e.g., True rather than False if True is the more complex path)
- If the condition has a boundary, choose the boundary value
- Document why that value was chosen

## BP-10: Validate the Reduced Table Before Deriving Test Cases

**Practice:** After completing reduction, perform an explicit validation step before moving to test case derivation:

1. **Count:** reduced rule count = full rule count − impossible rules − merged pairs
2. **Coverage:** every non-impossible full rule is covered by exactly one reduced rule
3. **No overlap:** no two reduced rules cover the same full rule
4. **Completeness:** no further valid merges exist

**Why:** Errors introduced during reduction — missed impossible rules, incorrect Don't Care applications, lost rules — are very hard to detect after test cases are written. Catching them at the table level is faster and cleaner.
