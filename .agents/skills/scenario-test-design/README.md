<div align="center">
  <h1>Scenario Test Design Skill</h1>
  <small>
    <strong>Author:</strong> Nguyễn Tấn Phát
  </small> <br />
  <sub>July 09, 2026</sub>
</div>

This repository provides an AI agent skill, **Scenario Testing Design**, which enables AI assistants to systematically design end-to-end (E2E) test scenarios based on real-world business workflows. Rather than generating automation code or test scripts, this skill focuses strictly on **Test Design** — analyzing requirements, identifying critical user journeys, and producing a complete, non-redundant, and fully traceable scenario suite.

## ✨ Features

- **Structured 6-Step Design Process:** Guides the AI through Input Analysis, Actor & Context Mapping, Scenario Identification, Scenario Design, Coverage Review, and a Quality Self-Check.
- **16 Generation Techniques:** Employs advanced test generation techniques (e.g., Life History of Objects, Disfavored Users, Sequence Analysis) to ensure edge cases and negative paths are covered.
- **Anti-Pattern Avoidance:** Strictly prevents poor practices like CRUD-based testing, happy-path-only suites, and untraceable scenarios.
- **Standardized Output:** Produces a comprehensive Markdown document complete with traceability matrices, detail cards, and quality compliance checklists.
- **Business-Centric:** Focuses on user-centric workflows and verifiable expected results rather than technical implementation details.

## 🚀 Installation

To add this skill to your AI agent project:

1. Download or clone this repository.
2. Copy the entire `scenario-test-design/` into the `skills/` of your project or the goblal `skills/` of your Agent tool.

## 💻 Usage

Invoke the skill by passing Business Requirements (BRs), Functional Requirements (FRs), User Stories, or system constraints.

**Conversation Mode:**

```
/scenario-test-design
[Paste your requirements here]
```

_The AI will output the analysis and scenario tables inline in the chat._

**File Output Mode:**

```
/scenario-test-design --file="docs/test-scenarios.md"
[Paste your requirements here]
```

_The AI will write the generated scenario suite directly to the specified file._

### When to use this skill

- You have raw requirements (BRs/FRs) and need to establish E2E flows.
- You are preparing for sprint testing, UAT, or building a regression test plan.
- You want to identify negative paths, edge cases, and security misuse scenarios before writing test automation scripts.

### When NOT to use this skill

- When you need to generate test automation scripts (e.g., Selenium, Playwright, Cypress).
- When you are conducting component-level or unit testing.
- When you only need mock test data for an already designed suite.
