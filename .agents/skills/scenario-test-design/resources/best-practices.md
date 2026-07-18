# Scenario Test Design — Best Practices

## BP-01: Apply Generation Techniques Systematically

Do not rely on intuition alone when generating scenarios. Apply at least 5 of the 16 techniques documented in [`generation-techniques.md`](generation-techniques.md) to ensure that different dimensions of coverage are addressed.

**Why this matters:** Each technique surfaces a different class of scenario. Actor analysis (Technique 2) finds permission gaps. Sequence analysis (Technique 16) finds race conditions and interrupted-flow bugs. Using a single technique creates blind spots that only become visible as production defects.

## BP-02: Resolve All Ambiguities Before Designing Scenarios

If requirements contain vague or underspecified language, seek clarification at Step 1 before producing any scenario. Never silently assume.

**Clarification question templates:**

- "When [condition A occurs], should the system [option X] or [option Y]?"
- "Does [role R] have permission to perform [action Z]?"
- "What is the exact maximum or minimum value allowed for [field X]?"
- "If [external system] does not respond, what is the timeout threshold?"

**If no one is available to answer:** Document every assumption with a visible **[ASSUMPTION]** tag and include it in the output. Flag any unresolved question as an **[OPEN QUESTION]** for stakeholder confirmation.

## BP-03: Group Scenarios by User Journey, Not by Screen or Module

Organize the scenario suite into groups that reflect real-world business processes:

```
❌ Wrong (organized by screen):
  - Login Page scenarios
  - Dashboard scenarios
  - Settings scenarios

✅ Correct (organized by journey):
  - User Onboarding Journey (register → verify → first login → complete profile)
  - Fund Transfer Journey (initiate → OTP verification → confirm → notification)
  - Account Management Journey (change password, update profile, close account)
```

**Why this matters:** Business stakeholders can review and understand journey-based groups. Screen-based organization mirrors the UI structure and breaks apart flows that logically belong together.

## BP-04: Prioritize Using a Risk-Based Approach

Not all scenarios carry equal importance. Assign priorities based on the potential impact and the likelihood of failure:

```
Priority = Impact × Likelihood

P1 – Critical:
  Any scenario where failure would result in data loss, financial error, system unavailability, or a core business flow being blocked.

P2 – High:
  Negative cases for primary validation rules; scenarios covering frequent user paths.

P3 – Medium:
  Edge cases and boundary conditions that do not affect the core function when they fail.

P4 – Low:
  Cosmetic issues; scenarios covering extremely rare real-world conditions.
```

**Application:** When scope must be reduced, cut P4 first, then P3. P1 scenarios are never negotiable.

## BP-05: Use State Transition Diagrams for Complex Systems

For any feature whose primary objects have multiple states, draw a state transition diagram before beginning scenario identification. This prevents missing state-dependent behaviors.

```
Example — document approval workflow:

[Draft] --submit-> [Pending Review]
[Pending Review] --approve-> [Active]
[Pending Review] --reject-> [Rejected]
[Active] --suspend-> [Suspended]
[Suspended] --reactivate-> [Active]
[Active] --close-> [Closed]
[Rejected] --revise-> [Draft]
[Closed] -> (terminal state — no further transitions)

Scenarios derived from this diagram:
  - Each valid state transition
  - Each invalid transition: Submit from Closed; Approve from Draft
  - Terminal state enforcement: Attempt to reopen a Closed document
```

## BP-06: Always Include Disfavored User Scenarios

For any feature involving sensitive data, financial transactions, or access control, include at least one scenario representing a user who deliberately attempts to misuse the system.

**Categories to consider:**

- **Unauthorized access:** Attempting to view or modify another user's resources
- **Privilege escalation:** Performing an action outside the permitted role
- **Input manipulation:** Submitting unexpected values (negative amounts, overflow values, injection payloads)
- **Replay attacks:** Re-submitting a previously processed request
- **Flow bypass:** Skipping a mandatory step (OTP, confirmation, approval)

## BP-07: Design Every Scenario to Be Fully Independent

Each scenario must be self-contained:

- Preconditions describe all required system state and data in full.
- Test data suggestions are specific and concrete.
- No scenario references the output or state produced by another scenario.

**Common pattern:** Use named test fixtures or setup scripts to establish preconditions. Reference the fixture by name in the precondition block rather than requiring manual preparation.

## BP-08: Write Scenario Names as Business Statements

A scenario name is a summary of the business case being tested, not a description of a technical action.

**Formula:** `[Actor] + [Action / Goal] + [Context / Condition]`

```
✅ Good:
  - "Customer completes a transfer to an account at the same bank"
  - "System rejects a transaction when the source account has insufficient funds"
  - "Administrator deactivates an account flagged for suspicious activity"

❌ Poor:
  - "Test case 1"
  - "Happy path transfer"
  - "Validate balance check"
```

## BP-09: Review the Scenario List With Stakeholders Before Execution

Before beginning test execution, walk through the scenario overview table (not necessarily the full detail cards) with:

- **BA / Product Owner:** Confirm that scenarios correctly reflect the stated business requirements
- **Development team:** Confirm that known technical edge cases are represented
- **User representative (if available):** Confirm that scenarios reflect realistic usage patterns

**Output of the review:** Formal sign-off, or a list of gaps to be addressed before execution begins.

## BP-10: Traceability Is Mandatory, Not Optional

Every scenario must reference at least one BR/FR. Every BR/FR must be covered by at least one scenario. There are no exceptions.

**Practical reasons:**

- When a requirement changes, the impacted scenarios can be identified immediately.
- When scope must be reduced, the team knows exactly which requirements lose coverage.
- For audit and compliance purposes, it provides evidence that every requirement was tested.

## BP-11: Use Scenario Chains for Long Multi-Step Journeys

Rather than building one very long scenario, design a chain of shorter independent scenarios that together represent the full user journey. Each scenario in the chain stands alone.

```
Multi-step journey: Employee applies → Manager approves → HR confirms → Welcome email sent

Chain design:
  SC-01: New employee submits registration with complete information
    → Exit state: "Profile in Pending Approval status"

  SC-02: Manager approves a pending profile
    [Precondition: A profile in Pending Approval status exists — set up independently]
    → Exit state: "Profile in Approved status, awaiting HR confirmation"

  SC-03: HR confirms approved profile and triggers welcome communication
    [Precondition: A profile in Approved status exists — set up independently]
    → Exit state: "Employee Active, welcome email delivered"
```

Each scenario in the chain can be executed independently using appropriate fixture data.

## BP-12: Document All Assumptions and Open Questions Explicitly

Never silently assume. Every assumption must appear in the output in a structured, visible form.

```
Assumptions:
  - [ASSUMPTION-01] The default daily transfer limit is $50,000.00. BR-03 does not state the specific value; this figure is assumed based on industry norms.
  - [ASSUMPTION-02] OTP validity is 5 minutes. FR-07 states that OTPs expire but does not specify the duration; 5 minutes is assumed based on common implementation practice.

Open Questions:
  - [OQ-01] After a gateway timeout, can the user retry immediately, or must they wait? → Needs confirmation from the BA before SC-14 can be finalized.
  - [OQ-02] Is there a maximum number of OTP retries per transaction? → Needs confirmation from the Security team before SC-09 can be finalized.
```
