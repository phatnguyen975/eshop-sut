# Scenario Matrix Construction Guide

## Purpose

Step-by-step guidance for constructing the Scenario Matrix — the systematic enumeration of all meaningful paths through a use case. Use during **Step 3** of the design process.

→ Use [`output-template.md`](output-template.md) for the recommended format.

## What Is a Scenario Matrix?

The Scenario Matrix is a table that lists every scenario (complete path from start to endpoint) to be tested. It makes coverage explicit — every row in the matrix must eventually map to at least one test case.

**Every scenario must:**

- Begin with the Main Flow
- Incorporate alternate flows at the points where they branch
- Terminate at a defined endpoint

## Construction Procedure

### Step 1: Establish S1 — The Happy Path

S1 is always the Main Flow with no alternate flows. This is the only scenario that does not incorporate any alternate flows.

| Scenario | Path      | Priority | Endpoint         |
| -------- | --------- | -------- | ---------------- |
| S1       | Main Flow | Highest  | Success endpoint |

### Step 2: Generate Single-Alternate-Flow Scenarios

For each alternate flow AFn, create one scenario = Main Flow + AFn:

| Scenario | Path             | Priority | Endpoint          |
| -------- | ---------------- | -------- | ----------------- |
| S2       | Main Flow + AF-1 | High     | [AF-1's endpoint] |
| S3       | Main Flow + AF-2 | High     | [AF-2's endpoint] |
| S4       | Main Flow + AF-3 | Medium   | [AF-3's endpoint] |

### Step 3: Identify Possible Combinations

Two alternate flows can appear in the same scenario only if:

- **Both can logically occur in the same execution** (AF-1's branch point is reached before AF-2's branch point, and AF-1 rejoins the main flow before AF-2's branch point)
- **One does not terminate the use case before the other can occur**

**Impossibility check:**

- If AF-1 terminates the use case at Step 2, any alternate flow that branches from Step 3 or later is impossible to combine with AF-1.
- If AF-1 and AF-2 both branch from Step 2 (mutually exclusive conditions), they cannot occur in the same scenario.

Document impossible combinations explicitly: "AF-1 + AF-2: Impossible — AF-1 terminates the use case before AF-2's branching point at Step 4."

### Step 4: Apply Risk-Based Selection

Once all logically possible scenarios are enumerated, prioritize:

| Priority     | Criteria                                                    | Decision                                         |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------ |
| **Critical** | Core business flow; failure = complete feature failure      | Always test                                      |
| **High**     | Frequently occurring alternate path; OR high-impact failure | Always test                                      |
| **Medium**   | Less frequent path; moderate business impact                | Test if time permits                             |
| **Low**      | Rare combination; low business impact                       | Document as acknowledged; test in later releases |

Risk factors to assess for each scenario:

- **Frequency:** How often does this path occur in real usage?
- **Business impact:** What is the consequence if this path has a defect in production?
- **Historical defect density:** Has this area had defects before?
- **Complexity:** Are there many system interactions in this path?
- **Recency:** Was this area recently changed?

### Step 5: Document the Final Matrix

| Scenario ID | Path Composition | Alternate Flows | Priority | Endpoint   | Status                                 |
| ----------- | ---------------- | --------------- | -------- | ---------- | -------------------------------------- |
| S1          | Main Flow        | None            | Critical | Success    | To test                                |
| S2          | MF + AF-1        | AF-1            | High     | [endpoint] | To test                                |
| S3          | MF + AF-2        | AF-2            | High     | [endpoint] | To test                                |
| S4          | MF + AF-1 + AF-3 | AF-1, AF-3      | Medium   | [endpoint] | To test                                |
| S5          | MF + AF-2 + AF-3 | AF-2, AF-3      | Low      | [endpoint] | Acknowledged; not tested in this cycle |

## Combinatorial Reduction Strategies

When the use case has many alternate flows, use these strategies to reduce the scenario count while maintaining meaningful coverage:

### Strategy 1: Impossibility Pruning

Remove all combinations where one alternate flow terminates the use case before another's branching point is reached. This is not a compromise — these combinations are not physically possible.

**Procedure:**

1. List the branching points for all alternate flows
2. List which alternate flows terminate vs. rejoin
3. For each terminating flow, mark all flows that branch after its termination as "impossible to combine"

### Strategy 2: Risk-Based Deprioritization

After impossibility pruning, rank remaining combinations by risk. Accept combinations at Medium or Low risk as "acknowledged" if test execution time is constrained. Document these explicitly — do not silently omit them.

### Strategy 3: Pairwise Coverage

When the number of alternate flows is large, ensure every **pair** of alternate flows appears together in at least one scenario. This mathematical approach (combinatorial testing) ensures no interaction between any two flows is entirely untested while dramatically reducing total scenario count.

**Pairwise goal:** Every pair (AFi, AFj) must appear together in at least one scenario. Does not require every triple, quadruple, etc.

### Strategy 4: Representative Selection

For alternate flows of the same type (e.g., three different "invalid input" flows that all result in the same system response pattern), select one representative for thorough testing and document the others as lower priority.
