# Error Guessing — Theoretical Background

## 1. Definition and Classification

Error Guessing is an **experience-based test design technique** formally defined in ISTQB Foundation Level Syllabus. The tester uses personal knowledge, intuition, and past experience to anticipate errors, defects, and failures — then designs test cases specifically targeting those anticipated problem areas.

**ISTQB formal definition:**

> "Error guessing is a technique used to anticipate the occurrence of errors, defects, and failures, based on the tester's knowledge. This knowledge includes: how the application has worked in the past, the types of errors developers tend to make, and the types of failures that have occurred in other applications."

## 2. Relationship to Other Techniques

Error Guessing occupies a specific position in the test design toolkit:

| Aspect             | Systematic Techniques (EP, BVA, Decision Table, State Transition)  | Error Guessing                                           |
| ------------------ | ------------------------------------------------------------------ | -------------------------------------------------------- |
| Derivation basis   | Requirements, specifications                                       | Experience, knowledge, intuition                         |
| Coverage guarantee | Formal (measurable against a coverage criterion)                   | None — no formal coverage metric                         |
| Blind spots        | Middle-of-class defects, implementation faults, interaction faults | Whatever the tester's experience does not cover          |
| Role               | Primary technique — mandatory baseline                             | Supplementary — fills gaps left by systematic techniques |
| Output             | Traceable to requirements                                          | Traceable to error hypotheses                            |

**Key principle from ISTQB:** Error Guessing is applied **after** systematic techniques have been used. It identifies additional tests that the systematic techniques are unlikely to produce.

## 3. Sources of Error Knowledge

Effective error guessing draws from multiple knowledge sources. ISTQB identifies three primary sources:

### 3.1 How the Application Has Worked in the Past

Historical behavior of the system under test is a high-value input:

- Known defect hotspots from previous releases
- Areas that required repeated fixes (recurring defect patterns)
- Features that caused production incidents
- Components that are frequently modified (change-induced defect density)

### 3.2 Types of Errors Developers Tend to Make

Common programming mistakes and error-prone constructs provide a foundation for systematic guessing:

- Off-by-one errors in loop boundaries and range checks
- Null/empty reference handling omissions
- Integer overflow and type conversion errors
- Incorrect operator precedence assumptions
- Race conditions in concurrent code
- Resource leaks (connections, file handles, memory)
- Incorrect error handling and exception propagation
- Encoding and character set assumptions

### 3.3 Types of Failures That Have Occurred in Other Applications

Cross-project and industry defect knowledge:

- Published defect taxonomies (Beizer's Bug Taxonomy, IEEE defect classification)
- Defect data from similar systems in the same domain
- Common web application vulnerabilities (OWASP Top 10)
- Known failure modes in specific technology stacks or frameworks

## 4. Fault Attack — The Structured Variant

**Fault Attack** is a structured application of Error Guessing introduced by Boris Beizer and referenced in ISTQB Advanced Level material. Rather than applying error guessing purely through intuition, the Fault Attack approach:

1. Creates a **fault list** (also called error list or defect hypothesis list) — a catalog of potential defects organized by category.
2. Designs test cases systematically from the fault list, ensuring all major defect categories are considered.
3. Prioritizes tests by defect probability and impact.

**Why Fault Attack over pure intuition:**

- Structured guessing covers more defect categories than unstructured intuition.
- The fault list is reviewable, shareable, and improvable over time.
- It reduces dependency on any single tester's experience.
- It provides a basis for test suite maintenance when requirements change.

## 5. Error Guessing vs. Exploratory Testing

These are frequently confused. Both are experience-based, but they are distinct techniques:

| Aspect               | Error Guessing                                           | Exploratory Testing                                 |
| -------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| ISTQB classification | Experience-based test design technique                   | Test approach / session-based technique             |
| Planning             | Designed in advance; test cases written before execution | Simultaneous design and execution                   |
| Structure            | Produces a defined test case suite                       | Produces session notes and charters                 |
| Goal                 | Targeted defect finding in specific suspected areas      | Discovery — learning about the system while testing |
| Documentation        | Test cases with rationale                                | Session notes, charters, bugs found                 |

Error Guessing produces **test cases** (pre-defined). Exploratory Testing produces **test sessions** (concurrent design and execution). They complement each other.

## 6. Error Guessing vs. Checklist-Based Testing

Both are experience-based ISTQB techniques, but differ in structure:

| Aspect      | Error Guessing                            | Checklist-Based Testing                        |
| ----------- | ----------------------------------------- | ---------------------------------------------- |
| Input       | Error hypotheses from experience          | A predefined checklist of test conditions      |
| Output      | Specific test cases for suspected defects | Test cases derived from checklist items        |
| Flexibility | Highly context-specific                   | Reusable across similar features               |
| Coverage    | No formal criterion                       | Checklist completion is the coverage criterion |

Checklist-Based Testing uses a generic, reusable checklist (e.g., "test all mandatory fields", "test all error messages"). Error Guessing is context-specific — the hypotheses are generated fresh for each feature based on specific knowledge of that feature.

## 7. Known Limitations

- **No Coverage Guarantee:** Error Guessing cannot be cited as a coverage criterion. There is no formal way to know when "enough" error guessing has been done. It is inherently incomplete — it can only find the defects the tester thought to look for.
- **Experience Dependence:** The quality of error guessing is directly proportional to the tester's relevant experience. An inexperienced tester applying Error Guessing may miss entire categories of defects. This is why the error taxonomy and Fault Attack approach are essential — they partially compensate for experience gaps by providing a structured checklist.
- **Diminishing Returns:** Error Guessing produces the highest value when applied to new features or after a long interval. On a mature system with an extensive existing test suite, the incremental value of additional error guessing decreases as the easy-to-guess defects are already covered.
- **Not Suitable as Primary Technique:** Because it has no coverage guarantee and no formal derivation procedure, Error Guessing cannot substitute for systematic techniques. Applied alone, it produces a test suite with unknown gaps.

## 8. What Error Guessing Targets — The Gaps in Systematic Techniques

Systematic black-box techniques have known blind spots. Error Guessing is most valuable when it explicitly targets these:

| Systematic Technique | Known Gap                                                                     | Error Guessing Target                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| EP/BVA               | Assumes all values in a class behave identically — misses internal anomalies  | Values that "should be" equivalent but trigger special code paths (e.g., 0 in a positive range, MAX_INT in a numeric range) |
| Decision Table       | Models conditions at one point in time — misses sequential and timing effects | Combinations applied in specific orders; repeated applications of the same combination                                      |
| State Transition     | Models defined states — misses invalid state data combinations                | Events with data values that expose guard condition defects; events triggered simultaneously                                |
| Use Case Testing     | Models normal and alternative flows — misses implementation-specific failures | Integration failure points; timeout conditions; partial success scenarios                                                   |
| All systematic       | Focus on single-session behavior — miss multi-session and persistence effects | Data created in session 1 that causes failure in session 2; cache effects; stale state                                      |
