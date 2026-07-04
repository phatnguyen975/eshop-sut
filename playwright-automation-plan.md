# Playwright Automation Testing Plan — EShop SUT

> **Document Purpose:** This plan serves as the authoritative reference for the Web Automation Testing topic using Playwright and TypeScript against the EShop System Under Test (SUT). It covers theoretical foundations, tool justification, project setup, test design strategy, execution workflow, AI Agent integration, and AI audit logging.  
> **Created:** 2026-07-02  
> **Last Updated:** 2026-07-02  
> **SUT Version:** EShop 2.0 (as of 2026-05-14)  
> **Tool:** Playwright v1.61+ · TypeScript · Node.js

---

## Table of Contents

1. [Automation Testing — Theoretical Foundations](#1-automation-testing--theoretical-foundations)
2. [Web Automation Testing — Deep Dive](#2-web-automation-testing--deep-dive)
3. [Classifying Web Automation Testing](#3-classifying-web-automation-testing)
4. [Test Design Techniques](#4-test-design-techniques)
5. [Web Automation Testing Lifecycle (WATL)](#5-web-automation-testing-lifecycle-watl)
6. [Playwright — Tool Justification & Feature Reference](#6-playwright--tool-justification--feature-reference)
7. [EShop SUT Analysis & Test Scope](#7-eshop-sut-analysis--test-scope)
8. [Project Structure & Setup](#8-project-structure--setup)
9. [Test Suite Architecture](#9-test-suite-architecture)
10. [AI Agent Integration Workflow](#10-ai-agent-integration-workflow)

---

## 1. Automation Testing — Theoretical Foundations

### 1.1 What Is Automation Testing?

**Automation Testing** is the practice of using software tools, scripts, and frameworks to execute pre-defined test cases against a System Under Test (SUT) **without manual human intervention** during execution. A test automation system controls the SUT, compares actual outputs with expected outputs, and generates pass/fail results automatically.

Automation testing is built on the following core principles:

- **Repeatability:** The same test scenario can be executed an unlimited number of times with zero drift in execution steps.
- **Determinism:** Given the same application state and inputs, the test must produce the same outcome every run.
- **Observability:** The automation framework must be able to observe the SUT's state (DOM, network, database, API responses) and make assertions against it.
- **Isolation:** Each test should be independent — it must set up its own preconditions and clean up afterward, so execution order does not affect results.
- **Maintainability:** Test code is production code. It must be organized, versioned, reviewed, and refactored following the same engineering standards as application code.

### 1.2 Types of Automation Testing by Platform

Automation testing is **not limited to web browsers**. Modern tools support three major platform domains:

| Platform               | Scope                                                                | Popular Tools                                                                     |
| ---------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Web Automation**     | Browser-based apps (Chrome, Firefox, Safari, Edge) accessed via URLs | Playwright, Selenium, Cypress, WebdriverIO                                        |
| **Mobile Automation**  | Native/hybrid apps on iOS and Android devices or emulators           | Appium, Detox, Maestro, Espresso (Android only)                                   |
| **Desktop Automation** | Native desktop applications on Windows, macOS, Linux                 | WinAppDriver, Winium, pywinauto, Playwright (Electron apps via embedded Chromium) |

**Each platform domain has different interaction models:**

- Web automation operates on the DOM via a browser engine.
- Mobile automation interacts with native UI trees (AccessibilityService on Android / XCTest on iOS).
- Desktop automation hooks into OS-level accessibility APIs (UIA on Windows, AXAccessibility on macOS).

### 1.3 What Is Web Automation Testing?

**Web Automation Testing** is a specialized subdomain of automation testing that automates interactions with **web applications** running inside a browser. It simulates end-user behavior — navigating pages, filling forms, clicking buttons, and asserting UI state — using a browser automation protocol (Chrome DevTools Protocol, WebDriver, or browser-native APIs).

**What differentiates Web Automation from other automation domains:**

1. **Runtime Environment:** Tests execute within or alongside a real browser engine (Chromium, Firefox, WebKit). The DOM is the primary interaction surface.
2. **Asynchrony:** Web UIs are inherently asynchronous. Network requests, JavaScript rendering, animations, and dynamic content loading require the automation framework to have built-in smart waiting strategies rather than fixed `sleep()` calls.
3. **Multi-layer testability:** A web application exposes multiple testable layers simultaneously — the UI (HTML/CSS rendered by the browser), the API (HTTP endpoints), and optionally the database. Web automation tools like Playwright can interact with all three layers in a single test run.
4. **Cross-browser compatibility:** Web automation can verify that the application behaves consistently across different browser engines (Chromium, Firefox, WebKit/Safari), catching rendering bugs that are browser-specific.
5. **Protocol complexity:** Modern web automation uses the Chrome DevTools Protocol (CDP) or the WebDriver BiDi protocol, enabling low-level browser control: network interception, JS execution, tracing, and performance profiling.

### 1.4 What Should We Test? (API, UI, DB — or Just Test Scenarios?)

In a holistic web automation testing strategy, all three observable layers of a web application should be tested, but with different priorities:

| Layer             | What to Test                                                                       | How Playwright Tests It                               | Priority    |
| ----------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------- |
| **UI (E2E)**      | User journeys, form validation, navigation, visual feedback, accessibility         | `page.goto()`, locators, `expect()`, screenshots      | **Highest** |
| **API**           | Endpoint contracts, authentication, authorization, business logic, error responses | `APIRequestContext` (`request.get/post/put/delete()`) | **High**    |
| **DB (indirect)** | Data persistence, correct state after CRUD operations                              | Assert via subsequent API/UI reads after a write      | **Medium**  |

> **Key principle:** We do **not** write raw SQL queries in test code. Database correctness is verified **indirectly** by asserting the outputs of API calls and UI renders that depend on that data. Direct DB access is reserved for test setup (seeding) and teardown (cleanup) only.

A test suite is not merely a collection of scenarios. Each test case is tied to:

- A specific **Functional Requirement (FR-XX)** from the SRS.
- A specific **test design technique** (equivalence partitioning, boundary value analysis, etc.).
- A specific **pass/fail criterion** defined before execution.

---

## 2. Web Automation Testing — Deep Dive

### 2.1 Key Characteristics

| Characteristic                      | Description                                                                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Browser-level realism**           | Tests run in a real browser engine (not a simulated DOM like jsdom), so they catch real rendering, CSS, and JavaScript execution issues |
| **Network layer access**            | Full HTTP request/response visibility — tests can intercept, mock, abort, and assert on network calls                                   |
| **Multi-tab / multi-window**        | Can automate scenarios involving pop-ups, new tabs, and cross-origin iframes                                                            |
| **Authentication state management** | Can save and restore browser storage (cookies, localStorage, sessionStorage) for efficient test isolation                               |
| **Asynchronous-first design**       | All browser operations are async/await; frameworks use auto-wait mechanisms to handle dynamic content instead of fixed sleeps           |
| **Cross-browser execution**         | Same test code runs across Chromium, Firefox, and WebKit without modification                                                           |
| **Parallel execution**              | Tests are distributed across multiple browser workers/shards for faster CI feedback                                                     |
| **Headless & headed modes**         | Can run without a visible browser window (headless, for CI) or with a visible UI (headed, for debugging)                                |

### 2.2 Advantages of Web Automation Testing

| Advantage                         | Explanation                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Massive time savings at scale** | Once written, a suite of 200 test cases executes in minutes; manual execution of the same suite would take days          |
| **Regression coverage**           | Every code deployment can trigger the full regression suite automatically, catching regressions before they reach users  |
| **Consistency & reliability**     | Automation executes exactly the same steps every run, eliminating human variability (misclick, typo, attention lapse)    |
| **Shift-left testing**            | Tests can run on every pull request in CI/CD, catching defects before they reach production                              |
| **24/7 execution**                | Scheduled test runs can occur overnight or on-demand without human presence                                              |
| **Data-driven scale**             | A single parameterized test can run against hundreds of input combinations simultaneously                                |
| **Rich failure artifacts**        | Automatic screenshots, videos, network traces, and HTML reports provide detailed failure evidence without manual capture |
| **Continuous feedback loop**      | Fast feedback to developers reduces the cost of defect remediation (bugs found early are cheaper to fix)                 |

### 2.3 Disadvantages of Web Automation Testing

| Disadvantage                           | Mitigation Strategy                                                                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **High upfront investment**            | Significant time needed to write, review, and maintain tests — mitigated by Page Object Model and good architecture                                                               |
| **Flakiness**                          | Network timing, animation delays, and dynamic content can cause intermittent failures — mitigated by proper async waiting, retry logic, and test isolation                        |
| **Maintenance overhead**               | UI changes require updating locators in tests — mitigated by using semantic locators (`getByRole`, `getByLabel`) rather than brittle CSS selectors tied to implementation details |
| **Not suitable for all testing types** | Cannot fully replace exploratory testing, usability testing, or security penetration testing, which require human judgment                                                        |
| **Infrastructure cost**                | Running browsers in CI requires compute resources (containers, runner minutes, storage for artifacts)                                                                             |
| **Learning curve**                     | Requires programming knowledge, understanding of async JavaScript/TypeScript, and familiarity with browser APIs                                                                   |

### 2.4 Real-World Application

In the software industry, web automation testing is applied at the following points in the delivery lifecycle:

- **Pull Request gates:** A smoke test suite runs on every PR. If it fails, the PR cannot be merged into the main branch.
- **Nightly regression suites:** Full regression runs execute overnight on a CI schedule, covering hundreds of scenarios across multiple browsers.
- **Release validation:** Before each production deployment, a release test suite validates all critical user journeys end-to-end.
- **Accessibility audits:** Automated ARIA snapshot assertions and axe-core integration enforce WCAG compliance on every build.
- **Visual regression:** Pixel-diff screenshot comparison (e.g., via Percy or Playwright's own screenshot assertions) catches unintended CSS/layout changes.

> **Key insight:** Automation testing does **not replace** manual testing. It handles **repeatable, deterministic** scenarios efficiently, freeing QA engineers to focus on exploratory, usability, and edge-case testing that requires human judgment and creativity.

---

## 3. Classifying Web Automation Testing

To apply web automation testing effectively, it is essential to understand where it sits within standard testing taxonomies. This section answers the question: what kind of testing is web automation testing, and why?

### 3.1 Test Level — Where Web Automation Sits

The **Testing Pyramid** (introduced by Mike Cohn in _Succeeding with Agile_, 2009, and widely referenced by Martin Fowler) organizes tests by execution speed, isolation, and confidence level:

```
              ╱╲
             ╱  ╲          E2E / System Tests
            ╱    ╲         Real browser, full stack (slowest, highest confidence)
           ╱──────╲
          ╱        ╲       Integration / API Tests
         ╱          ╲      HTTP calls, component interactions (medium speed)
        ╱────────────╲
       ╱              ╲    Unit Tests
      ╱                ╲   Isolated functions (fastest, cheapest)
     ╱──────────────────╲
```

Web Automation Testing operates at the **top two levels**:

- **System / E2E level:** A real browser is launched, the full application stack (frontend + backend + database) participates, and the test simulates complete user journeys from start to finish. This is the primary level for Playwright-based UI tests.
- **Integration / API level:** No browser is needed. Tests make direct HTTP calls to the backend API, verifying that components integrate correctly and that contracts defined in the API specification are honored.

Web Automation Testing does **not** operate at the Unit level. Unit tests isolate individual functions or components in memory — they require no browser, no network, and no real UI rendering. Unit tests belong to the development team, not the QA automation layer.

### 3.2 Test Type — What Web Automation Can Execute

Web automation testing is an **execution mechanism**, not a test type in itself. The same Playwright script infrastructure can execute multiple test types:

| Test Type                 | Description                                                                             | Why Automation Fits                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Functional Testing**    | Verifies the system behaves according to specification                                  | Deterministic steps and assertions map directly to requirement statements             |
| **Regression Testing**    | Re-executes existing scenarios after any code change to detect unintended breakage      | High repetition + zero drift = automation's strongest value proposition               |
| **Smoke Testing**         | Minimal set of critical-path checks run before a full regression suite                  | Fast feedback; runs in under 2 minutes as a CI gate                                   |
| **Negative Testing**      | Verifies the system handles invalid inputs and unauthorized actions with correct errors | Scripted invalid inputs are faster and more consistent than manual entry              |
| **Security Testing**      | Verifies authentication, authorization, input sanitization, and data exposure           | Crafted payloads (XSS, role escalation, token manipulation) can be replayed exactly   |
| **API Contract Testing**  | Validates HTTP endpoints return correct status codes, schemas, and business logic       | Native HTTP client (APIRequestContext) makes this a first-class Playwright capability |
| **Accessibility Testing** | Verifies ARIA roles, keyboard navigation, and tab order                                 | ARIA snapshot assertions and semantic locators double as accessibility checks         |

> **Why Regression Testing benefits most from automation:** Regression suites grow with every feature added. Running 300 scenarios manually before every release takes days; automation runs the same suite in minutes. This is the primary ROI justification for web automation investment in production teams.

### 3.3 Test Method — How Web Automation Approaches the SUT

| Method                | Definition                                                                                      | Role in Web Automation                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Black-box Testing** | Tests based purely on inputs and expected outputs, with no knowledge of internal implementation | **Primary method** — the tester interacts with the SUT through its UI and API exactly as a real user or client would           |
| **White-box Testing** | Tests with full knowledge of internal code paths, branches, and data structures                 | Not applicable at the QA automation layer — modifying or inspecting SUT source code is outside scope                           |
| **Grey-box Testing**  | External testing enriched by partial knowledge of internal contracts (API shapes, DB schema)    | **Secondary method** — knowledge of the API specification enables precise HTTP-level assertions without inspecting source code |

Web automation testing is inherently **black-box at the UI layer** (the tester sees what the browser renders) and **grey-box at the API layer** (the tester knows the endpoint contract from the API specification but not the internal implementation).

### 3.4 Execution Type — How Tests Are Run

| Execution Type      | Definition                                                                                    | When It Applies                                                     |
| ------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Fully Automated** | Script executes completely and asserts pass/fail without any human interaction during the run | All regression, smoke, and CI pipeline runs                         |
| **Semi-Automated**  | Script executes the steps; a human validates subjective or context-dependent outcomes         | Exploratory sessions assisted by scripts, accessibility spot-checks |
| **Manual**          | Human executes each step and judges the result                                                | Test case design and review, failure triage, demo preparation       |

> **Important distinction:** "Fully automated execution" means the _script runs without human intervention_. It does not mean the entire QA process is automated. Test case design, failure triage, and defect reporting all require human judgment.

### 3.5 Test Design Approach — Scenario-Based Testing

In web automation testing, one of the most widely adopted test design approaches is **Scenario-Based Testing**: Each test case represents a complete, realistic user journey through the system — a sequence of actions spanning multiple features — rather than an isolated check of a single function.

**Why scenario-based, not function-by-function:**

A defect in a web application most often manifests at the **integration point between steps**, not within a single step in isolation. For example, a bug where the cart is not cleared after a successful checkout cannot be detected by testing "checkout" alone or "view cart" alone — it only surfaces when both steps are executed in sequence within the same test context.

**What makes a good scenario:**

- It starts from a realistic entry point (e.g., landing page, login screen).
- It follows a path a real user would take to accomplish a goal.
- It ends with a verifiable outcome that confirms the goal was achieved or correctly rejected.
- It typically spans multiple user interactions and may cross multiple features or system boundaries when appropriate.

**Relationship to other design techniques:**

Scenario Testing determines _which flows to test_. Within each scenario, other techniques are applied to determine _what data to use_ and _which branches to cover_:

- **Equivalence Partitioning / BVA** — applied at steps that have input fields, to select representative valid and boundary-edge invalid inputs.
- **Decision Table** — applied at steps that have multiple independent conditions affecting the outcome (e.g., coupon validation with 5 conditions).
- **State Transition Testing** — applied when a scenario involves a stateful workflow where the system's response depends on its current state (e.g., order status changes).
- **Error Guessing** — applied as a supplementary lens across the entire scenario, focusing on integration points and security-sensitive steps where experience suggests defects are likely.

---

## 4. Test Design Techniques

This section defines each test design technique used in this project, explains why it is appropriate for web automation testing, and identifies the category of scenario or step it applies to. Concrete application to EShop test scenarios is handled in the test specification phase.

### 4.1 Equivalence Partitioning (EP)

- **Definition:** Divide the input domain into equivalence classes where every value in a class is expected to produce the same system behavior. One representative value per class is sufficient — testing additional values in the same class adds no defect detection value.
- **Why it applies to web automation:** Web forms and API endpoints always have defined valid and invalid input ranges. EP prevents redundant test cases (e.g., testing 10 different invalid email formats when one is sufficient to confirm the validation fires).
- **When to apply:** At any step within a scenario that accepts user input — registration fields, search inputs, quantity selectors, price fields, coupon codes.
- **Classes to always consider:** valid input, empty/null, wrong data type, wrong format, out-of-range value, boundary-adjacent value.

### 4.2 Boundary Value Analysis (BVA)

- **Definition:** Test input values at the exact edges of valid/invalid partitions. The standard 3-point BVA tests: one value just below the boundary (invalid side), the exact boundary value, and one value just above the boundary (valid side).
- **Why it applies to web automation:** Off-by-one errors in validation logic are among the most common defects in web applications (e.g., a password rule requiring "at least 8 characters" that actually rejects exactly 8). BVA targets exactly these defects.
- **When to apply:** At steps with numeric constraints (min/max length, min/max value, thresholds) — always used together with EP, never as a standalone replacement.

### 4.3 Decision Table Testing

- **Definition:** A table that enumerates combinations of independent conditions and maps each combination to its expected system action. Ensures complete coverage of multi-condition business rules.
- **Why it applies to web automation:** Complex business rules with multiple boolean conditions are a common source of defects in web applications. A decision table makes every combination explicit, preventing accidental omission of a condition combination during test design.
- **When to apply:** At steps where the system outcome is determined by multiple independent conditions evaluated simultaneously. The minimum test set covers: one row where all conditions are true (happy path), plus one row per condition where only that condition is false and all others are true — ensuring each condition is independently verified to affect the outcome.

### 4.4 State Transition Testing

- **Definition:** Models a feature as a finite state machine (FSM). Tests cover: all valid transitions between states, all invalid transitions that must be rejected, and all terminal states from which no further transitions are permitted.
- **Why it applies to web automation:** Any workflow-based feature (order processing, account status, session management) has implicit state. Defects in state handling — allowing a forbidden transition, failing to block a terminal state, or skipping an intermediate state — are only discoverable when the test exercises the transition, not when it checks a single state in isolation.
- **When to apply:** Whenever a scenario involves a feature that has defined states and transition rules. A state transition table should be drafted before writing the scenario to ensure all valid, invalid, and terminal-state transitions are represented.

### 4.5 Error Guessing

- **Definition:** An experience-based technique where the tester uses domain knowledge and intuition about common failure modes to design test cases not covered by systematic techniques.
- **Why it applies to web automation:** Systematic techniques (EP, BVA, Decision Table, State Transition) cover known input domains and defined logic paths. Error guessing targets the gaps — integration points where two components make incorrect assumptions about each other, security boundaries where the system might trust client-supplied data it should recompute, and edge cases that do not map neatly to any single input partition.
- **When to apply:** As a supplementary pass after all systematic techniques have been applied. Particularly valuable for: security-sensitive steps (authentication, authorization, data submission), inter-component integration points (frontend sending data to API that backend should independently validate), and features with known defect history in similar systems.

### 4.6 Technique Selection Summary

The table below maps scenario categories to the techniques that apply, and explains why:

| Scenario Category                     | Primary Techniques                  | Rationale                                                                           |
| ------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------- |
| **User input & form validation**      | EP + BVA                            | Input fields have clear valid/invalid partitions with defined boundaries            |
| **Multi-condition business rules**    | Decision Table                      | Multiple independent conditions combine — systematic enumeration prevents omissions |
| **Stateful workflows**                | State Transition + Scenario Testing | System behavior depends on current state; transitions must be explicitly exercised  |
| **Security & integration boundaries** | Error Guessing + Scenario Testing   | Systematic techniques do not cover trust assumptions between components             |
| **End-to-end user journeys**          | Scenario Testing (wraps all above)  | All scenarios are multi-step flows; other techniques apply within individual steps  |

---

## 5. Web Automation Testing Lifecycle (WATL)

The Web Automation Testing Lifecycle (WATL) is the end-to-end process that governs how a web automation testing effort is initiated, built, executed, and sustained over time. It is analogous to the Software Development Lifecycle (SDLC) but scoped entirely to the test automation layer.

### 5.1 Phase Overview

```
Phase 1        Phase 2        Phase 3          Phase 4        Phase 5         Phase 6
Test           Framework      Test             Test           Results         Maintenance
Planning  -->  Setup     -->  Development -->  Execution -->  Analysis   -->  & Evolution
```

### 5.2 Phase 1 — Test Planning

**Objective:** Define the full scope, strategy, and acceptance criteria for the automation effort before any code is written.

Key activities:

- **Requirements analysis:** Review the SRS and API specification to identify all testable requirements and map them to automation candidates.
- **Scope definition:** Determine which features, user journeys, and API endpoints will be automated; explicitly document what is out of scope and why.
- **Test objective definition:** State what risks and business behaviors the automation suite is designed to detect and protect against.
- **Tool selection and justification:** Evaluate and select the automation framework based on SUT technology, team skill set, browser coverage needs, and CI/CD integration requirements.
- **Entry and exit criteria:** Define what conditions must be true before testing begins (SUT running, seed data present) and what conditions must be satisfied to declare the suite complete (pass rate threshold, all critical paths covered).
- **Pass/fail criteria:** Define per-test-category criteria — a functional test passes when actual behavior matches the SRS; a security test passes when a forbidden action is correctly rejected.
- **Test data strategy:** Identify what data must exist before tests run, what data is generated dynamically per-test, and how data is cleaned up after tests complete.

**Deliverable:** A test automation plan document covering all of the above.

### 5.3 Phase 2 — Framework Setup

**Objective:** Establish the technical infrastructure for the test project before any test case is written.

Key activities:

- **Project initialization:** Create the test project as a standalone module with its own dependency management, separate from the SUT codebase.
- **Framework configuration:** Configure the automation framework — base URLs, browser targets, retry policies, parallelism settings, reporter outputs.
- **Authentication strategy:** Implement a global setup mechanism that authenticates as each required user role and persists the session state for reuse across tests, avoiding login overhead in every individual test.
- **Environment configuration:** Set up environment variable management for credentials, base URLs, and environment-specific settings. Credentials must never be hardcoded in test files.
- **CI/CD integration:** Configure the test runner to execute in a headless CI environment and emit machine-readable reports (JUnit XML, JSON) consumable by CI platforms.
- **Infrastructure validation:** Run a minimal placeholder test against the live SUT to confirm the framework, browser, and network connectivity are all functioning before any real test is written.

**Deliverable:** A running test project where the framework initializes, connects to the SUT, and executes a placeholder test without errors.

### 5.4 Phase 3 — Test Development

**Objective:** Implement the test scenarios designed in Phase 1 as executable, maintainable automation scripts.

Key activities:

- **Page Object Model (POM) implementation:** Encapsulate each page's locators and interactions in a dedicated class. Locators and actions are defined once in the POM; test spec files call the POM's methods rather than interacting with the DOM directly.
- **Fixture implementation:** Build reusable setup and teardown logic for common preconditions (authenticated sessions, pre-created test data) using the framework's fixture system.
- **Test spec authoring:** Write test cases organized by functional domain. Each test case maps to one or more requirements from the SRS and applies the appropriate design technique.
- **API test implementation:** Write tests that call the backend directly via the framework's native HTTP client, validating contracts, status codes, response schemas, and authorization behavior.
- **Test data management:** Implement dynamic data generation for unique test inputs, and ensure each test creates and cleans up its own data to maintain isolation.
- **Human review gate:** All generated or authored test code must be reviewed by a human before being accepted — verifying locator correctness, assertion accuracy, and coverage completeness.

**Deliverable:** A test suite that covers all in-scope requirements, passes peer review, and runs reliably in isolation.

### 5.5 Phase 4 — Test Execution

**Objective:** Run the test suite systematically and collect raw results with supporting evidence for every failure.

Key activities:

- **Full suite execution:** Run all tests in headless mode against the target environment.
- **Selective execution:** Run subsets of the suite by domain, test level, or priority (smoke suite first, then full regression).
- **Artifact collection:** Collect screenshots, video recordings, and execution traces for every failed test to enable post-mortem analysis without re-running the test.
- **Report generation:** Produce human-readable (HTML) and machine-readable (JUnit XML, JSON) reports for each run.
- **Demo execution:** Run selected scenarios in headed mode with reduced speed for stakeholder demonstration purposes.

**Deliverable:** Test execution reports and failure artifacts (screenshots, traces, videos) for all runs.

### 5.6 Phase 5 — Results Analysis & Defect Reporting

**Objective:** Interpret raw test results, distinguish product defects from test code issues, and produce a structured defect report.

Key activities:

- **Failure triage:** For each failed test, determine the root cause: (a) a genuine product defect where the SUT violates a requirement, (b) a test code defect where the script incorrectly asserts or interacts with the SUT, or (c) an environment/infrastructure issue unrelated to either.
- **Defect documentation:** For each confirmed product defect, document: the requirement violated, steps to reproduce, actual vs. expected behavior, severity classification, and a link to the failure artifact (trace, screenshot).
- **Coverage reporting:** Produce a traceability matrix mapping each requirement to its test cases and their pass/fail status.
- **Severity classification:** Categorize defects by impact — Critical (core functionality broken), High (major feature non-functional), Medium (partial feature breakage), Low (minor UI/UX deviation).

**Deliverable:** A test report with executive summary, coverage matrix, and full defect log.

### 5.7 Phase 6 — Maintenance & Evolution

**Objective:** Keep the test suite accurate and reliable as the SUT evolves over time.

Key activities:

- **Locator maintenance:** Update Page Object locators when the SUT's UI structure changes. Semantic locators (role, label, text) reduce maintenance frequency compared to CSS/XPath.
- **Test evolution:** Add new test cases when new requirements are introduced; remove or update obsolete tests when features change.
- **Flakiness remediation:** Investigate and fix intermittent failures by improving wait conditions, test data isolation, or locator specificity. A flaky test must never be silently retried without investigating the root cause.
- **Performance monitoring:** Track total suite execution time across releases. Split large test files or increase parallelism if execution time grows beyond acceptable CI thresholds.
- **Coverage gap review:** Periodically audit the traceability matrix to identify requirements that lack automation coverage and prioritize closing those gaps.

**Deliverable:** An up-to-date, stable, and growing test suite that remains aligned with the evolving SUT.

---

## 6. Playwright — Tool Justification & Feature Reference

### 6.1 What Is Playwright?

Playwright is an open-source end-to-end browser automation framework created and maintained by **Microsoft**. It was publicly released in January 2020, built by engineers who previously worked on the Puppeteer project at Google. Playwright provides a single, unified API that controls **Chromium, Firefox, and WebKit** browser engines, and offers first-class language support for **TypeScript, JavaScript, Python, Java, and .NET (C#)**.

| Attribute                     | Value                                        |
| ----------------------------- | -------------------------------------------- |
| **License**                   | Apache 2.0 (completely free and open-source) |
| **Maintained by**             | Microsoft                                    |
| **Minimum supported version** | Playwright v1.61+                            |
| **Language**                  | TypeScript                                   |
| **Official repository**       | https://github.com/microsoft/playwright      |
| **Official documentation**    | https://playwright.dev                       |

Playwright structures test execution hierarchically:

- `Browser`: The physical browser instance (Chromium, Firefox, WebKit). Launching a browser is resource-intensive.
- `BrowserContext`: An isolated, incognito-like session within a Browser. Contexts do not share cookies, cache, or local storage. You can create multiple contexts within a single browser, making parallel testing extremely fast.
- `Page`: A single tab or window within a `BrowserContext`.

### 6.2 Core Features of Playwright

#### 6.2.1 Multi-Browser Support via a Single API

Playwright controls three distinct browser engines with one consistent API surface:

- **Chromium** — The engine powering Google Chrome, Microsoft Edge, and Brave.
- **Firefox** — Mozilla's Gecko engine.
- **WebKit** — Apple's browser engine, which powers Safari on macOS and iOS.

A single test file executes against all three engines without modification. This enables catching browser-specific rendering defects that tools limited to a single engine cannot detect. For this EShop project, Chromium is the primary execution target, with Firefox and WebKit as secondary validation targets.

#### 6.2.2 Auto-Waiting Mechanism

Before performing any action (click, fill, press, hover), Playwright automatically waits for the target element to satisfy a set of **actionability conditions**:

- **Attached:** The element exists in the DOM.
- **Visible:** The element is not hidden (`display: none`, `visibility: hidden`, `opacity: 0`).
- **Stable:** The element is not in the middle of a CSS animation or layout change.
- **Enabled:** The element does not have a `disabled` attribute.
- **Editable:** The element accepts input (for `fill()` operations).
- **Receives events:** The element is not obscured by another element.

This built-in auto-wait eliminates the need for `sleep()` or manual `waitForTimeout()` calls and is the primary reason Playwright tests are significantly less flaky than Selenium-based tests that require manual `WebDriverWait` setup.

#### 6.2.3 Semantic Locators (Web-First Approach)

Playwright provides a hierarchy of locators ordered from most to least resilient to UI changes. The recommended priority is:

1. `page.getByRole(role, { name })` — locates by ARIA role and accessible name. Mirrors how assistive technologies and users perceive the UI.
2. `page.getByLabel(text)` — locates a form input by the text of its associated `<label>` element.
3. `page.getByPlaceholder(text)` — locates an input by its `placeholder` attribute.
4. `page.getByText(text)` — locates an element by its visible text content.
5. `page.getByAltText(text)` — locates an image by its `alt` attribute.
6. `page.getByTitle()` — locates an element by its `title` attribute.
7. `page.getByTestId(id)` — locates by a `data-testid` attribute added by developers specifically for testing.
8. CSS selectors / XPath — used only as a last resort when no semantic locator is available.

Semantic locators are resilient to markup restructuring (e.g., changing from a `<div>` button to a `<button>`) and to CSS class name changes. They also double as accessibility checks.

#### 6.2.4 APIRequestContext — Native API Testing

Playwright includes a built-in HTTP client (`APIRequestContext`) allowing tests to make direct API calls without launching a browser. The same `APIRequestContext` can share authentication cookies and headers with browser-based tests, enabling hybrid test scenarios.

```typescript
// Pure API test — no browser required
const response = await request.post("/api/login", {
  data: { email: "test@eshop.com", password: "Test1234!" },
});
expect(response.status()).toBe(200);
const body = await response.json();
expect(body).toHaveProperty("token");
```

This native capability enables:

- **API-first test setup:** Create test data via API before the UI test runs (faster than navigating the UI).
- **API contract validation:** Assert exact response schemas, status codes, and headers.
- **Security testing:** Send crafted payloads (e.g., manipulated `total_amount`, `role` escalation) directly at the API layer without the UI blocking the attempt.

#### 6.2.5 Network Interception & Mocking (`page.route()`)

Playwright can intercept any HTTP request made by the browser and choose to: fulfill it with a mock response, modify it, abort it, or pass it through to the real server.

```typescript
// Simulate a 500 Internal Server Error from the products API
await page.route("/api/products", (route) => {
  route.fulfill({ status: 500, body: "Internal Server Error" });
});
```

This is used for:

- Testing **error states** in the UI (e.g., how does the product listing page look when the API returns 500?).
- Testing **loading states** (delay the API response to confirm the loading spinner appears).
- **Simulating specific API responses** for edge cases that are difficult to reproduce with real data.

> **Important rule:** We mock third-party external services only. We never mock the EShop's own API during E2E tests — the purpose of E2E tests is to validate the real integration between the frontend and the backend.

#### 6.2.6 Test Fixture System

Playwright's fixture system (implemented via `test.extend()`) is the recommended mechanism for sharing reusable setup and teardown logic. Fixtures replace `beforeAll`/`beforeEach` hooks for complex shared state.

Fixture scopes:

- **`'test'` (default):** Created fresh for each individual test and torn down after it completes. Ensures full isolation between tests. This is the correct scope for the vast majority of fixtures (authenticated pages, API request contexts, test data).
- **`'worker'`:** Created once per worker process and shared across all tests running in that worker. Use for expensive resources that are safe to share — database connections, auth tokens obtained once, SDK clients. Worker-scoped fixtures have their own timeout equal to the default test timeout.
- **`'file'`:** Created once for all tests within the same spec file and torn down when the file finishes. Equivalent to `beforeAll`/`afterAll` scoped to a file. Useful for feature-level setup that should run once before a group of related tests.

Example fixture pattern used in this project:

```typescript
// fixtures/auth.fixture.ts
export const test = base.extend<{ userPage: Page; adminPage: Page }>({
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: "auth/user.json",
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: "auth/admin.json",
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```

#### 6.2.7 Trace Viewer

Playwright can record a **complete execution trace** during test runs. A trace is a compressed `.zip` archive containing:

- **DOM snapshots** at every action step (before and after).
- **Network log:** Full HTTP request/response pairs with headers and bodies.
- **Console log:** All browser console output.
- **Screenshots** at each step.
- **Video recording** of the test run.
- **Source code mapping:** Which test line triggered which browser action.

The trace is opened with `npx playwright show-trace trace.zip` in a browser-based interactive viewer. This allows deep post-mortem debugging without re-running the failed test — invaluable for CI failures.

Configuration for this project: `trace: 'on-first-retry'` — captures traces only when a test fails on its first run and is being retried. Avoids trace overhead for passing tests.

#### 6.2.8 Parallel Test Execution

Playwright distributes test files across multiple **worker processes** by default, running them in parallel. Each worker has an independent browser context, ensuring full isolation.

- **Default:** Number of workers = 50% of available CPU cores.
- **Configurable:** `workers: 4` (fixed count) or `workers: '75%'` (percentage of cores).
- `fullyParallel: true`: Runs individual `test()` blocks within a file in parallel, not just files.

**Effect:** A suite of 100 tests taking 2 seconds each (200s sequential) finishes in approximately 50s with 4 workers. This is a theoretical estimate; actual time varies depending on browser startup overhead, fixture setup time, and network latency.

#### 6.2.9 Multiple Built-in Reporters

Playwright supports multiple simultaneous reporters:

| Reporter | Output                                                        | Use Case                                                 |
| -------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| `html`   | Interactive HTML file with timeline, screenshots, trace links | Local debugging, sharing results                         |
| `junit`  | JUnit XML file                                                | CI/CD integration (Jenkins, GitHub Actions test summary) |
| `json`   | Machine-readable JSON                                         | Custom result processing, dashboards                     |
| `github` | Inline annotations on GitHub PR                               | PR review workflow                                       |
| `list`   | Console output with test names and results                    | Local development                                        |
| `dot`    | Minimal console dots (`.` for pass, `F` for fail)             | CI pipelines with low output verbosity                   |

Configuration for this project: `reporter: [['html'], ['junit', { outputFile: 'reports/junit.xml' }]]`

#### 6.2.10 Authentication State Reuse (`storageState`)

Playwright can serialize the entire browser authentication state (cookies, `localStorage`, `sessionStorage`) to a JSON file and restore it in future test runs:

```typescript
// In global-setup.ts — runs once before all tests
await page.context().storageState({ path: "auth/user.json" });

// In playwright.config.ts — applied to all tests in a project
projects: [
  {
    name: "authenticated-web",
    use: { storageState: "auth/user.json" },
  },
];
```

This means tests that need an authenticated session **skip the login step entirely**, loading the pre-saved state directly into the browser context. This can save 2–5 seconds per test that would otherwise perform a full login sequence.

#### 6.2.11 Codegen — Test Recording

Playwright ships with a **code generator** (`npx playwright codegen <url>`) that opens a browser and records user interactions, automatically generating the corresponding Playwright TypeScript code. This is useful for:

- Rapidly discovering correct locators for UI elements.
- Generating a first draft of a test that can then be cleaned up and organized into the POM pattern.
- Demonstrating Playwright capabilities to stakeholders.

#### 6.2.12 Mobile Device Emulation

Playwright can emulate mobile devices with accurate screen dimensions, device pixel ratio, user agent strings, and touch event support using the `devices` dictionary:

```typescript
import { devices } from '@playwright/test';
use: { ...devices['iPhone 14'] }
```

This is useful for testing the EShop Frontend Web (`localhost:5173`) responsive layout at different viewport sizes, without requiring a physical device or separate mobile automation tool.

#### 6.2.13 Accessibility Testing Support

Playwright includes built-in ARIA snapshot assertions:

```typescript
await expect(page.locator("nav")).toMatchAriaSnapshot(`
  - navigation:
    - link "Trang chu"
    - link "Gio hang [badge: 3]"
    - link "Dang nhap"
`);
```

This validates the full accessibility tree structure of a component, supporting FR-21 (Tab Order) and FR-23 (Navbar highlight, badge count) requirements.

### 6.3 Playwright vs. Competing Tools

| Criterion                       | Playwright                                        | Selenium                                             | Cypress                                                                                         | mabl                     | Testim                  |
| ------------------------------- | ------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------ | ----------------------- |
| **License / Cost**              | Apache 2.0, free                                  | Apache 2.0, free                                     | MIT (core), free + paid cloud                                                                   | SaaS, paid subscription  | SaaS, paid subscription |
| **Browser Support**             | Chromium, Firefox, WebKit                         | All browsers via W3C WebDriver                       | Chromium only + experimental Firefox                                                            | Chromium-based           | Chromium-based          |
| **Language Support**            | TS, JS, Python, Java, .NET                        | Java, Python, C#, Ruby, JS                           | JavaScript/TypeScript only                                                                      | No-code GUI + limited JS | No-code GUI + JS        |
| **Auto-waiting**                | Built-in, intelligent, multi-condition            | Manual `WebDriverWait` / `FluentWait` required       | Built-in command retry                                                                          | Built-in                 | Built-in                |
| **API Testing**                 | Native `APIRequestContext`                        | Requires separate tool (e.g., RestAssured, requests) | `cy.request()` built-in                                                                         | Limited                  | Limited                 |
| **Network Interception**        | `page.route()` — full intercept, mock, abort      | Requires external proxy (e.g., BrowserMob Proxy)     | `cy.intercept()` built-in                                                                       | Yes                      | Yes                     |
| **Parallel Execution**          | Native, file-level, worker-based                  | Via Selenium Grid (significant setup required)       | Native parallel requires Cypress Cloud (paid); limited local parallelism via multiple processes | Yes                      | Yes                     |
| **Trace / Debugging**           | Trace Viewer (DOM snapshots, network, video)      | External tools required (no built-in equivalent)     | Time-travel debugger (screenshot-based)                                                         | Yes                      | Yes                     |
| **Multi-tab Support**           | Full native support                               | Via window handles (verbose, error-prone)            | Not supported natively                                                                          | Yes                      | Yes                     |
| **iFrame Support**              | Full support via `frameLocator()`                 | `driver.switchTo().frame()`                          | Limited — same-origin iframes only                                                              | Yes                      | Yes                     |
| **Mobile Emulation**            | Built-in `devices` dictionary                     | Requires Appium (separate tool)                      | Limited viewport only                                                                           | Yes                      | No                      |
| **Test Isolation**              | Each test gets a fresh browser context            | Shared browser session unless manually reset         | Shared Cypress session unless reset                                                             | Managed by platform      | Managed by platform     |
| **Initial Setup**               | Low — `npm init playwright@latest`                | Medium — WebDriver binary, browser config            | Low — `npm install cypress`                                                                     | Very low — GUI sign-up   | Very low — GUI sign-up  |
| **CI/CD Integration**           | Excellent — native GitHub Actions, Docker support | Good — mature but verbose configuration              | Good                                                                                            | Good                     | Good                    |
| **Suitable for Large Projects** | Yes                                               | Yes                                                  | Yes (with architectural discipline)                                                             | Yes                      | Yes                     |
| **Open-source/Auditable**       | Yes                                               | Yes                                                  | Yes                                                                                             | No                       | No                      |

**Why Playwright over Selenium?** Selenium requires manual explicit wait management (`WebDriverWait`, `ExpectedConditions`), has no built-in API testing capability, no built-in trace recording, and no built-in video recording. Setting up a Selenium Grid for parallel execution is significantly more complex than Playwright's out-of-the-box worker system. The developer experience gap between the two tools has widened substantially since Playwright's release.

**Why Playwright over Cypress?** Cypress lacks native WebKit/Safari support, cannot handle multiple browser tabs or windows natively, and its architecture (running inside the browser process) introduces constraints around cross-origin navigation. Playwright's architecture (controlling the browser externally via CDP/BiDi) avoids these constraints. Additionally, Playwright's API testing is more fully featured.

**Why Playwright over mabl/Testim?** mabl and Testim are AI-powered no-code/low-code SaaS tools. They are valuable for teams without programming resources, but they require paid subscriptions, are less auditable (test logic is stored on third-party servers), and offer less precision and extensibility than code-based approaches. They are also not suitable for academic settings where code authorship and version control are required.

### 6.4 Who Is Playwright For?

| Audience / Context                     | Suitability       | Notes                                                                     |
| -------------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| **Student / Academic projects**        | Excellent         | Free, well-documented, `codegen` lowers the entry bar                     |
| **Startup / Small QA team**            | Excellent         | Fast setup, minimal infrastructure, excellent DX                          |
| **Enterprise / Large-scale projects**  | Excellent         | TypeScript support, POM pattern, sharding, CI integration                 |
| **Teams with no coding background**    | Requires training | `codegen` helps start, but TypeScript knowledge is needed for maintenance |
| **Mobile testing**                     | Not suitable      | Use Appium (iOS/Android native) or Detox (React Native)                   |
| **Desktop app testing (non-Electron)** | Not suitable      | Use WinAppDriver or platform-native tools                                 |

Playwright is **free** and requires **no license** for any scale of project. It is suitable for both small academic assignments and large enterprise test suites running thousands of tests per day.

### 6.5 playwright-skill Reference (testdino-hq)

The `playwright-skill` (from `https://github.com/testdino-hq/playwright-skill`, MIT license) is an AI Agent skill library providing **70 reference guides** covering the full Playwright API surface with opinionated, production-tested patterns. It is used by the AI Agent when generating, reviewing, or fixing Playwright test code. Updated for Playwright 1.59+ coverage.

**Skill packs and guides relevant to this project:**

| Pack               | Guides | What's covered                                                                                                                                                                    |
| ------------------ | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **core**           |   47   | Locators, assertions, fixtures, auth, API testing, network mocking, visual regression, accessibility, debugging, trace-report analysis, framework recipes, architecture decisions |
| **ci**             |   9    | GitHub Actions, GitLab CI, CircleCI, Azure DevOps, Jenkins, Docker, sharding, reporting, coverage                                                                                 |
| **playwright-cli** |   10   | CLI browser automation, screenshots, tracing, session management, device emulation                                                                                                |
| **pom**            |   2    | Page Object Model patterns, POM vs fixtures vs helpers                                                                                                                            |
| **migration**      |   2    | Migrating from Cypress, migrating from Selenium                                                                                                                                   |

**Key guides from `core` pack used in this project:**

- `locators.md` — selector strategy and locator hierarchy
- `assertions-and-waiting.md` — web-first assertions, auto-retry patterns
- `fixtures-and-hooks.md` — `test.extend()`, scopes, worker fixtures
- `authentication.md` — `storageState` reuse, multi-role session management
- `api-testing.md` — `APIRequestContext` for REST API testing
- `network-mocking.md` — `page.route()` for error state simulation
- `forms-and-validation.md` — form interaction and validation testing
- `security-testing.md` — XSS, auth bypass, role escalation test patterns
- `react.md` — Vite + React specific testing recipes (relevant to EShop frontend)
- `debugging.md`, `flaky-tests.md`, `error-index.md` — failure diagnosis and stabilization
- `ci-github-actions.md` — workflows, caching, artifact uploads
- `parallel-and-sharding.md` — sharding across CI runners
- `global-setup-teardown.md` — one-time setup/teardown
- `reporting-and-artifacts.md` — HTML reports, traces, screenshots
- `test-coverage.md` — code coverage collection

**Playwright Golden Rules (enforced by this skill in all AI-generated code):**

1. `getByRole()` over CSS/XPath — resilient to markup changes, mirrors user perception.
2. Never use `page.waitForTimeout()` — use `expect(locator).toBeVisible()` or `page.waitForURL()`.
3. Use web-first assertions — `expect(locator)` auto-retries; `expect(await locator.textContent())` does not.
4. Isolate every test — no shared mutable state, no execution-order dependencies.
5. `baseURL` in config — zero hardcoded URLs in test files.
6. Retries: `2` in CI, `0` locally — expose flakiness where it matters most.
7. Traces: `'on-first-retry'` — rich debugging artifacts without CI performance overhead.
8. Fixtures over globals — share state via `test.extend()`, not module-level variables.
9. One behavior per test — multiple related `expect()` calls within a single test are acceptable.
10. Mock external services only — never mock the EShop's own API during E2E tests.

### 6.6 Common Playwright CLI Commands

```bash
# Install dependencies (run once after setup)
npm install

# Install Playwright browsers (run once after npm install)
npx playwright install

# Run all tests
npx playwright test

# Run a specific test file
npx playwright test tests/web/auth/login.spec.ts

# Run tests matching a title pattern
npx playwright test -g "TC-AUTH-01"

# Run only the smoke suite
npx playwright test tests/smoke/

# Run only web E2E tests
npx playwright test tests/web/

# Run only admin E2E tests
npx playwright test tests/admin/

# Run only API tests (no browser)
npx playwright test tests/api/

# Run in headed mode (visible browser)
npx playwright test --headed

# Run with a specific browser engine
npx playwright test --project=chromium
npx playwright test --project=firefox

# Run in debug mode (Playwright Inspector opens)
npx playwright test tests/web/auth/login.spec.ts --debug

# Run with slow motion for demo (500ms delay between actions)
npx playwright test tests/smoke/smoke.spec.ts --headed --project=chromium

# Open the HTML report after a run
npx playwright show-report

# Open a specific trace file in the Trace Viewer
npx playwright show-trace reports/html/data/some-test-trace.zip

# Record a new test using Codegen
npx playwright codegen http://localhost:5173
```

---

## 7. EShop SUT Analysis & Test Scope

### 7.1 System Overview

| Component    | Technology Stack            | Default URL             | In Test Scope                                 |
| ------------ | --------------------------- | ----------------------- | --------------------------------------------- |
| Backend API  | Node.js + Express + SQLite  | `http://localhost:3000` | Yes — API tests via `APIRequestContext`       |
| Frontend Web | React + Vite + Tailwind CSS | `http://localhost:5173` | Yes — E2E UI tests (customer-facing)          |
| Web Admin    | React + Vite + Tailwind CSS | `http://localhost:5174` | Yes — E2E UI tests (admin panel)              |
| Mobile App   | React Native + Expo         | LAN IP of host machine  | **No** — Out of scope (requires Appium/Detox) |

### 7.2 Default Test Accounts

| Role                  | Email                          | Password                  | Test Usage                                                                       |
| --------------------- | ------------------------------ | ------------------------- | -------------------------------------------------------------------------------- |
| Admin                 | `admin@eshop.com`              | `Admin123!`               | Admin panel E2E tests, order status management, user management                  |
| Standard User         | `test@eshop.com`               | `Test1234!`               | Customer-facing E2E tests, cart, checkout, order history                         |
| Dynamic test accounts | Generated by `@faker-js/faker` | Strong password generated | Registration tests, account lockout tests (isolated, cleaned up after each test) |

### 7.3 Functional Requirements Traceability Matrix

| FR ID            | Feature Name                     | Test Layer(s)      | Priority                         |
| ---------------- | -------------------------------- | ------------------ | -------------------------------- |
| FR-01            | User Registration                | UI E2E + API       | High                             |
| FR-02            | Login & Account Lockout          | UI E2E + API       | Critical                         |
| FR-03            | Forgot Password & OTP Reset      | UI E2E + API       | High                             |
| FR-04            | Profile Management               | UI E2E + API       | Medium                           |
| FR-05            | Product Listing & Search         | UI E2E + API       | High                             |
| FR-06            | Product Detail Page              | UI E2E             | Medium                           |
| FR-07            | Shopping Cart                    | UI E2E             | High                             |
| FR-08            | Checkout Flow                    | UI E2E + API       | Critical                         |
| FR-09            | Coupon Validation (5 conditions) | UI E2E + API       | High                             |
| FR-10            | Order State Machine              | API + UI Admin E2E | Critical                         |
| FR-11            | Order History (User)             | UI E2E + API       | Medium                           |
| FR-12            | Admin Access Control             | API                | Critical                         |
| FR-13            | Admin Dashboard                  | UI Admin E2E       | Medium                           |
| FR-14            | Category CRUD (Admin)            | UI Admin E2E + API | Medium                           |
| FR-15            | Product CRUD (Admin)             | UI Admin E2E + API | High                             |
| FR-16            | CSV Product Import (Admin)       | UI Admin E2E + API | Medium                           |
| FR-17            | Coupon CRUD (Admin)              | UI Admin E2E + API | Medium                           |
| FR-18            | Order Management (Admin)         | UI Admin E2E + API | Critical                         |
| FR-19            | User Management (Admin)          | UI Admin E2E + API | High                             |
| FR-20            | Mobile Application               | **Out of Scope**   | **None** (Requires Appium/Detox) |
| FR-21            | GUI Standards — General          | UI E2E             | Medium                           |
| FR-22            | Form Requirements                | UI E2E             | Medium                           |
| FR-23            | Navigation Requirements          | UI E2E             | Medium                           |
| FR-24            | Feedback & State Requirements    | UI E2E             | Medium                           |
| SEC-01 to SEC-07 | Security Requirements            | API + UI E2E       | High                             |

### 7.4 Out-of-Scope Items

| Item                                | Reason                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Mobile application (FR-20)          | Requires Appium or Detox — different tool, out of Playwright's scope                                                          |
| Performance / load testing          | Requires a dedicated tool (k6, Locust, Artillery) — Playwright is not a load testing tool                                     |
| Full visual regression              | Optional — requires a screenshot comparison service (Percy, Chromatic) or significant Playwright snapshot baseline management |
| Backend unit tests                  | Belong to the development team, not the QA automation layer                                                                   |
| Direct SQLite database manipulation | All test data management goes through the SUT's API layer                                                                     |

---

## 8. Project Structure & Setup

### 8.1 Recommended Project Structure

The Playwright test project lives in a dedicated **`e2e/`** folder inside `eshop-sut/`. This co-location strategy means tests are versioned alongside the SUT — every commit references an exact version of both the application and the tests that validated it.

```
eshop-sut/
├── backend/                        # SUT: Node.js API (DO NOT MODIFY)
├── frontend-web/                   # SUT: Customer-facing React app (DO NOT MODIFY)
├── frontend-admin/                 # SUT: Admin panel React app (DO NOT MODIFY)
├── frontend-mobile/                # SUT: Mobile app — out of scope (DO NOT MODIFY)
│
├── e2e/                            # Playwright test project root (standalone Node.js project)
│   ├── playwright.config.ts        # Root Playwright configuration — projects, browsers, reporters
│   ├── package.json                # Own dependencies, separate from SUT build toolchain
│   ├── tsconfig.json               # TypeScript config — path aliases (optional, see 8.2)
│   ├── .env                        # Runtime credentials & base URLs (GITIGNORED)
│   ├── .env.example                # Template for .env — committed to version control
│   ├── .gitignore                  # Excludes: auth/, reports/, node_modules/, .env
│   ├── global-setup.ts             # Runs once before all tests — authenticates roles, saves storageState
│   ├── global-teardown.ts          # Runs once after all tests — cleans up dynamically created test data
│   │
│   ├── auth/                       # Saved browser authentication states (GITIGNORED)
│   │   ├── user.json               # storageState for standard user (test@eshop.com)
│   │   └── admin.json              # storageState for admin user (admin@eshop.com)
│   │
│   ├── pages/                      # Page Object Model classes — one file per page
│   │   ├── base.page.ts            # BasePage abstract class — shared navigation helpers
│   │   ├── web/                    # POM classes for Frontend Web (localhost:5173)
│   │   └── admin/                  # POM classes for Web Admin (localhost:5174)
│   │
│   ├── fixtures/                   # Custom Playwright fixtures via test.extend()
│   │   └── index.ts                # Barrel export — single import point for all fixtures
│   │
│   ├── helpers/                    # Pure utility functions — API wrappers, faker generators
│   │
│   ├── test-data/                  # Static input files — CSV, JSON seed data
│   │
│   ├── tests/                      # Test spec files organized by domain
│   │   ├── web/                    # E2E UI tests for Frontend Web
│   │   ├── admin/                  # E2E UI tests for Web Admin
│   │   ├── api/                    # API-only tests — no browser
│   │   └── smoke/                  # Critical path smoke suite — target < 2 minutes
│   │
│   └── reports/                    # Generated test output (GITIGNORED)
│       └── html/                   # Playwright HTML report and junit.xml
│
├── .agents/
│   ├── skills/                     # Custom WAT skill definitions (wat- prefix)
│   │   ├── wat-scope/              # Skill: analyze SRS, map FRs, define scenario inventory
│   │   ├── wat-spec/               # Skill: design detailed E2E scenario spec using Scenario Testing approach
│   │   ├── wat-build/              # Skill: implement POM, fixtures, and test spec files one piece at a time
│   │   ├── wat-review/             # Skill: multi-axis quality review of completed test code
│   │   └── wat-fix/                # Skill: fix confirmed blocking findings with root-cause analysis
│   │
│   # The following skills are managed externally and copied into this project:
│   # - playwright-skill       → Playwright API reference + 10 Golden Rules (global or ./skills/)
│   # - functional-test-design → EP, BVA, Decision Table, State Transition, Use Case, Error Guessing (global or ./skills/)
│   # - ai-audit               → Structured AI interaction audit log generator (global or ./skills/)
│
├── docs/
│   ├── sut/                        # SUT references
│   │   ├── srs.md                  # SRS / Business Requirements (SOURCE OF TRUTH — DO NOT MODIFY)
│   │   ├── api-specìication.md     # API Contract (SOURCE OF TRUTH — DO NOT MODIFY)
│   │   └── setup-guide.md          # Setup Guide (DO NOT MODIFY)
│   │
│   ├── test-scope.md               # Overall scope document — output of /wat-scope
│   ├── scenarios/                  # One subfolder per E2E scenario
│   │   └── {scenario-id}/          # e.g., SC-01-auth-flow/
│   │       ├── spec.md             # Scenario specification — output of /wat-spec
│   │       └── review-notes.md     # Review findings — output of /wat-review
│   └── test-report.md              # Final test execution report
│
└── AGENTS.md                       # Agent role, rules, skill mapping, workflow reference
```

**Key structural decisions and rationale:**

| Decision                                                                     | Rationale                                                                                                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `e2e/` as a standalone sub-project (own `package.json`)                      | Prevents dependency conflicts between the SUT's React/Vite build toolchain and Playwright test dependencies                                                  |
| `pages/web/` vs. `pages/admin/` separation                                   | Two distinct frontends with different base URLs — separation prevents POM naming collisions                                                                  |
| `tests/api/` as a separate domain                                            | API tests run without a browser and significantly faster — enables API-only validation runs                                                                  |
| `tests/smoke/` dedicated suite                                               | ~10–15 critical tests covering core paths in under 2 minutes — used as a pre-regression CI gate                                                              |
| `fixtures/` instead of `beforeAll` hooks                                     | Playwright's fixture system provides cleaner dependency injection and avoids shared mutable state                                                            |
| `auth/` state files (gitignored)                                             | `storageState` files contain live session tokens — must never be committed to version control                                                                |
| `test-data/` committed static files                                          | CSV and JSON input files committed so tests are reproducible across machines and CI                                                                          |
| `docs/scenarios/{scenario-id}/` subfolder per scenario                       | Each scenario produces multiple artifacts (spec, review-notes) — per-scenario subfolders keep them co-located and avoid naming collisions as the suite grows |
| `docs/audit/` separate subfolder                                             | Audit log is a compliance artifact distinct from test design artifacts — separation makes it easier to locate and share independently                        |
| `.agents/` in project root                                                   | AI Agent configuration versioned alongside SUT and test code — ensures consistent AI behavior across sessions                                                |
| 5 custom `wat-` skills in `.agents/skills/`                                  | Each covers one phase of the WAT workflow — scope, spec, build, review, fix. Kept separate so each can be maintained and invoked independently               |
| 3 external skills (`playwright-skill`, `functional-test-design`, `ai-audit`) | Reusable across projects — managed globally or copied in. Not modified per-project                                                                           |

### 8.2 TypeScript Configuration (`tsconfig.json`)

Playwright uses `esbuild` internally to transpile TypeScript — TypeScript compiler (`tsc`) does **not** need to be installed globally. When you run `npm init playwright@latest` and select TypeScript, a minimal working `tsconfig.json` is generated automatically.

The `tsconfig.json` below is **optional but recommended** if you want path aliases (`@pages/`, `@fixtures/`) for cleaner imports. If you skip it, all imports use relative paths instead.

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["pages/*"],
      "@fixtures/*": ["fixtures/*"],
      "@helpers/*": ["helpers/*"],
      "@test-data/*": ["test-data/*"],
    },
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules"],
}
```

Path aliases (`@pages/`, `@fixtures/`) allow clean imports like `import { LoginPage } from '@pages/web/login.page'` instead of `../../pages/web/login.page`.

### 8.3 Playwright Configuration Key Settings (`playwright.config.ts`)

| Setting          | Recommended Value                                            | Rationale                                                                                        |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `fullyParallel`  | `true`                                                       | Run individual tests within a file in parallel, not just across files                            |
| `retries`        | `2` (CI), `0` (local)                                        | Surface flakiness in CI; fail fast locally for developer feedback                                |
| `workers`        | `4` (CI), `undefined` (local)                                | Controlled parallelism in CI; local defaults to 50% of CPU cores                                 |
| `reporter`       | `[['html'], ['junit', { outputFile: 'reports/junit.xml' }]]` | HTML for interactive debugging; JUnit XML for CI pipeline integration                            |
| `use.trace`      | `'on-first-retry'`                                           | Capture trace only when a test fails and is retried — balances debugging value with storage cost |
| `use.screenshot` | `'only-on-failure'`                                          | Capture screenshot only on test failure                                                          |
| `use.video`      | `'retain-on-failure'`                                        | Record video but discard it for passing tests                                                    |
| `globalSetup`    | `'./global-setup.ts'`                                        | Runs once before the suite — authenticates both roles, saves `storageState` files                |
| `globalTeardown` | `'./global-teardown.ts'`                                     | Runs once after the suite — cleans up dynamically created test data                              |

> **Note:** `testDir` is omitted from global config because each project below defines its own test scope via `testMatch`. This avoids redundancy and makes each project's scope explicit.

**Multi-project configuration (web, admin, API):**

```typescript
projects: [
  {
    name: "web-chromium",
    use: {
      ...devices["Desktop Chrome"],
      baseURL: "http://localhost:5173",
      storageState: "auth/user.json", // created by global-setup.ts
    },
    testMatch: "tests/web/**/*.spec.ts",
  },
  {
    name: "admin-chromium",
    use: {
      ...devices["Desktop Chrome"],
      baseURL: "http://localhost:5174",
      storageState: "auth/admin.json", // created by global-setup.ts
    },
    testMatch: "tests/admin/**/*.spec.ts",
  },
  {
    name: "api",
    use: {
      baseURL: "http://localhost:3000",
      // No storageState — API tests manage auth via request headers directly
    },
    testMatch: "tests/api/**/*.spec.ts",
  },
],
```

### 8.4 Setup Procedure (Step-by-Step)

1. **Ensure all SUT services are running** (refer to `setup_guide.md`):
   - **Backend API:** Verify with `curl http://localhost:3000/api/products` — expect HTTP 200.
   - **Frontend Web:** Open `http://localhost:5173` and confirm product listing renders.
   - **Web Admin:** Open `http://localhost:5174` and confirm the admin login page loads.
2. **Scaffold the `e2e/` Playwright project:**
   ```bash
   cd eshop-sut
   mkdir e2e && cd e2e
   npm init playwright@latest .
   # Prompts:
   # - Language: TypeScript
   # - Test directory: tests
   # - GitHub Actions workflow: No (add manually if needed)
   # - Install browsers: Yes
   ```
3. **Install additional dependencies:**
   ```bash
   npm install -D @faker-js/faker dotenv
   ```
4. **Configure environment variables:**
   - Copy `.env.example` to `.env` (create `.env.example` first with all required keys).
   - **Required keys:** `WEB_BASE_URL`, `ADMIN_BASE_URL`, `API_BASE_URL`, `USER_EMAIL`, `USER_PASSWORD`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
5. **Replace the generated `playwright.config.ts`** with the multi-project configuration.
6. **Add `.gitignore`** inside `e2e/` with at minimum:
   ```bash
   auth/
   reports/
   node_modules/
   .env
   ```
7. **Implement `global-setup.ts`** to authenticate as both roles and save `storageState` files to `auth/user.json` and `auth/admin.json`.
8. **Create the folder structure** for `pages/`, `fixtures/`, `helpers/`, `test-data/`, `tests/`, and `docs/`.
9. **Validate the setup** — at this point no tests exist yet, so verify the framework initializes correctly:
   ```bash
   npx playwright test --list
   # Expected output: "No tests found" or lists any placeholder tests
   # If this command runs without error, the framework is correctly configured
   ```
   Once the first test file is written, validate with:
   ```bash
   npx playwright test --headed
   ```

---

## 9. Test Suite Architecture

### 9.1 Page Object Model (POM)

The **Page Object Model** is the primary structural design pattern for this test suite. It was originally described by Martin Fowler and is the most widely adopted pattern for maintainable browser automation.

Core principles of POM as applied in this project:

| Principle                       | Implementation                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| Each page is one class          | `LoginPage`, `CartPage`, `AdminOrdersPage`, etc. — one file per major page                          |
| Locators are class properties   | Defined as `readonly` Playwright `Locator` properties using semantic selectors                      |
| Actions are methods             | `login()`, `addToCart()`, `applyСoupon()` — named for user intent, not implementation               |
| No assertions in Page Objects   | `expect()` belongs in the test spec file — keeps POMs reusable across tests with different outcomes |
| Inheritance for shared behavior | All POMs extend `BasePage` which provides `navigate(path)`, `waitForLoadState()`, etc.              |

```typescript
// pages/base.page.ts
import { Page } from "@playwright/test";

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
    // Playwright auto-waits for the load event
  }
}

// pages/web/login.page.ts
import { Locator, Page } from "@playwright/test";
import { BasePage } from "@pages/base.page";

export class LoginPage extends BasePage {
  readonly emailInput: Locator = this.page.getByLabel("Email");
  readonly passwordInput: Locator = this.page.getByLabel("Mat khau");
  readonly submitButton: Locator = this.page.getByRole("button", {
    name: "Dang nhap",
  });
  readonly errorAlert: Locator = this.page.getByRole("alert");

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorText(): Promise<string | null> {
    return this.errorAlert.textContent();
  }
}
```

### 9.2 Fixture Strategy

Fixtures decouple test setup from test logic. The fixture system eliminates boilerplate `beforeEach` blocks and makes test preconditions explicit in the test function signature.

| Fixture           | Scope    | What it provides                                                                                                                   |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `userPage`        | `'test'` | A `Page` instance with `user.json` `storageState` pre-loaded — the test runs as the standard user                                  |
| `adminPage`       | `'test'` | A `Page` instance with `admin.json` `storageState` pre-loaded — the test runs as admin                                             |
| `userApiRequest`  | `'test'` | An `APIRequestContext` with `Authorization: Bearer <user-token>` header pre-set                                                    |
| `adminApiRequest` | `'test'` | An `APIRequestContext` with `Authorization: Bearer <admin-token>` header pre-set                                                   |
| `emptyCart`       | `'test'` | Clears the test user's cart via API before the test runs                                                                           |
| `seededProduct`   | `'test'` | Creates a product via `POST /api/products`, yields its `id`, then deletes it via `DELETE /api/products/:id` after the test         |
| `seededOrder`     | `'test'` | Creates a full order (adds to cart + checkouts via API) in `pending` state, yields its `id`, then cancels/cleans up after the test |

Usage example:

```typescript
// The test declares what it needs; the fixture system provides it
test("TC-CART-01: should add a product to cart", async ({
  userPage,
  seededProduct,
}) => {
  const homePage = new HomePage(userPage);
  await homePage.navigate("/");
  await homePage.clickProduct(seededProduct.id);
  // ... assertions
});
```

### 9.3 Test Data Management Strategy

| Strategy                                  | When to Use                                                             | Example                                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **API-created before test (via fixture)** | When the test needs data in a precise, known state                      | Create a `pending` order before testing cancellation — avoids depending on UI flow for setup  |
| **Faker-generated random data**           | When uniqueness matters and data doesn't need to persist after the test | Registration tests — generate a unique email each run to avoid duplicate email conflicts      |
| **Static seed data (global-setup)**       | When multiple tests depend on the same baseline data                    | Default admin/user accounts, the 4 sample coupon codes from the SRS, a set of sample products |
| **File-based static data**                | For file upload tests                                                   | `test-data/valid-products.csv` used in FR-16 CSV import tests                                 |

**Data isolation rule:** Each test must clean up the data it creates. No test should depend on data left behind by a previous test. The `seededProduct` and `seededOrder` fixtures enforce this by deleting their data in the fixture teardown phase (the code after `await use(...)` in the fixture definition).

---

## 10. AI Agent Integration Workflow

### 10.1 Philosophy: Human-in-the-Loop

The AI Agent integration follows a strict **human-in-the-loop** model. The AI generates, analyzes, and suggests — but the human reviews, corrects, and approves at every gate before the next phase begins. The only fully automated step is the execution of the finalized and approved Playwright test scripts.

**This model exists because:**

- AI-generated test code can contain incorrect locators, wrong expected values, or missing scenarios.
- The SRS contains Vietnamese business rules that require human judgment to interpret correctly.
- Academic integrity requires that the student actively understands and approves all artifacts.
- The AI audit log is only meaningful if a real human review occurred at each gate.

---

### 10.2 Skills Inventory

Skills are reusable instruction sets that the AI Agent loads to perform specific tasks. All custom skills use the `wat-` prefix (Web Automation Testing) to distinguish them from any globally installed skills. Skills are not standalone commands — they are invoked by commands (see Section 10.3).

#### `wat-scope`

**Location:** `eshop-sut/.agents/skills/wat-scope/`  
**Core content:** Instructs the AI to read `docs/sut/srs.md` and `docs/sut/api-specification.md`, map every FR and SEC requirement to its appropriate test layer (UI E2E / API / both), identify the full set of E2E scenarios needed to achieve adequate coverage, assign priorities, and output a structured scope document. Each scenario in the output is named and scoped at a high level only — detailed flow design is deferred to `wat-spec`. This skill is invoked **once** at project start, not per scenario.

#### `wat-spec`

**Location:** `eshop-sut/.agents/skills/wat-spec/`  
**Core content:** Instructs the AI to take one scenario from the approved scope document, read the relevant FRs from `docs/sut/srs.md` and endpoint contracts from `docs/sut/api-specification.md`, and apply **Scenario Testing approach** to design the detailed E2E flow — each step representing a user action and its expected system response. At steps involving input fields, business rules, or state changes, the skill instructs the AI to invoke `functional-test-design` to select and apply the appropriate technique (EP/BVA for inputs, Decision Table for multi-condition rules, State Transition for stateful workflows, Error Guessing for security/integration boundaries). Output format: scenario ID, preconditions, numbered steps, expected outcome per step, test data guidance, and technique applied per step.

#### `wat-build`

**Location:** `eshop-sut/.agents/skills/wat-build/`  
**Core content:** Instructs the AI to read an approved `spec.md`, determine the correct implementation order internally (POM classes first, then fixtures, then test spec files), and implement one piece at a time — pausing after each piece for the human to run it locally before continuing. Enforces POM pattern (locators as class properties, actions as methods, no assertions in POM classes), semantic locators only, no hardcoded URLs or credentials, web-first assertions. Invokes `playwright-skill` as the authoritative reference for all Playwright API usage, locator selection, and fixture patterns. All files must be stored in exact folder based on `docs/srs/project-structure.md`.

#### `wat-review`

**Location:** `eshop-sut/.agents/skills/wat-review/`  
**Core content:** Instructs the AI to review all test files, POM classes, and fixtures for a completed scenario across four axes: (1) Playwright Golden Rule conformance — verified against `playwright-skill`; (2) spec coverage — does the implemented code exercise what `spec.md` required, verified against `functional-test-design` to confirm each technique was correctly applied; (3) test isolation — no shared mutable state, fixture teardown present for every created resource; (4) security coverage — auth bypass and role escalation scenarios implemented where the SRS requires it. Output: `review-notes.md` with findings classified as Blocking, Non-blocking, or Coverage Gap.

#### `wat-fix`

**Location:** `eshop-sut/.agents/skills/wat-fix/`  
**Core content:** Instructs the AI to process human-confirmed Blocking findings from `review-notes.md` one at a time — providing a root-cause explanation before touching any code, modifying only the specific lines identified (no unrelated rewrites), and supplying the exact CLI command to re-run the affected test after the fix. For Coverage Gap findings, invokes `functional-test-design` to verify which technique or scenario branch was missing before adding new test cases, and invokes `playwright-skill` to ensure any new code follows Golden Rules.

---

### External Skills (managed outside this project)

These three skills are **not created per-project** — they are maintained globally or copied in as-is. The `wat-` skills above invoke them by name; their content must not be modified for this project.

#### `playwright-skill` _(external)_

**Core content:** 70 production-tested Playwright guides covering locator strategy, web-first assertions, fixture patterns, `storageState` reuse, `APIRequestContext`, `page.route()` mocking, form testing, security testing patterns, React/Vite-specific recipes, and flakiness remediation. Encodes the 10 Playwright Golden Rules that all AI-generated code must satisfy. Invoked by `wat-build`, `wat-review`, and `wat-fix`.

#### `functional-test-design` _(external)_

**Core content:** Reference library for functional test design techniques: Equivalence Partitioning, Boundary Value Analysis, Decision Table Testing, State Transition Testing, Use Case Testing, and Error Guessing. Each technique includes definition, decision criteria for when to apply it, and application rules. Invoked by `wat-spec` (to select technique per step) and `wat-review` (to verify technique coverage). Kept external and generic so it can be reused across any functional testing project regardless of tool or domain.

#### `ai-audit` _(external)_

**Core content:** Generates a structured audit log entry after any AI-assisted workflow step. Pre-populates: entry ID (auto-incremented), command/skill invoked, feature or artifact reference, AI model used, timestamp, input prompt summary, output summary, files produced. Leaves blank for human completion: Human Review Result (Agree / Partially Agree / Disagree), disagreements found, corrections made, and sign-off. Appends to `docs/audit/ai-audit-log.md`. Designed to be project-agnostic and reusable across any project requiring AI interaction traceability.

---

### 10.3 Commands & Workflow

Each command invokes one or more skills. **Always** = loaded unconditionally. **Conditional** = loaded only when the specified condition is met.

---

#### `/wat-scope` — Define Overall Test Scope

**Purpose:** Analyze the full SRS and API spec once and produce the master scope document that drives all subsequent scenario work.

**When to run:** Once at project start, before any `/wat-spec` call.

**Input:** None — the agent reads `docs/sut/srs.md` and `docs/sut/api-specification.md` directly.

**Output:** `docs/test-scope.md`

| Skill       | Invocation | Reason                                                       |
| ----------- | ---------- | ------------------------------------------------------------ |
| `wat-scope` | Always     | Core driver — FR mapping, scenario list, priority assignment |

**Human gate:** Review `docs/test-scope.md` — confirm scenario list and priorities are complete and correct before proceeding to `/wat-spec`.  

---

#### `/wat-spec` — Design One Scenario Specification

**Purpose:** Produce a detailed E2E scenario specification for one scenario from the approved scope document.

**Input:** Scenario ID from `docs/test-scope.md` (e.g., `SC-01`).

**Output:** `docs/scenarios/{scenario-id}/spec.md`

| Skill                    | Invocation | Reason                                                           |
| ------------------------ | ---------- | ---------------------------------------------------------------- |
| `wat-spec`               | Always     | Core driver — scenario structure, step design, expected outcomes |
| `functional-test-design` | Always     | Ensures correct technique is selected and applied at each step   |
| `playwright-skill`       | Always     | Determines which steps are testable at UI vs. API layer          |

**Human gate:** Review spec against `docs/sut/srs.md` and `docs/sut/api-specification.md`. Approve, request corrections, or reject before running `/wat-build`.  

---

#### `/wat-build` — Implement Test Code for One Scenario

**Purpose:** Implement all test code (POM classes, fixtures, test spec files) for one approved scenario, one piece at a time with human verification after each piece.

**Input:** Scenario ID with an approved `spec.md` (e.g., `SC-01`).

**Output:** Files created in `e2e/pages/`, `e2e/fixtures/`, `e2e/tests/` (based on `docs/srs/project-structure.md`)

| Skill              | Invocation | Reason                                                                       |
| ------------------ | ---------- | ---------------------------------------------------------------------------- |
| `wat-build`        | Always     | Core driver — implementation order, POM pattern, single-piece-at-a-time rule |
| `playwright-skill` | Always     | Authoritative reference for all Playwright API usage and Golden Rules        |

**Human gate (per piece):** After each POM class, fixture, or test file — run `npx playwright test {file} --headed` and report result. If fail, report error to AI for correction before the next piece.  

> **Note:** The agent determines the implementation order internally (POM → fixture → test file). No separate task planning step or human approval of task order is required.

---

#### `/wat-review` — Review Completed Scenario Code

**Purpose:** Perform a comprehensive multi-axis quality review of all code produced for a completed scenario.

**Input:** Scenario ID with all implementation complete (e.g., `SC-01`).

**Output:** `docs/scenarios/{scenario-id}/review-notes.md`

| Skill                    | Invocation | Reason                                                           |
| ------------------------ | ---------- | ---------------------------------------------------------------- |
| `wat-review`             | Always     | Core driver — review axes, finding classification, output format |
| `playwright-skill`       | Always     | Validates Golden Rule conformance                                |
| `functional-test-design` | Always     | Verifies technique coverage against what spec required           |

**Human gate:** Read `review-notes.md`, mark each finding as Confirmed or Dismissed with reasoning. Zero Blocking findings → scenario done. Blocking findings exist → run `/wat-fix`.  

---

#### `/wat-fix` — Fix Confirmed Blocking Findings

**Purpose:** Resolve every human-confirmed Blocking finding with root-cause analysis and targeted code fix.

**Input:** Confirmed Blocking findings in `docs/scenarios/{scenario-id}/review-notes.md`.

**Output:** Updated files in `e2e/`

| Skill                    | Invocation                              | Reason                                                       |
| ------------------------ | --------------------------------------- | ------------------------------------------------------------ |
| `wat-fix`                | Always                                  | Core driver — root-cause analysis, fix scope rules           |
| `playwright-skill`       | Always                                  | Ensures fixes follow Playwright best practices               |
| `functional-test-design` | Conditional: Coverage Gap findings only | Determines which missing technique or scenario branch to add |

**Human gate:** Re-run affected tests to confirm fixes pass. Update finding status to Resolved. New Blocking findings → `/wat-review` again. All resolved → scenario done.  

---

### 10.4 Full Workflow

> **Audit note:** After each command, the human manually invokes `ai-audit` and completes the Human Review Result fields before proceeding.

```
[One time — project start]
├── /wat-scope → [HUMAN] Review & approve scope document
│
└── [For each scenario in docs/test-scope.md]
    ├── /wat-spec (SC-XX) → [HUMAN] Review spec vs srs → Approve or correct
    │
    ├── /wat-build (SC-XX)  ← repeats per implementation piece → [HUMAN] Run piece locally → Pass or report failure
    │
    ├── /wat-review (SC-XX) → [HUMAN] Confirm or dismiss each finding
    │
    ├── (if Blocking findings exist)
    ├── /wat-fix (SC-XX) → [HUMAN] Re-run tests → Confirm fixes pass
    │
    ├── (loop /wat-review if new findings emerge)
    └── DONE → next scenario
```

---

### 10.5 Command-to-Skill Summary

| Command       | Skills (Always)                                            | Skills (Conditional)                         | Output                                |
| ------------- | ---------------------------------------------------------- | -------------------------------------------- | ------------------------------------- |
| `/wat-scope`  | `wat-scope`                                                | —                                            | `docs/test-scope.md`                  |
| `/wat-spec`   | `wat-spec`, `functional-test-design`, `playwright-skill`   | —                                            | `docs/scenarios/{id}/spec.md`         |
| `/wat-build`  | `wat-build`, `playwright-skill`                            | —                                            | Files in `e2e/`                       |
| `/wat-review` | `wat-review`, `playwright-skill`, `functional-test-design` | —                                            | `docs/scenarios/{id}/review-notes.md` |
| `/wat-fix`    | `wat-fix`, `playwright-skill`                              | `functional-test-design` (Coverage Gap only) | Updated files in `e2e/`               |

---

### 10.6 AGENTS.md — Required Content

The `AGENTS.md` file at root is the AI Agent's primary configuration document, read at the start of every session. The following sections must be present:

- **Project overview:** EShop SUT description, intentionally-buggy for testing coursework, and the definitive statement that `docs/sut/srs.md` is the ground truth — any SUT behavior contradicting it is a defect to be documented.
- **Agent role definition:** QA Automation specialist — reads requirements, produces scenario specifications, generates Playwright TypeScript code, performs quality reviews, logs audit entries. Must never modify any file in `backend/`, `frontend-web/`, `frontend-admin/`, or `frontend-mobile/`.
- **Reference document mapping:** When to read each file:
  - `docs/sut/srs.md` — SRS, source of truth; read before every `/wat-spec` and before writing any test assertion
  - `docs/sut/api-specification.md` — API contract; read when designing API tests or API-based fixture setup
  - `docs/sut/project-structure.md` — Project structure; read when generating any new file to ensure correct directory placement
- **Technology stack:** Backend (Node.js + Express + SQLite, port 3000), Frontend Web (React + Vite + Tailwind, port 5173), Web Admin (React + Vite + Tailwind, port 5174), test framework (Playwright 1.61+ TypeScript), test root (`eshop-sut/e2e/`).
- **Skill mapping:** Full table from Section 10.5.
- **Playwright Golden Rules:** All 10 rules from Section 6.5 — enforced in every generated code file without exception.
- **Code conventions:** English only; `TC-{MODULE}-{NUMBER}` test ID format; no hardcoded URLs (`baseURL` from config); no hardcoded credentials (`.env`); no CSS selectors without comment justification; web-first assertions only; no `waitForTimeout()`.
- **Strict constraints:** Never modify SUT source files; never mock the EShop's own API in E2E tests; never use direct SQLite queries; always derive expected text from `docs/sut/srs.md`; never generate tests for requirements not in the SRS.
