<div align="center">
  <h1>Functional Test Design Skill</h1>
  <small>
    <strong>Author:</strong> Nguyễn Tấn Phát
  </small> <br />
  <sub>July 06, 2026</sub>
</div>

This repository contains a comprehensive, ISTQB-aligned AI skill suite for systematic **Functional Test Design**. It is designed to evaluate functional requirements and business rules, ensuring that generated test suites are both **sufficient** (no meaningful defect-prone area left uncovered) and **efficient** (no redundant test cases).

The suite operates through a **Parent Router Skill** (`functional-test-design`) that dynamically selects and orchestrates five specialized sub-skills based on the nature of the requirement under test.

## 🧠 Core Capabilities (The Skills)

This repository includes one parent skill and five specialized sub-skills:

### 1. Functional Test Design (Parent Router)

- **Role:** The orchestration layer.
- **Purpose:** Analyzes raw requirements, identifies their primary characteristics, and automatically routes to (or orchestrates) the correct underlying test design technique(s).
- **Invoke:** `/functional-test-design`

### 2. Domain Testing (`domain-testing`)

- **Technique:** Equivalence Partitioning (EP) + Boundary Value Analysis (BVA).
- **Use When:** Testing input/output value constraints (ranges, lengths, formats, enumerations).
- **Invoke:** `/domain-testing`

### 3. Decision Table Testing (`decision-table-testing`)

- **Technique:** Decision Table Testing.
- **Use When:** Testing business rules where multiple interacting conditions produce different system outcomes (if-then-else logic, combinations).
- **Invoke:** `/decision-table-testing`

### 4. State Transition Testing (`state-transition-testing`)

- **Technique:** State Transition Testing (Finite State Machine modeling).
- **Use When:** System behavior depends on prior history, named statuses, or lifecycle stages (e.g., account statuses, order workflows).
- **Invoke:** `/state-transition-testing`

### 5. Use Case Testing (`use-case-testing`)

- **Technique:** Use Case Testing.
- **Use When:** Testing complete end-to-end actor-system interaction flows toward a defined goal, including main and alternate paths.
- **Invoke:** `/use-case-testing`

### 6. Error Guessing (`error-guessing`)

- **Technique:** Error Guessing (Fault Attack).
- **Use When:** Supplementing a completed systematic test suite with high-value, defect-targeted cases based on domain knowledge and historical defect data.
- **Invoke:** `/error-guessing`

## ⚙️ Installation & Integration

To integrate this skill suite into your AI assistant environment, you must copy the provided skill files into your environment's `skills/` directory. You have two integration options:

### Option 1: Complete Suite Integration (Recommended)

This installs the parent router and all specialized sub-skills, allowing the AI to automatically orchestrate multiple techniques for complex requirements.

1. Clone or download this repository.
2. Copy the entire `functional-test-design` folder into your AI's `skills/` directory.
3. Ensure the directory structure looks like this:
   ```text
   skills/
   └── functional-test-design/
       ├── SKILL.md (Parent Router)
       ├── domain-testing/
       │   └── SKILL.md
       ├── decision-table-testing/
       │   └── SKILL.md
       ├── state-transition-testing/
       │   └── SKILL.md
       ├── use-case-testing/
       │   └── SKILL.md
       └── error-guessing/
           └── SKILL.md
   ```

### Option 2: Standalone Sub-Skill Integration

If you only want specific testing techniques without the parent router, you can install the sub-skills individually.

1. Locate the specific sub-skill folder you need (e.g., `decision-table-testing`).
2. Copy _only_ that folder directly into your `skills/` directory.
   ```text
   skills/
   └── decision-table-testing/
       └── SKILL.md
   ```

## 🚀 Usage

You can interact with the skills in two modes: **Default (Conversation)** or **File Output**.

### Default Mode (Conversation)

The AI analyzes the requirement and prints all analysis, tables, and test cases inline within the chat.

```text
/functional-test-design
[Paste your complex requirement, API spec, or user story here]
```

_Note: If you already know which technique is required, bypass the router and invoke the sub-skill directly for faster execution:_

```text
/domain-testing
[Paste your field constraints here]
```

### File Output Mode

If your environment supports file operations (e.g., computer tools enabled), the AI can write the structured artifacts directly to a Markdown file.

```text
/functional-test-design --file="tests/checkout-flow-tests.md"
[Paste your checkout flow requirements here]
```

_The AI will verify the path and ask for confirmation before overwriting an existing file._

## 🔀 Technique Selection Guide

If you prefer to invoke sub-skills directly, use this quick reference to choose the right technique based on the requirement's primary characteristic:

| Requirement Characteristic | Required Sub-Skill          | Example                                       |
| :------------------------- | :-------------------------- | :-------------------------------------------- |
| **Value Constraints**      | `/domain-testing`           | "Age must be 18-60", "Password > 8 chars"     |
| **Rule Combinations**      | `/decision-table-testing`   | "VIPs get 15% off, unless using a promo code" |
| **Lifecycle / States**     | `/state-transition-testing` | "Only Pending orders can be Cancelled"        |
| **Actor Interactions**     | `/use-case-testing`         | "User logs in, adds item to cart, pays"       |
| **Defect Hunting**         | `/error-guessing`           | "What if the third-party API times out?"      |
| **Too Complex / Unsure**   | `/functional-test-design`   | Let the AI orchestrate the combination.       |

## ⚠️ Important Rules

- **Design Order matters:** Always apply systematic black-box techniques (Domain, Decision Table, State Transition, Use Case) _before_ applying Error Guessing.
- **Pairwise Reduction:** If Decision Table or Use Case Testing yields an unmanageable combinatorial explosion, the AI applies Pairwise reduction as an optimization step, not as a replacement for the primary technique.
