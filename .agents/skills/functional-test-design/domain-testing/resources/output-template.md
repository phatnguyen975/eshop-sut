# Domain Testing — Output Templates

## Template 1: Variable Inventory Table

Use this at **Step 1** to document all identified variables before partitioning.

| Variable Name | Type                                               | Constraint / Description                     | Mandatory? | Source (Req/BR ID) |
| ------------- | -------------------------------------------------- | -------------------------------------------- | ---------- | ------------------ |
| [variable]    | [Integer / String / Date / Enum / Boolean / Float] | [e.g., 1–999, alphanumeric, ACTIVE/INACTIVE] | [Yes / No] | [BR-001 / FR-012]  |

## Template 2: Equivalence Class Table

Use this at **Step 2** to document all equivalence classes before writing test cases.

| Class ID | Variable | Class Type | Value / Range / Description | BVA Applicable? | Rationale / Notes                           |
| -------- | -------- | ---------- | --------------------------- | --------------- | ------------------------------------------- |
| EC-01    | [name]   | Valid      | [description of values]     | [Yes / No]      | [e.g., Within business rule range]          |
| EC-02    | [name]   | Invalid    | [description of values]     | [Yes / No]      | [e.g., Below minimum; system should reject] |

**Columns explained:**

- **Class ID:** Unique identifier, used as reference in test cases (e.g., EC-01, EC-02)
- **Variable:** Which input or output variable this class belongs to
- **Class Type:** Valid or Invalid
- **Value / Range / Description:** What values this class contains
- **BVA Applicable:** Yes if this is an ordered/sequential class; No for enumerations, booleans, unordered sets
- **Rationale / Notes:** Why this class exists; split rationale if applicable; boundary inclusivity notes

## Template 3: Test Case Table

Use this at **Step 4** to document the final test suite. Each row is one test case.

| TC ID | Description                    | Variable(s) Under Test | EC(s) Covered  | BVA Point                                             | Input Value(s)      | Expected Output            | Req / BR |
| ----- | ------------------------------ | ---------------------- | -------------- | ----------------------------------------------------- | ------------------- | -------------------------- | -------- |
| TC-01 | [what is being tested and why] | [variable name]        | [EC-01, EC-03] | [Nominal / LB / LB−1 / LB+1 / UB / UB−1 / UB+1 / N/A] | [specific value(s)] | [specific expected result] | [BR-001] |

**Columns explained:**

- **TC ID:** Unique identifier (e.g., TC-01, TC-02).
- **Description:** Human-readable summary of what the test case exercises and its testing focus.
- **Variable(s) Under Test:** The primary variable(s) (separated by `<br>`) whose class/boundary is being exercised.
- **EC(s) Covered:** Which equivalence class IDs this test case covers.
- **BVA Point:** If this is a boundary test, which point (LB, LB−1, LB+1, UB, UB−1, UB+1, Nominal). Use N/A for non-BVA test cases (e.g., enum representatives).
- **Input Value(s):** All variables (separated by `<br>`) needed to execute the test, written as `variable="value"`.
- **Expected Output:** Concrete, verifiable result (specific error message, response code, calculated value, UI state).
- **Req / BR:** Requirement ID or BR number being verified.

## Notes on Template Usage

- Templates can be implemented in any format: Markdown table (primarily used), spreadsheet, test management tool (TestRail, Jira Xray, Zephyr, etc.).
- Column order may be adapted to the team's preference; all columns must be present.
- The `<br>` separator renders as a line break in Markdown viewers and most test management tools; in plain text environments, use a newline or semicolon separator instead.
- The "EC(s) Covered" column enables direct traceability from test case to coverage claim.
