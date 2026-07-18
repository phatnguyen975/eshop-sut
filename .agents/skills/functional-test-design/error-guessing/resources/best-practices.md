# Error Guessing — Best Practices

## BP-01: Always Apply Systematic Techniques First

**Practice:** Complete EP/BVA, Decision Table, State Transition, or Use Case Testing before applying Error Guessing. Error Guessing supplements; it does not start.

**Why:** Systematic techniques provide formal coverage guarantees. Error Guessing provides no coverage metric — its value depends entirely on the quality of the guesses. Starting with systematic techniques ensures the foundation is solid; Error Guessing then improves on top of it.

**How:** Before generating any error hypotheses, confirm that the systematic test suite is complete and reviewed. Document which classes, boundaries, decisions, and states are already covered. Error Guessing then targets explicitly the gaps.

## BP-02: Use Structured Fault Attack, Not Pure Intuition

**Practice:** Use the error taxonomy as a structured checklist during fault list generation. Work through each major category and ask whether it applies to the feature under test.

**Why:** Pure intuition produces test cases in the categories the tester already knows well, while systematically missing other categories. The taxonomy ensures breadth — even if the tester's depth in some categories is limited.

**How:** Reference [`error-taxonomy.md`](error-taxonomy.md) during Step 3. For each top-level category, spend 2–5 minutes asking "could this apply here?" before moving to the next category.

## BP-03: Mine Historical Defect Data

**Practice:** Before generating error hypotheses, review past bug reports for the feature under test, adjacent features, or similar features from past projects.

**Why:** Defects cluster. Where bugs were found before, they tend to be found again — in the same code, with the same patterns. Historical defect data is the highest-quality input for Error Guessing because it is evidence, not inference.

**How:**

- Search the bug tracker for the component or feature name
- **Look for:** defect type (what broke), root cause (why it broke), trigger (what input caused it)
- Translate past defect patterns into current-feature hypotheses: "This component failed previously when [X]; could the same pattern exist here with [Y]?"

## BP-04: Consult Domain Experts

**Practice:** Interview developers, architects, business analysts, or operations engineers about where they expect the system to be fragile or where implementation assumptions were made.

**Why:** Developers know the implementation risks that are invisible in the requirements. "I hardcoded this to handle up to 1000 items — beyond that it will fail" is the kind of knowledge that only comes from the implementation team. Operations teams know what has caused incidents in the past.

**How:** Run a structured 15–30 minute interview with the relevant expert:

- "What parts of this feature are you most worried about?"
- "What assumptions did the implementation make that might not always hold?"
- "Have you seen similar failures in other parts of the system?"
- "What input or condition would you most want us to test?"

## BP-05: Document Every Hypothesis Rationale

**Practice:** For every fault hypothesis in the fault list, write a rationale that explains why the defect is suspected — not just what is being tested.

**Why:** Rationale enables test case evaluation ("is this testing the right thing?"), maintenance ("is this still relevant?"), and knowledge transfer ("why was this test added?"). A fault list without rationale degrades into a collection of arbitrary test cases over time.

**Required rationale elements:**

- Which defect mechanism is suspected (e.g., integer overflow, null reference, race condition)
- Why it is suspected in this specific feature (experience, historical data, taxonomy reasoning, code complexity)
- What specific input or condition is expected to trigger it

## BP-06: Prioritize Relentlessly

**Practice:** Assign every fault hypothesis a risk priority (High / Medium / Low) and design/execute test cases in priority order. Never begin execution without having prioritized.

**Why:** Error Guessing sessions always run out of time before the fault list is exhausted. Prioritization ensures that when time runs out, the remaining items are the lowest-risk — not arbitrary. An unprioritized list means the last items dropped may be the most important.

**Prioritization criteria:**

- **High:** Defect is likely (known pattern, high code complexity, historical occurrence) AND impact is significant (data loss, security breach, financial error, complete feature failure)
- **Medium:** Moderate probability OR moderate impact
- **Low:** Low probability AND low impact

## BP-07: Focus on the Gaps Systematic Techniques Leave

**Practice:** Explicitly target the known blind spots of systematic techniques when generating error hypotheses.

**Key blind spots to target:**

| Gap                                              | Error Guessing Target                                                                              |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| EP assumes middle-of-class values are equivalent | Specific values within valid classes that trigger special code paths (e.g., 0 in a positive range) |
| BVA tests specification boundaries               | Implementation boundaries not in the spec (DB field limits, API payload limits, type maximums)     |
| Decision Table tests conditions simultaneously   | Conditions applied in specific sequences; conditions changing during evaluation                    |
| State Transition tests defined states            | Data values within events that violate guard conditions; events applied at state boundaries        |
| All systematic techniques test single sessions   | Multi-session effects, cache stale state, data created in one session causing failure in another   |

## BP-08: One Hypothesis Per Test Case

**Practice:** Design each test case to target exactly one fault hypothesis. Do not combine multiple hypotheses in a single test case.

**Why:** If a test case fails, the cause must be immediately identifiable. If multiple hypotheses are combined and the test fails, it is unclear which hypothesis was triggered — additional investigation is needed to isolate the defect. If the test passes, it is unclear whether all hypotheses are genuinely safe or one masked another.

**Exception:** Multiple very closely related special values for the same hypothesis (e.g., testing three different Unicode character ranges for the same string encoding hypothesis) can be combined in one test case if the expected result is identical for all values and defect masking is not a concern.

## BP-09: Include Both Positive and Negative Error Guesses

**Practice:** Error guessing typically targets negative scenarios (what breaks), but also includes positive error guesses — suspected cases where the system might incorrectly reject a valid input.

**Why:** Defects go both ways. A validation function with an off-by-one error might incorrectly reject the exact boundary value — this is a positive case (valid input) that fails. Including positive error guesses surfaces false-negative defects.

**Examples of positive error guesses:**

- "The system might reject email addresses with `'+'` in the local part (e.g., `user+tag@domain.com`) — these are valid per RFC 5321 but often mistakenly blocked"
- "The system might reject passwords containing special characters like `'%'` or `'&'` despite them being valid"

## BP-10: Update the Fault List When Defects Are Found

**Practice:** When a test case reveals a defect, review the fault list and ask: "Does this defect suggest related hypotheses we haven't tested yet?" Add them immediately.

**Why:** Defects cluster not just historically but also conceptually. A developer who made one boundary error in a module likely made similar errors nearby. A defect in handling one special value often indicates similar handling of related special values. Finding one defect is a signal to look for more in the same area.

**How:**

- Analyze the root cause of the found defect
- Generate 2–5 related hypotheses based on the same root cause pattern
- Add them to the fault list at High priority
- Design and execute test cases for them immediately
