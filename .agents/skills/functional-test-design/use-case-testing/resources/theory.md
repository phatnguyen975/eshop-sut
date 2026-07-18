# Use Case Testing — Theoretical Background

## 1. Definition and ISTQB Classification

**ISTQB FL definition:**

> "Test cases can be designed from use cases. A use case describes interactions between actors (users or systems) that produce a result of value to a system user or stakeholder. Use cases can be described at the abstract (business) level (business use case) or at the system level (system use case)."

**Core premise:** A system is not a collection of features — it is a provider of value to actors. Use Case Testing verifies that value delivery works correctly for every meaningful path an actor can take.

## 2. What Is a Use Case?

A **use case** is a specification of a sequence of interactions between one or more actors and a system that produces an observable result of value to an actor. Every valid use case has:

- **One primary actor:** The initiator of the use case (human user, external system, or scheduled process)
- **One goal:** A specific outcome the actor wants to achieve
- **Defined scope:** What is inside the system and what is outside

### 2.1 Use Case vs. User Story

These are not the same thing, though they are related:

| Aspect          | Use Case                            | User Story                                              |
| --------------- | ----------------------------------- | ------------------------------------------------------- |
| Format          | Structured specification with flows | Brief statement ("As a... I want... So that...")        |
| Detail level    | Detailed, step-by-step interaction  | High-level intent                                       |
| Alternate flows | Explicitly documented               | Captured as acceptance criteria                         |
| Origin          | UML tradition, Cockburn/Jacobson    | Agile tradition                                         |
| For testing     | Directly drives Use Case Testing    | Requires elaboration into flows before Use Case Testing |

A user story can be the input to Use Case Testing if it is elaborated into flows (main flow + alternate flows + pre/postconditions). Many teams do this elaboration during sprint refinement.

### 2.2 What Qualifies as a Valid Use Case

A valid use case has all four characteristics:

1. **Single goal:** One observable business outcome; if two distinct goals are combined, split into two use cases
2. **Single starting trigger:** Exactly one event initiates the use case (actor action or system event)
3. **Defined endpoint(s):** One or more explicit endpoints — success endpoint and/or failure/abandonment endpoints
4. **Multiple paths:** At minimum a main flow; in practice, multiple alternate flows

## 3. Anatomy of a Use Case Specification

The standard use case specification format (based on Cockburn's Writing Effective Use Cases, widely adopted in industry):

| Field                            | Content                                                                                          | Testing Relevance                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **Use Case ID & Name**           | Unique identifier and human-readable name                                                        | Traceability anchor                                        |
| **Description**                  | One-sentence summary of the goal                                                                 | Confirms scope of test design                              |
| **Actor(s)**                     | Primary and secondary actors                                                                     | Determines test setup (which user/system initiates)        |
| **Preconditions**                | System state required before the use case begins                                                 | Test setup requirements                                    |
| **Main Flow**                    | Step-by-step sequence of actor actions and system responses under ideal conditions               | S1 — the happy path test case                              |
| **Alternate Flows**              | Deviations from the main flow — optional paths and exception paths                               | Source of all non-happy-path scenarios                     |
| **Business Rules / Constraints** | Rules that govern flow execution                                                                 | Trigger conditions for alternate flows; boundary test data |
| **Postconditions**               | Observable state of the system after the use case completes (both success and failure endpoints) | Test assertions beyond UI response                         |

## 4. Flow Types

### 4.1 Main Flow (Basic Flow / Happy Path)

**The main flow describes the ideal case:** the actor provides correct input, all system components function correctly, no business rules are violated, and the goal is successfully achieved.

**Characteristics:**

- Linear sequence with no branching
- Every step is an actor action or system response
- Terminates at the success endpoint
- Forms the basis of S1 — always the first scenario designed

**Testing significance:** If the main flow fails, the use case is entirely broken — this is a critical defect. The main flow must always pass before alternate flows are tested.

### 4.2 Alternate Flows

Alternate flows represent deviations from the main flow. They branch from a specific step in the main flow and either:

- **Rejoin the main flow** at a later step (the deviation is resolved and the use case continues)
- **Terminate the use case** (the goal is not achieved; a failure or abandonment endpoint is reached)

**Two categories of alternate flows (ISTQB):**

| Category            | Description                                                       | Examples                                                                                         |
| ------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Optional flows**  | The actor makes a valid choice that differs from the default path | "User chooses to pay with a different card"; "User selects express shipping instead of standard" |
| **Exception flows** | An error occurs or a business rule is violated                    | "Invalid password entered"; "Payment gateway timeout"; "Insufficient stock"                      |

**Branching notation:** Each alternate flow must reference the main flow step where it branches.  
**Standard notation:** "2a: If the password is incorrect at Step 2, the system displays an error message and returns to Step 1."

## 5. Use Case Scenarios

A **use case scenario** is a complete, end-to-end path through a use case — from the starting trigger to a defined endpoint.

**Mandatory rule (ISTQB):** Every scenario must begin with the main flow. Alternate flows are incorporated into the scenario at the points where they branch from the main flow. A scenario cannot start mid-flow or skip the main flow's starting trigger.

### 5.1 Scenario Matrix Construction

The scenario matrix systematically enumerates all meaningful path combinations:

| Scenario | Path Composition                                            |
| -------- | ----------------------------------------------------------- |
| S1       | Main Flow only (the happy path)                             |
| S2       | Main Flow + AF-1 (first alternate flow)                     |
| S3       | Main Flow + AF-2                                            |
| S4       | Main Flow + AF-1 + AF-2 (if these flows can occur together) |
| ...      | ...                                                         |

**Key constraint:** Only combinations that are logically possible in the system should appear. If AF-1 terminates the use case before AF-2's branching point is reached, the combination AF-1 + AF-2 cannot occur.

### 5.2 Combinatorial Explosion

For a use case with N alternate flows, the theoretical maximum number of scenarios is 2ᴺ (each flow either present or absent). This grows quickly:

**Mitigation strategies:**

1. **Risk-based path selection:** Prioritize by probability of defect × business impact; test high-risk paths first; document low-risk paths as acknowledged.
2. **Pairwise coverage:** Ensure every pair of alternate flows is exercised together in at least one scenario — mathematical reduction while maintaining high defect detection.
3. **Impossibility pruning:** Remove logically impossible combinations (AF-1 terminates before AF-2 can occur).

## 6. Test Data Selection: Role of Other Techniques

Use Case Testing identifies **which paths to test** (the scenario structure). It does not specify **which specific data values** to use within those paths.

Test data selection is delegated to:

| Data Concern                                                     | Applicable Technique                            |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| Input field values (ranges, valid/invalid classes)               | Domain Testing — Equivalence Partitioning + BVA |
| Multiple simultaneous conditions controlling a step's behavior   | Decision Table Testing                          |
| Suspected defect-prone values not covered by systematic analysis | Error Guessing                                  |

**Correct sequencing:**

1. Use Case Testing → identify all scenarios (flows) → build Scenario Matrix
2. For each scenario requiring data-entry steps → apply EP/BVA to select test data values
3. If a step involves multiple interacting conditions → apply Decision Table to enumerate data combinations

The reverse order (selecting data before identifying flows) leads to data-driven test design that misses paths.

## 7. Preconditions and Postconditions as Test Requirements

### 7.1 Preconditions

Preconditions are not narrative context — they are **test setup requirements**. Every precondition must be:

- **Specific:** "User account with email user@test.com exists, is verified, and is active in the database" — not "user has an account"
- **Verifiable:** Can be confirmed as true before test execution
- **Achievable:** Can be set up via database scripts, API calls, or UI setup steps

### 7.2 Postconditions

Postconditions are not narrative descriptions of success — they are **test assertions**. Every postcondition must be:

- **Specific:** "account.last_login_at is updated to the current timestamp in the users table" — not "user is logged in"
- **Verifiable:** Can be confirmed via UI check, API query, database query, or log inspection
- **Complete:** All postconditions in the use case spec must have corresponding assertions — not just the UI-visible ones

**Common postcondition categories requiring assertion:**

- Database record state (field values after the use case completes)
- Audit log / event log entries
- Email / notification delivery
- State of related entities (not just the primary entity)
- Session / token state

## 8. Requirements Traceability Matrix (RTM)

The RTM maps the complete chain: Business Requirement → Use Case → Scenario → Test Case → Defect.

**Testing value of RTM:**

- **Coverage proof:** Every alternate flow maps to at least one scenario; every scenario maps to at least one test case
- **Impact analysis:** When a requirement changes, the RTM identifies exactly which test cases need updating
- **Gap detection:** An alternate flow with zero linked test cases is an immediate coverage gap

**Minimum RTM structure:**

| BR ID  | Use Case    | Scenario              | Test Case ID | Status | Defect ID |
| ------ | ----------- | --------------------- | ------------ | ------ | --------- |
| BR-001 | UC-02 Login | S1 (Main Flow)        | TC-01        | Pass   | —         |
| BR-002 | UC-02 Login | S2 (Invalid Password) | TC-02        | Fail   | DEF-045   |

## 9. Relationship to Other Test Types

Use Case Testing is primarily used for:

- **Functional testing** — verifying the system does what the use case specifies
- **Acceptance testing** — verifying the system delivers the intended business value
- **Integration testing** — exercising the interaction between layers (UI → API → DB → external services) through complete flows
- **Regression testing** — re-executing use case scenarios after changes to verify no regression in core flows

It is **not** the primary technique for:

- Unit testing of individual components
- Performance testing (though use case flows define the workload model)
- Security testing (though use case scenarios reveal attack surfaces)
