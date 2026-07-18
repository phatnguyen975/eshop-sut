# Error Guessing — Anti-Patterns

## AP-01: Using Error Guessing as the Primary (or Only) Test Design Technique

**Mistake:** Skipping systematic techniques (EP/BVA, Decision Table, State Transition) and relying on Error Guessing alone to design the test suite.

**Consequence:** No formal coverage guarantee. The test suite covers only the defects the tester happened to think of. Large, systematic gaps in equivalence class coverage, boundary coverage, and transition coverage remain untested — and unknown. These gaps become production defects.

**Correct approach:** Apply systematic techniques first to establish a formal coverage baseline. Apply Error Guessing afterward to supplement with additional cases that systematic techniques are unlikely to produce.

## AP-02: Unjustified Guesses — No Rationale Documented

**Mistake:** Adding test cases based on "gut feel" or habit without documenting why each case is suspected to reveal a defect.

**Examples of unjustified guesses:**

- "I'll test with 0 because that's always a good idea"
- "I'll test null because null is tricky"
- "I'll try a very long string"

Without a documented rationale linking the guess to a specific suspected defect mechanism, the test case:

- Cannot be evaluated ("is this actually testing something meaningful?")
- Cannot be maintained ("why is this test here? is it still relevant?")
- Cannot be defended during test review ("what defect does this target?")

**Correct approach:** Every error guess must have a documented rationale: which defect category, why this specific value, based on what experience or historical data. "Testing 0 because price calculations with 0 quantity may produce a division by zero — seen in BR-003 where unit price = total / quantity" is a justified guess.

## AP-03: Duplicating Existing Systematic Coverage

**Mistake:** Adding error guessing test cases that exercise the same equivalence classes and boundaries already covered by EP/BVA or Decision Table test cases — without adding any new coverage.

**Example:** If EP/BVA already has a test case for an empty username field (EC-05, invalid), adding an error guessing test case for "empty username" duplicates it without new value.

**Consequence:** Wasted effort. The error guessing test cases increase the test suite size without increasing defect detection capability. Time that could be spent on genuinely uncovered areas is consumed by redundant execution.

**Correct approach:** Review the existing systematic test suite before generating error hypotheses (Step 1 of the design process). Explicitly identify what is already covered. Design error guessing test cases only for areas the systematic suite does not reach.

## AP-04: Testing Special Values Without Taxonomy — Random Special Values

**Mistake:** Testing a handful of "classic" values (null, 0, empty string, -1) without systematically working through an error taxonomy, missing entire defect categories.

**Consequence:** The test suite covers the most obvious special values but misses: floating-point precision errors, Unicode/encoding defects, date boundary faults, concurrency issues, integration failure modes, configuration-dependent behavior, and many other categories that a taxonomy would surface.

**Correct approach:** Use the error taxonomy as a structured checklist. For each category, ask whether it applies to the feature under test. This ensures breadth of coverage across defect categories, not just depth in the values the tester already knew to test.

## AP-05: No Prioritization — Treating All Guesses as Equal

**Mistake:** Generating a large fault list without prioritizing by risk, then running out of time before the most important test cases are designed or executed.

**Consequence:** When time runs out (as it always does), the remaining undesigned or unexecuted test cases are dropped arbitrarily. The last items on the list — which may be the highest risk — are not tested. There is no way to know whether the abandoned items were important.

**Correct approach:** Prioritize every fault hypothesis by Risk = Probability × Impact before designing test cases. Design and execute High priority items first. If time runs out, the remaining unexecuted items are the lowest-risk ones — a defensible, documented decision.

## AP-06: Missing Expected Results

**Mistake:** Writing error guessing test cases that specify "test with value X" but do not specify what the correct system behavior should be.

**Example:** "Test with username = `'john '`" — no expected result specified.

**Consequence:** The test case is not executable. During test execution, the tester cannot determine pass/fail without an expected result. Different testers may evaluate the same execution result differently. Defects may be overlooked because the tester does not know what "correct" looks like.

**Correct approach:** Every test case must specify the expected result — what the system should do if the code is correct. "Username `'john '` should be rejected with error `'Username may not contain trailing spaces'`" or "Username `'john '` should be trimmed and treated as `'john'`" — either is acceptable as long as it is explicit and derived from the requirements.

## AP-07: Combining Multiple Hypotheses in One Test Case

**Mistake:** Designing one test case that tests several different error hypotheses simultaneously (e.g., username = `<script>alert(1)</script>` with password = `' OR 1=1 --` to test both XSS and SQL injection at once).

**Consequence:** Defect masking. If the test case fails, it is unclear which hypothesis caused the failure — or whether both did, or just one. If the test passes, it is unclear whether both defects are absent or one masked the other. Root cause analysis is impeded.

**Correct approach:** One hypothesis per test case. Test XSS via the username field in one test case; test SQL injection via the username field in a separate test case. If both are present in one case and the test fails, the failure is unambiguous.

## AP-08: Applying Error Guessing Without Relevant Experience or Knowledge

**Mistake:** A tester with no domain knowledge, no historical defect data, and no taxonomy applying Error Guessing purely through uninformed intuition — "what might go wrong with a login page? Maybe try admin/admin."

**Consequence:** The resulting test cases reflect popular knowledge (try admin/admin, try empty fields) but miss the domain-specific and implementation-specific defects that would actually be found. The test suite provides a false sense of additional coverage while delivering little additional defect detection.

**Correct approach:** Error Guessing is most valuable when the tester has relevant knowledge to contribute. If domain knowledge is lacking:

- Use the error taxonomy as a substitute for experience
- Consult developers, architects, or business analysts who have implementation knowledge
- Mine historical defect data from similar features or projects
- Apply Checklist-Based Testing (a structured ISTQB technique) instead of or alongside Error Guessing

## AP-09: Not Revisiting Error Guesses When Requirements Change

**Mistake:** Treating the fault list and error guessing test cases as static artifacts that do not need updating when requirements evolve.

**Consequence:** Error guessing test cases may become obsolete (testing scenarios that no longer apply) or may miss new defect-prone areas introduced by requirement changes. The supplementary test suite drifts out of sync with the system.

**Correct approach:** Review the fault list when requirements change. Ask: "Do any of the existing hypotheses no longer apply? Have new defect-prone areas been introduced?" Update the fault list and test cases accordingly. This is especially important for: new integrations added, business logic changes, security requirement additions.
