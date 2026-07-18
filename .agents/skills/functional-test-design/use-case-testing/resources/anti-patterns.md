# Use Case Testing — Anti-Patterns

## AP-01: Testing Only the Main Flow (Happy Path Only)

**Mistake:** The test suite contains only S1 (Main Flow). Alternate flows are not tested.

**Consequence:** Alternate flows — where most production defects occur — are completely untested. Exception handling, validation logic, and system recovery paths are invisible to the test suite. Users encounter defects in paths that were never tested.

**Correct approach:** Every alternate flow must appear in at least one scenario. Apply risk-based selection to prioritize, but document all untested flows explicitly as acknowledged risks.

## AP-02: Designing Test Cases Without a Scenario Matrix

**Mistake:** Writing test cases directly from reading the use case spec, without first constructing a Scenario Matrix.

**Consequence:** Ad hoc test case selection. Some alternate flow combinations are covered, others are accidentally omitted. There is no coverage artifact to audit — no way to prove which paths were covered and which were not.

**Correct approach:** Always build the Scenario Matrix before writing any test case. The matrix is the coverage artifact; test cases implement the matrix.

## AP-03: Missing Preconditions or Vague Preconditions

**Mistake:** Test cases with no precondition, or with a vague precondition like "user is logged in" or "system is operational".

**Consequence:** Tests are non-deterministic. Two testers running the same test from different starting states get different results. Defects cannot be reliably reproduced. Test results are not meaningful.

**Correct approach:** Preconditions must be specific and verifiable: "User account with username='john_doe', role='CUSTOMER', status='ACTIVE' exists in the users table." Every precondition must be achievable via a documented setup procedure.

## AP-04: Verifying Only the UI Response, Ignoring Postconditions

**Mistake:** Test case's expected result is "system shows success message". No backend assertions.

**Consequence:** The use case may appear to succeed at the UI level while backend state is incorrect: the database record was not updated, the audit log was not written, the email was not sent. Integration defects between layers are invisible.

**Correct approach:** Every postcondition in the use case spec must have a corresponding test assertion. DB records, audit logs, emails, and related entity states must all be verified — not just the UI response.

## AP-05: Confusing Alternate Flow Trigger with Expected Result

**Mistake:** Test case specifies the alternate flow trigger (e.g., "password is incorrect") as both the input and the expected result.

**Consequence:** The test case does not specify what the system should DO in response to the trigger. The assertion is missing; pass/fail cannot be determined.

**Correct approach:** The trigger is the input that forces the path. The expected result is the system's specific response: "HTTP 401 returned; error message 'Invalid email or password' displayed; no session token issued; login_attempts counter incremented by 1."

## AP-06: Treating Combinatorial Explosion as "Must Test Everything"

**Mistake:** Attempting to test every logically possible combination of alternate flows, producing hundreds of scenarios for a single use case.

**Consequence:** Test execution becomes infeasible. The team either runs out of time (leaving the last 80% of scenarios unexecuted) or maintains a test suite too large to run sustainably.

**Correct approach:** Apply risk-based selection + impossibility pruning + pairwise coverage. Document explicitly which combinations are not being tested and why. A test suite that can be executed is more valuable than a test suite that cannot.

## AP-07: Not Discovering Hidden Alternate Flows

**Mistake:** Treating the alternate flows listed in the spec as complete. Not applying "What if?" analysis or business rule mapping to find undocumented flows.

**Consequence:** Alternate flows that are implicit in business rules or system design but not documented in the spec are never tested. These undocumented paths are disproportionately likely to contain defects precisely because they were not explicitly considered during design.

**Correct approach:** Apply systematic hidden flow discovery (see [`spec-and-flow-guide.md`](spec-and-flow-guide.md) — Part 2) before building the Scenario Matrix. Raise all discovered hidden flows with the PO/BA for confirmation.

## AP-08: Selecting Test Data Before Identifying Flows

**Mistake:** Starting test design by thinking about what data to input, then building test cases around that data, without first completing the Scenario Matrix.

**Consequence:** Data-driven test design misses paths. The tester tests the paths that their data happens to exercise, rather than the paths that the use case defines. Some alternate flows are never triggered because no test data was selected to force them.

**Correct approach:** Complete the Scenario Matrix first. Then, for each scenario, select test data that reliably triggers the intended path. Data selection follows flow identification — not the other way around.
