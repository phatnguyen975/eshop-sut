# Use Case Testing — Output Templates

## Template 1: Flow Inventory

Use at **Step 2** to document all identified flows before constructing the Scenario Matrix.

| Flow ID | Type      | Short Description                                                   | Branches From (MF Step) | Endpoint                       | Classification       |
| ------- | --------- | ------------------------------------------------------------------- | ----------------------- | ------------------------------ | -------------------- |
| MF      | Main      | [One-line summary of the happy path from start to success endpoint] | —                       | Success                        | —                    |
| AF-1    | Alternate | [Short description of the deviation]                                | Step [N]                | [Rejoin MF Step N / Terminate] | Optional / Exception |
| AF-2    | Alternate | [Short description]                                                 | Step [N]                | [Rejoin MF Step N / Terminate] | Optional / Exception |
| AF-3    | Alternate | [Short description]                                                 | Step [N]                | [Terminate]                    | Exception            |

**Column definitions:**

- **Flow ID:** Unique identifier. MF = Main Flow; AF-N = Alternate Flow N; HF-N = Hidden Flow (discovered, not in original spec).
- **Type:** Main or Alternate.
- **Short Description:** One-line summary of what this flow represents.
- **Branches From:** Which Main Flow step this alternate flow deviates from. Use `—` for MF.
- **Endpoint:** What happens at the end — does the flow rejoin MF (at which step?), or terminate?
- **Classification:** For alternate flows: Optional (valid alternative choice) or Exception (error, rule violation, system failure).

## Template 2: Scenario Matrix

Use at **Step 3** to enumerate all meaningful test scenarios before writing any test case.

| Scenario ID | Path Composition | Alternate Flows | Priority | Endpoint   | Status                                                 |
| ----------- | ---------------- | --------------- | -------- | ---------- | ------------------------------------------------------ |
| S1          | Main Flow only   | None            | Critical | Success    | To test                                                |
| S2          | MF + AF-1        | AF-1            | High     | [endpoint] | To test                                                |
| S3          | MF + AF-2        | AF-2            | High     | [endpoint] | To test                                                |
| S4          | MF + AF-1 + AF-3 | AF-1, AF-3      | Medium   | [endpoint] | To test                                                |
| —           | MF + AF-1 + AF-2 | AF-1, AF-2      | —        | —          | IMPOSSIBLE: [reason why this combination cannot occur] |
| S5          | MF + AF-4        | AF-4            | Low      | [endpoint] | Acknowledged; not tested this cycle                    |

**Column definitions:**

- **Scenario ID:** Unique identifier. S1 is always the happy path.
- **Path Composition:** Which flows are combined in this scenario, in order.
- **Alternate Flows:** Explicit list of AF IDs exercised in this scenario.
- **Priority:** Critical / High / Medium / Low — based on risk assessment.
- **Endpoint:** The terminal point of this scenario (success, error page, redirect, etc.).
- **Status:** Test (will be tested) / Acknowledged (not tested; risk accepted) / IMPOSSIBLE (cannot logically occur).

## Template 3: Test Case

Use at **Steps 4–6** to document each executable test case. One test case per scenario (or more if the same path requires multiple data configurations).

### Header Section

| Field                      | Content                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TC ID**                  | TC-UCT-[number]                                                                                                                                                                                                                                                                                                                             |
| **Use Case**               | [UC ID] — [UC Name]                                                                                                                                                                                                                                                                                                                         |
| **Scenario**               | [Scenario ID] — [brief path description, e.g., "MF + AF-2: Payment Declined"]                                                                                                                                                                                                                                                               |
| **Description**            | [What this test case verifies and why — which defect risk or business requirement it addresses]                                                                                                                                                                                                                                             |
| **Preconditions**          | [Exact system state required before execution. Specify: which data records must exist in DB with what field values, which user is authenticated with which role, which system configuration is active. Example: "User 'customer@test.com' exists in users table with status=ACTIVE, role=CUSTOMER. Cart contains Item A (qty=1, stock=5)."] |
| **Test Data**              | [All input values with EP/BVA rationale. Example: `email="customer@test.com"` (valid class representative); `password=""` (EC: empty — triggers AF-2)]                                                                                                                                                                                      |
| **Alternate Flow Trigger** | [For non-S1 test cases: what specific input or condition forces the system into the alternate flow. For S1: N/A]                                                                                                                                                                                                                            |

### Steps Section

| Step | Actor Action                                              | Input Data                           | Expected System Response                                                                | Post-Step State                |
| ---- | --------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------ |
| 1    | [Actor does X — what the actor clicks, submits, or calls] | `field="value"`<br>`field2="value2"` | [Specific observable system response — exact message, status code, redirect, UI change] | [System state after this step] |
| 2    | [System does Y / Actor does Z]                            | `field="value"`                      | [Observable response]                                                                   | [State]                        |
| N    | [Final step]                                              | —                                    | [Final response]                                                                        | [Final state]                  |

**Step formatting notes:**

- Actor actions describe what the human user or external system does.
- System responses describe what the SUT produces — observable from the outside.
- Use `<br>` to separate multiple input fields within one cell.
- Expected responses must be specific: "HTTP 201 with body `{order_id: ...}`" not "success".

### Footer Section

| Field              | Content                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Postconditions** | [Explicit assertions for all backend state changes. List each separately:]<br>1. DB: `[table].[field]` = `[expected_value]` (e.g., `orders.status` = `CONFIRMED`)<br>2. DB: `[table].[field]` decremented/incremented by [N]<br>3. Audit log: event type `[X]` written with timestamp within [N] seconds<br>4. Email: `[type]` email delivered to `[address]` within [N] seconds<br>5. Related entity: `[entity].[field]` = `[expected_value]` |
| **Priority**       | Critical / High / Medium / Low                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Source**         | UC-[ID], BR-[ID(s)]                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Template 4: Requirements Traceability Matrix (RTM)

Use after test case design to document full traceability from business requirement to test case.

| BR ID  | Requirement Summary   | Use Case | Scenario(s) | Test Case(s)           | Coverage Status   |
| ------ | --------------------- | -------- | ----------- | ---------------------- | ----------------- |
| BR-[N] | [One-line BR summary] | UC-[ID]  | S[N], S[N]  | TC-UCT-[N], TC-UCT-[N] | ✓ Covered / ⚠ Gap |

**Coverage status legend:**

- **✓ Covered** — At least one test case exercises this BR
- **⚠ Gap** — No test case covers this BR; must be addressed before release sign-off
- **→ Acknowledged** — BR is covered by a low-priority scenario not tested this cycle; risk accepted

## Notes on Template Usage

- Templates can be implemented in any format: Markdown, spreadsheet, or test management tool (TestRail, Jira Xray, Zephyr).
- The Scenario Matrix must be completed before any test case is written — it is the prerequisite artifact for test case derivation.
- TC IDs should use the `TC-UCT-` prefix to distinguish use case test cases from systematic technique test cases (e.g., `TC-DT-` for domain testing, `TC-ST-` for state transition).
- For multi-field inputs, use `<br>` to separate fields within a single cell: `username="john_doe"`<br>`password="Secret@1"`.
- Postconditions must be listed as verifiable assertions, not narrative descriptions — "the user is logged in" is not a postcondition; "a valid JWT token is returned in the response body AND `sessions.last_active` is updated in the DB" is.
